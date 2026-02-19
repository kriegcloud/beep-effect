/**
 * Safe Fixes Index
 *
 * Exports all safe auto-fix modules.
 * These fixes can be applied automatically because they NEVER change runtime behavior.
 */

import * as NamespaceImports from "./namespace-imports"
import * as PascalCaseSchema from "./pascalcase-schema"
import * as ImportSorting from "./import-sorting"

export { NamespaceImports, PascalCaseSchema, ImportSorting }

/**
 * All safe fix modules
 */
export const allSafeFixes = [
  NamespaceImports,
  PascalCaseSchema,
  ImportSorting,
] as const

/**
 * Get patterns for all safe fixes
 */
export const patterns = allSafeFixes.map((m) => m.pattern)

/**
 * Apply all safe fixes to content
 */
export const applyAll = (
  content: string
): { content: string; results: import("../types").FixResult[] } => {
  let currentContent = content
  const allResults: import("../types").FixResult[] = []

  for (const fixer of allSafeFixes) {
    const { content: fixedContent, results } = fixer.fix(currentContent)
    currentContent = fixedContent
    allResults.push(...results)
  }

  return {
    content: currentContent,
    results: allResults,
  }
}

/**
 * Detect all safe fix violations without applying
 */
export const detectAll = (content: string): import("../types").FixResult[] => {
  const allResults: import("../types").FixResult[] = []

  for (const fixer of allSafeFixes) {
    allResults.push(...fixer.detect(content))
  }

  return allResults
}
