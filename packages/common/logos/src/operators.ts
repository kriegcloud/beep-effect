import { stringLiteralKit } from "@beep/schema/kits";
import * as S from "effect/Schema";
import { Op } from "./internal";
export class LogicalOp extends S.Literal("and", "or") {
  static readonly decode = S.decode(LogicalOp);
  static readonly is = S.is(LogicalOp);
}

export namespace LogicalOp {
  export type Type = "and" | "or";
}

export namespace Eq {
  export const { op, Schema } = Op.make("eq", "equals");

  export type Type = Op.Type<"eq">;
}

export namespace Ne {
  export const { op, Schema } = Op.make("ne", "does not equal");

  export type Type = Op.Type<"ne">;
}

export namespace In {
  export const { op, Schema } = Op.make("in", "contains");

  export type Type = Op.Type<"in">;
}

export namespace NotIn {
  export const { op, Schema } = Op.make("notIn", "does not contain");

  export type Type = Op.Type<"notIn">;
}

export namespace AllIn {
  export const { op, Schema } = Op.make("allIn", "contains all");

  export type Type = Op.Type<"allIn">;
}

export namespace StartsWith {
  export const { op, Schema } = Op.make("startsWith", "starts with");

  export type Type = Op.Type<"startsWith">;
}

export namespace NotStartsWith {
  export const { op, Schema } = Op.make(
    "doesNotStartWith",
    "does not start with",
  );

  export type Type = Op.Type<"doesNotStartWith">;
}

export namespace EndsWith {
  export const { op, Schema } = Op.make("endsWith", "ends with");

  export type Type = Op.Type<"endsWith">;
}

export namespace NotEndsWith {
  export const { op, Schema } = Op.make("doesNotEndWith", "does not end with");

  export type Type = Op.Type<"doesNotEndWith">;
}

export namespace Matches {
  export const { op, Schema } = Op.make("matches", "matches regex");

  export type Type = Op.Type<"matches">;
}

export namespace IsBefore {
  export const { op, Schema } = Op.make("isBefore", "is before");

  export type Type = Op.Type<"isBefore">;
}

export namespace IsAfter {
  export const { op, Schema } = Op.make("isAfter", "is after");

  export type Type = Op.Type<"isAfter">;
}

export namespace IsBetween {
  export const { op, Schema } = Op.make("isBetween", "is between");

  export type Type = Op.Type<"isBetween">;
}

export namespace Gt {
  export const { op, Schema } = Op.make("gt", "greater than");

  export type Type = Op.Type<"gt">;
}

export namespace Gte {
  export const { op, Schema } = Op.make("gte", "greater than or equal to");

  export type Type = Op.Type<"gte">;
}

export namespace Lt {
  export const { op, Schema } = Op.make("lt", "less than");

  export type Type = Op.Type<"lt">;
}

export namespace Lte {
  export const { op, Schema } = Op.make("lte", "less than or equal to");

  export type Type = Op.Type<"lte">;
}

export namespace IsTrue {
  export const { op, Schema } = Op.make("isTrue", "is true");

  export type Type = Op.Type<"isTrue">;
}

export namespace IsFalse {
  export const { op, Schema } = Op.make("isFalse", "is false");

  export type Type = Op.Type<"isFalse">;
}

export namespace IsString {
  export const { op, Schema } = Op.make("isString", "is string");

  export type Type = Op.Type<"isString">;
}

export namespace IsNotString {
  export const { op, Schema } = Op.make("isNotString", "is not string");

  export type Type = Op.Type<"isNotString">;
}

export namespace IsNumber {
  export const { op, Schema } = Op.make("isNumber", "is number");

  export type Type = Op.Type<"isNumber">;
}

export namespace IsNotNumber {
  export const { op, Schema } = Op.make("isNotNumber", "is not number");

  export type Type = Op.Type<"isNotNumber">;
}

export namespace IsTruthy {
  export const { op, Schema } = Op.make("isTruthy", "is truthy");

  export type Type = Op.Type<"isTruthy">;
}

export namespace IsFalsy {
  export const { op, Schema } = Op.make("isFalsy", "is falsy");

  export type Type = Op.Type<"isFalsy">;
}

export namespace IsNull {
  export const { op, Schema } = Op.make("isNull", "is null");

  export type Type = Op.Type<"isNull">;
}

export namespace IsNotNull {
  export const { op, Schema } = Op.make("isNotNull", "is not null");

  export type Type = Op.Type<"isNotNull">;
}

export namespace IsEmpty {
  export const { op, Schema } = Op.make("isEmpty", "is empty");

  export type Type = Op.Type<"isEmpty">;
}

export namespace IsNotEmpty {
  export const { op, Schema } = Op.make("isNotEmpty", "is not empty");

  export type Type = Op.Type<"isNotEmpty">;
}

export namespace IsUndefined {
  export const { op, Schema } = Op.make("isUndefined", "is undefined");

  export type Type = Op.Type<"isUndefined">;
}

export namespace IsDefined {
  export const { op, Schema } = Op.make("isDefined", "is defined");

  export type Type = Op.Type<"isDefined">;
}

export namespace IsBoolean {
  export const { op, Schema } = Op.make("isBoolean", "is boolean");

  export type Type = Op.Type<"isBoolean">;
}

export namespace IsNotBoolean {
  export const { op, Schema } = Op.make("isNotBoolean", "is not boolean");

  export type Type = Op.Type<"isNotBoolean">;
}

export namespace IsArray {
  export const { op, Schema } = Op.make("isArray", "is array");

  export type Type = Op.Type<"isArray">;
}

export namespace IsNotArray {
  export const { op, Schema } = Op.make("isNotArray", "is not array");

  export type Type = Op.Type<"isNotArray">;
}

export namespace IsObject {
  export const { op, Schema } = Op.make("isObject", "is object");

  export type Type = Op.Type<"isObject">;
}

export namespace IsNotObject {
  export const { op, Schema } = Op.make("isNotObject", "is not object");

  export type Type = Op.Type<"isNotObject">;
}

export const { Enum: OperatorEnum, Schema: Operator } = stringLiteralKit(
  Eq.op,
  Ne.op,
  In.op,
  NotIn.op,
  AllIn.op,
  StartsWith.op,
  NotStartsWith.op,
  EndsWith.op,
  NotEndsWith.op,
  Matches.op,
  IsBefore.op,
  IsAfter.op,
  IsBetween.op,
  Gt.op,
  Gte.op,
  Lt.op,
  Lte.op,
  IsTrue.op,
  IsFalse.op,
  IsString.op,
  IsNotString.op,
  IsNumber.op,
  IsNotNumber.op,
  IsTruthy.op,
  IsFalsy.op,
  IsNull.op,
  IsNotNull.op,
  IsEmpty.op,
  IsNotEmpty.op,
  IsUndefined.op,
  IsDefined.op,
  IsBoolean.op,
  IsNotBoolean.op,
  IsArray.op,
  IsNotArray.op,
  IsObject.op,
  IsNotObject.op,
)({
  identifier: "Operator",
  title: "Operator",
  description: "The supported rule operators",
});
