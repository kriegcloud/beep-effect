/**
 * Service Layer Demo Test
 * Demonstrates proper Effect.Service and Layer usage
 * @since 3.0.0
 */

import { describe, it, expect } from "vitest";
import { Effect, Chunk } from "effect";
import { WinkEngine } from "../../src/NLP/Wink/WinkEngine.js";
import {
  Tokenization,
  tokenize,
  tokenizeToDocument,
} from "../../src/NLP/Core/Tokenization.js";
import { NLPAppLive } from "../../src/NLP/Layers/index.js";

describe("Service Layer Architecture", () => {
  it("should use services with proper dependency injection (Live)", async () => {
    const program = Effect.gen(function* () {
      // Access services directly from context
      const engine = yield* WinkEngine;
      const tokenizer = yield* Tokenization;

      // Use engine directly
      const tokenCount = yield* engine.getWinkTokenCount("Hello world test");

      // Use tokenizer (which depends on engine)
      const tokens = yield* tokenizer.tokenize("Hello world test");

      return {
        tokenCount,
        tokensLength: Chunk.size(tokens),
        firstToken: Chunk.head(tokens),
      };
    });

    // Provide all dependencies with the composed layer
    const result = await Effect.runPromise(
      program.pipe(Effect.provide(NLPAppLive))
    );

    expect(result.tokenCount).toBe(3);
    expect(result.tokensLength).toBe(3);
    expect(result.firstToken._tag).toBe("Some");
  });

  it("should use services with test layer", async () => {
    const program = Effect.gen(function* () {
      const tokenizer = yield* Tokenization;
      const tokens = yield* tokenizer.tokenize("test input");

      return {
        tokensLength: Chunk.size(tokens),
      };
    });

    // Use test layer for predictable behavior
    const result = await Effect.runPromise(
      program.pipe(Effect.provide(NLPAppLive))
    );

    expect(result.tokensLength).toBe(2); // "test input" splits to 2 tokens
  });

  it("should use data-first convenience functions", async () => {
    const program = Effect.gen(function* () {
      // Use convenience functions that require services
      const tokens = yield* tokenize("Hello world");
      const document = yield* tokenizeToDocument("Hello world", "test-doc");

      return {
        tokensLength: Chunk.size(tokens),
        documentId: document.id,
        documentText: document.text,
      };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(NLPAppLive))
    );

    expect(result.tokensLength).toBe(2);
    expect(result.documentId).toBe("test-doc");
    expect(result.documentText).toBe("Hello world");
  });

  it("should demonstrate layer composition and dependency resolution", async () => {
    // This shows how Effect automatically resolves dependencies:
    // - Tokenization requires WinkEngine
    // - When we provide NLPAppLive, it includes both services
    // - Effect ensures WinkEngine is available when Tokenization needs it

    const program = Effect.gen(function* () {
      // Only request the high-level service
      const tokenizer = yield* Tokenization;

      // But it can use the underlying engine transparently
      const result = yield* tokenizer.document(
        "Dependency injection works!"
      );

      return {
        hasTokens: Chunk.size(result.tokens) > 0,
        hasSentences: Chunk.size(result.sentences) > 0,
        text: result.text,
      };
    });

    const result = await Effect.runPromise(
      program.pipe(Effect.provide(NLPAppLive))
    );

    expect(result.hasTokens).toBe(true);
    expect(result.hasSentences).toBe(true);
    expect(result.text).toBe("Dependency injection works!");
  });
});
