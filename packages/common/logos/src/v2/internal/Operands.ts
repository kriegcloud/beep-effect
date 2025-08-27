import type {StringTypes, StructTypes} from "@beep/types";
import * as S from "effect/Schema";

export namespace Operand {
  export const make = <const Tag extends StringTypes.NonEmptyString<string>>(
    tag: Tag,
    label: StringTypes.NonEmptyString<string>,
  ) => {
    const Schema = <
      const A,
      const E,
      const R,
      const Extra extends StructTypes.StructFieldsWithStringKeys,
    >(valueSchema: S.Schema<A, E, R>, fields: Extra) =>
      S.Struct({_tag: S.Literal(tag), value: valueSchema, ...fields});

    return {
      label,
      Schema,
    };
  };
}

export namespace Eq {
  export const {Schema, label} = Operand.make("eq", "equals");
}

export namespace Neq {
  export const {Schema, label} = Operand.make("ne", "does not equal");
}

export namespace Gt {
  export const {Schema, label} = Operand.make("gt", "greater than");
}

export namespace Gte {
  export const {Schema, label} = Operand.make(
    "gte",
    "greater than or equal to",
  );
}

export namespace Lt {
  export const {Schema, label} = Operand.make("lt", "less than");
}

export namespace Lte {
  export const {Schema, label} = Operand.make("lte", "less than or equal to");
}

export namespace Between {
  export const {Schema, label} = Operand.make("between", "between");
}

export namespace StartsWith {
  export const {Schema, label} = Operand.make("startsWith", "starts with");
}

export namespace EndsWith {
  export const {Schema, label} = Operand.make("endsWith", "ends with");
}

export namespace Contains {
  export const {Schema, label} = Operand.make("contains", "contains");
}

export namespace NotContains {
  export const {Schema, label} = Operand.make(
    "notContains",
    "does not contain",
  );
}

export namespace Matches {
  export const {Schema, label} = Operand.make("matches", "string matches");
}

export namespace IsFalse {
  export const {Schema, label} = Operand.make("isFalse", "is false");
}

export namespace IsTrue {
  export const {Schema, label} = Operand.make("isTrue", "is true");
}

export namespace IsString {
  export const {Schema, label} = Operand.make("isString", "is string");
}

export namespace IsNumber {
  export const {Schema, label} = Operand.make("isNumber", "is number");
}

export namespace IsTruthy {
  export const {Schema, label} = Operand.make("isTruthy", "is truthy");
}

export namespace IsFalsy {
  export const {Schema, label} = Operand.make("isFalsy", "is falsy");
}

export namespace IsNull {
  export const {Schema, label} = Operand.make("isNull", "is null");
}

export namespace IsUndefined {
  export const {Schema, label} = Operand.make("isUndefined", "is undefined");
}

export namespace IsBoolean {
  export const {Schema, label} = Operand.make("isBoolean", "is boolean");
}

export namespace IsArray {
  export const {Schema, label} = Operand.make("isArray", "is array");
}

export namespace IsObject {
  export const {Schema, label} = Operand.make("isObject", "is object");
}

export namespace InSet {
  export const {Schema, label} = Operand.make("inSet", "in set");
}

export namespace OneOf {
  export const {Schema, label} = Operand.make("oneOf", "one of");
}

export namespace AllOf {
  export const {Schema, label} = Operand.make("allOf", "all of");
}

export namespace NoneOf {
  export const {Schema, label} = Operand.make("noneOf", "none of");
}

export namespace IsSameDay {
  export const {Schema, label} = Operand.make("isSameDay", "is same day");
}

export namespace IsSameWeek {
  export const {Schema, label} = Operand.make("isSameWeek", "is same week");
}

export namespace IsSameMonth {
  export const {Schema, label} = Operand.make("isSameMonth", "is same month");
}

export namespace IsSameYear {
  export const {Schema, label} = Operand.make("isSameYear", "is same year");
}

export namespace IsSameHour {
  export const {Schema, label} = Operand.make("isSameHour", "is same hour");
}

export const makeCoreOperand = <
  const Tag extends StringTypes.NonEmptyString<string>,
>(
  tag: Tag,
) =>
  S.Struct(
    {
      _tag: S.Literal(tag),
    },
    S.Record({
      key: S.String,
      value: S.Any,
    }),
  );

export class AnyOperator extends S.Union(
  makeCoreOperand("eq"),
  makeCoreOperand("ne"),
  makeCoreOperand("gt"),
  makeCoreOperand("gte"),
  makeCoreOperand("lt"),
  makeCoreOperand("lte"),
  makeCoreOperand("between"),
  makeCoreOperand("startsWith"),
  makeCoreOperand("endsWith"),
  makeCoreOperand("contains"),
  makeCoreOperand("notContains"),
  makeCoreOperand("matches"),
  makeCoreOperand("isFalse"),
  makeCoreOperand("isTrue"),
  makeCoreOperand("isString"),
  makeCoreOperand("isNumber"),
  makeCoreOperand("isTruthy"),
  makeCoreOperand("isFalsy"),
  makeCoreOperand("isNull"),
  makeCoreOperand("isUndefined"),
  makeCoreOperand("isBoolean"),
  makeCoreOperand("isArray"),
  makeCoreOperand("isObject"),
  makeCoreOperand("inSet"),
  makeCoreOperand("oneOf"),
  makeCoreOperand("allOf"),
  makeCoreOperand("noneOf"),
  makeCoreOperand("isSameHour"),
  makeCoreOperand("isSameDay"),
  makeCoreOperand("isSameWeek"),
  makeCoreOperand("isSameMonth"),
  makeCoreOperand("isSameYear"),
) {
}

export namespace AnyOperator {
  export type Type = typeof AnyOperator.Type;
  export type Encoded = typeof AnyOperator.Encoded;
}
