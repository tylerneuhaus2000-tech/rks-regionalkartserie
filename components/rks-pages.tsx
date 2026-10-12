"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Award, ChevronRight, Flag, Medal, Search, Trophy, Users, Zap } from "lucide-react";
import { season2026 } from "@/data/2026/season";
import { driverById, driverBySlug, getStandings2026, headToHead2026, latestCompletedEvent2026, pointsForResult, tierForRating, formatLapTime } from "@/data/2026/selectors";
import { QualifyingClassification, RaceClassification } from "@/components/season-result-tables";
import { getDriver, round3Event } from "@/lib/rks-data";
import { useLiveDrivers } from "@/lib/use-live-drivers";
import { useSeason } from "@/lib/season-context";
import { PageHero, SectionHead, StatCard } from "@/components/rks-ui";

function RouteLoading({ label }: { label: string }) {
  return <section className="section"><div className="wrap"><div className="route-loading" role="status" aria-live="polite"><span className="route-loading-mark"/><span><b>Loading {label}</b><small>Preparing the latest RKS information</small></span></div></div></section>;
}

const RaceCenterPage = dynamic(() => import("@/components/rks-race-center").then((module) => module.RaceCenterPage), { loading: () => <RouteLoading label="Race Center"/> });
const AdminPanel = dynamic(() => import("@/components/rks-admin").then((module) => module.AdminPanel), { loading: () => <RouteLoading label="administration"/> });
const Round3Showcase = dynamic(() => import("@/components/round3-showcase").then((module) => module.Round3Showcase), { loading: () => <section className="round3-section"><div className="wrap"><div className="round3-loading" aria-hidden="true"/></div></section> });
const Round3EventPage = dynamic(() => import("@/components/round3-showcase").then((module) => module.Round3EventPage), { loading: () => <RouteLoading label="Round 3"/> });
const ChampionshipProgressionChart = dynamic(() => import("@/components/championship-progression").then((module) => module.ChampionshipProgression), { loading: () => <div className="panel chart-loading" role="status">Loading championship progression…</div> });

const eventByRound = (round: number) => season2026.events.find((event) => event.round === round);
const byRoundResult = (round: number, driverId: string) => eventByRound(round)?.results.find((result) => result.driverId === driverId);
const dateLabel = (date: string) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(date));
const ratingLeaders = [...season2026.drivers].sort((a, b) => b.rating - a.rating).slice(0, 3);

function StandingsTable({ compact = false }: { compact?: boolean }) {
  const entries = useLiveDrivers();
  const statsRows = getStandings2026();
  return <div className={`card table-card table-scroll ${compact ? "standings-compact" : "standings-full"}`}>
    <table className="standings archive-standings">
      <thead><tr><th>Pos</th><th>Driver</th><th className="hide-mobile">Last race</th><th>Points</th><th>Gap</th>{!compact&&<><th className="hide-tablet">Starts</th><th className="hide-tablet">Wins</th><th className="hide-tablet">Podiums</th><th className="hide-tablet">Poles</th><th className="hide-tablet">Fastest</th><th className="hide-mobile">Avg. finish</th></>}</tr></thead>
      <tbody>{entries.map((entry) => {
        const stats = statsRows.find((row) => row.slug === entry.slug)!;
        return <tr key={stats.id} className={stats.position === 1 ? "leader" : ""}>
          <td className="pos">P{stats.position}</td>
          <td><Link className="driver-name" href={`/drivers/${stats.slug}`}>{stats.name}</Link>{stats.position === 1&&<span className="badge red standings-leader-tag">Leader</span>}</td>
          <td className="hide-mobile">{stats.lastRaceFinish ? `P${stats.lastRaceFinish}` : "—"}</td>
          <td className="points-cell">{stats.points}<span className="points-track"><i style={{ width: `${Math.max(3, stats.points / Math.max(entries[0]?.points ?? 1, 1) * 100)}%` }}/></span></td>
          <td>{stats.gapToLeader === 0 ? "—" : `−${stats.gapToLeader}`}</td>
          {!compact&&<><td className="hide-tablet">{stats.starts}</td><td className="hide-tablet">{stats.wins}</td><td className="hide-tablet">{stats.podiums}</td><td className="hide-tablet">{stats.poles}</td><td className="hide-tablet">{stats.fastestLaps}</td><td className="hide-mobile">{stats.averageFinish?.toFixed(1) ?? "—"}</td></>}
        </tr>;
      })}</tbody>
    </table>
    <p className="table-note">Drivers tied on points share a championship position. No tie-break is applied.</p>
  </div>;
}

function TitleFight() {
  const standings = getStandings2026();
  const leader = standings[0]!;
  const challenger = standings[1]!;
  const complete = season2026.events.filter((event) => event.status === "complete").length;
  const remaining = season2026.events.length - complete;
  const gap = Math.abs(challenger.points - leader.points);
  return <div className="title-fight-card"><div><span className="eyebrow">TITLE FIGHT · AFTER ROUND {complete}</span><strong>{gap === 0 ? "Level on points." : `${gap} point${Math.abs(gap) === 1 ? "" : "s"}`}<br/>{gap === 0 ? "between the leaders." : "between them."}</strong><p>{complete} rounds complete · {remaining} still to come</p></div><div className="title-fight-drivers"><div><small>P{leader.position} · CHAMPIONSHIP LEADER</small><b>{leader.name}</b><strong>{leader.points} <i>PTS</i></strong></div><span className="title-fight-gap">{Math.abs(gap)}<small>PTS</small></span><div><small>P{challenger.position} · IN PURSUIT</small><b>{challenger.name}</b><strong>{challenger.points} <i>PTS</i></strong></div></div></div>;
}

function LatestRaceStory() {
  const event = latestCompletedEvent2026;
  const winner = driverById(event.raceWinnerId!)!;
  const runnerUpResult = event.results.find((result) => result.position === 2)!;
  const runnerUp = driverById(runnerUpResult.driverId)!;
  const margin = (runnerUpResult.officialTotalTimeMs - event.results[0]!.officialTotalTimeMs) / 1000;
  const fastest = driverById(event.fastestLap!.driverId)!;
  const pole = driverById(event.qualifying[0]!)!;
  const fastestLap = formatLapTime(event.fastestLap!.timeMs);
  return <Link href={`/racehub/round-${event.round}`} className="race-story-feature"><div><span className="eyebrow">ROUND {String(event.round).padStart(2, "0")} · {event.format} · {season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name.toUpperCase()}</span><h3>{winner.name} takes the win.</h3><p>{runnerUp.name} finished second by {margin.toFixed(2)} seconds. {fastest.name} set the fastest lap ({fastestLap}); {pole.name} started from pole.</p><span className="race-story-margin">{margin.toFixed(2)} <i>SECONDS</i></span></div><span className="race-story-cta">Open Round {event.round} RaceHub <ArrowRight size={14}/></span></Link>;
}

function HomePage() {
  const { season } = useSeason();
  const shortcuts = [
    { Icon: Trophy, title: "Championship", desc: "Every point in the title fight.", href: "/championship" },
    { Icon: Users, title: "Drivers", desc: "The 15 names on the 2026 grid.", href: "/drivers" },
    { Icon: Flag, title: "RaceHub", desc: "The official story after the flag.", href: "/racehub/round-2" },
    { Icon: Zap, title: "Statistics", desc: "Records and derived season numbers.", href: "/statistics" },
  ];
  return <>
    <section className="hero"><div className="hero-bg"/><div className="wrap hero-content"><span className="hero-season">Official series · Season {season}</span><div className="hero-kicker">RKS PRESENTS · INAUGURAL SEASON</div><h1 className="display">REGIONAL<br/><span>KARTSERIE</span></h1><p className="hero-sub">Eine Meisterschaft. {season2026.drivers.length} Fahrer. Jeder Punkt zählt. Willkommen zur ersten Saison der Regionalkartserie.</p><div className="hero-actions"><Link href="/championship" className="btn btn-primary">Follow the championship <ArrowRight size={14}/></Link><Link href="/calendar/round-3" className="btn">Round 03 · Essen <Flag size={14}/></Link></div><div className="hero-strip"><div className="hero-strip-item"><span>Championship leader</span><strong>{getStandings2026()[0]!.name}</strong><em>{getStandings2026()[0]!.points} points · P{getStandings2026()[0]!.position}</em></div><div className="hero-strip-item"><span>In pursuit</span><strong>{getStandings2026()[1]!.name}</strong><em>{getStandings2026()[1]!.points} points · {getStandings2026()[0]!.points - getStandings2026()[1]!.points} behind</em></div><div className="hero-strip-item"><span>Next round</span><strong>03 · Essen</strong><em>Daytona Kart Center · Bahn 2</em></div><div className="hero-strip-item"><span>Race weekend</span><strong>21 October · 17:00</strong><em>HOT 25 · 2 rounds remain</em></div></div></div></section>
    <Round3Showcase/>
    <section className="section home-championship"><div className="wrap"><TitleFight/><SectionHead eyebrow="2026 drivers championship" title="Latest standings"><Link className="link-arrow" href="/championship">Full standings <ArrowRight size={13}/></Link></SectionHead><StandingsTable compact/><div className="grid grid-3 rating-leader-strip">{ratingLeaders.map((driver, index)=><Link className="card rating-leader-card" key={driver.id} href={`/drivers/${driver.slug}`}><span className="eyebrow">RKS DRIVER RATING · {index === 0 ? "LEADER" : `P${index + 1}`}</span><strong>{driver.name}</strong><span className="rating-value">{driver.rating}<i>{tierForRating(driver.rating)}</i></span></Link>)}</div></div></section>
    <section className="section home-race-story"><div className="wrap"><SectionHead eyebrow={`Round ${String(latestCompletedEvent2026.round).padStart(2, "0")} · ${dateLabel(latestCompletedEvent2026.date!)}`} title="A quarter of a second."/><LatestRaceStory/></div></section>
    <section className="section"><div className="wrap"><SectionHead eyebrow="Explore RKS" title="The championship, at full speed"/><div className="grid grid-4">{shortcuts.map(({Icon,title,desc,href})=><Link href={href} key={title} className="card feature-card"><div className="feature-icon"><Icon size={20}/></div><div><h3>{title}</h3><p>{desc}</p></div><ArrowUpRight size={16}/></Link>)}</div></div></section>
  </>;
}

function ChampionshipPage() {
  const [view, setView] = useState<"drivers" | "progression">("drivers");
  return <><PageHero kicker="Championship · 2026" title="Every point matters." description="Two rounds have set the title fight. Tyler leads Jonah by two points with two events remaining." action={<span className="badge red">IN PROGRESS · 2 OF 4 ROUNDS</span>}/>
    <section className="section"><div className="wrap"><TitleFight/><div className="row-between championship-controls"><div className="tabs" role="tablist" aria-label="Championship view"><button className={`tab ${view === "drivers" ? "active" : ""}`} role="tab" aria-selected={view === "drivers"} onClick={() => setView("drivers")}>Drivers standings</button><button className={`tab ${view === "progression" ? "active" : ""}`} role="tab" aria-selected={view === "progression"} onClick={() => setView("progression")}>Points progression</button></div><span className="eyebrow">2026 · Drivers Championship</span></div>
      {view === "drivers" ? <><div className="grid grid-4 archive-stat-grid"><StatCard label="Rounds complete" value="2" sub="4-round calendar"/><StatCard label="Points leader" value="Tyler" sub="45 points"/><StatCard label="Closest challenger" value="Jonah" sub="2 points back"/><StatCard label="Fastest laps" value={getStandings2026().reduce((sum, row) => sum + row.fastestLaps, 0)} sub="Across both rounds"/></div><StandingsTable/><p className="archive-source-note">Points are calculated from confirmed classifications and the 2026 fastest-lap bonus rule.</p></> : <ChampionshipProgressionChart/>}
      <div className="team-championship-note"><span className="eyebrow">TEAM CHAMPIONSHIP · 2026</span><strong>No official team championship is being contested this season.</strong><p>Team standings remain available for a future season once official teams and entries are confirmed.</p></div>
    </div></section></>;
}

function DriversPage() {
  const [query, setQuery] = useState("");
  const listed = getStandings2026().filter((driver) => driver.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <><PageHero kicker="Drivers · 2026" title="The grid." description="Championship position, verified results and the RKS Driver Rating for every driver on the inaugural-season standings." action={<label className="search driver-search"><Search size={14}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search drivers" aria-label="Search drivers"/></label>}/><section className="section"><div className="wrap"><SectionHead eyebrow={`${listed.length} drivers · no permanent numbers`} title="Driver line-up"/><div className="grid grid-3 driver-archive-grid">{listed.map((driver) => <Link href={`/drivers/${driver.slug}`} className="card driver-archive-card" key={driver.id}><span className="driver-card-position">P{driver.position}</span><span className="driver-card-mark" aria-hidden="true">{driver.name.split(/[ -]/).map((part) => part[0]).join("").slice(0, 2)}</span><span className="eyebrow">RKS DRIVER RATING · {driver.tier} TIER</span><h3>{driver.name}</h3><div className="driver-rating-band"><strong>{driver.rating}</strong><span>RATING</span><b>{driver.points}<small>PTS</small></b></div><div className="driver-achievement-line"><span>{driver.wins} wins</span><span>{driver.podiums} podiums</span><span>{driver.fastestLaps} fastest laps</span></div><span className="driver-card-link">Driver profile <ChevronRight size={14}/></span></Link>)}</div>{!listed.length&&<div className="empty-state filter-empty"><strong>No drivers match “{query}”</strong><p>Try another name.</p><button type="button" className="btn" onClick={() => setQuery("")}>Clear search</button></div>}<p className="archive-source-note">RKS Driver Rating is an internal series performance metric. No driver numbers, portraits or team assignments are used.</p></div></section></>;
}

function DriverProfile({ slug }: { slug: string }) {
  const driver = driverBySlug(slug);
  if (!driver) return <NotFoundPage/>;
  const stats = getStandings2026().find((row) => row.id === driver.id)!;
  const history = season2026.events.map((event) => {
    const result = event.results.find((item) => item.driverId === driver.id);
    const grid = event.qualifying.findIndex((id) => id === driver.id);
    return { event, result, grid: grid < 0 ? null : grid + 1 };
  });
  const earned = [stats.wins ? "Recorded race win" : null, stats.podiums ? `${stats.podiums} podium${stats.podiums > 1 ? "s" : ""}` : null, stats.poles ? "Pole position" : null, stats.fastestLaps ? "Fastest lap" : null].filter(Boolean);
  return <><section className="profile-hero profile-archive-hero"><div className="wrap profile-grid"><div><div className="eyebrow">RKS 2026 · DRIVER PROFILE</div><h1 className="profile-name">{driver.name}</h1><div className="profile-meta"><span className="badge red">P{stats.position} · {stats.points} POINTS</span><span className="badge">RKS RATING · {driver.rating} · TIER {tierForRating(driver.rating)}</span></div><p className="lede" style={{ marginTop: 20 }}>{stats.starts ? `${stats.starts} race starts recorded. ${stats.wins} wins and ${stats.podiums} podiums in the 2026 archive.` : "No completed race starts are recorded for this driver in the 2026 archive."}</p></div><div className="profile-rating-mark"><small>CHAMPIONSHIP POSITION</small><strong>P{stats.position}</strong><span>RKS DRIVER RATING</span><b>{driver.rating} · {tierForRating(driver.rating)}</b></div></div></section>
    <section className="section"><div className="wrap"><SectionHead eyebrow="Season 2026" title="The numbers behind the name"/><div className="grid grid-4 archive-stat-grid"><StatCard label="Starts" value={stats.starts}/><StatCard label="Wins" value={stats.wins}/><StatCard label="Podiums" value={stats.podiums}/><StatCard label="Poles" value={stats.poles}/><StatCard label="Fastest laps" value={stats.fastestLaps}/>{stats.bestFinish !== null&&<StatCard label="Best finish" value={`P${stats.bestFinish}`}/>}{stats.averageFinish !== null&&<StatCard label="Average finish" value={stats.averageFinish.toFixed(1)}/>}<StatCard label="Championship points" value={stats.points}/></div>
      <div className="split profile-detail-grid"><div className="panel"><SectionHead eyebrow="Official classifications" title="Race history"/><div className="driver-result-history">{history.map(({ event, result, grid }) => <article key={event.id} className="driver-result-card"><div><span className="eyebrow">ROUND {String(event.round).padStart(2, "0")} · {event.format ?? event.dateWindow ?? "EVENT"}</span><h3>{event.status === "complete" ? result ? `P${result.position} · ${driver.name}` : "No classification record" : "Upcoming"}</h3><p>{event.venue ?? "Venue to be confirmed"}{event.layoutId ? ` · ${season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name}` : ""}</p></div>{result ? <div className="driver-result-data"><span>{event.qualifyingCoverage === "partial" && grid == null ? "Grid —" : `Grid ${grid ? `P${grid}` : "—"}`}</span><b>{pointsForResult(result.position, event.fastestLap?.driverId === driver.id)} <small>PTS</small></b><span>{formatLapTime(result.bestLapMs)}</span><Link href={`/calendar/round-${event.round}`}>Event result <ArrowRight size={12}/></Link></div> : <div className="driver-result-data"><span>{event.date ? dateLabel(event.date) : event.dateWindow}</span><span>{event.status === "upcoming" ? "No result yet" : "No result in supplied classification"}</span><Link href={`/calendar/round-${event.round}`}>Event info <ArrowRight size={12}/></Link></div>}</article>)}</div></div>
        <div className="panel"><SectionHead eyebrow="Verified milestones" title="On the record"/>{earned.length ? earned.map((item) => <div className="versus-value" key={item}><b><Medal size={14}/></b><span>{item}</span></div>) : <p className="team-name">No wins, podiums, poles or fastest laps are recorded yet.</p>}<div className="rating-explainer"><span className="eyebrow">RKS DRIVER RATING</span><strong>{driver.rating} · Tier {tierForRating(driver.rating)}</strong><p>A series performance measure. It is not a racing licence or permanent driver number.</p></div><Link href="/head-to-head" className="link-arrow">Compare with another driver <ArrowRight size={13}/></Link></div></div>
    </div></section></>;
}

function TeamsPage() {
  return <><PageHero kicker="Teams" title="One grid. No team entries." description="The 2026 inaugural season is contested as an individual Drivers Championship. No official teams or team points are assigned."/><section className="section"><div className="wrap"><div className="team-championship-feature"><span className="eyebrow">2026 · DRIVERS CHAMPIONSHIP</span><strong>Every point is personal.</strong><p>The website is ready to support team standings when RKS confirms a team championship and its entry list for a future season.</p><Link className="btn btn-primary" href="/drivers">Explore the 2026 drivers <ArrowRight size={14}/></Link></div></div></section></>;
}

function CalendarPage({ eventSlug }: { eventSlug?: string }) {
  if (eventSlug === "round-3") return <Round3EventPage/>;
  if (eventSlug === "latest") return <CompletedRoundPage round={2}/>;
  const roundMatch = eventSlug?.match(/^round-(\d)$/);
  if (roundMatch) return <CompletedOrUpcomingRound round={Number(roundMatch[1])}/>;
  if (eventSlug) return <NotFoundPage/>;
  return <><PageHero kicker="Calendar · 2026" title="The season, round by round." description="Two completed races. Round 3 is next at Daytona Kart Center Essen. The finale falls during the NRW winter holidays."/><section className="section"><div className="wrap"><SectionHead eyebrow="Inaugural season · four rounds" title="Race calendar"/><div className="season-calendar-timeline">{season2026.events.map((event) => {
    const href = `/calendar/round-${event.round}`;
    const layout = event.layoutId ? season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name : null;
    return <article className={`season-calendar-event ${event.status}`} key={event.id}><div className="season-calendar-index"><span>ROUND</span><strong>{String(event.round).padStart(2, "0")}</strong></div><div className="season-calendar-details"><span className="eyebrow">{event.status === "complete" ? `${event.format} · COMPLETED` : event.status === "upcoming" ? "UPCOMING" : ""}</span><h3>{event.venue ?? "Venue to be announced"}</h3><p>{event.date ? dateLabel(event.date) : event.dateWindow}{event.round === 3 ? " · 17:00" : ""}{layout ? ` · ${layout}` : ""}</p></div><Link href={href} className="season-calendar-link">{event.status === "complete" ? "Results" : "Event info"}<ArrowRight size={14}/></Link></article>;
  })}</div></div></section></>;
}

function CompletedOrUpcomingRound({ round }: { round: number }) {
  const event = eventByRound(round);
  if (!event) return <NotFoundPage/>;
  if (event.status === "complete") return <CompletedRoundPage round={round}/>;
  if (round === 3) return <Round3EventPage/>;
  return <RoundFourPage/>;
}

function CompletedRoundPage({ round }: { round: number }) {
  const event = eventByRound(round);
  if (!event || event.status !== "complete") return <NotFoundPage/>;
  const winner = driverById(event.raceWinnerId!)!;
  const pole = driverById(event.qualifying[0]!)!;
  const fastest = driverById(event.fastestLap!.driverId)!;
  const runnerUp = event.results.find((result) => result.position === 2)!;
  const marginMs = runnerUp.officialTotalTimeMs - event.results[0]!.officialTotalTimeMs;
  const layout = season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"];
  return <><section className="event-archive-hero"><div className="wrap event-archive-grid"><div><div className="eyebrow">RKS 2026 · ROUND {String(round).padStart(2, "0")} · {event.format}</div><h1>{event.venue}<br/><span>{layout.name}</span></h1><p>{dateLabel(event.date!)} · Official race classification</p><div className="event-archive-actions"><a className="btn btn-primary" href="#results">Race results <ArrowRight size={14}/></a><Link className="btn" href={`/racehub/round-${round}`}>Open RaceHub <ArrowUpRight size={14}/></Link></div></div><div className="event-archive-visual" aria-hidden="true"><span>RKS</span><b>R{String(round).padStart(2, "0")}</b><i/></div><div className="event-archive-facts"><div><small>WINNER</small><strong>{winner.name}</strong></div><div><small>POLE</small><strong>{pole.name}</strong></div><div><small>FASTEST LAP</small><strong>{fastest.name} · {formatLapTime(event.fastestLap!.timeMs)}</strong></div><div><small>WINNING MARGIN</small><strong>{(marginMs / 1000).toFixed(2)} s</strong></div></div></div></section>
    <section className="section"><div className="wrap"><nav className="event-anchor-nav" aria-label="Event sections"><a href="#overview">Overview</a><a href="#qualifying">Qualifying</a><a href="#results">Race</a><Link href={`/racehub/round-${round}`}>RaceHub <ArrowRight size={12}/></Link></nav><div id="overview" className="grid grid-4 archive-stat-grid"><StatCard label="Round format" value={event.format!}/><StatCard label="Classified finishers" value={event.results.length}/><StatCard label="Laps at race leader" value={event.results[0]!.laps}/><StatCard label="Layout-specific best" value={formatLapTime(event.fastestLap!.timeMs)} sub={`${fastest.name} · ${layout.name.split(" · ")[0]}`}/></div><div className="event-classification-section" id="results"><SectionHead eyebrow={`${event.format} · Official classification`} title="Race results"/><RaceClassification round={round}/></div><div className="event-classification-section" id="qualifying"><SectionHead eyebrow="Starting order" title="Qualifying"/><QualifyingClassification round={round}/></div><div className="event-next-link"><Link className="link-arrow" href="/calendar">Back to the 2026 calendar <ArrowRight size={13}/></Link>{round === 2&&<Link className="btn btn-primary" href="/racehub/round-2">Explore every angle in RaceHub <ArrowRight size={14}/></Link>}</div></div></section></>;
}

function RoundFourPage() {
  return <><PageHero kicker="RKS 2026 · ROUND 04" title="Winterferien NRW 2026." description="The season finale is planned for the NRW winter holiday period. Exact date and venue are not yet confirmed." action={<span className="event-status">Upcoming</span>}/><section className="section"><div className="wrap"><div className="team-championship-feature"><span className="eyebrow">ROUND 04 · EVENT INFORMATION</span><strong>Season finale details will follow.</strong><p>The calendar window is confirmed as Winterferien NRW 2026. RKS will publish the date, venue and session format when they are confirmed.</p><Link href="/calendar" className="link-arrow">Back to the 2026 calendar <ArrowRight size={13}/></Link></div></div></section></>;
}

function RaceHubPage({ round = 2 }: { round?: number }) {
  const event = eventByRound(round);
  if (!event || event.status !== "complete") return <NotFoundPage/>;
  const standingsAfter = getStandings2026();
  const winner = driverById(event.raceWinnerId!)!;
  const pole = driverById(event.qualifying[0]!)!;
  const fastest = driverById(event.fastestLap!.driverId)!;
  const winnerResult = event.results.find((result) => result.position === 1)!;
  const secondResult = event.results.find((result) => result.position === 2)!;
  const margin = (secondResult.officialTotalTimeMs - winnerResult.officialTotalTimeMs) / 1000;
  const racePoints = (id: string) => event.results.reduce((sum, result) => sum + (result.driverId === id ? pointsForResult(result.position, event.fastestLap?.driverId === id) : 0), 0);
  const nextEvent = season2026.events.find((item) => item.round === 3)!;
  const eventConsistency = "consistency" in event ? event.consistency : undefined;
  const fastestMs = event.fastestLap!.timeMs;
  const fastestOrder = [...event.results].sort((a, b) => a.bestLapMs - b.bestLapMs);
  const cumulative = (id: string, throughRound: number) => season2026.events.filter((item) => item.status === "complete" && item.round <= throughRound).reduce((sum, item) => sum + item.results.reduce((eventSum, result) => eventSum + (result.driverId === id ? pointsForResult(result.position, item.fastestLap?.driverId === id) : 0), 0), 0);
  return <><section className="racehub-archive-hero"><div className="wrap racehub-archive-grid"><div><div className="eyebrow">RKS 2026 · RACEHUB · ROUND {String(round).padStart(2, "0")}</div><h1>{winner.name}<br/><span>takes the win.</span></h1><p>{event.format} · {event.venue} · {season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name}</p><div className="racehub-hero-margin">{margin.toFixed(2)}<small>SECONDS TO P2</small></div></div><div className="racehub-hero-mark" aria-hidden="true"><span>AFTER</span><strong>THE<br/>FLAG</strong><b>R{String(round).padStart(2, "0")}</b></div></div></section>
    <section className="section"><div className="wrap"><SectionHead eyebrow={`${event.format} · ${dateLabel(event.date!)}`} title="One race. Every confirmed angle."/><div className="grid grid-4 archive-stat-grid"><StatCard label="Winner" value={winner.name}/><StatCard label="Pole" value={pole.name}/><StatCard label="Fastest lap" value={fastest.name} sub={`${formatLapTime(fastestMs)} · ${event.fastestLap && "lap" in event.fastestLap ? `Lap ${event.fastestLap.lap}` : "official event best"}`}/><StatCard label="Winning margin" value={`${margin.toFixed(2)} s`} sub="Calculated from official totals"/></div>
      <div className="racehub-story-block"><span className="eyebrow">RACE REPORT · CONFIRMED FACTS</span><h2>{winner.name} won by {margin.toFixed(2)} seconds.</h2><p>{round === 2 ? `Tyler finished second and set the fastest lap, 53.940 on lap 21. Lennard F. started from pole and completed the podium in third.` : `The official classification lists ${winner.name} as the winner. ${fastest.name} recorded the fastest lap of ${formatLapTime(fastestMs)}.`}</p></div>
      <div className="racehub-sections"><section className="panel" id="classification"><SectionHead eyebrow="Final classification" title="Race results"/><RaceClassification round={round}/></section><section className="panel" id="qualifying"><SectionHead eyebrow="Starting order" title="Qualifying"/><QualifyingClassification round={round}/></section></div>
      <section className="event-classification-section"><SectionHead eyebrow="Same event · best lap" title="Pace comparison"/><div className="best-lap-comparison">{fastestOrder.map((result, index) => { const driver = driverById(result.driverId)!; const delta = result.bestLapMs - fastestMs; return <div className="best-lap-row" key={result.driverId}><span className="best-lap-position">{String(index + 1).padStart(2, "0")}</span><Link href={`/drivers/${driver.slug}`}>{driver.name}</Link><span className="best-lap-bar"><i style={{ width: `${Math.max(7, 100 - Math.min(90, delta / 70))}%` }}/></span><b>{formatLapTime(result.bestLapMs)}</b><small>{delta === 0 ? "SESSION BEST" : `+${(delta / 1000).toFixed(3)} s`}</small></div>; })}</div><p className="table-note">Best-lap comparisons are within this event and layout. Round 1 and Round 2 lap times are not compared with each other.</p></section>
      {round === 2&&<section className="event-classification-section"><SectionHead eyebrow="Recorded analysis · Round 2" title="Consistency"/><div className="grid grid-3 consistency-grid">{Object.entries(eventConsistency ?? {}).sort(([, a], [, b]) => b.score - a.score).map(([id, score]) => { const driver = driverById(id)!; return <article className="card consistency-card" key={id}><span className="eyebrow">RKS CONSISTENCY SCORE</span><strong>{driver.name}</strong><span className="consistency-score">{score.score}<small>/100</small></span><p>σ {score.sigma.toFixed(3)} · based on cleaned laps</p></article>; })}</div></section>}
      <div className="racehub-sections"><section className="panel"><SectionHead eyebrow="Championship impact" title="Points after the flag"/><div className="title-fight-compact"><div><small>TYLER · BEFORE R2</small><strong>{cumulative("DRV_TYLER", 1)} pts</strong><b>→ {cumulative("DRV_TYLER", 2)} pts</b></div><span>2 pt<br/>gap</span><div><small>JONAH · BEFORE R2</small><strong>{cumulative("DRV_JONAH", 1)} pts</strong><b>→ {cumulative("DRV_JONAH", 2)} pts</b></div></div><p>Jonah scored {racePoints("DRV_JONAH")} points and Tyler scored {racePoints("DRV_TYLER")} in Round 2, reducing the championship gap from {cumulative("DRV_TYLER", 1) - cumulative("DRV_JONAH", 1)} to {standingsAfter.find((driver) => driver.id === "DRV_TYLER")!.gapToLeader === 0 ? 0 : Math.abs(cumulative("DRV_TYLER", 2) - cumulative("DRV_JONAH", 2))} points.</p></section><section className="panel"><SectionHead eyebrow="RKS performance measure" title="Driver ratings"/><div className="rating-race-leaders">{ratingLeaders.map((driver) => <div className="versus-value" key={driver.id}><b>{driver.rating} · {tierForRating(driver.rating)}</b><span>{driver.name}</span></div>)}</div><p className="table-note">RKS Driver Rating is a series metric, not an official licence.</p></section></div>
      <div className="racehub-unavailable-row"><div><span className="eyebrow">RACE REPLAY · LAP POSITION</span><strong>Playback is not available for this archive.</strong><p>The supplied record has classifications and best laps, but no lap-by-lap times or positions. No replay, gap evolution or overtakes are inferred.</p></div><div><span className="eyebrow">RACE CONTROL · DOWNLOADS</span><strong>Source documents</strong><p>No official timing-sheet or result PDF file was included in the supplied archive.</p></div></div>
      <div className="event-next-link"><Link className="link-arrow" href={`/calendar/round-${round}`}>Back to Round {round} event <ArrowRight size={13}/></Link><Link className="btn btn-primary" href="/calendar/round-3">Next event · {dateLabel(nextEvent.date!)} <ArrowRight size={14}/></Link></div>
    </div></section></>;
}

function StatisticsPage() {
  const standings = getStandings2026();
  const completed = season2026.events.filter((event) => event.status === "complete");
  const totalWins = standings.reduce((sum, driver) => sum + driver.wins, 0);
  const totalPodiums = standings.reduce((sum, driver) => sum + driver.podiums, 0);
  const podiumLeaders = [...standings].sort((a, b) => b.podiums - a.podiums || a.position - b.position)[0]!;
  const winLeaders = [...standings].sort((a, b) => b.wins - a.wins || a.position - b.position)[0]!;
  const poleLeaders = [...standings].sort((a, b) => b.poles - a.poles || a.position - b.position)[0]!;
  const fastestLeaders = [...standings].sort((a, b) => b.fastestLaps - a.fastestLaps || a.position - b.position)[0]!;
  const tiedLeaderNames = (metric: "wins" | "podiums" | "poles" | "fastestLaps", value: number) => standings.filter((driver) => driver[metric] === value).map((driver) => driver.name).join(" · ");
  const winNames = tiedLeaderNames("wins", winLeaders.wins);
  const podiumNames = tiedLeaderNames("podiums", podiumLeaders.podiums);
  const poleNames = tiedLeaderNames("poles", poleLeaders.poles);
  const fastestNames = tiedLeaderNames("fastestLaps", fastestLeaders.fastestLaps);
  const closest = completed.flatMap((event) => event.results.slice(0, 2).map((result, index) => index === 0 ? null : { event, margin: result.officialTotalTimeMs - event.results[0]!.officialTotalTimeMs })).filter((item): item is { event: typeof completed[number]; margin: number } => item !== null).sort((a, b) => a.margin - b.margin)[0]!;
  const layoutRecords = completed.map((event) => ({ event }));
  const positionsGained = (() => {
    const event = eventByRound(2)!;
    return event.results.map((result) => ({ result, start: event.qualifying.findIndex((id) => id === result.driverId) + 1 })).filter((item) => item.start > 0).map(({ result, start }) => ({ driver: driverById(result.driverId)!, gained: start - result.position })).sort((a, b) => b.gained - a.gained)[0];
  })();
  return <><PageHero kicker="Statistics · 2026" title="Numbers with a story." description="Championship records calculated from the official R1 and R2 classifications. Pace records stay separate by circuit layout."/><section className="section"><div className="wrap"><SectionHead eyebrow="After two rounds" title="Championship records"/><div className="grid grid-4 archive-stat-grid"><StatCard label="Points awarded" value={standings.reduce((sum, driver) => sum + driver.points, 0)}/><StatCard label="Race wins" value={totalWins}/><StatCard label="Podium finishes" value={totalPodiums}/><StatCard label="Completed rounds" value={completed.length}/></div><div className="records-grid">{[["Most wins", winLeaders.wins, winNames], ["Most podiums", podiumLeaders.podiums, podiumNames], ["Most poles", poleLeaders.poles, poleNames], ["Most fastest laps", fastestLeaders.fastestLaps, fastestNames], ["Closest finish", `${(closest.margin / 1000).toFixed(2)} s`, `Round ${closest.event.round} · Jonah over Tyler`], ["Biggest confirmed win margin", `${((byRoundResult(1, "DRV_JONAH")!.officialTotalTimeMs - byRoundResult(1, "DRV_TYLER")!.officialTotalTimeMs) / 1000).toFixed(2)} s`, "Round 1 · Tyler over Jonah"], ["Largest grid gain", `+${positionsGained?.gained ?? 0}`, `${positionsGained?.driver.name ?? "—"} · Round 2`]].map(([label, value, sub]) => <article className="card record-card" key={label as string}><span className="eyebrow">{label}</span><strong>{value}</strong><small>{sub}</small></article>)}</div><SectionHead eyebrow="Layout-specific records" title="Best lap by layout"/><div className="grid grid-2">{layoutRecords.map(({ event }) => { const driver = driverById(event.fastestLap!.driverId)!; const layout = season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"]; return <article className="card layout-record-card" key={event.id}><span className="eyebrow">DAYTONA ESSEN · {layout.name.toUpperCase()}</span><strong>{formatLapTime(event.fastestLap!.timeMs)}</strong><div className="row-between"><b>{driver.name}</b><span>{dateLabel(event.date!)}</span></div></article>; })}</div><SectionHead eyebrow="Compare any two drivers" title="Head to head"><Link className="link-arrow" href="/head-to-head">Open driver comparison <ArrowRight size={13}/></Link></SectionHead><div className="card panel title-fight-compact"><div><small>CHAMPIONSHIP P1 · TYLER</small><strong>45 pts</strong></div><span>vs</span><div><small>CHAMPIONSHIP P2 · JONAH</small><strong>43 pts</strong></div></div><p className="archive-source-note">Average finish and points are derived from completed classifications. No laps-led, overtake, or fastest-race-pace records are shown because lap-by-lap position and lap sequences are not present.</p></div></section></>;
}

function HeadToHeadPage() {
  const [params, setParams] = useState({ a: "tyler", b: "jonah" });
  const driverA = driverBySlug(params.a) ?? season2026.drivers[0]!;
  const driverB = driverBySlug(params.b) ?? season2026.drivers[1]!;
  const comparison = headToHead2026(driverA.id, driverB.id);
  const stats = [
    ["Championship points", comparison.a.points, comparison.b.points],
    ["Championship position", `P${comparison.a.position}`, `P${comparison.b.position}`],
    ["Starts", comparison.a.starts, comparison.b.starts],
    ["Wins", comparison.a.wins, comparison.b.wins],
    ["Podiums", comparison.a.podiums, comparison.b.podiums],
    ["Poles", comparison.a.poles, comparison.b.poles],
    ["Fastest laps", comparison.a.fastestLaps, comparison.b.fastestLaps],
    ["Average finish", comparison.a.averageFinish?.toFixed(1) ?? "—", comparison.b.averageFinish?.toFixed(1) ?? "—"],
    ["Best finish", comparison.a.bestFinish ? `P${comparison.a.bestFinish}` : "—", comparison.b.bestFinish ? `P${comparison.b.bestFinish}` : "—"],
    ["RKS Driver Rating", comparison.a.rating, comparison.b.rating],
    ["Average qualifying", comparison.a.averageQualifying?.toFixed(1) ?? "—", comparison.b.averageQualifying?.toFixed(1) ?? "—"],
  ] as const;
  return <><PageHero kicker="Head to head · 2026" title="Two drivers. One comparison." description="Compare published season totals and every round in which both drivers took part."/><section className="section"><div className="wrap"><div className="side-by-side"><DriverSelect side="a" value={driverA.slug} other={driverB.slug} onChange={(value) => setParams((current) => ({ ...current, a: value }))}/><DriverSelect side="b" value={driverB.slug} other={driverA.slug} onChange={(value) => setParams((current) => ({ ...current, b: value }))}/></div><div className="head-to-head-score"><span>{driverA.name}</span><strong>{comparison.recordA} <i>—</i> {comparison.recordB}</strong><span>{driverB.name} · direct finish record</span></div><div className="card panel comparison-table">{stats.map(([label, a, b]) => <div className="comparison-row" key={label}><b>{a}</b><span>{label}</span><b>{b}</b></div>)}</div><SectionHead eyebrow="When both started" title="Race by race"/><div className="card panel">{comparison.races.map((race) => <div className="comparison-round" key={race.round}><span>ROUND {String(race.round).padStart(2, "0")}</span><b>P{race.positionA}</b><span>{race.winner === "tie" ? "Same classified position" : race.winner === "a" ? `${driverA.name} finished ahead` : `${driverB.name} finished ahead`}</span><b>P{race.positionB}</b></div>)}{!comparison.races.length&&<p className="team-name">These drivers do not share a completed race start in the published archive.</p>}</div><p className="archive-source-note">Average qualifying uses only recorded positions. No average pace is shown across different layouts.</p></div></section></>;
}

function DriverSelect({ side, value, other, onChange }: { side: "a" | "b"; value: string; other: string; onChange: (value: string) => void }) {
  const selected = driverBySlug(value)!;
  const stats = getStandings2026().find((driver) => driver.id === selected.id)!;
  return <div className="card versus-card"><div className="eyebrow">Driver {side === "a" ? "one" : "two"}</div><select aria-label={`Choose driver ${side === "a" ? "one" : "two"}`} className="search" value={value} onChange={(event) => onChange(event.target.value)}>{season2026.drivers.map((driver) => <option key={driver.id} value={driver.slug} disabled={driver.slug === other}>{driver.name}</option>)}</select><div className="versus-name">{selected.name}</div><p className="team-name">P{stats.position} · {stats.points} points · RKS rating {selected.rating}</p></div>;
}

function AchievementsPage() {
  const rows = getStandings2026();
  const achieved = [
    { name: "Race winner", detail: "Official classified race win", drivers: rows.filter((driver) => driver.wins > 0).map((driver) => driver.name) },
    { name: "Podium finisher", detail: "One or more top-three race finishes", drivers: rows.filter((driver) => driver.podiums > 0).map((driver) => `${driver.name} · ${driver.podiums}`) },
    { name: "Pole position", detail: "Top qualifying position in a confirmed session", drivers: rows.filter((driver) => driver.poles > 0).map((driver) => driver.name) },
    { name: "Fastest lap", detail: "Official event fastest lap", drivers: rows.filter((driver) => driver.fastestLaps > 0).map((driver) => `${driver.name} · ${driver.fastestLaps}`) },
    { name: "100 points", detail: "Championship milestone", drivers: rows.filter((driver) => driver.points >= 100).map((driver) => driver.name) },
    { name: "Champion", detail: "Awarded when the season title is confirmed", drivers: [] },
    { name: "Perfect weekend", detail: "Pole, win and fastest lap in the same event", drivers: [] },
    { name: "Grand Slam", detail: "Pole, win, fastest lap and every lap led", drivers: [] },
  ];
  return <><PageHero kicker="Achievements · 2026" title="Earned on track." description="Milestones reflect only confirmed RKS classifications and championship totals."/><section className="section"><div className="wrap"><div className="badge-grid achievement-grid">{achieved.map((item) => <article className={`card achievement ${item.drivers.length ? "is-earned" : "is-locked"}`} key={item.name}><div className="medal">{item.drivers.length ? <Medal size={16}/> : <Award size={16}/>}</div><h3>{item.name}</h3><p>{item.detail}</p>{item.drivers.length ? <strong>{item.drivers.join(" · ")}</strong> : <small>{item.name === "Champion" ? "Season still in progress" : item.name === "Grand Slam" ? "Position-by-lap data is not available" : "Not achieved in the confirmed archive"}</small>}</article>)}</div></div></section></>;
}

function MediaPage() {
  return <><PageHero kicker="Media" title="The RKS archive." description="Official photography, video and onboard footage will appear here when championship media is available."/><section className="section"><div className="wrap"><div className="media-empty-archive"><div className="media-empty-mark" aria-hidden="true"><span>RKS</span><i/><b>2026</b></div><div><span className="eyebrow">OFFICIAL MEDIA ARCHIVE</span><h2>No official race media has been published yet.</h2><p>There are no genuine RKS race photographs or videos in the supplied archive. The media library will fill with verified event material when it is released.</p><Link href="/racehub/round-2" className="link-arrow">Explore the Round 2 RaceHub <ArrowRight size={13}/></Link></div></div><div className="media-empty-categories"><span>PHOTOGRAPHS <b>—</b></span><span>VIDEO <b>—</b></span><span>ONBOARD <b>—</b></span><span>DOWNLOADS <b>—</b></span></div></div></section></>;
}

function RegulationsPage() {
  const [query, setQuery] = useState("");
  const topics = [
    { title: "2026 points system", text: "Race points are awarded from P1 to P10: 25, 18, 15, 12, 10, 8, 6, 4, 2 and 1. The official fastest lap adds one bonus point when its driver finishes in the top ten." },
    { title: "Classification", text: "The 2026 Drivers Championship uses the confirmed race classifications. Drivers tied on points are shown at the same championship position; no tie-break rule has been supplied." },
    { title: "Event format", text: "Round 1 was HOT 25 on Daytona Essen Bahn 2 · In & Outdoor. Round 2 was HOT 30 on Daytona Essen Bahn 1 · Indoor. Round 3 is scheduled as HOT 25 on Bahn 2." },
    { title: "Season calendar", text: "The 2026 inaugural season has four rounds. Round 4 is planned for Winterferien NRW 2026; exact date and venue are still unconfirmed." },
  ].filter((item) => `${item.title} ${item.text}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <><PageHero kicker="Regulations" title="The rules of the race." description="Confirmed 2026 sporting information, kept separate from future-season planning."/><section className="section"><div className="wrap"><div className="row-between regulations-toolbar"><label className="search regulation-search"><Search size={14}/><input aria-label="Search regulations" placeholder="Search confirmed rules" value={query} onChange={(event) => setQuery(event.target.value)}/></label><span className="badge">2026 · CONFIRMED INFORMATION</span></div><div className="reg-section"><nav className="reg-nav" aria-label="Regulation sections">{topics.map((topic, index) => <a href={`#reg-${index}`} key={topic.title}>{String(index + 1).padStart(2, "0")} &nbsp; {topic.title}</a>)}<a href="#future">2027 and later</a></nav><div className="reg-content">{topics.map((topic, index) => <article id={`reg-${index}`} key={topic.title} className="reg-article"><h2>{topic.title}</h2><p>{topic.text}</p>{topic.title === "2026 points system"&&<div className="points-scale">{season2026.pointsByPosition.map((points, index) => <div key={index}><span>P{index + 1}</span><b>{points}</b></div>)}</div>}</article>)}{!topics.length&&<div className="empty-state"><strong>No sections match “{query}”</strong><button type="button" className="btn" onClick={() => setQuery("")}>Clear search</button></div>}<article id="future" className="reg-article future-regulations"><span className="eyebrow">FUTURE SEASON · NOT OPERATIVE IN 2026</span><h2>2027 regulations</h2><p>Future sporting rules will be published separately once confirmed. No planned 2027 format has been applied to the inaugural 2026 season.</p></article><div className="reg-history"><span className="eyebrow">VERSION HISTORY</span><div><b>2026 · Inaugural season</b><span>Confirmed points and event format information</span></div><div><b>2027 · Drafting</b><span>Future season · no operative rules published</span></div></div></div></div></div></section></>;
}

function NotFoundPage() {
  return <PageHero kicker="RKS" title="No data on this lap." description="The page you are looking for is not in the 2026 championship archive." action={<Link className="btn btn-primary" href="/">Return home <ArrowRight size={14}/></Link>}/>;
}

function SeasonNotPublished({ year }: { year: number }) {
  return <section className="season-pending"><div className="wrap"><div className="eyebrow">RKS · SEASON {year}</div><h1>New season.<br/><span>Same grid.</span></h1><p>The {year} championship is not published yet. Its rules and event results remain separate from the 2026 inaugural season.</p><span className="badge">SEASON INFORMATION PENDING</span></div></section>;
}

export function RksPage({ segments = [] }: { segments?: string[] }) {
  const [section, ...rest] = segments;
  const { season } = useSeason();
  let page: React.ReactNode;
  let title = "RKS – Regionalkartserie";
  if (!section) { page = <HomePage/>; title = "Official championship home"; }
  else if (section === "championship") { page = <ChampionshipPage/>; title = "2026 championship standings"; }
  else if (section === "drivers" && !rest.length) { page = <DriversPage/>; title = "Meet the 2026 drivers"; }
  else if (section === "drivers" && rest[0]) { page = <DriverProfile slug={rest[0]}/>; title = `${getDriver(rest[0])?.name ?? "Driver"} · RKS 2026`; }
  else if (section === "teams") { page = <TeamsPage/>; title = "2026 · no team championship"; }
  else if (section === "calendar") { page = <CalendarPage eventSlug={rest[0]}/>; title = rest[0] === "round-3" ? "Round 3 · Daytona Kart Center Essen, Bahn 2" : rest[0] === "round-1" ? "Round 1 · HOT 25 results" : rest[0] === "round-2" || rest[0] === "latest" ? "Round 2 · HOT 30 results" : rest[0] === "round-4" ? "Round 4 · Winterferien NRW 2026" : "2026 race calendar"; }
  else if (section === "racehub") { const match = rest[0]?.match(/^round-(\d)$/); const round = match ? Number(match[1]) : 2; page = <RaceHubPage round={round}/>; title = `RaceHub · Round ${round}`; }
  else if (section === "race-center") { page = <RaceCenterPage/>; title = "Race Center · 2026 analytics"; }
  else if (section === "statistics") { page = <StatisticsPage/>; title = "2026 championship statistics"; }
  else if (section === "head-to-head") { page = <HeadToHeadPage/>; title = "Driver head to head · 2026"; }
  else if (section === "achievements") { page = <AchievementsPage/>; title = "2026 driver achievements"; }
  else if (section === "media") { page = <MediaPage/>; title = "RKS official media archive"; }
  else if (section === "regulations") { page = <RegulationsPage/>; title = "Confirmed 2026 sporting information"; }
  else if (section === "admin") { page = <AdminPanel/>; title = "RKS administration"; }
  else { page = <NotFoundPage/>; title = "Page not found"; }
  const isRound3 = section === "calendar" && rest[0] === "round-3" && season === 2026;
  const round3StructuredData = { "@context": "https://schema.org", "@type": "SportsEvent", name: "RKS 2026 · Round 3 · Daytona Kart Center Essen · Bahn 2", startDate: round3Event.date, eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", location: { "@type": "Place", name: "Daytona Kart Center Essen · Bahn 2", address: { "@type": "PostalAddress", addressLocality: "Essen", addressCountry: "DE" } }, url: "https://rks-regionalkartserie.tyler-nhs25.chatgpt.site/calendar/round-3" };
  return <><title>{title} | RKS</title>{isRound3&&<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(round3StructuredData).replace(/</g, "\\u003c") }}></script>}{season === 2026 || section === "admin" ? page : <SeasonNotPublished year={season}/>}</>;
}
