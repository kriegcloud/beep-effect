import { expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import type { IndexedSymbol } from "../../src/IndexedSymbol.js";
import { Bm25Writer, Bm25WriterMock } from "../../src/indexer/Bm25Writer.js";
import { EmbeddingService, EmbeddingServiceMock } from "../../src/indexer/EmbeddingService.js";
import type { SymbolWithVector } from "../../src/indexer/LanceDbWriter.js";
import { LanceDbWriter, LanceDbWriterMock } from "../../src/indexer/LanceDbWriter.js";
import { handleSearchCodebase } from "../../src/mcp/SearchCodebaseTool.js";
import { HybridSearchLive } from "../../src/search/HybridSearch.js";

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
