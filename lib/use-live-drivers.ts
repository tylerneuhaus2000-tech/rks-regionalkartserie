"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { drivers as initialDrivers, Driver } from "@/lib/rks-data";
import { firebaseConfigured, getFirebaseDb } from "@/lib/firebase-client";

/** Realtime published driver docs override the bundled, supplied standings. */
export function useLiveDrivers() {
  const [drivers,setDrivers]=useState<Driver[]>(initialDrivers);
  useEffect(()=>{
    if(!firebaseConfigured)return;
    const db=getFirebaseDb();if(!db)return;
    const liveQuery=query(collection(db,"drivers"),where("published","==",true),where("active","==",true));
    return onSnapshot(liveQuery,snapshot=>{
      if(snapshot.empty)return;
      const next=snapshot.docs.map((record,index)=>{const data=record.data();return{name:String(data.name??"Unnamed driver"),slug:String(data.slug??record.id),points:Number(data.points??0),position:Number(data.position??index+1),qualifying:typeof data.qualifying==="number"?data.qualifying:undefined,tags:Array.isArray(data.tags)?data.tags.map(String):[]} as Driver;});
      next.sort((a,b)=>a.position-b.position);setDrivers(next);
    },error=>console.error("Could not load published RKS driver entries",error));
  },[]);
  return drivers;
}
