/**
 * Schema Date Type Suggestion
 *
 * Helps choose between S.Date and S.DateFromString based on context.
 * - S.Date: For JavaScript Date objects in memory
 * - S.DateFromString: For ISO 8601 strings from APIs/JSON
 *
 * UNSAFE: This requires understanding the data source - cannot be auto-fixed.
 */

import * as String from "effect/String"
import type { HookPattern, FixResult } from "../types"

export const pattern: HookPattern = {
  id: "SCH_002",
  name: "schema-date-type",
  pattern: "\\b(S|Schema)\\.(Date|DateFromString)\\b",
  fix_type: "unsafe",
  description: "Verify correct date schema type based on data source",
  category: "schema",
  file_extensions: [".ts", ".tsx"],
}

/**
 * Context clues that suggest DateFromString (API/JSON context)
 */
const apiContextClues = [
  "Payload",
  "Request",
  "Response",
  "DTO",
  "Api",
  "Contract",
  "from_api",
  "fromApi",
  "decode",
  "parse",
]

/**
 * Context clues that suggest Date (in-memory context)
 */
const memoryContextClues = ["Model", "Entity", "Domain", "Internal", "Runtime"]

/**
 * Analyze surrounding context to determine likely correct date type
 */
const analyzeContext = (
  content: string,
  lineIndex: number
): { likelyType: "Date" | "DateFromString" | "unknown"; confidence: "high" | "low" } => {
  const lines = String.split(content, "\n")

  // Look at surrounding lines for context clues
  const contextWindow = 10
  const startLine = Math.max(0, lineIndex - contextWindow)
  const endLine = Math.min(lines.length, lineIndex + contextWindow)
  const contextText = lines.slice(startLine, endLine).join("\n")

  // Check for API context clues
  const hasApiContext = apiContextClues.some((clue) => contextText.includes(clue))

  // Check for memory context clues
  const hasMemoryContext = memoryContextClues.some((clue) => contextText.includes(clue))

  if (hasApiContext && !hasMemoryContext) {
    return { likelyType: "DateFromString", confidence: "high" }
  }
  if (hasMemoryContext && !hasApiContext) {
    return { likelyType: "Date", confidence: "high" }
  }
  if (hasApiContext && hasMemoryContext) {
    // Both contexts present - need human judgment
    return { likelyType: "unknown", confidence: "low" }
  }

  return { likelyType: "unknown", confidence: "low" }
}

/**
 * Detect potential date type mismatches
 */
export const detect = (content: string): FixResult[] => {
  const results: FixResult[] = []
  const lines = String.split(content, "\n")

  lines.forEach((line, index) => {
    // Check for S.Date or Schema.Date
    const dateMatch = line.match(/\b(S|Schema)\.(Date)\b(?!From)/)
    const dateFromStringMatch = line.match(/\b(S|Schema)\.(DateFromString)\b/)

    if (dateMatch) {
      const { likelyType, confidence } = analyzeContext(content, index)

      if (likelyType === "DateFromString" && confidence === "high") {
        results.push({
          applied: false,
          original: `${dateMatch[1]}.Date`,
          fixed: `${dateMatch[1]}.DateFromString`,
          message: `Context suggests API/JSON data - consider S.DateFromString for ISO 8601 string input`,
          pattern_id: pattern.id,
          line_number: index + 1,
        })
      } else if (likelyType === "unknown") {
        results.push({
          applied: false,
          original: `${dateMatch[1]}.Date`,
          fixed: "Verify: S.Date (JS Date) or S.DateFromString (ISO string)?",
          message: `Verify date schema: S.Date for JavaScript Date objects, S.DateFromString for ISO 8601 strings from APIs`,
          pattern_id: pattern.id,
          line_number: index + 1,
        })
      }
    }

    if (dateFromStringMatch) {
      const { likelyType, confidence } = analyzeContext(content, index)

      if (likelyType === "Date" && confidence === "high") {
        results.push({
          applied: false,
          original: `${dateFromStringMatch[1]}.DateFromString`,
          fixed: `${dateFromStringMatch[1]}.Date`,
          message: `Context suggests in-memory data - consider S.Date for JavaScript Date objects`,
          pattern_id: pattern.id,
          line_number: index + 1,
        })
      }
    }
  })

  return results
}

/**
 * No auto-fix for date type suggestions - always requires human judgment
 */
export const fix = (content: string): { content: string; results: FixResult[] } => {
  return {
    content, // No changes
    results: detect(content),
  }
}
