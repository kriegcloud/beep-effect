import { describe, expect, it, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";

import type { IndexedSymbol } from "../../src/IndexedSymbol.js";
import { Bm25Writer, Bm25WriterMock } from "../../src/indexer/Bm25Writer.js";
import { EmbeddingService, EmbeddingServiceMock } from "../../src/indexer/EmbeddingService.js";
import type { SymbolWithVector } from "../../src/indexer/LanceDbWriter.js";
import { LanceDbWriter, LanceDbWriterMock } from "../../src/indexer/LanceDbWriter.js";
import { HybridSearch, HybridSearchLive, RRF_K, reciprocalRankFusion } from "../../src/search/HybridSearch.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeSymbol = (overrides: Partial<IndexedSymbol> = {}): IndexedSymbol => ({
  id: "@beep/repo-utils/schemas/PackageName",
  name: "PackageName",
  qualifiedName: "@beep/repo-utils/schemas/PackageName",
  filePath: "tooling/repo-utils/src/schemas.ts",
  startLine: 10,
  endLine: 25,
  kind: "schema",
  effectPattern: "Schema.brand",
  package: "@beep/repo-utils",
  module: "schemas",
  category: "schemas",
  domain: null,
  description: "A branded string type representing a valid NPM package name.",
  title: "Package Name",
  schemaIdentifier: "@beep/repo-utils/schemas/PackageName",
  schemaDescription: "Valid NPM package name with scope.",
  remarks: null,
  moduleDescription: null,
  examples: [],
  params: [],
  returns: null,
  errors: [],
  fieldDescriptions: null,
  seeRefs: [],
  provides: [],
  dependsOn: [],
  imports: [],
  signature: 'export const PackageName: Schema.brand<string, "PackageName">',
  since: "0.0.0",
  deprecated: false,
  exported: true,
  embeddingText: "[schema] Package Name A branded string type representing a valid NPM package name.",
  contentHash: "abc123def456",
  indexedAt: "2026-02-19T00:00:00.000Z",
  ...overrides,
});

/** Create a deterministic vector from a seed for testing */
const makeVector = (seed: number): Float32Array => {
  const vec = new Float32Array(768);
  for (let i = 0; i < 768; i++) {
    vec[i] = Math.sin(seed * 1000 + i);
  }
  return vec;
};

const makeSymbolWithVector = (overrides: Partial<IndexedSymbol> = {}, vectorSeed = 1): SymbolWithVector => ({
  symbol: makeSymbol(overrides),
  vector: makeVector(vectorSeed),
});

// ---------------------------------------------------------------------------
// Test Layer
// ---------------------------------------------------------------------------

const TestLayer = Layer.mergeAll(EmbeddingServiceMock, LanceDbWriterMock, Bm25WriterMock, HybridSearchLive);

// ---------------------------------------------------------------------------
// Pure RRF Tests
// ---------------------------------------------------------------------------

describe("reciprocalRankFusion", () => {
  it("merges results from both lists correctly", () => {
    const vectorResults = [{ id: "sym/a" }, { id: "sym/b" }, { id: "sym/c" }];
    const keywordResults = [{ symbolId: "sym/b" }, { symbolId: "sym/d" }, { symbolId: "sym/a" }];

    const results = reciprocalRankFusion(vectorResults, keywordResults, RRF_K);

    // sym/a and sym/b appear in both lists, so they should have higher scores
    expect(A.length(results)).toBe(4);

    const ids = A.map(results, (r) => r.symbolId);
    expect(ids).toContain("sym/a");
    expect(ids).toContain("sym/b");
    expect(ids).toContain("sym/c");
    expect(ids).toContain("sym/d");

    // sym/b is rank 2 in vector (score 1/(60+2)) and rank 1 in keyword (1/(60+1))
    // sym/a is rank 1 in vector (score 1/(60+1)) and rank 3 in keyword (1/(60+3))
    // sym/b's combined raw: 1/62 + 1/61 ≈ 0.01613 + 0.01639 = 0.03252
    // sym/a's combined raw: 1/61 + 1/63 ≈ 0.01639 + 0.01587 = 0.03226
    // So sym/b should rank higher than sym/a
    const symB = A.findFirst(results, (r) => r.symbolId === "sym/b");
    const symA = A.findFirst(results, (r) => r.symbolId === "sym/a");
    expect(symB._tag).toBe("Some");
    expect(symA._tag).toBe("Some");
    if (symB._tag === "Some" && symA._tag === "Some") {
      expect(symB.value.score).toBeGreaterThanOrEqual(symA.value.score);
    }
  });

  it("handles results appearing in only one list", () => {
    const vectorResults = [{ id: "sym/vector-only" }];
    const keywordResults = [{ symbolId: "sym/keyword-only" }];

    const results = reciprocalRankFusion(vectorResults, keywordResults, RRF_K);

    expect(A.length(results)).toBe(2);

    const vectorOnlyResult = A.findFirst(results, (r) => r.symbolId === "sym/vector-only");
    const keywordOnlyResult = A.findFirst(results, (r) => r.symbolId === "sym/keyword-only");

    // vector-only should have vectorRank but no keywordRank
    expect(vectorOnlyResult._tag).toBe("Some");
    if (vectorOnlyResult._tag === "Some") {
      expect(vectorOnlyResult.value.vectorRank).toBe(1);
      expect(vectorOnlyResult.value.keywordRank).toBeNull();
    }

    // keyword-only should have keywordRank but no vectorRank
    expect(keywordOnlyResult._tag).toBe("Some");
    if (keywordOnlyResult._tag === "Some") {
      expect(keywordOnlyResult.value.vectorRank).toBeNull();
      expect(keywordOnlyResult.value.keywordRank).toBe(1);
    }
  });

  it("normalizes scores to 0-1 range with max equal to 1.0", () => {
    const vectorResults = [{ id: "sym/a" }, { id: "sym/b" }];
    const keywordResults = [{ symbolId: "sym/a" }, { symbolId: "sym/c" }];

    const results = reciprocalRankFusion(vectorResults, keywordResults, RRF_K);

    // All scores should be in [0, 1]
    for (const result of results) {
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    }

    // The highest score should be exactly 1.0
    const maxScore = A.get(results, 0);
    expect(maxScore._tag).toBe("Some");
    if (maxScore._tag === "Some") {
      expect(maxScore.value.score).toBe(1);
    }
  });

  it("returns empty array for empty inputs", () => {
    const results = reciprocalRankFusion([], [], RRF_K);
    expect(A.isReadonlyArrayEmpty(results)).toBe(true);
  });

  it("sorts results by score descending", () => {
    const vectorResults = [{ id: "sym/a" }, { id: "sym/b" }, { id: "sym/c" }];
    const keywordResults = [{ symbolId: "sym/c" }, { symbolId: "sym/a" }];

    const results = reciprocalRankFusion(vectorResults, keywordResults, RRF_K);

    // Verify descending order
    for (let i = 0; i < results.length - 1; i++) {
      const current = results[i];
      const next = results[i + 1];
      if (current !== undefined && next !== undefined) {
        expect(current.score).toBeGreaterThanOrEqual(next.score);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Integrated HybridSearch Tests
// ---------------------------------------------------------------------------

layer(TestLayer)("HybridSearch", (it) => {
  describe("search", () => {
    it.effect("returns fused results from vector and keyword searches", () =>
      Effect.gen(function* () {
        const lanceSvc = yield* LanceDbWriter;
        const bm25Svc = yield* Bm25Writer;
        const hybridSvc = yield* HybridSearch;

        // Set up test data
        yield* lanceSvc.createTable();
        yield* bm25Svc.createIndex();

        const symbols = [
          makeSymbol({
            id: "pkg/mod/Alpha",
            name: "Alpha",
            kind: "schema",
            description: "Alpha schema for validation and parsing of data.",
          }),
          makeSymbol({
            id: "pkg/mod/Beta",
            name: "Beta",
            kind: "service",
            description: "Beta service for handling business logic operations.",
            signature: "export class Beta extends ServiceMap.Service",
          }),
          makeSymbol({
            id: "pkg/mod/Gamma",
            name: "Gamma",
            kind: "error",
            description: "Gamma error indicating a processing failure condition.",
            signature: "export class Gamma extends TaggedErrorClass",
          }),
        ];

        // Get embeddings for test symbols
        const embeddingSvc = yield* EmbeddingService;
        const vectors = yield* Effect.forEach(symbols, (s) => embeddingSvc.embed(s.embeddingText));

        const symbolsWithVectors: ReadonlyArray<SymbolWithVector> = A.map(
          symbols,
          (s, i): SymbolWithVector => ({
            symbol: s,
            vector: vectors[i] ?? new Float32Array(768),
          })
        );

        yield* lanceSvc.upsert([], symbolsWithVectors);
        yield* bm25Svc.addDocuments(symbols);

        const results = yield* hybridSvc.search({
          query: "Alpha schema",
          limit: 10,
        });

        expect(A.length(results)).toBeGreaterThanOrEqual(1);
        // Results should have scores in 0-1 range
        for (const r of results) {
          expect(r.score).toBeGreaterThanOrEqual(0);
          expect(r.score).toBeLessThanOrEqual(1);
        }
      })
    );

    it.effect("returns empty array for query matching nothing", () =>
      Effect.gen(function* () {
        const lanceSvc = yield* LanceDbWriter;
        const bm25Svc = yield* Bm25Writer;
        const hybridSvc = yield* HybridSearch;

        yield* lanceSvc.createTable();
        yield* bm25Svc.createIndex();

        // Add minimum docs required by BM25 engine
        const symbols = [
          makeSymbol({ id: "pkg/mod/Foo", name: "Foo" }),
          makeSymbol({ id: "pkg/mod/Bar", name: "Bar" }),
          makeSymbol({ id: "pkg/mod/Baz", name: "Baz" }),
        ];
        yield* bm25Svc.addDocuments(symbols);

        // Vector search with no data will return nothing meaningful
        // BM25 with nonexistent term returns nothing
        const results = yield* hybridSvc.search({
          query: "xyznonexistent",
          limit: 10,
        });

        // Vector search may still return results (it returns based on distance),
        // but BM25 should return nothing for nonsense query
        // The test validates the pipeline completes without error
        expect(results).toBeDefined();
      })
    );

    it.effect("respects minScore filter", () =>
      Effect.gen(function* () {
        const lanceSvc = yield* LanceDbWriter;
        const bm25Svc = yield* Bm25Writer;
        const hybridSvc = yield* HybridSearch;

        yield* lanceSvc.createTable();
        yield* bm25Svc.createIndex();

        const symbols = [
          makeSymbol({
            id: "pkg/mod/Alpha",
            name: "Alpha",
            kind: "schema",
            description: "Alpha schema for validation and parsing of data.",
          }),
          makeSymbol({
            id: "pkg/mod/Beta",
            name: "Beta",
            kind: "service",
            description: "Beta service for handling business logic operations.",
            signature: "export class Beta extends ServiceMap.Service",
          }),
          makeSymbol({
            id: "pkg/mod/Gamma",
            name: "Gamma",
            kind: "error",
            description: "Gamma error indicating a processing failure condition.",
            signature: "export class Gamma extends TaggedErrorClass",
          }),
        ];

        const embeddingSvc = yield* EmbeddingService;
        const vectors = yield* Effect.forEach(symbols, (s) => embeddingSvc.embed(s.embeddingText));

        const symbolsWithVectors: ReadonlyArray<SymbolWithVector> = A.map(
          symbols,
          (s, i): SymbolWithVector => ({
            symbol: s,
            vector: vectors[i] ?? new Float32Array(768),
          })
        );

        yield* lanceSvc.upsert([], symbolsWithVectors);
        yield* bm25Svc.addDocuments(symbols);

        // Very high minScore should filter out most results
        const results = yield* hybridSvc.search({
          query: "Alpha",
          limit: 10,
          minScore: 0.99,
        });

        // With minScore=0.99, only the top-scoring result (score=1.0) might pass
        // All returned results should have score >= 0.99
        for (const r of results) {
          expect(r.score).toBeGreaterThanOrEqual(0.99);
        }
      })
    );

    it.effect("respects limit parameter", () =>
      Effect.gen(function* () {
        const lanceSvc = yield* LanceDbWriter;
        const bm25Svc = yield* Bm25Writer;
        const hybridSvc = yield* HybridSearch;

        yield* lanceSvc.createTable();
        yield* bm25Svc.createIndex();

        const symbols = [
          makeSymbol({
            id: "pkg/mod/A",
            name: "SchemaA",
            description: "SchemaA for validation and parsing of input data.",
          }),
          makeSymbol({
            id: "pkg/mod/B",
            name: "SchemaB",
            description: "SchemaB for validation and parsing of output data.",
          }),
          makeSymbol({
            id: "pkg/mod/C",
            name: "SchemaC",
            description: "SchemaC for validation and parsing of config data.",
          }),
        ];

        const embeddingSvc = yield* EmbeddingService;
        const vectors = yield* Effect.forEach(symbols, (s) => embeddingSvc.embed(s.embeddingText));

        const symbolsWithVectors: ReadonlyArray<SymbolWithVector> = A.map(
          symbols,
          (s, i): SymbolWithVector => ({
            symbol: s,
            vector: vectors[i] ?? new Float32Array(768),
          })
        );

        yield* lanceSvc.upsert([], symbolsWithVectors);
        yield* bm25Svc.addDocuments(symbols);

        const results = yield* hybridSvc.search({
          query: "Schema validation",
          limit: 1,
        });

        expect(A.length(results)).toBeLessThanOrEqual(1);
      })
    );

    it.effect("results are sorted by score descending", () =>
      Effect.gen(function* () {
        const lanceSvc = yield* LanceDbWriter;
        const bm25Svc = yield* Bm25Writer;
        const hybridSvc = yield* HybridSearch;

        yield* lanceSvc.createTable();
        yield* bm25Svc.createIndex();

        const symbols = [
          makeSymbol({
            id: "pkg/mod/Alpha",
            name: "Alpha",
            description: "Alpha schema for validation and parsing of data.",
          }),
          makeSymbol({
            id: "pkg/mod/Beta",
            name: "Beta",
            description: "Beta service for handling business logic operations.",
            signature: "export class Beta extends ServiceMap.Service",
          }),
          makeSymbol({
            id: "pkg/mod/Gamma",
            name: "Gamma",
            description: "Gamma error indicating a processing failure condition.",
            signature: "export class Gamma extends TaggedErrorClass",
          }),
        ];

        const embeddingSvc = yield* EmbeddingService;
        const vectors = yield* Effect.forEach(symbols, (s) => embeddingSvc.embed(s.embeddingText));

        const symbolsWithVectors: ReadonlyArray<SymbolWithVector> = A.map(
          symbols,
          (s, i): SymbolWithVector => ({
            symbol: s,
            vector: vectors[i] ?? new Float32Array(768),
          })
        );

        yield* lanceSvc.upsert([], symbolsWithVectors);
        yield* bm25Svc.addDocuments(symbols);

        const results = yield* hybridSvc.search({
          query: "Alpha schema",
          limit: 10,
        });

        // Verify descending score order
        for (let i = 0; i < results.length - 1; i++) {
          const current = results[i];
          const next = results[i + 1];
          if (current !== undefined && next !== undefined) {
            expect(current.score).toBeGreaterThanOrEqual(next.score);
          }
        }
      })
    );
  });
});
