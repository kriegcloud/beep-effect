import { Analytics } from "@vercel/analytics/next"
import type { ReactNode } from "react"
import { AutoRefresh } from "@/components/AutoRefresh"
import { CommandPalette } from "@/components/CommandPalette"
import { DocFooter } from "@/components/DocFooter"
import { DocHeader } from "@/components/DocHeader"
import { getDocSearchDocuments, serializeSearchDocuments } from "@/lib/doc-search"
import { getDocTitles, getOrderedDocSlugs } from "@/lib/mdx"
import { SoundSettingsProvider } from "@/lib/useSoundSettings"

export default function SiteLayout({ children }: { children: ReactNode }) {
  const documents = serializeSearchDocuments(getDocSearchDocuments())
  const docTitles = getDocTitles()
  const orderedSlugs = getOrderedDocSlugs()

  return (
    <>
      <CommandPalette documents={documents} />
      <AutoRefresh />
      <SoundSettingsProvider>
        <DocHeader docTitles={docTitles} />
        {children}
        <DocFooter docTitles={docTitles} orderedSlugs={orderedSlugs} />
      </SoundSettingsProvider>
      <Analytics />
    </>
  )
}
