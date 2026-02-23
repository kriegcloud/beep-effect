import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";

interface ArrayLookupSchema<Literals extends A.NonEmptyReadonlyArray<AST.LiteralValue>>
  extends S.transformOrFail<typeof S.Number, S.Literal<Literals>> {
  readonly literals: Literals;
}

const makeArrayLookupClass = <Literals extends A.NonEmptyReadonlyArray<AST.LiteralValue>>(literals: Literals) => {
  const reverseLookup = pipe(
    literals,
    A.map((literal, index) => [literal, index] as const),
    HashMap.fromIterable
  );

  return class extends S.transformOrFail(S.Number, S.Literal<Literals>(...literals), {
    strict: true,
    decode: (index) =>
      pipe(
        A.get(literals, index),
        O.match({
          onSome: ParseResult.succeed,
          onNone: () =>
            ParseResult.fail(new ParseResult.Unexpected(index, `Index ${index} not found in literals array`)),
        })
      ),
    encode: (literal) =>
      pipe(
        HashMap.get(reverseLookup, literal as A.ReadonlyArray.Infer<Literals>),
        O.match({
          onSome: ParseResult.succeed,
          onNone: () =>
            ParseResult.fail(new ParseResult.Unexpected(literal, `Literal ${literal} not found in literals array`)),
        })
      ),
  }) {
    static literals = literals;
  } as ArrayLookupSchema<Literals>;
};

const ArrayLookupSchema = <Literals extends A.NonEmptyReadonlyArray<AST.LiteralValue>>(
  literals: Literals
): ArrayLookupSchema<Literals> => makeArrayLookupClass(literals);

export { ArrayLookupSchema };
