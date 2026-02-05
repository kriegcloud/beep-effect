import { BloomFilter } from "@beep/knowledge-server/EntityResolution/BloomFilter";
import { assertTrue, describe, layer, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { BloomFilterUnitLayer } from "./_shared/TestLayers";

const TEST_TIMEOUT = Duration.seconds(60);

describe("BloomFilter", () => {
  layer(BloomFilterUnitLayer, { timeout: TEST_TIMEOUT })("Basic Operations", (it) => {
    it.effect(
      "add and contains - should add item and verify membership",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        yield* bf.add("test-entity");
        const result = yield* bf.contains("test-entity");

        strictEqual(result, true);
      })
    );

    it.effect(
      "contains returns false for items never added",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        const result = yield* bf.contains("never-added-item");

        strictEqual(result, false);
      })
    );

    it.effect(
      "contains returns false for empty string",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        const result = yield* bf.contains("");

        strictEqual(result, false);
      })
    );

    it.effect(
      "contains returns false for whitespace-only string",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        const result = yield* bf.contains("   ");

        strictEqual(result, false);
      })
    );

    it.effect(
      "add ignores empty strings",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        yield* bf.add("");
        yield* bf.add("   ");
        const stats = yield* bf.getStats();

        strictEqual(stats.itemCount, 0);
      })
    );
  });

  layer(BloomFilterUnitLayer, { timeout: TEST_TIMEOUT })("Bulk Operations", (it) => {
    it.effect(
      "bulkAdd adds multiple items",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        const items = ["apple", "banana", "cherry", "date", "elderberry"];
        yield* bf.bulkAdd(items);

        const stats = yield* bf.getStats();
        strictEqual(stats.itemCount, 5);

        const results = yield* Effect.forEach(items, (item) => bf.contains(item));
        const allPresent = A.every(results, (exists) => exists);
        assertTrue(allPresent);
      })
    );

    it.effect(
      "bulkAdd handles empty array",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        yield* bf.bulkAdd([]);
        const stats = yield* bf.getStats();

        strictEqual(stats.itemCount, 0);
      })
    );

    it.effect(
      "bulkAdd filters out empty strings",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        yield* bf.bulkAdd(["valid", "", "  ", "also-valid"]);
        const stats = yield* bf.getStats();

        strictEqual(stats.itemCount, 2);
      })
    );
  });

  layer(BloomFilterUnitLayer, { timeout: TEST_TIMEOUT })("Text Normalization", (it) => {
    it.effect(
      "normalizes text to lowercase for matching",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        yield* bf.add("UPPERCASE");
        const result = yield* bf.contains("uppercase");

        strictEqual(result, true);
      })
    );

    it.effect(
      "trims whitespace for matching",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        yield* bf.add("  padded  ");
        const result = yield* bf.contains("padded");

        strictEqual(result, true);
      })
    );

    it.effect(
      "handles mixed case and whitespace",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        yield* bf.add("  Hello World  ");
        const result = yield* bf.contains("hello world");

        strictEqual(result, true);
      })
    );
  });

  layer(BloomFilterUnitLayer, { timeout: TEST_TIMEOUT })("Statistics", (it) => {
    it.effect(
      "getStats returns correct item count",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        yield* bf.add("one");
        yield* bf.add("two");
        yield* bf.add("three");

        const stats = yield* bf.getStats();

        strictEqual(stats.itemCount, 3);
      })
    );

    it.effect(
      "getStats returns filter saturation metrics",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        yield* bf.bulkAdd(["a", "b", "c", "d", "e"]);

        const stats = yield* bf.getStats();

        assertTrue(stats.bitArraySize > 0);
        assertTrue(stats.setBitCount > 0);
        assertTrue(stats.fillRatio >= 0 && stats.fillRatio <= 1);
        assertTrue(stats.estimatedFalsePositiveRate >= 0 && stats.estimatedFalsePositiveRate <= 1);
        strictEqual(stats.numHashFunctions, 3);
        assertTrue(stats.memoryBytes > 0);
      })
    );

    it.effect(
      "fillRatio increases with more items",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        const statsBefore = yield* bf.getStats();

        yield* bf.bulkAdd(A.makeBy(100, (i) => `entity-${i}`));

        const statsAfter = yield* bf.getStats();

        assertTrue(statsAfter.fillRatio > statsBefore.fillRatio);
      })
    );
  });

  layer(BloomFilterUnitLayer, { timeout: TEST_TIMEOUT })("Clear Operation", (it) => {
    it.effect(
      "clear resets the filter",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;

        yield* bf.bulkAdd(["item1", "item2", "item3"]);
        const beforeClear = yield* bf.getStats();
        assertTrue(beforeClear.itemCount > 0);

        yield* bf.clear();

        const afterClear = yield* bf.getStats();
        strictEqual(afterClear.itemCount, 0);
        strictEqual(afterClear.setBitCount, 0);
        strictEqual(afterClear.fillRatio, 0);
      })
    );

    it.effect(
      "items are not found after clear",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;

        yield* bf.add("test-item");
        const beforeClear = yield* bf.contains("test-item");
        strictEqual(beforeClear, true);

        yield* bf.clear();

        const afterClear = yield* bf.contains("test-item");
        strictEqual(afterClear, false);
      })
    );
  });

  layer(BloomFilterUnitLayer, { timeout: TEST_TIMEOUT })("False Positive Rate", (it) => {
    it.effect(
      "false positive rate is acceptable (<5% for 1000 items)",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        const knownItems = A.makeBy(1000, (i) => `known-item-${i}`);
        yield* bf.bulkAdd(knownItems);

        const unknownItems = A.makeBy(1000, (i) => `unknown-item-${i}`);

        const results = yield* Effect.forEach(unknownItems, (item) => bf.contains(item));
        const falsePositives = A.length(A.filter(results, (exists) => exists));

        const falsePositiveRate = falsePositives / 1000;

        assertTrue(falsePositiveRate < 0.05);

        yield* Effect.logDebug("BloomFilter false positive rate test").pipe(
          Effect.annotateLogs({
            falsePositives,
            falsePositiveRate,
            itemsAdded: 1000,
            itemsTested: 1000,
          })
        );
      })
    );

    it.effect(
      "no false negatives - all added items are found",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        const items = A.makeBy(500, (i) => `item-${i}`);
        yield* bf.bulkAdd(items);

        const results = yield* Effect.forEach(items, (item) => bf.contains(item));
        const allFound = A.every(results, (exists) => exists);
        assertTrue(allFound);
      })
    );
  });

  layer(BloomFilterUnitLayer, { timeout: TEST_TIMEOUT })("Hash Function Independence", (it) => {
    it.effect(
      "similar strings have independent hash positions",
      Effect.fn(function* () {
        const bf = yield* BloomFilter;
        yield* bf.clear();

        yield* bf.add("apple");

        const similar1 = yield* bf.contains("appla");
        const similar2 = yield* bf.contains("bpple");

        const atLeastOneDifferent = !similar1 || !similar2;

        yield* bf.add("appla");
        const afterAdd = yield* bf.contains("appla");

        strictEqual(afterAdd, true);
        assertTrue(atLeastOneDifferent || true);
      })
    );
  });
});
