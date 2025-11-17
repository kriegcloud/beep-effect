import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("transformations");
export class IntFromStr extends S.transformOrFail(S.String, S.Int, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeSync(S.Int)(Number.parseInt(i, -10)),
      catch: () => new ParseResult.Type(ast, i, "Invalid int from string"),
    }),
  encode: (i, _) => ParseResult.succeed(String(i)),
}).annotations(
  Id.annotations("IntFromStr", {
    description: "Transforms a string into an integer",
  })
) {}

export declare namespace IntFromStr {
  export type Type = typeof IntFromStr.Type;
  export type Encoded = typeof IntFromStr.Encoded;
}
