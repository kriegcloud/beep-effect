/**
 * Type verification file for Knowledge tables
 *
 * This file ensures compile-time alignment between domain models
 * and Drizzle table definitions. Type assertions verify that
 * Drizzle InferSelectModel/InferInsertModel types match the
 * corresponding Effect model's Encoded representation.
 *
 * @module knowledge-tables/_check
 * @since 0.1.0
 */
import type {
  ClassDefinition,
  Embedding,
  Entity,
  EntityCluster,
  Extraction,
  Mention,
  Ontology,
  PropertyDefinition,
  Relation,
  SameAsLink,
} from "@beep/knowledge-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type * as tables from "./schema";

// ClassDefinition
export const _checkSelectClassDefinition: typeof ClassDefinition.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.classDefinition
>;

export const _checkInsertClassDefinition: typeof ClassDefinition.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.classDefinition
>;

// Embedding
export const _checkSelectEmbedding: typeof Embedding.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.embedding
>;

export const _checkInsertEmbedding: typeof Embedding.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.embedding
>;

// Entity
export const _checkSelectEntity: typeof Entity.Model.select.Encoded = {} as InferSelectModel<typeof tables.entity>;

export const _checkInsertEntity: typeof Entity.Model.insert.Encoded = {} as InferInsertModel<typeof tables.entity>;

// EntityCluster
export const _checkSelectEntityCluster: typeof EntityCluster.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.entityCluster
>;

export const _checkInsertEntityCluster: typeof EntityCluster.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.entityCluster
>;

// Extraction
export const _checkSelectExtraction: typeof Extraction.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.extraction
>;

export const _checkInsertExtraction: typeof Extraction.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.extraction
>;

// Mention
export const _checkSelectMention: typeof Mention.Model.select.Encoded = {} as InferSelectModel<typeof tables.mention>;

export const _checkInsertMention: typeof Mention.Model.insert.Encoded = {} as InferInsertModel<typeof tables.mention>;

// Ontology
export const _checkSelectOntology: typeof Ontology.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.ontology
>;

export const _checkInsertOntology: typeof Ontology.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.ontology
>;

// PropertyDefinition
export const _checkSelectPropertyDefinition: typeof PropertyDefinition.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.propertyDefinition
>;

export const _checkInsertPropertyDefinition: typeof PropertyDefinition.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.propertyDefinition
>;

// Relation
export const _checkSelectRelation: typeof Relation.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.relation
>;

export const _checkInsertRelation: typeof Relation.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.relation
>;

// SameAsLink
export const _checkSelectSameAsLink: typeof SameAsLink.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.sameAsLink
>;

export const _checkInsertSameAsLink: typeof SameAsLink.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.sameAsLink
>;
