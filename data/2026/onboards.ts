import { raceLapRecords2026 } from "./lap-times.ts";

export type OnboardAnnotation = { id: string; type: "overtake" | "incident" | "battle" | "fastest-lap" | "race-start" | "finish" | "custom"; timestamp: number; endTimestamp?: number; lap?: number; title: string; description?: string; verified: boolean };
export type OnboardSession = { id: string; title: string; start: number; end: number; quick: boolean };
export type OnboardVideo = {
  id: string; season: number; round: number; eventId: string; driverId: string; kartNumber: number | null;
  source: { type: "owner-gopro"; reference: string; playbackUrl: string | null; status: "delivery-pending" | "available"; corrections: string[] };
  duration: number; poster: string; sessions: OnboardSession[]; intervalSemantics?: "exact";
  laps: { lapNumber: number; videoStartSeconds: number; videoEndSeconds: number; recordedLapTimeMs: number }[];
  annotations: OnboardAnnotation[];
};
const ranges = [[1117,1195],[1196,1274],[1275,1351],[1352,1429],[1430,1506],[1507,1584],[1585,1664],[1665,1743],[1744,1823],[1824,1901],[1902,2023],[2024,2101],[2102,2180],[2181,2257],[2258,2334],[2335,2412],[2413,2490],[2491,2567],[2568,2646]];
// Video clock uses owner-supplied timestamps, never cumulative timing-sheet laps.
// Inclusive source end seconds become half-open intervals [start, end + 1).
export const tylerRound1Onboard: OnboardVideo = {
  id: "2026-r1-tyler", season: 2026, round: 1, eventId: "2026-R01", driverId: "DRV_TYLER", kartNumber: 67,
  source: { type: "owner-gopro", reference: "copy_82E96ABF-E74F-43B0-8078-9CBA9E1F420A.MOV", playbackUrl: "https://pub-780b62e2b1144605b0b3486d8ff9432e.r2.dev/2026/round-01/onboard/tyler-1080p.mp4", status: "available", corrections: ["Owner notes: Lap 14 start corrected from 35:21 to 36:21; Lap 18 from 40:31 to 41:31 to remove overlaps. Recorded lap times remain independent."] },
  duration: 2832, poster: "/media/2026/round-1-tyler-onboard-user.webp",
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
// Owner-provided estimate for the start of recorded race lap 1. Change this
// single offset if the video clock is later verified against the footage.
export const R3_ESTIMATED_LAP1_START_SECONDS = 10 * 60 + 36;
export const R3_JONAH_LAP1_START_SECONDS = 10 * 60 + 37;
const r3TylerLapTimesMs = [48357,48657,48306,48821,48542,48768,48752,48963,48666,50720,50447,49035,48093,48603,48447,49149,48174,47703,49733,51028,48358,48710,48950,48651];
const r3JonahLapTimesMs = [49215,48950,49019,49106,50698,49649,48920,48951,50228,50038,48947,49381,49060,49038,48796,49331,49272,48589,54238,52753,50359,48488,48451,48449];
function r3RecordedLaps(driverId: string, startSeconds: number, expected: number[]) {
  let elapsedMs = 0;
  return expected.map((lapTimeMs, index) => {
    const recorded = raceLapRecords2026.find(lap => lap.eventId === "2026-R03" && lap.driverId === driverId && lap.lapNumber === index + 1);
    if (!recorded || recorded.lapTimeMs !== lapTimeMs) throw new Error(`R3 ${driverId} lap ${index + 1} differs from the canonical lap archive`);
    const videoStartSeconds = (startSeconds * 1000 + elapsedMs) / 1000;
    elapsedMs += lapTimeMs;
    return { lapNumber: index + 1, videoStartSeconds, videoEndSeconds: (startSeconds * 1000 + elapsedMs) / 1000, recordedLapTimeMs: lapTimeMs };
  });
}
const r3Laps = r3RecordedLaps("DRV_TYLER", R3_ESTIMATED_LAP1_START_SECONDS, r3TylerLapTimesMs);
const r3RaceEndSeconds = r3Laps.at(-1)!.videoEndSeconds;
export const tylerRound3Onboard: OnboardVideo = {
  id: "2026-r3-tyler", season: 2026, round: 3, eventId: "2026-R03", driverId: "DRV_TYLER", kartNumber: 19,
  source: { type: "owner-gopro", reference: "copy_F1851896-BBA9-4144-9B7F-AD2F6825F93F.MOV", playbackUrl: "https://pub-780b62e2b1144605b0b3486d8ff9432e.r2.dev/2026/round-03/onboard/tyler-1080p.mp4", status: "available", corrections: ["Race lap 1 video start at 10:36 is an owner-supplied estimate; subsequent starts are cumulative recorded lap times."] },
  duration: 1949.067, poster: "/media/2026/round-3-tyler-onboard.jpg", intervalSemantics: "exact",
  sessions: [
    { id: "qualifying", title: "Qualifying", start: 0, end: 496, quick: true },
    { id: "formation", title: "Formation / pre-race", start: 496, end: R3_ESTIMATED_LAP1_START_SECONDS, quick: true },
    { id: "race", title: "Race", start: R3_ESTIMATED_LAP1_START_SECONDS, end: r3RaceEndSeconds, quick: true },
    { id: "finish", title: "Finish / cooldown", start: r3RaceEndSeconds, end: 1949.067, quick: true },
  ],
  laps: r3Laps, annotations: [],
};
const jonahR3Laps = r3RecordedLaps("DRV_JONAH", R3_JONAH_LAP1_START_SECONDS, r3JonahLapTimesMs);
export const jonahRound3Onboard: OnboardVideo = {
  id: "2026-r3-jonah", season: 2026, round: 3, eventId: "2026-R03", driverId: "DRV_JONAH", kartNumber: 61,
  source: { type: "owner-gopro", reference: "copy_0E9F0DF0-D034-4841-BB3C-C42C9D6AE15F.MOV", playbackUrl: "https://pub-780b62e2b1144605b0b3486d8ff9432e.r2.dev/2026/round-03/onboard/jonah-1080p.mp4", status: "available", corrections: ["Lap 1 start 10:37 is owner-confirmed to the video second. Qualifying/formation boundary at 08:16 is provisional; nearby footage was spot-checked, but the exact frame was not independently verified."] },
  duration: 1949.067, poster: "/media/2026/round-3-jonah-onboard.jpg", intervalSemantics: "exact",
  sessions: [
    { id: "qualifying", title: "Qualifying", start: 0, end: 496, quick: true },
    { id: "formation", title: "Formation / pre-race", start: 496, end: R3_JONAH_LAP1_START_SECONDS, quick: true },
    { id: "race", title: "Race", start: R3_JONAH_LAP1_START_SECONDS, end: jonahR3Laps.at(-1)!.videoEndSeconds, quick: true },
    { id: "finish", title: "Finish / cooldown", start: jonahR3Laps.at(-1)!.videoEndSeconds, end: 1949.067, quick: true },
  ],
  laps: jonahR3Laps, annotations: [],
};
export const onboardVideos2026: OnboardVideo[] = [tylerRound1Onboard, tylerRound3Onboard, jonahRound3Onboard];
export const availableOnboardVideos2026 = () => onboardVideos2026.filter(video => video.source.status === "available" && Boolean(video.source.playbackUrl));
export const onboardVideosForEvent2026 = (eventId: string) => availableOnboardVideos2026().filter(video => video.eventId === eventId);
export function onboardMoment(video: OnboardVideo, seconds: number) {
  const time = Math.max(0, Math.min(seconds, video.duration));
  const extra = video.intervalSemantics === "exact" ? 0 : 1;
  const session = video.sessions.find(s => time >= s.start && (time < s.end+extra || s === video.sessions.at(-1) && time === s.end));
  const lap = video.laps.find(l => time >= l.videoStartSeconds && time < l.videoEndSeconds+extra);
  return { session, lap };
}
export function parseOnboardLink(search: string, video: OnboardVideo): number | null {
  const params = new URLSearchParams(search);
  if (params.get("onboard") !== (video.driverId === "DRV_JONAH" ? "jonah" : "tyler")) return null;
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
export type MultiCamMode = "tyler" | "jonah" | "split";
export function parseMultiCamLink(search: string, videos: readonly OnboardVideo[]) {
  const params = new URLSearchParams(search);
  const requested = params.get("onboard");
  const mode: MultiCamMode = requested === "jonah" || requested === "split" ? requested : "tyler";
  const rawTime = params.get("t");
  const rawLap = params.get("lap");
  const video = videos.find(item => item.driverId === (mode === "jonah" ? "DRV_JONAH" : "DRV_TYLER"));
  let time: number | null = null;
  if (rawTime !== null && /^\d+(\.\d+)?$/.test(rawTime)) {
    const parsed = Number(rawTime);
    if (video && parsed <= video.duration) time = parsed;
  } else if (rawLap !== null && /^\d+$/.test(rawLap)) {
    time = video?.laps.find(lap => lap.lapNumber === Number(rawLap))?.videoStartSeconds ?? null;
  }
  return { mode, time };
}
export function playbackDriftCorrection(masterSeconds: number, followerSeconds: number, speed: number) {
  const drift = masterSeconds - followerSeconds;
  if (Math.abs(drift) > 1.25) return { seekTo: masterSeconds, playbackRate: speed };
  if (Math.abs(drift) > 0.25) return { seekTo: null, playbackRate: speed * (drift > 0 ? 1.04 : 0.96) };
  return { seekTo: null, playbackRate: speed };
}
export function onboardClock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value/60).toString().padStart(2,"0")}:${(value%60).toString().padStart(2,"0")}`;
}
