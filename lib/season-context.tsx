"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const seasons = [2026, 2027, 2028] as const;
export type SeasonYear = typeof seasons[number];
const SeasonContext=createContext<{season:SeasonYear;setSeason:(year:SeasonYear)=>void}>({season:2026,setSeason:()=>{}});

export function SeasonProvider({children}:{children:React.ReactNode}){
  const[season,setSeason]=useState<SeasonYear>(2026);
  useEffect(()=>{const timer=window.setTimeout(()=>{const stored=Number(window.localStorage.getItem("rks-season"));if(seasons.includes(stored as SeasonYear))setSeason(stored as SeasonYear);},0);return()=>window.clearTimeout(timer);},[]);
  const value=useMemo(()=>({season,setSeason:(year:SeasonYear)=>{setSeason(year);window.localStorage.setItem("rks-season",String(year));}}),[season]);
  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}
export function useSeason(){return useContext(SeasonContext);}
