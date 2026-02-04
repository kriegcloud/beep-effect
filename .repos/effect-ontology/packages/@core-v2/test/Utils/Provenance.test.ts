/**
 * Tests for Provenance URI utilities
 *
 * @since 2.0.0
 * @module test/Utils/Provenance
 */

import { describe, expect, it } from "vitest"
import type { BatchId, DocumentId } from "../../src/Domain/Identity.js"
import { isProvenanceUri, makeProvenanceUri, parseProvenanceUri } from "../../src/Utils/Provenance.js"

describe("Provenance URI utilities", () => {
  // Test data with proper branded types
  const batchId = "batch-1234567890ab" as BatchId
  const documentId = "doc-abcdef123456" as DocumentId

  describe("makeProvenanceUri", () => {
    it("generates deterministic document-level URI", () => {
      const uri1 = makeProvenanceUri(batchId, documentId)
      const uri2 = makeProvenanceUri(batchId, documentId)

      expect(uri1).toBe(uri2)
      expect(uri1).toBe("urn:provenance:batch/batch-1234567890ab/doc/doc-abcdef123456")
    })

    it("generates document-level URI format correctly", () => {
      const uri = makeProvenanceUri(batchId, documentId)

      expect(uri).toBe("urn:provenance:batch/batch-1234567890ab/doc/doc-abcdef123456")
      expect(uri).toMatch(/^urn:provenance:batch\/batch-[a-f0-9]{12}\/doc\/doc-[a-f0-9]{12}$/)
    })

    it("generates chunk-level URI format correctly", () => {
      const uri = makeProvenanceUri(batchId, documentId, 0)

      expect(uri).toBe("urn:provenance:batch/batch-1234567890ab/doc/doc-abcdef123456/chunk/0")
    })

    it("handles different chunk indices", () => {
      const uri0 = makeProvenanceUri(batchId, documentId, 0)
      const uri1 = makeProvenanceUri(batchId, documentId, 1)
      const uri99 = makeProvenanceUri(batchId, documentId, 99)

      expect(uri0).toContain("/chunk/0")
      expect(uri1).toContain("/chunk/1")
      expect(uri99).toContain("/chunk/99")
    })

    it("different batches produce different URIs", () => {
      const batch1 = "batch-111111111111" as BatchId
      const batch2 = "batch-222222222222" as BatchId

      const uri1 = makeProvenanceUri(batch1, documentId)
      const uri2 = makeProvenanceUri(batch2, documentId)

      expect(uri1).not.toBe(uri2)
    })

    it("different documents produce different URIs", () => {
      const doc1 = "doc-111111111111" as DocumentId
      const doc2 = "doc-222222222222" as DocumentId

      const uri1 = makeProvenanceUri(batchId, doc1)
      const uri2 = makeProvenanceUri(batchId, doc2)

      expect(uri1).not.toBe(uri2)
    })
  })

  describe("parseProvenanceUri", () => {
    it("parses document-level URI", () => {
      const uri = "urn:provenance:batch/batch-1234567890ab/doc/doc-abcdef123456"
      const result = parseProvenanceUri(uri)

      expect(result).toEqual({
        batchId: "batch-1234567890ab",
        documentId: "doc-abcdef123456",
        chunkIndex: undefined
      })
    })

    it("parses chunk-level URI", () => {
      const uri = "urn:provenance:batch/batch-1234567890ab/doc/doc-abcdef123456/chunk/5"
      const result = parseProvenanceUri(uri)

      expect(result).toEqual({
        batchId: "batch-1234567890ab",
        documentId: "doc-abcdef123456",
        chunkIndex: 5
      })
    })

    it("returns null for invalid URIs", () => {
      expect(parseProvenanceUri("invalid")).toBeNull()
      expect(parseProvenanceUri("urn:other:batch/123")).toBeNull()
      expect(parseProvenanceUri("urn:provenance:batch/invalid/doc/invalid")).toBeNull()
    })

    it("roundtrips with makeProvenanceUri", () => {
      const original = makeProvenanceUri(batchId, documentId, 3)
      const parsed = parseProvenanceUri(original)

      expect(parsed).toEqual({
        batchId: "batch-1234567890ab",
        documentId: "doc-abcdef123456",
        chunkIndex: 3
      })
    })
  })

  describe("isProvenanceUri", () => {
    it("returns true for valid document-level URI", () => {
      expect(isProvenanceUri("urn:provenance:batch/batch-1234567890ab/doc/doc-abcdef123456")).toBe(
        true
      )
    })

    it("returns true for valid chunk-level URI", () => {
      expect(
        isProvenanceUri("urn:provenance:batch/batch-1234567890ab/doc/doc-abcdef123456/chunk/0")
      ).toBe(true)
    })

    it("returns false for invalid URIs", () => {
      expect(isProvenanceUri("invalid")).toBe(false)
      expect(isProvenanceUri("urn:other:something")).toBe(false)
      expect(isProvenanceUri("urn:provenance:batch/invalid")).toBe(false)
    })

    it("validates generated URIs", () => {
      const uri = makeProvenanceUri(batchId, documentId)
      expect(isProvenanceUri(uri)).toBe(true)
    })
  })
})
