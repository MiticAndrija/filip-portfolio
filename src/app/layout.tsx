import type { Metadata, Viewport } from "next";
import "@fontsource/anton/latin-ext-400.css";
import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://filip-creative-orbit.vast-auk-6252.chatgpt.site"),
  title: { default: "Filip Radojković — Creative Orbit", template: "%s — Filip Radojković" },
  description: "Creative production, social media and live events by Filip Radojković. Explore his selected work.",
  openGraph: { title: "Filip Radojković — Creative Orbit", description: "Creative production, social media and events by Filip Radojković.", images: [{ url: "/art/social-card.png", width: 1200, height: 630 }] },
  icons: { icon: "/icon.svg" },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#f1f0e9", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><SiteShell>{children}</SiteShell></body></html>;
}
