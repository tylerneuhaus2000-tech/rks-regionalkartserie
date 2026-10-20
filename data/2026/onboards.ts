import { raceLapRecords2026 } from "./lap-times.ts";

export type OnboardAnnotation = { id: string; type: "overtake" | "incident" | "battle" | "fastest-lap" | "race-start" | "finish" | "custom"; timestamp: number; endTimestamp?: number; lap?: number; title: string; description?: string; verified: boolean };
export type OnboardSession = { id: string; title: string; start: number; end: number; quick: boolean };
export type OnboardVideo = {
  id: string; season: number; round: number; eventId: string; driverId: string; kartNumber: number;
  source: { type: "owner-gopro"; reference: string; playbackUrl: string | null; status: "delivery-pending" | "available"; corrections: string[] };
  duration: number; poster: string; sessions: OnboardSession[];
  laps: { lapNumber: number; videoStartSeconds: number; videoEndSeconds: number; recordedLapTimeMs: number }[];
  annotations: OnboardAnnotation[];
};
const ranges = [[1117,1195],[1196,1274],[1275,1351],[1352,1429],[1430,1506],[1507,1584],[1585,1664],[1665,1743],[1744,1823],[1824,1901],[1902,2023],[2024,2101],[2102,2180],[2181,2257],[2258,2334],[2335,2412],[2413,2490],[2491,2567],[2568,2646]];
// Video clock uses owner-supplied timestamps, never cumulative timing-sheet laps.
// Inclusive source end seconds become half-open intervals [start, end + 1).
export const tylerRound1Onboard: OnboardVideo = {
  id: "2026-r1-tyler", season: 2026, round: 1, eventId: "2026-R01", driverId: "DRV_TYLER", kartNumber: 67,
  source: { type: "owner-gopro", reference: "copy_82E96ABF-E74F-43B0-8078-9CBA9E1F420A.MOV", playbackUrl: "https://pub-780b62e2b1144605b0b3486d8ff9432e.r2.dev/2026/round-01/onboard/tyler-1080p.mp4", status: "available", corrections: ["Owner notes: Lap 14 start corrected from 35:21 to 36:21; Lap 18 from 40:31 to 41:31 to remove overlaps. Recorded lap times remain independent."] },
  duration: 2832, poster: "/media/2026/round-1-tyler-onboard.jpg",
  sessions: [
    { id: "warm-up", title: "Warm up", start: 0, end: 371, quick: true },
    { id: "qualifying", title: "Qualifying", start: 372, end: 709, quick: true },
    { id: "gap", title: "Cooldown / session gap", start: 710, end: 831, quick: false },
    { id: "formation", title: "Formation lap", start: 832, end: 1116, quick: true },
    { id: "race", title: "Race", start: 1117, end: 2646, quick: true },
    { id: "finish", title: "Finish / in-lap", start: 2647, end: 2832, quick: true },
  ],
  laps: ranges.map(([start,end],index) => {
    const recorded = raceLapRecords2026.find(lap => lap.eventId === "2026-R01" && lap.driverId === "DRV_TYLER" && lap.lapNumber === index+1);
    if (!recorded) throw new Error(`Missing verified R1 Tyler lap ${index+1}`);
    return { lapNumber: index+1, videoStartSeconds: start, videoEndSeconds: end, recordedLapTimeMs: recorded.lapTimeMs };
  }), annotations: [],
};
export const onboardVideos2026: OnboardVideo[] = [tylerRound1Onboard];
export const onboardVideosForEvent2026 = (eventId: string) => onboardVideos2026.filter(video => video.eventId === eventId && video.source.status === "available" && video.source.playbackUrl);
export function onboardMoment(video: OnboardVideo, seconds: number) {
  const time = Math.max(0, Math.min(seconds, video.duration));
  const session = video.sessions.find(s => time >= s.start && (time < s.end+1));
  const lap = video.laps.find(l => time >= l.videoStartSeconds && time < l.videoEndSeconds+1);
  return { session, lap };
}
export function parseOnboardLink(search: string, video: OnboardVideo): number | null {
  const params = new URLSearchParams(search);
  if (params.get("onboard") !== "tyler") return null;
  const rawLap = params.get("lap");
  if (rawLap !== null) {
    if (!/^\d+$/.test(rawLap)) return null;
    return video.laps.find(l => l.lapNumber === Number(rawLap))?.videoStartSeconds ?? null;
  }
  const rawTime = params.get("t");
  if (rawTime === null || !/^\d+(\.\d+)?$/.test(rawTime)) return null;
  const time = Number(rawTime);
  return Number.isFinite(time) && time >= 0 && time <= video.duration ? time : null;
}
export function onboardClock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value/60).toString().padStart(2,"0")}:${(value%60).toString().padStart(2,"0")}`;
}
