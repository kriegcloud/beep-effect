import {
  EmbeddingsClient,
  GraphEmbeddingsClient,
  LlmClient,
  PromptClient,
  TriplesClient,
} from "@beep/beepgraph-pipeline/Clients";
import { graphRagQuery } from "@beep/beepgraph-pipeline/GraphRag";
import type { Primitives } from "@beep/beepgraph-schema";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const iri = (value: string): Primitives.Term => ({ type: "IRI", iri: value });
const literal = (value: string): Primitives.Term => ({ type: "LITERAL", value });

const SEED_ENTITIES: ReadonlyArray<Primitives.Term> = [
  iri("http://example.org/RLHF"),
  iri("http://example.org/ConstitutionalAI"),
];

const SEED_TRIPLES: ReadonlyArray<Primitives.Triple> = [
  { s: iri("http://example.org/RLHF"), p: iri("http://example.org/usedBy"), o: iri("http://example.org/ChatGPT") },
  {
    s: iri("http://example.org/ConstitutionalAI"),
    p: iri("http://example.org/developedBy"),
    o: literal("Anthropic"),
  },
  {
    s: iri("http://example.org/RLHF"),
    p: iri("http://example.org/isA"),
    o: literal("training technique"),
  },
];

// Track which prompts were requested
const promptCalls: string[] = [];
const llmCalls: string[] = [];

// ---------------------------------------------------------------------------
// Mock layers
// ---------------------------------------------------------------------------

const MockLlmClient = Layer.succeed(LlmClient)(
  LlmClient.of({
    complete: (req) =>
      Effect.sync(() => {
        llmCalls.push(req.prompt.slice(0, 50));

        // Concept extraction: return newline-separated concepts
        if (req.system.includes("extract")) {
          return { response: "RLHF\nConstitutional AI\nAlignment" };
        }
        // Synthesis: return a grounded answer
        return {
          response: "RLHF is a training technique used by ChatGPT. Constitutional AI was developed by Anthropic.",
        };
      }),
  })
);

const MockEmbeddingsClient = Layer.succeed(EmbeddingsClient)(
  EmbeddingsClient.of({
    embed: (req) =>
      Effect.succeed({
        vectors: req.text.map((_, i) => [0.1 * (i + 1), 0.2 * (i + 1), 0.3 * (i + 1)]),
      }),
  })
);

const MockGraphEmbeddingsClient = Layer.succeed(GraphEmbeddingsClient)(
  GraphEmbeddingsClient.of({
    find: () => Effect.succeed({ entities: [...SEED_ENTITIES] }),
  })
);

const MockTriplesClient = Layer.succeed(TriplesClient)(
  TriplesClient.of({
    query: () => Effect.succeed({ triples: [...SEED_TRIPLES] }),
  })
);

const MockPromptClient = Layer.succeed(PromptClient)(
  PromptClient.of({
    render: (req) =>
      Effect.sync(() => {
        promptCalls.push(req.name);
        return {
          system: `You are an AI. Task: ${req.name}`,
          prompt: `Query: ${req.variables?.query ?? "n/a"}`,
        };
      }),
  })
);

const TestLayer = Layer.mergeAll(
  MockLlmClient,
  MockEmbeddingsClient,
  MockGraphEmbeddingsClient,
  MockTriplesClient,
  MockPromptClient
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GraphRag pipeline", () => {
  // Reset call trackers before each test
  beforeEach(() => {
    promptCalls.length = 0;
    llmCalls.length = 0;
  });

  it.effect("executes the full 6-step pipeline and returns an answer with subgraph", () =>
    Effect.gen(function* () {
      const result = yield* graphRagQuery("What is RLHF?");

      // Verify answer is non-empty
      expect(result.answer).toBeTruthy();
      expect(result.answer).toContain("RLHF");

      // Verify subgraph contains the seed triples
      expect(result.subgraph.length).toBeGreaterThan(0);

      // Verify prompt calls: extract-concepts + graph-rag-synthesize
      // (no edge scoring since subgraph <= 500 triples)
      expect(promptCalls).toContain("extract-concepts");
      expect(promptCalls).toContain("graph-rag-synthesize");
    }).pipe(Effect.provide(TestLayer))
  );

  it.effect("skips edge scoring when subgraph is small (<= 500 triples)", () =>
    Effect.gen(function* () {
      const result = yield* graphRagQuery("What is Constitutional AI?");

      // Edge scoring not called since subgraph <= 500 triples
      expect(promptCalls).not.toContain("kg-edge-scoring");

      // Subgraph has triples from BFS (2 depth levels, multiple entities)
      expect(result.subgraph.length).toBeGreaterThan(0);
      expect(result.subgraph.length).toBeLessThanOrEqual(500);
    }).pipe(Effect.provide(TestLayer))
  );

  it.effect("respects collection option in entity lookup", () => {
    const calls: Array<{ collection?: string }> = [];

    const TrackingGraphEmbeddings = Layer.succeed(GraphEmbeddingsClient)(
      GraphEmbeddingsClient.of({
        find: (req) =>
          Effect.sync(() => {
            calls.push({ collection: req.collection });
            return { entities: [...SEED_ENTITIES] };
          }),
      })
    );

    return Effect.gen(function* () {
      yield* graphRagQuery("test query", { collection: "my-collection" });
      expect(calls[0]?.collection).toBe("my-collection");
    }).pipe(
      Effect.provide(
        Layer.mergeAll(
          MockLlmClient,
          MockEmbeddingsClient,
          TrackingGraphEmbeddings,
          MockTriplesClient,
          MockPromptClient
        )
      )
    );
  });

  it.effect("fails with GraphRagError when LLM returns no concepts", () => {
    const EmptyLlm = Layer.succeed(LlmClient)(
      LlmClient.of({
        complete: () => Effect.succeed({ response: "" }),
      })
    );

    return Effect.gen(function* () {
      const exit = yield* graphRagQuery("empty query").pipe(Effect.exit);
      expect(exit._tag).toBe("Failure");
    }).pipe(
      Effect.provide(
        Layer.mergeAll(EmptyLlm, MockEmbeddingsClient, MockGraphEmbeddingsClient, MockTriplesClient, MockPromptClient)
      )
    );
  });

  it.effect("limits BFS traversal depth via maxPathLength", () => {
    let queryCount = 0;

    const CountingTriples = Layer.succeed(TriplesClient)(
      TriplesClient.of({
        query: () =>
          Effect.sync(() => {
            queryCount++;
            return { triples: [...SEED_TRIPLES] };
          }),
      })
    );

    return Effect.gen(function* () {
      queryCount = 0;
      yield* graphRagQuery("depth test", { maxPathLength: 1 });

      // With maxPathLength=1, only one depth level is traversed
      // 2 seed entities → 2 queries
      expect(queryCount).toBe(2);
    }).pipe(
      Effect.provide(
        Layer.mergeAll(
          MockLlmClient,
          MockEmbeddingsClient,
          MockGraphEmbeddingsClient,
          CountingTriples,
          MockPromptClient
        )
      )
    );
  });
});
