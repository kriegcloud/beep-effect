/**
 * @module AllowedAttributes
 * @description Discriminated union for allowed HTML attributes configuration
 * @since 1.0.0
 */
import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { HtmlTag } from "../literal-kits/html-tag";

const $I = $SchemaId.create("integrations/html/sanitize/allowed-attributes");

// ============================================================================
// Tag Key (HtmlTag | "*")
// ============================================================================

/**
 * Tag key for attribute mappings - either a specific HTML tag or wildcard "*"
 *
 * The wildcard "*" applies to all tags.
 *
 * @since 1.0.0
 * @category Schema
 */
export const TagKey = S.Union(HtmlTag, S.Literal("*")).annotations({
  identifier: "TagKey",
  description: 'HTML tag name or wildcard "*" for global attributes',
});

export type TagKey = S.Schema.Type<typeof TagKey>;

// ============================================================================
// Attribute Constraint Schema
// ============================================================================

/**
 * Attribute with value constraints
 *
 * Allows specifying which values are acceptable for an attribute.
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * { name: "target", values: ["_blank", "_self"] }
 * { name: "class", multiple: true, values: ["btn", "btn-primary"] }
 * ```
 */
export const AttributeConstraint = S.Struct({
  name: S.String.annotations({
    description: "The attribute name",
  }),
  multiple: S.optional(S.Boolean).annotations({
    description: "Whether multiple space-separated values are allowed",
  }),
  values: S.Array(S.String).annotations({
    description: "Allowed values for this attribute",
  }),
}).annotations(
  $I.annotations("AttributeConstraint", {
    description: "Attribute with value constraints",
  })
);

export type AttributeConstraint = S.Schema.Type<typeof AttributeConstraint>;

// ============================================================================
// AllowedAttribute Union
// ============================================================================

/**
 * An allowed attribute - either a simple name or a constrained definition
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * // Simple attribute name
 * "class"
 * "id"
 *
 * // Constrained attribute
 * { name: "target", values: ["_blank", "_self"] }
 * ```
 */
export const AllowedAttribute = S.Union(S.String, AttributeConstraint).annotations(
  $I.annotations("AllowedAttribute", {
    description: "An allowed attribute name or constrained attribute definition",
  })
);

export type AllowedAttribute = S.Schema.Type<typeof AllowedAttribute>;

// ============================================================================
// Discriminated Union Variants
// ============================================================================

/**
 * Allow ALL attributes on all tags (allowedAttributes: false)
 *
 * @since 1.0.0
 * @category Variants
 */
const AllAttributes = S.TaggedStruct("AllAttributes", {}).annotations({
  identifier: "AllowedAttributes.AllAttributes",
  description: "Allow all attributes on all tags (allowedAttributes: false)",
});

/**
 * Allow NO attributes (allowedAttributes: undefined with no defaults)
 *
 * @since 1.0.0
 * @category Variants
 */
const NoneAttributes = S.TaggedStruct("NoneAttributes", {}).annotations({
  identifier: "AllowedAttributes.NoneAttributes",
  description: "Allow no attributes on any tags",
});

/**
 * Per-tag attribute mapping with wildcard support
 *
 * @since 1.0.0
 * @category Variants
 * @example
 * ```typescript
 * {
 *   _tag: "SpecificAttributes",
 *   attributes: {
 *     "*": ["class", "id"],
 *     "a": ["href", "target"]
 *   }
 * }
 * ```
 */
const SpecificAttributes = S.TaggedStruct("SpecificAttributes", {
  attributes: S.Record({
    key: S.String,
    value: S.Array(AllowedAttribute),
  }).annotations({
    description: 'Per-tag attribute allowlist with optional wildcard "*" key',
  }),
}).annotations({
  identifier: "AllowedAttributes.SpecificAttributes",
  description: "Allow only specific attributes per tag",
});

// ============================================================================
// Type Aliases for Variants
// ============================================================================

/**
 * AllAttributes variant type
 * @since 1.0.0
 */
export type AllAttributesType = {
  readonly _tag: "AllAttributes";
};

/**
 * NoneAttributes variant type
 * @since 1.0.0
 */
export type NoneAttributesType = {
  readonly _tag: "NoneAttributes";
};

/**
 * SpecificAttributes variant type
 * @since 1.0.0
 */
export type SpecificAttributesType = {
  readonly _tag: "SpecificAttributes";
  readonly attributes: Record<string, ReadonlyArray<AllowedAttribute>>;
};

// ============================================================================
// Union Schema with Factory Functions
// ============================================================================

const _AllowedAttributes = S.Union(AllAttributes, NoneAttributes, SpecificAttributes).annotations(
  $I.annotations("AllowedAttributes", {
    title: "Allowed Attributes Configuration",
    description: "Specifies which attributes are permitted per HTML tag",
  })
);

/**
 * Allowed attributes configuration for sanitize-html
 *
 * Three modes:
 * - AllAttributes: Allow ALL attributes on all tags
 * - NoneAttributes: Disallow all attributes
 * - SpecificAttributes: Per-tag attribute allowlist
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * import { AllowedAttributes } from "@beep/schema/integrations/html";
 *
 * AllowedAttributes.all();
 * AllowedAttributes.none();
 * AllowedAttributes.specific({
 *   "*": ["class", "id"],
 *   "a": ["href", { name: "target", values: ["_blank", "_self"] }]
 * });
 * ```
 */
export const AllowedAttributes: typeof _AllowedAttributes & {
  readonly all: () => AllAttributesType;
  readonly none: () => NoneAttributesType;
  readonly specific: (attributes: Record<string, ReadonlyArray<AllowedAttribute>>) => SpecificAttributesType;
} = Object.assign(_AllowedAttributes, {
  all: (): AllAttributesType => ({ _tag: "AllAttributes" }),
  none: (): NoneAttributesType => ({ _tag: "NoneAttributes" }),
  specific: (attributes: Record<string, ReadonlyArray<AllowedAttribute>>): SpecificAttributesType => ({
    _tag: "SpecificAttributes",
    attributes,
  }),
});

export type AllowedAttributes = S.Schema.Type<typeof _AllowedAttributes>;
export type AllowedAttributesEncoded = S.Schema.Encoded<typeof _AllowedAttributes>;
