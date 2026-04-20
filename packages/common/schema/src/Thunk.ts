/**
 * Thunk-oriented schema helpers.
 *
 * @since 0.0.0
 * @module \@beep/schema/Thunk
 */
import { $SchemaId } from "@beep/identity";
import { Brand, Function } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as SchemaUtils from "./SchemaUtils/index.ts";

const $I = $SchemaId.create("Thunk");
const { dual } = Function;

/**
 * Unique brand identifier tag for {@link ThunkUnknown} values.
 *
 * @example
 * ```ts
 * import { TypeId } from "@beep/schema/Thunk"
 *
 * void TypeId
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const TypeId = $I`ThunkUnknown`;

/**
 * Type for {@link TypeId}.
 *
 * @since 0.0.0
 * @category models
 */
export type TypeId = typeof TypeId;

/**
 * Branded thunk type -- a zero-argument function returning `A`, branded with
 * {@link TypeId}.
 *
 * @since 0.0.0
 * @category models
 */
export type ThunkUnknown<A = unknown> = Brand.Branded<() => A, TypeId>;

const isThunkUnknownValue = (u: unknown): u is () => unknown => P.isFunction(u);

/**
 * Brand constructor that validates and brands a value as {@link ThunkUnknown}.
 *
 * @example
 * ```ts
 * import { nominal } from "@beep/schema/Thunk"
 *
 * const thunk = nominal(() => 42)
 * void thunk
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const nominal = Brand.make<ThunkUnknown>(isThunkUnknownValue);

/**
 * Schema that validates a value is a zero-argument function and brands it with
 * {@link TypeId}. Provides a `.generic` helper for creating typed thunk schemas.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ThunkUnknown } from "@beep/schema/Thunk"
 *
 * const thunk = S.decodeUnknownSync(ThunkUnknown)(() => "hello")
 * void thunk
 * ```
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
 * Type guard that checks whether a value satisfies the {@link ThunkUnknown}
 * schema.
 *
 * @example
 * ```ts
 * import { isThunkUnknown } from "@beep/schema/Thunk"
 *
 * isThunkUnknown(() => 1)  // true
 * isThunkUnknown("hello")  // false
 * ```
 *
 * @since 0.0.0
 * @category guards
 */
export const isThunkUnknown = S.is(ThunkUnknown);

/**
 * Builds a typed thunk schema from a type guard and a return-type schema
 * witness. The return schema is type-level only; validating it would require
 * invoking the thunk. Supports both data-first and data-last calling
 * conventions.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import * as P from "effect/Predicate"
 * import { make } from "@beep/schema/Thunk"
 *
 * const isStringThunk = (u: unknown): u is () => string =>
 *   P.isFunction(u)
 *
 * const StringThunk = make(isStringThunk, S.String)
 * void StringThunk
 * ```
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
