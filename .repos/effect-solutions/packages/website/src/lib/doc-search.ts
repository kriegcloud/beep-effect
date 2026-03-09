import { cache } from "react"
import { getAllDocs } from "@/lib/mdx"
import { normalizeWhitespace, stripMarkdown, tokenize } from "./text"

export interface DocSearchDocument {
  slug: string
  title: string
  description: string
  summary: string
  priority: number
  keywords: string[]
}

const SUMMARY_LENGTH = 420
const KEYWORD_LIMIT = 24

function createSummary(content: string): string {
  const plain = stripMarkdown(content)
  if (plain.length <= SUMMARY_LENGTH) {
    return plain
  }

  const truncated = plain.slice(0, SUMMARY_LENGTH)
  const lastSentenceBreak = Math.max(
    truncated.lastIndexOf(". "),
    truncated.lastIndexOf("! "),
    truncated.lastIndexOf("? "),
  )

  const safeBreakpoint = lastSentenceBreak > 200 ? lastSentenceBreak + 1 : truncated.length
  return `${truncated.slice(0, safeBreakpoint).trim()}…`
}

function extractKeywords(title: string, description: string, summary: string): string[] {
  const tokens = tokenize(`${title} ${description} ${summary}`)
  const seen = new Set<string>()
  const ordered: string[] = []

  for (const token of tokens) {
    if (seen.has(token)) continue
    seen.add(token)
    ordered.push(token)
    if (ordered.length >= KEYWORD_LIMIT) break
  }

  return ordered
}

export const getDocSearchDocuments = cache((): DocSearchDocument[] => {
  const docs = getAllDocs()

  return docs.map((doc, index) => {
    const summary = createSummary(doc.content)
    const description = doc.description ?? ""
    return {
      slug: doc.slug,
      title: doc.title,
      description,
      summary,
      priority: doc.order !== undefined ? doc.order : index + 1,
      keywords: extractKeywords(doc.title, description, summary),
    }
  })
})

export function serializeSearchDocuments(documents: DocSearchDocument[]): DocSearchDocument[] {
  return documents.map((doc) => ({
    ...doc,
    title: normalizeWhitespace(doc.title),
    description: normalizeWhitespace(doc.description),
    summary: normalizeWhitespace(doc.summary),
    keywords: doc.keywords.slice(0, KEYWORD_LIMIT),
  }))
}
