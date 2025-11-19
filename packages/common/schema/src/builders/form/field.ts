/**
 * JSON Schema form field helpers including literal kits and a sanitized `FormFieldSchema`.
 *
 * Mirrors the schema-v1 builders so kit clients can reuse enums, types, and validation when constructing dynamic forms.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FormFieldSchema } from "@beep/schema/builders/form/field";
 *
 * const parse = S.decodeSync(FormFieldSchema);
 * const schema = parse({ type: "string", title: "Name" });
 *
 * @category Builders/Form
 * @since 0.1.0
 */
import { StringLiteralKit } from "@beep/schema/derived/kits/string-literal-kit";
import * as S from "effect/Schema";
import { Id } from "./_id";
/**
 * Schema capturing JSON Schema primitive types.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FormFieldType } from "@beep/schema/builders/form/field";
 *
 * const kind = S.decodeSync(FormFieldType)("string");
 *
 * @category Builders/Form
 * @since 0.1.0
 */
export class FormFieldType extends StringLiteralKit("object", "string", "number", "integer", "boolean", "array", "null").annotations(
  Id.annotations("FormFieldType", {
    description: "JSON Schema field type literal.",
  })
) {
}

/**
 * Helper namespace for {@link FormFieldType}.
 *
 * @example
 * import type { FormFieldType } from "@beep/schema/builders/form/field";
 *
 * let type: FormFieldType.Type;
 *
 * @category Builders/Form
 * @since 0.1.0
 */
export declare namespace FormFieldType {
  /**
   * Runtime type for {@link FormFieldType}.
   *
   * @example
   * import type { FormFieldType } from "@beep/schema/builders/form/field";
   *
   * let type: FormFieldType.Type;
   *
   * @category Builders/Form
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof FormFieldType>;
  /**
   * Encoded literal representation accepted by {@link FormFieldType}.
   *
   * @example
   * import type { FormFieldType } from "@beep/schema/builders/form/field";
   *
   * let encoded: FormFieldType.Encoded;
   *
   * @category Builders/Form
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof FormFieldType>;
}

/**
 * Literal kit covering JSON Schema string formats used by forms.
 *
 * @example
 * import { FormFieldFormatKit } from "@beep/schema/builders/form/field";
 *
 * const formats = FormFieldFormatKit.Options;
 *
 * @category Builders/Form
 * @since 0.1.0
 */
export const FormFieldFormatKit = StringLiteralKit("email", "date", "time", "date-time", "uri", "uuid");

/**
 * Schema capturing allowable JSON Schema string formats.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FormFieldFormat } from "@beep/schema/builders/form/field";
 *
 * const format = S.decodeSync(FormFieldFormat)("uuid");
 *
 * @category Builders/Form
 * @since 0.1.0
 */
export class FormFieldFormat extends StringLiteralKit("email", "date", "time", "date-time", "uri", "uuid").annotations(
  Id.annotations("FormFieldFormat", {
    description: "JSON Schema field format literal.",
  })
) {
}

/**
 * Helper namespace for {@link FormFieldFormat}.
 *
 * @example
 * import type { FormFieldFormat } from "@beep/schema/builders/form/field";
 *
 * let format: FormFieldFormat.Type;
 *
 * @category Builders/Form
 * @since 0.1.0
 */
export declare namespace FormFieldFormat {
  /**
   * Runtime type for {@link FormFieldFormat}.
   *
   * @example
   * import type { FormFieldFormat } from "@beep/schema/builders/form/field";
   *
   * let format: FormFieldFormat.Type;
   *
   * @category Builders/Form
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof FormFieldFormat>;
  /**
   * Encoded literal representation accepted by {@link FormFieldFormat}.
   *
   * @example
   * import type { FormFieldFormat } from "@beep/schema/builders/form/field";
   *
   * let encoded: FormFieldFormat.Encoded;
   *
   * @category Builders/Form
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof FormFieldFormat>;
}

/**
 * JSON Schema fragment describing a single form field.
 *
 * @example
 * import type { FormFieldSchema } from "@beep/schema/builders/form/field";
 *
 * const field: FormFieldSchema = { type: "string", title: "Name" };
 *
 * @category Builders/Form
 * @since 0.1.0
 */
export interface FormFieldSchema {
  readonly type?: FormFieldType.Type | undefined;
  readonly title?: string | undefined;
  readonly description?: string | undefined;
  readonly default?: unknown | undefined;
  readonly minLength?: number | undefined;
  readonly maxLength?: number | undefined;
  readonly pattern?: string | undefined;
  readonly format?: FormFieldFormat.Type | string | undefined;
  readonly minimum?: number | undefined;
  readonly maximum?: number | undefined;
  readonly exclusiveMinimum?: number | undefined;
  readonly exclusiveMaximum?: number | undefined;
  readonly multipleOf?: number | undefined;
  readonly items?: unknown | undefined;
  readonly minItems?: number | undefined;
  readonly maxItems?: number | undefined;
  readonly uniqueItems?: boolean | undefined;
  readonly properties?: Record<string, object> | undefined;
  readonly required?: ReadonlyArray<string> | undefined;
  readonly additionalProperties?: boolean | object | undefined;
  readonly enum?: ReadonlyArray<unknown> | undefined;
  readonly const?: unknown | undefined;
  readonly allOf?: ReadonlyArray<object> | undefined;
  readonly anyOf?: ReadonlyArray<object> | undefined;
  readonly oneOf?: ReadonlyArray<object> | undefined;
  readonly not?: object | undefined;
  readonly if?: object | undefined;
  readonly then?: object | undefined;
  readonly else?: object | undefined;
  readonly readOnly?: boolean | undefined;
  readonly writeOnly?: boolean | undefined;
}

/**
 * Schema validating {@link FormFieldSchema} objects produced for JSON forms.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FormFieldSchema } from "@beep/schema/builders/form/field";
 *
 * const parse = S.decodeSync(FormFieldSchema);
 * parse({ type: "string", title: "Status" });
 *
 * @category Builders/Form
 * @since 0.1.0
 */
export const FormFieldSchema = S.Struct({
  type: S.optional(FormFieldType),
  title: S.optional(S.String),
  description: S.optional(S.String),
  default: S.optional(S.Unknown),

  // String
  minLength: S.optional(S.Number),
  maxLength: S.optional(S.Number),
  pattern: S.optional(S.String),
  format: S.optional(S.Union(FormFieldFormat, S.String)),

  // Number
  minimum: S.optional(S.Number),
  maximum: S.optional(S.Number),
  exclusiveMinimum: S.optional(S.Number),
  exclusiveMaximum: S.optional(S.Number),
  multipleOf: S.optional(S.Number),

  // Array
  items: S.optional(S.Unknown),
  minItems: S.optional(S.Number),
  maxItems: S.optional(S.Number),
  uniqueItems: S.optional(S.Boolean),

  // Object
  properties: S.optional(
    S.Record({
      key: S.String,
      value: S.Object,
    })
  ),
  required: S.optional(S.Array(S.String)),
  additionalProperties: S.optional(S.Union(S.Boolean, S.Object)),

  // Validation
  enum: S.optional(S.Array(S.Unknown)),
  const: S.optional(S.Unknown),

  // Composition
  allOf: S.optional(S.Array(S.Object)),
  anyOf: S.optional(S.Array(S.Object)),
  oneOf: S.optional(S.Array(S.Object)),
  not: S.optional(S.Object),

  // Conditional
  if: S.optional(S.Object),
  then: S.optional(S.Object),
  else: S.optional(S.Object),

  // UI
  readOnly: S.optional(S.Boolean),
  writeOnly: S.optional(S.Boolean),
}).annotations(
  Id.annotations("FormFieldSchema", {
    description: "JSON Schema definition for a single form field.",
  })
);

/**
 * Helper namespace exposing runtime and encoded types for {@link FormFieldSchema}.
 *
 * @example
 * import type { FormFieldSchema } from "@beep/schema/builders/form/field";
 *
 * let field: FormFieldSchema.Type;
 *
 * @category Builders/Form
 * @since 0.1.0
 */
export declare namespace FormFieldSchema {
  /**
   * Runtime type for {@link FormFieldSchema}.
   *
   * @example
   * import type { FormFieldSchema } from "@beep/schema/builders/form/field";
   *
   * let field: FormFieldSchema.Type;
   *
   * @category Builders/Form
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof FormFieldSchema>;
  /**
   * Encoded representation accepted by {@link FormFieldSchema}.
   *
   * @example
   * import type { FormFieldSchema } from "@beep/schema/builders/form/field";
   *
   * let encoded: FormFieldSchema.Encoded;
   *
   * @category Builders/Form
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof FormFieldSchema>;
}
