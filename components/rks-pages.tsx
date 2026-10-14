"use client";

import dynamic from "next/dynamic";
import Link from "@/components/site-link";
import { useState } from "react";
import { ArrowRight, Medal, Search } from "lucide-react";
import { season2026 } from "@/data/2026/season";
import { getDriverRating2026, getDriverRatingSnapshot2026 } from "@/data/2026/driver-ratings";
import { driverById, driverBySlug, driverLapHistory2026, eventLapPace2026, eventPerformanceSummary2026, getStandings2026, headToHead2026, headToHeadPointsDeltaByRound2026, lapPaceMetrics2026, latestCompletedEvent2026, pointsForResult, formatLapTime, statisticsSnapshot2026, titleStatus2026 } from "@/data/2026/selectors";
import { QualifyingClassification, RaceClassification } from "@/components/season-result-tables";
import { getDriver, round3Event } from "@/lib/rks-data";
import { useLiveDrivers } from "@/lib/use-live-drivers";
import { useSeason } from "@/lib/season-context";
import { PageHero, SectionHead, StatCard } from "@/components/rks-ui";
import { RksCountdown } from "@/components/rks-countdown";
import { DriverRatingCard } from "@/components/driver-rating-card";

function RouteLoading({ label }: { label: string }) {
  return <section className="section"><div className="wrap"><div className="route-loading" role="status" aria-live="polite"><span className="route-loading-mark"/><span><b>Loading {label}</b><small>Preparing the latest RKS information</small></span></div></div></section>;
}

const AdminPanel = dynamic(() => import("@/components/rks-admin").then((module) => module.AdminPanel), { loading: () => <RouteLoading label="administration"/> });
const Round3EventPage = dynamic(() => import("@/components/round3-showcase").then((module) => module.Round3EventPage), { loading: () => <RouteLoading label="Round 3"/> });
const ChampionshipProgressionChart = dynamic(() => import("@/components/championship-progression").then((module) => module.ChampionshipProgression), { ssr: false, loading: () => <div className="panel chart-loading" role="status">Loading championship progression…</div> });
const RaceLapAnalysis = dynamic(() => import("@/components/race-lap-analysis").then((module) => module.RaceLapAnalysis), { ssr: false, loading: () => <div className="panel chart-loading" role="status">Loading recorded lap analysis…</div> });

const eventByRound = (round: number) => season2026.events.find((event) => event.round === round);
const dateLabel = (date: string) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(date));

function StandingsTable({ compact = false }: { compact?: boolean }) {
  const entries = useLiveDrivers();
  const statsRows = getStandings2026();
  return <div className={`card table-card table-scroll ${compact ? "standings-compact" : "standings-full"}`}>
    <div className="standings-mobile-list">
      {entries.map((entry) => {
        const stats = statsRows.find((row) => row.slug === entry.slug)!;
        return <article className="standings-mobile-row" key={stats.id}>
          <span className="standings-mobile-position">P{stats.position}</span>
          <div><Link className="driver-name" href={`/drivers/${stats.slug}`}>{stats.name}</Link>{!compact&&<small>{stats.wins} WINS · {stats.podiums} PODIUMS · {stats.poles} POLES · {stats.fastestLaps} FASTEST</small>}</div>
          <strong>{stats.points}<small>PTS</small></strong>
          {!compact&&<span className="standings-mobile-gap">{stats.gapToLeader === 0 ? "Leader" : `−${stats.gapToLeader} pts`}</span>}
        </article>;
      })}
    </div>
    <table className="standings archive-standings">
      <thead><tr><th>Pos</th><th>Driver</th><th>Points</th><th>Gap</th>{!compact&&<><th>Wins</th><th>Podiums</th><th>Poles</th><th>Fastest laps</th></>}</tr></thead>
      <tbody>{entries.map((entry) => {
        const stats = statsRows.find((row) => row.slug === entry.slug)!;
        return <tr key={stats.id} className={stats.position === 1 ? "leader" : ""}>
          <td className="pos">P{stats.position}</td>
          <td><Link className="driver-name" href={`/drivers/${stats.slug}`}>{stats.name}</Link>{stats.position === 1&&<span className="badge red standings-leader-tag">Leader</span>}</td>
          <td className="points-cell">{stats.points}</td>
          <td>{stats.gapToLeader === 0 ? "—" : `−${stats.gapToLeader}`}</td>
          {!compact&&<><td>{stats.wins}</td><td>{stats.podiums}</td><td>{stats.poles}</td><td>{stats.fastestLaps}</td></>}
        </tr>;
      })}</tbody>
    </table>
    {!compact&&<p className="table-note">Tied points share a championship position. No tie-break is applied.</p>}
  </div>;
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
  const third = event.results.find((result) => result.position === 3)!;
  const thirdDriver = driverById(third.driverId)!;
  return <div className="race-story-feature"><div><span className="eyebrow">ROUND {String(event.round).padStart(2, "0")} · {event.format} · {season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name.toUpperCase()}</span><h3>{winner.name} takes the win.</h3><div className="latest-result-podium"><span><small>WINNER</small><b>{winner.name}</b></span><span><small>SECOND</small><b>{runnerUp.name} <i>+{margin.toFixed(2)} s</i></b></span><span><small>THIRD</small><b>{thirdDriver.name}</b></span></div><p>{fastest.name} set the fastest lap ({fastestLap}); {pole.name} started from pole.</p></div><Link href={`/races/2026/round-${event.round}`} className="race-story-cta">View Round {event.round} <ArrowRight size={14}/></Link></div>;
}

function HomePage() {
  const { season } = useSeason();
  const standings = getStandings2026();
  const topThree = standings.slice(0, 3);
  const nextEvent = season2026.events.find((event) => event.status === "upcoming")!;
  const nextLayout = nextEvent.courseName ?? (nextEvent.layoutId ? season2026.layouts[nextEvent.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name : null);
  const nextDateTime = new Date(nextEvent.date!);
  const nextDateLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "Europe/Berlin" }).format(nextDateTime);
  const nextTimeLabel = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(nextDateTime);
  const gap = standings[0]!.points - standings[1]!.points;
  return <>
    <section className="hero home-hero"><div className="hero-bg"/><div className="home-hero-content wrap"><div className="home-hero-identity"><span className="hero-season">Official series · Season {season}</span><div className="hero-kicker">RKS · REGIONALKARTSERIE</div><h1 className="display">REGIONAL<br/><span>KARTSERIE</span></h1></div><aside className="home-next-event"><span className="eyebrow">NEXT RACE · ROUND {String(nextEvent.round).padStart(2, "0")}</span><strong>{nextDateLabel} · {nextTimeLabel}</strong><p>{nextEvent.venue} · {nextLayout}</p><RksCountdown date={nextEvent.date} className="home-race-countdown"/><Link href={`/races/2026/round-${nextEvent.round}`} className="btn btn-primary">View Round {String(nextEvent.round).padStart(2, "0")} <ArrowRight size={14}/></Link></aside></div></section>
    <section className="section home-championship"><div className="wrap"><SectionHead eyebrow="2026 Drivers’ Championship" title="Championship battle"><Link className="link-arrow" href="/championship">Full standings <ArrowRight size={13}/></Link></SectionHead><div className="home-top-three">{topThree.map((driver) => <Link href={`/drivers/${driver.slug}`} className={`home-driver-rank rank-${driver.position}`} key={driver.id}><span>P{driver.position}</span><strong>{driver.name}</strong><b>{driver.points}<small>PTS</small></b></Link>)}</div><p className="home-gap-callout">{gap} POINTS BETWEEN P1 AND P2</p></div></section>
    <section className="section home-race-story"><div className="wrap"><SectionHead eyebrow={`Latest race · Round ${String(latestCompletedEvent2026.round).padStart(2, "0")} · ${latestCompletedEvent2026.format}`} title="Latest result"/><LatestRaceStory/></div></section>
    <section className="section home-calendar-section"><div className="wrap"><SectionHead eyebrow="2026 · four rounds" title="Race calendar"><Link className="link-arrow" href="/races">All races <ArrowRight size={13}/></Link></SectionHead><div className="home-calendar-list">{season2026.events.map((event) => <Link href={`/races/2026/round-${event.round}`} key={event.id}><span>R{String(event.round).padStart(2, "0")}</span><b>{event.round === 4 ? event.dateWindow : dateLabel(event.date!)}</b><small>{event.status === "complete" ? "COMPLETED" : "UPCOMING"}</small></Link>)}</div></div></section>
  </>;
}

function ChampionshipPage() {
  const [view, setView] = useState<"drivers" | "progression">("drivers");
  const titleDelta = headToHeadPointsDeltaByRound2026("DRV_TYLER", "DRV_JONAH");
  const netTitleDelta = titleDelta.reduce((sum, round) => sum + round.delta, 0);
  const mathematicallyEligible = getStandings2026().filter((driver) => titleStatus2026(driver.id)?.status !== "eliminated").length;
  return <><PageHero kicker="RKS 2026" title="Drivers’ Championship" description="Tyler leads Jonah by two points after Round 2. Two rounds remain." action={<span className="badge red">2 OF 4 ROUNDS COMPLETE</span>}/>
    <section className="section"><div className="wrap"><div className="championship-title-battle"><div><span className="eyebrow">TITLE BATTLE</span><strong>2 <small>PTS</small></strong></div><div><Link href="/drivers/tyler">Tyler <b>45</b></Link><Link href="/drivers/jonah">Jonah <b>43</b></Link></div><div className="title-battle-progress"><span>ROUND-BY-ROUND POINTS SWING</span><p>{titleDelta.map((round) => <b key={round.eventId}>R{round.round} {round.delta > 0 ? `+${round.delta} Tyler` : round.delta < 0 ? `+${Math.abs(round.delta)} Jonah` : "Level"}</b>)}<strong>NET · {netTitleDelta > 0 ? `${netTitleDelta} Tyler` : netTitleDelta < 0 ? `${Math.abs(netTitleDelta)} Jonah` : "Level"}</strong></p><small>{mathematicallyEligible} drivers remain mathematically eligible · 26 points maximum per remaining race</small></div></div><div className="row-between championship-controls"><div className="tabs" role="tablist" aria-label="Championship view"><button className={`tab ${view === "drivers" ? "active" : ""}`} role="tab" aria-selected={view === "drivers"} onClick={() => setView("drivers")}>Standings</button><button className={`tab ${view === "progression" ? "active" : ""}`} role="tab" aria-selected={view === "progression"} onClick={() => setView("progression")}>Championship progression</button></div><span className="eyebrow">2026 · Drivers</span></div>
      {view === "drivers" ? <><StandingsTable/><p className="archive-source-note">Points use the confirmed 2026 classification and fastest-lap bonus.</p></> : <ChampionshipProgressionChart/>}
    </div></section></>;
}

function DriversPage() {
  const [query, setQuery] = useState("");
  const standings = getStandings2026();
  const listed = getDriverRatingSnapshot2026().filter((rating) => season2026.drivers.find((driver) => driver.id === rating.driverId)?.name.toLowerCase().includes(query.trim().toLowerCase()));
  const hasEstimatedQualifying = listed.some((rating) => rating.qualifyingRatingEstimated);
  return <><PageHero kicker="RKS 2026" title="Drivers" description="The 2026 grid, with a separate performance rating alongside the official championship." action={<label className="search driver-search"><Search size={14}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search drivers" aria-label="Search drivers"/></label>}/><section className="section"><div className="wrap"><div className="driver-rating-intro"><div><span className="eyebrow">RATING AFTER ROUND 02</span><h2>RKS Driver Rating</h2><p>The RKS Driver Rating compares recorded driver performance across pace, peak speed, race results, consistency and qualifying. Each category is weighted equally.</p><p>Ratings describe performance, not championship position. Estimated qualifying ratings are entertainment-only estimates where official qualifying data is unavailable; they are never official qualifying results or statistics.</p></div><span className="driver-rating-weight">5 CATEGORIES <b>20% EACH</b></span></div><SectionHead eyebrow={`${listed.length} drivers · ranked by approved OVR`} title="2026 driver cards"/><div className="driver-rating-card-grid">{listed.map((rating) => { const driver = season2026.drivers.find((item) => item.id === rating.driverId)!; const championship = standings.find((item) => item.id === rating.driverId); return <DriverRatingCard key={rating.driverId} rating={rating} driver={driver} championship={championship ? { position: championship.position, points: championship.points } : null}/>; })}</div>{hasEstimatedQualifying && <p className="driver-rating-estimate-legend"><b>* QUAL EST.</b> Estimated rating — official qualifying data unavailable.</p>}{!listed.length&&<div className="empty-state filter-empty"><strong>No drivers match “{query}”</strong><button type="button" className="btn" onClick={() => setQuery("")}>Clear search</button></div>}<details className="driver-rating-method"><summary>Rating methodology</summary><div><p>Overall rating is the approved snapshot value. Its five displayed categories are equally weighted at 20% in the rating model; the supplied OVR remains authoritative for this version.</p><p>Consistency measures variation in representative race pace after extreme statistical outliers are removed. The rating does not identify why an outlier occurred.</p></div></details></div></section></>;
}

function DriverProfile({ slug }: { slug: string }) {
  const driver = driverBySlug(slug);
  if (!driver) return <NotFoundPage/>;
  const stats = getStandings2026().find((row) => row.id === driver.id)!;
  const driverRating = getDriverRating2026(driver.id);
  const paceHistory = driverLapHistory2026(driver.id);
  const history = season2026.events.filter((event) => event.status === "complete" && event.results.some((item) => item.driverId === driver.id)).map((event) => {
    const result = event.results.find((item) => item.driverId === driver.id);
    const grid = event.qualifying.findIndex((id) => id === driver.id);
    return { event, result, grid: grid < 0 ? null : grid + 1 };
  });
  const profileMetricCandidates: { label: string; value: string | number | null }[] = [
    { label: "Starts", value: stats.starts },
    { label: "Wins", value: stats.wins },
    { label: "Podiums", value: stats.podiums },
    { label: "Poles", value: stats.poles },
    { label: "Fastest laps", value: stats.fastestLaps },
    { label: "Best finish", value: stats.bestFinish === null ? null : `P${stats.bestFinish}` },
    { label: "Average finish", value: stats.averageFinish === null ? null : stats.averageFinish.toFixed(1) },
    { label: stats.qualifying.length === 1 ? "Average qualifying · 1 sample" : `Average qualifying · ${stats.qualifying.length} samples`, value: stats.averageQualifying === null ? null : stats.averageQualifying.toFixed(1) },
  ];
  const profileMetrics = profileMetricCandidates.filter((metric): metric is { label: string; value: string | number } => metric.value !== null);
  const averagePositionsLabel = stats.averagePositionsGained === null ? null : `${stats.averagePositionsGained > 0 ? "+" : ""}${stats.averagePositionsGained.toFixed(1)}`;
  return <><section className="profile-hero profile-archive-hero"><div className="wrap profile-grid"><div><div className="eyebrow">RKS 2026 · DRIVER PROFILE</div><h1 className="profile-name">{driver.name}</h1><div className="profile-meta"><span className="badge red">CHAMPIONSHIP P{stats.position}</span><span className="badge">{stats.points} POINTS</span></div></div><div className="profile-rating-mark"><small>2026 CHAMPIONSHIP</small><strong>P{stats.position}</strong><b>{stats.points} POINTS</b></div></div></section>
    <section className="section driver-profile-content"><div className="wrap">{driverRating && <><SectionHead eyebrow="Performance snapshot · after Round 02" title="RKS Driver Rating"/><DriverRatingCard rating={driverRating} driver={driver} profile championship={{ position: stats.position, points: stats.points }}/></>}<SectionHead eyebrow="Official season data" title="Season overview"/><div className="profile-metrics-summary"><strong>{stats.points}<small>PTS</small></strong><span>CHAMPIONSHIP P{stats.position}</span></div><div className="profile-stats-rail">{profileMetrics.map((metric) => <div className="profile-stat-item" key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}</div>{stats.starts > 0 && stats.pointsPerStart !== null && stats.winRatePercent !== null && stats.podiumRatePercent !== null && stats.fastestLapRatePercent !== null && <p className="profile-rate-line"><b>{stats.pointsPerStart.toFixed(1)}</b> points per start <i>·</i> Win rate <b>{stats.winRatePercent.toFixed(0)}%</b> <i>·</i> Podium rate <b>{stats.podiumRatePercent.toFixed(0)}%</b> <i>·</i> Fastest-lap rate <b>{stats.fastestLapRatePercent.toFixed(0)}%</b>{averagePositionsLabel !== null && <> <i>·</i> Average qualifying-to-finish <b>{averagePositionsLabel}</b> across {stats.qualifyingSamples} qualifying samples</>}</p>}
      <div className="profile-results-section"><SectionHead eyebrow="Official classifications" title="Race results"/><div className="driver-result-history">{history.map(({ event, result, grid }) => { const summary = result ? eventPerformanceSummary2026(event.id, driver.id) : null; const positionsChange = summary?.positionsChange; return <article key={event.id} className="driver-result-card"><div><span className="eyebrow">ROUND {String(event.round).padStart(2, "0")} · {event.format}</span><h3>{result ? `P${result.position} · ${driver.name}` : "Not classified"}</h3><p>{event.venue} · {season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name}</p></div>{result && <div className="driver-result-data">{grid != null && positionsChange != null && <span>Qualifying P{grid} → Finish P{result.position} · {positionsChange > 0 ? `+${positionsChange}` : positionsChange}</span>}<b>{summary?.points} <small>PTS</small></b><span>Official best · {formatLapTime(result.officialBestLapMs)}</span><Link href={`/races/2026/round-${event.round}`}>Race details <ArrowRight size={12}/></Link></div>}</article>; })}</div><Link href="/head-to-head" className="link-arrow">Compare with another driver <ArrowRight size={13}/></Link></div>
      {paceHistory.length > 0 && <><SectionHead eyebrow="Layout-specific · recorded laps" title="Race pace"/><div className="grid grid-2 driver-pace-history">{paceHistory.map(({ event, metrics }) => { const layout = season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"]; const summary = eventPerformanceSummary2026(event.id, driver.id); return <article className="card driver-pace-card" key={event.id}><span className="eyebrow">{layout.name.toUpperCase()}</span><strong>{formatLapTime(metrics.fastestRecordedLapMs)}</strong><span className="driver-pace-event">FASTEST RECORDED LAP · ROUND {String(event.round).padStart(2, "0")} · {dateLabel(event.date!)}</span><div className="driver-pace-metrics"><span><small>MEDIAN</small><b>{formatLapTime(metrics.medianLapMs)}</b></span><span><small>CLEAN AVG.</small><b>{formatLapTime(metrics.cleanAverageMs)}</b></span><span><small>PACE RANK</small><b>{summary?.pace?.paceRank ? `P${summary.pace.paceRank}` : "—"}</b></span><span><small>PACE VS FIELD</small><b>{summary?.pace ? `${summary.pace.paceVsFieldMedianPercent < 0 ? "−" : "+"}${Math.abs(summary.pace.paceVsFieldMedianPercent).toFixed(1)}%` : "—"}</b></span><span><small>CLEAN σ · RANK</small><b>{(metrics.standardDeviationMs / 1000).toFixed(2)} s · P{summary?.pace?.consistencyRank}</b></span><span><small>RECORDED LAPS</small><b>{metrics.lapCount} <i>({metrics.cleanLapCount} clean)</i></b></span></div><Link href={`/races/2026/round-${event.round}#race-analysis`} className="link-arrow">View race analysis <ArrowRight size={13}/></Link></article>; })}</div><p className="archive-source-note">Lap times are kept separate for Bahn 1 Indoor and Bahn 2 In & Outdoor. Clean-lap σ is derived for each event and is distinct from archived RKS consistency values.</p></>}
    </div></section></>;

}

function TeamsPage() {
  return <><PageHero kicker="Teams" title="One grid. No team entries." description="The 2026 inaugural season is contested as an individual Drivers Championship. No official teams or team points are assigned."/><section className="section"><div className="wrap"><div className="team-championship-feature"><span className="eyebrow">2026 · DRIVERS CHAMPIONSHIP</span><strong>Every point is personal.</strong><p>The website is ready to support team standings when RKS confirms a team championship and its entry list for a future season.</p><Link className="btn btn-primary" href="/drivers">Explore the 2026 drivers <ArrowRight size={14}/></Link></div></div></section></>;
}

function RacesPage() {
  return <><PageHero kicker="RKS 2026" title="Races" description="Four rounds. Results, qualifying and analysis in one place."/><section className="section"><div className="wrap"><div className="races-list">{season2026.events.map((event) => {
    const href = `/races/2026/round-${event.round}`;
    const layout = event.courseName ?? (event.layoutId ? season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name : null);
    const eventTitle = event.round === 4 ? event.dateWindow ?? "Winterferien NRW 2026" : event.venue;
    const detail = event.round === 4 ? "Venue TBC" : `${event.date ? `${dateLabel(event.date)}${event.round === 3 ? " · 17:00" : ""}` : "Date to be confirmed"}${layout ? ` · ${layout}` : ""}${event.status === "upcoming" && event.format ? ` · ${event.format}` : ""}`;
    return <Link className={`race-list-event ${event.status}`} href={href} key={event.id}>
      <div className="race-list-number"><small>ROUND</small><strong>{String(event.round).padStart(2, "0")}</strong></div>
      <div className="race-list-copy"><span className="eyebrow">{event.status === "complete" ? `${event.format} · COMPLETED` : "UPCOMING"}</span><h2>{eventTitle}</h2><p>{detail}</p></div>
      <span className="race-list-cta">View event <ArrowRight size={14}/></span>
    </Link>;
  })}</div></div></section></>;
}

function CalendarPage({ eventSlug }: { eventSlug?: string }) {
  if (!eventSlug) return <RacesPage/>;
  if (eventSlug === "latest") return <RaceHubPage round={2}/>;
  const roundMatch = eventSlug.match(/^round-(\d)$/);
  return roundMatch ? <CompletedOrUpcomingRound round={Number(roundMatch[1])}/> : <NotFoundPage/>;
}

function CompletedOrUpcomingRound({ round }: { round: number }) {
  const event = eventByRound(round);
  if (!event) return <NotFoundPage/>;
  if (event.status === "complete") return <RaceHubPage round={round}/>;
  if (round === 3) return <Round3EventPage/>;
  return <RoundFourPage/>;
}

function RoundFourPage() {
  return <><PageHero kicker="RKS 2026 · ROUND 04" title="Winterferien NRW 2026" description="The season finale is scheduled for the NRW winter holiday period." action={<span className="event-status">Upcoming</span>}/><section className="section"><div className="wrap"><div className="round-four-facts"><article><span className="eyebrow">DATE</span><strong>Winterferien NRW 2026</strong><p>The exact race date will be announced.</p></article><article><span className="eyebrow">VENUE</span><strong>Venue TBC</strong><p>Track information will follow confirmation.</p></article></div><Link href="/races" className="link-arrow">All races <ArrowRight size={13}/></Link></div></section></>;
}

function RaceHubPage({ round = 2 }: { round?: number }) {
  const event = eventByRound(round);
  if (!event || event.status !== "complete") return <NotFoundPage/>;
  const winner = driverById(event.raceWinnerId!)!;
  const pole = driverById(event.qualifying[0]!)!;
  const fastest = driverById(event.fastestLap!.driverId)!;
  const winnerResult = event.results.find((result) => result.position === 1)!;
  const secondResult = event.results.find((result) => result.position === 2)!;
  const margin = (secondResult.officialTotalTimeMs - winnerResult.officialTotalTimeMs) / 1000;
  const racePoints = (id: string) => event.results.reduce((sum, result) => sum + (result.driverId === id ? pointsForResult(result.position, event.fastestLap?.driverId === id) : 0), 0);
  const nextEvent = season2026.events.find((item) => item.round === round + 1) ?? season2026.events.find((item) => item.round === 3)!;
  const eventConsistency = "consistency" in event ? event.consistency as Record<string, { sigma: number; score: number }> : undefined;
  const fastestMs = event.fastestLap!.timeMs;
  const eventPaces = eventLapPace2026(event.id);
  const fastestRecordedOrder = [...eventPaces].sort((a, b) => a.fastestRecordedLapMs - b.fastestRecordedLapMs);
  const fastestRecordedMs = fastestRecordedOrder[0]?.fastestRecordedLapMs ?? fastestMs;
  const qualifyingMoves = event.qualifying.flatMap((driverId, index) => {
    const result = event.results.find((item) => item.driverId === driverId);
    return result ? [{ driver: driverById(driverId)!, gridPosition: index + 1, finishPosition: result.position, netPlaces: index + 1 - result.position }] : [];
  });
  const cumulative = (id: string, throughRound: number) => season2026.events.filter((item) => item.status === "complete" && item.round <= throughRound).reduce((sum, item) => sum + item.results.reduce((eventSum, result) => eventSum + (result.driverId === id ? pointsForResult(result.position, item.fastestLap?.driverId === id) : 0), 0), 0);
  const priorPoints = (id: string) => cumulative(id, round - 1);
  const afterPoints = (id: string) => cumulative(id, round);
  return <><section className="racehub-archive-hero"><div className="wrap racehub-archive-grid"><div><div className="eyebrow">RKS 2026 · ROUND {String(round).padStart(2, "0")} · {event.format}</div><h1>{event.venue}<br/><span>{season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name}</span></h1><p>{dateLabel(event.date!)} · Official race event</p><div className="racehub-hero-margin">{winner.name}<small>RACE WINNER · {margin.toFixed(2)} s TO P2</small></div></div><div className="racehub-hero-mark" aria-hidden="true"><span>RKS 2026</span><strong>ROUND<br/>{String(round).padStart(2, "0")}</strong><b>{event.format}</b></div></div></section>
    <section className="section"><div className="wrap"><nav className="event-anchor-nav" aria-label="Race sections"><a href="#overview">Overview</a><a href="#qualifying">Qualifying</a><a href="#results">Race result</a><a href="#race-analysis">Race analysis</a><a href="#downloads">Downloads</a></nav><div id="overview" className="race-overview-line"><span>{dateLabel(event.date!)}</span><span>{event.venue}</span><span>{season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name}</span><span>{event.format}</span></div><div className="grid grid-4 archive-stat-grid"><StatCard label="Winner" value={winner.name}/><StatCard label="Pole" value={pole.name}/><StatCard label="Fastest lap" value={fastest.name} sub={`${formatLapTime(fastestMs)}${event.fastestLap && "lap" in event.fastestLap ? ` · Lap ${event.fastestLap.lap}` : " · official event best"}`}/><StatCard label="Winning margin" value={`${margin.toFixed(2)} s`} sub="Official total time difference"/></div>
      <div className="racehub-story-block"><span className="eyebrow">RACE REPORT · CONFIRMED FACTS</span><h2>{winner.name} won by {margin.toFixed(2)} seconds.</h2><p>{round === 2 ? `Tyler finished second and set the fastest lap, 53.94 on lap 21. Lennard F. started from pole and completed the podium in third.` : `The official classification lists ${winner.name} as the winner. ${fastest.name} recorded the fastest lap of ${formatLapTime(fastestMs)}.`}</p></div>
      <div className="racehub-sections"><section className="panel" id="results"><SectionHead eyebrow="Final classification" title="Race result"/><RaceClassification round={round}/></section><section className="panel" id="qualifying"><SectionHead eyebrow={event.coverage.qualifyingPositions === "partial" ? "Confirmed positions · partial order" : "Confirmed starting order"} title="Qualifying"/><QualifyingClassification round={round}/></section></div>
      {qualifyingMoves.length > 0 && <section className="event-classification-section"><SectionHead eyebrow={event.coverage.qualifyingPositions === "partial" ? "Recorded entrants only · partial qualifying source" : "All listed qualifying entrants"} title="Qualifying to classified finish"/><div className="qualifying-move-grid">{qualifyingMoves.map(({ driver, gridPosition, finishPosition, netPlaces }) => <article className="card qualifying-move-card" key={driver.id}><span className="eyebrow">{driver.name}</span><strong>{netPlaces > 0 ? `+${netPlaces}` : netPlaces < 0 ? `−${Math.abs(netPlaces)}` : "—"}</strong><span>{netPlaces > 0 ? "places gained" : netPlaces < 0 ? "places lost" : "same position"}</span><small>GRID P{gridPosition} → FINISH P{finishPosition}</small></article>)}</div><p className="table-note">This compares the published qualifying order with the final classification only. It does not reconstruct lap-by-lap positions or passes.</p></section>}
      {event.coverage.lapTimes === "complete" && <section className="event-classification-section" id="race-analysis"><SectionHead eyebrow={`${event.lapTimes.length} recorded laps · layout-specific`} title="Lap time analysis"/><RaceLapAnalysis eventId={event.id}/></section>}
      {event.coverage.lapTimes === "complete" && <section className="event-classification-section"><SectionHead eyebrow="Same race · same layout" title="Driver comparison"/><div className="grid grid-2 racehub-driver-comparison">{[winnerResult, secondResult].map((result) => { const driver = driverById(result.driverId)!; const pace = eventPaces.find((item) => item.driverId === driver.id)!; const archivedConsistency = eventConsistency?.[driver.id]; return <article className="card racehub-driver-pace-card" key={driver.id}><span className="eyebrow">P{result.position} · {driver.name}</span><strong>{formatLapTime(pace.fastestRecordedLapMs)}</strong><small>FASTEST RECORDED LAP · {pace.lapCount} RECORDED LAPS</small><div><span>Median</span><b>{formatLapTime(pace.medianLapMs)}</b></div><div><span>Clean average</span><b>{formatLapTime(pace.cleanAverageMs)}</b></div><div><span>Clean-lap standard deviation</span><b>{(pace.standardDeviationMs / 1000).toFixed(2)} s</b></div>{archivedConsistency&&<div><span>Archived RKS consistency score</span><b>{archivedConsistency.score}/100 · σ {archivedConsistency.sigma.toFixed(3)}</b></div>}</article>; })}</div><p className="table-note">This comparison uses only the selected event. R1 and R2 use different track layouts and are not compared directly.</p></section>}
      <section className="event-classification-section"><SectionHead eyebrow="Same event · lap sheet values" title="Pace comparison"/><div className="best-lap-comparison">{fastestRecordedOrder.map((pace, index) => { const driver = driverById(pace.driverId)!; const delta = pace.fastestRecordedLapMs - fastestRecordedMs; return <div className="best-lap-row" key={pace.driverId}><span className="best-lap-position">{String(index + 1).padStart(2, "0")}</span><Link href={`/drivers/${driver.slug}`}>{driver.name}</Link><span className="best-lap-bar"><i style={{ width: `${Math.max(7, 100 - Math.min(90, delta / 70))}%` }}/></span><b>{formatLapTime(pace.fastestRecordedLapMs)}</b><small>{delta === 0 ? "FASTEST RECORDED" : `+${(delta / 1000).toFixed(3)} s`}</small></div>; })}</div><p className="table-note">This comparison uses fastest recorded laps from this event and layout. Official classification best laps remain separately reported above; R1 and R2 are not compared with each other.</p></section>
      {eventConsistency&&<section className="event-classification-section"><SectionHead eyebrow="Previously confirmed RKS values · retained" title="Consistency"/><div className="grid grid-3 consistency-grid">{Object.entries(eventConsistency).sort(([, a], [, b]) => b.score - a.score).map(([id, score]) => { const driver = driverById(id)!; const calculated = lapPaceMetrics2026(event.id, id); return <article className="card consistency-card" key={id}><span className="eyebrow">RKS CONSISTENCY SCORE</span><strong>{driver.name}</strong><span className="consistency-score">{score.score}<small>/100</small></span><p>Archived σ {score.sigma.toFixed(3)} s · separately calculated clean-lap σ {calculated ? (calculated.standardDeviationMs / 1000).toFixed(3) : "—"} s</p></article>; })}</div><p className="table-note">The archived score and sigma are preserved. The new clean-lap standard deviation is a separate statistic; it does not replace or recalculate the RKS consistency score.</p></section>}
      <section className="event-classification-section"><SectionHead eyebrow="2026 Drivers’ Championship" title="Championship impact"/><div className="championship-impact-grid">{["DRV_TYLER", "DRV_JONAH"].map((id) => { const driver = driverById(id)!; const before = priorPoints(id); const after = afterPoints(id); return <article className="card championship-impact-driver" key={id}><span>{driver.name}</span><strong>{before} <small>PTS</small><i>→</i> {after} <small>PTS</small></strong><p>Scored {racePoints(id)} points in Round {round}.</p></article>; })}<div className="championship-impact-gap"><span>GAP AFTER ROUND {round}</span><strong>{Math.abs(afterPoints("DRV_TYLER") - afterPoints("DRV_JONAH"))} <small>PTS</small></strong></div></div></section>
      <section className="race-downloads" id="downloads"><SectionHead eyebrow="Original source documents" title="Downloads"/><p>Source timing sheets used for the official transcription and lap analysis.</p><div className="race-download-links">{round === 1 ? <><a href="/downloads/2026/rks-2026-round-1-hot-25-timing-sheet-page-1.jpg" download>Round 1 timing sheet · page 1 <ArrowRight size={13}/></a><a href="/downloads/2026/rks-2026-round-1-hot-25-timing-sheet-page-2.jpg" download>Round 1 timing sheet · page 2 <ArrowRight size={13}/></a></> : <a href="/downloads/2026/rks-2026-round-2-hot-30-timing-sheet.pdf" download>Round 2 HOT 30 timing sheet <ArrowRight size={13}/></a>}</div></section>
      <div className="event-next-link"><Link className="link-arrow" href="/races">All races <ArrowRight size={13}/></Link><Link className="btn btn-primary" href={`/races/2026/round-${nextEvent.round}`}>{nextEvent.status === "upcoming" ? `Next event · Round ${nextEvent.round}` : "All races"} <ArrowRight size={14}/></Link></div>
    </div></section></>;
}

function StatisticsPage() {
  const snapshot = statisticsSnapshot2026();
  const { championshipRankings, qualifyingRankings, metricLeaders, events, records } = snapshot;
  const closestDriver = records.closestOfficialFinish ? driverById(records.closestOfficialFinish.driverId)?.name : null;
  const aheadDriver = records.closestOfficialFinish?.aheadOfDriverId ? driverById(records.closestOfficialFinish.aheadOfDriverId)?.name : null;
  return <>
    <PageHero kicker="Statistics · 2026" title="Numbers with a story." description="Verified championship form and event-specific pace from the two completed RKS rounds."/>
    <section className="section"><div className="wrap">
      <SectionHead eyebrow="After two rounds" title="Championship performance"><Link className="link-arrow" href="/achievements">Driver achievements <ArrowRight size={13}/></Link></SectionHead>
      <div className="statistics-rank-columns">
        <StatisticRanking title="Points per start" rows={championshipRankings.pointsPerStart}/>
        <StatisticRanking title="Win rate" rows={championshipRankings.winRate}/>
        <StatisticRanking title="Podium rate" rows={championshipRankings.podiumRate}/>
        <StatisticRanking title="Fastest-lap rate" rows={championshipRankings.fastestLapRate}/>
      </div>
      <SectionHead eyebrow="Confirmed qualifying only · sample shown" title="Grid to finish"/>
      <div className="statistics-rank-columns two">
        <StatisticRanking title="Average qualifying · lower is better" rows={qualifyingRankings.averageQualifying}/>
        <StatisticRanking title="Average positions gained" rows={qualifyingRankings.averagePositionsGained}/>
      </div>
      <SectionHead eyebrow="Calculated from recorded clean laps · same event/layout" title="Event pace and consistency"/>
      <div className="statistics-event-grid">{events.map((event) => {
        return <article className="statistics-event" key={event.eventId}><header><span className="eyebrow">ROUND {String(event.round).padStart(2, "0")} · {event.lapCount} RECORDED LAPS</span><h3>{event.layoutName}</h3><Link href={`/races/2026/round-${event.round}#race-analysis`}>Full analysis <ArrowRight size={12}/></Link></header><div className="statistics-event-rankings"><div><b>RACE PACE · CLEAN AVG.</b>{event.paceTop.map((entry) => <p key={entry.driverId}><span>P{entry.paceRank} · {driverById(entry.driverId)?.name}</span><strong>{entry.paceRank === 1 ? formatLapTime(entry.cleanAverageMs) : `+${(entry.paceGapToFastestCleanAverageMs / 1000).toFixed(3)} s`}</strong></p>)}</div><div><b>CONSISTENCY · CLEAN σ</b>{event.consistencyTop.map((entry) => <p key={entry.driverId}><span>P{entry.consistencyRank} · {driverById(entry.driverId)?.name}</span><strong>{(entry.standardDeviationMs / 1000).toFixed(3)} s</strong></p>)}</div></div></article>;
      })}</div>
      <p className="archive-source-note">Pace is ranked separately within each layout. Pace-vs-field is relative to the event median of clean driver averages: negative is faster, positive slower. Clean-lap σ is derived and does not replace archived RKS consistency.</p>
      <SectionHead eyebrow="Official results and recorded timing" title="RKS archive records"/>
      <div className="statistics-record-list">
        {metricLeaders.map((item) => <div key={item.label}><span>{item.label}</span><b>{item.displayValue ?? "—"}</b><small>{item.leaders.join(" · ")}</small></div>)}
        {records.closestOfficialFinish && <div><span>Closest official finish</span><b>{(records.closestOfficialFinish.gapMs / 1000).toFixed(3)} s</b><small>Round {records.closestOfficialFinish.round} · {aheadDriver} over {closestDriver}</small></div>}
        {records.widestWin && <div><span>Largest official winning margin</span><b>{(records.widestWin.marginMs / 1000).toFixed(2)} s</b><small>Round {records.widestWin.round} · {driverById(records.widestWin.winnerId)?.name}</small></div>}
        <div><span>Most starts</span><b>{records.mostStarts.count}</b><small>{records.mostStarts.drivers.join(" · ")}</small></div>
        <div><span>Most classified laps</span><b>{records.mostClassifiedLaps.count}</b><small>{records.mostClassifiedLaps.drivers.join(" · ")}</small></div>
        {events.map((event) => <div key={event.eventId}><span>RKS fastest recorded lap · {event.layoutName}</span><b>{formatLapTime(event.fastestRecordedLapMs)}</b><small>{driverById(event.fastestRecordedLapDriverId)?.name} · Round {event.round} · {dateLabel(event.date!)}</small></div>)}
      </div>
      <p className="archive-source-note">RKS archive records are layout-specific and are not venue-wide track records. Closest finish uses the official classification gap only.</p>
      <SectionHead eyebrow="Compare any two drivers" title="Head to head"><Link className="link-arrow" href="/head-to-head">Open driver comparison <ArrowRight size={13}/></Link></SectionHead>
    </div></section>
  </>;
}

function StatisticRanking({ title, rows }: { title: string; rows: { position: number; driverId: string; slug: string; name: string; value: string; sampleCount: number; sampleLabel: string }[] }) {
  return <section className="statistics-ranking"><h3>{title}</h3><ol>{rows.map((row) => <li key={row.driverId}><span className="statistics-rank-position">P{row.position}</span><Link href={`/drivers/${row.slug}`}>{row.name}</Link><strong>{row.value}</strong><small>{row.sampleCount} {row.sampleLabel}</small></li>)}</ol></section>;
}

function HeadToHeadPage() {
  const [params, setParams] = useState({ a: "tyler", b: "jonah" });
  const [selectedPaceEventId, setSelectedPaceEventId] = useState("2026-R02");
  const driverA = driverBySlug(params.a) ?? season2026.drivers[0]!;
  const driverB = driverBySlug(params.b) ?? season2026.drivers[1]!;
  const comparison = headToHead2026(driverA.id, driverB.id);
  const championshipDelta = headToHeadPointsDeltaByRound2026(driverA.id, driverB.id);
  const netChampionshipDelta = championshipDelta.reduce((sum, round) => sum + round.delta, 0);
  const sharedLapEvents = season2026.events.filter((event) => event.status === "complete" && event.lapTimes.some((lap) => lap.driverId === driverA.id) && event.lapTimes.some((lap) => lap.driverId === driverB.id));
  const activePaceEventId = sharedLapEvents.some((event) => event.id === selectedPaceEventId) ? selectedPaceEventId : sharedLapEvents[0]?.id;
  const activePaceEvent = sharedLapEvents.find((event) => event.id === activePaceEventId);
  const paceA = activePaceEvent ? lapPaceMetrics2026(activePaceEvent.id, driverA.id) : null;
  const paceB = activePaceEvent ? lapPaceMetrics2026(activePaceEvent.id, driverB.id) : null;
  const stats: [string, number | string, number | string][] = [
    ["Championship points", comparison.a.points, comparison.b.points],
    ["Championship position", `P${comparison.a.position}`, `P${comparison.b.position}`],
    ["Starts", comparison.a.starts, comparison.b.starts],
    ["Wins", comparison.a.wins, comparison.b.wins],
    ["Podiums", comparison.a.podiums, comparison.b.podiums],
    ["Poles", comparison.a.poles, comparison.b.poles],
    ["Fastest laps", comparison.a.fastestLaps, comparison.b.fastestLaps],
  ];
  if (comparison.a.averageFinish !== null && comparison.b.averageFinish !== null) stats.push(["Average finish", comparison.a.averageFinish.toFixed(1), comparison.b.averageFinish.toFixed(1)]);
  if (comparison.a.bestFinish !== null && comparison.b.bestFinish !== null) stats.push(["Best finish", `P${comparison.a.bestFinish}`, `P${comparison.b.bestFinish}`]);
  if (comparison.a.averageQualifying !== null && comparison.b.averageQualifying !== null) stats.push(["Average qualifying", comparison.a.averageQualifying.toFixed(1), comparison.b.averageQualifying.toFixed(1)]);
  const h2hRows = [
    ["Race finish", comparison.records.raceFinish],
    ["Qualifying", comparison.records.qualifying],
    ["Official fastest lap", comparison.records.fastestLap],
    ["Clean race pace", comparison.records.cleanRacePace],
  ] as const;
  return <><PageHero kicker="Head to head · 2026" title="Two drivers. One comparison." description="Compare championship totals, then choose a shared race to compare recorded pace within the same layout."/><section className="section"><div className="wrap"><div className="side-by-side"><DriverSelect side="a" value={driverA.slug} other={driverB.slug} onChange={(value) => setParams((current) => ({ ...current, a: value }))}/><DriverSelect side="b" value={driverB.slug} other={driverA.slug} onChange={(value) => setParams((current) => ({ ...current, b: value }))}/></div><div className="card panel comparison-table"><div className="h2h-record-heading"><span>{driverA.name}</span><b>SHARED EVENT RECORD</b><span>{driverB.name}</span></div>{h2hRows.map(([label, record]) => <div className="comparison-row h2h-record-row" key={label}><b>{record.a}</b><span>{label}<small>{record.samples} comparable {record.samples === 1 ? "event" : "events"}</small></span><b>{record.b}</b></div>)}</div><div className="championship-swing-line"><span>POINTS SWING · INCLUDING FASTEST-LAP BONUS</span><div>{championshipDelta.map((round) => <b key={round.eventId}>R{round.round} · {round.delta > 0 ? `+${round.delta} ${driverA.name}` : round.delta < 0 ? `+${Math.abs(round.delta)} ${driverB.name}` : "Level"}</b>)}</div><strong>NET · {netChampionshipDelta > 0 ? `${netChampionshipDelta} ${driverA.name}` : netChampionshipDelta < 0 ? `${Math.abs(netChampionshipDelta)} ${driverB.name}` : "Level"}</strong></div><div className="card panel comparison-table">{stats.map(([label, a, b]) => <div className="comparison-row" key={label}><b>{a}</b><span>{label}</span><b>{b}</b></div>)}</div>
      <SectionHead eyebrow="Recorded pace · shared events only" title="Same race, same layout"/>{sharedLapEvents.length > 0 && <div className="head-to-head-event-select"><label htmlFor="pace-event-select">Compare event</label><select id="pace-event-select" value={activePaceEvent?.id} onChange={(event) => setSelectedPaceEventId(event.target.value)}>{sharedLapEvents.map((item) => <option value={item.id} key={item.id}>Round {item.round} · {item.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "Bahn 1 · Indoor" : "Bahn 2 · In & Outdoor"}</option>)}</select>{activePaceEvent&&<span>{activePaceEvent.venue} · {dateLabel(activePaceEvent.date!)}</span>}</div>}
      {paceA&&paceB&&activePaceEvent ? <div className="head-to-head-pace-grid"><div className="card panel comparison-table">{[["Fastest recorded lap", formatLapTime(paceA.fastestRecordedLapMs), formatLapTime(paceB.fastestRecordedLapMs)], ["Median lap", formatLapTime(paceA.medianLapMs), formatLapTime(paceB.medianLapMs)], ["Clean average", formatLapTime(paceA.cleanAverageMs), formatLapTime(paceB.cleanAverageMs)], ["Clean-lap standard deviation", `${(paceA.standardDeviationMs / 1000).toFixed(2)} s`, `${(paceB.standardDeviationMs / 1000).toFixed(2)} s`], ["Recorded laps", paceA.lapCount, paceB.lapCount]].map(([label, a, b]) => <div className="comparison-row" key={String(label)}><b>{a}</b><span>{label}</span><b>{b}</b></div>)}</div><p className="archive-source-note">Pace values use {activePaceEvent.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "Bahn 1 · Indoor" : "Bahn 2 · In & Outdoor"} recorded laps only. Outliers are excluded only from clean averages and standard deviation.</p></div> : <div className="empty-state"><strong>No shared race with lap data.</strong><p>Pace comparisons appear only when both drivers have recorded laps in the same completed event.</p></div>}
      <SectionHead eyebrow="Common races" title="Race by race"/><div className="card panel">{comparison.races.map((race) => <Link className="comparison-round" key={race.round} href={`/races/2026/round-${race.round}`} aria-label={`View Round ${race.round} race details`}><span>ROUND {String(race.round).padStart(2, "0")}</span><b>P{race.positionA}</b><span>{race.winner === "tie" ? "Same classified position" : race.winner === "a" ? `${driverA.name} finished ahead` : `${driverB.name} finished ahead`}</span><b>P{race.positionB}</b></Link>)}{!comparison.races.length&&<p className="team-name">No shared completed race is listed for these drivers.</p>}</div><p className="archive-source-note">Pace metrics are compared only within the selected event layout.</p></div></section></>;
}

function DriverSelect({ side, value, other, onChange }: { side: "a" | "b"; value: string; other: string; onChange: (value: string) => void }) {
  const selected = driverBySlug(value)!;
  const stats = getStandings2026().find((driver) => driver.id === selected.id)!;
  return <div className="card versus-card"><div className="eyebrow">Driver {side === "a" ? "one" : "two"}</div><select aria-label={`Choose driver ${side === "a" ? "one" : "two"}`} className="search" value={value} onChange={(event) => onChange(event.target.value)}>{season2026.drivers.map((driver) => <option key={driver.id} value={driver.slug} disabled={driver.slug === other}>{driver.name}</option>)}</select><div className="versus-name">{selected.name}</div><p className="team-name">P{stats.position} · {stats.points} points</p></div>;
}

function AchievementsPage() {
  const rows = getStandings2026();
  const achieved = [
    { name: "Race winner", detail: "Official classified race win", drivers: rows.filter((driver) => driver.wins > 0).map((driver) => driver.name) },
    { name: "Podium finisher", detail: "One or more top-three race finishes", drivers: rows.filter((driver) => driver.podiums > 0).map((driver) => `${driver.name} · ${driver.podiums}`) },
    { name: "Pole position", detail: "Top qualifying position in a confirmed session", drivers: rows.filter((driver) => driver.poles > 0).map((driver) => driver.name) },
    { name: "Fastest lap", detail: "Official event fastest lap", drivers: rows.filter((driver) => driver.fastestLaps > 0).map((driver) => `${driver.name} · ${driver.fastestLaps}`) },
  ].filter((item) => item.drivers.length > 0);
  return <><PageHero kicker="Achievements · 2026" title="Earned on track." description="Milestones shown here are supported by confirmed results and championship data."/><section className="section"><div className="wrap"><div className="badge-grid achievement-grid">{achieved.map((item) => <article className="card achievement is-earned" key={item.name}><div className="medal"><Medal size={16}/></div><h3>{item.name}</h3><p>{item.detail}</p><strong>{item.drivers.join(" · ")}</strong></article>)}</div><Link className="link-arrow" href="/statistics">Back to statistics <ArrowRight size={13}/></Link></div></section></>;
}

function RegulationsPage() {
  const [query, setQuery] = useState("");
  const confirmed = [
    { title: "Championship points", text: "Race points are awarded from P1 to P10: 25, 18, 15, 12, 10, 8, 6, 4, 2 and 1. The official fastest lap adds one bonus point when its driver finishes in the top ten." },
    { title: "Classification", text: "The Drivers’ Championship uses the confirmed race classifications. Drivers tied on points share a championship position." },
    { title: "2026 race format", text: "Round 1: HOT 25 · Daytona Essen Bahn 2 – In & Outdoor. Round 2: HOT 30 · Daytona Essen Bahn 1 – Indoor. Round 3: HOT 25 · Daytona Essen Bahn 2. Round 4 format is not confirmed." },
    { title: "Calendar", text: "The inaugural season has four rounds. Round 4 is planned during Winterferien NRW 2026." },
  ];
  const undefinedRules = [
    { title: "Points tie-break", text: "No tie-break procedure has been supplied. Drivers tied on points therefore share the same championship position." },
    { title: "Conduct and race decisions", text: "Formal sporting conduct procedures, protests and race-control decision rules have not been published in the confirmed 2026 information." },
    { title: "Round 4 event details", text: "Exact date, venue and session format remain unconfirmed." },
  ];
  const matches = (item: { title: string; text: string }) => `${item.title} ${item.text}`.toLowerCase().includes(query.trim().toLowerCase());
  const shownConfirmed = confirmed.filter(matches);
  const shownUndefined = undefinedRules.filter(matches);
  return <><PageHero kicker="Regulations · 2026" title="Sporting information" description="Confirmed 2026 championship information, with unresolved rules clearly identified."/><section className="section"><div className="wrap"><div className="row-between regulations-toolbar"><label className="search regulation-search"><Search size={14}/><input aria-label="Search regulations" placeholder="Search 2026 information" value={query} onChange={(event) => setQuery(event.target.value)}/></label><span className="badge">2026 · INAUGURAL SEASON</span></div><div className="reg-section"><nav className="reg-nav" aria-label="Regulation sections">{shownConfirmed.length > 0 && <a href="#confirmed">Confirmed</a>}{shownUndefined.length > 0 && <a href="#not-defined">Not yet defined</a>}</nav><div className="reg-content">{shownConfirmed.length > 0 && <section id="confirmed" className="regulation-group"><SectionHead eyebrow="Published season facts" title="Confirmed"/>{shownConfirmed.map((topic) => <article key={topic.title} className="reg-article"><h2>{topic.title}</h2><p>{topic.text}</p>{topic.title === "Championship points"&&<div className="points-scale">{season2026.pointsByPosition.map((points, index) => <div key={index}><span>P{index + 1}</span><b>{points}</b></div>)}</div>}</article>)}</section>}{shownUndefined.length > 0 && <section id="not-defined" className="regulation-group"><SectionHead eyebrow="No rule supplied" title="Not yet defined"/>{shownUndefined.map((topic) => <article key={topic.title} className="reg-article"><h2>{topic.title}</h2><p>{topic.text}</p></article>)}</section>}{!shownConfirmed.length&&!shownUndefined.length&&<div className="empty-state"><strong>No 2026 information matches “{query}”.</strong><button type="button" className="btn" onClick={() => setQuery("")}>Clear search</button></div>}<div className="reg-history"><span className="eyebrow">VERSION HISTORY</span><div><b>2026 · Inaugural season</b><span>Current published sporting information</span></div></div></div></div></div></section></>;
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
  else if (section === "races") { const year = rest[0]; const match = rest[1]?.match(/^round-(\d)$/); const round = match ? Number(match[1]) : null; page = year === "2026" && round ? <CompletedOrUpcomingRound round={round}/> : year && year !== "2026" ? <SeasonNotPublished year={Number(year)}/> : <RacesPage/>; title = round ? `Round ${round} · RKS 2026` : "RKS 2026 races"; }
  else if (section === "calendar") { page = <CalendarPage eventSlug={rest[0]}/>; title = rest[0] ? `Round ${rest[0].replace("round-", "")} · RKS 2026` : "RKS 2026 races"; }
  else if (section === "racehub") { const match = rest[0]?.match(/^round-(\d)$/); page = match ? <CompletedOrUpcomingRound round={Number(match[1])}/> : <RacesPage/>; title = match ? `Round ${match[1]} · RKS 2026` : "RKS 2026 races"; }
  else if (section === "race-center") { page = <RacesPage/>; title = "RKS 2026 races"; }
  else if (section === "statistics") { page = <StatisticsPage/>; title = "2026 championship statistics"; }
  else if (section === "head-to-head") { page = <HeadToHeadPage/>; title = "Driver head to head · 2026"; }
  else if (section === "achievements") { page = <AchievementsPage/>; title = "2026 driver achievements"; }
  else if (section === "media") { page = <NotFoundPage/>; title = "Page not found"; }
  else if (section === "regulations") { page = <RegulationsPage/>; title = "Confirmed 2026 sporting information"; }
  else if (section === "admin") { page = <AdminPanel/>; title = "RKS administration"; }
  else { page = <NotFoundPage/>; title = "Page not found"; }
  const isRound3 = season === 2026 && ((section === "races" && rest[0] === "2026" && rest[1] === "round-3") || (section === "calendar" && rest[0] === "round-3"));
  const round3StructuredData = { "@context": "https://schema.org", "@type": "SportsEvent", name: "RKS 2026 · Round 3 · Daytona Kart Center Essen · Bahn 2", startDate: round3Event.date, eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", location: { "@type": "Place", name: "Daytona Kart Center Essen · Bahn 2", address: { "@type": "PostalAddress", addressLocality: "Essen", addressCountry: "DE" } }, url: "https://rks-regionalkartserie.tyler-nhs25.chatgpt.site/races/2026/round-3" };
  return <><title>{title} | RKS</title>{isRound3&&<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(round3StructuredData).replace(/</g, "\\u003c") }}></script>}{season === 2026 || section === "admin" ? page : <SeasonNotPublished year={season}/>}</>;
}
