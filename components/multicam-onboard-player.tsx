"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "@/components/site-link";
import { Maximize, Minimize, Pause, Play, RectangleHorizontal, Volume2, VolumeX } from "lucide-react";
import { onboardClock, onboardMoment, parseMultiCamLink, playbackDriftCorrection, type MultiCamMode, type OnboardVideo } from "@/data/2026/onboards";
import { formatLapTime } from "@/data/2026/selectors";

type Camera = "tyler" | "jonah";
type AudioSource = Camera | "mute";
type MobileVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };
const cameraOf = (video: OnboardVideo): Camera => video.driverId === "DRV_JONAH" ? "jonah" : "tyler";
const names: Record<Camera, string> = { tyler: "Tyler", jonah: "Jonah" };

export function MultiCamOnboardPlayer({ videos }: { videos: OnboardVideo[] }) {
  const byCamera = { tyler: videos.find(video => cameraOf(video) === "tyler")!, jonah: videos.find(video => cameraOf(video) === "jonah")! };
  const elements = useRef<Record<Camera, MobileVideo | null>>({ tyler: null, jonah: null });
  const stage = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const sharedCurrentTime = useRef(0);
  const desiredPlaying = useRef(false);
  const pending = useRef<Record<Camera, number | null>>({ tyler: null, jonah: null });
  const controlsTimer = useRef<number | null>(null);
  const [mode, setMode] = useState<MultiCamMode>("tyler");
  const modeRef = useRef<MultiCamMode>("tyler");
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<AudioSource>("tyler");
  const audioRef = useRef<AudioSource>("tyler");
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);
  const [volume, setVolume] = useState(1);
  const [lapCamera, setLapCamera] = useState<Camera>("tyler");
  const [theater, setTheater] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState("");
  const duration = Math.max(...videos.map(video => video.duration));
  const activeCameras: Camera[] = mode === "split" ? ["tyler", "jonah"] : [mode];
  const displayedLaps = byCamera[lapCamera].laps;
  const activeLap = onboardMoment(byCamera[lapCamera], time).lap;

  const applyAudio = useCallback((source: AudioSource, gain: number) => {
    for (const camera of ["tyler", "jonah"] as const) {
      const node = elements.current[camera];
      if (node) { node.muted = source !== camera; node.volume = gain; }
    }
  }, []);
  const syncTime = useCallback((seconds: number) => {
    const next = Math.max(0, Math.min(duration, seconds));
    sharedCurrentTime.current = next;
    setTime(next);
    for (const camera of ["tyler", "jonah"] as const) {
      const node = elements.current[camera];
      if (node && node.readyState >= 1 && next < node.duration) {
        if (Math.abs(node.currentTime - next) > 0.03) node.currentTime = next;
        pending.current[camera] = null;
      } else pending.current[camera] = next;
    }
  }, [duration]);
  const writeLink = useCallback((nextMode: MultiCamMode, nextTime?: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("onboard", nextMode);
    if (nextTime !== undefined) { url.searchParams.delete("lap"); url.searchParams.set("t", String(nextTime)); }
    url.hash = "onboard";
    window.history.replaceState(window.history.state, "", url);
  }, []);
  const playActive = useCallback(async (nextMode: MultiCamMode = modeRef.current) => {
    const cameras: Camera[] = nextMode === "split" ? ["tyler", "jonah"] : [nextMode];
    if (audioRef.current !== "mute" && !cameras.includes(audioRef.current)) cameras.push(audioRef.current);
    try {
      await Promise.all(cameras.map(async camera => {
        const node = elements.current[camera];
        if (!node) return;
        if (node.readyState >= 1 && sharedCurrentTime.current < node.duration && Math.abs(node.currentTime - sharedCurrentTime.current) > 0.15) node.currentTime = sharedCurrentTime.current;
        node.playbackRate = speedRef.current;
        await node.play();
      }));
      desiredPlaying.current = true;
      setPlaying(true);
      setError("");
    } catch {
      desiredPlaying.current = false;
      for (const camera of cameras) elements.current[camera]?.pause();
      setPlaying(false);
      setError("Playback could not start. Try Play again or check your connection.");
    }
  }, []);
  const pauseAll = useCallback(() => {
    desiredPlaying.current = false;
    for (const camera of ["tyler", "jonah"] as const) elements.current[camera]?.pause();
    setPlaying(false);
  }, []);
  const toggle = useCallback(() => { if (desiredPlaying.current) pauseAll(); else void playActive(); }, [pauseAll, playActive]);
  const changeMode = useCallback((next: MultiCamMode) => {
    if (next === modeRef.current) return;
    const wasPlaying = desiredPlaying.current;
    const oldMaster: Camera = modeRef.current === "jonah" ? "jonah" : "tyler";
    const oldNode = elements.current[oldMaster];
    if (oldNode && oldNode.readyState >= 1) sharedCurrentTime.current = oldNode.currentTime;
    setTime(sharedCurrentTime.current);
    modeRef.current = next;
    setMode(next);
    if (next !== "split") setLapCamera(next);
    for (const camera of ["tyler", "jonah"] as const) {
      const node = elements.current[camera];
      if (!node) continue;
      if (node.readyState >= 1 && sharedCurrentTime.current < node.duration && Math.abs(node.currentTime - sharedCurrentTime.current) > 0.03) node.currentTime = sharedCurrentTime.current;
      if (next !== "split" && camera !== next && camera !== audioRef.current) node.pause();
    }
    writeLink(next);
    if (wasPlaying) void playActive(next);
  }, [playActive, writeLink]);
  const seek = useCallback((seconds: number) => { syncTime(seconds); writeLink(modeRef.current, seconds); }, [syncTime, writeLink]);
  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (controlsTimer.current !== null) window.clearTimeout(controlsTimer.current);
    if (desiredPlaying.current) controlsTimer.current = window.setTimeout(() => setControlsVisible(false), 2800);
  }, []);
  const fullscreen = useCallback(async () => {
    const node = stage.current;
    if (!node) return;
    try { if (document.fullscreenElement === node) await document.exitFullscreen(); else await node.requestFullscreen({ navigationUI: "hide" }); }
    catch { try { elements.current[modeRef.current === "jonah" ? "jonah" : "tyler"]?.webkitEnterFullscreen?.(); } catch { setError("Fullscreen is unavailable in this browser."); } }
  }, []);

  useEffect(() => {
    const readLink = () => {
      const link = parseMultiCamLink(window.location.search, videos);
      modeRef.current = link.mode;
      setMode(link.mode);
      setLapCamera(link.mode === "jonah" ? "jonah" : "tyler");
      if (link.time !== null) syncTime(link.time);
      else syncTime(0);
      if (window.location.hash === "#onboard" || new URLSearchParams(window.location.search).has("onboard")) window.requestAnimationFrame(() => section.current?.scrollIntoView({ block: "start", behavior: "instant" }));
    };
    const timer = window.setTimeout(readLink, 0);
    window.addEventListener("popstate", readLink);
    return () => { window.clearTimeout(timer); window.removeEventListener("popstate", readLink); };
    // Read URL state once on mount and when browser history changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    audioRef.current = audio;
    applyAudio(audio, volume);
    if (desiredPlaying.current) {
      for (const camera of ["tyler", "jonah"] as const) if (modeRef.current !== "split" && camera !== modeRef.current && camera !== audio) elements.current[camera]?.pause();
      void playActive();
    }
  }, [audio, volume, applyAudio, playActive]);
  useEffect(() => { document.body.classList.toggle("onboard-theater", theater); return () => document.body.classList.remove("onboard-theater"); }, [theater]);
  useEffect(() => {
    const update = () => { setFullscreenActive(document.fullscreenElement === stage.current); revealControls(); };
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, [revealControls]);
  useEffect(() => {
    if (!playing || buffering) return;
    const timer = window.setTimeout(() => setControlsVisible(false), 2800);
    return () => window.clearTimeout(timer);
  }, [playing, buffering, fullscreenActive]);
  useEffect(() => {
    if (!playing) return;
    const nodes = elements.current;
    const timer = window.setInterval(() => {
      const masterCamera: Camera = mode === "jonah" ? "jonah" : "tyler";
      const followerCamera: Camera = masterCamera === "tyler" ? "jonah" : "tyler";
      const master = elements.current[masterCamera];
      const follower = elements.current[followerCamera];
      if (!master || !follower || master.readyState < 2 || follower.readyState < 2 || master.paused || follower.paused) return;
      const correction = playbackDriftCorrection(master.currentTime, follower.currentTime, speedRef.current);
      if (correction.seekTo !== null && correction.seekTo < follower.duration) follower.currentTime = correction.seekTo;
      follower.playbackRate = correction.playbackRate;
    }, 750);
    return () => { window.clearInterval(timer); for (const camera of ["tyler", "jonah"] as const) if (nodes[camera]) nodes[camera].playbackRate = speedRef.current; };
  }, [mode, playing]);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!fullscreenActive || (event.target as HTMLElement)?.closest?.("input,select,textarea,button,a,[contenteditable=true]")) return;
      if (event.code === "Space" && !event.repeat && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); event.stopPropagation(); toggle(); }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [fullscreenActive, toggle]);
  useEffect(() => () => { if (controlsTimer.current !== null) window.clearTimeout(controlsTimer.current); }, []);

  return <section id="onboard" ref={section} className={`onboard multicam ${theater ? "is-theater" : ""}`} tabIndex={0} aria-label="Round 3 MultiCam onboards" onKeyDown={event => {
    if ((event.target as HTMLElement).closest("input,select,textarea,button,a,[contenteditable=true]") || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === " " || event.key.toLowerCase() === "k") { event.preventDefault(); toggle(); }
    else if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); seek(sharedCurrentTime.current + (event.key === "ArrowRight" ? 5 : -5)); }
    else if (event.key.toLowerCase() === "f") { event.preventDefault(); void fullscreen(); }
    else if (event.key.toLowerCase() === "t") { event.preventDefault(); setTheater(value => !value); }
  }}>
    <header className="onboard-heading"><div><span className="eyebrow">RKS 2026 · ROUND 03</span><h2>MultiCam onboard <span>Daytona · Bahn 2</span></h2><p>Two original cameras · one shared video timeline</p></div><span className="onboard-runtime">{onboardClock(duration)}<small>FULL SESSION FOOTAGE</small></span></header>
    <div className="multicam-modebar" role="group" aria-label="Camera view">{(["tyler", "jonah", "split"] as const).map(option => <button key={option} aria-pressed={mode === option} onClick={() => changeMode(option)}>{option === "split" ? "Split screen" : `${names[option]} POV`}</button>)}</div>
    <div className={`onboard-stage multicam-stage ${mode === "split" ? "is-split" : ""} ${playing && !buffering && !controlsVisible ? "controls-hidden" : ""}`} ref={stage} onPointerMove={revealControls} onPointerDown={revealControls} onKeyDownCapture={revealControls} onFocusCapture={revealControls}>
      <div className="multicam-panes">{(["tyler", "jonah"] as const).map(camera => {
        const video = byCamera[camera];
        const moment = onboardMoment(video, time);
        const visible = activeCameras.includes(camera);
        const fastest = Math.min(...video.laps.map(lap => lap.recordedLapTimeMs));
        const status = moment.lap ? `RACE · LAP ${moment.lap.lapNumber} / ${video.laps.length}` : moment.session?.id === "formation" ? "FORMATION LAP" : moment.session?.id === "finish" ? "FINISH" : "QUALIFYING";
        return <div key={camera} className={`multicam-pane ${visible ? "is-visible" : ""}`} aria-hidden={!visible} onClick={() => toggle()}>
          <video ref={node => { elements.current[camera] = node; }} src={video.source.playbackUrl ?? undefined} poster={video.poster} preload="metadata" playsInline muted={audio !== camera} aria-label={`${names[camera]} Round 3 onboard`} onLoadedMetadata={event => {
            const node = event.currentTarget;
            const at = pending.current[camera];
            if (at !== null && at < node.duration) { node.currentTime = at; pending.current[camera] = null; }
            node.playbackRate = speedRef.current;
            applyAudio(audio, volume);
          }} onTimeUpdate={event => {
            if (camera !== (modeRef.current === "jonah" ? "jonah" : "tyler")) return;
            sharedCurrentTime.current = event.currentTarget.currentTime;
            setTime(event.currentTarget.currentTime);
          }} onWaiting={() => { if (visible) setBuffering(true); }} onCanPlay={() => setBuffering(false)} onPlaying={() => setBuffering(false)} onEnded={() => { if (camera === (modeRef.current === "jonah" ? "jonah" : "tyler")) pauseAll(); }} onError={() => setError(`${names[camera]} video could not be loaded. Check your connection.`)}/>
          <div className="multicam-camera-name">{names[camera].toUpperCase()} · KART {video.kartNumber}</div>
          <div className="multicam-status"><small>RKS 2026 · ROUND 03</small><strong>{status}</strong>{moment.lap && <span>OFFICIAL LAP TIME {formatLapTime(moment.lap.recordedLapTimeMs)}{moment.lap.recordedLapTimeMs === fastest ? " · FASTEST" : ""}</span>}</div>
        </div>;
      })}</div>
      {buffering && <p className="onboard-buffering" role="status">Buffering…</p>}
      <div className="onboard-controls" onClick={event => event.stopPropagation()} onPointerMove={revealControls}>
        <div className="onboard-seek"><label className="sr-only" htmlFor="multicam-progress">Video position</label><input id="multicam-progress" type="range" min="0" max={duration} step="0.001" value={time} style={{ "--onboard-progress": `${time / duration * 100}%` } as CSSProperties} aria-valuetext={onboardClock(time)} onChange={event => seek(Number(event.target.value))}/><div className="onboard-markers" aria-hidden="true">{byCamera[lapCamera].laps.map(lap => <i key={lap.lapNumber} style={{ left: `${lap.videoStartSeconds / duration * 100}%` }}/>)}</div></div>
        <div className="onboard-toolbar"><button className="onboard-icon-button" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={22} fill="currentColor"/> : <Play size={22} fill="currentColor"/>}</button><span className="onboard-clock">{onboardClock(time)} <span>/ {onboardClock(duration)}</span></span><div className="onboard-toolbar-spacer"/><button className="onboard-icon-button" onClick={() => setAudio(value => value === "mute" ? "tyler" : "mute")} aria-label={audio === "mute" ? "Unmute" : "Mute"}>{audio === "mute" ? <VolumeX size={20}/> : <Volume2 size={20}/>}</button><label className="multicam-audio"><span className="sr-only">Audio source</span><select value={audio} onChange={event => setAudio(event.target.value as AudioSource)}><option value="tyler">Tyler audio</option><option value="jonah">Jonah audio</option><option value="mute">Muted</option></select></label><input className="onboard-volume" type="range" min="0" max="1" step="0.05" value={volume} aria-label="Volume" onChange={event => setVolume(Number(event.target.value))}/><label className="onboard-speed"><span className="sr-only">Playback speed</span><select value={speed} onChange={event => { const next = Number(event.target.value); speedRef.current = next; setSpeed(next); for (const camera of ["tyler", "jonah"] as const) if (elements.current[camera]) elements.current[camera].playbackRate = next; }}>{[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => <option key={rate} value={rate}>{rate}×</option>)}</select></label><button className="onboard-icon-button onboard-theater-button" onClick={() => setTheater(value => !value)} aria-label={theater ? "Exit theater mode" : "Theater mode"} aria-pressed={theater}><RectangleHorizontal size={20}/></button><button className="onboard-icon-button" onClick={() => void fullscreen()} aria-label={fullscreenActive ? "Exit fullscreen" : "Fullscreen"}>{fullscreenActive ? <Minimize size={20}/> : <Maximize size={20}/>}</button></div>
      </div>
    </div>
    {error && <p className="onboard-error" role="alert">{error}</p>}
    <div className="multicam-details"><div><span className="eyebrow">CAMERAS</span><p><Link href="/drivers/tyler">Tyler</Link> · Kart 19 · P1 &nbsp; / &nbsp; <Link href="/drivers/jonah">Jonah</Link> · Kart 61 · P3</p></div><div className="multicam-lap-source" role="group" aria-label="Lap navigation driver"><button aria-pressed={lapCamera === "tyler"} onClick={() => setLapCamera("tyler")}>Tyler laps</button><button aria-pressed={lapCamera === "jonah"} onClick={() => setLapCamera("jonah")}>Jonah laps</button></div></div>
    <nav className="onboard-sessions" aria-label="Onboard sessions">{byCamera[lapCamera].sessions.filter(item => item.quick).map(session => <button key={session.id} aria-current={onboardMoment(byCamera[lapCamera], time).session?.id === session.id ? "true" : undefined} onClick={() => seek(session.start)}><b>{session.title}</b><small>{onboardClock(session.start)}</small></button>)}</nav>
    <div className="onboard-now"><b>{activeLap ? `${names[lapCamera]} · LAP ${activeLap.lapNumber}` : `${names[lapCamera]} · ${onboardMoment(byCamera[lapCamera], time).session?.title ?? "Session"}`}</b><span>{activeLap ? `${formatLapTime(activeLap.recordedLapTimeMs)} · official lap time` : "Video footage"}</span></div>
    <div className="onboard-lap-panel"><div className="onboard-lap-heading"><b>{names[lapCamera]} · race laps</b><span>24 LAPS · OFFICIAL LAP TIMES</span></div><div className="onboard-laps">{displayedLaps.map(lap => <button key={lap.lapNumber} aria-current={activeLap?.lapNumber === lap.lapNumber ? "true" : undefined} onClick={() => seek(lap.videoStartSeconds)}><span><b>LAP {lap.lapNumber}</b><small>{onboardClock(lap.videoStartSeconds)}</small></span><span><strong>{formatLapTime(lap.recordedLapTimeMs)}</strong>{lap.recordedLapTimeMs === Math.min(...displayedLaps.map(item => item.recordedLapTimeMs)) && <small className="onboard-fastest">FASTEST</small>}</span></button>)}</div></div>
    <p className="onboard-note">Both videos use the same absolute video clock. Lap labels use each driver’s official lap durations and a start marker supplied to the nearest video second. Jonah’s qualifying/formation boundary remains provisional. Official lap times are recorded results, not live telemetry.</p>
  </section>;
}
