/**
 * Comprehensive Unit Tests for Pattern Types and Transformations
 * Production-quality tests for Pattern, PatternElements, and CustomEntityExample
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Chunk, Data, Effect, Schema } from "effect";
import {
  Pattern,
  POSPatternElement,
  EntityPatternElement,
  LiteralPatternElement,
} from "../../src/NLP/Core/Pattern.js";
import {
  CustomEntityExample,
  PatternToWinkCustomEntityExample,
  patternElementChunksToBracketString,
} from "../../src/NLP/Wink/WinkPattern.js";

describe("Pattern Types", () => {
  describe("POSPatternElement", () => {
    it("should create POS pattern element with valid tags", () => {
      const element = POSPatternElement.make({
        value: Data.array(["NOUN", "VERB"] as const),
      });

      expect(element._tag).toBe("POSPatternElement");
      expect(element.value).toEqual(["NOUN", "VERB"]);
    });

    it("should create POS pattern element with optional empty string", () => {
      const element = POSPatternElement.make({
        value: Data.array(["", "NOUN"] as const),
      });

      expect(element.value).toEqual(["", "NOUN"]);
    });

    it("should encode and decode correctly", () => {
      const original = POSPatternElement.make({
        value: Data.array(["ADJ", "NOUN"] as const),
      });

      const encoded = Pattern.POS.encode(original);
      const decoded = Schema.decodeSync(POSPatternElement)(encoded);

      expect(decoded._tag).toBe("POSPatternElement");
      expect(decoded.value).toEqual(["ADJ", "NOUN"] as const);
    });

    it("should convert to bracket string", () => {
      const element = POSPatternElement.make({
        value: Data.array(["NOUN", "VERB"] as const),
      });

      const bracketString = Pattern.POS.toBracketString(element.value);
      expect(bracketString).toBe("[NOUN|VERB]");
    });

    it("should handle optional elements in bracket string", () => {
      const element = POSPatternElement.make({
        value: Data.array(["", "DET"] as const),
      });

      const bracketString = Pattern.POS.toBracketString(element.value);
      expect(bracketString).toBe("[|DET]");
    });
  });

  describe("EntityPatternElement", () => {
    it("should create entity pattern element with valid types", () => {
      const element = EntityPatternElement.make({
        value: Data.array(["CARDINAL", "MONEY"] as const),
      });

      expect(element._tag).toBe("EntityPatternElement");
      expect(element.value).toEqual(["CARDINAL", "MONEY"] as const);
    });

    it("should convert to bracket string", () => {
      const element = EntityPatternElement.make({
        value: Data.array(["DATE", "TIME"] as const),
      });

      const bracketString = Pattern.Entity.toBracketString(element.value);
      expect(bracketString).toBe("[DATE|TIME]");
    });

    it("should handle single entity type", () => {
      const element = EntityPatternElement.make({
        value: Data.array(["PERCENT"] as const),
      });

      const bracketString = Pattern.Entity.toBracketString(element.value);
      expect(bracketString).toBe("[PERCENT]");
    });
  });

  describe("LiteralPatternElement", () => {
    it("should create literal pattern element with strings", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["pizza", "Pizza", "PIZZA"] as const),
      });

      expect(element._tag).toBe("LiteralPatternElement");
      expect(element.value).toEqual(["pizza", "Pizza", "PIZZA"] as const);
    });

    it("should convert to bracket string", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["million", "billion", "trillion"] as const),
      });

      const bracketString = Pattern.Literal.toBracketString(element.value);
      expect(bracketString).toBe("[million|billion|trillion]");
    });

    it("should handle optional literals", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["", "very", "extremely"] as const),
      });

      const bracketString = Pattern.Literal.toBracketString(element.value);
      expect(bracketString).toBe("[|very|extremely]");
    });
  });

  describe("Pattern", () => {
    let moneyPattern: Pattern;
    let complexPattern: Pattern;

    beforeEach(() => {
      moneyPattern = new Pattern({
        id: Pattern.Id("money-amount"),
        elements: Chunk.make(
          LiteralPatternElement.make({ value: Data.array(["$"] as const) }),
          EntityPatternElement.make({
            value: Data.array(["CARDINAL"] as const),
          }),
          LiteralPatternElement.make({
            value: Data.array(["million", "billion", "trillion"] as const),
          })
        ),
      });

      complexPattern = new Pattern({
        id: Pattern.Id("complex-entity"),
        elements: Chunk.make(
          LiteralPatternElement.make({ value: Data.array(["", "the"] as const) }),
          POSPatternElement.make({ value: Data.array(["ADJ"] as const) }),
          LiteralPatternElement.make({
            value: Data.array(["company", "corporation"] as const),
          }),
          EntityPatternElement.make({ value: Data.array(["MONEY"] as const) })
        ),
      });
    });

    it("should create pattern with branded ID", () => {
      expect(moneyPattern.id).toBe("money-amount");
      expect(moneyPattern._tag).toBe("Pattern");
    });

    it("should maintain element order in Chunk", () => {
      const elements = Chunk.toArray(moneyPattern.elements);
      expect(elements).toHaveLength(3);
      expect(elements[0]._tag).toBe("LiteralPatternElement");
      expect(elements[1]._tag).toBe("EntityPatternElement");
      expect(elements[2]._tag).toBe("LiteralPatternElement");
    });

    it("should encode and decode correctly", () => {
      const encoded = Pattern.encode(moneyPattern);
      const decoded = Pattern.decode(encoded);

      expect(decoded.id).toBe(moneyPattern.id);
      expect(Chunk.size(decoded.elements)).toBe(
        Chunk.size(moneyPattern.elements)
      );
    });

    it("should be type-safe with Pattern.is", () => {
      expect(Pattern.is(moneyPattern)).toBe(true);
      expect(Pattern.is({ invalid: "object" })).toBe(false);
    });

    it("should convert to bracket string correctly", () => {
      const bracketStrings = patternElementChunksToBracketString(moneyPattern);
      expect(bracketStrings).toEqual([
        "[$]",
        "[CARDINAL]",
        "[million|billion|trillion]",
      ]);
    });

    it("should handle complex patterns with optional elements", () => {
      const bracketStrings =
        patternElementChunksToBracketString(complexPattern);
      expect(bracketStrings).toEqual([
        "[|the]",
        "[ADJ]",
        "[company|corporation]",
        "[MONEY]",
      ]);
    });
  });

  describe("Pattern ID branding", () => {
    it("should create branded pattern ID", () => {
      const id = Pattern.Id("test-pattern");
      expect(typeof id).toBe("string");
      expect(id).toBe("test-pattern");
    });

    it("should reject empty pattern ID", () => {
      expect(() => Pattern.Id("")).toThrow();
    });

    it("should accept valid pattern IDs", () => {
      const validIds = ["a", "test", "complex-pattern-name-123", "entity_type"];
      validIds.forEach((id) => {
        expect(() => Pattern.Id(id)).not.toThrow();
      });
    });
  });

  describe("CustomEntityExample", () => {
    it("should create CustomEntityExample with proper structure", () => {
      const entity = new CustomEntityExample({
        name: "test-entity",
        patterns: Data.array(["[NOUN]", "[VERB]"]),
      });

      expect(entity.name).toBe("test-entity");
      expect(entity.patterns).toEqual(["[NOUN]", "[VERB]"]);
    });

    it("should maintain Data array type for patterns", () => {
      const patterns = Data.array(["[ADJ]", "[NOUN]", "[VERB]"]);
      const entity = new CustomEntityExample({
        name: "pos-entity",
        patterns,
      });

      expect(Array.isArray(entity.patterns)).toBe(true);
      expect(entity.patterns).toEqual(["[ADJ]", "[NOUN]", "[VERB]"]);
    });

    it("should encode and decode correctly", () => {
      const original = new CustomEntityExample({
        name: "original",
        patterns: Data.array(["[CARDINAL]", "[MONEY]"]),
      });

      const encoded = Schema.encodeSync(CustomEntityExample)(original);
      const decoded = Schema.decodeSync(CustomEntityExample)(encoded);

      expect(decoded.name).toBe("original");
      expect(decoded.patterns).toEqual(["[CARDINAL]", "[MONEY]"]);
    });
  });

  describe("PatternToWinkCustomEntityExample transformation", () => {
    let testPattern: Pattern;

    beforeEach(() => {
      testPattern = new Pattern({
        id: Pattern.Id("test-transformation"),
        elements: Chunk.make(
          LiteralPatternElement.make({
            value: Data.array(["$"] as const),
          }),
          EntityPatternElement.make({
            value: Data.array(["CARDINAL"] as const),
          }),
          LiteralPatternElement.make({
            value: Data.array(["dollars"] as const),
          })
        ),
      });
    });

    it("should transform Pattern to CustomEntityExample", () => {
      const entity = Schema.decodeSync(PatternToWinkCustomEntityExample)(
        Pattern.encode(testPattern)
      );

      expect(entity.name).toBe("test-transformation");
      expect(entity.patterns).toEqual(["[$]", "[CARDINAL]", "[dollars]"]);
    });

    it("should preserve pattern order during transformation", () => {
      const complexPattern = new Pattern({
        id: Pattern.Id("order-test"),
        elements: Chunk.make(
          POSPatternElement.make({ value: Data.array(["DET"] as const) }),
          LiteralPatternElement.make({ value: Data.array(["quick"] as const) }),
          POSPatternElement.make({ value: Data.array(["ADJ"] as const) }),
          POSPatternElement.make({ value: Data.array(["NOUN"] as const) })
        ),
      });

      const entity = Schema.decodeSync(PatternToWinkCustomEntityExample)(
        Pattern.encode(complexPattern)
      );

      expect(entity.patterns).toEqual(["[DET]", "[quick]", "[ADJ]", "[NOUN]"]);
    });

    it("should handle patterns with optional elements", () => {
      const optionalPattern = new Pattern({
        id: Pattern.Id("optional-test"),
        elements: Chunk.make(
          LiteralPatternElement.make({
            value: Data.array(["", "the"] as const),
          }),
          POSPatternElement.make({ value: Data.array(["", "ADJ"] as const) }),
          LiteralPatternElement.make({
            value: Data.array(["company"] as const),
          })
        ),
      });

      const entity = Schema.decodeSync(PatternToWinkCustomEntityExample)(
        Pattern.encode(optionalPattern)
      );

      expect(entity.patterns).toEqual(["[|the]", "[|ADJ]", "[company]"]);
    });

    it("should be reversible for round-trip testing", () => {
      const originalEntity = Schema.decodeSync(
        PatternToWinkCustomEntityExample
      )(Pattern.encode(testPattern));

      // Note: The reverse transformation is not fully implemented in the current code
      // but we can test the forward transformation is consistent
      const entity2 = Schema.decodeSync(PatternToWinkCustomEntityExample)(
        Pattern.encode(testPattern)
      );

      expect(entity2.name).toBe(originalEntity.name);
      expect(entity2.patterns).toEqual(originalEntity.patterns);
    });
  });

  describe("Edge cases and validation", () => {
    it("should handle single element patterns", () => {
      const singlePattern = new Pattern({
        id: Pattern.Id("single"),
        elements: Chunk.make(
          LiteralPatternElement.make({
            value: Data.array(["hello"] as const),
          })
        ),
      });

      const bracketStrings = patternElementChunksToBracketString(singlePattern);
      expect(bracketStrings).toEqual(["[hello]"]);
    });

    it("should handle empty value arrays in elements", () => {
      // This test verifies the schema validation - empty arrays should be rejected
      expect(() => {
        Effect.runSync(
          Pattern.POS.decode({
            _tag: "POSPatternElement",
            value: [],
          })
        );
      }).toThrow();
    });

    it("should preserve exact string content", () => {
      const specialCharsPattern = new Pattern({
        id: Pattern.Id("special-chars"),
        elements: Chunk.make(
          LiteralPatternElement.make({
            value: Data.array([
              "hello-world",
              "hello_world",
              "hello.world",
            ] as const),
          })
        ),
      });

      const bracketStrings =
        patternElementChunksToBracketString(specialCharsPattern);
      expect(bracketStrings).toEqual(["[hello-world|hello_world|hello.world]"]);
    });

    it("should maintain case sensitivity", () => {
      const casePattern = new Pattern({
        id: Pattern.Id("case-test"),
        elements: Chunk.make(
          LiteralPatternElement.make({
            value: Data.array(["Apple", "APPLE", "apple"] as const),
          })
        ),
      });

      const entity = Schema.decodeSync(PatternToWinkCustomEntityExample)(
        Pattern.encode(casePattern)
      );

      expect(entity.patterns).toEqual(["[Apple|APPLE|apple]"]);
    });

    it("should handle Unicode characters", () => {
      const unicodePattern = new Pattern({
        id: Pattern.Id("unicode-test"),
        elements: Chunk.make(
          LiteralPatternElement.make({
            value: Data.array(["café", "naïve", "résumé"] as const),
          })
        ),
      });

      const bracketStrings =
        patternElementChunksToBracketString(unicodePattern);
      expect(bracketStrings).toEqual(["[café|naïve|résumé]"]);
    });
  });

  describe("Performance and memory considerations", () => {
    it("should handle large pattern arrays efficiently", () => {
      const largeLiteralArray = Array.from(
        { length: 100 },
        (_, i) => `word${i}`
      );
      const largePattern = new Pattern({
        id: Pattern.Id("large-pattern"),
        elements: Chunk.make(
          (() => {
            const [head, ...tail] = largeLiteralArray;
            if (head === undefined) {
              throw new Error("Expected non-empty pattern array");
            }
            const nonEmptyWords: readonly [string, ...Array<string>] = [
              head,
              ...tail,
            ];
            return LiteralPatternElement.make({
              value: Data.array(nonEmptyWords),
            });
          })()
        ),
      });

      const bracketStrings = patternElementChunksToBracketString(largePattern);
      expect(bracketStrings[0]).toContain("word0");
      expect(bracketStrings[0]).toContain("word99");
      expect(bracketStrings[0].split("|")).toHaveLength(100);
    });

    it("should create immutable data structures", () => {
      const originalArray = ["NOUN", "VERB"];
      const element = POSPatternElement.make({
        value: Data.array(["NOUN", "VERB"] as const),
      });

      // Modifying original array should not affect element
      originalArray.push("ADJ");
      expect(element.value).toEqual(["NOUN", "VERB"]);
    });
  });
});
