import type { IndexedSymbol, SymbolWithVector } from "@beep/codebase-search";
import {
  Bm25Writer,
  Bm25WriterMock,
  EmbeddingService,
  EmbeddingServiceMock,
  HybridSearch,
  HybridSearchLive,
  handleSearchCodebase,
  LanceDbWriter,
  LanceDbWriterMock,
} from "@beep/codebase-search";
import { expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";

const makeSymbol = (overrides: Partial<IndexedSymbol> = {}): IndexedSymbol => ({
  id: "@beep/pkg/mod/Alpha",
  name: "Alpha",
  qualifiedName: "@beep/pkg/mod/Alpha",
  filePath: "tooling/repo-utils/src/mod.ts",
  startLine: 10,
  endLine: 20,
  kind: "schema",
  effectPattern: "Schema.brand",
  package: "@beep/pkg",
  module: "mod",
  category: "schemas",
  domain: null,
  description: "Alpha schema used for validation in tests.",
  title: "Alpha",
  schemaIdentifier: "@beep/pkg/mod/Alpha",
  schemaDescription: "Alpha schema description",
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
  signature: "export const Alpha = Schema.String",
  since: "0.0.0",
  deprecated: false,
  exported: true,
  embeddingText: "[schema] Alpha schema used for validation in tests.",
  contentHash: "abc",
  indexedAt: "2026-02-20T00:00:00.000Z",
  ...overrides,
});

const ServicesLayer = Layer.mergeAll(EmbeddingServiceMock, LanceDbWriterMock, Bm25WriterMock);
const TestLayer = Layer.mergeAll(HybridSearchLive.pipe(Layer.provideMerge(ServicesLayer)), ServicesLayer);

const seedIndex = Effect.fn(function* () {
  const lance = yield* LanceDbWriter;
  const bm25 = yield* Bm25Writer;
  const embedding = yield* EmbeddingService;

  const symbols = [
    makeSymbol({
      id: "@beep/pkg/mod/Alpha",
      name: "Alpha",
      kind: "schema",
      description: "Alpha schema for tests.",
    }),
    makeSymbol({
      id: "@beep/pkg/mod/Beta",
      name: "Beta",
      kind: "service",
      description: "Beta service for tests.",
    }),
    makeSymbol({
      id: "@beep/pkg/mod/Gamma",
      name: "Gamma",
      kind: "function",
      description: "Gamma helper function for tests.",
    }),
  ];

  yield* lance.createTable();
  yield* bm25.createIndex();

  const vectors = yield* Effect.forEach(symbols, (symbol) => embedding.embed(symbol.embeddingText));
  const symbolVectors: ReadonlyArray<SymbolWithVector> = A.map(
    symbols,
    (symbol, index): SymbolWithVector => ({
      symbol,
      vector: vectors[index] ?? new Float32Array(768),
    })
  );

  yield* lance.upsert([], symbolVectors);
  yield* bm25.addDocuments(symbols);
});

layer(TestLayer)("SearchCodebaseTool", (it) => {
  it.effect(
    "returns ranked results with scores and applied filters",
    Effect.fn(function* () {
      yield* seedIndex();

      const result = yield* handleSearchCodebase({
        query: "alpha",
        kind: "schema",
        limit: 5,
      });

      expect(result.searchMode).toBe("hybrid");
      expect(result.filtersApplied.kind).toBe("schema");
      expect(result.totalMatches).toBeGreaterThanOrEqual(1);
      expect(result.results.every((row) => row.kind === "schema")).toBe(true);
      expect(result.results[0]?.score).toBeGreaterThanOrEqual(0);
    })
  );
});

const FilterStressHybridLayer = Layer.mergeAll(
  LanceDbWriterMock,
  Layer.succeed(
    HybridSearch,
    HybridSearch.of({
      search: (config) => {
        const orderedIds = [
          "pkg/mod/Service01",
          "pkg/mod/Service02",
          "pkg/mod/Service03",
          "pkg/mod/Service04",
          "pkg/mod/Service05",
          "pkg/mod/Service06",
          "pkg/mod/Service07",
          "pkg/mod/Service08",
          "pkg/mod/Service09",
          "pkg/mod/Service10",
          "pkg/mod/Schema01",
          "pkg/mod/Schema02",
        ];

        const ranked = A.map(orderedIds, (symbolId, index) => ({
          symbolId,
          score: 1 - index / 100,
          vectorRank: index + 1,
          keywordRank: null,
        }));

        return Effect.succeed(A.take(ranked, config.limit));
      },
    })
  )
);

layer(FilterStressHybridLayer)("SearchCodebaseTool (filter truncation regression)", (it) => {
  it.effect(
    "returns requested filtered results by expanding hybrid candidate window",
    Effect.fn(function* () {
      const lance = yield* LanceDbWriter;
      yield* lance.createTable();

      const makeSymbolWithVector = (symbol: IndexedSymbol): SymbolWithVector => ({
        symbol,
        vector: new Float32Array(768),
      });

      const services: ReadonlyArray<SymbolWithVector> = Array.from({ length: 10 }, (_, i) =>
        makeSymbolWithVector(
          makeSymbol({
            id: `pkg/mod/Service${String(i + 1).padStart(2, "0")}`,
            name: `Service${String(i + 1).padStart(2, "0")}`,
            kind: "service",
            package: "@beep/pkg",
          })
        )
      );

      const schemas = A.make(
        makeSymbolWithVector(
          makeSymbol({
            id: "pkg/mod/Schema01",
            name: "Schema01",
            kind: "schema",
            package: "@beep/pkg",
          })
        ),
        makeSymbolWithVector(
          makeSymbol({
            id: "pkg/mod/Schema02",
            name: "Schema02",
            kind: "schema",
            package: "@beep/pkg",
          })
        )
      );

      yield* lance.upsert([], pipe(services, A.appendAll(schemas)));

      const result = yield* handleSearchCodebase({
        query: "schema",
        kind: "schema",
        limit: 2,
      });

      expect(result.totalMatches).toBe(2);
      expect(result.results.every((row) => row.kind === "schema")).toBe(true);
    })
  );
});
