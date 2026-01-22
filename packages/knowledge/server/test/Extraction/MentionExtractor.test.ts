/**
 * MentionExtractor Tests
 *
 * Tests for entity mention detection service.
 *
 * @module knowledge-server/test/Extraction/MentionExtractor.test
 * @since 0.1.0
 */
import { describe } from "bun:test";
import { assertTrue, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { MentionExtractor } from "../../src/Extraction/MentionExtractor";
import { TextChunk } from "../../src/Nlp/TextChunk";
import { clearMockResponses, MockLlmLive, setMockResponse } from "../_shared/TestLayers";

// Build the test layer with mock LLM
const TestMentionExtractorLayer = Layer.provide(MentionExtractor.Default, MockLlmLive);

describe("MentionExtractor", () => {
  effect("extracts mentions from a single chunk", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("MentionOutput", {
        mentions: [
          { text: "John Smith", startChar: 0, endChar: 10, confidence: 0.95, suggestedType: "Person" },
          { text: "Acme Corp", startChar: 20, endChar: 29, confidence: 0.9, suggestedType: "Organization" },
        ],
      });

      const extractor = yield* MentionExtractor;
      const chunk = new TextChunk({
        index: 0,
        text: "John Smith works at Acme Corp as a software engineer.",
        startOffset: 0,
        endOffset: 52,
      });

      const result = yield* extractor.extractFromChunk(chunk);

      strictEqual(result.mentions.length, 2);
      strictEqual(result.mentions[0]?.text, "John Smith");
      strictEqual(result.mentions[0]?.suggestedType, "Person");
      strictEqual(result.mentions[1]?.text, "Acme Corp");
      strictEqual(result.tokensUsed, 150);
    }).pipe(Effect.provide(TestMentionExtractorLayer))
  );

  effect("filters mentions below confidence threshold", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("MentionOutput", {
        mentions: [
          { text: "John", startChar: 0, endChar: 4, confidence: 0.9 },
          { text: "maybe", startChar: 10, endChar: 15, confidence: 0.3 },
        ],
      });

      const extractor = yield* MentionExtractor;
      const chunk = new TextChunk({
        index: 0,
        text: "John said maybe he would come.",
        startOffset: 0,
        endOffset: 30,
      });

      const result = yield* extractor.extractFromChunk(chunk, { minConfidence: 0.5 });

      strictEqual(result.mentions.length, 1);
      strictEqual(result.mentions[0]?.text, "John");
    }).pipe(Effect.provide(TestMentionExtractorLayer))
  );

  effect("adjusts character offsets to document level", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("MentionOutput", {
        mentions: [{ text: "Alice", startChar: 0, endChar: 5, confidence: 0.95 }],
      });

      const extractor = yield* MentionExtractor;
      const chunk = new TextChunk({
        index: 2,
        text: "Alice is here.",
        startOffset: 100,
        endOffset: 114,
      });

      const result = yield* extractor.extractFromChunk(chunk);

      strictEqual(result.mentions.length, 1);
      strictEqual(result.mentions[0]?.startChar, 100);
      strictEqual(result.mentions[0]?.endChar, 105);
    }).pipe(Effect.provide(TestMentionExtractorLayer))
  );

  effect("extracts from multiple chunks", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("MentionOutput", {
        mentions: [{ text: "Entity", startChar: 0, endChar: 6, confidence: 0.9 }],
      });

      const extractor = yield* MentionExtractor;
      const chunks = [
        new TextChunk({ index: 0, text: "Entity one.", startOffset: 0, endOffset: 11 }),
        new TextChunk({ index: 1, text: "Entity two.", startOffset: 11, endOffset: 22 }),
      ];

      const results = yield* extractor.extractFromChunks(chunks);

      strictEqual(results.length, 2);
      strictEqual(results[0]?.mentions.length, 1);
      strictEqual(results[1]?.mentions.length, 1);
    }).pipe(Effect.provide(TestMentionExtractorLayer))
  );

  effect("merges overlapping mentions keeping higher confidence", () =>
    Effect.gen(function* () {
      const extractor = yield* MentionExtractor;

      const results = [
        {
          chunk: new TextChunk({ index: 0, text: "Test", startOffset: 0, endOffset: 10 }),
          mentions: [
            { text: "John", startChar: 0, endChar: 4, confidence: 0.95, suggestedType: undefined, context: undefined },
            {
              text: "John Smith",
              startChar: 0,
              endChar: 10,
              confidence: 0.8,
              suggestedType: undefined,
              context: undefined,
            },
          ],
          tokensUsed: 100,
        },
      ] as const;

      const merged = yield* extractor.mergeMentions(results);

      strictEqual(merged.length, 1);
      strictEqual(merged[0]?.text, "John");
      strictEqual(merged[0]?.confidence, 0.95);
    }).pipe(Effect.provide(TestMentionExtractorLayer))
  );

  effect("handles empty input", () =>
    Effect.gen(function* () {
      clearMockResponses();
      setMockResponse("MentionOutput", { mentions: [] });

      const extractor = yield* MentionExtractor;
      const chunk = new TextChunk({
        index: 0,
        text: "",
        startOffset: 0,
        endOffset: 0,
      });

      const result = yield* extractor.extractFromChunk(chunk);

      strictEqual(result.mentions.length, 0);
      assertTrue(result.tokensUsed >= 0);
    }).pipe(Effect.provide(TestMentionExtractorLayer))
  );
});
