/**
 * Suggestions Index
 *
 * Exports all suggestion modules.
 * These suggestions require human review - they cannot be auto-applied
 * because they may change runtime behavior or require context judgment.
 */

import * as EntityIdReminder from "./entityid-reminder"
import * as SchemaDateType from "./schema-date-type"

export { EntityIdReminder, SchemaDateType }

/**
 * All suggestion modules
 */
export const allSuggestions = [EntityIdReminder, SchemaDateType] as const

/**
 * Get patterns for all suggestions
 */
export const patterns = allSuggestions.map((m) => m.pattern)

/**
 * Detect all suggestions in content
 */
export const detectAll = (content: string): import("../types").FixResult[] => {
  const allResults: import("../types").FixResult[] = []

  for (const suggester of allSuggestions) {
    allResults.push(...suggester.detect(content))
  }

  return allResults
}
