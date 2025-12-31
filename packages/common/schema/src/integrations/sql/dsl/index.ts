export { toDrizzle } from "./adapters/drizzle";
export * as DSL from "./combinators";
export { deriveColumnType, deriveSchemaColumnType } from "./derive-column-type";
export * from "./errors";
export { type DSLField, type DSLVariantField, Field, type SchemaColumnError } from "./Field";
export * from "./literals";
export {
  type ExtractColumnsType,
  type ExtractPrimaryKeys,
  Model,
  type ModelClass,
  type ModelConfig,
  type ModelStatics,
} from "./Model";
export { isNullable, isSchemaTypeNullable } from "./nullability";
export * from "./types";
export * from "./validate";

// ============================================================================
// Foreign Key Utilities
// ============================================================================

export {
  extractForeignKeys,
  type ForeignKeyDef,
  generateForeignKeyName,
  hasForeignKeyRef,
} from "./foreign-keys";

// ============================================================================
// Relation Constructors
// ============================================================================

export type {
  ForeignKeyConfig,
  ManyRelation,
  ManyToManyRelation,
  ModelFieldRefs,
  ModelRelationsDefinition,
  OneRelation,
  RelationsInput,
} from "./relations";
export { defineRelations, Relation } from "./relations";

// ============================================================================
// Drizzle Relations Adapter
// ============================================================================

export { aggregateRelations, type RelationGraph, toDrizzleRelations } from "./adapters/drizzle-relations";
