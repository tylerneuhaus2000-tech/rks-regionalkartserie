"use client";

import { useEffect, useState } from "react";
import { daytonaTrackId, round3Event } from "@/lib/rks-data";
import { firebaseConfigured } from "@/lib/firebase-config";

type Round3Info={date:string|null;previousWinner:string|null};
const initial:Round3Info={date:round3Event.date,previousWinner:null};

/** Admin-published event metadata flows to the round page without a redeploy. */
export function useLiveRound3(){
  const[info,setInfo]=useState<Round3Info>(initial);
  useEffect(()=>{
    if(!firebaseConfigured)return;
    let cancelled=false;let unsubscribe=()=>{};
    void Promise.all([import("firebase/firestore"),import("@/lib/firebase-client")]).then(([firestore,firebase])=>{
      const db=firebase.getFirebaseDb();if(!db||cancelled)return;
      const events=firestore.query(firestore.collection(db,"events"),firestore.where("published","==",true));
      unsubscribe=firestore.onSnapshot(events,snapshot=>{
        const data=snapshot.docs.map(item=>({...item.data(),documentId:item.id} as Record<string,unknown>)).find(item=>String(item.seasonId)==="2026"&&Number(item.round)===3&&String(item.id??item.documentId)==="2026-R03"&&String(item.trackId)===daytonaTrackId&&String(item.course??item.trackName??"").toLowerCase().includes("bahn 2"));
        if(!data){setInfo(initial);return;}
        const dateValue=data.startAt??data.date??null;
        const dateString=typeof dateValue==="string"?dateValue.trim():"";
        const candidateDate=dateString?new Date(dateString).getTime():Number.NaN;
        const candidateDay=dateString?dateString.slice(0,10):"";
        const confirmedDay=initial.date?.slice(0,10);
        const date=Number.isFinite(candidateDate)&&candidateDay===confirmedDay?initial.date:dateString&&Number.isFinite(candidateDate)?dateString:initial.date;
        const previousWinnerValue=data.previousWinner??data.previousWinnerName;
        const previousWinner=typeof previousWinnerValue==="string"&&previousWinnerValue.trim()?previousWinnerValue.trim():null;
        setInfo({date,previousWinner});
      },error=>console.error("Could not load published Round 3 metadata",error));
    }).catch(error=>console.error("Could not initialize Round 3 metadata",error));
    return()=>{cancelled=true;unsubscribe();};
  },[]);
  return info;
}
