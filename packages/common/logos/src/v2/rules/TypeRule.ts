import { makeRule, Operands } from "@beep/logos/v2/internal";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

export namespace Ops {
  export class IsString extends Operands.IsString.Schema(S.Null, {}) {
    static readonly make = () =>
      ({
        _tag: "isString",
        value: null,
      }) as const;
  }
  export class IsNumber extends Operands.IsNumber.Schema(S.Null, {}) {
    static readonly make = () =>
      ({
        _tag: "isNumber",
        value: null,
      }) as const;
  }
  export class IsTruthy extends Operands.IsTruthy.Schema(S.Null, {}) {
    static readonly make = () =>
      ({
        _tag: "isTruthy",
        value: null,
      }) as const;
  }
  export class IsFalsy extends Operands.IsFalsy.Schema(S.Null, {}) {
    static readonly make = () =>
      ({
        _tag: "isFalsy",
        value: null,
      }) as const;
  }
  export class IsNull extends Operands.IsNull.Schema(S.Null, {}) {
    static readonly make = () =>
      ({
        _tag: "isNull",
        value: null,
      }) as const;
  }
  export class IsUndefined extends Operands.IsUndefined.Schema(S.Null, {}) {
    static readonly make = () =>
      ({
        _tag: "isUndefined",
        value: null,
      }) as const;
  }
  export class IsBoolean extends Operands.IsBoolean.Schema(S.Null, {}) {
    static readonly make = () =>
      ({
        _tag: "isBoolean",
        value: null,
      }) as const;
  }
  export class IsArray extends Operands.IsArray.Schema(S.Null, {}) {
    static readonly make = () =>
      ({
        _tag: "isArray",
        value: null,
      }) as const;
  }
  export class IsObject extends Operands.IsObject.Schema(S.Null, {}) {
    static readonly make = () =>
      ({
        _tag: "isObject",
        value: null,
      }) as const;
  }
}

export const { Input, Rule } = makeRule("typeRule", {
  field: S.NonEmptyString,
  op: S.Union(
    Ops.IsString,
    Ops.IsNumber,
    Ops.IsTruthy,
    Ops.IsFalsy,
    Ops.IsNull,
    Ops.IsUndefined,
    Ops.IsBoolean,
    Ops.IsArray,
    Ops.IsObject,
  ),
});

export namespace Input {
  export type Type = typeof Input.Type;
  export type Encoded = typeof Input.Encoded;
}

export namespace Rule {
  export type Type = typeof Rule.Type;
  export type Encoded = typeof Rule.Encoded;
}

const matchOp = Match.type<Input.Type["op"]["_tag"]>().pipe(
  Match.when("isTruthy", Ops.IsTruthy.make),
  Match.when("isFalsy", Ops.IsFalsy.make),
  Match.when("isNull", Ops.IsNull.make),
  Match.when("isUndefined", Ops.IsUndefined.make),
  Match.when("isBoolean", Ops.IsBoolean.make),
  Match.when("isArray", Ops.IsArray.make),
  Match.when("isObject", Ops.IsObject.make),
  Match.when("isString", Ops.IsString.make),
  Match.when("isNumber", Ops.IsNumber.make),
  Match.exhaustive,
);

export const make = (
  i: Omit<Input.Type, "op" | "type"> & {
    op: Input.Type["op"]["_tag"];
  },
) =>
  ({
    ...i,
    type: "typeRule",
    op: matchOp(i.op),
  }) as const;

export const validate = (rule: Input.Type, value: unknown) =>
  Match.value(rule.op).pipe(
    Match.withReturnType<boolean>(),
    Match.tags({
      isString: () => Str.isString(value),
      isNumber: () => Num.isNumber(value),
      isTruthy: () => !!value,
      isFalsy: () => !value,
      isNull: () => P.isNull(value),
      isUndefined: () => P.isUndefined(value),
      isBoolean: () => Bool.isBoolean(value),
      isArray: () => A.isArray(value),
      isObject: () => P.isRecord(value),
    }),
    Match.orElse(() => false),
  );
