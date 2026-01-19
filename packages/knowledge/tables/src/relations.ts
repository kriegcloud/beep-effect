/**
 * Knowledge table relations
 *
 * Defines Drizzle relations between tables in this slice.
 *
 * @module knowledge-tables/relations
 * @since 0.1.0
 */
import * as d from "drizzle-orm";
import { embedding } from "./tables/embedding.table";
import { entity } from "./tables/entity.table";
import { extraction } from "./tables/extraction.table";
import { mention } from "./tables/mention.table";
import { ontology } from "./tables/ontology.table";
import { relation } from "./tables/relation.table";

/**
 * Embedding table relations.
 *
 * @since 0.1.0
 * @category relations
 */
export const embeddingRelations = d.relations(embedding, (_) => ({}));

/**
 * Entity table relations.
 *
 * Entities belong to extractions and have many mentions.
 *
 * @since 0.1.0
 * @category relations
 */
export const entityRelations = d.relations(entity, ({ many }) => ({
  // Entity has many mentions
  mentions: many(mention),
  // Entity has many outgoing relations (as subject)
  outgoingRelations: many(relation),
}));

/**
 * Relation table relations.
 *
 * Relations connect entities via predicates.
 *
 * @since 0.1.0
 * @category relations
 */
export const relationRelations = d.relations(relation, ({ one }) => ({
  // Relation has one subject entity
  subject: one(entity, {
    fields: [relation.subjectId],
    references: [entity.id],
  }),
  // Relation may have one object entity (for object properties)
  object: one(entity, {
    fields: [relation.objectId],
    references: [entity.id],
  }),
}));

/**
 * Ontology table relations.
 *
 * Ontologies are referenced by entities, relations, and extractions.
 *
 * @since 0.1.0
 * @category relations
 */
export const ontologyRelations = d.relations(ontology, ({ many }) => ({
  // Ontology has many extractions
  extractions: many(extraction),
}));

/**
 * Extraction table relations.
 *
 * Extractions belong to ontologies and produce entities/relations.
 *
 * @since 0.1.0
 * @category relations
 */
export const extractionRelations = d.relations(extraction, ({ one, many }) => ({
  // Extraction uses one ontology
  ontology: one(ontology, {
    fields: [extraction.ontologyId],
    references: [ontology.id],
  }),
  // Extraction produces many mentions
  mentions: many(mention),
}));

/**
 * Mention table relations.
 *
 * Mentions belong to entities and extractions.
 *
 * @since 0.1.0
 * @category relations
 */
export const mentionRelations = d.relations(mention, ({ one }) => ({
  // Mention refers to one entity
  entity: one(entity, {
    fields: [mention.entityId],
    references: [entity.id],
  }),
}));
