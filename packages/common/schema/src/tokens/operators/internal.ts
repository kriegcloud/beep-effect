import { BoolWithDefault, LiteralWithDefault, UUIDWithDefaults } from "@beep/schema/custom";
import type { StructTypes, UnsafeTypes } from "@beep/types";
import * as Data from "effect/Data";
import * as S from "effect/Schema";
import { DiscriminatedStruct } from "../../generics";

function mergeStructFields<
  A extends StructTypes.StructFieldsWithStringKeys,
  B extends StructTypes.StructFieldsWithStringKeys,
>(a: A, b: B): A & B {
  // runtime spread is fine; type ties to A & B
  return { ...(a as object), ...(b as object) } as A & B;
}

// A typed description of operands an operator expects
type ParamSpec = Record<string, S.Schema<any, any, any>>; // e.g., { value: S.String, epsilon: S.Number }

interface OperatorSpec<
  Discriminator extends string,
  Literal extends string,
  Params extends ParamSpec,
  E extends StructTypes.StructFieldsWithStringKeys = {},
> {
  discriminatorKey: Discriminator;
  literal: Literal;
  params: Params;
  metaFields: E; // <— required, not optional
  category?: "comparator" | "string" | "number" | "set" | "time" | "type" | "size";
  aliases?: readonly string[];
}

export class RichOperatorFactory<
  D extends string,
  L extends string,
  P extends ParamSpec,
  E extends StructTypes.StructFieldsWithStringKeys = {},
> extends Data.TaggedClass("RichOperatorFactory")<OperatorSpec<D, L, P, E>> {
  create<const X extends StructTypes.StructFieldsWithStringKeys>(extra: X) {
    // same DiscriminatedStruct behavior, but include params + meta
    return DiscriminatedStruct(this.$.discriminatorKey)(this.$.literal, {
      ...this.$.params,
      ...(this.$.metaFields ?? ({} as E)),
      ...extra,
    });
  }

  /** Provide/override params with schemas while keeping metadata */
  withParams<const Q extends ParamSpec>(params: Q) {
    return new RichOperatorFactory<D, L, Q, E>({ ...this.$, params });
  }

  withMeta<const M extends StructTypes.StructFieldsWithStringKeys>(extra: M) {
    const merged = mergeStructFields(this.$.metaFields ?? ({} as E), extra);
    return new RichOperatorFactory<D, L, P, E & M>({ ...this.$, metaFields: merged });
  }

  /** Attach aliases for ergonomics */
  alias<const A extends readonly string[]>(aliases: A) {
    return new RichOperatorFactory<D, L, P, E>({ ...this.$, aliases });
  }

  /** Auto-generate a negation variant (literal + symbol + human) */
  negate<N extends string>(opts: { literal: N; symbol?: string; human?: string }) {
    return new RichOperatorFactory<D, N, P, E>({
      ...this.$,
      literal: opts.literal,
      metaFields: this.$.metaFields,
      // optionally flip a boolean meta field if present (e.g., { positive: false })
    });
  }

  /** Freeze metadata for registries/serialization */
  toSpec(): OperatorSpec<D, L, P, E> {
    return this.$;
  }

  constructor(readonly $: OperatorSpec<D, L, P, E>) {
    super($);
  }
}

class RichOperatorFactoryBuilder<const D extends string> {
  constructor(readonly discriminatorKey: D) {}
  make<
    const L extends string,
    const P extends ParamSpec,
    const MetaFields extends StructTypes.StructFieldsWithStringKeys,
  >(literal: L, params: P, meta?: MetaFields) {
    return new RichOperatorFactory<D, L, P>({
      discriminatorKey: this.discriminatorKey,
      literal,
      params,
      metaFields: meta ?? ({} as MetaFields),
    });
  }
}
const richOp = new RichOperatorFactoryBuilder("operator");

type RuleNode =
  | { _tag: "Predicate"; op: string; params: any } // one operator instance
  | { _tag: "Not"; inner: RuleNode }
  | { _tag: "And"; nodes: RuleNode[] }
  | { _tag: "Or"; nodes: RuleNode[] };

export const And = (...nodes: RuleNode[]): RuleNode => ({ _tag: "And", nodes });
export const Or = (...nodes: RuleNode[]): RuleNode => ({ _tag: "Or", nodes });
export const Not = (n: RuleNode): RuleNode => ({ _tag: "Not", inner: n });

// type EvalFn<P> = (operands: InferSchema<P>, ctx: { tz?: string }) => (subject: unknown) => boolean;
//
// // attach optionally to factory
// function withEvaluator<
//   D extends string, L extends string, P extends ParamSpec, E extends StructTypes.StructFieldsWithStringKeys
// >(f: RichOperatorFactory<D, L, P, E>, evalFn: EvalFn<P>) {
//   return Object.assign(f, { eval: evalFn as EvalFn<P> });
// }

export function predicate(op: string, params: any): RuleNode {
  return { _tag: "Predicate", op, params };
}

const complements = new Map<string, string>([
  ["eq", "ne"],
  ["gt", "lte"],
  ["gte", "lt"],
  ["lt", "gte"],
  ["lte", "gt"],
  ["between", "notBetween"],
  ["contains", "notContains"],
  ["matches", "notMatches"],
]);

export function autoNegate(factory: RichOperatorFactory<any, any, any, any>) {
  const neg = complements.get(factory.toSpec().literal);
  return neg ? factory.negate({ literal: neg }) : undefined;
}
const Between = richOp
  .make("between", { value: S.Number, min: S.Number, max: S.Number }, { inclusive: BoolWithDefault(false) })
  .alias(["range", "betweenInclusive?"])
  .withMeta({ inclusive: BoolWithDefault(false) });
function forDomain<F extends RichOperatorFactory<any, any, any, any>, P extends ParamSpec>(f: F, params: P) {
  return f.withParams(params);
}
// examples

export const NumberBetween = forDomain(Between, { value: S.Number, min: S.Number, max: S.Number });
// function refine<P extends ParamSpec>(schema: S.Struct<any>, guard: (i: any) => boolean, message: string) {
//   return schema.pipe(S.filter(guard, { message: () => message }));
// }
//
// // example for Between
// const BetweenParams = S.Struct({ value: S.Number, min: S.Number, max: S.Number, inclusive: S.Boolean });
// const BetweenRefined = refine(BetweenParams, ({ min, max }) => min <= max, "min must be ≤ max");

type MakeOperatorFn<
  Discriminator extends string,
  LiteralValue extends string,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = <const ExtraFields extends StructTypes.StructFieldsWithStringKeys>(
  extraFields: ExtraFields
) => LiteralValue extends UnsafeTypes.UnsafeAny
  ? S.Struct<
      {
        readonly [K in Discriminator]: S.PropertySignature<
          ":",
          Exclude<LiteralValue, undefined>,
          never,
          "?:",
          LiteralValue | undefined,
          true,
          never
        >;
      } & Fields &
        ExtraFields
    >
  : never;

type OperatorFactoryOptions<
  Discriminator extends string,
  Literal extends string,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = {
  readonly discriminatorKey: Discriminator;
  readonly value: Literal;
  readonly fields: Fields;
};

export class OperatorFactory<
  Discriminator extends string,
  LiteralValue extends string,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> extends Data.TaggedClass("OperatorFactory")<OperatorFactoryOptions<Discriminator, LiteralValue, any>> {
  readonly _tag = "OperatorFactory";
  readonly create: MakeOperatorFn<Discriminator, LiteralValue, Fields>;

  constructor(discriminatorKey: Discriminator, value: LiteralValue, fields: Fields) {
    const create = <const ExtraFields extends StructTypes.StructFieldsWithStringKeys>(extraFields: ExtraFields) =>
      DiscriminatedStruct<Discriminator, LiteralValue, Fields & ExtraFields>(discriminatorKey)(value, {
        ...fields,
        ...extraFields,
      });

    super({
      discriminatorKey,
      value,
      fields,
    });
    this.create = create;
  }
}

export class OperatorFactoryBuilder<
  const Discriminator extends string,
  const Fields extends StructTypes.StructFieldsWithStringKeys,
> extends Data.TaggedClass("OperatorFactoryBuilder")<{
  readonly discriminatorKey: Discriminator;
  readonly fields: Fields;
}> {
  readonly make: <const LiteralValue extends string, const Fields extends StructTypes.StructFieldsWithStringKeys>(
    literal: LiteralValue,
    fields: Fields
  ) => OperatorFactory<Discriminator, LiteralValue, Fields>;

  constructor(discriminatorKey: Discriminator, fields: Fields) {
    super({ discriminatorKey, fields });
    this.make = <const LiteralValue extends string, const Fields extends StructTypes.StructFieldsWithStringKeys>(
      literal: LiteralValue,
      fields: Fields
    ) =>
      new OperatorFactory(discriminatorKey, literal, {
        ...fields,
        ...this.fields,
      });
  }
}

const opMaker = new OperatorFactoryBuilder("operator", {
  id: UUIDWithDefaults("OperatorId"),
});

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                         Operators Catalog                        ║
 * ║       (grouped, documented, and a lil’ bit fabulous ✨)           ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Conventions
 * - Each operator describes only metadata (symbol/human + simple flags).
 * - Type-specific payloads belong in *specializations* via `.create({...})`.
 * - Use `inclusive`, `caseInsensitive`, etc. as knobs where appropriate.
 */

export namespace Operators {
  /** Utility to stamp operator metadata and optional extra fields. */
  export const fields = <
    const $Symbol extends string,
    const Human extends string,
    const ExtraFields extends StructTypes.StructFieldsWithStringKeys,
  >(
    { symbol, human }: { readonly symbol: $Symbol; readonly human: Human },
    extraFields?: ExtraFields
  ) =>
    ({
      symbol: LiteralWithDefault(symbol),
      human: LiteralWithDefault(human),
      ...(extraFields ?? ({} as ExtraFields)),
    }) as const;

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  🧮 Basic Comparators                                        ║
  // ║  eq / ne / gt / gte / lt / lte / between                    ║
  // ╚══════════════════════════════════════════════════════════════╝

  /** @category Comparators @symbol === @human is equal to @since 0.1.0 */
  export const Eq = opMaker.make("eq", fields({ symbol: "===", human: "is equal to" }));

  /** @category Comparators @symbol !== @human is not equal to @since 0.1.0 */
  export const NotEq = opMaker.make("ne", fields({ symbol: "!==", human: "is not equal to" }));

  /** @category Comparators @symbol > @human is greater than @since 0.1.0 */
  export const Gt = opMaker.make("gt", fields({ symbol: ">", human: "is greater than" }));

  /** @category Comparators @symbol >= @human is greater than or equal to @since 0.1.0 */
  export const Gte = opMaker.make("gte", fields({ symbol: ">=", human: "is greater than or equal to" }));

  /** @category Comparators @symbol < @human is less than @since 0.1.0 */
  export const Lt = opMaker.make("lt", fields({ symbol: "<", human: "is less than" }));

  /** @category Comparators @symbol <= @human is less than or equal to @since 0.1.0 */
  export const Lte = opMaker.make("lte", fields({ symbol: "<=", human: "is less than or equal to" }));

  /**
   * @category Comparators
   * @symbol x ∈ [a, b]
   * @human is between
   * @since 0.1.0
   * @remarks Toggle `inclusive` to choose [a,b] vs (a,b).
   */
  export const Between = opMaker.make(
    "between",
    fields({ symbol: `x ∈ [a, b]`, human: "is between" }, { inclusive: BoolWithDefault(false) })
  );

  /** @category Comparators @symbol x ∉ [a, b] @human is not between @since 0.1.0 */
  export const NotBetween = opMaker.make(
    "notBetween",
    fields({ symbol: `x ∉ [a, b]`, human: "is not between" }, { inclusive: BoolWithDefault(false) })
  );

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  🔤 String / Pattern Operators                               ║
  // ║  startsWith / endsWith / contains / notContains / matches…  ║
  // ╚══════════════════════════════════════════════════════════════╝

  /** @category String @symbol prefix⋯ @human starts with @since 0.1.0 */
  export const StartsWith = opMaker.make(
    "startsWith",
    fields({ symbol: "prefix⋯", human: "starts with" }, { caseInsensitive: BoolWithDefault(false) })
  );

  /** @category String @symbol ¬prefix⋯ @human does not start with @since 0.1.0 */
  export const NotStartsWith = opMaker.make(
    "notStartsWith",
    fields({ symbol: "¬prefix⋯", human: "does not start with" }, { caseInsensitive: BoolWithDefault(false) })
  );

  /** @category String @symbol ⋯suffix @human ends with @since 0.1.0 */
  export const EndsWith = opMaker.make(
    "endsWith",
    fields({ symbol: "⋯suffix", human: "ends with" }, { caseInsensitive: BoolWithDefault(false) })
  );

  /** @category String @symbol ⋯¬suffix @human does not end with @since 0.1.0 */
  export const NotEndsWith = opMaker.make(
    "notEndsWith",
    fields({ symbol: "⋯¬suffix", human: "does not end with" }, { caseInsensitive: BoolWithDefault(false) })
  );

  /** @category String @symbol ∋ @human contains @since 0.1.0 */
  export const Contains = opMaker.make(
    "contains",
    fields({ symbol: "∋", human: "contains" }, { caseInsensitive: BoolWithDefault(false) })
  );

  /** @category String @symbol ∌ @human does not contain @since 0.1.0 */
  export const NotContains = opMaker.make(
    "notContains",
    fields({ symbol: "∌", human: "does not contain" }, { caseInsensitive: BoolWithDefault(false) })
  );

  /** @category String @symbol ~ @human matches pattern @since 0.1.0 */
  export const Matches = opMaker.make(
    "matches",
    fields({ symbol: "~", human: "matches pattern" }, { caseInsensitive: BoolWithDefault(false) })
  );

  /** @category String @symbol ¬~ @human does not match pattern @since 0.1.0 */
  export const NotMatches = opMaker.make(
    "notMatches",
    fields({ symbol: "¬~", human: "does not match pattern" }, { caseInsensitive: BoolWithDefault(false) })
  );

  /** @category String @symbol ≡ (ci) @human equals (case-insensitive) @since 0.1.0 */
  export const EqualsIgnoreCase = opMaker.make(
    "equalsIgnoreCase",
    fields({ symbol: "≡ (ci)", human: "equals (case-insensitive)" }, { caseInsensitive: BoolWithDefault(true) })
  );

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  🧪 Type & Truthiness Predicates                             ║
  // ║  isString/Number/Array/Object/Boolean/etc. (+ not-variants) ║
  // ╚══════════════════════════════════════════════════════════════╝

  /** @category Type @symbol ≡ true @human is true @since 0.1.0 */
  export const IsTrue = opMaker.make("isTrue", fields({ symbol: "≡ true", human: "is true" }));

  /** @category Type @symbol ≡ false @human is false @since 0.1.0 */
  export const IsFalse = opMaker.make("isFalse", fields({ symbol: "≡ false", human: "is false" }));

  /** @category Type @symbol ∈ String @human is a string @since 0.1.0 */
  export const IsString = opMaker.make("isString", fields({ symbol: "∈ String", human: "is a string" }));
  /** @category Type @symbol ∉ String @human is not a string @since 0.1.0 */
  export const IsNotString = opMaker.make("isNotString", fields({ symbol: "∉ String", human: "is not a string" }));

  /** @category Type @symbol ∈ Number @human is a number @since 0.1.0 */
  export const IsNumber = opMaker.make("isNumber", fields({ symbol: "∈ Number", human: "is a number" }));
  /** @category Type @symbol ∉ Number @human is not a number @since 0.1.0 */
  export const IsNotNumber = opMaker.make("isNotNumber", fields({ symbol: "∉ Number", human: "is not a number" }));

  /** @category Type @symbol truthy @human is truthy @since 0.1.0 */
  export const IsTruthy = opMaker.make("isTruthy", fields({ symbol: "truthy", human: "is truthy" }));
  /** @category Type @symbol ¬truthy @human is not truthy @since 0.1.0 */
  export const IsNotTruthy = opMaker.make("isNotTruthy", fields({ symbol: "¬truthy", human: "is not truthy" }));

  /** @category Type @symbol falsy @human is falsy @since 0.1.0 */
  export const IsFalsy = opMaker.make("isFalsy", fields({ symbol: "falsy", human: "is falsy" }));
  /** @category Type @symbol ¬falsy @human is not falsy @since 0.1.0 */
  export const IsNotFalsy = opMaker.make("isNotFalsy", fields({ symbol: "¬falsy", human: "is not falsy" }));

  /** @category Type @symbol ≡ null @human is null @since 0.1.0 */
  export const IsNull = opMaker.make("isNull", fields({ symbol: "≡ null", human: "is null" }));
  /** @category Type @symbol ≠ null @human is not null @since 0.1.0 */
  export const IsNotNull = opMaker.make("isNotNull", fields({ symbol: "≠ null", human: "is not null" }));

  /** @category Type @symbol ≡ undefined @human is undefined @since 0.1.0 */
  export const IsUndefined = opMaker.make("isUndefined", fields({ symbol: "≡ undefined", human: "is undefined" }));
  /** @category Type @symbol ≠ undefined @human is not undefined @since 0.1.0 */
  export const IsNotUndefined = opMaker.make(
    "isNotUndefined",
    fields({ symbol: "≠ undefined", human: "is not undefined" })
  );

  /** @category Type @symbol ∈ Boolean @human is a boolean @since 0.1.0 */
  export const IsBoolean = opMaker.make("isBoolean", fields({ symbol: "∈ Boolean", human: "is a boolean" }));
  /** @category Type @symbol ∉ Boolean @human is not a boolean @since 0.1.0 */
  export const IsNotBoolean = opMaker.make("isNotBoolean", fields({ symbol: "∉ Boolean", human: "is not a boolean" }));

  /** @category Type @symbol ∈ Array @human is an array @since 0.1.0 */
  export const IsArray = opMaker.make("isArray", fields({ symbol: "∈ Array", human: "is an array" }));
  /** @category Type @symbol ∉ Array @human is not an array @since 0.1.0 */
  export const IsNotArray = opMaker.make("isNotArray", fields({ symbol: "∉ Array", human: "is not an array" }));

  /** @category Type @symbol ∈ Object @human is an object @since 0.1.0 */
  export const IsObject = opMaker.make("isObject", fields({ symbol: "∈ Object", human: "is an object" }));
  /** @category Type @symbol ∉ Object @human is not an object @since 0.1.0 */
  export const IsNotObject = opMaker.make("isNotObject", fields({ symbol: "∉ Object", human: "is not an object" }));

  /** @category Type @symbol ≡ null | undefined @human is nullish @since 0.1.0 */
  export const IsNullish = opMaker.make("isNullish", fields({ symbol: "≡ null | undefined", human: "is nullish" }));
  /** @category Type @symbol ≠ null & ≠ undefined @human is not nullish @since 0.1.0 */
  export const IsNotNullish = opMaker.make(
    "isNotNullish",
    fields({ symbol: "≠ null & ≠ undefined", human: "is not nullish" })
  );

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  🔢 Number Predicates                                        ║
  // ╚══════════════════════════════════════════════════════════════╝

  /** @category Number @symbol ℤ @human is an integer @since 0.1.0 */
  export const IsInteger = opMaker.make("isInteger", fields({ symbol: "ℤ", human: "is an integer" }));
  /** @category Number @symbol ¬ℤ @human is not an integer @since 0.1.0 */
  export const IsNotInteger = opMaker.make("isNotInteger", fields({ symbol: "¬ℤ", human: "is not an integer" }));

  /** @category Number @symbol finite @human is finite @since 0.1.0 */
  export const IsFinite = opMaker.make("isFinite", fields({ symbol: "finite", human: "is finite" }));
  /** @category Number @symbol ¬finite @human is not finite @since 0.1.0 */
  export const IsNotFinite = opMaker.make("isNotFinite", fields({ symbol: "¬finite", human: "is not finite" }));

  /** @category Number @symbol NaN @human is NaN @since 0.1.0 */
  export const IsNaN = opMaker.make("isNaN", fields({ symbol: "NaN", human: "is NaN" }));
  /** @category Number @symbol ¬NaN @human is not NaN @since 0.1.0 */
  export const IsNotNaN = opMaker.make("isNotNaN", fields({ symbol: "¬NaN", human: "is not NaN" }));

  /** @category Number @symbol ≡ 0 (mod 2) @human is even @since 0.1.0 */
  export const IsEven = opMaker.make("isEven", fields({ symbol: "≡ 0 (mod 2)", human: "is even" }));
  /** @category Number @symbol ≡ 1 (mod 2) @human is odd @since 0.1.0 */
  export const IsOdd = opMaker.make("isOdd", fields({ symbol: "≡ 1 (mod 2)", human: "is odd" }));

  /** @category Number @symbol > 0 @human is positive @since 0.1.0 */
  export const IsPositive = opMaker.make("isPositive", fields({ symbol: "> 0", human: "is positive" }));
  /** @category Number @symbol ≤ 0 @human is non-positive @since 0.1.0 */
  export const IsNonPositive = opMaker.make("isNonPositive", fields({ symbol: "≤ 0", human: "is non-positive" }));
  /** @category Number @symbol < 0 @human is negative @since 0.1.0 */
  export const IsNegative = opMaker.make("isNegative", fields({ symbol: "< 0", human: "is negative" }));
  /** @category Number @symbol ≥ 0 @human is non-negative @since 0.1.0 */
  export const IsNonNegative = opMaker.make("isNonNegative", fields({ symbol: "≥ 0", human: "is non-negative" }));

  /**
   * @category Number
   * @symbol ≈
   * @human is approximately equal to
   * @since 0.1.0
   * @remarks Use `.create({ epsilon: S.Number })` in a specialization; set `epsilonIsPercent` to interpret tolerance as %.
   */
  export const ApproxEq = opMaker.make(
    "approxEq",
    fields({ symbol: "≈", human: "is approximately equal to" }, { epsilonIsPercent: BoolWithDefault(false) })
  );

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  📏 Size / Length Predicates                                 ║
  // ╚══════════════════════════════════════════════════════════════╝

  /** @category Size @symbol |x| = n @human length equals @since 0.1.0 */
  export const LengthEq = opMaker.make("lengthEq", fields({ symbol: "|x| = n", human: "length equals" }));
  /** @category Size @symbol |x| > n @human length greater than @since 0.1.0 */
  export const LengthGt = opMaker.make("lengthGt", fields({ symbol: "|x| > n", human: "length greater than" }));
  /** @category Size @symbol |x| ≥ n @human length greater than or equal to @since 0.1.0 */
  export const LengthGte = opMaker.make(
    "lengthGte",
    fields({
      symbol: "|x| ≥ n",
      human: "length greater than or equal to",
    })
  );
  /** @category Size @symbol |x| < n @human length less than @since 0.1.0 */
  export const LengthLt = opMaker.make("lengthLt", fields({ symbol: "|x| < n", human: "length less than" }));
  /** @category Size @symbol |x| ≤ n @human length less than or equal to @since 0.1.0 */
  export const LengthLte = opMaker.make(
    "lengthLte",
    fields({
      symbol: "|x| ≤ n",
      human: "length less than or equal to",
    })
  );

  /**
   * @category Size
   * @symbol |x| ∈ [a, b]
   * @human length between
   * @since 0.1.0
   * @remarks Toggle `inclusive` to choose inclusive/exclusive bounds.
   */
  export const LengthBetween = opMaker.make(
    "lengthBetween",
    fields({ symbol: "|x| ∈ [a, b]", human: "length between" }, { inclusive: BoolWithDefault(false) })
  );

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  🧰 Set / Collection Relations                               ║
  // ╚══════════════════════════════════════════════════════════════╝

  /** @category Set @symbol ∈ @human is in set @since 0.1.0 */
  export const InSet = opMaker.make("inSet", fields({ symbol: "∈", human: "is in set" }));
  /** @category Set @symbol ∈ @human is in (alias) @since 0.1.0 */
  export const In = opMaker.make("in", fields({ symbol: "∈", human: "is in" }));
  /** @category Set @symbol ∉ @human is not in @since 0.1.0 */
  export const NotIn = opMaker.make("notIn", fields({ symbol: "∉", human: "is not in" }));

  /** @category Set @symbol ⊆ @human is a subset of @since 0.1.0 */
  export const SubsetOf = opMaker.make("subsetOf", fields({ symbol: "⊆", human: "is a subset of" }));
  /** @category Set @symbol ⊄ @human is not a subset of @since 0.1.0 */
  export const NotSubsetOf = opMaker.make("notSubsetOf", fields({ symbol: "⊄", human: "is not a subset of" }));

  /** @category Set @symbol ⊇ @human is a superset of @since 0.1.0 */
  export const SupersetOf = opMaker.make("supersetOf", fields({ symbol: "⊇", human: "is a superset of" }));
  /** @category Set @symbol ⊅ @human is not a superset of @since 0.1.0 */
  export const NotSupersetOf = opMaker.make("notSupersetOf", fields({ symbol: "⊅", human: "is not a superset of" }));

  /** @category Set @symbol ∩ ≠ ∅ @human overlaps @since 0.1.0 */
  export const Overlaps = opMaker.make("overlaps", fields({ symbol: "∩ ≠ ∅", human: "overlaps" }));
  /** @category Set @symbol ∩ = ∅ @human is disjoint with @since 0.1.0 */
  export const DisjointWith = opMaker.make("disjointWith", fields({ symbol: "∩ = ∅", human: "is disjoint with" }));

  /** @category Selection @symbol ∈ @human is one of @since 0.1.0 */
  export const OneOf = opMaker.make("oneOf", fields({ symbol: "∈", human: "is one of" }));
  /** @category Selection @symbol ⊇ @human contains all of @since 0.1.0 */
  export const AllOf = opMaker.make("allOf", fields({ symbol: "⊇", human: "contains all of" }));
  /** @category Selection @symbol ∩ = ∅ @human contains none of @since 0.1.0 */
  export const NoneOf = opMaker.make("noneOf", fields({ symbol: "∩ = ∅", human: "contains none of" }));

  /** @category Selection @symbol ∩ ≠ ∅ @human contains any of @since 0.1.0 */
  export const ContainsAny = opMaker.make("containsAny", fields({ symbol: "∩ ≠ ∅", human: "contains any of" }));
  /** @category Selection @symbol ⊇ @human contains all of (collections) @since 0.1.0 */
  export const ContainsAll = opMaker.make("containsAll", fields({ symbol: "⊇", human: "contains all of" }));
  /** @category Selection @symbol ∩ = ∅ @human contains none of (collections) @since 0.1.0 */
  export const ContainsNone = opMaker.make("containsNone", fields({ symbol: "∩ = ∅", human: "contains none of" }));

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  🗺️ Object Structure                                         ║
  // ╚══════════════════════════════════════════════════════════════╝

  /** @category Object @symbol ∋ key @human has key @since 0.1.0 */
  export const HasKey = opMaker.make("hasKey", fields({ symbol: "∋ key", human: "has key" }));
  /** @category Object @symbol ∋ all(keys) @human has every key @since 0.1.0 */
  export const HasEveryKey = opMaker.make("hasEveryKey", fields({ symbol: "∋ all(keys)", human: "has every key" }));
  /** @category Object @symbol ∋ any(key) @human has any key @since 0.1.0 */
  export const HasAnyKey = opMaker.make("hasAnyKey", fields({ symbol: "∋ any(key)", human: "has any key" }));
  /** @category Object @symbol ∌ key @human does not have key @since 0.1.0 */
  export const NotHasKey = opMaker.make("notHasKey", fields({ symbol: "∌ key", human: "does not have key" }));

  /** @category Object @symbol ∋ path @human has path @since 0.1.0 */
  export const HasPath = opMaker.make("hasPath", fields({ symbol: "∋ path", human: "has path" }));
  /** @category Object @symbol ∌ path @human does not have path @since 0.1.0 */
  export const NotHasPath = opMaker.make("notHasPath", fields({ symbol: "∌ path", human: "does not have path" }));

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  🗓️ Temporal Predicates                                      ║
  // ╚══════════════════════════════════════════════════════════════╝

  /** @category Time @symbol ≡ hour @human is in the same hour @since 0.1.0 */
  export const IsSameHour = opMaker.make("isSameHour", fields({ symbol: "≡ hour", human: "is in the same hour" }));
  /** @category Time @symbol ≡ day @human is on the same day @since 0.1.0 */
  export const IsSameDay = opMaker.make("isSameDay", fields({ symbol: "≡ day", human: "is on the same day" }));
  /** @category Time @symbol ≡ week @human is in the same week @since 0.1.0 */
  export const IsSameWeek = opMaker.make("isSameWeek", fields({ symbol: "≡ week", human: "is in the same week" }));
  /** @category Time @symbol ≡ month @human is in the same month @since 0.1.0 */
  export const IsSameMonth = opMaker.make("isSameMonth", fields({ symbol: "≡ month", human: "is in the same month" }));
  /** @category Time @symbol ≡ year @human is in the same year @since 0.1.0 */
  export const IsSameYear = opMaker.make("isSameYear", fields({ symbol: "≡ year", human: "is in the same year" }));

  /** @category Time @symbol <t @human is before @since 0.1.0 */
  export const Before = opMaker.make("before", fields({ symbol: "<t", human: "is before" }));
  /** @category Time @symbol ≤t @human is on or before @since 0.1.0 */
  export const OnOrBefore = opMaker.make("onOrBefore", fields({ symbol: "≤t", human: "is on or before" }));

  /** @category Time @symbol >t @human is after @since 0.1.0 */
  export const After = opMaker.make("after", fields({ symbol: ">t", human: "is after" }));
  /** @category Time @symbol ≥t @human is on or after @since 0.1.0 */
  export const OnOrAfter = opMaker.make("onOrAfter", fields({ symbol: "≥t", human: "is on or after" }));

  /** @category Time @symbol ∈ (now−Δ, now] @human is within last duration @since 0.1.0 */
  export const WithinLast = opMaker.make(
    "withinLast",
    fields({ symbol: "∈ (now−Δ, now]", human: "is within last duration" })
  );

  /** @category Time @symbol ∈ [now, now+Δ) @human is within next duration @since 0.1.0 */
  export const WithinNext = opMaker.make(
    "withinNext",
    fields({ symbol: "∈ [now, now+Δ)", human: "is within next duration" })
  );

  /** @category Time @symbol Mon–Fri @human is on a weekday @since 0.1.0 */
  export const IsWeekday = opMaker.make("isWeekday", fields({ symbol: "Mon–Fri", human: "is on a weekday" }));
  /** @category Time @symbol Sat/Sun @human is on a weekend @since 0.1.0 */
  export const IsWeekend = opMaker.make("isWeekend", fields({ symbol: "Sat/Sun", human: "is on a weekend" }));
  /** @category Time @symbol ≡ quarter @human is in the same quarter @since 0.1.0 */
  export const IsSameQuarter = opMaker.make(
    "isSameQuarter",
    fields({ symbol: "≡ quarter", human: "is in the same quarter" })
  );

  // ╔══════════════════════════════════════════════════════════════╗
  // ║  🕳️ Emptiness & Presence                                     ║
  /** Covers "", [], {}, Map(0), Set(0); type-specific impl via .create */
  // ╚══════════════════════════════════════════════════════════════╝

  /** @category Size @symbol ∅ @human is empty @since 0.1.0 */
  export const IsEmpty = opMaker.make("isEmpty", fields({ symbol: "∅", human: "is empty" }));

  /** @category Size @symbol ¬∅ @human is not empty @since 0.1.0 */
  export const IsNotEmpty = opMaker.make("isNotEmpty", fields({ symbol: "¬∅", human: "is not empty" }));

  /**
   * @category String
   * @symbol "" (trim)
   * @human is blank (empty or whitespace-only)
   * @since 0.1.0
   * @remarks Use `trim` to control whitespace semantics.
   */
  export const IsBlank = opMaker.make(
    "isBlank",
    fields({ symbol: `""(trim)`, human: "is blank" }, { trim: BoolWithDefault(true) })
  );

  /** @category String @symbol "¬""(trim)" @human is not blank @since 0.1.0 */
  export const IsNotBlank = opMaker.make(
    "isNotBlank",
    fields({ symbol: `¬""(trim)`, human: "is not blank" }, { trim: BoolWithDefault(true) })
  );

  /**
   * @category Presence
   * @symbol null|undef|∅
   * @human is nullish or empty
   * @since 0.1.0
   * @remarks Treats null/undefined/""/[]/{} as empty; `trim` affects strings.
   */
  export const IsNullishOrEmpty = opMaker.make(
    "isNullishOrEmpty",
    fields({ symbol: "null|undef|∅", human: "is nullish or empty" }, { trim: BoolWithDefault(true) })
  );

  /**
   * @category Presence
   * @symbol ¬(null|undef|∅)
   * @human is present (not nullish and not empty)
   * @since 0.1.0
   */
  export const IsPresent = opMaker.make(
    "isPresent",
    fields({ symbol: "¬(null|undef|∅)", human: "is present" }, { trim: BoolWithDefault(true) })
  );

  /**
   * @category Size
   * @symbol ∅(deep)
   * @human is deeply empty (recursively no meaningful content)
   * @since 0.1.0
   * @remarks For nested arrays/objects (and Maps/Sets); implement depth logic in specialization.
   */
  export const IsEmptyDeep = opMaker.make(
    "isEmptyDeep",
    fields({ symbol: "∅(deep)", human: "is deeply empty" }, { deep: BoolWithDefault(true) })
  );

  /** @category Size @symbol ¬∅(deep) @human is not deeply empty @since 0.1.0 */
  export const IsNotEmptyDeep = opMaker.make(
    "isNotEmptyDeep",
    fields({ symbol: "¬∅(deep)", human: "is not deeply empty" }, { deep: BoolWithDefault(true) })
  );
}

export namespace StringOperators {
  export class Eq extends Operators.Eq.create({
    value: S.String,
  }) {}
}
