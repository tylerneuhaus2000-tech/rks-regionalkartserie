import type { MetadataRoute } from "next";
import { drivers } from "@/lib/rks-data";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rks-regionalkartserie.tyler-nhs25.chatgpt.site";
  const paths = ["", "championship", "drivers", "teams", "calendar", "calendar/round-1", "calendar/round-2", "calendar/round-3", "calendar/round-4", "racehub", "racehub/round-1", "racehub/round-2", "race-center", "statistics", "head-to-head", "achievements", "media", "regulations"];
  return [...paths.map(path => ({ url: `${base}/${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : .7 })), ...drivers.map(driver => ({ url: `${base}/drivers/${driver.slug}`, changeFrequency: "weekly" as const, priority: .5 }))];
}
