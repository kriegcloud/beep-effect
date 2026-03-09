import type { Metadata } from "next"
import { DocList } from "@/components/DocList"
import { SITE_DEPLOYMENT_URL } from "@/constants/urls"
import { getAllDocs } from "@/lib/mdx"

export const metadata: Metadata = {
  title: "Effect Solutions",
  description: "Effect Solutions guides for building Effect TypeScript applications",
  openGraph: {
    title: "Effect Solutions",
    description: "Effect Solutions guides for building Effect TypeScript applications",
    url: SITE_DEPLOYMENT_URL,
    siteName: "Effect Solutions",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_DEPLOYMENT_URL}/og/home.png`,
        width: 1200,
        height: 630,
        alt: "Effect Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Effect Solutions",
    description: "Effect Solutions guides for building Effect TypeScript applications",
    images: [`${SITE_DEPLOYMENT_URL}/og/home.png`],
  },
}

export default async function HomePage() {
  const docs = getAllDocs()

  return (
    <main className="mx-auto max-w-screen-md border-x border-neutral-800 flex-1 flex flex-col w-full min-h-[calc(100vh-8rem)]">
      <DocList docs={docs} />

      {docs.length === 0 && (
        <div className="px-6 py-20 text-center text-foreground/50">
          <p>No docs available yet. Please check back soon.</p>
        </div>
      )}
    </main>
  )
}
