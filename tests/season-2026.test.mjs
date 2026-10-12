import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { season2026 } from "../data/2026/season.ts";
import { recordedLapCountsByEvent2026 } from "../data/2026/lap-times.ts";
import { auditLapTimes2026, derivedLapTimeDelta2026, eventLapPace2026 } from "../data/2026/selectors.ts";

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
  assert.equal(r3?.layoutId, null);
  assert.equal(r3?.courseName, "Bahn 2");
  assert.equal(r3?.status, "upcoming");
  assert.equal(r3?.results.length, 0);
});

test("Round 3 does not inherit Round 1's unconfirmed In & Outdoor configuration", () => {
  const r3 = season2026.events.find((event) => event.round === 3);
  assert.equal(r3?.courseName, "Bahn 2");
  assert.equal(r3?.layoutId, null);
  assert.equal(r3?.lapTimes.length, 0);
});

test("source lap records match every official race lap count and preserve official best laps", () => {
  for (const event of season2026.events.filter((candidate) => candidate.status === "complete")) {
    assert.equal(event.coverage.raceClassification, "complete");
    assert.equal(event.coverage.lapTimes, "complete");
    assert.equal(event.coverage.positionByLap, "unavailable");
    assert.equal(event.coverage.qualifyingTimes, "unavailable");
    assert.equal(event.coverage.officialMedia, "unavailable");
    assert.equal(event.lapTimes.length, recordedLapCountsByEvent2026[event.id]);

    for (const result of event.results) {
      const laps = event.lapTimes.filter((lap) => lap.driverId === result.driverId);
      assert.equal(laps.length, result.laps, `${event.id} ${result.driverId} lap count`);
      assert.ok(result.officialBestLapMs > 0, `${event.id} ${result.driverId} official best lap`);
      assert.ok(laps.every((lap, index) => lap.lapNumber === index + 1), `${event.id} ${result.driverId} lap numbering`);
      assert.ok(laps.every((lap) => lap.lapTimeMs > 0), `${event.id} ${result.driverId} positive lap times`);
      assert.ok(laps.every((lap) => season2026.drivers.some((driver) => driver.id === lap.driverId)), `${event.id} ${result.driverId} resolves`);
      assert.ok(laps.every((lap) => lap.kartNumber > 0 && lap.sourceType === "official-timing-sheet" && lap.sourceReference), `${event.id} ${result.driverId} provenance`);
      assert.ok(laps.every((lap) => lap.eventId === event.id), `${event.id} lap event identity`);
      assert.ok(laps.every((lap) => lap.sessionId === `${event.id}-RACE`), `${event.id} lap session identity`);
    }
  }
  const [r1, r2] = season2026.events;
  assert.ok(r1.lapTimes.every((lap) => lap.eventId === "2026-R01" && r1.layoutId === "DAYTONA-ESSEN-B2-IN-OUTDOOR"));
  assert.ok(r2.lapTimes.every((lap) => lap.eventId === "2026-R02" && r2.layoutId === "DAYTONA-ESSEN-B1-INDOOR"));
  assert.equal(r1.coverage.qualifyingPositions, "partial");
  assert.equal(r2.coverage.qualifyingPositions, "complete");
  assert.equal(r1.coverage.lapTimes, "complete");
  assert.equal(r2.coverage.lapTimes, "complete");
  assert.equal(r2.fastestLap?.driverId, "DRV_TYLER");
  assert.equal(r2.lapTimes.find((lap) => lap.driverId === "DRV_TYLER" && lap.lapNumber === 21)?.lapTimeMs, 53940);
  assert.equal(r2.results[1]?.officialTotalTimeMs, 1534590);
  assert.equal(r2.lapTimes.filter((lap) => lap.driverId === "DRV_LENNARD_F").length, 27);
  assert.equal(r2.lapTimes.filter((lap) => lap.driverId === "DRV_ELIJAH").length, 26);
  assert.equal(r2.lapTimes.some((lap) => lap.driverId === "DRV_LENNAED_W"), false);
  assert.equal(r1.lapTimes.some((lap) => lap.driverId === "DRV_JONA_OESTERMANN"), false);
  assert.equal(r1.lapTimes.some((lap) => lap.driverId === "DRV_JONA_T"), true);
  assert.equal(r1.lapTimes.length, 212);
  assert.equal(r2.lapTimes.length, 236);
  for (const sourceReference of new Set([...r1.lapTimes, ...r2.lapTimes].map((lap) => lap.sourceReference))) {
    assert.ok(existsSync(resolve(sourceReference)), `archived source exists: ${sourceReference}`);
  }
});

test("automated audit checks every R1 and R2 driver and documents each source discrepancy", () => {
  assert.deepEqual(auditLapTimes2026(), [{
    eventId: "2026-R01",
    round: 1,
    driverId: "DRV_HENRY",
    officialBestLapMs: 87500,
    fastestRecordedLapMs: 86690,
    fastestRecordedLapNumber: 3,
    sourceReference: "data/2026/sources/PHOTO-2026-08-21-18-26-51 2.jpg",
  }]);

  const r1 = season2026.events.find((event) => event.round === 1);
  const henry = r1.results.find((result) => result.driverId === "DRV_HENRY");
  const henryLap3 = r1.lapTimes.find((lap) => lap.driverId === "DRV_HENRY" && lap.lapNumber === 3);
  assert.equal(henry.officialBestLapMs, 87500);
  assert.equal(henryLap3.lapTimeMs, 86690);
  const sourceArchive = readFileSync(resolve("data/2026/sources/README.md"), "utf8");
  assert.match(sourceArchive, /Henry\s*\|\s*1:27\.50\s*\|\s*1:26\.69\s*\|\s*3/);
});

test("race pace analytics remain event-specific and the derived delta is not an official gap", () => {
  const [r1, r2] = season2026.events;
  assert.equal(eventLapPace2026(r1.id).length, r1.results.length);
  assert.equal(eventLapPace2026(r2.id).length, r2.results.length);
  const tylerR2 = eventLapPace2026(r2.id).find((pace) => pace.driverId === "DRV_TYLER");
  assert.equal(tylerR2?.fastestRecordedLapMs, 53940);
  assert.equal(tylerR2?.lapCount, 27);
  assert.equal(derivedLapTimeDelta2026(r2.id, "DRV_JONAH", "DRV_TYLER").length, 27);
  assert.equal(derivedLapTimeDelta2026(r1.id, "DRV_JONAH", "DRV_TYLER").length, 19);
  assert.deepEqual(derivedLapTimeDelta2026(r2.id, "DRV_TYLER", "DRV_TYLER"), []);
  for (const event of season2026.events.filter((candidate) => candidate.status === "upcoming")) {
    assert.equal(event.coverage.lapTimes, "unavailable");
    assert.equal(event.coverage.positionByLap, "unavailable");
    assert.equal(event.lapTimes.length, 0);
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
  assert.equal(Math.min(...r1.results.map((result) => result.officialBestLapMs)), 76880);
  assert.equal(Math.min(...r2.results.map((result) => result.officialBestLapMs)), 53940);
  assert.notEqual(r1.layoutId, r2.layoutId);
});
