/**
 * Schema-backed literal toolkit helpers for mixed literal types.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { A } from "@beep/utils";
import * as HashSet from "effect/HashSet";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { deriveKeys, literalKey, literalKitBuilders, makeMatch, makeMatchOrElse } from "./internal/builders.ts";
import { LiteralKitEmptyComplementError, LiteralKitTaggedUnionLiteralError } from "./LiteralKit.errors.ts";
import type * as SchemaAST from "effect/SchemaAST";
import type * as Struct from "effect/Struct";
import type * as Unify from "effect/Unify";

type Literals = A.NonEmptyReadonlyArray<SchemaAST.LiteralValue>;

/**
 * The tuple shape the kit interface is generic over. It admits the empty
 * tuple so the inherited `pick` signature stays compatible with upstream;
 * the constructor and the subset helpers require a non-empty tuple.
 */
type LiteralTuple = ReadonlyArray<SchemaAST.LiteralValue>;

/**
 * Collapses an argument to `never` unless it is a non-empty tuple type.
 */
type NonEmptyTuple<T extends ReadonlyArray<unknown>> = T extends readonly [unknown, ...ReadonlyArray<unknown>]
  ? unknown
  : never;

/**
 * Maps a literal value to its string key representation used in `Enum`, `is`,
 * `match`, `matchOrElse`, and `toTaggedUnion` objects.
 *
 * **Details**
 *
 * Key format by type:
 * - boolean: `"true"` or `"false"`
 * - bigint: `"bigint${value}n"` (e.g., `1n` becomes `"bigint1n"`)
 * - number: `"number${value}"` (e.g., `200` becomes `"number200"`)
 * - string: as-is (e.g., `"pending"` stays `"pending"`)
 *
 * **Example** (Number literal key mapping)
 *
 * ```ts
 * import type { LiteralToKey } from "@beep/schema/LiteralKit"
 *
 * const key = "number200" satisfies LiteralToKey<200>
 * console.log(key)
 * ```
 *
 * @category models
 * @since 0.0.0
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

type EnumType<L extends LiteralTuple> = {
  readonly [K in L[number] as LiteralToKey<K>]: K;
};

type IsGuards<L extends LiteralTuple> = {
  readonly [K in L[number] as LiteralToKey<K>]: (i: unknown) => i is K;
};

type MatchCases<L extends LiteralTuple> = {
  readonly [K in L[number] as LiteralToKey<K>]: (value: K) => unknown;
};

type PartialMatchCases<L extends LiteralTuple> = {
  readonly [K in L[number] as LiteralToKey<K>]?: (value: K) => unknown;
};

/**
 * Valid keys for a cases object derived from the literal set.
 */
type MatchKeys<L extends LiteralTuple> = LiteralToKey<L[number]>;

/**
 * Rejects keys that name no member of the kit.
 */
type NoExcessCases<L extends LiteralTuple, Cases> = {
  readonly [K in Exclude<keyof Cases, MatchKeys<L>>]: never;
};

/**
 * Extract the union of return types from a cases object.
 *
 * `(...args: never) => infer R` accepts every handler arity under strict
 * function types; constraining the parameters to `ReadonlyArray<unknown>`
 * rejected unary handlers and collapsed their contribution to `never`.
 */
type MatchReturn<Cases> = {
  [K in keyof Cases]: Cases[K] extends (...args: never) => infer R ? R : never;
}[keyof Cases];

/**
 * The members a partial cases object handles, read back from its keys.
 */
type HandledLiteral<K, Cases> = K extends SchemaAST.LiteralValue
  ? LiteralToKey<K> extends keyof Cases
    ? K
    : never
  : never;

type HandledLiterals<L extends LiteralTuple, Cases> = HandledLiteral<L[number], Cases>;

type Unhandled<L extends LiteralTuple, Cases> = Exclude<L[number], HandledLiterals<L, Cases>>;

type MatchFn<L extends LiteralTuple> = {
  <const Cases extends MatchCases<L>>(
    cases: Cases & NoExcessCases<L, Cases>
  ): (value: L[number]) => Unify.Unify<MatchReturn<Cases>>;
  <const Cases extends MatchCases<L>>(
    value: L[number],
    cases: Cases & NoExcessCases<L, Cases>
  ): Unify.Unify<MatchReturn<Cases>>;
};

type MatchOrElseFn<L extends LiteralTuple> = {
  <const Cases extends PartialMatchCases<L>, B>(
    cases: Cases & NoExcessCases<L, Cases>,
    orElse: (value: Unhandled<L, Cases>) => B
  ): (value: L[number]) => Unify.Unify<MatchReturn<Cases> | B>;
  <const Cases extends PartialMatchCases<L>, B>(
    value: L[number],
    cases: Cases & NoExcessCases<L, Cases>,
    orElse: (value: Unhandled<L, Cases>) => B
  ): Unify.Unify<MatchReturn<Cases> | B>;
};

type NonEmptyOf<U> = readonly [U, ...Array<U>];

type Complement<L extends LiteralTuple, Dropped extends ReadonlyArray<L[number]>> = Exclude<L[number], Dropped[number]>;

/**
 * Collapses the `omit` argument to `never` when it would drop every member, so
 * the call itself fails to compile.
 */
type NonEmptyComplement<L extends LiteralTuple, Dropped extends ReadonlyArray<L[number]>> = [
  Complement<L, Dropped>,
] extends [never]
  ? never
  : unknown;

type OmitFn<L extends LiteralTuple> = <const Dropped extends ReadonlyArray<L[number]>>(
  literals: Dropped & NonEmptyTuple<Dropped> & NonEmptyComplement<L, Dropped>
) => LiteralKit<NonEmptyOf<Complement<L, Dropped>>>;

type PropertyKeyLiteral = Extract<SchemaAST.LiteralValue, PropertyKey>;
type PropertyKeyLiteralArray = ReadonlyArray<PropertyKeyLiteral>;

type PropertyKeyLiterals<L extends LiteralTuple> = {
  readonly [I in keyof L]: Extract<L[I], PropertyKeyLiteral>;
};

type StructFields = Readonly<Record<string, S.Top>>;

type TaggedUnionCases<L extends PropertyKeyLiteralArray> = {
  readonly [K in L[number] as LiteralToKey<K>]: StructFields;
};

type TaggedUnionCaseFields<
  L extends PropertyKeyLiteralArray,
  Tag extends string,
  Cases extends TaggedUnionCases<L> = TaggedUnionCases<L>,
  Literal extends L[number] = L[number],
> = Struct.Simplify<{ readonly [K in Tag]: S.tag<Literal> } & Cases[LiteralToKey<Literal> & keyof Cases]>;

type TaggedUnionMember<
  L extends PropertyKeyLiteralArray,
  Tag extends string,
  Cases extends TaggedUnionCases<L> = TaggedUnionCases<L>,
  Literal extends L[number] = L[number],
> = Literal extends L[number]
  ? S.Struct<TaggedUnionCaseFields<L, Tag, Cases, Literal>> & {
      readonly Type: Struct.Simplify<{ readonly [K in Tag]: Literal }>;
    }
  : never;

type TaggedUnionMembers<
  L extends PropertyKeyLiteralArray,
  Tag extends string,
  Cases extends TaggedUnionCases<L> = TaggedUnionCases<L>,
> = {
  readonly [I in keyof L]: L[I] extends infer Literal extends L[number]
    ? TaggedUnionMember<L, Tag, Cases, Literal>
    : never;
};

type NoTagCollision<Tag extends string, Cases extends Record<string, StructFields>> = {
  readonly [K in keyof Cases]: Cases[K] & { readonly [P in Tag]?: never };
};

type ToTaggedUnionFn<L extends PropertyKeyLiteralArray> = <const Tag extends string>(
  tag: Tag
) => <const Cases extends TaggedUnionCases<L>>(
  cases: Cases & NoTagCollision<Tag, Cases> & NoExcessCases<L, Cases>
) => S.toTaggedUnion<Tag, TaggedUnionMembers<L, Tag, Cases>>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Converts a literal value to its string key at runtime using the
 * {@link LiteralToKey} mapping rules.
 *
 * **Example** (Runtime literal key conversion)
 *
 * ```ts import.meta.vitest name="Runtime literal key conversion"
 * import { matchLiteral } from "@beep/schema/LiteralKit"
 *
 * const keys = [matchLiteral("pending"), matchLiteral(200), matchLiteral(true), matchLiteral(BigInt(1))]
 * keys // => ["pending", "number200", "true", "bigint1n"]
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const matchLiteral = <L extends SchemaAST.LiteralValue>(literal: L): LiteralToKey<L> =>
  literalKey(literal) as LiteralToKey<L>;

/**
 * The helpers {@link LiteralKit} attaches on top of upstream `Schema.Literals`.
 * The constructor builds its statics against this type, so a helper that
 * drifts from the interface is a compile error at the definition site.
 */
type LiteralKitHelpers<L extends LiteralTuple> = Pick<
  LiteralKit<L>,
  "Enum" | "is" | "match" | "matchOrElse" | "pick" | "omit" | "toTaggedUnion"
>;

/**
 * Runtime literal kit returned by {@link LiteralKit}: `Schema.Literals` plus
 * the keyed value helpers `Enum`, `is`, `match`, `matchOrElse`, the
 * kit-returning subsets `pick` and `omit`, and `toTaggedUnion`.
 *
 * **Details**
 *
 * Supports mixed literal types (`string | number | boolean | bigint`) with
 * keys mapped via {@link LiteralToKey}. The literal tuple (`literals`) and the
 * schema members come from upstream `Schema.Literals`. `Rebuild` is the kit
 * itself, so `annotate`, `annotateKey`, and `check` keep the helpers.
 *
 * **Gotchas**
 *
 * `omit` returns a kit whose tuple type is `readonly [C, ...Array<C>]` over the
 * complement union, because a positional tuple filter would cost one
 * instantiation per member on large kits. Every helper is keyed by member, so
 * nothing on the kit depends on tuple order. Upstream `transform` is
 * positional, so on an omit-derived kit its target tuple is typed as a head
 * plus an unordered array; the runtime order is preserved, but the checker no
 * longer pins each target to its source position.
 *
 * **Example** (Runtime kit type usage)
 *
 * ```ts
 * import { LiteralKit, type LiteralKit as LiteralKitType } from "@beep/schema/LiteralKit"
 *
 * const Status = LiteralKit(["ready", "blocked"])
 * console.log(Status.Enum.ready satisfies LiteralKitType<readonly ["ready", "blocked"]>["Enum"]["ready"])
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export interface LiteralKit<L extends LiteralTuple> extends S.Literals<L> {
  readonly Enum: EnumType<L>;
  readonly is: IsGuards<L>;
  readonly match: MatchFn<L>;
  readonly matchOrElse: MatchOrElseFn<L>;
  readonly omit: OmitFn<L>;
  pick<const Picked extends ReadonlyArray<L[number]>>(literals: Picked & NonEmptyTuple<Picked>): LiteralKit<Picked>;
  readonly Rebuild: LiteralKit<L>;
  readonly toTaggedUnion: L[number] extends PropertyKeyLiteral ? ToTaggedUnionFn<PropertyKeyLiterals<L>> : never;
}

/**
 * Builds a literal schema kit from a non-empty tuple of mixed literals.
 *
 * **Details**
 *
 * The kit is `Schema.Literals(literals)` with keyed helpers attached:
 *
 * - `Kit.Enum.key` is the member itself; `Kit.is.key` is its type guard.
 * - `Kit.match(cases)` and `Kit.match(value, cases)` are exhaustive: every
 *   member needs a case and unknown keys are rejected.
 * - `Kit.matchOrElse(cases, orElse)` handles a subset and routes the remainder
 *   to `orElse`, which receives exactly the members without a case.
 * - `Kit.pick([...])` and `Kit.omit([...])` return kits, so a subset keeps
 *   `Enum`, `is` and `match`. `omit` is a computed complement: a member added
 *   to the parent appears in every `omit` child without an edit.
 * - `Kit.literals` is the tuple; `HashSet.fromIterable(Kit.literals)` is a
 *   set; `Function.constant(Kit.Enum.key)` is a thunk.
 *
 * The helpers survive `annotate`, `annotateKey`, and `check`. Distinct literals
 * that derive the same helper key (`1` next to `"number1"`) throw
 * {@link LiteralKitKeyCollisionError}.
 *
 * **Example** (Build mixed literal kit)
 *
 * ```ts import.meta.vitest name="Build mixed literal kit"
 * import { LiteralKit } from "@beep/schema/LiteralKit"
 * import * as S from "effect/Schema"
 *
 * const Status = LiteralKit([1, 20n, true, false, "hello"])
 *
 * Status.Enum.number1 // => 1
 * Status.Enum.bigint20n // => 20n
 * Status.is.hello("hello") // => true
 * Status.is.number1(42) // => false
 * Status.literals // => [1, 20n, true, false, "hello"]
 *
 * Status.match(Status.Enum.number1, {
 *   number1: () => "one",
 *   bigint20n: () => "twenty",
 *   true: () => "yes",
 *   false: () => "no",
 *   hello: () => "greeting"
 * }) // => "one"
 *
 * const EventKind = LiteralKit(["created", "deleted"])
 * const Event = EventKind.toTaggedUnion("kind")({
 *   created: { id: S.String },
 *   deleted: { id: S.String }
 * })
 * S.is(Event)({ kind: "created", id: "evt_1" }) // => true
 * ```
 *
 * **Example** (Derive subsets that stay kits)
 *
 * ```ts import.meta.vitest name="Derive subsets that stay kits"
 * import { LiteralKit } from "@beep/schema/LiteralKit"
 *
 * const Tier = LiteralKit(["free", "pro", "team", "enterprise"])
 * const Paid = Tier.omit(["free"])
 * const SelfServe = Tier.pick(["free", "pro"])
 *
 * Paid.literals // => ["pro", "team", "enterprise"]
 * Paid.Enum.team // => "team"
 * SelfServe.is.pro("pro") // => true
 * Tier.matchOrElse("team", { free: () => 0 }, (paid) => paid.length) // => 4
 * ```
 *
 * **Example** (Helpers survive derivations)
 *
 * ```ts import.meta.vitest name="Helpers survive derivations"
 * import { LiteralKit } from "@beep/schema/LiteralKit"
 * import * as S from "effect/Schema"
 *
 * const Tier = LiteralKit(["free", "pro", "team"])
 *   .check(S.makeFilter((tier) => tier !== "team" || "team is invite-only"))
 *   .annotate({ description: "Billing tier" })
 *
 * Tier.Enum.pro // => "pro"
 * Tier.is.free("free") // => true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export function LiteralKit<const L extends Literals>(literals: L): LiteralKit<L> {
  const keys = deriveKeys(literals);
  literalKitBuilders.assertUniqueHelperKeys(literals, keys);
  const base = S.Literals(literals);

  const toTaggedUnion =
    <const Tag extends string>(tag: Tag) =>
    <const Cases extends Record<string, StructFields>>(cases: Cases) => {
      const union = base.mapMembers((members) => {
        const literalMembers: ReadonlyArray<S.Literal<L[number]>> = members;

        return A.map(literalMembers, (member) => {
          if (!P.isPropertyKey(member.literal)) {
            throw LiteralKitTaggedUnionLiteralError.make({
              literal: member.literal,
            });
          }

          return S.Struct({
            [tag]: S.tag(member.literal),
            ...cases[literalKey(member.literal)],
          });
        });
      });

      return S.toTaggedUnion(tag)(
        union as unknown as S.Union<ReadonlyArray<S.Top & { readonly Type: { readonly [K in Tag]: PropertyKey } }>>
      );
    };

  // The subset helpers construct a fresh kit over the kept literals; their
  // precise types live on the interface and the runtime shape is the loose one.
  const pick = (picked: Literals): LiteralKit<Literals> => LiteralKit<Literals>(picked);
  const omit = (dropped: Literals): LiteralKit<Literals> => {
    const droppedSet = HashSet.fromIterable<SchemaAST.LiteralValue>(dropped);
    const kept = A.filter(literals, (literal: SchemaAST.LiteralValue) => !HashSet.has(droppedSet, literal));
    if (!A.isReadonlyArrayNonEmpty(kept)) {
      throw LiteralKitEmptyComplementError.make({ literals, dropped });
    }
    return LiteralKit<Literals>(kept);
  };

  const helpers = {
    Enum: literalKitBuilders.enum(literals, keys) as EnumType<L>,
    is: literalKitBuilders.guards(literals, keys) as IsGuards<L>,
    match: makeMatch(literals) as MatchFn<L>,
    matchOrElse: makeMatchOrElse(literals) as MatchOrElseFn<L>,
    pick: pick as unknown as LiteralKit<L>["pick"],
    omit: omit as unknown as OmitFn<L>,
    toTaggedUnion: toTaggedUnion as unknown as LiteralKit<L>["toTaggedUnion"],
  } satisfies LiteralKitHelpers<L>;

  return literalKitBuilders.attachStatics(base, () => helpers) as LiteralKit<L>;
}
