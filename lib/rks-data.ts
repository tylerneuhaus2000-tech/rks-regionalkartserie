export type Driver = {
  name: string;
  slug: string;
  points: number;
  position: number;
  qualifying?: number;
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
  venue: string | null;
  course: string | null;
  trackId: string | null;
  status: "complete" | "upcoming";
  resultsLabel?: string;
  resultsEventId?: string;
};

export const daytonaTrackId = "daytona-kart-center-essen";

export const seasonCalendar2026: RksCalendarEvent[] = [
  { id: "rks-2026-round-1-daytona", season: 2026, round: 1, date: "2026-04-08T00:00:00+02:00", venue: "Daytona Kart Center Essen", course: null, trackId: daytonaTrackId, status: "complete", resultsLabel: "HOT 25", resultsEventId: "rks-2026-round-1-daytona" },
  { id: "rks-2026-round-2-daytona-bahn-1", season: 2026, round: 2, date: "2026-08-27T00:00:00+02:00", venue: "Daytona Kart Center Essen", course: "Bahn 1", trackId: daytonaTrackId, status: "complete", resultsLabel: "HOT 30", resultsEventId: "rks-2026-round-2-daytona-bahn-1" },
  { id: "rks-2026-round-3-daytona-bahn-2", season: 2026, round: 3, date: "2026-10-21T00:00:00+02:00", venue: "Daytona Kart Center Essen", course: "Bahn 2", trackId: daytonaTrackId, status: "upcoming" },
  { id: "rks-2026-round-4", season: 2026, round: 4, date: null, scheduleWindow: "Winterferien NRW 2026", venue: null, course: null, trackId: null, status: "upcoming" },
];

export const round3Event = seasonCalendar2026[2];

/** Firestore event seed documents. Result records for completed rounds use the matching document id as eventId. */
export const firestoreEventSeeds = seasonCalendar2026.map(event => ({
  id: event.id,
  seasonId: String(event.season),
  round: event.round,
  trackId: event.trackId,
  trackName: event.venue,
  course: event.course,
  startAt: event.date,
  scheduleWindow: event.scheduleWindow ?? null,
  resultsLabel: event.resultsLabel ?? null,
  resultsEventId: event.resultsEventId ?? null,
  status: event.status === "complete" ? "complete" as const : "scheduled" as const,
  published: true,
}));

export const drivers: Driver[] = [
  { name: "Tyler", slug: "tyler", points: 45, position: 1, qualifying: 2, tags: ["Championship leader", "Fastest lap"] },
  { name: "Jonah", slug: "jonah", points: 43, position: 2, qualifying: 3, tags: ["Last race winner"] },
  { name: "Lennard F.", slug: "lennard-f", points: 27, position: 3, qualifying: 1 },
  { name: "Louis", slug: "louis", points: 20, position: 4, qualifying: 4 },
  { name: "Lennaed W.", slug: "lennaed-w", points: 15, position: 5 },
  { name: "Elijah", slug: "elijah", points: 14, position: 6, qualifying: 6 },
  { name: "Jean-Luca", slug: "jean-luca", points: 12, position: 7, qualifying: 5 },
  { name: "Markus", slug: "markus", points: 8, position: 8 },
  { name: "Fabian", slug: "fabian", points: 6, position: 9, qualifying: 8 },
  { name: "Kilian", slug: "kilian", points: 4, position: 10, qualifying: 7 },
  { name: "Jona Oestermann", slug: "jona-oestermann", points: 4, position: 10, qualifying: 9 },
  { name: "Peter", slug: "peter", points: 4, position: 10 },
  { name: "Marco", slug: "marco", points: 1, position: 13 },
  { name: "Henry", slug: "henry", points: 0, position: 14 },
  { name: "Jona T.", slug: "jona-t", points: 0, position: 14 },
];

export const latestQualifying = ["Lennard F.", "Tyler", "Jonah", "Louis", "Jean-Luca", "Elijah", "Kilian", "Fabian", "Jona Oestermann"];

export const latestRace = {
  winner: "Jonah",
  fastestLap: "Tyler",
  round: "Round 2 · HOT 30",
  date: "27 August 2026",
  venue: "Daytona Kart Center Essen · Bahn 1",
  eventId: "rks-2026-round-2-daytona-bahn-1",
  status: "Complete",
};

export const primaryNav = [
  ["Home", "/"], ["Championship", "/championship"], ["Drivers", "/drivers"], ["Teams", "/teams"],
  ["Calendar", "/calendar"], ["Race Center", "/race-center"], ["RaceHub", "/racehub"], ["Statistics", "/statistics"], ["Media", "/media"], ["Regulations", "/regulations"],
] as const;

export const allSections = [
  ["Head to head", "/head-to-head"], ["Achievements", "/achievements"], ["Administration", "/admin"],
] as const;

export function getDriver(slug: string) {
  return drivers.find((driver) => driver.slug === slug);
}
