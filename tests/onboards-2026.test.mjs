import test from 'node:test';
import assert from 'node:assert/strict';
import { tylerRound1Onboard as video, onboardMoment, parseOnboardLink, onboardVideosForEvent2026 } from '../data/2026/onboards.ts';
import { raceLapRecords2026 } from '../data/2026/lap-times.ts';
import { season2026 } from '../data/2026/season.ts';
test('R1 onboard preserves verified identities and all 19 recorded laps',()=>{
 assert.equal(video.round,1);assert.equal(video.season,2026);assert.equal(video.eventId,'2026-R01');assert.equal(video.driverId,'DRV_TYLER');assert.equal(video.kartNumber,67);assert.equal(video.laps.length,19);
 for(const lap of video.laps){const source=raceLapRecords2026.find(l=>l.eventId===video.eventId&&l.driverId===video.driverId&&l.lapNumber===lap.lapNumber);assert.equal(lap.recordedLapTimeMs,source.lapTimeMs);assert.equal(source.kartNumber,67);}
 assert.equal(season2026.events[0].results.find(r=>r.driverId===video.driverId).position,1);
 assert.equal(video.laps[17].recordedLapTimeMs,76880);assert.equal(Math.min(...video.laps.map(l=>l.recordedLapTimeMs)),76880);
});
test('video ranges and source corrections are authoritative and do not overlap',()=>{
 assert.equal(video.duration,2832);assert.equal(video.laps[0].videoStartSeconds,1117);assert.equal(video.laps[18].videoStartSeconds,2568);assert.equal(video.laps[18].videoEndSeconds,2646);
 assert.equal(video.laps[13].videoStartSeconds,2181);assert.equal(video.laps[17].videoStartSeconds,2491);
 for(let i=0;i<video.laps.length;i++){const l=video.laps[i];assert.ok(l.videoStartSeconds<l.videoEndSeconds);if(i)assert.equal(l.videoStartSeconds,video.laps[i-1].videoEndSeconds+1);}
 assert.equal(video.source.corrections.length,1);assert.deepEqual(video.annotations,[]);
 assert.deepEqual(video.sessions.find(s=>s.id==='qualifying'),{id:'qualifying',title:'Qualifying',start:372,end:709,quick:true});
 assert.deepEqual(video.sessions.find(s=>s.id==='formation'),{id:'formation',title:'Formation lap',start:832,end:1116,quick:true});assert.equal(video.sessions.find(s=>s.id==='finish').start,2647);
});
test('active lap and session boundaries use inclusive supplied end seconds',()=>{
 for(const lap of video.laps){assert.equal(onboardMoment(video,lap.videoStartSeconds).lap.lapNumber,lap.lapNumber);assert.equal(onboardMoment(video,lap.videoEndSeconds+.5).lap.lapNumber,lap.lapNumber);}
 assert.equal(onboardMoment(video,1116.9).session.id,'formation');assert.equal(onboardMoment(video,2647).lap,undefined);assert.equal(onboardMoment(video,2647).session.id,'finish');assert.equal(onboardMoment(video,2832).session.id,'finish');
});
test('deep links parse laps and timestamps without inventing values',()=>{
 assert.equal(parseOnboardLink('?onboard=tyler&lap=18',video),2491);assert.equal(parseOnboardLink('?onboard=tyler&lap=13',video),2102);assert.equal(parseOnboardLink('?onboard=tyler&t=2102',video),2102);assert.equal(parseOnboardLink('?onboard=tyler&t=0',video),0);
 for(const query of ['?onboard=jonah&lap=18','?lap=18','?onboard=tyler&lap=20','?onboard=tyler&lap=1.5','?onboard=tyler&t=-1','?onboard=tyler&t=2833','?onboard=tyler&t=NaN','?onboard=tyler&t='])assert.equal(parseOnboardLink(query,video),null);
});
test('session boundaries cover the owner-supplied source without overlaps',()=>{
 for(let i=0;i<video.sessions.length;i++){
  const s=video.sessions[i];assert.ok(s.start>=0&&s.end<=video.duration&&s.end>s.start);
  if(i)assert.equal(s.start,video.sessions[i-1].end+1);
  assert.equal(onboardMoment(video,s.start).session.id,s.id);
 }
 assert.equal(video.source.playbackUrl,'https://pub-780b62e2b1144605b0b3486d8ff9432e.r2.dev/2026/round-01/onboard/tyler-1080p.mp4');assert.equal(video.source.status,'available');
 assert.deepEqual(onboardVideosForEvent2026('2026-R01').map(item=>item.id),[video.id]);
 assert.deepEqual(onboardVideosForEvent2026('2026-R02'),[]);
 assert.deepEqual(onboardVideosForEvent2026('2026-R03'),[]);
});
