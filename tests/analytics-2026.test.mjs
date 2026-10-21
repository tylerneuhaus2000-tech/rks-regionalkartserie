import test from "node:test";
import assert from "node:assert/strict";
import { season2026 } from "../data/2026/season.ts";
import {
  calculateTitleStatus2026,
  closestOfficialFinish2026,
  driverStats2026,
  eventPerformanceSummary2026,
  eventPaceAnalytics2026,
  headToHead2026,
  headToHeadPointsDeltaByRound2026,
  kartUsage2026,
  lapPaceMetrics2026,
  percentile2026,
  pointsByRound2026,
  statisticsSnapshot2026,
  titleStatus2026,
} from "../data/2026/selectors.ts";

test("points per start and classified participation rates use starts as their denominator", () => {
  const tyler = driverStats2026("DRV_TYLER");
  assert.equal(tyler.points, 71);
  assert.equal(tyler.starts, 3);
  assert.equal(tyler.pointsPerStart, 71 / 3);
  assert.equal(tyler.winRatePercent, 2 / 3 * 100);
  assert.equal(tyler.podiumRatePercent, 100);
  assert.equal(tyler.fastestLapRatePercent, 100);
  assert.equal(driverStats2026("DRV_HENRY").pointsPerStart, 0);
});

test("qualifying position changes use only published qualifying entries", () => {
  const tyler = driverStats2026("DRV_TYLER");
  const jonah = driverStats2026("DRV_JONAH");
  const henry = driverStats2026("DRV_HENRY");
  assert.deepEqual(tyler.positionsGained.map((entry) => [entry.round, entry.qualifyingPosition, entry.finishPosition, entry.positionsGained]), [[1, 2, 1, 1], [2, 2, 2, 0], [3, 1, 1, 0]]);
  assert.equal(tyler.averagePositionsGained, 1 / 3);
  assert.deepEqual(jonah.positionsGained.map((entry) => entry.positionsGained), [-1, 2, -1]);
  assert.equal(jonah.qualifyingSamples, 3);
  assert.equal(henry.qualifyingSamples, 0);
  assert.equal(henry.averagePositionsGained, null);
  assert.equal(season2026.events.find((event) => event.round === 1).qualifying.length, 3, "R1 remains partial; no P4+ positions are inferred");
});

test("clean race pace and consistency rankings are event-specific", () => {
  const r1 = eventPaceAnalytics2026("2026-R01");
  const r2 = eventPaceAnalytics2026("2026-R02");
  assert.equal(r1[0].eventId, "2026-R01");
  assert.equal(r2[0].eventId, "2026-R02");
  assert.equal(r2[0].driverId, "DRV_TYLER");
  assert.equal(r2[0].paceRank, 1);
  assert.equal(r2.find((entry) => entry.driverId === "DRV_JONAH").consistencyRank, 1);
  assert.equal(r1.find((entry) => entry.driverId === "DRV_TYLER").paceRank, 1);
  assert.ok(r2.find((entry) => entry.driverId === "DRV_TYLER").paceVsFieldMedianPercent < 0);
  assert.ok(r2.find((entry) => entry.driverId === "DRV_KILIAN").paceVsFieldMedianPercent > 0);
  assert.ok(Math.abs(r2.find((entry) => entry.driverId === "DRV_TYLER").paceVsFieldMedianPercent - (-1.8136356748)) < 0.000001);
  assert.equal(r2[0].winnerLaps, 27);
  assert.equal(r2[0].recordedLaps, 27);
  assert.equal(r2[0].lapCompletionPercent, 100);
  const louis = r2.find((entry) => entry.driverId === "DRV_LOUIS");
  assert.equal(louis.recordedLaps, 26);
  assert.equal(louis.winnerLaps, 27);
  assert.ok(Math.abs(louis.lapCompletionPercent - (26 / 27 * 100)) < 1e-10);
  assert.equal(eventPaceAnalytics2026("2026-R03").length, 9);
});

test("pace window, peak gap, development, and clean percentiles use the shared clean-lap set", () => {
  const tyler = lapPaceMetrics2026("2026-R02", "DRV_TYLER");
  assert.equal(tyler.cleanLapCount, 26);
  assert.deepEqual(tyler.outlierLaps, [14]);
  assert.equal(tyler.paceWindowPercent, 88.46153846153845);
  assert.equal(tyler.peakPaceGapMs, 885);
  assert.equal(tyler.cleanLapPercentilesMs.fastest, 53940);
  assert.equal(tyler.cleanLapPercentilesMs.p25, 54392.5);
  assert.equal(tyler.cleanLapPercentilesMs.median, 54690);
  assert.equal(tyler.cleanLapPercentilesMs.p75, 55245);
  assert.equal(tyler.cleanLapPercentilesMs.slowest, 56330);
  assert.ok(Math.abs(tyler.earlyCleanAverageMs - 54976.6666667) < 0.001);
  assert.equal(tyler.middleCleanAverageMs, 54716.25);
  assert.equal(tyler.lateCleanAverageMs, 54770);
  assert.ok(Math.abs(tyler.lateVsEarlyDeltaMs - (-206.6666667)) < 0.001);
  assert.equal(percentile2026([10, 20, 30, 40], 0.25), 17.5);
  assert.equal(percentile2026([], 0.5), null);
});

test("event performance summary reports official result values and available analytics", () => {
  const tyler = eventPerformanceSummary2026("2026-R02", "DRV_TYLER");
  assert.equal(tyler.finishPosition, 2);
  assert.equal(tyler.qualifyingPosition, 2);
  assert.equal(tyler.points, 19);
  assert.equal(tyler.officialBestLapMs, 53940);
  assert.equal(tyler.positionsChange, 0);
  assert.equal(tyler.pace.paceRank, 1);
  assert.equal(eventPerformanceSummary2026("2026-R01", "DRV_HENRY").officialBestLapMs, 87500);
});

test("head-to-head records count only events with both required data points", () => {
  const comparison = headToHead2026("DRV_TYLER", "DRV_JONAH");
  assert.deepEqual(comparison.records.raceFinish, { a: 2, b: 1, ties: 0, samples: 3 });
  assert.deepEqual(comparison.records.qualifying, { a: 2, b: 1, ties: 0, samples: 3 });
  assert.deepEqual(comparison.records.fastestLap, { a: 3, b: 0, ties: 0, samples: 3 });
  assert.equal(comparison.records.cleanRacePace.samples, 3);
  assert.equal(headToHead2026("DRV_HENRY", "DRV_JONAH").records.qualifying.samples, 0);
});

test("championship round deltas include the official fastest-lap bonus", () => {
  assert.deepEqual(pointsByRound2026("DRV_TYLER").map((entry) => entry.points), [26, 19, 26]);
  assert.deepEqual(headToHeadPointsDeltaByRound2026("DRV_TYLER", "DRV_JONAH").map((entry) => entry.delta), [8, -6, 11]);
  assert.equal(headToHeadPointsDeltaByRound2026("DRV_TYLER", "DRV_JONAH").reduce((sum, entry) => sum + entry.delta, 0), 13);
});

test("title eligibility stays unpublished until Round 4 scoring structure is confirmed", () => {
  assert.equal(titleStatus2026("DRV_TYLER"), null);
  assert.equal(titleStatus2026("DRV_JONAH"), null);
  assert.equal(calculateTitleStatus2026(10, 40, 1).status, "eliminated");
  assert.equal(calculateTitleStatus2026(14, 40, 1).status, "contender", "an exact maximum-points tie remains eligible");
});

test("closest finish uses official classification intervals and kart usage remains layout scoped", () => {
  assert.deepEqual(closestOfficialFinish2026(), { eventId: "2026-R02", round: 2, driverId: "DRV_TYLER", aheadOfDriverId: "DRV_JONAH", gapMs: 250 });
  const kart70 = kartUsage2026().filter((entry) => entry.kartNumber === 70);
  assert.equal(kart70.length, 2);
  assert.notEqual(kart70[0].layoutId, kart70[1].layoutId);
  assert.ok(kart70.some((entry) => entry.layoutId === "DAYTONA-ESSEN-B1-INDOOR" && entry.drivers.includes("DRV_TYLER") && entry.recordedLaps === 27));
  assert.ok(kart70.every((entry) => entry.relativePaceSamples.length === 1));
});

test("statistics snapshot exposes tied ranks, source-backed records and separate event layouts", () => {
  const snapshot = statisticsSnapshot2026();
  assert.equal(snapshot.championshipRankings.pointsPerStart[0].name, "Tyler");
  assert.equal(snapshot.championshipRankings.pointsPerStart[0].value, "23.7");
  const topWinRates = snapshot.championshipRankings.winRate.filter((row) => row.position === 1);
  assert.deepEqual(topWinRates.map((row) => row.name), ["Tyler"]);
  assert.equal(snapshot.events.length, 3);
  assert.equal(snapshot.events.reduce((sum, event) => sum + event.lapCount, 0), 648);
  assert.notEqual(snapshot.events[0].layoutId, snapshot.events[1].layoutId);
  assert.equal(snapshot.records.closestOfficialFinish.gapMs, 250);
  assert.equal(snapshot.records.mostClassifiedLaps.count, 70);
  assert.ok(snapshot.metricLeaders.find((entry) => entry.label === "Most poles").leaders.includes("Jonah"));
});
