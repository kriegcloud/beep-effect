import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"
import Script from "next/script"
import type { ReactNode } from "react"
import { SITE_URL } from "@/constants/urls"
import { commitMono, geistMono } from "@/lib/fonts"
import "./globals.css"

const siteName = "Effect Solutions"
const siteDescription =
  "Effect Solutions provides best practices and patterns for building resilient TypeScript applications with Effect."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Effect Solutions",
    "Effect",
    "TypeScript",
    "Functional Programming",
    "Resilient Systems",
    "Error Handling",
    "Best Practices",
  ],
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: "/",
    siteName,
    images: [
      {
        url: "/og/home.png",
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/og/home.png"],
    creator: "@kitlangton",
    site: "@kitlangton",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
            data-enabled="true"
          />
        )}
      </head>
      <body className={`${commitMono.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
