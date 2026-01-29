import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as S from "effect/Schema";

import { SimpleCharToken, SyntaxKind, SyntaxKindFromSimpleChar, type Token } from "./models/SyntaxKind";

export const isDigit = S.is(S.String.pipe(S.pattern(/\d/)));

export const isCapLetter = S.is(S.String.pipe(S.pattern(/[A-Z]/)));

export const extractNum = (input: string, current: number) => {
  let value = "";
  let hasDecimals = false;

  while (input[current]) {
    if (isDigit(input[current])) {
      value += input[current];
    } else if (input[current] === "." && !hasDecimals) {
      value += ".";
      hasDecimals = true;
    } else {
      break;
    }
    current++;
  }
  return value;
};

function extractWord(input: string, current: number): string {
  let word = "";

  while (isCapLetter(input[current])) {
    word += input[current];
    current++;
  }

  return word;
}

function extractCell(input: string, current: number): string {
  if (!isCapLetter(input[current])) {
    throw new Error(`Expected cap letter but got ${input[current]}`);
  }

  if (!isDigit(input[current + 1])) {
    throw new Error(`Expected digit but got ${input[current + 1]} ${input}`);
  }

  return `${input[current]}${input[current + 1]}`;
}

function extractCellRef(input: string, current: number): string {
  let result = "";

  current += 4;
  while (input[current] !== ")") {
    result += input[current];
    current++;
  }

  return result;
}

export default function tokenizer(input: string): Token.Type[] {
  let current = 0;

  const tokens = A.empty<Token.Type>();

  while (current < input.length) {
    const char = input[current];

    HashMap.get(char)(SyntaxKindFromSimpleChar.Map).pipe(
      O.match({
        onSome: (kind) => {
          tokens.push(SimpleCharToken.make(kind));
          current++;
        },
        onNone: () =>
          Match.value(char).pipe(
            Match.when(isDigit, () => {
              const numberAsString = extractNum(input, current);
              current += numberAsString.length;
              tokens.push({
                kind: SyntaxKind.Enum.NumberLiteral,
                value: numberAsString,
              });
            }),
            Match.when(isCapLetter, () => {
              const word = extractWord(input, current);
              return F.pipe(
                word,
                O.liftPredicate(Eq.equals("REF")),
                O.match({
                  onNone: () => {
                    const cell = extractCell(input, current);
                    current += cell.length;
                    tokens.push({
                      kind: SyntaxKind.Enum.CellToken,
                      cell,
                    });
                  },
                  onSome: () => {
                    const ref = extractCellRef(input, current);
                    current += ref.length + 5;
                    tokens.push({
                      kind: SyntaxKind.Enum.RefToken,
                      ref,
                    });
                  },
                })
              );
            }),
            Match.orElseAbsurd
          ),
      })
    );
  }

  return tokens;
}

export const toString = Match.type<Token.Type>().pipe(
  Match.discriminator("kind")(
    SyntaxKind.Enum.AsteriskToken,
    SyntaxKind.Enum.CaretToken,
    SyntaxKind.Enum.CloseParenthesis,
    SyntaxKind.Enum.EqualToken,
    SyntaxKind.Enum.MinusToken,
    SyntaxKind.Enum.ModToken,
    SyntaxKind.Enum.OpenParenthesis,
    SyntaxKind.Enum.PlusToken,
    SyntaxKind.Enum.SlashToken,
    SyntaxKind.Enum.ColonToken,
    ({ kind }) => SyntaxKindFromSimpleChar.EncodedEnum[kind]
  ),
  Match.discriminatorsExhaustive("kind")({
    cell: (token) => token.cell,
    number: (token) => token.value.toString(),
    ref: (token) => `REF("${token.ref}")`,
  })
);
