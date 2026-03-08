/**
 * Comprehensive Unit Tests for Bracket String Transformations
 * Tests the core transformation functionality for converting between
 * pattern arrays and bracket string notation used by wink-nlp
 */

import { describe, it, expect } from "vitest";
import { Data, Effect } from "effect";
import {
  Pattern,
  POSPatternElement,
  EntityPatternElement,
  LiteralPatternElement,
} from "../../src/NLP/Core/Pattern.js";

describe("Bracket String Transformations", () => {
  describe("POS Pattern Element toBracketString", () => {
    it("should convert single POS tag to bracket string", () => {
      const element = POSPatternElement.make({
        value: Data.array(["NOUN"] as const),
      });
      const result = Pattern.POS.toBracketString(element.value);
      expect(result).toBe("[NOUN]");
    });

    it("should convert multiple POS tags to bracket string", () => {
      const element = POSPatternElement.make({
        value: Data.array(["NOUN", "VERB", "ADJ"] as const),
      });
      const result = Pattern.POS.toBracketString(element.value);
      expect(result).toBe("[NOUN|VERB|ADJ]");
    });

    it("should handle optional POS tag (empty string)", () => {
      const element = POSPatternElement.make({
        value: Data.array(["", "DET"] as const),
      });
      const result = Pattern.POS.toBracketString(element.value);
      expect(result).toBe("[|DET]");
    });

    it("should handle multiple tags with optional", () => {
      const element = POSPatternElement.make({
        value: Data.array(["", "NOUN", "VERB"] as const),
      });
      const result = Pattern.POS.toBracketString(element.value);
      expect(result).toBe("[|NOUN|VERB]");
    });

    it("should work with all Universal POS tags", () => {
      const universalTags = [
        "ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ",
        "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT",
        "SCONJ", "SYM", "VERB", "X", "SPACE",
      ] as const;

      universalTags.forEach((tag) => {
        const element = POSPatternElement.make({
          value: Data.array([tag] as const),
        });
        const result = Pattern.POS.toBracketString(element.value);
        expect(result).toBe(`[${tag}]`);
      });
    });

    it("should handle complex combinations", () => {
      const element = POSPatternElement.make({
        value: Data.array(["", "ADJ", "ADV", "NOUN", "VERB"] as const),
      });
      const result = Pattern.POS.toBracketString(element.value);
      expect(result).toBe("[|ADJ|ADV|NOUN|VERB]");
    });
  });

  describe("Entity Pattern Element toBracketString", () => {
    it("should convert single entity type to bracket string", () => {
      const element = EntityPatternElement.make({
        value: Data.array(["CARDINAL"] as const),
      });
      const result = Pattern.Entity.toBracketString(element.value);
      expect(result).toBe("[CARDINAL]");
    });

    it("should convert multiple entity types to bracket string", () => {
      const element = EntityPatternElement.make({
        value: Data.array(["CARDINAL", "MONEY", "PERCENT"] as const),
      });
      const result = Pattern.Entity.toBracketString(element.value);
      expect(result).toBe("[CARDINAL|MONEY|PERCENT]");
    });

    it("should handle optional entity type (empty string)", () => {
      const element = EntityPatternElement.make({
        value: Data.array(["", "DATE"] as const),
      });
      const result = Pattern.Entity.toBracketString(element.value);
      expect(result).toBe("[|DATE]");
    });

    it("should work with all wink entity types", () => {
      const entityTypes = [
        "DATE", "ORDINAL", "CARDINAL", "MONEY", "PERCENT",
        "TIME", "DURATION", "HASHTAG", "EMOJI", "EMOTICON",
        "EMAIL", "URL", "MENTION",
      ] as const;

      entityTypes.forEach((type) => {
        const element = EntityPatternElement.make({
          value: Data.array([type] as const),
        });
        const result = Pattern.Entity.toBracketString(element.value);
        expect(result).toBe(`[${type}]`);
      });
    });

    it("should handle complex entity combinations", () => {
      const element = EntityPatternElement.make({
        value: Data.array(["", "MONEY", "PERCENT", "CARDINAL"] as const),
      });
      const result = Pattern.Entity.toBracketString(element.value);
      expect(result).toBe("[|MONEY|PERCENT|CARDINAL]");
    });
  });

  describe("Literal Pattern Element toBracketString", () => {
    it("should convert single literal to bracket string", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["pizza"] as const),
      });
      const result = Pattern.Literal.toBracketString(element.value);
      expect(result).toBe("[pizza]");
    });

    it("should convert multiple literals to bracket string", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["small", "medium", "large"] as const),
      });
      const result = Pattern.Literal.toBracketString(element.value);
      expect(result).toBe("[small|medium|large]");
    });

    it("should handle optional literal (empty string)", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["", "very", "extremely"] as const),
      });
      const result = Pattern.Literal.toBracketString(element.value);
      expect(result).toBe("[|very|extremely]");
    });

    it("should preserve case sensitivity", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["Pizza", "PIZZA", "pizza"] as const),
      });
      const result = Pattern.Literal.toBracketString(element.value);
      expect(result).toBe("[Pizza|PIZZA|pizza]");
    });

    it("should handle special characters", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["hello-world", "hello_world", "hello.world"] as const),
      });
      const result = Pattern.Literal.toBracketString(element.value);
      expect(result).toBe("[hello-world|hello_world|hello.world]");
    });

    it("should handle Unicode characters", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["café", "naïve", "résumé"] as const),
      });
      const result = Pattern.Literal.toBracketString(element.value);
      expect(result).toBe("[café|naïve|résumé]");
    });

    it("should handle numbers as literals", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["1", "2", "3", "10", "100"] as const),
      });
      const result = Pattern.Literal.toBracketString(element.value);
      expect(result).toBe("[1|2|3|10|100]");
    });

    it("should handle currency symbols", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["$", "€", "£", "¥"] as const),
      });
      const result = Pattern.Literal.toBracketString(element.value);
      expect(result).toBe("[$|€|£|¥]");
    });
  });

  describe("Pattern Element validation", () => {
    it("should reject empty POS pattern arrays", () => {
      expect(() => {
        Effect.runSync(
          Pattern.POS.decode({
            _tag: "POSPatternElement",
            value: [],
          })
        );
      }).toThrow();
    });

    it("should reject empty Entity pattern arrays", () => {
      expect(() => {
        Effect.runSync(
          Pattern.Entity.decode({
            _tag: "EntityPatternElement",
            value: [],
          })
        );
      }).toThrow();
    });

    it("should reject empty Literal pattern arrays", () => {
      expect(() => {
        Effect.runSync(
          Pattern.Literal.decode({
            _tag: "LiteralPatternElement",
            value: [],
          })
        );
      }).toThrow();
    });

    it("should reject invalid POS tags", () => {
      expect(() => {
        Effect.runSync(
          Pattern.POS.decode({
            _tag: "POSPatternElement",
            value: ["INVALID_POS"],
          })
        );
      }).toThrow();
    });

    it("should reject invalid entity types", () => {
      expect(() => {
        Effect.runSync(
          Pattern.Entity.decode({
            _tag: "EntityPatternElement",
            value: ["INVALID_ENTITY"],
          })
        );
      }).toThrow();
    });
  });

  describe("Complex Pattern combinations", () => {
    it("should handle money pattern transformation", () => {
      const dollarSign = LiteralPatternElement.make({
        value: Data.array(["$"] as const),
      });
      const amount = EntityPatternElement.make({
        value: Data.array(["CARDINAL"] as const),
      });
      const scale = LiteralPatternElement.make({
        value: Data.array(["million", "billion", "trillion"] as const),
      });

      expect(Pattern.Literal.toBracketString(dollarSign.value)).toBe("[$]");
      expect(Pattern.Entity.toBracketString(amount.value)).toBe("[CARDINAL]");
      expect(Pattern.Literal.toBracketString(scale.value)).toBe("[million|billion|trillion]");
    });

    it("should handle person name pattern transformation", () => {
      const firstName = POSPatternElement.make({
        value: Data.array(["PROPN"] as const),
      });
      const lastName = POSPatternElement.make({
        value: Data.array(["PROPN"] as const),
      });

      expect(Pattern.POS.toBracketString(firstName.value)).toBe("[PROPN]");
      expect(Pattern.POS.toBracketString(lastName.value)).toBe("[PROPN]");
    });

    it("should handle optional determiner pattern", () => {
      const determiner = POSPatternElement.make({
        value: Data.array(["", "DET"] as const),
      });
      const adjective = POSPatternElement.make({
        value: Data.array(["", "ADJ"] as const),
      });
      const noun = POSPatternElement.make({
        value: Data.array(["NOUN"] as const),
      });

      expect(Pattern.POS.toBracketString(determiner.value)).toBe("[|DET]");
      expect(Pattern.POS.toBracketString(adjective.value)).toBe("[|ADJ]");
      expect(Pattern.POS.toBracketString(noun.value)).toBe("[NOUN]");
    });

    it("should handle date pattern transformation", () => {
      const month = LiteralPatternElement.make({
        value: Data.array([
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ] as const),
      });
      const day = EntityPatternElement.make({
        value: Data.array(["ORDINAL", "CARDINAL"] as const),
      });
      const year = EntityPatternElement.make({
        value: Data.array(["CARDINAL"] as const),
      });

      expect(Pattern.Literal.toBracketString(month.value)).toBe(
        "[January|February|March|April|May|June|July|August|September|October|November|December]"
      );
      expect(Pattern.Entity.toBracketString(day.value)).toBe("[ORDINAL|CARDINAL]");
      expect(Pattern.Entity.toBracketString(year.value)).toBe("[CARDINAL]");
    });
  });

  describe("Data array equality and immutability", () => {
    it("should maintain Data array equality", () => {
      const value1 = Data.array(["NOUN", "VERB"] as const);
      const value2 = Data.array(["NOUN", "VERB"] as const);
      
      const element1 = POSPatternElement.make({ value: value1 });
      const element2 = POSPatternElement.make({ value: value2 });
      
      // Data arrays should be equal by value
      expect(element1.value).toEqual(element2.value);
    });

    it("should preserve immutability", () => {
      const originalArray = ["NOUN", "VERB"] as const;
      const dataArray = Data.array(originalArray);
      const element = POSPatternElement.make({ value: dataArray });
      
      // Original array and element value should remain unchanged
      expect(element.value).toEqual(["NOUN", "VERB"]);
      expect(originalArray).toEqual(["NOUN", "VERB"]);
    });

    it("should handle large arrays efficiently", () => {
      const largeArray = Array.from({ length: 50 }, (_, i) => `word${i}`);
      const [head, ...tail] = largeArray;
      if (head === undefined) {
        throw new Error("Expected non-empty pattern array");
      }
      const nonEmptyWords: readonly [string, ...Array<string>] = [
        head,
        ...tail,
      ];
      const element = LiteralPatternElement.make({
        value: Data.array(nonEmptyWords),
      });
      
      const result = Pattern.Literal.toBracketString(element.value);
      expect(result).toContain("word0");
      expect(result).toContain("word49");
      expect(result.split("|")).toHaveLength(50);
    });
  });

  describe("Error handling and edge cases", () => {
    it("should reject single empty string in POS pattern via toBracketString", () => {
      // Empty string only is not valid - needs at least one valid tag
      const element = POSPatternElement.make({
        value: Data.array([""] as const),
      });
      // The toBracketString should reject this
      expect(() => Pattern.POS.toBracketString(element.value)).toThrow(
        "POS pattern must contain at least one valid POS tag"
      );
    });

    it("should reject single empty string in Entity pattern via toBracketString", () => {
      // Empty string only is not valid - needs at least one valid entity
      const element = EntityPatternElement.make({
        value: Data.array([""] as const),
      });
      // The toBracketString should reject this
      expect(() => Pattern.Entity.toBracketString(element.value)).toThrow(
        "Entity pattern must contain at least one valid entity type"
      );
    });

    it("should reject single empty string in Literal pattern via toBracketString", () => {
      // Empty string only is not valid - needs at least one valid literal
      const element = LiteralPatternElement.make({
        value: Data.array([""] as const),
      });
      // The toBracketString should reject this
      expect(() => Pattern.Literal.toBracketString(element.value)).toThrow(
        "Literal pattern must contain at least one valid literal"
      );
    });

    it("should accept mixed case POS tags", () => {
      // POS tags should be uppercase
      expect(() => {
        Effect.runSync(
          Pattern.POS.decode({
            _tag: "POSPatternElement",
            value: ["noun"],
          })
        );
      }).toThrow();
    });

    it("should preserve literal spacing", () => {
      const element = LiteralPatternElement.make({
        value: Data.array(["hello world", "goodbye world"] as const),
      });
      const result = Pattern.Literal.toBracketString(element.value);
      expect(result).toBe("[hello world|goodbye world]");
    });
  });
});
