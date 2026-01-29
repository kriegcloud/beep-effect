import { $UISpreadsheetId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as Num from "effect/Number";

import * as O from "effect/Option";
import * as Str from "effect/String";
import type { ExpressionResult } from "./models";

const $I = $UISpreadsheetId.create("interpreter/utils");

export const EXPRESSION_ERROR = "ERROR" as const;

export function convertNumberToLetter(index: number) {
  return Str.codePointAt(index + 65);
}

export const convertLetterToNumber = (letter: string) => Str.codePointAt(letter, 0).pipe(O.map(Num.subtract(65)));

export class HeaderLabelType extends BS.StringLiteralKit("column", "row").annotations(
  $I.annotations("HeaderLabelType", {
    description: "Header label type",
  })
) {}

export declare namespace HeaderLabelType {
  export type Type = typeof HeaderLabelType.Type;
}

export const getHeaderLabel = (index: number, type: HeaderLabelType.Type) =>
  HeaderLabelType.is.column(type) ? convertNumberToLetter(index) : index + 1;

function roundTo2Decimals(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

export function formatExpressionResult(expressionResult: ExpressionResult.Result.Type) {
  if (expressionResult.type === "string") {
    return expressionResult.value;
  }
  if (expressionResult.type === "number") {
    return roundTo2Decimals(expressionResult.value);
  }
  return EXPRESSION_ERROR;
}
