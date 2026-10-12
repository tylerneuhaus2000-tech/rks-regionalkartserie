"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X, Flag, Trophy, Home, Users } from "lucide-react";
import { motion } from "framer-motion";
import { allSections, primaryNav } from "@/lib/rks-data";

function isActive(pathname: string, href: string) { return pathname === href || (href !== "/" && pathname.startsWith(href)); }

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(()=>{if("serviceWorker" in navigator)void navigator.serviceWorker.register("/sw.js").catch(error=>console.warn("RKS offline shell is unavailable",error));},[]);
  const links = [...primaryNav, ...allSections];
  return <>
    <div className="topline"><div className="wrap"><span><strong>RKS</strong> · Regionalkartserie</span><span>Eine Serie. Jede Position zählt.</span></div></div>
    <header className="masthead"><div className="wrap mast-inner">
      <Link href="/" className="brand" aria-label="RKS Startseite"><span className="brand-mark">RKS</span><span className="brand-copy"><b>REGIONALKARTSERIE</b><small>OFFICIAL CHAMPIONSHIP</small></span></Link>
      <nav className="navlinks" aria-label="Hauptnavigation">{primaryNav.map(([label, href]) => <Link key={href} className={isActive(pathname, href) ? "active" : ""} href={href}>{label === "RaceHub" ? "RaceHub" : label}</Link>)}</nav>
      <span className="season-select">SEASON&nbsp; 2027</span>
      <button className="menu-toggle" aria-label={open ? "Menü schließen" : "Menü öffnen"} onClick={() => setOpen(!open)}>{open ? <X size={20}/> : <Menu size={20}/>}</button>
    </div>{open && <nav className="mobile-nav" aria-label="Mobile Navigation">{links.map(([label, href]) => <Link key={href} className={isActive(pathname, href) ? "active" : ""} href={href} onClick={() => setOpen(false)}>{label}</Link>)}</nav>}</header>
    <motion.main key={pathname} initial={{opacity:0,y:7}} animate={{opacity:1,y:0}} transition={{duration:.24,ease:"easeOut"}}>{children}</motion.main>
    <footer className="footer"><div className="wrap"><div className="footer-main"><div className="footer-brand"><Link href="/" className="brand"><span className="brand-mark">RKS</span><span className="brand-copy"><b>REGIONALKARTSERIE</b><small>OFFICIAL CHAMPIONSHIP</small></span></Link><p>Racing vor der Haustür. Die offizielle Plattform für Championship, Fahrer und RaceHub.</p></div><div className="footer-col"><h4>Championship</h4><Link href="/championship">Fahrerwertung</Link><Link href="/teams">Teamwertung</Link><Link href="/calendar">Kalender</Link><Link href="/statistics">Statistiken</Link></div><div className="footer-col"><h4>RKS entdecken</h4><Link href="/racehub">RaceHub <ArrowUpRight size={11}/></Link><Link href="/media">Media</Link><Link href="/regulations">Reglement</Link><Link href="/admin">Admin Login</Link></div></div><div className="footer-bottom"><span>© 2027 RKS – Regionalkartserie</span><span>Built for the love of racing.</span></div></div></footer>
    <nav className="mobile-bottom" aria-label="Schnellzugriff"><Link className={isActive(pathname,"/")?"active":""} href="/"><Home/><span>HOME</span></Link><Link className={isActive(pathname,"/championship")?"active":""} href="/championship"><Trophy/><span>STANDINGS</span></Link><Link className={isActive(pathname,"/drivers")?"active":""} href="/drivers"><Users/><span>DRIVERS</span></Link><Link className={isActive(pathname,"/calendar")?"active":""} href="/calendar"><Flag/><span>CALENDAR</span></Link><Link className={isActive(pathname,"/racehub")?"active":""} href="/racehub"><span className="glow-dot"/><span>RACEHUB</span></Link></nav>
  </>;
}
