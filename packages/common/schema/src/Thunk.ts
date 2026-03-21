import { $SchemaId } from "@beep/identity";
import { Brand } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as SchemaUtils from "./SchemaUtils/index.ts";

const $I = $SchemaId.create("Thunk");

export const TypeId = $I`ThunkUnknown`;
export type TypeId = typeof TypeId;

export type ThunkUnknown<A = unknown> = Brand.Branded<() => A, TypeId>;

const isThunkThunkUnknownValue = (u: unknown): u is (() => unknown) => P.isFunction(u);
export const nominal = Brand.make<ThunkUnknown>(isThunkThunkUnknownValue);

export const ThunkUnknown = S.declare<() => unknown>(isThunkThunkUnknownValue).pipe(
  S.fromBrand(
    TypeId,
    nominal
  ),
  $I.annoteSchema(
    "ThunkUnknown",
    {
      description: "A schema for a function that returns a value."
    }
  ),
  SchemaUtils.withStatics(() => ({
    generic: <A = never>(guard: (u: unknown) => u is (() => A)) => S.declare<() => A>(guard)
  }))
);

const assertGuard: (u: unknown) => asserts u is () => unknown = S.asserts(ThunkUnknown);

export const isThunkThunkUnknown = S.is(ThunkUnknown);

// `returnSchema` is type-level only here; validating it would require invoking the thunk.
export const make: {
  <TSchema extends S.Top>(
    guard: (u: unknown) => u is (() => S.Schema.Type<TSchema>),
    _returnSchema: TSchema
  ): S.declare<() => S.Schema.Type<TSchema>>
  <TSchema extends S.Top>(
    guard: (u: unknown) => u is (() => S.Schema.Type<TSchema>)
  ): (_returnSchema: TSchema) => S.declare<() => S.Schema.Type<TSchema>>
} = dual(
  2,
  <TSchema extends S.Top>(
    guard: (u: unknown) => u is (() => S.Schema.Type<TSchema>),
    _returnSchema: TSchema
  ): S.declare<() => S.Schema.Type<TSchema>> => {
    assertGuard(guard);
		return S.declare<() => S.Schema.Type<TSchema>>(guard)
  }
);
