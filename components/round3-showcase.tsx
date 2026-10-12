"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { m, animate, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, CalendarDays, Camera, Check, ChevronRight, CloudSun, Download, Flag, Gauge, Image, LockKeyhole, Map, MapPin, Play, Route, Timer, Trophy, Users } from "lucide-react";
import { round3Event } from "@/lib/rks-data";
import { useLiveRound3 } from "@/lib/use-live-round3";
import { useLiveDrivers } from "@/lib/use-live-drivers";

function Countdown({ date }: { date: string | null }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!date) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [date]);
  if (!date) return null;
  const timestamp = new Date(date).getTime();
  const delta = timestamp - now;
  if (!Number.isFinite(delta)) return null;
  if (delta <= 0) return <><strong>RACE DAY</strong><small>21 OCTOBER · DAYTONA ESSEN</small></>;
  const days = Math.floor(delta / 86_400_000);
  const hours = Math.floor((delta % 86_400_000) / 3_600_000);
  const minutes = Math.floor((delta % 3_600_000) / 60_000);
  const seconds = Math.floor((delta % 60_000) / 1000);
  return <><strong className="countdown-digits">{String(days).padStart(2, "0")}<i>d</i> {String(hours).padStart(2, "0")}<i>h</i> {String(minutes).padStart(2, "0")}<i>m</i> {String(seconds).padStart(2, "0")}<i>s</i></strong><small>UNTIL ROUND 03 · 21 OCTOBER</small></>;
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: .65 });
  const reducedMotion = useReducedMotion();
  const count = useMotionValue(reducedMotion ? value : 0);
  const shown = useTransform(count, current => String(Math.round(current)));
  useEffect(() => {
    if (!inView || reducedMotion) return;
    const controls = animate(count, value, { duration: 1, ease: "easeOut" });
    return () => controls.stop();
  }, [count, inView, reducedMotion, value]);
  return <m.span ref={ref}>{shown}</m.span>;
}

function RoundDate({ date }: { date: string }) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(date));
}

export function Round3Showcase() {
  const event = useLiveRound3();
  const standings = useLiveDrivers(2026);
  const leader = standings[0];
  const challenger = standings[1];
  const date = event.date ?? round3Event.date ?? "2026-10-21T00:00:00+02:00";
  return <section className="round3-section" aria-labelledby="round3-title">
    <div className="wrap">
      <m.div className="round3-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .55, ease: "easeOut" }}>
        <div className="round3-head">
          <div><div className="eyebrow"><span className="red">RKS 2026</span> &nbsp; / &nbsp; ROUND 03</div><h2 id="round3-title">Essen.<br/><span>Full throttle.</span></h2><p>Daytona Kart Center Essen · Bahn 2 · 21 October 2026.</p></div>
          <Link className="btn btn-primary" href="/calendar/round-3">Event öffnen <ArrowRight size={14}/></Link>
        </div>
        <div className="round3-facts">
          <div className="round3-fact"><CalendarDays/><span>DATUM</span><strong><RoundDate date={date}/></strong><small>RKS Rennwochenende</small></div>
          <div className="round3-fact"><MapPin/><span>VENUE</span><strong>Daytona Kart Center Essen</strong><small>Bahn 2</small></div>
          <div className="round3-fact"><Flag/><span>EVENT STATUS</span><strong>Upcoming</strong><small>Round 03 · 2026</small></div>
          <div className="round3-fact"><Timer/><span>COUNTDOWN</span><Countdown date={date}/></div>
        </div>
        <div className="round3-lower">
          <div className="round3-map-wrap"><div className="round3-map-label"><Map size={13}/> BAHN 2 LAYOUT <span>OFFICIAL TRACK MAP</span></div><div className="round3-layout-placeholder"><Route size={25}/><b>Daytona · Bahn 2</b><span>Official circuit layout will be published here.</span></div></div>
          <div className="round3-side">
            <div className="round3-champ"><div className="eyebrow">CURRENT CHAMPIONSHIP · 2026</div><div className="round3-leader"><span className="leader-number">01</span><div><b>{leader?.name ?? "—"}</b><small>DRIVERS CHAMPIONSHIP LEADER</small></div><strong>{leader?.points ?? "—"} <small>PTS</small></strong></div><div className="round3-gap"><span>{challenger?.name ?? "—"}</span><div><i style={{ width: leader && challenger && leader.points > 0 ? `${Math.min(100, challenger.points / leader.points * 100)}%` : "0%" }}/></div><b>{leader && challenger ? `−${leader.points - challenger.points} PTS` : "—"}</b></div><Link href="/championship" className="link-arrow">Standings ansehen <ArrowRight size={13}/></Link></div>
            <div className="round3-track-specs"><div><strong>21 <small>OCT</small></strong><span>RACE DATE</span></div><div><strong>02</strong><span>BAHN</span></div><div><strong>03</strong><span>ROUND</span></div><p>Daytona Kart Center · Essen</p></div>
          </div>
        </div>
        <div className="round3-session-head"><span><i className="glow-dot"/> ROUND 03 · EVENT CENTER</span><small>Session times and event documents will be published when confirmed.</small></div>
        <nav className="round3-links" aria-label="Round 3 Event Center">{[
          { label: "Qualifying", href: "/calendar/round-3#qualifying", icon: Gauge, state: "Session details to follow" },
          { label: "Race", href: "/calendar/round-3#race", icon: Flag, state: "21 October · Bahn 2" },
          { label: "RaceHub", href: "/calendar/round-3#racehub", icon: Play, state: "Opens after the race" },
          { label: "Media", href: "/calendar/round-3#media", icon: Image, state: "Gallery to follow" },
          { label: "Downloads", href: "/calendar/round-3#downloads", icon: Download, state: "Documents to follow" },
        ].map(({ label, href, icon: Icon, state }) => <Link href={href} key={label}><Icon/><span><b>{label}</b><small>{state}</small></span><ArrowUpRight className="round3-arrow"/></Link>)}</nav>
      </m.div>
    </div>
  </section>;
}

const weekend = [
  { label: "SESSION 01", title: "Qualifying", copy: "The starting order will be set at Daytona Kart Center Essen.", icon: Gauge, anchor: "qualifying" },
  { label: "SESSION 02", title: "Round 3 Race", copy: "Championship points are on the line on Bahn 2.", icon: Flag, anchor: "race" },
  { label: "AFTER THE FLAG", title: "RaceHub", copy: "Replay, analysis and official results will follow the race.", icon: Play, anchor: "racehub" },
];

export function Round3EventPage() {
  const event = useLiveRound3();
  const standings = useLiveDrivers(2026);
  const podium = standings.slice(0, 3);
  const date = event.date ?? round3Event.date ?? "2026-10-21T00:00:00+02:00";
  const dateLabel = date ? <RoundDate date={date}/> : "Date will be announced.";
  const trackName = "Daytona Kart Center Essen";
  return <main className="round3-page">
    <section className="round3-premium-hero" aria-labelledby="round3-event-name">
      <img className="round3-hero-photo" src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2000&q=85" alt="Kart racing action at a circuit · illustrative image" width="1600" height="1067" fetchPriority="high"/>
      <div className="round3-hero-shade"/>
      <div className="wrap round3-hero-content">
        <div className="round3-hero-eyebrow"><span className="round3-red-mark"/> RKS 2026 <i/> ROUND 03 <i/> ESSEN</div>
        <div className="round3-hero-status"><span className="round3-status-dot"/> EVENT STATUS <b>UPCOMING</b><span className="round3-status-divider"/> DRIVERS & TEAMS CHAMPIONSHIP</div>
        <h1 id="round3-event-name">Daytona Kart Center<br/><span>Essen · Bahn 2</span></h1>
        <p className="round3-hero-copy">Round 3 arrives at Daytona Kart Center Essen on 21 October. The 2026 title fight moves to Bahn 2.</p>
        <div className="round3-hero-actions"><a className="round3-action-primary" href="#circuit">Discover the circuit <ArrowRight size={15}/></a><a className="round3-action-secondary" href="#racehub">Explore RaceHub <ArrowUpRight size={15}/></a></div>
        <div className="round3-hero-base">
          <span className="round3-photo-credit">Illustrative image · Official event photography to follow</span>
          <div className="round3-hero-countdown"><span>LIGHTS OUT IN</span><Countdown date={date}/></div>
        </div>
      </div>
      <div className="round3-hero-number" aria-hidden="true">03</div>
    </section>

    <section className="round3-event-overview wrap" aria-label="Event overview">
      <article className="round3-overview-card round3-date-card"><span className="round3-card-icon"><CalendarDays/></span><div><small>RACE WEEKEND</small><strong>{dateLabel}</strong><p>21 October 2026 · Wednesday</p></div><span className="round3-card-rule"/></article>
      <article className="round3-overview-card"><span className="round3-card-icon"><Flag/></span><div><small>EVENT STATUS</small><strong>Round 03 · Upcoming</strong><p>Next stop in the 2026 season.</p></div><span className="round3-card-rule"/></article>
      <article className="round3-overview-card"><span className="round3-card-icon"><MapPin/></span><div><small>VENUE & CIRCUIT</small><strong>Daytona Kart Center Essen</strong><p>Bahn 2</p></div><span className="round3-card-rule"/></article>
      <article className="round3-overview-card"><span className="round3-card-icon"><CloudSun/></span><div><small>RACE-DAY CONDITIONS</small><strong>Weather information to follow</strong><p>Conditions will be added closer to race day.</p></div><span className="round3-card-rule"/></article>
    </section>

    <section className="round3-section-block wrap round3-context-section">
      <div className="round3-section-heading"><div><span className="round3-kicker">THE SEASON SO FAR</span><h2>Every point matters.</h2></div><Link className="round3-text-link" href="/championship">Full standings <ArrowUpRight size={14}/></Link></div>
      <div className="round3-context-grid">
        <article className="round3-previous-winner">
          <div className="round3-winner-ornament"><Trophy size={21}/><span>ROUND 03 · PREVIOUS WINNER</span></div>
          {event.previousWinner ? <><div className="round3-winner-name">{event.previousWinner}</div><p>Previous winner at this event.</p><div className="round3-winner-year">03</div></> : <><div className="round3-inaugural-emblem"><span>RKS</span><b>26</b><i/></div><div className="round3-inaugural-copy"><span>THE FIRST CHAPTER</span><h3>Inaugural<br/>Season</h3><p>There is no previous-year winner for the inaugural 2026 season.</p></div><div className="round3-winner-year">01</div></>}
        </article>
        <article className="round3-standings-card">
          <div className="round3-mini-heading"><div><span className="round3-kicker">DRIVERS CHAMPIONSHIP</span><h3>Championship leaders</h3></div><span className="round3-season-pill">2026</span></div>
          <div className="round3-podium-list">{podium.map((driver, index) => <Link href={`/drivers/${driver.slug}`} className={`round3-podium-row podium-${index + 1}`} key={driver.slug}><span className="round3-podium-position">{String(driver.position).padStart(2, "0")}</span><span className="round3-podium-medal"/><span className="round3-podium-driver"><b>{driver.name}</b><small>{index === 0 ? "CHAMPIONSHIP LEADER" : "DRIVER"}</small></span><span className="round3-podium-points">{driver.points}<small>PTS</small></span><ChevronRight size={15}/></Link>)}</div>
          <Link href="/championship" className="round3-standings-footer">View the full championship <ArrowRight size={14}/></Link>
        </article>
      </div>
    </section>

    <section className="round3-spec-section" aria-labelledby="round3-spec-title"><div className="wrap">
      <div className="round3-section-heading"><div><span className="round3-kicker">DAYTONA KART CENTER ESSEN · BAHN 2</span><h2 id="round3-spec-title">The event at a glance.</h2></div><span className="round3-text-link">Circuit details pending</span></div>
      <div className="round3-spec-grid">
        <article className="round3-spec-card"><span className="round3-spec-icon"><CalendarDays/></span><strong><CountUp value={21}/> <small>OCT</small></strong><span>RACE DATE · 2026</span><div className="round3-spec-underline"/></article>
        <article className="round3-spec-card"><span className="round3-spec-icon"><MapPin/></span><strong>ESSEN</strong><span>VENUE</span><div className="round3-spec-underline"/></article>
        <article className="round3-spec-card"><span className="round3-spec-icon"><Route/></span><strong>BAHN 2</strong><span>CIRCUIT</span><div className="round3-spec-underline"/></article>
        <article className="round3-spec-card"><span className="round3-spec-icon"><Flag/></span><strong>03</strong><span>CHAMPIONSHIP ROUND</span><div className="round3-spec-underline"/></article>
      </div>
      <div className="round3-spec-note"><span><Check size={13}/> Official event venue confirmed</span><span><Check size={13}/> Bahn 2 confirmed</span><span className="round3-source-line">Circuit specifications will be published when confirmed.</span></div>
    </div></section>

    <section className="round3-section-block wrap" id="schedule">
      <div className="round3-section-heading"><div><span className="round3-kicker">ROUND 03 · EVENT PROGRAMME</span><h2>Race weekend schedule.</h2></div><span className="round3-announcement"><CalendarDays size={14}/> Session timings to follow</span></div>
      <div className="round3-schedule-grid">{weekend.map((item, index) => { const Icon = item.icon; return <article className="round3-schedule-card" id={item.anchor} key={item.label}><div className="round3-schedule-top"><span>{item.label}</span><b>0{index + 1}</b></div><span className="round3-schedule-icon"><Icon/></span><h3>{item.title}</h3><p>{item.copy}</p><div className="round3-schedule-bottom"><span className="round3-time-pending">Session time to follow</span>{item.anchor === "racehub" ? <a href="#racehub" aria-label="Open Round 3 RaceHub"><ArrowUpRight size={15}/></a> : <span className="round3-session-line"/>}</div></article>; })}</div>
    </section>

    <section className="round3-track-section" id="circuit"><div className="wrap round3-track-layout">
      <div className="round3-track-copy"><span className="round3-kicker">THE CIRCUIT</span><h2>Daytona Essen.<br/><span>Bahn 2.</span></h2><p>Round 3 takes place at Daytona Kart Center Essen on Bahn 2. Official circuit specifications and the track map will be added when the venue details are published.</p><div className="round3-track-location"><MapPin size={17}/><span><b>Daytona Kart Center Essen</b><small>Bahn 2 · Essen, Germany</small></span></div></div>
      <div className="round3-map-card" id="track-map"><div className="round3-map-card-head"><div><span className="round3-kicker">OFFICIAL LAYOUT</span><b>Daytona Kart Center · Bahn 2</b></div><Map size={16}/></div><div className="round3-layout-placeholder round3-layout-large"><Route size={31}/><b>Track map to follow</b><span>The official Bahn 2 layout will be published here.</span></div><div className="round3-map-card-foot"><span><Map size={13}/> Essen · Germany</span><span>Layout awaiting confirmation</span></div></div>
    </div></section>

    <section className="round3-section-block wrap round3-assets-section" id="media">
      <div className="round3-section-heading"><div><span className="round3-kicker">FOLLOW EVERY MOMENT</span><h2>Event coverage.</h2></div><span className="round3-assets-note">Official event material will appear here.</span></div>
      <div className="round3-assets-grid">
        <article className="round3-gallery-card"><div className="round3-gallery-art"><div className="round3-gallery-frame frame-one"><Camera/></div><div className="round3-gallery-frame frame-two"><Image/></div><div className="round3-gallery-frame frame-three"><Play/></div><span className="round3-gallery-number">03</span><span className="round3-gallery-glow"/></div><div className="round3-gallery-copy"><span className="round3-kicker">PHOTOS · VIDEO · ONBOARD</span><h3>Round 3 at Daytona.</h3><p>Event photography and onboard footage will be added after race day.</p><Link href="/media" className="round3-asset-link">Explore RKS Media <ArrowRight size={14}/></Link></div></article>
        <article className="round3-download-card" id="downloads"><div className="round3-download-head"><div><span className="round3-kicker">OFFICIAL DOCUMENTS</span><h3>Downloads.</h3></div><Download size={20}/></div><p>Session documents and official results will be added when released.</p><div className="round3-download-list"><div><span className="round3-download-file"><Gauge/></span><span><b>Qualifying classification</b><small>Official session result</small></span><span className="round3-locked"><LockKeyhole size={12}/> Awaiting event</span></div><div><span className="round3-download-file"><Trophy/></span><span><b>Race classification</b><small>Final results & points</small></span><span className="round3-locked"><LockKeyhole size={12}/> Awaiting event</span></div><div><span className="round3-download-file"><Image/></span><span><b>Event media pack</b><small>Photos & highlights</small></span><span className="round3-locked"><LockKeyhole size={12}/> Awaiting event</span></div></div><a href="#racehub" className="round3-download-footer">Official results will feature in RaceHub <ArrowRight size={14}/></a></article>
      </div>
    </section>
    <section className="round3-section-block wrap" id="racehub"><div className="round3-section-heading"><div><span className="round3-kicker">AFTER THE FLAG</span><h2>Round 3 RaceHub.</h2></div><span className="round3-announcement"><Timer size={14}/> Opens after the event</span></div><div className="round3-racehub-placeholder"><div><Play/><span><b>RaceHub activates after Round 3</b><small>Replay, gap evolution, results and driver ratings will appear here after the race.</small></span></div><Link href="/racehub">Explore the latest RaceHub <ArrowRight size={14}/></Link></div></section>
  </main>;
}
