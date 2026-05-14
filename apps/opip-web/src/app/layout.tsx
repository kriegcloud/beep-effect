/**
 * Root layout and static metadata for the opip web app.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { AppThemeInitScript } from "@beep/ui/themes/theme-init-script";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Newsreader } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";
import { opipSiteContent } from "../content";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--next-font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--next-font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--next-font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

const { metadata: siteMetadata } = opipSiteContent;
const REACT_GRAB_VERSION = "0.1.34";
const shouldLoadReactGrab = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_REACT_GRAB === "1";

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

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Thomas J. Oppold",
  familyName: "Oppold",
  givenName: "Thomas",
  jobTitle: "Patent Attorney",
  url: siteMetadata.siteUrl,
  sameAs: [siteMetadata.linkedInUrl],
  knowsAbout: [
    "Patent prosecution",
    "Patent litigation",
    "Federal Circuit appeals",
    "PTAB inter partes review",
    "Trademark law",
    "Trade dress",
    "Technology licensing",
    "Agricultural equipment",
  ],
};

const legalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: siteMetadata.siteName,
  url: siteMetadata.siteUrl,
  description: siteMetadata.description,
  founder: {
    "@type": "Person",
    name: "Thomas J. Oppold",
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Iowa" },
    { "@type": "AdministrativeArea", name: "Minnesota" },
    { "@type": "Country", name: "United States" },
  ],
  serviceType: opipSiteContent.practices.map((practice) => practice.title),
};

/**
 * Root HTML layout for the opip web app.
 *
 * @category constructors
 * @since 0.0.0
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <AppThemeInitScript attribute="class" defaultMode="light" modeStorageKey="mui-mode" />
        {shouldLoadReactGrab && (
          <Script
            src={`https://unpkg.com/react-grab@${REACT_GRAB_VERSION}/dist/index.global.js`}
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <Script id="opip-person-json-ld" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(personJsonLd)}
        </Script>
        <Script id="opip-legal-service-json-ld" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(legalServiceJsonLd)}
        </Script>
        {children}
      </body>
    </html>
  );
}
