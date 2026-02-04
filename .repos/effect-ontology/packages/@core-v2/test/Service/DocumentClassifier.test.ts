/**
 * DocumentClassifier Service Tests
 *
 * Tests for document classification service with mock LLM responses.
 *
 * @module test/Service/DocumentClassifier
 */

import { Effect, Schema } from "effect"
import { describe, expect, it } from "vitest"
import {
  BatchClassificationResponse,
  ClassifyBatchInput,
  ClassifyInput,
  defaultClassification,
  DocumentClassification,
  DocumentClassifier
} from "../../src/Service/DocumentClassifier.js"

// -----------------------------------------------------------------------------
// Schema Tests
// -----------------------------------------------------------------------------

describe("DocumentClassifier Schemas", () => {
  describe("DocumentClassification", () => {
    it("decodes valid classification", () => {
      const raw = {
        documentType: "article",
        domainTags: ["technology", "AI"],
        complexityScore: 0.7,
        entityDensity: "moderate",
        language: "en",
        title: "Test Article"
      }

      const result = Schema.decodeUnknownSync(DocumentClassification)(raw)

      expect(result.documentType).toBe("article")
      expect(result.domainTags).toEqual(["technology", "AI"])
      expect(result.complexityScore).toBe(0.7)
      expect(result.entityDensity).toBe("moderate")
    })

    it("accepts optional fields as undefined", () => {
      const raw = {
        documentType: "unknown",
        domainTags: [],
        complexityScore: 0.5,
        entityDensity: "sparse"
      }

      const result = Schema.decodeUnknownSync(DocumentClassification)(raw)

      expect(result.language).toBeUndefined()
      expect(result.title).toBeUndefined()
    })

    it("rejects invalid document type", () => {
      const raw = {
        documentType: "invalid_type",
        domainTags: [],
        complexityScore: 0.5,
        entityDensity: "moderate"
      }

      expect(() => Schema.decodeUnknownSync(DocumentClassification)(raw)).toThrow()
    })

    it("rejects complexity score out of range", () => {
      const raw = {
        documentType: "article",
        domainTags: [],
        complexityScore: 1.5, // Invalid - must be 0-1
        entityDensity: "moderate"
      }

      expect(() => Schema.decodeUnknownSync(DocumentClassification)(raw)).toThrow()
    })

    it("rejects invalid entity density", () => {
      const raw = {
        documentType: "article",
        domainTags: [],
        complexityScore: 0.5,
        entityDensity: "very_dense" // Invalid
      }

      expect(() => Schema.decodeUnknownSync(DocumentClassification)(raw)).toThrow()
    })
  })

  describe("BatchClassificationResponse", () => {
    it("decodes valid batch response", () => {
      const raw = {
        classifications: [
          {
            index: 0,
            classification: {
              documentType: "article",
              domainTags: ["tech"],
              complexityScore: 0.5,
              entityDensity: "moderate"
            }
          },
          {
            index: 1,
            classification: {
              documentType: "transcript",
              domainTags: ["interview"],
              complexityScore: 0.3,
              entityDensity: "dense"
            }
          }
        ]
      }

      const result = Schema.decodeUnknownSync(BatchClassificationResponse)(raw)

      expect(result.classifications).toHaveLength(2)
      expect(result.classifications[0].index).toBe(0)
      expect(result.classifications[1].classification.documentType).toBe("transcript")
    })

    it("accepts empty classifications array", () => {
      const raw = {
        classifications: []
      }

      const result = Schema.decodeUnknownSync(BatchClassificationResponse)(raw)
      expect(result.classifications).toHaveLength(0)
    })
  })

  describe("ClassifyInput", () => {
    it("decodes valid input with content type", () => {
      const raw = {
        preview: "This is a document preview...",
        contentType: "text/plain"
      }

      const result = Schema.decodeUnknownSync(ClassifyInput)(raw)

      expect(result.preview).toBe("This is a document preview...")
      expect(result.contentType).toBe("text/plain")
    })

    it("accepts input without content type", () => {
      const raw = {
        preview: "Just the preview"
      }

      const result = Schema.decodeUnknownSync(ClassifyInput)(raw)
      expect(result.contentType).toBeUndefined()
    })
  })

  describe("ClassifyBatchInput", () => {
    it("decodes valid batch input", () => {
      const raw = {
        documents: [
          { index: 0, preview: "Doc 1", contentType: "text/plain" },
          { index: 1, preview: "Doc 2" }
        ]
      }

      const result = Schema.decodeUnknownSync(ClassifyBatchInput)(raw)

      expect(result.documents).toHaveLength(2)
      expect(result.documents[0].index).toBe(0)
      expect(result.documents[1].contentType).toBeUndefined()
    })
  })
})

// -----------------------------------------------------------------------------
// Default Classification Tests
// -----------------------------------------------------------------------------

describe("defaultClassification", () => {
  it("has expected default values", () => {
    expect(defaultClassification.documentType).toBe("unknown")
    expect(defaultClassification.domainTags).toEqual([])
    expect(defaultClassification.complexityScore).toBe(0.5)
    expect(defaultClassification.entityDensity).toBe("moderate")
    expect(defaultClassification.language).toBe("en")
  })
})

// -----------------------------------------------------------------------------
// Test Layer Tests
// -----------------------------------------------------------------------------

describe("DocumentClassifier.Test Layer", () => {
  it("classify returns default classification", async () => {
    const result = await Effect.gen(function*() {
      const classifier = yield* DocumentClassifier
      return yield* classifier.classify({
        preview: "Some document text here...",
        contentType: "text/plain"
      })
    }).pipe(Effect.provide(DocumentClassifier.Test), Effect.runPromise)

    expect(result.documentType).toBe("unknown")
    expect(result.complexityScore).toBe(0.5)
  })

  it("classifyBatch returns defaults for all documents", async () => {
    const result = await Effect.gen(function*() {
      const classifier = yield* DocumentClassifier
      return yield* classifier.classifyBatch({
        documents: [
          { index: 0, preview: "Doc 1" },
          { index: 1, preview: "Doc 2" },
          { index: 2, preview: "Doc 3" }
        ]
      })
    }).pipe(Effect.provide(DocumentClassifier.Test), Effect.runPromise)

    expect(result.size).toBe(3)
    expect(result.get(0)?.documentType).toBe("unknown")
    expect(result.get(1)?.documentType).toBe("unknown")
    expect(result.get(2)?.documentType).toBe("unknown")
  })

  it("classifyBatch handles empty input", async () => {
    const result = await Effect.gen(function*() {
      const classifier = yield* DocumentClassifier
      return yield* classifier.classifyBatch({
        documents: []
      })
    }).pipe(Effect.provide(DocumentClassifier.Test), Effect.runPromise)

    expect(result.size).toBe(0)
  })

  it("classifyWithAutoBatching returns defaults for all", async () => {
    const documents = [
      { index: 0, preview: "Article about technology" },
      { index: 1, preview: "Interview transcript" },
      { index: 2, preview: "Financial report" }
    ]

    const result = await Effect.gen(function*() {
      const classifier = yield* DocumentClassifier
      return yield* classifier.classifyWithAutoBatching(documents)
    }).pipe(Effect.provide(DocumentClassifier.Test), Effect.runPromise)

    expect(result.size).toBe(3)
    for (const [_index, classification] of result) {
      expect(classification.documentType).toBe("unknown")
      expect(classification.entityDensity).toBe("moderate")
    }
  })
})

// -----------------------------------------------------------------------------
// Document Type Coverage Tests
// -----------------------------------------------------------------------------

describe("DocumentClassification Document Types", () => {
  const validDocumentTypes = [
    "article",
    "transcript",
    "report",
    "contract",
    "correspondence",
    "reference",
    "narrative",
    "structured",
    "unknown"
  ] as const

  for (const docType of validDocumentTypes) {
    it(`accepts document type: ${docType}`, () => {
      const raw = {
        documentType: docType,
        domainTags: [],
        complexityScore: 0.5,
        entityDensity: "moderate"
      }

      const result = Schema.decodeUnknownSync(DocumentClassification)(raw)
      expect(result.documentType).toBe(docType)
    })
  }
})

// -----------------------------------------------------------------------------
// Entity Density Coverage Tests
// -----------------------------------------------------------------------------

describe("DocumentClassification Entity Density", () => {
  const validDensities = ["sparse", "moderate", "dense"] as const

  for (const density of validDensities) {
    it(`accepts entity density: ${density}`, () => {
      const raw = {
        documentType: "article",
        domainTags: [],
        complexityScore: 0.5,
        entityDensity: density
      }

      const result = Schema.decodeUnknownSync(DocumentClassification)(raw)
      expect(result.entityDensity).toBe(density)
    })
  }
})
