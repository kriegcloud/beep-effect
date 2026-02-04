/**
 * OntologyEmbeddings Model
 *
 * Pre-computed embeddings for ontology classes and properties,
 * stored as a blob alongside the ontology file for serverless loading.
 *
 * @since 2.0.0
 * @module Domain/Model/OntologyEmbeddings
 */

import { Schema } from "effect"
import { sha256Sync } from "../../Utils/Hash.js"

/**
 * Embedding for a single ontology element (class or property)
 *
 * @since 2.0.0
 * @category Schema
 */
export const ElementEmbedding = Schema.Struct({
  /** Full IRI of the class or property */
  iri: Schema.String,
  /** Text that was embedded (label + description) */
  text: Schema.String,
  /** Embedding vector */
  embedding: Schema.Array(Schema.Number)
})
export type ElementEmbedding = typeof ElementEmbedding.Type

/**
 * Pre-computed embeddings blob for an ontology
 *
 * Stored as JSON alongside the ontology file:
 * ```
 * gs://bucket/ontologies/{namespace}/{name}/
 *   ├── ontology.ttl
 *   └── embeddings.json
 * ```
 *
 * @since 2.0.0
 * @category Schema
 */
export const OntologyEmbeddings = Schema.Struct({
  /** URI of the ontology this embeddings blob is for */
  ontologyUri: Schema.String,

  /** Version hash - SHA-256 of ontology content for cache invalidation */
  version: Schema.String,

  /** Embedding model identifier (e.g., "nomic-embed-text-v1.5") */
  model: Schema.String,

  /** Embedding vector dimension */
  dimension: Schema.Number,

  /** When embeddings were computed */
  createdAt: Schema.DateTimeUtc,

  /** Embeddings for all owl:Class definitions */
  classes: Schema.Array(ElementEmbedding),

  /** Embeddings for all owl:ObjectProperty and owl:DatatypeProperty definitions */
  properties: Schema.Array(ElementEmbedding)
})
export type OntologyEmbeddings = typeof OntologyEmbeddings.Type

/**
 * JSON codec for OntologyEmbeddings
 *
 * @since 2.0.0
 * @category Codec
 */
export const OntologyEmbeddingsJson = Schema.parseJson(OntologyEmbeddings)

/**
 * Compute version hash from ontology content
 *
 * Uses SHA-256 to create a deterministic version identifier.
 * When ontology content changes, version changes, invalidating embeddings.
 *
 * @param ontologyContent - Raw turtle/RDF content
 * @returns SHA-256 hex hash (first 16 chars for brevity)
 *
 * @since 2.0.0
 * @category Utils
 */
export const computeOntologyVersion = (ontologyContent: string): string => {
  return sha256Sync(ontologyContent)
}

/**
 * Storage path for embeddings blob
 *
 * @param ontologyUri - URI like "gs://bucket/ontologies/football/ontology.ttl"
 * @returns Path for embeddings blob
 *
 * @since 2.0.0
 * @category Utils
 */
export const embeddingsPathFromOntology = (ontologyUri: string): string => {
  // Replace ontology.ttl with embeddings.json
  if (ontologyUri.endsWith(".ttl")) {
    return ontologyUri.replace(/\.ttl$/, "-embeddings.json")
  }
  // Append -embeddings.json if no extension
  return `${ontologyUri}-embeddings.json`
}

/**
 * Build text for embedding from class/property metadata
 *
 * Combines label, description, and alt labels for rich embedding.
 *
 * @param label - Primary label
 * @param description - Optional description/comment
 * @param altLabels - Optional alternative labels
 * @returns Combined text for embedding
 *
 * @since 2.0.0
 * @category Utils
 */
export const buildEmbeddingText = (
  label: string,
  description?: string,
  altLabels?: ReadonlyArray<string>
): string => {
  const parts = [label]
  if (description) parts.push(description)
  if (altLabels && altLabels.length > 0) {
    parts.push(`Also known as: ${altLabels.join(", ")}`)
  }
  return parts.join(". ")
}
