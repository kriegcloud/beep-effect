/**
 * Shared Schema Definitions
 *
 * Common schemas used across domain models to ensure consistency
 * and reduce duplication.
 *
 * @since 2.0.0
 * @module Domain/Model/shared
 */

import { Schema } from "effect"

// =============================================================================
// Attributes Schema
// =============================================================================

/**
 * Schema for entity/mention attributes
 *
 * Property-value pairs where keys are strings (typically URIs)
 * and values are literals (string, number, or boolean).
 *
 * @example
 * ```typescript
 * const attrs = {
 *   "http://schema.org/birthDate": "1985-02-05",
 *   "http://schema.org/age": 39,
 *   "http://schema.org/active": true
 * }
 * ```
 *
 * @since 2.0.0
 * @category Schemas
 */
export const AttributesSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Union(Schema.String, Schema.Number, Schema.Boolean)
}).annotations({
  title: "Attributes",
  description: "Property-value pairs (literal values only)"
})

/**
 * Type alias for attributes record
 *
 * @since 2.0.0
 */
export type Attributes = typeof AttributesSchema.Type

// =============================================================================
// Confidence Schema
// =============================================================================

/**
 * Schema for confidence scores (0.0 to 1.0)
 *
 * Used for extraction confidence, resolution confidence, and grounding scores.
 *
 * @example
 * ```typescript
 * const confidence: Confidence = 0.95 // Valid
 * const invalid: Confidence = 1.5 // Invalid - will fail validation
 * ```
 *
 * @since 2.0.0
 * @category Schemas
 */
export const ConfidenceSchema = Schema.Number.pipe(
  Schema.between(0, 1)
).annotations({
  title: "Confidence",
  description: "Confidence score (0.0-1.0)"
})

/**
 * Type alias for confidence score
 *
 * @since 2.0.0
 */
export type Confidence = typeof ConfidenceSchema.Type

/**
 * Optional confidence schema variant
 *
 * @since 2.0.0
 * @category Schemas
 */
export const OptionalConfidenceSchema = Schema.optional(ConfidenceSchema)

// =============================================================================
// Entity ID Pattern
// =============================================================================

/**
 * Regex pattern for valid entity IDs
 *
 * Entity IDs must be snake_case starting with lowercase letter.
 *
 * @example
 * - Valid: "cristiano_ronaldo", "al_nassr_fc", "a1"
 * - Invalid: "Cristiano", "123", "_private"
 *
 * @since 2.0.0
 * @category Patterns
 */
export const ENTITY_ID_PATTERN = /^[a-z][a-z0-9_]*$/

/**
 * Schema for entity IDs with pattern validation
 *
 * @since 2.0.0
 * @category Schemas
 */
export const EntityIdSchema = Schema.String.pipe(
  Schema.pattern(ENTITY_ID_PATTERN),
  Schema.brand("EntityId"),
  Schema.annotations({
    title: "Entity ID",
    description: "Unique identifier in snake_case format"
  })
)

/**
 * Branded EntityId type for compile-time safety
 *
 * @since 2.0.0
 * @category Types
 */
export type EntityId = typeof EntityIdSchema.Type

/**
 * Create a branded EntityId from a string (unsafe - no validation)
 *
 * Use this when you have already validated the string matches ENTITY_ID_PATTERN
 * or when the string is from a trusted source (e.g., LLM extraction output).
 *
 * @example
 * ```typescript
 * const id = EntityId("cristiano_ronaldo") // Branded EntityId
 * ```
 *
 * @since 2.0.0
 * @category Constructors
 */
export const EntityId = (id: string): EntityId => id as EntityId
