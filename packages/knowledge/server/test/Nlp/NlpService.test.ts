/**
 * NlpService Tests
 *
 * Tests for text chunking and NLP utilities.
 *
 * @module knowledge-server/test/Nlp/NlpService.test
 * @since 0.1.0
 */

import { NlpService } from "@beep/knowledge-server/Nlp/NlpService";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";

describe("NlpService", () => {
  effect("chunks short text into single chunk", () =>
    Effect.gen(function* () {
      const nlp = yield* NlpService;
      const text = "This is a short sentence.";

      const chunks = yield* nlp.chunkTextAll(text);

      strictEqual(chunks.length, 1);
      strictEqual(chunks[0]?.text, text);
      strictEqual(chunks[0]?.startOffset, 0);
      strictEqual(chunks[0]?.endOffset, text.length);
    }).pipe(Effect.provide(NlpService.Default))
  );

  effect("chunks long text into multiple chunks", () =>
    Effect.gen(function* () {
      const nlp = yield* NlpService;
      const sentences = Array(50).fill("This is a test sentence that will be repeated.").join(" ");

      const chunks = yield* nlp.chunkTextAll(sentences, {
        maxChunkSize: 200,
        preserveSentences: true,
        overlapSentences: 0,
      });

      assertTrue(chunks.length > 1);
      // Verify offsets are continuous
      for (let i = 0; i < chunks.length - 1; i++) {
        const current = chunks[i];
        const next = chunks[i + 1];
        if (current && next) {
          strictEqual(current.endOffset, next.startOffset);
        }
      }
    }).pipe(Effect.provide(NlpService.Default))
  );

  effect("preserves sentence boundaries", () =>
    Effect.gen(function* () {
      const nlp = yield* NlpService;
      const text = "First sentence. Second sentence. Third sentence.";

      const chunks = yield* nlp.chunkTextAll(text, {
        maxChunkSize: 30,
        preserveSentences: true,
        overlapSentences: 0,
      });

      // Each chunk should contain complete sentences
      for (const chunk of chunks) {
        // Should not end mid-word (rough check)
        const trimmed = Str.trim(chunk.text);
        const lastChar = Str.takeRight(1)(trimmed);
        assertTrue(lastChar === "." || lastChar === "!" || lastChar === "?" || Str.isEmpty(trimmed));
      }
    }).pipe(Effect.provide(NlpService.Default))
  );

  effect("handles empty input", () =>
    Effect.gen(function* () {
      const nlp = yield* NlpService;

      const chunks = yield* nlp.chunkTextAll("");

      strictEqual(chunks.length, 0);
    }).pipe(Effect.provide(NlpService.Default))
  );

  effect("returns stream of chunks", () =>
    Effect.gen(function* () {
      const nlp = yield* NlpService;
      const text = "Sentence one. Sentence two. Sentence three.";

      const stream = nlp.chunkText(text, { maxChunkSize: 1000, preserveSentences: true, overlapSentences: 0 });
      const collected = yield* Stream.runCollect(stream);

      strictEqual(collected.length, 1);
    }).pipe(Effect.provide(NlpService.Default))
  );

  effect("splits sentences correctly", () =>
    Effect.gen(function* () {
      const nlp = yield* NlpService;
      const text = "First. Second? Third!";

      const sentences = yield* nlp.splitSentences(text);

      assertTrue(sentences.length >= 1);
    }).pipe(Effect.provide(NlpService.Default))
  );

  effect("estimates tokens", () =>
    Effect.gen(function* () {
      const nlp = yield* NlpService;
      const text = "This is a test."; // 16 chars

      const tokens = yield* nlp.estimateTokens(text);

      // Rough estimate: ~4 chars per token
      strictEqual(tokens, 4);
    }).pipe(Effect.provide(NlpService.Default))
  );

  effect("maintains chunk indices", () =>
    Effect.gen(function* () {
      const nlp = yield* NlpService;
      const sentences = Array(10).fill("This is sentence number X.").join(" ");

      const chunks = yield* nlp.chunkTextAll(sentences, {
        maxChunkSize: 50,
        preserveSentences: true,
        overlapSentences: 0,
      });

      for (let i = 0; i < chunks.length; i++) {
        strictEqual(chunks[i]?.index, i);
      }
    }).pipe(Effect.provide(NlpService.Default))
  );
});
