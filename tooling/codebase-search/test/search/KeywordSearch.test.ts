import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";

import type { IndexedSymbol } from "../../src/IndexedSymbol.js";
import { Bm25Writer, Bm25WriterMock } from "../../src/indexer/Bm25Writer.js";
import { KeywordSearch, KeywordSearchLive } from "../../src/search/KeywordSearch.js";

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

// ---------------------------------------------------------------------------
// Test Layer
// ---------------------------------------------------------------------------

const TestLayer = Layer.mergeAll(Bm25WriterMock, KeywordSearchLive);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

layer(TestLayer)("KeywordSearch", (it) => {
  describe("search", () => {
    it.effect("delegates to BM25 and returns matching results", Effect.fn(function* () {
        const bm25Svc = yield* Bm25Writer;
        const keywordSvc = yield* KeywordSearch;

        yield* bm25Svc.createIndex();
        yield* bm25Svc.addDocuments([
          makeSymbol({
            id: "pkg/mod/PackageName",
            name: "PackageName",
            kind: "schema",
          }),
          makeSymbol({
            id: "pkg/mod/FileSystem",
            name: "FileSystem",
            kind: "service",
            signature: "export class FileSystem extends ServiceMap.Service",
          }),
          makeSymbol({
            id: "pkg/mod/IndexingError",
            name: "IndexingError",
            kind: "error",
            signature: "export class IndexingError extends TaggedErrorClass",
          }),
        ]);

        const results = yield* keywordSvc.search({
          query: "PackageName",
          limit: 10,
        });

        expect(A.length(results)).toBeGreaterThanOrEqual(1);
        const ids = A.map(results, (r) => r.symbolId);
        expect(ids).toContain("pkg/mod/PackageName");

        // All results should have positive scores
        for (const r of results) {
          expect(r.score).toBeGreaterThan(0);
        }
      })
    );

    it.effect("minScore filter removes low-scoring results", Effect.fn(function* () {
        const bm25Svc = yield* Bm25Writer;
        const keywordSvc = yield* KeywordSearch;

        yield* bm25Svc.createIndex();
        yield* bm25Svc.addDocuments([
          makeSymbol({
            id: "pkg/mod/Alpha",
            name: "Alpha",
            kind: "schema",
          }),
          makeSymbol({
            id: "pkg/mod/Beta",
            name: "Beta",
            kind: "service",
            signature: "export class Beta extends ServiceMap.Service",
          }),
          makeSymbol({
            id: "pkg/mod/Gamma",
            name: "Gamma",
            kind: "error",
            signature: "export class Gamma extends TaggedErrorClass",
          }),
        ]);

        // Search with a very high minScore that should filter out most results
        const results = yield* keywordSvc.search({
          query: "schema",
          limit: 10,
          minScore: 999,
        });

        // BM25 scores are typically small, so a minScore of 999 should filter everything
        expect(A.isReadonlyArrayEmpty(results)).toBe(true);
      })
    );

    it.effect("returns empty results for query matching nothing", Effect.fn(function* () {
        const bm25Svc = yield* Bm25Writer;
        const keywordSvc = yield* KeywordSearch;

        yield* bm25Svc.createIndex();
        yield* bm25Svc.addDocuments([
          makeSymbol({ id: "pkg/mod/Alpha", name: "Alpha" }),
          makeSymbol({ id: "pkg/mod/Beta", name: "Beta" }),
          makeSymbol({ id: "pkg/mod/Gamma", name: "Gamma" }),
        ]);

        const results = yield* keywordSvc.search({
          query: "xyznonexistent",
          limit: 10,
        });

        expect(A.isReadonlyArrayEmpty(results)).toBe(true);
      })
    );

    it.effect("respects limit parameter", Effect.fn(function* () {
        const bm25Svc = yield* Bm25Writer;
        const keywordSvc = yield* KeywordSearch;

        yield* bm25Svc.createIndex();
        yield* bm25Svc.addDocuments([
          makeSymbol({
            id: "pkg/mod/SchemaA",
            name: "SchemaA",
            kind: "schema",
          }),
          makeSymbol({
            id: "pkg/mod/SchemaB",
            name: "SchemaB",
            kind: "schema",
          }),
          makeSymbol({
            id: "pkg/mod/SchemaC",
            name: "SchemaC",
            kind: "schema",
          }),
        ]);

        const results = yield* keywordSvc.search({
          query: "schema",
          limit: 1,
        });

        expect(A.length(results)).toBeLessThanOrEqual(1);
      })
    );
  });
});
