import { DocEmbeddingsClient, EmbeddingsClient, LlmClient, PromptClient } from "@beep/beepgraph-pipeline/Clients";
import { documentRagQuery } from "@beep/beepgraph-pipeline/DocumentRag";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const SAMPLE_CHUNKS = [
  { chunkId: "chunk-1", score: 0.95, content: "RLHF stands for Reinforcement Learning from Human Feedback." },
  { chunkId: "chunk-2", score: 0.87, content: "Constitutional AI uses a set of principles to guide model behavior." },
  { chunkId: "chunk-3", score: 0.72, content: "Transformers use self-attention mechanisms for sequence modeling." },
];

// ---------------------------------------------------------------------------
// Mock layers
// ---------------------------------------------------------------------------

const MockLlmClient = Layer.succeed(LlmClient)(
  LlmClient.of({
    complete: (req) =>
      Effect.succeed({
        response: `Based on the provided context: RLHF is a training technique. Constitutional AI guides model behavior. Query was: ${req.prompt.slice(0, 30)}`,
      }),
  })
);

const MockEmbeddingsClient = Layer.succeed(EmbeddingsClient)(
  EmbeddingsClient.of({
    embed: (req) =>
      Effect.succeed({
        vectors: req.text.map(() => [0.1, 0.2, 0.3]),
      }),
  })
);

const MockDocEmbeddingsClient = Layer.succeed(DocEmbeddingsClient)(
  DocEmbeddingsClient.of({
    find: () => Effect.succeed({ chunks: [...SAMPLE_CHUNKS] }),
  })
);

const MockPromptClient = Layer.succeed(PromptClient)(
  PromptClient.of({
    render: (req) =>
      Effect.succeed({
        system: "You are an AI assistant. Synthesize an answer from the context.",
        prompt: `Context: ${req.variables?.context?.slice(0, 100) ?? ""}\n\nQuery: ${req.variables?.query ?? ""}`,
      }),
  })
);

const TestLayer = Layer.mergeAll(MockLlmClient, MockEmbeddingsClient, MockDocEmbeddingsClient, MockPromptClient);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DocumentRag pipeline", () => {
  it.effect("executes the full 4-step pipeline and returns a synthesized answer", () =>
    Effect.gen(function* () {
      const answer = yield* documentRagQuery("What is RLHF?");

      expect(answer).toBeTruthy();
      expect(answer).toContain("RLHF");
    }).pipe(Effect.provide(TestLayer))
  );

  it.effect("passes collection option through to document embeddings", () => {
    const calls: Array<{ collection?: string }> = [];

    const TrackingDocEmbeddings = Layer.succeed(DocEmbeddingsClient)(
      DocEmbeddingsClient.of({
        find: (req) =>
          Effect.sync(() => {
            calls.push({ collection: req.collection });
            return { chunks: [...SAMPLE_CHUNKS] };
          }),
      })
    );

    return Effect.gen(function* () {
      yield* documentRagQuery("test", { collection: "ai-papers" });
      expect(calls[0]?.collection).toBe("ai-papers");
    }).pipe(
      Effect.provide(Layer.mergeAll(MockLlmClient, MockEmbeddingsClient, TrackingDocEmbeddings, MockPromptClient))
    );
  });

  it.effect("respects chunkLimit option", () => {
    const receivedLimits: number[] = [];

    const TrackingDocEmbeddings = Layer.succeed(DocEmbeddingsClient)(
      DocEmbeddingsClient.of({
        find: (req) =>
          Effect.sync(() => {
            if (req.limit !== undefined) receivedLimits.push(req.limit);
            return { chunks: [...SAMPLE_CHUNKS] };
          }),
      })
    );

    return Effect.gen(function* () {
      yield* documentRagQuery("test", { chunkLimit: 5 });
      expect(receivedLimits[0]).toBe(5);
    }).pipe(
      Effect.provide(Layer.mergeAll(MockLlmClient, MockEmbeddingsClient, TrackingDocEmbeddings, MockPromptClient))
    );
  });

  it.effect("fails with DocumentRagError when no chunks have content", () => {
    const EmptyDocEmbeddings = Layer.succeed(DocEmbeddingsClient)(
      DocEmbeddingsClient.of({
        find: () =>
          Effect.succeed({
            chunks: [{ chunkId: "empty-1", score: 0.5 }],
          }),
      })
    );

    return Effect.gen(function* () {
      const exit = yield* documentRagQuery("empty query").pipe(Effect.exit);
      expect(exit._tag).toBe("Failure");
    }).pipe(Effect.provide(Layer.mergeAll(MockLlmClient, MockEmbeddingsClient, EmptyDocEmbeddings, MockPromptClient)));
  });

  it.effect("joins multiple chunk contents with separator in context", () => {
    let capturedPrompt = "";

    const CapturingPrompt = Layer.succeed(PromptClient)(
      PromptClient.of({
        render: (req) =>
          Effect.sync(() => {
            capturedPrompt = req.variables?.context ?? "";
            return {
              system: "Synthesize.",
              prompt: `Query: ${req.variables?.query ?? ""}`,
            };
          }),
      })
    );

    return Effect.gen(function* () {
      yield* documentRagQuery("multi chunk test");

      // Context should contain all 3 chunks joined with separator
      expect(capturedPrompt).toContain("RLHF stands for");
      expect(capturedPrompt).toContain("Constitutional AI uses");
      expect(capturedPrompt).toContain("Transformers use");
      expect(capturedPrompt).toContain("---");
    }).pipe(
      Effect.provide(Layer.mergeAll(MockLlmClient, MockEmbeddingsClient, MockDocEmbeddingsClient, CapturingPrompt))
    );
  });
});
