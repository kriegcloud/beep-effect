/**
 * Schema-backed literal toolkit helpers for mixed literal types.
 *
 *
 * @since 0.0.0
 * @module @beep/schema/LiteralKit
 */

import { $SchemaId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema/TaggedErrorClass";
import { HashMap, HashSet, Match, pipe, type SchemaAST, type Struct, type Unify } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SchemaId.create("LiteralKit");

type Literals = A.NonEmptyReadonlyArray<SchemaAST.LiteralValue>;

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
 * @category DomainModel
 */
export type LiteralToKey<L extends SchemaAST.LiteralValue> = L extends boolean
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

type Thunks<L extends Literals> = {
  readonly [K in L[number] as LiteralToKey<K>]: () => K;
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

type PropertyKeyLiteral = Extract<SchemaAST.LiteralValue, PropertyKey>;

type PropertyKeyLiterals<L extends Literals> = {
  readonly [I in keyof L]: Extract<L[I], PropertyKeyLiteral>;
};

type StructFields = Readonly<Record<string, S.Top>>;

type TaggedUnionCases<L extends ReadonlyArray<PropertyKeyLiteral>> = {
  readonly [K in L[number] as LiteralToKey<K>]: StructFields;
};

type TaggedUnionCaseFields<
  L extends ReadonlyArray<PropertyKeyLiteral>,
  Tag extends string,
  Cases extends TaggedUnionCases<L>,
  Literal extends L[number],
> = Struct.Simplify<{ readonly [K in Tag]: S.tag<Literal> } & Cases[LiteralToKey<Literal> & keyof Cases]>;

type TaggedUnionMember<
  L extends ReadonlyArray<PropertyKeyLiteral>,
  Tag extends string,
  Cases extends TaggedUnionCases<L>,
  Literal extends L[number] = L[number],
> = Literal extends L[number]
  ? S.Struct<TaggedUnionCaseFields<L, Tag, Cases, Literal>> & {
      readonly Type: Struct.Simplify<{ readonly [K in Tag]: Literal }>;
    }
  : never;

type TaggedUnionMembers<
  L extends ReadonlyArray<PropertyKeyLiteral>,
  Tag extends string,
  Cases extends TaggedUnionCases<L>,
> = {
  readonly [I in keyof L]: L[I] extends infer Literal extends L[number]
    ? TaggedUnionMember<L, Tag, Cases, Literal>
    : never;
};

type NoTagCollision<Tag extends string, Cases extends Record<string, StructFields>> = {
  readonly [K in keyof Cases]: Cases[K] & { readonly [P in Tag]?: never };
};

type ToTaggedUnionFn<L extends ReadonlyArray<PropertyKeyLiteral>> = <const Tag extends string>(
  tag: Tag
) => <const Cases extends TaggedUnionCases<L>>(
  cases: Cases & NoTagCollision<Tag, Cases> & { readonly [K in Exclude<keyof Cases, LiteralToKey<L[number]>>]: never }
) => S.toTaggedUnion<Tag, TaggedUnionMembers<L, Tag, Cases>>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert a literal value to its string key at runtime.
 *
 * @since 0.0.0
 * @category Utility
 */
export const matchLiteral = <L extends SchemaAST.LiteralValue>(literal: L): LiteralToKey<L> =>
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

const makeThunks = <L extends Literals>(literals: L): Thunks<L> =>
  pipe(
    literals,
    A.reduce({} as Thunks<L>, (acc, literal) => ({
      ...acc,
      [matchLiteral(literal)]: () => literal,
    }))
  );

const LiteralValueSchema = S.Union([S.String, S.BigInt, S.Boolean, S.Number]);

/**
 * Error thrown when `omitOptions` removes every literal and cannot return a non-empty result.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class LiteralNotInSetError extends TaggedErrorClass<LiteralNotInSetError>($I`LiteralNotInSetError`)(
  "LiteralNotInSetError",
  {
    literals: S.Array(LiteralValueSchema),
    input: S.Array(LiteralValueSchema),
  },
  $I.annote("LiteralNotInSetError", {
    title: "Not In Literals Error",
    description: "Error thrown when an input value is not found in the provided literals array.",
  })
) {}

/**
 * Error thrown when different literals encode to the same helper key.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class LiteralKitKeyCollisionError extends TaggedErrorClass<LiteralKitKeyCollisionError>(
  $I`LiteralKitKeyCollisionError`
)(
  "LiteralKitKeyCollisionError",
  {
    key: S.String,
    existing: LiteralValueSchema,
    incoming: LiteralValueSchema,
  },
  $I.annote("LiteralKitKeyCollisionError", {
    title: "LiteralKit Key Collision Error",
    description: "Different literals encoded to the same LiteralKit helper key.",
  })
) {}

type SeenLiteralKeys = HashMap.HashMap<string, SchemaAST.LiteralValue>;

const validateLiteralKeys = <L extends Literals>(literals: L): void => {
  pipe(
    literals,
    A.reduce(HashMap.empty<string, SchemaAST.LiteralValue>(), (seen, literal): SeenLiteralKeys => {
      const key = matchLiteral(literal);
      const existing = HashMap.get(seen, key);
      if (O.isSome(existing) && !Object.is(existing.value, literal)) {
        throw new LiteralKitKeyCollisionError({
          key,
          existing: existing.value,
          incoming: literal,
        });
      }
      return HashMap.set(seen, key, literal);
    })
  );
};

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
    const keySet: HashSet.HashSet<SchemaAST.LiteralValue> = HashSet.fromIterable(subset);
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

const attachHelperDescriptors = <T extends object>(schema: T, descriptors: PropertyDescriptorMap): T => {
  const originalAnnotate = Reflect.get(schema, "annotate");

  return Object.defineProperties(schema, {
    ...descriptors,
    ...(typeof originalAnnotate === "function"
      ? {
          annotate: {
            value(annotation: unknown) {
              return attachHelperDescriptors(originalAnnotate.call(schema, annotation), descriptors);
            },
            enumerable: false,
            writable: false,
            configurable: true,
          },
        }
      : {}),
  }) as T;
};

/**
 * Runtime literal kit that augments `Schema.Literals` with convenience helpers.
 *
 * Supports mixed literal types (`string | number | boolean | bigint`)
 * with keys mapped via {@link LiteralToKey}.
 *
 * @category DomainModel
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
  readonly thunk: Thunks<L>;
  readonly toTaggedUnion: L[number] extends PropertyKeyLiteral ? ToTaggedUnionFn<PropertyKeyLiterals<L>> : never;
};

/**
 * Builds a literal schema kit from a non-empty tuple of mixed literals.
 *
 * @example
 * ```ts-morph
 * import { LiteralKit } from "@beep/schema";
 * import * as S from "effect/Schema";
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
 * void result;
 *
 * const EventKind = LiteralKit(["created", "deleted"] as const);
 *
 * const Event = EventKind.toTaggedUnion("kind")({
 *   created: {
 *     value: S.Literal(1),
 *   },
 *   deleted: {
 *     value: S.Literal(2),
 *   },
 * });
 * void Event;
 * ```
 *
 * @category DomainModel
 * @since 0.0.0
 */
export function LiteralKit<const L extends Literals>(literals: L): LiteralKit<L> {
  validateLiteralKeys(literals);
  const base = S.Literals(literals);

  const is = makeGuards(literals);
  const { pickOptions, omitOptions } = makeOptionsFns(literals);
  const $match = buildMatch(literals);
  const Enum = makeEnum(literals);
  const thunk = makeThunks(literals);
  const toTaggedUnion =
    <const Tag extends string>(tag: Tag) =>
    <const Cases extends Record<string, StructFields>>(cases: Cases) => {
      const union = base.mapMembers((members) =>
        members.map((member) => {
          if (!P.isPropertyKey(member.literal)) {
            throw new globalThis.Error("LiteralKit.toTaggedUnion requires property-key literals.");
          }

          return S.Struct({
            [tag]: S.tag(member.literal),
            ...cases[matchLiteral(member.literal)],
          });
        })
      );

      return S.toTaggedUnion(tag)(
        union as unknown as S.Union<ReadonlyArray<S.Top & { readonly Type: { readonly [K in Tag]: PropertyKey } }>>
      );
    };

  const readonlyProperty = <T>(value: T): PropertyDescriptor => ({
    value,
    enumerable: true,
    writable: false,
    configurable: false,
  });

  return attachHelperDescriptors(base, {
    Options: readonlyProperty(literals),
    is: readonlyProperty(is),
    Enum: readonlyProperty(Enum),
    pickOptions: readonlyProperty(pickOptions),
    omitOptions: readonlyProperty(omitOptions),
    $match: readonlyProperty($match),
    thunk: readonlyProperty(thunk),
    toTaggedUnion: readonlyProperty(toTaggedUnion),
  }) as LiteralKit<L>;
}
