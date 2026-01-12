import { format, toComposite } from "@beep/schema/core";
import type * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Equivalence from "effect/Equivalence";
import * as mutableMutableHashSet_ from "effect/MutableHashSet";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import type * as Pretty from "effect/Pretty";
import * as S from "effect/Schema";

const TypeId: unique symbol = Symbol.for("effect/MutableHashSet");
export const isMutableHashSet: {
  <A>(u: Iterable<A>): u is mutableMutableHashSet_.MutableHashSet<A>;
  (u: unknown): u is mutableMutableHashSet_.MutableHashSet<unknown>;
} = (u: unknown): u is mutableMutableHashSet_.MutableHashSet<unknown> => P.hasProperty(u, TypeId);

const mutableMutableHashSetArbitrary =
  <A>(
    item: Arbitrary.LazyArbitrary<A>,
    ctx: Arbitrary.ArbitraryGenerationContext
  ): Arbitrary.LazyArbitrary<mutableMutableHashSet_.MutableHashSet<A>> =>
  (fc) => {
    const items = fc.array(item(fc));
    return (ctx.depthIdentifier !== undefined ? fc.oneof(ctx, fc.constant([]), items) : items).map(
      mutableMutableHashSet_.fromIterable
    );
  };

const mutableMutableHashSetPretty =
  <A>(item: Pretty.Pretty<A>): Pretty.Pretty<mutableMutableHashSet_.MutableHashSet<A>> =>
  (set) =>
    `MutableHashSet(${Array.from(set)
      .map((a) => item(a))
      .join(", ")})`;

const mutableMutableHashSetEquivalence = <A>(
  item: Equivalence.Equivalence<A>
): Equivalence.Equivalence<mutableMutableHashSet_.MutableHashSet<A>> => {
  const arrayEquivalence = A.getEquivalence(item);
  return Equivalence.make((a, b) => arrayEquivalence(Array.from(a), Array.from(b)));
};

const mutableMutableHashSetParse =
  <A, R>(
    decodeUnknown: ParseResult.DecodeUnknown<ReadonlyArray<A>, R>
  ): ParseResult.DeclarationDecodeUnknown<mutableMutableHashSet_.MutableHashSet<A>, R> =>
  (u, options, ast) =>
    isMutableHashSet(u)
      ? toComposite(decodeUnknown(Array.from(u), options), mutableMutableHashSet_.fromIterable, ast, u)
      : ParseResult.fail(new ParseResult.Type(ast, u));

/**
 * @category api interface
 * @since 3.10.0
 */
export interface MutableHashSetFromSelf<Value extends S.Schema.Any>
  extends S.AnnotableDeclare<
    MutableHashSetFromSelf<Value>,
    mutableMutableHashSet_.MutableHashSet<S.Schema.Type<Value>>,
    mutableMutableHashSet_.MutableHashSet<S.Schema.Encoded<Value>>,
    [Value]
  > {}

/**
 * @category MutableHashSet transformations
 * @since 3.10.0
 */
export const MutableHashSetFromSelf = <Value extends S.Schema.Any>(value: Value): MutableHashSetFromSelf<Value> => {
  return S.declare(
    [value],
    {
      decode: (item) => mutableMutableHashSetParse(ParseResult.decodeUnknown(S.mutable(S.Array(item)))),
      encode: (item) => mutableMutableHashSetParse(ParseResult.encodeUnknown(S.mutable(S.Array(item)))),
    },
    {
      typeConstructor: { _tag: "effect/MutableHashSet" },
      description: `MutableHashSet<${format(value)}>`,
      pretty: mutableMutableHashSetPretty,
      arbitrary: mutableMutableHashSetArbitrary,
      equivalence: mutableMutableHashSetEquivalence,
    }
  );
};

/**
 * @category api interface
 * @since 3.10.0
 */
export interface MutableHashSet<Value extends S.Schema.Any>
  extends S.transform<S.mutable<S.Array$<Value>>, MutableHashSetFromSelf<S.SchemaClass<S.Schema.Type<Value>>>> {}

/**
 * @category MutableHashSet transformations
 * @since 3.10.0
 */
export function MutableHashSet<Value extends S.Schema.Any>(value: Value): MutableHashSet<Value> {
  return S.transform(S.mutable(S.Array(value)), MutableHashSetFromSelf(S.typeSchema(S.asSchema(value))), {
    strict: true,
    decode: (i) => mutableMutableHashSet_.fromIterable(i),
    encode: (a) => Array.from(a),
  });
}
