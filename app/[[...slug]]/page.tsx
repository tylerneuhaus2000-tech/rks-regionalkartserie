import { RksPage } from "@/components/rks-pages";
import { SiteShell } from "@/components/site-shell";

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  return <SiteShell><RksPage segments={slug}/></SiteShell>;
}
