"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Map } from "lucide-react";
import { round3Event } from "@/lib/rks-data";
import { useLiveRound3 } from "@/lib/use-live-round3";
import { useLiveDrivers } from "@/lib/use-live-drivers";
import { RksCountdown } from "@/components/rks-countdown";

function RoundDate({ date }: { date: string }) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(date));
}

function RoundTime({ date }: { date: string }) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(new Date(date));
}

export function Round3EventPage() {
  const event = useLiveRound3();
  const standings = useLiveDrivers(2026);
  const podium = standings.slice(0, 3);
  const date = event.date ?? round3Event.date;
  return <div className="round3-page">
    <section className="round3-premium-hero" aria-labelledby="round3-event-name">
      <div className="round3-hero-visual" aria-hidden="true"><span className="round3-visual-orbit orbit-one"/><span className="round3-visual-orbit orbit-two"/><span className="round3-visual-cut"/><span className="round3-visual-label">ESSEN<br/>2026</span></div>
      <div className="round3-hero-shade"/>
      <div className="wrap round3-hero-content">
        <div className="round3-hero-eyebrow"><span className="round3-red-mark"/> RKS 2026 <i/> ROUND 03 <i/> ESSEN</div>
        <div className="round3-hero-main">
          <div className="round3-hero-copyblock">
            <div className="round3-hero-status"><span className="round3-status-dot"/> EVENT STATUS <b>UPCOMING</b></div>
            <h1 id="round3-event-name">Daytona Essen<br/><span>Bahn 2 · HOT 25</span></h1>
            {date&&<p className="round3-event-datetime"><RoundDate date={date}/> · <RoundTime date={date}/></p>}
            <p className="round3-hero-copy">Round 03 of the 2026 championship at Daytona Kart Center Essen.</p>
            <div className="round3-hero-actions"><a className="round3-action-primary" href="#circuit">Track information <ArrowRight size={15}/></a></div>
          </div>
          <aside className="round3-hero-countdown-panel" aria-label="Countdown to Round 3">
            <span>EVENT STARTS IN</span>
            <RksCountdown date={date} className="round3-countdown"/>
            {date&&<small>{new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(new Date(date))}</small>}
          </aside>
        </div>
      </div>
      <div className="round3-hero-number" aria-hidden="true">03</div>
    </section>

    <section className="round3-section-block wrap round3-context-section" id="championship">
      <div className="round3-section-heading"><div><span className="round3-kicker">CHAMPIONSHIP BEFORE ROUND 03</span><h2>Title battle</h2></div><Link className="round3-text-link" href="/championship">View championship <ArrowUpRight size={14}/></Link></div>
      <div className="round3-title-battle-list">{podium.map((driver) => <Link href={`/drivers/${driver.slug}`} className="round3-title-battle-row" key={driver.slug}><span>P{driver.position}</span><b>{driver.name}</b><strong>{driver.points}<small>PTS</small></strong></Link>)}</div>
      {podium.length > 1&&<p className="round3-title-gap">{podium[0]!.points-podium[1]!.points} PTS BETWEEN P1 AND P2</p>}
      {event.previousWinner&&<div className="round3-previous-winner-compact"><span>PREVIOUS WINNER</span><strong>{event.previousWinner}</strong></div>}
    </section>

    <section className="round3-track-section" id="circuit"><div className="wrap round3-track-summary">
      <div><span className="round3-kicker">TRACK INFORMATION</span><h2>Daytona Kart Center Essen</h2><p>Bahn 2 · Essen, Germany</p></div>
      <div className="round3-map-note" id="track-map"><Map size={16}/><span><b>TRACK MAP</b><small>Official map not currently available.</small></span></div>
    </div></section>

  </div>;
}
