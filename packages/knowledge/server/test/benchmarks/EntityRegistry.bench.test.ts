import { BloomFilter, BloomFilterLive } from "@beep/knowledge-server/EntityResolution/BloomFilter";
import { normalizeText } from "@beep/knowledge-server/EntityResolution/EntityRegistry";
import { assertTrue, describe, live } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Num from "effect/Number";

const measureMs: <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<number, E, R> = Effect.fn(function* <
  A,
  E,
  R,
>(effect: Effect.Effect<A, E, R>) {
  const start = yield* Effect.clockWith((clock) => clock.currentTimeMillis);
  yield* effect;
  const end = yield* Effect.clockWith((clock) => clock.currentTimeMillis);
  return end - start;
});

const generateEntityNames = (n: number): ReadonlyArray<string> => {
  const patterns = [
    (i: number) => `Entity Corp ${i}`,
    (i: number) => `Company ${i} Inc.`,
    (i: number) => `${i} Solutions LLC`,
    (i: number) => `John Doe ${i}`,
    (i: number) => `New York City ${i}`,
    (i: number) => `Organization Alpha ${i}`,
    (i: number) => `Beta Industries ${i}`,
    (i: number) => `Gamma Holdings ${i}`,
    (i: number) => `Delta Systems ${i}`,
    (i: number) => `Epsilon Group ${i}`,
  ];

  return A.makeBy(n, (i) => {
    const patternIndex = i % A.length(patterns);
    const pattern = patterns[patternIndex];
    return pattern !== undefined ? pattern(i) : `Entity ${i}`;
  });
};

const generateRandomStrings = (n: number, seed: number): ReadonlyArray<string> =>
  A.makeBy(n, (i) => `random_unknown_${seed}_${i}_${(seed * 1000 + i) % 10000}`);

describe("EntityRegistry Performance Benchmarks", () => {
  describe("Bloom Filter Pruning Effectiveness", () => {
    live(
      "bloom filter pruning >90% for unknown texts",
      Effect.fn(function* () {
        const filter = yield* BloomFilter;
        yield* filter.clear();

        const knownTexts = generateEntityNames(1000);
        yield* filter.bulkAdd(knownTexts);

        const unknownTexts = generateRandomStrings(100, 1);

        const containsResults = yield* Effect.forEach(unknownTexts, (text) => filter.contains(text));
        const falsePositives = A.length(A.filter(containsResults, (exists) => exists));

        const pruningRate = (100 - falsePositives) / 100;

        yield* Effect.logInfo("Bloom filter pruning test").pipe(
          Effect.annotateLogs({
            knownItems: 1000,
            testedUnknowns: 100,
            falsePositives,
            pruningRate: `${(pruningRate * 100).toFixed(1)}%`,
            target: ">90%",
          })
        );

        assertTrue(pruningRate > 0.9, `Target >90%, got ${(pruningRate * 100).toFixed(1)}%`);
      }, Effect.provide(BloomFilterLive))
    );

    live(
      "bloom filter pruning >90% with 10K entities",
      Effect.fn(function* () {
        const filter = yield* BloomFilter;
        yield* filter.clear();

        const knownTexts = generateEntityNames(10000);
        yield* filter.bulkAdd(knownTexts);

        const unknownTexts = generateRandomStrings(500, 2);

        const containsResults = yield* Effect.forEach(unknownTexts, (text) => filter.contains(text));
        const falsePositives = A.length(A.filter(containsResults, (exists) => exists));

        const pruningRate = (500 - falsePositives) / 500;
        const stats = yield* filter.getStats();

        yield* Effect.logInfo("Bloom filter pruning at scale").pipe(
          Effect.annotateLogs({
            knownItems: 10000,
            testedUnknowns: 500,
            falsePositives,
            pruningRate: `${(pruningRate * 100).toFixed(1)}%`,
            filterFillRatio: `${(stats.fillRatio * 100).toFixed(2)}%`,
            estimatedFalsePositiveRate: `${(stats.estimatedFalsePositiveRate * 100).toFixed(3)}%`,
            target: ">90%",
          })
        );

        assertTrue(pruningRate > 0.9, `Target >90%, got ${(pruningRate * 100).toFixed(1)}%`);
      }, Effect.provide(BloomFilterLive))
    );

    live(
      "zero false negatives - all known items found",
      Effect.fn(function* () {
        const filter = yield* BloomFilter;
        yield* filter.clear();

        const knownTexts = generateEntityNames(1000);
        yield* filter.bulkAdd(knownTexts);

        const results = yield* Effect.forEach(knownTexts, (text) => filter.contains(text));
        const allFound = A.every(results, (exists) => exists);

        yield* Effect.logInfo("Bloom filter false negative test").pipe(
          Effect.annotateLogs({
            itemsAdded: 1000,
            itemsFound: A.length(A.filter(results, (r) => r)),
            allFound,
          })
        );

        assertTrue(allFound, "Bloom filter produced false negatives - this is a bug");
      }, Effect.provide(BloomFilterLive))
    );
  });

  describe("Bloom Filter Timing", () => {
    live(
      "bulkAdd 10K items in under 100ms",
      Effect.fn(function* () {
        const filter = yield* BloomFilter;
        yield* filter.clear();

        const items = generateEntityNames(10000);

        const duration = yield* measureMs(filter.bulkAdd(items));

        yield* Effect.logInfo("Bulk add 10K items").pipe(
          Effect.annotateLogs({
            durationMs: duration,
            itemCount: 10000,
            threshold: 100,
            throughput: `${Num.round(10000 / (duration / 1000))} items/sec`,
          })
        );

        assertTrue(duration < 100, `Expected <100ms, got ${duration}ms`);
      }, Effect.provide(BloomFilterLive))
    );

    live(
      "contains lookup under 1ms average",
      Effect.fn(function* () {
        const filter = yield* BloomFilter;
        yield* filter.clear();

        const items = generateEntityNames(10000);
        yield* filter.bulkAdd(items);

        const lookupItems = A.take(items, 1000);
        const duration = yield* measureMs(Effect.forEach(lookupItems, (item) => filter.contains(item)));

        const avgPerLookup = duration / 1000;

        yield* Effect.logInfo("Contains lookup timing").pipe(
          Effect.annotateLogs({
            totalDurationMs: duration,
            lookupCount: 1000,
            avgPerLookupMs: avgPerLookup.toFixed(3),
            threshold: "<1ms average",
          })
        );

        assertTrue(avgPerLookup < 1, `Expected <1ms average, got ${avgPerLookup.toFixed(3)}ms`);
      }, Effect.provide(BloomFilterLive))
    );
  });

  describe("Text Normalization Performance", () => {
    live(
      "normalize 10K texts in under 50ms",
      Effect.fn(function* () {
        const texts = generateEntityNames(10000);

        const start = yield* Effect.clockWith((c) => c.currentTimeMillis);

        void A.map(texts, normalizeText);

        const end = yield* Effect.clockWith((c) => c.currentTimeMillis);
        const duration = end - start;

        yield* Effect.logInfo("Text normalization timing").pipe(
          Effect.annotateLogs({
            durationMs: duration,
            textCount: 10000,
            threshold: 50,
            throughput: `${Num.round(10000 / (duration / 1000))} texts/sec`,
          })
        );

        assertTrue(duration < 50, `Expected <50ms, got ${duration}ms`);
      })
    );
  });

  describe("Memory Efficiency", () => {
    live(
      "bloom filter memory usage under 200KB for 10K items",
      Effect.fn(function* () {
        const filter = yield* BloomFilter;
        yield* filter.clear();

        const items = generateEntityNames(10000);
        yield* filter.bulkAdd(items);

        const stats = yield* filter.getStats();
        const memoryKB = stats.memoryBytes / 1024;

        yield* Effect.logInfo("Bloom filter memory usage").pipe(
          Effect.annotateLogs({
            memoryBytes: stats.memoryBytes,
            memoryKB: memoryKB.toFixed(2),
            itemCount: stats.itemCount,
            bytesPerItem: (stats.memoryBytes / stats.itemCount).toFixed(2),
            threshold: "200KB",
          })
        );

        assertTrue(memoryKB < 200, `Expected <200KB, got ${memoryKB.toFixed(2)}KB`);
      }, Effect.provide(BloomFilterLive))
    );

    live(
      "bloom filter saturation acceptable at 10K items",
      Effect.fn(function* () {
        const filter = yield* BloomFilter;
        yield* filter.clear();

        const items = generateEntityNames(10000);
        yield* filter.bulkAdd(items);

        const stats = yield* filter.getStats();

        yield* Effect.logInfo("Bloom filter saturation").pipe(
          Effect.annotateLogs({
            fillRatio: `${(stats.fillRatio * 100).toFixed(2)}%`,
            setBitCount: stats.setBitCount,
            bitArraySize: stats.bitArraySize,
            estimatedFalsePositiveRate: `${(stats.estimatedFalsePositiveRate * 100).toFixed(4)}%`,
            threshold: "<10% fill ratio for optimal performance",
          })
        );

        assertTrue(stats.fillRatio < 0.1, `Expected <10% fill ratio, got ${(stats.fillRatio * 100).toFixed(2)}%`);
      }, Effect.provide(BloomFilterLive))
    );
  });

  describe("Candidate Search Timing Baseline", () => {
    live(
      "documents timing pattern for findCandidates integration",
      Effect.fn(function* () {
        const start = yield* Effect.clockWith((c) => c.currentTimeMillis);

        const text = "Microsoft Corporation";
        void normalizeText(text);

        const filter = yield* BloomFilter;
        yield* filter.clear();
        yield* filter.bulkAdd(generateEntityNames(10000));
        void (yield* filter.contains(text));

        const end = yield* Effect.clockWith((c) => c.currentTimeMillis);
        const elapsed = end - start;

        yield* Effect.logInfo("Candidate search timing baseline").pipe(
          Effect.annotateLogs({
            elapsedMs: elapsed,
            stages: {
              normalization: "<1ms",
              bloomFilter: "<1ms",
              databaseSearch: "<50ms (requires integration layer)",
              embeddingSimilarity: "<50ms for 50 candidates (requires integration layer)",
            },
            overallTarget: "<100ms for 10K entities",
            note: "Full benchmark requires database and embedding integration layer",
          })
        );

        assertTrue(elapsed < 100, `Expected quick baseline, got ${elapsed}ms`);
      }, Effect.provide(BloomFilterLive))
    );
  });

  describe("Stress Tests", () => {
    live(
      "bloom filter handles 100K items",
      Effect.fn(function* () {
        const filter = yield* BloomFilter;
        yield* filter.clear();

        const items = A.makeBy(100000, (i) => `entity-${i}`);

        const duration = yield* measureMs(filter.bulkAdd(items));
        const stats = yield* filter.getStats();

        yield* Effect.logInfo("Bloom filter 100K items stress test").pipe(
          Effect.annotateLogs({
            durationMs: duration,
            itemCount: 100000,
            fillRatio: `${(stats.fillRatio * 100).toFixed(2)}%`,
            estimatedFalsePositiveRate: `${(stats.estimatedFalsePositiveRate * 100).toFixed(2)}%`,
            memoryKB: (stats.memoryBytes / 1024).toFixed(2),
          })
        );

        assertTrue(duration < 1000, `Expected <1000ms, got ${duration}ms`);
        assertTrue(
          stats.estimatedFalsePositiveRate < 0.05,
          `Expected <5% false positive rate at 100K items, got ${(stats.estimatedFalsePositiveRate * 100).toFixed(2)}%`
        );
      }, Effect.provide(BloomFilterLive))
    );

    live(
      "repeated lookups remain fast under load",
      Effect.fn(function* () {
        const filter = yield* BloomFilter;
        yield* filter.clear();

        const items = A.makeBy(50000, (i) => `entity-${i}`);
        yield* filter.bulkAdd(items);

        const lookupItems = A.take(items, 10000);
        const duration = yield* measureMs(Effect.forEach(lookupItems, (item) => filter.contains(item)));

        const avgPerLookup = duration / 10000;

        yield* Effect.logInfo("High-volume lookup stress test").pipe(
          Effect.annotateLogs({
            totalDurationMs: duration,
            lookupCount: 10000,
            avgPerLookupMs: avgPerLookup.toFixed(4),
            itemsInFilter: 50000,
          })
        );

        assertTrue(avgPerLookup < 0.1, `Expected <0.1ms average, got ${avgPerLookup.toFixed(4)}ms`);
      }, Effect.provide(BloomFilterLive))
    );
  });
});
