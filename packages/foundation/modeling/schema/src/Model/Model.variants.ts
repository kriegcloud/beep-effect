/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import type { TUnsafe } from "@beep/types";
import type { Brand } from "effect/Brand";
import type * as S from "effect/Schema";
import * as VariantSchema from "../VariantSchema/index.ts";

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

/**
 * Union of all model variant keys.
 *
 * @since 0.0.0
 * @category models
 */
export type Variant = (typeof modelVariants)[number];

/**
 * Default model variant used as the class schema.
 *
 * @since 0.0.0
 * @category models
 */
export type DefaultVariant = "select";

type ModelClassCore<Self, Fields extends VariantSchema.Struct.Fields, Inherited> = VariantSchema.Class<
  Self,
  Fields,
  S.Struct<VariantSchema.ExtractFields<DefaultVariant, Fields, true>>,
  Variant,
  DefaultVariant,
  Inherited
> & {
  readonly [V in Variant]: VariantSchema.Extract<
    V,
    VariantSchema.Struct<Fields>,
    V extends DefaultVariant ? true : false
  >;
};

type InheritStaticMembers<C, Static> = C & Pick<Static, Exclude<keyof Static, keyof C>>;

/**
 * Materialized class constructor shape produced by {@link Class}.
 *
 * @since 0.0.0
 * @category models
 */
export type ClassShape<
  Self,
  Fields extends VariantSchema.Struct.Fields,
  Static = {},
  Inherited = {},
> = InheritStaticMembers<ModelClassCore<Self, Fields, Inherited>, Static>;

/**
 * Public schema module export.
 *
 * @category schemas
 * @since 0.0.0
 */
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
   * @category getters
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
   * @category constructors
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
   * @category constructors
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
   * @category constructors
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
   * @category mapping
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
 * @category getters
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
 * @category constructors
 */
export const Override: <A>(value: A) => A & Brand<"Override"> = VariantSchema.Override;

/**
 * Schema whose constructor can supply a generated default unless callers pass
 * {@link Override}.
 *
 * @since 0.0.0
 * @category schemas
 */
export interface Overridable<S extends S.Top & S.WithoutConstructorDefault> extends VariantSchema.Overridable<S> {}

/**
 * Upstream-compatible spelling for {@link Overridable}.
 *
 * @since 0.0.0
 * @category schemas
 */
export interface Overrideable<S extends S.Top & S.WithoutConstructorDefault> extends Overridable<S> {}

/**
 * Build an `Overridable` schema that falls back to `defaultValue` during
 * constructor creation.
 *
 * @since 0.0.0
 * @category constructors
 */
export const Overridable: typeof VariantSchema.Overridable = VariantSchema.Overridable;

/**
 * Upstream-compatible spelling for {@link Overridable}.
 *
 * @since 0.0.0
 * @category constructors
 */
export const Overrideable: typeof Overridable = Overridable;
