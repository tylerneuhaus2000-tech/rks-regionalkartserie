"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { auditLapTimes2026, driverById, derivedLapTimeDelta2026, eventLapPace2026, eventPaceAnalytics2026, formatLapTime } from "@/data/2026/selectors";
import { season2026 } from "@/data/2026/season";

const COLORS = ["#ed3438", "#e7e8ea", "#5ba6ff", "#e6b752", "#7bd4aa", "#c18cff", "#fa8a50", "#45c5c5", "#f18ac2", "#a3d36c", "#92a6ff", "#d5d5d5"];

function lapTimeLabel(value: number) {
  return formatLapTime(value);
}

function signedDeltaLabel(value: number) {
  const seconds = value / 1000;
  return `${seconds > 0 ? "+" : seconds < 0 ? "−" : ""}${Math.abs(seconds).toFixed(1)} s`;
}

export function RaceLapAnalysis({ eventId }: { eventId: string }) {
  const event = season2026.events.find((item) => item.id === eventId);
  const paces = eventLapPace2026(eventId);
  const participants = paces.map((pace) => ({ ...pace, driver: driverById(pace.driverId)! }));
  const eventAnalytics = eventPaceAnalytics2026(eventId);
  const discrepancies = auditLapTimes2026().filter((item) => item.eventId === eventId);
  const defaults = eventId === "2026-R02" ? ["DRV_JONAH", "DRV_TYLER", "DRV_LENNARD_F"] : ["DRV_TYLER", "DRV_JONAH", "DRV_LENNARD_F"];
  const [selectedIds, setSelectedIds] = useState<string[]>(() => defaults.filter((id) => participants.some((item) => item.driverId === id)));
  const [driverAId, setDriverAId] = useState(eventId === "2026-R02" ? "DRV_JONAH" : "DRV_TYLER");
  const [driverBId, setDriverBId] = useState(eventId === "2026-R02" ? "DRV_TYLER" : "DRV_JONAH");
  const byLap = useMemo(() => {
    const maxLap = Math.max(...(event?.lapTimes.map((lap) => lap.lapNumber) ?? [0]));
    return Array.from({ length: maxLap }, (_, index) => {
      const row: Record<string, number | null> = { lap: index + 1 };
      for (const id of selectedIds) {
        row[id] = event?.lapTimes.find((lap) => lap.driverId === id && lap.lapNumber === index + 1)?.lapTimeMs ?? null;
      }
      return row;
    });
  }, [event, selectedIds]);
  const derived = derivedLapTimeDelta2026(eventId, driverAId, driverBId);

  if (!event || event.coverage.lapTimes !== "complete") return null;

  return <div className="lap-analysis-stack">
    <section className="panel lap-evolution-panel" aria-labelledby="lap-evolution-title">
      <div className="lap-panel-heading">
        <div><span className="eyebrow">RECORDED RACE LAPS · ROUND {String(event.round).padStart(2, "0")}</span><h2 id="lap-evolution-title">Lap time evolution</h2></div>
        <span className="badge">{participants.length} drivers · {event.lapTimes.length} laps</span>
      </div>
      <div className="lap-driver-toggles" role="group" aria-label="Choose drivers for the lap-time chart">
        {participants.map(({ driverId, driver }, index) => {
          const selected = selectedIds.includes(driverId);
          const color = COLORS[index % COLORS.length]!;
          return <button key={driverId} type="button" aria-pressed={selected} className={`lap-driver-toggle ${selected ? "selected" : ""}`} onClick={() => setSelectedIds((current) => selected ? current.filter((id) => id !== driverId) : [...current, driverId])}>
            <i style={{ backgroundColor: selected ? color : undefined }}/>{driver.name}
          </button>;
        })}
      </div>
      {selectedIds.length ? <div className="lap-chart-wrap" role="img" aria-label={`Lap time evolution for Round ${event.round}. Horizontal axis is lap number; vertical axis is recorded lap time.`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={byLap} margin={{ top: 12, right: 14, bottom: 2, left: 2 }}>
            <CartesianGrid stroke="#ffffff12" strokeDasharray="3 5" vertical={false}/>
            <XAxis dataKey="lap" tick={{ fill: "#92969b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#35383b" }} tickMargin={8} label={{ value: "LAP", position: "insideBottomRight", offset: -1, fill: "#74787d", fontSize: 8 }}/>
            <YAxis domain={["dataMin - 1000", "dataMax + 1000"]} tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}s`} tick={{ fill: "#92969b", fontSize: 10 }} tickLine={false} axisLine={false} width={35}/>
            <Tooltip contentStyle={{ background: "#191b1d", border: "1px solid #3a3c3f", borderRadius: 8, color: "#fff", fontSize: 11 }} labelStyle={{ color: "#aeb1b5", marginBottom: 5 }} labelFormatter={(value) => `Lap ${value}`} formatter={(value, name) => [lapTimeLabel(Number(value)), driverById(String(name))?.name ?? String(name)]}/>
            {selectedIds.map((id) => {
              const participantIndex = participants.findIndex((item) => item.driverId === id);
              return <Line key={id} type="monotone" dataKey={id} name={id} stroke={COLORS[participantIndex % COLORS.length]} strokeWidth={2.3} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls={false} isAnimationActive={false}/>;
            })}
          </LineChart>
        </ResponsiveContainer>
      </div> : <p className="lap-empty-message">Select at least one driver to display lap times.</p>}
      <p className="lap-chart-footnote">The chart shows the recorded timing-sheet values. Empty cells after a driver’s classified lap count remain empty.</p>
      {discrepancies.map((item) => <p className="lap-time-discrepancy-note" key={item.driverId}><strong>Source discrepancy · {driverById(item.driverId)?.name}:</strong> official classification {formatLapTime(item.officialBestLapMs)}; fastest recorded lap {formatLapTime(item.fastestRecordedLapMs)} on lap {item.fastestRecordedLapNumber}. The recorded value is used for lap analysis and is not the official best lap.</p>)}
    </section>

    <section className="event-classification-section" aria-labelledby="pace-analysis-title">
      <div className="lap-panel-heading"><div><span className="eyebrow">CALCULATED FROM RECORDED LAPS</span><h2 id="pace-analysis-title">Pace analysis</h2></div><span className="badge">Same event and layout</span></div>
      <div className="card table-card table-scroll lap-pace-table-wrap"><table className="standings lap-pace-table">
        <thead><tr><th>Driver</th><th>Fastest recorded</th><th>Median</th><th>Mean</th><th>Clean avg.</th><th>Std. dev.</th><th>Laps</th><th>Clean</th><th>Δ field median</th></tr></thead>
        <tbody>{participants.map(({ driverId, driver, ...pace }) => <tr key={driverId}>
          <td><a className="driver-name" href={`/drivers/${driver.slug}`}>{driver.name}</a></td>
          <td>{formatLapTime(pace.fastestRecordedLapMs)}</td><td>{formatLapTime(pace.medianLapMs)}</td><td>{formatLapTime(pace.meanLapMs)}</td><td>{formatLapTime(pace.cleanAverageMs)}</td><td>{(pace.standardDeviationMs / 1000).toFixed(2)} s</td><td>{pace.lapCount}</td><td>{pace.cleanLapCount}</td><td>{signedDeltaLabel(pace.deltaToFieldMedianMs)}</td>
        </tr>)}</tbody>
      </table></div>
      <p className="table-note">Clean average and standard deviation exclude only algorithmically flagged slow lap-time outliers. Pace-vs-field uses the median of clean driver averages in this event: negative is faster than the field median; positive is slower.</p>
      <div className="lap-outlier-list"><span className="eyebrow">LAP-TIME OUTLIERS</span>{participants.filter((item) => item.outlierLaps.length).map((item) => <span className="lap-outlier-chip" key={item.driverId}><b>{item.driver.name}</b> · Lap {item.outlierLaps.join(", ")}</span>)}{participants.every((item) => !item.outlierLaps.length) && <span className="lap-outlier-chip">None under the selected screening rule</span>}</div>
      <p className="lap-outlier-method">Screening rule: slower than the driver median by more than max(3 × 1.4826 × MAD, 2.5 s). An outlier is a timing flag only.</p>
    </section>

    <section className="event-classification-section event-analytics-section" aria-labelledby="event-pace-rankings-title">
      <div className="lap-panel-heading"><div><span className="eyebrow">EVENT-SPECIFIC · CLEAN-LAP METHOD</span><h2 id="event-pace-rankings-title">Pace and consistency rankings</h2></div><span className="badge">Round {String(event.round).padStart(2, "0")}</span></div>
      <div className="event-analysis-ranking-grid">
        <div className="event-analysis-ranking"><h3>Race pace <small>Clean average lap</small></h3>{eventAnalytics.map((entry) => <div className="event-analysis-rank-row" key={entry.driverId}><span>P{entry.paceRank}</span><a href={`/drivers/${driverById(entry.driverId)?.slug}`}>{driverById(entry.driverId)?.name}</a><strong>{entry.paceRank === 1 ? formatLapTime(entry.cleanAverageMs) : `+${(entry.paceGapToFastestCleanAverageMs / 1000).toFixed(3)} s`}</strong><small>{entry.paceRank === 1 ? "FASTEST CLEAN AVG." : `${entry.paceVsFieldMedianPercent < 0 ? "−" : "+"}${Math.abs(entry.paceVsFieldMedianPercent).toFixed(1)}% vs field`}</small></div>)}</div>
        <div className="event-analysis-ranking"><h3>Consistency <small>Derived clean-lap σ · lower is better</small></h3>{[...eventAnalytics].sort((a, b) => a.consistencyRank - b.consistencyRank).map((entry) => <div className="event-analysis-rank-row" key={entry.driverId}><span>P{entry.consistencyRank}</span><a href={`/drivers/${driverById(entry.driverId)?.slug}`}>{driverById(entry.driverId)?.name}</a><strong>σ {(entry.standardDeviationMs / 1000).toFixed(3)} s</strong><small>{entry.cleanLapCount} clean laps</small></div>)}</div>
      </div>
      <details className="event-analytics-disclosure"><summary>Driver pace detail · window, development and distribution</summary><div className="event-analytics-detail-grid">{eventAnalytics.map((entry) => { const driver = driverById(entry.driverId)!; const percentile = entry.cleanLapPercentilesMs; return <article key={entry.driverId}><div className="event-detail-driver"><b>{driver.name}</b><span>PACE P{entry.paceRank} · CONSISTENCY P{entry.consistencyRank}</span></div><div className="event-detail-pair"><span>PACE VS FIELD</span><b>{entry.paceVsFieldMedianPercent < 0 ? "−" : "+"}{Math.abs(entry.paceVsFieldMedianPercent).toFixed(2)}%</b></div><div className="event-detail-pair"><span>PACE WINDOW · ±1.0 s</span><b>{entry.paceWindowPercent.toFixed(0)}% <small>of clean laps</small></b></div><div className="event-detail-pair"><span>PEAK → RACE PACE GAP</span><b>+{(entry.peakPaceGapMs / 1000).toFixed(3)} s</b></div><div className="event-detail-pair"><span>PACE DEVELOPMENT · EARLY / MID / LATE</span><b>{entry.earlyCleanAverageMs === null || entry.middleCleanAverageMs === null || entry.lateCleanAverageMs === null ? "Insufficient clean laps in one or more segments" : `${formatLapTime(entry.earlyCleanAverageMs)} / ${formatLapTime(entry.middleCleanAverageMs)} / ${formatLapTime(entry.lateCleanAverageMs)}`}</b></div><div className="event-detail-pair"><span>LATE VS EARLY</span><b>{entry.lateVsEarlyDeltaMs === null ? "—" : `${entry.lateVsEarlyDeltaMs > 0 ? "+" : entry.lateVsEarlyDeltaMs < 0 ? "−" : ""}${Math.abs(entry.lateVsEarlyDeltaMs / 1000).toFixed(3)} s`}</b></div><div className="event-detail-pair event-distribution"><span>CLEAN PACE DISTRIBUTION · FASTEST / P25 / MEDIAN / P75 / SLOWEST</span><b>{[percentile.fastest, percentile.p25, percentile.median, percentile.p75, percentile.slowest].map(formatLapTime).join(" · ")}</b></div><div className="event-detail-pair"><span>RECORDED LAPS / WINNER LAPS</span><b>{entry.recordedLaps} / {entry.winnerLaps} · {entry.lapCompletionPercent.toFixed(1)}%</b></div></article>; })}</div><p className="table-note">Based on recorded clean lap times. Pace development does not identify the cause of pace changes. Consistency ranking is derived from clean-lap standard deviation and does not replace archived RKS consistency scores.</p></details><p className="table-note">PACE DEVELOPMENT is based on recorded clean laps and does not identify the cause of pace changes.</p>
    </section>

    <section className="panel derived-delta-panel" aria-labelledby="derived-delta-title">
      <div className="lap-panel-heading"><div><span className="eyebrow">CUMULATIVE RECORDED TIME COMPARISON</span><h2 id="derived-delta-title">Derived lap-time delta</h2></div><span className="badge">Not official timing</span></div>
      <div className="derived-driver-selects">
        <label>Driver A<select value={driverAId} onChange={(eventChange) => setDriverAId(eventChange.target.value)}>{participants.map(({ driverId, driver }) => <option key={driverId} value={driverId}>{driver.name}</option>)}</select></label>
        <span aria-hidden="true">vs</span>
        <label>Driver B<select value={driverBId} onChange={(eventChange) => setDriverBId(eventChange.target.value)}>{participants.map(({ driverId, driver }) => <option key={driverId} value={driverId}>{driver.name}</option>)}</select></label>
      </div>
      {driverAId === driverBId ? <p className="lap-empty-message">Choose two different drivers to compare their recorded lap-time totals.</p> : <div className="derived-delta-chart" role="img" aria-label="Derived lap-time delta by completed lap, calculated only from the recorded lap-time sums.">
        <ResponsiveContainer width="100%" height="100%"><LineChart data={derived} margin={{ top: 8, right: 16, bottom: 2, left: 2 }}>
          <CartesianGrid stroke="#ffffff12" strokeDasharray="3 5" vertical={false}/>
          <XAxis dataKey="lap" tick={{ fill: "#92969b", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#35383b" }} tickMargin={8}/>
          <YAxis tickFormatter={(value: number) => signedDeltaLabel(value)} tick={{ fill: "#92969b", fontSize: 9 }} tickLine={false} axisLine={false} width={54}/>
          <Tooltip contentStyle={{ background: "#191b1d", border: "1px solid #3a3c3f", borderRadius: 8, color: "#fff", fontSize: 11 }} labelFormatter={(value) => `Lap ${value}`} formatter={(value) => [signedDeltaLabel(Number(value)), "Driver B − Driver A"]}/>
          <Line type="monotone" dataKey="deltaMs" name="deltaMs" stroke="#ed3438" strokeWidth={2.4} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} isAnimationActive={false}/>
        </LineChart></ResponsiveContainer>
      </div>}
      <p className="lap-chart-footnote">Calculated from recorded lap times and excluding the unrecorded start-to-line segment. It is not an official gap or race classification delta.</p>
    </section>
  </div>;
}
