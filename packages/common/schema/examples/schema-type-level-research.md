```ts
/**
 * Research: Effect Schema Type-Level Discrimination
 *
 * This file explores how Effect Schemas are structured at the type level
 * and whether they can be distinguished using TypeScript conditional types.
 */

import type * as S from "effect/Schema";

// =============================================================================
// 1. Basic Schema Type Structure
// =============================================================================

/**
 * Key finding: All schemas extend SchemaClass<A, I, R>
 * - String$ extends SchemaClass<string, string, never>
 * - Number$ extends SchemaClass<number, number, never>
 * - UUID extends filter<String$> which extends refine<string, String$>
 * - Int extends filter<Number$> which extends refine<number, Number$>
 */

type StringType = typeof S.String;
type NumberType = typeof S.Number;
type UUIDType = typeof S.UUID;
type IntType = typeof S.Int;

// Test 1: Can we distinguish schemas by their class identity?
type Test1_StringVsUUID = StringType extends UUIDType ? "yes" : "no"; // "no" ✓
type Test1_UUIDVsString = UUIDType extends StringType ? "yes" : "no"; // "yes" ✗ (PROBLEM!)

// Test 2: Can we distinguish schemas by Schema.Type?
type Test2_StringVsUUID = S.Schema.Type<StringType> extends S.Schema.Type<UUIDType> ? "yes" : "no"; // "yes"
type Test2_UUIDVsString = S.Schema.Type<UUIDType> extends S.Schema.Type<StringType> ? "yes" : "no"; // "yes"

// =============================================================================
// 2. The `any` Problem
// =============================================================================

/**
 * Key finding: `Schema.Any` is defined as `Schema<any, any, unknown>`
 * This causes ALL schemas to match in conditional types!
 */

type SchemaAny = S.Schema.Any;
//   ^? Schema<any, any, unknown>

// Test 3: Why does `Schema extends typeof S.Any` fail?
// Because `typeof S.Any` is a runtime value, not a type!
// The correct type-level check would be against Schema.Any

type Test3_StringExtendsAny = StringType extends SchemaAny ? "yes" : "no"; // "yes"
type Test3_UUIDExtendsAny = UUIDType extends SchemaAny ? "yes" : "no"; // "yes"
type Test3_IntExtendsAny = IntType extends SchemaAny ? "yes" : "no"; // "yes"

// =============================================================================
// 3. Schema ID Symbols
// =============================================================================

/**
 * Key finding: Effect provides unique symbols for schema identification:
 * - UUIDSchemaId
 * - IntSchemaId
 * - LessThanSchemaId
 * - etc.
 *
 * These are used at RUNTIME via AST annotations, not at compile-time!
 */

type UUIDSchemaId = typeof S.UUIDSchemaId;
//   ^? unique symbol

type IntSchemaId = typeof S.IntSchemaId;
//   ^? unique symbol

// But these symbols are NOT present on the schema types themselves at compile-time
// They're only in the AST at runtime

// =============================================================================
// 4. Structural Type Analysis
// =============================================================================

/**
 * Let's examine the actual structure of schema types
 */

type InspectString = StringType;
//   ^? SchemaClass<string, string, never>

type InspectUUID = UUIDType;
//   ^? filter<typeof String$>

type InspectInt = IntType;
//   ^? filter<typeof Number$>

// UUID is a filter, which extends refine, which extends Schema
// This means UUID is structurally compatible with String (upcast)

// =============================================================================
// 5. Why Conditional Types Fail
// =============================================================================

/**
 * The problem: `any` in variance positions
 *
 * Schema.Any = Schema<any, any, unknown>
 *
 * In TypeScript, `any` is both a supertype AND subtype of everything!
 * This causes bidirectional matches in conditional types.
 */

// Example: any breaks conditional types
type AnyTest1 = string extends any ? "yes" : "no"; // "yes"
type AnyTest2 = any extends string ? "yes" : "no"; // "yes" (!!!)

// This is why `Schema<A, I, R> extends Schema<any, any, unknown>` is ALWAYS true
// And `Schema<any, any, unknown> extends Schema<A, I, R>` is ALSO ALWAYS true

// =============================================================================
// 6. Attempted Workarounds
// =============================================================================

/**
 * Approach 1: Check if schema is NOT Schema.Any
 * Problem: Everything matches Schema.Any due to `any` variance
 */
type IsNotSchemaAny<S> = S extends SchemaAny
  ? SchemaAny extends S
    ? false // Bidirectional match = is Schema.Any
    : true // One-way match = is specific schema
  : false;

type Test6_String = IsNotSchemaAny<StringType>; // false ✗
type Test6_UUID = IsNotSchemaAny<UUIDType>; // false ✗

/**
 * Approach 2: Extract Schema.Type and check for `any`
 * Problem: `any extends string` and `string extends any` both true
 */
type IsAnyType<T> = 0 extends 1 & T ? true : false;

type Test7_StringType = IsAnyType<S.Schema.Type<StringType>>; // false ✓
type Test7_AnyType = IsAnyType<S.Schema.Type<SchemaAny>>; // true ✓

/**
 * Approach 3: Use Schema.Type instead of Schema
 * Problem: Loses distinction between refined types
 */
type IsSameType<S1, S2> =
  S.Schema.Type<S1> extends S.Schema.Type<S2> ? (S.Schema.Type<S2> extends S.Schema.Type<S1> ? true : false) : false;

type Test8_StringUUID = IsSameType<StringType, UUIDType>; // true ✗
type Test8_StringNumber = IsSameType<StringType, NumberType>; // false ✓

// =============================================================================
// 7. Runtime vs Compile-Time
// =============================================================================

/**
 * Key insight: Effect Schemas are designed for RUNTIME validation
 * Type-level discrimination is NOT a design goal
 *
 * At compile-time:
 * - typeof S.String ≠ typeof S.UUID (different class identities)
 * - But both are assignable to each other due to variance
 *
 * At runtime:
 * - AST contains unique SchemaId symbols
 * - Validators use these IDs for specific behavior
 * - Pattern matching on AST._tag is the correct approach
 */

// Example: Runtime discrimination works
const checkSchema = (schema: S.Schema<any, any, any>) => {
  // This is how Effect does it internally
  const ast = schema.ast;

  // Check AST tags
  if (ast._tag === "Refinement") {
    // UUID, Int, etc. are refinements
    console.log("Refinement schema");
  } else if (ast._tag === "StringKeyword") {
    // String is a keyword
    console.log("String keyword");
  }
};

```