import {$SchemaId} from "@beep/identity";
import * as S from "effect/Schema";
import * as P from "effect/Predicate";
import {Brand} from "effect";
import {dual} from "effect/Function";
import * as SchemaUtils from "./SchemaUtils/index.ts";

const $I = $SchemaId.create("Thunk");

export const TypeId = $I`Thunk`;
export type TypeId = typeof TypeId;

export type Thunk = Brand.Branded<string, TypeId>
const guard = (u: unknown): u is (() => unknown) => P.isFunction(u);
export const nominal = Brand.make(guard);

export const Thunk = S.declare(guard)
.pipe(
	S.fromBrand(
		TypeId,
		nominal
	),
	$I.annoteSchema(
		"Thunk",
		{
			description: "A schema for a function that returns a value."
		}
	),
	SchemaUtils.withStatics(() => ({
		generic: <T = never>(guard: (u: unknown) => u is (() => T)) => S.declare(guard)
	}))
);

export const isThunk = S.is(Thunk);


export const make: {
	<TSchema extends S.Top, T>(
		guard: (u: unknown) => u is (() => T),
		_returnSchema: S.Schema<TSchema>
	): S.declare<() => T, () => T>
	<T>(guard: (u: unknown) => u is (() => T)): <TSchema extends S.Top>(_returnSchema: S.Schema<TSchema>) => S.declare<() => T, () => T>
} = dual(
	2,
	<TSchema extends S.Top, T = never>(
		guard: (u: unknown) => u is (() => T),
		_returnSchema: S.Schema<TSchema>
	): S.declare<() => T, () => T> => {

		return S.declare(guard);
	}
);
const g = (u: unknown): u is string  => P.isString(u)
const l = make(g)