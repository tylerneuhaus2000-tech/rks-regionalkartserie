"use client";

import Link from "next/link";
import { ArrowRight, Flag } from "lucide-react";
import { ChampionshipProgression } from "@/components/championship-progression";
import { PageHero, SectionHead, StatCard } from "@/components/rks-ui";
import { season2026 } from "@/data/2026/season";
import { driverById, getStandings2026, pointsForResult } from "@/data/2026/selectors";

export function RaceCenterPage() {
  const standings = getStandings2026();
  const completed = season2026.events.filter((event) => event.status === "complete");
  const podiums = standings.reduce((sum, driver) => sum + driver.podiums, 0);
  const wins = standings.reduce((sum, driver) => sum + driver.wins, 0);
  const poles = standings.reduce((sum, driver) => sum + driver.poles, 0);
  const fastestLaps = standings.reduce((sum, driver) => sum + driver.fastestLaps, 0);
  return <><PageHero kicker="Race Center · 2026" title="The season, in numbers." description="Championship progression and verified season records, built from the two completed RKS event classifications." action={<span className="event-status done">2 ROUNDS COMPLETE</span>}/>
    <section className="section"><div className="wrap"><div className="grid grid-4 archive-stat-grid"><StatCard label="Race wins" value={wins}/><StatCard label="Podium finishes" value={podiums}/><StatCard label="Pole positions" value={poles}/><StatCard label="Fastest laps" value={fastestLaps}/></div>
      <div className="race-center-grid"><ChampionshipProgression compact/><aside className="panel race-center-story"><span className="eyebrow">CURRENT TITLE FIGHT</span><h2>Two points<br/>separate the top two.</h2><div className="race-center-title-pair"><Link href="/drivers/tyler">Tyler <b>45</b></Link><Link href="/drivers/jonah">Jonah <b>43</b></Link></div><p>Round 2 moved the gap from eight points to two. Two rounds remain.</p><Link className="link-arrow" href="/championship">Full standings <ArrowRight size={13}/></Link></aside></div>
      <SectionHead eyebrow="Round 02 · HOT 30" title="The closest finish so far"/><Link href="/racehub/round-2" className="closest-finish-card"><div><span className="eyebrow">JONAH OVER TYLER · DAYTONA ESSEN · BAHN 1</span><strong>0.25 <i>SECONDS</i></strong><p>Jonah won the race. Tyler set the fastest lap of 53.940 on lap 21.</p></div><span className="closest-finish-action">Explore RaceHub <ArrowRight size={14}/></span></Link>
      <SectionHead eyebrow="Recent event results" title="From the timing sheet"/><div className="grid grid-2 recent-event-grid">{completed.slice().reverse().map((event) => { const winner = driverById(event.raceWinnerId!)!; const pole = driverById(event.qualifying[0]!)!; const fastest = driverById(event.fastestLap!.driverId)!; const points = event.results.reduce((sum, result) => sum + pointsForResult(result.position, event.fastestLap?.driverId === result.driverId), 0); return <Link className="card recent-event-card" key={event.id} href={`/calendar/round-${event.round}`}><span className="eyebrow">ROUND {String(event.round).padStart(2, "0")} · {event.format}</span><h3>{event.round === 2 ? "Daytona Essen · Bahn 1 Indoor" : "Daytona Essen · Bahn 2 In & Outdoor"}</h3><div className="recent-event-facts"><span><small>WINNER</small><b>{winner.name}</b></span><span><small>POLE</small><b>{pole.name}</b></span><span><small>FASTEST</small><b>{fastest.name}</b></span></div><span className="recent-event-footer">{event.results.length} classified · {points} points awarded <ArrowRight size={13}/></span></Link>; })}</div>
      <SectionHead eyebrow="Form guide" title="Latest classified results"/><div className="card form-guide">{standings.slice(0, 8).map((driver) => <div className="form-guide-row" key={driver.id}><span className="pos">P{driver.position}</span><Link href={`/drivers/${driver.slug}`}>{driver.name}</Link><div>{completed.slice().reverse().map((event) => { const result = event.results.find((item) => item.driverId === driver.id); return <span className={result ? result.position <= 3 ? "form-result podium" : "form-result" : "form-result no-start"} key={event.id}>{result ? `P${result.position}` : "—"}</span>; })}</div><strong>{driver.points}<small>PTS</small></strong></div>)}</div>
      <SectionHead eyebrow="Upcoming" title="The fight moves to Essen"/><Link className="upcoming-race-strip" href="/calendar/round-3"><span className="upcoming-round"><small>ROUND</small>03</span><span><strong>Daytona Kart Center Essen · Bahn 2</strong><small>21 October 2026 · 17:00 · HOT 25</small></span><Flag size={18}/><ArrowRight size={14}/></Link>
    </div></section></>;
}
