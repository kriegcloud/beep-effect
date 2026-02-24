/**
 * @fileoverview Test suite for SQL DSL Combinators.
 *
 * Tests the pipe-friendly combinator API for building column definitions.
 */
import { describe, expect, expectTypeOf, it } from "bun:test";
import type { DSLField, SchemaColumnError } from "@beep/schema/integrations/sql/dsl";
import { Model, toDrizzle } from "@beep/schema/integrations/sql/dsl";
import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
import { ColumnMetaSymbol } from "@beep/schema/integrations/sql/dsl/types";
import { getTableName } from "drizzle-orm";
import * as B from "effect/Brand";
import * as S from "effect/Schema";

// ============================================================================
// Type Setters
// ============================================================================

describe("DSL Combinators - Type Setters", () => {
  describe("uuid", () => {
    it("sets column type to uuid", () => {
      const field = S.String.pipe(DSL.uuid);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef).toBeDefined();
      expect(columnDef.type).toBe("uuid");
      expectTypeOf(field).toExtend<DSLField<string, string, never>>();
    });

    it("validates schema/column compatibility", () => {
      // ✅ Valid - string compatible with uuid
      const validField = S.String.pipe(DSL.uuid);
      expectTypeOf(validField).toExtend<DSLField<string, string, never>>();

      // ❌ Invalid - number incompatible with uuid
      const invalidField = S.Int.pipe(DSL.uuid);
      expectTypeOf(invalidField).toExtend<SchemaColumnError<number, "uuid">>();
    });
  });

  describe("string", () => {
    it("sets column type to string", () => {
      const field = S.String.pipe(DSL.string);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef).toBeDefined();
      expect(columnDef.type).toBe("string");
    });
  });

  describe("integer", () => {
    it("sets column type to integer", () => {
      const field = S.Int.pipe(DSL.integer);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef).toBeDefined();
      expect(columnDef.type).toBe("integer");
    });

    it("validates schema/column compatibility", () => {
      // ✅ Valid
      const validField = S.Int.pipe(DSL.integer);
      expectTypeOf(validField).toExtend<DSLField<number, number, never>>();

      // ❌ Invalid - string incompatible with integer
      const invalidField = S.String.pipe(DSL.integer);
      expectTypeOf(invalidField).toExtend<SchemaColumnError<string, "integer">>();
    });
  });

  describe("number", () => {
    it("sets column type to number", () => {
      const field = S.Number.pipe(DSL.number);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef).toBeDefined();
      expect(columnDef.type).toBe("number");
    });
  });

  describe("boolean", () => {
    it("sets column type to boolean", () => {
      const field = S.Boolean.pipe(DSL.boolean);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef).toBeDefined();
      expect(columnDef.type).toBe("boolean");
    });

    it("validates schema/column compatibility", () => {
      // ✅ Valid
      const validField = S.Boolean.pipe(DSL.boolean);
      expectTypeOf(validField).toExtend<DSLField<boolean, boolean, never>>();

      // ❌ Invalid - string incompatible with boolean
      const invalidField = S.String.pipe(DSL.boolean);
      expectTypeOf(invalidField).toExtend<SchemaColumnError<string, "boolean">>();
    });
  });

  describe("json", () => {
    it("sets column type to json for struct", () => {
      const MetadataSchema = S.Struct({
        tags: S.Array(S.String),
        score: S.Number,
      });

      const field = MetadataSchema.pipe(DSL.json);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef).toBeDefined();
      expect(columnDef.type).toBe("json");
    });

    it("sets column type to json for array", () => {
      const field = S.Array(S.String).pipe(DSL.json);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef).toBeDefined();
      expect(columnDef.type).toBe("json");
    });
  });

  describe("datetime", () => {
    it("sets column type to datetime", () => {
      const field = S.String.pipe(DSL.datetime);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef).toBeDefined();
      expect(columnDef.type).toBe("datetime");
    });
  });
});

// ============================================================================
// Constraint Setters
// ============================================================================

describe("DSL Combinators - Constraint Setters", () => {
  describe("primaryKey", () => {
    it("sets primaryKey flag to true", () => {
      const field = S.String.pipe(DSL.uuid, DSL.primaryKey);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef.primaryKey).toBe(true);
      expect(columnDef.type).toBe("uuid"); // Type preserved
    });

    it("works without type setter (uses default type)", () => {
      const field = S.String.pipe(DSL.primaryKey);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef.primaryKey).toBe(true);
      expect(columnDef.type).toBe("string"); // Default type
    });
  });

  describe("unique", () => {
    it("sets unique flag to true", () => {
      const field = S.String.pipe(DSL.string, DSL.unique);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef.unique).toBe(true);
    });
  });

  describe("autoIncrement", () => {
    it("sets autoIncrement flag to true", () => {
      const field = S.Int.pipe(DSL.integer, DSL.autoIncrement);
      const columnDef = (field as any)[ColumnMetaSymbol];

      expect(columnDef.autoIncrement).toBe(true);
    });
  });
});

// ============================================================================
// Default Value Setter
// ============================================================================

describe("DSL Combinators - Default Value", () => {
  it("sets static default value", () => {
    const field = S.String.pipe(DSL.string, DSL.defaultValue("'active'"));
    const columnDef = (field as any)[ColumnMetaSymbol];

    expect(columnDef.defaultValue).toBe("'active'");
  });

  it("sets function default value", () => {
    const field = S.String.pipe(DSL.datetime, DSL.defaultValue("now()"));
    const columnDef = (field as any)[ColumnMetaSymbol];

    expect(columnDef.defaultValue).toBe("now()");
  });
});

// ============================================================================
// Combinator Composition
// ============================================================================

describe("DSL Combinators - Composition", () => {
  it("chains multiple combinators correctly", () => {
    const field = S.String.pipe(DSL.uuid, DSL.primaryKey, DSL.unique);
    const columnDef = (field as any)[ColumnMetaSymbol];

    expect(columnDef.type).toBe("uuid");
    expect(columnDef.primaryKey).toBe(true);
    expect(columnDef.unique).toBe(true);
    // Note: nullable is no longer stored - it's derived from schema AST
    expect(columnDef.autoIncrement).toBe(false);
  });

  it("preserves previous combinators when adding new ones", () => {
    const step1 = S.String.pipe(DSL.uuid);
    const step2 = step1.pipe(DSL.primaryKey);
    const step3 = step2.pipe(DSL.unique);

    const def1 = (step1 as any)[ColumnMetaSymbol];
    const def2 = (step2 as any)[ColumnMetaSymbol];
    const def3 = (step3 as any)[ColumnMetaSymbol];

    // Step 1: only type set
    expect(def1.type).toBe("uuid");
    expect(def1.primaryKey).toBe(false);

    // Step 2: type + primaryKey
    expect(def2.type).toBe("uuid");
    expect(def2.primaryKey).toBe(true);
    expect(def2.unique).toBe(false);

    // Step 3: type + primaryKey + unique
    expect(def3.type).toBe("uuid");
    expect(def3.primaryKey).toBe(true);
    expect(def3.unique).toBe(true);
  });

  it("allows changing type after constraints (last type wins)", () => {
    const field = S.String.pipe(DSL.uuid, DSL.primaryKey, DSL.string);
    const columnDef = (field as any)[ColumnMetaSymbol];

    expect(columnDef.type).toBe("string"); // Type changed
    expect(columnDef.primaryKey).toBe(true); // Constraint preserved
  });

  it("merges all column metadata correctly", () => {
    const field = S.String.pipe(DSL.string, DSL.primaryKey, DSL.unique, DSL.defaultValue("'test'"));
    const columnDef = (field as any)[ColumnMetaSymbol];

    // Note: nullable is no longer stored - it's derived from schema AST
    expect(columnDef).toMatchObject({
      type: "string",
      primaryKey: true,
      unique: true,
      autoIncrement: false,
      defaultValue: "'test'",
    });
  });
});

// ============================================================================
// Integration with Model
// ============================================================================

describe("DSL Combinators - Model Integration", () => {
  it("works with Model definition", () => {
    class User extends Model<User>("User")({
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      email: S.String.pipe(DSL.string, DSL.unique),
      age: S.Int.pipe(DSL.integer),
      active: S.Boolean.pipe(DSL.boolean),
    }) {}

    expect(User.columns).toBeDefined();
    expect(User.columns.id.type).toBe("uuid");
    expect(User.columns.id.primaryKey).toBe(true);
    expect(User.columns.email.unique).toBe(true);
    expect(User.columns.age.type).toBe("integer");
    expect(User.columns.active.type).toBe("boolean");
  });

  it("generates correct Drizzle table", () => {
    class Post extends Model<Post>("Post")({
      id: S.Int.pipe(DSL.integer, DSL.primaryKey, DSL.autoIncrement),
      title: S.String.pipe(DSL.string),
      content: S.String.pipe(DSL.string),
    }) {}

    const table = toDrizzle(Post);

    expect(table).toBeDefined();
    expect(table.id).toBeDefined();
    expect(table.title).toBeDefined();
    expect(table.content).toBeDefined();
    expect(getTableName(table)).toBe("post");
  });

  it("handles nullable columns - nullability derived from schema", () => {
    // Nullability is automatically derived from S.NullOr
    // The DSL.nullable combinator is deprecated and a no-op
    class Comment extends Model<Comment>("Comment")({
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      body: S.NullOr(S.String).pipe(DSL.string),
    }) {}

    // nullable is no longer stored in ColumnDef - it's derived from schema AST
    expect(Comment.columns.body.type).toBe("string");

    const table = toDrizzle(Comment);
    expect(table).toBeDefined();
    expect(table.body).toBeDefined();
  });

  it("handles JSON columns", () => {
    const MetadataSchema = S.Struct({
      tags: S.Array(S.String),
      level: S.Number,
    });

    class Document extends Model<Document>("Document")({
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      metadata: MetadataSchema.pipe(DSL.json),
    }) {}

    expect(Document.columns.metadata.type).toBe("json");

    const table = toDrizzle(Document);

    expect(table).toBeDefined();
    expect(table.metadata).toBeDefined();
  });

  it("handles default values", () => {
    class Session extends Model<Session>("Session")({
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      status: S.String.pipe(DSL.string, DSL.defaultValue("'active'")),
      createdAt: S.String.pipe(DSL.datetime, DSL.defaultValue("now()")),
    }) {}

    expect(Session.columns.status.defaultValue).toBe("'active'");
    expect(Session.columns.createdAt.defaultValue).toBe("now()");
  });
});

// ============================================================================
// Effect Schema Integration
// ============================================================================

describe("DSL Combinators - Effect Schema Integration", () => {
  it("composes with Effect Schema brand combinator", () => {
    type UserId = string & B.Brand<"UserId">;
    const UserId = B.nominal<UserId>();
    const UserIdSchema = S.String.pipe(S.fromBrand(UserId));

    const field = UserIdSchema.pipe(DSL.uuid, DSL.primaryKey);
    const columnDef = (field as any)[ColumnMetaSymbol];

    expect(columnDef.type).toBe("uuid");
    expect(columnDef.primaryKey).toBe(true);

    class UserEntity extends Model<UserEntity>("UserEntity")({
      id: UserIdSchema.pipe(DSL.uuid, DSL.primaryKey),
      name: S.String.pipe(DSL.string),
    }) {}

    const table = toDrizzle(UserEntity);
    expect(table).toBeDefined();
    expect(table.id).toBeDefined();
  });

  it("works with nullable schemas - nullability derived from AST", () => {
    // DSL.nullable is deprecated - nullability is derived from S.NullOr
    const field = S.NullOr(S.String).pipe(DSL.string);
    const columnDef = (field as any)[ColumnMetaSymbol];

    // nullable is no longer stored - it's derived from schema AST
    expect(columnDef.type).toBe("string");

    // Type inference should handle nullable correctly
    expectTypeOf(field).toExtend<DSLField<string | null, string | null, never>>();
  });

  it("composes with other Effect Schema combinators", () => {
    const EmailSchema = S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/), S.maxLength(255));

    const field = EmailSchema.pipe(DSL.string, DSL.unique);
    const columnDef = (field as any)[ColumnMetaSymbol];

    expect(columnDef.type).toBe("string");
    expect(columnDef.unique).toBe(true);

    class EmailUser extends Model<EmailUser>("EmailUser")({
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      email: EmailSchema.pipe(DSL.string, DSL.unique),
    }) {}

    const table = toDrizzle(EmailUser);
    expect(table).toBeDefined();
  });
});

// ============================================================================
// Edge Cases and Defaults
// ============================================================================

describe("DSL Combinators - Edge Cases", () => {
  it("uses default column type when no type setter used", () => {
    const field = S.String.pipe(DSL.primaryKey);
    const columnDef = (field as any)[ColumnMetaSymbol];

    expect(columnDef.type).toBe("string"); // Default type
    expect(columnDef.primaryKey).toBe(true);
  });

  it("all boolean flags default to false", () => {
    const field = S.String.pipe(DSL.uuid);
    const columnDef = (field as any)[ColumnMetaSymbol];

    expect(columnDef.primaryKey).toBe(false);
    expect(columnDef.unique).toBe(false);
    // Note: nullable is no longer stored - it's derived from schema AST
    expect(columnDef.autoIncrement).toBe(false);
  });

  it("defaultValue defaults to undefined", () => {
    const field = S.String.pipe(DSL.uuid);
    const columnDef = (field as any)[ColumnMetaSymbol];

    expect(columnDef.defaultValue).toBeUndefined();
  });

  it("handles complex combinator chains", () => {
    const field = S.Int.pipe(DSL.integer, DSL.primaryKey, DSL.autoIncrement, DSL.unique);
    const columnDef = (field as any)[ColumnMetaSymbol];

    // Note: nullable is no longer stored - it's derived from schema AST
    expect(columnDef).toMatchObject({
      type: "integer",
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    });
  });
});

// ============================================================================
// Complete Model Examples
// ============================================================================

describe("DSL Combinators - Complete Examples", () => {
  it("creates a complete user model with combinators", () => {
    class User extends Model<User>("User")({
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      email: S.String.pipe(DSL.string, DSL.unique),
      username: S.String.pipe(DSL.string, DSL.unique),
      age: S.Int.pipe(DSL.integer),
      isActive: S.Boolean.pipe(DSL.boolean, DSL.defaultValue("true")),
      // Nullability is derived from S.NullOr - no need for DSL.nullable
      bio: S.NullOr(S.String).pipe(DSL.string),
      createdAt: S.String.pipe(DSL.datetime, DSL.defaultValue("now()")),
    }) {}

    const table = toDrizzle(User);

    expect(table).toBeDefined();
    expect(getTableName(table)).toBe("user");
    expect(table.id).toBeDefined();
    expect(table.email).toBeDefined();
    expect(table.username).toBeDefined();
    expect(table.age).toBeDefined();
    expect(table.isActive).toBeDefined();
    expect(table.bio).toBeDefined();
    expect(table.createdAt).toBeDefined();
  });

  it("creates an auto-increment primary key model", () => {
    class Counter extends Model<Counter>("Counter")({
      id: S.Int.pipe(DSL.integer, DSL.primaryKey, DSL.autoIncrement),
      name: S.String.pipe(DSL.string),
      value: S.Int.pipe(DSL.integer, DSL.defaultValue("0")),
    }) {}

    expect(Counter.columns.id).toMatchObject({
      type: "integer",
      primaryKey: true,
      autoIncrement: true,
    });

    const table = toDrizzle(Counter);
    expect(table).toBeDefined();
  });

  it("creates a model with JSON metadata", () => {
    const SettingsSchema = S.Struct({
      theme: S.String,
      notifications: S.Boolean,
      preferences: S.Record({ key: S.String, value: S.Unknown }),
    });

    class UserSettings extends Model<UserSettings>("UserSettings")({
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      userId: S.String.pipe(DSL.uuid),
      settings: SettingsSchema.pipe(DSL.json),
      updatedAt: S.String.pipe(DSL.datetime, DSL.defaultValue("now()")),
    }) {}

    expect(UserSettings.columns.settings.type).toBe("json");

    const table = toDrizzle(UserSettings);
    expect(table).toBeDefined();
    expect(table.settings).toBeDefined();
  });
});

// ============================================================================
// Type Narrowing Tests (Literal Type Preservation)
// ============================================================================

describe("DSL Combinators - Type Narrowing", () => {
  it("preserves literal column type through combinator chain", () => {
    const field = S.String.pipe(DSL.uuid, DSL.primaryKey);
    const columnDef = (field as any)[ColumnMetaSymbol];

    // Verify runtime values
    expect(columnDef.type).toBe("uuid");
    expect(columnDef.primaryKey).toBe(true);

    // Type-level verification: the ColumnDef should have literal types
    type FieldType = typeof field;
    type ColDef = FieldType extends { [ColumnMetaSymbol]: infer C } ? C : never;

    // These assertions verify literal types are preserved, not widened to unions
    expectTypeOf<ColDef["type"]>().toEqualTypeOf<"uuid">();
    expectTypeOf<ColDef["primaryKey"]>().toEqualTypeOf<true>();
    expectTypeOf<ColDef["unique"]>().toEqualTypeOf<false>();
    expectTypeOf<ColDef["autoIncrement"]>().toEqualTypeOf<false>();
  });

  it("preserves literal types through multiple combinator applications", () => {
    const field = S.Int.pipe(DSL.integer, DSL.primaryKey, DSL.autoIncrement, DSL.unique);

    const columnDef = (field as any)[ColumnMetaSymbol];

    // Runtime verification
    expect(columnDef.type).toBe("integer");
    expect(columnDef.primaryKey).toBe(true);
    expect(columnDef.autoIncrement).toBe(true);
    expect(columnDef.unique).toBe(true);

    // Type-level verification
    type FieldType = typeof field;
    type ColDef = FieldType extends { [ColumnMetaSymbol]: infer C } ? C : never;

    expectTypeOf<ColDef["type"]>().toEqualTypeOf<"integer">();
    expectTypeOf<ColDef["primaryKey"]>().toEqualTypeOf<true>();
    expectTypeOf<ColDef["autoIncrement"]>().toEqualTypeOf<true>();
    expectTypeOf<ColDef["unique"]>().toEqualTypeOf<true>();
  });

  it("Model.columns preserves literal types from combinator DSL", () => {
    class Document extends Model<Document>("Document")({
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      content: S.String.pipe(DSL.string),
      views: S.Int.pipe(DSL.integer),
    }) {}

    // Type-level: columns should have narrowed types
    type IdCol = (typeof Document.columns)["id"];
    type ContentCol = (typeof Document.columns)["content"];
    type ViewsCol = (typeof Document.columns)["views"];

    expectTypeOf<IdCol["type"]>().toEqualTypeOf<"uuid">();
    expectTypeOf<IdCol["primaryKey"]>().toEqualTypeOf<true>();

    expectTypeOf<ContentCol["type"]>().toEqualTypeOf<"string">();
    expectTypeOf<ContentCol["primaryKey"]>().toEqualTypeOf<false>();

    expectTypeOf<ViewsCol["type"]>().toEqualTypeOf<"integer">();
  });

  it("toDrizzle produces narrowed column types for combinator-defined models", () => {
    const MetadataSchema = S.Struct({
      tags: S.Array(S.String),
      level: S.Number,
    });

    class Entity extends Model<Entity>("Entity")({
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      metadata: MetadataSchema.pipe(DSL.json),
    }) {}

    const table = toDrizzle(Entity);

    // Runtime verification
    expect(table).toBeDefined();
    expect(table.id).toBeDefined();
    expect(table.metadata).toBeDefined();

    // Verify the table columns exist and are properly typed at runtime
    expect(Entity.columns.id.type).toBe("uuid");
    expect(Entity.columns.id.primaryKey).toBe(true);
    expect(Entity.columns.metadata.type).toBe("json");
  });

  it("preserves json type through combinator for complex schemas", () => {
    const SettingsSchema = S.Struct({
      theme: S.Literal("light", "dark"),
      enabled: S.Boolean,
    });

    const field = SettingsSchema.pipe(DSL.json);
    const columnDef = (field as any)[ColumnMetaSymbol];

    expect(columnDef.type).toBe("json");

    type FieldType = typeof field;
    type ColDef = FieldType extends { [ColumnMetaSymbol]: infer C } ? C : never;

    expectTypeOf<ColDef["type"]>().toEqualTypeOf<"json">();
    expectTypeOf<ColDef["primaryKey"]>().toEqualTypeOf<false>();
  });
});
