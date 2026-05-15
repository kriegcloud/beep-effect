/**
 * Root layout and static metadata for the opip web app.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { AppThemeInitScript } from "@beep/ui/themes/theme-init-script";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import type { ReactNode } from "react";
import { opipSiteContent } from "../content";
import "./globals.css";

const { metadata: siteMetadata } = opipSiteContent;
const REACT_GRAB_VERSION = "0.1.34";
const shouldLoadReactGrab = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_REACT_GRAB === "1";
const shouldLoadVercelInsights = process.env.VERCEL === "1";
const opipThemeToggleScript = `
(() => {
  const opipKey = "opip-theme-mode";
  const muiModeKey = "mui-mode";
  const muiSchemeKey = "mui-color-scheme";
  const isMode = (value) => value === "light" || value === "dark";
  const getItem = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const setItem = (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  };
  const readMode = () => {
    const storedMode = getItem(opipKey);
    if (isMode(storedMode)) return storedMode;
    const muiMode = getItem(muiModeKey);
    if (isMode(muiMode)) return muiMode;
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  };
  const syncButton = (button, mode) => {
    const isDark = mode === "dark";
    button.dataset.themeMode = mode;
    button.setAttribute("aria-label", "Switch to " + (isDark ? "light" : "dark") + " mode");
    button.setAttribute("aria-pressed", String(isDark));
  };
  const applyMode = (mode) => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(mode);
    document.documentElement.style.colorScheme = mode;
    setItem(opipKey, mode);
    setItem(muiModeKey, mode);
    setItem(muiSchemeKey + "-light", "light");
    setItem(muiSchemeKey + "-dark", "dark");
    document.querySelectorAll("[data-opip-theme-toggle]").forEach((button) => syncButton(button, mode));
  };
  const init = () => {
    applyMode(readMode());
    document.addEventListener("click", (event) => {
      const target = event.target;
      const button = target instanceof Element ? target.closest("[data-opip-theme-toggle]") : null;
      if (button === null) return;
      applyMode(readMode() === "dark" ? "light" : "dark");
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
`;

async function VercelInsights() {
  if (!shouldLoadVercelInsights) {
    return null;
  }

  const [{ Analytics }, { SpeedInsights }] = await Promise.all([
    import("@vercel/analytics/next"),
    import("@vercel/speed-insights/next"),
  ]);

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

/**
 * Allows the nonce-bearing root layout to block for request headers.
 *
 * @category configuration
 * @since 0.0.0
 */
export const unstable_instant = false;

/**
 * Static metadata for the opip web app shell.
 *
 * @category models
 * @since 0.0.0
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: "%s | opip.law",
  },
  description: siteMetadata.description,
  applicationName: "opip.law",
  authors: [{ name: "Thomas J. Oppold" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.siteName,
    title: siteMetadata.title,
    description: siteMetadata.description,
    locale: "en_US",
    images: [
      {
        url: siteMetadata.ogImage,
        width: 1200,
        height: 630,
        alt: "opip.law - patent counsel for the people who build the machines.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: [siteMetadata.ogImage],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/opip/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/opip/apple-touch-icon.png",
  },
  keywords: [
    "patent attorney",
    "intellectual property attorney",
    "agricultural equipment patent",
    "patent litigation",
    "patent prosecution",
    "Federal Circuit",
    "PTAB IPR",
    "Thomas J. Oppold",
  ],
  manifest: "/manifest.webmanifest",
  robots: {
    follow: true,
    index: true,
  },
};

/**
 * Root HTML layout for the opip web app.
 *
 * @category constructors
 * @since 0.0.0
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <AppThemeInitScript attribute="class" defaultMode="light" modeStorageKey="mui-mode" nonce={nonce} />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: nonce-protected static theme controller without user input */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: opipThemeToggleScript }} />
        {shouldLoadReactGrab && (
          <Script
            src={`https://unpkg.com/react-grab@${REACT_GRAB_VERSION}/dist/index.global.js`}
            crossOrigin="anonymous"
            nonce={nonce}
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <VercelInsights />
      </body>
    </html>
  );
}
