import { HashMap } from "effect";
import * as O from "effect/Option";

// =============================================================================
// Core Monoid Type Class
// =============================================================================

/**
 * Monoid type class
 *
 * A monoid is an algebraic structure with:
 * - An identity element (empty)
 * - An associative binary operation (combine)
 *
 * @typeParam A - The carrier type
 *
 * @since 0.0.0
 * @category models
 */
export interface Monoid<A> {
  /**
   * Associative binary operation
   * Must satisfy: combine(combine(x, y), z) = combine(x, combine(y, z))
   */
  readonly combine: (x: A, y: A) => A;
  /**
   * The identity element
   * Must satisfy: combine(empty, x) = x = combine(x, empty)
   */
  readonly empty: A;
}

/**
 * Helper to create a Monoid instance
 *
 * @since 0.0.0
 * @category constructors
 */
export const make = <A>(empty: A, combine: (x: A, y: A) => A): Monoid<A> => ({
  empty,
  combine,
});

/**
 * Fold a collection using a monoid
 * This is the fundamental aggregation operation.
 *
 * Category theory: This is a catamorphism from the list functor to the monoid.
 *
 * @since 0.0.0
 * @category folding
 */
export const fold =
  <A>(monoid: Monoid<A>) =>
  (values: Iterable<A>): A => {
    let result = monoid.empty;
    for (const value of values) {
      result = monoid.combine(result, value);
    }
    return result;
  };

/**
 * Combine an array of values using a monoid, seeded with the identity.
 *
 * @since 0.0.0
 * @category folding
 */
export const combineAll =
  <A>(monoid: Monoid<A>) =>
  (values: ReadonlyArray<A>): A =>
    values.reduce(monoid.combine, monoid.empty);

// =============================================================================
// String Monoids
// =============================================================================

/**
 * String concatenation monoid.
 *
 * - Empty: ""
 * - Combine: (x, y) => x + y
 *
 * @since 0.0.0
 * @category instances
 */
export const StringConcat: Monoid<string> = {
  empty: "",
  combine: (x, y) => x + y,
};

/**
 * String join with separator monoid.
 *
 * Combines strings with a separator, intelligently handling empty strings.
 *
 * @since 0.0.0
 * @category instances
 */
export const StringJoin = (separator: string): Monoid<string> => ({
  empty: "",
  combine: (x, y) => {
    if (x === "") return y;
    if (y === "") return x;
    return `${x}${separator}${y}`;
  },
});

/**
 * String join with prefix and suffix, useful for creating delimited lists.
 *
 * @since 0.0.0
 * @category instances
 */
export const StringDelimited = (prefix: string, suffix: string, separator: string): Monoid<string> => ({
  empty: "",
  combine: (x, y) => {
    if (x === "" && y === "") return "";
    if (x === "") return `${prefix}${y}${suffix}`;
    if (y === "") return `${prefix}${x}${suffix}`;
    const inner = `${x.slice(prefix.length, -suffix.length)}${separator}${y.slice(prefix.length, -suffix.length)}`;
    return `${prefix}${inner}${suffix}`;
  },
});

// =============================================================================
// Numeric Monoids
// =============================================================================

/**
 * Addition monoid for numbers (empty: 0).
 *
 * @since 0.0.0
 * @category instances
 */
export const NumberSum: Monoid<number> = {
  empty: 0,
  combine: (x, y) => x + y,
};

/**
 * Multiplication monoid for numbers (empty: 1).
 *
 * @since 0.0.0
 * @category instances
 */
export const NumberProduct: Monoid<number> = {
  empty: 1,
  combine: (x, y) => x * y,
};

/**
 * Max monoid for numbers (empty: -Infinity).
 *
 * @since 0.0.0
 * @category instances
 */
export const NumberMax: Monoid<number> = {
  empty: Number.NEGATIVE_INFINITY,
  combine: (x, y) => Math.max(x, y),
};

/**
 * Min monoid for numbers (empty: Infinity).
 *
 * @since 0.0.0
 * @category instances
 */
export const NumberMin: Monoid<number> = {
  empty: Number.POSITIVE_INFINITY,
  combine: (x, y) => Math.min(x, y),
};

// =============================================================================
// Array Monoids
// =============================================================================

/**
 * Array concatenation monoid (empty: []).
 *
 * @since 0.0.0
 * @category instances
 */
export const ArrayConcat = <A>(): Monoid<ReadonlyArray<A>> => ({
  empty: [],
  combine: (x, y) => [...x, ...y],
});

// =============================================================================
// Collection Monoids (Bag-of-Words, Multisets)
// =============================================================================

/**
 * Multiset (bag) union monoid.
 *
 * A multiset is a collection where elements can appear multiple times.
 * Union adds the multiplicities.
 *
 * @since 0.0.0
 * @category instances
 */
export const MultiSet = <K>(): Monoid<HashMap.HashMap<K, number>> => ({
  empty: HashMap.empty(),
  combine: (x, y) =>
    HashMap.reduce(y, x, (map, count, key) =>
      HashMap.modifyAt(map, key, (existing) => O.some(O.getOrElse(existing, () => 0) + count))
    ),
});

/**
 * Set union monoid (empty: ∅).
 *
 * @since 0.0.0
 * @category instances
 */
export const SetUnion = <A>(): Monoid<ReadonlySet<A>> => ({
  empty: new Set(),
  combine: (x, y) => new Set([...x, ...y]),
});

/**
 * Set intersection monoid.
 *
 * Note: There is no universal identity element for intersection over an
 * unbounded universe, so we model the identity as the "universal set" via
 * `Option.none()` (intersecting with the universal set is the identity).
 * Only use when all elements come from a finite universe.
 *
 * @since 0.0.0
 * @category instances
 */
export const SetIntersection = <A>(): Monoid<O.Option<ReadonlySet<A>>> => ({
  empty: O.none(),
  combine: (x, y) =>
    O.match(x, {
      onNone: () => y,
      onSome: (xs) =>
        O.match(y, {
          onNone: () => x,
          onSome: (ys) => {
            const result = new Set<A>();
            for (const elem of xs) {
              if (ys.has(elem)) result.add(elem);
            }
            return O.some(result);
          },
        }),
    }),
});

// =============================================================================
// Vector Monoids (for embeddings)
// =============================================================================

/**
 * Vector addition monoid (element-wise addition; empty: zero vector).
 *
 * @since 0.0.0
 * @category instances
 */
export const VectorAdd = (dimension: number): Monoid<ReadonlyArray<number>> => ({
  empty: Array(dimension).fill(0),
  combine: (x, y) => x.map((xi, i) => xi + (y[i] ?? 0)),
});

/**
 * Vector average monoid (tracks sum and count to compute a running average).
 *
 * @since 0.0.0
 * @category instances
 */
export const VectorAverage = (
  dimension: number
): Monoid<{ readonly sum: ReadonlyArray<number>; readonly count: number }> => ({
  empty: { sum: Array(dimension).fill(0), count: 0 },
  combine: (x, y) => ({
    sum: x.sum.map((xi, i) => xi + (y.sum[i] ?? 0)),
    count: x.count + y.count,
  }),
});

/**
 * Extract the average from a {@link VectorAverage} result.
 *
 * @since 0.0.0
 * @category accessors
 */
export const getAverage = (result: {
  readonly sum: ReadonlyArray<number>;
  readonly count: number;
}): ReadonlyArray<number> => (result.count === 0 ? result.sum : result.sum.map((x) => x / result.count));

// =============================================================================
// Tuple Monoids (Product)
// =============================================================================

/**
 * Product monoid: combine two monoids component-wise.
 *
 * @since 0.0.0
 * @category combinators
 */
export const Product = <A, B>(ma: Monoid<A>, mb: Monoid<B>): Monoid<readonly [A, B]> => ({
  empty: [ma.empty, mb.empty],
  combine: ([xa, xb], [ya, yb]) => [ma.combine(xa, ya), mb.combine(xb, yb)],
});

/**
 * Triple product monoid.
 *
 * @since 0.0.0
 * @category combinators
 */
export const Product3 = <A, B, C>(ma: Monoid<A>, mb: Monoid<B>, mc: Monoid<C>): Monoid<readonly [A, B, C]> => ({
  empty: [ma.empty, mb.empty, mc.empty],
  combine: ([xa, xb, xc], [ya, yb, yc]) => [ma.combine(xa, ya), mb.combine(xb, yb), mc.combine(xc, yc)],
});

// =============================================================================
// Functor Monoids
// =============================================================================

/**
 * Lift a monoid through Option: combine point-wise, treating `None` as the identity.
 *
 * @since 0.0.0
 * @category combinators
 */
export const Option = <A>(monoid: Monoid<A>): Monoid<O.Option<A>> => ({
  empty: O.none(),
  combine: (x, y) =>
    O.match(x, {
      onNone: () => y,
      onSome: (xa) =>
        O.match(y, {
          onNone: () => x,
          onSome: (ya) => O.some(monoid.combine(xa, ya)),
        }),
    }),
});

// =============================================================================
// Endomorphism Monoid
// =============================================================================

/**
 * Endomorphism monoid: functions from A to A under composition (empty: identity).
 *
 * @since 0.0.0
 * @category instances
 */
export const Endo = <A>(): Monoid<(a: A) => A> => ({
  empty: (a) => a,
  combine: (f, g) => (a) => f(g(a)),
});

// =============================================================================
// Dual Monoid
// =============================================================================

/**
 * Dual monoid: reverse the order of combination (x ⊕' y = y ⊕ x).
 *
 * @since 0.0.0
 * @category combinators
 */
export const Dual = <A>(monoid: Monoid<A>): Monoid<A> => ({
  empty: monoid.empty,
  combine: (x, y) => monoid.combine(y, x),
});

// =============================================================================
// Boolean Monoids
// =============================================================================

/**
 * Logical AND monoid (empty: true).
 *
 * @since 0.0.0
 * @category instances
 */
export const BooleanAll: Monoid<boolean> = {
  empty: true,
  combine: (x, y) => x && y,
};

/**
 * Logical OR monoid (empty: false).
 *
 * @since 0.0.0
 * @category instances
 */
export const BooleanAny: Monoid<boolean> = {
  empty: false,
  combine: (x, y) => x || y,
};

// =============================================================================
// Monoid Laws (for testing)
// =============================================================================

/**
 * Check left identity law: empty ⊕ x = x
 *
 * @since 0.0.0
 * @category laws
 */
export const checkLeftIdentity = <A>(
  monoid: Monoid<A>,
  x: A,
  equals: (a: A, b: A) => boolean = (a, b) => a === b
): boolean => equals(monoid.combine(monoid.empty, x), x);

/**
 * Check right identity law: x ⊕ empty = x
 *
 * @since 0.0.0
 * @category laws
 */
export const checkRightIdentity = <A>(
  monoid: Monoid<A>,
  x: A,
  equals: (a: A, b: A) => boolean = (a, b) => a === b
): boolean => equals(monoid.combine(x, monoid.empty), x);

/**
 * Check associativity law: (x ⊕ y) ⊕ z = x ⊕ (y ⊕ z)
 *
 * @since 0.0.0
 * @category laws
 */
export const checkAssociativity = <A>(
  monoid: Monoid<A>,
  x: A,
  y: A,
  z: A,
  equals: (a: A, b: A) => boolean = (a, b) => a === b
): boolean => {
  const left = monoid.combine(monoid.combine(x, y), z);
  const right = monoid.combine(x, monoid.combine(y, z));
  return equals(left, right);
};

/**
 * Check all monoid laws against a representative triple.
 *
 * @since 0.0.0
 * @category laws
 */
export const checkLaws = <A>(
  monoid: Monoid<A>,
  values: readonly [A, A, A],
  equals: (a: A, b: A) => boolean = (a, b) => a === b
): boolean => {
  const [x, y, z] = values;
  return (
    checkLeftIdentity(monoid, x, equals) &&
    checkRightIdentity(monoid, x, equals) &&
    checkAssociativity(monoid, x, y, z, equals)
  );
};
