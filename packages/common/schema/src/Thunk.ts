/**
 * Thunk-oriented schema helpers.
 *
 * @since 0.0.0
 * @module @beep/schema/Thunk
 */
import { $SchemaId } from "@beep/identity";
import { Brand, Function } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as SchemaUtils from "./SchemaUtils/index.ts";

const $I = $SchemaId.create("Thunk");
const { dual } = Function;

/**
 * Brand identifier for {@link ThunkUnknown}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TypeId = $I`ThunkUnknown`;

/**
 * Type for {@link TypeId}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TypeId = typeof TypeId;

/**
 * Branded thunk type backed by {@link ThunkUnknown}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ThunkUnknown<A = unknown> = Brand.Branded<() => A, TypeId>;

const isThunkUnknownValue = (u: unknown): u is () => unknown => P.isFunction(u);

/**
 * Brand constructor for {@link ThunkUnknown}.
 *
 * @since 0.0.0
 * @category Validation
 */
export const nominal = Brand.make<ThunkUnknown>(isThunkUnknownValue);

/**
 * Schema for unknown thunks.
 *
 * @since 0.0.0
 * @category Validation
 */
export const ThunkUnknown = S.declare<() => unknown>(isThunkUnknownValue).pipe(
  S.fromBrand(TypeId, nominal),
  $I.annoteSchema("ThunkUnknown", {
    description: "A schema for a function that returns a value.",
  }),
  SchemaUtils.withStatics(() => ({
    generic: <A = never>(guard: (u: unknown) => u is () => A) => S.declare<() => A>(guard),
  }))
);

/**
 * Guard for {@link ThunkUnknown}.
 *
 * @since 0.0.0
 * @category Guards
 */
export const isThunkUnknown = S.is(ThunkUnknown);

// `returnSchema` is type-level only here; validating it would require invoking the thunk.
/**
 * Builds a thunk schema from a guard and a return schema witness.
 *
 * @since 0.0.0
 * @category Validation
 */
export const make: {
  <TSchema extends S.Top>(
    guard: (u: unknown) => u is () => S.Schema.Type<TSchema>,
    _returnSchema: TSchema
  ): S.declare<() => S.Schema.Type<TSchema>>;
  <TSchema extends S.Top>(
    guard: (u: unknown) => u is () => S.Schema.Type<TSchema>
  ): (_returnSchema: TSchema) => S.declare<() => S.Schema.Type<TSchema>>;
} = dual(
  2,
  <TSchema extends S.Top>(
    guard: (u: unknown) => u is () => S.Schema.Type<TSchema>,
    _returnSchema: TSchema
  ): S.declare<() => S.Schema.Type<TSchema>> => S.declare<() => S.Schema.Type<TSchema>>(guard)
);
