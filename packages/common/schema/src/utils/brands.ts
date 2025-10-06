import type * as B from "effect/Brand";

export const makeBranded = <const Brand extends string, const Type>(value: Type) => value as B.Branded<Type, Brand>;
