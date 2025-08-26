import { makeRule, Operands } from "@beep/logos/v2/internal";
import {
  countDistinctOverlaps,
  has,
  intersect,
  missingFrom,
} from "@beep/logos/v2/rules/util";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as Match from "effect/Match";
import * as R from "effect/Record";
import * as S from "effect/Schema";

export namespace Ops {
  // single JSON value
  export class Contains extends Operands.Contains.Schema(BS.Json, {}) {}
  export class NotContains extends Operands.NotContains.Schema(BS.Json, {}) {}

  // non-empty selections
  export class InSet extends Operands.InSet.Schema(BS.NonEmptyJsonArray, {}) {}
  export class OneOf extends Operands.OneOf.Schema(BS.NonEmptyJsonArray, {}) {}
  export class AllOf extends Operands.AllOf.Schema(BS.NonEmptyJsonArray, {}) {}

  // may be empty
  export class NoneOf extends Operands.NoneOf.Schema(BS.JsonArray, {}) {}
}

export const { Rule, Input } = makeRule("hasValue", {
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

export namespace Rule {
  export type Type = typeof Rule.Type;
  export type Encoded = typeof Rule.Encoded;
}

export namespace Input {
  export type Type = typeof Input.Type;
  export type Encoded = typeof Input.Encoded;
}

export const make = (i: Omit<Input.Type, "id" | "type">) =>
  Input.make({
    ...i,
    type: "hasValue",
  });

export const validate = (
  rule: Input.Type,
  rec: R.ReadonlyRecord<string, BS.Json.Type>,
) => {
  // 1) Pull values, 2) optionally filter to JSON (defensive at runtime)
  // If your input type guarantees BS.Json already, you can skip the filter.
  const values = A.filter(R.values(rec), (v): v is BS.Json.Type =>
    S.is(BS.Json)(v),
  );

  // precompute common checks
  const contains = has(values, rule.op.value);

  return Match.value(rule.op).pipe(
    Match.withReturnType<boolean>(),
    Match.tags({
      contains: () => contains,
      notContains: () => !contains,

      // at least one overlap
      inSet: (op) => intersect(values, op.value).length > 0,

      // exactly one DISTINCT overlap (duplicates in input or selection don’t inflate the count)
      oneOf: (op) => countDistinctOverlaps(values, op.value) === 1,

      // zero overlap
      noneOf: (op) => intersect(values, op.value).length === 0,

      // every (unique) selection element appears in the record’s values
      allOf: (op) => missingFrom(op.value, values).length === 0,
    }),
    Match.orElse(() => false),
  );
};
