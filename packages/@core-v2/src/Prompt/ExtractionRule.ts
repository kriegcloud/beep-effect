/**
 * Extraction Rule - Core type definitions
 *
 * Defines extraction constraints as structured data that generate both:
 * - Effect Schema annotations (descriptions, validation messages)
 * - Prompt text (instructions, examples, allowed values)
 *
 * @module Prompt/ExtractionRule
 * @since 2.0.0
 */

import { Data, Schema as S } from "effect"

/**
 * RuleCategory - Groups related extraction rules
 *
 * @since 2.0.0
 */
export const RuleCategory = S.Literal(
  "id_format", // Entity ID formatting rules
  "type_mapping", // Class/type assignment rules
  "property_usage", // Property IRI usage rules
  "iri_casing", // IRI case sensitivity rules
  "cardinality", // Min/max value rules
  "reference_integrity", // Entity reference rules
  "mention_format", // Mention text formatting rules
  "literal_format", // Literal value formatting rules
  "entity_exclusion", // Rules for what NOT to extract (photo credits, agencies)
  "context_validation" // Rules for validating relations match text context
)
export type RuleCategory = S.Schema.Type<typeof RuleCategory>

/**
 * RuleSeverity - Constraint enforcement level
 *
 * - "error": Hard constraint - schema validation will fail
 * - "warning": Soft preference - prompt guidance only
 *
 * @since 2.0.0
 */
export const RuleSeverity = S.Literal("error", "warning")
export type RuleSeverity = S.Schema.Type<typeof RuleSeverity>

/**
 * RuleExample - Demonstrates correct or incorrect usage
 *
 * @since 2.0.0
 */
export class RuleExample extends Data.Class<{
  /** Input context or scenario */
  readonly input: string
  /** Expected output */
  readonly output: string
  /** Brief explanation */
  readonly explanation: string
}> {}

/**
 * ExtractionRule - Atomic extraction constraint as structured data
 *
 * Represents a single rule that can be rendered to:
 * - Effect Schema annotation (description field)
 * - Prompt instruction (natural language rule)
 * - Validation feedback (error message)
 *
 * @example
 * ```typescript
 * const idFormatRule = new ExtractionRule({
 *   id: "entity-id-format",
 *   category: "id_format",
 *   severity: "error",
 *   instruction: "Assign unique snake_case IDs starting with a letter",
 *   example: new RuleExample({
 *     input: "Cristiano Ronaldo",
 *     output: "cristiano_ronaldo",
 *     explanation: "Lowercase with underscores"
 *   }),
 *   counterExample: new RuleExample({
 *     input: "Cristiano Ronaldo",
 *     output: "CristianoRonaldo",
 *     explanation: "Avoid PascalCase"
 *   }),
 *   schemaDescription: "Snake_case unique identifier (e.g., 'cristiano_ronaldo')",
 *   validationTemplate: "Entity ID '{value}' must be snake_case starting with a letter"
 * })
 * ```
 *
 * @since 2.0.0
 */
export class ExtractionRule extends Data.Class<{
  /** Unique identifier for this rule */
  readonly id: string

  /** Rule category for grouping */
  readonly category: RuleCategory

  /** Severity: error = hard constraint, warning = preference */
  readonly severity: RuleSeverity

  /** Imperative instruction for prompt (e.g., "Use snake_case IDs") */
  readonly instruction: string

  /** Example of correct usage */
  readonly example: RuleExample

  /** Counter-example showing what NOT to do (null if not applicable) */
  readonly counterExample: RuleExample | null

  /** Schema annotation description */
  readonly schemaDescription: string

  /** Validation message template (use {value} for interpolation) */
  readonly validationTemplate: string
}> {
  /**
   * Check if this is a hard constraint (error severity)
   */
  get isHardConstraint(): boolean {
    return this.severity === "error"
  }

  /**
   * Check if this is a soft preference (warning severity)
   */
  get isSoftPreference(): boolean {
    return this.severity === "warning"
  }

  /**
   * Interpolate validation template with actual value
   */
  formatValidationMessage(value: unknown): string {
    return this.validationTemplate.replace("{value}", String(value))
  }
}

/**
 * ExtractionStage - Pipeline stages that have distinct rule sets
 *
 * @since 2.0.0
 */
export const ExtractionStage = S.Literal("mention", "entity", "relation")
export type ExtractionStage = S.Schema.Type<typeof ExtractionStage>
