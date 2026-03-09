const WORD_BOUNDARY_REGEX = /[^\p{L}\p{N}]+/gu
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((?:[^)]+)\)/g
const MARKDOWN_IMAGE_REGEX = /!\[.*?\]\(.*?\)/g
const MARKDOWN_CODE_BLOCK_REGEX = /```[\s\S]*?```/g
const INLINE_CODE_REGEX = /`([^`]+)`/g
const MARKDOWN_EMPHASIS_REGEX = /[*_~>#-]+/g
const HTML_TAG_REGEX = /<\/?[^>]+>/g
const MULTIPLE_SPACES_REGEX = /\s+/g

const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")

/**
 * Remove most markdown/HTML syntax and collapse whitespace
 */
export function stripMarkdown(value: string): string {
  return normalize(
    value
      .replace(MARKDOWN_IMAGE_REGEX, "")
      .replace(MARKDOWN_CODE_BLOCK_REGEX, "")
      .replace(INLINE_CODE_REGEX, "$1")
      .replace(MARKDOWN_LINK_REGEX, "$1")
      .replace(HTML_TAG_REGEX, "")
      .replace(MARKDOWN_EMPHASIS_REGEX, " ")
      .replace(MULTIPLE_SPACES_REGEX, " ")
      .trim(),
  )
}

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter("en", { granularity: "word" }) : null

export function tokenize(value: string): string[] {
  if (!value) {
    return []
  }

  const normalizedValue = normalize(value.toLowerCase())

  if (segmenter) {
    return Array.from(segmenter.segment(normalizedValue))
      .map((segment) => segment.segment.trim())
      .filter(Boolean)
  }

  return normalizedValue
    .split(WORD_BOUNDARY_REGEX)
    .map((token) => token.trim())
    .filter(Boolean)
}

export function normalizeWhitespace(value: string): string {
  return normalize(value).replace(MULTIPLE_SPACES_REGEX, " ").trim()
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
