/**
 * JSON Schema builder utilities for validating form documents.
 *
 * Parses a JSON string, validates a constrained schema subset, and exposes the inferred runtime type used by kit clients.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FormJsonSchema } from "@beep/schema/builders/form/form";
 *
 * const parse = S.decodeSync(FormJsonSchema);
 * const schema = parse(JSON.stringify({ type: "object", properties: {} }));
 *
 * @category Builders/Form
 * @since 0.1.0
 */

import * as S from "effect/Schema";
import { Id } from "./_id";
import { FormFieldSchema } from "./field";

/**
 * Schema validating JSON Schema documents consumed by the form builder.
 *
 * Parses a JSON string and ensures it matches a sanitized subset of the JSON Schema spec.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { FormJsonSchema } from "@beep/schema/builders/form/form";
 *
 * const parse = S.decodeSync(FormJsonSchema);
 * const schema = parse(JSON.stringify({ type: "object", properties: {} }));
 *
 * @category Builders/Form
 * @since 0.1.0
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
).annotations(
  Id.annotations("FormJsonSchema", {
    description: "JSON Schema validator used by the form builder.",
  })
);

/**
 * Runtime type inferred from {@link FormJsonSchema}.
 *
 * @example
 * import type { FormJsonSchema } from "@beep/schema/builders/form/form";
 *
 * let schema: FormJsonSchema;
 *
 * @category Builders/Form
 * @since 0.1.0
 */
export type FormJsonSchema = S.Schema.Type<typeof FormJsonSchema>;
