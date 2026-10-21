import { season2026, type RksDriverId } from "./season.ts";

export const allDrivers2026 = season2026.drivers;
export const completedEvents2026 = season2026.events.filter((event) => event.status === "complete");
export const latestCompletedEvent2026 = completedEvents2026.at(-1)!;

export function driverById(id: string) {
  return season2026.drivers.find((driver) => driver.id === id);
}

export function driverBySlug(slug: string) {
  return season2026.drivers.find((driver) => driver.slug === slug);
}

export function layoutName2026(layoutId: string | null) {
  return Object.values(season2026.layouts).find((layout) => layout.id === layoutId)?.name ?? null;
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
    const positionsGained = qualifying.flatMap(({ event, position }) => {
      const result = event.results.find((item) => item.driverId === driver.id);
      return result ? [{ eventId: event.id, round: event.round, qualifyingPosition: position, finishPosition: result.position, positionsGained: position - result.position }] : [];
    });
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
      pointsPerStart: results.length ? points / results.length : null,
      winRatePercent: results.length ? wins / results.length * 100 : null,
      podiumRatePercent: results.length ? podiums / results.length * 100 : null,
      fastestLapRatePercent: results.length ? fastestLaps / results.length * 100 : null,
      averageFinish: mean(finishes),
      bestFinish: finishes.length ? Math.min(...finishes) : null,
      averageQualifying: mean(qualifyingPositions),
      latestQualifying: qualifying.at(-1)?.position ?? null,
      lastRaceFinish: results.at(-1)?.result.position ?? null,
      pointsChange: points - previousPoints,
      positionsGained,
      qualifyingSamples: positionsGained.length,
      averagePositionsGained: mean(positionsGained.map((entry) => entry.positionsGained)),
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
  const h2hRecord = (outcomes: readonly ("a" | "b" | "tie")[]) => ({
    a: outcomes.filter((outcome) => outcome === "a").length,
    b: outcomes.filter((outcome) => outcome === "b").length,
    ties: outcomes.filter((outcome) => outcome === "tie").length,
    samples: outcomes.length,
  });
  const sharedEvents = completedEvents2026.filter((event) => event.results.some((result) => result.driverId === driverAId) && event.results.some((result) => result.driverId === driverBId));
  const qualifyingOutcomes = sharedEvents.flatMap((event) => {
    const positionA = event.qualifying.findIndex((id) => id === driverAId);
    const positionB = event.qualifying.findIndex((id) => id === driverBId);
    if (positionA < 0 || positionB < 0) return [];
    return [positionA === positionB ? "tie" as const : positionA < positionB ? "a" as const : "b" as const];
  });
  const fastestLapOutcomes = sharedEvents.flatMap((event) => {
    const resultA = event.results.find((result) => result.driverId === driverAId);
    const resultB = event.results.find((result) => result.driverId === driverBId);
    if (!resultA || !resultB) return [];
    return [resultA.officialBestLapMs === resultB.officialBestLapMs ? "tie" as const : resultA.officialBestLapMs < resultB.officialBestLapMs ? "a" as const : "b" as const];
  });
  const cleanPaceOutcomes = sharedEvents.flatMap((event) => {
    const paceA = lapPaceMetrics2026(event.id, driverAId);
    const paceB = lapPaceMetrics2026(event.id, driverBId);
    if (!paceA || !paceB || event.layoutId === null) return [];
    return [paceA.cleanAverageMs === paceB.cleanAverageMs ? "tie" as const : paceA.cleanAverageMs < paceB.cleanAverageMs ? "a" as const : "b" as const];
  });
  return {
    a, b, races,
    recordA: races.filter((race) => race.winner === "a").length,
    recordB: races.filter((race) => race.winner === "b").length,
    ties: races.filter((race) => race.winner === "tie").length,
    records: {
      raceFinish: h2hRecord(races.map((race) => race.winner)),
      qualifying: h2hRecord(qualifyingOutcomes),
      fastestLap: h2hRecord(fastestLapOutcomes),
      cleanRacePace: h2hRecord(cleanPaceOutcomes),
    },
  };
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

export type LapPaceMetrics2026 = {
  eventId: string;
  driverId: string;
  fastestRecordedLapMs: number;
  medianLapMs: number;
  meanLapMs: number;
  cleanAverageMs: number;
  standardDeviationMs: number;
  lapCount: number;
  cleanLapCount: number;
  eventFieldMedianMs: number;
  deltaToFieldMedianMs: number;
  outlierLaps: number[];
  cleanTimesMs: number[];
  fastestCleanLapMs: number;
  paceWindowPercent: number;
  peakPaceGapMs: number;
  earlyCleanAverageMs: number | null;
  middleCleanAverageMs: number | null;
  lateCleanAverageMs: number | null;
  lateVsEarlyDeltaMs: number | null;
  cleanLapPercentilesMs: { fastest: number; p25: number; median: number; p75: number; slowest: number };
};

export function median(values: readonly number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

function meanValues(values: readonly number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function standardDeviation(values: readonly number[]) {
  const average = meanValues(values);
  return average === null ? null : Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length);
}

export function percentile2026(values: readonly number[], fraction: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * Math.max(0, Math.min(1, fraction));
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (position - lower);
}

function splitIntoThirds<T>(values: readonly T[]) {
  const base = Math.floor(values.length / 3);
  const remainder = values.length % 3;
  const earlyCount = base + (remainder > 0 ? 1 : 0);
  const middleCount = base + (remainder > 1 ? 1 : 0);
  return [values.slice(0, earlyCount), values.slice(earlyCount, earlyCount + middleCount), values.slice(earlyCount + middleCount)] as const;
}

function isLapTimeOutlier(value: number, center: number, mad: number, eventId: string) {
  // R3's supplied transcription defines a symmetric 3.000 s median threshold.
  // Preserve the established R1/R2 MAD rule and their published analytics.
  if (eventId === "2026-R03") return Math.abs(value - center) > 3_000;
  // A robust, one-sided rule marks only unusually slow laps for analysis.
  return value > center + Math.max(3 * 1.4826 * mad, 2_500);
}

export function lapPaceMetrics2026(eventId: string, driverId: string): LapPaceMetrics2026 | null {
  const event = season2026.events.find((candidate) => candidate.id === eventId);
  const driverLaps = event?.lapTimes.filter((lap) => lap.driverId === driverId) ?? [];
  if (!event || !driverLaps.length) return null;

  const times = driverLaps.map((lap) => lap.lapTimeMs);
  const center = median(times)!;
  const deviations = times.map((time) => Math.abs(time - center));
  const mad = median(deviations)!;
  const outlierLaps = driverLaps.filter((lap) => isLapTimeOutlier(lap.lapTimeMs, center, mad, eventId)).map((lap) => lap.lapNumber);
  const outlierSet = new Set(outlierLaps);
  const cleanLaps = driverLaps.filter((lap) => !outlierSet.has(lap.lapNumber));
  const cleanTimes = cleanLaps.map((lap) => lap.lapTimeMs);
  const fieldTimes = event.lapTimes.map((lap) => lap.lapTimeMs);
  const eventFieldMedianMs = median(fieldTimes)!;
  const average = meanValues(times)!;
  const cleanAverageMs = meanValues(cleanTimes)!;
  const fastestCleanLapMs = Math.min(...cleanTimes);
  const [earlyLaps, middleLaps, lateLaps] = splitIntoThirds(driverLaps);
  const cleanAverageFor = (laps: typeof driverLaps) => meanValues(laps.filter((lap) => !outlierSet.has(lap.lapNumber)).map((lap) => lap.lapTimeMs));
  const earlyCleanAverageMs = cleanAverageFor(earlyLaps);
  const middleCleanAverageMs = cleanAverageFor(middleLaps);
  const lateCleanAverageMs = cleanAverageFor(lateLaps);

  return {
    eventId,
    driverId,
    fastestRecordedLapMs: Math.min(...times),
    medianLapMs: center,
    meanLapMs: average,
    cleanAverageMs,
    standardDeviationMs: standardDeviation(cleanTimes)!,
    lapCount: driverLaps.length,
    cleanLapCount: cleanLaps.length,
    eventFieldMedianMs,
    deltaToFieldMedianMs: center - eventFieldMedianMs,
    outlierLaps,
    cleanTimesMs: cleanTimes,
    fastestCleanLapMs,
    paceWindowPercent: cleanTimes.filter((time) => Math.abs(time - cleanAverageMs) <= 1_000).length / cleanTimes.length * 100,
    peakPaceGapMs: cleanAverageMs - fastestCleanLapMs,
    earlyCleanAverageMs,
    middleCleanAverageMs,
    lateCleanAverageMs,
    lateVsEarlyDeltaMs: earlyCleanAverageMs === null || lateCleanAverageMs === null ? null : lateCleanAverageMs - earlyCleanAverageMs,
    cleanLapPercentilesMs: {
      fastest: fastestCleanLapMs,
      p25: percentile2026(cleanTimes, 0.25)!,
      median: percentile2026(cleanTimes, 0.5)!,
      p75: percentile2026(cleanTimes, 0.75)!,
      slowest: Math.max(...cleanTimes),
    },
  };
}

export type LapTimeDiscrepancy2026 = {
  eventId: string;
  round: number;
  driverId: string;
  officialBestLapMs: number;
  fastestRecordedLapMs: number;
  fastestRecordedLapNumber: number;
  sourceReference: string;
};

/** Compare every completed classification best lap with that driver's recorded lap rows. */
export function auditLapTimes2026(): LapTimeDiscrepancy2026[] {
  return season2026.events.flatMap((event) => {
    if (event.status !== "complete") return [];
    return event.results.flatMap((result) => {
      const driverLaps = event.lapTimes.filter((lap) => lap.driverId === result.driverId);
      if (!driverLaps.length) return [];
      const fastestRecordedLap = driverLaps.reduce((fastest, lap) => lap.lapTimeMs < fastest.lapTimeMs ? lap : fastest);
      if (fastestRecordedLap.lapTimeMs === result.officialBestLapMs) return [];
      return [{
        eventId: event.id,
        round: event.round,
        driverId: result.driverId,
        officialBestLapMs: result.officialBestLapMs,
        fastestRecordedLapMs: fastestRecordedLap.lapTimeMs,
        fastestRecordedLapNumber: fastestRecordedLap.lapNumber,
        sourceReference: fastestRecordedLap.sourceReference,
      }];
    });
  });
}

export function eventLapPace2026(eventId: string) {
  const event = season2026.events.find((candidate) => candidate.id === eventId);
  if (!event) return [];
  const driverIds = [...new Set(event.lapTimes.map((lap) => lap.driverId))];
  return driverIds.map((driverId) => lapPaceMetrics2026(eventId, driverId)!).sort((a, b) => a.cleanAverageMs - b.cleanAverageMs || a.driverId.localeCompare(b.driverId));
}

export type EventPaceAnalytics2026 = LapPaceMetrics2026 & {
  paceRank: number;
  paceGapToFastestCleanAverageMs: number;
  paceGapPercent: number;
  paceVsFieldMedianPercent: number;
  consistencyRank: number;
  recordedLaps: number;
  winnerLaps: number;
  lapCompletionPercent: number;
};

/** Event field median is the median of each driver's clean average, so layouts remain isolated. */
export function eventPaceAnalytics2026(eventId: string): EventPaceAnalytics2026[] {
  const event = season2026.events.find((candidate) => candidate.id === eventId);
  if (!event || event.status !== "complete" || event.layoutId === null) return [];
  const paces = eventLapPace2026(eventId);
  if (!paces.length) return [];
  const fastest = paces[0]!.cleanAverageMs;
  const cleanFieldMedian = median(paces.map((pace) => pace.cleanAverageMs))!;
  const winnerLaps = event.results.find((result) => result.position === 1)?.laps;
  if (!winnerLaps) return [];
  const consistencyRanks = [...paces].sort((a, b) => a.standardDeviationMs - b.standardDeviationMs || a.driverId.localeCompare(b.driverId));
  const consistencyRankByDriver = new Map(consistencyRanks.map((pace, index) => [pace.driverId, index + 1]));
  return paces.map((pace, index) => {
    const recordedLaps = event.lapTimes.filter((lap) => lap.driverId === pace.driverId).length;
    return {
      ...pace,
      paceRank: index + 1,
      paceGapToFastestCleanAverageMs: pace.cleanAverageMs - fastest,
      paceGapPercent: (pace.cleanAverageMs - fastest) / fastest * 100,
      paceVsFieldMedianPercent: (pace.cleanAverageMs - cleanFieldMedian) / cleanFieldMedian * 100,
      consistencyRank: consistencyRankByDriver.get(pace.driverId)!,
      recordedLaps,
      winnerLaps,
      lapCompletionPercent: recordedLaps / winnerLaps * 100,
    };
  });
}

/** A compact result for a driver's classified event, assembled from the canonical selectors. */
export function eventPerformanceSummary2026(eventId: string, driverId: string) {
  const event = season2026.events.find((candidate) => candidate.id === eventId);
  const result = event?.results.find((item) => item.driverId === driverId);
  if (!event || !result) return null;
  const qualifyingIndex = event.qualifying.findIndex((id) => id === driverId);
  const qualifyingPosition = qualifyingIndex < 0 ? null : qualifyingIndex + 1;
  const pace = eventPaceAnalytics2026(eventId).find((item) => item.driverId === driverId) ?? null;
  return {
    eventId,
    driverId,
    finishPosition: result.position,
    qualifyingPosition,
    points: pointsForResult(result.position, event.fastestLap?.driverId === driverId),
    officialBestLapMs: result.officialBestLapMs,
    positionsChange: qualifyingPosition === null ? null : qualifyingPosition - result.position,
    pace,
  };
}

/** Championship points earned in a single round, including the official fastest-lap bonus. */
export function pointsByRound2026(driverId: string) {
  return completedEvents2026.flatMap((event) => {
    const result = event.results.find((item) => item.driverId === driverId);
    return result ? [{ eventId: event.id, round: event.round, points: pointsForResult(result.position, event.fastestLap?.driverId === driverId) }] : [];
  });
}

export function headToHeadPointsDeltaByRound2026(driverAId: string, driverBId: string) {
  const pointsA = new Map(pointsByRound2026(driverAId).map((entry) => [entry.eventId, entry]));
  const pointsB = new Map(pointsByRound2026(driverBId).map((entry) => [entry.eventId, entry]));
  return completedEvents2026.flatMap((event) => {
    const a = pointsA.get(event.id);
    const b = pointsB.get(event.id);
    return a && b ? [{ eventId: event.id, round: event.round, pointsA: a.points, pointsB: b.points, delta: a.points - b.points }] : [];
  });
}

export function calculateTitleStatus2026(points: number, leaderPoints: number, remainingRaces: number) {
  const maximumPointsPerRace = Math.max(...season2026.pointsByPosition) + season2026.fastestLapBonus;
  if (points === leaderPoints) return { status: "leader" as const, remainingRaces, maximumAvailablePoints: remainingRaces * maximumPointsPerRace };
  return {
    status: points + remainingRaces * maximumPointsPerRace >= leaderPoints ? "contender" as const : "eliminated" as const,
    remainingRaces,
    maximumAvailablePoints: remainingRaces * maximumPointsPerRace,
  };
}

export function titleStatus2026(driverId: string) {
  // The number of scoring opportunities in Round 4 is not yet confirmed.
  // A one-race maximum would wrongly eliminate drivers if it has two races.
  if (season2026.events.some((event) => event.round === 4 && event.status === "upcoming")) return null;
  const standings = getStandings2026();
  const row = standings.find((item) => item.id === driverId);
  if (!row) return null;
  const leaderPoints = Math.max(...standings.map((item) => item.points));
  const remainingRaces = season2026.events.filter((event) => event.status === "upcoming").length;
  return calculateTitleStatus2026(row.points, leaderPoints, remainingRaces);
}

export function closestOfficialFinish2026() {
  return completedEvents2026.flatMap((event) => event.results.flatMap((result) => result.intervalToPreviousMs === null || result.laps !== event.results.find((candidate) => candidate.position === result.position - 1)?.laps ? [] : [{ eventId: event.id, round: event.round, driverId: result.driverId, aheadOfDriverId: event.results.find((candidate) => candidate.position === result.position - 1)?.driverId ?? null, gapMs: result.intervalToPreviousMs }])).sort((a, b) => a.gapMs - b.gapMs)[0] ?? null;
}

export function kartUsage2026() {
  const records = new Map<string, { kartNumber: number; venue: string; layoutId: string; events: Set<string>; drivers: Set<string>; eventDrivers: Map<string, Set<string>>; recordedLaps: number; relativePaceSamples: { eventId: string; driverId: string; deltaToFieldMedianMs: number }[]; bestRecordedLapMs: number }>();
  for (const event of completedEvents2026) {
    const paces = new Map(eventLapPace2026(event.id).map((pace) => [pace.driverId, pace]));
    for (const lap of event.lapTimes) {
      if (event.layoutId === null) continue;
      const key = `${event.venue}|${event.layoutId}|${lap.kartNumber}`;
      const current = records.get(key) ?? {
        kartNumber: lap.kartNumber,
        venue: event.venue,
        layoutId: event.layoutId,
        events: new Set<string>(),
        drivers: new Set<string>(),
        eventDrivers: new Map<string, Set<string>>(),
        recordedLaps: 0,
        relativePaceSamples: [],
        bestRecordedLapMs: Number.POSITIVE_INFINITY,
      };
      current.events.add(event.id);
      current.drivers.add(lap.driverId);
      const eventDrivers = current.eventDrivers.get(event.id) ?? new Set<string>();
      eventDrivers.add(lap.driverId);
      current.eventDrivers.set(event.id, eventDrivers);
      current.recordedLaps++;
      current.bestRecordedLapMs = Math.min(current.bestRecordedLapMs, lap.lapTimeMs);
      records.set(key, current);
    }
    for (const current of records.values()) {
      if (!current.events.has(event.id)) continue;
      for (const driverId of current.eventDrivers.get(event.id) ?? []) {
        if (current.relativePaceSamples.some((sample) => sample.eventId === event.id && sample.driverId === driverId)) continue;
        const pace = paces.get(driverId);
        if (pace) current.relativePaceSamples.push({ eventId: event.id, driverId, deltaToFieldMedianMs: pace.deltaToFieldMedianMs });
      }
    }
  }
  return [...records.values()].map((record) => ({
    kartNumber: record.kartNumber,
    venue: record.venue,
    layoutId: record.layoutId,
    eventsUsed: [...record.events],
    drivers: [...record.drivers],
    starts: record.events.size,
    recordedLaps: record.recordedLaps,
    bestRecordedLapMs: record.bestRecordedLapMs,
    relativePaceSamples: record.relativePaceSamples,
  })).sort((a, b) => a.venue.localeCompare(b.venue) || a.layoutId.localeCompare(b.layoutId) || a.kartNumber - b.kartNumber);
}

/** Presentation-ready derived season summary; all ranks, leaders and records stay centralized here. */
export function statisticsSnapshot2026() {
  const standings = getStandings2026();
  const rankTop = (key: "pointsPerStart" | "winRatePercent" | "podiumRatePercent" | "fastestLapRatePercent" | "averageFinish" | "averageQualifying" | "averagePositionsGained", order: "high" | "low") => {
    const ordered = standings.filter((driver) => driver.starts > 0 && driver[key] !== null && (!key.includes("Rate") || Number(driver[key]) > 0))
      .sort((a, b) => (order === "high" ? Number(b[key]) - Number(a[key]) : Number(a[key]) - Number(b[key])) || a.position - b.position);
    let previousValue: number | null = null;
    let previousRank = 0;
    return ordered.flatMap((driver, index) => {
      const numericValue = Number(driver[key]);
      const position = index > 0 && numericValue === previousValue ? previousRank : index + 1;
      previousValue = numericValue;
      previousRank = position;
      if (position > 3) return [];
      return [{
        position,
        driverId: driver.id,
        name: driver.name,
        slug: driver.slug,
        value: key.includes("Rate") ? `${numericValue.toFixed(0)}%` : key === "averagePositionsGained" ? `${numericValue > 0 ? "+" : ""}${numericValue.toFixed(1)}` : numericValue.toFixed(1),
        sampleCount: key === "averagePositionsGained" || key === "averageQualifying" ? driver.qualifying.length : driver.starts,
        sampleLabel: key === "averagePositionsGained" || key === "averageQualifying"
          ? driver.qualifying.length === 1 ? "qualifying sample" : "qualifying samples"
          : driver.starts === 1 ? "start" : "starts",
      }];
    });
  };
  const metricLeader = (label: string, values: readonly { name: string; value: number | null }[], direction: "high" | "low") => {
    const eligible = values.flatMap((entry) => entry.value === null ? [] : [entry.value]);
    const best = direction === "high" ? Math.max(...eligible) : Math.min(...eligible);
    return { label, value: Number.isFinite(best) ? best : null, displayValue: !Number.isFinite(best) ? null : label === "Best average finish" ? best.toFixed(1) : String(best), leaders: values.filter((entry) => entry.value === best).map((entry) => entry.name) };
  };
  const metricLeaders = [
    metricLeader("Most championship points", standings.map((driver) => ({ name: driver.name, value: driver.points })), "high"),
    metricLeader("Most race wins", standings.map((driver) => ({ name: driver.name, value: driver.wins })), "high"),
    metricLeader("Most podiums", standings.map((driver) => ({ name: driver.name, value: driver.podiums })), "high"),
    metricLeader("Most poles", standings.map((driver) => ({ name: driver.name, value: driver.poles })), "high"),
    metricLeader("Most fastest laps · official", standings.map((driver) => ({ name: driver.name, value: driver.fastestLaps })), "high"),
    metricLeader("Best average finish", standings.map((driver) => ({ name: driver.name, value: driver.averageFinish })), "low"),
  ];
  const lapTotals = standings.map((driver) => ({
    driverId: driver.id,
    name: driver.name,
    laps: completedEvents2026.reduce((sum, event) => sum + (event.results.find((result) => result.driverId === driver.id)?.laps ?? 0), 0),
  })).sort((a, b) => b.laps - a.laps || a.driverId.localeCompare(b.driverId));
  const starts = Math.max(...standings.map((driver) => driver.starts));
  const mostLaps = lapTotals[0]?.laps ?? 0;
  const widestWin = completedEvents2026.flatMap((event) => {
    const winner = event.results.find((result) => result.position === 1)!;
    const second = event.results.find((result) => result.position === 2)!;
    const marginMs = second.officialTotalTimeMs !== null && winner.officialTotalTimeMs !== null
      ? second.officialTotalTimeMs - winner.officialTotalTimeMs : "officialGapToWinnerMs" in second ? second.officialGapToWinnerMs : null;
    return marginMs === null ? [] : [{ eventId: event.id, round: event.round, winnerId: winner.driverId, marginMs }];
  }).sort((a, b) => b.marginMs - a.marginMs)[0] ?? null;
  const events = completedEvents2026.map((event) => {
    const fastestRecorded = event.lapTimes.reduce((fastest, lap) => lap.lapTimeMs < fastest.lapTimeMs ? lap : fastest);
    const paces = eventPaceAnalytics2026(event.id);
    return {
      eventId: event.id,
      round: event.round,
      date: event.date,
      layoutId: event.layoutId,
      layoutName: layoutName2026(event.layoutId) ?? event.courseName,
      lapCount: event.lapTimes.length,
      fastestRecordedLapMs: fastestRecorded.lapTimeMs,
      fastestRecordedLapDriverId: fastestRecorded.driverId,
      paceTop: paces.slice(0, 3),
      consistencyTop: [...paces].sort((a, b) => a.consistencyRank - b.consistencyRank).slice(0, 3),
    };
  });
  return {
    championshipRankings: {
      pointsPerStart: rankTop("pointsPerStart", "high"),
      winRate: rankTop("winRatePercent", "high"),
      podiumRate: rankTop("podiumRatePercent", "high"),
      fastestLapRate: rankTop("fastestLapRatePercent", "high"),
    },
    qualifyingRankings: {
      averageQualifying: rankTop("averageQualifying", "low"),
      averagePositionsGained: rankTop("averagePositionsGained", "high"),
    },
    metricLeaders,
    events,
    records: {
      closestOfficialFinish: closestOfficialFinish2026(),
      widestWin,
      mostStarts: { count: starts, drivers: standings.filter((driver) => driver.starts === starts).map((driver) => driver.name) },
      mostClassifiedLaps: { count: mostLaps, drivers: lapTotals.filter((entry) => entry.laps === mostLaps).map((entry) => entry.name) },
    },
  };
}

export function driverLapHistory2026(driverId: string) {
  return season2026.events.flatMap((event) => {
    if (!event.lapTimes.some((lap) => lap.driverId === driverId)) return [];
    const metrics = lapPaceMetrics2026(event.id, driverId)!;
    return [{ event, metrics }];
  });
}

export function derivedLapTimeDelta2026(eventId: string, driverAId: string, driverBId: string) {
  const event = season2026.events.find((candidate) => candidate.id === eventId);
  if (!event || event.layoutId == null || driverAId === driverBId) return [];
  const a = event.lapTimes.filter((lap) => lap.driverId === driverAId).sort((x, y) => x.lapNumber - y.lapNumber);
  const b = event.lapTimes.filter((lap) => lap.driverId === driverBId).sort((x, y) => x.lapNumber - y.lapNumber);
  const sharedLapCount = Math.min(a.length, b.length);
  let cumulativeA = 0;
  let cumulativeB = 0;
  return Array.from({ length: sharedLapCount }, (_, index) => {
    cumulativeA += a[index]!.lapTimeMs;
    cumulativeB += b[index]!.lapTimeMs;
    return { lap: index + 1, deltaMs: cumulativeB - cumulativeA };
  });
}

function mean(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}
