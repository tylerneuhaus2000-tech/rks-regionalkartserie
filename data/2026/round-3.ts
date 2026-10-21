/** R3 import adapter. The untouched supplied transcription lives in sources/. */
import source from "./sources/round-3-import.json" with { type: "json" };
import type { LapRecord2026 } from "./lap-times.ts";

const driverIds = {
  Tyler: "DRV_TYLER", Jonah: "DRV_JONAH", "Lennard W.": "DRV_LENNAED_W",
  Peter: "DRV_PETER", Elijah: "DRV_ELIJAH", Fabian: "DRV_FABIAN",
  Kilian: "DRV_KILIAN", Miguel: "DRV_MIGUEL", Marco: "DRV_MARCO",
} as const;

export function round3DriverId(name: string) {
  const canonical = (source.aliases as Record<string, string>)[name] ?? name;
  const id = driverIds[canonical as keyof typeof driverIds];
  if (!id) throw new Error(`Unresolved Round 3 driver: ${name}`);
  return id;
}

function sourceTimeMs(value: string) {
  const match = value.match(/^(?:(\d+):)?(\d{1,2})\.(\d{3})$/);
  if (!match) throw new Error(`Invalid Round 3 source time: ${value}`);
  return Number(match[1] ?? 0) * 60_000 + Number(match[2]) * 1_000 + Number(match[3]);
}

const sourceReference = "data/2026/sources/round-3-import.json";
export const round3Qualifying = source.qualifying.positions.map((row) => ({
  driverId: round3DriverId(row.driver), position: row.position,
  timeMs: sourceTimeMs(row.time), gapToPoleMs: Math.round(row.gapToPoleSeconds * 1000),
}));

export const round3Results = source.race.classification.map((row) => {
  const gapToWinnerMs = row.diff?.startsWith("+") ? sourceTimeMs(row.diff.slice(1)) : null;
  return {
    driverId: round3DriverId(row.driver), position: row.position, laps: row.laps,
    officialBestLapMs: sourceTimeMs(row.bestLap), officialTotalTimeMs: null,
    officialGapToWinnerMs: gapToWinnerMs,
    intervalToPreviousMs: row.position === 2 ? gapToWinnerMs : row.position === 3 && gapToWinnerMs !== null
      ? gapToWinnerMs - sourceTimeMs(source.race.classification[1]!.diff!.slice(1)) : null,
    lapsDown: 24 - row.laps, kartNumber: row.kart,
  };
});

export const round3Laps: LapRecord2026[] = Object.entries(source.race.lapTimes).flatMap(([name, laps]) => {
  const result = round3Results.find((row) => row.driverId === round3DriverId(name));
  if (!result) throw new Error(`Missing Round 3 classification for ${name}`);
  return laps.map((lap) => ({
    eventId: "2026-R03", sessionId: "2026-R03-RACE", driverId: result.driverId,
    lapNumber: lap.lap, lapTimeMs: sourceTimeMs(lap.sourceTime), kartNumber: result.kartNumber,
    sourceType: "official-timing-sheet", sourceReference,
  }));
});

export const round3Source = source;
