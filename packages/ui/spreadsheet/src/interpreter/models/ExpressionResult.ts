import { $UISpreadsheetId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $UISpreadsheetId.create("interpreter/models/ExpressionResult");

export class ResultType extends BS.StringLiteralKit("error", "number", "string").annotations(
  $I.annotations("ResultType", {
    description: "The type of expression result",
  })
) {}

export declare namespace ResultType {
  export type Type = typeof ResultType.Type;
}

const makeResultClass = ResultType.toTagged("type").composer({});

export class ExpressionResultError extends S.Class<ExpressionResultError>($I`ExpressionResultError`)(
  makeResultClass.error({}),
  $I.annotations("ExpressionResultError", {
    description: "The error result of an expression",
  })
) {}

export class ExpressionResultNumber extends S.Class<ExpressionResultNumber>($I`ExpressionResultNumber`)(
  makeResultClass.number({
    value: S.Number,
  }),
  $I.annotations("ExpressionResultNumber", {
    description: "The number result of an expression",
  })
) {}

export class ExpressionResultString extends S.Class<ExpressionResultString>($I`Expression`)(
  makeResultClass.string({
    value: S.String,
  }),
  $I.annotations("Expression", {
    description: "The string result of an expression",
  })
) {}

export class ExpressionResult extends S.Union(ExpressionResultError, ExpressionResultNumber, ExpressionResultString).annotations(
  $I.annotations("ExpressionResult", {
    description: "The result of an expression",
  })
) {}

export declare namespace ExpressionResult {
  export type Type = typeof ExpressionResult.Type;
  export type Encoded = typeof ExpressionResult.Encoded;
}
