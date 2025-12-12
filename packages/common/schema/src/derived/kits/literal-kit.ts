/**
 * Generic literal kit that supports any AST.LiteralValue (string, number, boolean, null, bigint).
 *
 * Unlike StringLiteralKit which is specialized for string literals, this kit works with
 * any literal value type that Effect Schema supports.
 *
 * @example
 * import { LiteralKit } from "@beep/schema/derived/kits/literal-kit";
 *
 * // Number literals
 * const HttpStatusKit = LiteralKit(200, 201, 400, 404, 500);
 * HttpStatusKit.Options  // => [200, 201, 400, 404, 500]
 * HttpStatusKit.is.n200(value)  // type guard for 200
 *
 * // Boolean literals
 * const BoolKit = LiteralKit(true, false);
 *
 * // Mixed literals (though typically you'd use same types)
 * const MixedKit = LiteralKit("yes", "no", 1, 0, true, false);
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
import * as A from "effect/Array";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import { mergeSchemaAnnotations } from "../../core/annotations/built-in-annotations";
import { $KitsId } from "../../internal";

const { $LiteralKitId: Id } = $KitsId.compose("literal-kit");

// ============================================================================
// Type Utilities
// ============================================================================

/**
 * Constraint for literal values array - must be non-empty.
 */
type LiteralsType = A.NonEmptyReadonlyArray<AST.LiteralValue>;

/**
 * Subset of literals from a parent type.
 */
type LiteralsSubset<Literals extends LiteralsType> = A.NonEmptyReadonlyArray<Literals[number]>;

/**
 * Convert a literal value to a valid object key (string representation).
 * Used for creating the Enum and is guards objects.
 *
 * Key format by type:
 * - null → "null"
 * - boolean → "true" | "false"
 * - bigint → `${value}n` (e.g., 1n → "1n")
 * - number → `n${value}` (e.g., 200 → "n200") - prefixed for dot notation access
 * - string → as-is (e.g., "pending" → "pending")
 */
type LiteralToKey<L extends AST.LiteralValue> = L extends null
  ? "null"
  : L extends boolean
    ? L extends true
      ? "true"
      : "false"
    : L extends bigint
      ? `${L}n`
      : L extends number
        ? `n${L}`
        : L & string;

/**
 * Type guard map: one guard per literal key.
 *
 * Maps each literal to a type guard function that narrows `unknown` to that specific literal.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type IsGuards<Literals extends LiteralsType> = {
  readonly [L in Literals[number] as LiteralToKey<L>]: (i: unknown) => i is L;
};

/**
 * Enum-like object mapping string keys to literal values.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type LiteralEnum<Literals extends LiteralsType> = {
  readonly [L in Literals[number] as LiteralToKey<L>]: L;
};

/**
 * Pick options type.
 */
type PickOptions<Literals extends LiteralsType> = <const Keys extends LiteralsSubset<Literals>>(
  ...keys: Keys
) => A.NonEmptyReadonlyArray<Keys[number]>;

/**
 * Omit options type.
 */
type OmitOptions<Literals extends LiteralsType> = <const Keys extends LiteralsSubset<Literals>>(
  ...keys: Keys
) => A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>>;

// ============================================================================
// Interface
// ============================================================================

/**
 * Interface representing a generic literal kit instance.
 *
 * Provides Schema, Options, Enum, type guards, and utility functions for literal unions.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
export interface IGenericLiteralKit<Literals extends LiteralsType>
  extends S.AnnotableClass<IGenericLiteralKit<Literals>, Literals[number]> {
  /**
   * The literal values as a tuple.
   */
  readonly Options: Literals;

  /**
   * Enum-like object mapping keys to literal values.
   * Keys are derived from the literal values (e.g., 200 -> "n200", true -> "true", null -> "null").
   */
  readonly Enum: LiteralEnum<Literals>;

  /**
   * Type guards for each literal value.
   */
  readonly is: IsGuards<Literals>;

  /**
   * Create a subset with only the specified literals.
   */
  readonly pickOptions: PickOptions<Literals>;

  /**
   * Create a subset excluding the specified literals.
   */
  readonly omitOptions: OmitOptions<Literals>;

  /**
   * Derive a new LiteralKit from a subset of literals.
   */
  readonly derive: <Keys extends LiteralsSubset<Literals>>(...keys: Keys) => IGenericLiteralKit<Keys>;
}

// ============================================================================
// AST Helpers
// ===========================================================================

/**
 * Checks whether the provided array of literals constitutes multiple members.
 */
const isMembers = <A>(as: ReadonlyArray<A>): as is AST.Members<A> => as.length > 1;

/**
 * Maps members using the provided function while preserving member metadata.
 */
const mapMembers = <A, B>(members: AST.Members<A>, f: (a: A) => B): AST.Members<B> =>
  A.map(members, f) as unknown as AST.Members<B>;

/**
 * Build the default AST for a set of literals.
 */
function getDefaultLiteralAST<Literals extends LiteralsType>(literals: Literals): AST.AST {
  return isMembers(literals)
    ? AST.Union.make(mapMembers(literals, (literal) => new AST.Literal(literal)))
    : new AST.Literal(literals[0]);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert a literal value to a string key for use in objects.
 */
function literalToKey<const L extends AST.LiteralValue>(literal: L) {
  if (literal === null) return "null";
  if (Equal.equals(typeof literal)("boolean")) return literal ? ("true" as const) : ("false" as const);
  if (Equal.equals(typeof literal)("bigint")) return `${literal}n` as const;
  if (Equal.equals(typeof literal)("number")) return `n${literal}` as const;
  return String(literal);
}
/**
 * Build a map of type guards for each literal value.
 */
const buildIsGuards = <Literals extends LiteralsType>(literals: Literals): IsGuards<Literals> => {
  const entries = F.pipe(
    literals,
    A.map((lit) => [literalToKey(lit), (i: unknown): i is typeof lit => i === lit] as const)
  );
  return R.fromEntries(entries) as unknown as IsGuards<Literals>;
};

/**
 * Build an enum-like object from literals.
 */
const buildEnum = <Literals extends LiteralsType>(literals: Literals): LiteralEnum<Literals> => {
  const entries = F.pipe(
    literals,
    A.map((lit) => [literalToKey(lit), lit] as const)
  );
  return R.fromEntries(entries) as unknown as LiteralEnum<Literals>;
};

// ============================================================================
// Factory Implementation
// ============================================================================

/**
 * Creates a literal kit from an array of literal values.
 *
 * @param literals - The literal values
 * @param ast - Optional AST override (used for annotations)
 * @returns A LiteralKit instance
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
export function makeGenericLiteralKit<const Literals extends LiteralsType>(
  literals: Literals,
  ast?: AST.AST | undefined
): IGenericLiteralKit<Literals> {
  const schemaAST = ast ?? getDefaultLiteralAST(literals);
  const Enum = buildEnum(literals);
  const is = buildIsGuards(literals);

  const pickOptions = <Keys extends LiteralsSubset<Literals>>(...keys: Keys): A.NonEmptyReadonlyArray<Keys[number]> =>
    F.pipe(
      literals,
      A.filter((lit): lit is Keys[number] => A.contains(keys, lit))
    ) as unknown as A.NonEmptyReadonlyArray<Keys[number]>;

  const omitOptions = <Keys extends LiteralsSubset<Literals>>(
    ...keys: Keys
  ): A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>> =>
    F.pipe(
      literals,
      A.filter((lit): lit is Exclude<Literals[number], Keys[number]> => !A.contains(keys, lit))
    ) as unknown as A.NonEmptyReadonlyArray<Exclude<Literals[number], Keys[number]>>;

  const derive = <Keys extends LiteralsSubset<Literals>>(...keys: Keys): IGenericLiteralKit<Keys> =>
    makeGenericLiteralKit(keys);

  return class LiteralKitClass extends S.make<Literals[number]>(schemaAST) {
    static override annotations(annotations: S.Annotations.Schema<Literals[number]>): IGenericLiteralKit<Literals> {
      return makeGenericLiteralKit(literals, mergeSchemaAnnotations(this.ast, annotations));
    }

    static Options = literals;
    static Enum = Enum;
    static is = is;
    static pickOptions = pickOptions;
    static omitOptions = omitOptions;
    static derive = derive;
  } as unknown as IGenericLiteralKit<Literals>;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates a literal kit that works with any AST.LiteralValue type.
 *
 * Unlike `StringLiteralKit` which is specialized for string literals,
 * `LiteralKit` supports strings, numbers, booleans, null, and bigints.
 *
 * @example
 * import { LiteralKit } from "@beep/schema/derived/kits/literal-kit";
 * import * as S from "effect/Schema";
 *
 * // HTTP status codes
 * const HttpStatus = LiteralKit(200, 201, 400, 404, 500);
 * HttpStatus.Options  // => [200, 201, 400, 404, 500]
 * HttpStatus.Enum     // => { n200: 200, n201: 201, ... }
 * HttpStatus.is.n200(200)  // => true
 * HttpStatus.is.n404(500)  // => false
 *
 * // Use as a schema
 * S.decodeSync(HttpStatus)(200)  // => 200
 * S.decodeSync(HttpStatus)(999)  // throws ParseError
 *
 * // Boolean literals
 * const Bool = LiteralKit(true, false);
 * Bool.Enum.true   // => true
 * Bool.Enum.false  // => false
 *
 * // Derive subsets
 * const SuccessStatus = HttpStatus.derive(200, 201);
 * SuccessStatus.Options  // => [200, 201]
 *
 * @example
 * // Bigint literals
 * const BigNumbers = LiteralKit(1n, 2n, 3n);
 * BigNumbers.Enum["1n"]  // => 1n
 * BigNumbers.is["2n"](2n)  // => true
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export function LiteralKit<const Literals extends LiteralsType>(...literals: Literals): IGenericLiteralKit<Literals> {
  return makeGenericLiteralKit(literals).annotations(
    Id.annotations("LiteralKit", {
      description: "Literal kit schema for any literal value type",
      arbitrary: () => (fc) => fc.constantFrom(...literals),
    })
  );
}
