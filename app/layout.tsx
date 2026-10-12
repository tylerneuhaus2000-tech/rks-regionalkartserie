import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "RKS – Regionalkartserie", template: "%s | RKS" },
  description: "The official home of the RKS Regionalkartserie. Follow the 2026 inaugural Drivers and Teams Championships, the race calendar, event results and RaceHub.",
  applicationName: "RKS Regionalkartserie",
  manifest: "/manifest.webmanifest",
  openGraph: { title: "RKS – Regionalkartserie", description: "A new season. Every position matters.", type: "website", locale: "de_DE" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#111111", colorScheme: "dark", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
