import { format, toComposite } from "@beep/schema/core";
import type * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Equivalence from "effect/Equivalence";
import * as _mutableHashMap from "effect/MutableHashMap";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import type * as Pretty from "effect/Pretty";
import * as S from "effect/Schema";

const TypeId: unique symbol = Symbol.for("effect/MutableHashMap");
const mutableHashMapArbitrary =
  <K, V>(
    key: Arbitrary.LazyArbitrary<K>,
    value: Arbitrary.LazyArbitrary<V>,
    ctx: Arbitrary.ArbitraryGenerationContext
  ): Arbitrary.LazyArbitrary<_mutableHashMap.MutableHashMap<K, V>> =>
  (fc) => {
    const items = fc.array(fc.tuple(key(fc), value(fc)));
    return (ctx.depthIdentifier !== undefined ? fc.oneof(ctx, fc.constant([]), items) : items).map(
      _mutableHashMap.fromIterable
    );
  };
export const isMutableHashMap: {
  <K, V>(u: Iterable<readonly [K, V]>): u is _mutableHashMap.MutableHashMap<K, V>;
  (u: unknown): u is _mutableHashMap.MutableHashMap<unknown, unknown>;
} = (u: unknown): u is _mutableHashMap.MutableHashMap<unknown, unknown> => P.hasProperty(u, TypeId);
const mutableHashMapPretty =
  <K, V>(key: Pretty.Pretty<K>, value: Pretty.Pretty<V>): Pretty.Pretty<_mutableHashMap.MutableHashMap<K, V>> =>
  (map) =>
    `HashMap([${Array.from(map)
      .map(([k, v]) => `[${key(k)}, ${value(v)}]`)
      .join(", ")}])`;

const mutableHashMapEquivalence = <K, V>(
  key: Equivalence.Equivalence<K>,
  value: Equivalence.Equivalence<V>
): Equivalence.Equivalence<_mutableHashMap.MutableHashMap<K, V>> => {
  const arrayEquivalence = A.getEquivalence(
    Equivalence.make<[K, V]>(([ka, va], [kb, vb]) => key(ka, kb) && value(va, vb))
  );
  return Equivalence.make((a, b) => arrayEquivalence(Array.from(a), Array.from(b)));
};

const hashMapParse =
  <R, K, V>(
    decodeUnknown: ParseResult.DecodeUnknown<ReadonlyArray<readonly [K, V]>, R>
  ): ParseResult.DeclarationDecodeUnknown<_mutableHashMap.MutableHashMap<K, V>, R> =>
  (u, options, ast) =>
    isMutableHashMap(u)
      ? toComposite(decodeUnknown(Array.from(u), options), _mutableHashMap.fromIterable, ast, u)
      : ParseResult.fail(new ParseResult.Type(ast, u));

export interface MutableHashMapFromSelf<K extends S.Schema.Any, V extends S.Schema.Any>
  extends S.AnnotableDeclare<
    MutableHashMapFromSelf<K, V>,
    _mutableHashMap.MutableHashMap<S.Schema.Type<K>, S.Schema.Type<V>>,
    _mutableHashMap.MutableHashMap<S.Schema.Encoded<K>, S.Schema.Encoded<V>>,
    [K, V]
  > {}

/**
 * @category HashMap transformations
 * @since 3.10.0
 */
export const MutableHashMapFromSelf = <K extends S.Schema.Any, V extends S.Schema.Any>({
  key,
  value,
}: {
  readonly key: K;
  readonly value: V;
}): MutableHashMapFromSelf<K, V> => {
  return S.declare(
    [key, value],
    {
      decode: (key, value) => hashMapParse(ParseResult.decodeUnknown(S.mutable(S.Array(S.Tuple(key, value))))),
      encode: (key, value) => hashMapParse(ParseResult.encodeUnknown(S.mutable(S.Array(S.Tuple(key, value))))),
    },
    {
      typeConstructor: { _tag: "effect/HashMap" },
      description: `HashMap<${format(key)}, ${format(value)}>`,
      pretty: mutableHashMapPretty,
      arbitrary: mutableHashMapArbitrary,
      equivalence: mutableHashMapEquivalence,
    }
  );
};

/**
 * @category api interface
 * @since 3.10.0
 */
export interface MutableHashMap<K extends S.Schema.Any, V extends S.Schema.Any>
  extends S.transform<
    S.mutable<S.Array$<S.Tuple2<K, V>>>,
    MutableHashMapFromSelf<S.SchemaClass<S.Schema.Type<K>>, S.SchemaClass<S.Schema.Type<V>>>
  > {}

/**
 * @category HashMap transformations
 * @since 3.10.0
 */
export const MutableHashMap = <K extends S.Schema.Any, V extends S.Schema.Any>({
  key,
  value,
}: {
  readonly key: K;
  readonly value: V;
}): MutableHashMap<K, V> => {
  return S.transform(
    S.mutable(S.Array(S.Tuple(key, value))),
    MutableHashMapFromSelf({ key: S.typeSchema(S.asSchema(key)), value: S.typeSchema(S.asSchema(value)) }),
    {
      strict: true,
      decode: (i) => _mutableHashMap.fromIterable(i),
      encode: (a) => Array.from(a),
    }
  );
};
