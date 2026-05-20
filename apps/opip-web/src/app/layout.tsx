/**
 * Root layout and static metadata for the opip web app.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { AppThemeInitScript } from "@beep/ui/themes/theme-init-script";
import { Config, Effect, pipe } from "effect";
import * as O from "effect/Option";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { connection } from "next/server";
import type { ReactNode } from "react";
import { opipSiteContent } from "../content";
import "./globals.css";

const { metadata: siteMetadata } = opipSiteContent;
const REACT_GRAB_VERSION = "0.1.34";
const REACT_GRAB_INTEGRITY = "sha384-J3uUkSxoVuSuDgef6b1qRkPjoviSf3OhttzqVTJd98rv0/hPenLy8KfgE7UEulp2";
const configStringOptionSync = (name: string): O.Option<string> => Effect.runSync(Config.option(Config.string(name)));
const configStringEqualsSync = (name: string, expected: string): boolean =>
  pipe(
    configStringOptionSync(name),
    O.exists((value) => value === expected)
  );
const shouldLoadReactGrab =
  configStringEqualsSync("NODE_ENV", "development") && configStringEqualsSync("NEXT_PUBLIC_REACT_GRAB", "1");
const shouldLoadVercelInsights =
  configStringEqualsSync("VERCEL", "1") && configStringEqualsSync("NEXT_PUBLIC_ENABLE_VERCEL_INSIGHTS", "1");
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
  const applyRootMode = (mode) => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(mode);
    document.documentElement.style.colorScheme = mode;
    setItem(opipKey, mode);
    setItem(muiModeKey, mode);
    setItem(muiSchemeKey + "-light", "light");
    setItem(muiSchemeKey + "-dark", "dark");
  };
  const syncThemeUi = () => {
    const mode = readMode();
    applyRootMode(mode);
    document.querySelectorAll("[data-opip-theme-toggle]").forEach((button) => syncButton(button, mode));
  };
  const scheduleHydratedSync = () => {
    window.setTimeout(syncThemeUi, 0);
    window.setTimeout(syncThemeUi, 250);
  };
  applyRootMode(readMode());
  const init = () => {
    scheduleHydratedSync();
    document.addEventListener("click", (event) => {
      const target = event.target;
      const button = target instanceof Element ? target.closest("[data-opip-theme-toggle]") : null;
      if (button === null) return;
      const mode = readMode() === "dark" ? "light" : "dark";
      applyRootMode(mode);
      syncButton(button, mode);
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
`;

function VercelInsights() {
  if (!shouldLoadVercelInsights) {
    return null;
  }

  return Promise.all([import("@vercel/analytics/next"), import("@vercel/speed-insights/next")]).then(
    ([{ Analytics }, { SpeedInsights }]) => (
      <>
        <Analytics />
        <SpeedInsights />
      </>
    )
  );
}

/**
 * Allows the nonce-bearing root layout to block on request state.
 *
 * @example
 * ```ts
 * import { unstable_instant } from "@beep/opip-web/app/layout"
 *
 * console.log(unstable_instant)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const unstable_instant = false;

/**
 * Static metadata for the opip web app shell.
 *
 * @example
 * ```ts
 * import { metadata } from "@beep/opip-web/app/layout"
 *
 * console.log(metadata.applicationName)
 * ```
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
 * @example
 * ```tsx
 * import RootLayout from "@beep/opip-web/app/layout"
 *
 * const layout = await RootLayout({ children: <main /> })
 * console.log(layout.type)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): Promise<ReactNode> {
  return connection()
    .then(() => headers())
    .then((requestHeaders) => {
      const nonce = requestHeaders.get("x-nonce") ?? undefined;

      return (
        <html lang="en" className="h-full antialiased" suppressHydrationWarning>
          <head>
            <AppThemeInitScript attribute="class" defaultMode="light" modeStorageKey="mui-mode" nonce={nonce} />
            <script
              nonce={nonce}
              suppressHydrationWarning
              // biome-ignore lint/security/noDangerouslySetInnerHtml: static theme controller without user input
              dangerouslySetInnerHTML={{ __html: opipThemeToggleScript }}
            />
            {shouldLoadReactGrab && (
              <Script
                src={`https://unpkg.com/react-grab@${REACT_GRAB_VERSION}/dist/index.global.js`}
                crossOrigin="anonymous"
                integrity={REACT_GRAB_INTEGRITY}
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
    });
}
