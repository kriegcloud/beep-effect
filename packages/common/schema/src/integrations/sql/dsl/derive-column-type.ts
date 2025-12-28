import { $SchemaId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { thunk, thunkThrow } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import { UnsupportedColumnTypeError } from "./errors";
import { ColumnType } from "./literals";

const $I = $SchemaId.create("integrations/sql/dsl/derive-column-type");
// ============================================================================
// SchemaId Symbols for Type Detection
// ============================================================================

class UUIDSchemaId extends S.UniqueSymbolFromSelf(S.UUIDSchemaId) {
  static readonly is = S.is(UUIDSchemaId);
}

class ULIDSchemaId extends S.UniqueSymbolFromSelf(S.ULIDSchemaId) {
  static readonly is = S.is(ULIDSchemaId);
}

class IntSchemaId extends S.UniqueSymbolFromSelf(S.IntSchemaId) {
  static readonly is = S.is(IntSchemaId);
}

// ============================================================================
// Column Type Derivation
// ============================================================================

/**
 * Derives the SQL column type from an Effect Schema AST.
 *
 * Analyzes the encoded side of transformations (what gets stored in the database).
 * Uses pattern matching on AST tags to determine the appropriate SQL column type.
 *
 * Mapping rules:
 * - StringKeyword, TemplateLiteral, string literals → "string"
 * - NumberKeyword → "number"
 * - Int refinements, number literals → "integer"
 * - BooleanKeyword, boolean literals → "boolean"
 * - BigIntKeyword → "bigint"
 * - UUID refinements → "uuid"
 * - Date/DateTime transformations → "datetime"
 * - Structural types (TupleType, TypeLiteral, etc.) → "json"
 * - Union: derive from non-null members, homogeneous literals get their base type
 *
 * @param ast - The AST node to analyze
 * @param visited - WeakSet for circular reference protection
 * @returns The derived SQL column type
 *
 * @throws UnsupportedColumnTypeError for unsupported types (Never, Void, Undefined alone, Symbol, null-only unions)
 *
 * @since 1.0.0
 * @category utilities
 */
export const deriveColumnType = (ast: AST.AST, visited: WeakSet<AST.AST> = new WeakSet()): ColumnType.Type => {
  // Circular reference protection
  if (visited.has(ast)) return ColumnType.Enum.json;
  visited.add(ast);

  // Use Match.discriminatorsExhaustive for exhaustive pattern matching on AST._tag
  // This is more efficient for large discriminated unions than chained Match.tag calls
  return F.pipe(
    Match.value(ast),
    Match.discriminatorsExhaustive("_tag")({
      // ======================================================================
      // Primitive Keywords
      // ======================================================================
      StringKeyword: ColumnType.thunks.string,
      NumberKeyword: ColumnType.thunks.number,
      BooleanKeyword: ColumnType.thunks.boolean,
      BigIntKeyword: ColumnType.thunks.bigint,

      // ======================================================================
      // Structural Types → JSON
      // ======================================================================
      TupleType: ColumnType.thunks.json,
      TypeLiteral: ColumnType.thunks.json,
      ObjectKeyword: ColumnType.thunks.json,
      UnknownKeyword: ColumnType.thunks.json,
      AnyKeyword: ColumnType.thunks.json,

      // ======================================================================
      // Invalid Types - Throw Descriptive Errors
      // ======================================================================
      NeverKeyword: thunkThrow(
        new UnsupportedColumnTypeError({
          message: "Never type cannot be used as a SQL column",
          code: "DSL-UCT-001",
          severity: "error",
          path: ["deriveColumnType"],
          expected: "A schema type that maps to a SQL column (String, Number, Boolean, etc.)",
          received: "Never",
          suggestion: "Use a concrete schema type that can be stored in the database",
          schemaType: "Never",
          reason: "The 'never' type represents an impossible value and cannot be stored",
        })
      ),
      VoidKeyword: thunkThrow(
        new UnsupportedColumnTypeError({
          message: "Void type cannot be used as a SQL column",
          code: "DSL-UCT-002",
          severity: "error",
          path: ["deriveColumnType"],
          expected: "A schema type that maps to a SQL column (String, Number, Boolean, etc.)",
          received: "Void",
          suggestion: "Use a concrete schema type that can be stored in the database",
          schemaType: "Void",
          reason: "The 'void' type represents no value and cannot be stored",
        })
      ),
      UndefinedKeyword: thunkThrow(
        new UnsupportedColumnTypeError({
          message: "Undefined type cannot be used as a SQL column alone",
          code: "DSL-UCT-003",
          severity: "error",
          path: ["deriveColumnType"],
          expected: "A schema type that maps to a SQL column, optionally wrapped in S.NullOr or S.optional",
          received: "Undefined",
          suggestion: "Use S.optional(S.String) or S.NullOr(S.String) instead of bare undefined",
          schemaType: "Undefined",
          reason: "Undefined alone has no SQL representation; use it with a union type",
        })
      ),
      SymbolKeyword: thunkThrow(
        new UnsupportedColumnTypeError({
          message: "Symbol type cannot be stored in SQL",
          code: "DSL-UCT-004",
          severity: "error",
          path: ["deriveColumnType"],
          expected: "A schema type that maps to a SQL column (String, Number, Boolean, etc.)",
          received: "Symbol",
          suggestion: "Use S.String with a branded type for unique identifiers",
          schemaType: "Symbol",
          reason: "JavaScript Symbols are runtime-only and have no SQL equivalent",
        })
      ),
      UniqueSymbol: thunkThrow(
        new UnsupportedColumnTypeError({
          message: "Unique symbols cannot be stored in SQL",
          code: "DSL-UCT-005",
          severity: "error",
          path: ["deriveColumnType"],
          expected: "A schema type that maps to a SQL column (String, Number, Boolean, etc.)",
          received: "UniqueSymbol",
          suggestion: "Use S.String with a branded type for unique identifiers",
          schemaType: "UniqueSymbol",
          reason: "JavaScript Symbols are runtime-only and have no SQL equivalent",
        })
      ),

      // ======================================================================
      // Literal Values
      // ======================================================================
      Literal: (literalAst) => deriveLiteralColumnType(literalAst.literal),

      // ======================================================================
      // Enums - Determine if All String or Numeric
      // ======================================================================
      Enums: (enumsAst) => deriveEnumsColumnType(enumsAst.enums),

      // ======================================================================
      // Template Literal → String
      // ======================================================================
      TemplateLiteral: ColumnType.thunks.string,

      // ======================================================================
      // Union Handling
      // ======================================================================
      Union: (unionAst) => deriveUnionColumnType(unionAst, visited),

      // ======================================================================
      // Refinement - Check SchemaId for UUID/Int, else Recurse
      // ======================================================================
      Refinement: (refinementAst) => deriveRefinementColumnType(refinementAst, visited),

      // ======================================================================
      // Transformation - Check Identifier for Date/BigInt, else Recurse
      // ======================================================================
      Transformation: (transformAst) => deriveTransformationColumnType(transformAst, visited),

      // ======================================================================
      // Suspend - Resolve Lazy Reference
      // ======================================================================
      Suspend: (suspendAst) => deriveColumnType(suspendAst.f(), visited),

      // ======================================================================
      // Declaration - Check Identifier for Known Types
      // ======================================================================
      Declaration: deriveDeclarationColumnType,
    })
  );
};

// ============================================================================
// Helper Functions for Complex AST Nodes
// ============================================================================

/**
 * Derives column type from a literal value.
 * @internal
 */
const deriveLiteralColumnType = Match.type<AST.LiteralValue>().pipe(
  Match.when(
    P.isNull,
    thunkThrow(
      new UnsupportedColumnTypeError({
        message: "Null literal cannot be used as a SQL column type alone",
        code: "DSL-UCT-006",
        severity: "error",
        path: ["deriveColumnType", "Literal"],
        expected: "A non-null literal value (string, number, boolean, bigint)",
        received: "null",
        suggestion: "Use S.NullOr(S.String) or similar to wrap the nullable type",
        schemaType: "Literal(null)",
        reason: "A column cannot be defined as only null; use a nullable union type",
      })
    )
  ),
  Match.when(P.isString, ColumnType.thunks.string),
  Match.when(P.isNumber, ColumnType.thunks.number),
  Match.when(P.isBoolean, ColumnType.thunks.boolean),
  Match.when(P.isBigInt, ColumnType.thunks.bigint),
  Match.orElse(ColumnType.thunks.json)
);

/**
 * Derives column type from an Enums AST.
 * @internal
 */
const deriveEnumsColumnType = (enums: ReadonlyArray<readonly [string, string | number]>): ColumnType.Type => {
  const allStrings = F.pipe(
    enums,
    A.every(([, value]) => P.isString(value))
  );

  return allStrings ? ColumnType.Enum.string : ColumnType.Enum.integer;
};

/**
 * Derives column type from a Refinement AST.
 * Checks SchemaId for known types (UUID, ULID, Int).
 * @internal
 */
const deriveRefinementColumnType = (refinementAst: AST.Refinement, visited: WeakSet<AST.AST>): ColumnType.Type => {
  const schemaId = AST.getSchemaIdAnnotation(refinementAst);
  return F.pipe(
    schemaId,
    O.match({
      onNone: thunk(deriveColumnType(refinementAst.from, visited)),
      onSome: Match.type<AST.SchemaIdAnnotation>().pipe(
        Match.when(UUIDSchemaId.is, ColumnType.thunks.uuid),
        Match.when(ULIDSchemaId.is, ColumnType.thunks.uuid),
        Match.when(IntSchemaId.is, ColumnType.thunks.integer),
        Match.orElse(thunk(deriveColumnType(refinementAst.from, visited)))
      ),
    })
  );
};

export class DateSchemaId extends BS.StringLiteralKit(
  "Date",
  "DateFromString",
  "DateTimeUtc",
  "DateTimeUtcFromSelf"
).annotations(
  $I.annotations("DateSchemaId", {
    description: "Date-related transformation schema id's",
  })
) {}

export declare namespace DateSchemaId {
  export type Type = typeof DateSchemaId.Type;
}

export class BigIntSchemaId extends BS.StringLiteralKit("BigInt", "BigIntFromString").annotations(
  $I.annotations("BigIntSchemaId", {
    description: "BigInt transformation schema id's",
  })
) {}

export declare namespace BigIntSchemaId {
  export type Type = typeof BigIntSchemaId.Type;
}

/**
 * Derives column type from a Transformation AST.
 * Checks identifier for Date/BigInt transformations.
 * @internal
 */
const deriveTransformationColumnType = (
  transformAst: AST.Transformation,
  visited: WeakSet<AST.AST>
): ColumnType.Type => {
  const identifier = AST.getIdentifierAnnotation(transformAst);
  return F.pipe(
    identifier,
    O.match({
      onNone: thunk(deriveColumnType(transformAst.from, visited)),
      onSome: Match.type<string>().pipe(
        Match.when(S.is(DateSchemaId), ColumnType.thunks.datetime),
        Match.when(S.is(BigIntSchemaId), ColumnType.thunks.bigint),
        Match.orElse(thunk(deriveColumnType(transformAst.from, visited)))
      ),
    })
  );
};

/**
 * Derives column type from a Declaration AST.
 * Checks identifier for known self-types.
 * @internal
 */
const deriveDeclarationColumnType = (declAst: AST.Declaration): ColumnType.Type => {
  const identifier = AST.getIdentifierAnnotation(declAst);
  return F.pipe(
    identifier,
    O.match({
      onNone: ColumnType.thunks.json,
      onSome: Match.type<string>().pipe(
        Match.when("DateFromSelf", ColumnType.thunks.datetime),
        Match.when("BigIntFromSelf", ColumnType.thunks.bigint),
        Match.orElse(ColumnType.thunks.json)
      ),
    })
  );
};

// ============================================================================
// Union Column Type Derivation
// ============================================================================

/**
 * Derives the column type for a Union AST.
 *
 * Handles:
 * - NullOr patterns: finds the non-null member and derives from it
 * - Homogeneous string literal unions: "string"
 * - Homogeneous number literal unions: "integer"
 * - Heterogeneous unions where all members derive to same type
 * - Falls back to "json" for mixed type unions
 *
 * @internal
 */
const deriveUnionColumnType = (unionAst: AST.Union, visited: WeakSet<AST.AST>): ColumnType.Type => {
  // Filter out null literals to find the substantive types
  const nonNullMembers = F.pipe(
    unionAst.types,
    A.filter((t) => !(AST.isLiteral(t) && P.isNull(t.literal)))
  );

  // If no non-null members, the union is just null
  if (A.isEmptyArray(nonNullMembers)) {
    throw new UnsupportedColumnTypeError({
      message: "Union containing only null cannot be used as a SQL column type",
      code: "DSL-UCT-007",
      severity: "error",
      path: ["deriveColumnType", "Union"],
      expected: "A union with at least one non-null member type",
      received: "Union of only null",
      suggestion: "Add a non-null type to the union, e.g., S.NullOr(S.String)",
      schemaType: "Union(null)",
      reason: "A column cannot be defined as only null; include at least one concrete type",
    });
  }

  // Check if it's a homogeneous string literal union (e.g., "a" | "b" | "c")
  const allStringLiterals = F.pipe(
    unionAst.types,
    A.every((t) => AST.isLiteral(t) && P.isString(t.literal))
  );
  if (allStringLiterals) return ColumnType.Enum.string;

  // Check if it's a homogeneous number literal union (e.g., 1 | 2 | 3)
  const allNumberLiterals = F.pipe(
    nonNullMembers,
    A.every((t) => AST.isLiteral(t) && P.isNumber(t.literal))
  );
  if (allNumberLiterals) return ColumnType.Enum.integer;

  // Derive column types from all non-null members
  const memberTypes = F.pipe(
    nonNullMembers,
    A.map((t) => deriveColumnType(t, visited))
  );

  // Deduplicate to find unique types
  const uniqueTypes = F.pipe(memberTypes, A.dedupe);

  // If all members derive to the same type, use that type
  if (A.length(uniqueTypes) === 1) {
    return F.pipe(A.head(uniqueTypes), O.getOrElse(ColumnType.thunks.json));
  }

  // Heterogeneous union with different derived types → json fallback
  return ColumnType.Enum.json;
};

// ============================================================================
// Convenience Wrapper
// ============================================================================

/**
 * Derives the SQL column type from an Effect Schema.
 * Convenience wrapper around `deriveColumnType` for Schema inputs.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { deriveSchemaColumnType } from "./derive-column-type"
 *
 * deriveSchemaColumnType(S.String) // "string"
 * deriveSchemaColumnType(S.Int) // "integer"
 * deriveSchemaColumnType(S.UUID) // "uuid"
 * deriveSchemaColumnType(S.Date) // "datetime"
 * deriveSchemaColumnType(S.NullOr(S.String)) // "string"
 * deriveSchemaColumnType(S.Struct({ a: S.String })) // "json"
 * ```
 *
 * @param schema - The Effect Schema to analyze
 * @returns The derived SQL column type
 *
 * @since 1.0.0
 * @category utilities
 */
export const deriveSchemaColumnType = (schema: { readonly ast: AST.AST }): ColumnType.Type =>
  deriveColumnType(schema.ast);
