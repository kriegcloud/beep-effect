import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as Match from "effect/Match";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { makeRule, Operands } from "../internal";
import { countDistinctOverlaps, has, intersect, missingFrom } from "./util";

export namespace Ops {
  // single JSON value
  export class Contains extends Operands.Contains.Schema(BS.Json, {}) {
    static readonly make = (value: BS.Json.Type) =>
      ({
        _tag: "contains",
        value,
      }) as const;
  }
  export class NotContains extends Operands.NotContains.Schema(BS.Json, {}) {
    static readonly make = (value: BS.Json.Type) =>
      ({
        _tag: "notContains",
        value,
      }) as const;
  }

  // non-empty selections
  export class InSet extends Operands.InSet.Schema(BS.NonEmptyJsonArray, {}) {}
  export class OneOf extends Operands.OneOf.Schema(BS.NonEmptyJsonArray, {}) {}
  export class AllOf extends Operands.AllOf.Schema(BS.NonEmptyJsonArray, {}) {}

  // may be empty
  export class NoneOf extends Operands.NoneOf.Schema(BS.JsonArray, {}) {}
}

export const { Rule, Input } = makeRule("hasValue", {
  field: S.NonEmptyString,
  op: S.Union(Ops.Contains, Ops.NotContains, Ops.InSet, Ops.OneOf, Ops.AllOf, Ops.NoneOf),
});

export namespace Rule {
  export type Type = typeof Rule.Type;
  export type Encoded = typeof Rule.Encoded;
}

export namespace Input {
  export type Type = typeof Input.Type;
  export type Encoded = typeof Input.Encoded;
}

export const makeBase = (i: Omit<Input.Type, "id" | "type">) =>
  Input.make({
    ...i,
    type: "hasValue",
  });

export const contains = (i: Pick<Input.Type, "field"> & { value: BS.Json.Type }) =>
  makeBase({
    op: Ops.Contains.make(i.value),
    field: i.field,
  });

export const notContains = (i: Pick<Input.Type, "field"> & { value: BS.Json.Type }) =>
  makeBase({
    op: Ops.NotContains.make(i.value),
    field: i.field,
  });

export const inSet = (i: Pick<Input.Type, "field"> & { value: (typeof Ops.InSet.Type)["value"] }) =>
  makeBase({
    op: Ops.InSet.make({
      value: i.value,
      _tag: "inSet",
    } as const),
    field: i.field,
  });
export const oneOf = (i: Pick<Input.Type, "field"> & { value: (typeof Ops.OneOf.Type)["value"] }) =>
  makeBase({
    op: Ops.OneOf.make({
      value: i.value,
      _tag: "oneOf",
    } as const),
    field: i.field,
  });

export const allOf = (i: Pick<Input.Type, "field"> & { value: (typeof Ops.AllOf.Type)["value"] }) =>
  makeBase({
    op: Ops.AllOf.make({
      value: i.value,
      _tag: "allOf",
    } as const),
    field: i.field,
  });

export const noneOf = (i: Pick<Input.Type, "field"> & { value: (typeof Ops.NoneOf.Type)["value"] }) =>
  makeBase({
    op: Ops.NoneOf.make({
      value: i.value,
      _tag: "noneOf",
    } as const),
    field: i.field,
  });

export const validate = (rule: Input.Type, rec: R.ReadonlyRecord<string, BS.Json.Type>) => {
  // 1) Pull values, 2) optionally filter to JSON (defensive at runtime)
  // If your input type guarantees BS.Json already, you can skip the filter.
  const values = A.filter(R.values(rec), (v): v is BS.Json.Type => S.is(BS.Json)(v));

  // precompute common checks
  const contains = has(values, rule.op.value);

  return Match.value(rule.op).pipe(
    Match.withReturnType<boolean>(),
    Match.tagsExhaustive({
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
    })
  );
};
