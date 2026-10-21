"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "@/components/site-link";
import { type OnboardVideo, onboardMoment, onboardClock, parseOnboardLink } from "@/data/2026/onboards";
import { season2026 } from "@/data/2026/season";
import { driverById, formatLapTime } from "@/data/2026/selectors";

type MobileVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };
export function OnboardPlayer({ video }: { video: OnboardVideo }) {
  const media = useRef<MobileVideo>(null);
  const stage = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const lapPanel = useRef<HTMLDivElement>(null);
  const pending = useRef<number | null>(null);
  const controlsTimer = useRef<number | null>(null);
  const [time,setTime] = useState(0);
  const [duration,setDuration] = useState(video.duration);
  const [playing,setPlaying] = useState(false);
  const [volume,setVolume] = useState(1);
  const [muted,setMuted] = useState(false);
  const [speed,setSpeed] = useState(1);
  const [theater,setTheater] = useState(false);
  const [fullscreenActive,setFullscreenActive] = useState(false);
  const [controlsVisible,setControlsVisible] = useState(true);
  const [enhanced,setEnhanced] = useState(false);
  const [error,setError] = useState("");
  const [buffering,setBuffering] = useState(false);
  const src = (video.round === 1 ? process.env.NEXT_PUBLIC_RKS_R1_ONBOARD_URL : process.env.NEXT_PUBLIC_RKS_R3_ONBOARD_URL) || video.source.playbackUrl || undefined;
  const active = onboardMoment(video,time);
  const driver = driverById(video.driverId);
  const result = season2026.events.find(event => event.id === video.eventId)?.results.find(row => row.driverId === video.driverId);
  const fastest = Math.min(...video.laps.map(l => l.recordedLapTimeMs));
  const event = season2026.events.find(item => item.id === video.eventId);
  const overlay = active.lap ? `RACE · LAP ${active.lap.lapNumber} / ${video.laps.length}` : active.session?.id === "formation" ? "FORMATION / PRE-RACE" : active.session?.title.toUpperCase();
  function seek(seconds: number, lap?: number, updateUrl: boolean | null = false) {
    const next = Math.max(0,Math.min(seconds,duration));
    setTime(next);pending.current = next;
    if (media.current && media.current.readyState >= 1) { media.current.currentTime=next;pending.current=null; }
    if(updateUrl) {
      const url=new URL(window.location.href);url.searchParams.set("onboard","tyler");url.searchParams.delete("lap");url.searchParams.delete("t");url.searchParams.set(lap ? "lap" : "t",String(lap || Math.floor(next)));url.hash="onboard";
      window.history.replaceState(window.history.state,"",url);
    } else if (updateUrl === false) {
      const url=new URL(window.location.href);
      if(url.searchParams.has("lap") || url.searchParams.has("t")) {
        url.searchParams.delete("lap");url.searchParams.delete("t");
        window.history.replaceState(window.history.state,"",url);
      }
    }
  }
  useEffect(()=>{
    function readLink(){
      const at=parseOnboardLink(window.location.search,video);
      if(at!==null)seek(at,undefined,null);
      // The section is mounted after the browser's initial fragment jump because
      // the player is lazy loaded. Scroll once it actually exists in the DOM.
      if(window.location.hash==="#onboard" || new URLSearchParams(window.location.search).get("onboard")==="tyler"){
        window.requestAnimationFrame(()=>root.current?.scrollIntoView({block:"start",behavior:"instant"}));
      }
    }
    const timer=window.setTimeout(()=>{setEnhanced(true);readLink();},0);window.addEventListener("popstate",readLink);return()=>{window.clearTimeout(timer);window.removeEventListener("popstate",readLink);};
    // Initial URL state is read once; media metadata applies the pending seek.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  useEffect(()=>{document.body.classList.toggle("onboard-theater",theater);return()=>document.body.classList.remove("onboard-theater");},[theater]);
  useEffect(()=>{const update=()=>{setFullscreenActive(document.fullscreenElement===stage.current);setControlsVisible(true);};document.addEventListener("fullscreenchange",update);return()=>document.removeEventListener("fullscreenchange",update);},[]);
  useEffect(()=>{
    if(controlsTimer.current!==null)window.clearTimeout(controlsTimer.current);
    if(fullscreenActive&&playing&&!buffering)controlsTimer.current=window.setTimeout(()=>setControlsVisible(false),2800);
    return()=>{if(controlsTimer.current!==null)window.clearTimeout(controlsTimer.current);};
  },[fullscreenActive,playing,buffering]);
  useEffect(()=>{if(!theater)return;const exit=(event:KeyboardEvent)=>{if(event.key==="Escape")setTheater(false);};window.addEventListener("keydown",exit);return()=>window.removeEventListener("keydown",exit);},[theater]);
  useEffect(()=>{
    const panel=lapPanel.current;
    const button=panel?.querySelector<HTMLElement>('button[aria-current="true"]');
    if(panel && button && (button.offsetTop < panel.scrollTop || button.offsetTop+button.offsetHeight > panel.scrollTop+panel.clientHeight)) {
      panel.scrollTo({top:Math.max(0,button.offsetTop-panel.clientHeight/2+button.offsetHeight/2),behavior:"instant"});
    }
  },[active.lap?.lapNumber]);
  const toggle=useCallback(async()=>{if(!src)return;const node=media.current;if(!node)return;if(node.paused){try{await node.play();setError("");}catch{setError("Playback could not start. Try Play again or check your connection.");}}else node.pause();},[src]);
  useEffect(()=>{
    if(!fullscreenActive)return;
    function onKey(event:KeyboardEvent){
      if(event.code!=="Space"||event.repeat||event.ctrlKey||event.metaKey||event.altKey)return;
      if((event.target as HTMLElement)?.closest?.("input,select,textarea,button,a,[contenteditable=true]"))return;
      event.preventDefault();event.stopPropagation();void toggle();
    }
    window.addEventListener("keydown",onKey,true);
    return()=>window.removeEventListener("keydown",onKey,true);
  },[fullscreenActive,toggle]);
  function revealControls(){
    if(!fullscreenActive)return;
    setControlsVisible(true);
    if(controlsTimer.current!==null)window.clearTimeout(controlsTimer.current);
    if(playing&&!buffering)controlsTimer.current=window.setTimeout(()=>setControlsVisible(false),2800);
  }
  async function fullscreen(){const node=stage.current;if(!node)return;try{if(document.fullscreenElement===node)await document.exitFullscreen();else await node.requestFullscreen({navigationUI:"hide"});}catch{try{media.current?.webkitEnterFullscreen?.();}catch{setError("Fullscreen is unavailable in this browser.");}}}
  return <section id="onboard" ref={root} className={`onboard ${theater?"is-theater":""}`} aria-label={`${driver?.name} Round ${video.round} onboard`} tabIndex={0} onKeyDown={event=>{
    if((event.target as HTMLElement).closest("input,select,textarea,button,a,[contenteditable=true]"))return;
    if(event.ctrlKey||event.metaKey||event.altKey)return;
    if(event.key===" "||event.key.toLowerCase()==="k"){event.preventDefault();void toggle();}
    else if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();seek(time+(event.key==="ArrowRight"?5:-5));}
    else if(event.key.toLowerCase()==="f"){event.preventDefault();void fullscreen();}
    else if(event.key.toLowerCase()==="t"){event.preventDefault();setTheater(v=>!v);}
  }}>
    <header className="onboard-heading"><div><span className="eyebrow">ROUND {String(video.round).padStart(2,"0")} · ONBOARD</span><h2><Link href={`/drivers/${driver?.slug ?? "tyler"}`}>{driver?.name}</Link> <span>Daytona · Bahn 2</span></h2><p>{result && `P${result.position} · `}{video.kartNumber !== null && `Kart ${video.kartNumber} · `}Fastest recorded lap {formatLapTime(fastest)}</p></div><span className="onboard-runtime">{onboardClock(video.duration)} <small>FULL SESSION FOOTAGE</small></span></header>
    <div className="onboard-layout"><div className="onboard-screen-column"><div className={`onboard-stage ${fullscreenActive&&playing&&!buffering&&!controlsVisible?"controls-hidden":""}`} ref={stage} onPointerMove={revealControls} onPointerDown={revealControls} onKeyDownCapture={revealControls} onFocusCapture={revealControls}>
      <div className="onboard-screen" role="button" tabIndex={0} aria-label={playing?"Pause onboard video":"Play onboard video"} onClick={event=>{event.currentTarget.focus({preventScroll:true});void toggle();}} onKeyDown={event=>{if(event.key==="Enter"){event.preventDefault();event.stopPropagation();void toggle();}}}><video ref={media} src={src} poster={video.poster} preload="metadata" playsInline controls={!enhanced} aria-label={`${driver?.name} onboard, Round ${video.round}, ${event?.date ?? ""}`} onTimeUpdate={event=>setTime(event.currentTarget.currentTime)} onLoadedMetadata={event=>{const node=event.currentTarget;if(Number.isFinite(node.duration))setDuration(node.duration);if(pending.current!==null){node.currentTime=pending.current;pending.current=null;}}} onWaiting={()=>setBuffering(true)} onSeeking={()=>setBuffering(true)} onSeeked={()=>setBuffering(false)} onPlaying={()=>{setBuffering(false);setControlsVisible(true);}} onCanPlay={()=>setBuffering(false)} onPlay={()=>{setPlaying(true);setControlsVisible(true);}} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onVolumeChange={event=>{setVolume(event.currentTarget.volume);setMuted(event.currentTarget.muted);}} onError={()=>{if(src)setError("Video could not be loaded. Check your connection and try again.");}}/>{video.round === 3 && <div className="onboard-video-status" aria-live="off">{overlay}</div>}{!src&&<div className="onboard-delivery"><b>Original onboard archive</b><span>Streaming version is being prepared.</span><small>Explore the sessions and {video.laps.length} recorded laps below.</small></div>}</div>
      {src && buffering && <p className="onboard-note" role="status">Buffering video…</p>}<div className="onboard-controls">
        <div className="onboard-seek"><label className="sr-only" htmlFor="onboard-progress">Video position</label><input id="onboard-progress" type="range" min="0" max={duration} step="0.1" value={time} aria-valuetext={onboardClock(time)} onChange={event=>seek(Number(event.target.value))}/><div className="onboard-markers" aria-hidden="true">{[{time:video.laps[video.laps.length-1].videoEndSeconds,label:"Race finish"},...video.sessions.filter(s=>s.id==="qualifying"||s.id==="formation").map(s=>({time:s.start,label:s.title})),...video.laps.map(l=>({time:l.videoStartSeconds,label:`Lap ${l.lapNumber}`}))].map(m=><i key={m.time} style={{left:`${m.time/duration*100}%`}} title={`${m.label} · ${onboardClock(m.time)}`}/>)}</div></div>
        <div className="onboard-toolbar" onPointerUpCapture={event=>{if(event.target instanceof HTMLButtonElement)event.target.blur();}}><button disabled={!src} onClick={()=>void toggle()} aria-label={playing?"Pause":"Play"}>{playing?"Pause":"Play"}</button><span className="onboard-clock">{onboardClock(time)} / {onboardClock(duration)}</span><button disabled={!src} onClick={()=>{if(media.current)media.current.muted=!media.current.muted;}} aria-label={muted?"Unmute":"Mute"}>{muted?"Unmute":"Mute"}</button><input className="onboard-volume" type="range" aria-label="Volume" min="0" max="1" step="0.05" value={muted?0:volume} onChange={event=>{if(media.current){media.current.volume=Number(event.target.value);media.current.muted=false;}}}/><label className="onboard-speed"><span className="sr-only">Playback speed</span><select value={speed} onChange={event=>{const next=Number(event.target.value);setSpeed(next);if(media.current)media.current.playbackRate=next;}}>{[0.5,0.75,1,1.25,1.5,2].map(rate=><option key={rate} value={rate}>{rate}×</option>)}</select></label><button onClick={()=>setTheater(v=>!v)} aria-pressed={theater} title="Theater mode (T)">Theater</button><button onClick={()=>void fullscreen()} aria-pressed={fullscreenActive} title="Fullscreen (F)">{fullscreenActive?"Exit fullscreen":"Fullscreen"}</button></div>
      </div>
      </div>
      {error&&<p role="alert" className="onboard-error">{error} <button onClick={()=>{media.current?.load();setError("");}}>Retry</button></p>}
      <div className="onboard-now" aria-live="off"><b>{active.lap?`LAP ${active.lap.lapNumber}`:active.session?.title}</b><span>{active.lap?`${formatLapTime(active.lap.recordedLapTimeMs)} · recorded timing`:"Full race weekend footage"}</span></div>
      <nav className="onboard-sessions" aria-label="Onboard sessions">{video.sessions.filter(s=>s.quick).map(s=><button key={s.id} aria-current={active.session?.id===s.id?"true":undefined} onClick={()=>seek(s.start)}><b>{s.title}</b><small>{onboardClock(s.start)}</small></button>)}</nav>
      <p className="onboard-note">{video.round === 3 ? "Lap navigation uses an estimated race start at 10:36 plus recorded lap times. The video clock is approximate." : "Video timestamps and recorded lap times use separate clocks."} Shortcuts when the player is focused: Space play/pause · ←/→ seek · T theater · F fullscreen.</p>
    </div><aside className="onboard-lap-panel" aria-label="Race lap navigation"><div className="onboard-lap-heading"><b>Race laps</b><span>{video.laps.length} LAPS · {event?.format}</span></div><div className="onboard-laps" ref={lapPanel}>{video.laps.map(lap=><button key={lap.lapNumber} aria-current={active.lap?.lapNumber===lap.lapNumber?"true":undefined} onClick={()=>seek(lap.videoStartSeconds,lap.lapNumber,true)}><span><b>LAP {lap.lapNumber}</b><small>{onboardClock(lap.videoStartSeconds)}</small></span><span><strong>{formatLapTime(lap.recordedLapTimeMs)}</strong>{lap.recordedLapTimeMs===fastest?<small className="onboard-fastest">FASTEST</small>:null}</span></button>)}</div></aside></div>
  </section>;
}
