/**
 * @module sanitize
 * @description HTML sanitization schemas and utilities
 *
 * Provides Effect Schema definitions for HTML sanitization configuration,
 * branded types for sanitized HTML, and factory functions for creating
 * sanitization transformation schemas.
 *
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * import {
 *   SanitizeConfig,
 *   AllowedTags,
 *   AllowedAttributes,
 *   SanitizedHtml,
 *   makeSanitizeSchema,
 *   DefaultSanitizeConfig,
 * } from "@beep/schema/integrations/html/sanitize";
 *
 * // Create custom configuration
 * const config = new SanitizeConfig({
 *   allowedTags: AllowedTags.specific(["p", "a", "strong", "em"]),
 *   allowedAttributes: AllowedAttributes.specific({
 *     a: ["href", "title"],
 *   }),
 *   allowProtocolRelative: false,
 * });
 *
 * // Create sanitization schema
 * const Sanitize = makeSanitizeSchema(config, sanitizeHtml);
 *
 * // Use in other schemas
 * const UserProfile = S.Struct({
 *   name: S.String,
 *   bio: Sanitize,  // SanitizedHtml branded type
 * });
 * ```
 */

// ============================================================================
// RegExp Pattern
// ============================================================================

export { RegExpPattern } from "./regexp-pattern";

// ============================================================================
// Allowed Tags
// ============================================================================

export {
  AllowedTags,
  type AllowedTagsEncoded,
  type AllTags,
  type NoneTags,
  type SpecificTags,
} from "./allowed-tags";

// ============================================================================
// Allowed Attributes
// ============================================================================

export {
  type AllAttributesType,
  AllowedAttribute,
  AllowedAttributes,
  type AllowedAttributesEncoded,
  AttributeConstraint,
  type NoneAttributesType,
  type SpecificAttributesType,
  TagKey,
} from "./allowed-attributes";

// ============================================================================
// Allowed Schemes
// ============================================================================

export {
  AllowedSchemes,
  AllowedSchemesByTag,
  type AllowedSchemesByTagEncoded,
  type AllowedSchemesEncoded,
  type AllSchemesByTagType,
  type AllSchemesType,
  type SpecificSchemesByTagType,
  type SpecificSchemesType,
} from "./allowed-schemes";

// ============================================================================
// Allowed Classes
// ============================================================================

export {
  type AllClassesType,
  AllowedClasses,
  type AllowedClassesEncoded,
  AllowedClassesForTag,
  type AllowedClassesForTagEncoded,
  ClassPattern,
  type SpecificClassesType,
} from "./allowed-classes";

// ============================================================================
// Sanitize Config
// ============================================================================

export {
  AllowedStyles,
  CssPropertyPatterns,
  DefaultSanitizeConfig,
  MinimalSanitizeConfig,
  PermissiveSanitizeConfig,
  SanitizeConfig,
} from "./sanitize-config";

// ============================================================================
// Sanitized HTML Brand
// ============================================================================

export { SanitizedHtml, type SanitizedHtmlBrand } from "./sanitized-html";

// ============================================================================
// Factory Functions
// ============================================================================

export { DirtyHtml, makeSanitizeSchema, makeSanitizeSchemaValidateOnly, type SanitizeFn } from "./make-sanitize-schema";

// ============================================================================
// Options Conversion
// ============================================================================

export { type RuntimeAllowedAttribute, type SanitizeOptions, toSanitizeOptions } from "./to-sanitize-options";
