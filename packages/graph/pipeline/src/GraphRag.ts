/**
 * Graph RAG pipeline — knowledge graph retrieval-augmented generation.
 *
 * Six-step pipeline: concept extraction → embedding → entity lookup →
 * BFS subgraph traversal → edge scoring → answer synthesis.
 *
 * Every step is an `Effect.fn` with automatic tracing spans.
 *
 * @module
 * @since 0.1.0
 */

import { $GraphPipelineId } from "@beep/identity";
import * as Primitives from "@beep/graph-schema/Primitives";
import { Effect, Schema } from "effect";
import * as S from "effect/Schema";

import { EmbeddingsClient, GraphEmbeddingsClient, LlmClient, PromptClient, TriplesClient } from "./Clients.ts";
import { GraphRagError } from "./Errors.ts";

const $I = $GraphPipelineId.create("GraphRag");

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/**
 * Options that tune graph retrieval during a Graph RAG query.
 *
 * @since 0.1.0
 * @category models
 */
export class GraphRagOptions extends S.Class<GraphRagOptions>($I`GraphRagOptions`)({
  collection: S.optionalKey(S.String).annotateKey({
    description: "Optional collection identifier used to scope graph retrieval.",
  }),
  entityLimit: S.optionalKey(S.Number).annotateKey({
    description: "Optional maximum number of seed entities to retrieve.",
  }),
  maxPathLength: S.optionalKey(S.Number).annotateKey({
    description: "Optional breadth-first traversal depth limit.",
  }),
  maxSubgraphSize: S.optionalKey(S.Number).annotateKey({
    description: "Optional maximum number of triples retained in the subgraph.",
  }),
  tripleLimit: S.optionalKey(S.Number).annotateKey({
    description: "Optional maximum number of triples fetched per entity expansion.",
  }),
}, $I.annote("GraphRagOptions", {
  description: "Configuration for graph retrieval-augmented generation queries.",
})) {}

const DEFAULTS = {
  entityLimit: 50,
  tripleLimit: 30,
  maxSubgraphSize: 1000,
  maxPathLength: 2,
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const termToString = (t: Primitives.Term): string => {
  switch (t.type) {
    case "IRI":
      return t.iri;
    case "LITERAL":
      return t.value;
    case "BLANK":
      return `_:${t.id}`;
    case "TRIPLE":
      return `<<${termToString(t.triple.s)} ${termToString(t.triple.p)} ${termToString(t.triple.o)}>>`;
  }
};

// ---------------------------------------------------------------------------
// Pipeline steps
// ---------------------------------------------------------------------------

/**
 * Step 1: Extract concepts from the query using an LLM.
 */
const extractConcepts = Effect.fn("GraphRag.extractConcepts")(function* (query: string) {
  const prompt = yield* PromptClient;
  const llm = yield* LlmClient;

  const template = yield* prompt.render({ name: "extract-concepts", variables: { query } });
  const completion = yield* llm.complete({ system: template.system, prompt: template.prompt });

  const concepts = completion.response
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (concepts.length === 0) {
    return yield* new GraphRagError({ phase: "extractConcepts", reason: "No concepts extracted from query" });
  }

  yield* Effect.logDebug(`Extracted ${concepts.length} concepts`);
  return concepts;
});

/**
 * Step 2: Embed concepts into vector space.
 */
const embedConcepts = Effect.fn("GraphRag.embedConcepts")(function* (concepts: ReadonlyArray<string>) {
  const embeddings = yield* EmbeddingsClient;
  const result = yield* embeddings.embed({ text: [...concepts] });
  return result.vectors;
});

/**
 * Step 3: Find entities in the knowledge graph via semantic search.
 */
const findEntities = Effect.fn("GraphRag.findEntities")(function* (
  vectors: ReadonlyArray<ReadonlyArray<number>>,
  collection: string | undefined,
  entityLimit: number
) {
  const graphEmbeddings = yield* GraphEmbeddingsClient;
  const result = yield* graphEmbeddings.find({
    vectors: vectors as number[][],
    user: "default",
    limit: entityLimit,
    ...(collection !== undefined ? { collection } : {}),
  });
  yield* Effect.logDebug(`Found ${result.entities.length} entities`);
  return result.entities;
});

/**
 * Step 4: BFS traversal of the knowledge graph from seed entities.
 */
const traverseGraph = Effect.fn("GraphRag.traverseGraph")(function* (
  seedEntities: ReadonlyArray<Primitives.Term>,
  collection: string | undefined,
  tripleLimit: number,
  maxSubgraphSize: number,
  maxPathLength: number
) {
  const triples = yield* TriplesClient;

  const visited = new Set<string>();
  const subgraph: Primitives.Triple[] = [];
  let currentFrontier: Primitives.Term[] = [...seedEntities];

  for (let depth = 0; depth < maxPathLength && currentFrontier.length > 0; depth++) {
    const nextFrontier: Primitives.Term[] = [];

    // Filter unvisited
    const unvisited = currentFrontier.filter((t) => {
      const key = termToString(t);
      if (visited.has(key)) return false;
      visited.add(key);
      return true;
    });

    // Query triples for each entity in the frontier
    for (const entity of unvisited) {
      if (subgraph.length >= maxSubgraphSize) break;

      const result = yield* triples.query({
        s: entity as Primitives.Term,
        limit: tripleLimit,
        ...(collection !== undefined ? { collection } : {}),
      });

      for (const triple of result.triples) {
        subgraph.push(triple as Primitives.Triple);
        // Add objects as next-level frontier (only if not terminal depth)
        if (depth < maxPathLength - 1) {
          nextFrontier.push(triple.o as Primitives.Term);
        }
      }
    }

    currentFrontier = nextFrontier;
    yield* Effect.logDebug(`BFS depth ${depth}: ${subgraph.length} triples collected`);
  }

  return subgraph;
});

/**
 * Step 5: Score and filter edges by relevance to the query.
 *
 * Skipped when the subgraph is small enough (<=500 triples).
 */
const scoreEdges = Effect.fn("GraphRag.scoreEdges")(function* (
  query: string,
  subgraph: ReadonlyArray<Primitives.Triple>
) {
  // Small subgraphs don't need scoring
  if (subgraph.length <= 500) {
    return [...subgraph];
  }

  const prompt = yield* PromptClient;
  const llm = yield* LlmClient;

  // Format edges for LLM scoring
  const edgeList = subgraph.slice(0, 50).map((t, i) => ({
    id: i,
    s: termToString(t.s),
    p: termToString(t.p),
    o: termToString(t.o),
  }));

  const jsonStringify = Schema.encodeUnknownSync(Schema.UnknownFromJsonString);
  const jsonParse = Schema.decodeUnknownSync(Schema.UnknownFromJsonString);
  const knowledge = jsonStringify(edgeList);
  const template = yield* prompt.render({
    name: "kg-edge-scoring",
    variables: { query, knowledge },
  });

  const completion = yield* llm.complete({ system: template.system, prompt: template.prompt });

  // Parse scored edges — expect JSON array of { id, score }
  const scored = yield* Effect.try({
    try: () => {
      const parsed = jsonParse(completion.response) as Array<{ id: number; score: number }>;
      return parsed
        .filter((s) => Number.isFinite(s.score) && Number.isInteger(s.id) && s.id >= 0 && s.id < edgeList.length)
        .map((s) => ({ ...s, score: Math.max(0, Math.min(1, s.score)) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 25);
    },
    catch: () => new GraphRagError({ phase: "scoreEdges", reason: "Failed to parse LLM scoring response" }),
  });

  // Map back to triples — id is guaranteed in-bounds by the filter above
  return scored.map((s) => subgraph[s.id]!).filter((t): t is Primitives.Triple => t !== undefined);
});

/**
 * Step 6: Synthesize an answer from the retrieved subgraph.
 */
const synthesize = Effect.fn("GraphRag.synthesize")(function* (query: string, edges: ReadonlyArray<Primitives.Triple>) {
  const prompt = yield* PromptClient;
  const llm = yield* LlmClient;

  const context = edges.map((t) => `${termToString(t.s)} -> ${termToString(t.p)} -> ${termToString(t.o)}`).join("\n");

  const template = yield* prompt.render({
    name: "graph-rag-synthesize",
    variables: { query, context },
  });

  const completion = yield* llm.complete({ system: template.system, prompt: template.prompt });
  return completion.response;
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Result of a Graph RAG query.
 *
 * @since 0.1.0
 * @category models
 */
export class GraphRagResult extends S.Class<GraphRagResult>($I`GraphRagResult`)({
  answer: S.String.annotateKey({
    description: "Synthesized answer returned by the Graph RAG pipeline.",
  }),
  subgraph: S.Array(Primitives.Triple).annotateKey({
    description: "Retrieved and scored subgraph used to ground the answer.",
  }),
}, $I.annote("GraphRagResult", {
  description: "Resolved answer plus the retrieved graph context used to produce it.",
})) {}

/**
 * Execute a Graph RAG query against the knowledge graph.
 *
 * @since 0.1.0
 * @category pipelines
 */
export const graphRagQuery = Effect.fn("GraphRag.query")(function* (
  query: string,
  options: GraphRagOptions = new GraphRagOptions({})
) {
  const entityLimit = options.entityLimit ?? DEFAULTS.entityLimit;
  const tripleLimit = options.tripleLimit ?? DEFAULTS.tripleLimit;
  const maxSubgraphSize = options.maxSubgraphSize ?? DEFAULTS.maxSubgraphSize;
  const maxPathLength = options.maxPathLength ?? DEFAULTS.maxPathLength;

  const concepts = yield* extractConcepts(query);
  const vectors = yield* embedConcepts(concepts);
  const entities = yield* findEntities(vectors, options.collection, entityLimit);
  const subgraph = yield* traverseGraph(entities, options.collection, tripleLimit, maxSubgraphSize, maxPathLength);
  const scored = yield* scoreEdges(query, subgraph);
  const answer = yield* synthesize(query, scored);

  return new GraphRagResult({ answer, subgraph: scored });
});
