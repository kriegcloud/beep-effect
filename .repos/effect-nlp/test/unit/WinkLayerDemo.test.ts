/**
 * Wink Layer Demo Test
 * Demonstrates usage of the comprehensive Wink layer
 * @since 3.0.0
 */

import { describe, it, expect } from "vitest";
import { Effect, Chunk } from "effect";
import {
  WinkLayerLive,
  WinkTokenizationLive,
  WinkNLPLive,
  WinkEngine,
  WinkVectorizer,
} from "../../src/NLP/Wink/Layer.js";
import { Tokenization } from "../../src/NLP/Core/Tokenization.js";

describe("Wink Layer Architecture", () => {
  it("should provide all services with WinkLayerLive", async () => {
    const program = Effect.gen(function* () {
      // Access all services from the comprehensive layer
      const engine = yield* WinkEngine;
      const tokenizer = yield* Tokenization;
      const vectorizer = yield* WinkVectorizer;

      // Test basic functionality
      const tokenCount = yield* engine.getWinkTokenCount("Hello world test");
      const tokens = yield* tokenizer.tokenize("Hello world test");

      return {
        tokenCount,
        tokensLength: Chunk.size(tokens),
        servicesAvailable: {
          engine: !!engine,
          tokenizer: !!tokenizer,
          vectorizer: !!vectorizer,
        },
      };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(WinkLayerLive))
    );

    expect(result.tokenCount).toBe(3);
    expect(result.tokensLength).toBe(3);
    expect(result.servicesAvailable.engine).toBe(true);
    expect(result.servicesAvailable.tokenizer).toBe(true);
    expect(result.servicesAvailable.vectorizer).toBe(true);
  });

  it("should work with specialized layers", async () => {
    // Test tokenization-only layer
    const tokenizationProgram = Effect.gen(function* () {
      const tokenizer = yield* Tokenization;
      const tokens = yield* tokenizer.tokenize("Hello tokenization");
      return Chunk.size(tokens);
    });

    const tokenizationResult = await Effect.runPromise(
      tokenizationProgram.pipe(Effect.provide(WinkTokenizationLive))
    );

    expect(tokenizationResult).toBe(2);

    // Test full NLP layer
    const nlpProgram = Effect.gen(function* () {
      const tokenizer = yield* Tokenization;
      const vectorizer = yield* WinkVectorizer;

      const document = yield* tokenizer.document("Hello NLP world");
      yield* vectorizer.learnDocument(document);

      const stats = yield* vectorizer.getCorpusStats();

      return {
        documentId: document.id,
        totalDocuments: stats.totalDocuments,
        hasTerms: Chunk.size(stats.uniqueTerms) > 0,
      };
    });

    const nlpResult = await Effect.runPromise(
      nlpProgram.pipe(Effect.provide(WinkNLPLive))
    );

    expect(nlpResult.totalDocuments).toBe(1);
    expect(nlpResult.hasTerms).toBe(true);
  });

  it("should demonstrate layer composition benefits", async () => {
    // This shows how the layer automatically provides all dependencies
    const program = Effect.gen(function* () {
      // We only request high-level services, but the layer provides everything needed
      const tokenizer = yield* Tokenization;
      const vectorizer = yield* WinkVectorizer;

      // Complex workflow using multiple services
      const document = yield* tokenizer.document(
        "Machine learning is fascinating"
      );
      yield* vectorizer.learnDocument(document);

      // Use utils for text processing
      const corpusStats = yield* vectorizer.getCorpusStats();

      return {
        originalDocument: document.text,
        learnedDocuments: corpusStats.totalDocuments,
        vocabularySize: Chunk.size(corpusStats.uniqueTerms),
      };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(WinkLayerLive))
    );

    expect(result.originalDocument).toBe("Machine learning is fascinating");
    expect(result.learnedDocuments).toBe(1);
    expect(result.vocabularySize).toBeGreaterThan(0);
  });
});
