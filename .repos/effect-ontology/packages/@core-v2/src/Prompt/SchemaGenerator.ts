/**
 * Schema Generator - Generate Effect Schema annotations from RuleSet
 *
 * Transforms extraction rules into Effect Schema annotation content,
 * ensuring schema descriptions align with prompt instructions.
 *
 * @module Prompt/SchemaGenerator
 * @since 2.0.0
 */

import type { ExtractionRule } from "./ExtractionRule.js"
import type { RuleSet } from "./RuleSet.js"

/**
 * Generate top-level schema description from rule set
 *
 * Creates a structured description for the schema's top-level annotation
 * that includes all critical rules (error severity).
 *
 * @param ruleSet - Rule set for the extraction stage
 * @returns Description string for schema annotation
 *
 * @example
 * ```typescript
 * const ruleSet = makeEntityRuleSet(classes, properties)
 * const description = generateSchemaDescription(ruleSet)
 * // Returns:
 * // "CRITICAL RULES:
 * // - Assign unique snake_case IDs starting with a lowercase letter
 * // - Map each entity to at least one ontology class
 * // ..."
 * ```
 *
 * @since 2.0.0
 */
export const generateSchemaDescription = (ruleSet: RuleSet): string => {
  const errorRules = ruleSet.errorRules
  const warningRules = ruleSet.warningRules

  const sections: Array<string> = []

  // Critical rules section
  if (errorRules.length > 0) {
    const criticalLines = errorRules.map((r) => `- ${r.instruction}`)
    sections.push(`CRITICAL RULES:\n${criticalLines.join("\n")}`)
  }

  // Preferences section (warnings)
  if (warningRules.length > 0) {
    const preferenceLines = warningRules.map((r) => `- ${r.instruction}`)
    sections.push(`PREFERENCES:\n${preferenceLines.join("\n")}`)
  }

  return sections.join("\n\n")
}

/**
 * Generate title for schema based on stage
 *
 * @param ruleSet - Rule set for the extraction stage
 * @returns Title string for schema annotation
 *
 * @since 2.0.0
 */
export const generateSchemaTitle = (ruleSet: RuleSet): string => {
  switch (ruleSet.stage) {
    case "mention":
      return "Mention Extraction"
    case "entity":
      return "Entity Extraction (Stage 1)"
    case "relation":
      return "Relation Extraction (Stage 2)"
  }
}

/**
 * Generate identifier for schema based on stage
 *
 * @param ruleSet - Rule set for the extraction stage
 * @returns Identifier string for schema annotation
 *
 * @since 2.0.0
 */
export const generateSchemaIdentifier = (ruleSet: RuleSet): string => {
  switch (ruleSet.stage) {
    case "mention":
      return "MentionGraph"
    case "entity":
      return "EntityGraph"
    case "relation":
      return "RelationGraph"
  }
}

/**
 * Field path to rule mapping
 *
 * Maps schema field paths to rule IDs for looking up field-specific descriptions.
 */
const FIELD_TO_RULE_MAP: Record<string, string> = {
  // Entity fields
  "entities.id": "entity-id-format",
  "entities.mention": "entity-mention-complete",
  "entities.types": "entity-type-required",
  "entities.attributes": "entity-allowed-attributes",
  // Relation fields
  "relations.subjectId": "relation-subject-valid",
  "relations.predicate": "relation-predicate-valid",
  "relations.object": "relation-object-type",
  // Mention fields
  "mentions.id": "mention-id-format",
  "mentions.mention": "mention-complete",
  "mentions.context": "mention-context"
}

/**
 * Get schema description for a specific field
 *
 * Looks up the appropriate rule for a field path and returns its schema description.
 *
 * @param ruleSet - Rule set containing the rules
 * @param fieldPath - Dot-separated path to the field (e.g., "entities.id")
 * @returns Field description if rule exists, undefined otherwise
 *
 * @example
 * ```typescript
 * const ruleSet = makeEntityRuleSet(classes, properties)
 * const desc = getFieldDescription(ruleSet, "entities.id")
 * // Returns: "Snake_case unique identifier - use this exact ID when referring to this entity in relations (e.g., 'cristiano_ronaldo')"
 * ```
 *
 * @since 2.0.0
 */
export const getFieldDescription = (
  ruleSet: RuleSet,
  fieldPath: string
): string | undefined => {
  const ruleId = FIELD_TO_RULE_MAP[fieldPath]
  if (!ruleId) return undefined

  const rule = ruleSet.allRules.find((r) => r.id === ruleId)
  return rule?.schemaDescription
}

/**
 * Get validation message for a field
 *
 * Returns the validation template from the corresponding rule,
 * which can be interpolated with actual values.
 *
 * @param ruleSet - Rule set containing the rules
 * @param fieldPath - Dot-separated path to the field
 * @returns Validation template if rule exists, undefined otherwise
 *
 * @since 2.0.0
 */
export const getFieldValidationTemplate = (
  ruleSet: RuleSet,
  fieldPath: string
): string | undefined => {
  const ruleId = FIELD_TO_RULE_MAP[fieldPath]
  if (!ruleId) return undefined

  const rule = ruleSet.allRules.find((r) => r.id === ruleId)
  return rule?.validationTemplate
}

/**
 * Generate schema annotations object
 *
 * Creates a complete annotations object for use with Effect Schema.
 *
 * @param ruleSet - Rule set for the extraction stage
 * @returns Annotations object for S.annotations()
 *
 * @example
 * ```typescript
 * const ruleSet = makeEntityRuleSet(classes, properties)
 * const annotations = generateSchemaAnnotations(ruleSet)
 *
 * const schema = S.Struct({ ... }).annotations(annotations)
 * ```
 *
 * @since 2.0.0
 */
export const generateSchemaAnnotations = (ruleSet: RuleSet): {
  identifier: string
  title: string
  description: string
} => ({
  identifier: generateSchemaIdentifier(ruleSet),
  title: generateSchemaTitle(ruleSet),
  description: generateSchemaDescription(ruleSet)
})

/**
 * Find rule by category
 *
 * Utility to find rules matching a specific category.
 *
 * @param ruleSet - Rule set to search
 * @param category - Rule category to filter by
 * @returns Array of matching rules
 *
 * @since 2.0.0
 */
export const findRulesByCategory = (
  ruleSet: RuleSet,
  category: string
): ReadonlyArray<ExtractionRule> => ruleSet.getRulesByCategory(category)

/**
 * Find rule by ID
 *
 * @param ruleSet - Rule set to search
 * @param ruleId - Unique rule identifier
 * @returns Matching rule or undefined
 *
 * @since 2.0.0
 */
export const findRuleById = (
  ruleSet: RuleSet,
  ruleId: string
): ExtractionRule | undefined => ruleSet.allRules.find((r) => r.id === ruleId)
