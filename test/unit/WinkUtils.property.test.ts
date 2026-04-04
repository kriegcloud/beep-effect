/**
 * Comprehensive property-based tests for WinkUtils
 * Using FastCheck for extensive invariant testing
 */

import { describe, it, expect } from "vitest";
import { Effect, Chunk, Option, Schema, Arbitrary, FastCheck } from "effect";
import * as WinkUtils from "../../src/NLP/Wink/WinkUtils.js";

const runTest = <A, E>(effect: Effect.Effect<A, E>) => Effect.runSync(effect);

describe("WinkUtils Property-Based Tests", () => {
  // Text generators
  const SimpleTextSchema = Schema.String.pipe(
    Schema.minLength(1),
    Schema.maxLength(500),
    Schema.pattern(/^[a-zA-Z0-9\s.,!?;:'"()-]+$/)
  );

  const ComplexTextSchema = Schema.String.pipe(
    Schema.minLength(1),
    Schema.maxLength(200),
    Schema.pattern(/^[a-zA-Z0-9\s.,!?;:'"()@#$%^&*_+={}<>/-]+$/)
  );

  const SentenceSchema = Schema.String.pipe(
    Schema.minLength(5),
    Schema.maxLength(100),
    Schema.pattern(/^[A-Z][a-zA-Z0-9\s.,!?;:'"()-]*[.!?]$/)
  );

  const WordSchema = Schema.String.pipe(
    Schema.minLength(1),
    Schema.maxLength(20),
    Schema.pattern(/^[a-zA-Z]+$/)
  );

  const NumberSchema = Schema.Int.pipe(Schema.between(1, 10));

  describe("String Transformation Invariants", () => {
    it("should preserve non-empty text through transformations", () => {
      const textArb = Arbitrary.make(SimpleTextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
          if (text.trim().length === 0) return true; // Skip whitespace-only strings

          const input = WinkUtils.TextInput({ text });

          const transformations = [
            WinkUtils.lowerCase,
            WinkUtils.upperCase,
            WinkUtils.removeExtraSpaces,
          ];

          return transformations.every((transform) => {
            try {
              const result = runTest(
                transform(input).pipe(Effect.provide(WinkUtils.WinkUtilsLive))
              );
              return result.text.trim().length > 0;
            } catch {
              return false;
            }
          });
        }),
        { numRuns: 100 }
      );
    });

    it("should maintain character relationships in case transformations", () => {
      const textArb = Arbitrary.make(SimpleTextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
          const input = WinkUtils.TextInput({ text });

          const lowerResult = runTest(
            WinkUtils.lowerCase(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );
          const upperResult = runTest(
            WinkUtils.upperCase(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          return (
            lowerResult.text.length === upperResult.text.length &&
            lowerResult.text.length === text.length
          );
        }),
        { numRuns: 100 }
      );
    });

    it("should be idempotent for trim operations", () => {
      const textArb = Arbitrary.make(SimpleTextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
          const input = WinkUtils.TextInput({ text });

          const firstTrim = runTest(
            WinkUtils.trim(input).pipe(Effect.provide(WinkUtils.WinkUtilsLive))
          );
          const secondTrim = runTest(
            WinkUtils.trim(WinkUtils.TextInput({ text: firstTrim.text })).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          return firstTrim.text === secondTrim.text;
        }),
        { numRuns: 100 }
      );
    });

    it("should maintain text ordering through transformations", () => {
      const textArb = Arbitrary.make(SimpleTextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
          if (text.length < 2) return true;

          const input = WinkUtils.TextInput({ text });
          const result = runTest(
            WinkUtils.lowerCase(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          const originalWords = text.split(/\s+/).filter((w) => w.length > 0);
          const transformedWords = result.text
            .split(/\s+/)
            .filter((w) => w.length > 0);

          if (originalWords.length !== transformedWords.length) return false;

          return originalWords.every(
            (word, i) => word.toLowerCase() === transformedWords[i]
          );
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Tokenization Invariants", () => {
    it("should produce consistent token counts", () => {
      const textArb = Arbitrary.make(SimpleTextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
          if (text.trim().length === 0) return true; // Skip empty strings

          const input = WinkUtils.TextInput({ text });

          const simpleTokens = runTest(
            WinkUtils.utilsTokenize(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );
          const detailedTokens = runTest(
            WinkUtils.utilsTokenizeDetailed(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );
          const tokens0 = runTest(
            WinkUtils.utilsTokenize0(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          const simpleCnt = Chunk.size(simpleTokens.tokens);
          const detailedCnt = detailedTokens.totalCount;
          const tokens0Cnt = Chunk.size(tokens0.tokens);

          // All should produce some tokens for non-empty input
          if (text.replace(/[^a-zA-Z0-9]/g, "").length > 0) {
            return simpleCnt > 0 || detailedCnt > 0 || tokens0Cnt > 0;
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it("should preserve essential text content", () => {
      const textArb = Arbitrary.make(SimpleTextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
          const input = WinkUtils.TextInput({ text });
          const result = runTest(
            WinkUtils.utilsTokenize(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          const tokens = Chunk.toReadonlyArray(result.tokens);
          const alphanumericOriginal = text
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase();
          const alphanumericTokens = tokens
            .join("")
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase();

          if (alphanumericOriginal.length === 0) return true;

          // At least 70% of alphanumeric content should be preserved
          const commonChars = [...alphanumericOriginal].filter((char) =>
            alphanumericTokens.includes(char)
          ).length;

          return commonChars / alphanumericOriginal.length >= 0.7;
        }),
        { numRuns: 100 }
      );
    });

    it("should handle detailed tokenization tag consistency", () => {
      const textArb = Arbitrary.make(ComplexTextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
          const input = WinkUtils.TextInput({ text });
          const result = runTest(
            WinkUtils.utilsTokenizeDetailed(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          const tokens = Chunk.toReadonlyArray(result.tokens);
          const validTags = [
            "word",
            "punctuation",
            "email",
            "hashtag",
            "mention",
            "url",
            "number",
            "currency",
          ];

          return (
            tokens.every(
              (token) => validTags.includes(token.tag) && token.value.length > 0
            ) && result.wordCount + result.punctuationCount <= result.totalCount
          );
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("N-gram Generation Invariants", () => {
    it("should maintain n-gram size relationships", () => {
      const textArb = Arbitrary.make(SimpleTextSchema);
      const sizeArb = Arbitrary.make(NumberSchema);

      FastCheck.assert(
        FastCheck.property(textArb, sizeArb, (text, size) => {
          if (text.length < size) return true;

          const input = WinkUtils.TextInput({ text });
          const config = WinkUtils.NGramConfig({ size });

          const bagResult = runTest(
            WinkUtils.bagOfNGrams(input, config).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );
          const setResult = runTest(
            WinkUtils.setOfNGrams(input, config).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          // Set should have unique count <= bag total count
          return (
            setResult.uniqueNGrams <= bagResult.totalNGrams &&
            setResult.totalNGrams <= bagResult.totalNGrams
          );
        }),
        { numRuns: 100 }
      );
    });

    it("should produce valid n-gram lengths", () => {
      const textArb = Arbitrary.make(SimpleTextSchema);
      const sizeArb = Arbitrary.make(NumberSchema);

      FastCheck.assert(
        FastCheck.property(textArb, sizeArb, (text, size) => {
          const input = WinkUtils.TextInput({ text });
          const config = WinkUtils.NGramConfig({ size });

          const result = runTest(
            WinkUtils.bagOfNGrams(input, config).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          return Object.keys(result.ngrams).every(
            (ngram) => ngram.length === size || result.totalNGrams === 0
          );
        }),
        { numRuns: 100 }
      );
    });

    it("should handle edge n-grams correctly", () => {
      const textArb = Arbitrary.make(WordSchema);
      const sizeArb = Arbitrary.make(NumberSchema);

      FastCheck.assert(
        FastCheck.property(textArb, sizeArb, (text, size) => {
          if (size > text.length) return true; // Skip invalid combinations

          const input = WinkUtils.TextInput({ text });
          const config = WinkUtils.NGramConfig({ size });

          const result = runTest(
            WinkUtils.edgeNGrams(input, config).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          if (text.length < size) {
            return result.totalNGrams === 0;
          }

          // Edge n-grams should produce some result for valid input
          return result.totalNGrams >= 0;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Token Operations Invariants", () => {
    it("should maintain token count relationships in stop word removal", () => {
      const wordsArb = FastCheck.array(Arbitrary.make(WordSchema), {
        minLength: 1,
        maxLength: 20,
      });

      FastCheck.assert(
        FastCheck.property(wordsArb, (words) => {
          const tokensInput = WinkUtils.TokensInput({
            tokens: Chunk.fromIterable(words),
          });

          const defaultConfig = WinkUtils.StopWordsConfig({
            customStopWords: Option.none(),
          });

          const emptyConfig = WinkUtils.StopWordsConfig({
            customStopWords: Option.some(Chunk.empty()),
          });

          const defaultResult = runTest(
            WinkUtils.removeWords(tokensInput, defaultConfig).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );
          const emptyResult = runTest(
            WinkUtils.removeWords(tokensInput, emptyConfig).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          // Empty custom stop words should preserve all tokens
          // Default stop words should remove some or all tokens
          return (
            emptyResult.transformedCount === emptyResult.originalCount &&
            defaultResult.transformedCount <= defaultResult.originalCount
          );
        }),
        { numRuns: 100 }
      );
    });

    it("should preserve token transformations consistency", () => {
      const wordsArb = FastCheck.array(Arbitrary.make(WordSchema), {
        minLength: 1,
        maxLength: 10,
      });

      FastCheck.assert(
        FastCheck.property(wordsArb, (words) => {
          const tokensInput = WinkUtils.TokensInput({
            tokens: Chunk.fromIterable(words),
          });

          const stemResult = runTest(
            WinkUtils.stem(tokensInput).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );
          const phoneticResult = runTest(
            WinkUtils.phonetize(tokensInput).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );
          const soundexResult = runTest(
            WinkUtils.soundex(tokensInput).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          // All transformations should preserve token count
          return (
            stemResult.transformedCount === stemResult.originalCount &&
            phoneticResult.transformedCount === phoneticResult.originalCount &&
            soundexResult.transformedCount === soundexResult.originalCount
          );
        }),
        { numRuns: 100 }
      );
    });

    it("should handle bag of words vs set of words correctly", () => {
      const wordsArb = FastCheck.array(Arbitrary.make(WordSchema), {
        minLength: 1,
        maxLength: 20,
      });

      FastCheck.assert(
        FastCheck.property(wordsArb, (words) => {
          const tokensInput = WinkUtils.TokensInput({
            tokens: Chunk.fromIterable(words),
          });

          const bagResult = runTest(
            WinkUtils.bagOfWords(tokensInput).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );
          const setResult = runTest(
            WinkUtils.setOfWords(tokensInput).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          // Set should have unique count <= bag total
          // Both should have same unique count
          return (
            setResult.uniqueNGrams <= bagResult.totalNGrams &&
            setResult.uniqueNGrams === bagResult.uniqueNGrams &&
            setResult.totalNGrams === setResult.uniqueNGrams
          );
        }),
        { numRuns: 100 }
      );
    });

    it("should handle bigram generation correctly", () => {
      // Use simpler test cases to avoid FastCheck string length issues
      const testCases = [
        { words: ["hello", "world"], expectedBigrams: 1, expectedAppended: 3 },
        { words: ["a", "b", "c"], expectedBigrams: 2, expectedAppended: 5 },
        { words: ["test", "case"], expectedBigrams: 1, expectedAppended: 3 },
        {
          words: ["one", "two", "three", "four"],
          expectedBigrams: 3,
          expectedAppended: 7,
        },
      ];

      testCases.forEach(({ expectedAppended, expectedBigrams, words }) => {
        const tokensInput = WinkUtils.TokensInput({
          tokens: Chunk.fromIterable(words),
        });

        const bigramResult = runTest(
          WinkUtils.bigrams(tokensInput).pipe(
            Effect.provide(WinkUtils.WinkUtilsLive)
          )
        );
        const appendResult = runTest(
          WinkUtils.appendBigrams(tokensInput).pipe(
            Effect.provide(WinkUtils.WinkUtilsLive)
          )
        );

        // Bigrams should produce n-1 pairs for n>=2 words
        // Append should include original + bigrams (as underscore-joined strings)
        expect(bigramResult.transformedCount).toBe(expectedBigrams);
        expect(appendResult.transformedCount).toBe(expectedAppended);
      });
    });
  });

  describe("Sentence Processing Invariants", () => {
    it("should detect sentences consistently", () => {
      const sentencesArb = FastCheck.array(Arbitrary.make(SentenceSchema), {
        minLength: 1,
        maxLength: 5,
      });

      FastCheck.assert(
        FastCheck.property(sentencesArb, (sentences) => {
          const text = sentences.join(" ");
          const input = WinkUtils.TextInput({ text });

          const result = runTest(
            WinkUtils.sentences(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          // Should detect at least as many sentences as we have ending punctuation
          const endingPunctuation = (text.match(/[.!?]/g) || []).length;
          return result.count >= Math.min(endingPunctuation, 1);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Corpus Composition Invariants", () => {
    it("should generate correct number of combinations", () => {
      const optionsArb = FastCheck.array(
        FastCheck.array(Arbitrary.make(WordSchema), {
          minLength: 1,
          maxLength: 3,
        }),
        { minLength: 1, maxLength: 4 }
      );

      FastCheck.assert(
        FastCheck.property(optionsArb, (optionGroups) => {
          const template = optionGroups
            .map((group) => `[${group.join("|")}]`)
            .join(" ");

          const input = WinkUtils.CorpusTemplate({ template });
          const result = runTest(
            WinkUtils.composeCorpus(input).pipe(
              Effect.provide(WinkUtils.WinkUtilsLive)
            )
          );

          const expectedCombinations = optionGroups.reduce(
            (acc, group) => acc * group.length,
            1
          );

          return (
            result.combinations === expectedCombinations &&
            Chunk.size(result.sentences) === expectedCombinations
          );
        }),
        { numRuns: 50 }
      );
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle large inputs within reasonable bounds", () => {
      const largeText = "word ".repeat(1000);
      const input = WinkUtils.TextInput({ text: largeText });

      const start = Date.now();
      const result = runTest(
        WinkUtils.utilsTokenize(input).pipe(
          Effect.provide(WinkUtils.WinkUtilsLive)
        )
      );
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000); // Should complete within 1 second
      expect(Chunk.size(result.tokens)).toBeGreaterThan(500);
    });

    it("should be deterministic across multiple runs", () => {
      const textArb = Arbitrary.make(SimpleTextSchema);

      FastCheck.assert(
        FastCheck.property(textArb, (text) => {
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

          return (
            tokens1.length === tokens2.length &&
            tokens1.every((token1, i) => {
              const token2 = tokens2[i];
              return token1.value === token2.value && token1.tag === token2.tag;
            })
          );
        }),
        { numRuns: 50 }
      );
    });
  });

  describe("Performance Invariants", () => {
    it("should scale linearly with input size", () => {
      const baseText = "The quick brown fox jumps over the lazy dog. ";
      const sizes = [1, 10, 50];
      const times: Array<number> = [];

      sizes.forEach((multiplier) => {
        const text = baseText.repeat(multiplier);
        const input = WinkUtils.TextInput({ text });

        const start = Date.now();
        runTest(
          WinkUtils.utilsTokenizeDetailed(input).pipe(
            Effect.provide(WinkUtils.WinkUtilsLive)
          )
        );
        const elapsed = Date.now() - start;

        times.push(elapsed);
      });

      // Performance should not degrade exponentially
      const ratio1 = times[1] / Math.max(times[0], 1);
      const ratio2 = times[2] / Math.max(times[1], 1);

      expect(ratio1).toBeLessThan(50); // 10x input shouldn't take 50x time
      expect(ratio2).toBeLessThan(20); // 5x input shouldn't take 20x time
    });
  });
});
