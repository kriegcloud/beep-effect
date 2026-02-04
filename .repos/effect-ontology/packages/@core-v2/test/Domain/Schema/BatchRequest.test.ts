/**
 * BatchRequest Schema Tests
 *
 * Tests for batch request and preprocessing options schemas.
 *
 * @module test/Domain/Schema/BatchRequest
 */

import { Schema } from "effect"
import { describe, expect, it } from "vitest"
import {
  BatchRequest,
  BatchRequestDocument,
  defaultPreprocessingOptions,
  PreprocessingOptions
} from "../../../src/Domain/Schema/BatchRequest.js"

// -----------------------------------------------------------------------------
// PreprocessingOptions Schema Tests
// -----------------------------------------------------------------------------

describe("PreprocessingOptions Schema", () => {
  describe("defaults", () => {
    it("applies all defaults when empty object provided", () => {
      const raw = {}
      const result = Schema.decodeUnknownSync(PreprocessingOptions)(raw)

      expect(result.enabled).toBe(true)
      expect(result.classifyDocuments).toBe(true)
      expect(result.adaptiveChunking).toBe(true)
      expect(result.priorityOrdering).toBe(true)
      expect(result.classificationBatchSize).toBe(10)
      expect(result.chunkingStrategyOverride).toBeUndefined()
    })

    it("defaultPreprocessingOptions matches schema defaults", () => {
      const decoded = Schema.decodeUnknownSync(PreprocessingOptions)({})

      expect(decoded.enabled).toBe(defaultPreprocessingOptions.enabled)
      expect(decoded.classifyDocuments).toBe(defaultPreprocessingOptions.classifyDocuments)
      expect(decoded.adaptiveChunking).toBe(defaultPreprocessingOptions.adaptiveChunking)
      expect(decoded.priorityOrdering).toBe(defaultPreprocessingOptions.priorityOrdering)
      expect(decoded.classificationBatchSize).toBe(defaultPreprocessingOptions.classificationBatchSize)
    })
  })

  describe("enabled field", () => {
    it("accepts true", () => {
      const result = Schema.decodeUnknownSync(PreprocessingOptions)({ enabled: true })
      expect(result.enabled).toBe(true)
    })

    it("accepts false", () => {
      const result = Schema.decodeUnknownSync(PreprocessingOptions)({ enabled: false })
      expect(result.enabled).toBe(false)
    })

    it("rejects non-boolean values", () => {
      expect(() => Schema.decodeUnknownSync(PreprocessingOptions)({ enabled: "yes" })).toThrow()
    })
  })

  describe("classifyDocuments field", () => {
    it("accepts boolean values", () => {
      const result = Schema.decodeUnknownSync(PreprocessingOptions)({ classifyDocuments: false })
      expect(result.classifyDocuments).toBe(false)
    })
  })

  describe("adaptiveChunking field", () => {
    it("accepts boolean values", () => {
      const result = Schema.decodeUnknownSync(PreprocessingOptions)({ adaptiveChunking: false })
      expect(result.adaptiveChunking).toBe(false)
    })
  })

  describe("priorityOrdering field", () => {
    it("accepts boolean values", () => {
      const result = Schema.decodeUnknownSync(PreprocessingOptions)({ priorityOrdering: false })
      expect(result.priorityOrdering).toBe(false)
    })
  })

  describe("classificationBatchSize field", () => {
    it("accepts valid values (1-50)", () => {
      const result = Schema.decodeUnknownSync(PreprocessingOptions)({ classificationBatchSize: 25 })
      expect(result.classificationBatchSize).toBe(25)
    })

    it("accepts minimum value (1)", () => {
      const result = Schema.decodeUnknownSync(PreprocessingOptions)({ classificationBatchSize: 1 })
      expect(result.classificationBatchSize).toBe(1)
    })

    it("accepts maximum value (50)", () => {
      const result = Schema.decodeUnknownSync(PreprocessingOptions)({ classificationBatchSize: 50 })
      expect(result.classificationBatchSize).toBe(50)
    })

    it("rejects zero", () => {
      expect(() => Schema.decodeUnknownSync(PreprocessingOptions)({ classificationBatchSize: 0 })).toThrow()
    })

    it("rejects values above 50", () => {
      expect(() => Schema.decodeUnknownSync(PreprocessingOptions)({ classificationBatchSize: 51 })).toThrow()
    })

    it("rejects negative values", () => {
      expect(() => Schema.decodeUnknownSync(PreprocessingOptions)({ classificationBatchSize: -1 })).toThrow()
    })
  })

  describe("chunkingStrategyOverride field", () => {
    const validStrategies = [
      "standard",
      "fine_grained",
      "high_overlap",
      "section_aware",
      "speaker_aware",
      "paragraph_based"
    ] as const

    for (const strategy of validStrategies) {
      it(`accepts ${strategy} strategy`, () => {
        const result = Schema.decodeUnknownSync(PreprocessingOptions)({
          chunkingStrategyOverride: strategy
        })
        expect(result.chunkingStrategyOverride).toBe(strategy)
      })
    }

    it("rejects invalid strategy", () => {
      expect(() => Schema.decodeUnknownSync(PreprocessingOptions)({ chunkingStrategyOverride: "invalid" })).toThrow()
    })

    it("accepts undefined (optional field)", () => {
      const result = Schema.decodeUnknownSync(PreprocessingOptions)({})
      expect(result.chunkingStrategyOverride).toBeUndefined()
    })
  })

  describe("complete configuration", () => {
    it("accepts fully specified options", () => {
      const raw = {
        enabled: true,
        classifyDocuments: false,
        adaptiveChunking: true,
        priorityOrdering: false,
        chunkingStrategyOverride: "section_aware",
        classificationBatchSize: 15
      }

      const result = Schema.decodeUnknownSync(PreprocessingOptions)(raw)

      expect(result.enabled).toBe(true)
      expect(result.classifyDocuments).toBe(false)
      expect(result.adaptiveChunking).toBe(true)
      expect(result.priorityOrdering).toBe(false)
      expect(result.chunkingStrategyOverride).toBe("section_aware")
      expect(result.classificationBatchSize).toBe(15)
    })

    it("accepts disabled preprocessing", () => {
      const raw = {
        enabled: false
      }

      const result = Schema.decodeUnknownSync(PreprocessingOptions)(raw)
      expect(result.enabled).toBe(false)
      // Other defaults still applied
      expect(result.classifyDocuments).toBe(true)
    })
  })
})

// -----------------------------------------------------------------------------
// BatchRequestDocument Schema Tests
// -----------------------------------------------------------------------------

describe("BatchRequestDocument Schema", () => {
  it("accepts minimal document", () => {
    const raw = {
      sourceUri: "gs://bucket/doc.txt",
      contentType: "text/plain"
    }

    const result = Schema.decodeUnknownSync(BatchRequestDocument)(raw)
    expect(result.sourceUri).toBe("gs://bucket/doc.txt")
    expect(result.contentType).toBe("text/plain")
    expect(result.sizeBytes).toBeUndefined()
    expect(result.documentId).toBeUndefined()
  })

  it("accepts full document", () => {
    const raw = {
      sourceUri: "gs://bucket/doc.txt",
      contentType: "text/plain",
      sizeBytes: 1024,
      documentId: "doc-123456789012"
    }

    const result = Schema.decodeUnknownSync(BatchRequestDocument)(raw)
    expect(result.sizeBytes).toBe(1024)
    expect(result.documentId).toBe("doc-123456789012")
  })
})

// -----------------------------------------------------------------------------
// BatchRequest Schema Tests
// -----------------------------------------------------------------------------

describe("BatchRequest Schema", () => {
  const validDocument = {
    sourceUri: "gs://bucket/doc.txt",
    contentType: "text/plain"
  }

  const minimalRequest = {
    ontologyId: "test-ontology",
    ontologyUri: "gs://bucket/ontology.ttl",
    ontologyVersion: "test/ontology@deadbeefdeadbeef",
    targetNamespace: "example-ns",
    documents: [validDocument]
  }

  it("accepts minimal request", () => {
    const result = Schema.decodeUnknownSync(BatchRequest)(minimalRequest)

    expect(result.ontologyUri).toBe("gs://bucket/ontology.ttl")
    expect(result.ontologyVersion).toBe("test/ontology@deadbeefdeadbeef")
    expect(result.targetNamespace).toBe("example-ns")
    expect(result.documents).toHaveLength(1)
    expect(result.preprocessing).toBeUndefined()
  })

  it("accepts request with preprocessing options", () => {
    const raw = {
      ...minimalRequest,
      preprocessing: {
        enabled: true,
        classifyDocuments: false,
        classificationBatchSize: 20
      }
    }

    const result = Schema.decodeUnknownSync(BatchRequest)(raw)

    expect(result.preprocessing).toBeDefined()
    expect(result.preprocessing?.enabled).toBe(true)
    expect(result.preprocessing?.classifyDocuments).toBe(false)
    expect(result.preprocessing?.classificationBatchSize).toBe(20)
    // Defaults applied
    expect(result.preprocessing?.adaptiveChunking).toBe(true)
  })

  it("accepts request with disabled preprocessing", () => {
    const raw = {
      ...minimalRequest,
      preprocessing: { enabled: false }
    }

    const result = Schema.decodeUnknownSync(BatchRequest)(raw)
    expect(result.preprocessing?.enabled).toBe(false)
  })

  it("accepts request with chunking strategy override", () => {
    const raw = {
      ...minimalRequest,
      preprocessing: {
        chunkingStrategyOverride: "speaker_aware"
      }
    }

    const result = Schema.decodeUnknownSync(BatchRequest)(raw)
    expect(result.preprocessing?.chunkingStrategyOverride).toBe("speaker_aware")
  })

  it("rejects empty documents array", () => {
    const raw = {
      ...minimalRequest,
      documents: []
    }

    expect(() => Schema.decodeUnknownSync(BatchRequest)(raw)).toThrow()
  })

  it("rejects invalid preprocessing options", () => {
    const raw = {
      ...minimalRequest,
      preprocessing: {
        classificationBatchSize: 100 // > 50 max
      }
    }

    expect(() => Schema.decodeUnknownSync(BatchRequest)(raw)).toThrow()
  })
})
