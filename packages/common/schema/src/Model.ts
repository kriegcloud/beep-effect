/**
 * Multi-variant domain model schemas for database and JSON representations.
 *
 * Provides `Class`, `Field`, `Struct`, and related helpers that generate
 * variant-aware schemas for `select`, `insert`, `update`, `json`,
 * `jsonCreate`, and `jsonUpdate` use cases from a single field definition.
 *
 * @module
 * @since 0.0.0
 */

import type { TUnsafe } from "@beep/types";
import { DateTime, Effect, SchemaGetter as Getter, SchemaTransformation as Transformation } from "effect";
import type { Brand } from "effect/Brand";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Uuid from "uuid";
import * as VariantSchema from "./VariantSchema.ts";

const modelVariants = ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"] as const;

const { Class, Field, FieldExcept, FieldOnly, Struct, Union, extract, fieldEvolve } = VariantSchema.make({
  variants: modelVariants,
  defaultVariant: "select",
});

/**
 * Constraint type satisfied by any Model class produced by {@link Class}.
 *
 * @since 0.0.0
 * @category models
 */
export type Any = S.Top & {
  readonly fields: S.Struct.Fields;
  readonly insert: S.Top;
  readonly update: S.Top;
  readonly json: S.Top;
  readonly jsonCreate: S.Top;
  readonly jsonUpdate: S.Top;
};

/**
 * Union of database variant keys: `"select"`, `"insert"`, `"update"`.
 *
 * @since 0.0.0
 * @category models
 */
export type VariantsDatabase = "select" | "insert" | "update";

/**
 * Union of JSON variant keys: `"json"`, `"jsonCreate"`, `"jsonUpdate"`.
 *
 * @since 0.0.0
 * @category models
 */
export type VariantsJson = "json" | "jsonCreate" | "jsonUpdate";

export {
  /**
   * A base class used for creating domain model schemas.
   *
   * It supports common variants for database and JSON apis.
   *
   * @since 0.0.0
   * @category constructors
   * @example
   * ```ts
   * import * as Schema from "effect/Schema"
   * import * as Model from "@beep/schema/Model"
   *
   * export const GroupId = Schema.Number.pipe(Schema.brand("GroupId"))
   *
   * export class Group extends Model.Class<Group>("Group")({}) {}
   *
   * // schema used for selects
   * Group
   *
   * // schema used for inserts
   * Group.insert
   *
   * // schema used for updates
   * Group.update
   *
   * // schema used for json api
   * Group.json
   * Group.jsonCreate
   * Group.jsonUpdate
   *
   * // you can also turn them into classes
   * class GroupJson extends Schema.Class<GroupJson>("GroupJson")(Group.json) {}
   * void GroupJson
   * ```
   */
  Class,
  /**
   * Extract the schema for a specific variant from a variant struct.
   *
   * @example
   * ```ts
   * import * as Schema from "effect/Schema"
   * import * as Model from "@beep/schema/Model"
   *
   * const fields = Model.Struct({})
   *
   * const InsertSchema = Model.extract(fields, "insert")
   * void InsertSchema
   * ```
   *
   * @since 0.0.0
   * @category extractors
   */
  extract,
  /**
   * Define a variant-aware field by supplying a schema per variant key.
   *
   * @example
   * ```ts
   * import * as Schema from "effect/Schema"
   * import * as Model from "@beep/schema/Model"
   *
   * const status = Model.Field({})
   *
   * void status
   * ```
   *
   * @since 0.0.0
   * @category fields
   */
  Field,
  /**
   * Create a field present on every variant except the listed ones.
   *
   * @example
   * ```ts
   * import * as Schema from "effect/Schema"
   * import * as Model from "@beep/schema/Model"
   *
   * const readOnly = Model.FieldExcept(["insert", "update"])(Schema.String)
   * void readOnly
   * ```
   *
   * @since 0.0.0
   * @category fields
   */
  FieldExcept,
  /**
   * Create a field present only on the listed variants.
   *
   * @example
   * ```ts
   * import * as Schema from "effect/Schema"
   * import * as Model from "@beep/schema/Model"
   *
   * const jsonOnly = Model.FieldOnly(["json", "jsonCreate"])(Schema.String)
   * void jsonOnly
   * ```
   *
   * @since 0.0.0
   * @category fields
   */
  FieldOnly,
  /**
   * Transform variant schemas inside an existing field using per-variant mappers.
   *
   * @example
   * ```ts
   * import * as Schema from "effect/Schema"
   * import * as Model from "@beep/schema/Model"
   *
   * const makeOptional = Model.fieldEvolve({})
   *
   * void makeOptional
   * ```
   *
   * @since 0.0.0
   * @category fields
   */
  fieldEvolve,
  /**
   * Create a raw variant struct without producing a class.
   *
   * @example
   * ```ts
   * import * as Schema from "effect/Schema"
   * import * as Model from "@beep/schema/Model"
   *
   * const groupFields = Model.Struct({})
   *
   * void groupFields
   * ```
   *
   * @since 0.0.0
   * @category constructors
   */
  Struct,
  /**
   * Create a discriminated union of variant structs with per-variant accessors.
   *
   * @example
   * ```ts
   * import * as Schema from "effect/Schema"
   * import * as Model from "@beep/schema/Model"
   *
   * const a = Model.Struct({ _tag: Schema.tag("A"), value: Schema.String })
   * const b = Model.Struct({ _tag: Schema.tag("B"), count: Schema.Number })
   * const AB = Model.Union([a, b])
   *
   * void AB
   * ```
   *
   * @since 0.0.0
   * @category constructors
   */
  Union,
};

/**
 * Extract the raw variant field record from a variant struct.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const s = Model.Struct({})
 *
 * const raw = Model.fields(s)
 * void raw
 * ```
 *
 * @since 0.0.0
 * @category fields
 */
export const fields: <A extends VariantSchema.Struct<TUnsafe.Any>>(self: A) => A[typeof VariantSchema.TypeId] =
  VariantSchema.fields;

/**
 * Wrap a value so it overrides the default generated by an {@link Overridable} field.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const GroupId = S.Number.pipe(S.brand("GroupId"))
 *
 * class Group extends Model.Class<Group>("Group")({}) {}
 *
 * void Group
 * ```
 *
 * @since 0.0.0
 * @category overridable
 */
export const Override: <A>(value: A) => A & Brand<"Override"> = VariantSchema.Override;

/**
 * Schema whose decoded type is optional with a default value injected during encoding.
 *
 * @since 0.0.0
 * @category overridable
 */
export interface Overridable<S extends S.Top & S.WithoutConstructorDefault>
  extends S.Bottom<
    (S["Type"] & Brand<"Override">) | undefined,
    S["Encoded"],
    S["DecodingServices"],
    S["EncodingServices"],
    S["ast"],
    Overridable<S>,
    S["~type.make.in"],
    (S["Type"] & Brand<"Override">) | undefined,
    S["~type.parameters"],
    (S["Type"] & Brand<"Override">) | undefined,
    S["~type.mutability"],
    "optional",
    "with-default",
    S["~encoded.mutability"],
    S["~encoded.optionality"]
  > {}

/**
 * Build an `Overridable` schema that falls back to `defaultValue` when no override is provided.
 *
 * @since 0.0.0
 * @category overridable
 */
export const Overridable: {
  <S extends S.Top & S.WithoutConstructorDefault>(options: {
    readonly defaultValue: Effect.Effect<S["~type.make.in"]>;
  }): (schema: S) => Overridable<S>;
  <S extends S.Top & S.WithoutConstructorDefault>(
    schema: S,
    options: {
      readonly defaultValue: Effect.Effect<S["~type.make.in"]>;
    }
  ): Overridable<S>;
} = dual(
  2,
  <S extends S.Top & S.WithoutConstructorDefault>(
    schema: S,
    options: {
      readonly defaultValue: Effect.Effect<S["~type.make.in"]>;
    }
  ): Overridable<S> =>
    schema.pipe(
      S.decodeTo(
        S.toType(schema).pipe(S.brand("Override"), S.optional),
        Transformation.make({
          decode: Getter.passthrough(),
          encode: new Getter.Getter((o) => {
            if (O.isSome(o) && o.value !== undefined) {
              return Effect.succeed(o);
            }
            return Effect.asSome(options.defaultValue);
          }),
        })
      )
    ) as TUnsafe.Any
);

/**
 * Interface for a database-generated field present in `select`, `update`, and `json` variants.
 *
 * @since 0.0.0
 * @category generated
 */
export interface Generated<S extends S.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly update: S;
    readonly json: S;
  }> {}

/**
 * A field that represents a column generated by the database.
 *
 * Available for selection, update, and json, but omitted from insertion.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const GroupId = S.Number.pipe(S.brand("GroupId"))
 *
 * class Group extends Model.Class<Group>("Group")({}) {}
 *
 * void Group
 * ```
 *
 * @since 0.0.0
 * @category generated
 */
export const Generated = <S extends S.Top>(schema: S): Generated<S> =>
  Field({
    select: schema,
    update: schema,
    json: schema,
  });

/**
 * Interface for an application-generated field present in `select`, `insert`, `update`, and `json` variants.
 *
 * @since 0.0.0
 * @category generated
 */
export interface GeneratedByApp<S extends S.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly update: S;
    readonly json: S;
  }> {}

/**
 * A field generated by the application at runtime.
 *
 * Present in all database variants and `json`, but absent from `jsonCreate`
 * and `jsonUpdate` because the server assigns the value.
 *
 * @since 0.0.0
 * @category generated
 */
export const GeneratedByApp = <S extends S.Top>(schema: S): GeneratedByApp<S> =>
  Field({
    select: schema,
    insert: schema,
    update: schema,
    json: schema,
  });

/**
 * Interface for a sensitive field excluded from all JSON variants.
 *
 * @since 0.0.0
 * @category sensitive
 */
export interface Sensitive<S extends S.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly update: S;
  }> {}

/**
 * A field for sensitive values that must never appear in JSON API responses.
 *
 * Present in `select`, `insert`, and `update` only.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * class User extends Model.Class<User>("User")({}) {}
 *
 * void User
 * ```
 *
 * @since 0.0.0
 * @category sensitive
 */
export const Sensitive = <S extends S.Top>(schema: S): Sensitive<S> =>
  Field({
    select: schema,
    insert: schema,
    update: schema,
  });

/**
 * Schema that decodes an optional nullable key into an `Option`.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const field: Model.optionalOption<typeof Schema.String> =
 *
 *
 * void field
 * ```
 *
 * @since 0.0.0
 * @category optional
 */
export interface optionalOption<S extends S.Top>
  extends S.decodeTo<S.Option<S.toType<S>>, S.optionalKey<S.NullOr<S>>> {}

/**
 * Build a schema that decodes an optional nullable JSON key into an `Option`.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const opt = Model.optionalOption(Schema.Number)
 * void opt
 * ```
 *
 * @since 0.0.0
 * @category optional
 */
export const optionalOption = <S extends S.Top>(schema: S): optionalOption<S> =>
  S.NullOr(schema).pipe(
    S.optionalKey,
    S.decodeTo(
      S.toType(schema).pipe(S.Option),
      Transformation.transformOptional<O.Option<S["Type"]>, S["Type"] | null>({
        decode: (oe) => oe.pipe(O.filter(P.isNotNull), O.some),
        encode: O.flatten,
      }) as TUnsafe.Any
    )
  );

/**
 * Convert a field to one that is optional for all variants.
 *
 * For the database variants, it will accept `null`able values.
 * For the JSON variants, it will also accept missing keys.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const opt: Model.FieldOption<typeof Schema.String> =
 *
 *
 * void opt
 * ```
 *
 * @since 0.0.0
 * @category optional
 */
export interface FieldOption<S extends S.Top>
  extends VariantSchema.Field<{
    readonly select: S.OptionFromNullOr<S>;
    readonly insert: S.OptionFromNullOr<S>;
    readonly update: S.OptionFromNullOr<S>;
    readonly json: optionalOption<S>;
    readonly jsonCreate: optionalOption<S>;
    readonly jsonUpdate: optionalOption<S>;
  }> {}

/**
 * Convert a field to one that is optional for all variants.
 *
 * For the database variants, it will accept `null`able values.
 * For the JSON variants, it will also accept missing keys.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const opt = Model.FieldOption(Schema.String)
 * void opt
 * ```
 *
 * @since 0.0.0
 * @category optional
 */
export const FieldOption: <Field extends VariantSchema.Field<TUnsafe.Any> | S.Top>(
  self: Field
) => Field extends S.Top
  ? FieldOption<Field>
  : Field extends VariantSchema.Field<infer S>
    ? VariantSchema.Field<{
        readonly [K in keyof S]: S[K] extends S.Top
          ? K extends VariantsDatabase
            ? S.OptionFromNullOr<S[K]>
            : optionalOption<S[K]>
          : never;
      }>
    : never = fieldEvolve({
  select: S.OptionFromNullOr,
  insert: S.OptionFromNullOr,
  update: S.OptionFromNullOr,
  json: optionalOption,
  jsonCreate: optionalOption,
  jsonUpdate: optionalOption,
}) as TUnsafe.Any;

/**
 * Interface for an SQLite boolean field using `0 | 1` in the database and `boolean` in JSON.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * const field: Model.BooleanSqlite = Model.BooleanSqlite
 * void field
 * ```
 *
 * @since 0.0.0
 * @category booleans
 */
export interface BooleanSqlite
  extends VariantSchema.Field<{
    readonly select: S.BooleanFromBit;
    readonly insert: S.BooleanFromBit;
    readonly update: S.BooleanFromBit;
    readonly json: S.Boolean;
    readonly jsonCreate: S.Boolean;
    readonly jsonUpdate: S.Boolean;
  }> {}

/**
 * A schema for sqlite booleans that are represented as `0 | 1` in database
 * variants and `boolean` in JSON variants.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * class Task extends Model.Class<Task>("Task")({}) {}
 *
 * void Task
 * ```
 *
 * @since 0.0.0
 * @category booleans
 */
export const BooleanSqlite: BooleanSqlite = Field({
  select: S.BooleanFromBit,
  insert: S.BooleanFromBit,
  update: S.BooleanFromBit,
  json: S.Boolean,
  jsonCreate: S.Boolean,
  jsonUpdate: S.Boolean,
});

/**
 * Schema interface that decodes a `YYYY-MM-DD` string into `DateTime.Utc` with time removed.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * const field: Model.Date = Model.Date
 * void field
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export interface Date extends S.decodeTo<S.instanceOf<DateTime.Utc>, S.String> {}

/**
 * A schema for a `DateTime.Utc` that is serialized as a date string in the
 * format `YYYY-MM-DD`.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * class Event extends Model.Class<Event>("Event")({}) {}
 *
 * void Event
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export const Date: Date = S.String.pipe(
  S.decodeTo(S.DateTimeUtc, {
    decode: Getter.dateTimeUtcFromInput().map(DateTime.removeTime),
    encode: Getter.transform(DateTime.formatIsoDate),
  })
);

/**
 * Overridable date field that defaults to today's UTC date on insert.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * void Model.DateWithNow
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export const DateWithNow = Overridable(Date, {
  defaultValue: Effect.map(DateTime.now, DateTime.removeTime),
});

/**
 * Overridable datetime field (string-backed) that defaults to `DateTime.now`.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * void Model.DateTimeWithNow
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export const DateTimeWithNow = Overridable(S.DateTimeUtcFromString, {
  defaultValue: DateTime.now,
});

/**
 * Overridable datetime field (Date-backed) that defaults to `DateTime.now`.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * void Model.DateTimeFromDateWithNow
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export const DateTimeFromDateWithNow = Overridable(S.DateTimeUtcFromDate, {
  defaultValue: DateTime.now,
});

/**
 * Overridable datetime field (number-backed) that defaults to `DateTime.now`.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * void Model.DateTimeFromNumberWithNow
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export const DateTimeFromNumberWithNow = Overridable(S.DateTimeUtcFromMillis, {
  defaultValue: DateTime.now,
});

/**
 * Interface for a string-backed datetime insert field.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * const field: Model.DateTimeInsert = Model.DateTimeInsert
 * void field
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export interface DateTimeInsert
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromString;
    readonly insert: Overridable<S.DateTimeUtcFromString>;
    readonly json: S.DateTimeUtcFromString;
  }> {}

/**
 * A field that represents a date-time value that is inserted as the current
 * `DateTime.Utc`. It is serialized as a string for the database.
 *
 * It is omitted from updates and is available for selection.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * class Group extends Model.Class<Group>("Group")({}) {}
 *
 * void Group
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export const DateTimeInsert: DateTimeInsert = Field({
  select: S.DateTimeUtcFromString,
  insert: DateTimeWithNow,
  json: S.DateTimeUtcFromString,
});

/**
 * Interface for a Date-backed datetime insert field.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * const field: Model.DateTimeInsertFromDate = Model.DateTimeInsertFromDate
 * void field
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export interface DateTimeInsertFromDate
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromDate;
    readonly insert: Overridable<S.DateTimeUtcFromDate>;
    readonly json: S.DateTimeUtcFromString;
  }> {}

/**
 * A field that represents a date-time value that is inserted as the current
 * `DateTime.Utc`. It is serialized as a `Date` for the database.
 *
 * It is omitted from updates and is available for selection.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * class Group extends Model.Class<Group>("Group")({}) {}
 *
 * void Group
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export const DateTimeInsertFromDate: DateTimeInsertFromDate = Field({
  select: S.DateTimeUtcFromDate,
  insert: DateTimeFromDateWithNow,
  json: S.DateTimeUtcFromString,
});

/**
 * Interface for a number-backed datetime insert field.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * const field: Model.DateTimeInsertFromNumber = Model.DateTimeInsertFromNumber
 * void field
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export interface DateTimeInsertFromNumber
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromMillis;
    readonly insert: Overridable<S.DateTimeUtcFromMillis>;
    readonly json: S.DateTimeUtcFromMillis;
  }> {}

/**
 * A field that represents a date-time value that is inserted as the current
 * `DateTime.Utc`. It is serialized as a `number`.
 *
 * It is omitted from updates and is available for selection.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * class Group extends Model.Class<Group>("Group")({}) {}
 *
 * void Group
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export const DateTimeInsertFromNumber: DateTimeInsertFromNumber = Field({
  select: S.DateTimeUtcFromMillis,
  insert: DateTimeFromNumberWithNow,
  json: S.DateTimeUtcFromMillis,
});

/**
 * Interface for a string-backed datetime update field.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * const field: Model.DateTimeUpdate = Model.DateTimeUpdate
 * void field
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export interface DateTimeUpdate
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromString;
    readonly insert: Overridable<S.DateTimeUtcFromString>;
    readonly update: Overridable<S.DateTimeUtcFromString>;
    readonly json: S.DateTimeUtcFromString;
  }> {}

/**
 * A field that represents a date-time value that is updated as the current
 * `DateTime.Utc`. It is serialized as a string for the database.
 *
 * It is set to the current `DateTime.Utc` on updates and inserts and is
 * available for selection.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * class Group extends Model.Class<Group>("Group")({}) {}
 *
 * void Group
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export const DateTimeUpdate: DateTimeUpdate = Field({
  select: S.DateTimeUtcFromString,
  insert: DateTimeWithNow,
  update: DateTimeWithNow,
  json: S.DateTimeUtcFromString,
});

/**
 * Interface for a Date-backed datetime update field.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * const field: Model.DateTimeUpdateFromDate = Model.DateTimeUpdateFromDate
 * void field
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export interface DateTimeUpdateFromDate
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromDate;
    readonly insert: Overridable<S.DateTimeUtcFromDate>;
    readonly update: Overridable<S.DateTimeUtcFromDate>;
    readonly json: S.DateTimeUtcFromString;
  }> {}

/**
 * A field that represents a date-time value that is updated as the current
 * `DateTime.Utc`. It is serialized as a `Date` for the database.
 *
 * It is set to the current `DateTime.Utc` on updates and inserts and is
 * available for selection.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * class Group extends Model.Class<Group>("Group")({}) {}
 *
 * void Group
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export const DateTimeUpdateFromDate: DateTimeUpdateFromDate = Field({
  select: S.DateTimeUtcFromDate,
  insert: DateTimeFromDateWithNow,
  update: DateTimeFromDateWithNow,
  json: S.DateTimeUtcFromString,
});

/**
 * Interface for a number-backed datetime update field.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * const field: Model.DateTimeUpdateFromNumber = Model.DateTimeUpdateFromNumber
 * void field
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export interface DateTimeUpdateFromNumber
  extends VariantSchema.Field<{
    readonly select: S.DateTimeUtcFromMillis;
    readonly insert: Overridable<S.DateTimeUtcFromMillis>;
    readonly update: Overridable<S.DateTimeUtcFromMillis>;
    readonly json: S.DateTimeUtcFromMillis;
  }> {}

/**
 * A field that represents a date-time value that is updated as the current
 * `DateTime.Utc`. It is serialized as a `number`.
 *
 * It is set to the current `DateTime.Utc` on updates and inserts and is
 * available for selection.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * class Group extends Model.Class<Group>("Group")({}) {}
 *
 * void Group
 * ```
 *
 * @since 0.0.0
 * @category date & time
 */
export const DateTimeUpdateFromNumber: DateTimeUpdateFromNumber = Field({
  select: S.DateTimeUtcFromMillis,
  insert: DateTimeFromNumberWithNow,
  update: DateTimeFromNumberWithNow,
  json: S.DateTimeUtcFromMillis,
});

/**
 * Interface for a field stored as a JSON text column in the database.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const field = Model.JsonFromString(Schema.Struct({ a: Schema.String }))
 *
 * void field
 * ```
 *
 * @since 0.0.0
 * @category json
 */
export interface JsonFromString<S extends S.Top>
  extends VariantSchema.Field<{
    readonly select: S.fromJsonString<S>;
    readonly insert: S.fromJsonString<S>;
    readonly update: S.fromJsonString<S>;
    readonly json: S;
    readonly jsonCreate: S;
    readonly jsonUpdate: S;
  }> {}

/**
 * A field that represents a JSON value stored as text in the database.
 *
 * The "json" variants will use the object schema directly.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * class Record extends Model.Class<Record>("Record")({}) {}
 *
 * void Record
 * ```
 *
 * @since 0.0.0
 * @category json
 */
export const JsonFromString = <S extends S.Top>(schema: S): JsonFromString<S> => {
  const parsed = S.fromJsonString(schema);
  return Field({
    select: parsed,
    insert: parsed,
    update: parsed,
    json: schema,
    jsonCreate: schema,
    jsonUpdate: schema,
  });
};

/**
 * Interface for a binary UUID v4 field auto-generated on insert.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const BlobId = Model.Uint8Array.pipe(Schema.brand("BlobId"))
 * const field: Model.UuidV4Insert<"BlobId"> = Model.UuidV4Insert(BlobId)
 *
 * void field
 * ```
 *
 * @since 0.0.0
 * @category uuid
 */
export interface UuidV4Insert<B extends string>
  extends VariantSchema.Field<{
    readonly select: S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>;
    readonly insert: Overridable<S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>>;
    readonly update: S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>;
    readonly json: S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>;
  }> {}

/**
 * Schema for `Uint8Array` values, used as the base for binary UUID fields.
 *
 * @example
 * ```ts
 * import * as Model from "@beep/schema/Model"
 *
 * void Model.Uint8Array
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const Uint8Array: S.instanceOf<Uint8Array<ArrayBuffer>> = S.Uint8Array as S.instanceOf<
  globalThis.Uint8Array<ArrayBuffer>
>;

/**
 * Wrap a branded `Uint8Array` schema in an `Overridable` that generates a UUID v4 by default.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const BlobId = Model.Uint8Array.pipe(Schema.brand("BlobId"))
 * const overridable = Model.UuidV4WithGenerate(BlobId)
 *
 * void overridable
 * ```
 *
 * @since 0.0.0
 * @category uuid
 */
export const UuidV4WithGenerate = <B extends string>(
  schema: S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>
): Overridable<S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>> =>
  Overridable(schema, {
    defaultValue: Effect.sync(() => Uuid.v4({}, new globalThis.Uint8Array(16))),
  });

/**
 * A field that represents a binary UUID v4 that is generated on inserts.
 *
 * @example
 * ```ts
 * import * as Schema from "effect/Schema"
 * import * as Model from "@beep/schema/Model"
 *
 * const BlobId = Model.Uint8Array.pipe(Schema.brand("BlobId"))
 *
 * class Blob extends Model.Class<Blob>("Blob")({}) {}
 *
 * void Blob
 * ```
 *
 * @since 0.0.0
 * @category uuid
 */
export const UuidV4Insert = <const B extends string>(
  schema: S.brand<S.instanceOf<Uint8Array<ArrayBuffer>>, B>
): UuidV4Insert<B> =>
  Field({
    select: schema,
    insert: UuidV4WithGenerate(schema),
    update: schema,
    json: schema,
  });
