/**
 * EntityRegistry Unit Tests
 *
 * Tests for the entity registry service that provides candidate search
 * and entity resolution capabilities.
 *
 * Note: Full integration tests require database and embedding services.
 * These unit tests focus on the pure normalizeText function and
 * BloomFilter integration patterns.
 *
 * @module knowledge-server/test/EntityResolution/EntityRegistry.test
 * @since 0.1.0
 */
import { normalizeText } from "@beep/knowledge-server/EntityResolution/EntityRegistry";
import { describe, effect, strictEqual, assertTrue } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";

describe("EntityRegistry", () => {
  describe("normalizeText", () => {
    effect(
      "converts text to lowercase",
      Effect.fn(function* () {
        const result = normalizeText("HELLO WORLD");
        strictEqual(result, "hello world");
      })
    );

    effect(
      "trims leading whitespace",
      Effect.fn(function* () {
        const result = normalizeText("   hello");
        strictEqual(result, "hello");
      })
    );

    effect(
      "trims trailing whitespace",
      Effect.fn(function* () {
        const result = normalizeText("hello   ");
        strictEqual(result, "hello");
      })
    );

    effect(
      "trims both leading and trailing whitespace",
      Effect.fn(function* () {
        const result = normalizeText("   hello world   ");
        strictEqual(result, "hello world");
      })
    );

    effect(
      "handles mixed case with whitespace",
      Effect.fn(function* () {
        const result = normalizeText("  Hello World  ");
        strictEqual(result, "hello world");
      })
    );

    effect(
      "preserves internal whitespace",
      Effect.fn(function* () {
        const result = normalizeText("hello   world");
        strictEqual(result, "hello   world");
      })
    );

    effect(
      "handles empty string",
      Effect.fn(function* () {
        const result = normalizeText("");
        strictEqual(result, "");
      })
    );

    effect(
      "handles whitespace-only string",
      Effect.fn(function* () {
        const result = normalizeText("   ");
        strictEqual(result, "");
      })
    );

    effect(
      "handles single character",
      Effect.fn(function* () {
        const result = normalizeText("A");
        strictEqual(result, "a");
      })
    );

    effect(
      "handles unicode characters",
      Effect.fn(function* () {
        const result = normalizeText("  Caf\u00E9  ");
        strictEqual(result, "caf\u00E9");
      })
    );

    effect(
      "handles numbers and special characters",
      Effect.fn(function* () {
        const result = normalizeText("  ABC-123 Corp.  ");
        strictEqual(result, "abc-123 corp.");
      })
    );

    effect(
      "produces consistent output for entity matching",
      Effect.fn(function* () {
        // All these variations should normalize to the same output
        const variations = [
          "Apple Inc.",
          "APPLE INC.",
          "  Apple Inc.  ",
          "apple inc.",
          "  APPLE INC.  ",
        ];

        const normalized = A.map(variations, normalizeText);
        const expected = "apple inc.";

        const allMatch = A.every(normalized, (result) => result === expected);
        assertTrue(allMatch);
      })
    );

    effect(
      "handles tab characters as whitespace",
      Effect.fn(function* () {
        const result = normalizeText("\tHello\t");
        strictEqual(result, "hello");
      })
    );

    effect(
      "handles newline characters as whitespace",
      Effect.fn(function* () {
        const result = normalizeText("\nHello\n");
        strictEqual(result, "hello");
      })
    );
  });

  describe("Normalization Consistency", () => {
    effect(
      "idempotent - normalizing twice produces same result",
      Effect.fn(function* () {
        const input = "  HELLO World  ";
        const once = normalizeText(input);
        const twice = normalizeText(once);

        strictEqual(once, twice);
      })
    );

    effect(
      "deterministic - same input always produces same output",
      Effect.fn(function* () {
        const input = "  Test Entity Name  ";

        const result1 = normalizeText(input);
        const result2 = normalizeText(input);
        const result3 = normalizeText(input);

        strictEqual(result1, result2);
        strictEqual(result2, result3);
      })
    );
  });

  describe("Entity Name Patterns", () => {
    effect(
      "normalizes company names correctly",
      Effect.fn(function* () {
        strictEqual(normalizeText("Microsoft Corporation"), "microsoft corporation");
        strictEqual(normalizeText("GOOGLE LLC"), "google llc");
        strictEqual(normalizeText("  Apple Inc  "), "apple inc");
      })
    );

    effect(
      "normalizes person names correctly",
      Effect.fn(function* () {
        strictEqual(normalizeText("John DOE"), "john doe");
        strictEqual(normalizeText("  JANE SMITH  "), "jane smith");
      })
    );

    effect(
      "normalizes location names correctly",
      Effect.fn(function* () {
        strictEqual(normalizeText("New York City"), "new york city");
        strictEqual(normalizeText("  LOS ANGELES  "), "los angeles");
      })
    );

    effect(
      "handles entity names with punctuation",
      Effect.fn(function* () {
        strictEqual(normalizeText("AT&T Inc."), "at&t inc.");
        strictEqual(normalizeText("Johnson & Johnson"), "johnson & johnson");
        strictEqual(normalizeText("3M Company"), "3m company");
      })
    );

    effect(
      "handles entity names with numbers",
      Effect.fn(function* () {
        strictEqual(normalizeText("7-Eleven"), "7-eleven");
        strictEqual(normalizeText("20th Century Fox"), "20th century fox");
      })
    );
  });
});
