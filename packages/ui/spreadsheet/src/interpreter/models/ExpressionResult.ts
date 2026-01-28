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

export class ResultError extends S.Class<ResultError>($I`ResultError`)(
  makeResultClass.error({}),
  $I.annotations("ResultError", {
    description: "The error result of an expression",
  })
) {}

export class ResultNumber extends S.Class<ResultNumber>($I`ResultNumber`)(
  makeResultClass.number({
    value: S.Number,
  }),
  $I.annotations("ResultNumber", {
    description: "The number result of an expression",
  })
) {}

export class ResultString extends S.Class<ResultString>($I`ResultString`)(
  makeResultClass.string({
    value: S.String,
  }),
  $I.annotations("ResultString", {
    description: "The string result of an expression",
  })
) {}

export class Result extends S.Union(ResultError, ResultNumber, ResultString).annotations(
  $I.annotations("Result", {
    description: "The result of an expression",
  })
) {}

export declare namespace Result {
  export type Type = typeof Result.Type;
  export type Encoded = typeof Result.Encoded;
}
