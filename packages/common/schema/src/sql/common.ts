import type { DefaultAnnotations } from "@beep/schema/annotations";
import type { UnsafeTypes } from "@beep/types";
import * as VariantSchema from "@effect/experimental/VariantSchema";
import * as M from "@effect/sql/Model";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import type * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

const { Field } = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select",
});

type Annotations<A, TypeParameters extends ReadonlyArray<UnsafeTypes.UnsafeAny> = readonly []> = Omit<
  DefaultAnnotations<A, TypeParameters>,
  "title" | "description"
> & {
  readonly title?: string;
  readonly description?: string;
};

/**
 * Optimal DateTime schemas for PostgresSQL with timezone support
 */
const dateTimeJsonSchemaAnnotations = (
  annotations: Annotations<S.Schema.Type<typeof M.DateTimeFromDate>> | undefined = {}
) =>
  ({
    jsonSchema: {
      type: "string",
      format: "datetime",
    },
    ...annotations,
  }) as const;

export const DateTimeFromDate = (annotations?: Annotations<S.Schema.Type<typeof M.DateTimeFromDate>> | undefined) =>
  M.DateTimeFromDate.annotations(dateTimeJsonSchemaAnnotations(annotations));

/**
 * Make a field an Option for all variants, and omittable on write variants.
 *
 * Behavior by variant:
 * - select, json: required key; value is Option decoded from `S | null`
 * - insert, update, jsonCreate, jsonUpdate: key is omittable; when present, value is Option decoded from `S | null`
 *
 * Use this when a column may be null/absent but clients shouldn't be forced
 * to send the key on create/update requests.
 * - On update/jsonUpdate: missing key means "do not modify this field".
 * - On insert/jsonCreate: missing key lets defaults or DB behavior apply.
 * @since 1.0.0
 * @category optional
 */
export interface FieldOptionOmittable<S extends S.Schema.Any>
  extends VariantSchema.Field<{
    readonly select: S.OptionFromNullishOr<S>;
    readonly insert: S.optionalWith<S.OptionFromNullishOr<S>, { default: () => O.Option<S.Schema.Type<S>> }>;
    readonly update: S.optionalWith<S.OptionFromNullishOr<S>, { default: () => O.Option<S.Schema.Type<S>> }>;
    readonly json: S.OptionFromNullishOr<S>;
    readonly jsonCreate: S.optionalWith<S.OptionFromNullishOr<S>, { default: () => O.Option<S.Schema.Type<S>> }>;
    readonly jsonUpdate: S.optionalWith<S.OptionFromNullishOr<S>, { default: () => O.Option<S.Schema.Type<S>> }>;
  }> {}

/**
 * Make a field an Option for all variants, and omittable on write variants.
 *
 * Behavior by variant:
 * - select, json: required key; value is Option decoded from `S | null`
 * - insert, update, jsonCreate, jsonUpdate: key is omittable; when present, value is Option decoded from `S | null`
 *
 * Use this when a column may be null/absent but clients shouldn't be forced
 * to send the key on create/update requests.
 * - On update/jsonUpdate: missing key means "do not modify this field".
 * - On insert/jsonCreate: missing key lets defaults or DB behavior apply.
 * @since 1.0.0
 * @category optional
 */
export const FieldOptionOmittable = <S extends S.Schema.Any>(schema: S): FieldOptionOmittable<S> =>
  Field({
    select: S.OptionFromNullishOr(schema, null),
    insert: S.optionalWith(S.OptionFromNullishOr(schema, null), { default: () => O.none() }),
    update: S.optionalWith(S.OptionFromNullishOr(schema, null), { default: () => O.none<S.Schema.Type<S>>() }),
    json: S.OptionFromNullishOr(schema, null),
    jsonCreate: S.optionalWith(S.OptionFromNullishOr(schema, null), { default: () => O.none<S.Schema.Type<S>>() }),
    jsonUpdate: S.optionalWith(S.OptionFromNullishOr(schema, null), { default: () => O.none<S.Schema.Type<S>>() }),
  });

/**
 * Make a field an Option for all variants, and omittable on write variants.
 *
 * Behavior by variant:
 * - select, json: required key; value is Option decoded from `S | null`
 * - insert, update, jsonCreate, jsonUpdate: key is omittable; when present, value is Option decoded from `S | null`
 *
 * Use this when a column may be null/absent but clients shouldn't be forced
 * to send the key on create/update requests.
 * - On update/jsonUpdate: missing key means "do not modify this field".
 * - On insert/jsonCreate: missing key lets defaults or DB behavior apply.
 * @since 1.0.0
 * @category optional
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
 * Make a field an Option for all variants, and omittable on write variants.
 *
 * Behavior by variant:
 * - select, json: required key; value is Option decoded from `S | null`
 * - insert, update, jsonCreate, jsonUpdate: key is omittable; when present, value is Option decoded from `S | null`
 *
 * Use this when a column may be null/absent but clients shouldn't be forced
 * to send the key on create/update requests.
 * - On update/jsonUpdate: missing key means "do not modify this field".
 * - On insert/jsonCreate: missing key lets defaults or DB behavior apply.
 * @since 1.0.0
 * @category optional
 */
export const FieldOmittableWithDefault =
  <S extends S.Schema.Any>(schema: S) =>
  (defaultValue: () => S.Schema.Type<S>): FieldOmittableWithDefault<S> =>
    Field({
      select: schema,
      insert: S.optionalWith(schema, { default: defaultValue }),
      update: S.optionalWith(schema, { default: defaultValue }),
      json: schema,
      jsonCreate: S.optionalWith(schema, { default: defaultValue }),
      jsonUpdate: S.optionalWith(schema, { default: defaultValue }),
    });

export const DateTimeInsertFromDateOmittable = (
  annotations?: Annotations<S.Schema.Type<typeof M.DateTimeFromDate>> | undefined
) =>
  DateTimeFromDate().pipe(
    M.fieldEvolve({
      select: (variant: M.DateTimeFromDate) =>
        variant.annotations({
          ...annotations,
        }),
      insert: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({
          ...annotations,
        }),
      update: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({
          ...annotations,
        }),
      json: (variant: M.DateTimeFromDate) => variant,
      jsonCreate: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({
          ...annotations,
        }),
      jsonUpdate: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({
          ...annotations,
        }),
    })
  );

export const DateTimeUpdateFromDateOmittable = (
  annotations?: Annotations<S.Schema.Type<typeof M.DateTimeFromDate>> | undefined
) =>
  DateTimeFromDate().pipe(
    M.fieldEvolve({
      select: (variant: M.DateTimeFromDate) =>
        variant.annotations({
          ...annotations,
        }),
      insert: (variant: M.DateTimeFromDate) =>
        S.optional(variant).annotations({
          ...annotations,
        }),
      update: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({
          ...annotations,
        }),
      json: (variant: M.DateTimeFromDate) => variant,
      jsonCreate: (variant: M.DateTimeFromDate) =>
        variant.annotations({
          ...annotations,
        }),
      jsonUpdate: (variant: M.DateTimeFromDate) =>
        S.optionalWith(variant, { default: () => DateTime.unsafeNow() }).annotations({
          ...annotations,
        }),
    })
  );

/**
 * Make a field an Option for all variants, and omittable on write variants.
 *
 * Behavior by variant:
 * - select, json: required key; value is Option decoded from `S | null`
 * - insert, update, jsonCreate, jsonUpdate: key is omittable; when present, value is Option decoded from `S | null`
 *
 * Use this when a column may be null/absent but clients shouldn't be forced
 * to send the key on create/update requests.
 * - On update/jsonUpdate: missing key means "do not modify this field".
 * - On insert/jsonCreate: missing key lets defaults or DB behavior apply.
 * @since 1.0.0
 * @category optional
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
 * Make a field an Option for all variants, and omittable on write variants.
 *
 * Behavior by variant:
 * - select, json: required key; value is Option decoded from `S | null`
 * - insert, update, jsonCreate, jsonUpdate: key is omittable; when present, value is Option decoded from `S | null`
 *
 * Use this when a column may be null/absent but clients shouldn't be forced
 * to send the key on create/update requests.
 * - On update/jsonUpdate: missing key means "do not modify this field".
 * - On insert/jsonCreate: missing key lets defaults or DB behavior apply.
 * @since 1.0.0
 * @category optional
 */
export const FieldSensitiveOptionOmittable = <S extends S.Schema.Any>(schema: S): FieldSensitiveOptionOmittable<S> =>
  Field({
    select: S.OptionFromNullishOr(S.Redacted(schema), null),
    insert: S.optionalWith(S.OptionFromNullishOr(S.Redacted(schema), null), { default: () => O.none() }),
    update: S.optionalWith(S.OptionFromNullishOr(S.Redacted(schema), null), { default: () => O.none() }),
    json: S.OptionFromNullishOr(S.Redacted(schema), null),
    jsonCreate: S.optionalWith(S.OptionFromNullishOr(S.Redacted(schema), null), { default: () => O.none() }),
    jsonUpdate: S.optionalWith(S.OptionFromNullishOr(S.Redacted(schema), null), { default: () => O.none() }),
  });

/**
 * Nullable JSON field stored as text in the database with Option semantics.
 *
 * Behavior by variant:
 * - select: required key; value decoded as Option from `string | null`
 * - insert, update: key is omittable; when present, value decoded as Option from `string | null`
 * - json: required key; value decoded as Option from `S | null`
 * - jsonCreate, jsonUpdate: key is omittable; when present, value decoded as Option from `S | null`
 *
 * This mirrors `M.FieldOption(M.JsonFromString(schema))` but ensures the encoded
 * shape for database selections is `string | null` (no `undefined`), matching
 * Drizzle models for nullable text columns.
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
