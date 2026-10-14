"use client";

/** Archived venue-specific design reference. It is not imported by 2026 event routes. */

import Link from "@/components/site-link";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, Camera, Check, ChevronRight, Cloud, CloudSun, Download, Flag, Gauge, Image as ImageIcon, LockKeyhole, Map, MapPin, Play, Route, Timer, Trophy, Users } from "lucide-react";
import { animate, m, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { dortmundEvent } from "@/lib/rks-data";
import { useLiveDrivers } from "@/lib/use-live-drivers";

const links=[
  {label:"Qualifying",href:"#qualifying",icon:Gauge,state:"Startzeit folgt"},
  {label:"Race",href:"#race",icon:Flag,state:"Startzeit folgt"},
  {label:"RaceHub",href:"/racehub",icon:Play,state:"Event Hub"},
  {label:"Media",href:"/media",icon:ImageIcon,state:"Galerie folgt"},
  {label:"Downloads",href:"#downloads",icon:Download,state:"Dokumente folgen"},
];

function Countdown({date}:{date:string|null}){const[now,setNow]=useState(0);useEffect(()=>{if(!date)return;const initialTick=window.setTimeout(()=>setNow(Date.now()),0);const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>{window.clearTimeout(initialTick);window.clearInterval(timer);};},[date]);if(!date)return null;const delta=new Date(date).getTime()-now;if(!Number.isFinite(delta))return null;if(delta<=0&&now-new Date(date).getTime()>86400000)return <><strong>AFTER THE FLAG</strong><small>Dortmund venue complete</small></>;if(delta<=0)return <><strong>RACE WEEKEND</strong><small>Dortmund venue timing</small></>;const d=Math.floor(delta/86400000);const h=Math.floor(delta%86400000/3600000);const min=Math.floor(delta%3600000/60000);const s=Math.floor(delta%60000/1000);return <><strong className="countdown-digits">{String(d).padStart(2,"0")}<i>d</i> {String(h).padStart(2,"0")}<i>h</i> {String(min).padStart(2,"0")}<i>m</i> {String(s).padStart(2,"0")}<i>s</i></strong><small>UNTIL DORTMUND VENUE</small></>;}

export function DortmundEventShowcaseArchive(){const event={date:null,previousWinner:null};const standings=useLiveDrivers(2026);const leader=standings[0];const challenger=standings[1];return <section className="round3-section" aria-labelledby="round3-title">
  <div className="wrap">
    <m.div className="round3-card" initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.55,ease:"easeOut"}}>
      <div className="round3-head">
        <div><div className="eyebrow"><span className="red">RKS VENUE ARCHIVE</span> &nbsp; / &nbsp; DORTMUND VENUE</div><h2 id="round3-title">Dortmund.<br/><span>Full throttle.</span></h2><p>Highway Kart Racing Dortmund · die nächste Station der Regionalkartserie.</p></div>
        <Link className="btn btn-primary" href="/calendar">Calendar öffnen <ArrowRight size={14}/></Link>
      </div>
      <div className="round3-facts">
        <div className="round3-fact"><CalendarDays/><span>DATUM</span><strong>{event.date?new Intl.DateTimeFormat("de-DE",{dateStyle:"medium",timeZone:"Europe/Berlin"}).format(new Date(event.date)):"Date will be announced."}</strong><small>{event.date?"RKS Rennwochenende":"The event details are in preparation"}</small></div>
        <div className="round3-fact"><Cloud/><span>WETTER</span><strong>Indoor · unabhängig</strong><small>Rennbetrieb in der Halle</small></div>
        <div className="round3-fact"><Trophy/><span>PREVIOUS WINNER</span><strong>{event.previousWinner??"—"}</strong><small>{event.previousWinner??"No previous winner · Inaugural season"}</small></div>
        {event.date&&<div className="round3-fact"><Timer/><span>COUNTDOWN</span><Countdown date={event.date}/></div>}
      </div>
      <div className="round3-lower">
        <div className="round3-map-wrap"><div className="round3-map-label"><Map size={13}/> STRECKENLAYOUT <span>OFFICIAL TRACK MAP</span></div><a href={dortmundEvent.track.layoutUrl} target="_blank" rel="noreferrer" aria-label="Offizielle Streckenkarte in neuem Tab öffnen"><NextImage unoptimized src={dortmundEvent.track.layoutUrl} alt="Offizieller Streckenplan von Highway Kart Racing Dortmund" loading="lazy" width={1200} height={600}/></a><a className="round3-credit" href={dortmundEvent.track.sourceUrl} target="_blank" rel="noreferrer">Streckenkarte: Highway Kart Racing <ArrowUpRight size={12}/></a></div>
        <div className="round3-side">
          <div className="round3-champ"><div className="eyebrow">CHAMPIONSHIP PREVIEW</div><div className="round3-leader"><span className="leader-number">01</span><div><b>{leader?.name??"—"}</b><small>DRIVERS CHAMPIONSHIP LEADER</small></div><strong>{leader?.points??"—"} <small>PTS</small></strong></div><div className="round3-gap"><span>{challenger?.name??"—"}</span><div><i style={{width:leader&&challenger&&leader.points>0?`${Math.min(100,challenger.points/leader.points*100)}%`:"0%"}}/></div><b>{leader&&challenger?`−${leader.points-challenger.points} PTS`:"—"}</b></div><Link href="/championship" className="link-arrow">Standings ansehen <ArrowRight size={13}/></Link></div>
          <div className="round3-track-specs"><div><strong>1.600 <small>m</small></strong><span>STRECKENLÄNGE</span></div><div><strong>20</strong><span>KURVEN</span></div><div><strong>2</strong><span>HALLEN</span></div><p>4–6 m Streckenbreite · längste Gerade 70 m</p></div>
        </div>
      </div>
      <div className="round3-session-head"><span><i className="glow-dot"/> DORTMUND VENUE · LIVE CENTER</span><small>Live-Timing startet am Rennwochenende, sobald ein offizieller Datenfeed verbunden ist.</small></div>
      <nav className="round3-links" aria-label="Dortmund venue Event Center">{links.map(({label,href,icon:Icon,state})=><Link href={href} key={label}><Icon/><span><b>{label}</b><small>{state}</small></span><ArrowUpRight className="round3-arrow"/></Link>)}</nav>
      <div className="round3-source-note">Streckendaten laut <a href={dortmundEvent.track.sourceUrl} target="_blank" rel="noreferrer">Highway Kart Racing</a>: 1.600 m, 20 Kurven und Indoor-Betrieb. Wetter meint hier die wetterunabhängigen Hallenbedingungen, keine Live-Prognose.</div>
    </m.div>
  </div>
</section>;}

function CountUp({value,format}:{value:number;format?:(value:number)=>string}){
  const ref=useRef<HTMLSpanElement>(null);const inView=useInView(ref,{once:true,amount:.65});const reducedMotion=useReducedMotion();const count=useMotionValue(reducedMotion?value:0);const shown=useTransform(count,current=>format?format(Math.round(current)):String(Math.round(current)));
  useEffect(()=>{if(!inView||reducedMotion)return;const controls=animate(count,value,{duration:1.15,ease:"easeOut"});return()=>controls.stop();},[count,inView,reducedMotion,value]);
  return <m.span ref={ref}>{shown}</m.span>;
}

const weekend=[
  {label:"SESSION 01",title:"Qualifying",copy:"The starting order will be set on track.",icon:Gauge,anchor:"qualifying"},
  {label:"SESSION 02",title:"Dortmund venue Race",copy:"Championship points are on the line.",icon:Flag,anchor:"race"},
  {label:"AFTER THE FLAG",title:"RaceHub",copy:"Replay, analysis and the full event report.",icon:Play,anchor:"racehub"},
];

export function DortmundEventPageArchive(){
  const event={date:null,previousWinner:null};const standings=useLiveDrivers(2026);const podium=standings.slice(0,3);const confirmedDate=event.date?new Date(event.date):null;
  const dateLabel=confirmedDate&&Number.isFinite(confirmedDate.getTime())?new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Berlin"}).format(confirmedDate):null;
  return <main className="round3-page">
    <section className="round3-premium-hero" aria-labelledby="round3-event-name">
      <NextImage unoptimized className="round3-hero-photo" src="/dortmund-event-hero-archive.jpg" alt="Drivers preparing to race inside the Highway Kart Racing venue" width={1600} height={1067} fetchPriority="high"/>
      <div className="round3-hero-shade"/>
      <div className="wrap round3-hero-content">
        <div className="round3-hero-eyebrow"><span className="round3-red-mark"/> RKS VENUE ARCHIVE <i/> DORTMUND VENUE <i/> DORTMUND</div>
        <div className="round3-hero-status"><span className="round3-status-dot"/> ARCHIVED VENUE CONCEPT <b>REFERENCE</b><span className="round3-status-divider"/> DRIVERS & TEAMS CHAMPIONSHIP</div>
        <h1 id="round3-event-name">Highway Kart<br/><span>Racing Dortmund</span></h1>
        <p className="round3-hero-copy">The championship heads indoors for Dortmund venue. A 1.6 km circuit, two halls and twenty corners await the RKS field.</p>
        <div className="round3-hero-actions"><a className="round3-action-primary" href="#circuit">Discover the circuit <ArrowRight size={15}/></a><Link className="round3-action-secondary" href="/racehub">Explore RaceHub <ArrowUpRight size={15}/></Link></div>
        <div className="round3-hero-base">
          <a className="round3-photo-credit" href={dortmundEvent.track.sourceUrl} target="_blank" rel="noreferrer">Venue photography · Highway Kart Racing</a>
          {dateLabel?<div className="round3-hero-countdown"><span>LIGHTS OUT IN</span><Countdown date={event.date}/></div>:<div className="round3-hero-date"><CalendarDays size={20}/><span><small>RACE WEEKEND</small><b>Date will be announced.</b><em>Follow RKS for the official schedule.</em></span></div>}
        </div>
      </div>
      <div className="round3-hero-number" aria-hidden="true">03</div>
    </section>

    <section className="round3-event-overview wrap" aria-label="Event overview">
      <article className="round3-overview-card round3-date-card"><span className="round3-card-icon"><CalendarDays/></span><div><small>RACE WEEKEND</small><strong>{dateLabel??"Date will be announced."}</strong><p>{dateLabel?"The lights are getting closer.":"The event date will appear here once confirmed."}</p></div><span className="round3-card-rule"/></article>
      <article className="round3-overview-card"><span className="round3-card-icon"><Flag/></span><div><small>EVENT STATUS</small><strong>Dortmund venue · Upcoming</strong><p>Archived venue specification, retained for future event planning.</p></div><span className="round3-card-rule"/></article>
      <article className="round3-overview-card"><span className="round3-card-icon"><CloudSun/></span><div><small>WEATHER</small><strong>Indoor · all-weather</strong><p>Racing runs in the covered circuit halls.</p></div><span className="round3-card-rule"/></article>
    </section>

    <section className="round3-section-block wrap round3-context-section">
      <div className="round3-section-heading"><div><span className="round3-kicker">THE SEASON SO FAR</span><h2>Every point matters.</h2></div><Link className="round3-text-link" href="/championship">Full standings <ArrowUpRight size={14}/></Link></div>
      <div className="round3-context-grid">
        <article className="round3-previous-winner">
          <div className="round3-winner-ornament"><Trophy size={21}/><span>DORTMUND VENUE · PREVIOUS WINNER</span></div>
          {event.previousWinner?<><div className="round3-winner-name">{event.previousWinner}</div><p>Previous winner at Dortmund venue.</p><div className="round3-winner-year">03</div></>:<><div className="round3-inaugural-emblem"><span>RKS</span><b>26</b><i/></div><div className="round3-inaugural-copy"><span>THE FIRST CHAPTER</span><h3>Inaugural<br/>Season</h3><p>Venue-specific artwork and circuit information retained for possible future use.</p></div><div className="round3-winner-year">01</div></>}
        </article>
        <article className="round3-standings-card">
          <div className="round3-mini-heading"><div><span className="round3-kicker">DRIVERS CHAMPIONSHIP</span><h3>Championship leaders</h3></div><span className="round3-season-pill">ARCHIVE</span></div>
          <div className="round3-podium-list">{podium.map((driver,index)=><Link href={`/drivers/${driver.slug}`} className={`round3-podium-row podium-${index+1}`} key={driver.slug}><span className="round3-podium-position">{String(driver.position).padStart(2,"0")}</span><span className="round3-podium-medal"/><span className="round3-podium-driver"><b>{driver.name}</b><small>{index===0?"CHAMPIONSHIP LEADER":"DRIVER"}</small></span><span className="round3-podium-points">{driver.points}<small>PTS</small></span><ChevronRight size={15}/></Link>)}</div>
          <Link href="/championship" className="round3-standings-footer">View the full championship <ArrowRight size={14}/></Link>
        </article>
      </div>
    </section>

    <section className="round3-spec-section" aria-labelledby="round3-spec-title"><div className="wrap">
      <div className="round3-section-heading"><div><span className="round3-kicker">HIGHWAY KART RACING · DORTMUND-BAROP</span><h2 id="round3-spec-title">Built for close racing.</h2></div><a className="round3-text-link" href={dortmundEvent.track.sourceUrl} target="_blank" rel="noreferrer">Venue details <ArrowUpRight size={14}/></a></div>
      <div className="round3-spec-grid">
        <article className="round3-spec-card"><span className="round3-spec-icon"><Route/></span><strong><CountUp value={dortmundEvent.track.lengthMeters} format={v=>v.toLocaleString("en-GB")}/> <small>m</small></strong><span>CIRCUIT LENGTH</span><div className="round3-spec-underline"/></article>
        <article className="round3-spec-card"><span className="round3-spec-icon"><Route/></span><strong><CountUp value={dortmundEvent.track.corners}/></strong><span>CORNERS</span><div className="round3-spec-underline"/></article>
        <article className="round3-spec-card"><span className="round3-spec-icon"><Map/></span><strong><CountUp value={dortmundEvent.track.halls}/></strong><span>INDOOR HALLS</span><div className="round3-spec-underline"/></article>
        <article className="round3-spec-card"><span className="round3-spec-icon"><Users/></span><strong><CountUp value={dortmundEvent.track.kartsPerRace}/></strong><span>KARTS PER RACE</span><div className="round3-spec-underline"/></article>
      </div>
      <div className="round3-spec-note"><span><Check size={13}/> {dortmundEvent.track.width} track width</span><span><Check size={13}/> {dortmundEvent.track.longestStraight} longest straight</span><span><Check size={13}/> Weather-independent indoor racing</span><span className="round3-source-line">Circuit figures from <a href={dortmundEvent.track.sourceUrl} target="_blank" rel="noreferrer">Highway Kart Racing</a></span></div>
    </div></section>

    <section className="round3-section-block wrap" id="schedule">
      <div className="round3-section-heading"><div><span className="round3-kicker">DORTMUND VENUE · EVENT PROGRAMME</span><h2>Race weekend schedule.</h2></div><span className="round3-announcement"><CalendarDays size={14}/> Full timings will be announced</span></div>
      <div className="round3-schedule-grid">{weekend.map((item,index)=>{const Icon=item.icon;return <article className="round3-schedule-card" id={item.anchor} key={item.label}><div className="round3-schedule-top"><span>{item.label}</span><b>0{index+1}</b></div><span className="round3-schedule-icon"><Icon/></span><h3>{item.title}</h3><p>{item.copy}</p><div className="round3-schedule-bottom"><span className="round3-time-pending">Schedule will be announced</span>{item.anchor==="racehub"?<Link href="/racehub" aria-label="Open RaceHub"><ArrowUpRight size={15}/></Link>:<span className="round3-session-line"/>}</div></article>;})}</div>
    </section>

    <section className="round3-track-section" id="circuit"><div className="wrap round3-track-layout">
      <div className="round3-track-copy"><span className="round3-kicker">THE CIRCUIT</span><h2>One venue.<br/><span>Two halls.</span></h2><p>Highway Kart Racing brings the field into a 1,600 metre indoor layout at Dortmund-Barop. Twenty corners and a 70 metre straight make every lap a chance to find time.</p><div className="round3-track-location"><MapPin size={17}/><span><b>Highway Kart Racing</b><small>Dortmund-Barop · Germany</small></span></div><a className="round3-outline-link" href={dortmundEvent.track.sourceUrl} target="_blank" rel="noreferrer">Visit venue website <ArrowUpRight size={14}/></a></div>
      <div className="round3-map-card" id="track-map"><div className="round3-map-card-head"><div><span className="round3-kicker">OFFICIAL LAYOUT</span><b>Highway Kart Racing Dortmund</b></div><a href={dortmundEvent.track.layoutUrl} target="_blank" rel="noreferrer" aria-label="Open official circuit map"><ArrowUpRight size={16}/></a></div><a className="round3-map-image" href={dortmundEvent.track.layoutUrl} target="_blank" rel="noreferrer"><NextImage unoptimized src={dortmundEvent.track.layoutUrl} alt="Official circuit map of Highway Kart Racing Dortmund" loading="lazy" width={1200} height={600}/></a><div className="round3-map-card-foot"><span><Map size={13}/> 1.600 km · 20 corners</span><span>Map courtesy of Highway Kart Racing</span></div></div>
    </div></section>

    <section className="round3-section-block wrap round3-assets-section">
      <div className="round3-section-heading"><div><span className="round3-kicker">FOLLOW EVERY MOMENT</span><h2>Event coverage.</h2></div><span className="round3-assets-note">Published event material will appear here.</span></div>
      <div className="round3-assets-grid">
        <article className="round3-gallery-card"><div className="round3-gallery-art"><div className="round3-gallery-frame frame-one"><Camera/></div><div className="round3-gallery-frame frame-two"><ImageIcon/></div><div className="round3-gallery-frame frame-three"><Play/></div><span className="round3-gallery-number">03</span><span className="round3-gallery-glow"/></div><div className="round3-gallery-copy"><span className="round3-kicker">PHOTOS · VIDEO · ONBOARD</span><h3>Moments from Dortmund.</h3><p>The Dortmund venue gallery opens when the first event media is published.</p><Link href="/media" className="round3-asset-link">Explore RKS Media <ArrowRight size={14}/></Link></div></article>
        <article className="round3-download-card" id="downloads"><div className="round3-download-head"><div><span className="round3-kicker">OFFICIAL DOCUMENTS</span><h3>Downloads.</h3></div><Download size={20}/></div><p>Weekend documents and official results will be added as they are released.</p><div className="round3-download-list"><div><span className="round3-download-file"><Flag/></span><span><b>Qualifying classification</b><small>Official session result</small></span><span className="round3-locked"><LockKeyhole size={12}/> Awaiting event</span></div><div><span className="round3-download-file"><Trophy/></span><span><b>Race classification</b><small>Final results & points</small></span><span className="round3-locked"><LockKeyhole size={12}/> Awaiting event</span></div><div><span className="round3-download-file"><ImageIcon/></span><span><b>Event media pack</b><small>Photos & highlights</small></span><span className="round3-locked"><LockKeyhole size={12}/> Awaiting event</span></div></div><Link href="/racehub" className="round3-download-footer">Race results will also feature in RaceHub <ArrowRight size={14}/></Link></article>
      </div>
    </section>
  </main>;
}
