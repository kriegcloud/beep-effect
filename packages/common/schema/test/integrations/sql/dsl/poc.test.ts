import { describe, expect, expectTypeOf, it } from "bun:test";
import * as BSL from "@beep/schema/integrations/sql/dsl";
import { ColumnMetaSymbol, Field, Model, toDrizzle } from "@beep/schema/integrations/sql/dsl";
import type { ColumnDef } from "@beep/schema/integrations/sql/dsl/types";
import * as drizzle from "drizzle-orm";
import { getTableName } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import type * as Brand from "effect/Brand";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";

describe("DSL.Model POC", () => {
  describe("Field", () => {
    it("returns a valid Effect Schema", () => {
      const field = Field(S.String, { column: { type: "string" } });
      expect(S.isSchema(field)).toBe(true);
    });

    it("attaches column metadata via annotation", () => {
      const field = Field(S.String, { column: { type: "string", unique: true } });
      const meta = F.pipe(
        field.ast,
        AST.getAnnotation<ColumnDef>(ColumnMetaSymbol),
        O.getOrElse(
          (): ColumnDef => ({
            type: "string",
            primaryKey: false,
            unique: false,
            nullable: false,
            autoIncrement: false,
          })
        )
      );
      expect(meta.type).toBe("string");
      expect(meta.unique).toBe(true);
    });

    it("attaches autoIncrement for serial columns", () => {
      const field = Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } });
      const meta = F.pipe(
        field.ast,
        AST.getAnnotation<ColumnDef>(ColumnMetaSymbol),
        O.getOrElse(() => ({
          type: "string",
          primaryKey: false,
          unique: false,
          nullable: false,
          autoIncrement: false,
        }))
      );
      expect(meta.type).toBe("integer");
      expect(meta.primaryKey).toBe(true);
      expect(meta.autoIncrement).toBe(true);
    });
  });

  describe("Model", () => {
    it("is a valid Effect Schema", () => {
      class TestModel extends Model<TestModel>("Test")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      expect(S.isSchema(TestModel)).toBe(true);
    });

    it("exposes tableName as snake_case of identifier", () => {
      class UserProfile extends Model<UserProfile>("UserProfile")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
      }) {}

      expect(UserProfile.tableName).toBe("user_profile");
    });

    it("exposes identifier unchanged", () => {
      class TestModel extends Model<TestModel>("Test")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
      }) {}

      expect(TestModel.identifier).toBe("Test");
    });

    it("derives primaryKey from fields with primaryKey: true", () => {
      class TestModel extends Model<TestModel>("Test")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      expect(TestModel.primaryKey).toEqual(["_rowId"]);
    });

    it("exposes columns record with ColumnDef for each field", () => {
      class TestModel extends Model<TestModel>("Test")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        email: Field(S.String, { column: { type: "string", unique: true } }),
      }) {}

      expect(TestModel.columns._rowId.type).toBe("integer");
      expect(TestModel.columns._rowId.primaryKey).toBe(true);
      expect(TestModel.columns._rowId.autoIncrement).toBe(true);
      expect(TestModel.columns.id.type).toBe("uuid");
      expect(TestModel.columns.id.unique).toBe(true);
      expect(TestModel.columns.email.type).toBe("string");
      expect(TestModel.columns.email.unique).toBe(true);
    });

    it("S.decodeSync works with Model", () => {
      class TestModel extends Model<TestModel>("Test")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      const decode = S.decodeSync(TestModel);
      const result = decode({ id: "test-id", _rowId: 1, name: "Test Name" });

      expect(result.id).toBe("test-id");
      expect(result._rowId).toBe(1);
      expect(result.name).toBe("Test Name");
    });

    it("S.decodeSync fails on invalid input", () => {
      class TestModel extends Model<TestModel>("Test")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
      }) {}

      const decode = S.decodeSync(TestModel);
      expect(() => decode({ id: 123 as unknown as string, _rowId: "not-a-number" as unknown as number })).toThrow();
    });

    it("supports class extension pattern like VariantSchema.Class", () => {
      // This is the preferred usage pattern
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        email: Field(S.String, { column: { type: "string", unique: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Verify it's a valid schema
      expect(S.isSchema(User)).toBe(true);

      // Verify static properties
      expect(User.tableName).toBe("user");
      expect(User.identifier).toBe("User");
      expect(User.primaryKey).toEqual(["_rowId"]);

      // Verify columns
      expect(User.columns._rowId.primaryKey).toBe(true);
      expect(User.columns._rowId.autoIncrement).toBe(true);
      expect(User.columns.email.unique).toBe(true);

      // Verify decoding works
      const user = S.decodeSync(User)({
        id: "user-123",
        _rowId: 1,
        email: "test@example.com",
        name: "Test User",
      });
      expect(user.id).toBe("user-123");
      expect(user.email).toBe("test@example.com");
    });
  });

  describe("toDrizzle", () => {
    it("produces a Drizzle table with correct name", () => {
      class TestModel extends Model<TestModel>("Test")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
      }) {}

      const table = toDrizzle(TestModel);
      const user = S.decodeSync(TestModel)({
        id: "user-123",
        _rowId: 1,
      });
      expect(user.id).toBe("user-123");
      expect(table).toBeDefined();
      // Use Drizzle's getTableName utility to access the table name
      expect(getTableName(table)).toBe("test");
    });

    it("produces typed columns via .$type<T>()", () => {
      // Define a branded ID schema
      const UserId = S.String.pipe(S.brand("UserId"));
      type UserId = S.Schema.Type<typeof UserId>;

      class User extends Model<User>("User")({
        id: Field(UserId, { column: { type: "uuid", primaryKey: true } }),
        email: Field(S.String, { column: { type: "string", unique: true } }),
        age: Field(S.Int, { column: { type: "integer" } }),
        isActive: Field(S.Boolean, { column: { type: "boolean" } }),
        metadata: Field(S.Struct({ foo: S.String }), { column: { type: "json" } }),
      }) {}

      const table = toDrizzle(User);

      // Table should be defined with all columns
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.email).toBeDefined();
      expect(table.age).toBeDefined();
      expect(table.isActive).toBeDefined();
      expect(table.metadata).toBeDefined();
      expect(getTableName(table)).toBe("user");

      // Type-level verification: The columns are typed via .$type<T>()
      // At runtime, .$type<T>() is a no-op that returns `this`, but at the type level
      // it sets the column's TypeScript type to T
      // We verify this by checking the column objects exist (runtime behavior is unchanged)
    });

    it("exposes _fields on Model for type extraction", () => {
      class TestModel extends Model<TestModel>("Test")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // _fields should be defined for toDrizzle to extract encoded types
      expect(TestModel._fields).toBeDefined();
      expect(TestModel._fields.id).toBeDefined();
      expect(TestModel._fields.name).toBeDefined();
    });
  });

  describe("Model Variants", () => {
    it("exposes all 6 variant schema accessors", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        email: Field(S.String, { column: { type: "string", unique: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // All 6 variants should be defined as schemas
      expect(S.isSchema(User.select)).toBe(true);
      expect(S.isSchema(User.insert)).toBe(true);
      expect(S.isSchema(User.update)).toBe(true);
      expect(S.isSchema(User.json)).toBe(true);
      expect(S.isSchema(User.jsonCreate)).toBe(true);
      expect(S.isSchema(User.jsonUpdate)).toBe(true);
    });

    it("variant schemas have proper identifiers", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        _rowId: Field(S.Int, { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
      }) {}

      // Check that variant schemas have correct identifiers using AST helpers
      const getIdentifier = (schema: S.Schema.All) =>
        F.pipe(
          AST.getIdentifierAnnotation(schema.ast),
          O.getOrElse(() => "")
        );

      expect(getIdentifier(User.select)).toBe("User.select");
      expect(getIdentifier(User.insert)).toBe("User.insert");
      expect(getIdentifier(User.update)).toBe("User.update");
      expect(getIdentifier(User.json)).toBe("User.json");
      expect(getIdentifier(User.jsonCreate)).toBe("User.jsonCreate");
      expect(getIdentifier(User.jsonUpdate)).toBe("User.jsonUpdate");
    });

    it("for plain DSL fields, all variants include all fields", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", unique: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Plain fields should appear in all variants
      const selectData = { id: "user-123", name: "Alice" };
      const insertData = { id: "user-456", name: "Bob" };

      // decode select variant
      const selectDecoded = S.decodeSync(User.select)(selectData);
      expect(selectDecoded.id).toBe("user-123");
      expect(selectDecoded.name).toBe("Alice");

      // decode insert variant
      const insertDecoded = S.decodeSync(User.insert)(insertData);
      expect(insertDecoded.id).toBe("user-456");
      expect(insertDecoded.name).toBe("Bob");

      // json variant
      const jsonDecoded = S.decodeSync(User.json)(selectData);
      expect(jsonDecoded.id).toBe("user-123");
    });

    it("variant schemas are memoized (same reference on multiple accesses)", () => {
      // Yes.... BSL = "Beep Specific Language"
      class User extends BSL.Model<User>("User")({
        id: BSL.Field(S.String.pipe(S.brand("UserId")), { column: { type: "uuid" } }),
      }) {}

      // Access the same variant multiple times
      const select1 = User.select;
      const select2 = User.select;

      const userOpt = S.decodeOption(User)({
        id: "user-123",
      });
      const table = BSL.toDrizzle(User);
      // Should be the same reference (memoized by VariantSchema)
      expect(drizzle.is(table, pg.PgTable)).toBe(true);
      expect(drizzle.is(table.id, pg.PgUUID)).toBe(true);

      expect(O.isSome(userOpt)).toBe(true);
      expect(select1).toBe(select2);
      if (O.isSome(userOpt)) {
        expectTypeOf(userOpt.value.id).toExtend<Brand.Branded<string, "UserId">>();
      }
    });
  });
});
