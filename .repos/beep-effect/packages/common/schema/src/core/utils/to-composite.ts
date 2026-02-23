import type * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import type * as AST from "effect/SchemaAST";

export const toComposite = <A, R, B>(
  eff: Effect.Effect<A, ParseResult.ParseIssue, R>,
  onSuccess: (a: A) => B,
  ast: AST.AST,
  actual: unknown
): Effect.Effect<B, ParseResult.Composite, R> =>
  ParseResult.mapBoth(eff, {
    onFailure: (e) => new ParseResult.Composite(ast, actual, e),
    onSuccess,
  });
