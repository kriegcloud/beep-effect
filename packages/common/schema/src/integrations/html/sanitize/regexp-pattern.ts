/**
 * @module RegExpPattern
 * @description Serializable representation of a RegExp pattern for JSON-safe storage
 * @since 1.0.0
 */
import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("integrations/html/sanitize/regexp-pattern");

// ============================================================================
// Schema Definition
// ============================================================================

/**
 * Serializable representation of a RegExp pattern.
 * Stores source and flags separately for JSON serialization.
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * import { RegExpPattern } from "@beep/schema/integrations/html";
 *
 * // Create a pattern
 * const pattern = { source: "^https?://", flags: "i" };
 *
 * // Convert to native RegExp
 * const regex = RegExpPattern.toRegExp(pattern);
 * // → /^https?:\/\//i
 *
 * // Create from native RegExp
 * const pattern2 = RegExpPattern.fromRegExp(/\d{3}-\d{4}/g);
 * // → { source: "\\d{3}-\\d{4}", flags: "g" }
 * ```
 */
const _RegExpPattern = S.Struct({
  source: S.String.annotations({
    description: "The regular expression source string",
  }),
  flags: S.optional(S.String).annotations({
    description: "RegExp flags (i, g, m, s, u, y)",
  }),
}).annotations(
  $I.annotations("RegExpPattern", {
    title: "Regular Expression Pattern",
    description: "Serializable RegExp representation for JSON-safe storage and transmission",
  })
);

// ============================================================================
// Type Definitions
// ============================================================================

export type RegExpPatternType = S.Schema.Type<typeof _RegExpPattern>;
export type RegExpPatternEncoded = S.Schema.Encoded<typeof _RegExpPattern>;

// ============================================================================
// Static Utilities
// ============================================================================

/**
 * Convert a RegExpPattern to native RegExp instance
 *
 * @param pattern - The pattern object with source and optional flags
 * @returns A new RegExp constructed from source and flags
 * @since 1.0.0
 * @category Utilities
 * @example
 * ```typescript
 * const pattern = { source: "^test", flags: "i" };
 * const regex = RegExpPattern.toRegExp(pattern);
 * regex.test("TEST"); // true
 * ```
 */
const toRegExp = (pattern: RegExpPatternType): RegExp => new RegExp(pattern.source, pattern.flags);

/**
 * Create RegExpPattern from native RegExp
 *
 * @param regex - The native RegExp to convert
 * @returns A RegExpPattern object
 * @since 1.0.0
 * @category Utilities
 * @example
 * ```typescript
 * const regex = /^https?:\/\//i;
 * const pattern = RegExpPattern.fromRegExp(regex);
 * // → { source: "^https?:\\/\\/", flags: "i" }
 * ```
 */
const fromRegExp = (regex: RegExp): RegExpPatternType => ({
  source: regex.source,
  flags: regex.flags || undefined,
});

// ============================================================================
// Export with utilities attached
// ============================================================================

/**
 * RegExpPattern schema with attached utility functions
 *
 * @since 1.0.0
 * @category Schema
 */
export const RegExpPattern: typeof _RegExpPattern & {
  readonly toRegExp: (pattern: RegExpPatternType) => RegExp;
  readonly fromRegExp: (regex: RegExp) => RegExpPatternType;
} = Object.assign(_RegExpPattern, {
  toRegExp,
  fromRegExp,
});

export declare namespace RegExpPattern {
  export type Type = RegExpPatternType;
  export type Encoded = RegExpPatternEncoded;
}
