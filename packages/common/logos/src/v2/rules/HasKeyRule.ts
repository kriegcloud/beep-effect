import { makeRule, Operands } from "@beep/logos/v2/internal";
import {
  countDistinctOverlaps,
  has,
  intersect,
  missingFrom,
} from "@beep/logos/v2/rules/util";
import type { BS } from "@beep/schema";
import * as Match from "effect/Match";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";

export namespace Ops {
  // Single key
  export class Contains extends Operands.Contains.Schema(S.String, {}) {}
  export class NotContains extends Operands.NotContains.Schema(S.String, {}) {}

  // Sets of keys
  export class InSet extends Operands.InSet.Schema(
    S.NonEmptyArray(S.String),
    {},
  ) {}
  export class OneOf extends Operands.OneOf.Schema(
    S.NonEmptyArray(S.String),
    {},
  ) {}
  export class AllOf extends Operands.AllOf.Schema(
    S.NonEmptyArray(S.String),
    {},
  ) {}
  export class NoneOf extends Operands.NoneOf.Schema(S.Array(S.String), {}) {}
}

export const { Rule, Input } = makeRule("hasKey", {
  field: S.NonEmptyString,
  op: S.Union(
    Ops.Contains,
    Ops.NotContains,
    Ops.InSet,
    Ops.OneOf,
    Ops.AllOf,
    Ops.NoneOf,
  ),
});

export const make = (i: Omit<Input.Type, "id" | "type">) =>
  Input.make({
    ...i,
    type: "hasKey",
  });

export namespace Rule {
  export type Type = typeof Rule.Type;
  export type Encoded = typeof Rule.Encoded;
}

export namespace Input {
  export type Type = typeof Input.Type;
  export type Encoded = typeof Input.Encoded;
}

/**
 * value is expected to be a plain JSON object at runtime:
 *   Readonly<Record<string, Json.Type>>
 */
export const validate = (
  rule: Input.Type,
  value: Readonly<Record<string, BS.Json.Type>>, // runtime may still be unknown; call sites should gate by type
): boolean => {
  // Keys are unique strings, which are a subset of Json.Type,
  // so the Json equivalence works (primitives use ===).
  const keys: ReadonlyArray<string> = Struct.keys(value); // own, enumerable, string keys only
  return Match.value(rule.op).pipe(
    Match.withReturnType<boolean>(),
    Match.tags({
      contains: (op) => has(keys, op.value), // membership
      notContains: (op) => !has(keys, op.value), // negated membership
      inSet: (op) => intersect(keys, op.value).length > 0, // at least one overlap
      oneOf: (op) => countDistinctOverlaps(keys, op.value) === 1, // exactly one DISTINCT overlap
      noneOf: (op) => intersect(keys, op.value).length === 0, // no overlap
      allOf: (op) => missingFrom(op.value, keys).length === 0, // every selected appears
    }),
    Match.orElse(() => false),
  );
};
