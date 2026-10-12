/** Public Firestore document contracts used by the RKS application. */
export type DocumentBase = { id: string; createdAt: string; updatedAt: string; published: boolean };
export type DriverDocument = DocumentBase & { seasonId: string; name: string; slug: string; points: number; position: number; number?: number; nationality?: string; teamId?: string; portraitUrl?: string; active: boolean };
export type TeamDocument = DocumentBase & { name: string; slug: string; logoUrl?: string; driverIds: string[]; seasonId: string };
export type ChampionshipDocument = DocumentBase & { seasonId: string; category: "drivers" | "teams"; standings: Array<{ competitorId: string; points: number; wins: number; podiums: number }> };
export type SeasonDocument = DocumentBase & { year: number; name: string; status: "upcoming" | "active" | "complete"; eventIds: string[] };
export type EventDocument = DocumentBase & { seasonId: string; round: number; trackId?: string | null; trackName?: string | null; course?: string | null; startAt?: string | null; scheduleWindow?: string | null; previousWinnerName?: string; resultsLabel?: string | null; resultsEventId?: string | null; status: "scheduled" | "complete" | "cancelled"; raceHubId?: string };
export type TrackDocument = DocumentBase & { name: string; location?: string; country?: string; lengthMeters?: number; layoutImageUrl?: string; weather?: { temperatureC?: number; condition?: string; windKph?: number } };
export type QualifyingDocument = DocumentBase & { eventId: string; driverId: string; position: number; bestLapMs?: number };
export type ResultDocument = DocumentBase & { eventId: string; driverId: string; position?: number; points?: number; status: "classified" | "dnf" | "dns"; penaltyIds: string[] };
export type LapTimeDocument = DocumentBase & { eventId: string; driverId: string; lap: number; timeMs: number; position?: number; gapMs?: number };
export type StatisticDocument = DocumentBase & { seasonId: string; competitorId: string; scope: "career" | "season"; values: Record<string, number> };
export type MediaDocument = DocumentBase & { eventId?: string; type: "photo" | "video" | "download"; title: string; url: string; thumbnailUrl?: string; credit?: string };
export type RegulationDocument = DocumentBase & { version: string; effectiveAt: string; title: string; body: string; documentUrl?: string };
export type NewsDocument = DocumentBase & { title: string; slug: string; summary: string; body: string; heroUrl?: string; publishedAt: string };
export type PenaltyDocument = DocumentBase & { eventId: string; driverId: string; decision: string; reason: string; timePenaltySeconds?: number; status: "confirmed" | "reviewed" };
export type RaceHubDocument = DocumentBase & { eventId: string; report?: string; driverOfTheDayId?: string; moment?: string; biggestComebackDriverId?: string; ratingByDriver: Record<string, number> };
