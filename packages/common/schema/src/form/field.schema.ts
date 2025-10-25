import { stringLiteralKit } from "@beep/schema/kits";
import * as S from "effect/Schema";

export const FormFieldTypeKit = stringLiteralKit("object", "string", "number", "integer", "boolean", "array", "null");

export class FormFieldType extends FormFieldTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/form/FormFieldType"),
  identifier: "FormFieldType",
  title: "Form Field Type",
  description: "The type of the form field.",
}) {
  static readonly Options = FormFieldTypeKit.Options;
  static readonly Enum = FormFieldTypeKit.Enum;
}

export declare namespace FormFieldType {
  export type Type = typeof FormFieldType.Type;
  export type Encoded = typeof FormFieldType.Encoded;
}

export const FormFieldFormatKit = stringLiteralKit("email", "date", "time", "date-time", "uri", "uuid");

export class FormFieldFormat extends FormFieldFormatKit.Schema.annotations({
  schemaId: Symbol.for("@beep/schema/form/FormFieldFormat"),
  identifier: "FormFieldFormat",
  title: "Form Field Format",
  description: "The format of the form field.",
}) {
  static readonly Options = FormFieldFormatKit.Options;
  static readonly Enum = FormFieldFormatKit.Enum;
}

export declare namespace FormFieldFormat {
  export type Type = typeof FormFieldFormat.Type;
  export type Encoded = typeof FormFieldFormat.Encoded;
}

export type FormFieldSchema = {
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
};

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
});
