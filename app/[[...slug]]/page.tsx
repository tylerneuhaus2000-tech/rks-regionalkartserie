import { RksPage } from "@/components/rks-pages";
import { SiteShell } from "@/components/site-shell";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug = [] } = await params;
  if (slug[0] !== "calendar") return {};
  const event = slug[1];
  if (event === "round-3") return {
    title: "Round 3 · Daytona Kart Center Essen, Bahn 2",
    description: "RKS 2026 Round 3 takes place on 21 October at Daytona Kart Center Essen, Bahn 2. Follow the countdown, event information and RaceHub.",
  };
  if (event === "round-1") return { title: "Round 1 · HOT 25 results", description: "RKS 2026 Round 1 at Daytona Kart Center Essen on 8 April. HOT 25 results are attached to the event." };
  if (event === "round-2" || event === "latest") return { title: "Round 2 · HOT 30 results", description: "RKS 2026 Round 2 at Daytona Kart Center Essen, Bahn 1 on 27 August. HOT 30 results are attached to the event." };
  if (event === "round-4") return { title: "Round 4 · Winterferien NRW 2026", description: "RKS 2026 Round 4 is scheduled during the NRW winter holidays. Exact date and venue will be confirmed." };
  return {};
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  return <SiteShell><RksPage segments={slug}/></SiteShell>;
}
