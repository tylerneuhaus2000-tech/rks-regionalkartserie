"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, Cloud, Download, Flag, Gauge, Image, Map, Play, Timer, Trophy } from "lucide-react";
import { m } from "framer-motion";
import { raceEvent } from "@/lib/rks-data";
import { useLiveRound3 } from "@/lib/use-live-round3";
import { useLiveDrivers } from "@/lib/use-live-drivers";

const links=[
  {label:"Qualifying",href:"/calendar/round-3#qualifying",icon:Gauge,state:"Startzeit folgt"},
  {label:"Race",href:"/calendar/round-3#race",icon:Flag,state:"Startzeit folgt"},
  {label:"RaceHub",href:"/racehub",icon:Play,state:"Event Hub"},
  {label:"Media",href:"/media",icon:Image,state:"Galerie folgt"},
  {label:"Downloads",href:"/calendar/round-3#downloads",icon:Download,state:"Dokumente folgen"},
];

function Countdown({date}:{date:string|null}){const[now,setNow]=useState(Date.now());useEffect(()=>{if(!date)return;const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer);},[date]);if(!date)return <><strong>TBD</strong><small>Countdown starts when date is confirmed</small></>;const delta=new Date(date).getTime()-now;if(delta<=0&&now-new Date(date).getTime()>86400000)return <><strong>AFTER THE FLAG</strong><small>Round 03 complete</small></>;if(delta<=0)return <><strong>RACE WEEKEND</strong><small>Round 03 timing</small></>;const d=Math.floor(delta/86400000);const h=Math.floor(delta%86400000/3600000);const m=Math.floor(delta%3600000/60000);const s=Math.floor(delta%60000/1000);return <><strong className="countdown-digits">{String(d).padStart(2,"0")}<i>d</i> {String(h).padStart(2,"0")}<i>h</i> {String(m).padStart(2,"0")}<i>m</i> {String(s).padStart(2,"0")}<i>s</i></strong><small>UNTIL ROUND 03</small></>;}

export function Round3Showcase(){const event=useLiveRound3();const standings=useLiveDrivers(2026);const leader=standings[0];const challenger=standings[1];return <section className="round3-section" aria-labelledby="round3-title">
  <div className="wrap">
    <m.div className="round3-card" initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.55,ease:"easeOut"}}>
      <div className="round3-head">
        <div><div className="eyebrow"><span className="red">RKS 2026</span> &nbsp; / &nbsp; ROUND 03</div><h2 id="round3-title">Dortmund.<br/><span>Full throttle.</span></h2><p>Highway Kart Racing Dortmund · die nächste Station der Regionalkartserie.</p></div>
        <Link className="btn btn-primary" href="/calendar/round-3">Event öffnen <ArrowRight size={14}/></Link>
      </div>
      <div className="round3-facts">
        <div className="round3-fact"><CalendarDays/><span>DATUM</span><strong>{event.date?new Intl.DateTimeFormat("de-DE",{dateStyle:"medium",timeZone:"Europe/Berlin"}).format(new Date(event.date)):"To Be Announced"}</strong><small>{event.date?"RKS Rennwochenende":"Termin wird bestätigt"}</small></div>
        <div className="round3-fact"><Cloud/><span>WETTER</span><strong>Indoor · unabhängig</strong><small>Rennbetrieb in der Halle</small></div>
        <div className="round3-fact"><Trophy/><span>PREVIOUS WINNER</span><strong>{event.previousWinner??"—"}</strong><small>{event.previousWinner??"No previous winner · Inaugural season"}</small></div>
        <div className="round3-fact"><Timer/><span>COUNTDOWN</span><Countdown date={event.date}/></div>
      </div>
      <div className="round3-lower">
        <div className="round3-map-wrap"><div className="round3-map-label"><Map size={13}/> STRECKENLAYOUT <span>OFFICIAL TRACK MAP</span></div><a href={raceEvent.track.layoutUrl} target="_blank" rel="noreferrer" aria-label="Offizielle Streckenkarte in neuem Tab öffnen"><img src={raceEvent.track.layoutUrl} alt="Offizieller Streckenplan von Highway Kart Racing Dortmund" loading="lazy" width="1200" height="600"/></a><a className="round3-credit" href={raceEvent.track.sourceUrl} target="_blank" rel="noreferrer">Streckenkarte: Highway Kart Racing <ArrowUpRight size={12}/></a></div>
        <div className="round3-side">
          <div className="round3-champ"><div className="eyebrow">CURRENT CHAMPIONSHIP · 2026</div><div className="round3-leader"><span className="leader-number">01</span><div><b>{leader?.name??"—"}</b><small>DRIVERS CHAMPIONSHIP LEADER</small></div><strong>{leader?.points??"—"} <small>PTS</small></strong></div><div className="round3-gap"><span>{challenger?.name??"—"}</span><div><i style={{width:leader&&challenger&&leader.points>0?`${Math.min(100,challenger.points/leader.points*100)}%`:"0%"}}/></div><b>{leader&&challenger?`−${leader.points-challenger.points} PTS`:"—"}</b></div><Link href="/championship" className="link-arrow">Standings ansehen <ArrowRight size={13}/></Link></div>
          <div className="round3-track-specs"><div><strong>1.600 <small>m</small></strong><span>STRECKENLÄNGE</span></div><div><strong>20</strong><span>KURVEN</span></div><div><strong>2</strong><span>HALLEN</span></div><p>4–6 m Streckenbreite · längste Gerade 70 m</p></div>
        </div>
      </div>
      <div className="round3-session-head"><span><i className="glow-dot"/> ROUND 03 · LIVE CENTER</span><small>Live-Timing startet am Rennwochenende, sobald ein offizieller Datenfeed verbunden ist.</small></div>
      <nav className="round3-links" aria-label="Round 3 Event Center">{links.map(({label,href,icon:Icon,state})=><Link href={href} key={label}><Icon/><span><b>{label}</b><small>{state}</small></span><ArrowUpRight className="round3-arrow"/></Link>)}</nav>
      <div className="round3-source-note">Streckendaten laut <a href={raceEvent.track.sourceUrl} target="_blank" rel="noreferrer">Highway Kart Racing</a>: 1.600 m, 20 Kurven und Indoor-Betrieb. Wetter meint hier die wetterunabhängigen Hallenbedingungen, keine Live-Prognose.</div>
    </m.div>
  </div>
</section>;}

export function Round3EventPage(){const event=useLiveRound3();return <>
  <section className="round3-event-hero"><div className="wrap"><div className="eyebrow"><span className="red">RKS 2026</span> &nbsp; / &nbsp; ROUND 03 &nbsp; / &nbsp; DORTMUND</div><div className="round3-event-title"><div><h1>Highway Kart<br/><span>Racing Dortmund</span></h1><p>Round 03 · Drivers & Teams Championship</p></div><span className="event-status upcoming">DATE TO BE CONFIRMED</span></div><div className="round3-event-facts"><div><span>EVENT DATE</span><b>{event.date?new Intl.DateTimeFormat("de-DE",{dateStyle:"full",timeZone:"Europe/Berlin"}).format(new Date(event.date)):"TBD · To Be Announced"}</b></div><div><span>VENUE</span><b>Dortmund-Barop · Indoor</b></div><div><span>TRACK</span><b>1.600 km · 20 turns</b></div><div><span>PREVIOUS WINNER</span><b>{event.previousWinner??"— · Inaugural Season"}</b></div></div></div></section>
  <section className="section"><div className="wrap"><nav className="round3-links round3-event-tabs" aria-label="Race weekend sections">{links.map(({label,href,icon:Icon,state})=><a key={label} href={label==="RaceHub"?"/racehub":label==="Media"?"/media":label==="Downloads"?"#downloads":`#${label.toLowerCase()}`}><Icon/><span><b>{label}</b><small>{state}</small></span><ArrowUpRight className="round3-arrow"/></a>)}</nav><div className="round3-event-grid"><article className="panel" id="qualifying"><div className="eyebrow">SESSION 01</div><h2>Qualifying</h2><div className="round3-session-state"><Gauge/><div><b>Session not started</b><p>Start time and qualifying results will be published when the Round 3 schedule is confirmed.</p></div></div><div className="round3-session-lines"><div><span>SESSION TIME</span><b>Pending event schedule</b></div><div><span>QUALIFYING ORDER</span><b>Published after the session</b></div><div><span>STARTING GRID</span><b>Confirmed by Race Control</b></div></div></article><article className="panel" id="race"><div className="eyebrow">SESSION 02</div><h2>Race</h2><div className="round3-session-state"><Flag/><div><b>Race start pending</b><p>Race control, starting grid, classification and fastest lap appear here after official publication.</p></div></div><div className="round3-event-links"><Link href="/racehub"><Play/> RaceHub <ArrowUpRight/></Link><Link href="/media"><Image/> Event media <ArrowUpRight/></Link></div></article></div><div className="round3-layout-panel"><div><div className="eyebrow">THE CIRCUIT</div><h2>1.600 metres.<br/>20 corners. Two halls.</h2><p>Highway Kart Racing is an indoor circuit in Dortmund-Barop. The venue describes the track as weather independent.</p><a className="btn" href={raceEvent.track.sourceUrl} target="_blank" rel="noreferrer">Venue information <ArrowUpRight size={13}/></a></div><a href={raceEvent.track.layoutUrl} target="_blank" rel="noreferrer" className="round3-large-map"><img src={raceEvent.track.layoutUrl} alt="Official Highway Kart Racing Dortmund circuit layout" loading="lazy" width="1200" height="600"/><span>Official circuit layout · Highway Kart Racing</span></a></div><article className="panel round3-downloads" id="downloads"><div><div className="eyebrow">DOCUMENTS & MEDIA</div><h2>Downloads</h2><p>Official starting grids, result sheets and race media will be available here when released.</p></div><span className="badge">No files published yet</span></article></div></section>
</>;}
