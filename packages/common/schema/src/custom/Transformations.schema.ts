import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

export class IntFromStr extends S.transformOrFail(S.String, S.Int, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeSync(S.Int)(Number.parseInt(i, -10)),
      catch: () => new ParseResult.Type(ast, i, "Invalid int from string"),
    }),
  encode: (i, _, ast) => ParseResult.succeed(String(i)),
}).annotations({
  schemaId: Symbol.for("@beep/schema/transformations/IntFromStr"),
  identifier: "IntFromStr",
  title: "Integer from String",
  description: "Transforms a string into an integer",
}) {}

export declare namespace IntFromStr {
  export type Type = typeof IntFromStr.Type;
  export type Encoded = typeof IntFromStr.Encoded;
}
