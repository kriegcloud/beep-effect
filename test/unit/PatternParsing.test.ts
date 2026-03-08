/**
 * Unit tests for Pattern Parsing - Transform Schema
 * Tests POSPatternOptionFromString transform schema
 */

import { describe, it, expect } from "vitest";
import { Effect, Schema, Data } from "effect";
import * as Pattern from "../../src/NLP/Core/Pattern.js";

describe("Pattern Parsing - Transform Schema", () => {
  describe("POSPatternOptionFromString", () => {
    it("should decode array of POS tags to bracket string", () => {
      const input = Data.array(["NOUN", "VERB", "ADJ"] as const);
      const result = Schema.decodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(input);

      expect(Effect.runSync(result)).toBe("[NOUN|VERB|ADJ]");
    });

    it("should decode array with empty string for optional", () => {
      const input = Data.array(["", "DET"] as const);
      const result = Schema.decodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(input);

      expect(Effect.runSync(result)).toBe("[|DET]");
    });

    it("should decode single POS tag", () => {
      const input = Data.array(["NOUN"] as const);
      const result = Schema.decodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(input);

      expect(Effect.runSync(result)).toBe("[NOUN]");
    });

    it("should error on empty string only", () => {
      const input = Data.array([""] as const);
      const result = Schema.decodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(input);

      expect(() => Effect.runSync(result)).toThrow(
        "POS pattern must contain at least one valid POS tag"
      );
    });

    it("should encode bracket string to array of POS tags", () => {
      const input = "[NOUN|VERB|ADJ]";
      const result = Schema.encodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(input);

      expect(Effect.runSync(result)).toEqual(["NOUN", "VERB", "ADJ"]);
    });

    it("should encode optional bracket string", () => {
      const input = "[|DET]";
      const result = Schema.encodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(input);

      expect(Effect.runSync(result)).toEqual(["", "DET"]);
    });

    it("should encode single tag bracket string", () => {
      const input = "[NOUN]";
      const result = Schema.encodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(input);

      expect(Effect.runSync(result)).toEqual(["NOUN"]);
    });

    it("should error on empty option group", () => {
      const input = "[|]";
      const result = Schema.encodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(input);

      expect(() => Effect.runSync(result)).toThrow();
    });

    it("should handle all Universal POS tags", () => {
      const posTags = [
        "ADJ",
        "ADP",
        "ADV",
        "AUX",
        "CCONJ",
        "DET",
        "INTJ",
        "NOUN",
        "NUM",
        "PART",
        "PRON",
        "PROPN",
        "PUNCT",
        "SCONJ",
        "SYM",
        "VERB",
        "X",
        "SPACE",
      ];

      posTags.forEach((tag) => {
        const input = Data.array([tag] as const);
        const result = Schema.decodeUnknown(
          Pattern.POSPatternOptionToBracketString
        )(input);
        expect(Effect.runSync(result)).toBe(`[${tag}]`);
      });
    });

    it("should reject invalid POS tags in decode", () => {
      const input = Data.array(["INVALID"] as const);
      const result = Schema.decodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(input);

      expect(() => Effect.runSync(result)).toThrow();
    });

    it("should reject malformed bracket strings in encode", () => {
      const input = "NOUN|VERB"; // Missing brackets
      const result = Schema.encodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(input);

      expect(() => Effect.runSync(result)).toThrow();
    });

    it("should reject invalid POS tags in bracket strings", () => {
      const input = "[INVALID|NOUN]";
      const result = Schema.encodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(input);

      expect(() => Effect.runSync(result)).toThrow();
    });

    it("should handle round-trip conversion", () => {
      const original = Data.array(["NOUN", "VERB", "ADJ"] as const);

      // Decode to string
      const decoded = Schema.decodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(original);
      const stringResult = Effect.runSync(decoded);

      // Encode back to array
      const encoded = Schema.encodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(stringResult);
      const arrayResult = Effect.runSync(encoded);

      expect(arrayResult).toEqual(original);
    });

    it("should handle round-trip with optional elements", () => {
      const original = Data.array(["", "DET", "ADJ"] as const);

      // Decode to string
      const decoded = Schema.decodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(original);
      const stringResult = Effect.runSync(decoded);

      // Encode back to array
      const encoded = Schema.encodeUnknown(
        Pattern.POSPatternOptionToBracketString
      )(stringResult);
      const arrayResult = Effect.runSync(encoded);

      expect(arrayResult).toEqual(original);
    });
  });
});
