import { RksPage } from "@/components/rks-pages";
import { SiteShell } from "@/components/site-shell";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

function metadataForSegments(slug: string[]): Metadata {
  if (slug[0] === "races" && slug[1] === "2026" && slug[2] === "round-1") return { title: "Round 1 · HOT 25 results and analysis", description: "RKS 2026 Round 1 at Daytona Kart Center Essen, Bahn 2 In & Outdoor. Official classification, qualifying positions, recorded lap analysis and source timing sheets." };
  if (slug[0] === "races" && slug[1] === "2026" && slug[2] === "round-2") return { title: "Round 2 · HOT 30 results and analysis", description: "Jonah won Round 2 at Daytona Essen Bahn 1 Indoor by 0.25 seconds. Tyler set the official fastest lap at 53.94 on lap 21. View classification and lap analysis." };
  if (slug[0] === "races" && slug[1] === "2026" && slug[2] === "round-3") return { title: "Round 3 · Daytona Kart Center Essen, Bahn 2", description: "RKS 2026 Round 3 is scheduled for 21 October at 17:00 at Daytona Kart Center Essen, Bahn 2. View event information and the championship battle." };
  if (slug[0] === "races" && slug[1] === "2026" && slug[2] === "round-4") return { title: "Round 4 · Winterferien NRW 2026", description: "RKS 2026 Round 4 is planned during Winterferien NRW. The exact date and venue will be confirmed." };
  if (slug[0] === "races") return { title: "2026 RKS races", description: "The RKS 2026 calendar, completed race results and event analysis, together in one place." };
  if (slug[0] === "calendar" && slug[1] === "round-3") return {
    title: "Round 3 · Daytona Kart Center Essen, Bahn 2",
    description: "RKS 2026 Round 3 is scheduled for 21 October at 17:00 at Daytona Kart Center Essen, Bahn 2. Follow the HOT 25 event preview and title fight.",
  };
  if (slug[0] === "calendar" && slug[1] === "round-1") return { title: "Round 1 · HOT 25 results", description: "RKS 2026 Round 1 at Daytona Kart Center Essen, Bahn 2 In & Outdoor, on 8 April. Explore the official classification and qualifying order." };
  if (slug[0] === "calendar" && (slug[1] === "round-2" || slug[1] === "latest")) return { title: "Round 2 · HOT 30 results", description: "Jonah won Round 2 at Daytona Essen Bahn 1 Indoor by 0.25 seconds. Tyler set the 53.940 fastest lap. View the official classification and RaceHub." };
  if (slug[0] === "calendar" && slug[1] === "round-4") return { title: "Round 4 · Winterferien NRW 2026", description: "RKS 2026 Round 4 is planned during the NRW winter holidays. Exact date and venue will be confirmed." };
  if (slug[0] === "calendar") return { title: "2026 RKS races", description: "The four-round Regionalkartserie calendar, race results and event information." };
  if (slug[0] === "racehub") return { title: `RaceHub · Round ${slug[1]?.match(/^round-(\d)$/)?.[1] ?? "2"}`, description: "Official RKS event report, classification, qualifying positions, lap-time evolution, pace analysis and championship impact. Lap pace comparisons stay within the same event and layout." };
  if (slug[0] === "drivers" && slug[1]) return { title: `${slug[1].replaceAll("-", " ")} · Driver profile`, description: "RKS 2026 driver profile with championship position, official results and layout-specific lap pace." };
  if (slug[0] === "drivers") return { title: "2026 RKS drivers", description: "The 2026 Regionalkartserie driver line-up, ranked by confirmed championship points and race results." };
  if (slug[0] === "championship") return { title: "2026 championship standings", description: "Live 2026 RKS Drivers Championship standings. Tyler leads Jonah by two points after two completed rounds." };
  if (slug[0] === "teams") return { title: "Teams · 2026 season status", description: "The 2026 inaugural season is contested as an individual Drivers Championship. No official teams are assigned." };
  if (slug[0] === "race-center") return { title: "2026 RKS races", description: "The RKS 2026 calendar, official results and event analysis." };
  if (slug[0] === "statistics") return { title: "2026 RKS statistics", description: "Verified championship records, event results and RKS best laps by layout from the RKS 2026 timing-sheet archive. Not venue-wide track records." };
  if (slug[0] === "achievements") return { title: "2026 RKS driver achievements", description: "Achievements earned in confirmed 2026 RKS race results, qualifying and championship standings." };
  if (slug[0] === "head-to-head") return { title: "Driver head to head · 2026", description: "Compare championship totals and select a shared RKS event to compare lap pace within the same circuit layout." };
  if (slug[0] === "regulations") return { title: "Confirmed 2026 sporting information", description: "The confirmed 2026 RKS scoring system, event formats and inaugural-season calendar." };
  return {};
}

function canonicalPathForSegments(slug: string[]) {
  const [section, resource] = slug;
  if (section === "calendar") {
    if (!resource) return "/races";
    if (resource === "latest") return "/races/2026/round-2";
    if (/^round-[1-4]$/.test(resource)) return `/races/2026/${resource}`;
  }
  if (section === "race-center") return "/races";
  if (section === "racehub") return /^round-[1-4]$/.test(resource ?? "") ? `/races/2026/${resource}` : "/races";
  return slug.length ? `/${slug.join("/")}` : "/";
}

function legacyRedirectForSegments(slug: string[]) {
  const [section] = slug;
  if (section === "calendar") return canonicalPathForSegments(slug);
  if (section === "race-center" || section === "racehub") return canonicalPathForSegments(slug);
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug = [] } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rks-regionalkartserie.tyler-nhs25.chatgpt.site";
  return {
    ...metadataForSegments(slug),
    alternates: { canonical: new URL(canonicalPathForSegments(slug), base).toString() },
  };
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const legacyDestination = legacyRedirectForSegments(slug);
  if (legacyDestination) redirect(legacyDestination);
  return <SiteShell><RksPage segments={slug}/></SiteShell>;
}
