/**
 * @fileoverview Relation constructors for DSL models.
 *
 * This module provides relation constructors for defining relationships
 * between DSL models. Relations are used to generate Drizzle ORM relations
 * and foreign key constraints.
 *
 * @module integrations/sql/dsl/relations
 * @since 1.0.0
 */

import * as R from "effect/Record";
import type {
  AnyModelClass,
  ForeignKeyConfig,
  ManyRelation,
  ManyToManyRelation,
  ModelFieldRefs,
  ModelRelationsDefinition,
  OneRelation,
  RelationsConfig,
} from "./types.ts";

// ============================================================================
// Relation Constructors
// ============================================================================

/**
 * Relation constructors for defining model relationships.
 *
 * Use these to declare relations at the Model level via the `relations` config.
 * All target references use lazy thunks `() => Model` to handle circular dependencies.
 *
 * @example
 * ```ts
 * class Post extends Model<Post>("Post")({
 *   id: Field(PostId)({ column: { type: "uuid", primaryKey: true } }),
 *   authorId: Field(UserId)({ column: { type: "uuid" } }),
 * }, {
 *   relations: {
 *     author: Relation.one(() => User, { from: "authorId", to: "id" }),
 *     comments: Relation.many(() => Comment, { from: "id", to: "postId" }),
 *   },
 * }) {}
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export const Relation = {
  /**
   * Creates a one-to-one or many-to-one relation (from FK side).
   *
   * Use this when the current model has a foreign key column pointing
   * to another model's primary key.
   *
   * @param target - Thunk returning the target model (lazy for circular deps)
   * @param config - Relation configuration
   * @returns OneRelation metadata object
   *
   * @example
   * ```ts
   * // Post.authorId -> User.id
   * relations: {
   *   author: Relation.one(() => User, {
   *     from: "authorId",
   *     to: "id",
   *     optional: false, // author is required
   *     foreignKey: { onDelete: "cascade" },
   *   }),
   * }
   * ```
   *
   * @since 1.0.0
   */
  one: <Target extends AnyModelClass, FromField extends string, ToField extends string>(
    target: () => Target,
    config: {
      readonly from: FromField;
      readonly to: ToField;
      readonly optional?: boolean;
      readonly foreignKey?: ForeignKeyConfig;
    }
  ): OneRelation<Target, FromField, ToField> => {
    const base = {
      _tag: "one" as const,
      target,
      fromField: config.from,
      toField: config.to,
      optional: config.optional ?? true,
    };
    // Only include foreignKey if defined (exactOptionalPropertyTypes compliance)
    return config.foreignKey !== undefined ? { ...base, foreignKey: config.foreignKey } : base;
  },

  /**
   * Creates a one-to-many relation (from PK side).
   *
   * Use this when another model has a foreign key pointing to this model.
   * This is the "reverse" side of a Relation.one.
   *
   * @param target - Thunk returning the target model
   * @param config - Relation configuration
   * @returns ManyRelation metadata object
   *
   * @example
   * ```ts
   * // User.id <- Post.authorId (User has many Posts)
   * relations: {
   *   posts: Relation.many(() => Post, {
   *     from: "id",
   *     to: "authorId",
   *   }),
   * }
   * ```
   *
   * @since 1.0.0
   */
  many: <Target extends AnyModelClass, FromField extends string, ToField extends string>(
    target: () => Target,
    config: {
      readonly from: FromField;
      readonly to: ToField;
    }
  ): ManyRelation<Target, FromField, ToField> => ({
    _tag: "many" as const,
    target,
    fromField: config.from,
    toField: config.to,
    optional: true,
  }),

  /**
   * Creates a many-to-many relation through a junction table.
   *
   * Use this when two models have a many-to-many relationship
   * via a junction/pivot table.
   *
   * @param target - Thunk returning the target model
   * @param config - Junction table configuration
   * @returns ManyToManyRelation metadata object
   *
   * @example
   * ```ts
   * // User <-> Group via UserGroup junction table
   * // User model:
   * relations: {
   *   groups: Relation.manyToMany(() => Group, {
   *     through: () => UserGroup,
   *     fromField: "userId",
   *     toField: "groupId",
   *   }),
   * }
   * ```
   *
   * @since 1.0.0
   */
  manyToMany: <
    Target extends AnyModelClass,
    Junction extends AnyModelClass,
    FromField extends string,
    ToField extends string,
  >(
    target: () => Target,
    config: {
      readonly through: () => Junction;
      readonly fromField: FromField;
      readonly toField: ToField;
    }
  ): ManyToManyRelation<Target, FromField, ToField, Junction> => ({
    _tag: "manyToMany" as const,
    target,
    fromField: config.fromField,
    toField: config.toField,
    optional: true,
    junction: {
      through: config.through,
      fromField: config.fromField,
      toField: config.toField,
    },
  }),
};

// ============================================================================
// defineRelations Pattern
// ============================================================================

/**
 * Defines relations for a model using a callback pattern.
 *
 * This pattern breaks circular type dependencies by:
 * 1. Requiring the model to be fully defined first
 * 2. Deferring relation type evaluation via callback
 * 3. Providing typed field references for compile-time validation
 *
 * ## Why Use This Pattern
 *
 * When defining relations inline in `ModelConfig`, TypeScript produces circular
 * reference errors because the type is evaluated during class inheritance resolution.
 * By using `defineRelations()` after all models are defined, we break the cycle:
 *
 * ```ts
 * // Models defined first (no circular refs)
 * class User extends Model<User>("User")("user", { ... }) {}
 * class Post extends Model<Post>("Post")("post", { ... }) {}
 *
 * // Relations defined after (callback defers type evaluation)
 * const postRelations = defineRelations(Post, (fields) => ({
 *   author: Relation.one(() => User, { from: fields.authorId, to: "id" }),
 * }));
 * ```
 *
 * @param model - The fully-defined DSL model class
 * @param config - Callback receiving typed field refs, returning relations config
 * @returns ModelRelationsDefinition bundling model with relations
 *
 * @example
 * ```ts
 * // Basic usage with field autocomplete
 * const postRelations = defineRelations(Post, (fields) => ({
 *   author: Relation.one(() => User, { from: fields.authorId, to: "id" }),
 *   comments: Relation.many(() => Comment, { from: fields.id, to: "postId" }),
 * }));
 *
 * // Self-referential relations
 * const employeeRelations = defineRelations(Employee, (fields) => ({
 *   manager: Relation.one(() => Employee, { from: fields.managerId, to: fields.id }),
 *   directReports: Relation.many(() => Employee, { from: fields.id, to: "managerId" }),
 * }));
 *
 * // Use with toDrizzleRelations
 * const relations = toDrizzleRelations([postRelations, employeeRelations], tables);
 * ```
 *
 * @since 1.0.0
 * @category constructors
 */
export const defineRelations = <M extends AnyModelClass, R extends RelationsConfig>(
  model: M,
  config: (fields: ModelFieldRefs<M>) => R
): ModelRelationsDefinition<M, R> => {
  // Build field refs object - maps field names to themselves as string literals
  // Using Record.map to iterate over model._fields and create { fieldName: "fieldName" }
  const fieldRefs = R.map(model._fields, (_, key) => key) as ModelFieldRefs<M>;

  // Evaluate the config callback with field refs
  const relations = config(fieldRefs);

  return {
    _tag: "ModelRelationsDefinition",
    model,
    relations,
  };
};

// ============================================================================
// Relation Type Exports
// ============================================================================

export type {
  ForeignKeyConfig,
  ManyRelation,
  ManyToManyRelation,
  ModelFieldRefs,
  ModelRelationsDefinition,
  OneRelation,
  RelationsInput,
} from "./types.ts";
