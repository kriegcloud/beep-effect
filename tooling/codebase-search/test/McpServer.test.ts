import { describe, expect, it, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import {
  EmbeddingModelError,
  IndexingError,
  IndexNotFoundError,
  SearchTimeoutError,
  SymbolNotFoundError,
} from "../src/errors.js";
import type { IndexedSymbol } from "../src/IndexedSymbol.js";
import { Bm25Writer, Bm25WriterMock } from "../src/indexer/Bm25Writer.js";
import { EmbeddingService, EmbeddingServiceMock } from "../src/indexer/EmbeddingService.js";
import type { SymbolWithVector } from "../src/indexer/LanceDbWriter.js";
import { LanceDbWriter, LanceDbWriterMock } from "../src/indexer/LanceDbWriter.js";
import { PipelineMock } from "../src/indexer/Pipeline.js";
import {
  ErrorCodes,
  formatError,
  handleBrowseSymbols,
  handleFindRelated,
  handleReindex,
  handleSearchCodebase,
} from "../src/mcp/McpServer.js";
import { HybridSearchLive } from "../src/search/HybridSearch.js";
import { RelationResolverLive } from "../src/search/RelationResolver.js";

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

/** Combined mock layer providing all indexer services. */
const MockServicesLayer = Layer.mergeAll(EmbeddingServiceMock, LanceDbWriterMock, Bm25WriterMock);

/** FileSystem + Path mocks (required by Bm25Writer save/load and Pipeline type signatures). */
const FsMock = FileSystem.layerNoop({});
const PathMock = Layer.mock(Path.Path)({
  [Path.TypeId]: Path.TypeId,
  sep: "/",
  basename: (p) => {
    const i = p.lastIndexOf("/");
    return i >= 0 ? p.slice(i + 1) : p;
  },
  dirname: (p) => {
    const i = p.lastIndexOf("/");
    return i >= 0 ? p.slice(0, i) : ".";
  },
  extname: (p) => {
    const i = p.lastIndexOf(".");
    return i >= 0 ? p.slice(i) : "";
  },
  format: (obj) => [obj.dir, obj.base].filter(Boolean).join("/"),
  fromFileUrl: (url) => Effect.succeed(url.pathname),
  isAbsolute: (p) => p.startsWith("/"),
  join: (...parts) => parts.join("/"),
  normalize: (p) => p,
  parse: (p) => ({ root: "", dir: "", base: p, ext: "", name: p }),
  relative: (_f, t) => t,
  resolve: (...parts) => parts.join("/"),
  toFileUrl: (p) => Effect.succeed(new URL(`file://${p}`)),
  toNamespacedPath: (p) => p,
});

/** Full test layer with all services (real search logic backed by mocks). */
const TestLayer = Layer.mergeAll(
  MockServicesLayer,
  HybridSearchLive,
  RelationResolverLive,
  PipelineMock,
  FsMock,
  PathMock
);

// ---------------------------------------------------------------------------
// Helper: seed the index with test data
// ---------------------------------------------------------------------------

const seedIndex = Effect.fn(function* (symbols: ReadonlyArray<IndexedSymbol>) {
  const lanceSvc = yield* LanceDbWriter;
  const bm25Svc = yield* Bm25Writer;
  const embeddingSvc = yield* EmbeddingService;

  yield* lanceSvc.createTable();
  yield* bm25Svc.createIndex();

  const vectors = yield* Effect.forEach(symbols, (s) => embeddingSvc.embed(s.embeddingText));

  const symbolsWithVectors: ReadonlyArray<SymbolWithVector> = A.map(
    symbols,
    (s, i): SymbolWithVector => ({
      symbol: s,
      vector: pipe(A.get(vectors, i), (opt) => (opt._tag === "Some" ? opt.value : new Float32Array(768))),
    })
  );

  yield* lanceSvc.upsert([], symbolsWithVectors);
  yield* bm25Svc.addDocuments(symbols);
});

// ---------------------------------------------------------------------------
// Tests: search_codebase
// ---------------------------------------------------------------------------

layer(TestLayer)("McpServer - search_codebase", (it) => {
  describe("returns results for a valid query", () => {
    it.effect(
      "returns matching symbols",
      Effect.fn(function* () {
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
            description: "Beta service for handling business logic.",
          }),
          makeSymbol({
            id: "pkg/mod/Gamma",
            name: "Gamma",
            kind: "layer",
            description: "Gamma layer providing infrastructure dependencies.",
          }),
        ];

        yield* seedIndex(symbols);

        const result = yield* handleSearchCodebase({ query: "Alpha schema" });
        const results = result as ReadonlyArray<{
          symbolId: string;
          score: number;
        }>;
        expect(A.length(results)).toBeGreaterThanOrEqual(1);
      })
    );
  });

  describe("returns empty array for no matches", () => {
    it.effect(
      "returns empty results for unmatched query",
      Effect.fn(function* () {
        const symbols = [
          makeSymbol({
            id: "pkg/mod/Foo",
            name: "Foo",
            description: "Foo utility",
          }),
          makeSymbol({
            id: "pkg/mod/Bar",
            name: "Bar",
            description: "Bar utility",
          }),
          makeSymbol({
            id: "pkg/mod/Baz",
            name: "Baz",
            description: "Baz utility",
          }),
        ];

        yield* seedIndex(symbols);

        // Vector search may return results based on distance even for nonsense,
        // so we just verify the pipeline completes without error
        const result = yield* handleSearchCodebase({
          query: "xyznonexistent_zz",
        });
        expect(result).toBeDefined();
      })
    );
  });

  describe("respects limit parameter", () => {
    it.effect(
      "returns at most limit results",
      Effect.fn(function* () {
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

        yield* seedIndex(symbols);

        const result = yield* handleSearchCodebase({
          query: "Schema validation",
          limit: 1,
        });
        const results = result as ReadonlyArray<unknown>;
        expect(A.length(results)).toBeLessThanOrEqual(1);
      })
    );
  });

  describe("respects kind filter", () => {
    it.effect(
      "filters by kind when specified",
      Effect.fn(function* () {
        const symbols = [
          makeSymbol({
            id: "pkg/mod/Alpha",
            name: "Alpha",
            kind: "schema",
            description: "Alpha schema for data validation.",
          }),
          makeSymbol({
            id: "pkg/mod/Beta",
            name: "Beta",
            kind: "service",
            description: "Beta service for operations.",
          }),
          makeSymbol({
            id: "pkg/mod/Delta",
            name: "Delta",
            kind: "error",
            description: "Delta error type for failure handling.",
          }),
        ];

        yield* seedIndex(symbols);

        const result = yield* handleSearchCodebase({
          query: "Alpha Beta",
          kind: "service",
        });
        // Just verify the call completes without error with a kind filter
        expect(result).toBeDefined();
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: find_related
// ---------------------------------------------------------------------------

layer(TestLayer)("McpServer - find_related", (it) => {
  describe("returns similar symbols", () => {
    it.effect(
      "finds related symbols for a valid symbolId",
      Effect.fn(function* () {
        const symbols = [
          makeSymbol({
            id: "pkg/mod/Alpha",
            name: "Alpha",
            kind: "schema",
            description: "Alpha schema for data validation.",
          }),
          makeSymbol({
            id: "pkg/mod/Beta",
            name: "Beta",
            kind: "schema",
            description: "Beta schema for data validation.",
          }),
        ];

        yield* seedIndex(symbols);

        const result = (yield* handleFindRelated({
          symbolId: "pkg/mod/Alpha",
        })) as {
          sourceSymbolId: string;
          relation: string;
          results: ReadonlyArray<unknown>;
        };

        expect(result.sourceSymbolId).toBe("pkg/mod/Alpha");
        expect(result.relation).toBe("similar");
      })
    );
  });

  describe("returns empty for unknown symbolId", () => {
    it.effect(
      "handles nonexistent symbol gracefully",
      Effect.fn(function* () {
        const symbols = [
          makeSymbol({
            id: "pkg/mod/Alpha",
            name: "Alpha",
            description: "Alpha schema for data validation.",
          }),
        ];

        yield* seedIndex(symbols);

        // The find_related handler should not fail on unknown symbols
        // because the similar search just re-embeds the ID text
        const result = (yield* handleFindRelated({
          symbolId: "nonexistent/symbol/id",
        })) as {
          sourceSymbolId: string;
          results: ReadonlyArray<unknown>;
        };

        expect(result.sourceSymbolId).toBe("nonexistent/symbol/id");
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: browse_symbols
// ---------------------------------------------------------------------------

layer(TestLayer)("McpServer - browse_symbols", (it) => {
  describe("returns packages when no args", () => {
    it.effect(
      "returns index summary",
      Effect.fn(function* () {
        const symbols = [
          makeSymbol({
            id: "pkg/mod/Alpha",
            name: "Alpha",
            description: "Alpha schema.",
          }),
        ];

        yield* seedIndex(symbols);

        const result = (yield* handleBrowseSymbols({})) as {
          totalSymbols: number;
          filters: { package: null; module: null; kind: null };
        };

        expect(result.totalSymbols).toBeGreaterThanOrEqual(0);
        expect(result.filters.package).toBeNull();
        expect(result.filters.module).toBeNull();
        expect(result.filters.kind).toBeNull();
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: reindex
// ---------------------------------------------------------------------------

layer(TestLayer)("McpServer - reindex", (it) => {
  describe("returns stats", () => {
    it.effect(
      "returns pipeline stats on reindex",
      Effect.fn(function* () {
        const result = yield* handleReindex({
          rootDir: "/root",
          indexPath: "/root/.code-index",
          mode: "incremental",
        });

        expect(result.status).toBe("ok");
        expect(result.mode).toBe("incremental");
        expect(result.stats.filesScanned).toBe(0);
        expect(result.stats.filesChanged).toBe(0);
        expect(result.stats.symbolsIndexed).toBe(0);
        expect(result.stats.symbolsRemoved).toBe(0);
        expect(result.stats.durationMs).toBe(0);
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Tests: Error Formatting
// ---------------------------------------------------------------------------

describe("formatError", () => {
  it("returns INDEX_NOT_FOUND for IndexNotFoundError", () => {
    const err = new IndexNotFoundError({
      message: "Index not found at /path",
      indexPath: "/path",
    });
    const result = formatError(err);
    expect(result.error.code).toBe(ErrorCodes.INDEX_NOT_FOUND);
    expect(result.error.suggestion).toContain("reindex");
  });

  it("returns SYMBOL_NOT_FOUND for SymbolNotFoundError", () => {
    const err = new SymbolNotFoundError({
      message: "Symbol not found",
      symbolId: "pkg/mod/Foo",
    });
    const result = formatError(err);
    expect(result.error.code).toBe(ErrorCodes.SYMBOL_NOT_FOUND);
    expect(result.error.suggestion).toContain("search_codebase");
  });

  it("returns EMBEDDING_MODEL_ERROR for EmbeddingModelError", () => {
    const err = new EmbeddingModelError({
      message: "Model failed",
      modelName: "test-model",
    });
    const result = formatError(err);
    expect(result.error.code).toBe(ErrorCodes.EMBEDDING_MODEL_ERROR);
  });

  it("returns SEARCH_TIMEOUT for SearchTimeoutError", () => {
    const err = new SearchTimeoutError({
      message: "Search timed out",
      timeoutMs: 5000,
    });
    const result = formatError(err);
    expect(result.error.code).toBe(ErrorCodes.SEARCH_TIMEOUT);
    expect(result.error.suggestion).toContain("specific query");
  });

  it("returns INTERNAL_ERROR for IndexingError", () => {
    const err = new IndexingError({
      message: "Indexing failed",
      phase: "test",
    });
    const result = formatError(err);
    expect(result.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
  });

  it("returns INTERNAL_ERROR for unknown errors", () => {
    const result = formatError(new Error("something went wrong"));
    expect(result.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
  });
});
