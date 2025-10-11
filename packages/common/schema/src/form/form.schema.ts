import { FormFieldSchema } from "@beep/schema/form/field.schema";
import * as S from "effect/Schema";
/**
 * A schema for validating JSON Schema objects using AJV.
 * Validates that an object conforms to the JSON Schema specification.
 *
 * @category schema
 */
export const FormJsonSchema = S.parseJson(
  S.Struct({
    type: S.Literal("object"),
    properties: S.Record({
      key: S.String,
      value: FormFieldSchema,
    }),
    title: S.optional(S.String),
    description: S.optional(S.String),
    required: S.optional(S.Array(S.String)),

    minProperties: S.optional(S.Number),
    maxProperties: S.optional(S.Number),

    $schema: S.optional(S.String),
    $id: S.optional(S.String),
    definitions: S.optional(
      S.Record({
        key: S.String,
        value: FormFieldSchema,
      })
    ),
  })
).annotations({
  identifier: "FormJsonSchema",
});
export type FormJsonSchema = typeof FormJsonSchema.Type;
