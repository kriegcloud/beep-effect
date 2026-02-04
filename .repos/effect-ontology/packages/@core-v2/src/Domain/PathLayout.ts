/**
 * Domain Path Layout
 *
 * Unified path generation and parsing using Schema.TemplateLiteralParser.
 * Provides a single source of truth for all storage paths.
 *
 * @since 2.0.0
 * @module Domain/PathLayout
 */

import { Schema } from "effect"
import type { BatchId } from "./Identity.js"
import { ContentHash, DocumentId, Namespace, OntologyName } from "./Identity.js"

// =============================================================================
// Ontology Paths
// =============================================================================

/**
 * Schema for ontology file path
 * Parses: "ontologies/{namespace}/{name}/{hash}/ontology.ttl"
 * Into: [Namespace, OntologyName, ContentHash]
 */
export const OntologyFilePath = Schema.TemplateLiteralParser(
  Schema.Literal("ontologies/"),
  Namespace,
  Schema.Literal("/"),
  OntologyName,
  Schema.Literal("/"),
  ContentHash,
  Schema.Literal("/ontology.ttl")
)

/**
 * Manifest path (for "latest" resolution)
 * Parses: "ontologies/{namespace}/{name}/manifest.json"
 */
export const OntologyManifestPath = Schema.TemplateLiteralParser(
  Schema.Literal("ontologies/"),
  Namespace,
  Schema.Literal("/"),
  OntologyName,
  Schema.Literal("/manifest.json")
)

export type OntologyFilePathTuple = typeof OntologyFilePath.Type
export type OntologyFilePathEncoded = typeof OntologyFilePath.Encoded

// =============================================================================
// Batch Paths (using string functions - Schema.TemplateLiteral doesn't support branded types)
// =============================================================================

/**
 * Batch path helpers - generate paths from branded IDs
 *
 * Note: We use plain string functions instead of Schema.TemplateLiteral
 * because TemplateLiteral doesn't support branded refinement types.
 */
const makeBatchPath = (batchId: BatchId, suffix: string): string => `batches/${batchId}/${suffix}`

const makeDocumentPath = (documentId: DocumentId, suffix: string): string => `documents/${documentId}/${suffix}`

// Type aliases for documentation (the actual types are just strings)
export type BatchStatusPath = string
export type BatchManifestPath = string
export type BatchResolutionPath = string
export type BatchValidationGraphPath = string
export type BatchValidationReportPath = string
export type BatchCanonicalPath = string
export type BatchEnrichedManifestPath = string
export type DocumentMetadataPath = string
export type DocumentInputPath = string
export type DocumentGraphPath = string

// =============================================================================
// Run Paths
// =============================================================================

/**
 * Run metadata: runs/{docId}/metadata.json
 */
export const RunMetadataPath = Schema.TemplateLiteralParser(
  Schema.Literal("runs/"),
  DocumentId,
  Schema.Literal("/metadata.json")
)

/**
 * Run input: runs/{docId}/input/document.txt
 */
export const RunInputPath = Schema.TemplateLiteralParser(
  Schema.Literal("runs/"),
  DocumentId,
  Schema.Literal("/input/document.txt")
)

/**
 * Chunk path: runs/{docId}/input/chunks/chunk-{n}.txt
 */
export const RunChunkPath = Schema.TemplateLiteralParser(
  Schema.Literal("runs/"),
  DocumentId,
  Schema.Literal("/input/chunks/chunk-"),
  Schema.NumberFromString,
  Schema.Literal(".txt")
)

/**
 * Output types
 */
export const OutputType = Schema.Literal(
  "entities",
  "relations",
  "knowledge-graph",
  "resolved-graph",
  "turtle",
  "jsonld"
)
export type OutputType = typeof OutputType.Type

// Output file mapping
const outputFilename: Record<OutputType, string> = {
  entities: "entities.json",
  relations: "relations.json",
  "knowledge-graph": "knowledge-graph.json",
  "resolved-graph": "resolved-graph.json",
  turtle: "graph.ttl",
  jsonld: "graph.jsonld"
}

/*
 * Note for RunOutputPath:
 * Validating the filename exactly requires a dynamic literal which TemplateLiteralParser
 * doesn't support easily for a generic "filename" slot if we want to constrain it to specific values.
 * For now, we'll verify the logic in the factory method.
 */

/**
 * Run output: runs/{docId}/outputs/{filename}
 */
export const RunOutputPath = Schema.TemplateLiteralParser(
  Schema.Literal("runs/"),
  DocumentId,
  Schema.Literal("/outputs/"),
  Schema.String // filename
)

// =============================================================================
// Image Paths
// =============================================================================

// Type aliases for image paths
export type ImageOriginalPath = string
export type ImageMetadataPath = string
export type ImageLabelsPath = string
export type ImageVariantPath = string
export type ImageManifestPath = string

/**
 * Image variant size options
 */
export const ImageVariantSize = Schema.Literal("thumb", "medium")
export type ImageVariantSize = typeof ImageVariantSize.Type

/**
 * Image owner type (for manifest organization)
 */
export const ImageOwnerType = Schema.Literal("link", "document")
export type ImageOwnerType = typeof ImageOwnerType.Type

// =============================================================================
// Canonical Namespace Paths
// =============================================================================

// Type alias for canonical paths (Schema.TemplateLiteral doesn't support branded types)
export type CanonicalNamespacePath = string

// =============================================================================
// PathLayout Service
// =============================================================================

/**
 * Unified path operations
 */
export const PathLayout = {
  // ONTOLOGY
  ontology: {
    encode: (ns: Namespace, name: OntologyName, hash: ContentHash) => `ontologies/${ns}/${name}/${hash}/ontology.ttl`,

    decode: (path: string) => {
      const tuple = Schema.decodeUnknownSync(OntologyFilePath)(path)
      // Return only the variable parts: [ns, name, hash]
      return [tuple[1], tuple[3], tuple[5]] as const
    },

    manifest: (ns: Namespace, name: OntologyName) => `ontologies/${ns}/${name}/manifest.json`
  },

  // BATCH
  batch: {
    status: (batchId: BatchId): BatchStatusPath => makeBatchPath(batchId, "status.json"),
    manifest: (batchId: BatchId): BatchManifestPath => makeBatchPath(batchId, "manifest.json"),
    resolution: (batchId: BatchId): BatchResolutionPath => makeBatchPath(batchId, "resolution/merged.ttl"),
    validationGraph: (batchId: BatchId): BatchValidationGraphPath => makeBatchPath(batchId, "validation/validated.ttl"),
    validationReport: (batchId: BatchId): BatchValidationReportPath => makeBatchPath(batchId, "validation/report.json"),
    canonical: (batchId: BatchId): BatchCanonicalPath => makeBatchPath(batchId, "canonical/final.ttl"),
    enrichedManifest: (batchId: BatchId): BatchEnrichedManifestPath =>
      makeBatchPath(batchId, "preprocessing/enriched-manifest.json"),
    // Additional batch paths for ingestion
    ingestManifest: (batchId: BatchId): string => makeBatchPath(batchId, "ingest/manifest.json"),
    finalOutput: (batchId: BatchId): string => makeBatchPath(batchId, "ingest/output.ttl"),
    // Inference output path
    inference: (batchId: BatchId): string => makeBatchPath(batchId, "inference/enriched.ttl")
  },

  // DOCUMENT
  document: {
    metadata: (docId: DocumentId): DocumentMetadataPath => makeDocumentPath(docId, "metadata.json"),
    input: (docId: DocumentId): DocumentInputPath => makeDocumentPath(docId, "input/content.txt"),
    graph: (docId: DocumentId): DocumentGraphPath => makeDocumentPath(docId, "extraction/graph.ttl")
  },

  // RUN
  run: {
    metadata: (docId: DocumentId) => `runs/${docId}/metadata.json`,

    input: (docId: DocumentId) => `runs/${docId}/input/document.txt`,

    chunk: (docId: DocumentId, index: number) => `runs/${docId}/input/chunks/chunk-${index}.txt`,

    output: (docId: DocumentId, type: OutputType) => `runs/${docId}/outputs/${outputFilename[type]}`,

    // Parse (decode) helpers - return variable parts
    parseMetadata: (path: string) => {
      const tuple = Schema.decodeUnknownSync(RunMetadataPath)(path)
      return tuple[1]
    },

    parseChunk: (path: string) => {
      const tuple = Schema.decodeUnknownSync(RunChunkPath)(path)
      return [tuple[1], tuple[3]] as const // [docId, index]
    },

    parseOutput: (path: string) => {
      const tuple = Schema.decodeUnknownSync(RunOutputPath)(path)
      return [tuple[1], tuple[3]] as const // [docId, filename]
    }
  },

  // CANONICAL
  canonical: (ns: Namespace) => ({
    entities: `canonical/${ns}/entities.ttl` as CanonicalNamespacePath
  }),

  // IMAGE
  image: {
    /**
     * Original image bytes: assets/images/{hash}/original
     */
    original: (hash: string): ImageOriginalPath => `assets/images/${hash}/original`,

    /**
     * Image metadata: assets/images/{hash}/metadata.json
     */
    metadata: (hash: string): ImageMetadataPath => `assets/images/${hash}/metadata.json`,

    /**
     * Image labels (optional): assets/images/{hash}/labels.json
     */
    labels: (hash: string): ImageLabelsPath => `assets/images/${hash}/labels.json`,

    /**
     * Image variant: assets/images/{hash}/variants/{size}.jpg
     */
    variant: (hash: string, size: ImageVariantSize): ImageVariantPath => `assets/images/${hash}/variants/${size}.jpg`,

    /**
     * Owner image manifest: assets/owners/{ownerType}/{ownerId}/images/manifest.json
     */
    manifest: (ownerType: ImageOwnerType, ownerId: string): ImageManifestPath =>
      `assets/owners/${ownerType}/${ownerId}/images/manifest.json`,

    /**
     * Base path for all images of an owner
     */
    ownerBase: (ownerType: ImageOwnerType, ownerId: string): string => `assets/owners/${ownerType}/${ownerId}/images`
  }
} as const
