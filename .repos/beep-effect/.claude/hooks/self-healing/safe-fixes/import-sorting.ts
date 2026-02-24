/**
 * Import Sorting Safe Fix
 *
 * Sorts imports alphabetically by module path within their groups.
 * Groups: 1) Node builtins, 2) External packages, 3) @beep/* packages, 4) Relative imports
 *
 * SAFE: Import order does not affect runtime behavior in ES modules.
 * Note: This only suggests sorting, doesn't auto-apply to avoid conflicts with other tools.
 */

import * as Array from "effect/Array"
import * as String from "effect/String"
import * as Order from "effect/Order"
import type { HookPattern, FixResult } from "../types"

export const pattern: HookPattern = {
  id: "IMP_003",
  name: "import-sorting",
  pattern: "^import\\s+.*\\s+from\\s+[\"'][^\"']+[\"']",
  fix_type: "safe",
  description: "Sort imports alphabetically by module path within groups",
  category: "imports",
  file_extensions: [".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"],
}

/**
 * Import group classification
 */
type ImportGroup = "builtin" | "external" | "beep" | "relative"

const builtinModules = new Set([
  "assert",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "https",
  "module",
  "net",
  "os",
  "path",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "sys",
  "timers",
  "tls",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "zlib",
])

/**
 * Classify an import by its module path
 */
const classifyImport = (modulePath: string): ImportGroup => {
  if (modulePath.startsWith("node:") || builtinModules.has(modulePath)) {
    return "builtin"
  }
  if (modulePath.startsWith("@beep/")) {
    return "beep"
  }
  if (modulePath.startsWith(".") || modulePath.startsWith("/")) {
    return "relative"
  }
  return "external"
}

/**
 * Extract module path from import statement
 */
const extractModulePath = (importLine: string): string | null => {
  const match = importLine.match(/from\s+["']([^"']+)["']/)
  return match?.[1] ?? null
}

/**
 * Parse import block from content
 */
interface ParsedImport {
  line: string
  modulePath: string
  group: ImportGroup
  originalIndex: number
}

const parseImports = (content: string): { imports: ParsedImport[]; restContent: string } => {
  const lines = String.split(content, "\n")
  const imports: ParsedImport[] = []
  let lastImportIndex = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    const trimmed = line.trim()
    if (trimmed.startsWith("import ") && trimmed.includes(" from ")) {
      const modulePath = extractModulePath(trimmed)
      if (modulePath) {
        imports.push({
          line,
          modulePath,
          group: classifyImport(modulePath),
          originalIndex: i,
        })
        lastImportIndex = i
      }
    } else if (imports.length > 0 && !trimmed.startsWith("//") && trimmed !== "") {
      // Non-import line after imports - stop parsing
      break
    }
  }

  const restContent = lines.slice(lastImportIndex + 1).join("\n")
  return { imports, restContent }
}

/**
 * Sort imports by group and then alphabetically within group
 */
const sortImports = (imports: ParsedImport[]): ParsedImport[] => {
  const groupOrder: Record<ImportGroup, number> = {
    builtin: 0,
    external: 1,
    beep: 2,
    relative: 3,
  }

  const importOrder = Order.make<ParsedImport>((a, b) => {
    // First by group
    const groupDiff = groupOrder[a.group] - groupOrder[b.group]
    if (groupDiff !== 0) return groupDiff

    // Then alphabetically by module path
    return a.modulePath.localeCompare(b.modulePath)
  })

  return Array.sort(imports, importOrder)
}

/**
 * Check if imports are already sorted
 */
const importsAreSorted = (imports: ParsedImport[]): boolean => {
  const sorted = sortImports(imports)
  return imports.every((imp, i) => imp.originalIndex === sorted[i]?.originalIndex)
}

/**
 * Detect if imports need sorting (suggest-only, no auto-fix)
 */
export const detect = (content: string): FixResult[] => {
  const { imports } = parseImports(content)

  if (imports.length <= 1) return []
  if (importsAreSorted(imports)) return []

  const sorted = sortImports(imports)
  const originalOrder = imports.map((i) => i.modulePath).join(", ")
  const sortedOrder = sorted.map((i) => i.modulePath).join(", ")

  return [
    {
      applied: false,
      original: `Imports order: ${originalOrder.slice(0, 100)}...`,
      fixed: `Suggested order: ${sortedOrder.slice(0, 100)}...`,
      message: `Imports should be sorted: builtin → external → @beep/* → relative, then alphabetically`,
      pattern_id: pattern.id,
      line_number: 1,
    },
  ]
}

/**
 * Fix is intentionally a no-op - import sorting should be done by formatters
 * This hook only detects and suggests
 */
export const fix = (content: string): { content: string; results: FixResult[] } => {
  // Don't auto-fix - let formatters handle import sorting
  // Just return detection results
  return {
    content,
    results: detect(content),
  }
}
