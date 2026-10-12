import { RksPage } from "@/components/rks-pages";
import { SiteShell } from "@/components/site-shell";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug = [] } = await params;
  if (slug[0] === "calendar" && slug[1] === "round-3") return {
    title: "Round 3 · Daytona Kart Center Essen, Bahn 2",
    description: "RKS 2026 Round 3 is scheduled for 21 October at 17:00 at Daytona Kart Center Essen, Bahn 2. Follow the HOT 25 event preview and title fight.",
  };
  if (slug[0] === "calendar" && slug[1] === "round-1") return { title: "Round 1 · HOT 25 results", description: "RKS 2026 Round 1 at Daytona Kart Center Essen, Bahn 2 In & Outdoor, on 8 April. Explore the official classification and qualifying order." };
  if (slug[0] === "calendar" && (slug[1] === "round-2" || slug[1] === "latest")) return { title: "Round 2 · HOT 30 results", description: "Jonah won Round 2 at Daytona Essen Bahn 1 Indoor by 0.25 seconds. Tyler set the 53.940 fastest lap. View the official classification and RaceHub." };
  if (slug[0] === "calendar" && slug[1] === "round-4") return { title: "Round 4 · Winterferien NRW 2026", description: "RKS 2026 Round 4 is planned during the NRW winter holidays. Exact date and venue will be confirmed." };
  if (slug[0] === "calendar") return { title: "2026 RKS race calendar", description: "The four-round Regionalkartserie inaugural season calendar, with official R1 and R2 results and upcoming event details." };
  if (slug[0] === "racehub") return { title: `RaceHub · Round ${slug[1]?.match(/^round-(\d)$/)?.[1] ?? "2"}`, description: "Official RKS event report, classification, fastest laps and championship impact. Analysis uses confirmed event data." };
  if (slug[0] === "drivers" && slug[1]) return { title: `${slug[1].replaceAll("-", " ")} · Driver profile`, description: "2026 Regionalkartserie driver profile, championship points, confirmed results, RKS Driver Rating and season statistics." };
  if (slug[0] === "drivers") return { title: "2026 RKS drivers", description: "Meet the drivers in the inaugural Regionalkartserie championship. See points, results, podiums and RKS Driver Ratings." };
  if (slug[0] === "championship") return { title: "2026 championship standings", description: "Live 2026 RKS Drivers Championship standings. Tyler leads Jonah by two points after two completed rounds." };
  if (slug[0] === "teams") return { title: "Teams · 2026 season status", description: "The 2026 inaugural season is contested as an individual Drivers Championship. No official teams are assigned." };
  if (slug[0] === "race-center") return { title: "Race Center · 2026 season analytics", description: "Championship progression, race records, form and official results from the RKS 2026 season." };
  if (slug[0] === "statistics") return { title: "2026 RKS statistics", description: "Verified championship records, event results, fastest laps and layout-specific best laps from the RKS 2026 archive." };
  if (slug[0] === "media") return { title: "RKS official media archive", description: "Official Regionalkartserie photographs, video and event downloads. No race media has been published yet." };
  if (slug[0] === "regulations") return { title: "Confirmed 2026 sporting information", description: "The confirmed 2026 RKS scoring system, event formats and inaugural-season calendar." };
  return {};
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  return <SiteShell><RksPage segments={slug}/></SiteShell>;
}
