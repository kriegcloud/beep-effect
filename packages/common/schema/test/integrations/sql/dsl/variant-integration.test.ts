/**
 * @fileoverview Comprehensive test suite for DSL.Model VariantSchema integration.
 * Tests Field() with M.Generated, M.Sensitive, M.GeneratedByApp, M.FieldOption, and variant accessors.
 */
import { describe, expect, it } from "bun:test";
import { Field, Model, toDrizzle } from "@beep/schema/integrations/sql/dsl";
import * as M from "@effect/sql/Model";
import { getTableName } from "drizzle-orm";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import * as Struct from "effect/Struct";

/**
 * Helper to check if a key exists in a schema's fields.
 * Works with S.Struct.fields which is a Record<string, Schema>.
 */
const hasField = (fields: S.Struct.Fields, key: string): boolean => key in fields;

/**
 * Comprehensive test suite for DSL.Model VariantSchema integration.
 *
 * This tests the integration between the DSL's Field/Model system and
 * @effect/sql/Model helpers (M.Generated, M.Sensitive, M.GeneratedByApp, M.FieldOption).
 */
describe("DSL.Model VariantSchema Integration", () => {
  // ============================================================================
  // Field with M.Generated
  // ============================================================================
  describe("Field with M.Generated", () => {
    it("creates a DSLVariantField that excludes field from insert variant", () => {
      class Post extends Model<Post>("Post")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        title: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Verify insert variant doesn't have 'id' (Generated excludes from insert)
      expect(hasField(Post.insert.fields, "id")).toBe(false);
      expect(hasField(Post.insert.fields, "title")).toBe(true);

      // Verify select variant has 'id'
      expect(hasField(Post.select.fields, "id")).toBe(true);
      expect(hasField(Post.select.fields, "title")).toBe(true);

      // Verify update variant has 'id'
      expect(hasField(Post.update.fields, "id")).toBe(true);

      // Verify json variant has 'id'
      expect(hasField(Post.json.fields, "id")).toBe(true);
    });

    it("excludes field from jsonCreate and jsonUpdate variants", () => {
      class Entity extends Model<Entity>("Entity")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // M.Generated excludes from insert, jsonCreate, jsonUpdate
      expect(hasField(Entity.jsonCreate.fields, "id")).toBe(false);
      expect(hasField(Entity.jsonUpdate.fields, "id")).toBe(false);
      expect(hasField(Entity.jsonCreate.fields, "name")).toBe(true);
      expect(hasField(Entity.jsonUpdate.fields, "name")).toBe(true);
    });

    it("allows decoding without generated field for insert", () => {
      class Post extends Model<Post>("Post")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        title: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Insert variant should not require 'id'
      const result = S.decodeSync(Post.insert)({ title: "Hello World" });
      expect(result).toEqual({ title: "Hello World" });
    });

    it("requires generated field for select variant", () => {
      class Post extends Model<Post>("Post")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        title: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Select variant DOES require 'id'
      const result = S.decodeSync(Post.select)({ id: "post-123", title: "Hello World" });
      expect(result).toEqual({ id: "post-123", title: "Hello World" });

      // Missing 'id' should fail for select (using type assertion for intentional invalid input)
      expect(() => S.decodeSync(Post.select)({ title: "Hello World" } as { id: string; title: string })).toThrow();
    });

    it("works with S.Int for auto-increment primary keys", () => {
      class Item extends Model<Item>("Item")({
        _rowId: Field(M.Generated(S.Int), { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Insert should not require _rowId
      const insertResult = S.decodeSync(Item.insert)({ name: "Test Item" });
      expect(insertResult).toEqual({ name: "Test Item" });

      // Select should require _rowId
      const selectResult = S.decodeSync(Item.select)({ _rowId: 1, name: "Test Item" });
      expect(selectResult).toEqual({ _rowId: 1, name: "Test Item" });
    });
  });

  // ============================================================================
  // Field with M.Sensitive
  // ============================================================================
  describe("Field with M.Sensitive", () => {
    it("excludes field from all json variants", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        email: Field(S.String, { column: { type: "string" } }),
        passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
      }) {}

      // Verify json variants don't have 'passwordHash'
      expect(hasField(User.json.fields, "passwordHash")).toBe(false);
      expect(hasField(User.jsonCreate.fields, "passwordHash")).toBe(false);
      expect(hasField(User.jsonUpdate.fields, "passwordHash")).toBe(false);

      // Verify json variants still have other fields
      expect(hasField(User.json.fields, "id")).toBe(true);
      expect(hasField(User.json.fields, "email")).toBe(true);
    });

    it("includes field in database variants (select, insert, update)", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
      }) {}

      // Verify database variants DO have 'passwordHash'
      expect(hasField(User.select.fields, "passwordHash")).toBe(true);
      expect(hasField(User.insert.fields, "passwordHash")).toBe(true);
      expect(hasField(User.update.fields, "passwordHash")).toBe(true);
    });

    it("allows decoding sensitive data for database operations", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
      }) {}

      // Insert requires passwordHash
      const insertResult = S.decodeSync(User.insert)({
        id: "user-123",
        passwordHash: "hashed_password_123",
      });
      expect(insertResult.passwordHash).toBe("hashed_password_123");

      // Select requires passwordHash
      const selectResult = S.decodeSync(User.select)({
        id: "user-123",
        passwordHash: "hashed_password_123",
      });
      expect(selectResult.passwordHash).toBe("hashed_password_123");
    });

    it("does not require sensitive field for json variants", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        email: Field(S.String, { column: { type: "string" } }),
        passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
      }) {}

      // JSON variant should not require passwordHash
      const jsonResult = S.decodeSync(User.json)({
        id: "user-123",
        email: "test@example.com",
      });
      expect(jsonResult).toEqual({ id: "user-123", email: "test@example.com" });
    });
  });

  // ============================================================================
  // Field with M.GeneratedByApp
  // ============================================================================
  describe("Field with M.GeneratedByApp", () => {
    it("includes field in insert variant as required", () => {
      class Document extends Model<Document>("Document")({
        id: Field(M.GeneratedByApp(S.String), { column: { type: "uuid", primaryKey: true } }),
        slug: Field(S.String, { column: { type: "string" } }),
      }) {}

      // GeneratedByApp fields ARE in insert (app must provide them)
      expect(hasField(Document.insert.fields, "id")).toBe(true);
      expect(hasField(Document.insert.fields, "slug")).toBe(true);
    });

    it("includes field in all database variants", () => {
      class Document extends Model<Document>("Document")({
        id: Field(M.GeneratedByApp(S.String), { column: { type: "uuid", primaryKey: true } }),
        slug: Field(S.String, { column: { type: "string" } }),
      }) {}

      // GeneratedByApp fields are in all database variants
      expect(hasField(Document.select.fields, "id")).toBe(true);
      expect(hasField(Document.insert.fields, "id")).toBe(true);
      expect(hasField(Document.update.fields, "id")).toBe(true);
    });

    it("includes field in json variant but excludes from jsonCreate and jsonUpdate", () => {
      class Document extends Model<Document>("Document")({
        id: Field(M.GeneratedByApp(S.String), { column: { type: "uuid", primaryKey: true } }),
        content: Field(S.String, { column: { type: "string" } }),
      }) {}

      // GeneratedByApp fields ARE in json (for reading)
      expect(hasField(Document.json.fields, "id")).toBe(true);

      // But NOT in jsonCreate or jsonUpdate (client doesn't provide these)
      expect(hasField(Document.jsonCreate.fields, "id")).toBe(false);
      expect(hasField(Document.jsonUpdate.fields, "id")).toBe(false);
    });

    it("requires field for insert operations", () => {
      class Document extends Model<Document>("Document")({
        id: Field(M.GeneratedByApp(S.String), { column: { type: "uuid", primaryKey: true } }),
        slug: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Insert requires 'id' (app must generate it)
      const insertResult = S.decodeSync(Document.insert)({
        id: "doc-123",
        slug: "my-document",
      });
      expect(insertResult.id).toBe("doc-123");

      // Missing 'id' should fail for insert (using type assertion for intentional invalid input)
      expect(() => S.decodeSync(Document.insert)({ slug: "my-document" } as { id: string; slug: string })).toThrow();
    });
  });

  // ============================================================================
  // Field with M.FieldOption
  // ============================================================================
  describe("Field with M.FieldOption", () => {
    it("makes field optional across all variants", () => {
      class Profile extends Model<Profile>("Profile")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        bio: Field(M.FieldOption(S.String), { column: { type: "string", nullable: true } }),
      }) {}

      // Verify bio is in all variants (but optional)
      expect(hasField(Profile.select.fields, "bio")).toBe(true);
      expect(hasField(Profile.insert.fields, "bio")).toBe(true);
      expect(hasField(Profile.update.fields, "bio")).toBe(true);
      expect(hasField(Profile.json.fields, "bio")).toBe(true);
    });

    it("accepts null for database variants", () => {
      class Profile extends Model<Profile>("Profile")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        bio: Field(M.FieldOption(S.String), { column: { type: "string", nullable: true } }),
      }) {}

      // Database variants accept null
      const selectWithNull = S.decodeSync(Profile.select)({
        id: "profile-123",
        bio: null,
      });
      expect(O.isNone(selectWithNull.bio)).toBe(true);

      const selectWithValue = S.decodeSync(Profile.select)({
        id: "profile-123",
        bio: "Hello, I am a developer",
      });
      expect(O.isSome(selectWithValue.bio)).toBe(true);
      expect(O.getOrNull(selectWithValue.bio)).toBe("Hello, I am a developer");
    });

    it("accepts missing key for json variants", () => {
      class Profile extends Model<Profile>("Profile")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        bio: Field(M.FieldOption(S.String), { column: { type: "string", nullable: true } }),
      }) {}

      // JSON variants accept missing keys
      const jsonWithoutBio = S.decodeSync(Profile.json)({
        id: "profile-123",
      });
      expect(O.isNone(jsonWithoutBio.bio)).toBe(true);

      const jsonWithBio = S.decodeSync(Profile.json)({
        id: "profile-123",
        bio: "My bio",
      });
      expect(O.isSome(jsonWithBio.bio)).toBe(true);
    });
  });

  // ============================================================================
  // All 6 Variant Accessors
  // ============================================================================
  describe("Model variant accessors", () => {
    it("exposes all 6 variant schema accessors", () => {
      class Entity extends Model<Entity>("Entity")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // All 6 variants should be defined as schemas
      expect(S.isSchema(Entity.select)).toBe(true);
      expect(S.isSchema(Entity.insert)).toBe(true);
      expect(S.isSchema(Entity.update)).toBe(true);
      expect(S.isSchema(Entity.json)).toBe(true);
      expect(S.isSchema(Entity.jsonCreate)).toBe(true);
      expect(S.isSchema(Entity.jsonUpdate)).toBe(true);
    });

    it("variant schemas have proper identifiers", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
      }) {}

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

    it("variant schemas are memoized (same reference on multiple accesses)", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid" } }),
      }) {}

      const select1 = User.select;
      const select2 = User.select;
      const insert1 = User.insert;
      const insert2 = User.insert;

      expect(select1).toBe(select2);
      expect(insert1).toBe(insert2);
    });

    it("for plain DSL fields, all variants include all fields", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      const data = { id: "user-123", name: "Alice" };

      // All variants should have both fields
      const selectDecoded = S.decodeSync(User.select)(data);
      const insertDecoded = S.decodeSync(User.insert)(data);
      const updateDecoded = S.decodeSync(User.update)(data);
      const jsonDecoded = S.decodeSync(User.json)(data);
      const jsonCreateDecoded = S.decodeSync(User.jsonCreate)(data);
      const jsonUpdateDecoded = S.decodeSync(User.jsonUpdate)(data);

      expect(selectDecoded).toEqual(data);
      expect(insertDecoded).toEqual(data);
      expect(updateDecoded).toEqual(data);
      expect(jsonDecoded).toEqual(data);
      expect(jsonCreateDecoded).toEqual(data);
      expect(jsonUpdateDecoded).toEqual(data);
    });
  });

  // ============================================================================
  // Column Metadata Preservation
  // ============================================================================
  describe("Column metadata preservation", () => {
    it("Model.columns contains ColumnDef for all fields including Generated", () => {
      class Entity extends Model<Entity>("Entity")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", unique: true, primaryKey: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      expect(Entity.columns.id).toEqual(
        expect.objectContaining({
          type: "uuid",
          unique: true,
          primaryKey: true,
        })
      );
      expect(Entity.columns.name).toEqual(
        expect.objectContaining({
          type: "string",
        })
      );
    });

    it("Model.columns contains ColumnDef for Sensitive fields", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
      }) {}

      expect(User.columns.id).toEqual(
        expect.objectContaining({
          type: "uuid",
          primaryKey: true,
        })
      );
      expect(User.columns.passwordHash).toEqual(
        expect.objectContaining({
          type: "string",
        })
      );
    });

    it("Model.columns contains ColumnDef for GeneratedByApp fields", () => {
      class Document extends Model<Document>("Document")({
        id: Field(M.GeneratedByApp(S.String), { column: { type: "uuid", primaryKey: true } }),
        content: Field(S.String, { column: { type: "string" } }),
      }) {}

      expect(Document.columns.id).toEqual(
        expect.objectContaining({
          type: "uuid",
          primaryKey: true,
        })
      );
    });

    it("Model.columns contains ColumnDef for FieldOption fields", () => {
      class Profile extends Model<Profile>("Profile")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        bio: Field(M.FieldOption(S.String), { column: { type: "string", nullable: true } }),
      }) {}

      expect(Profile.columns.bio).toEqual(
        expect.objectContaining({
          type: "string",
          nullable: true,
        })
      );
    });

    it("primaryKey is correctly derived from variant fields", () => {
      class Entity extends Model<Entity>("Entity")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      expect(Entity.primaryKey).toEqual(["id"]);
    });

    it("tableName is correctly derived for variant-enabled Models", () => {
      class UserProfile extends Model<UserProfile>("UserProfile")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
      }) {}

      expect(UserProfile.tableName).toBe("user_profile");
      expect(UserProfile.identifier).toBe("UserProfile");
    });
  });

  // ============================================================================
  // toDrizzle with Variant-Enabled Models
  // ============================================================================
  describe("toDrizzle with variant-enabled Models", () => {
    it("produces a Drizzle table with all columns including Generated", () => {
      class Post extends Model<Post>("Post")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        title: Field(S.String, { column: { type: "string" } }),
      }) {}

      const table = toDrizzle(Post);

      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.title).toBeDefined();
      expect(getTableName(table)).toBe("post");
    });

    it("produces a Drizzle table with Sensitive columns", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
      }) {}

      const table = toDrizzle(User);

      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.passwordHash).toBeDefined();
    });

    it("produces a Drizzle table with GeneratedByApp columns", () => {
      class Document extends Model<Document>("Document")({
        id: Field(M.GeneratedByApp(S.String), { column: { type: "uuid", primaryKey: true } }),
        slug: Field(S.String, { column: { type: "string" } }),
      }) {}

      const table = toDrizzle(Document);

      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.slug).toBeDefined();
    });

    it("produces a Drizzle table with FieldOption columns as nullable", () => {
      class Profile extends Model<Profile>("Profile")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        bio: Field(M.FieldOption(S.String), { column: { type: "string", nullable: true } }),
      }) {}

      const table = toDrizzle(Profile);

      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.bio).toBeDefined();
    });

    it("handles autoIncrement with Generated fields", () => {
      class Item extends Model<Item>("Item")({
        _rowId: Field(M.Generated(S.Int), { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      const table = toDrizzle(Item);

      expect(table).toBeDefined();
      expect(table._rowId).toBeDefined();
      expect(table.name).toBeDefined();
    });
  });

  // ============================================================================
  // S.decodeSync with Different Variants
  // ============================================================================
  describe("S.decodeSync with different variants", () => {
    it("select variant requires all fields including Generated", () => {
      class Post extends Model<Post>("Post")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        title: Field(S.String, { column: { type: "string" } }),
        content: Field(S.String, { column: { type: "string" } }),
      }) {}

      const data = { id: "post-123", title: "My Post", content: "Hello World" };
      const result = S.decodeSync(Post.select)(data);

      expect(result).toEqual(data);
    });

    it("insert variant does not require Generated fields", () => {
      class Post extends Model<Post>("Post")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        title: Field(S.String, { column: { type: "string" } }),
        content: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Insert should not require 'id'
      const insertData = { title: "My Post", content: "Hello World" };
      const result = S.decodeSync(Post.insert)(insertData);

      expect(result).toEqual(insertData);
      expect("id" in result).toBe(false);
    });

    it("insert variant requires GeneratedByApp fields", () => {
      class Document extends Model<Document>("Document")({
        id: Field(M.GeneratedByApp(S.String), { column: { type: "uuid", primaryKey: true } }),
        content: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Insert DOES require 'id' for GeneratedByApp
      const insertData = { id: "doc-123", content: "Hello World" };
      const result = S.decodeSync(Document.insert)(insertData);

      expect(result.id).toBe("doc-123");

      // Missing 'id' should fail (using type assertion for intentional invalid input)
      expect(() => S.decodeSync(Document.insert)({ content: "Hello" } as { id: string; content: string })).toThrow();
    });

    it("json variant does not include Sensitive fields", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        email: Field(S.String, { column: { type: "string" } }),
        passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
      }) {}

      // JSON should work without passwordHash
      const jsonData = { id: "user-123", email: "test@example.com" };
      const result = S.decodeSync(User.json)(jsonData);

      expect(result).toEqual(jsonData);
      expect("passwordHash" in result).toBe(false);
    });

    it("update variant includes all database-relevant fields", () => {
      class Post extends Model<Post>("Post")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        title: Field(S.String, { column: { type: "string" } }),
        content: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Update includes 'id' (for WHERE clause) plus updatable fields
      const updateData = { id: "post-123", title: "Updated Title", content: "Updated Content" };
      const result = S.decodeSync(Post.update)(updateData);

      expect(result).toEqual(updateData);
    });

    it("jsonCreate variant excludes Generated and GeneratedByApp fields", () => {
      class Entity extends Model<Entity>("Entity")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        internalId: Field(M.GeneratedByApp(S.String), { column: { type: "string" } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // jsonCreate should only require 'name'
      const createData = { name: "Test Entity" };
      const result = S.decodeSync(Entity.jsonCreate)(createData);

      expect(result).toEqual(createData);
      expect("id" in result).toBe(false);
      expect("internalId" in result).toBe(false);
    });

    it("jsonUpdate variant excludes Generated and GeneratedByApp fields", () => {
      class Entity extends Model<Entity>("Entity")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        internalId: Field(M.GeneratedByApp(S.String), { column: { type: "string" } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // jsonUpdate should only require 'name'
      const updateData = { name: "Updated Entity" };
      const result = S.decodeSync(Entity.jsonUpdate)(updateData);

      expect(result).toEqual(updateData);
      expect("id" in result).toBe(false);
      expect("internalId" in result).toBe(false);
    });
  });

  // ============================================================================
  // Complex Model with Multiple Variant Field Types
  // ============================================================================
  describe("Complex model with multiple variant field types", () => {
    it("handles a model with Generated, Sensitive, GeneratedByApp, and FieldOption together", () => {
      class ComplexUser extends Model<ComplexUser>("ComplexUser")({
        // Database-generated ID (excluded from insert)
        _rowId: Field(M.Generated(S.Int), { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        // App-generated UUID (required for insert, excluded from jsonCreate/jsonUpdate)
        id: Field(M.GeneratedByApp(S.String), { column: { type: "uuid", unique: true } }),
        // Standard field (all variants)
        email: Field(S.String, { column: { type: "string", unique: true } }),
        // Sensitive field (excluded from json variants)
        passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
        // Optional field with null support
        bio: Field(M.FieldOption(S.String), { column: { type: "string", nullable: true } }),
      }) {}

      // Verify columns
      expect(ComplexUser.columns._rowId.primaryKey).toBe(true);
      expect(ComplexUser.columns._rowId.autoIncrement).toBe(true);
      expect(ComplexUser.columns.id.unique).toBe(true);
      expect(ComplexUser.columns.email.unique).toBe(true);
      expect(ComplexUser.columns.bio.nullable).toBe(true);

      // Verify select variant (all fields)

      expect(hasField(ComplexUser.select.fields, "_rowId")).toBe(true);
      expect(hasField(ComplexUser.select.fields, "id")).toBe(true);
      expect(hasField(ComplexUser.select.fields, "email")).toBe(true);
      expect(hasField(ComplexUser.select.fields, "passwordHash")).toBe(true);
      expect(hasField(ComplexUser.select.fields, "bio")).toBe(true);

      // Verify insert variant (no _rowId, has id)
      expect(hasField(ComplexUser.insert.fields, "_rowId")).toBe(false);
      expect(hasField(ComplexUser.insert.fields, "id")).toBe(true);
      expect(hasField(ComplexUser.insert.fields, "email")).toBe(true);
      expect(hasField(ComplexUser.insert.fields, "passwordHash")).toBe(true);
      expect(hasField(ComplexUser.insert.fields, "bio")).toBe(true);

      // Verify json variant (no passwordHash)
      expect(hasField(ComplexUser.json.fields, "_rowId")).toBe(true);
      expect(hasField(ComplexUser.json.fields, "id")).toBe(true);
      expect(hasField(ComplexUser.json.fields, "email")).toBe(true);
      expect(hasField(ComplexUser.json.fields, "passwordHash")).toBe(false);
      expect(hasField(ComplexUser.json.fields, "bio")).toBe(true);

      // Verify jsonCreate variant (no _rowId, no id, no passwordHash)
      expect(hasField(ComplexUser.jsonCreate.fields, "_rowId")).toBe(false);
      expect(hasField(ComplexUser.jsonCreate.fields, "id")).toBe(false);
      expect(hasField(ComplexUser.jsonCreate.fields, "email")).toBe(true);
      expect(hasField(ComplexUser.jsonCreate.fields, "passwordHash")).toBe(false);
      expect(hasField(ComplexUser.jsonCreate.fields, "bio")).toBe(true);
    });

    it("toDrizzle works with complex variant model", () => {
      class ComplexEntity extends Model<ComplexEntity>("ComplexEntity")({
        _rowId: Field(M.Generated(S.Int), { column: { type: "integer", primaryKey: true, autoIncrement: true } }),
        id: Field(M.GeneratedByApp(S.String), { column: { type: "uuid", unique: true } }),
        secret: Field(M.Sensitive(S.String), { column: { type: "string" } }),
        optional: Field(M.FieldOption(S.String), { column: { type: "string", nullable: true } }),
      }) {}

      const table = toDrizzle(ComplexEntity);

      expect(table).toBeDefined();
      expect(table._rowId).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.secret).toBeDefined();
      expect(table.optional).toBeDefined();
      expect(getTableName(table)).toBe("complex_entity");
    });
  });

  // ============================================================================
  // Type-Level Verification (Runtime Assertions for Type Safety)
  // ============================================================================
  describe("Type-level verification", () => {
    it("insert variant type excludes Generated field keys", () => {
      class Post extends Model<Post>("Post")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        title: Field(S.String, { column: { type: "string" } }),
      }) {}

      // At runtime, verify the fields object structure
      const insertFields = Struct.keys(Post.insert.fields);
      expect(insertFields).not.toContain("id");
      expect(insertFields).toContain("title");
    });

    it("json variant type excludes Sensitive field keys", () => {
      class User extends Model<User>("User")({
        id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
        passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
      }) {}

      const jsonFields = Struct.keys(User.json.fields);
      expect(jsonFields).not.toContain("passwordHash");
      expect(jsonFields).toContain("id");
    });

    it("columns type includes all fields regardless of variant exclusions", () => {
      class Entity extends Model<Entity>("Entity")({
        id: Field(M.Generated(S.String), { column: { type: "uuid", primaryKey: true } }),
        secret: Field(M.Sensitive(S.String), { column: { type: "string" } }),
        name: Field(S.String, { column: { type: "string" } }),
      }) {}

      // Columns should include ALL fields (for Drizzle table generation)
      const columnKeys = Struct.keys(Entity.columns);
      expect(columnKeys).toContain("id");
      expect(columnKeys).toContain("secret");
      expect(columnKeys).toContain("name");
    });
  });
});
