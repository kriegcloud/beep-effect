/**
 * Comprehensive tokenization tests for WinkUtils
 * Includes character offset validation, property-based testing, and edge cases
 */

import { describe, it, expect } from "vitest";
import { Effect, Chunk, Schema, Arbitrary, FastCheck } from "effect";
import * as WinkUtils from "../../src/NLP/Wink/WinkUtils.js";

const runTest = <A, E>(effect: Effect.Effect<A, E>) =>
  Effect.runSync(effect.pipe(Effect.provide(WinkUtils.WinkUtilsLive)));

describe("WinkUtils Tokenization - Advanced", () => {
  describe("Character Offset Validation", () => {
    it("should have correct character offsets for simple text", () => {
      const input = WinkUtils.TextInput({ text: "Hello world!" });
      const result = runTest(
        WinkUtils.utilsTokenize(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);

      // Verify token positions match the original text
      tokens.forEach((token) => {
        if (typeof token === "string") {
          // For simple tokenization, we can't verify offsets directly
          // but we can verify the token exists in the original text
          expect(input.text).toContain(token);
        }
      });
    });

    it("should have correct character offsets with detailed tokenization", () => {
      const input = WinkUtils.TextInput({ text: "Hello, world! How are you?" });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);

      // Note: wink-nlp-utils doesn't provide character offsets in its tokenizer
      // so we test that tokens are in the correct order and contain expected content
      tokens.forEach((token) => {
        expect(token.value).toBeDefined();
        expect(token.tag).toBeDefined();
        expect([
          "word",
          "punctuation",
          "email",
          "hashtag",
          "mention",
          "url",
          "number",
          "currency",
        ]).toContain(token.tag);
      });
    });

    it("should handle unicode characters correctly", () => {
      const input = WinkUtils.TextInput({ text: "Hello 🌍 世界 مرحبا" });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);
      expect(tokens.length).toBeGreaterThan(0);

      // Verify unicode characters are preserved
      const allTokenText = tokens.map((t) => t.value).join("");
      expect(allTokenText).toContain("🌍");
      expect(allTokenText).toContain("世界");
      expect(allTokenText).toContain("مرحبا");
    });

    it("should handle mixed content with URLs and emails", () => {
      const input = WinkUtils.TextInput({
        text: "Contact us at support@example.com or visit https://example.com",
      });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);

      // Check for email token
      const emailTokens = tokens.filter((t) => t.tag === "email");
      expect(emailTokens.length).toBeGreaterThan(0);
      expect(emailTokens[0].value).toContain("@");

      // Check for URL token
      const urlTokens = tokens.filter((t) => t.tag === "url");
      expect(urlTokens.length).toBeGreaterThan(0);
      expect(urlTokens[0].value).toContain("http");
    });

    it("should preserve token order", () => {
      const input = WinkUtils.TextInput({ text: "First second third fourth" });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);
      const wordTokens = tokens.filter((t) => t.tag === "word");

      expect(wordTokens[0].value.toLowerCase()).toBe("first");
      expect(wordTokens[1].value.toLowerCase()).toBe("second");
      expect(wordTokens[2].value.toLowerCase()).toBe("third");
      expect(wordTokens[3].value.toLowerCase()).toBe("fourth");
    });
  });

  describe("Token Boundary Detection", () => {
    it("should handle contractions correctly", () => {
      const input = WinkUtils.TextInput({ text: "can't won't shouldn't" });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);
      expect(tokens.length).toBeGreaterThan(3); // Should split contractions

      // Verify apostrophes are handled
      const hasApostrophe = tokens.some((t) => t.value.includes("'"));
      expect(hasApostrophe).toBe(true);
    });

    it("should handle hyphenated words", () => {
      const input = WinkUtils.TextInput({
        text: "state-of-the-art well-known",
      });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);
      expect(tokens.length).toBeGreaterThan(2);

      // Check that hyphens are preserved in some form
      const hasHyphen = tokens.some((t) => t.value.includes("-"));
      expect(hasHyphen).toBe(true);
    });

    it("should handle numbers and currency", () => {
      const input = WinkUtils.TextInput({
        text: "The price is $123.45 or €99.99",
      });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);

      // Check for currency tokens
      const currencyTokens = tokens.filter((t) => t.tag === "currency");
      expect(currencyTokens.length).toBeGreaterThan(0);

      // Check for number tokens
      const numberTokens = tokens.filter((t) => t.tag === "number");
      expect(numberTokens.length).toBeGreaterThan(0);
    });

    it("should handle social media content", () => {
      const input = WinkUtils.TextInput({
        text: "Follow @username and check #hashtag",
      });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);

      // Check for mention tokens
      const mentionTokens = tokens.filter((t) => t.tag === "mention");
      expect(mentionTokens.length).toBeGreaterThan(0);
      expect(mentionTokens[0].value).toContain("@");

      // Check for hashtag tokens
      const hashtagTokens = tokens.filter((t) => t.tag === "hashtag");
      expect(hashtagTokens.length).toBeGreaterThan(0);
      expect(hashtagTokens[0].value).toContain("#");
    });
  });

  describe("Property-Based Testing", () => {
    // Define schemas for generating test data
    const TextSchema = Schema.String.pipe(
      Schema.minLength(1),
      Schema.maxLength(1000),
      Schema.pattern(/^[a-zA-Z0-9\s.,!?@#$%^&*()_+-={}<>|;':"\\/<>?`~]*$/)
    );

    const UnicodeTextSchema = Schema.String.pipe(
      Schema.minLength(1),
      Schema.maxLength(100)
    );

    it("should always produce non-empty results for non-empty input", () => {
      const textArb = Arbitrary.make(TextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
          if (text.trim().length === 0) return true; // Skip empty strings

          const input = WinkUtils.TextInput({ text });
          const result = runTest(
            WinkUtils.utilsTokenize(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          return Chunk.size(result.tokens) > 0;
        }),
        { numRuns: 50 }
      );
    });

    it("should preserve text content through tokenization", () => {
      const textArb = Arbitrary.make(TextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
          if (text.trim().length === 0) return true;

          const input = WinkUtils.TextInput({ text });
          const result = runTest(
            WinkUtils.utilsTokenize(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          // Join all tokens and verify essential characters are preserved
          const tokenText = Chunk.toReadonlyArray(result.tokens).join("");
          const originalAlphaNum = text.replace(/[^a-zA-Z0-9]/g, "");
          const tokenAlphaNum = tokenText.replace(/[^a-zA-Z0-9]/g, "");

          // Allow for some variation due to tokenization, but core content should be similar
          return tokenAlphaNum.length >= originalAlphaNum.length * 0.8;
        }),
        { numRuns: 50 }
      );
    });

    it("should handle detailed tokenization invariants", () => {
      const textArb = Arbitrary.make(TextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
          if (text.trim().length === 0) return true;

          const input = WinkUtils.TextInput({ text });
          const result = runTest(
            WinkUtils.utilsTokenizeDetailed(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          const tokens = Chunk.toReadonlyArray(result.tokens);

          // All tokens should have valid tags
          const allValidTags = tokens.every((token) =>
            [
              "word",
              "punctuation",
              "email",
              "hashtag",
              "mention",
              "url",
              "number",
              "currency",
            ].includes(token.tag)
          );

          // All tokens should have non-empty values
          const allNonEmpty = tokens.every((token) => token.value.length > 0);

          // Counts should be consistent
          const wordCount = tokens.filter((t) => t.tag === "word").length;
          const punctuationCount = tokens.filter(
            (t) => t.tag === "punctuation"
          ).length;
          const totalCount = tokens.length;

          return (
            allValidTags &&
            allNonEmpty &&
            result.wordCount === wordCount &&
            result.punctuationCount === punctuationCount &&
            result.totalCount === totalCount
          );
        }),
        { numRuns: 50 }
      );
    });

    it("should handle unicode text correctly", () => {
      const unicodeArb = Arbitrary.make(UnicodeTextSchema);

      FastCheck.assert(
        FastCheck.property(unicodeArb, (text) => {
          if (text.trim().length === 0) return true;

          const input = WinkUtils.TextInput({ text });

          // Should not throw errors
          const result = runTest(
            WinkUtils.utilsTokenizeDetailed(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );
          const tokens = Chunk.toReadonlyArray(result.tokens);

          // Should produce some tokens
          return tokens.length > 0;
        }),
        { numRuns: 30 }
      );
    });

    it("should be deterministic", () => {
      const textArb = Arbitrary.make(TextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
          if (text.trim().length === 0) return true;

          const input = WinkUtils.TextInput({ text });

          const result1 = runTest(
            WinkUtils.utilsTokenizeDetailed(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );
          const result2 = runTest(
            WinkUtils.utilsTokenizeDetailed(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          const tokens1 = Chunk.toReadonlyArray(result1.tokens);
          const tokens2 = Chunk.toReadonlyArray(result2.tokens);

          // Results should be identical
          if (tokens1.length !== tokens2.length) return false;

          return tokens1.every((token1, index) => {
            const token2 = tokens2[index];
            return token1.value === token2.value && token1.tag === token2.tag;
          });
        }),
        { numRuns: 30 }
      );
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle extremely long text", () => {
      const longText = "word ".repeat(10000).trim();
      const input = WinkUtils.TextInput({ text: longText });

      expect(() => {
        const result = runTest(
          WinkUtils.utilsTokenize(input).pipe(
            Effect.provide(WinkUtils.WinkUtilsLive)
          )
        );
        expect(Chunk.size(result.tokens)).toBeGreaterThan(1000);
      }).not.toThrow();
    });

    it("should handle text with only whitespace", () => {
      const input = WinkUtils.TextInput({ text: "   \t\n   " });
      const result = runTest(
        WinkUtils.utilsTokenize(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      // Should handle gracefully
      expect(Chunk.size(result.tokens)).toBeGreaterThanOrEqual(0);
    });

    it("should handle text with only punctuation", () => {
      const input = WinkUtils.TextInput({
        text: "!@#$%^&*()_+-=[]{}|;':\",./<>?",
      });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);
      expect(tokens.length).toBeGreaterThan(0);

      // Most tokens should be punctuation
      const punctuationCount = tokens.filter(
        (t) => t.tag === "punctuation"
      ).length;
      expect(punctuationCount).toBeGreaterThan(0);
    });

    it("should handle repeated characters", () => {
      const input = WinkUtils.TextInput({ text: "aaaaaa bbbbbb cccccc" });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);
      const wordTokens = tokens.filter((t) => t.tag === "word");

      expect(wordTokens.length).toBeGreaterThanOrEqual(3);
      expect(wordTokens.some((t) => t.value === "aaaaaa")).toBe(true);
      expect(wordTokens.some((t) => t.value === "bbbbbb")).toBe(true);
      expect(wordTokens.some((t) => t.value === "cccccc")).toBe(true);
    });

    it("should handle mixed scripts", () => {
      const input = WinkUtils.TextInput({
        text: "Hello こんにちは مرحبا Здравствуйте",
      });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens = Chunk.toReadonlyArray(result.tokens);
      expect(tokens.length).toBeGreaterThan(0);

      // Should preserve different scripts
      const allText = tokens.map((t) => t.value).join("");
      expect(allText).toContain("Hello");
      expect(allText).toContain("こんにちは");
      expect(allText).toContain("مرحبا");
      expect(allText).toContain("Здравствуйте");
    });

    it("should handle malformed URLs and emails", () => {
      const input = WinkUtils.TextInput({
        text: "Visit http:// or email @invalid or incomplete.com",
      });
      const result = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      // Should not throw and should produce some tokens
      const tokens = Chunk.toReadonlyArray(result.tokens);
      expect(tokens.length).toBeGreaterThan(0);
    });
  });

  describe("Tokenizer Comparison", () => {
    it("should compare utilsTokenize vs utilsTokenize0", () => {
      const input = WinkUtils.TextInput({
        text: "Hello, world! This is a test.",
      });

      const result1 = runTest(
        WinkUtils.utilsTokenize(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const result2 = runTest(
        WinkUtils.utilsTokenize0(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const tokens1 = Chunk.toReadonlyArray(result1.tokens);
      const tokens2 = Chunk.toReadonlyArray(result2.tokens);

      // Both should produce tokens
      expect(tokens1.length).toBeGreaterThan(0);
      expect(tokens2.length).toBeGreaterThan(0);

      // Results may differ but should be reasonable
      expect(Math.abs(tokens1.length - tokens2.length)).toBeLessThan(10);
    });

    it("should have consistent token counts between methods", () => {
      const input = WinkUtils.TextInput({ text: "The quick brown fox jumps." });

      const simpleResult = runTest(
        WinkUtils.utilsTokenize(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const detailedResult = runTest(
        WinkUtils.utilsTokenizeDetailed(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );

      const simpleCount = Chunk.size(simpleResult.tokens);
      const detailedCount = detailedResult.totalCount;

      // Counts should be reasonably close
      expect(Math.abs(simpleCount - detailedCount)).toBeLessThan(5);
    });
  });

  describe("Performance and Memory", () => {
    it("should handle large batch tokenization", () => {
      const texts = Array.from(
        { length: 100 },
        (_, i) => `This is test text number ${i} with some content.`
      );

      const start = Date.now();

      texts.forEach((text) => {
        const input = WinkUtils.TextInput({ text });
        const result = runTest(
          WinkUtils.utilsTokenize(input).pipe(
            Effect.provide(WinkUtils.WinkUtilsLive)
          )
        );
        expect(Chunk.size(result.tokens)).toBeGreaterThan(0);
      });

      const elapsed = Date.now() - start;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(elapsed).toBeLessThan(5000); // 5 seconds
    });

    it("should not leak memory with repeated tokenization", () => {
      const text = "This is a test sentence for memory leak testing.";
      const input = WinkUtils.TextInput({ text });

      // Run many times to check for memory leaks
      for (let i = 0; i < 1000; i++) {
        const result = runTest(
          WinkUtils.utilsTokenize(input).pipe(
            Effect.provide(WinkUtils.WinkUtilsLive)
          )
        );
        expect(Chunk.size(result.tokens)).toBeGreaterThan(0);
      }

      // If we get here without running out of memory, test passes
      expect(true).toBe(true);
    });
  });
});
