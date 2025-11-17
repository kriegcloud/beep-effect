/**
 * Arbitrary sampling utilities for schema-v2 helpers.
 *
 * Provides convenience wrappers over `effect/Arbitrary` and FastCheck so docs/examples share canonical generators.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { makeArbs } from "@beep/schema-v2/core/utils/arbitrary";
 *
 * const sample = makeArbs(S.String)("type", 2);
 *
 * @category Core/Utils
 * @since 0.1.0
 */
import type { UnsafeTypes } from "@beep/types";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as FC from "effect/FastCheck";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as S from "effect/Schema";

type ArbParamsBase = {
  readonly qty?: number | undefined;
  readonly flat?: boolean | undefined;
};

type BoundArbitrary<A, I, R> = ArbParamsBase & {
  readonly _tag: "bound";
  readonly schema: S.Schema<A, I, R>;
};

type TypeArbitrary<A, I, R> = ArbParamsBase & {
  readonly _tag: "type";
  readonly schema: S.Schema<A, I, R>;
};

type EncodedArbitrary<A, I, R> = ArbParamsBase & {
  readonly _tag: "encoded";
  readonly schema: S.Schema<A, I, R>;
};

type ArbitraryConfig<A, I, R> = BoundArbitrary<A, I, R> | TypeArbitrary<A, I, R> | EncodedArbitrary<A, I, R>;

/**
 * Flattens sampled arbitrary values when callers only want a single example.
 *
 * @example
 * import { makeFlat } from "@beep/schema-v2/core/utils/arbitrary";
 *
 * const samples = [["alpha"], ["beta"]];
 * makeFlat(samples, 2, true);
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export const makeFlat = <Samples extends UnsafeTypes.UnsafeReadonlyArray>(
  samples: Samples,
  qty: number,
  flat: boolean
) => (qty === 1 && flat ? A.flatten(samples) : samples);

/**
 * Samples either the encoded, type, or bound schema arbitraries for documentation or testing.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { makeArb } from "@beep/schema-v2/core/utils/arbitrary";
 *
 * const samples = makeArb({ _tag: "type", schema: S.String, qty: 3 });
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export const makeArb = <A, I, R>(params: ArbitraryConfig<A, I, R>) =>
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

/**
 * Factory that specializes {@link makeArb} for a schema and returns a sampler by channel.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { makeArbs } from "@beep/schema-v2/core/utils/arbitrary";
 *
 * const next = makeArbs(S.Number);
 * const encodedSamples = next("encoded", 2);
 *
 * @category Core/Utils
 * @since 0.1.0
 */
export const makeArbs = F.flow(
  <A, I, R>(schema: S.Schema<A, I, R>) =>
    (kind: "bound" | "type" | "encoded", qty?: number, flat?: boolean) =>
      Match.value(kind).pipe(
        Match.when("bound", () => makeArb({ schema, _tag: "bound", qty, flat })),
        Match.when("type", () => makeArb({ schema, _tag: "type", qty, flat })),
        Match.when("encoded", () => makeArb({ schema, _tag: "encoded", qty, flat }))
      )
);
