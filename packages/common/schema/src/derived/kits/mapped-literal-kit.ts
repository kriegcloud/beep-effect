/**
 * Mapped literal kit that wraps `transformLiterals` with static `From` and `To` LiteralKits.
 *
 * Provides bidirectional literal mapping with full access to both source and target literal kits.
 * Unlike StringLiteralKit-based mappings, this supports any AST.LiteralValue (string, number, boolean, null, bigint).
 *
 * @example
 * import { MappedLiteralKit } from "@beep/schema/derived/kits/mapped-literal-kit";
 *
 * // String to string mapping
 * const StatusMapping = MappedLiteralKit(
 *   ["pending", "PENDING"],
 *   ["active", "ACTIVE"],
 *   ["archived", "ARCHIVED"]
 * );
 *
 * // StatusMapping.From.Options => ["pending", "active", "archived"]
 * // StatusMapping.To.Options => ["PENDING", "ACTIVE", "ARCHIVED"]
 * // StatusMapping.From.Enum => { pending: "pending", active: "active", archived: "archived" }
 * // StatusMapping.To.Enum => { PENDING: "PENDING", ACTIVE: "ACTIVE", ARCHIVED: "ARCHIVED" }
 *
 * // Decoding: "pending" -> "PENDING"
 * // Encoding: "PENDING" -> "pending"
 *
 * @example
 * // Number to string mapping
 * const HttpStatusMapping = MappedLiteralKit(
 *   [200, "OK"],
 *   [201, "Created"],
 *   [404, "Not Found"],
 *   [500, "Internal Server Error"]
 * );
 *
 * // HttpStatusMapping.From.Options => [200, 201, 404, 500]
 * // HttpStatusMapping.To.Options => ["OK", "Created", "Not Found", "Internal Server Error"]
 * // HttpStatusMapping.From.Enum.n200 => 200
 * // HttpStatusMapping.To.Enum.OK => "OK"
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
import { mergeSchemaAnnotations } from "@beep/schema/core/annotations/built-in-annotations";
import { $KitsId } from "@beep/schema/internal";
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as S from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import type { IGenericLiteralKit } from "./literal-kit";
import { makeGenericLiteralKit } from "./literal-kit";

const { $MappedLiteralKitId: Id } = $KitsId.compose("mapped-literal-kit");

// ============================================================================
// Type Utilities
// ============================================================================

/**
 * Pairs type constraint for mapped literal kit.
 * Supports any AST.LiteralValue (string, number, boolean, null, bigint) for both from and to values.
 */
type MappedPairs = A.NonEmptyReadonlyArray<readonly [AST.LiteralValue, AST.LiteralValue]>;

/**
 * Extract the "from" literals from pairs as a tuple type.
 */
type ExtractFromLiterals<Pairs extends MappedPairs> = {
  -readonly [K in keyof Pairs]: Pairs[K] extends readonly [infer F extends AST.LiteralValue, AST.LiteralValue]
    ? F
    : never;
};

/**
 * Extract the "to" literals from pairs as a tuple type.
 */
type ExtractToLiterals<Pairs extends MappedPairs> = {
  -readonly [K in keyof Pairs]: Pairs[K] extends readonly [AST.LiteralValue, infer T extends AST.LiteralValue]
    ? T
    : never;
};

/**
 * Convert extracted literals to a NonEmptyReadonlyArray type.
 */
type ExtractedLiteralsArray<Pairs extends MappedPairs, Side extends "from" | "to"> = Side extends "from"
  ? ExtractFromLiterals<Pairs> & A.NonEmptyReadonlyArray<AST.LiteralValue>
  : ExtractToLiterals<Pairs> & A.NonEmptyReadonlyArray<AST.LiteralValue>;

// ============================================================================
// Interface
// ============================================================================

/**
 * Type representing the From literal kit for a given set of pairs.
 */
type FromLiteralKit<Pairs extends MappedPairs> = IGenericLiteralKit<ExtractedLiteralsArray<Pairs, "from">>;

/**
 * Type representing the To literal kit for a given set of pairs.
 */
type ToLiteralKit<Pairs extends MappedPairs> = IGenericLiteralKit<ExtractedLiteralsArray<Pairs, "to">>;

/**
 * Interface representing a mapped literal kit instance.
 *
 * Combines transform schema functionality with access to both From and To literal kits.
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
export interface IMappedLiteralKit<Pairs extends MappedPairs>
  extends S.AnnotableClass<
    IMappedLiteralKit<Pairs>,
    Pairs[number][1], // Type (decoded value)
    Pairs[number][0] // Encoded value
  > {
  /**
   * The source (encoded) literal kit.
   */
  readonly From: FromLiteralKit<Pairs>;

  /**
   * The target (decoded) literal kit.
   */
  readonly To: ToLiteralKit<Pairs>;

  /**
   * The original pairs used to construct this kit.
   */
  readonly Pairs: Pairs;

  /**
   * Lookup map from encoded to decoded values.
   */
  readonly decodeMap: ReadonlyMap<Pairs[number][0], Pairs[number][1]>;

  /**
   * Lookup map from decoded to encoded values.
   */
  readonly encodeMap: ReadonlyMap<Pairs[number][1], Pairs[number][0]>;

  /**
   * Effect HashMap from encoded to decoded values.
   * Provides immutable, efficient lookups with Effect's structural equality.
   */
  readonly Map: HashMap.HashMap<Pairs[number][0], Pairs[number][1]>;
}

// ============================================================================
// Factory Implementation
// ============================================================================

/**
 * Creates a mapped literal kit from pairs.
 *
 * @param pairs - The from/to literal pairs
 * @param ast - Optional AST override (used for annotations)
 * @returns A MappedLiteralKit instance
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
export function makeMappedLiteralKit<const Pairs extends MappedPairs>(
  pairs: Pairs,
  ast?: AST.AST | undefined
): IMappedLiteralKit<Pairs> {
  // Extract from and to literals
  const fromLiterals: ExtractFromLiterals<Pairs> & A.NonEmptyReadonlyArray<string> = F.pipe(
    pairs,
    A.map(([from]) => from)
  ) as UnsafeTypes.UnsafeAny;

  const toLiterals: ExtractToLiterals<Pairs> & A.NonEmptyReadonlyArray<string> = F.pipe(
    pairs,
    A.map(([, to]) => to)
  ) as UnsafeTypes.UnsafeAny;

  // Build lookup maps
  const decodeMap = new Map<Pairs[number][0], Pairs[number][1]>(A.map(pairs, ([from, to]) => [from, to] as const));
  const encodeMap = new Map<Pairs[number][1], Pairs[number][0]>(A.map(pairs, ([from, to]) => [to, from] as const));

  // Build Effect HashMap from pairs
  const hashMap: HashMap.HashMap<Pairs[number][0], Pairs[number][1]> = HashMap.fromIterable(pairs);

  // Create the underlying transform schema
  const baseSchema: ReturnType<typeof S.transformLiterals<AST.Members<readonly [AST.LiteralValue, AST.LiteralValue]>>> =
    S.transformLiterals(...(pairs as UnsafeTypes.UnsafeAny));

  // Use provided AST or extract from base schema
  const schemaAST = ast ?? baseSchema.ast;

  // Create From and To literal kits using the generic LiteralKit
  const FromKit: FromLiteralKit<Pairs> = makeGenericLiteralKit(fromLiterals) as unknown as FromLiteralKit<Pairs>;
  const ToKit: ToLiteralKit<Pairs> = makeGenericLiteralKit(toLiterals) as unknown as ToLiteralKit<Pairs>;

  return class MappedLiteralKitClass extends S.make<Pairs[number][1], Pairs[number][0]>(schemaAST) {
    static override annotations(annotations: S.Annotations.Schema<Pairs[number][1]>): IMappedLiteralKit<Pairs> {
      return makeMappedLiteralKit(pairs, mergeSchemaAnnotations(this.ast, annotations));
    }

    static From = FromKit;
    static To = ToKit;
    static Pairs = pairs;
    static decodeMap = decodeMap;
    static encodeMap = encodeMap;
    static Map = hashMap;
  } as UnsafeTypes.UnsafeAny;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates a mapped literal kit that transforms between two sets of literals.
 *
 * Wraps `S.transformLiterals` and exposes static `From` and `To` properties
 * that are full `LiteralKit` instances supporting any AST.LiteralValue type.
 *
 * @example
 * import { MappedLiteralKit } from "@beep/schema/derived/kits/mapped-literal-kit";
 *
 * // Simple status mapping
 * const StatusMapping = MappedLiteralKit(
 *   ["pending", "PENDING"],
 *   ["active", "ACTIVE"],
 *   ["archived", "ARCHIVED"]
 * );
 *
 * // Access the From kit (source/encoded literals)
 * StatusMapping.From.Options  // => ["pending", "active", "archived"]
 * StatusMapping.From.Enum     // => { pending: "pending", active: "active", archived: "archived" }
 * StatusMapping.From.is.pending("pending")  // => true
 *
 * // Access the To kit (target/decoded literals)
 * StatusMapping.To.Options  // => ["PENDING", "ACTIVE", "ARCHIVED"]
 * StatusMapping.To.Enum     // => { PENDING: "PENDING", ACTIVE: "ACTIVE", ARCHIVED: "ARCHIVED" }
 *
 * // Use as a schema
 * import * as S from "effect/Schema";
 * S.decodeSync(StatusMapping)("pending")  // => "PENDING"
 * S.encodeSync(StatusMapping)("PENDING")  // => "pending"
 *
 * // Lookup maps for programmatic access
 * StatusMapping.decodeMap.get("pending")  // => "PENDING"
 * StatusMapping.encodeMap.get("PENDING")  // => "pending"
 *
 * // Effect HashMap for immutable lookups
 * import { HashMap } from "effect";
 * HashMap.get(StatusMapping.Map, "pending")  // => Option.some("PENDING")
 *
 * @example
 * // Numeric to string mapping (API codes to human-readable)
 * const ErrorCodeMapping = MappedLiteralKit(
 *   ["E001", "Invalid Input"],
 *   ["E002", "Not Found"],
 *   ["E003", "Unauthorized"]
 * );
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export function MappedLiteralKit<const Pairs extends MappedPairs>(...pairs: Pairs): IMappedLiteralKit<Pairs> {
  return makeMappedLiteralKit(pairs).annotations(
    Id.annotations("MappedLiteralKit", {
      description: "Bidirectional literal mapping schema with From/To literal kits",
      arbitrary: () => (fc) => fc.constantFrom(...A.map(pairs, ([, to]) => to)),
    })
  );
}
