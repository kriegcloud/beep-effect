import type * as B from "effect/Brand";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";

export type UUIDSchema<Brand extends string> = S.PropertySignature<
  ":",
  string & B.Brand<Brand>,
  never,
  "?:",
  string | undefined,
  true,
  never
>;

export const UUIDWithDefaults = <const Brand extends string>(brand: Brand): UUIDSchema<Brand> =>
  F.pipe(F.constant(uuid() as B.Branded<string, Brand>), (uuid) =>
    S.UUID.pipe(
      S.brand(brand),
      S.optional,
      S.withDefaults({
        decoding: uuid,
        constructor: uuid,
      })
    )
  );

export namespace UUIDWithDefaults {
  export type Type<Brand extends string> = S.Schema.Type<UUIDSchema<Brand>>;
  export type Encoded<Brand extends string> = S.Schema.Encoded<UUIDSchema<Brand>>;
}
