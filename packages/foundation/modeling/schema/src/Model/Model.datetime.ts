/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { DateTime, Effect, SchemaGetter as Getter } from "effect";
import * as S from "effect/Schema";
import { Field, Overridable } from "./Model.variants.ts";
import type * as VariantSchema from "../VariantSchema/index.ts";
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
 * @category models
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
 * @category schemas
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
 * @category schemas
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
 * @category schemas
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
 * @category schemas
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
 * @category schemas
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
 * @category models
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
 * @category schemas
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
 * @category models
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
 * @category schemas
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
 * @category models
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
 * @category schemas
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
 * @category models
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
 * @category schemas
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
 * @category models
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
 * @category schemas
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
 * @category models
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
 * @category schemas
 */
export const DateTimeUpdateFromNumber: DateTimeUpdateFromNumber = Field({
  select: S.DateTimeUtcFromMillis,
  insert: DateTimeFromNumberWithNow,
  update: DateTimeFromNumberWithNow,
  json: S.DateTimeUtcFromMillis,
});
