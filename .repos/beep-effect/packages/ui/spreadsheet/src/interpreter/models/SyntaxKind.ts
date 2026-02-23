import { $UISpreadsheetId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $UISpreadsheetId.create("interpreter/models/SyntaxKind");

export class UnknkownCharachterError extends S.TaggedError<UnknkownCharachterError>($I`UnknkownCharachterError`)(
  "UnknkownCharachterError",
  {
    char: S.String,
  },
  $I.annotations("UnknkownCharachterError", {
    description: "Thrown when an unknown character is encountered",
  })
) {
  static readonly new = (char: string) => new UnknkownCharachterError({ char });
}

export class SyntaxKind extends BS.StringLiteralKit(
  "asterisk",
  "caret",
  "cell",
  "close-parenthesis",
  "colon",
  "equal",
  "minus",
  "mod",
  "number",
  "open-parenthesis",
  "plus",
  "ref",
  "slash",
  {
    enumMapping: [
      ["asterisk", "AsteriskToken"],
      ["caret", "CaretToken"],
      ["cell", "CellToken"],
      ["close-parenthesis", "CloseParenthesis"],
      ["colon", "ColonToken"],
      ["equal", "EqualToken"],
      ["minus", "MinusToken"],
      ["mod", "ModToken"],
      ["number", "NumberLiteral"],
      ["open-parenthesis", "OpenParenthesis"],
      ["plus", "PlusToken"],
      ["ref", "RefToken"],
      ["slash", "SlashToken"],
    ],
  }
).annotations(
  $I.annotations("Kind", {
    description: "The Tokenizer SyntaxKind",
  })
) {}

export const SyntaxKindEnum = SyntaxKind.Enum;

export declare namespace SyntaxKind {
  export type Type = S.Schema.Type<typeof SyntaxKind>;
  export type Encoded = S.Schema.Encoded<typeof SyntaxKind>;
  export type Enum = typeof SyntaxKindEnum;
}

export const makeTokenKind = SyntaxKind.toTagged("kind").composer({});

export class NumberToken extends S.Class<NumberToken>($I`NumberToken`)(
  makeTokenKind.number({
    value: S.String,
  }),
  $I.annotations("NumberToken", {
    description: "A token representing a number",
  })
) {}

export class CellToken extends S.Class<CellToken>($I`CellToken`)(
  makeTokenKind.cell({
    cell: S.String,
  }),
  $I.annotations("CellToken", {
    description: "A token representing a cell",
  })
) {}

export class RefToken extends S.Class<RefToken>($I`RefToken`)(
  makeTokenKind.ref({
    ref: S.String,
  }),
  $I.annotations("RefToken", {
    description: "A token representing a reference",
  })
) {}

export class SimpleCharTokenKind extends BS.StringLiteralKit(
  ...SyntaxKind.pickOptions(
    "asterisk",
    "caret",
    "colon",
    "equal",
    "minus",
    "mod",
    "plus",
    "slash",
    "close-parenthesis",
    "open-parenthesis"
  ),
  {
    enumMapping: [
      ["asterisk", "AsteriskToken"],
      ["caret", "CaretToken"],
      ["colon", "ColonToken"],
      ["equal", "EqualToken"],
      ["minus", "MinusToken"],
      ["mod", "ModToken"],
      ["plus", "PlusToken"],
      ["slash", "SlashToken"],
      ["close-parenthesis", "CloseParenthesis"],
      ["open-parenthesis", "OpenParenthesis"],
    ],
  }
).annotations(
  $I.annotations("SimpleCharTokenKind", {
    description: "The Tokenizer SimpleCharTokenKind",
  })
) {}

export const SimpleCharTokenKindEnum = SimpleCharTokenKind.Enum;

export declare namespace SimpleCharTokenKind {
  export type Type = S.Schema.Type<typeof SimpleCharTokenKind>;
  export type Encoded = S.Schema.Encoded<typeof SimpleCharTokenKind>;
  export type Enum = typeof SimpleCharTokenKindEnum;
}

export const makeSimpleCharToken = SimpleCharTokenKind.toTagged("kind").composer({});

export class SimpleCharToken extends S.Union(
  makeSimpleCharToken.asterisk({}),
  makeSimpleCharToken.caret({}),
  makeSimpleCharToken["close-parenthesis"]({}),
  makeSimpleCharToken.colon({}),
  makeSimpleCharToken.equal({}),
  makeSimpleCharToken.minus({}),
  makeSimpleCharToken.mod({}),
  makeSimpleCharToken["open-parenthesis"]({}),
  makeSimpleCharToken.plus({}),
  makeSimpleCharToken.slash({})
).annotations(
  $I.annotations("SimpleCharToken", {
    description: "A token representing a simple character",
  })
) {
  static readonly make = (kind: SimpleCharTokenKind.Type) => S.decodeSync(SimpleCharToken)({ kind });
}

export declare namespace SimpleCharToken {
  export type Type = typeof SimpleCharToken.Type;
  export type Encoded = typeof SimpleCharToken.Encoded;
}

export class Token extends S.Union(CellToken, NumberToken, RefToken, SimpleCharToken).annotations(
  $I.annotations("Token", {
    description: "A token representing a simple character",
  })
) {}

export declare namespace Token {
  export type Type = typeof Token.Type;
  export type Encoded = typeof Token.Encoded;
}

export class SyntaxKindFromSimpleChar extends BS.MappedLiteralKit(
  ["+", SimpleCharTokenKind.Enum.PlusToken],
  ["-", SimpleCharTokenKind.Enum.MinusToken],
  ["*", SimpleCharTokenKind.Enum.AsteriskToken],
  ["/", SimpleCharTokenKind.Enum.SlashToken],
  ["=", SimpleCharTokenKind.Enum.EqualToken],
  ["(", SimpleCharTokenKind.Enum.OpenParenthesis],
  [")", SimpleCharTokenKind.Enum.CloseParenthesis],
  ["^", SimpleCharTokenKind.Enum.CaretToken],
  ["%", SimpleCharTokenKind.Enum.ModToken],
  [":", SimpleCharTokenKind.Enum.ColonToken]
) {}
