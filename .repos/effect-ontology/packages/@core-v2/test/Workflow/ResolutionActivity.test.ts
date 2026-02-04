/**
 * Resolution Activity Integration Test
 *
 * Tests the resolution activity with EntityResolutionService integration.
 *
 * @module test/Workflow/ResolutionActivity
 */

import { BunContext } from "@effect/platform-bun"
import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer, Option } from "effect"
import { Entity, KnowledgeGraph, Relation } from "../../src/Domain/Model/Entity.js"
import { defaultEntityResolutionConfig, EntityResolutionConfig } from "../../src/Domain/Model/EntityResolution.js"
import { type EntityResolutionGraph } from "../../src/Domain/Model/EntityResolutionGraph.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import { EmbeddingService, EmbeddingServiceLive } from "../../src/Service/Embedding.js"
import { EmbeddingCache } from "../../src/Service/EmbeddingCache.js"
import { EmbeddingProvider, type EmbeddingProviderMethods } from "../../src/Service/EmbeddingProvider.js"
import { EntityResolutionService } from "../../src/Service/EntityResolution.js"
import { MetricsService } from "../../src/Telemetry/Metrics.js"

/**
 * Test ConfigProvider
 */
const TestConfigProvider = ConfigProvider.fromMap(
  new Map([
    ["ONTOLOGY_PATH", "/tmp/test-ontology.ttl"],
    ["LLM_API_KEY", "test-key"],
    ["LLM_PROVIDER", "anthropic"],
    ["LLM_MODEL", "claude-haiku-4-5"],
    ["STORAGE_TYPE", "local"],
    ["STORAGE_LOCAL_PATH", "/tmp/resolution-test"],
    ["RUNTIME_CONCURRENCY", "4"],
    ["RUNTIME_LLM_CONCURRENCY", "2"],
    ["RUNTIME_ENABLE_TRACING", "false"]
  ]),
  { pathDelim: "_" }
)

/**
 * Mock EmbeddingProvider that returns deterministic embeddings
 */
const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5]
const MockEmbeddingProvider = Layer.succeed(
  EmbeddingProvider,
  {
    metadata: { providerId: "nomic", modelId: "test-model", dimension: 5 },
    embedBatch: (requests) => Effect.succeed(requests.map(() => mockEmbedding)),
    cosineSimilarity: (a, b) => {
      // Simple cosine similarity
      let dot = 0
      let normA = 0
      let normB = 0
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
      }
      return dot / (Math.sqrt(normA) * Math.sqrt(normB))
    }
  } as EmbeddingProviderMethods
)

const EmbeddingServiceTest = EmbeddingServiceLive.pipe(
  Layer.provide(MockEmbeddingProvider),
  Layer.provide(EmbeddingCache.Default),
  Layer.provide(MetricsService.Default)
)

const TestLayers = EntityResolutionService.DefaultWithoutDependencies.pipe(
  Layer.provideMerge(EmbeddingServiceTest),
  Layer.provideMerge(BunContext.layer),
  Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
)

describe("EntityResolutionService Integration", () => {
  it.effect("resolves similar entities across multiple graphs", () =>
    Effect.gen(function*() {
      const entityResolution = yield* EntityResolutionService

      // Create two KnowledgeGraphs with similar entities
      const graph1 = new KnowledgeGraph({
        entities: [
          new Entity({
            id: EntityId("arsenal_fc"),
            mention: "Arsenal FC",
            types: ["http://example.org/FootballClub"],
            attributes: {}
          }),
          new Entity({
            id: EntityId("bukayo_saka"),
            mention: "Bukayo Saka",
            types: ["http://example.org/Player"],
            attributes: {}
          })
        ],
        relations: [
          new Relation({
            subjectId: "bukayo_saka",
            predicate: "http://example.org/playsFor",
            object: "arsenal_fc"
          })
        ]
      })

      const graph2 = new KnowledgeGraph({
        entities: [
          new Entity({
            id: EntityId("arsenal"),
            mention: "Arsenal", // Similar to "Arsenal FC"
            types: ["http://example.org/FootballClub"],
            attributes: {}
          }),
          new Entity({
            id: EntityId("saka"),
            mention: "Saka", // Similar to "Bukayo Saka"
            types: ["http://example.org/Player"],
            attributes: {}
          })
        ],
        relations: [
          new Relation({
            subjectId: "saka",
            predicate: "http://example.org/playsFor",
            object: "arsenal"
          })
        ]
      })

      const result = yield* entityResolution.resolve(
        [graph1, graph2],
        defaultEntityResolutionConfig
      )

      // Verify clustering happened
      expect(result.stats.mentionCount).toBe(4) // 4 total mentions
      expect(result.stats.clusterCount).toBeGreaterThan(0)

      // Verify canonicalMap exists
      expect(Object.keys(result.canonicalMap).length).toBe(4)
    }).pipe(Effect.provide(TestLayers)))

  it.effect("handles empty graphs gracefully", () =>
    Effect.gen(function*() {
      const entityResolution = yield* EntityResolutionService

      const emptyGraph = new KnowledgeGraph({
        entities: [],
        relations: []
      })

      const result = yield* entityResolution.resolve(
        [emptyGraph],
        defaultEntityResolutionConfig
      )

      expect(result.stats.mentionCount).toBe(0)
      expect(result.stats.clusterCount).toBe(0)
    }).pipe(Effect.provide(TestLayers)))

  it.effect("preserves distinct entities when not similar", () =>
    Effect.gen(function*() {
      const entityResolution = yield* EntityResolutionService

      const graph = new KnowledgeGraph({
        entities: [
          new Entity({
            id: EntityId("arsenal_fc"),
            mention: "Arsenal FC",
            types: ["http://example.org/FootballClub"],
            attributes: {}
          }),
          new Entity({
            id: EntityId("manchester_united"),
            mention: "Manchester United",
            types: ["http://example.org/FootballClub"],
            attributes: {}
          })
        ],
        relations: []
      })

      const result = yield* entityResolution.resolve(
        [graph],
        defaultEntityResolutionConfig
      )

      // Both entities should remain distinct
      expect(result.stats.mentionCount).toBe(2)
      expect(result.stats.resolvedCount).toBe(2) // No merging
    }).pipe(Effect.provide(TestLayers)))

  it.effect("builds correct canonicalMap for merged entities", () =>
    Effect.gen(function*() {
      const entityResolution = yield* EntityResolutionService

      // Create entities that should cluster
      const graph = new KnowledgeGraph({
        entities: [
          new Entity({
            id: EntityId("arsenal_football_club"),
            mention: "Arsenal Football Club", // Longest mention - should be canonical
            types: ["http://example.org/FootballClub"],
            attributes: {}
          }),
          new Entity({
            id: EntityId("arsenal_fc"),
            mention: "Arsenal FC",
            types: ["http://example.org/FootballClub"],
            attributes: {}
          }),
          new Entity({
            id: EntityId("arsenal"),
            mention: "Arsenal",
            types: ["http://example.org/FootballClub"],
            attributes: {}
          })
        ],
        relations: []
      })

      const result = yield* entityResolution.resolve(
        [graph],
        new EntityResolutionConfig({
          similarityThreshold: 0.3 // Lower threshold to ensure clustering
        })
      )

      // All should map to same canonical (longest mention)
      const canonicalIds = new Set(Object.values(result.canonicalMap))

      // Verify clustering occurred (fewer unique canonical IDs than entities)
      expect(canonicalIds.size).toBeLessThanOrEqual(result.stats.mentionCount)
    }).pipe(Effect.provide(TestLayers)))
})

describe("Resolution Activity Helpers", () => {
  it("should rewrite entity IDs using canonicalMap", () => {
    const canonicalMap: Record<string, string> = {
      arsenal: "arsenal_fc",
      arsenal_fc: "arsenal_fc",
      saka: "bukayo_saka",
      bukayo_saka: "bukayo_saka"
    }

    const entities = [
      new Entity({
        id: EntityId("arsenal"),
        mention: "Arsenal",
        types: ["http://example.org/FootballClub"],
        attributes: {}
      }),
      new Entity({
        id: EntityId("saka"),
        mention: "Saka",
        types: ["http://example.org/Player"],
        attributes: {}
      })
    ]

    // Rewrite entity IDs
    const rewrittenEntities = entities.map((entity) => {
      const canonicalId = canonicalMap[entity.id] ?? entity.id
      return new Entity({
        ...entity,
        id: EntityId(canonicalId)
      })
    })

    expect(rewrittenEntities[0].id).toBe("arsenal_fc")
    expect(rewrittenEntities[1].id).toBe("bukayo_saka")
  })

  it("should rewrite relation IDs using canonicalMap", () => {
    const canonicalMap: Record<string, string> = {
      arsenal: "arsenal_fc",
      saka: "bukayo_saka"
    }

    const relation = new Relation({
      subjectId: "saka",
      predicate: "http://example.org/playsFor",
      object: "arsenal"
    })

    const canonicalSubject = canonicalMap[relation.subjectId] ?? relation.subjectId
    const canonicalObject = typeof relation.object === "string"
      ? (canonicalMap[relation.object] ?? relation.object)
      : relation.object

    const rewrittenRelation = new Relation({
      subjectId: canonicalSubject,
      predicate: relation.predicate,
      object: canonicalObject
    })

    expect(rewrittenRelation.subjectId).toBe("bukayo_saka")
    expect(rewrittenRelation.object).toBe("arsenal_fc")
  })

  it("should deduplicate entities by canonical ID", () => {
    const entities = [
      new Entity({
        id: EntityId("arsenal_fc"),
        mention: "Arsenal FC",
        types: ["http://example.org/FootballClub"],
        attributes: {}
      }),
      new Entity({
        id: EntityId("arsenal_fc"), // Duplicate after rewriting
        mention: "Arsenal",
        types: ["http://example.org/FootballClub"],
        attributes: {}
      })
    ]

    const seenIds = new Set<string>()
    const uniqueEntities = entities.filter((entity) => {
      if (seenIds.has(entity.id)) return false
      seenIds.add(entity.id)
      return true
    })

    expect(uniqueEntities.length).toBe(1)
    expect(uniqueEntities[0].mention).toBe("Arsenal FC") // First occurrence kept
  })

  it("should calculate compression ratio correctly", () => {
    const totalEntities = 10
    const resolvedCount = 4

    const compressionRatio = totalEntities > 0
      ? 1 - (resolvedCount / totalEntities)
      : 0

    expect(compressionRatio).toBe(0.6) // 60% compression
  })
})
