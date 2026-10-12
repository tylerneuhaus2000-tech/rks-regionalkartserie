import test from "node:test";
import assert from "node:assert/strict";
import { season2026 } from "../data/2026/season.ts";

function score(event, result) {
  return (season2026.pointsByPosition[result.position - 1] ?? 0) +
    (event.fastestLap?.driverId === result.driverId && result.position <= 10 ? season2026.fastestLapBonus : 0);
}

test("2026 completed rounds contain unique classifications and correct fastest-lap points", () => {
  for (const event of season2026.events.filter((candidate) => candidate.status === "complete")) {
    const positions = event.results.map((result) => result.position);
    assert.equal(new Set(positions).size, positions.length, `${event.id} has duplicate positions`);
    assert.equal(event.results.find((result) => result.position === 1)?.driverId, event.raceWinnerId);
    for (const result of event.results) assert.ok(score(event, result) >= 0);
  }
});

test("championship points derive from R1 and R2 classifications", () => {
  const totals = Object.fromEntries(season2026.drivers.map((driver) => [driver.id, 0]));
  for (const event of season2026.events.filter((candidate) => candidate.status === "complete")) {
    for (const result of event.results) totals[result.driverId] += score(event, result);
  }
  for (const [id, points] of Object.entries({ DRV_TYLER: 45, DRV_JONAH: 43, DRV_LENNARD_F: 27, DRV_LOUIS: 20, DRV_ELIJAH: 14 })) {
    assert.equal(totals[id], points, `${id} points`);
  }
  assert.deepEqual(["DRV_KILIAN", "DRV_JONA_OESTERMANN", "DRV_PETER"].map((id) => totals[id]), [4, 4, 4]);
  assert.equal(Object.values(totals).reduce((sum, value) => sum + value, 0), 203);
});

test("confirmed winner, qualifying pole, fastest lap and timing values are preserved", () => {
  const [r1, r2] = season2026.events;
  assert.equal(r1?.raceWinnerId, "DRV_TYLER");
  assert.equal(r2?.raceWinnerId, "DRV_JONAH");
  assert.equal(r2?.qualifying[0], "DRV_LENNARD_F");
  assert.deepEqual(r2?.fastestLap, { driverId: "DRV_TYLER", timeMs: 53940, lap: 21 });
  assert.equal(r2?.results[1]?.officialTotalTimeMs, 1534590);
  assert.equal(r2?.results[1]?.officialTotalTimeMs - r2?.results[0]?.officialTotalTimeMs, 250);
});

test("Round 3 is the upcoming Essen event and contains no fabricated results", () => {
  const r3 = season2026.events.find((event) => event.round === 3);
  assert.equal(r3?.date, "2026-10-21T17:00:00+02:00");
  assert.equal(r3?.venue, "Daytona Kart Center Essen");
  assert.equal(r3?.layoutId, "DAYTONA-ESSEN-B2-IN-OUTDOOR");
  assert.equal(r3?.status, "upcoming");
  assert.equal(r3?.results.length, 0);
});

test("no source lap timing or lap-by-lap position data is implied", () => {
  for (const event of season2026.events) {
    assert.equal(event.coverage.lapTimes, false);
    assert.equal(event.coverage.positionByLap, false);
  }
});

test("stable driver identities preserve distinct similarly named competitors", () => {
  const ids = season2026.drivers.map((driver) => driver.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.notEqual(season2026.drivers.find((driver) => driver.name === "Lennard F.")?.id, season2026.drivers.find((driver) => driver.name === "Lennaed W.")?.id);
  assert.notEqual(season2026.drivers.find((driver) => driver.name === "Jona Oestermann")?.id, season2026.drivers.find((driver) => driver.name === "Jona T.")?.id);
  assert.notEqual(season2026.drivers.find((driver) => driver.name === "Jonah")?.id, season2026.drivers.find((driver) => driver.name === "Jona T.")?.id);
  assert.ok(season2026.drivers.every((driver) => !("number" in driver)));
});

test("layout best laps remain event-specific", () => {
  const [r1, r2] = season2026.events;
  assert.equal(Math.min(...r1.results.map((result) => result.bestLapMs)), 76880);
  assert.equal(Math.min(...r2.results.map((result) => result.bestLapMs)), 53940);
  assert.notEqual(r1.layoutId, r2.layoutId);
});
