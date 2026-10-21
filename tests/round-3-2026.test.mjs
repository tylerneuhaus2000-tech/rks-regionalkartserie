import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { season2026 } from "../data/2026/season.ts";
import { round3DriverId, round3Source } from "../data/2026/round-3.ts";
import { auditLapTimes2026, eventPaceAnalytics2026, getStandings2026, headToHead2026 } from "../data/2026/selectors.ts";
import { onboardVideosForEvent2026 } from "../data/2026/onboards.ts";

const r3 = season2026.events.find((event) => event.round === 3);

test("R3 supplied JSON and CSV agree on all 200 original lap cells", () => {
  const rows = readFileSync("public/downloads/2026/rks-2026-round-3-supplied-transcription.csv", "utf8").trim().split(/\r?\n/);
  assert.equal(rows.length - 1, 200);
  const byKey = new Map(r3.lapTimes.map((lap) => [`${lap.driverId}:${lap.lapNumber}`, lap]));
  for (const line of rows.slice(1)) {
    const [round, name, alias, kart, finish, lap, time] = line.split(",");
    assert.equal(round, "3");
    const record = byKey.get(`${round3DriverId(name)}:${lap}`);
    assert.ok(record, `${name} lap ${lap}`);
    const [minutes, seconds] = time.includes(":") ? time.split(":") : ["0", time];
    assert.equal(record.lapTimeMs, Number(minutes) * 60_000 + Math.round(Number(seconds) * 1000));
    assert.equal(record.kartNumber, Number(kart));
    assert.equal(round3DriverId(alias), record.driverId);
    assert.equal(r3.results.find((result) => result.driverId === record.driverId).position, Number(finish));
  }
  assert.equal(round3Source.race.totalLapsRecorded, 200);
});

test("R3 classifications, qualifying, kart identities and source best laps validate", () => {
  assert.equal(r3.results.length, 9);
  assert.equal(new Set(r3.results.map((row) => row.kartNumber)).size, 9);
  assert.equal(new Set(r3.qualifyingTimes.map((row) => row.position)).size, 9);
  assert.equal(new Set(r3.qualifyingTimes.map((row) => row.driverId)).size, 9);
  assert.equal(r3.results.reduce((sum, row) => sum + row.laps, 0), 200);
  for (const row of r3.results) {
    const laps = r3.lapTimes.filter((lap) => lap.driverId === row.driverId);
    assert.equal(laps.length, row.laps);
    assert.deepEqual(laps.map((lap) => lap.lapNumber), Array.from({ length: row.laps }, (_, i) => i + 1));
    assert.equal(Math.min(...laps.map((lap) => lap.lapTimeMs)), row.officialBestLapMs);
  }
  assert.equal(r3.qualifyingTimes[0].timeMs, 48528);
  assert.equal(r3.lapTimes.find((lap) => lap.driverId === "DRV_TYLER" && lap.lapNumber === 18).lapTimeMs, 47703);
  assert.equal(r3.lapTimes.filter((lap) => lap.lapTimeMs === 47703).length, 1);
  assert.deepEqual(auditLapTimes2026().map((item) => [item.eventId, item.driverId]), [["2026-R01", "DRV_HENRY"]]);
});

test("aliases remain stable and R3 pace stays in its own configuration", () => {
  assert.equal(round3DriverId("WAG"), "DRV_LENNAED_W");
  assert.equal(round3DriverId("PETER2303"), "DRV_PETER");
  assert.equal(round3DriverId("K"), "DRV_KILIAN");
  assert.equal(round3DriverId("SCHOKOS"), "DRV_MARCO");
  assert.equal(round3DriverId("MIGUEL"), "DRV_MIGUEL");
  assert.notEqual(round3DriverId("WAG"), "DRV_LENNARD_F");
  assert.notEqual(r3.layoutId, season2026.events[0].layoutId);
  const metrics = eventPaceAnalytics2026(r3.id);
  assert.equal(metrics.length, 9);
  assert.equal(metrics[0].driverId, "DRV_TYLER");
  assert.ok(metrics.find((row) => row.driverId === "DRV_MIGUEL").outlierLaps.includes(18));
  assert.ok(metrics.find((row) => row.driverId === "DRV_ELIJAH").outlierLaps.includes(8));
  assert.ok(metrics.find((row) => row.driverId === "DRV_MARCO").outlierLaps.includes(16));
  assert.equal(headToHead2026("DRV_TYLER", "DRV_JONAH").records.raceFinish.samples, 3);
});

test("2026 standings update while rating snapshot and onboard availability stay separate", () => {
  const standings = getStandings2026();
  assert.deepEqual(standings.slice(0, 4).map((row) => [row.id, row.points]), [["DRV_TYLER", 71], ["DRV_JONAH", 58], ["DRV_LENNAED_W", 33], ["DRV_LENNARD_F", 27]]);
  assert.equal(standings.find((row) => row.id === "DRV_MIGUEL").points, 6);
  assert.equal(onboardVideosForEvent2026("2026-R01").length, 1);
  assert.deepEqual(onboardVideosForEvent2026("2026-R02"), []);
  assert.deepEqual(onboardVideosForEvent2026("2026-R03"), []);
});
