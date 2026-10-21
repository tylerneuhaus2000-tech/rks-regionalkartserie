/**
 * Original recorded race laps transcribed from the archived timing sheets.
 * Values are kept as printed (MM:SS.hh) here, then normalized to integer ms.
 * No Lap 0 or start-to-line segment is present in these source sheets.
 */
import { round3Laps } from "./round-3.ts";

export type LapRecord2026 = {
  eventId: "2026-R01" | "2026-R02" | "2026-R03";
  sessionId: "2026-R01-RACE" | "2026-R02-RACE" | "2026-R03-RACE";
  driverId: string;
  lapNumber: number;
  lapTimeMs: number;
  kartNumber: number;
  sourceType: "official-timing-sheet";
  sourceReference: string;
};

type LapColumn = {
  driverId: string;
  kartNumber: number;
  printedTimes: string;
  sourceReference: string;
};

const r1Source = "data/2026/sources/PHOTO-2026-08-21-18-26-51.jpg";
const r1TailSource = "data/2026/sources/PHOTO-2026-08-21-18-26-51 2.jpg";
const r2Source = "data/2026/sources/WhatsApp Scan 2026-08-27 at 19.18.00.pdf";

const r1Columns: LapColumn[] = [
  { driverId: "DRV_TYLER", kartNumber: 67, sourceReference: r1Source, printedTimes: "1:19.74, 1:17.79, 1:17.60, 1:17.53, 1:17.63, 1:17.32, 1:19.63, 1:23.15, 1:20.08, 1:16.89, 1:59.17, 1:18.18, 1:18.76, 1:17.28, 1:17.01, 1:17.34, 1:18.38, 1:16.88, 1:17.13" },
  { driverId: "DRV_JONAH", kartNumber: 63, sourceReference: r1Source, printedTimes: "1:19.55, 1:17.92, 1:17.95, 1:17.55, 1:17.19, 1:17.87, 1:19.78, 1:20.44, 1:18.45, 1:17.77, 2:02.08, 1:18.24, 1:20.28, 1:17.43, 1:17.05, 1:20.48, 1:21.30, 1:17.33, 1:17.16" },
  { driverId: "DRV_LENNAED_W", kartNumber: 70, sourceReference: r1Source, printedTimes: "1:22.17, 1:21.35, 1:21.84, 1:22.90, 1:28.38, 1:19.74, 1:19.33, 1:18.77, 1:19.28, 1:22.86, 1:29.22, 1:21.05, 1:19.44, 1:18.40, 1:17.79, 1:19.27, 1:19.60, 1:17.98, 1:17.53" },
  { driverId: "DRV_LENNARD_F", kartNumber: 75, sourceReference: r1Source, printedTimes: "1:23.26, 1:22.25, 1:21.48, 1:21.25, 1:24.07, 1:21.49, 1:20.93, 1:20.20, 1:20.71, 1:21.04, 1:31.78, 1:24.14, 1:20.74, 1:22.67, 1:20.51, 1:20.82, 1:21.11, 1:22.13, 1:21.73" },
  { driverId: "DRV_LOUIS", kartNumber: 51, sourceReference: r1Source, printedTimes: "1:23.37, 1:21.50, 1:21.93, 1:24.16, 1:28.32, 1:20.61, 1:21.10, 1:21.86, 1:20.85, 1:20.89, 1:24.81, 1:23.12, 1:21.26, 1:23.09, 1:21.05, 1:22.16, 1:21.10, 1:21.65, 1:23.70" },
  { driverId: "DRV_MARKUS", kartNumber: 66, sourceReference: r1Source, printedTimes: "1:24.93, 1:22.26, 1:21.51, 1:22.03, 1:23.18, 1:21.29, 1:21.41, 1:23.07, 1:22.72, 1:29.43, 1:23.15, 1:24.47, 1:22.45, 1:27.69, 1:22.91, 1:23.39, 1:24.84, 1:27.83" },
  { driverId: "DRV_ELIJAH", kartNumber: 48, sourceReference: r1Source, printedTimes: "1:26.92, 1:22.66, 1:22.01, 1:23.16, 1:23.03, 1:20.98, 1:21.21, 1:21.38, 1:22.76, 1:32.32, 1:21.01, 1:23.92, 1:22.28, 1:28.88, 2:11.81, 1:20.61, 1:22.08, 1:21.47" },
  { driverId: "DRV_PETER", kartNumber: 62, sourceReference: r1Source, printedTimes: "1:22.88, 1:22.15, 1:21.81, 1:21.59, 1:25.15, 1:20.80, 1:20.37, 1:20.73, 1:22.90, 2:35.03, 1:23.58, 1:22.83, 1:23.08, 1:21.80, 1:27.54, 1:22.70, 1:26.70, 1:25.93" },
  { driverId: "DRV_KILIAN", kartNumber: 42, sourceReference: r1Source, printedTimes: "1:28.79, 1:27.12, 1:29.72, 1:26.51, 1:27.03, 1:27.12, 1:31.84, 1:27.18, 1:32.68, 1:36.22, 1:26.30, 1:26.07, 1:25.31, 1:25.03, 1:26.14, 1:24.69, 1:28.38" },
  { driverId: "DRV_MARCO", kartNumber: 60, sourceReference: r1TailSource, printedTimes: "1:37.57, 1:35.17, 1:37.70, 1:45.87, 1:37.27, 1:36.19, 1:40.03, 1:35.72, 1:36.24, 1:34.10, 1:36.73, 1:35.27, 1:33.61, 1:32.64, 1:34.26, 1:33.18" },
  { driverId: "DRV_HENRY", kartNumber: 52, sourceReference: r1TailSource, printedTimes: "1:35.00, 1:36.77, 1:26.69, 1:35.20, 1:31.18, 1:27.50, 1:30.66, 1:31.42, 1:38.92, 1:30.36, 1:30.84, 1:27.73, 2:31.64, 1:36.70, 1:28.54" },
  { driverId: "DRV_JONA_T", kartNumber: 76, sourceReference: r1TailSource, printedTimes: "1:31.43, 1:26.65, 1:25.05, 1:25.19, 1:25.63, 1:24.89, 1:26.08, 4:34.38, 1:24.99, 1:24.58, 1:31.30, 1:27.11, 1:25.73, 1:27.60, 1:28.88" },
];

const r2Columns: LapColumn[] = [
  { driverId: "DRV_JONAH", kartNumber: 54, sourceReference: r2Source, printedTimes: "0:55.74, 0:54.66, 0:56.08, 0:55.00, 0:55.02, 0:55.21, 0:54.20, 0:54.52, 0:54.50, 0:54.33, 0:54.12, 0:54.56, 0:55.02, 0:55.24, 0:54.50, 0:54.36, 0:54.92, 0:54.60, 0:54.84, 0:54.57, 0:54.67, 0:54.51, 0:54.11, 0:55.56, 0:55.82, 0:55.46, 0:55.45" },
  { driverId: "DRV_TYLER", kartNumber: 70, sourceReference: r2Source, printedTimes: "0:55.85, 0:55.14, 0:55.77, 0:54.54, 0:54.85, 0:54.56, 0:55.00, 0:54.61, 0:54.47, 0:54.57, 0:54.18, 0:54.97, 0:55.85, 0:57.44, 0:55.31, 0:54.37, 0:54.46, 0:54.02, 0:54.93, 0:54.13, 0:53.94, 0:54.13, 0:54.10, 0:55.28, 0:56.33, 0:54.77, 0:55.32" },
  { driverId: "DRV_LENNARD_F", kartNumber: 67, sourceReference: r2Source, printedTimes: "0:55.73, 0:55.40, 0:55.73, 0:55.71, 0:54.83, 0:56.48, 0:54.56, 0:55.38, 0:55.29, 0:55.69, 0:55.79, 0:56.46, 0:55.66, 0:55.03, 0:54.81, 0:56.29, 0:54.93, 0:54.71, 0:54.69, 0:55.02, 0:54.43, 0:54.46, 0:55.20, 0:55.76, 0:54.58, 0:55.24, 0:54.95" },
  { driverId: "DRV_JEAN_LUCA", kartNumber: 73, sourceReference: r2Source, printedTimes: "0:56.36, 0:55.55, 0:55.37, 0:54.75, 0:55.67, 0:55.61, 0:55.03, 0:55.09, 0:56.92, 0:56.05, 0:56.19, 0:54.84, 0:54.94, 0:55.68, 0:54.87, 0:54.98, 0:54.80, 0:56.04, 0:55.04, 0:55.23, 0:54.95, 0:55.27, 0:55.01, 0:54.95, 0:55.61, 0:55.49, 0:54.90" },
  { driverId: "DRV_LOUIS", kartNumber: 65, sourceReference: r2Source, printedTimes: "0:55.75, 0:55.57, 0:55.04, 0:55.82, 0:55.26, 0:55.42, 0:55.38, 0:55.66, 0:56.54, 0:56.90, 0:57.28, 0:54.96, 0:55.73, 0:55.18, 0:55.18, 0:55.36, 0:57.23, 0:56.27, 0:55.85, 0:56.15, 0:55.75, 0:55.94, 0:55.37, 0:55.73, 0:56.24, 0:56.22" },
  { driverId: "DRV_ELIJAH", kartNumber: 66, sourceReference: r2Source, printedTimes: "0:56.67, 0:56.14, 0:56.31, 0:57.19, 0:57.05, 0:56.91, 0:56.75, 0:57.26, 0:56.30, 0:57.66, 0:56.64, 0:56.99, 0:56.98, 0:56.77, 0:57.24, 0:57.68, 0:57.66, 0:58.19, 0:57.43, 0:56.31, 0:56.08, 0:56.80, 0:56.74, 0:57.07, 0:55.46, 0:55.09" },
  { driverId: "DRV_FABIAN", kartNumber: 45, sourceReference: r2Source, printedTimes: "0:58.60, 0:57.68, 0:57.51, 0:58.03, 0:57.52, 0:56.97, 0:57.46, 0:56.62, 0:57.88, 0:58.11, 0:57.68, 0:58.20, 0:57.34, 0:56.64, 0:57.38, 0:56.35, 0:57.17, 0:57.84, 0:56.96, 0:56.70, 0:55.87, 0:56.53, 0:56.77, 0:56.27, 0:56.11, 0:56.86" },
  { driverId: "DRV_JONA_OESTERMANN", kartNumber: 57, sourceReference: r2Source, printedTimes: "1:00.63, 0:59.24, 0:58.56, 0:58.80, 0:58.54, 0:58.12, 0:58.48, 0:58.69, 0:58.42, 0:59.00, 1:00.62, 1:01.39, 1:00.12, 0:58.84, 0:57.24, 0:58.45, 0:57.56, 1:00.57, 0:57.27, 0:56.79, 0:58.62, 0:57.89, 0:56.72, 0:58.48, 0:56.84" },
  { driverId: "DRV_KILIAN", kartNumber: 60, sourceReference: r2Source, printedTimes: "0:57.87, 0:57.47, 0:58.96, 0:58.58, 0:57.10, 0:58.54, 0:57.83, 0:58.69, 0:58.85, 0:59.42, 1:01.00, 1:00.92, 0:59.32, 0:58.89, 1:00.04, 0:59.94, 1:04.42, 1:00.10, 1:01.59, 1:03.94, 0:56.92, 0:58.97, 0:59.15, 1:00.53, 1:00.56" },
];

function printedTimeToMs(value: string) {
  const match = value.match(/^(\d+):(\d{2})\.(\d{2})$/);
  if (!match) throw new Error(`Invalid source lap time: ${value}`);
  return Number(match[1]) * 60_000 + Number(match[2]) * 1_000 + Number(match[3]) * 10;
}

function recordsForEvent(eventId: LapRecord2026["eventId"], sessionId: LapRecord2026["sessionId"], columns: LapColumn[]): LapRecord2026[] {
  return columns.flatMap((column) => column.printedTimes.split(", ").map((printedTime, index) => ({
    eventId,
    sessionId,
    driverId: column.driverId,
    lapNumber: index + 1,
    lapTimeMs: printedTimeToMs(printedTime),
    kartNumber: column.kartNumber,
    sourceType: "official-timing-sheet" as const,
    sourceReference: column.sourceReference,
  })));
}

/** Race laps only; timing-sheet source transcriptions retain the printed values above. */
export const raceLapRecords2026: LapRecord2026[] = [
  ...recordsForEvent("2026-R01", "2026-R01-RACE", r1Columns),
  ...recordsForEvent("2026-R02", "2026-R02-RACE", r2Columns),
  ...round3Laps,
];

export const recordedLapCountsByEvent2026 = {
  "2026-R01": 212,
  "2026-R02": 236,
  "2026-R03": 200,
} as const;
