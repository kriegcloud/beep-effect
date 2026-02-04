/**
 * Prompt Module - Unified extraction rule system
 *
 * Defines extraction constraints as structured data that generate both:
 * - Effect Schema annotations (descriptions, validation messages)
 * - Prompt text (instructions, examples, allowed values)
 *
 * Single source of truth for schema-prompt alignment.
 *
 * @module Prompt
 * @since 2.0.0
 */

// Core Types
export { ExtractionRule, ExtractionStage, RuleCategory, RuleExample, RuleSeverity } from "./ExtractionRule.js"
export type {
  ExtractionStage as ExtractionStageType,
  RuleCategory as RuleCategoryType,
  RuleSeverity as RuleSeverityType
} from "./ExtractionRule.js"

// Rule Collections
export { AllowedIriSet, makeEntityRuleSet, makeMentionRuleSet, makeRelationRuleSet, RuleSet } from "./RuleSet.js"

// Generators
export {
  findRuleById,
  findRulesByCategory,
  generateSchemaAnnotations,
  generateSchemaDescription,
  generateSchemaIdentifier,
  generateSchemaTitle,
  getFieldDescription,
  getFieldValidationTemplate
} from "./SchemaGenerator.js"

export {
  generateEntityPrompt,
  generateMentionPrompt,
  generatePrompt,
  generateRelationPrompt,
  generateStructuredEntityPrompt,
  generateStructuredMentionPrompt,
  generateStructuredPrompt,
  generateStructuredRelationPrompt
} from "./PromptGenerator.js"
export type { OntologyPromptContext, StructuredPrompt } from "./PromptGenerator.js"

export {
  extractViolations,
  findMatchingRule,
  generateFeedback,
  generateImprovementPrompt,
  generateTreeFeedback,
  interpolate,
  isRetryable
} from "./FeedbackGenerator.js"
export type { Violation } from "./FeedbackGenerator.js"
