import {$SchemaId} from "@beep/identity";
import * as S from "effect/Schema";
import * as P from "effect/Predicate";
import {Brand} from "effect";
import {SchemaUtils} from "./utils/ind";

const $I = $SchemaId.create("Thunk");

export const TypeId = $I`Thunk`;
export type TypeId = typeof TypeId;

export type Thunk = Brand.Branded<string, TypeId>
const guard = (u: unknown): u is (() => unknown) => P.isFunction(u);
export const nominal = Brand.make(guard);

export const Thunk = S.declare(guard)
.pipe(S.fromBrand(
	TypeId,
	nominal
),
	SchemaUtils.withStatics((schema) => {
		make: (payload: () => unknown) => S.decodeUnknownSync(schema)(payload)
	})
);
