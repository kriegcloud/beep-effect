/**
 * Feedback Generator - Generate validation feedback from RuleSet
 *
 * Transforms schema validation errors into rule-aware feedback messages
 * that can be used to guide LLM retries.
 *
 * @module Prompt/FeedbackGenerator
 * @since 2.0.0
 */

import { Doc } from "@effect/printer"
import { Option as O } from "effect"
import { type ParseError, TreeFormatter } from "effect/ParseResult"
import type { ExtractionRule } from "./ExtractionRule.js"
import type { RuleSet } from "./RuleSet.js"

/**
 * Violation extracted from ParseError
 *
 * @since 2.0.0
 */
export interface Violation {
  /** Path to the failing field (e.g., "entities[0].types") */
  readonly path: string
  /** Error message from schema validation */
  readonly message: string
  /** Actual value that failed validation */
  readonly actual: unknown
}

/**
 * Extract violations from Effect Schema ParseError
 *
 * Recursively walks the error tree to extract all violations with paths.
 *
 * @param error - ParseError from schema validation
 * @returns Array of violations
 *
 * @since 2.0.0
 */
export const extractViolations = (error: ParseError): ReadonlyArray<Violation> => {
  const violations: Array<Violation> = []

  const walk = (issue: unknown, path: string): void => {
    if (!issue || typeof issue !== "object") return

    const obj = issue as Record<string, unknown>

    // Check for actual value and message
    if ("actual" in obj && "message" in obj) {
      violations.push({
        path: path || "root",
        message: String(obj.message ?? "Unknown error"),
        actual: obj.actual
      })
    }

    // Handle array issues (e.g., [0], [1])
    if ("issues" in obj && Array.isArray(obj.issues)) {
      obj.issues.forEach((sub: unknown, idx: number) => {
        const subPath = path ? `${path}[${idx}]` : `[${idx}]`
        walk(sub, subPath)
      })
    }

    // Handle property issues
    if ("ast" in obj && typeof obj.ast === "object" && obj.ast !== null) {
      const ast = obj.ast as Record<string, unknown>
      if ("key" in ast) {
        const key = String(ast.key)
        const subPath = path ? `${path}.${key}` : key
        walk(obj, subPath)
      }
    }

    // Handle nested errors
    if ("error" in obj) {
      walk(obj.error, path)
    }
  }

  // Start walking from the error
  if ("issue" in error && error.issue) {
    walk(error.issue, "")
  } else {
    walk(error, "")
  }

  return violations
}

/**
 * Find matching rule for a violation
 *
 * Attempts to match a violation to a rule based on:
 * - Field path keywords (e.g., "types" → type_mapping rules)
 * - Error message content
 *
 * @param violation - Violation to match
 * @param ruleSet - Rule set to search
 * @returns Matching rule if found
 *
 * @since 2.0.0
 */
export const findMatchingRule = (
  violation: Violation,
  ruleSet: RuleSet
): O.Option<ExtractionRule> => {
  const path = violation.path.toLowerCase()
  const message = violation.message.toLowerCase()

  // Path-based matching
  const pathMatchers: Array<{ pattern: string; category: string }> = [
    { pattern: ".id", category: "id_format" },
    { pattern: "id]", category: "id_format" },
    { pattern: ".types", category: "type_mapping" },
    { pattern: "types]", category: "type_mapping" },
    { pattern: ".predicate", category: "property_usage" },
    { pattern: ".subjectid", category: "reference_integrity" },
    { pattern: ".object", category: "property_usage" },
    { pattern: ".mention", category: "mention_format" },
    { pattern: ".attributes", category: "property_usage" }
  ]

  for (const matcher of pathMatchers) {
    if (path.includes(matcher.pattern)) {
      const categoryRules = ruleSet.getRulesByCategory(matcher.category)
      if (categoryRules.length > 0) {
        return O.some(categoryRules[0])
      }
    }
  }

  // Message-based matching
  if (message.includes("casing") || message.includes("case")) {
    const iriRules = ruleSet.getRulesByCategory("iri_casing")
    if (iriRules.length > 0) {
      return O.some(iriRules[0])
    }
  }

  if (message.includes("snake") || message.includes("lowercase")) {
    const idRules = ruleSet.getRulesByCategory("id_format")
    if (idRules.length > 0) {
      return O.some(idRules[0])
    }
  }

  return O.none()
}

/**
 * Interpolate template with values
 *
 * Replaces {key} placeholders with actual values.
 *
 * @param template - Template string with {key} placeholders
 * @param values - Values to interpolate
 * @returns Interpolated string
 *
 * @since 2.0.0
 */
export const interpolate = (
  template: string,
  values: Record<string, unknown>
): string => template.replace(/\{(\w+)\}/g, (_, key) => key in values ? String(values[key]) : `{${key}}`)

/**
 * Generate user-friendly feedback from schema validation errors
 *
 * Uses RuleSet to provide rule-aware error messages instead of generic
 * schema validation messages.
 *
 * @param error - ParseError from schema validation
 * @param ruleSet - Rule set for the extraction stage
 * @returns Formatted feedback string
 *
 * @example
 * ```typescript
 * const ruleSet = makeEntityRuleSet(classes, properties)
 * try {
 *   S.decodeUnknownSync(schema)(llmOutput)
 * } catch (e) {
 *   if (e instanceof ParseError) {
 *     const feedback = generateFeedback(e, ruleSet)
 *     console.log(feedback)
 *     // "Entity ID '2pac' must be snake_case starting with a letter"
 *   }
 * }
 * ```
 *
 * @since 2.0.0
 */
export const generateFeedback = (
  error: ParseError,
  ruleSet: RuleSet
): string => {
  const violations = extractViolations(error)

  if (violations.length === 0) {
    return "Validation failed. Please check the output format."
  }

  return violations
    .map((v) => {
      const ruleOpt = findMatchingRule(v, ruleSet)
      return O.match(ruleOpt, {
        onNone: () => `Error at ${v.path}: ${v.message}`,
        onSome: (rule) => interpolate(rule.validationTemplate, { value: v.actual })
      })
    })
    .join("\n")
}

/**
 * Build rule reminders section for violated rules
 *
 * Identifies which rules were violated and creates a Doc with reminders.
 *
 * @param error - ParseError from schema validation
 * @param ruleSet - Rule set to search for matching rules
 * @returns Doc with rule reminders or empty if no rules matched
 *
 * @internal
 * @since 2.0.0
 */
const buildRuleReminders = (
  error: ParseError,
  ruleSet: RuleSet
): Doc.Doc<never> => {
  const violations = extractViolations(error)
  const matchedRuleIds = new Set<string>()

  for (const v of violations) {
    const rule = findMatchingRule(v, ruleSet)
    if (O.isSome(rule)) {
      matchedRuleIds.add(rule.value.id)
    }
  }

  if (matchedRuleIds.size === 0) {
    return Doc.empty
  }

  const ruleReminders = Array.from(matchedRuleIds).map((id) => {
    const rule = ruleSet.allRules.find((r) => r.id === id)
    return rule ? Doc.text(`• ${rule.instruction}`) : Doc.empty
  })

  return Doc.vsep([
    Doc.empty,
    Doc.text("Remember these rules:"),
    ...ruleReminders
  ])
}

/**
 * Generate tree-formatted feedback with rule-aware messages
 *
 * Uses Effect's built-in TreeFormatter for hierarchical error display,
 * then appends rule reminders for violated rules.
 *
 * @param error - ParseError from schema validation
 * @param ruleSet - Rule set for the extraction stage
 * @returns Tree-formatted feedback string with rule reminders
 *
 * @example
 * ```typescript
 * const feedback = generateTreeFeedback(error, ruleSet)
 * // Output:
 * // Validation Errors:
 * //
 * // { readonly entities: ... }
 * // └─ [entities]
 * //    └─ [0]
 * //       └─ [types]
 * //          └─ Expected valid IRI, actual "invalid"
 * //
 * // Remember these rules:
 * // • Copy IRIs EXACTLY as shown
 * ```
 *
 * @since 2.0.0
 */
export const generateTreeFeedback = (
  error: ParseError,
  ruleSet: RuleSet
): string => {
  // Use Effect's built-in tree formatter for base error display
  const baseTree = TreeFormatter.formatErrorSync(error)

  // Build Doc structure with tree and rule reminders
  const doc = Doc.vsep([
    Doc.text("Validation Errors:"),
    Doc.empty,
    Doc.text(baseTree),
    buildRuleReminders(error, ruleSet)
  ])

  return Doc.render(doc, { style: "pretty", options: { lineWidth: 100 } })
}

/**
 * Generate improvement prompt for retry
 *
 * Creates a prompt that includes:
 * - Tree-formatted validation errors from previous attempt
 * - Path guidance for locating errors
 * - Reminder of critical rules
 *
 * @param error - ParseError from schema validation
 * @param ruleSet - Rule set for the extraction stage
 * @returns Improvement prompt for LLM retry
 *
 * @since 2.0.0
 */
export const generateImprovementPrompt = (
  error: ParseError,
  ruleSet: RuleSet
): string => {
  const treeFeedback = generateTreeFeedback(error, ruleSet)

  const doc = Doc.vsep([
    Doc.text("Your previous output had validation errors:"),
    Doc.empty,
    Doc.text(treeFeedback),
    Doc.empty,
    Doc.text("Please correct these issues. The tree above shows:"),
    Doc.text("• The path to each error (e.g., [entities][0][types])"),
    Doc.text("• What was expected vs what was received"),
    Doc.empty,
    Doc.text("Generate a corrected output that fixes all validation errors.")
  ])

  return Doc.render(doc, { style: "pretty", options: { lineWidth: 100 } })
}

/**
 * Check if an error is likely retryable
 *
 * Determines if the validation error is something the LLM can fix
 * (e.g., format issues) vs something systemic (e.g., missing schema).
 *
 * @param error - ParseError from schema validation
 * @returns true if the error is likely fixable by retry
 *
 * @since 2.0.0
 */
export const isRetryable = (error: ParseError): boolean => {
  const violations = extractViolations(error)

  // If no violations extracted, probably a systemic issue
  if (violations.length === 0) {
    return false
  }

  // Check if all violations are for format/value issues (retryable)
  // vs structural issues (not retryable)
  const retryablePatterns = [
    /casing/i,
    /format/i,
    /invalid.*value/i,
    /expected.*got/i,
    /must be/i,
    /should be/i
  ]

  const structuralPatterns = [
    /missing.*required/i,
    /unknown.*property/i,
    /undefined/i
  ]

  for (const v of violations) {
    // If any violation looks structural, not retryable
    for (const pattern of structuralPatterns) {
      if (pattern.test(v.message)) {
        return false
      }
    }
  }

  // If most violations look retryable, return true
  let retryableCount = 0
  for (const v of violations) {
    for (const pattern of retryablePatterns) {
      if (pattern.test(v.message)) {
        retryableCount++
        break
      }
    }
  }

  return retryableCount >= violations.length * 0.5
}
