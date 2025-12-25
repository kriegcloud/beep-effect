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
 * // Direct enum-like access to mapped values
 * // StatusMapping.DecodedEnum.pending => "PENDING" (encoded key → decoded value)
 * // StatusMapping.EncodedEnum.PENDING => "pending" (decoded key → encoded value)
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
 * // String to number mapping (HTTP status codes)
 * const HttpStatusCode = MappedLiteralKit(
 *   ["OK", 200],
 *   ["CREATED", 201],
 *   ["NOT_FOUND", 404],
 *   ["INTERNAL_SERVER_ERROR", 500]
 * );
 *
 * // DecodedEnum: string keys → number values
 * const statusCode: 200 = HttpStatusCode.DecodedEnum.OK;
 * const notFound: 404 = HttpStatusCode.DecodedEnum.NOT_FOUND;
 *
 * // EncodedEnum: n-prefixed number keys → string values
 * const statusName: "OK" = HttpStatusCode.EncodedEnum.n200;
 * const errorName: "NOT_FOUND" = HttpStatusCode.EncodedEnum.n404;
 *
 * @category Derived/Kits
 * @since 0.1.0
 */

import type {UnsafeTypes} from "@beep/types";
import * as A from "effect/Array";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import type * as AST from "effect/SchemaAST";
import {mergeSchemaAnnotations} from "../../core/annotations/built-in-annotations";
import type {IGenericLiteralKit} from "./literal-kit";
import {makeGenericLiteralKit} from "./literal-kit";
import {ArrayUtils} from "@beep/utils";

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

/**
 * Convert a literal value to a valid object key (string representation).
 * Used for creating the Enum objects with dot-notation access.
 *
 * Key format by type:
 * - null → "null"
 * - boolean → "true" | "false"
 * - bigint → `${value}n` (e.g., 1n → "1n")
 * - number → `n${value}` (e.g., 200 → "n200") - prefixed for dot notation access
 * - string → as-is (e.g., "pending" → "pending")
 *
 * @since 0.1.0
 * @category Derived/Kits
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
 * Decoded enum: Maps from "from" literal keys to "to" literal values.
 *
 * For each pair [F, T], creates an entry `{ [LiteralToKey<F>]: T }`
 * enabling dot-notation access to decoded values via the encoded key.
 *
 * @example
 * // Given pairs: ["OK", 200], ["CREATED", 201]
 * // DecodedEnum type: { OK: 200, CREATED: 201 }
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type DecodedEnum<Pairs extends MappedPairs> = {
  readonly [P in Pairs[number] as LiteralToKey<P[0]>]: P[1];
};

/**
 * Encoded enum: Maps from "to" literal keys to "from" literal values.
 *
 * For each pair [F, T], creates an entry `{ [LiteralToKey<T>]: F }`
 * enabling reverse lookup from decoded values to encoded keys.
 *
 * @example
 * // Given pairs: ["OK", 200], ["CREATED", 201]
 * // EncodedEnum type: { n200: "OK", n201: "CREATED" }
 *
 * @since 0.1.0
 * @category Derived/Kits
 */
type EncodedEnum<Pairs extends MappedPairs> = {
  readonly [P in Pairs[number] as LiteralToKey<P[1]>]: P[0];
};

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

  /**
   * Enum mapping from "from" literal keys to "to" literal values.
   *
   * Enables direct access to decoded values using the encoded literal as a key.
   * Keys are transformed via `LiteralToKey` for dot-notation compatibility.
   *
   * @example
   * const HttpStatus = MappedLiteralKit(["OK", 200], ["NOT_FOUND", 404]);
   * HttpStatus.DecodedEnum.OK          // 200
   * HttpStatus.DecodedEnum.NOT_FOUND   // 404
   *
   * @since 0.1.0
   */
  readonly DecodedEnum: DecodedEnum<Pairs>;

  /**
   * Enum mapping from "to" literal keys to "from" literal values.
   *
   * Enables reverse lookup from decoded values to their encoded counterparts.
   * Keys are transformed via `LiteralToKey` for dot-notation compatibility.
   *
   * @example
   * const HttpStatus = MappedLiteralKit(["OK", 200], ["NOT_FOUND", 404]);
   * HttpStatus.EncodedEnum.n200   // "OK"
   * HttpStatus.EncodedEnum.n404   // "NOT_FOUND"
   *
   * @since 0.1.0
   */
  readonly EncodedEnum: EncodedEnum<Pairs>;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert a literal value to a string key for use in objects.
 * Mirrors the type-level LiteralToKey transformation at runtime.
 */
function literalToKey<const L extends AST.LiteralValue>(literal: L) {
  if (literal === null) return "null";
  if (Equal.equals(typeof literal)("boolean")) return literal ? ("true" as const) : ("false" as const);
  if (Equal.equals(typeof literal)("bigint")) return `${literal}n` as const;
  if (Equal.equals(typeof literal)("number")) return `n${literal}` as const;
  return String(literal);
}

/**
 * Build the DecodedEnum: { [fromKey]: toValue }
 * Maps from encoded literal keys to decoded literal values.
 */
const buildDecodedEnum = <Pairs extends MappedPairs>(pairs: Pairs): DecodedEnum<Pairs> => {
  const entries = F.pipe(
    pairs,
    A.map(([from, to]) => [literalToKey(from), to] as const)
  );
  return R.fromEntries(entries) as unknown as DecodedEnum<Pairs>;
};

/**
 * Build the EncodedEnum: { [toKey]: fromValue }
 * Maps from decoded literal keys to encoded literal values.
 */
const buildEncodedEnum = <Pairs extends MappedPairs>(pairs: Pairs): EncodedEnum<Pairs> => {
  const entries = F.pipe(
    pairs,
    A.map(([from, to]) => [literalToKey(to), from] as const)
  );
  return R.fromEntries(entries) as unknown as EncodedEnum<Pairs>;
};

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

  // Build enum objects for direct access
  const DecodedEnumObj = buildDecodedEnum(pairs);
  const EncodedEnumObj = buildEncodedEnum(pairs);

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
    static DecodedEnum = DecodedEnumObj;
    static EncodedEnum = EncodedEnumObj;
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
 * // Direct enum-like access to mapped values
 * StatusMapping.DecodedEnum.pending    // => "PENDING" (encoded key → decoded value)
 * StatusMapping.DecodedEnum.active     // => "ACTIVE"
 * StatusMapping.EncodedEnum.PENDING    // => "pending" (decoded key → encoded value)
 * StatusMapping.EncodedEnum.ACTIVE     // => "active"
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
 * // HTTP status code mapping (string to number)
 * const HttpStatus = MappedLiteralKit(
 *   ["OK", 200],
 *   ["CREATED", 201],
 *   ["NOT_FOUND", 404],
 *   ["INTERNAL_SERVER_ERROR", 500]
 * );
 *
 * // DecodedEnum: string keys → number values
 * HttpStatus.DecodedEnum.OK           // => 200
 * HttpStatus.DecodedEnum.NOT_FOUND    // => 404
 *
 * // EncodedEnum: n-prefixed number keys → string values
 * HttpStatus.EncodedEnum.n200         // => "OK"
 * HttpStatus.EncodedEnum.n404         // => "NOT_FOUND"
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export function MappedLiteralKit<const Pairs extends MappedPairs>(...pairs: Pairs): IMappedLiteralKit<Pairs> {
  return makeMappedLiteralKit(pairs).annotations({
    description: "Bidirectional literal mapping schema with From/To literal kits",
    arbitrary: () => (fc) => fc.constantFrom(...A.map(pairs, ([, to]) => to)),
  });
}

// ============================================================================
// Enum Conversion
// ============================================================================

/**
 * Creates a MappedLiteralKit directly from a TypeScript enum object.
 *
 * Works with any enum where values are AST.LiteralValue (string, number, boolean, null, bigint):
 * ```ts
 * enum Position { Left = "left", Top = "top" }
 * enum HttpStatus { OK = 200, NotFound = 404 }
 * ```
 *
 * @example
 * ```ts
 * import { Position as XYFlowPosition } from "@xyflow/react";
 *
 * // Creates a MappedLiteralKit from the enum
 * export const Position = MappedLiteralKitFromEnum(XYFlowPosition);
 *
 * // Access decoded values via encoded keys
 * Position.DecodedEnum.Left    // => "left"
 * Position.DecodedEnum.Top     // => "top"
 *
 * // Access encoded values via decoded keys
 * Position.EncodedEnum.left    // => "Left"
 * Position.EncodedEnum.top     // => "Top"
 *
 * // Use as a schema
 * S.decodeSync(Position)("Left")  // => "left"
 * S.encodeSync(Position)("left")  // => "Left"
 * ```
 *
 * @example
 * ```ts
 * // Works with numeric enums too
 * enum HttpStatus { OK = 200, NotFound = 404 }
 *
 * const Status = MappedLiteralKitFromEnum(HttpStatus);
 * Status.DecodedEnum.OK        // => 200
 * Status.EncodedEnum.n200      // => "OK"
 * ```
 *
 * @param enumObj - A TypeScript enum object (Record<string, AST.LiteralValue>)
 * @returns A MappedLiteralKit instance with bidirectional mapping
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export const MappedLiteralKitFromEnum = <const E extends Record<string, AST.LiteralValue>>(
  enumObj: E
): IMappedLiteralKit<A.NonEmptyReadonlyArray<readonly [keyof E & string, E[keyof E]]>> => {
  const keys = ArrayUtils.NonEmptyReadonly.fromIterable(Struct.keys(enumObj));
  const pairs = ArrayUtils.NonEmptyReadonly.mapNonEmpty(
    keys,
    (key) => [key, enumObj[key]] as const
  ) as MappedPairs;
  return makeMappedLiteralKit(pairs) as UnsafeTypes.UnsafeAny;
};

