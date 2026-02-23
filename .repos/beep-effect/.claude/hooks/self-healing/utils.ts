/**
 * Self-Healing Hook Utilities
 *
 * Shared utility functions for pattern detection and safe fixes.
 */

import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Array from "effect/Array"
import * as String from "effect/String"
import type { HookPattern, FixResult } from "./types"

// =============================================================================
// File Extension Utilities
// =============================================================================

/**
 * Check if a file path has a TypeScript/JavaScript extension
 */
export const isTypeScriptFile = (filePath: string): boolean => {
  const extensions = [".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs", ".cts", ".cjs"]
  return extensions.some((ext) => filePath.endsWith(ext))
}

/**
 * Get file extension from path
 */
export const getFileExtension = (filePath: string): Option.Option<string> => {
  const lastDot = filePath.lastIndexOf(".")
  if (lastDot === -1 || lastDot === filePath.length - 1) {
    return Option.none()
  }
  return Option.some(filePath.slice(lastDot))
}

/**
 * Check if a pattern applies to a given file
 */
export const patternAppliesToFile = (pattern: HookPattern, filePath: string): boolean => {
  const ext = getFileExtension(filePath)
  return Option.match(ext, {
    onNone: () => false,
    onSome: (extension) => pattern.file_extensions.includes(extension),
  })
}

// =============================================================================
// Pattern Matching Utilities
// =============================================================================

/**
 * Find all matches of a pattern in content
 */
export const findPatternMatches = (
  content: string,
  pattern: HookPattern
): Array<{ match: RegExpMatchArray; lineNumber: number }> => {
  const regex = new RegExp(pattern.pattern, "gm")
  const lines = String.split(content, "\n")
  const results: Array<{ match: RegExpMatchArray; lineNumber: number }> = []

  let lineOffset = 0
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]
    if (line === undefined) continue

    let match: RegExpMatchArray | null
    const lineRegex = new RegExp(pattern.pattern, "g")

    while ((match = lineRegex.exec(line)) !== null) {
      results.push({
        match,
        lineNumber: lineIdx + 1, // 1-indexed
      })
    }

    lineOffset += line.length + 1 // +1 for newline
  }

  return results
}

// =============================================================================
// Safe Fix Utilities
// =============================================================================

/**
 * Apply a regex replacement safely, returning the result
 */
export const applySafeReplacement = (
  content: string,
  pattern: string,
  replacement: string | ((match: RegExpMatchArray) => string)
): { modified: string; count: number } => {
  const regex = new RegExp(pattern, "gm")
  let count = 0

  const modified = content.replace(regex, (...args) => {
    count++
    if (typeof replacement === "function") {
      // Convert args to match array format
      const match = args.slice(0, -2) as unknown as RegExpMatchArray
      match.index = args[args.length - 2] as number
      match.input = args[args.length - 1] as string
      return replacement(match)
    }
    return replacement
  })

  return { modified, count }
}

// =============================================================================
// Import Pattern Utilities
// =============================================================================

/**
 * Detect named imports from Effect modules that should be namespace imports
 * Pattern: import { X } from "effect/X"
 */
export const detectNamedEffectImport = (
  line: string
): Option.Option<{ module: string; imports: string[] }> => {
  const pattern = /import\s+\{\s*([^}]+)\s*\}\s+from\s+["']effect\/(\w+)["']/
  const match = line.match(pattern)

  if (!match || !match[1] || !match[2]) {
    return Option.none()
  }

  const imports = match[1].split(",").map((s) => s.trim())
  return Option.some({
    module: match[2],
    imports,
  })
}

/**
 * Convert a named Effect import to namespace import
 */
export const convertToNamespaceImport = (module: string): string => {
  // Standard aliases from the codebase rules
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
  }

  const alias = aliases[module] ?? module
  return `import * as ${alias} from "effect/${module}"`
}

// =============================================================================
// Schema Pattern Utilities
// =============================================================================

/**
 * Lowercase Schema constructors that should be PascalCase
 */
export const lowercaseSchemaConstructors = [
  "struct",
  "array",
  "string",
  "number",
  "boolean",
  "literal",
  "union",
  "optional",
  "nullable",
  "tuple",
  "record",
  "unknown",
  "void",
  "never",
  "any",
  "null",
  "undefined",
  "bigint",
  "symbol",
  "date",
] as const

/**
 * Convert lowercase schema constructor to PascalCase
 */
export const toPascalCase = (str: string): string => {
  if (str.length === 0) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Detect lowercase Schema constructor usage
 */
export const detectLowercaseSchema = (
  line: string
): Option.Option<{ original: string; fixed: string }> => {
  // Match S.lowercase( or Schema.lowercase(
  const pattern = /\b(S|Schema)\.([a-z]+)\(/
  const match = line.match(pattern)

  if (!match || !match[2]) {
    return Option.none()
  }

  const constructor = match[2]
  if (!lowercaseSchemaConstructors.includes(constructor as any)) {
    return Option.none()
  }

  const prefix = match[1]
  const original = `${prefix}.${constructor}`
  const fixed = `${prefix}.${toPascalCase(constructor)}`

  return Option.some({ original, fixed })
}

// =============================================================================
// Path Alias Utilities
// =============================================================================

/**
 * Detect relative imports that should use @beep/* alias
 */
export const detectRelativeBeepImport = (
  line: string
): Option.Option<{ original: string; suggestion: string }> => {
  // Match imports with 3+ levels of ../
  const pattern = /from\s+["']((?:\.\.\/){3,}[^"']+)["']/
  const match = line.match(pattern)

  if (!match || !match[1]) {
    return Option.none()
  }

  return Option.some({
    original: match[1],
    suggestion: "Use @beep/* path alias instead of relative path",
  })
}
