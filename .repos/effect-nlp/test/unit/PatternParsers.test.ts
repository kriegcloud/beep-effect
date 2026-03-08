import { describe, it, expect } from "vitest";
import { Effect, Schema, Data } from "effect";
import {
  BracketStringToPOSPatternElement,
  BracketStringToEntityPatternElement,
  BracketStringToLiteralPatternElement,
  PatternFromString,
} from "../../src/NLP/Core/PatternParsers.js";
import {
  POSPatternElement,
  EntityPatternElement,
  LiteralPatternElement,
} from "../../src/NLP/Core/Pattern.js";

// ============================================================================
// BRACKET STRING PARSER TESTS
// ============================================================================

describe("Bracket String Parsers", () => {
  describe("BracketStringToPOSPatternElement", () => {
    it("should parse valid POS bracket string", async () => {
      const result = await Effect.runPromise(
        Schema.decodeUnknown(BracketStringToPOSPatternElement)("[ADJ|NOUN]")
      );
      expect(result._tag).toBe("POSPatternElement");
      expect(result.value).toEqual(["ADJ", "NOUN"]);
    });

    it("should parse single POS tag", async () => {
      const result = await Effect.runPromise(
        Schema.decodeUnknown(BracketStringToPOSPatternElement)("[VERB]")
      );
      expect(result.value).toEqual(["VERB"]);
    });

    it("should handle optional elements with empty string", async () => {
      const result = await Effect.runPromise(
        Schema.decodeUnknown(BracketStringToPOSPatternElement)("[|DET]")
      );
      expect(result.value).toEqual(["", "DET"]);
    });

    it("should fail for invalid POS tags", async () => {
      const result = Effect.runPromiseExit(
        Schema.decodeUnknown(BracketStringToPOSPatternElement)("[INVALID]")
      );
      await expect(result).resolves.toMatchObject({ _tag: "Failure" });
    });

    it("should fail for missing brackets", async () => {
      const result = Effect.runPromiseExit(
        Schema.decodeUnknown(BracketStringToPOSPatternElement)("ADJ|NOUN")
      );
      await expect(result).resolves.toMatchObject({ _tag: "Failure" });
    });

    it("should fail for empty bracket", async () => {
      const result = Effect.runPromiseExit(
        Schema.decodeUnknown(BracketStringToPOSPatternElement)("[]")
      );
      await expect(result).resolves.toMatchObject({ _tag: "Failure" });
    });

    it("should fail for only empty strings", async () => {
      const result = Effect.runPromiseExit(
        Schema.decodeUnknown(BracketStringToPOSPatternElement)("[|]")
      );
      await expect(result).resolves.toMatchObject({ _tag: "Failure" });
    });

    it("should encode back to bracket string", async () => {
      const element = POSPatternElement.make({
        value: Data.array(["ADJ", "NOUN"]) as any,
      });
      const result = await Effect.runPromise(
        Schema.encodeUnknown(BracketStringToPOSPatternElement)(element)
      );
      expect(result).toBe("[ADJ|NOUN]");
    });
  });

  describe("BracketStringToEntityPatternElement", () => {
    it("should parse valid entity bracket string", async () => {
      const result = await Effect.runPromise(
        Schema.decodeUnknown(BracketStringToEntityPatternElement)(
          "[CARDINAL|TIME]"
        )
      );
      expect(result._tag).toBe("EntityPatternElement");
      expect(result.value).toEqual(["CARDINAL", "TIME"]);
    });

    it("should parse single entity type", async () => {
      const result = await Effect.runPromise(
        Schema.decodeUnknown(BracketStringToEntityPatternElement)("[MONEY]")
      );
      expect(result.value).toEqual(["MONEY"]);
    });

    it("should handle optional entities", async () => {
      const result = await Effect.runPromise(
        Schema.decodeUnknown(BracketStringToEntityPatternElement)("[|PERCENT]")
      );
      expect(result.value).toEqual(["", "PERCENT"]);
    });

    it("should fail for invalid entity types", async () => {
      const result = Effect.runPromiseExit(
        Schema.decodeUnknown(BracketStringToEntityPatternElement)(
          "[INVALID_ENTITY]"
        )
      );
      await expect(result).resolves.toMatchObject({ _tag: "Failure" });
    });

    it("should encode back to bracket string", async () => {
      const element = EntityPatternElement.make({
        value: Data.array(["CARDINAL", "TIME"]) as any,
      });
      const result = await Effect.runPromise(
        Schema.encodeUnknown(BracketStringToEntityPatternElement)(element)
      );
      expect(result).toBe("[CARDINAL|TIME]");
    });
  });

  describe("BracketStringToLiteralPatternElement", () => {
    it("should parse valid literal bracket string", async () => {
      const result = await Effect.runPromise(
        Schema.decodeUnknown(BracketStringToLiteralPatternElement)(
          "[Apple|Google]"
        )
      );
      expect(result._tag).toBe("LiteralPatternElement");
      expect(result.value).toEqual(["Apple", "Google"]);
    });

    it("should parse single literal", async () => {
      const result = await Effect.runPromise(
        Schema.decodeUnknown(BracketStringToLiteralPatternElement)(
          "[Microsoft]"
        )
      );
      expect(result.value).toEqual(["Microsoft"]);
    });

    it("should handle optional literals", async () => {
      const result = await Effect.runPromise(
        Schema.decodeUnknown(BracketStringToLiteralPatternElement)("[|the]")
      );
      expect(result.value).toEqual(["", "the"]);
    });

    it("should fail for whitespace-only literals", async () => {
      const result = Effect.runPromiseExit(
        Schema.decodeUnknown(BracketStringToLiteralPatternElement)("[   ]")
      );
      await expect(result).resolves.toMatchObject({ _tag: "Failure" });
    });

    it("should encode back to bracket string", async () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["Apple", "Google"]) as any,
      });
      const result = await Effect.runPromise(
        Schema.encodeUnknown(BracketStringToLiteralPatternElement)(element)
      );
      expect(result).toBe("[Apple|Google]");
    });
  });
});

// ============================================================================
// COMPLEX MIXED ELEMENT PARSING TESTS
// ============================================================================

describe("Complex Mixed Element Parsing", () => {
  it("should parse mixed POS, Entity, and Literal elements", () => {
    const elems = PatternFromString([
      "[ADJ|NOUN]",
      "[CARDINAL]",
      "[Apple|Google]",
    ]); // sync
    expect(elems).toHaveLength(3);
    expect(elems[0]._tag).toBe("POSPatternElement");
    expect(elems[1]._tag).toBe("EntityPatternElement");
    expect(elems[2]._tag).toBe("LiteralPatternElement");
  });

  it("should parse with optional entries across types", () => {
    const elems = PatternFromString(["[|DET]", "[VERB]", "[|the]"]); // sync
    expect(elems).toHaveLength(3);
    expect((elems[0] as POSPatternElement).value).toEqual(["", "DET"]);
    expect((elems[1] as POSPatternElement).value).toEqual(["VERB"]);
    expect((elems[2] as LiteralPatternElement).value).toEqual(["", "the"]);
  });

  it("should fail when any element is malformed", () => {
    expect(() => PatternFromString(["[NOUN]", "invalid", "[Apple]"])).toThrow();
  });
});
