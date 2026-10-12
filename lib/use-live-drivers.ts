"use client";

import { useEffect, useState } from "react";
import { drivers as initialDrivers } from "@/lib/rks-data";
import type { Driver } from "@/lib/rks-data";
import { firebaseConfigured } from "@/lib/firebase-config";

/** Realtime published driver docs override the bundled, supplied standings. */
export function useLiveDrivers(season=2026) {
  const [drivers,setDrivers]=useState<Driver[]>(season===2026?initialDrivers:[]);
  useEffect(()=>{
    setDrivers(season===2026?initialDrivers:[]);
    if(!firebaseConfigured)return;
    let cancelled=false;let unsubscribe=()=>{};
    void Promise.all([import("firebase/firestore"),import("@/lib/firebase-client")]).then(([firestore,firebase])=>{
      const db=firebase.getFirebaseDb();if(!db||cancelled)return;
      const liveQuery=firestore.query(firestore.collection(db,"drivers"),firestore.where("published","==",true),firestore.where("active","==",true),firestore.where("seasonId","==",String(season)));
      unsubscribe=firestore.onSnapshot(liveQuery,snapshot=>{
        if(snapshot.empty)return;
        const next=snapshot.docs.map((record,index)=>{const data=record.data();return{name:String(data.name??"Unnamed driver"),slug:String(data.slug??record.id),points:Number(data.points??0),position:Number(data.position??index+1),qualifying:typeof data.qualifying==="number"?data.qualifying:undefined,tags:Array.isArray(data.tags)?data.tags.map(String):[]} as Driver;});
        next.sort((a,b)=>a.position-b.position);setDrivers(next);
      },error=>console.error("Could not load published RKS driver entries",error));
    }).catch(error=>console.error("Could not initialize RKS standings",error));
    return()=>{cancelled=true;unsubscribe();};
  },[season]);
  return drivers;
}
