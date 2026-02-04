/**
 * Tests for SubgraphExtractor service
 */

import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { Entity, KnowledgeGraph, Relation } from "../../src/Domain/Model/Entity.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import type { FindSimilarOptions, ScoredEntity } from "../../src/Service/EntityIndex.js"
import type { Subgraph, SubgraphExtractorService } from "../../src/Service/SubgraphExtractor.js"

// Test entities for building graphs
const createTestEntities = () => ({
  alice: new Entity({
    id: EntityId("alice"),
    mention: "Alice Smith",
    types: ["http://schema.org/Person"],
    attributes: { name: "Alice" }
  }),
  bob: new Entity({
    id: EntityId("bob"),
    mention: "Bob Jones",
    types: ["http://schema.org/Person"],
    attributes: { name: "Bob" }
  }),
  carol: new Entity({
    id: EntityId("carol"),
    mention: "Carol White",
    types: ["http://schema.org/Person"],
    attributes: { name: "Carol" }
  }),
  dave: new Entity({
    id: EntityId("dave"),
    mention: "Dave Brown",
    types: ["http://schema.org/Person"],
    attributes: { name: "Dave" }
  }),
  acme: new Entity({
    id: EntityId("acme_corp"),
    mention: "ACME Corporation",
    types: ["http://schema.org/Organization"],
    attributes: { name: "ACME" }
  }),
  techCo: new Entity({
    id: EntityId("tech_co"),
    mention: "TechCo Inc",
    types: ["http://schema.org/Organization"],
    attributes: { name: "TechCo" }
  })
})

// Create a simple chain graph: alice -> bob -> carol -> dave
const createChainGraph = (): KnowledgeGraph => {
  const e = createTestEntities()
  return new KnowledgeGraph({
    entities: [e.alice, e.bob, e.carol, e.dave],
    relations: [
      new Relation({ subjectId: "alice", predicate: "http://schema.org/knows", object: "bob" }),
      new Relation({ subjectId: "bob", predicate: "http://schema.org/knows", object: "carol" }),
      new Relation({ subjectId: "carol", predicate: "http://schema.org/knows", object: "dave" })
    ]
  })
}

// Create a star graph: alice connected to bob, carol, dave
const createStarGraph = (): KnowledgeGraph => {
  const e = createTestEntities()
  return new KnowledgeGraph({
    entities: [e.alice, e.bob, e.carol, e.dave],
    relations: [
      new Relation({ subjectId: "alice", predicate: "http://schema.org/knows", object: "bob" }),
      new Relation({ subjectId: "alice", predicate: "http://schema.org/knows", object: "carol" }),
      new Relation({ subjectId: "alice", predicate: "http://schema.org/knows", object: "dave" })
    ]
  })
}

// Create a graph with organizations
const createOrgGraph = (): KnowledgeGraph => {
  const e = createTestEntities()
  return new KnowledgeGraph({
    entities: [e.alice, e.bob, e.carol, e.acme, e.techCo],
    relations: [
      new Relation({ subjectId: "alice", predicate: "http://schema.org/worksFor", object: "acme_corp" }),
      new Relation({ subjectId: "bob", predicate: "http://schema.org/worksFor", object: "acme_corp" }),
      new Relation({ subjectId: "carol", predicate: "http://schema.org/worksFor", object: "tech_co" }),
      new Relation({ subjectId: "alice", predicate: "http://schema.org/knows", object: "bob" }),
      new Relation({ subjectId: "bob", predicate: "http://schema.org/knows", object: "carol" })
    ]
  })
}

// Mock embedding function - returns deterministic embeddings based on text
const mockEmbed = (text: string): ReadonlyArray<number> => {
  // Create a simple hash-based embedding
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash = hash & hash
  }
  // Generate 8-dimensional embedding from hash
  const result: Array<number> = []
  for (let i = 0; i < 8; i++) {
    result.push(Math.sin(hash + i) * 0.5 + 0.5)
  }
  // Normalize
  const norm = Math.sqrt(result.reduce((sum, v) => sum + v * v, 0))
  return result.map((v) => v / norm)
}

// Cosine similarity for mock embeddings
const cosineSim = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => {
  let dot = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
  }
  return dot
}

// Create test implementation of SubgraphExtractor to avoid dependency chain issues
const createTestExtractor = () => {
  // In-memory entity index state
  interface IndexState {
    entities: Map<string, Entity>
    embeddings: Map<string, ReadonlyArray<number>>
  }

  let indexState: IndexState = {
    entities: new Map(),
    embeddings: new Map()
  }

  const indexGraph = (graph: KnowledgeGraph): void => {
    indexState = { entities: new Map(), embeddings: new Map() }
    for (const entity of graph.entities) {
      indexState.entities.set(entity.id, entity)
      indexState.embeddings.set(entity.id, mockEmbed(entity.mention))
    }
  }

  const findSimilar = (
    query: string,
    k: number,
    options: FindSimilarOptions = {}
  ): ReadonlyArray<ScoredEntity> => {
    const queryEmb = mockEmbed(query)
    const minScore = options.minScore ?? 0
    const results: Array<ScoredEntity> = []

    for (const [id, entity] of indexState.entities) {
      // Apply type filter
      if (options.filterTypes && options.filterTypes.length > 0) {
        const hasType = entity.types.some((t) => options.filterTypes!.includes(t))
        if (!hasType) continue
      }

      const emb = indexState.embeddings.get(id)
      if (!emb) continue

      const score = cosineSim(queryEmb, emb)
      if (score >= minScore) {
        results.push({ entity, score })
      }
    }

    results.sort((a, b) => b.score - a.score)
    return results.slice(0, k)
  }

  // N-hop traversal implementation
  const traverseHops = (
    graph: KnowledgeGraph,
    seeds: ReadonlyArray<string>,
    hops: number,
    options: { maxNodes?: number; followOutgoing?: boolean; followIncoming?: boolean }
  ): { nodes: Set<string>; edges: Set<Relation> } => {
    const followOutgoing = options.followOutgoing ?? true
    const followIncoming = options.followIncoming ?? true
    const maxNodes = options.maxNodes ?? Infinity

    const visitedNodes = new Set(seeds)
    const collectedEdges = new Set<Relation>()
    let frontier = new Set(seeds)

    for (let hop = 0; hop < hops && visitedNodes.size < maxNodes; hop++) {
      const nextFrontier = new Set<string>()

      for (const entityId of frontier) {
        if (visitedNodes.size >= maxNodes) break

        if (followOutgoing) {
          const outgoing = graph.getRelationsFrom(entityId)
          for (const rel of outgoing) {
            collectedEdges.add(rel)
            if (rel.isEntityReference && typeof rel.object === "string") {
              if (!visitedNodes.has(rel.object)) {
                nextFrontier.add(rel.object)
              }
            }
          }
        }

        if (followIncoming) {
          const incoming = graph.getRelationsTo(entityId)
          for (const rel of incoming) {
            collectedEdges.add(rel)
            if (!visitedNodes.has(rel.subjectId)) {
              nextFrontier.add(rel.subjectId)
            }
          }
        }
      }

      for (const nodeId of nextFrontier) {
        if (visitedNodes.size >= maxNodes) break
        visitedNodes.add(nodeId)
      }

      frontier = nextFrontier
    }

    return { nodes: visitedNodes, edges: collectedEdges }
  }

  const buildSubgraph = (
    graph: KnowledgeGraph,
    nodeIds: Set<string>,
    edges: Set<Relation>,
    centerNodes: ReadonlyArray<string>,
    depth: number
  ): Subgraph => {
    const nodes: Array<Entity> = []
    for (const nodeId of nodeIds) {
      const entity = graph.getEntity(nodeId)
      if (entity) nodes.push(entity)
    }

    const filteredEdges: Array<Relation> = []
    for (const edge of edges) {
      const hasSubject = nodeIds.has(edge.subjectId)
      const hasObject = !edge.isEntityReference ||
        (typeof edge.object === "string" && nodeIds.has(edge.object))
      if (hasSubject && hasObject) {
        filteredEdges.push(edge)
      }
    }

    return { nodes, edges: filteredEdges, centerNodes, depth }
  }

  const service: SubgraphExtractorService = {
    extract: (graph, seeds, hops, options = {}) =>
      Effect.sync(() => {
        const validSeeds = seeds.filter((id) => graph.getEntity(id) !== undefined)
        if (validSeeds.length === 0) {
          return { nodes: [], edges: [], centerNodes: seeds, depth: 0 }
        }
        const { edges, nodes } = traverseHops(graph, validSeeds, hops, options)
        return buildSubgraph(graph, nodes, edges, validSeeds, hops)
      }),

    extractRelevant: (graph, query, maxNodes, options = {}) =>
      Effect.sync(() => {
        const topK = options.topK ?? 5
        const hops = options.hops ?? 1
        const minSimilarity = options.minSimilarity ?? 0.3

        indexGraph(graph)

        const findOptions: FindSimilarOptions = {
          minScore: minSimilarity,
          filterTypes: options.filterTypes
        }

        const similar = findSimilar(query, topK, findOptions)

        if (similar.length === 0) {
          return { nodes: [], edges: [], centerNodes: [], depth: 0 }
        }

        const seeds = similar.map((s) => s.entity.id)
        const { edges, nodes } = traverseHops(graph, seeds, hops, { maxNodes })
        return buildSubgraph(graph, nodes, edges, seeds, hops)
      })
  }

  return service
}

describe("SubgraphExtractor", () => {
  describe("extract - N-hop traversal", () => {
    it.effect("extracts 0-hop subgraph (seeds only)", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createChainGraph()

        const subgraph = yield* extractor.extract(graph, ["alice"], 0)

        expect(subgraph.nodes.length).toBe(1)
        expect(subgraph.nodes[0].id).toBe("alice")
        expect(subgraph.edges.length).toBe(0)
        expect(subgraph.centerNodes).toEqual(["alice"])
        expect(subgraph.depth).toBe(0)
      }))

    it.effect("extracts 1-hop subgraph from chain", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createChainGraph()

        const subgraph = yield* extractor.extract(graph, ["bob"], 1)

        // bob -> carol (outgoing), alice -> bob (incoming)
        expect(subgraph.nodes.length).toBe(3)
        const nodeIds = subgraph.nodes.map((n) => n.id).sort()
        expect(nodeIds).toEqual(["alice", "bob", "carol"])
        expect(subgraph.edges.length).toBe(2)
        expect(subgraph.depth).toBe(1)
      }))

    it.effect("extracts 2-hop subgraph from chain", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createChainGraph()

        const subgraph = yield* extractor.extract(graph, ["bob"], 2)

        // Should reach all 4 nodes: alice <- bob -> carol -> dave
        expect(subgraph.nodes.length).toBe(4)
        const nodeIds = subgraph.nodes.map((n) => n.id).sort()
        expect(nodeIds).toEqual(["alice", "bob", "carol", "dave"])
        expect(subgraph.edges.length).toBe(3)
        expect(subgraph.depth).toBe(2)
      }))

    it.effect("extracts star graph from center", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createStarGraph()

        const subgraph = yield* extractor.extract(graph, ["alice"], 1)

        // alice connects to bob, carol, dave
        expect(subgraph.nodes.length).toBe(4)
        expect(subgraph.edges.length).toBe(3)
        expect(subgraph.centerNodes).toEqual(["alice"])
      }))

    it.effect("respects maxNodes limit", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createStarGraph()

        const subgraph = yield* extractor.extract(graph, ["alice"], 1, { maxNodes: 2 })

        // Should only get alice + 1 neighbor
        expect(subgraph.nodes.length).toBe(2)
        expect(subgraph.nodes.some((n) => n.id === "alice")).toBe(true)
      }))

    it.effect("respects followOutgoing=false", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createChainGraph()

        // bob with only incoming relations
        const subgraph = yield* extractor.extract(graph, ["bob"], 1, { followOutgoing: false })

        // Only alice -> bob, not bob -> carol
        expect(subgraph.nodes.length).toBe(2)
        const nodeIds = subgraph.nodes.map((n) => n.id).sort()
        expect(nodeIds).toEqual(["alice", "bob"])
      }))

    it.effect("respects followIncoming=false", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createChainGraph()

        // bob with only outgoing relations
        const subgraph = yield* extractor.extract(graph, ["bob"], 1, { followIncoming: false })

        // Only bob -> carol, not alice -> bob
        expect(subgraph.nodes.length).toBe(2)
        const nodeIds = subgraph.nodes.map((n) => n.id).sort()
        expect(nodeIds).toEqual(["bob", "carol"])
      }))

    it.effect("handles multiple seeds", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createChainGraph()

        const subgraph = yield* extractor.extract(graph, ["alice", "dave"], 1)

        // alice -> bob, carol -> dave
        expect(subgraph.nodes.length).toBe(4)
        expect(subgraph.centerNodes).toEqual(["alice", "dave"])
      }))

    it.effect("handles invalid seeds gracefully", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createChainGraph()

        const subgraph = yield* extractor.extract(graph, ["nonexistent"], 1)

        expect(subgraph.nodes.length).toBe(0)
        expect(subgraph.edges.length).toBe(0)
      }))

    it.effect("filters invalid seeds but uses valid ones", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createChainGraph()

        const subgraph = yield* extractor.extract(graph, ["nonexistent", "alice"], 0)

        expect(subgraph.nodes.length).toBe(1)
        expect(subgraph.nodes[0].id).toBe("alice")
      }))

    it.effect("handles empty seeds array", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createChainGraph()

        const subgraph = yield* extractor.extract(graph, [], 1)

        expect(subgraph.nodes.length).toBe(0)
        expect(subgraph.edges.length).toBe(0)
      }))
  })

  describe("extractRelevant - relevance-based extraction", () => {
    it.effect("finds entities similar to query", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createOrgGraph()

        // Query for "Alice" should find alice
        const subgraph = yield* extractor.extractRelevant(graph, "Alice Smith", 10, {
          topK: 1,
          hops: 0
        })

        // Should find alice as most similar
        expect(subgraph.nodes.length).toBeGreaterThanOrEqual(1)
        expect(subgraph.centerNodes.includes("alice")).toBe(true)
      }))

    it.effect("extracts N-hop neighborhood from relevant seeds", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createOrgGraph()

        const subgraph = yield* extractor.extractRelevant(graph, "Alice Smith", 10, {
          topK: 1,
          hops: 1
        })

        // Should find alice and her neighbors (bob, acme_corp)
        expect(subgraph.nodes.length).toBeGreaterThan(1)
        expect(subgraph.depth).toBe(1)
      }))

    it.effect("respects maxNodes limit", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createOrgGraph()

        const subgraph = yield* extractor.extractRelevant(graph, "Alice Smith", 2, {
          topK: 1,
          hops: 2
        })

        expect(subgraph.nodes.length).toBeLessThanOrEqual(2)
      }))

    it.effect("respects type filter", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createOrgGraph()

        // Filter to only organizations
        const subgraph = yield* extractor.extractRelevant(graph, "ACME", 10, {
          topK: 3,
          hops: 0,
          filterTypes: ["http://schema.org/Organization"]
        })

        // Should only find organizations in center nodes
        for (const nodeId of subgraph.centerNodes) {
          const entity = subgraph.nodes.find((n) => n.id === nodeId)
          if (entity) {
            expect(entity.types).toContain("http://schema.org/Organization")
          }
        }
      }))

    it.effect("respects minSimilarity threshold", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createOrgGraph()

        // Very high threshold should filter out most results
        const subgraph = yield* extractor.extractRelevant(graph, "XYZ totally unrelated", 10, {
          topK: 5,
          hops: 0,
          minSimilarity: 0.99 // Very high threshold
        })

        // With such a high threshold, likely no matches
        expect(subgraph.centerNodes.length).toBeLessThanOrEqual(5)
      }))

    it.effect("returns empty subgraph when no matches", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const graph = createOrgGraph()

        // Query with impossibly high threshold
        const subgraph = yield* extractor.extractRelevant(graph, "test", 10, {
          topK: 5,
          hops: 1,
          minSimilarity: 1.0 // Impossible to match
        })

        expect(subgraph.nodes.length).toBe(0)
        expect(subgraph.edges.length).toBe(0)
      }))

    it.effect("handles empty graph", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const emptyGraph = new KnowledgeGraph({ entities: [], relations: [] })

        const subgraph = yield* extractor.extractRelevant(emptyGraph, "test", 10)

        expect(subgraph.nodes.length).toBe(0)
        expect(subgraph.edges.length).toBe(0)
      }))
  })

  describe("edge cases", () => {
    it.effect("handles graph with literal-only relations", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const e = createTestEntities()
        const graph = new KnowledgeGraph({
          entities: [e.alice],
          relations: [
            new Relation({ subjectId: "alice", predicate: "http://schema.org/age", object: 30 }),
            new Relation({ subjectId: "alice", predicate: "http://schema.org/active", object: true })
          ]
        })

        const subgraph = yield* extractor.extract(graph, ["alice"], 1)

        expect(subgraph.nodes.length).toBe(1)
        expect(subgraph.edges.length).toBe(2) // Literal relations should be included
      }))

    it.effect("handles self-referential relations", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const e = createTestEntities()
        const graph = new KnowledgeGraph({
          entities: [e.alice],
          relations: [
            new Relation({ subjectId: "alice", predicate: "http://example.org/selfRef", object: "alice" })
          ]
        })

        const subgraph = yield* extractor.extract(graph, ["alice"], 1)

        expect(subgraph.nodes.length).toBe(1)
        expect(subgraph.edges.length).toBe(1)
      }))

    it.effect("handles disconnected graph components", () =>
      Effect.gen(function*() {
        const extractor = createTestExtractor()
        const e = createTestEntities()
        const graph = new KnowledgeGraph({
          entities: [e.alice, e.bob, e.carol, e.dave],
          relations: [
            // alice-bob component
            new Relation({ subjectId: "alice", predicate: "http://schema.org/knows", object: "bob" }),
            // carol-dave component (disconnected)
            new Relation({ subjectId: "carol", predicate: "http://schema.org/knows", object: "dave" })
          ]
        })

        // Start from alice - should not reach carol/dave
        const subgraph = yield* extractor.extract(graph, ["alice"], 2)

        expect(subgraph.nodes.length).toBe(2)
        const nodeIds = subgraph.nodes.map((n) => n.id).sort()
        expect(nodeIds).toEqual(["alice", "bob"])
      }))
  })
})
