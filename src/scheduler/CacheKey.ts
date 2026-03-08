export interface SubcallCacheKeyParts {
  readonly completionId: string
  readonly parentCallId: string
  readonly method: string
  readonly query: string
  readonly context: string
  readonly depth: number
  readonly modelRoute: string
  readonly responseFormatHash?: string
}

export const makeSubcallCacheKey = (parts: SubcallCacheKeyParts): string => {
  const raw = JSON.stringify([
    parts.completionId,
    parts.parentCallId,
    parts.method,
    parts.query,
    parts.context,
    parts.depth,
    parts.modelRoute,
    parts.responseFormatHash ?? ""
  ])
  return `subcall:${Bun.hash(raw).toString(36)}`
}

const canonicalizeJsonInternal = (value: unknown, isTopLevel: boolean): string => {
  if (value === undefined) {
    if (isTopLevel) {
      throw new Error("canonicalizeJson: top-level undefined is not valid JSON")
    }
    return "null"
  }
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return "[" + value.map((item) => canonicalizeJsonInternal(item, false)).join(",") + "]"
  }
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj)
    .sort()
    .filter((key) => obj[key] !== undefined)
  return "{" + keys.map((key) =>
    JSON.stringify(key) + ":" + canonicalizeJsonInternal(obj[key], false)
  ).join(",") + "}"
}

/**
 * Deep-canonicalize a JSON-serializable value for deterministic hashing.
 * Recursively sorts object keys at all nesting levels.
 */
export const canonicalizeJson = (value: unknown): string =>
  canonicalizeJsonInternal(value, true)

export const hashSchema = (schema: object): string =>
  Bun.hash(canonicalizeJson(schema)).toString(36)
