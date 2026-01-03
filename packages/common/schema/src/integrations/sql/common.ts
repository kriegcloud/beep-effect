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

import { $SchemaId } from "@beep/identity/packages";
import type { UnsafeTypes } from "@beep/types";
import type * as VariantSchema from "@effect/experimental/VariantSchema";
import * as M from "@effect/sql/Model";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import type * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import type { DefaultAnnotations } from "../../core/annotations/default";

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
  const { title, description, ...rest } = annotations ?? {};
  const docAnnotations = dateTimeJsonSchemaAnnotations({
    ...rest,
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
  });
  return M.DateTimeFromDate.annotations(docAnnotations).annotations(
    $I.annotations("sql/DateTimeFromDate", {
      title: title ?? "SQL DateTime",
      description: description ?? "Timestamp value backed by PostgreSQL TIMESTAMPTZ.",
    })
  );
};

export const DateTimeAllEncoded = S.Union(
  S.DateFromString,
  S.DateFromSelf,
  S.Date,
  S.DateFromNumber,
  S.ValidDateFromSelf,
  S.DateTimeUtc,
  S.DateTimeUtcFromDate,
  S.DateTimeUtcFromNumber,
  S.DateTimeUtcFromSelf
);

/**
 * Variant definition for nullable Option fields where create/update payloads can omit the key.
 *
 * @example
 * import { FieldOptionOmittable } from "@beep/schema/integrations/sql/common";
 * import * as S from "effect/Schema";
 *
 * type Field = FieldOptionOmittable<typeof S.String>;
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export interface FieldOptionOmittable<S extends S.Schema.Any>
  extends VariantSchema.Field<{
    readonly select: S.OptionFromNullOr<S>;
    readonly insert: S.optionalWith<S.OptionFromNullOr<S>, { default: () => O.Option<S.Schema.Type<S>> }>;
    readonly update: S.optionalWith<S.OptionFromNullOr<S>, { default: () => O.Option<S.Schema.Type<S>> }>;
    readonly json: S.OptionFromNullOr<S>;
    readonly jsonCreate: S.optionalWith<S.OptionFromNullOr<S>, { default: () => O.Option<S.Schema.Type<S>> }>;
    readonly jsonUpdate: S.optionalWith<S.OptionFromNullOr<S>, { default: () => O.Option<S.Schema.Type<S>> }>;
  }> {}

/**
 * Helper for nullable option fields across select/JSON variants with write omittability.
 *
 * @example
 * import { FieldOptionOmittable } from "@beep/schema/integrations/sql/common";
 * import * as S from "effect/Schema";
 *
 * const field = FieldOptionOmittable(S.String);
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export const FieldOptionOmittable = <S extends S.Schema.Any>(schema: S): FieldOptionOmittable<S> =>
  M.Field({
    select: S.OptionFromNullOr(schema),
    insert: S.optionalWith(S.OptionFromNullOr(schema), { default: () => O.none() }),
    update: S.optionalWith(S.OptionFromNullOr(schema), {
      default: () => O.none<S.Schema.Type<S>>(),
    }),
    json: S.OptionFromNullOr(schema),
    jsonCreate: S.optionalWith(S.OptionFromNullOr(schema), {
      default: () => O.none<S.Schema.Type<S>>(),
    }),
    jsonUpdate: S.optionalWith(S.OptionFromNullOr(schema), {
      default: () => O.none<S.Schema.Type<S>>(),
    }),
  });

/**
 * Variant definition for fields that always store a value but remain optional on writes.
 *
 * @example
 * import { FieldOmittableWithDefault } from "@beep/schema/integrations/sql/common";
 * import * as S from "effect/Schema";
 *
 * type Field = FieldOmittableWithDefault<typeof S.String>;
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export interface FieldOmittableWithDefault<S extends S.Schema.Any>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S.optionalWith<S, { default: () => S.Schema.Type<S> }>;
    readonly update: S.optionalWith<S, { default: () => S.Schema.Type<S> }>;
    readonly json: S;
    readonly jsonCreate: S.optionalWith<S, { default: () => S.Schema.Type<S> }>;
    readonly jsonUpdate: S.optionalWith<S, { default: () => S.Schema.Type<S> }>;
  }> {}

/**
 * Helper that wires `FieldOmittableWithDefault` with a schema and default provider.
 *
 * @example
 * import { FieldOmittableWithDefault } from "@beep/schema/integrations/sql/common";
 * import * as S from "effect/Schema";
 *
 * const status = FieldOmittableWithDefault(S.String)(() => "pending");
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export const FieldOmittableWithDefault =
  <S extends S.Schema.Any>(schema: S) =>
  (defaultValue: () => S.Schema.Type<S>): FieldOmittableWithDefault<S> =>
    M.Field({
      select: schema,
      insert: S.optionalWith(schema, { default: defaultValue }),
      update: S.optionalWith(schema, { default: defaultValue }),
      json: schema,
      jsonCreate: S.optionalWith(schema, { default: defaultValue }),
      jsonUpdate: S.optionalWith(schema, { default: defaultValue }),
    });

/**
 * DateTime field that auto-defaults to `DateTime.unsafeNow()` on insert (omittable on writes).
 *
 * @example
 * import { DateTimeInsertFromDateOmittable } from "@beep/schema/integrations/sql/common";
 *
 * const createdAt = DateTimeInsertFromDateOmittable();
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export const DateTimeInsertFromDateOmittable = (annotations?: Annotations<S.Schema.Type<typeof M.DateTimeFromDate>>) =>
  DateTimeFromDate().pipe(
    M.fieldEvolve({
      select: (variant: M.DateTimeFromDate) => variant.annotations({ ...(annotations ?? {}) }),
      insert: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({ ...(annotations ?? {}) }),
      update: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({ ...(annotations ?? {}) }),
      json: (variant: M.DateTimeFromDate) => variant,
      jsonCreate: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({ ...(annotations ?? {}) }),
      jsonUpdate: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({ ...(annotations ?? {}) }),
    })
  );

/**
 * DateTime field that defaults on update only (create/json create keep raw optionals).
 *
 * @example
 * import { DateTimeUpdateFromDateOmittable } from "@beep/schema/integrations/sql/common";
 *
 * const updatedAt = DateTimeUpdateFromDateOmittable();
 *
 * @category Integrations/Sql
 * @since 0.1.0
 */
export const DateTimeUpdateFromDateOmittable = (annotations?: Annotations<S.Schema.Type<typeof M.DateTimeFromDate>>) =>
  DateTimeFromDate().pipe(
    M.fieldEvolve({
      select: (variant: M.DateTimeFromDate) => variant.annotations({ ...(annotations ?? {}) }),
      insert: (variant: M.DateTimeFromDate) => S.optional(variant).annotations({ ...(annotations ?? {}) }),
      update: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({ ...(annotations ?? {}) }),
      json: (variant: M.DateTimeFromDate) => variant,
      jsonCreate: (variant: M.DateTimeFromDate) => variant.annotations({ ...(annotations ?? {}) }),
      jsonUpdate: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({ ...(annotations ?? {}) }),
    })
  );

/**
 * Variant definition for sensitive Option fields that wrap the schema inside {@link S.Redacted}.
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
export interface FieldSensitiveOptionOmittable<S extends S.Schema.Any>
  extends VariantSchema.Field<{
    readonly select: S.OptionFromNullishOr<S.Redacted<S>>;
    readonly insert: S.optionalWith<
      S.OptionFromNullishOr<S.Redacted<S>>,
      {
        default: () => O.Option<Redacted.Redacted<S.Schema.Type<S>>>;
      }
    >;
    readonly update: S.optionalWith<
      S.OptionFromNullishOr<S.Redacted<S>>,
      {
        default: () => O.Option<Redacted.Redacted<S.Schema.Type<S>>>;
      }
    >;
    readonly json: S.OptionFromNullishOr<S.Redacted<S>>;
    readonly jsonCreate: S.optionalWith<
      S.OptionFromNullishOr<S.Redacted<S>>,
      {
        default: () => O.Option<Redacted.Redacted<S.Schema.Type<S>>>;
      }
    >;
    readonly jsonUpdate: S.optionalWith<
      S.OptionFromNullishOr<S.Redacted<S>>,
      {
        default: () => O.Option<Redacted.Redacted<S.Schema.Type<S>>>;
      }
    >;
  }> {}

/**
 * Helper providing {@link FieldSensitiveOptionOmittable} semantics for a schema.
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
export const FieldSensitiveOptionOmittable = <S extends S.Schema.Any>(schema: S): FieldSensitiveOptionOmittable<S> =>
  M.Field({
    select: S.OptionFromNullishOr(S.Redacted(schema), null),
    insert: S.optionalWith(S.OptionFromNullishOr(S.Redacted(schema), null), { default: () => O.none() }),
    update: S.optionalWith(S.OptionFromNullishOr(S.Redacted(schema), null), { default: () => O.none() }),
    json: S.OptionFromNullishOr(S.Redacted(schema), null),
    jsonCreate: S.optionalWith(S.OptionFromNullishOr(S.Redacted(schema), null), { default: () => O.none() }),
    jsonUpdate: S.optionalWith(S.OptionFromNullishOr(S.Redacted(schema), null), { default: () => O.none() }),
  });

/**
 * Nullable JSON field stored as TEXT in Postgres while surfacing Option semantics.
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
export const JsonFromStringOption = <TSchema extends S.Schema.All>(schema: TSchema) =>
  M.JsonFromString(schema).pipe(
    M.fieldEvolve({
      select: (variant) => S.OptionFromNullOr(S.asSchema(variant)),
      insert: (variant) => S.optionalWith(S.OptionFromNullOr(S.asSchema(variant)), { default: () => O.none() }),
      update: (variant) => S.optionalWith(S.OptionFromNullOr(S.asSchema(variant)), { default: () => O.none() }),
      json: (variant) => S.OptionFromNullOr(S.asSchema(variant)),
      jsonCreate: (variant) => S.optionalWith(S.OptionFromNullOr(S.asSchema(variant)), { default: () => O.none() }),
      jsonUpdate: (variant) => S.optionalWith(S.OptionFromNullOr(S.asSchema(variant)), { default: () => O.none() }),
    })
  );
