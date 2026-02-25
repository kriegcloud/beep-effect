/**
 * Schema-backed literal toolkit helpers for mixed literal types.
 *
 * Unlike {@link StringLiteralKit} which only handles string literals,
 * LiteralKit supports `string | number | boolean | bigint` literals
 * and maps them to string keys via {@link LiteralToKey}.
 *
 * @since 0.0.0
 * @module @beep/schema/LiteralKit.schema
 */

import { HashSet, Match, pipe } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { LiteralValue } from "effect/SchemaAST";
import type * as Unify from "effect/Unify";

type Literals = A.NonEmptyReadonlyArray<LiteralValue>;

/**
 * Convert a literal value to a valid object key (string representation).
 * Used for creating the Enum and is guards objects.
 *
 * Key format by type:
 * - boolean → "true" | "false"
 * - bigint → `bigint${value}n` (e.g., 1n → "bigint1n")
 * - number → `number${value}` (e.g., 200 → "number200")
 * - string → as-is (e.g., "pending" → "pending")
 *
 * @since 0.0.0
 * @category types
 */
export type LiteralToKey<L extends LiteralValue> = L extends boolean
  ? L extends true
    ? "true"
    : "false"
  : L extends bigint
    ? `bigint${L}n`
    : L extends number
      ? `number${L}`
      : L & string;

type EnumType<L extends Literals> = {
  readonly [K in L[number] as LiteralToKey<K>]: K;
};

type IsGuards<L extends Literals> = {
  readonly [K in L[number] as LiteralToKey<K>]: (i: unknown) => i is K;
};

type MatchCases<L extends Literals> = {
  readonly [K in L[number] as LiteralToKey<K>]: (value: K) => unknown;
};

/**
 * Valid keys for a MatchCases object derived from the literal set.
 */
type MatchKeys<L extends Literals> = LiteralToKey<L[number]>;

/**
 * Extract the union of return types from a Cases object.
 * Uses conditional inference to avoid TS2536 when indexing Cases
 * with remapped keys that TS can't prove are valid indices.
 */
type MatchReturn<Cases> = {
  [K in keyof Cases]: Cases[K] extends (...args: ReadonlyArray<unknown>) => infer R ? R : never;
}[keyof Cases];

type MatchFn<L extends Literals> = {
  <const Cases extends MatchCases<L>>(
    cases: Cases & { readonly [K in Exclude<keyof Cases, MatchKeys<L>>]: never }
  ): (value: L[number]) => Unify.Unify<MatchReturn<Cases>>;
  <const Cases extends MatchCases<L>>(
    value: L[number],
    cases: Cases & { readonly [K in Exclude<keyof Cases, MatchKeys<L>>]: never }
  ): Unify.Unify<MatchReturn<Cases>>;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert a literal value to its string key at runtime.
 *
 * @since 0.0.0
 * @category utils
 */
export const matchLiteral = <L extends LiteralValue>(literal: L): LiteralToKey<L> =>
  Match.value(literal).pipe(
    Match.when(P.isBoolean, () => (literal === true ? "true" : "false")),
    Match.when(P.isBigInt, () => `bigint${literal}n` as const),
    Match.when(P.isNumber, () => `number${literal}` as const),
    Match.when(P.isString, () => literal),
    Match.orElseAbsurd
  ) as LiteralToKey<L>;

const makeEnum = <L extends Literals>(literals: L): EnumType<L> =>
  pipe(
    literals,
    A.reduce({} as EnumType<L>, (acc, literal) => ({
      ...acc,
      [matchLiteral(literal)]: literal,
    }))
  );

const makeGuards = <L extends Literals>(literals: L): IsGuards<L> =>
  pipe(
    literals,
    A.reduce({} as IsGuards<L>, (acc, literal) => ({
      ...acc,
      [matchLiteral(literal)]: (i: unknown) => i === literal,
    }))
  );

const LiteralValueSchema = S.Union([S.String, S.BigInt, S.Boolean, S.Number]);

/**
 * Error thrown when `omitOptions` removes every literal and cannot return a non-empty result.
 *
 * @category errors
 * @since 0.0.0
 */
export class LiteralNotInSetError extends S.TaggedErrorClass<LiteralNotInSetError>("@beep/schema/LiteralKit")(
  "LiteralNotInSetError",
  {
    literals: S.Array(LiteralValueSchema),
    input: S.Array(LiteralValueSchema),
  },
  {
    identifier: "LiteralNotInSetError",
    title: "Not In Literals Error",
    description: "Error thrown when an input value is not found in the provided literals array.",
  }
) {}

const makeOptionsFns = <L extends Literals>(
  literals: L
): {
  readonly pickOptions: <LSubset extends A.NonEmptyReadonlyArray<L[number]>>(subset: LSubset) => LSubset;
  readonly omitOptions: <LSubset extends A.NonEmptyReadonlyArray<L[number]>>(
    subset: LSubset
  ) => A.NonEmptyReadonlyArray<Exclude<L[number], LSubset[number]>>;
} => ({
  pickOptions: <LSubset extends A.NonEmptyReadonlyArray<L[number]>>(subset: LSubset): LSubset => subset,
  omitOptions: <LSubset extends A.NonEmptyReadonlyArray<L[number]>>(
    subset: LSubset
  ): A.NonEmptyReadonlyArray<Exclude<L[number], LSubset[number]>> => {
    const keySet: HashSet.HashSet<LiteralValue> = HashSet.fromIterable(subset);
    const isExcluded = (literal: L[number]): literal is Exclude<L[number], LSubset[number]> =>
      !HashSet.has(literal)(keySet);
    const isResult = (
      i: ReadonlyArray<Exclude<L[number], LSubset[number]>>
    ): i is A.NonEmptyReadonlyArray<Exclude<L[number], LSubset[number]>> => A.isReadonlyArrayNonEmpty(i);
    const result = A.filter(literals, isExcluded);

    if (!isResult(result)) {
      throw new LiteralNotInSetError({ literals, input: result });
    }
    return result;
  },
});

function buildMatch<L extends Literals>(_: L) {
  function $match<const Cases extends MatchCases<L>>(
    cases: Cases & { readonly [K in Exclude<keyof Cases, MatchKeys<L>>]: never }
  ): (value: L[number]) => Unify.Unify<MatchReturn<Cases>>;
  function $match<const Cases extends MatchCases<L>>(
    value: L[number],
    cases: Cases & { readonly [K in Exclude<keyof Cases, MatchKeys<L>>]: never }
  ): Unify.Unify<MatchReturn<Cases>>;
  function $match(...args: Array<unknown>): unknown {
    if (args.length === 1) {
      const cases = args[0] as Record<string, (value: L[number]) => unknown>;
      return (value: L[number]) => {
        const key = matchLiteral(value);
        return cases[key](value);
      };
    }
    const value = args[0] as L[number];
    const cases = args[1] as Record<string, (value: L[number]) => unknown>;
    const key = matchLiteral(value);
    return cases[key](value);
  }

  return $match;
}

/**
 * Runtime literal kit that augments `Schema.Literals` with convenience helpers.
 *
 * Supports mixed literal types (`string | number | boolean | bigint`)
 * with keys mapped via {@link LiteralToKey}.
 *
 * @category models
 * @since 0.0.0
 */
export type LiteralKit<L extends Literals> = S.Literals<L> & {
  readonly Options: L;
  readonly is: IsGuards<L>;
  readonly Enum: EnumType<L>;
  readonly pickOptions: <LSubset extends A.NonEmptyReadonlyArray<L[number]>>(subset: LSubset) => LSubset;
  readonly omitOptions: <LSubset extends A.NonEmptyReadonlyArray<L[number]>>(
    subset: LSubset
  ) => A.NonEmptyReadonlyArray<Exclude<L[number], LSubset[number]>>;
  readonly $match: MatchFn<L>;
};

/**
 * Builds a literal schema kit from a non-empty tuple of mixed literals.
 *
 * @example
 * ```ts
 * import { LiteralKit } from "@beep/schema";
 *
 * const Status = LiteralKit([1, 20n, true, false, "hello"]);
 *
 * Status.Enum.number1;       // 1
 * Status.Enum.bigint20n;     // 20n
 * Status.Enum.true;          // true
 * Status.is.number1(42);     // false
 * Status.is.hello("hello");  // true
 *
 * const result = Status.$match(Status.Enum.number1, {
 *   number1: (v) => `got ${v}`,
 *   bigint20n: (v) => `got ${v}`,
 *   true: (v) => `got ${v}`,
 *   false: (v) => `got ${v}`,
 *   hello: (v) => `got ${v}`,
 * });
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export function LiteralKit<const L extends Literals>(literals: L): LiteralKit<L> {
  const base = S.Literals(literals);

  const is = makeGuards(literals);
  const { pickOptions, omitOptions } = makeOptionsFns(literals);
  const $match = buildMatch(literals);
  const Enum = makeEnum(literals);

  return Object.assign(base, {
    Options: literals,
    is,
    Enum,
    pickOptions,
    omitOptions,
    $match,
  }) as LiteralKit<L>;
}
// bench
