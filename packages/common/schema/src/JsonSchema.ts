import type { Or, UnsafeTypes } from "@beep/types";
import * as S from "effect/Schema";
import type { JsonProp } from "./custom";
import { LiteralDefaults, RegexFromString } from "./custom";
import { Struct } from "./extended-schemas";
export const $JsonType = S.Literal("object", "array", "string", "number", "boolean", "null", "integer");

export declare namespace $JsonType {
  export type Type = "object" | "array" | "string" | "number" | "boolean" | "null" | "integer";
}

export declare namespace _JsonSchema {
  export type Type = boolean | JsonSchema.Type;
}

export const _JsonSchema = S.Union(
  S.Boolean,
  S.suspend((): S.Schema<JsonSchema.Type, JsonSchema.Encoded, never> => JsonSchema)
);

const $Schema = S.Literal(
  "https://json-schema.org/draft/2020-12/schema",
  "http://json-schema.org/draft-07/schema#",
  "http://json-schema.org/draft-04/schema#"
);

declare namespace $Schema {
  export type Type =
    | "https://json-schema.org/draft/2020-12/schema"
    | "http://json-schema.org/draft-07/schema#"
    | "http://json-schema.org/draft-04/schema#";
}

export declare namespace JsonSchema {
  export type Type = {
    /**
     * @description A catch-all index signature to allow other properties.
     * @reference N/A (allows additional arbitrary fields in schema definition)
     */
    [k: string]: unknown;
    /**
     * @description Declares which JSON Schema specification (dialect) this schema conforms to.
     * @reference https://json-schema.org/understanding-json-schema/reference/schema
     */
    $schema?: Or.Undefined<$Schema.Type>;

    /**
     * @description URI identifier for the schema, establishing its base URI for $ref resolution.
     * @reference https://json-schema.org/understanding-json-schema/structuring#id
     */
    $id?: Or.Undefined<string>;

    /**
     * @description Defines a named anchor for the schema to allow referencing via a URI fragment.
     * @reference https://json-schema.org/understanding-json-schema/structuring#anchor
     */
    $anchor?: Or.Undefined<string>;

    /**
     * @description References another schema by URI (JSON Pointer or URL). The instance must validate against the referenced schema.
     * @reference https://json-schema.org/understanding-json-schema/structuring#dollarref
     */
    $ref?: Or.Undefined<string>;

    /**
     * @description A reference that is resolved dynamically at runtime. Works with $dynamicAnchor to support overriding recursive schema targets.
     * @reference https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.3.2
     */
    $dynamicRef?: Or.Undefined<string>;

    /**
     * @description Defines a dynamic anchor name for use with $dynamicRef (a target that can be overridden by dynamic references in recursive schemas).
     * @reference https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.3.2
     */
    $dynamicAnchor?: Or.Undefined<string>;

    /**
     * @description Declares which vocabularies (sets of keywords) are available in this meta-schema (used in meta-schemas only).
     * @reference https://json-schema.org/draft/2020-12/json-schema-core#section-8.1.2
     */
    $vocabulary?: Or.Undefined<Record<string, boolean>>;

    /**
     * @description A free-form comment for schema maintainers. It has no effect on validation.
     * @reference https://json-schema.org/understanding-json-schema/reference/comments#comments
     */
    $comment?: Or.Undefined<string>;

    /**
     * @description A standardized container for re-usable subschemas within the current schema. Each named definition can be referenced via $ref.
     * @reference https://json-schema.org/understanding-json-schema/structuring#defs
     */
    $defs?: Or.Undefined<Record<string, JsonSchema.Type>>;

    /**
     * @description Declares the expected JSON type for the instance (e.g., "object", "string", etc.).
     * @reference https://json-schema.org/understanding-json-schema/basics#the-type-keyword
     */
    type?: Or.Undefined<$JsonType.Type>;

    /**
     * @description (Draft 4-7) Schema for any array items beyond those defined by tuple (array) schemas. If false, no additional items are allowed.
     * @reference https://json-schema.org/understanding-json-schema/reference/array#additionalItems
     */
    additionalItems?: Or.Undefined<_JsonSchema.Type>;

    /**
     * @description Schema applied to array items that were not validated by "items"/"prefixItems"/"contains". Used to restrict or allow extra items in arrays.
     * @reference https://json-schema.org/understanding-json-schema/reference/array#unevaluatedItems
     */
    unevaluatedItems?: Or.Undefined<_JsonSchema.Type>;

    /**
     * @description An array of schemas for tuple validation. Each schema in the array corresponds to the item at the same index in the instance array.
     * @reference https://json-schema.org/understanding-json-schema/reference/array#prefixItems
     */
    prefixItems?: Or.Undefined<ReadonlyArray<_JsonSchema.Type>>;

    /**
     * @description For arrays: a schema (or array of schemas in older drafts) to validate items. If a single schema, all items must match it; if an array (draft 4-7), each position has its own schema.
     * @reference https://json-schema.org/understanding-json-schema/reference/array#items
     */
    items?: Or.Undefined<_JsonSchema.Type | ReadonlyArray<_JsonSchema.Type>>;

    /**
     * @description Requires that at least one array element matches the given schema.
     * @reference https://json-schema.org/understanding-json-schema/reference/array#contains
     */
    contains?: Or.Undefined<JsonSchema.Type>;

    /**
     * @description Schema for object properties not explicitly defined in "properties" or matched by "patternProperties". If false, additional properties are disallowed.
     * @reference https://json-schema.org/understanding-json-schema/reference/object#additionalProperties
     */
    additionalProperties?: Or.Undefined<_JsonSchema.Type>;

    /**
     * @description Similar to additionalProperties, but accounts for properties already validated in subschemas. If false, no other properties (not covered by properties/patternProperties or subschemas) are allowed.
     * @reference https://json-schema.org/understanding-json-schema/reference/object#unevaluatedProperties
     */
    unevaluatedProperties?: Or.Undefined<_JsonSchema.Type>;

    /**
     * @description Declares schemas for specific property names of an object. Each key is a property name and its value is the schema that property should adhere to.
     * @reference https://json-schema.org/understanding-json-schema/reference/object#properties
     */
    properties?: Or.Undefined<Record<string, _JsonSchema.Type>>;

    /**
     * @description Similar to properties, but the keys are regular expressions. Any property name matching a regex will be validated against the corresponding schema.
     * @reference https://json-schema.org/understanding-json-schema/reference/object#patternProperties
     */
    patternProperties?: Or.Undefined<Record<string, _JsonSchema.Type>>;

    /**
     * @description Maps property names to subschemas that must apply if that property is present. If a listed property exists in the instance, the corresponding subschema is applied.
     * @reference https://json-schema.org/understanding-json-schema/reference/conditionals#dependentSchemas
     */
    dependentSchemas?: Or.Undefined<Record<string, _JsonSchema.Type>>;

    /**
     * @description A schema applied to all property names of an object (regardless of their values). Typically used to enforce naming conventions via pattern or other constraints.
     * @reference https://json-schema.org/understanding-json-schema/reference/object#propertyNames
     */
    propertyNames?: Or.Undefined<JsonSchema.Type>;

    /**
     * @description A conditional schema. If the instance matches this schema, then the "then" schema must also apply.
     * @reference https://json-schema.org/understanding-json-schema/reference/conditionals#ifthenelse
     */
    if?: Or.Undefined<JsonSchema.Type>;

    /**
     * @description The schema to apply if the "if" schema matches. It must be satisfied when "if" is valid.
     * @reference https://json-schema.org/understanding-json-schema/reference/conditionals#ifthenelse
     */
    then?: Or.Undefined<JsonSchema.Type>;

    /**
     * @description The schema to apply if the "if" schema does not match. It must be satisfied when "if" is invalid.
     * @reference https://json-schema.org/understanding-json-schema/reference/conditionals#ifthenelse
     */
    else?: Or.Undefined<JsonSchema.Type>;

    /**
     * @description An array of schemas that all must be valid for the instance (logical AND of subschemas).
     * @reference https://json-schema.org/understanding-json-schema/reference/combining#allOf
     */
    allOf?: Or.Undefined<ReadonlyArray<JsonSchema.Type>>;

    /**
     * @description An array of schemas where the instance must be valid against at least one of them (logical OR).
     * @reference https://json-schema.org/understanding-json-schema/reference/combining#anyOf
     */
    anyOf?: Or.Undefined<ReadonlyArray<JsonSchema.Type>>;

    /**
     * @description An array of schemas where the instance must be valid against exactly one of them (exclusive OR).
     * @reference https://json-schema.org/understanding-json-schema/reference/combining#oneOf
     */
    oneOf?: Or.Undefined<ReadonlyArray<JsonSchema.Type>>;

    /**
     * @description A schema which the instance must NOT satisfy. The instance is valid only if it fails validation against this schema.
     * @reference https://json-schema.org/understanding-json-schema/reference/combining#not
     */
    not?: Or.Undefined<JsonSchema.Type>;

    /**
     * @description Specifies that a numeric value must be a multiple of the given number.
     * @reference https://json-schema.org/understanding-json-schema/reference/numeric#multiples
     */
    multipleOf?: Or.Undefined<number>;

    /**
     * @description The maximum numeric value (inclusive) allowed for the instance.
     * @reference https://json-schema.org/understanding-json-schema/reference/numeric#range
     */
    maximum?: Or.Undefined<number>;

    /**
     * @description An exclusive upper bound for numeric values. The instance must be strictly less than this value (or a boolean in Draft-04 indicating exclusivity of maximum).
     * @reference https://json-schema.org/understanding-json-schema/reference/numeric#range
     */
    exclusiveMaximum?: Or.Undefined<number | boolean>;

    /**
     * @description The minimum numeric value (inclusive) allowed for the instance.
     * @reference https://json-schema.org/understanding-json-schema/reference/numeric#range
     */
    minimum?: Or.Undefined<number>;

    /**
     * @description An exclusive lower bound for numeric values. The instance must be strictly greater than this value (or a boolean in Draft-04 indicating exclusivity of minimum).
     * @reference https://json-schema.org/understanding-json-schema/reference/numeric#range
     */
    exclusiveMinimum?: Or.Undefined<number | boolean>;

    /**
     * @description The maximum length of a string in characters.
     * @reference https://json-schema.org/understanding-json-schema/reference/string#length
     */
    maxLength?: Or.Undefined<number>;

    /**
     * @description The minimum length of a string in characters.
     * @reference https://json-schema.org/understanding-json-schema/reference/string#length
     */
    minLength?: Or.Undefined<number>;

    /**
     * @description A regular expression that a string must match.
     * @reference https://json-schema.org/understanding-json-schema/reference/string#pattern
     */
    pattern?: Or.Undefined<RegexFromString.Type>;

    /**
     * @description The maximum number of items an array can contain.
     * @reference https://json-schema.org/understanding-json-schema/reference/array#length
     */
    maxItems?: Or.Undefined<number>;

    /**
     * @description The minimum number of items an array must contain.
     * @reference https://json-schema.org/understanding-json-schema/reference/array#length
     */
    minItems?: Or.Undefined<number>;

    /**
     * @description If true, all items in the array must be unique.
     * @reference https://json-schema.org/understanding-json-schema/reference/array#uniqueness
     */
    uniqueItems?: Or.Undefined<boolean>;

    /**
     * @description When used with "contains", the maximum number of items in the array that can match the "contains" schema.
     * @reference https://json-schema.org/understanding-json-schema/reference/array#contains (see maxContains)
     */
    maxContains?: Or.Undefined<number>;

    /**
     * @description When used with "contains", the minimum number of items in the array that must match the "contains" schema.
     * @reference https://json-schema.org/understanding-json-schema/reference/array#contains (see minContains)
     */
    minContains?: Or.Undefined<number>;

    /**
     * @description The maximum number of properties an object can have.
     * @reference https://json-schema.org/understanding-json-schema/reference/object#properties (see maxProperties)
     */
    maxProperties?: Or.Undefined<number>;

    /**
     * @description The minimum number of properties an object must have.
     * @reference https://json-schema.org/understanding-json-schema/reference/object#properties (see minProperties)
     */
    minProperties?: Or.Undefined<number>;

    /**
     * @description An array of property names that must be present in the object for it to be valid.
     * @reference https://json-schema.org/understanding-json-schema/reference/object#required-properties
     */
    required?: Or.Undefined<ReadonlyArray<string>>;

    /**
     * @description Specifies property dependencies: if a property is present, certain other properties must also be present. Each key maps to an array of required property names.
     * @reference https://json-schema.org/understanding-json-schema/reference/conditionals#dependentRequired
     */
    dependentRequired?: Or.Undefined<Record<string, ReadonlyArray<string>>>;

    /**
     * @description Enumerates a fixed set of literal values that are allowed. The instance value must exactly match one of these.
     * @reference https://json-schema.org/understanding-json-schema/reference/generic#enumerated-values
     */
    enum?: Or.Undefined<ReadonlyArray<string | number | boolean | null>>;

    /**
     * @description Requires the instance to be exactly this value (constant).
     * @reference https://json-schema.org/understanding-json-schema/reference/generic#constant-values
     */
    const?: Or.Undefined<string | number | boolean | null>;

    // metadata
    /**
     * @description *(Draft-04)* Unique identifier for the schema (replaced by $id in newer drafts).
     * @reference https://json-schema.org/understanding-json-schema/basics#declaring-a-unique-identifier
     */
    id?: Or.Undefined<string>;

    /**
     * @description A short title for the schema, for documentation purposes.
     * @reference https://json-schema.org/understanding-json-schema/reference/generic#annotations (see title)
     */
    title?: Or.Undefined<string>;

    /**
     * @description A description of the purpose or usage of the schema.
     * @reference https://json-schema.org/understanding-json-schema/reference/generic#annotations (see description)
     */
    description?: Or.Undefined<string>;

    /**
     * @description A default value for instances of this schema (used by generators or validators as a fallback).
     * @reference https://json-schema.org/understanding-json-schema/reference/generic#annotations (see default)
     */
    default?: Or.Undefined<unknown>;

    /**
     * @description If true, indicates this field or schema is deprecated and should be avoided though it may still validate.
     * @reference https://json-schema.org/understanding-json-schema/reference/generic#annotations (see deprecated)
     */
    deprecated?: Or.Undefined<boolean>;

    /**
     * @description If true, the value is read-only (should appear in responses but not be sent in requests).
     * @reference https://json-schema.org/understanding-json-schema/reference/generic#annotations (see readOnly)
     */
    readOnly?: Or.Undefined<boolean>;

    /**
     * @description If true, the value is write-only (should be provided in requests but not returned in responses).
     * @reference https://json-schema.org/understanding-json-schema/reference/generic#annotations (see writeOnly)
     */
    writeOnly?: Or.Undefined<boolean>;

    /**
     * @description If true, indicates the value can be null in addition to its specified type.
     * @reference https://json-schema.org/draft/2020-12/json-schema-validation.html#nullable (OpenAPI extension for nullability)
     */
    nullable?: Or.Undefined<boolean>;

    /**
     * @description Sample example values illustrating instances of this schema.
     * @reference https://json-schema.org/understanding-json-schema/reference/generic#annotations (see examples)
     */
    examples?: Or.Undefined<ReadonlyArray<unknown>>;

    /**
     * @description A hint for the data format of the value (e.g., "email", "date-time"). Non-binding annotation for tooling.
     * @reference https://json-schema.org/understanding-json-schema/reference/string#format
     */
    format?: Or.Undefined<string>;

    /**
     * @description For string content, a hint describing the media (MIME) type of the data the string contains.
     * @reference https://json-schema.org/understanding-json-schema/reference/string#contentMediaType
     */
    contentMediaType?: Or.Undefined<string>;

    /**
     * @description For string content, specifies the encoding (e.g., "base64") of the content.
     * @reference https://json-schema.org/understanding-json-schema/reference/string#contentEncoding
     */
    contentEncoding?: Or.Undefined<string>;
    /**
     * @description A schema that the decoded content of a string must adhere to (used with contentMediaType for strings containing structured data).
     * @reference https://json-schema.org/understanding-json-schema/reference/string#contentSchema
     */
    contentSchema?: Or.Undefined<JsonSchema.Type>;

    /**
     * Non-standard JSON Schema extension.
     * Defines the order of properties in the object.
     * The unmentioned properties are placed at the end.
     *
     * Related: https://github.com/json-schema/json-schema/issues/119
     */
    propertyOrder?: Or.Undefined<ReadonlyArray<string>>;

    currency?: Or.Undefined<string>;
    reference?: Or.Undefined<{
      readonly schema: JsonSchema.Type;
      readonly schemaVersion?: Or.Undefined<string>;
      readonly schemaObject?: Or.Undefined<string>;
    }>;
  };

  export type Encoded = Omit<JsonSchema.Type, "pattern"> & {
    pattern?: Or.Undefined<string>;
  };
}
type JsonSchemaSchemaType = S.Schema<JsonSchema.Type, JsonSchema.Encoded, never>;

export class JsonSchema extends Struct(
  {
    $schema: S.optional($Schema).annotations({
      title: "JsonSchema version",
      description: "Declares which JSON Schema specification (dialect) this schema conforms to.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/schema",
    }),
    $id: S.optional(S.String).annotations({
      title: "Schema ID ($id)",
      description: "URI identifier for the schema; establishes the base URI for $ref resolution.",
      documentation: "https://json-schema.org/understanding-json-schema/structuring#id",
    }),
    $anchor: S.optional(S.String).annotations({
      title: "Anchor ($anchor)",
      description: "Defines a named anchor for referencing this location via a URI fragment.",
      documentation: "https://json-schema.org/understanding-json-schema/structuring#anchor",
    }),
    $ref: S.optional(S.String).annotations({
      title: "Reference ($ref)",
      description: "References another schema by URI; the instance must validate against the referenced schema.",
      documentation: "https://json-schema.org/understanding-json-schema/structuring#dollarref",
    }),
    $dynamicRef: S.optional(S.String).annotations({
      title: "Dynamic Reference ($dynamicRef)",
      description:
        "A dynamically-resolved reference used with $dynamicAnchor to support recursive/overridable targets.",
      documentation: "https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.3.2",
    }),
    $dynamicAnchor: S.optional(S.String).annotations({
      title: "Dynamic Anchor ($dynamicAnchor)",
      description: "Declares a dynamic anchor name that $dynamicRef can resolve to at runtime.",
      documentation: "https://json-schema.org/draft/2020-12/json-schema-core#section-8.2.3.2",
    }),
    $vocabulary: S.optional(S.Record({ key: S.String, value: S.Boolean })).annotations({
      title: "Vocabulary ($vocabulary)",
      description: "Declares vocabularies (keyword sets) available in this meta‑schema.",
      documentation: "https://json-schema.org/draft/2020-12/json-schema-core#section-8.1.2",
    }),
    $comment: S.optional(S.String).annotations({
      title: "Comment ($comment)",
      description: "Free‑form comment for maintainers; has no effect on validation.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/comments#comments",
    }),
    $defs: S.optional(
      S.Record({
        key: S.String,
        value: S.suspend((): JsonSchemaSchemaType => JsonSchema),
      })
    ).annotations({
      title: "Definitions ($defs)",
      description: "Reusable subschemas defined locally and referenceable via $ref.",
      documentation: "https://json-schema.org/understanding-json-schema/structuring#defs",
    }),
    type: S.optional($JsonType).annotations({
      title: "Instance type",
      description: "Declares the expected JSON type for the instance.",
      documentation: "https://json-schema.org/understanding-json-schema/basics#the-type-keyword",
    }),
    additionalItems: S.optional(_JsonSchema).annotations({
      title: "Additional items",
      description: "(Draft 4–7) Schema for array items beyond tuple definitions; false disallows extras.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/array#additionalItems",
    }),
    unevaluatedItems: S.optional(_JsonSchema).annotations({
      title: "Unevaluated items",
      description: "Schema applied to array items not validated by items/prefixItems/contains.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/array#unevaluatedItems",
    }),
    prefixItems: S.optional(S.Array(_JsonSchema)).annotations({
      title: "Tuple item schemas (prefixItems)",
      description: "Array of schemas for tuple validation; each index has its own schema.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/array#prefixItems",
    }),
    items: S.optional(S.Union(_JsonSchema, S.Array(_JsonSchema))).annotations({
      title: "Items",
      description: "Schema for array elements (single schema) or per‑index (array, legacy drafts).",
      documentation: "https://json-schema.org/understanding-json-schema/reference/array#items",
    }),
    contains: S.optional(S.suspend((): JsonSchemaSchemaType => JsonSchema)).annotations({
      title: "Contains",
      description: "Requires at least one array element to match the given schema.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/array#contains",
    }),
    additionalProperties: S.optional(_JsonSchema).annotations({
      title: "Additional properties",
      description: "Schema for object properties not matched by properties/patternProperties; false disallows extras.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/object#additionalProperties",
    }),
    unevaluatedProperties: S.optional(_JsonSchema).annotations({
      title: "Unevaluated properties",
      description: "Schema for properties not already validated by other keywords/subschemas.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/object#unevaluatedProperties",
    }),
    properties: S.optional(
      S.Record({
        key: S.NonEmptyString,
        value: _JsonSchema,
      })
    ).annotations({
      title: "Properties",
      description: "Schemas for specifically named properties of an object.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/object#properties",
    }),
    patternProperties: S.optional(
      S.Record({
        key: S.NonEmptyString,
        value: _JsonSchema,
      })
    ).annotations({
      title: "Pattern properties",
      description: "Schemas keyed by regex strings; any matching property name is validated by the schema.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/object#patternProperties",
    }),
    propertyNames: S.optional(S.suspend((): JsonSchemaSchemaType => JsonSchema)).annotations({
      title: "Property names",
      description: "Schema applied to all property names of an object.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/object#propertyNames",
    }),
    if: S.optional(S.suspend((): JsonSchemaSchemaType => JsonSchema)).annotations({
      title: "If",
      description: "Conditional: when the instance matches this schema, then must also apply.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/conditionals#ifthenelse",
    }),
    then: S.optional(S.suspend((): JsonSchemaSchemaType => JsonSchema)).annotations({
      title: "Then",
      description: "Schema that must apply when the 'if' schema is valid for the instance.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/conditionals#ifthenelse",
    }),
    else: S.optional(S.suspend((): JsonSchemaSchemaType => JsonSchema)).annotations({
      title: "Else",
      description: "Schema that must apply when the 'if' schema is NOT valid for the instance.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/conditionals#ifthenelse",
    }),
    allOf: S.optional(S.Array(S.suspend((): JsonSchemaSchemaType => JsonSchema))).annotations({
      title: "allOf",
      description: "Logical AND: the instance must be valid against all subschemas.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/combining#allOf",
    }),
    anyOf: S.optional(S.Array(S.suspend((): JsonSchemaSchemaType => JsonSchema))).annotations({
      title: "anyOf",
      description: "Logical OR: the instance must be valid against at least one subschema.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/combining#anyOf",
    }),
    oneOf: S.optional(S.Array(S.suspend((): JsonSchemaSchemaType => JsonSchema))).annotations({
      title: "oneOf",
      description: "Exclusive OR: the instance must be valid against exactly one subschema.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/combining#oneOf",
    }),
    not: S.optional(S.suspend((): JsonSchemaSchemaType => JsonSchema)).annotations({
      title: "not",
      description: "Negation: the instance is valid only if it fails validation against this schema.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/combining#not",
    }),
    multipleOf: S.optional(S.Number).annotations({
      title: "multipleOf",
      description: "Numeric value must be a multiple of the given number.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/numeric#multiples",
    }),
    maximum: S.optional(S.Number).annotations({
      title: "maximum",
      description: "Inclusive upper bound for numeric values.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/numeric#range",
    }),
    exclusiveMaximum: S.optional(S.Union(S.Number, S.Boolean)).annotations({
      title: "exclusiveMaximum",
      description: "Exclusive upper bound for numeric values (or boolean in Draft‑04 to make maximum exclusive).",
      documentation: "https://json-schema.org/understanding-json-schema/reference/numeric#range",
    }),
    minimum: S.optional(S.Number).annotations({
      title: "minimum",
      description: "Inclusive lower bound for numeric values.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/numeric#range",
    }),
    exclusiveMinimum: S.optional(S.Union(S.Number, S.Boolean)).annotations({
      title: "exclusiveMinimum",
      description: "Exclusive lower bound for numeric values (or boolean in Draft‑04 to make minimum exclusive).",
      documentation: "https://json-schema.org/understanding-json-schema/reference/numeric#range",
    }),
    maxLength: S.optional(S.Number).annotations({
      title: "maxLength",
      description: "Maximum string length in characters.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/string#length",
    }),
    minLength: S.optional(S.Number).annotations({
      title: "minLength",
      description: "Minimum string length in characters.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/string#length",
    }),
    pattern: S.optional(RegexFromString).annotations({
      title: "pattern",
      description: "Regular expression the string must match.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/string#pattern",
    }),
    maxItems: S.optional(S.NonNegativeInt).annotations({
      title: "maxItems",
      description: "Maximum number of items allowed in an array.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/array#length",
    }),
    minItems: S.optional(S.NonNegativeInt).annotations({
      title: "minItems",
      description: "Minimum number of items required in an array.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/array#length",
    }),
    uniqueItems: S.optional(S.Boolean).annotations({
      title: "uniqueItems",
      description: "If true, all items in the array must be unique.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/array#uniqueness",
    }),
    maxContains: S.optional(S.NonNegativeInt).annotations({
      title: "maxContains",
      description: "Upper bound on the number of array items that may match 'contains'.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/array#contains",
    }),
    minContains: S.optional(S.NonNegativeInt).annotations({
      title: "minContains",
      description: "Lower bound on the number of array items that must match 'contains'.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/array#contains",
    }),
    maxProperties: S.optional(S.NonNegativeInt).annotations({
      title: "maxProperties",
      description: "Maximum number of properties an object may have.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/object#properties",
    }),
    minProperties: S.optional(S.NonNegativeInt).annotations({
      title: "minProperties",
      description: "Minimum number of properties an object must have.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/object#properties",
    }),
    required: S.optional(S.Array(S.NonEmptyString)).annotations({
      title: "required",
      description: "Property names that must be present in the object.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/object#required-properties",
    }),
    dependentRequired: S.optional(S.Record({ key: S.NonEmptyString, value: S.Array(S.String) })).annotations({
      title: "dependentRequired",
      description: "Property dependencies: when a property is present, these other properties are also required.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/conditionals#dependentRequired",
    }),
    enum: S.optional(S.Array(S.Union(S.String, S.Number, S.Boolean, S.Null))).annotations({
      title: "enum",
      description: "Set of allowed literal values; the instance must match one of them exactly.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/generic#enumerated-values",
    }),
    const: S.optional(S.Union(S.String, S.Number, S.Boolean, S.Null)).annotations({
      title: "const",
      description: "Requires the instance to be exactly this constant value.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/generic#constant-values",
    }),

    // metadata
    id: S.optional(S.String).annotations({
      title: "id (Draft‑04)",
      description: "Legacy schema identifier (superseded by $id in newer drafts).",
      documentation: "https://json-schema.org/understanding-json-schema/basics#declaring-a-unique-identifier",
    }),
    title: S.optional(S.String).annotations({
      title: "title",
      description: "A short, human‑readable title for the schema.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/generic#annotations",
    }),
    description: S.optional(S.String).annotations({
      title: "description",
      description: "Describes the purpose or usage of the schema.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/generic#annotations",
    }),
    default: S.optional(S.Unknown).annotations({
      title: "default",
      description: "A default value that tools may use if an instance value is not provided.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/generic#annotations",
    }),
    deprecated: S.optional(S.Boolean).annotations({
      title: "deprecated",
      description: "Marks the field as deprecated; it may still validate but should be avoided.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/generic#annotations",
    }),
    readOnly: S.optional(S.Boolean).annotations({
      title: "readOnly",
      description: "Value is read‑only (should appear in responses, not in requests).",
      documentation: "https://json-schema.org/understanding-json-schema/reference/generic#annotations",
    }),
    writeOnly: S.optional(S.Boolean).annotations({
      title: "writeOnly",
      description: "Value is write‑only (should be provided in requests, not returned in responses).",
      documentation: "https://json-schema.org/understanding-json-schema/reference/generic#annotations",
    }),
    nullable: S.optional(S.Boolean).annotations({
      title: "nullable (extension)",
      description: "Indicates the value can be null in addition to its specified type (OpenAPI extension).",
      documentation: "https://json-schema.org/draft/2020-12/json-schema-validation.html#nullable",
    }),
    examples: S.optional(S.Array(S.Unknown)).annotations({
      title: "examples",
      description: "Example instance values illustrating how this schema may be used.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/generic#annotations",
    }),
    format: S.optional(S.String).annotations({
      title: "format",
      description: "Semantic string format hint (e.g., email, date-time); non‑binding.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/string#format",
    }),
    contentMediaType: S.optional(S.String).annotations({
      title: "contentMediaType",
      description: "MIME type describing the media contained in a string value.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/string#contentMediaType",
    }),
    contentEncoding: S.optional(S.String).annotations({
      title: "contentEncoding",
      description: "Encoding (e.g., base64) of the content stored in a string.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/string#contentEncoding",
    }),
    contentSchema: S.optional(
      S.suspend((): S.Schema<JsonSchema.Type, JsonSchema.Encoded, never> => JsonSchema)
    ).annotations({
      title: "contentSchema",
      description: "Schema that the decoded string content must conform to.",
      documentation: "https://json-schema.org/understanding-json-schema/reference/string#contentSchema",
    }),

    propertyOrder: S.optional(S.Array(S.String)).annotations({
      title: "propertyOrder (non‑standard)",
      description:
        "Non-standard JSON Schema extension. \n Defines the order of properties in the object. \n The unmentioned properties are placed at the end.",
      documentation: "https://github.com/json-schema/json-schema/issues/119",
    }),
    reference: S.optional(
      S.Struct({
        schema: S.suspend((): JsonSchemaSchemaType => JsonSchema),
        schemaVersion: S.optional(S.String),
        schemaObject: S.optional(S.String),
      })
    ),
  },
  S.Record({
    key: S.NonEmptyString,
    value: S.Unknown,
  })
) {
  static readonly getProperty = (schema: JsonSchema.Type, property: JsonProp.Type) => schema.properties?.[property];

  static readonly go = (schema: JsonSchema.Type) => {
    if (typeof schema !== "object" || schema === null) {
      return;
    }

    if ((schema as UnsafeTypes.UnsafeAny).exclusiveMaximum === true) {
      schema.exclusiveMaximum = schema.maximum;
      delete (schema as UnsafeTypes.UnsafeAny).exclusiveMaximum;
    } else if ((schema as UnsafeTypes.UnsafeAny).exclusiveMaximum === false) {
      delete (schema as UnsafeTypes.UnsafeAny).exclusiveMaximum;
    }

    if ((schema as UnsafeTypes.UnsafeAny).exclusiveMinimum === true) {
      schema.exclusiveMinimum = schema.minimum;
      delete (schema as UnsafeTypes.UnsafeAny).exclusiveMinimum;
    } else if ((schema as UnsafeTypes.UnsafeAny).exclusiveMinimum === false) {
      delete (schema as UnsafeTypes.UnsafeAny).exclusiveMinimum;
    }

    // Delete all properties that are not in the JsonSchemaFields.
    for (const key of Object.keys(schema)) {
      if (!Object.keys(JsonSchema.fields).includes(key)) {
        delete (schema as UnsafeTypes.UnsafeAny)[key];
      }
    }

    // Recursively normalize the schema.
    // Recursively normalize the schema.
    if (schema.properties) {
      JsonSchema.goOnRecord(schema.properties);
    }
    if (schema.patternProperties) {
      JsonSchema.goOnRecord(schema.patternProperties);
    }
    if (schema.propertyNames) {
      JsonSchema.go(schema.propertyNames);
    }
    if (schema.definitions) {
      JsonSchema.goOnRecord(schema.definitions);
    }
    if (schema.items) {
      JsonSchema.maybeGoOnArray(schema.items);
    }
    if (schema.additionalItems) {
      JsonSchema.maybeGoOnArray(schema.additionalItems);
    }
    if (schema.contains) {
      JsonSchema.go(schema.contains);
    }
    if (schema.if) {
      JsonSchema.go(schema.if);
    }
    if (schema.then) {
      JsonSchema.go(schema.then);
    }
    if (schema.else) {
      JsonSchema.go(schema.else);
    }
    if (schema.allOf) {
      JsonSchema.maybeGoOnArray(schema.allOf);
    }
    if (schema.anyOf) {
      JsonSchema.maybeGoOnArray(schema.anyOf);
    }
    if (schema.oneOf) {
      JsonSchema.maybeGoOnArray(schema.oneOf);
    }
    if (schema.not) {
      JsonSchema.go(schema.not);
    }
    if (schema.$defs) {
      JsonSchema.goOnRecord(schema.$defs);
    }
    if (schema.reference) {
      JsonSchema.go(schema.reference.schema);
    }
  };

  static readonly maybeGoOnArray = (value: UnsafeTypes.UnsafeAny) => {
    if (Array.isArray(value)) {
      for (const item of value) {
        JsonSchema.go(item);
      }
    } else if (typeof value === "object" && value !== null) {
      JsonSchema.go(value);
    }
  };

  static readonly goOnRecord = (record: Record<string, UnsafeTypes.UnsafeAny>) => {
    for (const key of Object.keys(record)) {
      JsonSchema.go(record[key]);
    }
  };

  static readonly normalize = (schema: JsonSchema.Type): JsonSchema.Type => {
    const copy = structuredClone(schema);
    JsonSchema.go(copy);
    return copy;
  };
}

export class ObjectSchema extends Struct({
  ...JsonSchema.fields,
  type: LiteralDefaults("array")("array"),
}) {}

export declare namespace ObjectSchema {
  export interface Type extends JsonSchema.Type {
    type: "object";
  }

  export interface Encoded extends JsonSchema.Encoded {
    type?: Or.Undefined<"object">;
  }
}

export class ArraySchema extends Struct({
  ...JsonSchema.fields,
  type: LiteralDefaults("array")("array"),
}) {}

export declare namespace ArraySchema {
  export interface Type extends JsonSchema.Type {
    type: "array";
  }

  export interface Encoded extends JsonSchema.Encoded {
    type?: Or.Undefined<"array">;
  }
}

export class StringSchema extends Struct({
  ...JsonSchema.fields,
  type: LiteralDefaults("string")("string"),
}) {}

export declare namespace StringSchema {
  export interface Type extends JsonSchema.Type {
    type: "string";
  }

  export interface Encoded extends JsonSchema.Encoded {
    type?: Or.Undefined<"string">;
  }
}

export class NumberSchema extends Struct({
  ...JsonSchema.fields,
  type: LiteralDefaults("number")("number"),
}) {}

export declare namespace NumberSchema {
  export interface Type extends JsonSchema.Type {
    type: "number";
  }

  export interface Encoded extends JsonSchema.Encoded {
    type?: Or.Undefined<"number">;
  }
}

export class IntegerSchema extends Struct({
  ...JsonSchema.fields,
  type: LiteralDefaults("integer")("integer"),
}) {}

export declare namespace IntegerSchema {
  export interface Type extends JsonSchema.Type {
    type: "integer";
  }

  export interface Encoded extends JsonSchema.Encoded {
    type?: Or.Undefined<"integer">;
  }
}

export class BooleanSchema extends Struct({
  ...JsonSchema.fields,
  type: LiteralDefaults("boolean")("boolean"),
}) {}

export declare namespace BooleanSchema {
  export interface Type extends JsonSchema.Type {
    type: "boolean";
  }

  export interface Encoded extends JsonSchema.Encoded {
    type?: Or.Undefined<"boolean">;
  }
}

export class NullSchema extends Struct({
  ...JsonSchema.fields,
  type: LiteralDefaults("null")("null"),
}) {}

export declare namespace NullSchema {
  export interface Type extends JsonSchema.Type {
    type: "null";
  }

  export interface Encoded extends JsonSchema.Encoded {
    type?: Or.Undefined<"null">;
  }
}
