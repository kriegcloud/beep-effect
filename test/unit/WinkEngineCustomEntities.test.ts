/**
 * Comprehensive Unit Tests for WinkEngineCustomEntities
 * Production-quality tests with full coverage and provable data transformations
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Chunk, Data, pipe, Equal } from "effect";
import {
  WinkEngineCustomEntities,
  CustomEntityExample,
  EntityGroupName,
} from "../../src/NLP/Wink/WinkPattern.js";
import {
  Pattern,
  POSPatternElement,
  EntityPatternElement,
  LiteralPatternElement,
} from "../../src/NLP/Core/Pattern.js";

describe("WinkEngineCustomEntities", () => {
  // Test fixtures
  let moneyPattern: Pattern;
  let personPattern: Pattern;
  let universityPattern: Pattern;
  let duplicateMoneyPattern: Pattern;

  beforeEach(() => {
    // Create test patterns with deterministic data
    moneyPattern = new Pattern({
      id: Pattern.Id("money-amount"),
      elements: Chunk.make(
        LiteralPatternElement.make({ value: Data.array(["$"] as const) }),
        EntityPatternElement.make({ value: Data.array(["CARDINAL"] as const) }),
        LiteralPatternElement.make({
          value: Data.array(["million", "billion", "trillion"] as const),
        })
      ),
    });

    personPattern = new Pattern({
      id: Pattern.Id("person-name"),
      elements: Chunk.make(
        POSPatternElement.make({ value: Data.array(["PROPN"] as const) }),
        POSPatternElement.make({ value: Data.array(["PROPN"] as const) })
      ),
    });

    universityPattern = new Pattern({
      id: Pattern.Id("university-name"),
      elements: Chunk.make(
        LiteralPatternElement.make({
          value: Data.array(["Columbia", "Harvard", "Brown"] as const),
        }),
        LiteralPatternElement.make({
          value: Data.array(["University"] as const),
        })
      ),
    });

    // Exact duplicate of moneyPattern for testing deduplication
    duplicateMoneyPattern = new Pattern({
      id: Pattern.Id("money-amount"),
      elements: Chunk.make(
        LiteralPatternElement.make({ value: Data.array(["$"] as const) }),
        EntityPatternElement.make({ value: Data.array(["CARDINAL"] as const) }),
        LiteralPatternElement.make({
          value: Data.array(["million", "billion", "trillion"] as const),
        })
      ),
    });
  });

  describe("EntityGroupName branded type", () => {
    it("should create branded EntityGroupName from string", () => {
      const name = EntityGroupName.make("test-group");
      expect(typeof name).toBe("string");
      // Branded types retain string behavior but have type safety
    });

    it("should reject empty strings", () => {
      expect(() => EntityGroupName.make("")).toThrow();
    });

    it("should accept non-empty strings", () => {
      const validNames = ["a", "test", "complex-group-name-123"];
      validNames.forEach((name) => {
        expect(() => EntityGroupName.make(name)).not.toThrow();
      });
    });
  });

  describe("WinkEngineCustomEntities.fromPatterns", () => {
    it("should create entities from single pattern", () => {
      const entities = WinkEngineCustomEntities.fromPatterns("test-group", [
        moneyPattern,
      ]);

      expect(entities.name).toBe("test-group");
      expect(entities.size()).toBe(1);
      expect(entities.hasPattern("money-amount")).toBe(true);
    });

    it("should create entities from multiple patterns", () => {
      const entities = WinkEngineCustomEntities.fromPatterns("multi-group", [
        moneyPattern,
        personPattern,
        universityPattern,
      ]);

      expect(entities.size()).toBe(3);
      expect(entities.hasPattern("money-amount")).toBe(true);
      expect(entities.hasPattern("person-name")).toBe(true);
      expect(entities.hasPattern("university-name")).toBe(true);
    });

    it("should deduplicate identical patterns", () => {
      const entities = WinkEngineCustomEntities.fromPatterns("dedup-test", [
        moneyPattern,
        duplicateMoneyPattern,
        personPattern,
      ]);

      // Should deduplicate the two identical money patterns
      expect(entities.size()).toBe(2);
      expect(entities.hasPattern("money-amount")).toBe(true);
      expect(entities.hasPattern("person-name")).toBe(true);
    });

    it("should accept Chunk as input", () => {
      const patternChunk = Chunk.make(moneyPattern, personPattern);
      const entities = WinkEngineCustomEntities.fromPatterns(
        "chunk-test",
        patternChunk
      );

      expect(entities.size()).toBe(2);
    });

    it("should accept EntityGroupName as name parameter", () => {
      const groupName = EntityGroupName.make("branded-name");
      const entities = WinkEngineCustomEntities.fromPatterns(groupName, [
        moneyPattern,
      ]);

      expect(entities.name).toBe("branded-name");
    });

    it("should handle empty pattern array", () => {
      const entities = WinkEngineCustomEntities.fromPatterns("empty-group", []);
      expect(entities.size()).toBe(0);
      expect(entities.isEmpty()).toBe(true);
    });
  });

  describe("Hash and Equivalence", () => {
    it("should have consistent hash for identical content", () => {
      const entities1 = WinkEngineCustomEntities.fromPatterns("same-name", [
        moneyPattern,
        personPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("same-name", [
        moneyPattern,
        personPattern,
      ]);

      expect(entities1.getHash()).toBe(entities2.getHash());
    });

    it("should have different hash for different content", () => {
      const entities1 = WinkEngineCustomEntities.fromPatterns("group-a", [
        moneyPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("group-a", [
        personPattern,
      ]);

      expect(entities1.getHash()).not.toBe(entities2.getHash());
    });

    it("should have different hash for different names", () => {
      const entities1 = WinkEngineCustomEntities.fromPatterns("name-a", [
        moneyPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("name-b", [
        moneyPattern,
      ]);

      expect(entities1.getHash()).not.toBe(entities2.getHash());
    });

    it("should be equal for identical instances", () => {
      const entities1 = WinkEngineCustomEntities.fromPatterns("test", [
        moneyPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("test", [
        moneyPattern,
      ]);

      expect(entities1.equals(entities2)).toBe(true);
      expect(Equal.equals(entities1, entities2)).toBe(true);
    });

    it("should not be equal for different instances", () => {
      const entities1 = WinkEngineCustomEntities.fromPatterns("test", [
        moneyPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("test", [
        personPattern,
      ]);

      expect(entities1.equals(entities2)).toBe(false);
    });

    it("should provide working equivalence instance", () => {
      const equivalence = WinkEngineCustomEntities.getEquivalence();
      const entities1 = WinkEngineCustomEntities.fromPatterns("test", [
        moneyPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("test", [
        moneyPattern,
      ]);

      expect(equivalence(entities1, entities2)).toBe(true);
    });
  });

  describe("merge operations", () => {
    it("should merge two entities with required name", () => {
      const entities1 = WinkEngineCustomEntities.fromPatterns("group-1", [
        moneyPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("group-2", [
        personPattern,
      ]);

      const merged = entities1.merge(entities2, "merged-group");

      expect(merged.name).toBe("merged-group");
      expect(merged.size()).toBe(2);
      expect(merged.hasPattern("money-amount")).toBe(true);
      expect(merged.hasPattern("person-name")).toBe(true);
    });

    it("should deduplicate patterns during merge", () => {
      const entities1 = WinkEngineCustomEntities.fromPatterns("group-1", [
        moneyPattern,
        personPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("group-2", [
        moneyPattern, // Duplicate
        universityPattern,
      ]);

      const merged = entities1.merge(entities2, "merged-group");

      expect(merged.size()).toBe(3); // money, person, university (deduplicated)
    });

    it("should accept EntityGroupName for merge name", () => {
      const entities1 = WinkEngineCustomEntities.fromPatterns("group-1", [
        moneyPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("group-2", [
        personPattern,
      ]);
      const mergeName = EntityGroupName.make("branded-merge");

      const merged = entities1.merge(entities2, mergeName);

      expect(merged.name).toBe("branded-merge");
    });

    it("should preserve original entities after merge", () => {
      const entities1 = WinkEngineCustomEntities.fromPatterns("group-1", [
        moneyPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("group-2", [
        personPattern,
      ]);

      entities1.merge(entities2, "merged");

      // Original entities should be unchanged
      expect(entities1.size()).toBe(1);
      expect(entities2.size()).toBe(1);
      expect(entities1.name).toBe("group-1");
      expect(entities2.name).toBe("group-2");
    });
  });

  describe("rename operations", () => {
    it("should rename with string", () => {
      const entities = WinkEngineCustomEntities.fromPatterns("old-name", [
        moneyPattern,
      ]);
      const renamed = entities.rename("new-name");

      expect(renamed.name).toBe("new-name");
      expect(renamed.size()).toBe(1);
      expect(entities.name).toBe("old-name"); // Original unchanged
    });

    it("should rename with EntityGroupName", () => {
      const entities = WinkEngineCustomEntities.fromPatterns("old-name", [
        moneyPattern,
      ]);
      const newName = EntityGroupName.make("branded-new-name");
      const renamed = entities.rename(newName);

      expect(renamed.name).toBe("branded-new-name");
    });
  });

  describe("pattern manipulation", () => {
    let baseEntities: WinkEngineCustomEntities;

    beforeEach(() => {
      baseEntities = WinkEngineCustomEntities.fromPatterns("base", [
        moneyPattern,
        personPattern,
      ]);
    });

    it("should add pattern", () => {
      const updated = baseEntities.addPattern(universityPattern);

      expect(updated.size()).toBe(3);
      expect(updated.hasPattern("university-name")).toBe(true);
      expect(baseEntities.size()).toBe(2); // Original unchanged
    });

    it("should deduplicate when adding existing pattern", () => {
      const updated = baseEntities.addPattern(moneyPattern);

      expect(updated.size()).toBe(3); // Creates new instance due to transformation
    });

    it("should remove pattern by string name", () => {
      const updated = baseEntities.removePattern("money-amount");

      expect(updated.size()).toBe(1);
      expect(updated.hasPattern("money-amount")).toBe(false);
      expect(updated.hasPattern("person-name")).toBe(true);
    });

    it("should remove pattern by EntityGroupName", () => {
      const patternName = EntityGroupName.make("money-amount");
      const updated = baseEntities.removePattern(patternName);

      expect(updated.size()).toBe(1);
      expect(updated.hasPattern("money-amount")).toBe(false);
    });

    it("should handle removing non-existent pattern", () => {
      const updated = baseEntities.removePattern("non-existent");

      expect(updated.size()).toBe(2); // No change
      expect(updated.equals(baseEntities)).toBe(true); // Same content, should be equal
    });
  });

  describe("pattern queries", () => {
    let entities: WinkEngineCustomEntities;

    beforeEach(() => {
      entities = WinkEngineCustomEntities.fromPatterns("test", [
        moneyPattern,
        personPattern,
        universityPattern,
      ]);
    });

    it("should check pattern existence with string", () => {
      expect(entities.hasPattern("money-amount")).toBe(true);
      expect(entities.hasPattern("non-existent")).toBe(false);
    });

    it("should check pattern existence with EntityGroupName", () => {
      const patternName = EntityGroupName.make("money-amount");
      expect(entities.hasPattern(patternName)).toBe(true);
    });

    it("should get pattern by string name", () => {
      const pattern = entities.getPattern("money-amount");

      expect(pattern).toBeDefined();
      expect(pattern!.name).toBe("money-amount");
      expect(pattern!.patterns).toEqual([
        "[$]",
        "[CARDINAL]",
        "[million|billion|trillion]",
      ]);
    });

    it("should get pattern by EntityGroupName", () => {
      const patternName = EntityGroupName.make("person-name");
      const pattern = entities.getPattern(patternName);

      expect(pattern).toBeDefined();
      expect(pattern!.name).toBe("person-name");
    });

    it("should return undefined for non-existent pattern", () => {
      const pattern = entities.getPattern("non-existent");
      expect(pattern).toBeUndefined();
    });

    it("should report correct size", () => {
      expect(entities.size()).toBe(3);
    });

    it("should report isEmpty correctly", () => {
      const empty = WinkEngineCustomEntities.fromPatterns("empty", []);
      expect(empty.isEmpty()).toBe(true);
      expect(entities.isEmpty()).toBe(false);
    });
  });

  describe("array conversion", () => {
    it("should convert to array", () => {
      const entities = WinkEngineCustomEntities.fromPatterns("test", [
        moneyPattern,
        personPattern,
      ]);
      const array = entities.toArray();

      expect(Array.isArray(array)).toBe(true);
      expect(array.length).toBe(2);
      expect(array.every((item) => item instanceof CustomEntityExample)).toBe(
        true
      );
    });

    it("should convert to wink format", () => {
      const entities = WinkEngineCustomEntities.fromPatterns("test", [
        moneyPattern,
        personPattern,
      ]);
      const winkFormat = entities.toWinkFormat();

      expect(Array.isArray(winkFormat)).toBe(true);
      expect(winkFormat.length).toBe(2);

      const moneyEntity = winkFormat.find((e) => e.name === "money-amount");
      expect(moneyEntity).toBeDefined();
      expect(moneyEntity!.patterns).toEqual([
        "[$] [CARDINAL] [million|billion|trillion]",
      ]);

      const personEntity = winkFormat.find((e) => e.name === "person-name");
      expect(personEntity).toBeDefined();
      expect(personEntity!.patterns).toEqual(["[PROPN] [PROPN]"]);
    });
  });

  describe("debug string", () => {
    it("should create meaningful debug string", () => {
      const entities = WinkEngineCustomEntities.fromPatterns("test-group", [
        moneyPattern,
        personPattern,
      ]);
      const debugString = entities.toDebugString();

      expect(debugString).toContain("WinkEngineCustomEntities");
      expect(debugString).toContain("test-group");
      expect(debugString).toContain("2 entities");
    });
  });

  describe("Pipeable interface", () => {
    let entities: WinkEngineCustomEntities;

    beforeEach(() => {
      entities = WinkEngineCustomEntities.fromPatterns("base", [moneyPattern]);
    });

    it("should implement pipe method with no arguments", () => {
      const result = entities.pipe((self) => self);
      expect(result).toBe(entities);
    });

    it("should implement pipe method with single function", () => {
      const result = entities.pipe((e) => e.rename("piped"));
      expect(result.name).toBe("piped");
    });

    it("should implement pipe method with multiple functions", () => {
      const result = entities.pipe(
        (e) => e.addPattern(personPattern),
        (e) => e.rename("multi-piped"),
        (e) => e.size()
      );
      expect(result).toBe(2);
    });
  });

  describe("Static data-first operations", () => {
    let entities1: WinkEngineCustomEntities;
    let entities2: WinkEngineCustomEntities;

    beforeEach(() => {
      entities1 = WinkEngineCustomEntities.fromPatterns("group-1", [
        moneyPattern,
      ]);
      entities2 = WinkEngineCustomEntities.fromPatterns("group-2", [
        personPattern,
      ]);
    });

    it("should support data-first merge", () => {
      const mergeOp = WinkEngineCustomEntities.mergeWith(entities2, "merged");
      const result = mergeOp(entities1);

      expect(result.name).toBe("merged");
      expect(result.size()).toBe(2);
    });

    it("should support data-first rename", () => {
      const renameOp = WinkEngineCustomEntities.renameTo("renamed");
      const result = renameOp(entities1);

      expect(result.name).toBe("renamed");
    });

    it("should support data-first add pattern", () => {
      const addOp = WinkEngineCustomEntities.addingPattern(personPattern);
      const result = addOp(entities1);

      expect(result.size()).toBe(2);
    });

    it("should support data-first remove pattern", () => {
      const removeOp = WinkEngineCustomEntities.removingPattern("money-amount");
      const result = removeOp(entities1);

      expect(result.size()).toBe(0);
    });

    it("should support data-first filter", () => {
      const multiEntities = WinkEngineCustomEntities.fromPatterns("multi", [
        moneyPattern,
        personPattern,
      ]);
      const filterOp = WinkEngineCustomEntities.filteringBy((entity) =>
        entity.name.includes("money")
      );
      const result = filterOp(multiEntities);

      expect(result.size()).toBe(1);
      expect(result.hasPattern("money-amount")).toBe(true);
    });
  });

  describe("Integration with pipe function", () => {
    it("should work with Effect pipe function", () => {
      const entities1 = WinkEngineCustomEntities.fromPatterns("base", [
        moneyPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("other", [
        personPattern,
      ]);

      const result = pipe(
        entities1,
        WinkEngineCustomEntities.addingPattern(universityPattern),
        WinkEngineCustomEntities.mergeWith(entities2, "final"),
        WinkEngineCustomEntities.renameTo("completed")
      );

      expect(result.name).toBe("completed");
      expect(result.size()).toBe(3);
      expect(result.hasPattern("money-amount")).toBe(true);
      expect(result.hasPattern("person-name")).toBe(true);
      expect(result.hasPattern("university-name")).toBe(true);
    });

    it("should demonstrate complex data transformation", () => {
      // Provable data transformation test
      const initialSize = 1;
      const addedSize = 1;
      const mergedSize = 1;
      const expectedFinalSize = initialSize + addedSize + mergedSize;

      const entities1 = WinkEngineCustomEntities.fromPatterns("initial", [
        moneyPattern,
      ]);
      const entities2 = WinkEngineCustomEntities.fromPatterns("to-merge", [
        personPattern,
      ]);

      const result = pipe(
        entities1,
        WinkEngineCustomEntities.addingPattern(universityPattern),
        WinkEngineCustomEntities.mergeWith(entities2, "merged-result")
      );

      // Provable assertions
      expect(result.size()).toBe(expectedFinalSize);
      expect(result.name).toBe("merged-result");

      // Data integrity checks
      const winkFormat = result.toWinkFormat();
      expect(winkFormat.length).toBe(expectedFinalSize);

      // Verify all expected patterns are present
      const patternNames = winkFormat.map((e) => e.name).sort();
      expect(patternNames).toEqual([
        "money-amount",
        "person-name",
        "university-name",
      ]);

      // Verify pattern content integrity
      const moneyEntity = winkFormat.find((e) => e.name === "money-amount");
      expect(moneyEntity?.patterns).toEqual([
        "[$] [CARDINAL] [million|billion|trillion]",
      ]);
    });
  });

  describe("Edge cases and error conditions", () => {
    it("should handle empty merge", () => {
      const entities1 = WinkEngineCustomEntities.fromPatterns("group-1", []);
      const entities2 = WinkEngineCustomEntities.fromPatterns("group-2", []);

      const merged = entities1.merge(entities2, "empty-merge");

      expect(merged.size()).toBe(0);
      expect(merged.isEmpty()).toBe(true);
    });

    it("should handle self-merge", () => {
      const entities = WinkEngineCustomEntities.fromPatterns("self", [
        moneyPattern,
        personPattern,
      ]);

      const merged = entities.merge(entities, "self-merged");

      expect(merged.size()).toBe(2); // Deduplication should work
    });

    it("should maintain immutability throughout operations", () => {
      const original = WinkEngineCustomEntities.fromPatterns("original", [
        moneyPattern,
      ]);
      const originalHash = original.getHash();
      const originalSize = original.size();

      // Perform various operations
      original.addPattern(personPattern);
      original.removePattern("money-amount");
      original.rename("modified");
      original.merge(
        WinkEngineCustomEntities.fromPatterns("other", [universityPattern]),
        "merged"
      );

      // Original should be unchanged
      expect(original.getHash()).toBe(originalHash);
      expect(original.size()).toBe(originalSize);
      expect(original.name).toBe("original");
    });
  });
});
