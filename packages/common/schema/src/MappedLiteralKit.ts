/**
 * Schema-backed mapped literal toolkit helpers for reversible literal pairs.
 *
 * @since 0.0.0
 * @module @beep/schema/MappedLiteralKit
 */

import { $SchemaId } from "@beep/identity/packages";
import { HashMap, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { LiteralValue } from "effect/SchemaAST";
import { LiteralKit, type LiteralKit as LiteralKitSchema, type LiteralToKey, matchLiteral } from "./LiteralKit.ts";

const $I = $SchemaId.create("MappedLiteralKit");

type Literals = A.NonEmptyReadonlyArray<LiteralValue>;
type MappedPair = readonly [LiteralValue, LiteralValue];
type MappedPairs = A.NonEmptyReadonlyArray<MappedPair>;

type TupleIndices<T extends ReadonlyArray<unknown>> = Exclude<keyof T, keyof ReadonlyArray<unknown>>;

type FromLiterals<M extends MappedPairs> = {
  readonly [I in keyof M]: M[I] extends readonly [infer From extends LiteralValue, LiteralValue] ? From : never;
};

type ToLiterals<M extends MappedPairs> = {
  readonly [I in keyof M]: M[I] extends readonly [LiteralValue, infer To extends LiteralValue] ? To : never;
};

type EnumMap<From extends Literals, To extends { readonly [I in keyof From]: LiteralValue }> = {
  readonly [I in TupleIndices<From> as From[I] extends LiteralValue ? LiteralToKey<From[I]> : never]: To[I];
};

type DirectionalHelpers<From extends Literals, To extends { readonly [I in keyof From]: LiteralValue }> = {
  readonly Options: LiteralKitSchema<From>["Options"];
  readonly is: LiteralKitSchema<From>["is"];
  readonly Enum: EnumMap<From, To>;
  readonly pickOptions: LiteralKitSchema<From>["pickOptions"];
  readonly omitOptions: LiteralKitSchema<From>["omitOptions"];
  readonly $match: LiteralKitSchema<From>["$match"];
};

type TransformedLiteralsSchema<
  From extends Literals,
  To extends { readonly [I in keyof From]: LiteralValue },
> = S.Union<{ readonly [I in keyof From]: S.decodeTo<S.Literal<To[I]>, S.Literal<From[I]>> }>;

type DirectionalKit<
  From extends Literals,
  To extends { readonly [I in keyof From]: LiteralValue },
> = TransformedLiteralsSchema<From, To> & DirectionalHelpers<From, To>;

/**
 * Error thrown when `MappedLiteralKit` receives duplicate literals on either side.
 *
 * @category errors
 * @since 0.0.0
 */
export class MappedLiteralDuplicateError extends S.TaggedErrorClass<MappedLiteralDuplicateError>(
  $I`MappedLiteralDuplicateError`
)(
  "MappedLiteralDuplicateError",
  {
    side: S.Literals(["from", "to"]),
    literal: S.Union([S.String, S.BigInt, S.Boolean, S.Number]),
    firstIndex: S.Number,
    secondIndex: S.Number,
  },
  $I.annote("MappedLiteralDuplicateError", {
    title: "Mapped Literal Duplicate Error",
    description: "Thrown when mapped literal entries are not one-to-one.",
  })
) {}

type SeenState = {
  readonly from: HashMap.HashMap<LiteralValue, number>;
  readonly to: HashMap.HashMap<LiteralValue, number>;
};

const makeMappedEnum = <From extends Literals, To extends { readonly [I in keyof From]: LiteralValue }>(
  from: From,
  to: To
): EnumMap<From, To> =>
  pipe(
    from,
    A.reduce({} as EnumMap<From, To>, (acc, fromLiteral, index) => ({
      ...acc,
      [matchLiteral(fromLiteral)]: to[index],
    }))
  );

const validateMappings = <M extends MappedPairs>(mappings: M): void => {
  pipe(
    mappings,
    A.reduce(
      {
        from: HashMap.empty<LiteralValue, number>(),
        to: HashMap.empty<LiteralValue, number>(),
      } satisfies SeenState,
      (state, [fromLiteral, toLiteral], index): SeenState => {
        const seenFrom = HashMap.get(state.from, fromLiteral);
        if (O.isSome(seenFrom)) {
          throw new MappedLiteralDuplicateError({
            side: "from",
            literal: fromLiteral,
            firstIndex: seenFrom.value,
            secondIndex: index,
          });
        }

        const seenTo = HashMap.get(state.to, toLiteral);
        if (O.isSome(seenTo)) {
          throw new MappedLiteralDuplicateError({
            side: "to",
            literal: toLiteral,
            firstIndex: seenTo.value,
            secondIndex: index,
          });
        }

        return {
          from: HashMap.set(state.from, fromLiteral, index),
          to: HashMap.set(state.to, toLiteral, index),
        };
      }
    )
  );
};

const splitMappings = <M extends MappedPairs>(
  mappings: M
): {
  readonly from: FromLiterals<M>;
  readonly to: ToLiterals<M>;
} => ({
  from: pipe(
    mappings,
    A.map(([from]) => from)
  ) as FromLiterals<M>,
  to: pipe(
    mappings,
    A.map(([_, to]) => to)
  ) as ToLiterals<M>,
});

const makeDirectionalKit = <From extends Literals, To extends { readonly [I in keyof From]: LiteralValue }>(
  from: From,
  to: To
): DirectionalKit<From, To> => {
  const base = S.Literals(from).transform(to);
  const literalKit = LiteralKit(from);
  const Enum = makeMappedEnum(from, to);

  return Object.defineProperties(base, {
    Options: { value: literalKit.Options, enumerable: true, writable: true, configurable: true },
    is: { value: literalKit.is, enumerable: true, writable: true, configurable: true },
    Enum: { value: Enum, enumerable: true, writable: true, configurable: true },
    pickOptions: { value: literalKit.pickOptions, enumerable: true, writable: true, configurable: true },
    omitOptions: { value: literalKit.omitOptions, enumerable: true, writable: true, configurable: true },
    $match: { value: literalKit.$match, enumerable: true, writable: true, configurable: true },
  }) as DirectionalKit<From, To>;
};

/**
 * Runtime mapped literal kit that augments transformed literal schemas with directional helpers.
 *
 * - `decode` maps `From` literals to `To` literals.
 * - `encode` maps `To` literals back to `From` literals.
 * - Top-level helpers (`Enum`, `is`, `$match`, etc.) are aliases of `From`.
 *
 * @example
 * ```ts
 * import { MappedLiteralKit } from "@beep/schema";
 * import * as S from "effect/Schema";
 *
 * const SqlState = MappedLiteralKit([
 *   ["SUCCESSFUL_COMPLETION", "00000"],
 *   ["WARNING", "01000"],
 * ] as const);
 *
 * S.decodeSync(SqlState)("SUCCESSFUL_COMPLETION"); // "00000"
 * S.encodeSync(SqlState)("00000"); // "SUCCESSFUL_COMPLETION"
 *
 * SqlState.From.Enum.SUCCESSFUL_COMPLETION; // "00000"
 * SqlState.To.Enum["00000"]; // "SUCCESSFUL_COMPLETION"
 * SqlState.Enum.WARNING; // "01000"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export type MappedLiteralKit<M extends MappedPairs> = DirectionalKit<FromLiterals<M>, ToLiterals<M>> & {
  readonly From: DirectionalKit<FromLiterals<M>, ToLiterals<M>>;
  readonly To: DirectionalKit<ToLiterals<M>, FromLiterals<M>>;
};

/**
 * Builds a mapped literal schema kit from a non-empty tuple of literal pairs.
 *
 * Requires one-to-one mappings; duplicates on either side throw {@link MappedLiteralDuplicateError}.
 *
 * @category constructors
 * @since 0.0.0
 */
export function MappedLiteralKit<const M extends MappedPairs>(mappings: M): MappedLiteralKit<M> {
  validateMappings(mappings);
  const { from, to } = splitMappings(mappings);

  const From = makeDirectionalKit(from, to);
  const To = makeDirectionalKit(to, from);

  return Object.defineProperties(From, {
    From: { value: From, enumerable: true, writable: true, configurable: true },
    To: { value: To, enumerable: true, writable: true, configurable: true },
  }) as MappedLiteralKit<M>;
}
