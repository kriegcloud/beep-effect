import type {ParserOptions} from "../ParserOptions.ts";
import * as S from "effect/Schema";
import {$SchemaId} from "@beep/identity";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Eq from "effect/Equal";

export const $I = $SchemaId.create("csv/parse/parser/Token");


export class Token extends S.Class<Token>($I`Token`)(
  {
    token: S.String,
    startCursor: S.Number,
    endCursor: S.Number
  },
  $I.annote(
    "Token",
    {}
  )
) {
  public static isTokenRowDelimiter(token: Token): boolean {
    const content = token.token;
    return content === '\r' || content === '\n' || content === '\r\n';
  }

  public static isTokenCarriageReturn(
    token: Token,
    parserOptions: ParserOptions
  ): boolean {
    return token.token === parserOptions.carriageReturn;
  }

  public static isTokenComment(
    token: Token,
    parserOptions: ParserOptions
  ): boolean {
    return parserOptions.supportsComments && P.isNotNullish(token) && parserOptions.comment.pipe(
      O.flatMap(O.liftPredicate(Eq.equals(token.token))),
      O.isSome
    )
  }

  public static isTokenEscapeCharacter(
    token: Token,
    parserOptions: ParserOptions
  ): boolean {
    return parserOptions.escapeChar.pipe(
      O.flatMap(O.liftPredicate(Eq.equals(token.token))),
      O.isSome
    )
  }

  public static isTokenQuote(
    token: Token,
    parserOptions: ParserOptions
  ): boolean {
    return parserOptions.quote.pipe(
      O.flatMap(O.liftPredicate(Eq.equals(token.token))),
      O.isSome
    );
  }

  public static isTokenDelimiter(
    token: Token,
    parserOptions: ParserOptions
  ): boolean {
    return token.token === parserOptions.delimiter;
  }
}
