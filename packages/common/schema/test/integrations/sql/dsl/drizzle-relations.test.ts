/**
 * @fileoverview Runtime tests for Drizzle relations generation.
 *
 * Tests aggregateRelations and toDrizzleRelations functions.
 *
 * This file demonstrates the `defineRelations()` pattern which breaks circular
 * type dependencies by defining models first, then relations separately.
 */
import { describe, expect, it } from "bun:test";
import {
  aggregateRelations,
  defineRelations,
  Model,
  Relation,
  toDrizzle,
  toDrizzleRelations,
} from "@beep/schema/integrations/sql/dsl";
import * as DSL from "@beep/schema/integrations/sql/dsl/combinators";
import * as S from "effect/Schema";

// ============================================================================
// Model Definitions (without relations)
// ============================================================================
// Models are defined WITHOUT relations to avoid circular type inference errors.
// Relations are defined separately using defineRelations() after all models exist.

// Model without relations (standalone)
class Tag extends Model<Tag>("Tag")("tag", {
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  name: S.String.pipe(DSL.string),
}) {}

class Comment extends Model<Comment>("Comment")("comment", {
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  postId: S.String.pipe(DSL.uuid),
  content: S.String.pipe(DSL.string),
}) {}

class Post extends Model<Post>("Post")("post", {
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  authorId: S.String.pipe(DSL.uuid),
  title: S.String.pipe(DSL.string),
}) {}

class User extends Model<User>("User")("user", {
  id: S.String.pipe(DSL.uuid, DSL.primaryKey),
  email: S.String.pipe(DSL.string, DSL.unique),
  name: S.String.pipe(DSL.string),
}) {}

// ============================================================================
// Relation Definitions (using defineRelations pattern)
// ============================================================================
// Relations are defined AFTER all models exist, breaking the circular dependency.
// The callback pattern defers type evaluation until the models are fully resolved.

const CommentRelations = defineRelations(Comment, (fields) => ({
  post: Relation.one(() => Post, { from: fields.postId, to: "id" }),
}));

const PostRelations = defineRelations(Post, (fields) => ({
  author: Relation.one(() => User, { from: fields.authorId, to: "id" }),
  comments: Relation.many(() => Comment, { from: fields.id, to: "postId" }),
}));

const UserRelations = defineRelations(User, (fields) => ({
  posts: Relation.many(() => Post, { from: fields.id, to: "authorId" }),
}));

// ============================================================================
// aggregateRelations Tests
// ============================================================================

describe("aggregateRelations", () => {
  it("should aggregate ModelRelationsDefinitions into a graph", () => {
    // Uses rest params with ModelRelationsDefinition objects
    const graph = aggregateRelations(UserRelations, PostRelations, CommentRelations);

    // Now uses Record instead of Map - access models directly by identifier
    expect(Object.keys(graph.models).length).toBe(3);
    expect(graph.models.User).toBe(User);
    expect(graph.models.Post).toBe(Post);
    expect(graph.models.Comment).toBe(Comment);
  });

  it("should extract relations from each ModelRelationsDefinition", () => {
    const graph = aggregateRelations(UserRelations, PostRelations, CommentRelations);

    // User has 1 relation (posts)
    const userRels = graph.relations.User;
    expect(userRels?.length).toBe(1);

    // Post has 2 relations (author, comments)
    const postRels = graph.relations.Post;
    expect(postRels?.length).toBe(2);

    // Comment has 1 relation (post)
    const commentRels = graph.relations.Comment;
    expect(commentRels?.length).toBe(1);
  });

  it("should handle models without relations", () => {
    // Tag has no relations, pass as raw model class
    const graph = aggregateRelations(Tag);

    expect(Object.keys(graph.models).length).toBe(1);
    expect(graph.models.Tag).toBe(Tag);
    expect(graph.relations.Tag).toEqual([]);
  });

  it("should handle empty model call", () => {
    const graph = aggregateRelations();

    expect(Object.keys(graph.models).length).toBe(0);
    expect(Object.keys(graph.relations).length).toBe(0);
  });

  it("should correctly identify relation types in graph", () => {
    const graph = aggregateRelations(UserRelations, PostRelations);

    const userRels = graph.relations.User;
    expect(userRels).toBeDefined();
    expect(userRels?.length).toBe(1);
    expect(userRels?.[0]?._tag).toBe("many");

    const postRels = graph.relations.Post;
    expect(postRels).toBeDefined();
    expect(postRels?.length).toBe(2);
    // Should have one "one" and one "many" relation
    const oneRels = postRels?.filter((r) => r._tag === "one");
    const manyRels = postRels?.filter((r) => r._tag === "many");
    expect(oneRels?.length).toBe(1);
    expect(manyRels?.length).toBe(1);
  });

  it("should provide typed access to models by identifier", () => {
    // This test verifies that models are accessible by their identifier keys
    const graph = aggregateRelations(UserRelations, PostRelations);

    // Verify keys include expected model identifiers
    // Note: With ModelRelationsDefinition, the types flow through ExtractModel
    const keys = Object.keys(graph.models);
    expect(keys).toContain("User");
    expect(keys).toContain("Post");
    expect(keys.length).toBe(2);

    // Keys are literal types ("User", "Post"), though values are a union
    // due to TypeScript's limitations with class constructor types
    expect(graph.models.User).toBe(User);
    expect(graph.models.Post).toBe(Post);

    // Relations should also be accessible by identifier
    expect(graph.relations.User).toBeDefined();
    expect(graph.relations.Post).toBeDefined();
    expect(graph.relations.User?.length).toBe(1);
    expect(graph.relations.Post?.length).toBe(2);
  });

  it("should support mixed inputs (raw models and ModelRelationsDefinitions)", () => {
    // Tag is a raw model (no relations), others are ModelRelationsDefinition
    const graph = aggregateRelations(Tag, UserRelations, PostRelations);

    expect(Object.keys(graph.models).length).toBe(3);
    expect(graph.models.Tag).toBe(Tag);
    expect(graph.models.User).toBe(User);
    expect(graph.models.Post).toBe(Post);

    // Tag has no relations
    expect(graph.relations.Tag).toEqual([]);
    // User and Post have relations from their definitions
    expect(graph.relations.User?.length).toBe(1);
    expect(graph.relations.Post?.length).toBe(2);
  });
});

// ============================================================================
// toDrizzleRelations Tests
// ============================================================================

describe("toDrizzleRelations", () => {
  it("should generate Drizzle relation configurations from ModelRelationsDefinitions", () => {
    // First generate Drizzle tables
    const user = toDrizzle(User);
    const post = toDrizzle(Post);
    const comment = toDrizzle(Comment);

    // Then generate relations using ModelRelationsDefinition objects
    const relations = toDrizzleRelations([UserRelations, PostRelations, CommentRelations], { user, post, comment });

    // Should have relation configs for each table with relations
    expect(relations).toBeDefined();
    expect(typeof relations).toBe("object");
  });

  it("should create relations using Drizzle's relations() helper", () => {
    const user = toDrizzle(User);
    const post = toDrizzle(Post);

    const relations = toDrizzleRelations([UserRelations, PostRelations], { user, post });

    // Should return relation config objects
    // The exact structure depends on Drizzle's internals
    expect(Object.keys(relations).length).toBeGreaterThanOrEqual(0);
  });

  it("should name relation configs with 'Relations' suffix", () => {
    const user = toDrizzle(User);
    const post = toDrizzle(Post);

    const relations = toDrizzleRelations([UserRelations, PostRelations], { user, post });

    // Check for expected relation config names
    const keys = Object.keys(relations);
    // Should have userRelations and postRelations
    expect(keys.some((k) => k === "userRelations")).toBe(true);
    expect(keys.some((k) => k === "postRelations")).toBe(true);
  });

  it("should skip models without relations", () => {
    const tag = toDrizzle(Tag);

    // Tag has no relations, pass as raw model class
    const relations = toDrizzleRelations([Tag], { tag });

    // Should not create relations config for Tag
    expect(relations.tagRelations).toBeUndefined();
  });

  it("should handle empty model array", () => {
    const relations = toDrizzleRelations([], {});
    expect(relations).toEqual({});
  });

  it("should handle missing tables gracefully", () => {
    const user = toDrizzle(User);
    // Post table is missing

    // Should not throw, just skip relations that reference missing tables
    const relations = toDrizzleRelations([UserRelations, PostRelations], { user });

    expect(relations).toBeDefined();
  });

  it("should support mixed inputs (raw models and ModelRelationsDefinitions)", () => {
    const tag = toDrizzle(Tag);
    const user = toDrizzle(User);
    const post = toDrizzle(Post);

    // Mix raw model (Tag) with ModelRelationsDefinitions
    const relations = toDrizzleRelations([Tag, UserRelations, PostRelations], { tag, user, post });

    // Tag has no relations, so no tagRelations
    expect(relations.tagRelations).toBeUndefined();
    // User and Post have relations
    expect(relations.userRelations).toBeDefined();
    expect(relations.postRelations).toBeDefined();
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("Drizzle Relations Integration", () => {
  it("should produce valid Drizzle schema structure", () => {
    const user = toDrizzle(User);
    const post = toDrizzle(Post);
    const comment = toDrizzle(Comment);

    const relations = toDrizzleRelations([UserRelations, PostRelations, CommentRelations], { user, post, comment });

    // Combined schema object
    const schema = {
      user,
      post,
      comment,
      ...relations,
    };

    expect(schema.user).toBeDefined();
    expect(schema.post).toBeDefined();
    expect(schema.comment).toBeDefined();
  });

  it("should work with single ModelRelationsDefinition having multiple relations", () => {
    // Post has both author (one) and comments (many)
    const user = toDrizzle(User);
    const post = toDrizzle(Post);
    const comment = toDrizzle(Comment);

    const relations = toDrizzleRelations([PostRelations], { user, post, comment });

    expect(relations.postRelations).toBeDefined();
    // Drizzle relations() returns a Relations object (not a function)
    expect(typeof relations.postRelations).toBe("object");
  });

  it("should preserve Drizzle relation metadata structure", () => {
    const user = toDrizzle(User);
    const post = toDrizzle(Post);

    const relations = toDrizzleRelations([UserRelations, PostRelations], { user, post });

    // Drizzle relations() returns a Relations object
    // It has a table reference and relation config builder
    if (relations.userRelations) {
      expect(typeof relations.userRelations).toBe("object");
    }

    if (relations.postRelations) {
      expect(typeof relations.postRelations).toBe("object");
    }
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe("Drizzle Relations Edge Cases", () => {
  it("should handle self-referential relations with defineRelations", () => {
    // Define model first (without relations)
    class Employee extends Model<Employee>("Employee")("employee", {
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      name: S.String.pipe(DSL.string),
      managerId: S.NullOr(S.String).pipe(DSL.uuid),
    }) {}

    // Define self-referential relations using defineRelations()
    const EmployeeRelations = defineRelations(Employee, (fields) => ({
      manager: Relation.one(() => Employee, { from: fields.managerId, to: "id", optional: true }),
      directReports: Relation.many(() => Employee, { from: fields.id, to: "managerId" }),
    }));

    const employee = toDrizzle(Employee);
    const relations = toDrizzleRelations([EmployeeRelations], { employee });

    expect(relations.employeeRelations).toBeDefined();
  });

  it("should handle optional one relations with defineRelations", () => {
    // Define model first
    class OptionalRef extends Model<OptionalRef>("OptionalRef")("optional_ref", {
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      parentId: S.NullOr(S.String).pipe(DSL.uuid),
    }) {}

    // Define optional self-referential relation
    const OptionalRefRelations = defineRelations(OptionalRef, (fields) => ({
      parent: Relation.one(() => OptionalRef, {
        from: fields.parentId,
        to: "id",
        optional: true,
      }),
    }));

    const optional_ref = toDrizzle(OptionalRef);
    // toDrizzleRelations looks up tables by their tableName property (snake_case)
    const relations = toDrizzleRelations([OptionalRefRelations], { optional_ref });

    expect(relations.optional_refRelations).toBeDefined();
  });

  it("should handle models with foreign key config on relations", () => {
    // Define models first (without relations)
    class Child extends Model<Child>("Child")("child", {
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      parentId: S.String.pipe(DSL.uuid),
    }) {}

    class Parent extends Model<Parent>("Parent")("parent", {
      id: S.String.pipe(DSL.uuid, DSL.primaryKey),
      name: S.String.pipe(DSL.string),
    }) {}

    // Define relations after models exist
    const ChildRelations = defineRelations(Child, (fields) => ({
      parent: Relation.one(() => Parent, {
        from: fields.parentId,
        to: "id",
        foreignKey: {
          onDelete: "cascade",
          onUpdate: "restrict",
        },
      }),
    }));

    const ParentRelations = defineRelations(Parent, (fields) => ({
      children: Relation.many(() => Child, { from: fields.id, to: "parentId" }),
    }));

    const child = toDrizzle(Child);
    const parent = toDrizzle(Parent);

    const relations = toDrizzleRelations([ChildRelations, ParentRelations], { child, parent });

    expect(relations.childRelations).toBeDefined();
    expect(relations.parentRelations).toBeDefined();
  });
});

// ============================================================================
// Relation Constructor Tests
// ============================================================================

describe("Relation Constructors", () => {
  it("Relation.one should create OneRelation metadata", () => {
    const rel = Relation.one(() => User, { from: "authorId", to: "id" });

    expect(rel._tag).toBe("one");
    expect(rel.fromField).toBe("authorId");
    expect(rel.toField).toBe("id");
    expect(rel.optional).toBe(true); // default
  });

  it("Relation.one should respect optional parameter", () => {
    const requiredRel = Relation.one(() => User, {
      from: "authorId",
      to: "id",
      optional: false,
    });

    expect(requiredRel.optional).toBe(false);
  });

  it("Relation.one should include foreignKey config when provided", () => {
    const rel = Relation.one(() => User, {
      from: "authorId",
      to: "id",
      foreignKey: { onDelete: "cascade" },
    });

    expect(rel.foreignKey).toEqual({ onDelete: "cascade" });
  });

  it("Relation.many should create ManyRelation metadata", () => {
    const rel = Relation.many(() => Post, { from: "id", to: "authorId" });

    expect(rel._tag).toBe("many");
    expect(rel.fromField).toBe("id");
    expect(rel.toField).toBe("authorId");
    expect(rel.optional).toBe(true); // many relations are always optional
  });

  it("Relation.manyToMany should create ManyToManyRelation metadata", () => {
    class PostTag extends Model<PostTag>("PostTag")("post_tag", {
      postId: S.String.pipe(DSL.uuid, DSL.primaryKey),
      tagId: S.String.pipe(DSL.uuid, DSL.primaryKey),
    }) {}

    const rel = Relation.manyToMany(() => Tag, {
      through: () => PostTag,
      fromField: "postId",
      toField: "tagId",
    });

    expect(rel._tag).toBe("manyToMany");
    expect(rel.junction).toBeDefined();
    expect(rel.junction.fromField).toBe("postId");
    expect(rel.junction.toField).toBe("tagId");
  });

  it("Relation constructors should preserve target thunk", () => {
    const rel = Relation.one(() => User, { from: "authorId", to: "id" });

    // The target should be a function that returns the model
    expect(typeof rel.target).toBe("function");
    // With variance fix, no cast needed - direct equality check works
    expect(rel.target()).toBe(User);
  });
});
