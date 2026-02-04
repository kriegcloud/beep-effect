/**
 * Namespace Imports Safe Fix
 *
 * Converts named imports from Effect modules to namespace imports.
 * Example: `import { Effect } from "effect"` → `import * as Effect from "effect/Effect"`
 *
 * SAFE: This is a pure syntactic transformation that does not change runtime behavior.
 */

import * as Option from "effect/Option"
import * as Array from "effect/Array"
import * as String from "effect/String"
import type { HookPattern, FixResult } from "../types"
import { convertToNamespaceImport } from "../utils"

export const pattern: HookPattern = {
  id: "IMP_001",
  name: "namespace-imports",
  pattern: 'import\\s+\\{\\s*([^}]+)\\s*\\}\\s+from\\s+["\']effect\\/(\\w+)["\']',
  fix_type: "safe",
  description: "Convert named Effect imports to namespace imports (required by codebase rules)",
  category: "imports",
  file_extensions: [".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"],
}

/**
 * Standard aliases from codebase rules
 */
const aliases: Record<string, string> = {
  Array: "A",
  BigInt: "BI",
  Number: "Num",
  Predicate: "P",
  Function: "F",
  Option: "O",
  Record: "R",
  Schema: "S",
  String: "Str",
  Brand: "B",
  Boolean: "Bool",
  SchemaAST: "AST",
  DateTime: "DateTime",
  Match: "Match",
  Effect: "Effect",
  Layer: "Layer",
  Context: "Context",
  Struct: "Struct",
  Cause: "Cause",
  Exit: "Exit",
  Fiber: "Fiber",
  Stream: "Stream",
  Chunk: "Chunk",
  HashSet: "HashSet",
  HashMap: "HashMap",
  List: "List",
  Either: "Either",
  Duration: "Duration",
  Schedule: "Schedule",
  Ref: "Ref",
  Queue: "Queue",
  Pool: "Pool",
  Scope: "Scope",
  Runtime: "Runtime",
  Logger: "Logger",
  Config: "Config",
  ConfigProvider: "ConfigProvider",
  ParseResult: "ParseResult",
  Data: "Data",
  Order: "Order",
  Equivalence: "Equivalence",
  Hash: "Hash",
  Equal: "Equal",
}

/**
 * Apply the namespace import fix to content
 */
export const fix = (content: string): { content: string; results: FixResult[] } => {
  const regex = new RegExp(pattern.pattern, "gm")
  const results: FixResult[] = []
  const lines = String.split(content, "\n")

  const fixedLines = lines.map((line, index) => {
    const match = line.match(new RegExp(pattern.pattern))
    if (!match || !match[2]) return line

    const moduleName = match[2]
    const alias = aliases[moduleName] ?? moduleName
    const original = match[0]
    const fixed = `import * as ${alias} from "effect/${moduleName}"`

    results.push({
      applied: true,
      original,
      fixed,
      message: `Converted named import to namespace import: ${alias} from effect/${moduleName}`,
      pattern_id: pattern.id,
      line_number: index + 1,
    })

    return line.replace(original, fixed)
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
  const regex = new RegExp(pattern.pattern, "gm")
  const results: FixResult[] = []
  const lines = String.split(content, "\n")

  lines.forEach((line, index) => {
    const match = line.match(new RegExp(pattern.pattern))
    if (!match || !match[2]) return

    const moduleName = match[2]
    const alias = aliases[moduleName] ?? moduleName
    const original = match[0]
    const fixed = `import * as ${alias} from "effect/${moduleName}"`

    results.push({
      applied: false,
      original,
      fixed,
      message: `Should use namespace import: ${alias} from effect/${moduleName}`,
      pattern_id: pattern.id,
      line_number: index + 1,
    })
  })

  return results
}
