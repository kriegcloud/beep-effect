import { makeRule, Operands } from "@beep/logos/v2/internal";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as It from "effect/Iterable";
import * as Match from "effect/Match";
import type * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";

export const KV = S.Struct({ key: S.String, value: BS.Json });

namespace KV {
  export type Type = S.Schema.Type<typeof KV>;
  export type Encoded = S.Schema.Encoded<typeof KV>;
}
export const KVNonEmptyArray = S.NonEmptyArray(KV);

namespace KVNonEmptyArray {
  export type Type = S.Schema.Type<typeof KVNonEmptyArray>;
  export type Encoded = S.Schema.Encoded<typeof KVNonEmptyArray>;
}
/** ──────────────────────────────────────────────────────────────
 *  Operand payloads: each op carries its own value type
 *  KV is exported so we can derive an Equivalence from it.
 *  ────────────────────────────────────────────────────────────── */
export namespace Ops {
  export class Contains extends Operands.Contains.Schema(KV, {}) {}

  export class NotContains extends Operands.NotContains.Schema(KV, {}) {}

  export class InSet extends Operands.InSet.Schema(KVNonEmptyArray, {}) {}

  export class OneOf extends Operands.OneOf.Schema(KVNonEmptyArray, {}) {}

  export class AllOf extends Operands.AllOf.Schema(KVNonEmptyArray, {}) {}

  export class NoneOf extends Operands.NoneOf.Schema(S.Array(KV), {}) {}
}

/** ──────────────────────────────────────────────────────────────
 *  Rule & Input
 *  ────────────────────────────────────────────────────────────── */
export const { Rule, Input } = makeRule("hasEntry", {
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
    type: "hasEntry",
  });

export const contains = (i: Pick<Input.Type, "field"> & { value: KV.Type }) =>
  makeBase({
    op: Ops.Contains.make({
      value: i.value,
      _tag: "contains",
    }),
    field: i.field,
  });

export const notContains = (i: Pick<Input.Type, "field"> & { value: KV.Type }) =>
  makeBase({
    op: Ops.NotContains.make({
      value: i.value,
      _tag: "notContains",
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

/** ──────────────────────────────────────────────────────────────
 *  validate:
 *  - normalize the Record into KV[] to match op payloads
 *  - use an Equivalence derived from KV for deep, structural equality
 *  - implement set semantics with Array.*With & Iterable.containsWith
 *  ────────────────────────────────────────────────────────────── */
export const validate = (rule: Input.Type, value: R.ReadonlyRecord<string, BS.Json.Type>): boolean => {
  // Convert the runtime record to the same shape the ops are declared against.
  const kvs: ReadonlyArray<S.Schema.Type<typeof KV>> = Struct.entries(value).map(([key, v]) => ({ key, value: v }));

  // Deep equality for { key, value } using the schema:
  const eqKV = S.equivalence(KV); // (a, b) => boolean

  // Helpers leveraging Effect's set ops with custom equivalence
  const overlap = (sel: ReadonlyArray<KV.Type>) => A.intersectionWith(eqKV)(sel)(kvs); // items in both
  const missing = (sel: ReadonlyArray<KV.Type>) => A.differenceWith(eqKV)(kvs)(sel); // elements of sel not present in kvs
  const containsKV = (pair: KV.Type) => It.containsWith(eqKV)(pair)(kvs);

  return Match.value(rule.op).pipe(
    Match.withReturnType<boolean>(),
    Match.tags({
      // exact KV membership
      contains: (op) => containsKV(op.value),
      notContains: (op) => !containsKV(op.value),

      // at least one match
      inSet: (op) => overlap(op.value).length > 0,

      // exactly one DISTINCT match (dedupe selection first)
      oneOf: (op) => {
        const distinct = A.dedupeWith(eqKV)(op.value);
        return overlap(distinct).length === 1;
      },

      // none of the selection appears
      noneOf: (op) => overlap(op.value).length === 0,

      // every (unique) selection element appears
      allOf: (op) => missing(op.value).length === 0,
    }),
    Match.orElse(() => false)
  );
};
