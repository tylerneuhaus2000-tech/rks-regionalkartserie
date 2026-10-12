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
        const data=snapshot.docs.map(item=>item.data()).find(item=>String(item.seasonId)==="2026"&&Number(item.round)===3&&String(item.trackId)===daytonaTrackId&&String(item.course??item.trackName??"").toLowerCase().includes("bahn 2"));
        if(!data){setInfo(initial);return;}
        const dateValue=data.startAt??data.date??null;
        setInfo({date:typeof dateValue==="string"&&dateValue.trim()?dateValue:initial.date,previousWinner:typeof data.previousWinnerName==="string"&&data.previousWinnerName.trim()?data.previousWinnerName.trim():null});
      },error=>console.error("Could not load published Round 3 metadata",error));
    }).catch(error=>console.error("Could not initialize Round 3 metadata",error));
    return()=>{cancelled=true;unsubscribe();};
  },[]);
  return info;
}
