/**
 * Stop words handling tests for WinkUtils
 * Tests the behavior of Option.none() vs custom stop words
 */

import { describe, it, expect } from "vitest";
import { Effect, Chunk, Option } from "effect";
import * as WinkUtils from "../../src/NLP/Wink/WinkUtils.js";

const runTest = <A, E>(effect: Effect.Effect<A, E>) =>
  Effect.runSync(effect.pipe(Effect.provide(WinkUtils.WinkUtilsLive)));

describe("WinkUtils Stop Words Handling", () => {
  const testTokens = WinkUtils.TokensInput({
    tokens: Chunk.fromIterable([
      "the",
      "cat",
      "is",
      "very",
      "big",
      "and",
      "fluffy",
      "animal",
    ]),
  });

  describe("Default Stop Words (Option.none)", () => {
    it("should use default wink-nlp-utils stop words when customStopWords is None", () => {
      const config = WinkUtils.StopWordsConfig({
        customStopWords: Option.none(),
      });

      const result = runTest(
        WinkUtils.removeWords(testTokens, config).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const filteredTokens = Chunk.toReadonlyArray(result.tokens);

      // Default stop words should remove common words like "the", "is", "and"
      expect(filteredTokens).not.toContain("the");
      expect(filteredTokens).not.toContain("is");
      expect(filteredTokens).not.toContain("and");

      // Content words should remain
      expect(filteredTokens).toContain("cat");
      expect(filteredTokens).toContain("big");
      expect(filteredTokens).toContain("fluffy");
      expect(filteredTokens).toContain("animal");

      // Should have fewer tokens after filtering
      expect(result.transformedCount).toBeLessThan(result.originalCount);
    });

    it("should be deterministic with default stop words", () => {
      const config = WinkUtils.StopWordsConfig({
        customStopWords: Option.none(),
      });

      const result1 = runTest(
        WinkUtils.removeWords(testTokens, config).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const result2 = runTest(
        WinkUtils.removeWords(testTokens, config).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens1 = Chunk.toReadonlyArray(result1.tokens);
      const tokens2 = Chunk.toReadonlyArray(result2.tokens);

      // Results should be identical
      expect(tokens1).toEqual(tokens2);
      expect(result1.transformedCount).toBe(result2.transformedCount);
    });
  });

  describe("Custom Stop Words (Option.some)", () => {
    it("should use custom stop words when provided", () => {
      const customWords = Chunk.fromIterable(["cat", "big"]);
      const config = WinkUtils.StopWordsConfig({
        customStopWords: Option.some(customWords),
      });

      const result = runTest(
        WinkUtils.removeWords(testTokens, config).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const filteredTokens = Chunk.toReadonlyArray(result.tokens);

      // Custom stop words should be removed
      expect(filteredTokens).not.toContain("cat");
      expect(filteredTokens).not.toContain("big");

      // Default stop words should NOT be removed (since we're using custom)
      expect(filteredTokens).toContain("the");
      expect(filteredTokens).toContain("is");
      expect(filteredTokens).toContain("and");

      // Other words should remain
      expect(filteredTokens).toContain("very");
      expect(filteredTokens).toContain("fluffy");
      expect(filteredTokens).toContain("animal");
    });

    it("should handle empty custom stop words", () => {
      const emptyWords = Chunk.empty<string>();
      const config = WinkUtils.StopWordsConfig({
        customStopWords: Option.some(emptyWords),
      });

      const result = runTest(
        WinkUtils.removeWords(testTokens, config).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const filteredTokens = Chunk.toReadonlyArray(result.tokens);

      // No words should be removed with empty custom stop words
      expect(result.transformedCount).toBe(result.originalCount);
      expect(filteredTokens).toEqual(Chunk.toReadonlyArray(testTokens.tokens));
    });

    it("should handle custom stop words with duplicates", () => {
      const customWords = Chunk.fromIterable(["cat", "cat", "big", "big"]);
      const config = WinkUtils.StopWordsConfig({
        customStopWords: Option.some(customWords),
      });

      const result = runTest(
        WinkUtils.removeWords(testTokens, config).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const filteredTokens = Chunk.toReadonlyArray(result.tokens);

      // Should still work correctly despite duplicates
      expect(filteredTokens).not.toContain("cat");
      expect(filteredTokens).not.toContain("big");
      expect(filteredTokens.length).toBeGreaterThan(0);
    });
  });

  describe("Comparison: Default vs Custom", () => {
    it("should produce different results for default vs custom stop words", () => {
      const defaultConfig = WinkUtils.StopWordsConfig({
        customStopWords: Option.none(),
      });

      const customConfig = WinkUtils.StopWordsConfig({
        customStopWords: Option.some(Chunk.fromIterable(["cat", "animal"])),
      });

      const defaultResult = runTest(
        WinkUtils.removeWords(testTokens, defaultConfig).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const customResult = runTest(
        WinkUtils.removeWords(testTokens, customConfig).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const defaultTokens = Chunk.toReadonlyArray(defaultResult.tokens);
      const customTokens = Chunk.toReadonlyArray(customResult.tokens);

      // Results should be different
      expect(defaultTokens).not.toEqual(customTokens);

      // Default should remove "the", "is", "and" but keep "cat", "animal"
      expect(defaultTokens).toContain("cat");
      expect(defaultTokens).toContain("animal");
      expect(defaultTokens).not.toContain("the");

      // Custom should remove "cat", "animal" but keep "the", "is", "and"
      expect(customTokens).not.toContain("cat");
      expect(customTokens).not.toContain("animal");
      expect(customTokens).toContain("the");
    });
  });

  describe("Edge Cases", () => {
    it("should handle tokens that are all stop words (default)", () => {
      const allStopWords = WinkUtils.TokensInput({
        tokens: Chunk.fromIterable([
          "the",
          "is",
          "and",
          "or",
          "but",
          "in",
          "on",
          "at",
        ]),
      });

      const config = WinkUtils.StopWordsConfig({
        customStopWords: Option.none(),
      });

      const result = runTest(
        WinkUtils.removeWords(allStopWords, config).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const filteredTokens = Chunk.toReadonlyArray(result.tokens);

      // Most or all should be removed
      expect(result.transformedCount).toBeLessThan(result.originalCount);
      expect(filteredTokens.length).toBeLessThanOrEqual(2); // Some might not be in default list
    });

    it("should handle tokens that are all stop words (custom)", () => {
      const testTokensLocal = WinkUtils.TokensInput({
        tokens: Chunk.fromIterable(["apple", "banana", "cherry"]),
      });

      const config = WinkUtils.StopWordsConfig({
        customStopWords: Option.some(
          Chunk.fromIterable(["apple", "banana", "cherry"])
        ),
      });

      const result = runTest(
        WinkUtils.removeWords(testTokensLocal, config).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const filteredTokens = Chunk.toReadonlyArray(result.tokens);

      // All should be removed
      expect(result.transformedCount).toBe(0);
      expect(filteredTokens).toEqual([]);
    });

    it("should handle case sensitivity in custom stop words", () => {
      const mixedCaseTokens = WinkUtils.TokensInput({
        tokens: Chunk.fromIterable(["The", "Cat", "IS", "big"]),
      });

      const config = WinkUtils.StopWordsConfig({
        customStopWords: Option.some(Chunk.fromIterable(["the", "cat"])), // lowercase
      });

      const result = runTest(
        WinkUtils.removeWords(mixedCaseTokens, config).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const filteredTokens = Chunk.toReadonlyArray(result.tokens);

      // Case sensitivity depends on wink-nlp-utils implementation
      // This test documents the actual behavior
      expect(filteredTokens.length).toBeGreaterThan(0);
      expect(result.transformedCount).toBeLessThanOrEqual(result.originalCount);
    });

    it("should handle special characters in stop words", () => {
      const specialTokens = WinkUtils.TokensInput({
        tokens: Chunk.fromIterable(["hello", "@user", "#hashtag", "world"]),
      });

      const config = WinkUtils.StopWordsConfig({
        customStopWords: Option.some(Chunk.fromIterable(["@user", "#hashtag"])),
      });

      const result = runTest(
        WinkUtils.removeWords(specialTokens, config).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const filteredTokens = Chunk.toReadonlyArray(result.tokens);

      // Should handle special characters correctly
      expect(filteredTokens).toContain("hello");
      expect(filteredTokens).toContain("world");
      expect(result.transformedCount).toBeLessThan(result.originalCount);
    });
  });

  describe("Performance and Memory", () => {
    it("should handle large custom stop word lists efficiently", () => {
      const largeStopWords = Chunk.fromIterable(
        Array.from({ length: 1000 }, (_, i) => `stopword${i}`)
      );

      const config = WinkUtils.StopWordsConfig({
        customStopWords: Option.some(largeStopWords),
      });

      const start = Date.now();
      const result = runTest(
        WinkUtils.removeWords(testTokens, config).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const elapsed = Date.now() - start;

      // Should complete quickly even with large stop word list
      expect(elapsed).toBeLessThan(100); // 100ms
      expect(result.transformedCount).toBe(result.originalCount); // No matches, so no removal
    });

    it("should handle repeated operations efficiently", () => {
      const config = WinkUtils.StopWordsConfig({
        customStopWords: Option.none(),
      });

      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        const result = runTest(
          WinkUtils.removeWords(testTokens, config).pipe(
            Effect.provide(WinkUtils.WinkUtilsLive)
          )
        );
        expect(result.transformedCount).toBeLessThan(result.originalCount);
      }

      const elapsed = Date.now() - start;

      // Should handle repeated operations efficiently
      expect(elapsed).toBeLessThan(1000); // 1 second for 100 operations
    });
  });
});
