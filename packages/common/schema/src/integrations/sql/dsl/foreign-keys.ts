/**
 * @fileoverview Foreign key extraction and generation utilities.
 *
 * This module provides utilities for extracting foreign key information
 * from DSL models and generating Drizzle-compatible FK constraints.
 *
 * @module integrations/sql/dsl/foreign-keys
 * @since 1.0.0
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import type { ColumnDef, DSL, FieldReference, ForeignKeyAction, ForeignKeySymbol, ModelClass } from "./types";
import { ForeignKeySymbol as FKSymbol } from "./types";

// ============================================================================
// Foreign Key Definitions
// ============================================================================

/**
 * Extracted foreign key definition from model field references.
 * Used to generate Drizzle FK constraints.
 *
 * @since 1.0.0
 * @category types
 */
export interface ForeignKeyDef {
  /** Constraint name (e.g., "posts_author_id_fk") */
  readonly name: string;
  /** Source column names */
  readonly columns: readonly string[];
  /** Target table name */
  readonly foreignTable: string;
  /** Target column names */
  readonly foreignColumns: readonly string[];
  /** ON DELETE action */
  readonly onDelete?: undefined | ForeignKeyAction;
  /** ON UPDATE action */
  readonly onUpdate?: undefined | ForeignKeyAction;
}

// ============================================================================
// Foreign Key Utilities
// ============================================================================

/**
 * Converts a camelCase column name to snake_case for SQL.
 *
 * @param str - camelCase column name
 * @returns snake_case column name
 *
 * @example
 * ```ts
 * toSnakeCase("authorId") // "author_id"
 * toSnakeCase("createdAt") // "created_at"
 * ```
 *
 * @since 1.0.0
 * @category utilities
 * @internal
 */
const toSnakeCase = (str: string): string =>
  F.pipe(str, Str.replace(/([A-Z])/g, "_$1"), Str.toLowerCase, Str.replace(/^_/, ""));

/**
 * Generates a foreign key constraint name following convention.
 *
 * Convention: `${tableName}_${columnName}_fk`
 * Names are lowercased and use underscores.
 *
 * @param tableName - Source table name (snake_case)
 * @param columnName - Source column name (snake_case)
 * @returns Formatted FK constraint name
 *
 * @example
 * ```ts
 * generateForeignKeyName("posts", "author_id") // "posts_author_id_fk"
 * ```
 *
 * @since 1.0.0
 * @category generators
 */
export const generateForeignKeyName = (tableName: string, columnName: string): string =>
  F.pipe(`${tableName}_${columnName}_fk`, Str.toLowerCase);

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a field has foreign key reference metadata.
 *
 * @param field - The field to check
 * @returns True if the field has ForeignKeySymbol metadata
 *
 * @since 1.0.0
 * @category guards
 */
export const hasForeignKeyRef = (
  field: unknown
): field is {
  readonly [K in ForeignKeySymbol]: FieldReference;
} => {
  // Check for both objects and functions since Effect Schema classes are functions
  // but have symbol properties attached to them
  return P.isNotNull(field) && P.or(P.isObject, P.isFunction)(field) && FKSymbol in field;
};

// ============================================================================
// Foreign Key Extraction
// ============================================================================

/**
 * Extracts foreign key definitions from a model's field references.
 *
 * Iterates through the model's fields and collects FK metadata from
 * fields that have the ForeignKeySymbol attached via Field references config.
 *
 * @param model - The DSL model to extract FKs from
 * @returns Array of ForeignKeyDef objects
 *
 * @example
 * ```ts
 * class Post extends Model<Post>("Post")({
 *   authorId: Field(UserId)({
 *     column: { type: "uuid" },
 *     references: { target: () => User, field: "id" },
 *   }),
 * }) {}
 *
 * const fks = extractForeignKeys(Post);
 * // [{ name: "posts_author_id_fk", columns: ["author_id"], foreignTable: "users", ... }]
 * ```
 *
 * @since 1.0.0
 * @category extractors
 */
export const extractForeignKeys = <
  M extends ModelClass<unknown, DSL.Fields, string, Record<string, ColumnDef>, readonly string[], string>,
>(
  model: M
): readonly ForeignKeyDef[] =>
  F.pipe(
    Struct.entries(model._fields),
    A.filterMap(([fieldName, field]): O.Option<ForeignKeyDef> => {
      if (!hasForeignKeyRef(field)) {
        return O.none();
      }

      const ref = field[FKSymbol];
      const targetModel = ref.target();
      const targetTableName = (targetModel as { readonly tableName?: string }).tableName ?? "";
      const targetFieldName = ref.field;

      // Build ForeignKeyDef, only including onDelete/onUpdate if defined
      const fkDef: ForeignKeyDef = {
        name: generateForeignKeyName(model.tableName, toSnakeCase(fieldName)),
        columns: [toSnakeCase(fieldName)] as const,
        foreignTable: targetTableName,
        foreignColumns: [toSnakeCase(targetFieldName)] as const,
        ...(ref.foreignKey?.onDelete !== undefined && { onDelete: ref.foreignKey.onDelete }),
        ...(ref.foreignKey?.onUpdate !== undefined && { onUpdate: ref.foreignKey.onUpdate }),
      };

      return O.some(fkDef);
    })
  );
