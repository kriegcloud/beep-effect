import {StringLiteralKit} from "@beep/schema/derived/kits";
import type {Awaitable} from "@beep/types/promise.types";
import * as S from "effect/Schema";
import {$SchemaId} from "@beep/identity/packages";
import * as F from "effect/Function";
import {thunk} from "@beep/utils/thunk";
import {StandardSchema} from "@beep/schema/integrations/standard-schema";

const $I = $SchemaId.create("integrations/sql/dsl/types");

export class LiteralString extends S.Union(
  S.Literal(""),
  S.compose(S.String, S.Record({key: S.Never, value: S.Never}))
).annotations($I.annotations("LiteralString", {
  description: "A string that is either a literal or a string"
})) {

}

export declare namespace LiteralString {
  export type Type = typeof LiteralString.Type;
}

export const DbFieldArray = S.TemplateLiteral(
  `"`,
  S.Literal("string", "number"),
  `"`,
  `[]`
).annotations($I.annotations("DbFieldArray", {
  description: "The string literal representation of a database field array"
}));

export declare namespace DbFieldArray {
  export type Type = typeof DbFieldArray.Type;
}

export class DBFieldType extends S.Union(
  S.Literal("string", "number", "boolean", "date", "json"),
  DbFieldArray,
  S.Array(LiteralString)
).annotations($I.annotations("DBFieldType", {
  description: "The string literal representation of a database field type"
})) {
}

export declare namespace DBFieldType {
  export type Type = typeof DBFieldType.Type;
}


export class DBPrimitive extends S.Union(
  S.String,
  S.Number,
  S.Boolean,
  S.DateFromSelf,
  S.Null,
  S.Undefined,
  S.Array(S.String),
  S.Array(S.Number),
  S.Union(S.Record({key: S.String, value: S.Unknown}), S.Array(S.Unknown))
).annotations($I.annotations("DBPrimitive", {
  description: "The string literal representation of a database field type"
})) {
}

export declare namespace DBPrimitive {
  export type Type = typeof DBPrimitive.Type;
}

export class OnDeleteCascadeOption extends StringLiteralKit(
  "no action",
  "restrict",
  "cascade",
  "set null",
  "set default",
).annotations(
  $I.annotations("OnDeleteCascadeOption", {
    description: "The string literal representation of a database field type"
  })
) {
}

export declare namespace OnDeleteCascadeOption {
  export type Type = typeof OnDeleteCascadeOption.Type;
}

export class DBPrimitiveThunk extends S.declare(
  (i: unknown): i is (() => DBPrimitive.Type) => F.isFunction(i)
).annotations($I.annotations("DBPrimitiveThunk", {
  description: "A function that returns a database primitive"
})) {
}

export declare namespace DBPrimitiveThunk {
  export type Type = typeof DBPrimitiveThunk.Type;
}

export class DBPrimitiveTransformFn extends S.declare(
  (i: unknown): i is ((value: DBPrimitive.Type) => Awaitable<DBPrimitive.Type>) => F.isFunction(i)
).annotations(
  $I.annotations("DBPrimitiveTransformFn", {
    description: "A function that transforms a database primitive value to another primitive value, potentially asynchronously"
  })
) {
}

export declare namespace DBPrimitiveTransformFn {
  export type Type = typeof DBPrimitiveTransformFn.Type;
}

const OptionalBoolWithDefault = (defaultValue: boolean) => S.optionalWith(S.Boolean, {
  default: thunk(defaultValue),
  exact: true,
});

export class StandardSchemaValidator extends S.Class<StandardSchemaValidator>($I`StandardSchemaValidator`)({
  input: S.optionalWith(StandardSchema.Any, {exact: true}),
  output: S.optionalWith(StandardSchema.Any, {exact: true}),
}, $I.annotations("StandardSchemaValidator", {
  description: "A validator for standard schema"
})) {
}

export class DBFieldAttributeConfigReference extends S.Class<DBFieldAttributeConfigReference>($I`DBFieldAttributeConfigReference`)({
  model: S.String.annotations({description: "The model to reference."}),
  field: S.String.annotations({description: "The field on the referenced model."}),
  onDelete: S.optionalWith(OnDeleteCascadeOption, {exact: true}).annotations({
    description: "The action to perform when the reference is deleted.",
    default: "cascade",
  }),
}, $I.annotations("DBFieldAttributeConfigReference", {
  description: "A reference to a field attribute configuration.",
})) {
}

export class DBFieldAttributeConfigTransform extends S.Class<DBFieldAttributeConfigTransform>($I`DBFieldAttributeConfigTransform`)({
  input: S.optionalWith(DBPrimitiveTransformFn, {exact: true}),
  output: S.optionalWith(DBPrimitiveTransformFn, {exact: true}),
}, $I.annotations("DBFieldAttributeConfigTransform", {
  description: "A transform for a field attribute configuration.",
})) {
}

export class DBFieldAttributeConfig extends S.Class<DBFieldAttributeConfig>($I`DbFieldAttributeConfig`)({
  required: OptionalBoolWithDefault(true).annotations({
    description: "If the field should be required on a new record.",
    default: true,
  }),
  returned: OptionalBoolWithDefault(true).annotations({
    description: "If the value should be returned on a response body.",
    default: true,
  }),
  input: OptionalBoolWithDefault(true).annotations({
    description: "If a value should be provided when creating a new record.",
    default: true,
  }),
  defaultValue: S.optionalWith(S.Union(DBPrimitive, DBPrimitiveThunk), {
    exact: true,
  }).annotations({
    description: "Default value for the field. Note: This will not create a default value on the database level. It will only be used when creating a new record.",
  }),
  onUpdate: S.optionalWith(DBPrimitiveThunk, {
    exact: true,
  }).annotations({
    description: "Update value for the field. Note: This will create an onUpdate trigger on the database level for supported adapters. It will be called when updating a record.",
  }),
  transform: S.optionalWith(DBFieldAttributeConfigTransform, {
    exact: true,
  }).annotations({
    description: "Transform the value before storing it.",
  }),
  references: S.optionalWith(DBFieldAttributeConfigReference, {
    exact: true,
  }).annotations({
    description: "Reference to another model.",
  }),
  unique: OptionalBoolWithDefault(false).annotations({
    description: "If the field should be unique.",
    default: false,
  }),
  bigint: OptionalBoolWithDefault(false).annotations({
    description: "If the field should be a bigint on the database instead of integer.",
    default: false,
  }),
  validator: S.optionalWith(StandardSchemaValidator, {exact: true}).annotations({
    description: "Validator for the field.",
  }),
  fieldName: S.optionalWith(S.String, {exact: true}).annotations({
    description: "The name of the field.",
  }),
  sortable: OptionalBoolWithDefault(false).annotations({
    description: "If the field should be sortable. \n applicable only for `text` type. \n It's useful to mark fields varchar instead of text.",
    default: false,
  }),
  index: OptionalBoolWithDefault(false).annotations({
    description: "If the field should be indexed.",
    default: false,
  }),
}) {
}


export declare namespace DBFieldAttribute {
  export type Any<T extends DBFieldType.Type = DBFieldType.Type> = {
    type: T;
  } & DBFieldAttributeConfig;
}

