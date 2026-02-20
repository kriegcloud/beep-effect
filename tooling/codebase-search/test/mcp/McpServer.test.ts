import type { IndexedSymbol, SymbolWithVector } from "@beep/codebase-search";
import {
  Bm25Writer,
  Bm25WriterMock,
  CodebaseSearchToolkit,
  EmbeddingModelError,
  EmbeddingService,
  EmbeddingServiceMock,
  ErrorCodes,
  formatError,
  HybridSearchLive,
  IndexingError,
  IndexNotFoundError,
  LanceDbWriter,
  LanceDbWriterMock,
  makeMcpServerConfigLayer,
  makeToolkitHandlerLayer,
  PipelineMock,
  RelationResolverLive,
  SearchTimeoutError,
  SymbolNotFoundError,
} from "@beep/codebase-search";
import { describe, expect, it, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path, Stream } from "effect";
import * as A from "effect/Array";

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
  description: "Alpha schema used for validation and parsing in tests.",
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
  signature: "export const Alpha = Schema.String.pipe(Schema.brand('Alpha'))",
  since: "0.0.0",
  deprecated: false,
  exported: true,
  embeddingText: "[schema] Alpha schema used for validation and parsing in tests.",
  contentHash: "abc",
  indexedAt: "2026-02-20T00:00:00.000Z",
  ...overrides,
});

const FsMock = FileSystem.layerNoop({});
const PathMock = Layer.mock(Path.Path)({
  [Path.TypeId]: Path.TypeId,
  sep: "/",
  basename: (value) => value.split("/").pop() ?? value,
  dirname: (value) => value.split("/").slice(0, -1).join("/") || ".",
  extname: (value) => {
    const index = value.lastIndexOf(".");
    return index >= 0 ? value.slice(index) : "";
  },
  format: (obj) => [obj.dir, obj.base].filter(Boolean).join("/"),
  fromFileUrl: (url) => Effect.succeed(url.pathname),
  isAbsolute: (value) => value.startsWith("/"),
  join: (...parts) => parts.join("/"),
  normalize: (value) => value,
  parse: (value) => ({ root: "", dir: "", base: value, ext: "", name: value }),
  relative: (_from, to) => to,
  resolve: (...parts) => parts.join("/"),
  toFileUrl: (value) => Effect.succeed(new URL(`file://${value}`)),
  toNamespacedPath: (value) => value,
});

const BaseServices = Layer.mergeAll(EmbeddingServiceMock, LanceDbWriterMock, Bm25WriterMock);
const SearchServices = Layer.mergeAll(HybridSearchLive, RelationResolverLive).pipe(Layer.provideMerge(BaseServices));
const HandlerLayer = makeToolkitHandlerLayer.pipe(
  Layer.provideMerge(makeMcpServerConfigLayer({ rootDir: "/root", indexPath: "/root/.code-index" })),
  Layer.provideMerge(Layer.mergeAll(SearchServices, PipelineMock, FsMock, PathMock))
);

const seedIndex = Effect.fn(function* () {
  const lance = yield* LanceDbWriter;
  const bm25 = yield* Bm25Writer;
  const embedding = yield* EmbeddingService;

  const symbols = [
    makeSymbol({
      id: "@beep/pkg/mod/Alpha",
      name: "Alpha",
      description: "Alpha schema for tests.",
    }),
    makeSymbol({
      id: "@beep/pkg/mod/Beta",
      name: "Beta",
      kind: "service",
      description: "Beta service for tests.",
      imports: ["@beep/pkg/mod/Alpha"],
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

layer(HandlerLayer)("McpServer", (it) => {
  it.effect(
    "toolkit handles all four tools",
    Effect.fn(function* () {
      yield* seedIndex();

      const toolkit = yield* CodebaseSearchToolkit;

      const searchStream = yield* toolkit.handle("search_codebase", { query: "alpha", limit: 1 });
      const browseStream = yield* toolkit.handle("browse_symbols", {});
      const relatedStream = yield* toolkit.handle("find_related", {
        symbolId: "@beep/pkg/mod/Beta",
        relation: "imports",
      });
      const reindexStream = yield* toolkit.handle("reindex", { mode: "full" });

      expect(yield* Stream.runCollect(searchStream)).toBeDefined();
      expect(yield* Stream.runCollect(browseStream)).toBeDefined();
      expect(yield* Stream.runCollect(relatedStream)).toBeDefined();
      expect(yield* Stream.runCollect(reindexStream)).toBeDefined();
    })
  );
});

describe("formatError", () => {
  it("maps IndexNotFoundError", () => {
    const error = new IndexNotFoundError({ message: "Missing", indexPath: ".code-index" });
    expect(formatError(error).error.code).toBe(ErrorCodes.INDEX_NOT_FOUND);
  });

  it("maps SymbolNotFoundError", () => {
    const error = new SymbolNotFoundError({ message: "Missing symbol", symbolId: "pkg/mod/Foo" });
    expect(formatError(error).error.code).toBe(ErrorCodes.SYMBOL_NOT_FOUND);
  });

  it("maps EmbeddingModelError", () => {
    const error = new EmbeddingModelError({
      message: "Model error",
      modelName: "nomic-ai/nomic-embed-text-v1.5",
    });
    expect(formatError(error).error.code).toBe(ErrorCodes.EMBEDDING_MODEL_ERROR);
  });

  it("maps SearchTimeoutError", () => {
    const error = new SearchTimeoutError({ message: "Timed out", timeoutMs: 5000 });
    expect(formatError(error).error.code).toBe(ErrorCodes.SEARCH_TIMEOUT);
  });

  it("maps IndexingError", () => {
    const error = new IndexingError({ message: "Indexing error", phase: "test" });
    expect(formatError(error).error.code).toBe(ErrorCodes.INTERNAL_ERROR);
  });
});
