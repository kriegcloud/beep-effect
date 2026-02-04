/**
 * Domain Identity Types
 *
 * Branded types for domain entities to ensure type safety and validation.
 *
 * @since 2.0.0
 * @module Domain/Identity
 */

import { Schema } from "effect"

// =============================================================================
// Identity Types
// =============================================================================

/**
 * Content hash: SHA-256 prefix (16 hex chars)
 * Used for content addressing and versioning.
 */
export const ContentHash = Schema.String.pipe(
  Schema.pattern(/^[a-f0-9]{16}$/),
  Schema.brand("ContentHash"),
  Schema.annotations({
    title: "Content Hash",
    description: "SHA-256 prefix (16 chars) for content addressing"
  })
)
export type ContentHash = typeof ContentHash.Type

/**
 * Full SHA-256 for idempotency keys (64 hex chars)
 */
export const IdempotencyKey = Schema.String.pipe(
  Schema.pattern(/^[a-f0-9]{64}$/),
  Schema.brand("IdempotencyKey"),
  Schema.annotations({
    title: "Idempotency Key",
    description: "Full SHA-256 hash for deduplication"
  })
)
export type IdempotencyKey = typeof IdempotencyKey.Type

/**
 * GCS bucket name (validated)
 */
export const GcsBucket = Schema.String.pipe(
  Schema.pattern(/^[a-z0-9][a-z0-9._-]{1,61}[a-z0-9]$/),
  Schema.brand("GcsBucket"),
  Schema.annotations({
    title: "GCS Bucket",
    description: "Valid Google Cloud Storage bucket name"
  })
)
export type GcsBucket = typeof GcsBucket.Type

/**
 * GCS URI: gs://bucket/object
 */
export const GcsUri = Schema.String.pipe(
  Schema.pattern(/^gs:\/\/[a-z0-9][a-z0-9._-]{1,61}[a-z0-9]\/.+$/),
  Schema.brand("GcsUri"),
  Schema.annotations({
    title: "GCS URI",
    description: "Fully-qualified gs:// URI"
  })
)
export type GcsUri = typeof GcsUri.Type

/**
 * GCS object path (no // or leading/trailing /)
 */
export const GcsObject = Schema.String.pipe(
  Schema.pattern(new RegExp("^[^/].*[^/]$")),
  Schema.filter((s) => !s.includes("//"), {
    message: () => "Path cannot contain //"
  }),
  Schema.brand("GcsObject"),
  Schema.annotations({
    title: "GCS Object Path",
    description: "Valid GCS object path"
  })
)
export type GcsObject = typeof GcsObject.Type

/**
 * Namespace identifier (alphanumeric + hyphens)
 */
export const Namespace = Schema.String.pipe(
  Schema.pattern(/^[a-z][a-z0-9-]*$/),
  Schema.brand("Namespace"),
  Schema.annotations({
    title: "Namespace",
    description: "Ontology namespace (lowercase alphanumeric + hyphens)"
  })
)
export type Namespace = typeof Namespace.Type

/**
 * Ontology name (alphanumeric + hyphens + underscores)
 */
export const OntologyName = Schema.String.pipe(
  Schema.pattern(/^[a-z][a-z0-9_-]*$/),
  Schema.brand("OntologyName"),
  Schema.annotations({
    title: "Ontology Name",
    description: "Ontology name (lowercase alphanumeric + hyphens + underscores)"
  })
)
export type OntologyName = typeof OntologyName.Type

/**
 * Ontology version string: {namespace}/{name}@{hash}
 */
export const OntologyVersion = Schema.String.pipe(
  Schema.pattern(/^[a-z][a-z0-9-]*\/[a-z][a-z0-9_-]*@[a-f0-9]{16}$/),
  Schema.brand("OntologyVersion"),
  Schema.annotations({
    title: "Ontology Version",
    description: "Namespace/name with content hash, e.g. ns/name@deadbeefdeadbeef"
  })
)
export type OntologyVersion = typeof OntologyVersion.Type

// =============================================================================
// Document & Run Identity
// =============================================================================

/**
 * DocumentId: content-derived, deterministic
 * Format: doc-{12 hex chars}
 */
export const DocumentId = Schema.String.pipe(
  Schema.pattern(/^doc-[a-f0-9]{12}$/),
  Schema.brand("DocumentId"),
  Schema.annotations({
    title: "Document ID",
    description: "Deterministic document ID derived from content"
  })
)
export type DocumentId = typeof DocumentId.Type

/**
 * Helper to create DocumentId from content hash
 */
export const documentIdFromHash = (hash: string): DocumentId => `doc-${hash.slice(0, 12)}` as DocumentId

/**
 * ChunkId: parent document + index
 * Format: doc-{hash}-chunk-{n}
 */
export const ChunkId = Schema.String.pipe(
  Schema.pattern(/^doc-[a-f0-9]{12}-chunk-\d+$/),
  Schema.brand("ChunkId"),
  Schema.annotations({
    title: "Chunk ID",
    description: "Unique identifier for a document chunk"
  })
)
export type ChunkId = typeof ChunkId.Type

/**
 * Run ID (DocumentId alias for consistency)
 */
export type ExtractionRunId = DocumentId
export const ExtractionRunId = DocumentId

/**
 * Batch ID: batch-{12 hex}
 */
export const BatchId = Schema.String.pipe(
  Schema.pattern(/^batch-[a-f0-9]{12}$/),
  Schema.brand("BatchId"),
  Schema.annotations({
    title: "Batch ID",
    description: "Deterministic batch identifier (12 hex chars)"
  })
)
export type BatchId = typeof BatchId.Type

/**
 * Build a gs:// URI from bucket + object path
 */
export const toGcsUri = (bucket: string, objectPath: string): GcsUri =>
  `gs://${bucket}/${objectPath.replace(/^\/+/, "")}` as GcsUri

/**
 * Resolve a storage path to a GCS URI
 *
 * If the path is already a gs:// URI, returns it unchanged.
 * Otherwise, constructs a gs:// URI using the provided bucket.
 *
 * @param storagePath - Storage path or gs:// URI
 * @param bucket - Bucket name for local paths
 * @returns GCS URI
 *
 * @example
 * ```ts
 * resolveToGcsUri("gs://bucket/path/file.md", "other") // returns gs://bucket/path/file.md
 * resolveToGcsUri("documents/hash/content.md", "mybucket") // returns gs://mybucket/documents/hash/content.md
 * ```
 */
export const resolveToGcsUri = (storagePath: string, bucket: string): GcsUri => {
  if (storagePath.startsWith("gs://")) {
    return storagePath as GcsUri
  }
  return toGcsUri(bucket, storagePath)
}
