import * as B from "effect/Brand";
export const makeBranded = <const Brand extends string, const Type>(value: Type) => value as B.Branded<Type, Brand>;

export const brand = <const Type extends B.Brand<any>>(value: B.Brand.Unbranded<Type>) => B.nominal<Type>()(value);
