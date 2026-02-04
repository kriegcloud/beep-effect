/**
 * Tests for Domain Schema - DocumentMetadata
 *
 * Tests for document preprocessing schemas including classification types,
 * chunking strategies, and enriched manifests.
 *
 * @module test/Domain/Schema/DocumentMetadata
 */

import { Schema } from "effect"
import { describe, expect, it } from "vitest"
import type { BatchId, DocumentId, GcsUri, Namespace, OntologyVersion } from "../../../src/Domain/Identity.js"
import {
  ChunkingParams,
  ChunkingStrategy,
  ComplexityScore,
  computePriority,
  defaultChunkingParams,
  defaultDocumentMetadata,
  DocumentMetadata,
  DocumentType,
  EnrichedManifest,
  EntityDensity,
  estimateTokens,
  LanguageCode,
  PreprocessingActivityInput,
  PreprocessingActivityOutput,
  PreprocessingStats,
  selectChunkingStrategy
} from "../../../src/Domain/Schema/DocumentMetadata.js"

describe("DocumentMetadata Schema", () => {
  // === Test Data ===
  const validDocId = "doc-0123456789ab" as DocumentId
  const validGcsUri = "gs://bucket/path/doc.txt" as GcsUri
  const validBatchId = "batch-0123456789ab" as BatchId
  const validOntologyVersion = "test/ontology@a1b2c3d4e5f6dead" as OntologyVersion
  const validNamespace = "example-ns" as Namespace

  describe("DocumentType", () => {
    it("accepts valid document types", () => {
      const types = [
        "article",
        "transcript",
        "report",
        "contract",
        "correspondence",
        "reference",
        "narrative",
        "structured",
        "unknown"
      ]

      for (const type of types) {
        expect(Schema.decodeSync(DocumentType)(type as DocumentType)).toBe(type)
      }
    })

    it("rejects invalid document types", () => {
      expect(() => Schema.decodeUnknownSync(DocumentType)("invalid")).toThrow()
      expect(() => Schema.decodeUnknownSync(DocumentType)("")).toThrow()
      expect(() => Schema.decodeUnknownSync(DocumentType)(123)).toThrow()
    })
  })

  describe("EntityDensity", () => {
    it("accepts valid density values", () => {
      expect(Schema.decodeSync(EntityDensity)("sparse")).toBe("sparse")
      expect(Schema.decodeSync(EntityDensity)("moderate")).toBe("moderate")
      expect(Schema.decodeSync(EntityDensity)("dense")).toBe("dense")
    })

    it("rejects invalid density values", () => {
      expect(() => Schema.decodeUnknownSync(EntityDensity)("very_dense")).toThrow()
      expect(() => Schema.decodeUnknownSync(EntityDensity)("")).toThrow()
    })
  })

  describe("ChunkingStrategy", () => {
    it("accepts valid chunking strategies", () => {
      const strategies = [
        "standard",
        "fine_grained",
        "high_overlap",
        "section_aware",
        "speaker_aware",
        "paragraph_based"
      ]

      for (const strategy of strategies) {
        expect(Schema.decodeSync(ChunkingStrategy)(strategy as ChunkingStrategy)).toBe(strategy)
      }
    })

    it("rejects invalid strategies", () => {
      expect(() => Schema.decodeUnknownSync(ChunkingStrategy)("custom")).toThrow()
    })
  })

  describe("LanguageCode", () => {
    it("accepts valid ISO 639-1 codes", () => {
      expect(Schema.decodeSync(LanguageCode)("en")).toBe("en")
      expect(Schema.decodeSync(LanguageCode)("es")).toBe("es")
      expect(Schema.decodeSync(LanguageCode)("fr")).toBe("fr")
      expect(Schema.decodeSync(LanguageCode)("de")).toBe("de")
    })

    it("rejects invalid language codes", () => {
      expect(() => Schema.decodeSync(LanguageCode)("eng")).toThrow() // 3 chars
      expect(() => Schema.decodeSync(LanguageCode)("e")).toThrow() // 1 char
      expect(() => Schema.decodeSync(LanguageCode)("EN")).toThrow() // uppercase
      expect(() => Schema.decodeSync(LanguageCode)("12")).toThrow() // numbers
    })
  })

  describe("ComplexityScore", () => {
    it("accepts valid scores (0-1)", () => {
      expect(Schema.decodeSync(ComplexityScore)(0)).toBe(0)
      expect(Schema.decodeSync(ComplexityScore)(0.5)).toBe(0.5)
      expect(Schema.decodeSync(ComplexityScore)(1)).toBe(1)
    })

    it("rejects out of range scores", () => {
      expect(() => Schema.decodeSync(ComplexityScore)(-0.1)).toThrow()
      expect(() => Schema.decodeSync(ComplexityScore)(1.1)).toThrow()
      expect(() => Schema.decodeSync(ComplexityScore)(2)).toThrow()
    })
  })

  describe("ChunkingParams", () => {
    it("accepts valid params", () => {
      const params = {
        chunkSize: 500,
        overlapSentences: 2,
        preserveSentences: true
      }
      const decoded = Schema.decodeSync(ChunkingParams)(params)
      expect(decoded.chunkSize).toBe(500)
      expect(decoded.overlapSentences).toBe(2)
      expect(decoded.preserveSentences).toBe(true)
    })

    it("validates chunkSize bounds", () => {
      expect(() =>
        Schema.decodeSync(ChunkingParams)({
          chunkSize: 0,
          overlapSentences: 2
        })
      ).toThrow()

      expect(() =>
        Schema.decodeSync(ChunkingParams)({
          chunkSize: 10001,
          overlapSentences: 2
        })
      ).toThrow()
    })

    it("validates overlapSentences bounds", () => {
      expect(() =>
        Schema.decodeSync(ChunkingParams)({
          chunkSize: 500,
          overlapSentences: -1
        })
      ).toThrow()

      expect(() =>
        Schema.decodeSync(ChunkingParams)({
          chunkSize: 500,
          overlapSentences: 11
        })
      ).toThrow()
    })
  })

  describe("defaultChunkingParams", () => {
    it("has params for all strategies", () => {
      const strategies: Array<ChunkingStrategy> = [
        "standard",
        "fine_grained",
        "high_overlap",
        "section_aware",
        "speaker_aware",
        "paragraph_based"
      ]

      for (const strategy of strategies) {
        expect(defaultChunkingParams[strategy]).toBeDefined()
        expect(defaultChunkingParams[strategy].chunkSize).toBeGreaterThan(0)
        expect(defaultChunkingParams[strategy].overlapSentences).toBeGreaterThanOrEqual(0)
      }
    })

    it("validates default params against schema", () => {
      for (const [, params] of Object.entries(defaultChunkingParams)) {
        expect(() => Schema.decodeSync(ChunkingParams)(params)).not.toThrow()
      }
    })
  })

  describe("DocumentMetadata", () => {
    const validMetadata = {
      documentId: validDocId,
      sourceUri: validGcsUri,
      contentType: "text/plain",
      sizeBytes: 1024,
      ingestedAt: "2024-01-01T00:00:00Z",
      preprocessedAt: "2024-01-01T00:00:00Z",
      title: "Test Document",
      language: "en",
      estimatedTokens: 256,
      documentType: "article" as const,
      domainTags: ["sports", "football"],
      complexityScore: 0.5,
      entityDensityHint: "moderate" as const,
      chunkingStrategy: "standard" as const,
      suggestedChunkSize: 500,
      suggestedOverlap: 2,
      priority: 50,
      estimatedExtractionCost: 512
    }

    it("accepts valid metadata", () => {
      const decoded = Schema.decodeSync(DocumentMetadata)(validMetadata)
      expect(decoded.documentId).toBe(validDocId)
      expect(decoded.documentType).toBe("article")
      expect(decoded.domainTags).toEqual(["sports", "football"])
    })

    it("allows optional title to be undefined", () => {
      const metadataWithoutTitle = { ...validMetadata, title: undefined }
      const decoded = Schema.decodeSync(DocumentMetadata)(metadataWithoutTitle)
      expect(decoded.title).toBeUndefined()
    })

    it("validates estimatedTokens >= 0", () => {
      expect(() =>
        Schema.decodeSync(DocumentMetadata)({
          ...validMetadata,
          estimatedTokens: -1
        })
      ).toThrow()
    })

    it("validates suggestedChunkSize > 0", () => {
      expect(() =>
        Schema.decodeSync(DocumentMetadata)({
          ...validMetadata,
          suggestedChunkSize: 0
        })
      ).toThrow()
    })
  })

  describe("PreprocessingStats", () => {
    it("accepts valid stats", () => {
      const stats = {
        totalDocuments: 100,
        classifiedCount: 95,
        failedCount: 5,
        totalEstimatedTokens: 100000,
        preprocessingDurationMs: 5000,
        averageComplexity: 0.6,
        documentTypeDistribution: { article: 50, report: 30, transcript: 20 }
      }

      const decoded = Schema.decodeSync(PreprocessingStats)(stats)
      expect(decoded.totalDocuments).toBe(100)
      expect(decoded.documentTypeDistribution.article).toBe(50)
    })

    it("validates non-negative counts", () => {
      expect(() =>
        Schema.decodeSync(PreprocessingStats)({
          totalDocuments: -1,
          classifiedCount: 0,
          failedCount: 0,
          totalEstimatedTokens: 0,
          preprocessingDurationMs: 0,
          averageComplexity: 0.5,
          documentTypeDistribution: {}
        })
      ).toThrow()
    })
  })

  describe("EnrichedManifest", () => {
    it("accepts valid manifest", () => {
      const manifest = {
        batchId: validBatchId,
        ontologyUri: validGcsUri,
        ontologyVersion: validOntologyVersion,
        targetNamespace: validNamespace,
        documents: [],
        createdAt: "2024-01-01T00:00:00Z",
        preprocessedAt: "2024-01-01T00:05:00Z",
        preprocessingStats: {
          totalDocuments: 0,
          classifiedCount: 0,
          failedCount: 0,
          totalEstimatedTokens: 0,
          preprocessingDurationMs: 0,
          averageComplexity: 0.5,
          documentTypeDistribution: {}
        }
      }

      const decoded = Schema.decodeSync(EnrichedManifest)(manifest)
      expect(decoded.batchId).toBe(validBatchId)
      expect(decoded.documents).toEqual([])
    })

    it("allows optional shaclUri", () => {
      const manifest = {
        batchId: validBatchId,
        ontologyUri: validGcsUri,
        ontologyVersion: validOntologyVersion,
        shaclUri: "gs://bucket/shapes.ttl" as GcsUri,
        targetNamespace: validNamespace,
        documents: [],
        createdAt: "2024-01-01T00:00:00Z",
        preprocessedAt: "2024-01-01T00:05:00Z",
        preprocessingStats: {
          totalDocuments: 0,
          classifiedCount: 0,
          failedCount: 0,
          totalEstimatedTokens: 0,
          preprocessingDurationMs: 0,
          averageComplexity: 0.5,
          documentTypeDistribution: {}
        }
      }

      const decoded = Schema.decodeSync(EnrichedManifest)(manifest)
      expect(decoded.shaclUri).toBe("gs://bucket/shapes.ttl")
    })
  })

  describe("PreprocessingActivityInput", () => {
    it("accepts valid input", () => {
      const input = {
        batchId: validBatchId,
        manifestUri: validGcsUri
      }
      const decoded = Schema.decodeSync(PreprocessingActivityInput)(input)
      expect(decoded.batchId).toBe(validBatchId)
      expect(decoded.skipClassification).toBeUndefined()
    })

    it("accepts optional skipClassification", () => {
      const input = {
        batchId: validBatchId,
        manifestUri: validGcsUri,
        skipClassification: true
      }
      const decoded = Schema.decodeSync(PreprocessingActivityInput)(input)
      expect(decoded.skipClassification).toBe(true)
    })
  })

  describe("PreprocessingActivityOutput", () => {
    it("accepts valid output", () => {
      const output = {
        enrichedManifestUri: validGcsUri,
        stats: {
          totalDocuments: 10,
          classifiedCount: 10,
          failedCount: 0,
          totalEstimatedTokens: 5000,
          preprocessingDurationMs: 1000,
          averageComplexity: 0.4,
          documentTypeDistribution: { article: 10 }
        },
        durationMs: 1000
      }
      const decoded = Schema.decodeSync(PreprocessingActivityOutput)(output)
      expect(decoded.enrichedManifestUri).toBe(validGcsUri)
      expect(decoded.durationMs).toBe(1000)
    })
  })
})

describe("Helper Functions", () => {
  describe("selectChunkingStrategy", () => {
    it("returns speaker_aware for transcripts", () => {
      const result = selectChunkingStrategy("transcript", "moderate", 0.5)
      expect(result.strategy).toBe("speaker_aware")
      expect(result.chunkSize).toBe(1000)
      expect(result.overlap).toBe(3)
    })

    it("returns section_aware for contracts", () => {
      const result = selectChunkingStrategy("contract", "moderate", 0.5)
      expect(result.strategy).toBe("section_aware")
      expect(result.chunkSize).toBe(800)
    })

    it("returns paragraph_based for articles", () => {
      const result = selectChunkingStrategy("article", "sparse", 0.3)
      expect(result.strategy).toBe("paragraph_based")
      expect(result.chunkSize).toBe(600)
    })

    it("returns paragraph_based for narratives", () => {
      const result = selectChunkingStrategy("narrative", "sparse", 0.3)
      expect(result.strategy).toBe("paragraph_based")
    })

    it("returns fine_grained for dense content", () => {
      const result = selectChunkingStrategy("report", "dense", 0.5)
      expect(result.strategy).toBe("fine_grained")
      expect(result.chunkSize).toBe(300)
      expect(result.overlap).toBe(3)
    })

    it("returns high_overlap for high complexity", () => {
      const result = selectChunkingStrategy("reference", "moderate", 0.9)
      expect(result.strategy).toBe("high_overlap")
      expect(result.chunkSize).toBe(400)
      expect(result.overlap).toBe(4)
    })

    it("returns standard for default cases", () => {
      const result = selectChunkingStrategy("unknown", "moderate", 0.5)
      expect(result.strategy).toBe("standard")
      expect(result.chunkSize).toBe(500)
      expect(result.overlap).toBe(2)
    })
  })

  describe("computePriority", () => {
    it("returns lower priority for simple documents", () => {
      const simple = computePriority(0.2, 500, "sparse")
      const complex = computePriority(0.8, 500, "sparse")
      expect(simple).toBeLessThan(complex)
    })

    it("returns lower priority for smaller documents", () => {
      const small = computePriority(0.5, 500, "moderate")
      const large = computePriority(0.5, 15000, "moderate")
      expect(small).toBeLessThan(large)
    })

    it("returns lower priority for sparse entity density", () => {
      const sparse = computePriority(0.5, 5000, "sparse")
      const dense = computePriority(0.5, 5000, "dense")
      expect(sparse).toBeLessThan(dense)
    })

    it("returns reasonable priority range", () => {
      const priority = computePriority(0.5, 5000, "moderate")
      expect(priority).toBeGreaterThan(0)
      expect(priority).toBeLessThan(100)
    })
  })

  describe("estimateTokens", () => {
    it("estimates ~4 chars per token", () => {
      expect(estimateTokens(400)).toBe(100)
      expect(estimateTokens(1000)).toBe(250)
    })

    it("rounds up for fractional tokens", () => {
      expect(estimateTokens(5)).toBe(2) // 5/4 = 1.25 -> 2
      expect(estimateTokens(1)).toBe(1) // 1/4 = 0.25 -> 1
    })

    it("handles zero", () => {
      expect(estimateTokens(0)).toBe(0)
    })
  })

  describe("defaultDocumentMetadata", () => {
    const docId = "doc-test12345678" as DocumentId
    const gcsUri = "gs://bucket/doc.txt" as GcsUri

    it("creates metadata with default values", () => {
      const now = new Date()
      const metadata = defaultDocumentMetadata(docId, gcsUri, "text/plain", 1000, now)

      expect(metadata.documentId).toBe(docId)
      expect(metadata.sourceUri).toBe(gcsUri)
      expect(metadata.contentType).toBe("text/plain")
      expect(metadata.sizeBytes).toBe(1000)
      expect(metadata.preprocessedAt).toBe(now)
    })

    it("sets default classification values", () => {
      const metadata = defaultDocumentMetadata(
        docId,
        gcsUri,
        "text/plain",
        1000,
        new Date()
      )

      expect(metadata.language).toBe("en")
      expect(metadata.documentType).toBe("unknown")
      expect(metadata.domainTags).toEqual([])
      expect(metadata.complexityScore).toBe(0.5)
      expect(metadata.entityDensityHint).toBe("moderate")
    })

    it("sets default chunking values", () => {
      const metadata = defaultDocumentMetadata(
        docId,
        gcsUri,
        "text/plain",
        1000,
        new Date()
      )

      expect(metadata.chunkingStrategy).toBe("standard")
      expect(metadata.suggestedChunkSize).toBe(500)
      expect(metadata.suggestedOverlap).toBe(2)
    })

    it("estimates tokens from size", () => {
      const metadata = defaultDocumentMetadata(
        docId,
        gcsUri,
        "text/plain",
        4000,
        new Date()
      )

      expect(metadata.estimatedTokens).toBe(1000) // 4000/4
    })

    it("estimates extraction cost from tokens", () => {
      const metadata = defaultDocumentMetadata(
        docId,
        gcsUri,
        "text/plain",
        4000,
        new Date()
      )

      expect(metadata.estimatedExtractionCost).toBe(2000) // tokens * 2
    })

    it("sets default priority", () => {
      const metadata = defaultDocumentMetadata(
        docId,
        gcsUri,
        "text/plain",
        1000,
        new Date()
      )

      expect(metadata.priority).toBe(50)
    })
  })
})
