import { Arbitrary, Effect, Schema } from "effect"
import * as fc from "fast-check"
import { describe, expect, it } from "vitest"
import type { ContentHash, DocumentId, IdempotencyKey, Namespace, OntologyName } from "../../../src/Domain/Identity.js"
import {
  ChunkingConfig,
  ExtractionRun,
  LlmConfig,
  RunConfig,
  RunStatus
} from "../../../src/Domain/Model/ExtractionRun.js"
import { OntologyRef } from "../../../src/Domain/Model/Ontology.js"

describe("ExtractionRun", () => {
  const validDocId = "doc-0123456789ab" as DocumentId
  const validKey = "a".repeat(64) as IdempotencyKey

  const validOntology = new OntologyRef({
    namespace: "test" as Namespace,
    name: "ontology" as OntologyName,
    contentHash: "0123456789abcdef" as ContentHash
  })

  const validConfig = new RunConfig({
    ontology: validOntology,
    chunking: new ChunkingConfig({ maxChunkSize: 500 }),
    llm: new LlmConfig({ model: "gpt-4", temperature: 0.7, maxTokens: 1000, timeoutMs: 30000 })
  })

  it("validates valid run", () => {
    const run = new ExtractionRun({
      id: validDocId,
      idempotencyKey: validKey,
      status: "pending",
      config: validConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      outputDir: "runs/doc-0123456789ab",
      outputs: [],
      events: [],
      errors: []
    })

    expect(Schema.decodeSync(ExtractionRun)(run)).toEqual(run)
  })

  it("derives paths correctly", () => {
    const run = new ExtractionRun({
      id: validDocId,
      idempotencyKey: validKey,
      status: "pending",
      config: validConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      outputDir: "runs/doc-0123456789ab",
      outputs: [],
      events: [],
      errors: []
    })

    expect(run.metadataPath).toBe("runs/doc-0123456789ab/metadata.json")
    expect(run.inputPath).toBe("runs/doc-0123456789ab/input/document.txt")
    expect(run.outputPath("turtle")).toBe("runs/doc-0123456789ab/outputs/graph.ttl")
  })

  describe("Constraints", () => {
    it("ChunkingConfig validates maxChunkSize", () => {
      const arbValidSize = Arbitrary.make(Schema.Int.pipe(Schema.between(100, 10000)))

      fc.assert(fc.property(arbValidSize, (size) => {
        const config = new ChunkingConfig({ maxChunkSize: size })
        expect(Schema.decodeSync(ChunkingConfig)(config)).toBeDefined()
      }))

      expect(() => new ChunkingConfig({ maxChunkSize: 50 })).toThrow()
      expect(() => new ChunkingConfig({ maxChunkSize: 20000 })).toThrow()
    })

    it("LlmConfig validates temperature", () => {
      expect(() => new LlmConfig({ model: "test", temperature: -1, maxTokens: 100, timeoutMs: 1000 })).toThrow()
      expect(() => new LlmConfig({ model: "test", temperature: 2.1, maxTokens: 100, timeoutMs: 1000 })).toThrow()

      const valid = new LlmConfig({ model: "test", temperature: 1.5, maxTokens: 100, timeoutMs: 1000 })
      expect(Schema.decodeSync(LlmConfig)(valid)).toBeDefined()
    })
  })
})
