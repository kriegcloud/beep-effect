import { Arbitrary, Schema } from "effect"
import * as fc from "fast-check"
import { describe, expect, it } from "vitest"
import { ContentHash, type DocumentId, Namespace, OntologyName } from "../../src/Domain/Identity.js"
import { PathLayout } from "../../src/Domain/PathLayout.js"
import type { OntologyFilePath, RunChunkPath } from "../../src/Domain/PathLayout.js"

describe("PathLayout", () => {
  describe("OntologyFilePath", () => {
    it("encodes tuple to path string", () => {
      const ns = "football" as Namespace
      const name = "premier-league" as OntologyName
      const hash = "abc123def4567890" as ContentHash

      const path = PathLayout.ontology.encode(ns, name, hash)
      expect(path).toBe("ontologies/football/premier-league/abc123def4567890/ontology.ttl")
    })

    it("decodes path string to tuple", () => {
      const path = "ontologies/football/premier-league/abc123def4567890/ontology.ttl"
      const [ns, name, hash] = PathLayout.ontology.decode(path)

      expect(ns).toBe("football")
      expect(name).toBe("premier-league")
      expect(hash).toBe("abc123def4567890")
    })

    it("rejects invalid paths", () => {
      expect(() => PathLayout.ontology.decode("invalid/path")).toThrow()
      expect(() => PathLayout.ontology.decode("ontologies/bad!ns/name/hash/ontology.ttl")).toThrow()
    })
  })

  describe("Run Paths", () => {
    const docId = "doc-abc123def456" as DocumentId

    it("generates metadata path", () => {
      expect(PathLayout.run.metadata(docId)).toBe("runs/doc-abc123def456/metadata.json")
    })

    it("generates input path", () => {
      expect(PathLayout.run.input(docId)).toBe("runs/doc-abc123def456/input/document.txt")
    })

    it("generates chunk path", () => {
      expect(PathLayout.run.chunk(docId, 5)).toBe("runs/doc-abc123def456/input/chunks/chunk-5.txt")
    })

    it("parses chunk path", () => {
      const path = "runs/doc-abc123def456/input/chunks/chunk-42.txt"
      const [id, index] = PathLayout.run.parseChunk(path)
      expect(id).toBe(docId)
      expect(index).toBe(42)
    })

    it("generates output paths", () => {
      expect(PathLayout.run.output(docId, "turtle")).toBe("runs/doc-abc123def456/outputs/graph.ttl")
      expect(PathLayout.run.output(docId, "entities")).toBe("runs/doc-abc123def456/outputs/entities.json")
    })
  })

  describe("Property Testing", () => {
    it("roundtrips ontology paths", () => {
      const arbNs = Arbitrary.make(Namespace)
      const arbName = Arbitrary.make(OntologyName)
      const arbHash = Arbitrary.make(ContentHash)

      fc.assert(fc.property(arbNs, arbName, arbHash, (ns, name, hash) => {
        const encoded = PathLayout.ontology.encode(ns, name, hash)
        const [decodedNs, decodedName, decodedHash] = PathLayout.ontology.decode(encoded)

        expect(decodedNs).toBe(ns)
        expect(decodedName).toBe(name)
        expect(decodedHash).toBe(hash)
      }))
    })
  })
})
