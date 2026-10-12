import { season2026 } from "./season.ts";

export type RksDriverId2026 = (typeof season2026.drivers)[number]["id"];
export type RksDriverRatingTier = "S" | "A" | "B" | "C" | "D";
export type RksDriverRatingCategories = {
  pace: number;
  peak: number;
  race: number;
  consistency: number;
  qualifying: number;
};

export type RksDriverRatingSnapshot = {
  driverId: RksDriverId2026;
  rank: number;
  overall: number;
  tier: RksDriverRatingTier;
  categories: RksDriverRatingCategories;
  qualifyingRatingEstimated: boolean;
  eventSamples: number;
};

export type RksDriverRatingSnapshotKey = "afterRound1" | "afterRound2" | "afterRound3" | "afterRound4";
export const RKS_DRIVER_RATING_CATEGORY_WEIGHT = 0.2;

const afterRound2: readonly RksDriverRatingSnapshot[] = [
  { driverId: "DRV_TYLER", rank: 1, overall: 90, tier: "S", categories: { pace: 95, peak: 95, race: 89, consistency: 86, qualifying: 85 }, qualifyingRatingEstimated: false, eventSamples: 2 },
  { driverId: "DRV_JONAH", rank: 2, overall: 89, tier: "S", categories: { pace: 93, peak: 92, race: 90, consistency: 86, qualifying: 84 }, qualifyingRatingEstimated: false, eventSamples: 2 },
  { driverId: "DRV_LENNARD_F", rank: 3, overall: 82, tier: "A", categories: { pace: 81, peak: 77, race: 70, consistency: 87, qualifying: 95 }, qualifyingRatingEstimated: false, eventSamples: 2 },
  { driverId: "DRV_LENNAED_W", rank: 4, overall: 81, tier: "A", categories: { pace: 85, peak: 91, race: 78, consistency: 70, qualifying: 82 }, qualifyingRatingEstimated: true, eventSamples: 1 },
  { driverId: "DRV_JEAN_LUCA", rank: 5, overall: 71, tier: "A", categories: { pace: 84, peak: 69, race: 60, consistency: 95, qualifying: 48 }, qualifyingRatingEstimated: false, eventSamples: 1 },
  { driverId: "DRV_LOUIS", rank: 6, overall: 69, tier: "B", categories: { pace: 73, peak: 67, race: 54, consistency: 84, qualifying: 68 }, qualifyingRatingEstimated: false, eventSamples: 2 },
  { driverId: "DRV_MARKUS", rank: 7, overall: 62, tier: "B", categories: { pace: 66, peak: 68, race: 52, consistency: 63, qualifying: 61 }, qualifyingRatingEstimated: true, eventSamples: 1 },
  { driverId: "DRV_PETER", rank: 8, overall: 59, tier: "B", categories: { pace: 67, peak: 74, race: 34, consistency: 58, qualifying: 64 }, qualifyingRatingEstimated: true, eventSamples: 1 },
  { driverId: "DRV_ELIJAH", rank: 9, overall: 56, tier: "B", categories: { pace: 61, peak: 66, race: 40, consistency: 80, qualifying: 36 }, qualifyingRatingEstimated: false, eventSamples: 2 },
  { driverId: "DRV_JONA_T", rank: 10, overall: 47, tier: "C", categories: { pace: 52, peak: 48, race: 0, consistency: 86, qualifying: 48 }, qualifyingRatingEstimated: true, eventSamples: 1 },
  { driverId: "DRV_FABIAN", rank: 11, overall: 37, tier: "C", categories: { pace: 44, peak: 33, race: 24, consistency: 70, qualifying: 12 }, qualifyingRatingEstimated: false, eventSamples: 1 },
  { driverId: "DRV_KILIAN", rank: 12, overall: 22, tier: "D", categories: { pace: 22, peak: 24, race: 13, consistency: 27, qualifying: 24 }, qualifyingRatingEstimated: false, eventSamples: 2 },
  { driverId: "DRV_HENRY", rank: 13, overall: 20, tier: "D", categories: { pace: 20, peak: 36, race: 9, consistency: 0, qualifying: 34 }, qualifyingRatingEstimated: true, eventSamples: 1 },
  { driverId: "DRV_MARCO", rank: 14, overall: 20, tier: "D", categories: { pace: 0, peak: 0, race: 17, consistency: 62, qualifying: 22 }, qualifyingRatingEstimated: true, eventSamples: 1 },
  { driverId: "DRV_JONA_OESTERMANN", rank: 15, overall: 7, tier: "D", categories: { pace: 12, peak: 7, race: 12, consistency: 0, qualifying: 0 }, qualifyingRatingEstimated: false, eventSamples: 1 },
];

/** Empty snapshots are intentional: no historical rating values have been supplied for those rounds. */
export const driverRatingSnapshots2026: Record<RksDriverRatingSnapshotKey, readonly RksDriverRatingSnapshot[] | null> = {
  afterRound1: null,
  afterRound2,
  afterRound3: null,
  afterRound4: null,
};

export const activeDriverRatingSnapshot2026: RksDriverRatingSnapshotKey = "afterRound2";

export function getDriverRatingSnapshot2026(snapshot: RksDriverRatingSnapshotKey = activeDriverRatingSnapshot2026) {
  return driverRatingSnapshots2026[snapshot] ?? [];
}

export function getDriverRating2026(driverId: RksDriverId2026, snapshot: RksDriverRatingSnapshotKey = activeDriverRatingSnapshot2026) {
  return getDriverRatingSnapshot2026(snapshot).find((rating) => rating.driverId === driverId) ?? null;
}

/** The five categories are equally weighted at 20%; the returned mean never mutates the approved OVR. */
export function rawDriverRatingComponentAverage(rating: RksDriverRatingSnapshot): number {
  const { pace, peak, race, consistency, qualifying } = rating.categories;
  return (pace + peak + race + consistency + qualifying) / 5;
}

export function validateDriverRatingSnapshot2026(snapshot: RksDriverRatingSnapshotKey = activeDriverRatingSnapshot2026) {
  const entries = getDriverRatingSnapshot2026(snapshot);
  const knownIds = new Set<string>(season2026.drivers.map((driver) => driver.id));
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const rating of entries) {
    if (!knownIds.has(rating.driverId)) errors.push(`Unknown driver ID: ${rating.driverId}`);
    if (ids.has(rating.driverId)) errors.push(`Duplicate driver ID: ${rating.driverId}`);
    ids.add(rating.driverId);
    if (!Number.isInteger(rating.rank) || rating.rank < 1) errors.push(`${rating.driverId}: invalid rank`);
    if (!Number.isInteger(rating.overall) || rating.overall < 0 || rating.overall > 95) errors.push(`${rating.driverId}: OVR outside 0–95`);
    if (!(rating.tier in { S: 1, A: 1, B: 1, C: 1, D: 1 })) errors.push(`${rating.driverId}: invalid tier`);
    if (typeof rating.qualifyingRatingEstimated !== "boolean") errors.push(`${rating.driverId}: qualifying estimate flag missing`);
    if (!Number.isInteger(rating.eventSamples) || rating.eventSamples < 1) errors.push(`${rating.driverId}: invalid event sample count`);
    for (const [category, value] of Object.entries(rating.categories)) {
      if (!Number.isInteger(value) || value < 0 || value > 95) errors.push(`${rating.driverId}: ${category} outside 0–95`);
    }
    if (Object.keys(rating.categories).sort().join(",") !== "consistency,pace,peak,qualifying,race") errors.push(`${rating.driverId}: category set is incomplete`);
  }
  if (entries.length !== season2026.drivers.length) errors.push(`Expected ${season2026.drivers.length} ratings, found ${entries.length}`);
  return { valid: errors.length === 0, errors };
}

export function driverRatingAverageDiscrepancies2026(snapshot: RksDriverRatingSnapshotKey = activeDriverRatingSnapshot2026) {
  return getDriverRatingSnapshot2026(snapshot).flatMap((rating) => {
    const rawComponentAverage = rawDriverRatingComponentAverage(rating);
    const roundedComponentAverage = Math.round(rawComponentAverage);
    return roundedComponentAverage === rating.overall ? [] : [{
      driverId: rating.driverId,
      approvedOverall: rating.overall,
      rawComponentAverage,
      roundedComponentAverage,
      differenceFromRoundedAverage: rating.overall - roundedComponentAverage,
    }];
  });
}
