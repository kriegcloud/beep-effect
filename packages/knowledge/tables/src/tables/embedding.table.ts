/**
 * Embedding table definition for Knowledge slice
 *
 * Defines the database table schema for the Embedding entity.
 * Replace or rename with your actual domain table definitions.
 *
 * @module knowledge-tables/tables/embedding
 * @since 0.1.0
 */
import {KnowledgeEntityIds} from "@beep/shared-domain";
import {Table} from "@beep/shared-tables";
import {vector768} from "@beep/shared-tables/columns";
import * as pg from "drizzle-orm/pg-core";

/**
 * Embedding table for the knowledge slice.
 *
 * Uses Table.make factory to include standard audit columns
 * (id, createdAt, updatedAt).
 *
 * @since 0.1.0
 * @category tables
 */
export const embedding = Table.make(KnowledgeEntityIds.EmbeddingId)(
  {

    // What this embedding represents
    entityType: pg.text("entity_type").notNull(), // class | entity | claim | example
    entityId: pg.text("entity_id").notNull(),

    // Ontology scoping
    ontologyId: pg.text("ontology_id").notNull().default("default"),

    // The embedding vector (768-dim for Nomic)
    embedding: vector768("embedding").notNull(),

    // Text content for hybrid search
    contentText: pg.text("content_text"),
    // Note: content_tsv is GENERATED ALWAYS in SQL, not exposed to Drizzle

    // Model provenance
    model: pg.text("model").notNull().default("nomic-embed-text-v1.5"),
  },
  (
    // t
  ) =>
    [
      // Unique per (ontology, type, id) - enables upsert
      // pg.uniqueIndex("idx_embeddings_ontology_entity_unique").on(
      //   table.ontologyId,
      //   table.entityType,
      //   table.entityId
      // ),
      // pg.index("idx_embeddings_entity_type_idx").on(table.entityType),
      // pg.index("idx_embeddings_ontology_type_idx").on(table.ontologyId, table.entityType)
      // Note: IVFFlat and GIN indexes are created in migration SQL
    ]
);
