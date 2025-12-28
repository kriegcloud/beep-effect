/**
 * @fileoverview Test suite for deriveColumnType and deriveSchemaColumnType.
 *
 * Tests all derivation cases for mapping Effect Schema ASTs to SQL column types:
 * - Primitive keywords (String, Number, Boolean, BigInt)
 * - Refinements with SchemaId (Int, UUID)
 * - Transformations (Date, DateFromString, BigInt)
 * - Structural types (Struct, Array, Record, Tuple)
 * - Unions (NullOr, string literals, number literals, heterogeneous)
 * - Branded types
 * - Error cases (Never, Void, Symbol)
 * - Edge cases (chained refinements, TemplateLiteral, Unknown, Any, Object)
 * - Circular schemas via S.suspend
 *
 * Also includes type-level derivation tests for DeriveColumnTypeFromEncoded.
 */
import { describe, expect, expectTypeOf, it } from "bun:test";
import { ColumnMetaSymbol, deriveSchemaColumnType, Field } from "@beep/schema/integrations/sql/dsl";
import * as S from "effect/Schema";

describe("deriveColumnType", () => {
  describe("primitive keywords", () => {
    it("derives 'string' for S.String", () => {
      expect(deriveSchemaColumnType(S.String)).toBe("string");
    });

    it("derives 'number' for S.Number", () => {
      expect(deriveSchemaColumnType(S.Number)).toBe("number");
    });

    it("derives 'boolean' for S.Boolean", () => {
      expect(deriveSchemaColumnType(S.Boolean)).toBe("boolean");
    });

    it("derives 'bigint' for S.BigIntFromSelf", () => {
      expect(deriveSchemaColumnType(S.BigIntFromSelf)).toBe("bigint");
    });
  });

  describe("refinements with SchemaId", () => {
    it("derives 'integer' for S.Int", () => {
      expect(deriveSchemaColumnType(S.Int)).toBe("integer");
    });

    it("derives 'uuid' for S.UUID", () => {
      expect(deriveSchemaColumnType(S.UUID)).toBe("uuid");
    });

    it("derives 'uuid' for S.ULID", () => {
      expect(deriveSchemaColumnType(S.ULID)).toBe("uuid");
    });
  });

  describe("transformations", () => {
    it("derives 'datetime' for S.Date", () => {
      expect(deriveSchemaColumnType(S.Date)).toBe("datetime");
    });

    it("derives 'datetime' for S.DateFromString", () => {
      expect(deriveSchemaColumnType(S.DateFromString)).toBe("datetime");
    });

    it("derives 'datetime' for S.DateTimeUtc", () => {
      expect(deriveSchemaColumnType(S.DateTimeUtc)).toBe("datetime");
    });

    it("derives 'bigint' for S.BigInt", () => {
      expect(deriveSchemaColumnType(S.BigInt)).toBe("bigint");
    });
  });

  describe("structural types", () => {
    it("derives 'json' for S.Struct", () => {
      expect(deriveSchemaColumnType(S.Struct({ a: S.String }))).toBe("json");
    });

    it("derives 'json' for S.Array", () => {
      expect(deriveSchemaColumnType(S.Array(S.String))).toBe("json");
    });

    it("derives 'json' for S.Record", () => {
      expect(deriveSchemaColumnType(S.Record({ key: S.String, value: S.Number }))).toBe("json");
    });
  });

  describe("unions", () => {
    it("derives from non-null member in S.NullOr", () => {
      expect(deriveSchemaColumnType(S.NullOr(S.Int))).toBe("integer");
    });

    it("derives 'string' for string literal union", () => {
      expect(deriveSchemaColumnType(S.Literal("a", "b", "c"))).toBe("string");
    });

    it("derives 'integer' for number literal union", () => {
      expect(deriveSchemaColumnType(S.Literal(1, 2, 3))).toBe("integer");
    });

    it("derives 'json' for heterogeneous union", () => {
      const Mixed = S.Union(S.String, S.Number);
      expect(deriveSchemaColumnType(Mixed)).toBe("json");
    });

    it("derives correctly for nullable uuid", () => {
      expect(deriveSchemaColumnType(S.NullOr(S.UUID))).toBe("uuid");
    });
  });

  describe("branded types", () => {
    it("unwraps to underlying string type", () => {
      const UserId = S.String.pipe(S.brand("UserId"));
      expect(deriveSchemaColumnType(UserId)).toBe("string");
    });

    it("unwraps to underlying int type", () => {
      const PostId = S.Int.pipe(S.brand("PostId"));
      expect(deriveSchemaColumnType(PostId)).toBe("integer");
    });
  });

  describe("error cases", () => {
    it("throws UnsupportedColumnTypeError for S.Never", () => {
      expect(() => deriveSchemaColumnType(S.Never)).toThrow("Never type cannot be used as a SQL column");
    });

    it("throws UnsupportedColumnTypeError for S.Void", () => {
      expect(() => deriveSchemaColumnType(S.Void)).toThrow("Void type cannot be used as a SQL column");
    });

    it("throws UnsupportedColumnTypeError for S.Symbol", () => {
      expect(() => deriveSchemaColumnType(S.SymbolFromSelf)).toThrow("Symbol type cannot be stored in SQL");
    });
  });

  describe("edge cases", () => {
    it("handles chained refinements", () => {
      const PositiveInt = S.Int.pipe(S.positive());
      expect(deriveSchemaColumnType(PositiveInt)).toBe("integer");
    });

    it("handles TemplateLiteral", () => {
      const Prefixed = S.TemplateLiteral(S.Literal("prefix_"), S.String);
      expect(deriveSchemaColumnType(Prefixed)).toBe("string");
    });

    it("handles S.Unknown as json", () => {
      expect(deriveSchemaColumnType(S.Unknown)).toBe("json");
    });

    it("handles S.Any as json", () => {
      expect(deriveSchemaColumnType(S.Any)).toBe("json");
    });

    it("handles S.Object as json", () => {
      expect(deriveSchemaColumnType(S.Object)).toBe("json");
    });
  });

  describe("circular schemas via S.suspend", () => {
    it("handles circular schemas without infinite loop", () => {
      interface Node {
        value: string;
        next: Node | null;
      }
      const Node: S.Schema<Node> = S.Struct({
        value: S.String,
        next: S.NullOr(S.suspend(() => Node)),
      });
      // Struct always derives to "json"
      expect(deriveSchemaColumnType(Node)).toBe("json");
    });
  });

  describe("tuple types", () => {
    it("derives 'json' for tuples", () => {
      const Tuple = S.Tuple(S.String, S.Number);
      expect(deriveSchemaColumnType(Tuple)).toBe("json");
    });
  });
});

// ============================================================================
// Type-Level Column Type Derivation Tests (DeriveColumnTypeFromEncoded)
// ============================================================================

/**
 * **Type-Level Column Type Derivation Tests**
 *
 * These tests verify that `Field(schema)({})` returns a `DSLField` with
 * a narrowed column type based on the schema's class identity.
 *
 * **Schema-Level Derivation**: Uses class identity to precisely infer column types:
 * - `S.Int` → `"integer"` (distinguished from `S.Number`)
 * - `S.UUID` → `"uuid"` (distinguished from `S.String`)
 * - `S.Date` → `"datetime"`
 * - `S.DateFromString` → `"datetime"`
 * - `S.BigInt` → `"bigint"` (from string)
 */
describe("Type-Level Column Type Derivation (DeriveColumnTypeFromSchema)", () => {
  describe("Primitives - Type narrowing works", () => {
    it("S.String narrows to 'string'", () => {
      const field = Field(S.String)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"string">();
    });

    it("S.Number narrows to 'number'", () => {
      const field = Field(S.Number)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"number">();
    });

    it("S.Boolean narrows to 'boolean'", () => {
      const field = Field(S.Boolean)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"boolean">();
    });

    it("S.BigIntFromSelf narrows to 'bigint'", () => {
      const field = Field(S.BigIntFromSelf)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"bigint">();
    });
  });

  describe("Structural Types - Narrow to 'json'", () => {
    it("S.Struct narrows to 'json'", () => {
      const field = Field(S.Struct({ name: S.String }))({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"json">();
    });

    it("S.Array narrows to 'json'", () => {
      const field = Field(S.Array(S.String))({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"json">();
    });

    it("S.Object narrows to 'json'", () => {
      const field = Field(S.Object)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"json">();
    });
  });

  describe("Any/Unknown - Narrow to 'json'", () => {
    it("S.Any narrows to 'json'", () => {
      const field = Field(S.Any)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"json">();
    });

    it("S.Unknown narrows to 'json'", () => {
      const field = Field(S.Unknown)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"json">();
    });
  });

  describe("Nullable Wrappers - Strip null and derive base type", () => {
    it("S.NullOr(S.String) narrows to 'string'", () => {
      const field = Field(S.NullOr(S.String))({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"string">();
    });

    it("S.NullOr(S.Number) narrows to 'number'", () => {
      const field = Field(S.NullOr(S.Number))({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"number">();
    });

    it("S.NullOr(S.Int) narrows to 'integer'", () => {
      const field = Field(S.NullOr(S.Int))({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"integer">();
    });

    it("S.NullOr(S.UUID) narrows to 'uuid'", () => {
      const field = Field(S.NullOr(S.UUID))({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"uuid">();
    });
  });

  describe("Refined Types - Precise type derivation via schema identity", () => {
    it("S.Int narrows to 'integer' (not 'number')", () => {
      const field = Field(S.Int)({});
      // Schema-level derivation correctly identifies S.Int and returns "integer"
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"integer">();
    });

    it("S.UUID narrows to 'uuid' (not 'string')", () => {
      const field = Field(S.UUID)({});
      // Schema-level derivation correctly identifies S.UUID and returns "uuid"
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"uuid">();
    });

    it("S.ULID narrows to 'uuid' (not 'string')", () => {
      const field = Field(S.ULID)({});
      // Schema-level derivation correctly identifies S.ULID and returns "uuid"
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"uuid">();
    });

    it("S.Date narrows to 'datetime' (not 'string')", () => {
      const field = Field(S.Date)({});
      // Schema-level derivation correctly identifies S.Date and returns "datetime"
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"datetime">();
    });

    it("S.DateFromString narrows to 'datetime'", () => {
      const field = Field(S.DateFromString)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"datetime">();
    });

    it("S.DateTimeUtc narrows to 'datetime'", () => {
      const field = Field(S.DateTimeUtc)({});
      // Schema-level derivation correctly identifies S.DateTimeUtc and returns "datetime"
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"datetime">();
    });

    it("S.BigInt narrows to 'bigint'", () => {
      const field = Field(S.BigInt)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"bigint">();
    });
  });

  describe("Explicit Type Override - Takes precedence", () => {
    it("explicit 'integer' matches derived 'integer'", () => {
      const field = Field(S.Int)({ column: { type: "integer" } });
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"integer">();
    });

    it("explicit 'uuid' for S.String narrows correctly", () => {
      const field = Field(S.String)({ column: { type: "uuid" } });
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"uuid">();
    });

    it("explicit 'datetime' matches derived 'datetime'", () => {
      const field = Field(S.Date)({ column: { type: "datetime" } });
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"datetime">();
    });
  });
});

// ============================================================================
// Type-Runtime Parity Test Suite
// ============================================================================

/**
 * This test suite verifies that type-level and runtime derivations match
 * for all target schemas. Type assertions verify compile-time behavior,
 * runtime assertions verify runtime behavior, and the tests ensure they agree.
 */
describe("Type-Runtime Parity", () => {
  const schemas = [
    { name: "S.Int", schema: S.Int, expected: "integer" as const },
    { name: "S.UUID", schema: S.UUID, expected: "uuid" as const },
    { name: "S.ULID", schema: S.ULID, expected: "uuid" as const },
    { name: "S.Date", schema: S.Date, expected: "datetime" as const },
    { name: "S.DateFromString", schema: S.DateFromString, expected: "datetime" as const },
    { name: "S.DateTimeUtc", schema: S.DateTimeUtc, expected: "datetime" as const },
    { name: "S.BigInt", schema: S.BigInt, expected: "bigint" as const },
    { name: "S.Any", schema: S.Any, expected: "json" as const },
    { name: "S.Unknown", schema: S.Unknown, expected: "json" as const },
    { name: "S.String", schema: S.String, expected: "string" as const },
    { name: "S.Number", schema: S.Number, expected: "number" as const },
    { name: "S.Boolean", schema: S.Boolean, expected: "boolean" as const },
  ] as const;

  for (const { name, schema, expected } of schemas) {
    it(`runtime derives '${expected}' for ${name}`, () => {
      expect(deriveSchemaColumnType(schema)).toBe(expected);
    });
  }

  describe("type-level matches runtime for all target schemas", () => {
    it("S.Int: type and runtime both derive 'integer'", () => {
      const field = Field(S.Int)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"integer">();
      expect(deriveSchemaColumnType(S.Int)).toBe("integer");
    });

    it("S.UUID: type and runtime both derive 'uuid'", () => {
      const field = Field(S.UUID)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"uuid">();
      expect(deriveSchemaColumnType(S.UUID)).toBe("uuid");
    });

    it("S.ULID: type and runtime both derive 'uuid'", () => {
      const field = Field(S.ULID)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"uuid">();
      expect(deriveSchemaColumnType(S.ULID)).toBe("uuid");
    });

    it("S.Date: type and runtime both derive 'datetime'", () => {
      const field = Field(S.Date)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"datetime">();
      expect(deriveSchemaColumnType(S.Date)).toBe("datetime");
    });

    it("S.DateTimeUtc: type and runtime both derive 'datetime'", () => {
      const field = Field(S.DateTimeUtc)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"datetime">();
      expect(deriveSchemaColumnType(S.DateTimeUtc)).toBe("datetime");
    });

    it("S.BigInt: type and runtime both derive 'bigint'", () => {
      const field = Field(S.BigInt)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"bigint">();
      expect(deriveSchemaColumnType(S.BigInt)).toBe("bigint");
    });

    it("S.Any: type and runtime both derive 'json'", () => {
      const field = Field(S.Any)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"json">();
      expect(deriveSchemaColumnType(S.Any)).toBe("json");
    });

    it("S.Unknown: type and runtime both derive 'json'", () => {
      const field = Field(S.Unknown)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"json">();
      expect(deriveSchemaColumnType(S.Unknown)).toBe("json");
    });

    it("S.String: type and runtime both derive 'string'", () => {
      const field = Field(S.String)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"string">();
      expect(deriveSchemaColumnType(S.String)).toBe("string");
    });

    it("S.Number: type and runtime both derive 'number'", () => {
      const field = Field(S.Number)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"number">();
      expect(deriveSchemaColumnType(S.Number)).toBe("number");
    });

    it("S.Boolean: type and runtime both derive 'boolean'", () => {
      const field = Field(S.Boolean)({});
      expectTypeOf(field[ColumnMetaSymbol].type).toEqualTypeOf<"boolean">();
      expect(deriveSchemaColumnType(S.Boolean)).toBe("boolean");
    });
  });
});
