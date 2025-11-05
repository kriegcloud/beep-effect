import type { UnsafeTypes } from "@beep/types";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as FC from "effect/FastCheck";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as S from "effect/Schema";

type ArbParamsBase = {
  qty?: number | undefined;
  flat?: boolean | undefined;
};

type BoundArbitrary<A, I, R> = ArbParamsBase & {
  _tag: "bound";
  schema: S.Schema<A, I, R>;
};

type TypeArbitrary<A, I, R> = ArbParamsBase & {
  _tag: "type";
  schema: S.Schema<A, I, R>;
};

type EncodedArbitrary<A, I, R> = ArbParamsBase & {
  _tag: "encoded";
  schema: S.Schema<A, I, R>;
};

type Arbs<A, I, R> = BoundArbitrary<A, I, R> | TypeArbitrary<A, I, R> | EncodedArbitrary<A, I, R>;

export const makeFlat = <A extends UnsafeTypes.UnsafeReadonlyArray>(arr: A, qty: number, flat: boolean) =>
  qty === 1 && flat ? A.flatten(arr) : arr;

export const makeArb = <A, I, R>(params: Arbs<A, I, R>) =>
  Match.value(params).pipe(
    Match.tags({
      bound: ({ schema, flat = false, qty = 1 }) =>
        makeFlat(FC.sample(Arbitrary.make(S.encodedBoundSchema(schema)), qty), qty, flat),
      type: ({ schema, flat = false, qty = 1 }) =>
        makeFlat(FC.sample(Arbitrary.make(S.typeSchema(schema)), qty), qty, flat),
      encoded: ({ schema, flat = false, qty = 1 }) =>
        makeFlat(FC.sample(Arbitrary.make(S.encodedSchema(schema)), qty), qty, flat),
    })
  );

export const makeArbs = F.flow(
  <A, I, R>(schema: S.Schema<A, I, R>) =>
    (kind: "bound" | "type" | "encoded", qty?: number, flat?: boolean) =>
      Match.value(kind).pipe(
        Match.when("bound", () => makeArb({ schema, _tag: "bound", qty, flat })),
        Match.when("type", () => makeArb({ schema, _tag: "type", qty, flat })),
        Match.when("encoded", () => makeArb({ schema, _tag: "encoded", qty, flat }))
      )
);
