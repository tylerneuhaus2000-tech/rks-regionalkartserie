import type { ReactNode } from "react";

export function PageHero({kicker,title,description,action}:{kicker:string;title:string;description:string;action?:ReactNode}){return <section className="page-hero"><div className="wrap page-hero-row"><div><div className="eyebrow"><span className="red">RKS</span> &nbsp; / &nbsp; {kicker}</div><h1 className="page-title">{title}</h1><p className="lede">{description}</p></div>{action}</div></section>;}
export function SectionHead({eyebrow,title,children}:{eyebrow:string;title:string;children?:ReactNode}){return <div className="section-head"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2></div>{children}</div>;}
export function StatCard({label,value,sub}:{label:string;value:string|number;sub?:string}){return <div className="card stat-card"><label>{label}</label><strong>{value}</strong>{sub&&<small>{sub}</small>}</div>;}
