import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const BaseCustomFieldSchema = S.Struct({
  name: S.String.annotations({
    description: "The name of the custom field",
  }),
  source: S.Union(S.Literal("pco", "ccb", "internal"), S.String, S.Undefined).annotations({
    description: "The source of the custom field",
  }),
});
type BaseCustomFieldSchema = typeof BaseCustomFieldSchema.Type;

export const StringFieldSchema = BaseCustomFieldSchema.pipe(
  S.extend(
    S.TaggedStruct("string", {
      value: S.String.annotations({
        description: "The value of the custom field",
      }).pipe(S.NullishOr),
    })
  )
);
export type StringFieldSchema = typeof StringFieldSchema.Type;

export const NumberFieldSchema = BaseCustomFieldSchema.pipe(
  S.extend(
    S.TaggedStruct("number", {
      value: S.Number.annotations({
        description: "The value of the custom field",
      }).pipe(S.NullishOr),
    })
  )
);
export type NumberFieldSchema = typeof NumberFieldSchema.Type;

export const BooleanFieldSchema = BaseCustomFieldSchema.pipe(
  S.extend(
    S.TaggedStruct("boolean", {
      value: S.Boolean.annotations({
        description: "The value of the custom field",
      }).pipe(S.NullishOr),
    })
  )
);
export type BooleanFieldSchema = typeof BooleanFieldSchema.Type;

export const DateFieldSchema = BaseCustomFieldSchema.pipe(
  S.extend(
    S.TaggedStruct("date", {
      value: S.String.annotations({
        description: "The value of the custom field as an ISO date string",
      }).pipe(S.optional),
    })
  )
);
export type DateFieldSchema = typeof DateFieldSchema.Type;

export const CustomFieldSchema = S.Union(StringFieldSchema, NumberFieldSchema, BooleanFieldSchema, DateFieldSchema);
export type CustomFieldSchema = typeof CustomFieldSchema.Type;

export const getCustomFieldValue = (customFields: Array<CustomFieldSchema>) => (fieldName: string) =>
  F.pipe(
    customFields,
    A.findFirst((x) => x.name === fieldName),
    O.flatMapNullable((x) => x.value)
  );

export const makeCustomField = <T extends "string" | "number" | "boolean">(
  type: T,
  name: string,
  value: T extends "string" ? string : T extends "number" ? number : T extends "boolean" ? boolean : null | undefined,
  source?: BaseCustomFieldSchema["source"]
): readonly ["customFields", CustomFieldSchema] => [
  "customFields",
  {
    _tag: type,
    name,
    source,
    value: F.pipe(value, O.fromNullable, O.getOrNull),
  } as CustomFieldSchema,
];
