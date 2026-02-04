/**
 * Batch Workflow Activities Tests
 *
 * Unit tests for activity schema validation and output encoding.
 * Note: PathLayout batch tests are in Domain/PathLayout.test.ts
 */

import { Effect, Layer, Schema } from "effect"
import { describe, expect, it } from "vitest"
import type { BatchId, DocumentId, GcsUri, Namespace } from "../../src/Domain/Identity.js"
import {
  ExtractionActivityInput,
  IngestionActivityInput,
  ResolutionActivityInput,
  ValidationActivityInput
} from "../../src/Domain/Schema/Batch.js"
import { ConfigService } from "../../src/Service/Config.js"
import { StorageServiceTest } from "../../src/Service/Storage.js"
import {
  ExtractionActivityOutput,
  makeResolutionActivity,
  ResolutionActivityOutput
} from "../../src/Workflow/Activities.js"

// -----------------------------------------------------------------------------
// Test Fixtures
// -----------------------------------------------------------------------------

const testBatchId = "batch-abc123def456" as BatchId
const testDocId = "doc-123456789abc" as DocumentId
const testNamespace = "football" as Namespace

const makeGcsUri = (path: string): GcsUri => `gs://test-bucket/${path}` as GcsUri

// -----------------------------------------------------------------------------
// Schema Validation Tests
// -----------------------------------------------------------------------------

describe("Activity Input Schemas", () => {
  describe("ExtractionActivityInput", () => {
    it("decodes valid extraction input", () => {
      const raw = {
        batchId: testBatchId,
        documentId: testDocId,
        sourceUri: makeGcsUri("input/doc.txt"),
        ontologyUri: makeGcsUri("ontologies/football/ontology.ttl"),
        ontologyId: "football",
        targetNamespace: "sports-football"
      }

      const result = Schema.decodeUnknownSync(ExtractionActivityInput)(raw)

      expect(result.batchId).toBe(testBatchId)
      expect(result.documentId).toBe(testDocId)
      expect(result.sourceUri).toContain("gs://")
      expect(result.targetNamespace).toBe("sports-football")
    })

    it("rejects missing required fields", () => {
      const raw = {
        batchId: testBatchId
        // missing documentId, sourceUri, ontologyUri
      }

      expect(() => Schema.decodeUnknownSync(ExtractionActivityInput)(raw)).toThrow()
    })

    it("rejects invalid batch ID format", () => {
      const raw = {
        batchId: "invalid", // doesn't match batch-xxxxxxxxxxxx
        documentId: testDocId,
        sourceUri: makeGcsUri("input/doc.txt"),
        ontologyUri: makeGcsUri("ontologies/football/ontology.ttl")
      }

      expect(() => Schema.decodeUnknownSync(ExtractionActivityInput)(raw)).toThrow()
    })
  })

  describe("ResolutionActivityInput", () => {
    it("decodes valid resolution input with multiple graphs", () => {
      const raw = {
        batchId: testBatchId,
        documentGraphUris: [
          makeGcsUri("graphs/doc1.ttl"),
          makeGcsUri("graphs/doc2.ttl"),
          makeGcsUri("graphs/doc3.ttl")
        ]
      }

      const result = Schema.decodeUnknownSync(ResolutionActivityInput)(raw)

      expect(result.batchId).toBe(testBatchId)
      expect(result.documentGraphUris).toHaveLength(3)
    })

    it("accepts empty document graph array", () => {
      const raw = {
        batchId: testBatchId,
        documentGraphUris: []
      }

      const result = Schema.decodeUnknownSync(ResolutionActivityInput)(raw)
      expect(result.documentGraphUris).toHaveLength(0)
    })
  })

  describe("ValidationActivityInput", () => {
    it("decodes validation input without optional SHACL", () => {
      const raw = {
        batchId: testBatchId,
        resolvedGraphUri: makeGcsUri("resolved/graph.ttl"),
        ontologyUri: makeGcsUri("ontology/football.ttl")
      }

      const result = Schema.decodeUnknownSync(ValidationActivityInput)(raw)

      expect(result.batchId).toBe(testBatchId)
      expect(result.ontologyUri).toContain("football")
      expect(result.shaclUri).toBeUndefined()
    })

    it("decodes validation input with SHACL URI", () => {
      const raw = {
        batchId: testBatchId,
        resolvedGraphUri: makeGcsUri("resolved/graph.ttl"),
        ontologyUri: makeGcsUri("ontology/football.ttl"),
        shaclUri: makeGcsUri("shapes/shacl.ttl")
      }

      const result = Schema.decodeUnknownSync(ValidationActivityInput)(raw)

      expect(result.shaclUri).toContain("shacl")
    })
  })

  describe("IngestionActivityInput", () => {
    it("decodes valid ingestion input", () => {
      const raw = {
        batchId: testBatchId,
        validatedGraphUri: makeGcsUri("validated/graph.ttl"),
        targetNamespace: testNamespace
      }

      const result = Schema.decodeUnknownSync(IngestionActivityInput)(raw)

      expect(result.targetNamespace).toBe(testNamespace)
    })
  })
})

// -----------------------------------------------------------------------------
// Output Schema Tests
// -----------------------------------------------------------------------------

describe("Activity Output Schemas", () => {
  describe("ExtractionActivityOutput", () => {
    it("encodes valid extraction output", () => {
      const output = {
        documentId: testDocId,
        graphUri: makeGcsUri("graphs/output.ttl"),
        entityCount: 10,
        relationCount: 5,
        claimCount: 3,
        durationMs: 1234
      }

      const encoded = Schema.encodeSync(ExtractionActivityOutput)(output)

      expect(encoded.entityCount).toBe(10)
      expect(encoded.relationCount).toBe(5)
      expect(encoded.claimCount).toBe(3)
    })
  })

  describe("ResolutionActivityOutput", () => {
    it("encodes valid resolution output", () => {
      const output = {
        resolvedUri: makeGcsUri("resolved/merged.ttl"),
        entitiesTotal: 42,
        clustersFormed: 15,
        durationMs: 5678
      }

      const encoded = Schema.encodeSync(ResolutionActivityOutput)(output)

      expect(encoded.entitiesTotal).toBe(42)
      expect(encoded.clustersFormed).toBe(15)
    })
  })
})

// -----------------------------------------------------------------------------
// Activity Execution Tests (with mock storage)
// -----------------------------------------------------------------------------

describe("Resolution Activity", () => {
  it("creates activity with correct name", async () => {
    const input = {
      batchId: testBatchId,
      documentGraphUris: [] as Array<GcsUri> // Empty for this test
    }

    // The activity should be created successfully
    const activity = makeResolutionActivity(input)

    // Verify it was created correctly
    expect(activity.name).toBe("resolution")
    expect(activity.execute).toBeDefined()
  })
})
