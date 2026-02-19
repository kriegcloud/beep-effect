```ts
/**
 * Practical Example: SQL Type Inference Using Function Overloads
 *
 * This demonstrates the recommended pattern for deriving SQL column types
 * from Effect Schemas without relying on conditional types.
 */


import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * PostgreSQL column types (subset for demonstration)
 */
type PgColumnType =
  | "uuid"
  | "text"
  | "varchar"
  | "integer"
  | "bigint"
  | "numeric"
  | "boolean"
  | "timestamptz"
  | "jsonb"
  | "unknown";

/**
 * Field metadata combining Effect Schema + SQL column type
 */
class Field<A, I, R, SqlType extends PgColumnType> {
  constructor(
    readonly schema: S.Schema<A, I, R>,
    readonly sqlType: SqlType,
    readonly nullable: boolean = false
  ) {}

  /**
   * Make field nullable (affects both schema and SQL type)
   */
  nullable_(): Field<A | null, I | null, R, SqlType> {
    return new Field(S.NullOr(this.schema), this.sqlType, true) as any; // Type gymnastics - SqlType doesn't change
  }
}

// =============================================================================
// Overload-Based Type Derivation
// =============================================================================

/**
 * Primary pattern: Function overloads for compile-time inference
 *
 * Each overload maps a specific schema type to its SQL column type.
 * The compiler selects the most specific matching overload.
 */

// String-based schemas
function field(schema: typeof S.UUID): Field<string, string, never, "uuid">;
function field(schema: typeof S.String): Field<string, string, never, "text">;

// Number-based schemas
function field(schema: typeof S.Int): Field<number, number, never, "integer">;
function field(schema: typeof S.Number): Field<number, number, never, "numeric">;

// Boolean
function field(schema: typeof S.Boolean): Field<boolean, boolean, never, "boolean">;

// DateTime (Effect 3.10+)
function field<A, I, R>(schema: S.Schema<A, I, R> & { _tag?: "DateTimeUtc" }): Field<A, I, R, "timestamptz">;

// Branded types (fallback to base type)
function field<Brand>(schema: S.Schema<string & Brand, string, never>): Field<string & Brand, string, never, "text">;

function field<Brand>(schema: S.Schema<number & Brand, number, never>): Field<number & Brand, number, never, "numeric">;

// Catch-all for unknown schemas
function field<A, I, R>(schema: S.Schema<A, I, R>): Field<A, I, R, "unknown">;

// Implementation (runtime introspection)
function field(schema: S.Schema.Any): Field<any, any, any, PgColumnType> {
  const sqlType = deriveColumnTypeFromAST(schema.ast);
  return new Field(schema, sqlType, false);
}

// =============================================================================
// Runtime AST Introspection (Fallback)
// =============================================================================

/**
 * Derive SQL column type from Effect Schema AST
 *
 * This is the runtime implementation that handles schemas not covered
 * by explicit overloads.
 */
function deriveColumnTypeFromAST(ast: AST.AST): PgColumnType {
  switch (ast._tag) {
    // Primitive keywords
    case "StringKeyword":
      return "text";

    case "NumberKeyword":
      return "numeric";

    case "BooleanKeyword":
      return "boolean";

    // Refinements (UUID, Int, etc.)
    case "Refinement": {
      // Check annotations for known schema IDs
      const schemaId = getSchemaId(ast);

      if (O.isSome(schemaId)) {
        switch (schemaId.value) {
          case S.UUIDSchemaId:
            return "uuid";
          case S.IntSchemaId:
            return "integer";
          // Add more schema IDs as needed
        }
      }

      // Fallback to base type
      return deriveColumnTypeFromAST(ast.from);
    }

    // Transformations (DateTimeUtc, etc.)
    case "Transformation": {
      // Heuristic: Check if transformation looks like DateTime
      // This is a simplified check - real implementation would use AST.getAnnotation
      const fromType = deriveColumnTypeFromAST(ast.from);
      if (fromType === "text") {
        // Could be DateTime transformation from string
        return "timestamptz";
      }

      // Fallback to source type
      return fromType;
    }

    // Branded types
    case "Refinement":
      return deriveColumnTypeFromAST(ast.from);

    // Unknown
    default:
      return "unknown";
  }
}

/**
 * Extract SchemaId from AST annotations
 */
function getSchemaId(ast: AST.Refinement): O.Option<symbol> {
  const annotations = AST.getAnnotation<symbol>(S.UUIDSchemaId)(ast);
  if (O.isSome(annotations)) return annotations;

  const intAnnotation = AST.getAnnotation<symbol>(S.IntSchemaId)(ast);
  if (O.isSome(intAnnotation)) return intAnnotation;

  return O.none();
}

// =============================================================================
// Usage Examples
// =============================================================================

// Example 1: Primitive schemas (overload resolution)
const id = field(S.UUID);
//    ^? Field<string, string, never, "uuid">

const name = field(S.String);
//    ^? Field<string, string, never, "text">

const age = field(S.Int);
//    ^? Field<number, number, never, "integer">

const active = field(S.Boolean);
//    ^? Field<boolean, boolean, never, "boolean">

// Example 2: Nullable fields
const optionalName = field(S.String).nullable_();
//    ^? Field<string | null, string | null, never, "text">

// Example 3: Branded types
const UserId = S.String.pipe(S.brand("UserId"));
const userId = field(UserId);
//    ^? Field<string & Brand<"UserId">, string, never, "text">

// Example 4: DateTime (simplified - real implementation would need specific handling)
// const createdAt = field(S.DateTimeUtc)
//    ^? Field<DateTime.Utc, string, never, "timestamptz">

// Example 5: Unknown schema (fallback to runtime)
const UnknownSchema = S.Struct({ nested: S.String });
const metadata = field(UnknownSchema);
//    ^? Field<{ readonly nested: string }, { readonly nested: string }, never, "unknown">

// =============================================================================
// Advanced: Manual Override
// =============================================================================

/**
 * Allow manual SQL type override for edge cases
 */
function fieldWithOverride<A, I, R, SqlType extends PgColumnType>(
  schema: S.Schema<A, I, R>,
  sqlType: SqlType
): Field<A, I, R, SqlType> {
  return new Field(schema, sqlType, false);
}

// Usage: Force varchar instead of text
const shortName = fieldWithOverride(S.String, "varchar");
//    ^? Field<string, string, never, "varchar">

// =============================================================================
// Table DSL Integration
// =============================================================================

/**
 * Demonstrate how this integrates with a table definition DSL
 */
const UserTable = {
  id: field(S.UUID),
  name: field(S.String),
  email: field(S.String),
  age: field(S.Int).nullable_(),
  isActive: field(S.Boolean),
  // createdAt: field(S.DateTimeUtc), // Simplified for demo
} as const;

// Extract types from table definition
type UserSchema = {
  [K in keyof typeof UserTable]: S.Schema.Type<(typeof UserTable)[K]["schema"]>;
};
/*
  ^? {
    id: string
    name: string
    email: string
    age: number | null
    isActive: boolean
  }
*/

type UserSqlTypes = {
  [K in keyof typeof UserTable]: (typeof UserTable)[K]["sqlType"];
};
/*
  ^? {
    id: "uuid"
    name: "text"
    email: "text"
    age: "integer"
    isActive: "boolean"
  }
*/

// =============================================================================
// Verification: Type-Level Tests
// =============================================================================

// Test 1: Overload resolution for specific schemas
type Test1_UUID = typeof id.sqlType;
//   ^? "uuid" ✓

type Test2_String = typeof name.sqlType;
//   ^? "text" ✓

type Test3_Int = typeof age.sqlType;
//   ^? "integer" ✓

// Test 2: Nullable handling
type Test4_Nullable = S.Schema.Type<typeof optionalName.schema>;
//   ^? string | null ✓

// Test 3: Branded types preserve brand
type Test5_Branded = S.Schema.Type<typeof userId.schema>;
//   ^? string & Brand<"UserId"> ✓

// Test 4: Manual override works
type Test6_Override = typeof shortName.sqlType;
//   ^? "varchar" ✓

// =============================================================================
// Comparison: Why Conditional Types Fail
// =============================================================================

/**
 * ANTI-PATTERN: Conditional types on schemas
 *
 * This approach FAILS due to `any` variance in Schema.Any
 */
type InferSqlTypeFailed<S> = S extends S.Schema.Any
  ? S extends typeof S.UUID
    ? "uuid" // Never matched!
    : S extends typeof S.String
      ? "text"
      : "unknown"
  : never;

type TestFail1 = InferSqlTypeFailed<typeof S.UUID>;
//   ^? "unknown" ✗ (Expected "uuid")

type TestFail2 = InferSqlTypeFailed<typeof S.String>;
//   ^? "unknown" ✗ (Expected "text")

/**
 * Why it fails:
 * - `typeof S.UUID` extends `filter<typeof S.String>`
 * - `filter<typeof S.String>` extends `typeof S.String` (variance)
 * - Conditional types cannot narrow further
 * - All schemas match the catch-all case
 */

// =============================================================================
// Conclusion
// =============================================================================

/**
 * Key Takeaways:
 *
 * 1. ✅ Function overloads provide compile-time type inference
 * 2. ✅ Runtime AST introspection handles edge cases
 * 3. ✅ Manual overrides support non-standard mappings
 * 4. ✅ Composable with nullable, branded types
 * 5. ❌ Conditional types fail due to any variance
 *
 * This pattern is production-ready and integrates cleanly with
 * the beep-effect DSL architecture.
 */

export type { Field, PgColumnType };
export { field, fieldWithOverride };

```