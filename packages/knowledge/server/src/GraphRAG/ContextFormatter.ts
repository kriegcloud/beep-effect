/**
 * Context Formatter
 *
 * Formats knowledge graph subgraphs for LLM context.
 *
 * @module knowledge-server/GraphRAG/ContextFormatter
 * @since 0.1.0
 */
import type { Entities } from "@beep/knowledge-domain";
import * as A from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import { extractLocalName } from "../Ontology/constants";

/**
 * Format entity for LLM context
 *
 * @param entity - Entity model
 * @returns Formatted string representation
 *
 * @since 0.1.0
 * @category formatting
 */
export const formatEntity = (entity: Entities.Entity.Model): string => {
  const types = A.map(entity.types, extractLocalName);
  const typeStr = A.isNonEmptyReadonlyArray(types) ? A.join(types, ", ") : "Unknown";

  const attrEntries = Struct.entries(entity.attributes);
  const attrStr = A.isNonEmptyReadonlyArray(attrEntries)
    ? ` (${A.map(attrEntries, ([k, v]) => `${extractLocalName(k)}: ${String(v)}`).join(", ")})`
    : "";

  return `- ${entity.mention} [${typeStr}]${attrStr}`;
};

/**
 * Format relation for LLM context
 *
 * Requires entity lookup to resolve IDs to names.
 *
 * @param relation - Relation model
 * @param entityLookup - Map of entity ID to entity model
 * @returns Formatted string representation
 *
 * @since 0.1.0
 * @category formatting
 */
export const formatRelation = (
  relation: Entities.Relation.Model,
  entityLookup: MutableHashMap.MutableHashMap<string, Entities.Entity.Model>
): string => {
  const subjectEntityOpt = MutableHashMap.get(entityLookup, relation.subjectId);
  const subjectName = O.isSome(subjectEntityOpt) ? subjectEntityOpt.value.mention : relation.subjectId;
  const predicate = extractLocalName(relation.predicate);

  if (relation.literalValue !== undefined) {
    // Literal relation
    const type = relation.literalType ? ` (${relation.literalType})` : "";
    return `- ${subjectName} --[${predicate}]--> "${relation.literalValue}"${type}`;
  }

  // Entity relation - objectId may be Option or string depending on model variant
  const objectIdVal = relation.objectId;
  if (objectIdVal !== undefined) {
    // Handle both Option and direct string cases
    const objectIdStr =
      typeof objectIdVal === "string" ? objectIdVal : O.isSome(objectIdVal) ? objectIdVal.value : null;
    if (objectIdStr !== null) {
      const objectEntityOpt = MutableHashMap.get(entityLookup, objectIdStr);
      const objectName = O.isSome(objectEntityOpt) ? objectEntityOpt.value.mention : objectIdStr;
      return `- ${subjectName} --[${predicate}]--> ${objectName}`;
    }
  }

  return `- ${subjectName} --[${predicate}]--> (unknown)`;
};

/**
 * Format subgraph for LLM context
 *
 * @param entities - Array of entities
 * @param relations - Array of relations
 * @returns Formatted markdown context string
 *
 * @since 0.1.0
 * @category formatting
 */
export const formatContext = (
  entities: ReadonlyArray<Entities.Entity.Model>,
  relations: ReadonlyArray<Entities.Relation.Model>
): string => {
  // Build entity lookup
  const entityLookup = MutableHashMap.empty<string, Entities.Entity.Model>();
  for (const entity of entities) {
    MutableHashMap.set(entityLookup, entity.id, entity);
  }

  const sections: Array<string> = [];

  // Entities section
  if (A.isNonEmptyReadonlyArray(entities)) {
    const entityLines = A.map(entities, formatEntity);
    sections.push(`## Entities\n${A.join(entityLines, "\n")}`);
  }

  // Relations section
  if (A.isNonEmptyReadonlyArray(relations)) {
    const relationLines = A.map(relations, (r) => formatRelation(r, entityLookup));
    sections.push(`## Relations\n${A.join(relationLines, "\n")}`);
  }

  return A.join(sections, "\n\n");
};

/**
 * Format subgraph with scores for debugging/analysis
 *
 * @param entities - Array of entities
 * @param relations - Array of relations
 * @param scores - Map of entity ID to relevance score
 * @returns Formatted context with score annotations
 *
 * @since 0.1.0
 * @category formatting
 */
export const formatContextWithScores = (
  entities: ReadonlyArray<Entities.Entity.Model>,
  relations: ReadonlyArray<Entities.Relation.Model>,
  scores: MutableHashMap.MutableHashMap<string, number>
): string => {
  // Build entity lookup
  const entityLookup = MutableHashMap.empty<string, Entities.Entity.Model>();
  for (const entity of entities) {
    MutableHashMap.set(entityLookup, entity.id, entity);
  }

  const sections = A.empty<string>();

  // Entities section with scores
  if (A.isNonEmptyReadonlyArray(entities)) {
    const entityLines = A.map(entities, (e) => {
      const scoreOpt = MutableHashMap.get(scores, e.id);
      const scoreStr = O.isSome(scoreOpt) ? ` [score: ${scoreOpt.value.toFixed(4)}]` : "";
      return `${formatEntity(e)}${scoreStr}`;
    });
    sections.push(`## Entities\n${A.join(entityLines, "\n")}`);
  }

  // Relations section
  if (A.isNonEmptyReadonlyArray(relations)) {
    const relationLines = A.map(relations, (r) => formatRelation(r, entityLookup));
    sections.push(`## Relations\n${A.join(relationLines, "\n")}`);
  }

  return A.join(sections, "\n\n");
};

/**
 * Estimate token count for formatted context
 *
 * Uses a rough 4 chars per token estimate.
 *
 * @param context - Formatted context string
 * @returns Estimated token count
 *
 * @since 0.1.0
 * @category utilities
 */
export const estimateTokens = (context: string): number => {
  return Math.ceil(context.length / 4);
};

/**
 * Truncate context to fit within token budget
 *
 * Prioritizes entities by score, then includes as many relations as fit.
 *
 * @param entities - Array of entities (should be pre-sorted by relevance)
 * @param relations - Array of relations
 * @param maxTokens - Maximum token budget
 * @returns Truncated context string
 *
 * @since 0.1.0
 * @category formatting
 */
export const truncateToTokenBudget = (
  entities: ReadonlyArray<Entities.Entity.Model>,
  relations: ReadonlyArray<Entities.Relation.Model>,
  maxTokens: number
): { readonly context: string; readonly entityCount: number; readonly relationCount: number } => {
  // Start with all entities
  let includedEntities = entities;
  let includedRelations = relations;

  // Try full context first
  let context = formatContext(includedEntities, includedRelations);
  let tokens = estimateTokens(context);

  // If within budget, return as-is
  if (tokens <= maxTokens) {
    return {
      context,
      entityCount: includedEntities.length,
      relationCount: includedRelations.length,
    };
  }

  // First, remove relations until we fit
  while (tokens > maxTokens && A.isNonEmptyReadonlyArray(includedRelations)) {
    includedRelations = A.take(includedRelations, includedRelations.length - 1);
    context = formatContext(includedEntities, includedRelations);
    tokens = estimateTokens(context);
  }

  // If still over budget, remove entities
  while (tokens > maxTokens && includedEntities.length > 1) {
    includedEntities = A.take(includedEntities, includedEntities.length - 1);
    context = formatContext(includedEntities, includedRelations);
    tokens = estimateTokens(context);
  }

  return {
    context,
    entityCount: includedEntities.length,
    relationCount: includedRelations.length,
  };
};
