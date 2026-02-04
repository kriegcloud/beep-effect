/**
 * Tests for OntologyEmbeddings Model
 *
 * @since 2.0.0
 * @module test/Domain/Model/OntologyEmbeddings
 */

import { DateTime, Effect, Schema } from "effect"
import { describe, expect, it } from "vitest"
import {
  buildEmbeddingText,
  computeOntologyVersion,
  ElementEmbedding,
  embeddingsPathFromOntology,
  OntologyEmbeddings,
  OntologyEmbeddingsJson
} from "../../../src/Domain/Model/OntologyEmbeddings.js"

describe("OntologyEmbeddings", () => {
  describe("ElementEmbedding schema", () => {
    it("decodes valid element embedding", async () => {
      const input = {
        iri: "http://example.org/Person",
        text: "Person. A human being.",
        embedding: [0.1, 0.2, 0.3]
      }

      const result = await Schema.decodeUnknown(ElementEmbedding)(input).pipe(Effect.runPromise)

      expect(result.iri).toBe("http://example.org/Person")
      expect(result.text).toBe("Person. A human being.")
      expect(result.embedding).toEqual([0.1, 0.2, 0.3])
    })

    it("rejects invalid element embedding", async () => {
      const input = {
        iri: "http://example.org/Person"
        // missing text and embedding
      }

      await expect(
        Schema.decodeUnknown(ElementEmbedding)(input).pipe(Effect.runPromise)
      ).rejects.toThrow()
    })
  })

  describe("OntologyEmbeddings schema", () => {
    it("decodes valid embeddings blob", async () => {
      const input = {
        ontologyUri: "gs://bucket/ontologies/football/ontology.ttl",
        version: "abc123def456",
        model: "nomic-embed-text-v1.5",
        dimension: 768,
        createdAt: "2024-01-15T10:30:00Z",
        classes: [
          { iri: "http://example.org/Player", text: "Player", embedding: [0.1, 0.2] }
        ],
        properties: [
          { iri: "http://example.org/playsFor", text: "plays for", embedding: [0.3, 0.4] }
        ]
      }

      const result = await Schema.decodeUnknown(OntologyEmbeddings)(input).pipe(Effect.runPromise)

      expect(result.ontologyUri).toBe("gs://bucket/ontologies/football/ontology.ttl")
      expect(result.version).toBe("abc123def456")
      expect(result.model).toBe("nomic-embed-text-v1.5")
      expect(result.dimension).toBe(768)
      expect(result.classes).toHaveLength(1)
      expect(result.properties).toHaveLength(1)
    })

    it("handles empty classes and properties arrays", async () => {
      const input = {
        ontologyUri: "gs://bucket/empty.ttl",
        version: "empty123",
        model: "nomic-embed-text-v1.5",
        dimension: 768,
        createdAt: "2024-01-15T10:30:00Z",
        classes: [],
        properties: []
      }

      const result = await Schema.decodeUnknown(OntologyEmbeddings)(input).pipe(Effect.runPromise)

      expect(result.classes).toEqual([])
      expect(result.properties).toEqual([])
    })
  })

  describe("OntologyEmbeddingsJson codec", () => {
    it("parses JSON string to OntologyEmbeddings", async () => {
      const jsonString = JSON.stringify({
        ontologyUri: "gs://bucket/test.ttl",
        version: "v1",
        model: "nomic",
        dimension: 768,
        createdAt: "2024-01-15T10:30:00Z",
        classes: [],
        properties: []
      })

      const result = await Schema.decodeUnknown(OntologyEmbeddingsJson)(jsonString).pipe(
        Effect.runPromise
      )

      expect(result.ontologyUri).toBe("gs://bucket/test.ttl")
    })

    it("encodes OntologyEmbeddings to JSON string", async () => {
      const embeddings: OntologyEmbeddings = {
        ontologyUri: "gs://bucket/test.ttl",
        version: "v1",
        model: "nomic",
        dimension: 768,
        createdAt: DateTime.unsafeMake(new Date("2024-01-15T10:30:00Z")),
        classes: [],
        properties: []
      }

      const result = await Schema.encode(OntologyEmbeddingsJson)(embeddings).pipe(
        Effect.runPromise
      )

      expect(typeof result).toBe("string")
      const parsed = JSON.parse(result)
      expect(parsed.ontologyUri).toBe("gs://bucket/test.ttl")
    })
  })

  describe("computeOntologyVersion", () => {
    it("produces deterministic hash", () => {
      const content = "@prefix owl: <http://www.w3.org/2002/07/owl#> .\n:Person a owl:Class ."

      const hash1 = computeOntologyVersion(content)
      const hash2 = computeOntologyVersion(content)

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(16)
    })

    it("different content produces different hash", () => {
      const content1 = ":Person a owl:Class ."
      const content2 = ":Organization a owl:Class ."

      const hash1 = computeOntologyVersion(content1)
      const hash2 = computeOntologyVersion(content2)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("embeddingsPathFromOntology", () => {
    it("replaces .ttl extension", () => {
      const result = embeddingsPathFromOntology("gs://bucket/ontologies/football/ontology.ttl")
      expect(result).toBe("gs://bucket/ontologies/football/ontology-embeddings.json")
    })

    it("appends to paths without extension", () => {
      const result = embeddingsPathFromOntology("gs://bucket/ontologies/football")
      expect(result).toBe("gs://bucket/ontologies/football-embeddings.json")
    })

    it("handles local file paths", () => {
      const result = embeddingsPathFromOntology("/path/to/ontology.ttl")
      expect(result).toBe("/path/to/ontology-embeddings.json")
    })
  })

  describe("buildEmbeddingText", () => {
    it("returns just label when no description or altLabels", () => {
      const result = buildEmbeddingText("Person")
      expect(result).toBe("Person")
    })

    it("combines label and description", () => {
      const result = buildEmbeddingText("Person", "A human being")
      expect(result).toBe("Person. A human being")
    })

    it("includes alt labels", () => {
      const result = buildEmbeddingText("Person", undefined, ["Human", "Individual"])
      expect(result).toBe("Person. Also known as: Human, Individual")
    })

    it("combines all parts", () => {
      const result = buildEmbeddingText("Person", "A human being", ["Human", "Individual"])
      expect(result).toBe("Person. A human being. Also known as: Human, Individual")
    })

    it("handles empty altLabels array", () => {
      const result = buildEmbeddingText("Person", "A human being", [])
      expect(result).toBe("Person. A human being")
    })
  })
})
