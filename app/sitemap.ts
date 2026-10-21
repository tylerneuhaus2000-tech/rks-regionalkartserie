import type { MetadataRoute } from "next";
import { drivers } from "@/lib/rks-data";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rks-regionalkartserie.tyler-nhs25.chatgpt.site";
  const paths = ["", "championship", "drivers", "races", "replays", "races/2026/round-1", "races/2026/round-2", "races/2026/round-3", "races/2026/round-4", "statistics", "achievements", "head-to-head", "regulations"];
  return [...paths.map(path => ({ url: `${base}/${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : .7 })), ...drivers.map(driver => ({ url: `${base}/drivers/${driver.slug}`, changeFrequency: "weekly" as const, priority: .5 }))];
}
