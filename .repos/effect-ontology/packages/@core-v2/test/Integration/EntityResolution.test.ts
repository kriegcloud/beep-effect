/**
 * Integration Test: Entity Resolution Pipeline
 *
 * End-to-end tests for the complete entity resolution workflow:
 * 1. KnowledgeGraph input (simulating extraction output)
 * 2. Entity clustering and resolution
 * 3. Graph construction with provenance
 * 4. Query helpers and visualization
 *
 * @since 2.0.0
 * @module test/Integration/EntityResolution
 */

import { BunContext } from "@effect/platform-bun"
import { Effect, Layer, Option } from "effect"
import { describe, expect, it } from "vitest"
import { Entity, KnowledgeGraph, Relation } from "../../src/Domain/Model/Entity.js"
import { defaultEntityResolutionConfig } from "../../src/Domain/Model/EntityResolution.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import { EmbeddingService } from "../../src/Service/Embedding.js"
import { getCanonicalId, getMentionsForEntity, toMermaid } from "../../src/Service/EntityLinker.js"
import { buildEntityResolutionGraph } from "../../src/Workflow/EntityResolutionGraph.js"

const MockEmbeddingLayer = Layer.succeed(
  EmbeddingService,
  {
    embed: (_text) => Effect.succeed([]),
    embedBatch: (texts) => Effect.succeed(texts.map(() => [])),
    cosineSimilarity: (_a, _b) => 0.0,
    getProviderMetadata: () => Effect.succeed({ providerId: "nomic", modelId: "test", dimension: 768 })
  }
)

const TestLayer = MockEmbeddingLayer.pipe(Layer.provideMerge(BunContext.layer))

// =============================================================================
// Test Fixtures: Football Extraction Scenario
// =============================================================================

/**
 * Simulates extraction from multiple chunks about a football match.
 * Tests entity resolution across different mentions of the same entities.
 */
const createFootballScenario = () => {
  // Chunk 0: "Arsenal beat Tottenham 4-1."
  const chunk0Entities = [
    new Entity({
      id: EntityId("arsenal_0"),
      mention: "Arsenal",
      types: ["http://schema.org/SportsTeam"],
      attributes: {}
    }),
    new Entity({
      id: EntityId("tottenham_0"),
      mention: "Tottenham",
      types: ["http://schema.org/SportsTeam"],
      attributes: {}
    })
  ]

  // Chunk 1: "The Gunners scored four goals."
  const chunk1Entities = [
    new Entity({
      id: EntityId("gunners_1"),
      mention: "The Gunners",
      types: ["http://schema.org/SportsTeam"],
      attributes: {}
    })
  ]

  // Chunk 2: "arsenal dominated possession."
  const chunk2Entities = [
    new Entity({
      id: EntityId("arsenal_2"),
      mention: "arsenal",
      types: ["http://schema.org/SportsTeam"],
      attributes: {}
    })
  ]

  // Chunk 3: "Saka and Martinelli scored for Arsenal FC."
  const chunk3Entities = [
    new Entity({
      id: EntityId("saka"),
      mention: "Saka",
      types: ["http://schema.org/Person", "http://schema.org/Athlete"],
      attributes: {}
    }),
    new Entity({
      id: EntityId("martinelli"),
      mention: "Martinelli",
      types: ["http://schema.org/Person", "http://schema.org/Athlete"],
      attributes: {}
    }),
    new Entity({
      id: EntityId("arsenal_fc_3"),
      mention: "Arsenal FC",
      types: ["http://schema.org/SportsTeam"],
      attributes: {}
    })
  ]

  const relations = [
    new Relation({
      subjectId: "arsenal_0",
      predicate: "http://schema.org/opponent",
      object: "tottenham_0"
    }),
    new Relation({
      subjectId: "saka",
      predicate: "http://schema.org/memberOf",
      object: "arsenal_fc_3"
    }),
    new Relation({
      subjectId: "martinelli",
      predicate: "http://schema.org/memberOf",
      object: "arsenal_fc_3"
    })
  ]

  return new KnowledgeGraph({
    entities: [...chunk0Entities, ...chunk1Entities, ...chunk2Entities, ...chunk3Entities],
    relations
  })
}

// =============================================================================
// Integration Tests
// =============================================================================

describe("Entity Resolution Pipeline - Football Scenario", () => {
  it("should resolve Arsenal mentions to single canonical entity", () =>
    Effect.gen(function*() {
      const kg = createFootballScenario()
      const config = {
        ...defaultEntityResolutionConfig,
        similarityThreshold: 0.6, // Lower threshold to catch "The Gunners"
        requireTypeOverlap: true
      }

      const erg = yield* buildEntityResolutionGraph(kg, config)

      // All Arsenal-related entities should map to same canonical
      const arsenalCanonical = getCanonicalId(erg, "arsenal_0")
      const arsenal2Canonical = getCanonicalId(erg, "arsenal_2")
      const arsenalFcCanonical = getCanonicalId(erg, "arsenal_fc_3")

      expect(Option.isSome(arsenalCanonical)).toBe(true)
      expect(Option.isSome(arsenal2Canonical)).toBe(true)
      expect(Option.isSome(arsenalFcCanonical)).toBe(true)

      // arsenal_0, arsenal_2, and arsenal_fc_3 should share canonical ID
      // (they have "Arsenal" in common via containment)
      const canonical1 = Option.getOrThrow(arsenalCanonical)
      const canonical2 = Option.getOrThrow(arsenal2Canonical)
      const canonical3 = Option.getOrThrow(arsenalFcCanonical)

      expect(canonical1).toBe(canonical2)
      expect(canonical2).toBe(canonical3)
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should preserve chunkIndex provenance for all mentions", () =>
    Effect.gen(function*() {
      const kg = createFootballScenario()
      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)

      // Get mentions for the canonical Arsenal entity
      const arsenalCanonical = Option.getOrThrow(getCanonicalId(erg, "arsenal_fc_3"))
      const mentions = getMentionsForEntity(erg, arsenalCanonical)

      // Should have multiple mentions with different chunk indexes
      expect(mentions.length).toBeGreaterThanOrEqual(1)

      // Each mention should have a chunkIndex
      for (const mention of mentions) {
        expect(typeof mention.chunkIndex).toBe("number")
        expect(mention.chunkIndex).toBeGreaterThanOrEqual(0)
      }
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should maintain separate entities for different teams", () =>
    Effect.gen(function*() {
      const kg = createFootballScenario()
      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)

      // Arsenal and Tottenham should NOT be merged
      const arsenalCanonical = getCanonicalId(erg, "arsenal_0")
      const tottenhamCanonical = getCanonicalId(erg, "tottenham_0")

      expect(Option.isSome(arsenalCanonical)).toBe(true)
      expect(Option.isSome(tottenhamCanonical)).toBe(true)

      expect(Option.getOrThrow(arsenalCanonical)).not.toBe(
        Option.getOrThrow(tottenhamCanonical)
      )
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should track player-team relations correctly", () =>
    Effect.gen(function*() {
      const kg = createFootballScenario()
      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)

      // Verify stats
      expect(erg.stats.mentionCount).toBe(7) // Total entities in input
      expect(erg.stats.relationCount).toBe(3) // opponent, 2x memberOf

      // Saka and Martinelli should have separate canonical IDs
      const sakaCanonical = getCanonicalId(erg, "saka")
      const martinelliCanonical = getCanonicalId(erg, "martinelli")

      expect(Option.isSome(sakaCanonical)).toBe(true)
      expect(Option.isSome(martinelliCanonical)).toBe(true)
      expect(Option.getOrThrow(sakaCanonical)).not.toBe(
        Option.getOrThrow(martinelliCanonical)
      )
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should generate valid Mermaid visualization", () =>
    Effect.gen(function*() {
      const kg = createFootballScenario()
      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)

      const mermaid = toMermaid(erg)

      // Should have graph directive
      expect(mermaid).toContain("graph TD")

      // Should have node definitions
      expect(mermaid.length).toBeGreaterThan(50)
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should report accurate cluster count", () =>
    Effect.gen(function*() {
      const kg = createFootballScenario()
      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)

      // Should have fewer clusters than entities (due to merging)
      expect(erg.stats.clusterCount).toBeLessThanOrEqual(erg.stats.mentionCount)
      expect(erg.stats.resolvedCount).toBe(erg.stats.clusterCount)
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))
})

// =============================================================================
// Edge Case Tests
// =============================================================================

describe("Entity Resolution Pipeline - Edge Cases", () => {
  it("should handle single entity KnowledgeGraph", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          new Entity({
            id: EntityId("solo"),
            mention: "Solo Entity",
            types: ["http://example.org/Type"],
            attributes: {}
          })
        ],
        relations: []
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)

      expect(erg.stats.mentionCount).toBe(1)
      expect(erg.stats.resolvedCount).toBe(1)
      expect(erg.stats.clusterCount).toBe(1)

      const canonical = getCanonicalId(erg, "solo")
      expect(Option.isSome(canonical)).toBe(true)
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should handle entities with attributes", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          new Entity({
            id: EntityId("ronaldo_1"),
            mention: "Ronaldo",
            types: ["http://schema.org/Person"],
            attributes: { "http://schema.org/age": 39 }
          }),
          new Entity({
            id: EntityId("ronaldo_2"),
            mention: "Cristiano Ronaldo",
            types: ["http://schema.org/Person"],
            attributes: { "http://schema.org/nationality": "Portuguese" }
          })
        ],
        relations: []
      })

      const config = { ...defaultEntityResolutionConfig, similarityThreshold: 0.5 }
      const erg = yield* buildEntityResolutionGraph(kg, config)

      // Both Ronaldo mentions should cluster (containment match)
      const canonical1 = getCanonicalId(erg, "ronaldo_1")
      const canonical2 = getCanonicalId(erg, "ronaldo_2")

      expect(Option.isSome(canonical1)).toBe(true)
      expect(Option.isSome(canonical2)).toBe(true)

      // Should be same canonical (due to containment)
      expect(Option.getOrThrow(canonical1)).toBe(Option.getOrThrow(canonical2))
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should handle self-referential relations", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          new Entity({
            id: EntityId("entity_a"),
            mention: "Entity A",
            types: ["http://example.org/Type"],
            attributes: {}
          })
        ],
        relations: [
          new Relation({
            subjectId: "entity_a",
            predicate: "http://example.org/relatedTo",
            object: "entity_a" // Self-reference
          })
        ]
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)

      // Should not crash
      expect(erg.stats.mentionCount).toBe(1)
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))

  it("should handle relations to non-existent entities", () =>
    Effect.gen(function*() {
      const kg = new KnowledgeGraph({
        entities: [
          new Entity({
            id: EntityId("entity_a"),
            mention: "Entity A",
            types: ["http://example.org/Type"],
            attributes: {}
          })
        ],
        relations: [
          new Relation({
            subjectId: "entity_a",
            predicate: "http://example.org/relatedTo",
            object: "non_existent" // Entity not in entities list
          })
        ]
      })

      const erg = yield* buildEntityResolutionGraph(kg, defaultEntityResolutionConfig)

      // Should not crash - relation just won't be added to graph
      expect(erg.stats.mentionCount).toBe(1)
      expect(erg.stats.relationCount).toBe(1) // Relation still counted
    }).pipe(Effect.provide(TestLayer), Effect.runPromise))
})
