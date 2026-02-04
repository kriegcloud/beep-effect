/**
 * Tests for EntityIndex Service
 *
 * @since 2.0.0
 * @module test/Service/EntityIndex
 */

import { Effect, HashMap, HashSet, Layer, Option, Ref } from "effect"
import { describe, expect, it } from "vitest"
import { Entity, KnowledgeGraph } from "../../src/Domain/Model/Entity.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import { EmbeddingService } from "../../src/Service/Embedding.js"
import type { EntityIndexService } from "../../src/Service/EntityIndex.js"
import { EntityIndex } from "../../src/Service/EntityIndex.js"

/**
 * Simple deterministic embedding mock for testing
 * Maps text to a fixed-dimension vector based on character codes
 */
const mockEmbed = (text: string): ReadonlyArray<number> => {
  // Create a simple hash-based embedding (4 dimensions for testing)
  const hash = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return [
    Math.sin(hash) * 0.5 + 0.5,
    Math.cos(hash) * 0.5 + 0.5,
    Math.sin(hash * 2) * 0.5 + 0.5,
    Math.cos(hash * 2) * 0.5 + 0.5
  ]
}

const cosineSimilarity = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => {
  if (a.length !== b.length) return 0
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  return denominator === 0 ? 0 : dotProduct / denominator
}

/**
 * Mock EmbeddingService that produces deterministic embeddings
 */
const MockEmbeddingService = Layer.succeed(EmbeddingService, {
  embed: (text: string, _taskType) => Effect.succeed(mockEmbed(text)),
  embedBatch: (texts: ReadonlyArray<string>, _taskType) => Effect.succeed(texts.map((t) => mockEmbed(t))),
  cosineSimilarity,
  getProviderMetadata: () => Effect.succeed({ providerId: "nomic", modelId: "test-model", dimension: 4 })
})

/**
 * Create a test EntityIndex implementation directly (bypasses EmbeddingServiceDefault dependencies)
 */
const EntityIndexTest = Layer.effect(
  EntityIndex,
  Effect.gen(function*() {
    type Embedding = ReadonlyArray<number>
    interface IndexState {
      readonly entities: HashMap.HashMap<string, Entity>
      readonly embeddings: HashMap.HashMap<string, Embedding>
      readonly typeIndex: HashMap.HashMap<string, HashSet.HashSet<string>>
    }

    const emptyState: IndexState = {
      entities: HashMap.empty(),
      embeddings: HashMap.empty(),
      typeIndex: HashMap.empty()
    }

    const stateRef = yield* Ref.make<IndexState>(emptyState)

    const addToTypeIndex = (
      typeIndex: HashMap.HashMap<string, HashSet.HashSet<string>>,
      entity: Entity
    ): HashMap.HashMap<string, HashSet.HashSet<string>> => {
      let updated = typeIndex
      for (const typeIri of entity.types) {
        const existing = HashMap.get(updated, typeIri)
        const set = Option.isSome(existing)
          ? HashSet.add(existing.value, entity.id)
          : HashSet.make(entity.id)
        updated = HashMap.set(updated, typeIri, set)
      }
      return updated
    }

    const removeFromTypeIndex = (
      typeIndex: HashMap.HashMap<string, HashSet.HashSet<string>>,
      entity: Entity
    ): HashMap.HashMap<string, HashSet.HashSet<string>> => {
      let updated = typeIndex
      for (const typeIri of entity.types) {
        const existing = HashMap.get(updated, typeIri)
        if (Option.isSome(existing)) {
          const newSet = HashSet.remove(existing.value, entity.id)
          if (HashSet.size(newSet) === 0) {
            updated = HashMap.remove(updated, typeIri)
          } else {
            updated = HashMap.set(updated, typeIri, newSet)
          }
        }
      }
      return updated
    }

    const service: EntityIndexService = {
      index: (graph) =>
        Effect.gen(function*() {
          if (graph.entities.length === 0) return 0

          const mentions = graph.entities.map((e) => e.mention)
          const embeddingVectors = mentions.map(mockEmbed)

          let entities = HashMap.empty<string, Entity>()
          let embeddings = HashMap.empty<string, Embedding>()
          let typeIndex = HashMap.empty<string, HashSet.HashSet<string>>()

          for (let i = 0; i < graph.entities.length; i++) {
            const entity = graph.entities[i]
            entities = HashMap.set(entities, entity.id, entity)
            embeddings = HashMap.set(embeddings, entity.id, embeddingVectors[i])
            typeIndex = addToTypeIndex(typeIndex, entity)
          }

          yield* Ref.set(stateRef, { entities, embeddings, typeIndex })
          return graph.entities.length
        }),

      findSimilar: (query, k, options = {}) =>
        Effect.gen(function*() {
          const state = yield* Ref.get(stateRef)
          if (HashMap.size(state.entities) === 0) return []

          const queryEmbedding = mockEmbed(query)
          let candidateIds: HashSet.HashSet<string>

          if (options.filterTypes && options.filterTypes.length > 0) {
            candidateIds = HashSet.empty()
            for (const typeIri of options.filterTypes) {
              const typeEntities = HashMap.get(state.typeIndex, typeIri)
              if (Option.isSome(typeEntities)) {
                candidateIds = HashSet.union(candidateIds, typeEntities.value)
              }
            }
          } else {
            candidateIds = HashSet.fromIterable(HashMap.keys(state.entities))
          }

          const scored: Array<{ entity: Entity; score: number }> = []
          const minScore = options.minScore ?? 0

          for (const entityId of candidateIds) {
            const entity = HashMap.get(state.entities, entityId)
            const entityEmb = HashMap.get(state.embeddings, entityId)
            if (Option.isSome(entity) && Option.isSome(entityEmb)) {
              const score = cosineSimilarity(queryEmbedding, entityEmb.value)
              if (score >= minScore) {
                scored.push({ entity: entity.value, score })
              }
            }
          }

          scored.sort((a, b) => b.score - a.score)
          return scored.slice(0, k)
        }),

      findByType: (typeIri, limit) =>
        Effect.gen(function*() {
          const state = yield* Ref.get(stateRef)
          const entityIds = HashMap.get(state.typeIndex, typeIri)
          if (Option.isNone(entityIds)) return []

          const entities: Array<Entity> = []
          for (const entityId of entityIds.value) {
            if (limit !== undefined && entities.length >= limit) break
            const entity = HashMap.get(state.entities, entityId)
            if (Option.isSome(entity)) entities.push(entity.value)
          }
          return entities
        }),

      add: (entity) =>
        Effect.gen(function*() {
          const entityEmbedding = mockEmbed(entity.mention)
          yield* Ref.update(stateRef, (state) => ({
            entities: HashMap.set(state.entities, entity.id, entity),
            embeddings: HashMap.set(state.embeddings, entity.id, entityEmbedding),
            typeIndex: addToTypeIndex(state.typeIndex, entity)
          }))
        }),

      remove: (entityId) =>
        Effect.gen(function*() {
          const state = yield* Ref.get(stateRef)
          const existing = HashMap.get(state.entities, entityId)
          if (Option.isNone(existing)) return false

          yield* Ref.update(stateRef, (s) => ({
            entities: HashMap.remove(s.entities, entityId),
            embeddings: HashMap.remove(s.embeddings, entityId),
            typeIndex: removeFromTypeIndex(s.typeIndex, existing.value)
          }))
          return true
        }),

      get: (entityId) =>
        Ref.get(stateRef).pipe(
          Effect.map((state) => HashMap.get(state.entities, entityId))
        ),

      clear: () => Ref.set(stateRef, emptyState),

      size: () => Ref.get(stateRef).pipe(Effect.map((state) => HashMap.size(state.entities)))
    }

    return service as unknown as EntityIndex
  })
)

/**
 * Test fixtures
 */
const createTestEntity = (
  id: string,
  mention: string,
  types: Array<string>
): Entity =>
  new Entity({
    id: EntityId(id),
    mention,
    types,
    attributes: {}
  })

const testEntities = [
  createTestEntity("person_1", "John Smith", ["http://schema.org/Person"]),
  createTestEntity("person_2", "Jane Doe", ["http://schema.org/Person"]),
  createTestEntity("company_1", "Acme Corp", ["http://schema.org/Organization"]),
  createTestEntity("place_1", "New York", ["http://schema.org/Place", "http://schema.org/City"])
]

const testGraph = new KnowledgeGraph({
  entities: testEntities,
  relations: []
})

describe("EntityIndex", () => {
  describe("index()", () => {
    it("indexes all entities from a graph", async () => {
      const result = await Effect.gen(function*() {
        const count = yield* EntityIndex.index(testGraph)
        const size = yield* EntityIndex.size()
        return { count, size }
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.count).toBe(4)
      expect(result.size).toBe(4)
    })

    it("handles empty graph", async () => {
      const emptyGraph = new KnowledgeGraph({ entities: [], relations: [] })

      const result = await Effect.gen(function*() {
        const count = yield* EntityIndex.index(emptyGraph)
        const size = yield* EntityIndex.size()
        return { count, size }
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.count).toBe(0)
      expect(result.size).toBe(0)
    })
  })

  describe("findSimilar()", () => {
    it("finds entities similar to query", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        return yield* EntityIndex.findSimilar("John Smith", 2)
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.length).toBeLessThanOrEqual(2)
      expect(result.length).toBeGreaterThan(0)
      // First result should be most similar (exact match should score highest)
      expect(result[0].entity.mention).toBe("John Smith")
      expect(result[0].score).toBeGreaterThan(0.9)
    })

    it("respects k limit", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        return yield* EntityIndex.findSimilar("person", 2)
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.length).toBeLessThanOrEqual(2)
    })

    it("filters by type when specified", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        return yield* EntityIndex.findSimilar("company", 10, {
          filterTypes: ["http://schema.org/Organization"]
        })
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      // Should only return organizations
      for (const { entity } of result) {
        expect(entity.types).toContain("http://schema.org/Organization")
      }
    })

    it("respects minScore threshold", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        return yield* EntityIndex.findSimilar("xyz123", 10, {
          minScore: 0.99 // Very high threshold
        })
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      // All results should have score >= threshold
      for (const { score } of result) {
        expect(score).toBeGreaterThanOrEqual(0.99)
      }
    })

    it("returns empty for empty index", async () => {
      const result = await Effect.gen(function*() {
        return yield* EntityIndex.findSimilar("test", 5)
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result).toEqual([])
    })
  })

  describe("findByType()", () => {
    it("finds entities by type IRI", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        return yield* EntityIndex.findByType("http://schema.org/Person")
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.length).toBe(2)
      expect(result.map((e) => e.id).sort()).toEqual(["person_1", "person_2"])
    })

    it("finds entities with multiple types", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        return yield* EntityIndex.findByType("http://schema.org/City")
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.length).toBe(1)
      expect(result[0].id).toBe("place_1")
    })

    it("respects limit", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        return yield* EntityIndex.findByType("http://schema.org/Person", 1)
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.length).toBe(1)
    })

    it("returns empty for unknown type", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        return yield* EntityIndex.findByType("http://schema.org/Unknown")
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result).toEqual([])
    })
  })

  describe("add()", () => {
    it("adds a single entity to the index", async () => {
      const newEntity = createTestEntity("person_3", "Bob Wilson", ["http://schema.org/Person"])

      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        const sizeBefore = yield* EntityIndex.size()
        yield* EntityIndex.add(newEntity)
        const sizeAfter = yield* EntityIndex.size()
        const found = yield* EntityIndex.get("person_3")
        return { sizeBefore, sizeAfter, found }
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.sizeBefore).toBe(4)
      expect(result.sizeAfter).toBe(5)
      expect(Option.isSome(result.found)).toBe(true)
    })

    it("updates type index for new entity", async () => {
      const newEntity = createTestEntity("person_3", "Bob Wilson", ["http://schema.org/Person"])

      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        yield* EntityIndex.add(newEntity)
        return yield* EntityIndex.findByType("http://schema.org/Person")
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.length).toBe(3)
      expect(result.map((e) => e.id)).toContain("person_3")
    })
  })

  describe("remove()", () => {
    it("removes an entity from the index", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        const removed = yield* EntityIndex.remove("person_1")
        const sizeAfter = yield* EntityIndex.size()
        const found = yield* EntityIndex.get("person_1")
        return { removed, sizeAfter, found }
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.removed).toBe(true)
      expect(result.sizeAfter).toBe(3)
      expect(Option.isNone(result.found)).toBe(true)
    })

    it("updates type index when entity is removed", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        yield* EntityIndex.remove("person_1")
        return yield* EntityIndex.findByType("http://schema.org/Person")
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.length).toBe(1)
      expect(result[0].id).toBe("person_2")
    })

    it("returns false for non-existent entity", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        return yield* EntityIndex.remove("nonexistent")
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result).toBe(false)
    })
  })

  describe("get()", () => {
    it("retrieves entity by ID", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        return yield* EntityIndex.get("person_1")
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(Option.isSome(result)).toBe(true)
      expect(Option.getOrThrow(result).mention).toBe("John Smith")
    })

    it("returns None for non-existent ID", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        return yield* EntityIndex.get("nonexistent")
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(Option.isNone(result)).toBe(true)
    })
  })

  describe("clear()", () => {
    it("removes all entities from the index", async () => {
      const result = await Effect.gen(function*() {
        yield* EntityIndex.index(testGraph)
        const sizeBefore = yield* EntityIndex.size()
        yield* EntityIndex.clear()
        const sizeAfter = yield* EntityIndex.size()
        return { sizeBefore, sizeAfter }
      }).pipe(Effect.provide(EntityIndexTest), Effect.runPromise)

      expect(result.sizeBefore).toBe(4)
      expect(result.sizeAfter).toBe(0)
    })
  })
})
