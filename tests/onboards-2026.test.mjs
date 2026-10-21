import test from 'node:test';
import assert from 'node:assert/strict';
import { tylerRound1Onboard as video, tylerRound3Onboard as r3, R3_ESTIMATED_LAP1_START_SECONDS, onboardMoment, parseOnboardLink, onboardVideosForEvent2026 } from '../data/2026/onboards.ts';
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
 assert.deepEqual(onboardVideosForEvent2026('2026-R03').map(item=>item.id),[r3.id]);
});
test('R3 onboard derives 24 exact lap boundaries from canonical race laps and an explicit estimated offset',()=>{
 assert.equal(R3_ESTIMATED_LAP1_START_SECONDS,636);
 assert.equal(r3.driverId,'DRV_TYLER');assert.equal(r3.eventId,'2026-R03');assert.equal(r3.laps.length,24);assert.equal(r3.intervalSemantics,'exact');
 assert.equal(r3.laps[0].videoStartSeconds,636);assert.equal(r3.laps[17].videoStartSeconds,1466.5);assert.equal(r3.laps[17].recordedLapTimeMs,47703);assert.equal(r3.laps.at(-1).videoEndSeconds,1809.633);
 for(const lap of r3.laps){const source=raceLapRecords2026.find(item=>item.eventId===r3.eventId&&item.driverId===r3.driverId&&item.lapNumber===lap.lapNumber);assert.equal(lap.recordedLapTimeMs,source.lapTimeMs);assert.equal(onboardMoment(r3,lap.videoStartSeconds).lap?.lapNumber,lap.lapNumber);}
 for(let index=1;index<r3.laps.length;index++)assert.equal(r3.laps[index].videoStartSeconds,r3.laps[index-1].videoEndSeconds);
 assert.equal(onboardMoment(r3,495.999).session?.id,'qualifying');assert.equal(onboardMoment(r3,496).session?.id,'formation');
 assert.equal(onboardMoment(r3,635.999).lap,undefined);assert.equal(onboardMoment(r3,636).lap?.lapNumber,1);
 assert.equal(onboardMoment(r3,1466.499).lap?.lapNumber,17);assert.equal(onboardMoment(r3,1466.5).lap?.lapNumber,18);
 assert.equal(onboardMoment(r3,1809.633).lap,undefined);assert.equal(onboardMoment(r3,1809.633).session?.id,'finish');
 assert.equal(parseOnboardLink('?onboard=tyler&lap=18',r3),1466.5);
 assert.equal(parseOnboardLink('?onboard=tyler&t=0',r3),0);
 assert.equal(r3.annotations.length,0);
});
