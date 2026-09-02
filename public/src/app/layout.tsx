import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/content/site";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LoadoutProvider } from "@/providers/LoadoutProvider";
import { PreferencesProvider } from "@/providers/PreferencesProvider";
import { UIProvider } from "@/providers/UIProvider";
import { LoadoutDrawer } from "@/components/commerce/LoadoutDrawer";
import { QuickView } from "@/components/commerce/QuickView";
import { SizeGuide } from "@/components/commerce/SizeGuide";
import { CommandConsole } from "@/components/commerce/CommandConsole";
import { Toaster } from "@/components/ui/Toaster";

/**
 * Fonts are self-hosted variable woff2 files, subset to latin and committed to
 * the repo: one request each, no third-party DNS lookup, no layout shift, and
 * the build never depends on Google being reachable.
 */
const display = localFont({
  src: "../fonts/oswald-latin-variable.woff2",
  weight: "200 700",
  variable: "--font-oswald",
  display: "swap",
  fallback: ["Arial Narrow", "system-ui", "sans-serif"],
});

const body = localFont({
  src: "../fonts/archivo-latin-variable.woff2",
  weight: "100 900",
  variable: "--font-archivo",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const mono = localFont({
  src: "../fonts/jetbrains-mono-latin-variable.woff2",
  weight: "100 800",
  variable: "--font-mono-jb",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "ZENJI — Anime Streetwear, Melbourne",
    template: "%s — ZENJI",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "anime streetwear",
    "anime clothing Australia",
    "oversized graphic tee Melbourne",
    "Japanese streetwear AU",
    "heavyweight tee 240gsm",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: site.url,
    siteName: site.name,
    title: "ZENJI — Anime Streetwear, Melbourne",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "ZENJI — Anime Streetwear, Melbourne",
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const organisationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  description: site.description,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Level 2, 61 Smith Street",
    addressLocality: "Fitzroy",
    addressRegion: "VIC",
    postalCode: "3065",
    addressCountry: "AU",
  },
  areaServed: "AU",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="grain relative min-h-dvh antialiased">
        <script
          type="application/ld+json"
          // Static, developer-authored JSON — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
        />

        <PreferencesProvider>
          <LoadoutProvider>
            <UIProvider>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-oxide focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:text-bone"
              >
                Skip to content
              </a>

              <SiteHeader />
              <main id="main" tabIndex={-1} className="outline-none">
                {children}
              </main>
              <SiteFooter />

              <LoadoutDrawer />
              <QuickView />
              <SizeGuide />
              <CommandConsole />
              <Toaster />
            </UIProvider>
          </LoadoutProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
