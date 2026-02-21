/**
 * Schema-backed string literal toolkit helpers.
 *
 * @since 0.0.0
 */

import { pipe } from "effect";
import * as A from "effect/Array";
import * as HashSet from "effect/HashSet";
import * as S from "effect/Schema";
import type * as Unify from "effect/Unify";

type LiteralStrings = A.NonEmptyReadonlyArray<string>;

type EnumType<L extends LiteralStrings> = {
  readonly [K in L[number]]: K;
};

type IsGuards<L extends LiteralStrings> = {
  readonly [K in L[number]]: (i: unknown) => i is K;
};

type MatchCases<L extends LiteralStrings> = {
  readonly [K in L[number]]: (value: K) => unknown;
};

type MatchFn<L extends LiteralStrings> = {
  <const Cases extends MatchCases<L>>(
    cases: Cases & { readonly [K in Exclude<keyof Cases, L[number]>]: never }
  ): (value: L[number]) => Unify.Unify<ReturnType<Cases[L[number]]>>;
  <const Cases extends MatchCases<L>>(
    value: L[number],
    cases: Cases & { readonly [K in Exclude<keyof Cases, L[number]>]: never }
  ): Unify.Unify<ReturnType<Cases[L[number]]>>;
};

const makeEnum = <L extends LiteralStrings>(literals: L): EnumType<L> =>
  pipe(
    literals,
    A.reduce({} as EnumType<L>, (acc, literal) => ({
      ...acc,
      [literal]: literal,
    }))
  );

const makeGuards = <L extends LiteralStrings>(literals: L): IsGuards<L> =>
  pipe(
    literals,
    A.reduce({} as IsGuards<L>, (acc, literal) => ({
      ...acc,
      [literal]: (i: unknown): i is L[number] => i === literal,
    }))
  );

/**
 * Error thrown when `omitOptions` removes every literal and cannot return a non-empty result.
 *
 * @category errors
 * @since 0.0.0
 */
export class NotInLiteralsError extends S.TaggedErrorClass<NotInLiteralsError>("@beep/schema/StringLiteralKit")(
  "NotInLiteralsError",
  {
    literals: S.Array(S.String),
    input: S.Array(S.String),
  },
  {
    identifier: "NotInLiteralsError",
    title: "Not In Literals Error",
    description: "Error thrown when an input value is not found in the provided literals array.",
  }
) {}

const makeOptionsFns = <L extends LiteralStrings>(
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
    const keySet: HashSet.HashSet<string> = HashSet.fromIterable(subset);
    const isExcluded = (literal: L[number]): literal is Exclude<L[number], LSubset[number]> =>
      !HashSet.has(literal)(keySet);
    const isResult = (
      i: ReadonlyArray<Exclude<L[number], LSubset[number]>>
    ): i is A.NonEmptyReadonlyArray<Exclude<L[number], LSubset[number]>> => A.isReadonlyArrayNonEmpty(i);
    const result = A.filter(literals, isExcluded);

    if (!isResult(result)) {
      throw new NotInLiteralsError({ literals, input: result });
    }
    return result;
  },
});

function buildMatch<L extends LiteralStrings>(_: L) {
  function $match<const Cases extends MatchCases<L>>(
    cases: Cases & { [K in Exclude<keyof Cases, L[number]>]: never }
  ): (value: L[number]) => Unify.Unify<ReturnType<Cases[L[number]]>>;
  function $match<const Cases extends MatchCases<L>>(
    value: L[number],
    cases: Cases & { [K in Exclude<keyof Cases, L[number]>]: never }
  ): Unify.Unify<ReturnType<Cases[L[number]]>>;
  function $match<const Cases extends MatchCases<L>>(): unknown {
    if (arguments.length === 1) {
      const cases = arguments[0] as Cases;
      return (value: L[number]) =>
        (cases[value as L[number]] as (value: L[number]) => unknown)(value) as Unify.Unify<
          ReturnType<Cases[L[number]]>
        >;
    }
    const value = arguments[0] as L[number];
    const cases = arguments[1] as Cases;
    return (cases[value as L[number]] as (value: L[number]) => unknown)(value) as Unify.Unify<
      ReturnType<Cases[L[number]]>
    >;
  }

  return $match;
}

/**
 * Runtime literal kit that augments `Schema.Literals` with convenience helpers.
 *
 * @category models
 * @since 0.0.0
 */
export type StringLiteralKit<L extends LiteralStrings> = S.Literals<L> & {
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
 * Builds a literal schema kit from a non-empty tuple of string literals.
 *
 * @example
 * ```ts
 * import { StringLiteralKit } from "@beep/schema";
 *
 * const WaveformMode = StringLiteralKit(["static", "scrolling"]);
 *
 * WaveformMode.Enum.static;
 * WaveformMode.is.scrolling("scrolling");
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export function StringLiteralKit<const L extends LiteralStrings>(literals: L): StringLiteralKit<L> {
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
  }) as StringLiteralKit<L>;
}
