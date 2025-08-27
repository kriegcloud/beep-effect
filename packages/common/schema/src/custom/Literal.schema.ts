import type * as A from "effect/Array";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";

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
