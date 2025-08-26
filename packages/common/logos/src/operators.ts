import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { Operator } from "./internal";

/**
 * Operators used by rules to compare or check values.
 *
 * Notes
 * - Each namespace exposes two items from `Operator.make(id, label, configSchema)`:
 *   - `op`: the operator id (string literal). Use it to build rule payloads:
 *     `{ op: { _tag: Operators.Gt.op } }`.
 *   - `Schema`: Effect Schema for the full operator struct `{ _tag, ...config }`.
 * - Most operators have empty config `{}`; `Matches` adds `{ regex }`.
 * - Example rule usage (string contains):
 *   `{ field: "name", type: "string", op: { _tag: "in" }, value: "bob" }`
 *
 * Group: Equality & containment
 * - Eq (equals)
 * - Ne (does not equal)
 * - In (contains)
 * - NotIn (does not contain)
 * - Every (array: every element equals the provided value)
 */
export namespace Eq {
  export const { op, Schema } = Operator.make("eq", "equals", {});

  export const make = <
    const A,
    const E,
    const R,
    const Fields extends S.Struct.Fields,
  >(
    dataType: S.Schema<A, E, R>,
    fields: Fields,
  ) =>
    Operator.make("eq", "equals", {
      value: dataType,
      ...fields,
    });

  export type Type = Operator.Type<"eq">;
}

export namespace Ne {
  export const { op, Schema } = Operator.make("ne", "does not equal", {});

  export type Type = Operator.Type<"ne">;
}

export namespace StringContains {
  export const { op, Schema } = Operator.make(
    "stringContains",
    "string contains",
    {},
  );

  export type Type = Operator.Type<"stringContains">;
}

export namespace StringNotContains {
  export const { op, Schema } = Operator.make(
    "stringNotContains",
    "string does not contain",
    {},
  );

  export type Type = Operator.Type<"stringNotContains">;
}

export namespace ArrayContains {
  export const { op, Schema } = Operator.make(
    "arrayContains",
    "array contains",
    {},
  );

  export type Type = Operator.Type<"arrayContains">;
}

export namespace ArrayNotContains {
  export const { op, Schema } = Operator.make(
    "arrayNotContains",
    "array does not contain",
    {},
  );

  export type Type = Operator.Type<"arrayNotContains">;
}

/**
 * Array-specific: every element equals the given `value`.
 */
export namespace Every {
  export const { op, Schema } = Operator.make("every", "contains all", {});

  export type Type = Operator.Type<"every">;
}

/**
 * Group: String prefix/suffix
 * - StartsWith / NotStartsWith
 * - EndsWith / NotEndsWith
 *
 * Checks whether a string value starts/ends with a substring.
 * Example: `{ type: "string", op: { _tag: "startsWith" }, value: "Acme" }`.
 */
export namespace StartsWith {
  export const { op, Schema } = Operator.make("startsWith", "starts with", {});

  export type Type = Operator.Type<"startsWith">;
}

export namespace NotStartsWith {
  export const { op, Schema } = Operator.make(
    "notStartsWith",
    "does not start with",
    {},
  );

  export type Type = Operator.Type<"notStartsWith">;
}

export namespace EndsWith {
  export const { op, Schema } = Operator.make("endsWith", "ends with", {});

  export type Type = Operator.Type<"endsWith">;
}

export namespace NotEndsWith {
  export const { op, Schema } = Operator.make(
    "notEndsWith",
    "does not end with",
    {},
  );

  export type Type = Operator.Type<"notEndsWith">;
}

/**
 * Regex match.
 * - Op id: `matches`
 * - Config: `{ regex: RegexFromString }`
 * - Example: `{ type: "string", op: { _tag: "matches", regex: "^foo.*$" } }`
 */
export namespace Matches {
  export const { op, Schema } = Operator.make("matches", "matches regex", {
    regex: BS.RegexFromString,
  });

  export type Type = Operator.Type<"matches">;
}

/**
 * Group: Temporal ordering
 * - IsBefore / IsAfter / IsBetween
 *
 * Compares values interpreted by the Date rule (e.g., Date or ISO string).
 */
export namespace IsBefore {
  export const { op, Schema } = Operator.make("isBefore", "is before", {});

  export type Type = Operator.Type<"isBefore">;
}

export namespace IsAfter {
  export const { op, Schema } = Operator.make("isAfter", "is after", {});

  export type Type = Operator.Type<"isAfter">;
}

export namespace IsBetween {
  export const { op, Schema } = Operator.make("isBetween", "is between", {
    minimum: BS.DateFromAllAcceptable,
    maximum: BS.DateFromAllAcceptable,
    inclusive: S.Boolean,
  });

  export type Type = typeof Schema.Type;
  export type Encoded = typeof Schema.Encoded;
}

/**
 * Group: Numeric comparison
 * - Gt / Gte / Lt / Lte
 *
 * Compares numbers using standard arithmetic ordering.
 */
export namespace Gt {
  export const { op, Schema } = Operator.make("gt", "greater than", {});

  export type Type = Operator.Type<"gt">;
}

export namespace Gte {
  export const { op, Schema } = Operator.make(
    "gte",
    "greater than or equal to",
    {},
  );
  export type Type = Operator.Type<"gte">;
}

export namespace Lt {
  export const { op, Schema } = Operator.make("lt", "less than", {});
  export type Type = Operator.Type<"lt">;
}

export namespace Lte {
  export const { op, Schema } = Operator.make(
    "lte",
    "less than or equal to",
    {},
  );
  export type Type = Operator.Type<"lte">;
}

/**
 * Group: Boolean & truthiness
 * - IsTrue / IsFalse: strict boolean checks
 * - IsTruthy / IsFalsy: JS truthiness checks
 */
export namespace IsTrue {
  export const { op, Schema } = Operator.make("isTrue", "is true", {});

  export type Type = Operator.Type<"isTrue">;
}

export namespace IsFalse {
  export const { op, Schema } = Operator.make("isFalse", "is false", {});

  export type Type = Operator.Type<"isFalse">;
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
  export const { op, Schema } = Operator.make("isString", "is string", {});

  export type Type = Operator.Type<"isString">;
}

export namespace IsNotString {
  export const { op, Schema } = Operator.make(
    "isNotString",
    "is not string",
    {},
  );

  export type Type = Operator.Type<"isNotString">;
}

export namespace IsNumber {
  export const { op, Schema } = Operator.make("isNumber", "is number", {});

  export type Type = Operator.Type<"isNumber">;
}

export namespace IsNotNumber {
  export const { op, Schema } = Operator.make(
    "isNotNumber",
    "is not number",
    {},
  );

  export type Type = Operator.Type<"isNotNumber">;
}

export namespace IsTruthy {
  export const { op, Schema } = Operator.make("isTruthy", "is truthy", {});
  export type Type = Operator.Type<"isTruthy">;
}

export namespace IsFalsy {
  export const { op, Schema } = Operator.make("isFalsy", "is falsy", {});
  export type Type = Operator.Type<"isFalsy">;
}

/**
 * Group: Presence
 * - IsNull / IsNotNull
 */
export namespace IsNull {
  export const { op, Schema } = Operator.make("isNull", "is null", {});

  export type Type = Operator.Type<"isNull">;
}

export namespace IsNotNull {
  export const { op, Schema } = Operator.make("isNotNull", "is not null", {});

  export type Type = Operator.Type<"isNotNull">;
}

/**
 * Group: Definedness
 * - IsUndefined / IsDefined
 */
export namespace IsUndefined {
  export const { op, Schema } = Operator.make(
    "isUndefined",
    "is undefined",
    {},
  );
  export type Type = Operator.Type<"isUndefined">;
}

export namespace IsDefined {
  export const { op, Schema } = Operator.make("isDefined", "is defined", {});
  export type Type = Operator.Type<"isDefined">;
}

/**
 * Group: Boolean type guards
 * - IsBoolean / IsNotBoolean
 */
export namespace IsBoolean {
  export const { op, Schema } = Operator.make("isBoolean", "is boolean", {});
  export type Type = Operator.Type<"isBoolean">;
}

export namespace IsNotBoolean {
  export const { op, Schema } = Operator.make(
    "isNotBoolean",
    "is not boolean",
    {},
  );
  export type Type = Operator.Type<"isNotBoolean">;
}

/**
 * Group: Array type guards
 * - IsArray / IsNotArray
 */
export namespace IsArray {
  export const { op, Schema } = Operator.make("isArray", "is array", {});
  export type Type = Operator.Type<"isArray">;
}

export namespace IsNotArray {
  export const { op, Schema } = Operator.make("isNotArray", "is not array", {});
  export type Type = Operator.Type<"isNotArray">;
}

/**
 * Group: Object type guards
 * - IsObject / IsNotObject
 */
export namespace IsObject {
  export const { op, Schema } = Operator.make("isObject", "is object", {});
  export type Type = Operator.Type<"isObject">;
}

export namespace IsNotObject {
  export const { op, Schema } = Operator.make(
    "isNotObject",
    "is not object",
    {},
  );
  export type Type = Operator.Type<"isNotObject">;
}

/**
 * Logical operator for groups.
 * - Controls how child rules/groups are combined: `and` or `or`.
 * - Used by `RuleGroup` / `RootGroup` in `group.ts`.
 */
export const LogicalOp = S.Literal("and", "or").pipe(S.mutable);

export namespace LogicalOp {
  export type Type = typeof LogicalOp.Type;
  export type Encoded = typeof LogicalOp.Encoded;
}

export const AnyOperator = S.Union(
  Eq.Schema,
  Ne.Schema,
  StringContains.Schema,
  StringNotContains.Schema,
  ArrayContains.Schema,
  ArrayNotContains.Schema,
  Every.Schema,
  StartsWith.Schema,
  NotStartsWith.Schema,
  EndsWith.Schema,
  NotEndsWith.Schema,
  Matches.Schema,
  IsBefore.Schema,
  IsAfter.Schema,
  IsBetween.Schema,
  Gt.Schema,
  Gte.Schema,
  Lt.Schema,
  Lte.Schema,
  IsTrue.Schema,
  IsFalse.Schema,
  IsString.Schema,
  IsNotString.Schema,
  IsNumber.Schema,
  IsNotNumber.Schema,
  IsTruthy.Schema,
  IsFalsy.Schema,
  IsNull.Schema,
  IsNotNull.Schema,
  IsUndefined.Schema,
  IsDefined.Schema,
  IsBoolean.Schema,
  IsNotBoolean.Schema,
  IsArray.Schema,
  IsNotArray.Schema,
  IsObject.Schema,
  IsNotObject.Schema,
);

export namespace AnyOperator {
  export type Type = typeof AnyOperator.Type;
  export type Encoded = typeof AnyOperator.Encoded;
}

/**
 * Normalize an operator into a stable, minimal payload for fingerprinting.
 * - Config-less operators return just their tag string.
 * - Operators with config (e.g., `matches`) return a tuple with normalized values.
 * - Future configs (e.g., `isBetween` with minimum/maximum/inclusive) are handled here.
 */
export function fingerprintOperator(
  op: AnyOperator.Type,
): string | readonly unknown[] {
  const toMs = (x: unknown): number | null => {
    const d = new Date(x as any);
    const t = d.getTime();
    return Number.isFinite(t) ? t : null;
  };

  switch (op._tag) {
    case "matches": {
      // Serialize regex deterministically
      return [op._tag, op.regex.source, op.regex.flags] as const;
    }

    case "isBetween": {
      // Support hypothetical future config: minimum/maximum/inclusive
      const anyOp = op as any;
      if ("minimum" in anyOp || "maximum" in anyOp || "inclusive" in anyOp) {
        const min = toMs(anyOp.minimum);
        const max = toMs(anyOp.maximum);
        return [
          op._tag,
          min ?? anyOp.minimum,
          max ?? anyOp.maximum,
          !!anyOp.inclusive,
        ] as const;
      }
      return op._tag;
    }

    // Config-less operators
    case "eq":
    case "ne":
    case "stringContains":
    case "stringNotContains":
    case "arrayContains":
    case "arrayNotContains":
    case "every":
    case "startsWith":
    case "notStartsWith":
    case "endsWith":
    case "notEndsWith":
    case "isBefore":
    case "isAfter":
    case "gt":
    case "gte":
    case "lt":
    case "lte":
    case "isTrue":
    case "isFalse":
    case "isString":
    case "isNotString":
    case "isNumber":
    case "isNotNumber":
    case "isTruthy":
    case "isFalsy":
    case "isNull":
    case "isNotNull":
    case "isUndefined":
    case "isDefined":
    case "isBoolean":
    case "isNotBoolean":
    case "isArray":
    case "isNotArray":
    case "isObject":
    case "isNotObject":
      return op._tag;

    default: {
      const _exhaustive: never = op;
      return _exhaustive;
    }
  }
}
