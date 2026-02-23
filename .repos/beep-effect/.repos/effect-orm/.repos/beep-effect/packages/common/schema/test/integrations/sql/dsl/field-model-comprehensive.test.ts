/**
 * @fileoverview Comprehensive test suite for DSL Field/Model column type derivation.
 * Tests all possible AST member types with Field, Model, and toDrizzle adapter.
 */
import { describe, expect, expectTypeOf, it } from "bun:test";
import type { DSLField } from "@beep/schema/integrations/sql/dsl";
import { ColumnMetaSymbol, Field, Model, toDrizzle } from "@beep/schema/integrations/sql/dsl";
import * as M from "@effect/sql/Model";
import { getTableName } from "drizzle-orm";
import * as B from "effect/Brand";
import * as S from "effect/Schema";

// ============================================================================
// Branded Type Helpers
// ============================================================================

type UserId = string & B.Brand<"UserId">;
const UserId = B.nominal<UserId>();
const UserIdSchema = S.String.pipe(S.fromBrand(UserId));

// ============================================================================
// Section 1: Primitive Keywords
// ============================================================================

describe("Primitive Keywords - Column Type Derivation", () => {
  describe("S.String", () => {
    it("derives 'string' column type", () => {
      const field = Field(S.String)({});
      expect(field[ColumnMetaSymbol].type).toBe("string");
    });

    it("works in Model with toDrizzle", () => {
      class TestModel extends Model<TestModel>("TestModel")({
        id: Field(S.String)({ column: { primaryKey: true } }),
      }) {}
      const table = toDrizzle(TestModel);
      expect(table).toBeDefined();
      expect(getTableName(table)).toBe("test_model");
    });
  });

  describe("S.Number", () => {
    it("derives 'number' column type", () => {
      const field = Field(S.Number)({});
      expect(field[ColumnMetaSymbol].type).toBe("number");
    });

    it("works in Model with toDrizzle", () => {
      class TestModel extends Model<TestModel>("TestModelNumber")({
        id: Field(S.String)({ column: { primaryKey: true } }),
        value: Field(S.Number)({}),
      }) {}
      const table = toDrizzle(TestModel);
      expect(table.value).toBeDefined();
    });
  });

  describe("S.Boolean", () => {
    it("derives 'boolean' column type", () => {
      const field = Field(S.Boolean)({});
      expect(field[ColumnMetaSymbol].type).toBe("boolean");
    });
  });

  describe("S.BigIntFromSelf", () => {
    it("derives 'bigint' column type", () => {
      const field = Field(S.BigIntFromSelf)({});
      expect(field[ColumnMetaSymbol].type).toBe("bigint");
    });
  });
});

// ============================================================================
// Section 2: Refinements with SchemaId
// ============================================================================

/**
 * **Precise Type-Level Derivation**:
 *
 * Both runtime and type-level derivation now correctly identify refined types
 * via schema class identity:
 * - S.Int → "integer" (distinguished from S.Number at type level)
 * - S.UUID → "uuid" (distinguished from S.String at type level)
 * - S.Date → "datetime"
 * - S.BigInt → "bigint"
 *
 * The type system uses class identity checks to precisely determine column types.
 */
// describe("Refinements - Column Type Derivation", () => {
//   describe("S.Int", () => {
//     it("derives 'integer' column type", () => {
//       const field = Field(S.Int)({});
//       // Both runtime and type-level correctly derive "integer"
//       expect(field[ColumnMetaSymbol].type).toBe("integer");
//     });
//
//     it("type-level derives 'integer' (precise via schema identity)", () => {
//       const field = Field(S.Int)({});
//       // Schema-level derivation correctly identifies S.Int
//       expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"integer">();
//     });
//
//     it("explicit type override to 'integer' works", () => {
//       const field = Field(S.Int)({ column: { type: "integer" } });
//       expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"integer">();
//       expectTypeOf(field).toExtend<DSLField<number, number, never>>();
//     });
//   });
//
//   describe("S.UUID", () => {
//     it("derives 'uuid' column type", () => {
//       const field = Field(S.UUID)({});
//       // Both runtime and type-level correctly derive "uuid"
//       expect(field[ColumnMetaSymbol].type).toBe("uuid");
//     });
//
//     it("type-level derives 'uuid' (precise via schema identity)", () => {
//       const field = Field(S.UUID)({});
//       expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"uuid">();
//     });
//   });
//
//   describe("Chained refinements", () => {
//     it("S.Int.pipe(S.positive()) derives 'integer'", () => {
//       const PositiveInt = S.Int.pipe(S.positive());
//       const field = Field(PositiveInt)({});
//       expect(field[ColumnMetaSymbol].type).toBe("integer");
//     });
//
//     it("S.String.pipe(S.nonEmptyString()) derives 'string'", () => {
//       const NonEmpty = S.String.pipe(S.nonEmptyString());
//       const field = Field(NonEmpty)({});
//       // Chained refinements may match specific types structurally
//       expect(field[ColumnMetaSymbol].type as string).toBe("string");
//     });
//
//     it("S.Number.pipe(S.positive()) derives 'number'", () => {
//       const PositiveNumber = S.Number.pipe(S.positive());
//       const field = Field(PositiveNumber)({});
//       // Chained refinements may match specific types structurally
//       expect(field[ColumnMetaSymbol].type as string).toBe("number");
//     });
//
//     it("S.String.pipe(S.minLength(1), S.maxLength(100)) derives 'string'", () => {
//       const BoundedString = S.String.pipe(S.minLength(1), S.maxLength(100));
//       const field = Field(BoundedString)({});
//       // Chained refinements may match specific types structurally
//       expect(field[ColumnMetaSymbol].type as string).toBe("string");
//     });
//
//     it("S.Int.pipe(S.between(0, 100)) derives 'integer'", () => {
//       const BoundedInt = S.Int.pipe(S.between(0, 100));
//       const field = Field(BoundedInt)({});
//       expect(field[ColumnMetaSymbol].type).toBe("integer");
//     });
//   });
// });

// ============================================================================
// Section 3: Transformations
// ============================================================================

/**
 * **Transformation Type Derivation**:
 *
 * Transformations have different Type (A) and Encoded (I) types.
 * Both runtime and type-level now correctly identify transformation schemas
 * via schema class identity:
 *
 * - S.Date → "datetime" (both runtime and type-level)
 * - S.DateFromString → "datetime" (both runtime and type-level)
 * - S.BigInt → "bigint" (both runtime and type-level)
 */
// describe("Transformations - Column Type Derivation", () => {
//   describe("Date transformations", () => {
//     it("S.Date derives 'datetime'", () => {
//       const field = Field(S.Date)({});
//       expect(field[ColumnMetaSymbol].type).toBe("datetime");
//     });
//
//     it("S.DateFromString derives 'datetime'", () => {
//       const field = Field(S.DateFromString)({});
//       expect(field[ColumnMetaSymbol].type).toBe("datetime");
//     });
//   });
//
//   describe("BigInt transformations", () => {
//     it("S.BigInt derives 'bigint'", () => {
//       const field = Field(S.BigInt)({});
//       expect(field[ColumnMetaSymbol].type).toBe("bigint");
//     });
//
//     it("S.BigIntFromNumber derives 'number' (encodes to number)", () => {
//       const field = Field(S.BigIntFromNumber)({});
//       // BigIntFromNumber encodes to number, so both type-level and runtime derive 'number'
//       expect(field[ColumnMetaSymbol].type).toBe("number");
//     });
//   });
//
//   describe("Number transformations", () => {
//     it("S.NumberFromString derives 'string' (encoded side)", () => {
//       const field = Field(S.NumberFromString)({});
//       expect(field[ColumnMetaSymbol].type).toBe("string");
//     });
//   });
//
//   describe("Split/Join transformations", () => {
//     it("S.split derives 'string' (encoded side is string)", () => {
//       const SplitString = S.split(",");
//       const field = Field(SplitString)({});
//       expect(field[ColumnMetaSymbol].type).toBe("string");
//     });
//   });
// });

// ============================================================================
// Section 4: Structural Types
// ============================================================================

describe("Structural Types - Column Type Derivation", () => {
  describe("S.Struct", () => {
    it("derives 'json' column type for simple struct", () => {
      const field = Field(S.Struct({ name: S.String }))({});
      expect(field[ColumnMetaSymbol].type).toBe("json");
    });

    it("derives 'json' column type for nested struct", () => {
      const NestedStruct = S.Struct({
        user: S.Struct({
          name: S.String,
          email: S.String,
        }),
        metadata: S.Struct({
          created: S.String,
        }),
      });
      const field = Field(NestedStruct)({});
      expect(field[ColumnMetaSymbol].type).toBe("json");
    });
  });

  describe("S.Array", () => {
    it("derives 'json' column type for string array", () => {
      const field = Field(S.Array(S.String))({});
      expect(field[ColumnMetaSymbol].type).toBe("json");
    });

    it("derives 'json' column type for number array", () => {
      const field = Field(S.Array(S.Number))({});
      expect(field[ColumnMetaSymbol].type).toBe("json");
    });

    it("derives 'json' column type for struct array", () => {
      const field = Field(S.Array(S.Struct({ id: S.Number })))({});
      expect(field[ColumnMetaSymbol].type).toBe("json");
    });
  });

  describe("S.Tuple", () => {
    it("derives 'json' column type", () => {
      const field = Field(S.Tuple(S.String, S.Number))({});
      expect(field[ColumnMetaSymbol].type).toBe("json");
    });

    it("derives 'json' for heterogeneous tuple", () => {
      const field = Field(S.Tuple(S.String, S.Boolean, S.Number))({});
      expect(field[ColumnMetaSymbol].type).toBe("json");
    });
  });

  describe("S.Record", () => {
    it("derives 'json' column type", () => {
      const field = Field(S.Record({ key: S.String, value: S.Number }))({});
      expect(field[ColumnMetaSymbol].type).toBe("json");
    });

    it("derives 'json' for nested record", () => {
      const field = Field(S.Record({ key: S.String, value: S.Struct({ x: S.Number }) }))({});
      expect(field[ColumnMetaSymbol].type).toBe("json");
    });
  });
});

// ============================================================================
// Section 5: Union Patterns
// ============================================================================

// describe("Union Patterns - Column Type Derivation", () => {
//   describe("S.NullOr", () => {
//     it("S.NullOr(S.String) derives 'string'", () => {
//       const field = Field(S.NullOr(S.String))({});
//       expect(field[ColumnMetaSymbol].type).toBe("string");
//     });
//
//     it("S.NullOr(S.Int) derives 'integer' at runtime", () => {
//       const field = Field(S.NullOr(S.Int))({});
//       // Type-level: "number", runtime: "integer"
//       expect(field[ColumnMetaSymbol].type).toBe("integer");
//     });
//
//     it("S.NullOr(S.UUID) derives 'uuid' at runtime", () => {
//       const field = Field(S.NullOr(S.UUID))({});
//       // Type-level: "string", runtime: "uuid"
//       expect(field[ColumnMetaSymbol].type).toBe("uuid");
//     });
//
//     it("S.NullOr(S.Boolean) derives 'boolean'", () => {
//       const field = Field(S.NullOr(S.Boolean))({});
//       expect(field[ColumnMetaSymbol].type).toBe("boolean");
//     });
//
//     it("S.NullOr(S.Date) derives 'datetime' at runtime", () => {
//       const field = Field(S.NullOr(S.Date))({});
//       // Type-level: "string", runtime: "datetime"
//       expect(field[ColumnMetaSymbol].type).toBe("datetime");
//     });
//   });
//
//   describe("S.UndefinedOr", () => {
//     // Note: S.UndefinedOr creates a union with undefined, which throws
//     // because standalone undefined cannot be stored in SQL.
//     // Use S.NullOr instead for nullable columns.
//     it("S.UndefinedOr(S.String) throws UnsupportedColumnTypeError (undefined cannot be stored)", () => {
//       expect(() => Field(S.UndefinedOr(S.String))({})).toThrow("Undefined type cannot be used as a SQL column alone");
//     });
//
//     it("S.UndefinedOr(S.Number) throws UnsupportedColumnTypeError (undefined cannot be stored)", () => {
//       expect(() => Field(S.UndefinedOr(S.Number))({})).toThrow("Undefined type cannot be used as a SQL column alone");
//     });
//   });
//
//   describe("S.NullishOr", () => {
//     // Note: S.NullishOr creates a union with null | undefined, which throws
//     // because standalone undefined cannot be stored in SQL.
//     // Use S.NullOr instead for nullable columns.
//     it("S.NullishOr(S.String) throws UnsupportedColumnTypeError (undefined cannot be stored)", () => {
//       expect(() => Field(S.NullishOr(S.String))({})).toThrow("Undefined type cannot be used as a SQL column alone");
//     });
//   });
//
//   describe("Literal unions", () => {
//     it("S.Literal('a', 'b', 'c') derives 'string'", () => {
//       const field = Field(S.Literal("a", "b", "c"))({});
//       // Literal string unions may match specific schema types structurally
//       expect(field[ColumnMetaSymbol].type as string).toBe("string");
//     });
//
//     it("S.Literal(1, 2, 3) derives 'integer' at runtime", () => {
//       const field = Field(S.Literal(1, 2, 3))({});
//       // Type-level may infer "number", runtime correctly derives "integer"
//       expect(field[ColumnMetaSymbol].type as string).toBe("integer");
//     });
//
//     it("single string literal derives 'string'", () => {
//       const field = Field(S.Literal("active"))({});
//       expect(field[ColumnMetaSymbol].type as string).toBe("string");
//     });
//
//     it("single number literal derives 'integer' at runtime", () => {
//       const field = Field(S.Literal(42))({});
//       // Type-level may infer "number", runtime correctly derives "integer"
//       expect(field[ColumnMetaSymbol].type as string).toBe("integer");
//     });
//
//     it("boolean literal derives 'boolean'", () => {
//       const field = Field(S.Literal(true))({});
//       expect(field[ColumnMetaSymbol].type).toBe("boolean");
//     });
//   });
//
//   describe("Heterogeneous unions", () => {
//     it("S.Union(S.String, S.Number) derives 'json'", () => {
//       const field = Field(S.Union(S.String, S.Number))({});
//       expect(field[ColumnMetaSymbol].type).toBe("json");
//     });
//
//     it("S.Union(S.Boolean, S.String) derives 'json'", () => {
//       const field = Field(S.Union(S.Boolean, S.String))({});
//       expect(field[ColumnMetaSymbol].type).toBe("json");
//     });
//   });
//
//   describe("Homogeneous unions", () => {
//     // Note: The runtime implementation derives 'json' for unions of refined schemas
//     // because each refinement is treated as a separate member, and the union logic
//     // doesn't simplify them to their base type. However, type-level inference
//     // correctly sees the common encoded type.
//     it("union of multiple string schemas derives 'json' at runtime (type-level: 'string')", () => {
//       const ShortString = S.String.pipe(S.maxLength(10));
//       const LongString = S.String.pipe(S.maxLength(100));
//       const field = Field(S.Union(ShortString, LongString))({});
//       // Type-level: "string" (sees common encoded type)
//       // Runtime: "json" (conservative, treats as heterogeneous)
//       expect(field[ColumnMetaSymbol].type as string).toBe("json");
//     });
//
//     it("union of multiple integer schemas derives 'json' at runtime (type-level: 'number')", () => {
//       const PositiveInt = S.Int.pipe(S.positive());
//       const SmallInt = S.Int.pipe(S.between(0, 10));
//       const field = Field(S.Union(PositiveInt, SmallInt))({});
//       // Type-level: "number" (sees common encoded type)
//       // Runtime: "json" (conservative, treats as heterogeneous)
//       expect(field[ColumnMetaSymbol].type as string).toBe("json");
//     });
//
//     it("union of same base type with different refinements could use explicit type override", () => {
//       // If you need a specific column type for a union, use explicit type override
//       const ShortString = S.String.pipe(S.maxLength(10));
//       const LongString = S.String.pipe(S.maxLength(100));
//       const field = Field(S.Union(ShortString, LongString))({ column: { type: "string" } });
//       expect(field[ColumnMetaSymbol].type).toBe("string");
//     });
//   });
// });

// ============================================================================
// Section 6: VariantSchema from @effect/sql/Model
// ============================================================================

/**
 * **VariantSchema Type Derivation**:
 *
 * VariantSchema fields (M.Generated, M.Sensitive, etc.) extract the "select"
 * variant's encoded type for type-level derivation. The same limitations apply:
 * - S.Int → type-level: "number", runtime: "integer"
 * - S.UUID → type-level: "string", runtime: "uuid"
 */
// describe("VariantSchema Fields - Column Type Derivation", () => {
//   describe("M.Generated", () => {
//     it("M.Generated(S.Int) derives 'integer' at runtime", () => {
//       const field = Field(M.Generated(S.Int))({});
//       // Variant wrappers lose schema identity at type-level, runtime correctly derives
//       expect(field[ColumnMetaSymbol].type as string).toBe("integer");
//     });
//
//     it("M.Generated(S.String) derives 'string'", () => {
//       const field = Field(M.Generated(S.String))({});
//       expect(field[ColumnMetaSymbol].type).toBe("string");
//     });
//
//     it("M.Generated(S.UUID) derives 'uuid' at runtime", () => {
//       const field = Field(M.Generated(S.UUID))({});
//       // Variant wrappers lose schema identity at type-level, runtime correctly derives
//       expect(field[ColumnMetaSymbol].type as string).toBe("uuid");
//     });
//
//     it("M.Generated(S.Date) derives 'datetime' at runtime", () => {
//       const field = Field(M.Generated(S.Date))({});
//       // Variant wrappers lose schema identity at type-level, runtime correctly derives
//       expect(field[ColumnMetaSymbol].type as string).toBe("datetime");
//     });
//
//     it("works in Model with autoIncrement", () => {
//       class TestModel extends Model<TestModel>("TestModelGenerated")({
//         id: Field(M.Generated(S.Int))({ column: { primaryKey: true, autoIncrement: true } }),
//       }) {}
//       const table = toDrizzle(TestModel);
//       expect(table.id).toBeDefined();
//     });
//   });
//
//   describe("M.Sensitive", () => {
//     it("M.Sensitive(S.String) derives 'string'", () => {
//       const field = Field(M.Sensitive(S.String))({});
//       expect(field[ColumnMetaSymbol].type).toBe("string");
//     });
//
//     it("M.Sensitive(S.Int) derives 'integer' at runtime", () => {
//       const field = Field(M.Sensitive(S.Int))({});
//       // Variant wrappers lose schema identity at type-level, runtime correctly derives
//       expect(field[ColumnMetaSymbol].type as string).toBe("integer");
//     });
//
//     it("works in Model", () => {
//       class TestModel extends Model<TestModel>("TestModelSensitive")({
//         id: Field(S.String)({ column: { primaryKey: true } }),
//         password: Field(M.Sensitive(S.String))({}),
//       }) {}
//       const table = toDrizzle(TestModel);
//       expect(table.password).toBeDefined();
//     });
//   });
//
//   describe("M.GeneratedByApp", () => {
//     it("M.GeneratedByApp(S.String) derives 'string'", () => {
//       const field = Field(M.GeneratedByApp(S.String))({});
//       expect(field[ColumnMetaSymbol].type).toBe("string");
//     });
//
//     it("M.GeneratedByApp(S.UUID) derives 'uuid' at runtime", () => {
//       const field = Field(M.GeneratedByApp(S.UUID))({});
//       // Variant wrappers lose schema identity at type-level, runtime correctly derives
//       expect(field[ColumnMetaSymbol].type as string).toBe("uuid");
//     });
//
//     it("M.GeneratedByApp(S.Int) derives 'integer' at runtime", () => {
//       const field = Field(M.GeneratedByApp(S.Int))({});
//       // Variant wrappers lose schema identity at type-level, runtime correctly derives
//       expect(field[ColumnMetaSymbol].type as string).toBe("integer");
//     });
//   });
//
//   describe("M.FieldOption", () => {
//     it("M.FieldOption(S.Number) derives 'number'", () => {
//       const field = Field(M.FieldOption(S.Number))({});
//       expect(field[ColumnMetaSymbol].type).toBe("number");
//     });
//
//     it("M.FieldOption(S.Int) derives 'integer' at runtime", () => {
//       const field = Field(M.FieldOption(S.Int))({});
//       // Type-level: "number", runtime: "integer"
//       expect(field[ColumnMetaSymbol].type).toBe("integer");
//     });
//
//     it("M.FieldOption(S.String) derives 'string'", () => {
//       const field = Field(M.FieldOption(S.String))({});
//       expect(field[ColumnMetaSymbol].type).toBe("string");
//     });
//
//     it("M.FieldOption(S.UUID) derives 'uuid' at runtime", () => {
//       const field = Field(M.FieldOption(S.UUID))({});
//       // Type-level: "string", runtime: "uuid"
//       expect(field[ColumnMetaSymbol].type).toBe("uuid");
//     });
//
//     it("M.FieldOption(S.Boolean) derives 'boolean'", () => {
//       const field = Field(M.FieldOption(S.Boolean))({});
//       expect(field[ColumnMetaSymbol].type).toBe("boolean");
//     });
//
//     it("M.FieldOption(S.Date) derives 'datetime' at runtime", () => {
//       const field = Field(M.FieldOption(S.Date))({});
//       // Type-level: "string", runtime: "datetime"
//       expect(field[ColumnMetaSymbol].type).toBe("datetime");
//     });
//
//     it("works in Model - type-level validation passes", () => {
//       class TestModel extends Model<TestModel>("TestModelFieldOption")({
//         id: Field(S.String)({ column: { primaryKey: true } }),
//         optional: Field(M.FieldOption(S.Number))({}),
//       }) {}
//       const table = toDrizzle(TestModel);
//       expect(table.optional).toBeDefined();
//     });
//   });
//
//   describe("Nested variant schemas", () => {
//     it("M.Generated with branded type", () => {
//       const field = Field(M.Generated(UserIdSchema))({});
//       expect(field[ColumnMetaSymbol].type).toBe("string");
//     });
//
//     it("M.FieldOption with branded type derives 'integer' at runtime", () => {
//       const field = Field(M.FieldOption(PostIdSchema))({});
//       // PostIdSchema is S.Int with brand, so type-level: "number", runtime: "integer"
//       expect(field[ColumnMetaSymbol].type).toBe("integer");
//     });
//   });
// });

// ============================================================================
// Section 7: Branded Types
// ============================================================================

/**
 * **Branded Types Derivation**:
 *
 * Branded types preserve the underlying type for type-level derivation.
 * The brand is applied at the Type level, not the Encoded level.
 */
// describe("Branded Types - Column Type Derivation", () => {
//   it("branded string derives 'string'", () => {
//     const field = Field(UserIdSchema)({});
//     expect(field[ColumnMetaSymbol].type).toBe("string");
//   });
//
//   it("branded int derives 'integer' at runtime", () => {
//     const field = Field(PostIdSchema)({});
//     // Branded S.Int: type-level derives "integer" via brand recursion, runtime: "integer"
//     expect(field[ColumnMetaSymbol].type as string).toBe("integer");
//   });
//
//   it("branded UUID derives 'uuid' at runtime", () => {
//     type UUIDId = string & B.Brand<"UUIDId">;
//     const UUIDId = B.nominal<UUIDId>();
//     const UUIDIdSchema = S.UUID.pipe(S.fromBrand(UUIDId));
//     const field = Field(UUIDIdSchema)({});
//     // Branded S.UUID: type-level may not preserve UUID identity, runtime: "uuid"
//     expect(field[ColumnMetaSymbol].type as string).toBe("uuid");
//   });
//
//   it("branded number derives 'number'", () => {
//     type Score = number & B.Brand<"Score">;
//     const Score = B.nominal<Score>();
//     const ScoreSchema = S.Number.pipe(S.fromBrand(Score));
//     const field = Field(ScoreSchema)({});
//     expect(field[ColumnMetaSymbol].type).toBe("number");
//   });
//
//   it("works in Model", () => {
//     class TestModel extends Model<TestModel>("TestModelBranded")({
//       id: Field(UserIdSchema)({ column: { primaryKey: true } }),
//       postId: Field(PostIdSchema)({}),
//     }) {}
//     const table = toDrizzle(TestModel);
//     expect(table.id).toBeDefined();
//     expect(table.postId).toBeDefined();
//   });
// });

// ============================================================================
// Section 8: Template Literals
// ============================================================================

describe("Template Literals - Column Type Derivation", () => {
  it("S.TemplateLiteral with prefix derives 'string'", () => {
    const Prefixed = S.TemplateLiteral(S.Literal("prefix_"), S.String);
    const field = Field(Prefixed)({});
    expect(field[ColumnMetaSymbol].type).toBe("string");
  });

  it("S.TemplateLiteral with suffix derives 'string'", () => {
    const Suffixed = S.TemplateLiteral(S.String, S.Literal("_suffix"));
    const field = Field(Suffixed)({});
    expect(field[ColumnMetaSymbol].type).toBe("string");
  });

  it("S.TemplateLiteral with multiple parts derives 'string'", () => {
    const Complex = S.TemplateLiteral(S.Literal("user_"), S.String, S.Literal("_v1"));
    const field = Field(Complex)({});
    expect(field[ColumnMetaSymbol].type).toBe("string");
  });
});

// ============================================================================
// Section 9: Fallback Types
// ============================================================================

describe("Fallback Types - Column Type Derivation", () => {
  it("S.Unknown derives 'json'", () => {
    const field = Field(S.Unknown)({});
    expect(field[ColumnMetaSymbol].type).toBe("json");
  });

  it("S.Any derives 'json'", () => {
    const field = Field(S.Any)({});
    expect(field[ColumnMetaSymbol].type).toBe("json");
  });

  it("S.Object derives 'json'", () => {
    const field = Field(S.Object)({});

    expect(field[ColumnMetaSymbol].type).toBe("json");
  });
});

// ============================================================================
// Section 10: Explicit Type Override
// ============================================================================

describe("Explicit Type Override", () => {
  it("explicit type overrides derived type - string to uuid", () => {
    const field = Field(S.String)({ column: { type: "uuid" } });
    expect(field[ColumnMetaSymbol].type).toBe("uuid");
  });

  it("explicit type overrides derived type - string to datetime", () => {
    const field = Field(S.String)({ column: { type: "datetime" } });
    expect(field[ColumnMetaSymbol].type).toBe("datetime");
  });

  it("explicit type overrides derived type - number to integer", () => {
    const field = Field(S.Number)({ column: { type: "integer" } });
    expect(field[ColumnMetaSymbol].type).toBe("integer");
  });

  it("validates compatibility when explicit type is provided - valid", () => {
    const validField = Field(S.String)({ column: { type: "uuid" } });
    expectTypeOf(validField).toExtend<DSLField<string, string, never>>();
  });

  it("validates compatibility when explicit type is provided - invalid produces error type", () => {
    // This creates a SchemaColumnError at the type level
    const invalidField = Field(S.Number)({ column: { type: "string" } });
    // At runtime it still works (the error is purely type-level)
    // Use type assertion to access runtime property despite type-level error
    expect((invalidField as unknown as { [ColumnMetaSymbol]: { type: string } })[ColumnMetaSymbol].type).toBe("string");
  });
});

// ============================================================================
// Section 11: Column Options
// ============================================================================

describe("Column Options", () => {
  it("primaryKey option is preserved", () => {
    const field = Field(S.String)({ column: { primaryKey: true } });
    expect(field[ColumnMetaSymbol].primaryKey).toBe(true);
  });

  it("unique option is preserved", () => {
    const field = Field(S.String)({ column: { unique: true } });
    expect(field[ColumnMetaSymbol].unique).toBe(true);
  });

  it("autoIncrement option is preserved", () => {
    const field = Field(S.Int)({ column: { autoIncrement: true } });
    expect(field[ColumnMetaSymbol].autoIncrement).toBe(true);
  });

  it("defaultValue option is preserved - string", () => {
    const field = Field(S.String)({ column: { defaultValue: "default" } });
    expect(field[ColumnMetaSymbol].defaultValue).toBe("default");
  });

  it("defaultValue option is preserved - function", () => {
    const defaultFn = () => "generated";
    const field = Field(S.String)({ column: { defaultValue: defaultFn } });
    expect(field[ColumnMetaSymbol].defaultValue).toBe(defaultFn);
  });

  it("multiple options combined", () => {
    const field = Field(S.Int)({
      column: { primaryKey: true, autoIncrement: true, type: "integer" },
    });
    expect(field[ColumnMetaSymbol].primaryKey).toBe(true);
    expect(field[ColumnMetaSymbol].autoIncrement).toBe(true);
    expect(field[ColumnMetaSymbol].type).toBe("integer");
  });
});

// ============================================================================
// Section 12: Error Cases (runtime derivation errors)
// ============================================================================

describe("Error Cases - Invalid Types", () => {
  it("S.Never throws UnsupportedColumnTypeError", () => {
    expect(() => Field(S.Never)({})).toThrow("Never type cannot be used as a SQL column");
  });

  it("S.Void throws UnsupportedColumnTypeError", () => {
    expect(() => Field(S.Void)({})).toThrow("Void type cannot be used as a SQL column");
  });

  it("S.Undefined throws UnsupportedColumnTypeError", () => {
    expect(() => Field(S.Undefined)({})).toThrow("Undefined type cannot be used as a SQL column alone");
  });

  // it("S.SymbolFromSelf throws UnsupportedColumnTypeError", () => {
  //   // Note: S.Symbol is a transformation from string to symbol, so it derives 'string'.
  //   // S.SymbolFromSelf (if it existed) would throw. For now, we verify S.Symbol works
  //   // because it transforms from string.
  //   const field = Field(S.SymbolFromSelf)({});
  //   // S.Symbol encodes symbols as strings, so it derives 'string'
  //   expect(field[ColumnMetaSymbol].type).toBe("string");
  // });

  it("union containing only null throws UnsupportedColumnTypeError", () => {
    expect(() => Field(S.Null)({})).toThrow("Null literal cannot be used as a SQL column type alone");
  });
});

// ============================================================================
// Section 13: Complete Model Integration
// ============================================================================

describe("Complete Model Integration", () => {
  it("handles all column types in a single Model", () => {
    class CompleteModel extends Model<CompleteModel>("CompleteModel")({
      // Primary key with autoIncrement
      _rowId: Field(M.Generated(S.Int))({ column: { primaryKey: true, autoIncrement: true } }),
      // UUID
      id: Field(M.GeneratedByApp(S.UUID))({ column: { unique: true } }),
      // String
      name: Field(S.String)({}),
      // Integer
      count: Field(S.Int)({}),
      // Number
      score: Field(S.Number)({}),
      // Boolean
      active: Field(S.Boolean)({}),
      // DateTime
      createdAt: Field(M.Generated(S.Date))({}),
      // JSON
      metadata: Field(S.Struct({ key: S.String }))({}),
      // Sensitive
      secret: Field(M.Sensitive(S.String))({}),
      // Optional
      optional: Field(M.FieldOption(S.Number))({}),
    }) {}

    const table = toDrizzle(CompleteModel);

    expect(table).toBeDefined();
    expect(getTableName(table)).toBe("complete_model");
    expect(table._rowId).toBeDefined();
    expect(table.id).toBeDefined();
    expect(table.name).toBeDefined();
    expect(table.count).toBeDefined();
    expect(table.score).toBeDefined();
    expect(table.active).toBeDefined();
    expect(table.createdAt).toBeDefined();
    expect(table.metadata).toBeDefined();
    expect(table.secret).toBeDefined();
    expect(table.optional).toBeDefined();
  });

  it("Model.columns contains correct ColumnDef for all fields", () => {
    class TestModel extends Model<TestModel>("TestModelColumns")({
      id: Field(S.UUID)({ column: { primaryKey: true } }),
      name: Field(S.String)({ column: { unique: true } }),
      count: Field(S.Int)({ column: { type: "integer" } }),
    }) {}

    // Model.columns preserves runtime-derived types
    expect(TestModel.columns.id.type as string).toBe("uuid");
    expect(TestModel.columns.id.primaryKey).toBe(true);
    expect(TestModel.columns.name.type).toBe("string");
    expect(TestModel.columns.name.unique).toBe(true);
    expect(TestModel.columns.count.type).toBe("integer");
  });

  it("Model.primaryKey is correctly derived", () => {
    class TestModel extends Model<TestModel>("TestModelPK")({
      id: Field(S.String)({ column: { primaryKey: true } }),
      name: Field(S.String)({}),
    }) {}

    expect(TestModel.primaryKey).toEqual(["id"]);
  });

  it("Model.tableName is correctly derived from PascalCase", () => {
    class UserProfile extends Model<UserProfile>("UserProfile")({
      id: Field(S.String)({ column: { primaryKey: true } }),
    }) {}

    expect(UserProfile.tableName).toBe("user_profile");
  });

  it("Model.identifier preserves original name", () => {
    class MyModel extends Model<MyModel>("MyModel")({
      id: Field(S.String)({ column: { primaryKey: true } }),
    }) {}

    expect(MyModel.identifier).toBe("MyModel");
  });
});

// ============================================================================
// Section 14: Type-Level Verification with expectTypeOf
// ============================================================================

describe("Type-Level Verification", () => {
  describe("DSLField type inference", () => {
    it("Field(S.String) returns DSLField<string, string, never>", () => {
      const field = Field(S.String)({});
      expectTypeOf(field).toExtend<DSLField<string, string, never>>();
    });

    it("Field(S.Int) returns DSLField<number, number, never>", () => {
      const field = Field(S.Int)({});
      expectTypeOf(field).toExtend<DSLField<number, number, never>>();
    });

    it("Field(S.Boolean) returns DSLField<boolean, boolean, never>", () => {
      const field = Field(S.Boolean)({});
      expectTypeOf(field).toExtend<DSLField<boolean, boolean, never>>();
    });

    it("Field(S.NullOr(S.String)) returns DSLField<string | null, string | null, never>", () => {
      const field = Field(S.NullOr(S.String))({});
      expectTypeOf(field).toExtend<DSLField<string | null, string | null, never>>();
    });

    it("Field(UserIdSchema) returns DSLField<UserId, string, never>", () => {
      const field = Field(UserIdSchema)({});
      expectTypeOf(field).toExtend<DSLField<UserId, string, never>>();
    });
  });

  describe("DSLVariantField type inference", () => {
    it("Field(M.Generated(S.String)) is a DSLVariantField", () => {
      const field = Field(M.Generated(S.String))({});
      // DSLVariantField extends VariantSchema.Field and has ColumnMetaSymbol
      expect(ColumnMetaSymbol in field).toBe(true);
      expect("schemas" in field).toBe(true);
    });

    it("Field(M.Sensitive(S.String)) is a DSLVariantField", () => {
      const field = Field(M.Sensitive(S.String))({});
      expect(ColumnMetaSymbol in field).toBe(true);
      expect("schemas" in field).toBe(true);
    });

    it("Field(M.GeneratedByApp(S.String)) is a DSLVariantField", () => {
      const field = Field(M.GeneratedByApp(S.String))({});
      expect(ColumnMetaSymbol in field).toBe(true);
      expect("schemas" in field).toBe(true);
    });

    it("Field(M.FieldOption(S.String)) is a DSLVariantField", () => {
      const field = Field(M.FieldOption(S.String))({});
      expect(ColumnMetaSymbol in field).toBe(true);
      expect("schemas" in field).toBe(true);
    });
  });
});

// ============================================================================
// Section 15: Enum Types
// ============================================================================

describe("Enum Types - Column Type Derivation", () => {
  it("string enum derives 'string'", () => {
    const Status = {
      Active: "active",
      Inactive: "inactive",
    } as const;
    const StatusSchema = S.Enums(Status);
    const field = Field(StatusSchema)({});
    expect(field[ColumnMetaSymbol].type).toBe("string");
  });

  it("numeric enum derives 'integer' at runtime", () => {
    const Priority = {
      Low: 0,
      Medium: 1,
      High: 2,
    } as const;
    const PrioritySchema = S.Enums(Priority);
    const field = Field(PrioritySchema)({});
    // Numeric enums: type-level may derive "number", runtime correctly derives "integer"
    expect(field[ColumnMetaSymbol].type as string).toBe("integer");
  });
});

// ============================================================================
// Section 16: Optional Schema Patterns
// ============================================================================

describe("Optional Schema Patterns - Column Type Derivation", () => {
  it("S.optional(S.String) creates a property signature, use S.NullOr for nullable column", () => {
    // S.optional creates a property signature for struct fields, not a schema
    // For nullable columns, use S.NullOr instead
    const field = Field(S.NullOr(S.String))({});
    expect(field[ColumnMetaSymbol].type).toBe("string");
  });

  it("S.optionalWith(S.String, { default: () => '' }) type inference", () => {
    // This pattern is used with S.Struct, not standalone Field
    const TestStruct = S.Struct({
      name: S.optionalWith(S.String, { default: () => "" }),
    });
    const field = Field(TestStruct)({});
    expect(field[ColumnMetaSymbol].type).toBe("json");
  });
});

// ============================================================================
// Section 17: BigInt Variations
// ============================================================================

describe("BigInt Variations - Column Type Derivation", () => {
  it("S.BigIntFromSelf derives 'bigint'", () => {
    const field = Field(S.BigIntFromSelf)({});
    expect(field[ColumnMetaSymbol].type).toBe("bigint");
  });

  it("S.BigInt (transformation) derives 'bigint'", () => {
    const field = Field(S.BigInt)({});
    // Direct S.BigInt: type-level correctly derives "bigint"
    expect(field[ColumnMetaSymbol].type).toBe("bigint");
  });

  it("M.Generated(S.BigInt) derives 'bigint' at runtime", () => {
    const field = Field(M.Generated(S.BigInt))({});
    // Variant wrappers lose schema identity at type-level, runtime correctly derives
    expect(field[ColumnMetaSymbol].type as string).toBe("bigint");
  });
});

// ============================================================================
// Section 18: Edge Cases
// ============================================================================

describe("Edge Cases", () => {
  it("empty config object defaults correctly", () => {
    const field = Field(S.String)({});
    expect(field[ColumnMetaSymbol].type).toBe("string");
    expect(field[ColumnMetaSymbol].primaryKey).toBe(false);
    expect(field[ColumnMetaSymbol].unique).toBe(false);
    expect(field[ColumnMetaSymbol].autoIncrement).toBe(false);
  });

  it("no config argument defaults correctly", () => {
    const field = Field(S.String)();
    expect(field[ColumnMetaSymbol].type).toBe("string");
  });

  it("deeply nested NullOr works", () => {
    const DeepNullable = S.NullOr(S.NullOr(S.String));
    const field = Field(DeepNullable)({});
    expect(field[ColumnMetaSymbol].type).toBe("string");
  });

  it("array of nullable strings derives json", () => {
    const NullableStrings = S.Array(S.NullOr(S.String));
    const field = Field(NullableStrings)({});
    expect(field[ColumnMetaSymbol].type).toBe("json");
  });

  it("struct with all nullable fields derives json", () => {
    const NullableStruct = S.Struct({
      a: S.NullOr(S.String),
      b: S.NullOr(S.Number),
    });
    const field = Field(NullableStruct)({});
    expect(field[ColumnMetaSymbol].type).toBe("json");
  });
});
