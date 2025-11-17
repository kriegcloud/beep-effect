import * as Arbitrary from "effect/Arbitrary";
import type * as B from "effect/Brand";
import * as FC from "effect/FastCheck";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import RandExp from "randexp-ts";
import { CustomId } from "./_id";

const Id = CustomId.compose("regex");
export const Regex = S.instanceOf(RegExp)
  .pipe(S.brand("Regex"))
  .annotations(
    Id.annotations("Regex", {
      description: "A regular expression",
      arbitrary: () => (fc) =>
        fc
          .constant(null)
          .map(() => new RegExp(new RandExp(/<([a-z]\w{0,20})>foo<\1>/).gen()) as B.Branded<RegExp, "Regex">),
    })
  );

export declare namespace Regex {
  /** Regex value type. */
  export type Type = typeof Regex.Type;
  /** Encoded Regex value type. */
  export type Encoded = typeof Regex.Encoded;
}

export class RegexFromString extends S.NonEmptyTrimmedString.pipe(
  S.transformOrFail(Regex, {
    strict: true,
    decode: (value, _, ast) =>
      ParseResult.try({
        try: () => Regex.make(new RegExp(value)),
        catch: () => new ParseResult.Type(ast, value, "Invalid regular expression"),
      }),
    encode: (value) => ParseResult.succeed(value.toString()),
  })
).annotations(
  Id.annotations("RegexFromString", {
    description: "A string that is a valid regular expression",
    arbitrary: () => (fc) => fc.constant(null).map(() => FC.sample(Arbitrary.make(Regex), 1)[0] as typeof Regex.Type),
  })
) {
  static readonly make = (value: string) => S.decodeSync(RegexFromString)(value);
}
export declare namespace RegexFromString {
  /** RegexFromString value type. */
  export type Type = typeof RegexFromString.Type;
  /** Encoded RegexFromString value type. */
  export type Encoded = typeof RegexFromString.Encoded;
}
