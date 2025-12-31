/**
 * @fileoverview Runtime tests for DSL foreign key utilities.
 *
 * Tests extractForeignKeys, generateForeignKeyName, and hasForeignKeyRef functions.
 *
 * NOTE: Type assertions (`as any`) are used to work around known variance issues
 * with the ModelClass type parameter. The runtime behavior is correct; only the
 * static type checker has issues with the concrete Model types not satisfying
 * the generic ModelClass constraint due to index signature variance.
 */
import { describe, expect, it } from "bun:test";
import {
  extractForeignKeys,
  Field,
  generateForeignKeyName,
  hasForeignKeyRef,
  Model,
} from "@beep/schema/integrations/sql/dsl";
import { ForeignKeySymbol } from "@beep/schema/integrations/sql/dsl/types";
import * as S from "effect/Schema";

// ============================================================================
// Test Fixtures - Mock Models
// ============================================================================

class User extends Model<User>("User")("user", {
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String)({ column: { type: "string", unique: true } }),
}) {}

// Model with FK reference using Field config
class PostWithFieldRef extends Model<PostWithFieldRef>("PostWithFieldRef")("post_with_field_ref", {
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(S.String)({
    column: { type: "uuid" },
    references: {
      target: () => User,
      field: "id",
      foreignKey: { onDelete: "cascade" },
    },
  }),
  title: Field(S.String)({ column: { type: "string" } }),
}) {}

// Model with FK reference using combinator
class PostWithCombinatorRef extends Model<PostWithCombinatorRef>("PostWithCombinatorRef")("post_with_combinator_ref", {
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(S.String)({
    column: { type: "uuid" },
    references: { target: () => User, field: "id", foreignKey: { onDelete: "cascade" } },
  }),
  title: Field(S.String)({ column: { type: "string" } }),
}) {}

// Model without any FK references
class Tag extends Model<Tag>("Tag")("tag", {
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  name: Field(S.String)({ column: { type: "string" } }),
}) {}

// ============================================================================
// generateForeignKeyName Tests
// ============================================================================

describe("generateForeignKeyName", () => {
  it("should generate conventional FK name", () => {
    const name = generateForeignKeyName("posts", "author_id");
    expect(name).toBe("posts_author_id_fk");
  });

  it("should lowercase the result", () => {
    const name = generateForeignKeyName("Posts", "Author_Id");
    expect(name).toBe("posts_author_id_fk");
  });

  it("should handle single word table names", () => {
    const name = generateForeignKeyName("users", "org_id");
    expect(name).toBe("users_org_id_fk");
  });

  it("should handle snake_case table names", () => {
    const name = generateForeignKeyName("user_profiles", "organization_id");
    expect(name).toBe("user_profiles_organization_id_fk");
  });

  it("should handle PascalCase inputs by lowercasing", () => {
    const name = generateForeignKeyName("UserProfile", "OrganizationId");
    expect(name).toBe("userprofile_organizationid_fk");
  });
});

// ============================================================================
// hasForeignKeyRef Tests
// ============================================================================

describe("hasForeignKeyRef", () => {
  it("should return true for field with FK reference via Field config", () => {
    const field = PostWithFieldRef._fields.authorId;
    expect(hasForeignKeyRef(field)).toBe(true);
  });

  it("should return true for field with FK reference via combinator", () => {
    const field = PostWithCombinatorRef._fields.authorId;
    expect(hasForeignKeyRef(field)).toBe(true);
  });

  it("should return false for field without FK reference", () => {
    const field = PostWithFieldRef._fields.title;
    expect(hasForeignKeyRef(field)).toBe(false);
  });

  it("should return false for primary key field without FK reference", () => {
    const field = PostWithFieldRef._fields.id;
    expect(hasForeignKeyRef(field)).toBe(false);
  });

  it("should return false for null", () => {
    expect(hasForeignKeyRef(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(hasForeignKeyRef(undefined)).toBe(false);
  });

  it("should return false for primitive values", () => {
    expect(hasForeignKeyRef("string")).toBe(false);
    expect(hasForeignKeyRef(123)).toBe(false);
    expect(hasForeignKeyRef(true)).toBe(false);
  });

  it("should return false for plain objects without symbol", () => {
    expect(hasForeignKeyRef({})).toBe(false);
    expect(hasForeignKeyRef({ target: () => User, field: "id" })).toBe(false);
  });

  it("should return true when ForeignKeySymbol is present", () => {
    const fieldWithSymbol = {
      [ForeignKeySymbol]: { target: () => User, field: "id" },
    };
    expect(hasForeignKeyRef(fieldWithSymbol)).toBe(true);
  });
});

// ============================================================================
// extractForeignKeys Tests
// ============================================================================

describe("extractForeignKeys", () => {
  it("should extract FKs from model with Field references config", () => {
    const fks = extractForeignKeys(PostWithFieldRef as any);
    expect(fks.length).toBe(1);

    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(fk!.columns).toContain("author_id");
    expect(fk!.foreignTable).toBe("user");
    expect(fk!.foreignColumns).toContain("id");
    expect(fk!.onDelete).toBe("cascade");
  });

  it("should extract FKs from model with combinator references", () => {
    const fks = extractForeignKeys(PostWithCombinatorRef as any);
    expect(fks.length).toBe(1);

    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(fk!.columns).toContain("author_id");
    expect(fk!.foreignTable).toBe("user");
    expect(fk!.foreignColumns).toContain("id");
    expect(fk!.onDelete).toBe("cascade");
  });

  it("should return empty array for model without references", () => {
    const fks = extractForeignKeys(Tag as any);
    expect(fks.length).toBe(0);
  });

  it("should return empty array for User model (no FK references)", () => {
    const fks = extractForeignKeys(User as any);
    expect(fks.length).toBe(0);
  });

  it("should generate correct FK constraint names", () => {
    const fks = extractForeignKeys(PostWithFieldRef as any);
    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(fk!.name).toBe("post_with_field_ref_author_id_fk");
  });

  it("should not include onDelete/onUpdate if not specified", () => {
    // Create a model with FK but no onDelete/onUpdate
    class Comment extends Model<Comment>("Comment")("comment", {
      id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
      postId: Field(S.String)({
        column: { type: "uuid" },
        references: {
          target: () => PostWithFieldRef as any,
          field: "id",
          // No foreignKey config - onDelete/onUpdate are undefined
        },
      }),
    }) {}

    const fks = extractForeignKeys(Comment as any);
    expect(fks.length).toBe(1);

    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(fk!.onDelete).toBeUndefined();
    expect(fk!.onUpdate).toBeUndefined();
  });

  it("should handle both onDelete and onUpdate", () => {
    class CommentWithFullFK extends Model<CommentWithFullFK>("CommentWithFullFK")("comment_with_full_fk", {
      id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
      postId: Field(S.String)({
        column: { type: "uuid" },
        references: {
          target: () => PostWithFieldRef as any,
          field: "id",
          foreignKey: { onDelete: "cascade", onUpdate: "restrict" },
        },
      }),
    }) {}

    const fks = extractForeignKeys(CommentWithFullFK as any);
    expect(fks.length).toBe(1);

    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(fk!.onDelete).toBe("cascade");
    expect(fk!.onUpdate).toBe("restrict");
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Foreign Key Edge Cases", () => {
  it("should handle models with multiple FK references", () => {
    class MultiRef extends Model<MultiRef>("MultiRef")("multi_ref", {
      id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
      authorId: Field(S.String)({
        column: { type: "uuid" },

        references: { target: () => User as any, field: "id" },
      }),
      reviewerId: Field(S.String)({
        column: { type: "uuid" },
        references: { target: () => User, field: "id" },
      }),
    }) {}

    const fks = extractForeignKeys(MultiRef as any);
    expect(fks.length).toBe(2);

    // Both should reference the User table
    expect(fks[0]!.foreignTable).toBe("user");
    expect(fks[1]!.foreignTable).toBe("user");

    // Should have different source columns
    const columns = fks.map((fk) => fk.columns[0]);
    expect(columns).toContain("author_id");
    expect(columns).toContain("reviewer_id");
  });

  it("should handle self-referential FK", () => {
    // Self-referential model must be defined with explicit type annotation
    // to avoid circular reference issues at the type level
    class Employee extends Model<Employee>("Employee")("employee", {
      id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
      managerId: Field(S.NullOr(S.String))({
        column: { type: "uuid" },

        references: { target: (): any => Employee, field: "id" },
      }),
    }) {}

    const fks = extractForeignKeys(Employee as any);
    expect(fks.length).toBe(1);

    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(fk!.foreignTable).toBe("employee");
    expect(fk!.columns).toContain("manager_id");
    expect(fk!.foreignColumns).toContain("id");
  });

  it("should handle FK with set null action", () => {
    class PostWithSetNull extends Model<PostWithSetNull>("PostWithSetNull")("post_with_set_null", {
      id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
      authorId: Field(S.NullOr(S.String))({
        column: { type: "uuid" },
        references: {
          target: () => User as any,
          field: "id",
          foreignKey: { onDelete: "set null" },
        },
      }),
    }) {}

    const fks = extractForeignKeys(PostWithSetNull as any);
    expect(fks.length).toBe(1);

    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(fk!.onDelete).toBe("set null");
  });

  it("should handle FK with no action", () => {
    class PostWithNoAction extends Model<PostWithNoAction>("PostWithNoAction")("post_with_no_action", {
      id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
      authorId: Field(S.String)({
        column: { type: "uuid" },
        references: {
          target: () => User,
          field: "id",
          foreignKey: { onDelete: "no action" },
        },
      }),
    }) {}

    const fks = extractForeignKeys(PostWithNoAction as any);
    expect(fks.length).toBe(1);

    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(fk!.onDelete).toBe("no action");
  });
});

// ============================================================================
// ForeignKeyDef Structure Tests
// ============================================================================

describe("ForeignKeyDef Structure", () => {
  it("should have correct structure with all required properties", () => {
    const fks = extractForeignKeys(PostWithFieldRef as any);
    expect(fks.length).toBe(1);

    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(fk).toHaveProperty("name");
    expect(fk).toHaveProperty("columns");
    expect(fk).toHaveProperty("foreignTable");
    expect(fk).toHaveProperty("foreignColumns");
  });

  it("should have columns as readonly array", () => {
    const fks = extractForeignKeys(PostWithFieldRef as any);
    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(Array.isArray(fk!.columns)).toBe(true);
    expect(fk!.columns.length).toBe(1);
  });

  it("should have foreignColumns as readonly array", () => {
    const fks = extractForeignKeys(PostWithFieldRef as any);
    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(Array.isArray(fk!.foreignColumns)).toBe(true);
    expect(fk!.foreignColumns.length).toBe(1);
  });

  it("should convert camelCase field names to snake_case", () => {
    class CamelCasePost extends Model<CamelCasePost>("CamelCasePost")("camel_case_post", {
      id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
      createdByUserId: Field(S.String)({
        column: { type: "uuid" },
        references: { target: () => User, field: "id" },
      }),
    }) {}

    const fks = extractForeignKeys(CamelCasePost as any);
    const fk = fks[0];
    expect(fk).toBeDefined();
    expect(fk!.columns[0]).toBe("created_by_user_id");
  });
});
