/**
 * EmbeddingRepository Integration Tests
 *
 * Tests EmbeddingRepository against a real PostgreSQL database with pgvector.
 * Requires PostgreSQL with pgvector extension (docker-compose up postgres).
 *
 * @module test/Repository/Embedding.integration.test
 */

import { SqlClient } from "@effect/sql"
import * as Pg from "@effect/sql-drizzle/Pg"
import { PgClient } from "@effect/sql-pg"
import { describe, expect, it } from "@effect/vitest"
import { Config, ConfigProvider, Effect, Layer, Option } from "effect"
import { EmbeddingRepository, type EmbeddingEntityType } from "../../src/Repository/Embedding.js"

// =============================================================================
// Test Configuration
// =============================================================================

const PostgresTestConfig = ConfigProvider.fromMap(
  new Map([
    ["POSTGRES_HOST", process.env.TEST_POSTGRES_HOST ?? "localhost"],
    ["POSTGRES_PORT", process.env.TEST_POSTGRES_PORT ?? "5432"],
    ["POSTGRES_DATABASE", process.env.TEST_POSTGRES_DATABASE ?? "workflow"],
    ["POSTGRES_USER", process.env.TEST_POSTGRES_USER ?? "workflow"],
    ["POSTGRES_PASSWORD", process.env.TEST_POSTGRES_PASSWORD ?? "workflow"]
  ])
)

const PgClientTestLayer = PgClient.layerConfig({
  host: Config.string("POSTGRES_HOST"),
  port: Config.number("POSTGRES_PORT"),
  database: Config.string("POSTGRES_DATABASE"),
  username: Config.string("POSTGRES_USER"),
  password: Config.redacted("POSTGRES_PASSWORD"),
  ssl: Config.boolean("POSTGRES_SSL").pipe(Config.withDefault(false))
}).pipe(Layer.provide(Layer.setConfigProvider(PostgresTestConfig)))

// Create a layer that provides BOTH PgDrizzle AND SqlClient
// EmbeddingRepository requires both: PgDrizzle for ORM queries, SqlClient for raw SQL
const DrizzleAndSqlLayer = Layer.mergeAll(
  Pg.layer,                           // Provides PgDrizzle (requires SqlClient)
  PgClientTestLayer                    // Provides SqlClient
).pipe(Layer.provide(PgClientTestLayer)) // SqlClient for Pg.layer's requirement

const TestLayer = EmbeddingRepository.Default.pipe(Layer.provide(DrizzleAndSqlLayer))

// =============================================================================
// Test Fixtures
// =============================================================================

/**
 * Generate a random 768-dimensional embedding vector
 */
const makeRandomEmbedding = (seed = 0): ReadonlyArray<number> => {
  const result: Array<number> = []
  for (let i = 0; i < 768; i++) {
    // Deterministic pseudo-random based on seed and index
    const val = Math.sin(seed * 9999 + i) * 0.5 + 0.5
    result.push(val)
  }
  // Normalize to unit vector
  const magnitude = Math.sqrt(result.reduce((sum, v) => sum + v * v, 0))
  return result.map((v) => v / magnitude)
}

/**
 * Generate a similar embedding (for testing similarity search)
 */
const makeSimilarEmbedding = (base: ReadonlyArray<number>, noise = 0.1): ReadonlyArray<number> => {
  const result = base.map((v) => v + (Math.random() - 0.5) * noise)
  const magnitude = Math.sqrt(result.reduce((sum, v) => sum + v * v, 0))
  return result.map((v) => v / magnitude)
}

const makeTestOntologyId = (suffix: string) => `test-ontology-${suffix}-${Date.now()}`

// =============================================================================
// Tests
// =============================================================================

describe("EmbeddingRepository Integration", () => {
  describe("CRUD Operations", () => {
    it.effect("should upsert and retrieve an embedding", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const ontologyId = makeTestOntologyId("upsert")
        const entityType: EmbeddingEntityType = "class"
        const entityId = "http://example.org/Person"
        const embedding = makeRandomEmbedding(1)

        // Upsert
        const inserted = yield* repo.upsert(
          ontologyId,
          entityType,
          entityId,
          embedding,
          "Person class definition",
          "nomic-embed-text-v1.5"
        )

        expect(inserted.id).toBeDefined()
        expect(inserted.entityType).toBe(entityType)
        expect(inserted.entityId).toBe(entityId)
        expect(inserted.ontologyId).toBe(ontologyId)

        // Retrieve
        const retrieved = yield* repo.get(ontologyId, entityType, entityId)
        expect(Option.isSome(retrieved)).toBe(true)
        if (Option.isSome(retrieved)) {
          expect(retrieved.value.entityId).toBe(entityId)
          expect(retrieved.value.contentText).toBe("Person class definition")
        }
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should update embedding on re-upsert", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const ontologyId = makeTestOntologyId("update")
        const entityType: EmbeddingEntityType = "entity"
        const entityId = "http://example.org/John"
        const embedding1 = makeRandomEmbedding(2)
        const embedding2 = makeRandomEmbedding(3)

        // First upsert
        const first = yield* repo.upsert(ontologyId, entityType, entityId, embedding1)

        // Second upsert with different embedding
        const second = yield* repo.upsert(ontologyId, entityType, entityId, embedding2)

        // Should have same ID (updated, not inserted)
        expect(second.id).toBe(first.id)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should get embedding vector", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const ontologyId = makeTestOntologyId("vector")
        const entityType: EmbeddingEntityType = "claim"
        const entityId = "http://example.org/claim/1"
        const embedding = makeRandomEmbedding(4)

        yield* repo.upsert(ontologyId, entityType, entityId, embedding)

        const vector = yield* repo.getVector(ontologyId, entityType, entityId)
        expect(Option.isSome(vector)).toBe(true)
        if (Option.isSome(vector)) {
          expect(vector.value.length).toBe(768)
          // Check first few values match
          expect(Math.abs(vector.value[0] - embedding[0])).toBeLessThan(0.0001)
        }
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should remove embedding", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const ontologyId = makeTestOntologyId("remove")
        const entityType: EmbeddingEntityType = "example"
        const entityId = "http://example.org/example/1"
        const embedding = makeRandomEmbedding(5)

        yield* repo.upsert(ontologyId, entityType, entityId, embedding)

        // Verify exists
        const before = yield* repo.get(ontologyId, entityType, entityId)
        expect(Option.isSome(before)).toBe(true)

        // Remove
        yield* repo.remove(ontologyId, entityType, entityId)

        // Verify gone
        const after = yield* repo.get(ontologyId, entityType, entityId)
        expect(Option.isNone(after)).toBe(true)
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Batch Operations", () => {
    it.effect("should upsert multiple embeddings in batch", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const ontologyId = makeTestOntologyId("batch")
        const items = [
          { ontologyId, entityType: "class" as const, entityId: "http://ex.org/A", embedding: makeRandomEmbedding(10) },
          { ontologyId, entityType: "class" as const, entityId: "http://ex.org/B", embedding: makeRandomEmbedding(11) },
          { ontologyId, entityType: "class" as const, entityId: "http://ex.org/C", embedding: makeRandomEmbedding(12) }
        ]

        const count = yield* repo.upsertBatch(items)
        expect(count).toBe(3)

        // Verify all exist
        const multiple = yield* repo.getMultiple(ontologyId, "class", [
          "http://ex.org/A",
          "http://ex.org/B",
          "http://ex.org/C"
        ])
        expect(multiple.length).toBe(3)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should handle empty batch gracefully", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const count = yield* repo.upsertBatch([])
        expect(count).toBe(0)
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Similarity Search", () => {
    it.effect("should find similar embeddings", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const ontologyId = makeTestOntologyId("similar")
        const baseEmbedding = makeRandomEmbedding(20)

        // Insert a base embedding and some similar ones
        yield* repo.upsert(ontologyId, "class", "http://ex.org/Base", baseEmbedding, "Base entity")
        yield* repo.upsert(ontologyId, "class", "http://ex.org/Similar1", makeSimilarEmbedding(baseEmbedding, 0.05), "Similar 1")
        yield* repo.upsert(ontologyId, "class", "http://ex.org/Similar2", makeSimilarEmbedding(baseEmbedding, 0.1), "Similar 2")
        // Insert a dissimilar one
        yield* repo.upsert(ontologyId, "class", "http://ex.org/Different", makeRandomEmbedding(999), "Different entity")

        // Search for similar to base
        const results = yield* repo.findSimilar(ontologyId, "class", baseEmbedding, {
          limit: 10,
          minSimilarity: 0.8
        })

        expect(results.length).toBeGreaterThanOrEqual(1)
        // Base should be most similar to itself
        expect(results[0].entityId).toBe("http://ex.org/Base")
        expect(results[0].similarity).toBeGreaterThan(0.99)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should respect minSimilarity threshold", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const ontologyId = makeTestOntologyId("threshold")
        const embedding = makeRandomEmbedding(30)

        yield* repo.upsert(ontologyId, "entity", "http://ex.org/E1", embedding)
        yield* repo.upsert(ontologyId, "entity", "http://ex.org/E2", makeRandomEmbedding(31))

        // With high threshold, only exact match
        const highThreshold = yield* repo.findSimilar(ontologyId, "entity", embedding, {
          minSimilarity: 0.99
        })
        expect(highThreshold.length).toBe(1)

        // With low threshold, both
        const lowThreshold = yield* repo.findSimilar(ontologyId, "entity", embedding, {
          minSimilarity: 0.0
        })
        expect(lowThreshold.length).toBe(2)
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Text Search", () => {
    it.effect("should search by text content", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const ontologyId = makeTestOntologyId("text")

        yield* repo.upsert(
          ontologyId,
          "class",
          "http://ex.org/Person",
          makeRandomEmbedding(40),
          "A person is a human being with individual characteristics"
        )
        yield* repo.upsert(
          ontologyId,
          "class",
          "http://ex.org/Organization",
          makeRandomEmbedding(41),
          "An organization is a group of people working together"
        )
        yield* repo.upsert(
          ontologyId,
          "class",
          "http://ex.org/Location",
          makeRandomEmbedding(42),
          "A geographic location or place"
        )

        const results = yield* repo.textSearch(ontologyId, "class", "human being person", 10)
        expect(results.length).toBeGreaterThanOrEqual(1)
        expect(results[0].entityId).toBe("http://ex.org/Person")
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Hybrid Search", () => {
    it.effect("should combine vector and text search via RRF", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const ontologyId = makeTestOntologyId("hybrid")
        const queryEmbedding = makeRandomEmbedding(50)

        // Person: similar embedding + matching text
        yield* repo.upsert(
          ontologyId,
          "class",
          "http://ex.org/Person",
          makeSimilarEmbedding(queryEmbedding, 0.05),
          "A person is a human individual"
        )

        // Organization: different embedding + matching text
        yield* repo.upsert(
          ontologyId,
          "class",
          "http://ex.org/Organization",
          makeRandomEmbedding(51),
          "An organization includes many people"
        )

        // Location: similar embedding + no matching text
        yield* repo.upsert(
          ontologyId,
          "class",
          "http://ex.org/Location",
          makeSimilarEmbedding(queryEmbedding, 0.1),
          "A geographic region"
        )

        const results = yield* repo.hybridSearch(
          ontologyId,
          "class",
          queryEmbedding,
          "person individual",
          { limit: 10, vectorWeight: 0.6, textWeight: 0.4 }
        )

        expect(results.length).toBeGreaterThanOrEqual(1)
        // Person should rank high (both vector similarity and text match)
        const personResult = results.find((r) => r.entityId === "http://ex.org/Person")
        expect(personResult).toBeDefined()
        expect(personResult!.rrfScore).toBeGreaterThan(0)
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Statistics", () => {
    it.effect("should get embedding statistics", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const ontologyId = makeTestOntologyId("stats")

        yield* repo.upsert(ontologyId, "class", "http://ex.org/C1", makeRandomEmbedding(60))
        yield* repo.upsert(ontologyId, "class", "http://ex.org/C2", makeRandomEmbedding(61))
        yield* repo.upsert(ontologyId, "entity", "http://ex.org/E1", makeRandomEmbedding(62))

        const stats = yield* repo.getStats(ontologyId)

        expect(stats.totalCount).toBe(3)
        expect(stats.byType.class).toBe(2)
        expect(stats.byType.entity).toBe(1)
        expect(stats.models["nomic-embed-text-v1.5"]).toBe(3)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should check if embeddings exist", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        const ontologyId = makeTestOntologyId("exists")

        // No embeddings yet
        const before = yield* repo.hasEmbeddings(ontologyId, "class")
        expect(before).toBe(false)

        // Add one
        yield* repo.upsert(ontologyId, "class", "http://ex.org/X", makeRandomEmbedding(70))

        // Now exists
        const after = yield* repo.hasEmbeddings(ontologyId, "class")
        expect(after).toBe(true)

        // Different type still empty
        const entity = yield* repo.hasEmbeddings(ontologyId, "entity")
        expect(entity).toBe(false)
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("SQL Injection Prevention", () => {
    it.effect("should safely handle malicious ontologyId in getStats", () =>
      Effect.gen(function*() {
        const repo = yield* EmbeddingRepository

        // Attempt SQL injection via ontologyId
        const maliciousId = "'; DROP TABLE embeddings; --"

        // Should not throw and should not drop the table
        const stats = yield* repo.getStats(maliciousId)

        // Should return empty stats (no matches)
        expect(stats.totalCount).toBe(0)

        // Verify table still exists by doing another operation
        const globalStats = yield* repo.getStats()
        expect(globalStats).toBeDefined()
      }).pipe(Effect.provide(TestLayer)))
  })
})
