import * as S from "effect/Schema";

export const BrandedUUID = <const Brand extends string>(brand: Brand) => S.UUID.pipe(S.brand(brand));
