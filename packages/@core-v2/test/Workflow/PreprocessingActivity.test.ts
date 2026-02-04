/**
 * Preprocessing Activity Tests
 *
 * Unit tests for preprocessing activity schemas and helper functions.
 */

import { Schema } from "effect"
import { describe, expect, it } from "vitest"
import type { BatchId, GcsUri } from "../../src/Domain/Identity.js"
import { PathLayout } from "../../src/Domain/PathLayout.js"
import { PreprocessingActivityInput, PreprocessingActivityOutput } from "../../src/Domain/Schema/DocumentMetadata.js"
import { PreprocessingOutput } from "../../src/Workflow/DurableActivities.js"

// -----------------------------------------------------------------------------
// Test Fixtures
// -----------------------------------------------------------------------------

const testBatchId = "batch-abc123def456" as BatchId

const makeGcsUri = (path: string): GcsUri => `gs://test-bucket/${path}` as GcsUri

// -----------------------------------------------------------------------------
// Schema Validation Tests
// -----------------------------------------------------------------------------

describe("PreprocessingActivity Schemas", () => {
  describe("PreprocessingActivityInput", () => {
    it("decodes valid preprocessing input", () => {
      const raw = {
        batchId: testBatchId,
        manifestUri: makeGcsUri("batches/batch-abc123def456/manifest.json")
      }

      const result = Schema.decodeUnknownSync(PreprocessingActivityInput)(raw)

      expect(result.batchId).toBe(testBatchId)
      expect(result.manifestUri).toContain("gs://")
      expect(result.skipClassification).toBeUndefined()
    })

    it("decodes input with skipClassification option", () => {
      const raw = {
        batchId: testBatchId,
        manifestUri: makeGcsUri("batches/batch-abc123def456/manifest.json"),
        skipClassification: true
      }

      const result = Schema.decodeUnknownSync(PreprocessingActivityInput)(raw)

      expect(result.skipClassification).toBe(true)
    })

    it("rejects missing required fields", () => {
      const raw = {
        batchId: testBatchId
        // missing manifestUri
      }

      expect(() => Schema.decodeUnknownSync(PreprocessingActivityInput)(raw)).toThrow()
    })

    it("rejects invalid batch ID format", () => {
      const raw = {
        batchId: "invalid", // doesn't match batch-xxxxxxxxxxxx
        manifestUri: makeGcsUri("batches/batch-abc123def456/manifest.json")
      }

      expect(() => Schema.decodeUnknownSync(PreprocessingActivityInput)(raw)).toThrow()
    })

    it("rejects invalid GCS URI format", () => {
      const raw = {
        batchId: testBatchId,
        manifestUri: "/local/path/manifest.json" // not gs://
      }

      expect(() => Schema.decodeUnknownSync(PreprocessingActivityInput)(raw)).toThrow()
    })
  })

  describe("PreprocessingActivityOutput", () => {
    it("decodes valid preprocessing output", () => {
      const raw = {
        enrichedManifestUri: makeGcsUri("batches/batch-abc123def456/preprocessing/enriched-manifest.json"),
        stats: {
          totalDocuments: 10,
          classifiedCount: 8,
          failedCount: 2,
          totalEstimatedTokens: 50000,
          preprocessingDurationMs: 5000,
          averageComplexity: 0.45,
          documentTypeDistribution: {
            article: 5,
            report: 3,
            unknown: 2
          }
        },
        durationMs: 5000
      }

      const result = Schema.decodeUnknownSync(PreprocessingActivityOutput)(raw)

      expect(result.enrichedManifestUri).toContain("gs://")
      expect(result.stats.totalDocuments).toBe(10)
      expect(result.stats.classifiedCount).toBe(8)
    })

    it("rejects negative document counts", () => {
      const raw = {
        enrichedManifestUri: makeGcsUri("path/manifest.json"),
        stats: {
          totalDocuments: -1, // invalid
          classifiedCount: 0,
          failedCount: 0,
          totalEstimatedTokens: 0,
          preprocessingDurationMs: 0,
          averageComplexity: 0.5,
          documentTypeDistribution: {}
        },
        durationMs: 0
      }

      expect(() => Schema.decodeUnknownSync(PreprocessingActivityOutput)(raw)).toThrow()
    })

    it("rejects invalid complexity score", () => {
      const raw = {
        enrichedManifestUri: makeGcsUri("path/manifest.json"),
        stats: {
          totalDocuments: 1,
          classifiedCount: 1,
          failedCount: 0,
          totalEstimatedTokens: 100,
          preprocessingDurationMs: 100,
          averageComplexity: 1.5, // invalid - must be 0-1
          documentTypeDistribution: {}
        },
        durationMs: 100
      }

      expect(() => Schema.decodeUnknownSync(PreprocessingActivityOutput)(raw)).toThrow()
    })
  })

  describe("PreprocessingOutput (Activity Schema)", () => {
    it("decodes valid activity output", () => {
      const raw = {
        enrichedManifestUri: makeGcsUri("batches/batch-abc123def456/preprocessing/enriched-manifest.json"),
        totalDocuments: 10,
        classifiedCount: 8,
        failedCount: 2,
        totalEstimatedTokens: 50000,
        averageComplexity: 0.45,
        durationMs: 5000
      }

      const result = Schema.decodeUnknownSync(PreprocessingOutput)(raw)

      expect(result.enrichedManifestUri).toContain("gs://")
      expect(result.totalDocuments).toBe(10)
      expect(result.classifiedCount).toBe(8)
      expect(result.failedCount).toBe(2)
    })

    it("accepts zero values", () => {
      const raw = {
        enrichedManifestUri: makeGcsUri("path/manifest.json"),
        totalDocuments: 0,
        classifiedCount: 0,
        failedCount: 0,
        totalEstimatedTokens: 0,
        averageComplexity: 0,
        durationMs: 0
      }

      const result = Schema.decodeUnknownSync(PreprocessingOutput)(raw)

      expect(result.totalDocuments).toBe(0)
      expect(result.averageComplexity).toBe(0)
    })
  })
})

describe("PreprocessingActivity Integration", () => {
  it("PathLayout generates correct enriched manifest path", () => {
    const batchId = "batch-abc123def456" as BatchId

    const path = PathLayout.batch.enrichedManifest(batchId)

    expect(path).toBe("batches/batch-abc123def456/preprocessing/enriched-manifest.json")
  })

  it("enriched manifest path is distinct from regular manifest", () => {
    const batchId = "batch-abc123def456" as BatchId

    const regularManifest = PathLayout.batch.manifest(batchId)
    const enrichedManifest = PathLayout.batch.enrichedManifest(batchId)

    expect(regularManifest).not.toBe(enrichedManifest)
    expect(regularManifest).toBe("batches/batch-abc123def456/manifest.json")
    expect(enrichedManifest).toBe("batches/batch-abc123def456/preprocessing/enriched-manifest.json")
  })
})
