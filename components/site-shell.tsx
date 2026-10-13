"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X, Trophy, Home, Users, BarChart3, Flag } from "lucide-react";
import { primaryNav } from "@/lib/rks-data";
import { SeasonProvider, useSeason } from "@/lib/season-context";

function isActive(pathname: string, href: string) { return pathname === href || (href !== "/" && pathname.startsWith(href)); }

function SeasonSelector(){const{season,setSeason}=useSeason();return <label className="season-select"><span>SEASON</span><select aria-label="Championship season" value={season} onChange={event=>setSeason(Number(event.target.value) as 2026|2027|2028)}>{[2026,2027,2028].map(year=><option key={year} value={year}>{year}{year===2026?" · current":""}</option>)}</select></label>;}

function SiteShellContent({ children }: { children: React.ReactNode }) {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const pathname = usePathname();
  const open = openPath === pathname;
  const {season}=useSeason();
  useEffect(()=>{if("serviceWorker" in navigator)void navigator.serviceWorker.register("/sw.js").catch(error=>console.warn("RKS offline shell is unavailable",error));},[]);
  useEffect(()=>{if(!open)return;const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpenPath(null);};window.addEventListener("keydown",closeOnEscape);return()=>window.removeEventListener("keydown",closeOnEscape);},[open]);
  const links = primaryNav;
  return <>
    <div className="topline"><div className="wrap"><span><strong>RKS</strong> · Regionalkartserie</span><span>One series. Every position counts.</span></div></div>
    <header className="masthead"><div className="wrap mast-inner">
      <Link href="/" className="brand" aria-label="RKS Startseite"><span className="brand-mark">RKS</span><span className="brand-copy"><b>REGIONALKARTSERIE</b><small>OFFICIAL CHAMPIONSHIP</small></span></Link>
      <nav className="navlinks" aria-label="Primary navigation">{primaryNav.map(([label, href]) => <Link key={href} className={isActive(pathname, href) ? "active" : ""} aria-current={isActive(pathname,href)?"page":undefined} href={href}>{label}</Link>)}</nav>
      <div className="desktop-season"><SeasonSelector/></div>
      <button type="button" className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="rks-mobile-navigation" onClick={() => setOpenPath(open ? null : pathname)}>{open ? <X size={20}/> : <Menu size={20}/>}</button>
    </div>{open && <nav className="mobile-nav" id="rks-mobile-navigation" aria-label="Mobile Navigation">{links.map(([label, href]) => <Link key={href} className={isActive(pathname, href) ? "active" : ""} aria-current={isActive(pathname,href)?"page":undefined} href={href} onClick={() => setOpenPath(null)}>{label}</Link>)}<div className="mobile-season-wrap"><span>Championship season</span><SeasonSelector/></div></nav>}</header>
    <main key={pathname} className="page-transition">{children}</main>
    <footer className="footer"><div className="wrap"><div className="footer-main"><div className="footer-brand"><Link href="/" className="brand"><span className="brand-mark">RKS</span><span className="brand-copy"><b>REGIONALKARTSERIE</b><small>OFFICIAL CHAMPIONSHIP</small></span></Link><p>The official home of RKS 2026: standings, drivers and every race weekend.</p></div><div className="footer-col"><h4>Championship</h4><Link href="/championship">2026 Drivers’ Championship</Link><Link href="/drivers">Drivers</Link><Link href="/statistics">Statistics</Link></div><div className="footer-col"><h4>Race weekend</h4><Link href="/races">All races</Link><Link href="/races/2026/round-2">Round 2 · Race Analysis <ArrowUpRight size={11}/></Link><Link href="/regulations">Regulations</Link><Link href="/admin">Admin Login</Link></div></div><div className="footer-bottom"><span>© {season} RKS – Regionalkartserie</span><span>Built for the love of racing.</span></div></div></footer>
    <nav className="mobile-bottom" aria-label="Quick navigation"><Link aria-current={isActive(pathname,"/")?"page":undefined} className={isActive(pathname,"/")?"active":""} href="/"><Home/><span>HOME</span></Link><Link aria-current={isActive(pathname,"/championship")?"page":undefined} className={isActive(pathname,"/championship")?"active":""} href="/championship"><Trophy/><span>CHAMPIONSHIP</span></Link><Link aria-current={isActive(pathname,"/races")||isActive(pathname,"/calendar")||isActive(pathname,"/racehub")?"page":undefined} className={isActive(pathname,"/races")||isActive(pathname,"/calendar")||isActive(pathname,"/racehub")?"active":""} href="/races"><Flag/><span>RACES</span></Link><Link aria-current={isActive(pathname,"/drivers")?"page":undefined} className={isActive(pathname,"/drivers")?"active":""} href="/drivers"><Users/><span>DRIVERS</span></Link><Link aria-current={isActive(pathname,"/statistics")?"page":undefined} className={isActive(pathname,"/statistics")?"active":""} href="/statistics"><BarChart3/><span>STATS</span></Link></nav>
  </>;
}

export function SiteShell({children}:{children:React.ReactNode}){return <SeasonProvider><SiteShellContent>{children}</SiteShellContent></SeasonProvider>;}
