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
    Ops.IsObject
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

const makeBase = (i: Omit<Input.Type, "type">) =>
  Input.make({
    ...i,
    type: "typeRule",
  });

export const isString = (i: Pick<Input.Type, "field">) =>
  makeBase({
    op: Ops.IsString.make(),
    ...i,
  });

export const isTruthy = (i: Pick<Input.Type, "field">) =>
  makeBase({
    op: Ops.IsTruthy.make(),
    ...i,
  });

export const isFalsy = (i: Pick<Input.Type, "field">) =>
  makeBase({
    op: Ops.IsFalsy.make(),
    ...i,
  });

export const isNull = (i: Pick<Input.Type, "field">) =>
  makeBase({
    op: Ops.IsNull.make(),
    ...i,
  });

export const isUndefined = (i: Pick<Input.Type, "field">) =>
  makeBase({
    op: Ops.IsUndefined.make(),
    ...i,
  });

export const isNumber = (i: Pick<Input.Type, "field">) =>
  makeBase({
    op: Ops.IsNumber.make(),
    ...i,
  });

export const isBoolean = (i: Pick<Input.Type, "field">) =>
  makeBase({
    op: Ops.IsBoolean.make(),
    ...i,
  });

export const isArray = (i: Pick<Input.Type, "field">) =>
  makeBase({
    op: Ops.IsArray.make(),
    ...i,
  });

export const isObject = (i: Pick<Input.Type, "field">) =>
  makeBase({
    op: Ops.IsObject.make(),
    ...i,
  });

export const validate = (rule: Input.Type, value: unknown) =>
  Match.value(rule.op).pipe(
    Match.withReturnType<boolean>(),
    Match.tagsExhaustive({
      isString: () => Str.isString(value),
      isNumber: () => Num.isNumber(value),
      isTruthy: () => !!value,
      isFalsy: () => !value,
      isNull: () => P.isNull(value),
      isUndefined: () => P.isUndefined(value),
      isBoolean: () => Bool.isBoolean(value),
      isArray: () => A.isArray(value),
      isObject: () => P.isRecord(value),
    })
  );
