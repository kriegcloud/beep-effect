/**
 * @fileoverview Drizzle ORM relation generation from DSL models.
 *
 * This module provides utilities for converting DSL model relations
 * to Drizzle ORM's defineRelations API format.
 *
 * @module integrations/sql/dsl/adapters/drizzle-relations
 * @since 1.0.0
 */

import { relations as drizzleRelations } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";
import type {
  AnyModelClass,
  AnyRelation,
  ManyRelation as DSLManyRelation,
  ManyToManyRelation as DSLManyToManyRelation,
  OneRelation as DSLOneRelation,
  ModelRelationsDefinition,
  RelationsConfig,
  RelationsInput,
} from "../types";

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for ModelRelationsDefinition objects.
 *
 * Checks if an input is a ModelRelationsDefinition (from `defineRelations()`)
 * rather than a raw model class. Used internally by `aggregateRelations()` and
 * `toDrizzleRelations()` to handle both input patterns.
 *
 * @param input - Either an AnyModelClass or ModelRelationsDefinition
 * @returns `true` if input is a ModelRelationsDefinition
 *
 * @example
 * ```ts
 * const input: RelationsInput = postRelations;
 * if (isModelRelationsDefinition(input)) {
 *   // input.model and input.relations are available
 *   console.log(input.model.identifier);
 * } else {
 *   // input is a raw model class
 *   console.log(input.identifier);
 * }
 * ```
 *
 * @since 1.0.0
 * @category guards
 */
export const isModelRelationsDefinition = (input: RelationsInput): input is ModelRelationsDefinition =>
  input !== null && typeof input === "object" && "_tag" in input && input._tag === "ModelRelationsDefinition";

// ============================================================================
// Relation Graph Types
// ============================================================================

/**
 * Extracts the model from a RelationsInput.
 *
 * - If input is a ModelRelationsDefinition, extracts the `model` property
 * - If input is an AnyModelClass, returns it directly
 *
 * @since 1.0.0
 * @category type-level
 */
type ExtractModel<T extends RelationsInput> = T extends ModelRelationsDefinition<infer M, infer _R> ? M : T;

/**
 * Maps a ReadonlyArray of RelationsInput to a record keyed by model identifier.
 *
 * Similar to ModelsByIdentifier but works with RelationsInput union type.
 *
 * @since 1.0.0
 * @category type-level
 */
type ModelsByIdentifierFromInputs<Inputs extends ReadonlyArray<RelationsInput>> = {
  readonly [I in Inputs[number] as ExtractModel<I>["identifier"]]: ExtractModel<Inputs[number]>;
};

/**
 * Aggregated relation graph from multiple models.
 * Used to build the complete Drizzle relations configuration.
 *
 * The `Models` type parameter preserves literal identifier types, enabling
 * type-safe access to models by name.
 *
 * @example
 * ```ts
 * const graph = aggregateRelations(User, Post);
 * // graph.models.User is typed as typeof User
 * // graph.models.Post is typed as typeof Post
 * ```
 *
 * @since 1.0.0
 * @category types
 */
export interface RelationGraph<Models extends Record<string, AnyModelClass> = Record<string, AnyModelClass>> {
  /** Record of model identifiers to model classes with preserved literal types */
  readonly models: Models;
  /** Record of model identifiers to their relations */
  readonly relations: { readonly [K in keyof Models]: readonly AnyRelation[] };
}

// ============================================================================
// Drizzle Relations Generation
// ============================================================================

/**
 * Aggregates relations from multiple models into a relation graph.
 *
 * Uses rest parameters to accept models and/or ModelRelationsDefinitions
 * and returns a fully typed graph where model identifiers are preserved as literal types.
 *
 * Supports both input patterns:
 * - Raw model classes with static `relations` property (legacy pattern)
 * - ModelRelationsDefinition objects from `defineRelations()` (new pattern)
 *
 * @param inputs - DSL models or ModelRelationsDefinitions
 * @returns RelationGraph containing all models and their relations with preserved types
 *
 * @example
 * ```ts
 * // Legacy pattern: raw models with static relations
 * const graph1 = aggregateRelations(User, Post, Comment);
 * graph1.models.User; // typeof User
 * graph1.relations.User; // readonly AnyRelation[]
 *
 * // New pattern: ModelRelationsDefinition from defineRelations()
 * const userRelations = defineRelations(User, (f) => ({ ... }));
 * const postRelations = defineRelations(Post, (f) => ({ ... }));
 * const graph2 = aggregateRelations(userRelations, postRelations);
 *
 * // Mixed pattern: both raw models and definitions
 * const graph3 = aggregateRelations(Tag, userRelations, postRelations);
 * ```
 *
 * @since 1.0.0
 * @category internal
 */
export const aggregateRelations = <Inputs extends ReadonlyArray<RelationsInput>>(
  ...inputs: Inputs
): RelationGraph<ModelsByIdentifierFromInputs<Inputs>> => {
  const modelRecord: Record<string, AnyModelClass> = {};
  const relationsRecord: Record<string, readonly AnyRelation[]> = {};

  F.pipe(
    inputs,
    A.forEach((input) => {
      if (isModelRelationsDefinition(input)) {
        // New pattern: ModelRelationsDefinition from defineRelations()
        const model = input.model;
        modelRecord[model.identifier] = model;
        relationsRecord[model.identifier] = F.pipe(input.relations, R.values);
      } else {
        // Legacy pattern: raw model with static relations property
        const model = input;
        modelRecord[model.identifier] = model;
        // Check if model has relations property
        const modelWithRelations = model as { relations?: RelationsConfig };
        if (modelWithRelations.relations) {
          relationsRecord[model.identifier] = F.pipe(modelWithRelations.relations, R.values);
        } else {
          relationsRecord[model.identifier] = [];
        }
      }
    })
  );

  return {
    models: modelRecord,
    relations: relationsRecord,
  } as RelationGraph<ModelsByIdentifierFromInputs<Inputs>>;
};

/**
 * Generates Drizzle `relations` configuration from DSL models.
 *
 * Converts all DSL model relations to Drizzle-compatible format that can
 * be spread into the drizzle() client schema.
 *
 * The table name literals are preserved in the return type keys, enabling
 * type-safe relation access.
 *
 * Supports both input patterns:
 * - Raw model classes with static `relations` property (legacy pattern)
 * - ModelRelationsDefinition objects from `defineRelations()` (new pattern)
 *
 * @param inputs - Array of DSL models or ModelRelationsDefinitions
 * @param drizzleTables - Map of table names to Drizzle table objects
 * @returns Record of Drizzle relation configurations for each table
 *
 * @example
 * ```ts
 * import { toDrizzle } from "./drizzle";
 * import { toDrizzleRelations, defineRelations } from "./drizzle-relations";
 *
 * // Generate tables with snake_case names
 * const users = toDrizzle(User);  // User defined with "user" table name
 * const posts = toDrizzle(Post);  // Post defined with "post" table name
 *
 * // Legacy pattern: raw models with static relations
 * const relations1 = toDrizzleRelations(
 *   [User, Post],
 *   { user: users, post: posts }
 * );
 * // typeof relations is { userRelations: ..., postRelations: ... }
 *
 * // New pattern: ModelRelationsDefinition from defineRelations()
 * const userRelations = defineRelations(User, (f) => ({ ... }));
 * const postRelations = defineRelations(Post, (f) => ({ ... }));
 * const relations2 = toDrizzleRelations(
 *   [userRelations, postRelations],
 *   { user: users, post: posts }
 * );
 *
 * // Mixed pattern works too
 * const relations3 = toDrizzleRelations(
 *   [Tag, userRelations, postRelations],
 *   { tag, user: users, post: posts }
 * );
 *
 * // Use in Drizzle client
 * const db = drizzle(connection, {
 *   schema: { user: users, post: posts, ...relations }
 * });
 * ```
 *
 * @since 1.0.0
 * @category generators
 */
export const toDrizzleRelations = <
  Inputs extends readonly RelationsInput[],
  Tables extends Record<string, PgTableWithColumns<any>>,
>(
  inputs: Inputs,
  drizzleTables: Tables
): {
  [I in Inputs[number] as `${ExtractModel<I>["tableName"]}Relations`]: ReturnType<typeof drizzleRelations>;
} => {
  const result: Record<string, ReturnType<typeof drizzleRelations>> = {};

  F.pipe(
    inputs,
    A.forEach((input) => {
      // Extract model and relations from either pattern
      const model: AnyModelClass = isModelRelationsDefinition(input) ? input.model : input;
      const relations: RelationsConfig | undefined = isModelRelationsDefinition(input)
        ? input.relations
        : (model as { relations?: RelationsConfig }).relations;

      const tableName = model.tableName;
      const table = drizzleTables[tableName];
      if (!table) return;

      if (!relations || F.pipe(relations, Struct.keys, A.isEmptyArray)) {
        // No relations defined for this model
        return;
      }

      result[`${tableName}Relations`] = drizzleRelations(table, ({ one, many }) => {
        const relConfig: Record<string, ReturnType<typeof one | typeof many>> = {};

        F.pipe(
          relations,
          Struct.keys,
          A.forEach((relationName) => {
            const relation = relations[relationName];
            if (!relation) return;

            const targetModel = relation.target();
            const targetTableName = (targetModel as { readonly tableName?: string }).tableName;
            const targetTable = targetTableName ? drizzleTables[targetTableName] : undefined;

            if (!targetTable) return;

            Match.value(relation).pipe(
              Match.tags({
                one: (r: DSLOneRelation) => {
                  // Access columns by field name using type-safe lookup
                  // We cast to any since field names are runtime strings
                  const sourceColumn = (table as Record<string, unknown>)[r.fromField];
                  const targetColumn = (targetTable as Record<string, unknown>)[r.toField];

                  if (sourceColumn && targetColumn) {
                    relConfig[relationName] = one(targetTable, {
                      fields: [sourceColumn as any],
                      references: [targetColumn as any],
                    });
                  }
                },
                many: (_r: DSLManyRelation) => {
                  relConfig[relationName] = many(targetTable, {
                    relationName: relationName,
                  });
                },
                manyToMany: (_r: DSLManyToManyRelation) => {
                  // Many-to-many needs special handling through junction table
                  // For now, skip - user should define explicit relations on junction table
                  // The junction table will have two "one" relations (one to each side)
                  // and each side will have a "many" to the junction
                },
              }),
              Match.exhaustive
            );
          })
        );

        return relConfig;
      });
    })
  );

  return result as {
    [I in Inputs[number] as `${ExtractModel<I>["tableName"]}Relations`]: ReturnType<typeof drizzleRelations>;
  };
};
