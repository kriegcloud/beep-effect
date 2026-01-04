/**
 * SQL integration helpers that bridge Effect Schema + VariantSchema ergonomics for Postgres models.
 *
 * Provides reusable field combinators for nullable columns, json/text columns, and timestamp defaults so application slices stay declarative.
 *
 * @example
 * import { FieldOptionOmittable } from "@beep/schema/integrations/sql/common";
 * import * as S from "effect/Schema";
 *
 * const status = FieldOptionOmittable(S.String);
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */

import {$SchemaId} from "@beep/identity/packages";
import type {DefaultAnnotations} from "@beep/schema/core/annotations/default";
import type {UnsafeTypes} from "@beep/types";
import type * as VariantSchema from "@effect/experimental/VariantSchema";
import * as M from "@effect/sql/Model";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $SchemaId.create("integrations/sql/common");

type Annotations<A, TypeParameters extends ReadonlyArray<UnsafeTypes.UnsafeAny> = readonly []> = Omit<
  DefaultAnnotations<A, TypeParameters>,
  "title" | "description"
> & {
  readonly title?: string;
  readonly description?: string;
};

const dateTimeJsonSchemaAnnotations = (
  annotations: Partial<Annotations<S.Schema.Type<typeof M.DateTimeFromDate>>> | undefined = {}
) =>
  ({
    jsonSchema: {
      type: "string",
      format: "datetime",
    },
    ...annotations,
  }) as const;

/**
 * Timestamp schema tuned for Postgres TIMESTAMPTZ with identity annotations.
 *
 * @example
 * import { DateTimeFromDate } from "@beep/schema/integrations/sql/common";
 *
 * const updatedAt = DateTimeFromDate();
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export const DateTimeFromDate = (annotations?: Annotations<S.Schema.Type<typeof M.DateTimeFromDate>>) => {
  const {title, description, ...rest} = annotations ?? {};
  const docAnnotations = dateTimeJsonSchemaAnnotations({
    ...rest,
    ...(title ? {title} : {}),
    ...(description ? {description} : {}),
  });
  return M.DateTimeFromDate.annotations(docAnnotations).annotations(
    $I.annotations("sql/DateTimeFromDate", {
      title: title ?? "SQL DateTime",
      description: description ?? "Timestamp value backed by PostgreSQL TIMESTAMPTZ.",
    })
  );
};

/**
 * PropertySignature type for optional fields with `as: "Option"`, `nullable: true`, and a constructor default.
 *
 * When `as: "Option"` is used, the Type becomes `Option<Schema.Type<S>>` (not `Schema.Type<S> | undefined`).
 * The TypeToken is ":" because `as: "Option"` makes the field required in the decoded type.
 * The HasDefault is `true` because we add `withConstructorDefault`.
 */
type OptionalWithOptionDefaultSchema<Schema extends S.Schema.Any> = S.PropertySignature<
  ":", // TypeToken - required in decoded type (Option wraps the optionality)
  O.Option<S.Schema.Type<Schema>>, // Type - Option<A>, not A | undefined
  never, // Key
  "?:", // EncodedToken - optional in encoded type
  S.Schema.Encoded<Schema> | null | undefined, // Encoded - nullable and optional
  true, // HasDefault - we add withConstructorDefault
  S.Schema.Context<Schema> // Context
>;

/**
 * Helper to create optionalWith PropertySignature with `as: "Option"`, `nullable: true`, and constructor default of `O.none()`.
 */
const optionalWithOptionDefault = <Schema extends S.Schema.Any>(
  schema: Schema
): OptionalWithOptionDefaultSchema<Schema> =>
  S.optionalWith(schema, {
    as: "Option",
    nullable: true,
    onNoneEncoding: () => O.some(null),
  }).pipe(S.withConstructorDefault(O.none)) as OptionalWithOptionDefaultSchema<Schema>;

export interface FieldOptionOmittable<Schema extends S.Schema.Any>
  extends VariantSchema.Field<{
    readonly select: S.OptionFromNullOr<Schema>;
    readonly insert: OptionalWithOptionDefaultSchema<Schema>;
    readonly update: OptionalWithOptionDefaultSchema<Schema>;
    readonly json: S.OptionFromNullOr<Schema>;
    readonly jsonCreate: OptionalWithOptionDefaultSchema<Schema>;
    readonly jsonUpdate: OptionalWithOptionDefaultSchema<Schema>;
  }> {
}

/**
 * Variant definition for nullable Option fields with automatic O.none() defaults in write variants.
 *
 * For `select` and `json` variants: fields are `Option<A>` (required, using `OptionFromNullOr`).
 * For `insert`, `update`, `jsonCreate`, `jsonUpdate` variants: fields are optional with constructor default of `O.none()`.
 *
 * This allows omitting optional fields when calling `.make()` on write variants:
 * @example
 * ```ts
 * // Before: Required O.none() for every optional field
 * User.Model.jsonCreate.make({
 *   email: "test@example.com",
 *   name: "Test",
 *   image: O.none(),
 *   phoneNumber: O.none(),
 *   // ... 10 more O.none() fields
 * });
 *
 * // After: Optional fields automatically default to O.none()
 * User.Model.jsonCreate.make({
 *   email: "test@example.com",
 *   name: "Test",
 *   // image, phoneNumber, etc. default to O.none()
 * });
 * ```
 */
export const FieldOptionOmittable = <Schema extends S.Schema.Any>(schema: Schema): FieldOptionOmittable<Schema> => M.Field({
  select: S.OptionFromNullOr(schema),
  insert: optionalWithOptionDefault(schema),
  update: optionalWithOptionDefault(schema),
  json: S.OptionFromNullOr(schema),
  jsonCreate: optionalWithOptionDefault(schema),
  jsonUpdate: optionalWithOptionDefault(schema),
});

/**
 * PropertySignature type for optional Redacted fields with `as: "Option"`, `nullable: true`, and a constructor default.
 */
type OptionalRedactedWithOptionDefaultSchema<Schema extends S.Schema.Any> = S.PropertySignature<
  ":", // TypeToken - required in decoded type (Option wraps optionality)
  O.Option<S.Schema.Type<S.Redacted<Schema>>>, // Type - Option<Redacted<A>>
  never, // Key
  "?:", // EncodedToken - optional in encoded type
  S.Schema.Encoded<Schema> | null | undefined, // Encoded - nullable and optional
  true, // HasDefault - we add withConstructorDefault
  S.Schema.Context<Schema> // Context
>;

/**
 * Helper to create optionalWith PropertySignature for Redacted schema with constructor default of `O.none()`.
 */
const optionalRedactedWithOptionDefault = <Schema extends S.Schema.Any>(
  schema: Schema
): OptionalRedactedWithOptionDefaultSchema<Schema> =>
  S.optionalWith(S.Redacted(schema), {
    as: "Option",
    nullable: true,
    onNoneEncoding: () => O.some(null),
  }).pipe(S.withConstructorDefault(O.none)) as OptionalRedactedWithOptionDefaultSchema<Schema>;

/**
 * Variant definition for sensitive Option fields that wrap the schema inside {@link S.Redacted}.
 * Write variants (`insert`, `update`, `jsonCreate`, `jsonUpdate`) default to `O.none()` when omitted.
 *
 * @example
 * import { FieldSensitiveOptionOmittable } from "@beep/schema/integrations/sql/common";
 * import * as S from "effect/Schema";
 *
 * type Field = FieldSensitiveOptionOmittable<typeof S.String>;
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export interface FieldSensitiveOptionOmittable<Schema extends S.Schema.Any>
  extends VariantSchema.Field<{
    readonly select: S.OptionFromNullOr<S.Redacted<Schema>>;
    readonly insert: OptionalRedactedWithOptionDefaultSchema<Schema>;
    readonly update: OptionalRedactedWithOptionDefaultSchema<Schema>;
    readonly json: S.OptionFromNullOr<S.Redacted<Schema>>;
    readonly jsonCreate: OptionalRedactedWithOptionDefaultSchema<Schema>;
    readonly jsonUpdate: OptionalRedactedWithOptionDefaultSchema<Schema>;
  }> {
}

/**
 * Helper providing {@link FieldSensitiveOptionOmittable} semantics for a schema.
 * Write variants automatically default to `O.none()` when omitted from `.make()` calls.
 *
 * @example
 * import { FieldSensitiveOptionOmittable } from "@beep/schema/integrations/sql/common";
 * import * as S from "effect/Schema";
 *
 * const field = FieldSensitiveOptionOmittable(S.String);
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export const FieldSensitiveOptionOmittable = <Schema extends S.Schema.Any>(
  schema: Schema
): FieldSensitiveOptionOmittable<Schema> => {

  return M.Field({
    select: S.OptionFromNullOr(S.Redacted(schema)),
    insert: optionalRedactedWithOptionDefault(schema),
    update: optionalRedactedWithOptionDefault(schema),
    json: S.OptionFromNullOr(S.Redacted(schema)),
    jsonCreate: optionalRedactedWithOptionDefault(schema),
    jsonUpdate: optionalRedactedWithOptionDefault(schema),
  });
};

/**
 * Nullable JSON field stored as TEXT in Postgres while surfacing Option semantics.
 * Write variants (`insert`, `update`, `jsonCreate`, `jsonUpdate`) default to `O.none()` when omitted.
 *
 * @example
 * import { JsonFromStringOption } from "@beep/schema/integrations/sql/common";
 * import * as S from "effect/Schema";
 *
 * const metadata = JsonFromStringOption(S.Struct({ foo: S.String }));
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export const JsonFromStringOption = <TSchema extends S.Schema.All>(schema: TSchema) => {

  return M.JsonFromString(schema).pipe(
    M.fieldEvolve({
      select: (variant) =>
        S.OptionFromNullOr(S.asSchema(variant)),
      insert: (variant) =>
        S.optionalWith(S.asSchema(variant), {
          as: "Option",
          nullable: true,
          onNoneEncoding: () => O.some(null),
        }).pipe(S.withConstructorDefault(O.none)),
      update: (variant) =>
        S.optionalWith(S.asSchema(variant), {
          as: "Option",
          nullable: true,
          onNoneEncoding: () => O.some(null),
        }).pipe(S.withConstructorDefault(O.none)),
      json: (variant) => S.OptionFromNullOr(S.asSchema(variant)),
      jsonCreate: (variant) =>
        S.optionalWith(S.asSchema(variant), {
          as: "Option",
          nullable: true,
          onNoneEncoding: () => O.some(null),
        }).pipe(S.withConstructorDefault(O.none)),
      jsonUpdate: (variant) =>
        S.optionalWith(S.asSchema(variant), {
          as: "Option",
          nullable: true,
          onNoneEncoding: () => O.some(null),
        }).pipe(S.withConstructorDefault(O.none)),
    })
  );
};
