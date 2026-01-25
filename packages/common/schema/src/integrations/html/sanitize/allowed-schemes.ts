/**
 * @module AllowedSchemes
 * @description Discriminated unions for allowed URL schemes configuration
 * @since 1.0.0
 */
import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { AllowedScheme } from "../literal-kits/allowed-schemes";

const $I = $SchemaId.create("integrations/html/sanitize/allowed-schemes");

// ============================================================================
// AllowedSchemes Discriminated Union
// ============================================================================

/**
 * Allow all URL schemes
 * @since 1.0.0
 * @category Variants
 */
const AllSchemes = S.TaggedStruct("AllSchemes", {}).annotations({
  identifier: "AllowedSchemes.AllSchemes",
  description: "Allow all URL schemes (allowedSchemes: false)",
});

/**
 * Allow specific URL schemes
 * @since 1.0.0
 * @category Variants
 */
const SpecificSchemes = S.TaggedStruct("SpecificSchemes", {
  schemes: S.Array(AllowedScheme).annotations({
    description: "Array of allowed URL schemes",
  }),
}).annotations({
  identifier: "AllowedSchemes.SpecificSchemes",
  description: "Allow only specific URL schemes",
});

// ============================================================================
// Type Aliases
// ============================================================================

export type AllSchemesType = {
  readonly _tag: "AllSchemes";
};

export type SpecificSchemesType = {
  readonly _tag: "SpecificSchemes";
  readonly schemes: ReadonlyArray<AllowedScheme.Type>;
};

// ============================================================================
// Union Schema with Factory Functions
// ============================================================================

const _AllowedSchemes = S.Union(AllSchemes, SpecificSchemes).annotations(
  $I.annotations("AllowedSchemes", {
    title: "Allowed URL Schemes Configuration",
    description: "Specifies which URL schemes are permitted globally",
  })
);

/**
 * AllowedSchemes configuration
 *
 * - AllSchemes: Allow all URL schemes (allowedSchemes: false)
 * - SpecificSchemes: Allow specific URL schemes
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * import { AllowedSchemes } from "@beep/schema/integrations/html";
 *
 * AllowedSchemes.all();
 * AllowedSchemes.specific(["http", "https", "mailto"]);
 * ```
 */
export const AllowedSchemes: typeof _AllowedSchemes & {
  readonly all: () => AllSchemesType;
  readonly specific: (schemes: ReadonlyArray<AllowedScheme.Type>) => SpecificSchemesType;
} = Object.assign(_AllowedSchemes, {
  all: (): AllSchemesType => ({ _tag: "AllSchemes" }),
  specific: (schemes: ReadonlyArray<AllowedScheme.Type>): SpecificSchemesType => ({
    _tag: "SpecificSchemes",
    schemes,
  }),
});

export type AllowedSchemes = S.Schema.Type<typeof _AllowedSchemes>;
export type AllowedSchemesEncoded = S.Schema.Encoded<typeof _AllowedSchemes>;

// ============================================================================
// AllowedSchemesByTag Discriminated Union
// ============================================================================

/**
 * Allow all schemes on all tags
 * @since 1.0.0
 * @category Variants
 */
const AllSchemesByTag = S.TaggedStruct("AllSchemesByTag", {}).annotations({
  identifier: "AllowedSchemesByTag.AllSchemesByTag",
  description: "Allow all schemes on all tags (allowedSchemesByTag: false)",
});

/**
 * Allow specific schemes per tag
 * @since 1.0.0
 * @category Variants
 */
const SpecificSchemesByTag = S.TaggedStruct("SpecificSchemesByTag", {
  byTag: S.Record({
    key: S.String,
    value: S.Array(AllowedScheme),
  }).annotations({
    description: "Map of tag names to their allowed URL schemes",
  }),
}).annotations({
  identifier: "AllowedSchemesByTag.SpecificSchemesByTag",
  description: "Allow only specific schemes per tag",
});

// ============================================================================
// Type Aliases for ByTag
// ============================================================================

export type AllSchemesByTagType = {
  readonly _tag: "AllSchemesByTag";
};

export type SpecificSchemesByTagType = {
  readonly _tag: "SpecificSchemesByTag";
  readonly byTag: Record<string, ReadonlyArray<AllowedScheme.Type>>;
};

// ============================================================================
// Union Schema with Factory Functions
// ============================================================================

const _AllowedSchemesByTag = S.Union(AllSchemesByTag, SpecificSchemesByTag).annotations(
  $I.annotations("AllowedSchemesByTag", {
    title: "Allowed URL Schemes by Tag Configuration",
    description: "Specifies which URL schemes are permitted per tag",
  })
);

/**
 * AllowedSchemesByTag configuration
 *
 * - AllSchemesByTag: Allow all schemes on all tags
 * - SpecificSchemesByTag: Per-tag scheme allowlist
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * import { AllowedSchemesByTag } from "@beep/schema/integrations/html";
 *
 * AllowedSchemesByTag.all();
 * AllowedSchemesByTag.specific({
 *   "a": ["http", "https", "mailto"],
 *   "img": ["http", "https", "data"]
 * });
 * ```
 */
export const AllowedSchemesByTag: typeof _AllowedSchemesByTag & {
  readonly all: () => AllSchemesByTagType;
  readonly specific: (byTag: Record<string, ReadonlyArray<AllowedScheme.Type>>) => SpecificSchemesByTagType;
} = Object.assign(_AllowedSchemesByTag, {
  all: (): AllSchemesByTagType => ({ _tag: "AllSchemesByTag" }),
  specific: (byTag: Record<string, ReadonlyArray<AllowedScheme.Type>>): SpecificSchemesByTagType => ({
    _tag: "SpecificSchemesByTag",
    byTag,
  }),
});

export type AllowedSchemesByTag = S.Schema.Type<typeof _AllowedSchemesByTag>;
export type AllowedSchemesByTagEncoded = S.Schema.Encoded<typeof _AllowedSchemesByTag>;
