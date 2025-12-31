/**
 * @fileoverview Runtime tests for DSL relation constructors.
 *
 * Tests the Relation.one, Relation.many, and Relation.manyToMany constructors.
 */
import { describe, expect, it } from "bun:test";
import { Field, Model, Relation } from "@beep/schema/integrations/sql/dsl";
import * as S from "effect/Schema";

// ============================================================================
// Test Fixtures - Mock Models
// ============================================================================

class User extends Model<User>("User")("user", {
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  email: Field(S.String)({ column: { type: "string", unique: true } }),
  name: Field(S.String)({ column: { type: "string" } }),
}) {}

class Post extends Model<Post>("Post")("post", {
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  authorId: Field(S.String)({ column: { type: "uuid" } }),
  title: Field(S.String)({ column: { type: "string" } }),
}) {}

class Comment extends Model<Comment>("Comment")("comment", {
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  postId: Field(S.String)({ column: { type: "uuid" } }),
  content: Field(S.String)({ column: { type: "string" } }),
}) {}

class Group extends Model<Group>("Group")("group", {
  id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  name: Field(S.String)({ column: { type: "string" } }),
}) {}

class UserGroup extends Model<UserGroup>("UserGroup")("user_group", {
  userId: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
  groupId: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
}) {}

// ============================================================================
// Relation.one Tests
// ============================================================================

describe("Relation.one", () => {
  it("should create a OneRelation with correct _tag", () => {
    const rel = Relation.one(() => User, { from: "authorId", to: "id" });
    expect(rel._tag).toBe("one");
  });

  it("should store target as a thunk", () => {
    const rel = Relation.one(() => User, { from: "authorId", to: "id" });
    expect(typeof rel.target).toBe("function");
    expect(rel.target()).toBe(User);
  });

  it("should store fromField and toField", () => {
    const rel = Relation.one(() => User, { from: "authorId", to: "id" });
    expect(rel.fromField).toBe("authorId");
    expect(rel.toField).toBe("id");
  });

  it("should default optional to true", () => {
    const rel = Relation.one(() => User, { from: "authorId", to: "id" });
    expect(rel.optional).toBe(true);
  });

  it("should respect optional: false", () => {
    const rel = Relation.one(() => User, { from: "authorId", to: "id", optional: false });
    expect(rel.optional).toBe(false);
  });

  it("should store foreignKey config when provided", () => {
    const rel = Relation.one(() => User, {
      from: "authorId",
      to: "id",
      foreignKey: { onDelete: "cascade" },
    });
    expect(rel.foreignKey?.onDelete).toBe("cascade");
  });

  it("should not have foreignKey when not provided", () => {
    const rel = Relation.one(() => User, { from: "authorId", to: "id" });
    expect(rel.foreignKey).toBeUndefined();
  });

  it("should store full foreignKey config", () => {
    const rel = Relation.one(() => User, {
      from: "authorId",
      to: "id",
      foreignKey: {
        onDelete: "cascade",
        onUpdate: "restrict",
        name: "fk_post_author",
      },
    });
    expect(rel.foreignKey?.onDelete).toBe("cascade");
    expect(rel.foreignKey?.onUpdate).toBe("restrict");
    expect(rel.foreignKey?.name).toBe("fk_post_author");
  });
});

// ============================================================================
// Relation.many Tests
// ============================================================================

describe("Relation.many", () => {
  it("should create a ManyRelation with correct _tag", () => {
    const rel = Relation.many(() => Post, { from: "id", to: "authorId" });
    expect(rel._tag).toBe("many");
  });

  it("should store target as a thunk", () => {
    const rel = Relation.many(() => Post, { from: "id", to: "authorId" });
    expect(typeof rel.target).toBe("function");
    expect(rel.target()).toBe(Post);
  });

  it("should store fromField and toField", () => {
    const rel = Relation.many(() => Post, { from: "id", to: "authorId" });
    expect(rel.fromField).toBe("id");
    expect(rel.toField).toBe("authorId");
  });

  it("should always have optional: true", () => {
    const rel = Relation.many(() => Post, { from: "id", to: "authorId" });
    expect(rel.optional).toBe(true);
  });

  it("should work with Comment target", () => {
    const rel = Relation.many(() => Comment, { from: "id", to: "postId" });
    expect(rel.target()).toBe(Comment);
    expect(rel.toField).toBe("postId");
  });
});

// ============================================================================
// Relation.manyToMany Tests
// ============================================================================

describe("Relation.manyToMany", () => {
  it("should create a ManyToManyRelation with correct _tag", () => {
    const rel = Relation.manyToMany(() => Group, {
      through: () => UserGroup,
      fromField: "userId",
      toField: "groupId",
    });
    expect(rel._tag).toBe("manyToMany");
  });

  it("should store target as a thunk", () => {
    const rel = Relation.manyToMany(() => Group, {
      through: () => UserGroup,
      fromField: "userId",
      toField: "groupId",
    });
    expect(typeof rel.target).toBe("function");
    expect(rel.target()).toBe(Group);
  });

  it("should include junction config", () => {
    const rel = Relation.manyToMany(() => Group, {
      through: () => UserGroup,
      fromField: "userId",
      toField: "groupId",
    });
    expect(rel.junction).toBeDefined();
    expect(typeof rel.junction.through).toBe("function");
    expect(rel.junction.through()).toBe(UserGroup);
    expect(rel.junction.fromField).toBe("userId");
    expect(rel.junction.toField).toBe("groupId");
  });

  it("should always have optional: true", () => {
    const rel = Relation.manyToMany(() => Group, {
      through: () => UserGroup,
      fromField: "userId",
      toField: "groupId",
    });
    expect(rel.optional).toBe(true);
  });

  it("should store fromField and toField at top level", () => {
    const rel = Relation.manyToMany(() => Group, {
      through: () => UserGroup,
      fromField: "userId",
      toField: "groupId",
    });
    // The manyToMany constructor copies fromField/toField to the top level
    expect(rel.fromField).toBe("userId");
    expect(rel.toField).toBe("groupId");
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Relation Edge Cases", () => {
  it("should support self-referential relations", () => {
    // Employee with manager relation pointing to self
    // Note: We use User here as a stand-in for Employee with managerId
    const rel = Relation.one(() => User, { from: "managerId", to: "id" });
    expect(rel.target()).toBe(User);
    expect(rel._tag).toBe("one");
    expect(rel.fromField).toBe("managerId");
    expect(rel.toField).toBe("id");
  });

  it("should support circular references via lazy thunks", () => {
    // User -> Post -> User (author)
    const userPosts = Relation.many(() => Post, { from: "id", to: "authorId" });
    const postAuthor = Relation.one(() => User, { from: "authorId", to: "id" });

    // Both thunks should resolve correctly
    expect(userPosts.target()).toBe(Post);
    expect(postAuthor.target()).toBe(User);

    // The thunks are independent and can be evaluated in any order
    expect(postAuthor.target()).toBe(User);
    expect(userPosts.target()).toBe(Post);
  });

  it("should handle multiple relations from same model", () => {
    // User has many Posts (authored) and many Comments
    const posts = Relation.many(() => Post, { from: "id", to: "authorId" });
    const comments = Relation.many(() => Comment, { from: "id", to: "postId" });

    expect(posts.target()).toBe(Post);
    expect(comments.target()).toBe(Comment);
    expect(posts.toField).toBe("authorId");
    expect(comments.toField).toBe("postId");
  });

  it("should not share state between relation instances", () => {
    const rel1 = Relation.one(() => User, { from: "authorId", to: "id", optional: true });
    const rel2 = Relation.one(() => User, { from: "authorId", to: "id", optional: false });

    expect(rel1.optional).toBe(true);
    expect(rel2.optional).toBe(false);

    // Modifying one should not affect the other
    expect(rel1.optional).not.toBe(rel2.optional);
  });

  it("should handle foreignKey with only onDelete", () => {
    const rel = Relation.one(() => User, {
      from: "authorId",
      to: "id",
      foreignKey: { onDelete: "set null" },
    });
    expect(rel.foreignKey?.onDelete).toBe("set null");
    expect(rel.foreignKey?.onUpdate).toBeUndefined();
    expect(rel.foreignKey?.name).toBeUndefined();
  });

  it("should handle foreignKey with only onUpdate", () => {
    const rel = Relation.one(() => User, {
      from: "authorId",
      to: "id",
      foreignKey: { onUpdate: "no action" },
    });
    expect(rel.foreignKey?.onDelete).toBeUndefined();
    expect(rel.foreignKey?.onUpdate).toBe("no action");
  });

  it("should handle foreignKey with only name", () => {
    const rel = Relation.one(() => User, {
      from: "authorId",
      to: "id",
      foreignKey: { name: "custom_fk_name" },
    });
    expect(rel.foreignKey?.onDelete).toBeUndefined();
    expect(rel.foreignKey?.onUpdate).toBeUndefined();
    expect(rel.foreignKey?.name).toBe("custom_fk_name");
  });
});

// ============================================================================
// Relation Object Shape Tests
// ============================================================================

describe("Relation Object Shape", () => {
  it("OneRelation should have exactly the expected properties", () => {
    const rel = Relation.one(() => User, { from: "authorId", to: "id" });

    // Required properties
    expect(rel).toHaveProperty("_tag");
    expect(rel).toHaveProperty("target");
    expect(rel).toHaveProperty("fromField");
    expect(rel).toHaveProperty("toField");
    expect(rel).toHaveProperty("optional");

    // Optional properties should be absent when not provided
    expect("foreignKey" in rel).toBe(false);
  });

  it("OneRelation with foreignKey should include foreignKey property", () => {
    const rel = Relation.one(() => User, {
      from: "authorId",
      to: "id",
      foreignKey: { onDelete: "cascade" },
    });

    expect(rel).toHaveProperty("foreignKey");
    expect(rel.foreignKey).toBeDefined();
  });

  it("ManyRelation should have exactly the expected properties", () => {
    const rel = Relation.many(() => Post, { from: "id", to: "authorId" });

    expect(rel).toHaveProperty("_tag");
    expect(rel).toHaveProperty("target");
    expect(rel).toHaveProperty("fromField");
    expect(rel).toHaveProperty("toField");
    expect(rel).toHaveProperty("optional");

    // ManyRelation should not have foreignKey (FK is on the "many" side)
    expect("foreignKey" in rel).toBe(false);
  });

  it("ManyToManyRelation should have junction property", () => {
    const rel = Relation.manyToMany(() => Group, {
      through: () => UserGroup,
      fromField: "userId",
      toField: "groupId",
    });

    expect(rel).toHaveProperty("_tag");
    expect(rel).toHaveProperty("target");
    expect(rel).toHaveProperty("fromField");
    expect(rel).toHaveProperty("toField");
    expect(rel).toHaveProperty("optional");
    expect(rel).toHaveProperty("junction");

    expect(rel.junction).toHaveProperty("through");
    expect(rel.junction).toHaveProperty("fromField");
    expect(rel.junction).toHaveProperty("toField");
  });
});
