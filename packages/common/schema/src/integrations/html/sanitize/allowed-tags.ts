/**
 * @module AllowedTags
 * @description Discriminated union for allowed HTML tags configuration
 * @since 0.1.0
 */
import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { HtmlTag } from "../literal-kits/html-tag";

const $I = $SchemaId.create("integrations/html/sanitize/allowed-tags");

// ============================================================================
// Variant Schemas
// ============================================================================

/**
 * AllTags variant - Allow all HTML tags
 *
 * Corresponds to sanitize-html `allowedTags: false`
 *
 * @since 0.1.0
 * @category Variants
 */
const AllTagsStruct = S.TaggedStruct("AllTags", {}).annotations({
  identifier: "AllowedTags.AllTags",
  title: "All Tags Allowed",
  description: "Allow all HTML tags (no tag filtering)",
});

/**
 * NoneTags variant - Allow no HTML tags
 *
 * Corresponds to sanitize-html `allowedTags: []`
 * All tags will be stripped, leaving only text content
 *
 * @since 0.1.0
 * @category Variants
 */
const NoneTagsStruct = S.TaggedStruct("NoneTags", {}).annotations({
  identifier: "AllowedTags.NoneTags",
  title: "No Tags Allowed",
  description: "Strip all HTML tags, preserving only text content",
});

/**
 * SpecificTags variant - Allow specific HTML tags
 *
 * Corresponds to sanitize-html `allowedTags: ["p", "a", ...]`
 * Tags are validated against the HtmlTag schema (140+ valid tags)
 *
 * @since 0.1.0
 * @category Variants
 */
const SpecificTagsStruct = S.TaggedStruct("SpecificTags", {
  tags: S.Array(HtmlTag).annotations({
    title: "Allowed Tags",
    description: "Array of HTML tag names to allow",
  }),
}).annotations({
  identifier: "AllowedTags.SpecificTags",
  title: "Specific Tags Allowed",
  description: "Allow only the specified HTML tags",
});

// ============================================================================
// Type Aliases for Variants
// ============================================================================

/**
 * AllTags variant type
 * @since 0.1.0
 */
export type AllTags = {
  readonly _tag: "AllTags";
};

/**
 * NoneTags variant type
 * @since 0.1.0
 */
export type NoneTags = {
  readonly _tag: "NoneTags";
};

/**
 * SpecificTags variant type
 * @since 0.1.0
 */
export type SpecificTags = {
  readonly _tag: "SpecificTags";
  readonly tags: ReadonlyArray<HtmlTag.Type>;
};

// ============================================================================
// Union Schema with Factory Functions
// ============================================================================

const _AllowedTags = S.Union(AllTagsStruct, NoneTagsStruct, SpecificTagsStruct).annotations(
  $I.annotations("AllowedTags", {
    title: "Allowed Tags Configuration",
    description: "Specifies which HTML tags are permitted in sanitized output",
  })
);

/**
 * AllowedTags discriminated union
 *
 * Represents the allowedTags configuration for HTML sanitization.
 * Discriminated on the `_tag` field for exhaustive pattern matching.
 *
 * @since 0.1.0
 * @category Schema
 * @example
 * ```typescript
 * import { AllowedTags } from "@beep/schema/integrations/html";
 * import * as Match from "effect/Match";
 *
 * const config = AllowedTags.specific(["p", "a", "strong"]);
 *
 * Match.value(config).pipe(
 *   Match.tag("AllTags", () => "All tags allowed"),
 *   Match.tag("NoneTags", () => "No tags allowed"),
 *   Match.tag("SpecificTags", ({ tags }) => `${tags.length} tags allowed`),
 *   Match.exhaustive
 * );
 * ```
 */
export const AllowedTags: typeof _AllowedTags & {
  readonly all: () => AllTags;
  readonly none: () => NoneTags;
  readonly specific: (tags: ReadonlyArray<HtmlTag.Type>) => SpecificTags;
} = Object.assign(_AllowedTags, {
  all: (): AllTags => ({ _tag: "AllTags" }),
  none: (): NoneTags => ({ _tag: "NoneTags" }),
  specific: (tags: ReadonlyArray<HtmlTag.Type>): SpecificTags => ({
    _tag: "SpecificTags",
    tags,
  }),
});

export type AllowedTags = S.Schema.Type<typeof _AllowedTags>;
export type AllowedTagsEncoded = S.Schema.Encoded<typeof _AllowedTags>;
