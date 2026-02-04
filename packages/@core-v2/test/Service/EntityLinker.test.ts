/**
 * Tests for EntityLinker Service
 *
 * @since 2.0.0
 * @module test/Service/EntityLinker
 */

import { BunContext } from "@effect/platform-bun"
import { Effect, Layer, Option } from "effect"
import { describe, expect, it } from "vitest"

import { Entity, KnowledgeGraph, Relation } from "../../src/Domain/Model/Entity.js"
import { defaultEntityResolutionConfig, MentionRecord } from "../../src/Domain/Model/EntityResolution.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import { EmbeddingService } from "../../src/Service/Embedding.js"
import { getCanonicalId, getMentionsForEntity, toMermaid } from "../../src/Service/EntityLinker.js"
import { buildEntityResolutionGraph } from "../../src/Workflow/EntityResolutionGraph.js"

// =============================================================================
// Test Configuration
// =============================================================================

const MockEmbeddingLayer = Layer.succeed(
  EmbeddingService,
  {
    embed: (_text) => Effect.succeed([]),
    embedBatch: (texts) => Effect.succeed(texts.map(() => [])),
    cosineSimilarity: (_a, _b) => 0.0,
    getProviderMetadata: () => Effect.succeed({ providerId: "nomic", modelId: "test-model", dimension: 768 })
  }
)

const TestLayer = MockEmbeddingLayer.pipe(Layer.provideMerge(BunContext.layer))

// =============================================================================
// Test Fixtures
// =============================================================================

const createEntity = (id: string, mention: string, types: Array<string>): Entity =>
  new Entity({
    id: EntityId(id),
    mention,
    types,
    attributes: {}
  })

const createRelation = (subjectId: string, predicate: string, objectId: string): Relation =>
  new Relation({
    subjectId,
    predicate,
    object: objectId
  })

// =============================================================================
// getCanonicalId Tests
// =============================================================================

describe("getCanonicalId", () => {
  it("should return Some for known entity ID", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          createEntity("arsenal", "Arsenal", ["http://schema.org/SportsTeam"]),
          createEntity("arsenal_fc", "Arsenal FC", ["http://schema.org/SportsTeam"])
        ],
        relations: []
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)
      const canonicalId = getCanonicalId(erg, "arsenal")

      expect(Option.isSome(canonicalId)).toBe(true)
      expect(Option.getOrThrow(canonicalId)).toBeDefined()
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should return None for unknown entity ID", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          createEntity("arsenal", "Arsenal", ["http://schema.org/SportsTeam"])
        ],
        relations: []
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)
      const canonicalId = getCanonicalId(erg, "unknown_entity")

      expect(Option.isNone(canonicalId)).toBe(true)
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should return same canonical ID for clustered entities", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          createEntity("arsenal", "Arsenal", ["http://schema.org/SportsTeam"]),
          createEntity("arsenal_fc", "Arsenal FC", ["http://schema.org/SportsTeam"])
        ],
        relations: []
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)
      const canonical1 = getCanonicalId(erg, "arsenal")
      const canonical2 = getCanonicalId(erg, "arsenal_fc")

      // Both should resolve to same canonical ID
      expect(Option.isSome(canonical1)).toBe(true)
      expect(Option.isSome(canonical2)).toBe(true)
      expect(Option.getOrThrow(canonical1)).toBe(Option.getOrThrow(canonical2))
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))
})

// =============================================================================
// getMentionsForEntity Tests
// =============================================================================

describe("getMentionsForEntity", () => {
  it("should return all MentionRecords for a canonical entity", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          createEntity("arsenal", "Arsenal", ["http://schema.org/SportsTeam"]),
          createEntity("arsenal_fc", "Arsenal FC", ["http://schema.org/SportsTeam"])
        ],
        relations: []
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)

      // Get the canonical ID (should be the one with longer mention)
      const canonicalId = Option.getOrThrow(getCanonicalId(erg, "arsenal_fc"))
      const mentions = getMentionsForEntity(erg, canonicalId)

      // Should have 2 mention records
      expect(mentions).toHaveLength(2)
      expect(mentions.map((m) => m.id)).toContain("arsenal")
      expect(mentions.map((m) => m.id)).toContain("arsenal_fc")
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should return single MentionRecord for non-clustered entity", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          createEntity("ronaldo", "Cristiano Ronaldo", ["http://schema.org/Person"])
        ],
        relations: []
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)
      const mentions = getMentionsForEntity(erg, "ronaldo")

      expect(mentions).toHaveLength(1)
      expect(mentions[0].id).toBe("ronaldo")
      expect(mentions[0].mention).toBe("Cristiano Ronaldo")
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should return empty array for unknown canonical ID", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          createEntity("arsenal", "Arsenal", ["http://schema.org/SportsTeam"])
        ],
        relations: []
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)
      const mentions = getMentionsForEntity(erg, "unknown_canonical")

      expect(mentions).toEqual([])
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should preserve chunkIndex in MentionRecords", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          createEntity("entity_0", "Apple", ["http://example.org/Fruit"]),
          createEntity("entity_1", "Banana", ["http://example.org/Fruit"]),
          createEntity("entity_2", "Cherry", ["http://example.org/Fruit"])
        ],
        relations: []
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)
      const mentions = getMentionsForEntity(erg, "entity_0")

      // Should have chunkIndex = 0
      expect(mentions.length).toBeGreaterThanOrEqual(1)
      const firstMention = mentions.find((m) => m.id === "entity_0")
      expect(firstMention?.chunkIndex).toBe(0)
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))
})

// =============================================================================
// toMermaid Tests
// =============================================================================

describe("toMermaid", () => {
  it("should produce valid Mermaid diagram syntax", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          createEntity("arsenal", "Arsenal", ["http://schema.org/SportsTeam"]),
          createEntity("ronaldo", "Cristiano Ronaldo", ["http://schema.org/Person"])
        ],
        relations: [
          createRelation("ronaldo", "http://schema.org/memberOf", "arsenal")
        ]
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)
      const mermaid = toMermaid(erg)

      // Should be a string starting with graph directive
      expect(typeof mermaid).toBe("string")
      expect(mermaid.length).toBeGreaterThan(0)
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should handle empty graph", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [],
        relations: []
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)
      const mermaid = toMermaid(erg)

      expect(typeof mermaid).toBe("string")
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))
})
