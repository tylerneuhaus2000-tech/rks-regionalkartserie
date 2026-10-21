import { season2026 } from "@/data/2026/season";
import { getStandings2026 } from "@/data/2026/selectors";

export type Driver = {
  id?: string;
  name: string;
  slug: string;
  points: number;
  position: number;
  rating?: number;
  tier?: string;
  qualifying?: number;
  wins?: number;
  podiums?: number;
  poles?: number;
  fastestLaps?: number;
  starts?: number;
  averageFinish?: number | null;
  bestFinish?: number | null;
  tags?: string[];
};

export const currentSeason = 2026;
export const seasonOptions = [2026, 2027, 2028] as const;

/** Archived venue data retained for a possible future event. Not used by the 2026 calendar. */
export const dortmundEvent = {
  name: "Highway Kart Racing Dortmund",
  track: {
    length: "1.600 km",
    lengthMeters: 1600,
    corners: 20,
    width: "4–6 m",
    halls: 2,
    kartsPerRace: 22,
    longestStraight: "70 m",
    layoutUrl: "https://hwkr.pro/highway-track-map.png",
    sourceUrl: "https://hwkr.pro/",
    indoor: true,
  },
};

export type RksCalendarEvent = {
  id: string;
  season: 2026;
  round: number;
  date: string | null;
  scheduleWindow?: string;
  time?: string;
  venue: string | null;
  course: string | null;
  trackId: string | null;
  format?: string | null;
  layoutId?: string | null;
  courseName?: string | null;
  status: "complete" | "upcoming";
  resultsLabel?: string;
  resultsEventId?: string;
};

export const daytonaTrackId = "daytona-kart-center-essen";

export const seasonCalendar2026: RksCalendarEvent[] = season2026.events.map((event) => ({
  id: event.id,
  season: 2026,
  round: event.round,
  date: event.date,
  scheduleWindow: event.dateWindow ?? undefined,
  time: event.round === 3 ? "17:00" : undefined,
  venue: event.venue,
  course: event.courseName ?? (event.layoutId ? season2026.layouts[event.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name : null),
  trackId: event.venue ? daytonaTrackId : null,
  format: event.format,
  layoutId: event.layoutId,
  status: event.status === "complete" ? "complete" : "upcoming",
  resultsLabel: event.status === "complete" ? event.format ?? undefined : undefined,
  resultsEventId: event.status === "complete" ? event.id : undefined,
}));

export const round3Event = seasonCalendar2026[2]!;

/** Firestore event seed documents. Result records use the event's stable ID as eventId. */
export const firestoreEventSeeds = seasonCalendar2026.map((event) => ({
  id: event.id,
  seasonId: String(event.season),
  round: event.round,
  trackId: event.trackId,
  trackName: event.venue,
  course: event.course,
  layoutId: event.layoutId,
  format: event.format,
  startAt: event.date,
  scheduleWindow: event.scheduleWindow ?? null,
  resultsLabel: event.resultsLabel ?? null,
  resultsEventId: event.resultsEventId ?? null,
  status: event.status === "complete" ? "complete" as const : "scheduled" as const,
  published: true,
}));

const standings = getStandings2026();
const lastEvent = season2026.events[1]!;
export const drivers: Driver[] = standings.map((row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  points: row.points,
  position: row.position,
  rating: row.rating,
  tier: row.tier,
  qualifying: row.latestQualifying ?? undefined,
  wins: row.wins,
  podiums: row.podiums,
  poles: row.poles,
  fastestLaps: row.fastestLaps,
  starts: row.starts,
  averageFinish: row.averageFinish,
  bestFinish: row.bestFinish,
  tags: [
    ...(row.position === 1 ? ["Championship leader"] : []),
    ...(row.wins ? ["Race winner"] : []),
    ...(row.fastestLaps ? ["Fastest lap"] : []),
  ],
}));

const driverName = (id: string) => season2026.drivers.find((driver) => driver.id === id)?.name ?? "";
export const latestQualifying = lastEvent.qualifying.map(driverName);
export const latestRace = {
  winner: driverName(lastEvent.raceWinnerId!),
  fastestLap: driverName(lastEvent.fastestLap!.driverId),
  fastestLapTimeMs: lastEvent.fastestLap!.timeMs,
  pole: driverName(lastEvent.qualifying[0]!),
  winningMarginMs: lastEvent.results[1]!.officialTotalTimeMs - lastEvent.results[0]!.officialTotalTimeMs,
  round: `Round ${lastEvent.round} · ${lastEvent.format}`,
  date: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(lastEvent.date!)),
  venue: `${lastEvent.venue} · ${season2026.layouts[lastEvent.layoutId === "DAYTONA-ESSEN-B1-INDOOR" ? "daytonaEssenB1Indoor" : "daytonaEssenB2"].name}`,
  eventId: lastEvent.id,
  status: "Complete",
};

export const primaryNav = [
  ["Home", "/"], ["Championship", "/championship"], ["Races", "/races"], ["Replays", "/replays"], ["Drivers", "/drivers"],
  ["Statistics", "/statistics"], ["Regulations", "/regulations"],
] as const;

export const allSections = [
  ["Head to head", "/head-to-head"], ["Achievements", "/achievements"], ["Administration", "/admin"],
] as const;

export function getDriver(slug: string) {
  return drivers.find((driver) => driver.slug === slug);
}
