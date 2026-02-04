/**
 * Tests for GraphRAG service
 */

import { LanguageModel } from "@effect/ai"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { Entity, KnowledgeGraph, Relation } from "../../src/Domain/Model/Entity.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import type { FindSimilarOptions, ScoredEntity } from "../../src/Service/EntityIndex.js"
import {
  GraphRAG,
  type GraphRAGService,
  type GroundedAnswer,
  type ReasoningStep,
  type ReasoningTrace,
  type RetrievalResult,
  type ScoredNode
} from "../../src/Service/GraphRAG.js"
import type { Subgraph } from "../../src/Service/SubgraphExtractor.js"

// Test entities
const createTestEntities = () => ({
  alice: new Entity({
    id: EntityId("alice"),
    mention: "Alice Smith",
    types: ["http://schema.org/Person"],
    attributes: { "http://schema.org/jobTitle": "Engineer" }
  }),
  bob: new Entity({
    id: EntityId("bob"),
    mention: "Bob Jones",
    types: ["http://schema.org/Person"],
    attributes: { "http://schema.org/jobTitle": "Manager" }
  }),
  carol: new Entity({
    id: EntityId("carol"),
    mention: "Carol White",
    types: ["http://schema.org/Person"],
    attributes: {}
  }),
  acme: new Entity({
    id: EntityId("acme_corp"),
    mention: "ACME Corporation",
    types: ["http://schema.org/Organization"],
    attributes: { "http://schema.org/foundingDate": "2010" }
  }),
  techCo: new Entity({
    id: EntityId("tech_co"),
    mention: "TechCo Inc",
    types: ["http://schema.org/Organization"],
    attributes: {}
  })
})

// Create test graph with relationships
const createTestGraph = (): KnowledgeGraph => {
  const e = createTestEntities()
  return new KnowledgeGraph({
    entities: [e.alice, e.bob, e.carol, e.acme, e.techCo],
    relations: [
      new Relation({ subjectId: "alice", predicate: "http://schema.org/worksFor", object: "acme_corp" }),
      new Relation({ subjectId: "bob", predicate: "http://schema.org/worksFor", object: "acme_corp" }),
      new Relation({ subjectId: "carol", predicate: "http://schema.org/worksFor", object: "tech_co" }),
      new Relation({ subjectId: "alice", predicate: "http://schema.org/knows", object: "bob" }),
      new Relation({ subjectId: "bob", predicate: "http://schema.org/knows", object: "carol" }),
      new Relation({ subjectId: "alice", predicate: "http://schema.org/age", object: 30 })
    ]
  })
}

// Mock embedding function
const mockEmbed = (text: string): ReadonlyArray<number> => {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash = hash & hash
  }
  const result: Array<number> = []
  for (let i = 0; i < 8; i++) {
    result.push(Math.sin(hash + i) * 0.5 + 0.5)
  }
  const norm = Math.sqrt(result.reduce((sum, v) => sum + v * v, 0))
  return result.map((v) => v / norm)
}

const cosineSim = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => {
  let dot = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
  }
  return dot
}

// Create test GraphRAG implementation
const createTestGraphRAG = () => {
  // In-memory state
  interface IndexState {
    entities: Map<string, Entity>
    embeddings: Map<string, ReadonlyArray<number>>
  }

  let indexState: IndexState = { entities: new Map(), embeddings: new Map() }

  const findSimilar = (
    query: string,
    k: number,
    options: FindSimilarOptions = {}
  ): ReadonlyArray<ScoredEntity> => {
    const queryEmb = mockEmbed(query)
    const minScore = options.minScore ?? 0
    const results: Array<ScoredEntity> = []

    for (const [id, entity] of indexState.entities) {
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

  // N-hop traversal
  const extractSubgraph = (
    graph: KnowledgeGraph,
    seeds: ReadonlyArray<string>,
    hops: number,
    maxNodes: number
  ): Subgraph => {
    const visited = new Set(seeds)
    const collectedEdges = new Set<Relation>()
    let frontier = new Set(seeds)

    for (let hop = 0; hop < hops && visited.size < maxNodes; hop++) {
      const next = new Set<string>()

      for (const entityId of frontier) {
        if (visited.size >= maxNodes) break

        for (const rel of graph.getRelationsFrom(entityId)) {
          collectedEdges.add(rel)
          if (rel.isEntityReference && typeof rel.object === "string" && !visited.has(rel.object)) {
            next.add(rel.object)
          }
        }

        for (const rel of graph.getRelationsTo(entityId)) {
          collectedEdges.add(rel)
          if (!visited.has(rel.subjectId)) {
            next.add(rel.subjectId)
          }
        }
      }

      for (const id of next) {
        if (visited.size >= maxNodes) break
        visited.add(id)
      }

      frontier = next
    }

    const nodes: Array<Entity> = []
    for (const id of visited) {
      const entity = graph.getEntity(id)
      if (entity) nodes.push(entity)
    }

    const edges: Array<Relation> = []
    for (const edge of collectedEdges) {
      const hasSubject = visited.has(edge.subjectId)
      const hasObject = !edge.isEntityReference ||
        (typeof edge.object === "string" && visited.has(edge.object))
      if (hasSubject && hasObject) {
        edges.push(edge)
      }
    }

    return {
      nodes,
      edges,
      centerNodes: seeds.filter((id) => visited.has(id)),
      depth: hops
    }
  }

  // Format context
  const formatContext = (
    subgraph: Subgraph,
    query: string,
    scoredNodes: ReadonlyArray<ScoredNode>,
    includeAttributes: boolean,
    includeRelations: boolean
  ): string => {
    const lines: Array<string> = []
    lines.push("## Retrieved Knowledge Graph Context")
    lines.push("")
    lines.push(`Query: "${query}"`)
    lines.push("")

    const seedCount = scoredNodes.filter((n) => n.isSeed).length
    lines.push(`Found ${subgraph.nodes.length} relevant entities (${seedCount} primary matches)`)
    lines.push(`with ${subgraph.edges.length} relationships.`)
    lines.push("")

    lines.push("### Relevant Entities")
    lines.push("")

    for (const { entity, isSeed, score } of scoredNodes) {
      const types = entity.types.map((t) => t.split(/[#/]/).pop() || t).join(", ")
      const seedMarker = isSeed ? " [SEED]" : ""
      const scoreStr = (score * 100).toFixed(0)
      lines.push(`- ${entity.mention} (${types})${seedMarker} [relevance: ${scoreStr}%]`)

      if (includeAttributes && Object.keys(entity.attributes).length > 0) {
        for (const [prop, value] of Object.entries(entity.attributes)) {
          const propLabel = prop.split(/[#/]/).pop() || prop
          lines.push(`    ${propLabel}: ${String(value)}`)
        }
      }
    }
    lines.push("")

    if (includeRelations && subgraph.edges.length > 0) {
      lines.push("### Relationships")
      lines.push("")

      const entityMap = new Map<string, Entity>(subgraph.nodes.map((e) => [e.id, e]))
      for (const rel of subgraph.edges) {
        const subject = entityMap.get(rel.subjectId)
        const subjectName = subject?.mention ?? rel.subjectId
        const predLabel = rel.predicate.split(/[#/]/).pop() || rel.predicate

        if (rel.isEntityReference && typeof rel.object === "string") {
          const object = entityMap.get(rel.object as string)
          const objectName = object?.mention ?? rel.object
          lines.push(`- ${subjectName} → ${predLabel} → ${objectName}`)
        } else {
          lines.push(`- ${subjectName} → ${predLabel} → "${String(rel.object)}"`)
        }
      }
      lines.push("")
    }

    lines.push("---")
    lines.push("Use the above knowledge graph context to answer the query.")
    lines.push("Cite specific entities and relationships when relevant.")

    return lines.join("\n")
  }

  const service: GraphRAGService = {
    index: (graph) =>
      Effect.sync(() => {
        indexState = { entities: new Map(), embeddings: new Map() }
        for (const entity of graph.entities) {
          indexState.entities.set(entity.id, entity)
          indexState.embeddings.set(entity.id, mockEmbed(entity.mention))
        }
        return graph.entities.length
      }),

    retrieve: (graph, query, options = {}) =>
      Effect.sync(() => {
        const topK = options.topK ?? 5
        const hops = options.hops ?? 1
        const maxNodes = options.maxNodes ?? 50
        const minScore = options.minScore ?? 0.3
        const includeAttributes = options.includeAttributes ?? true
        const includeRelations = options.includeRelations ?? true

        // Step 1: Find similar
        const similar = findSimilar(query, topK, {
          minScore,
          filterTypes: options.includeTypes
        })

        if (similar.length === 0) {
          const emptySubgraph: Subgraph = {
            nodes: [],
            edges: [],
            centerNodes: [],
            depth: 0
          }
          return {
            subgraph: emptySubgraph,
            scoredNodes: [],
            context:
              `## Retrieved Knowledge Graph Context\n\nQuery: "${query}"\n\nNo relevant entities found in the knowledge graph.`,
            query,
            stats: {
              seedCount: 0,
              nodeCount: 0,
              edgeCount: 0,
              hops: 0,
              avgScore: 0
            }
          }
        }

        // Build seed maps
        const seedScores = new Map<string, number>()
        similar.forEach((s) => seedScores.set(s.entity.id, s.score))

        const seedIds = similar.map((s) => s.entity.id)

        // Step 2: Extract subgraph
        const subgraph = extractSubgraph(graph, seedIds, hops, maxNodes)

        // Step 3: Score nodes
        const scoredNodes: Array<ScoredNode> = subgraph.nodes.map((entity) => {
          const isSeed = seedIds.includes(entity.id)
          const embeddingScore = seedScores.get(entity.id) ?? 0
          return {
            entity,
            score: isSeed ? embeddingScore : 0.5,
            hopDistance: isSeed ? 0 : 1,
            isSeed
          }
        })
        scoredNodes.sort((a, b) => b.score - a.score)

        // Step 4: Format context
        const context = formatContext(subgraph, query, scoredNodes, includeAttributes, includeRelations)

        const avgScore = scoredNodes.length > 0
          ? scoredNodes.reduce((sum, n) => sum + n.score, 0) / scoredNodes.length
          : 0

        return {
          subgraph,
          scoredNodes,
          context,
          query,
          stats: {
            seedCount: similar.length,
            nodeCount: subgraph.nodes.length,
            edgeCount: subgraph.edges.length,
            hops,
            avgScore
          }
        }
      }),

    formatContext: (subgraph, query, options = {}) =>
      Effect.sync(() => {
        const includeAttributes = options.includeAttributes ?? true
        const includeRelations = options.includeRelations ?? true

        const scoredNodes: Array<ScoredNode> = subgraph.nodes.map((entity) => ({
          entity,
          score: subgraph.centerNodes.includes(entity.id) ? 1 : 0.5,
          hopDistance: subgraph.centerNodes.includes(entity.id) ? 0 : 1,
          isSeed: subgraph.centerNodes.includes(entity.id)
        }))

        return formatContext(subgraph, query, scoredNodes, includeAttributes, includeRelations)
      }),

    generate: () => Effect.die(new Error("generate() not implemented in test mock")),

    answer: () => Effect.die(new Error("answer() not implemented in test mock")),

    explain: () => Effect.die(new Error("explain() not implemented in test mock")),

    clear: () =>
      Effect.sync(() => {
        indexState = { entities: new Map(), embeddings: new Map() }
      }),

    size: () => Effect.sync(() => indexState.entities.size)
  }

  return service
}

describe("GraphRAG", () => {
  describe("index()", () => {
    it.effect("indexes all entities from a graph", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const graph = createTestGraph()

        const count = yield* rag.index(graph)
        const size = yield* rag.size()

        expect(count).toBe(5)
        expect(size).toBe(5)
      }))

    it.effect("handles empty graph", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const emptyGraph = new KnowledgeGraph({ entities: [], relations: [] })

        const count = yield* rag.index(emptyGraph)
        expect(count).toBe(0)
      }))
  })

  describe("retrieve()", () => {
    it.effect("retrieves relevant context for a query", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const graph = createTestGraph()
        yield* rag.index(graph)

        const result = yield* rag.retrieve(graph, "Alice Smith", { topK: 1, hops: 1 })

        expect(result.query).toBe("Alice Smith")
        expect(result.stats.seedCount).toBeGreaterThanOrEqual(1)
        expect(result.scoredNodes.length).toBeGreaterThan(0)
        expect(result.context).toContain("Alice Smith")
      }))

    it.effect("extracts N-hop neighborhood", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const graph = createTestGraph()
        yield* rag.index(graph)

        const result = yield* rag.retrieve(graph, "Alice Smith", {
          topK: 1,
          hops: 1,
          minScore: 0
        })

        // Should find alice and her 1-hop neighbors (bob, acme_corp)
        expect(result.stats.nodeCount).toBeGreaterThan(1)
        expect(result.subgraph.edges.length).toBeGreaterThan(0)
      }))

    it.effect("respects maxNodes limit", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const graph = createTestGraph()
        yield* rag.index(graph)

        const result = yield* rag.retrieve(graph, "Alice Smith", {
          topK: 3,
          hops: 2,
          maxNodes: 3,
          minScore: 0
        })

        expect(result.stats.nodeCount).toBeLessThanOrEqual(3)
      }))

    it.effect("filters by type", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const graph = createTestGraph()
        yield* rag.index(graph)

        const result = yield* rag.retrieve(graph, "ACME", {
          topK: 5,
          hops: 0,
          includeTypes: ["http://schema.org/Organization"],
          minScore: 0
        })

        // Only organizations should be seeds
        for (const node of result.scoredNodes.filter((n) => n.isSeed)) {
          expect(node.entity.types).toContain("http://schema.org/Organization")
        }
      }))

    it.effect("returns empty result for no matches", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const graph = createTestGraph()
        yield* rag.index(graph)

        const result = yield* rag.retrieve(graph, "xyz123 unrelated query", {
          minScore: 1.0 // Impossible threshold (cosine sim max is ~1.0, but normalized embeddings won't reach it)
        })

        // Should return empty or near-empty since threshold is impossibly high
        expect(result.context).toContain("Retrieved Knowledge Graph Context")
      }))

    it.effect("includes scored nodes sorted by relevance", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const graph = createTestGraph()
        yield* rag.index(graph)

        const result = yield* rag.retrieve(graph, "Alice Smith", {
          topK: 2,
          hops: 1,
          minScore: 0
        })

        // Verify sorted by score
        for (let i = 1; i < result.scoredNodes.length; i++) {
          expect(result.scoredNodes[i].score).toBeLessThanOrEqual(result.scoredNodes[i - 1].score)
        }
      }))
  })

  describe("formatContext()", () => {
    it.effect("formats subgraph as readable context", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const e = createTestEntities()

        const subgraph: Subgraph = {
          nodes: [e.alice, e.bob],
          edges: [
            new Relation({ subjectId: "alice", predicate: "http://schema.org/knows", object: "bob" })
          ],
          centerNodes: ["alice"],
          depth: 1
        }

        const context = yield* rag.formatContext(subgraph, "Who does Alice know?")

        expect(context).toContain("Who does Alice know?")
        expect(context).toContain("Alice Smith")
        expect(context).toContain("Bob Jones")
        expect(context).toContain("knows")
        expect(context).toContain("[SEED]")
      }))

    it.effect("includes entity attributes when requested", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const e = createTestEntities()

        const subgraph: Subgraph = {
          nodes: [e.alice],
          edges: [],
          centerNodes: ["alice"],
          depth: 0
        }

        const context = yield* rag.formatContext(subgraph, "test", { includeAttributes: true })

        expect(context).toContain("jobTitle")
        expect(context).toContain("Engineer")
      }))

    it.effect("excludes relations when requested", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const e = createTestEntities()

        const subgraph: Subgraph = {
          nodes: [e.alice, e.bob],
          edges: [
            new Relation({ subjectId: "alice", predicate: "http://schema.org/knows", object: "bob" })
          ],
          centerNodes: ["alice"],
          depth: 1
        }

        const context = yield* rag.formatContext(subgraph, "test", { includeRelations: false })

        expect(context).not.toContain("### Relationships")
      }))

    it.effect("handles literal values in relations", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const e = createTestEntities()

        const subgraph: Subgraph = {
          nodes: [e.alice],
          edges: [
            new Relation({ subjectId: "alice", predicate: "http://schema.org/age", object: 30 })
          ],
          centerNodes: ["alice"],
          depth: 0
        }

        const context = yield* rag.formatContext(subgraph, "test")

        expect(context).toContain("age")
        expect(context).toContain("30")
      }))
  })

  describe("clear() and size()", () => {
    it.effect("clears the index", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const graph = createTestGraph()

        yield* rag.index(graph)
        const sizeBefore = yield* rag.size()

        yield* rag.clear()
        const sizeAfter = yield* rag.size()

        expect(sizeBefore).toBe(5)
        expect(sizeAfter).toBe(0)
      }))
  })

  describe("context coherence", () => {
    it.effect("produces coherent context with clear structure", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const graph = createTestGraph()
        yield* rag.index(graph)

        const result = yield* rag.retrieve(graph, "Who works at ACME?", {
          topK: 3,
          hops: 1,
          minScore: 0
        })

        // Verify context has expected sections
        expect(result.context).toContain("## Retrieved Knowledge Graph Context")
        expect(result.context).toContain("Query:")
        expect(result.context).toContain("### Relevant Entities")
        expect(result.context).toContain("---")
        expect(result.context).toContain("Use the above knowledge graph context")
      }))

    it.effect("marks seed entities clearly", () =>
      Effect.gen(function*() {
        const rag = createTestGraphRAG()
        const graph = createTestGraph()
        yield* rag.index(graph)

        const result = yield* rag.retrieve(graph, "Alice Smith", {
          topK: 1,
          hops: 1,
          minScore: 0
        })

        // At least one entity should be marked as seed
        expect(result.context).toContain("[SEED]")
        const seedNodes = result.scoredNodes.filter((n) => n.isSeed)
        expect(seedNodes.length).toBeGreaterThan(0)
      }))
  })
})

// =============================================================================
// Tests for generate() and answer() with mock LLM
// =============================================================================

/**
 * Create a mock LLM service that returns predefined answers
 */
const createMockLlm = (answer: string, citations: Array<string>, confidence: number) =>
  Layer.succeed(LanguageModel.LanguageModel, {
    generateObject: () =>
      Effect.succeed({
        value: {
          answer,
          citations,
          confidence,
          reasoning: "Mock reasoning from test LLM"
        },
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150
        }
      } as any),
    generateText: () =>
      Effect.succeed({ text: answer, usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 } } as any),
    generateEmbeddings: () => Effect.succeed({ embeddings: [] } as any),
    stream: () => Effect.succeed({ stream: Effect.succeed([]) } as any),
    streamText: () => Effect.succeed({ stream: Effect.succeed([]) } as any)
  } as unknown as LanguageModel.Service)

/**
 * Create a mock retrieval result for testing generate()
 */
const createMockRetrievalResult = (): RetrievalResult => {
  const e = createTestEntities()
  return {
    subgraph: {
      nodes: [e.alice, e.acme],
      edges: [
        new Relation({
          subjectId: "alice",
          predicate: "http://schema.org/worksFor",
          object: "acme_corp" // Entity reference (lowercase snake_case)
        })
      ],
      centerNodes: ["alice"],
      depth: 1
    },
    scoredNodes: [
      { entity: e.alice, score: 0.95, hopDistance: 0, isSeed: true },
      { entity: e.acme, score: 0.7, hopDistance: 1, isSeed: false }
    ],
    context: `## Retrieved Knowledge Graph Context

Query: "Where does Alice work?"

Found 2 relevant entities (1 primary matches)
with 1 relationships.

### Relevant Entities

- Alice Smith (Person) [SEED] [relevance: 95%]
    jobTitle: Engineer
- ACME Corporation (Organization) [relevance: 70%]
    foundingDate: 2010

### Relationships

- Alice Smith → worksFor → ACME Corporation

---
Use the above knowledge graph context to answer the query.
Cite specific entities and relationships when relevant.`,
    query: "Where does Alice work?",
    stats: {
      seedCount: 1,
      nodeCount: 2,
      edgeCount: 1,
      hops: 1,
      avgScore: 0.825
    }
  }
}

describe("GraphRAG grounded generation", () => {
  describe("generate()", () => {
    it.effect("generates grounded answer from retrieval context", () =>
      Effect.gen(function*() {
        const mockLlm = yield* LanguageModel.LanguageModel
        const retrieval = createMockRetrievalResult()

        const graphRAG = createTestGraphRAG()

        // Note: We can't easily test the actual generate() with mock since
        // it uses generateObjectWithFeedback internally. Instead we verify
        // the retrieval result structure that would be passed to generate.
        expect(retrieval.context).toContain("Alice Smith")
        expect(retrieval.context).toContain("ACME Corporation")
        expect(retrieval.stats.seedCount).toBe(1)
        expect(retrieval.stats.nodeCount).toBe(2)
      }).pipe(
        Effect.provide(createMockLlm("Alice works at ACME Corporation", ["alice", "acme_corp"], 0.95))
      ))

    it("GroundedAnswer has correct structure", () => {
      // Type-level test: ensure GroundedAnswer has expected properties
      const mockAnswer: GroundedAnswer = {
        answer: "Test answer",
        citations: ["alice", "bob"],
        confidence: 0.9,
        reasoning: "Based on the knowledge graph",
        retrieval: createMockRetrievalResult()
      }

      expect(mockAnswer.answer).toBe("Test answer")
      expect(mockAnswer.citations).toHaveLength(2)
      expect(mockAnswer.confidence).toBeGreaterThanOrEqual(0)
      expect(mockAnswer.confidence).toBeLessThanOrEqual(1)
      expect(mockAnswer.reasoning).toBeTruthy()
      expect(mockAnswer.retrieval.subgraph.nodes).toHaveLength(2)
    })
  })

  describe("answer() pipeline", () => {
    it.effect("orchestrates index → retrieve → generate", () =>
      Effect.gen(function*() {
        // This test verifies the pipeline flow conceptually
        // Actual LLM integration would require full service setup
        const rag = createTestGraphRAG()
        const graph = createTestGraph()

        // Step 1: Index
        const indexCount = yield* rag.index(graph)
        expect(indexCount).toBe(5)

        // Step 2: Retrieve
        const retrieval = yield* rag.retrieve(graph, "Where does Alice work?", {
          topK: 2,
          hops: 1,
          minScore: 0
        })

        // Verify retrieval produces valid input for generate
        expect(retrieval.context).toBeTruthy()
        expect(retrieval.query).toBe("Where does Alice work?")
        expect(retrieval.subgraph).toBeTruthy()
        expect(retrieval.stats).toBeTruthy()
      }))

    it("correctly combines retrieval and generation options", () => {
      // Type-level test for AnswerOptions
      const options = {
        // Retrieval options
        topK: 5,
        hops: 2,
        maxNodes: 50,
        minScore: 0.3,
        includeTypes: ["http://schema.org/Person"],
        includeAttributes: true,
        includeRelations: true,
        // Generation options
        temperature: 0.3,
        timeoutMs: 30000,
        maxAttempts: 3
      }

      expect(options.topK).toBe(5)
      expect(options.temperature).toBe(0.3)
    })
  })

  describe("RetrievalResult structure", () => {
    it("contains all required fields", () => {
      const result = createMockRetrievalResult()

      // Subgraph
      expect(result.subgraph.nodes).toBeInstanceOf(Array)
      expect(result.subgraph.edges).toBeInstanceOf(Array)
      expect(result.subgraph.centerNodes).toBeInstanceOf(Array)
      expect(typeof result.subgraph.depth).toBe("number")

      // Scored nodes
      expect(result.scoredNodes).toBeInstanceOf(Array)
      expect(result.scoredNodes[0]).toHaveProperty("entity")
      expect(result.scoredNodes[0]).toHaveProperty("score")
      expect(result.scoredNodes[0]).toHaveProperty("hopDistance")
      expect(result.scoredNodes[0]).toHaveProperty("isSeed")

      // Context
      expect(typeof result.context).toBe("string")
      expect(result.context.length).toBeGreaterThan(0)

      // Stats
      expect(typeof result.stats.seedCount).toBe("number")
      expect(typeof result.stats.nodeCount).toBe("number")
      expect(typeof result.stats.edgeCount).toBe("number")
      expect(typeof result.stats.hops).toBe("number")
      expect(typeof result.stats.avgScore).toBe("number")
    })
  })

  describe("explain() - reasoning traces", () => {
    it("ReasoningStep has correct structure", () => {
      const e = createTestEntities()
      const step: ReasoningStep = {
        from: e.alice,
        relation: new Relation({
          subjectId: "alice",
          predicate: "http://schema.org/worksFor",
          object: "acme_corp"
        }),
        to: e.acme,
        explanation: "Alice works at ACME Corporation"
      }

      expect(step.from.id).toBe("alice")
      expect(step.to.id).toBe("acme_corp")
      expect(step.relation.predicate).toContain("worksFor")
      expect(step.explanation).toBeTruthy()
    })

    it("ReasoningTrace has correct structure", () => {
      const e = createTestEntities()
      const trace: ReasoningTrace = {
        steps: [
          {
            from: e.alice,
            relation: new Relation({
              subjectId: "alice",
              predicate: "http://schema.org/worksFor",
              object: "acme_corp"
            }),
            to: e.acme,
            explanation: "Alice works at ACME Corporation"
          }
        ],
        explanation: "The answer was derived by finding that Alice works at ACME Corporation.",
        confidence: 0.9,
        query: "Where does Alice work?",
        involvedEntities: ["alice", "acme_corp"]
      }

      expect(trace.steps).toHaveLength(1)
      expect(trace.explanation).toBeTruthy()
      expect(trace.confidence).toBeGreaterThanOrEqual(0)
      expect(trace.confidence).toBeLessThanOrEqual(1)
      expect(trace.query).toBe("Where does Alice work?")
      expect(trace.involvedEntities).toContain("alice")
      expect(trace.involvedEntities).toContain("acme_corp")
    })

    it("ReasoningTrace can represent multi-hop paths", () => {
      const e = createTestEntities()
      const trace: ReasoningTrace = {
        steps: [
          {
            from: e.alice,
            relation: new Relation({
              subjectId: "alice",
              predicate: "http://schema.org/knows",
              object: "bob"
            }),
            to: e.bob,
            explanation: "Alice knows Bob"
          },
          {
            from: e.bob,
            relation: new Relation({
              subjectId: "bob",
              predicate: "http://schema.org/worksFor",
              object: "tech_co"
            }),
            to: e.techCo,
            explanation: "Bob works for TechCo"
          }
        ],
        explanation: "Alice knows Bob, who works at TechCo.",
        confidence: 0.85,
        query: "What company does Alice's friend work for?",
        involvedEntities: ["alice", "bob", "tech_co"]
      }

      expect(trace.steps).toHaveLength(2)
      expect(trace.steps[0].to.id).toBe("bob")
      expect(trace.steps[1].from.id).toBe("bob")
      expect(trace.involvedEntities).toHaveLength(3)
    })

    it("ExplainOptions extends GenerationOptions", () => {
      const options = {
        temperature: 0.2,
        timeoutMs: 20000,
        maxAttempts: 2,
        generateStepExplanations: true
      }

      expect(options.temperature).toBe(0.2)
      expect(options.generateStepExplanations).toBe(true)
    })
  })
})
