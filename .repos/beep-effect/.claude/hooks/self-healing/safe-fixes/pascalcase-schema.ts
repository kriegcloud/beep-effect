/**
 * PascalCase Schema Safe Fix
 *
 * Converts lowercase Schema constructors to PascalCase.
 * Example: `S.struct({ ... })` → `S.Struct({ ... })`
 *
 * SAFE: This is a pure syntactic transformation. Effect Schema exports both
 * lowercase and PascalCase variants as aliases - they are identical at runtime.
 */

import * as String from "effect/String"
import type { HookPattern, FixResult } from "../types"

export const pattern: HookPattern = {
  id: "SCH_001",
  name: "pascalcase-schema",
  pattern: "\\b(S|Schema)\\.(struct|array|string|number|boolean|literal|union|optional|nullable|tuple|record|unknown|void|never|any|null|undefined|bigint|symbol|date)\\(",
  fix_type: "safe",
  description: "Convert lowercase Schema constructors to PascalCase (required by codebase rules)",
  category: "schema",
  file_extensions: [".ts", ".tsx"],
}

/**
 * Lowercase to PascalCase mapping
 */
const pascalCaseMap: Record<string, string> = {
  struct: "Struct",
  array: "Array",
  string: "String",
  number: "Number",
  boolean: "Boolean",
  literal: "Literal",
  union: "Union",
  optional: "optional", // Note: optional is already correct, included for completeness
  nullable: "NullOr", // Note: nullable → NullOr in Effect Schema
  tuple: "Tuple",
  record: "Record",
  unknown: "Unknown",
  void: "Void",
  never: "Never",
  any: "Any",
  null: "Null",
  undefined: "Undefined",
  bigint: "BigInt",
  symbol: "Symbol",
  date: "Date",
}

/**
 * Apply the PascalCase fix to content
 */
export const fix = (content: string): { content: string; results: FixResult[] } => {
  const results: FixResult[] = []
  const lines = String.split(content, "\n")

  const fixedLines = lines.map((line, index) => {
    let fixedLine = line
    const regex = new RegExp(pattern.pattern, "g")
    let match: RegExpExecArray | null

    while ((match = regex.exec(line)) !== null) {
      const prefix = match[1] // S or Schema
      const constructor = match[2] // lowercase constructor name

      if (!constructor || !prefix) continue

      // Skip if already correct or not in our map
      const pascalCase = pascalCaseMap[constructor]
      if (!pascalCase || constructor === pascalCase) continue

      const original = `${prefix}.${constructor}(`
      const fixed = `${prefix}.${pascalCase}(`

      // Only fix if it's actually lowercase
      if (constructor.charAt(0) === constructor.charAt(0).toLowerCase()) {
        fixedLine = fixedLine.replace(original, fixed)

        results.push({
          applied: true,
          original,
          fixed,
          message: `Converted ${prefix}.${constructor} to ${prefix}.${pascalCase}`,
          pattern_id: pattern.id,
          line_number: index + 1,
        })
      }
    }

    return fixedLine
  })

  return {
    content: fixedLines.join("\n"),
    results,
  }
}

/**
 * Detect violations without fixing
 */
export const detect = (content: string): FixResult[] => {
  const results: FixResult[] = []
  const lines = String.split(content, "\n")

  lines.forEach((line, index) => {
    const regex = new RegExp(pattern.pattern, "g")
    let match: RegExpExecArray | null

    while ((match = regex.exec(line)) !== null) {
      const prefix = match[1]
      const constructor = match[2]

      if (!constructor || !prefix) continue

      const pascalCase = pascalCaseMap[constructor]
      if (!pascalCase || constructor === pascalCase) continue

      // Only report if it's actually lowercase
      if (constructor.charAt(0) === constructor.charAt(0).toLowerCase()) {
        results.push({
          applied: false,
          original: `${prefix}.${constructor}(`,
          fixed: `${prefix}.${pascalCase}(`,
          message: `Should use PascalCase: ${prefix}.${pascalCase}`,
          pattern_id: pattern.id,
          line_number: index + 1,
        })
      }
    }
  })

  return results
}
