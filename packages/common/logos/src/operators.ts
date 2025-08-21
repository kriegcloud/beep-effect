import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { Op } from "./internal";

/**
 * Operators used by rules to compare or check values.
 *
 * Notes
 * - Each namespace exposes two items from `Op.make(id, label, configSchema)`:
 *   - `op`: the operator id (string literal). Use it to build rule payloads:
 *     `{ op: { _tag: Operators.Gt.op } }`.
 *   - `Schema`: Effect Schema for the full operator struct `{ _tag, ...config }`.
 * - Most operators have empty config `{}`; `Matches` adds `{ regex }`.
 * - Example rule usage (string contains):
 *   `{ field: "name", _tag: "string", op: { _tag: "in" }, value: "bob" }`
 *
 * Group: Equality & containment
 * - Eq (equals)
 * - Ne (does not equal)
 * - In (contains)
 * - NotIn (does not contain)
 * - Every (array: every element equals the provided value)
 */
export namespace Eq {
  export const { op, Schema } = Op.make("eq", "equals", {});

  export type Type = Op.Type<"eq">;
}

export namespace Ne {
  export const { op, Schema } = Op.make("ne", "does not equal", {});

  export type Type = Op.Type<"ne">;
}

export namespace In {
  export const { op, Schema } = Op.make("in", "contains", {});

  export type Type = Op.Type<"in">;
}

export namespace NotIn {
  export const { op, Schema } = Op.make("notIn", "does not contain", {});

  export type Type = Op.Type<"notIn">;
}

/**
 * Array-specific: every element equals the given `value`.
 */
export namespace Every {
  export const { op, Schema } = Op.make("every", "contains all", {});

  export type Type = Op.Type<"every">;
}

/**
 * Group: String prefix/suffix
 * - StartsWith / NotStartsWith
 * - EndsWith / NotEndsWith
 *
 * Checks whether a string value starts/ends with a substring.
 * Example: `{ _tag: "string", op: { _tag: "startsWith" }, value: "Acme" }`.
 */
export namespace StartsWith {
  export const { op, Schema } = Op.make("startsWith", "starts with", {});

  export type Type = Op.Type<"startsWith">;
}

export namespace NotStartsWith {
  export const { op, Schema } = Op.make(
    "notStartsWith",
    "does not start with",
    {},
  );

  export type Type = Op.Type<"notStartsWith">;
}

export namespace EndsWith {
  export const { op, Schema } = Op.make("endsWith", "ends with", {});

  export type Type = Op.Type<"endsWith">;
}

export namespace NotEndsWith {
  export const { op, Schema } = Op.make("notEndsWith", "does not end with", {});

  export type Type = Op.Type<"notEndsWith">;
}

/**
 * Regex match.
 * - Op id: `matches`
 * - Config: `{ regex: RegexFromString }`
 * - Example: `{ _tag: "string", op: { _tag: "matches", regex: "^foo.*$" } }`
 */
export namespace Matches {
  export const { op, Schema } = Op.make("matches", "matches regex", {
    regex: BS.RegexFromString,
  });

  export type Type = Op.Type<"matches">;
}

/**
 * Group: Temporal ordering
 * - IsBefore / IsAfter / IsBetween
 *
 * Compares values interpreted by the Date rule (e.g., Date or ISO string).
 */
export namespace IsBefore {
  export const { op, Schema } = Op.make("isBefore", "is before", {});

  export type Type = Op.Type<"isBefore">;
}

export namespace IsAfter {
  export const { op, Schema } = Op.make("isAfter", "is after", {});

  export type Type = Op.Type<"isAfter">;
}

export namespace IsBetween {
  export const { op, Schema } = Op.make("isBetween", "is between", {});

  export type Type = Op.Type<"isBetween">;
}

/**
 * Group: Numeric comparison
 * - Gt / Gte / Lt / Lte
 *
 * Compares numbers using standard arithmetic ordering.
 */
export namespace Gt {
  export const { op, Schema } = Op.make("gt", "greater than", {});

  export type Type = Op.Type<"gt">;
}

export namespace Gte {
  export const { op, Schema } = Op.make("gte", "greater than or equal to", {});
  export type Type = Op.Type<"gte">;
}

export namespace Lt {
  export const { op, Schema } = Op.make("lt", "less than", {});
  export type Type = Op.Type<"lt">;
}

export namespace Lte {
  export const { op, Schema } = Op.make("lte", "less than or equal to", {});
  export type Type = Op.Type<"lte">;
}

/**
 * Group: Boolean & truthiness
 * - IsTrue / IsFalse: strict boolean checks
 * - IsTruthy / IsFalsy: JS truthiness checks
 */
export namespace IsTrue {
  export const { op, Schema } = Op.make("isTrue", "is true", {});

  export type Type = Op.Type<"isTrue">;
}

export namespace IsFalse {
  export const { op, Schema } = Op.make("isFalse", "is false", {});

  export type Type = Op.Type<"isFalse">;
}

/**
 * Group: Type guards
 * - IsString / IsNotString
 * - IsNumber / IsNotNumber
 * - IsBoolean / IsNotBoolean
 * - IsArray / IsNotArray
 * - IsObject / IsNotObject
 */
export namespace IsString {
  export const { op, Schema } = Op.make("isString", "is string", {});

  export type Type = Op.Type<"isString">;
}

export namespace IsNotString {
  export const { op, Schema } = Op.make("isNotString", "is not string", {});

  export type Type = Op.Type<"isNotString">;
}

export namespace IsNumber {
  export const { op, Schema } = Op.make("isNumber", "is number", {});

  export type Type = Op.Type<"isNumber">;
}

export namespace IsNotNumber {
  export const { op, Schema } = Op.make("isNotNumber", "is not number", {});

  export type Type = Op.Type<"isNotNumber">;
}

export namespace IsTruthy {
  export const { op, Schema } = Op.make("isTruthy", "is truthy", {});
  export type Type = Op.Type<"isTruthy">;
}

export namespace IsFalsy {
  export const { op, Schema } = Op.make("isFalsy", "is falsy", {});
  export type Type = Op.Type<"isFalsy">;
}

/**
 * Group: Presence & emptiness
 * - IsNull / IsNotNull
 * - IsEmpty / IsNotEmpty
 *
 * `IsEmpty` typically checks length/size === 0 for strings/arrays.
 */
export namespace IsNull {
  export const { op, Schema } = Op.make("isNull", "is null", {});

  export type Type = Op.Type<"isNull">;
}

export namespace IsNotNull {
  export const { op, Schema } = Op.make("isNotNull", "is not null", {});

  export type Type = Op.Type<"isNotNull">;
}

export namespace IsEmpty {
  export const { op, Schema } = Op.make("isEmpty", "is empty", {});
  export type Type = Op.Type<"isEmpty">;
}

export namespace IsNotEmpty {
  export const { op, Schema } = Op.make("isNotEmpty", "is not empty", {});
  export type Type = Op.Type<"isNotEmpty">;
}

/**
 * Group: Definedness
 * - IsUndefined / IsDefined
 */
export namespace IsUndefined {
  export const { op, Schema } = Op.make("isUndefined", "is undefined", {});
  export type Type = Op.Type<"isUndefined">;
}

export namespace IsDefined {
  export const { op, Schema } = Op.make("isDefined", "is defined", {});
  export type Type = Op.Type<"isDefined">;
}

/**
 * Group: Boolean type guards
 * - IsBoolean / IsNotBoolean
 */
export namespace IsBoolean {
  export const { op, Schema } = Op.make("isBoolean", "is boolean", {});
  export type Type = Op.Type<"isBoolean">;
}

export namespace IsNotBoolean {
  export const { op, Schema } = Op.make("isNotBoolean", "is not boolean", {});
  export type Type = Op.Type<"isNotBoolean">;
}

/**
 * Group: Array type guards
 * - IsArray / IsNotArray
 */
export namespace IsArray {
  export const { op, Schema } = Op.make("isArray", "is array", {});
  export type Type = Op.Type<"isArray">;
}

export namespace IsNotArray {
  export const { op, Schema } = Op.make("isNotArray", "is not array", {});
  export type Type = Op.Type<"isNotArray">;
}

/**
 * Group: Object type guards
 * - IsObject / IsNotObject
 */
export namespace IsObject {
  export const { op, Schema } = Op.make("isObject", "is object", {});
  export type Type = Op.Type<"isObject">;
}

export namespace IsNotObject {
  export const { op, Schema } = Op.make("isNotObject", "is not object", {});
  export type Type = Op.Type<"isNotObject">;
}

/**
 * Logical operator for unions.
 * - Controls how child rules/unions are combined: `and` or `or`.
 * - Used by `Union` / `RootUnion` in `union.ts`.
 */
export const LogicalOp = S.Literal("and", "or").pipe(S.mutable);

export namespace LogicalOp {
  export type Type = typeof LogicalOp.Type;
  export type Encoded = typeof LogicalOp.Encoded;
}
