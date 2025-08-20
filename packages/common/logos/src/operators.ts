import { stringLiteralKit } from "@beep/schema/kits";
import { isPlainObject } from "@beep/utils";
import * as Equal from "effect/Equal";
import * as Num from "effect/Number";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Op } from "./internal";

export namespace Eq {
  export const exec = <A>(a: A, b: unknown): b is A => Equal.equals(a)(b);
  export const { op, Schema, execute } = Op.make("eq", "equals")(exec);

  export type Type = Op.Type<"eq">;
}

export namespace Ne {
  export const { op, Schema, execute } = Op.inverse(
    Eq.exec,
    "ne",
    "does not equal",
  );

  export type Type = Op.Type<"ne">;
}

export namespace In {
  // Overloaded predicate type:
  export function exec(a: string, b: unknown): b is string;
  export function exec<T>(a: readonly T[], b: unknown): b is T;
  export function exec<T>(
    a: string | readonly T[],
    b: unknown,
  ): b is string | T {
    if (Str.isString(a)) {
      return Str.isString(b) && Str.includes(a)(b);
    }

    // a is readonly T[]
    for (const x of a) {
      if (Object.is(x, b)) return true; // SameValueZero equality, safe for unknown
    }
    return false;
  }

  export const { op, Schema, execute } = Op.make("in", "contains")(exec);

  export type Type = Op.Type<"in">;
}

export namespace NotIn {
  export const { op, Schema, execute } = Op.inverse(
    In.exec,
    "notIn",
    "does not contain",
  );

  export type Type = Op.Type<"notIn">;
}

export namespace AllIn {
  export function exec<T>(a: readonly T[], b: unknown): b is readonly T[] {
    if (!Array.isArray(b)) return false;
    const bx = b as readonly unknown[];
    for (const needle of bx) {
      let found = false;
      for (const hay of a) {
        if (Object.is(hay, needle as T)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  // After the Op.make change above, this line type-checks
  export const { op, Schema } = Op.make("allIn", "contains all")(exec);

  export type Type = Op.Type<"allIn">;
}

export namespace StartsWith {
  export function exec(a: string, b: unknown): b is string {
    return typeof b === "string" && a.startsWith(b);
  }

  export const { op, Schema } = Op.make("startsWith", "starts with")(exec);

  export type Type = Op.Type<"startsWith">;
}

export namespace NotStartsWith {
  export const { op, Schema } = Op.inverse(
    StartsWith.exec,
    "doesNotStartWith",
    "does not start with",
  );

  export type Type = Op.Type<"doesNotStartWith">;
}

export namespace EndsWith {
  export function exec(a: string, b: unknown): b is string {
    return typeof b === "string" && a.endsWith(b);
  }

  export const { op, Schema } = Op.make("endsWith", "ends with")(exec);

  export type Type = Op.Type<"endsWith">;
}

export namespace NotEndsWith {
  // If you prefer reuse: Op.makeNot(EndsWith.exec, "doesNotEndWith", "does not end with")
  export const { op, Schema } = Op.inverse(
    EndsWith.exec,
    "doesNotEndWith",
    "does not end with",
  );

  export type Type = Op.Type<"doesNotEndWith">;
}

export namespace Matches {
  export function exec(a: RegExp, b: unknown): b is string;
  export function exec(a: string, b: unknown): b is string;
  export function exec(a: RegExp | string, b: unknown): b is string {
    if (typeof b !== "string") return false;
    const re = typeof a === "string" ? new RegExp(a) : a;
    return re.test(b);
  }

  export const { op, Schema } = Op.make("matches", "matches regex")(exec);

  export type Type = Op.Type<"matches">;
}

export namespace IsBefore {
  export function exec(a: Date, b: unknown): b is Date;
  export function exec(a: number, b: unknown): b is number;
  export function exec(a: Date | number, b: unknown): b is Date | number {
    if (a instanceof Date) {
      return b instanceof Date && b.getTime() < a.getTime();
    }
    return Num.isNumber(b) && b < a;
  }

  export const { op, Schema } = Op.make("isBefore", "is before")(exec);

  export type Type = Op.Type<"isBefore">;
}

export namespace IsAfter {
  export function exec(a: Date, b: unknown): b is Date;
  export function exec(a: number, b: unknown): b is number;
  export function exec(a: Date | number, b: unknown): b is Date | number {
    if (a instanceof Date) {
      return b instanceof Date && b.getTime() > a.getTime();
    }
    return Num.isNumber(b) && b > a;
  }

  export const { op, Schema } = Op.make("isAfter", "is after")(exec);

  export type Type = Op.Type<"isAfter">;
}

export namespace IsBetween {
  export function exec(a: readonly [Date, Date], b: unknown): b is Date;
  export function exec(a: readonly [number, number], b: unknown): b is number;
  export function exec(
    a: readonly [Date, Date] | readonly [number, number],
    b: unknown,
  ): b is Date | number {
    const [lo, hi] = a as readonly [unknown, unknown];

    // Dates
    if (lo instanceof Date && hi instanceof Date) {
      if (!(b instanceof Date)) return false;
      const t = b.getTime();
      const min = Math.min(lo.getTime(), hi.getTime());
      const max = Math.max(lo.getTime(), hi.getTime());
      return t >= min && t <= max;
    }

    // numbers
    if (typeof lo === "number" && typeof hi === "number") {
      if (typeof b !== "number") return false;
      const min = Math.min(lo, hi);
      const max = Math.max(lo, hi);
      return b >= min && b <= max;
    }

    return false;
  }

  export const { op, Schema } = Op.make("isBetween", "is between")(exec);

  export type Type = Op.Type<"isBetween">;
}

export namespace Gt {
  export function exec(a: number, b: unknown): b is number;
  export function exec(a: bigint, b: unknown): b is bigint;
  export function exec(a: Date, b: unknown): b is Date;
  export function exec(
    a: number | bigint | Date,
    b: unknown,
  ): b is number | bigint | Date {
    if (typeof a === "number") return typeof b === "number" && b > a;
    if (typeof a === "bigint") return typeof b === "bigint" && b > a;
    return b instanceof Date && b.getTime() > a.getTime();
  }

  export const { op, Schema } = Op.make("gt", "greater than")(exec);

  export type Type = Op.Type<"gt">;
}

export namespace Gte {
  export function exec(a: number, b: unknown): b is number;
  export function exec(a: bigint, b: unknown): b is bigint;
  export function exec(a: Date, b: unknown): b is Date;
  export function exec(
    a: number | bigint | Date,
    b: unknown,
  ): b is number | bigint | Date {
    if (typeof a === "number") return typeof b === "number" && b >= a;
    if (typeof a === "bigint") return typeof b === "bigint" && b >= a;
    return b instanceof Date && b.getTime() >= a.getTime();
  }

  export const { op, Schema } = Op.make(
    "gte",
    "greater than or equal to",
  )(exec);

  export type Type = Op.Type<"gte">;
}

export namespace Lt {
  export function exec(a: number, b: unknown): b is number;
  export function exec(a: bigint, b: unknown): b is bigint;
  export function exec(a: Date, b: unknown): b is Date;
  export function exec(
    a: number | bigint | Date,
    b: unknown,
  ): b is number | bigint | Date {
    if (typeof a === "number") return typeof b === "number" && b < a;
    if (typeof a === "bigint") return typeof b === "bigint" && b < a;
    return b instanceof Date && b.getTime() < a.getTime();
  }

  export const { op, Schema } = Op.make("lt", "less than")(exec);

  export type Type = Op.Type<"lt">;
}

export namespace Lte {
  export function exec(a: number, b: unknown): b is number;
  export function exec(a: bigint, b: unknown): b is bigint;
  export function exec(a: Date, b: unknown): b is Date;
  export function exec(
    a: number | bigint | Date,
    b: unknown,
  ): b is number | bigint | Date {
    if (typeof a === "number") return typeof b === "number" && b <= a;
    if (typeof a === "bigint") return typeof b === "bigint" && b <= a;
    return b instanceof Date && b.getTime() <= a.getTime();
  }

  export const { op, Schema } = Op.make("lte", "less than or equal to")(exec);

  export type Type = Op.Type<"lte">;
}

export namespace IsTrue {
  export function exec(b: unknown): b is true {
    return b === true;
  }

  export const { op, Schema } = Op.make("isTrue", "is true")(Op.lift1(exec));

  export type Type = Op.Type<"isTrue">;
}

export namespace IsFalse {
  export function exec(b: unknown): b is false {
    return b === false;
  }

  export const { op, Schema } = Op.make("isFalse", "is false")(Op.lift1(exec));

  export type Type = Op.Type<"isFalse">;
}

export namespace IsString {
  export function exec(b: unknown): b is string {
    return Str.isString(b);
  }

  export const { op, Schema } = Op.make(
    "isString",
    "is string",
  )(Op.lift1(exec));

  export type Type = Op.Type<"isString">;
}

export namespace IsNotString {
  export const { op, Schema } = Op.inverse(
    IsString.exec,
    "isNotString",
    "is not string",
  );

  export type Type = Op.Type<"isNotString">;
}

export namespace IsNumber {
  export function exec(b: unknown): b is number {
    return Num.isNumber(b);
  }

  export const { op, Schema } = Op.make(
    "isNumber",
    "is number",
  )(Op.lift1(exec));

  export type Type = Op.Type<"isNumber">;
}

export namespace IsNotNumber {
  export const { op, Schema } = Op.inverse(
    IsNumber.exec,
    "isNotNumber",
    "is not number",
  );

  export type Type = Op.Type<"isNotNumber">;
}

export namespace IsTruthy {
  // Not a type guard (truthy isn’t a concrete TS type)
  export function exec(b: unknown): boolean {
    // NaN is falsy, as in JS
    return !!b;
  }

  export const { op, Schema } = Op.make(
    "isTruthy",
    "is truthy",
  )(Op.lift1(exec));
  export type Type = Op.Type<"isTruthy">;
}

export namespace IsFalsy {
  // Not a type guard (see IsTruthy)
  export function exec(b: unknown): boolean {
    return !b;
  }

  export const { op, Schema } = Op.make("isFalsy", "is falsy")(Op.lift1(exec));
  export type Type = Op.Type<"isFalsy">;
}

export namespace IsNull {
  export function exec(b: unknown): b is null {
    return P.isNull(b);
  }

  export const { op, Schema } = Op.make("isNull", "is null")(Op.lift1(exec));

  export type Type = Op.Type<"isNull">;
}

export namespace IsNotNull {
  export const { op, Schema } = Op.inverse(
    IsNull.exec,
    "isNotNull",
    "is not null",
  );

  export type Type = Op.Type<"isNotNull">;
}

export namespace IsEmpty {
  // Returns boolean (no meaningful type-guard for "empty")
  export function exec(b: unknown): boolean {
    if (typeof b === "string") return b.length === 0;
    if (Array.isArray(b)) return b.length === 0;
    if (b instanceof Map || b instanceof Set) return b.size === 0;
    if (isPlainObject(b)) return Object.keys(b).length === 0;
    // not considered "empty": numbers, booleans, null/undefined, functions, Date, etc.
    return false;
  }

  export const { op, Schema } = Op.make("isEmpty", "is empty")(Op.lift1(exec));
  export type Type = Op.Type<"isEmpty">;
}

export namespace IsNotEmpty {
  export const { op, Schema } = Op.inverse(
    IsEmpty.exec,
    "isNotEmpty",
    "is not empty",
  );
  export type Type = Op.Type<"isNotEmpty">;
}

export namespace IsUndefined {
  export function exec(b: unknown): b is undefined {
    return P.isUndefined(b);
  }

  export const { op, Schema } = Op.make(
    "isUndefined",
    "is undefined",
  )(Op.lift1(exec));
  export type Type = Op.Type<"isUndefined">;
}

export namespace IsDefined {
  // Derived from IsUndefined; returns boolean (not a type guard)
  export const { op, Schema } = Op.inverse(
    IsUndefined.exec,
    "isDefined",
    "is defined",
  );
  export type Type = Op.Type<"isDefined">;
}

export namespace IsBoolean {
  export function exec(b: unknown): b is boolean {
    return typeof b === "boolean";
  }

  export const { op, Schema } = Op.make(
    "isBoolean",
    "is boolean",
  )(Op.lift1(exec));
  export type Type = Op.Type<"isBoolean">;
}

export namespace IsNotBoolean {
  export const { op, Schema } = Op.inverse(
    IsBoolean.exec,
    "isNotBoolean",
    "is not boolean",
  );
  export type Type = Op.Type<"isNotBoolean">;
}

export namespace IsArray {
  export function exec(b: unknown): b is readonly unknown[] {
    return Array.isArray(b);
  }

  export const { op, Schema } = Op.make("isArray", "is array")(Op.lift1(exec));
  export type Type = Op.Type<"isArray">;
}

export namespace IsNotArray {
  export const { op, Schema } = Op.inverse(
    IsArray.exec,
    "isNotArray",
    "is not array",
  );
  export type Type = Op.Type<"isNotArray">;
}

export namespace IsObject {
  // Treat "object" as non-null, non-array object. (Functions are excluded.)
  export function exec(b: unknown): b is Record<string, unknown> {
    return typeof b === "object" && b !== null && !Array.isArray(b);
  }

  export const { op, Schema } = Op.make(
    "isObject",
    "is object",
  )(Op.lift1(exec));
  export type Type = Op.Type<"isObject">;
}

export namespace IsNotObject {
  export const { op, Schema } = Op.inverse(
    IsObject.exec,
    "isNotObject",
    "is not object",
  );
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

export const LogicalOp = S.Literal("and", "or");

export namespace LogicalOp {
  export type Type = "and" | "or";
}
