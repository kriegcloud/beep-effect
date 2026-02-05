import type { Entities } from "@beep/knowledge-domain";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import { extractLocalName } from "../Ontology/constants";

export const formatEntity = (entity: Entities.Entity.Model): string => {
  const types = A.map(entity.types, extractLocalName);
  const typeStr = A.isNonEmptyReadonlyArray(types) ? A.join(types, ", ") : "Unknown";

  const attrEntries = Struct.entries(entity.attributes);
  const attrStr = A.isNonEmptyReadonlyArray(attrEntries)
    ? ` (${A.join(
        A.map(attrEntries, ([k, v]) => `${extractLocalName(k)}: ${String(v)}`),
        ", "
      )})`
    : "";

  return `- ${entity.mention} [${typeStr}]${attrStr}`;
};

export const formatRelation = (
  relation: Entities.Relation.Model,
  entityLookup: MutableHashMap.MutableHashMap<string, Entities.Entity.Model>
): string => {
  const subjectEntityOpt = MutableHashMap.get(entityLookup, relation.subjectId);
  const subjectName = O.isSome(subjectEntityOpt) ? subjectEntityOpt.value.mention : relation.subjectId;
  const predicate = extractLocalName(relation.predicate);

  if (relation.literalValue !== undefined) {
    const type = relation.literalType ? ` (${relation.literalType})` : "";
    return `- ${subjectName} --[${predicate}]--> "${relation.literalValue}"${type}`;
  }

  const objectIdVal = relation.objectId;
  if (objectIdVal !== undefined) {
    const objectIdStr = P.isString(objectIdVal) ? objectIdVal : O.isSome(objectIdVal) ? objectIdVal.value : null;
    if (objectIdStr !== null) {
      const objectEntityOpt = MutableHashMap.get(entityLookup, objectIdStr);
      const objectName = O.isSome(objectEntityOpt) ? objectEntityOpt.value.mention : objectIdStr;
      return `- ${subjectName} --[${predicate}]--> ${objectName}`;
    }
  }

  return `- ${subjectName} --[${predicate}]--> (unknown)`;
};

export const formatContext = (
  entities: ReadonlyArray<Entities.Entity.Model>,
  relations: ReadonlyArray<Entities.Relation.Model>
): string => {
  const entityLookup = MutableHashMap.empty<string, Entities.Entity.Model>();
  A.forEach(entities, (entity) => {
    MutableHashMap.set(entityLookup, entity.id, entity);
  });

  const sections = F.pipe(
    A.empty<string>(),
    (acc) => {
      if (A.isNonEmptyReadonlyArray(entities)) {
        const entityLines = A.map(entities, formatEntity);
        return A.append(acc, `## Entities\n${A.join(entityLines, "\n")}`);
      }
      return acc;
    },
    (acc) => {
      if (A.isNonEmptyReadonlyArray(relations)) {
        const relationLines = A.map(relations, (r) => formatRelation(r, entityLookup));
        return A.append(acc, `## Relations\n${A.join(relationLines, "\n")}`);
      }
      return acc;
    }
  );

  return A.join(sections, "\n\n");
};

export const formatContextWithScores = (
  entities: ReadonlyArray<Entities.Entity.Model>,
  relations: ReadonlyArray<Entities.Relation.Model>,
  scores: MutableHashMap.MutableHashMap<string, number>
): string => {
  const entityLookup = MutableHashMap.empty<string, Entities.Entity.Model>();
  A.forEach(entities, (entity) => {
    MutableHashMap.set(entityLookup, entity.id, entity);
  });

  const sections = F.pipe(
    A.empty<string>(),
    (acc) => {
      if (A.isNonEmptyReadonlyArray(entities)) {
        const entityLines = A.map(entities, (e) => {
          const scoreOpt = MutableHashMap.get(scores, e.id);
          const scoreStr = O.isSome(scoreOpt) ? ` [score: ${scoreOpt.value.toFixed(4)}]` : "";
          return `${formatEntity(e)}${scoreStr}`;
        });
        return A.append(acc, `## Entities\n${A.join(entityLines, "\n")}`);
      }
      return acc;
    },
    (acc) => {
      if (A.isNonEmptyReadonlyArray(relations)) {
        const relationLines = A.map(relations, (r) => formatRelation(r, entityLookup));
        return A.append(acc, `## Relations\n${A.join(relationLines, "\n")}`);
      }
      return acc;
    }
  );

  return A.join(sections, "\n\n");
};

export const estimateTokens = (context: string): number => {
  return Math.ceil(Str.length(context) / 4);
};

export const truncateToTokenBudget = (
  entities: ReadonlyArray<Entities.Entity.Model>,
  relations: ReadonlyArray<Entities.Relation.Model>,
  maxTokens: number
): { readonly context: string; readonly entityCount: number; readonly relationCount: number } => {
  let includedEntities = entities;
  let includedRelations = relations;

  let context = formatContext(includedEntities, includedRelations);
  let tokens = estimateTokens(context);

  if (tokens <= maxTokens) {
    return {
      context,
      entityCount: A.length(includedEntities),
      relationCount: A.length(includedRelations),
    };
  }

  while (tokens > maxTokens && A.isNonEmptyReadonlyArray(includedRelations)) {
    includedRelations = A.take(includedRelations, A.length(includedRelations) - 1);
    context = formatContext(includedEntities, includedRelations);
    tokens = estimateTokens(context);
  }

  while (tokens > maxTokens && A.length(includedEntities) > 1) {
    includedEntities = A.take(includedEntities, A.length(includedEntities) - 1);
    context = formatContext(includedEntities, includedRelations);
    tokens = estimateTokens(context);
  }

  return {
    context,
    entityCount: A.length(includedEntities),
    relationCount: A.length(includedRelations),
  };
};
