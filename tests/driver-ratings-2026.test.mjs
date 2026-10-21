import test from "node:test";
import assert from "node:assert/strict";
import { season2026 } from "../data/2026/season.ts";
import {
  activeDriverRatingSnapshot2026,
  driverRatingAverageDiscrepancies2026,
  driverRatingSnapshots2026,
  getDriverRating2026,
  getDriverRatingSnapshot2026,
  rawDriverRatingComponentAverage,
  validateDriverRatingSnapshot2026,
} from "../data/2026/driver-ratings.ts";

test("2026 after-Round-2 driver rating snapshot is complete and resolves canonical IDs", () => {
  const snapshot = getDriverRatingSnapshot2026();
  assert.equal(activeDriverRatingSnapshot2026, "afterRound2");
  assert.equal(snapshot.length, 15);
  assert.equal(validateDriverRatingSnapshot2026().valid, true);
  assert.deepEqual(Object.keys(driverRatingSnapshots2026), ["afterRound1", "afterRound2", "afterRound3", "afterRound4"]);
  assert.equal(driverRatingSnapshots2026.afterRound1, null);
  assert.equal(driverRatingSnapshots2026.afterRound3, null);
  assert.equal(driverRatingSnapshots2026.afterRound4, null);
  for (const rating of snapshot) {
    assert.ok(season2026.drivers.some((driver) => driver.id === rating.driverId), rating.driverId);
    assert.deepEqual(Object.keys(rating.categories).sort(), ["consistency", "pace", "peak", "qualifying", "race"]);
    assert.ok(Number.isInteger(rating.eventSamples) && rating.eventSamples > 0);
    assert.equal(typeof rating.qualifyingRatingEstimated, "boolean");
    assert.ok(["S", "A", "B", "C", "D"].includes(rating.tier));
    assert.ok(Number.isInteger(rating.overall) && rating.overall >= 0 && rating.overall <= 95);
    for (const value of Object.values(rating.categories)) assert.ok(Number.isInteger(value) && value >= 0 && value <= 95);
  }
  assert.deepEqual(snapshot.map((rating) => rating.rank), Array.from({ length: 15 }, (_, index) => index + 1));
});

test("approved Tyler, Jonah and Lennard F. card values are preserved", () => {
  const tyler = getDriverRating2026("DRV_TYLER");
  assert.equal(tyler.overall, 90);
  assert.deepEqual(tyler.categories, { pace: 95, peak: 95, race: 89, consistency: 86, qualifying: 85 });
  assert.equal(getDriverRating2026("DRV_JONAH").overall, 89);
  const lennard = getDriverRating2026("DRV_LENNARD_F");
  assert.equal(lennard.overall, 82);
  assert.equal(lennard.categories.qualifying, 95);
});

test("estimated qualifying ratings remain explicitly flagged for the supplied drivers", () => {
  assert.equal(getDriverRating2026("DRV_LENNAED_W").categories.qualifying, 82);
  assert.equal(getDriverRating2026("DRV_LENNAED_W").qualifyingRatingEstimated, true);
  const estimated = getDriverRatingSnapshot2026().filter((rating) => rating.qualifyingRatingEstimated).map((rating) => rating.driverId);
  assert.deepEqual(estimated, ["DRV_LENNAED_W", "DRV_MARKUS", "DRV_PETER", "DRV_JONA_T", "DRV_HENRY", "DRV_MARCO"]);
  assert.equal(getDriverRating2026("DRV_HENRY").qualifyingRatingEstimated, true);
  assert.equal(getDriverRating2026("DRV_MARCO").qualifyingRatingEstimated, true);
  assert.equal(getDriverRating2026("DRV_JEAN_LUCA").categories.consistency, 95);
});

test("raw equal-weight component mean is reported without changing approved OVR", () => {
  const tyler = getDriverRating2026("DRV_TYLER");
  assert.equal(rawDriverRatingComponentAverage(tyler), 90);
  assert.equal(tyler.overall, 90);
  const discrepancies = driverRatingAverageDiscrepancies2026();
  assert.ok(discrepancies.some((row) => row.driverId === "DRV_ELIJAH" && row.approvedOverall === 56 && row.roundedComponentAverage === 57));
  assert.ok(discrepancies.every((row) => row.approvedOverall === getDriverRating2026(row.driverId).overall));
});

test("driver rating data does not replace championship values or verified timing facts", () => {
  const { events } = season2026;
  const r1 = events.find((event) => event.round === 1);
  const r2 = events.find((event) => event.round === 2);
  assert.equal(r1.lapTimes.length, 212);
  assert.equal(r2.lapTimes.length, 236);
  assert.equal(r1.lapTimes.length + r2.lapTimes.length, 448);
  assert.equal(r2.fastestLap.timeMs, 53940);
  assert.equal(r2.fastestLap.lap, 21);
  assert.equal(r2.results[0].driverId, "DRV_JONAH");
  assert.equal(r2.results[1].officialTotalTimeMs - r2.results[0].officialTotalTimeMs, 250);
  assert.equal(r1.results.find((result) => result.driverId === "DRV_HENRY").officialBestLapMs, 87500);
  assert.deepEqual(["DRV_TYLER", "DRV_JONAH", "DRV_LENNARD_F"].map((id) => {
    const results = events.filter((event) => event.status === "complete").flatMap((event) => event.results.filter((result) => result.driverId === id).map((result) => (event.pointsByPosition?.[result.position - 1] ?? season2026.pointsByPosition[result.position - 1] ?? 0) + (event.fastestLap?.driverId === id && result.position <= 10 ? season2026.fastestLapBonus : 0)));
    return results.reduce((sum, value) => sum + value, 0);
  }), [71, 58, 27]);
});
