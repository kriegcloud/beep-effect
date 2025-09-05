import type { StringTypes } from "@beep/types";
import type * as A from "effect/Array";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import type { DefaultAnnotations } from "../annotations";

export function LiteralDefaults<const Literals extends A.NonEmptyReadonlyArray<AST.LiteralValue>>(
  ...literals: Literals
) {
  return (defaultValue: Literals[number]) => {
    return S.Literal(...literals)
      .pipe(
        S.optional,
        S.withDefaults({
          decoding: () => defaultValue,
          constructor: () => defaultValue,
        })
      )
      .annotations({
        default: defaultValue,
      });
  };
}

export namespace LiteralDefaults {
  export type Type<Literals extends A.NonEmptyReadonlyArray<AST.LiteralValue>> = S.Schema.Type<
    ReturnType<typeof LiteralDefaults<Literals>>
  >;
  export type Encoded<Literals extends A.NonEmptyReadonlyArray<AST.LiteralValue>> = S.Schema.Encoded<
    ReturnType<typeof LiteralDefaults<Literals>>
  >;
}

export const LiteralWithDefault = <const Literal extends StringTypes.NonEmptyString<string>>(
  value: Literal,
  annotations?: DefaultAnnotations<
    S.Schema.Type<S.PropertySignature<":", Exclude<Literal, undefined>, never, "?:", Literal | undefined, true, never>>
  >
): S.PropertySignature<":", Exclude<Literal, undefined>, never, "?:", Literal | undefined, true, never> =>
  S.Literal(value)
    .pipe(
      S.optional,
      S.withDefaults({
        constructor: () => value,
        decoding: () => value,
      })
    )
    .annotations(annotations ?? {});

export namespace LiteralWithDefault {
  export type Schema<Literal extends string> = S.PropertySignature<
    ":",
    Exclude<Literal, undefined>,
    never,
    "?:",
    Literal | undefined,
    true,
    never
  >;
  export type Type<Literal extends string> = S.Schema.Type<Schema<Literal>>;
  export type Encoded<Literal extends string> = S.Schema.Encoded<Schema<Literal>>;
}
