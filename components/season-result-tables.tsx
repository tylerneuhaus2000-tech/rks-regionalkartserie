import Link from "next/link";
import { season2026 } from "@/data/2026/season";
import { driverById, formatLapTime, formatRaceTime, pointsForResult } from "@/data/2026/selectors";

export function RaceClassification({ round }: { round: number }) {
  const event = season2026.events.find((item) => item.round === round);
  if (!event || event.status !== "complete") return null;
  const fastestDriverId = event.fastestLap?.driverId;
  return <div className="table-scroll classification-scroll">
    <table className="standings classification-table">
      <thead><tr><th>Pos</th><th>Driver</th><th className="hide-mobile">Kart</th><th>Laps</th><th>Time</th><th>Interval</th><th>Best lap</th><th>Pts</th></tr></thead>
      <tbody>{event.results.map((result) => {
        const driver = driverById(result.driverId)!;
        const isFastest = fastestDriverId === result.driverId;
        const lapsDown = "lapsDown" in result ? result.lapsDown : null;
        const interval = lapsDown ? `−${lapsDown} lap` : result.intervalToPreviousMs == null ? "—" : `+${(result.intervalToPreviousMs / 1000).toFixed(2)} s`;
        return <tr key={result.driverId} className={`${result.position <= 3 ? "podium-row " : ""}${isFastest ? "fastest-row" : ""}`}>
          <td className="pos">P{result.position}</td>
          <td><Link className="driver-name" href={`/drivers/${driver.slug}`}>{driver.name}</Link>{isFastest&&<span className="result-tag fastest-tag">FASTEST LAP</span>}</td>
          <td className="hide-mobile">{result.kartNumber ?? "—"}</td>
          <td>{result.laps}</td>
          <td className="result-time">{formatRaceTime(result.officialTotalTimeMs)}</td>
          <td>{result.position === 1 ? "Winner" : interval}</td>
          <td className="result-time">{formatLapTime(result.bestLapMs)}</td>
          <td className="points-cell">{pointsForResult(result.position, isFastest)}</td>
        </tr>;
      })}</tbody>
    </table>
    <p className="table-note">Intervals are taken from the supplied classification where listed. Official total race times are preserved separately.</p>
  </div>;
}

export function QualifyingClassification({ round }: { round: number }) {
  const event = season2026.events.find((item) => item.round === round);
  if (!event || event.status !== "complete") return null;
  return <div>
    <div className="table-scroll classification-scroll"><table className="standings qualification-table">
      <thead><tr><th>Pos</th><th>Driver</th><th>Best lap</th><th>Status</th></tr></thead>
      <tbody>{event.qualifying.map((id, index) => {
        const driver = driverById(id)!;
        return <tr key={id} className={index === 0 ? "pole-row" : ""}><td className="pos">P{index + 1}</td><td><Link className="driver-name" href={`/drivers/${driver.slug}`}>{driver.name}</Link>{index === 0&&<span className="result-tag pole-tag">POLE</span>}</td><td>—</td><td>Position confirmed</td></tr>;
      })}</tbody>
    </table></div>
    <p className="table-note">Qualifying lap times were not recorded. {round === 1 ? "Only the first three positions are confirmed." : "The listed order is confirmed for all nine entrants."}</p>
  </div>;
}
