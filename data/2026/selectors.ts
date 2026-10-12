import { season2026, type RksDriverId } from "./season";

export const allDrivers2026 = season2026.drivers;
export const completedEvents2026 = season2026.events.filter((event) => event.status === "complete");
export const latestCompletedEvent2026 = completedEvents2026.at(-1)!;

export function driverById(id: string) {
  return season2026.drivers.find((driver) => driver.id === id);
}

export function driverBySlug(slug: string) {
  return season2026.drivers.find((driver) => driver.slug === slug);
}

export function tierForRating(rating: number) {
  if (rating >= 85) return "S";
  if (rating >= 70) return "A";
  if (rating >= 50) return "B";
  if (rating >= 35) return "C";
  return "D";
}

export function pointsForResult(position: number, fastestLap: boolean) {
  const points = season2026.pointsByPosition[position - 1] ?? 0;
  return points + (fastestLap && position <= 10 && season2026.fastestLapBonusTopTenOnly ? season2026.fastestLapBonus : 0);
}

export function getStandings2026() {
  const rows = season2026.drivers.map((driver) => {
    const results = completedEvents2026.flatMap((event) => event.results.filter((result) => result.driverId === driver.id).map((result) => ({ event, result })));
    const qualifying = completedEvents2026.flatMap((event) => event.qualifying.flatMap((id, index) => id === driver.id ? [{ event, position: index + 1 }] : []));
    const wins = results.filter(({ result }) => result.position === 1).length;
    const podiums = results.filter(({ result }) => result.position <= 3).length;
    const fastestLaps = completedEvents2026.filter((event) => event.fastestLap?.driverId === driver.id).length;
    const points = results.reduce((sum, { event, result }) => sum + pointsForResult(result.position, event.fastestLap?.driverId === driver.id), 0);
    const finishes = results.map(({ result }) => result.position);
    const qualifyingPositions = qualifying.map((entry) => entry.position);
    const previousPoints = completedEvents2026.slice(0, -1).flatMap((event) => event.results.filter((result) => result.driverId === driver.id).map((result) => pointsForResult(result.position, event.fastestLap?.driverId === driver.id))).reduce((a, b) => a + b, 0);
    return {
      ...driver,
      tier: tierForRating(driver.rating),
      points,
      starts: results.length,
      wins,
      podiums,
      poles: qualifying.filter((entry) => entry.position === 1).length,
      fastestLaps,
      averageFinish: mean(finishes),
      bestFinish: finishes.length ? Math.min(...finishes) : null,
      averageQualifying: mean(qualifyingPositions),
      latestQualifying: qualifying.at(-1)?.position ?? null,
      lastRaceFinish: results.at(-1)?.result.position ?? null,
      pointsChange: points - previousPoints,
      results,
      qualifying,
    };
  });
  rows.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  let previousPoints: number | null = null;
  let previousPosition = 0;
  return rows.map((row, index) => {
    if (row.points !== previousPoints) previousPosition = index + 1;
    previousPoints = row.points;
    return { ...row, position: previousPosition, gapToLeader: rows[0]!.points - row.points };
  });
}

export function driverStats2026(driverId: RksDriverId) {
  return getStandings2026().find((row) => row.id === driverId)!;
}

export function championshipProgression2026(driverIds: readonly string[] = ["DRV_TYLER", "DRV_JONAH", "DRV_LENNARD_F", "DRV_LOUIS"]) {
  return season2026.events.map((event) => {
    const row: Record<string, number | string | null> = { round: `Round ${event.round}` };
    for (const id of driverIds) {
      row[id] = event.status === "complete"
        ? completedEvents2026.filter((item) => item.round <= event.round).flatMap((item) => item.results.filter((result) => result.driverId === id).map((result) => pointsForResult(result.position, item.fastestLap?.driverId === id))).reduce((a, b) => a + b, 0)
        : null;
    }
    row.eventId = event.id;
    return row;
  });
}

export function headToHead2026(driverAId: RksDriverId, driverBId: RksDriverId) {
  const a = driverStats2026(driverAId);
  const b = driverStats2026(driverBId);
  const races = completedEvents2026.flatMap((event) => {
    const resultA = event.results.find((result) => result.driverId === driverAId);
    const resultB = event.results.find((result) => result.driverId === driverBId);
    if (!resultA || !resultB) return [];
    return [{ round: event.round, positionA: resultA.position, positionB: resultB.position, winner: resultA.position === resultB.position ? "tie" as const : resultA.position < resultB.position ? "a" as const : "b" as const }];
  });
  return { a, b, races, recordA: races.filter((race) => race.winner === "a").length, recordB: races.filter((race) => race.winner === "b").length, ties: races.filter((race) => race.winner === "tie").length };
}

export function formatLapTime(ms: number | null | undefined) {
  if (ms == null || !Number.isFinite(ms)) return "—";
  const minutes = Math.floor(ms / 60_000);
  const seconds = ((ms % 60_000) / 1000).toFixed(3).padStart(6, "0");
  return minutes ? `${minutes}:${seconds}` : seconds;
}

export function formatRaceTime(ms: number | null | undefined) {
  if (ms == null || !Number.isFinite(ms)) return "—";
  const minutes = Math.floor(ms / 60_000);
  const seconds = ((ms % 60_000) / 1000).toFixed(2).padStart(5, "0");
  return `${minutes}:${seconds}`;
}

function mean(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}
