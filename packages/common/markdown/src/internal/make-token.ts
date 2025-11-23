import type { StringTypes } from "@beep/types";
import * as S from "effect/Schema";

export const makeToken = <const TokenType extends StringTypes.NonEmptyString, const Fields extends S.Struct.Fields>(
  token: TokenType,
  fields: Fields
): TokenSchema<TokenType, Fields> =>
  S.Struct({
    type: S.Literal(token).pipe(
      S.optional,
      S.withDefaults({
        constructor: () => token,
        decoding: () => token,
      })
    ),
    raw: S.String,
    ...fields,
  });

export type TokenSchema<TokenType extends StringTypes.NonEmptyString, Fields extends S.Struct.Fields> = S.Struct<
  {
    readonly type: S.PropertySignature<
      ":",
      Exclude<TokenType, undefined>,
      never,
      "?:",
      TokenType | undefined,
      true,
      never
    >;
    readonly raw: typeof S.String;
  } & Fields
>;
