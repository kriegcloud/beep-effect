/**
 * Entity Utilities
 *
 * Pure functions for entity ID validation and reference detection.
 *
 * @since 2.0.0
 * @module Utils/Entity
 */

import { ENTITY_ID_PATTERN } from "../Domain/Model/shared.js"

/**
 * Check if a string value is an entity reference (vs a literal)
 *
 * Entity references are snake_case identifiers starting with lowercase letter.
 * This distinguishes entity ID references from literal string values.
 *
 * @param value - String to check
 * @returns True if value matches entity reference pattern
 *
 * @example
 * ```typescript
 * isEntityReference("cristiano_ronaldo")  // => true
 * isEntityReference("al_nassr_fc")        // => true
 * isEntityReference("1985-02-05")         // => false (starts with digit)
 * isEntityReference("Portuguese")         // => false (starts with uppercase)
 * isEntityReference("hello world")        // => false (contains space)
 * ```
 *
 * @since 2.0.0
 * @category Entity
 */
export const isEntityReference = (value: string): boolean => ENTITY_ID_PATTERN.test(value)
