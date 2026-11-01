"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { onboardClock, type OnboardVideo } from "@/data/2026/onboards";
import { formatLapTime } from "@/data/2026/selectors";

type Camera = "tyler" | "jonah";
type Audio = Camera | "mute";
type Lap = OnboardVideo["laps"][number];
const cameras: Camera[] = ["tyler", "jonah"];
const names: Record<Camera, string> = { tyler: "Tyler", jonah: "Jonah" };
export const lapComparisonVideoTime = (lap: Lap, relativeSeconds: number) => Math.min(lap.videoEndSeconds, lap.videoStartSeconds + Math.max(0, relativeSeconds));

export function LapComparisonPlayer({ videos }: { videos: Record<Camera, OnboardVideo> }) {
  const nodes = useRef<Record<Camera, HTMLVideoElement | null>>({ tyler: null, jonah: null });
  const stage = useRef<HTMLDivElement>(null);
  const relativeRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef(1);
  const [lapNumbers, setLapNumbers] = useState<Record<Camera, number>>({ tyler: 1, jonah: 1 });
  const [relative, setRelative] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [audio, setAudio] = useState<Audio>("tyler");
  const [full, setFull] = useState(false);
  const [error, setError] = useState("");
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const selected = { tyler: videos.tyler.laps[lapNumbers.tyler - 1], jonah: videos.jonah.laps[lapNumbers.jonah - 1] };
  const duration = Math.max(...cameras.map(camera => selected[camera].recordedLapTimeMs / 1000));
  const selectedRef = useRef(selected);
  const durationRef = useRef(duration);
  useLayoutEffect(() => { selectedRef.current = selected; durationRef.current = duration; });

  const pause = useCallback(() => {
    playingRef.current = false;
    cameras.forEach(camera => nodes.current[camera]?.pause());
    setPlaying(false);
  }, []);
  const seek = useCallback((seconds: number) => {
    const next = Math.max(0, Math.min(durationRef.current, seconds));
    relativeRef.current = next;
    setRelative(next);
    cameras.forEach(camera => {
      const node = nodes.current[camera];
      if (!node || node.readyState < 1) return;
      node.currentTime = lapComparisonVideoTime(selectedRef.current[camera], next);
      if (next >= selectedRef.current[camera].recordedLapTimeMs / 1000) node.pause();
    });
    if (next >= durationRef.current) pause();
  }, [pause]);
  const play = useCallback(async () => {
    if (relativeRef.current >= durationRef.current - 0.02) seek(0);
    try {
      await Promise.all(cameras.map(async camera => {
        const node = nodes.current[camera];
        if (!node || relativeRef.current >= selectedRef.current[camera].recordedLapTimeMs / 1000) return;
        node.playbackRate = speedRef.current;
        node.currentTime = lapComparisonVideoTime(selectedRef.current[camera], relativeRef.current);
        await node.play();
      }));
      playingRef.current = true;
      setPlaying(true);
      setError("");
    } catch {
      pause();
      setError("Wiedergabe nicht möglich. Bitte Verbindung prüfen und erneut starten.");
    }
  }, [pause, seek]);
  const toggle = useCallback(() => { if (playingRef.current) pause(); else void play(); }, [pause, play]);
  const chooseLap = (camera: Camera, number: number) => {
    pause();
    setLapNumbers(previous => ({ ...previous, [camera]: number }));
    relativeRef.current = 0;
    setRelative(0);
  };
  useEffect(() => { seek(0); }, [lapNumbers, seek]);
  useEffect(() => {
    cameras.forEach(camera => { const node = nodes.current[camera]; if (node) node.muted = audio !== camera; });
  }, [audio]);
  useEffect(() => {
    const onFull = () => setFull(document.fullscreenElement === stage.current);
    document.addEventListener("fullscreenchange", onFull);
    return () => document.removeEventListener("fullscreenchange", onFull);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const laps = selectedRef.current;
      const active = cameras.filter(camera => relativeRef.current < laps[camera].recordedLapTimeMs / 1000 - 0.02);
      const master = active.map(camera => nodes.current[camera]).find(node => node && !node.paused && node.readyState >= 2);
      if (!master) return;
      const masterCamera = nodes.current.tyler === master ? "tyler" : "jonah";
      const elapsed = Math.min(durationRef.current, Math.max(0, master.currentTime - laps[masterCamera].videoStartSeconds));
      relativeRef.current = elapsed;
      setRelative(elapsed);
      for (const camera of cameras) {
        const node = nodes.current[camera];
        if (!node || node.readyState < 1) continue;
        const lapDuration = laps[camera].recordedLapTimeMs / 1000;
        if (elapsed >= lapDuration - 0.02) {
          node.pause();
          node.currentTime = laps[camera].videoEndSeconds;
        } else if (node !== master && node.readyState >= 2) {
          const drift = node.currentTime - laps[camera].videoStartSeconds - elapsed;
          if (Math.abs(drift) > 0.6) node.currentTime = lapComparisonVideoTime(laps[camera], elapsed);
          else node.playbackRate = speedRef.current * (Math.abs(drift) > 0.12 ? (drift > 0 ? 0.97 : 1.03) : 1);
          if (node.paused && playingRef.current) void node.play().catch(() => {});
        }
      }
      if (elapsed >= durationRef.current - 0.02) pause();
    }, 200);
    return () => window.clearInterval(timer);
  }, [playing, pause]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.closest?.("input,select,textarea,button,a,[contenteditable=true]") || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
      const bounds = stage.current?.getBoundingClientRect();
      if (document.fullscreenElement !== stage.current && (!bounds || bounds.bottom <= 0 || bounds.top >= window.innerHeight)) return;
      if (event.code === "Space" && !event.repeat) { event.preventDefault(); event.stopPropagation(); toggle(); }
      else if (event.code === "ArrowLeft" || event.code === "ArrowRight") { event.preventDefault(); event.stopPropagation(); seek(relativeRef.current + (event.code === "ArrowRight" ? 5 : -5)); }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [seek, toggle]);
  useEffect(() => () => { pause(); if (hideTimer.current !== null) window.clearTimeout(hideTimer.current); }, [pause]);
  const reveal = () => {
    setControlsVisible(true);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    if (playingRef.current) hideTimer.current = window.setTimeout(() => setControlsVisible(false), 2800);
  };
  const fullscreen = async () => {
    try { if (document.fullscreenElement === stage.current) await document.exitFullscreen(); else await stage.current?.requestFullscreen({ navigationUI: "hide" }); }
    catch { setError("Vollbild ist in diesem Browser nicht verfügbar."); }
  };
  const differenceMs = selected.jonah.recordedLapTimeMs - selected.tyler.recordedLapTimeMs;

  return <div className="lap-compare">
    <div className="lap-compare-intro"><div><span className="eyebrow">ROUND 03 · MULTICAM</span><h3>Rundenvergleich</h3><p>Wähle je eine Runde. Beide Aufnahmen starten bei Vergleichszeit 0:00 an ihrer jeweiligen Start/Ziel-Marke.</p></div><span className="lap-compare-delta">{differenceMs === 0 ? "GLEICHE RUNDENZEIT" : `${differenceMs > 0 ? "TYLER" : "JONAH"} ${formatLapTime(Math.abs(differenceMs))} SCHNELLER`}<small>OFFIZIELLE RUNDENZEITEN</small></span></div>
    <div className="lap-compare-selectors">{cameras.map(camera => <label key={camera}><span>{names[camera].toUpperCase()} · KART {videos[camera].kartNumber}</span><select value={lapNumbers[camera]} onChange={event => chooseLap(camera, Number(event.target.value))}>{videos[camera].laps.map(lap => <option key={lap.lapNumber} value={lap.lapNumber}>Runde {lap.lapNumber.toString().padStart(2,"0")} · {formatLapTime(lap.recordedLapTimeMs)}</option>)}</select></label>)}</div>
    <div className={`lap-compare-stage ${playing && !controlsVisible ? "controls-hidden" : ""}`} ref={stage} onPointerMove={reveal} onPointerDown={reveal}>
      <div className="lap-compare-panes">{cameras.map(camera => <div key={camera} className="lap-compare-pane" onClick={toggle}><video ref={node => { nodes.current[camera] = node; }} src={videos[camera].source.playbackUrl ?? undefined} poster={videos[camera].poster} preload="metadata" playsInline muted={audio !== camera} aria-label={`${names[camera]} Runde ${lapNumbers[camera]} Onboard`} onLoadedMetadata={event => { event.currentTarget.currentTime = lapComparisonVideoTime(selectedRef.current[camera], relativeRef.current); event.currentTarget.playbackRate = speedRef.current; }} onError={() => setError(`${names[camera]}-Video konnte nicht geladen werden.`)}/><div className="lap-compare-badge"><strong>{names[camera].toUpperCase()} · LAP {lapNumbers[camera]}</strong><span>{formatLapTime(selected[camera].recordedLapTimeMs)} · OFFIZIELL</span></div>{relative >= selected[camera].recordedLapTimeMs / 1000 - 0.02 && <span className="lap-compare-finish">ZIEL</span>}</div>)}</div>
      <div className="lap-compare-controls" onClick={event => event.stopPropagation()}><input type="range" min="0" max={duration} step="0.01" value={Math.min(relative,duration)} style={{ "--onboard-progress": `${relative / duration * 100}%` } as CSSProperties} onChange={event => seek(Number(event.target.value))} aria-label="Gemeinsame Rundenzeit"/><div className="lap-compare-toolbar"><button onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={19} fill="currentColor"/> : <Play size={19} fill="currentColor"/>}</button><span>{onboardClock(relative)} / {onboardClock(duration)}</span><span className="lap-compare-spacer"/><button onClick={() => setAudio(audio === "mute" ? "tyler" : "mute")} aria-label={audio === "mute" ? "Ton einschalten" : "Stumm schalten"}>{audio === "mute" ? <VolumeX size={19}/> : <Volume2 size={19}/>}</button><select aria-label="Tonquelle" value={audio} onChange={event => setAudio(event.target.value as Audio)}><option value="tyler">Tyler Ton</option><option value="jonah">Jonah Ton</option><option value="mute">Stumm</option></select><select aria-label="Wiedergabegeschwindigkeit" value={speed} onChange={event => { const next = Number(event.target.value); speedRef.current = next; setSpeed(next); cameras.forEach(camera => { if (nodes.current[camera]) nodes.current[camera]!.playbackRate = next; }); }}>{[0.5,0.75,1,1.25,1.5,2].map(value => <option key={value} value={value}>{value}×</option>)}</select><button onClick={() => void fullscreen()} aria-label={full ? "Vollbild verlassen" : "Vollbild"}>{full ? <Minimize size={19}/> : <Maximize size={19}/>}</button></div></div>
    </div>
    {error && <p className="onboard-error" role="alert">{error}</p>}
    <p className="onboard-note">Die Start/Ziel-Marken sind auf ganze Videosekunden bestätigt bzw. geschätzt. Deshalb ist die Bildposition nur ungefähr synchron; die Rundenzeiten sind offiziell. Die kürzere Runde bleibt am Ziel stehen, während die längere weiterläuft.</p>
  </div>;
}
