import Link from "@/components/site-link";
import { season2026 } from "@/data/2026/season";
import { auditLapTimes2026, driverById, formatLapTime, formatRaceTime, pointsForResult } from "@/data/2026/selectors";

export function RaceClassification({ round }: { round: number }) {
  const event = season2026.events.find((item) => item.round === round);
  if (!event || event.status !== "complete") return null;
  const fastestDriverId = event.fastestLap?.driverId;
  const lapDiscrepancies = auditLapTimes2026().filter((item) => item.eventId === event.id);
  return <div className="table-scroll classification-scroll">
    <div className="classification-mobile-list" aria-label={`Round ${round} official race classification`}>
      {event.results.map((result) => {
        const driver = driverById(result.driverId)!;
        const isFastest = fastestDriverId === result.driverId;
        const lapsDown = "lapsDown" in result ? result.lapsDown : null;
        const officialGap = "officialGapToWinnerMs" in result ? result.officialGapToWinnerMs : result.intervalToPreviousMs;
        const interval = result.position === 1 ? "Winner" : lapsDown ? `−${lapsDown} ${lapsDown === 1 ? "lap" : "laps"}` : officialGap == null ? null : `+${(officialGap / 1000).toFixed(3)} s`;
        return <article className={`classification-mobile-row ${result.position <= 3 ? "podium-row" : ""}`} key={result.driverId}>
          <span className="classification-mobile-position">{String(result.position).padStart(2, "0")}</span>
          <div className="classification-mobile-driver"><Link href={`/drivers/${driver.slug}`}>{driver.name}</Link><small>{result.laps} LAPS{isFastest ? " · FASTEST LAP" : ""}</small></div>
          <div className="classification-mobile-time"><strong>{result.officialTotalTimeMs === null ? interval : formatRaceTime(result.officialTotalTimeMs)}</strong>{result.officialTotalTimeMs !== null && <small>{interval}</small>}<small>{formatLapTime(result.officialBestLapMs)} official best</small></div>
        </article>;
      })}
    </div>
    <table className="standings classification-table">
      <thead><tr><th>Pos</th><th>Driver</th><th className="hide-mobile">Kart</th><th>Laps</th>{round !== 3 && <th>Time</th>}<th>{round === 3 ? "Official gap" : "Interval"}</th><th>Official best lap</th><th>Pts</th></tr></thead>
      <tbody>{event.results.map((result) => {
        const driver = driverById(result.driverId)!;
        const isFastest = fastestDriverId === result.driverId;
        const lapsDown = "lapsDown" in result ? result.lapsDown : null;
        const officialGap = "officialGapToWinnerMs" in result ? result.officialGapToWinnerMs : result.intervalToPreviousMs;
        const interval = lapsDown ? `−${lapsDown} ${lapsDown === 1 ? "lap" : "laps"}` : officialGap == null ? "—" : `+${(officialGap / 1000).toFixed(3)} s`;
        return <tr key={result.driverId} className={`${result.position <= 3 ? "podium-row " : ""}${isFastest ? "fastest-row" : ""}`}>
          <td className="pos">P{result.position}</td>
          <td><Link className="driver-name" href={`/drivers/${driver.slug}`}>{driver.name}</Link>{isFastest&&<span className="result-tag fastest-tag">FASTEST LAP</span>}</td>
          <td className="hide-mobile">{result.kartNumber ?? "—"}</td>
          <td>{result.laps}</td>
          {round !== 3 && <td className="result-time">{formatRaceTime(result.officialTotalTimeMs)}</td>}
          <td>{result.position === 1 ? "Winner" : interval}</td>
          <td className="result-time">{formatLapTime(result.officialBestLapMs)}</td>
          <td className="points-cell">{pointsForResult(result.position, isFastest)}</td>
        </tr>;
      })}</tbody>
    </table>
    <p className="table-note">Classification gaps and official best laps follow the supplied source. Round 3 total race times were not supplied; recorded lap sums are never substituted.</p>
    {lapDiscrepancies.map((item) => <p className="lap-time-discrepancy-note" key={item.driverId}><strong>Source discrepancy · {driverById(item.driverId)?.name}:</strong> Daytona’s classification lists an official best lap of {formatLapTime(item.officialBestLapMs)}. The lap sheet records {formatLapTime(item.fastestRecordedLapMs)} on lap {item.fastestRecordedLapNumber}. Both values are preserved; analysis labels the timing-sheet value as the fastest recorded lap.</p>)}
  </div>;
}

export function QualifyingClassification({ round }: { round: number }) {
  const event = season2026.events.find((item) => item.round === round);
  if (!event || event.status !== "complete") return null;
  return <div>
    <div className="table-scroll classification-scroll"><table className="standings qualification-table">
      <thead><tr><th>Pos</th><th>Driver</th>{event.round === 3 && <th>Qualifying time</th>}</tr></thead>
      <tbody>{event.qualifying.map((id, index) => {
        const driver = driverById(id)!;
        const timeMs = "qualifyingTimes" in event ? event.qualifyingTimes.find((row) => row.driverId === id)?.timeMs : null;
        return <tr key={id} className={index === 0 ? "pole-row" : ""}><td className="pos">P{index + 1}</td><td><Link className="driver-name" href={`/drivers/${driver.slug}`}>{driver.name}</Link>{index === 0&&<span className="result-tag pole-tag">POLE</span>}</td>{event.round === 3 && <td className="result-time">{formatLapTime(timeMs)}</td>}</tr>;
      })}</tbody>
    </table></div>
    <p className="table-note">{round === 1 ? "Only the first three positions are confirmed." : round === 3 ? "Nine qualifying positions and times are present in the supplied transcription." : "The listed order is confirmed for all nine entrants."}</p>
  </div>;
}
