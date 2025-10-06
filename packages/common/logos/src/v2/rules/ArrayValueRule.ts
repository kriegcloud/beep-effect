import { makeRule } from "@beep/logos/v2/internal";
import * as Operands from "@beep/logos/v2/internal/Operands";
import { countDistinctOverlaps, has, intersect, missingFrom } from "@beep/logos/v2/rules/util";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as Match from "effect/Match";
import * as S from "effect/Schema";

export namespace Ops {
  export class Contains extends Operands.Contains.Schema(BS.Json, {}) {
    static readonly make = (i: Omit<typeof Contains.Type, "_tag">) =>
      ({
        ...i,
        _tag: "contains",
      }) as const;
  }
  export class NotContains extends Operands.NotContains.Schema(BS.Json, {}) {
    static readonly make = (i: Omit<typeof Contains.Type, "_tag">) =>
      ({
        ...i,
        _tag: "notContains",
      }) as const;
  }
  export class InSet extends Operands.InSet.Schema(BS.NonEmptyJsonArray, {}) {}
  export class OneOf extends Operands.OneOf.Schema(BS.NonEmptyJsonArray, {}) {}
  export class AllOf extends Operands.AllOf.Schema(BS.NonEmptyJsonArray, {}) {}
  export class NoneOf extends Operands.NoneOf.Schema(BS.JsonArray, {}) {}
}

export const { Rule, Input } = makeRule("arrayValue", {
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

const makeBase = (i: Omit<Input.Type, "id" | "type">) =>
  Input.make({
    ...i,
    type: "arrayValue",
  });

export const contains = (i: Pick<Input.Type, "field"> & { value: BS.Json.Type }) =>
  makeBase({
    op: Ops.Contains.make({
      value: i.value,
    }),
    field: i.field,
  });

export const notContains = (i: Pick<Input.Type, "field"> & { value: BS.Json.Type }) =>
  makeBase({
    op: Ops.NotContains.make({
      value: i.value,
    }),

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

export const validate = (rule: Input.Type, value: ReadonlyArray<BS.Json.Type>) =>
  // Engine guarantees this rule only runs when the field resolves to an array,
  // but be defensive in case callers use validate() directly.
  A.isArray(value)
    ? Match.value(rule.op).pipe(
        Match.withReturnType<boolean>(),
        Match.tagsExhaustive({
          contains: (op) => has(value, op.value),
          notContains: (op) => !has(value, op.value),
          // “at least one” overlap between the runtime array and the selection
          inSet: (op) => intersect(value, op.value).length > 0,

          // exactly one distinct overlap
          oneOf: (op) => countDistinctOverlaps(value, op.value) === 1,

          // none of the selection appears in the array
          noneOf: (op) => intersect(value, op.value).length === 0,

          // every (unique) selection element appears in the array
          allOf: (op) => missingFrom(op.value, value).length === 0,
        })
      )
    : false;
