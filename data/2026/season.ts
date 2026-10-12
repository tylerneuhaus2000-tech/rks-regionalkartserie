/** Canonical 2026 RKS season source. Facts here are either supplied or explicitly derived. */
import { raceLapRecords2026 } from "./lap-times.ts";

type EventCoverage = {
  raceClassification: "complete" | "unavailable";
  lapTimes: "complete" | "unavailable";
  qualifyingPositions: "complete" | "partial" | "unavailable";
  qualifyingTimes: "complete" | "unavailable";
  positionByLap: "complete" | "unavailable";
  officialMedia: "complete" | "unavailable";
};

export const season2026 = {
  year: 2026,
  name: "RKS Regionalkartserie",
  status: "in-progress",
  pointsByPosition: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] as const,
  fastestLapBonus: 1,
  fastestLapBonusTopTenOnly: true,
  layouts: {
    daytonaEssenB1Indoor: {
      id: "DAYTONA-ESSEN-B1-INDOOR",
      venue: "Daytona Kart Center Essen",
      name: "Bahn 1 · Indoor",
    },
    daytonaEssenB2: {
      id: "DAYTONA-ESSEN-B2-IN-OUTDOOR",
      venue: "Daytona Kart Center Essen",
      name: "Bahn 2 · In & Outdoor",
    },
  },
  drivers: [
    { id: "DRV_TYLER", slug: "tyler", name: "Tyler", rating: 90 },
    { id: "DRV_JONAH", slug: "jonah", name: "Jonah", rating: 89 },
    { id: "DRV_LENNARD_F", slug: "lennard-f", name: "Lennard F.", rating: 75 },
    { id: "DRV_LENNAED_W", slug: "lennaed-w", name: "Lennaed W.", rating: 74 },
    { id: "DRV_LOUIS", slug: "louis", name: "Louis", rating: 64 },
    { id: "DRV_ELIJAH", slug: "elijah", name: "Elijah", rating: 52 },
    { id: "DRV_JEAN_LUCA", slug: "jean-luca", name: "Jean-Luca", rating: 74 },
    { id: "DRV_MARKUS", slug: "markus", name: "Markus", rating: 43 },
    { id: "DRV_FABIAN", slug: "fabian", name: "Fabian", rating: 47 },
    { id: "DRV_KILIAN", slug: "kilian", name: "Kilian", rating: 23 },
    { id: "DRV_JONA_OESTERMANN", slug: "jona-oestermann", name: "Jona Oestermann", rating: 31 },
    { id: "DRV_PETER", slug: "peter", name: "Peter", rating: 46 },
    { id: "DRV_MARCO", slug: "marco", name: "Marco", rating: 12 },
    { id: "DRV_HENRY", slug: "henry", name: "Henry", rating: 10 },
    { id: "DRV_JONA_T", slug: "jona-t", name: "Jona T.", rating: 13 },
  ] as const,
  events: [
    {
      id: "2026-R01",
      round: 1,
      date: "2026-04-08",
      dateWindow: null,
      venue: "Daytona Kart Center Essen",
      layoutId: "DAYTONA-ESSEN-B2-IN-OUTDOOR",
      courseName: null,
      format: "HOT 25",
      status: "complete",
      raceWinnerId: "DRV_TYLER",
      fastestLap: { driverId: "DRV_TYLER", timeMs: 76880 },
      source: "Official classification transcribed from user-provided RKS data",
      qualifyingCoverage: "partial",
      qualifying: ["DRV_JONAH", "DRV_TYLER", "DRV_LOUIS"],
      lapTimes: raceLapRecords2026.filter((lap) => lap.eventId === "2026-R01"),
      results: [
        { driverId: "DRV_TYLER", position: 1, laps: 19, officialBestLapMs: 76880, officialTotalTimeMs: 1656060, intervalToPreviousMs: null, kartNumber: null },
        { driverId: "DRV_JONAH", position: 2, laps: 19, officialBestLapMs: 77050, officialTotalTimeMs: 1663540, intervalToPreviousMs: 7480, kartNumber: null },
        { driverId: "DRV_LENNAED_W", position: 3, laps: 19, officialBestLapMs: 77530, officialTotalTimeMs: 1668330, intervalToPreviousMs: 4790, kartNumber: null },
        { driverId: "DRV_LENNARD_F", position: 4, laps: 19, officialBestLapMs: 80200, officialTotalTimeMs: 1695060, intervalToPreviousMs: 26730, kartNumber: null },
        { driverId: "DRV_LOUIS", position: 5, laps: 19, officialBestLapMs: 80610, officialTotalTimeMs: 1696050, intervalToPreviousMs: 990, kartNumber: null },
        { driverId: "DRV_MARKUS", position: 6, laps: 18, officialBestLapMs: 81290, officialTotalTimeMs: 1644860, intervalToPreviousMs: null, lapsDown: 1, kartNumber: null },
        { driverId: "DRV_ELIJAH", position: 7, laps: 18, officialBestLapMs: 80610, officialTotalTimeMs: 1683240, intervalToPreviousMs: 38380, kartNumber: null },
        { driverId: "DRV_PETER", position: 8, laps: 18, officialBestLapMs: 80370, officialTotalTimeMs: 1701480, intervalToPreviousMs: 18240, kartNumber: null },
        { driverId: "DRV_KILIAN", position: 9, laps: 17, officialBestLapMs: 84690, officialTotalTimeMs: 1644030, intervalToPreviousMs: null, lapsDown: 1, kartNumber: null },
        { driverId: "DRV_MARCO", position: 10, laps: 16, officialBestLapMs: 92640, officialTotalTimeMs: 1701060, intervalToPreviousMs: null, lapsDown: 1, kartNumber: null },
        { driverId: "DRV_HENRY", position: 11, laps: 15, officialBestLapMs: 87500, officialTotalTimeMs: 1642120, intervalToPreviousMs: null, lapsDown: 1, kartNumber: null },
        { driverId: "DRV_JONA_T", position: 12, laps: 15, officialBestLapMs: 84580, officialTotalTimeMs: 1643040, intervalToPreviousMs: 920, kartNumber: null },
      ],
      coverage: { raceClassification: "complete", lapTimes: "complete", qualifyingPositions: "partial", qualifyingTimes: "unavailable", positionByLap: "unavailable", officialMedia: "unavailable" } satisfies EventCoverage,
    },
    {
      id: "2026-R02",
      round: 2,
      date: "2026-08-27",
      dateWindow: null,
      venue: "Daytona Kart Center Essen",
      layoutId: "DAYTONA-ESSEN-B1-INDOOR",
      courseName: null,
      format: "HOT 30",
      status: "complete",
      raceWinnerId: "DRV_JONAH",
      fastestLap: { driverId: "DRV_TYLER", timeMs: 53940, lap: 21 },
      source: "Official classification transcribed from user-provided RKS data",
      qualifyingCoverage: "complete-for-listed-entrants",
      qualifying: ["DRV_LENNARD_F", "DRV_TYLER", "DRV_JONAH", "DRV_LOUIS", "DRV_JEAN_LUCA", "DRV_ELIJAH", "DRV_KILIAN", "DRV_FABIAN", "DRV_JONA_OESTERMANN"],
      lapTimes: raceLapRecords2026.filter((lap) => lap.eventId === "2026-R02"),
      results: [
        { driverId: "DRV_JONAH", position: 1, laps: 27, officialBestLapMs: 54110, officialTotalTimeMs: 1534340, intervalToPreviousMs: null, kartNumber: 54 },
        { driverId: "DRV_TYLER", position: 2, laps: 27, officialBestLapMs: 53940, officialTotalTimeMs: 1534590, intervalToPreviousMs: 250, kartNumber: 70 },
        { driverId: "DRV_LENNARD_F", position: 3, laps: 27, officialBestLapMs: 54430, officialTotalTimeMs: 1542890, intervalToPreviousMs: 8300, kartNumber: 67 },
        { driverId: "DRV_JEAN_LUCA", position: 4, laps: 27, officialBestLapMs: 54750, officialTotalTimeMs: 1550180, intervalToPreviousMs: 7290, kartNumber: 73 },
        { driverId: "DRV_LOUIS", position: 5, laps: 26, officialBestLapMs: 54960, officialTotalTimeMs: 1505430, intervalToPreviousMs: null, lapsDown: 1, kartNumber: 65 },
        { driverId: "DRV_ELIJAH", position: 6, laps: 26, officialBestLapMs: 55090, officialTotalTimeMs: 1533630, intervalToPreviousMs: 28200, kartNumber: 66 },
        { driverId: "DRV_FABIAN", position: 7, laps: 26, officialBestLapMs: 55870, officialTotalTimeMs: 1548340, intervalToPreviousMs: 14710, kartNumber: 45 },
        { driverId: "DRV_JONA_OESTERMANN", position: 8, laps: 25, officialBestLapMs: 56720, officialTotalTimeMs: 1530640, intervalToPreviousMs: null, lapsDown: 1, kartNumber: 57 },
        { driverId: "DRV_KILIAN", position: 9, laps: 25, officialBestLapMs: 56920, officialTotalTimeMs: 1547960, intervalToPreviousMs: 17320, kartNumber: 60 },
      ],
      consistency: {
        DRV_JONAH: { sigma: 0.531, score: 94 }, DRV_JEAN_LUCA: { sigma: 0.542, score: 93 },
        DRV_LENNARD_F: { sigma: 0.582, score: 93 }, DRV_LOUIS: { sigma: 0.615, score: 93 },
        DRV_ELIJAH: { sigma: 0.674, score: 92 }, DRV_FABIAN: { sigma: 0.698, score: 92 },
        DRV_TYLER: { sigma: 0.788, score: 91 }, DRV_JONA_OESTERMANN: { sigma: 1.203, score: 86 }, DRV_KILIAN: { sigma: 1.804, score: 78 },
      },
      coverage: { raceClassification: "complete", lapTimes: "complete", qualifyingPositions: "complete", qualifyingTimes: "unavailable", positionByLap: "unavailable", officialMedia: "unavailable" } satisfies EventCoverage,
    },
    {
      id: "2026-R03",
      round: 3,
      date: "2026-10-21T17:00:00+02:00",
      dateWindow: null,
      venue: "Daytona Kart Center Essen",
      layoutId: null,
      courseName: "Bahn 2",
      format: "HOT 25",
      status: "upcoming",
      raceWinnerId: null,
      fastestLap: null,
      source: "Confirmed calendar information",
      qualifyingCoverage: "none",
      qualifying: [], results: [],
      lapTimes: [],
      coverage: { raceClassification: "unavailable", lapTimes: "unavailable", qualifyingPositions: "unavailable", qualifyingTimes: "unavailable", positionByLap: "unavailable", officialMedia: "unavailable" } satisfies EventCoverage,
    },
    {
      id: "2026-R04", round: 4, date: null, dateWindow: "Winterferien NRW 2026", venue: null, layoutId: null, courseName: null,
      format: null, status: "upcoming", raceWinnerId: null, fastestLap: null, source: "Exact date and venue unconfirmed", qualifyingCoverage: "none", qualifying: [], results: [], lapTimes: [],
      coverage: { raceClassification: "unavailable", lapTimes: "unavailable", qualifyingPositions: "unavailable", qualifyingTimes: "unavailable", positionByLap: "unavailable", officialMedia: "unavailable" } satisfies EventCoverage,
    },
  ] as const,
};

export type RksDriverId = (typeof season2026.drivers)[number]["id"];
export type SeasonEvent = (typeof season2026.events)[number];
