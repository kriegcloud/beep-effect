import type { IndexedSymbol } from "@beep/codebase-search";
import { Bm25Writer, Bm25WriterMock, type Bm25WriterShape } from "@beep/codebase-search";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as A from "effect/Array";

// ---------------------------------------------------------------------------
// FileSystem + Path mocks (needed because Bm25WriterShape.save/load declare
// FileSystem | Path in their Effect requirements even though the mock is a no-op)
// ---------------------------------------------------------------------------

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
const TestLayer = Layer.mergeAll(Bm25WriterMock, FsMock, PathMock);

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

/** Helper to add the minimum 3 documents required by wink-bm25 for consolidation. */
const addMinDocuments = (svc: Bm25WriterShape) =>
  svc.addDocuments([
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

layer(TestLayer)("Bm25Writer (Mock)", (it) => {
  describe("createIndex", () => {
    it.effect(
      "succeeds without errors",
      Effect.fn(function* () {
        const svc = yield* Bm25Writer;
        yield* svc.createIndex();
      })
    );
  });

  describe("addDocuments + search", () => {
    it.effect(
      "returns matching results for keyword query",
      Effect.fn(function* () {
        const svc = yield* Bm25Writer;
        yield* svc.createIndex();
        yield* addMinDocuments(svc);

        const results = yield* svc.search("PackageName", 10);
        expect(A.length(results)).toBeGreaterThanOrEqual(1);
        // The PackageName symbol should be in results
        const ids = A.map(results, (r) => r.symbolId);
        expect(ids).toContain("pkg/mod/PackageName");
      })
    );

    it.effect(
      "matches camelCase-split tokens",
      Effect.fn(function* () {
        const svc = yield* Bm25Writer;
        yield* svc.createIndex();
        yield* addMinDocuments(svc);

        // "file" should match because FileSystem gets split into File System
        const results = yield* svc.search("file", 10);
        expect(A.length(results)).toBeGreaterThanOrEqual(1);
        const ids = A.map(results, (r) => r.symbolId);
        expect(ids).toContain("pkg/mod/FileSystem");
      })
    );

    it.effect(
      "scores are positive numbers",
      Effect.fn(function* () {
        const svc = yield* Bm25Writer;
        yield* svc.createIndex();
        yield* addMinDocuments(svc);

        const results = yield* svc.search("schema", 10);
        expect(A.length(results)).toBeGreaterThanOrEqual(1);
        for (const result of results) {
          expect(result.score).toBeGreaterThan(0);
        }
      })
    );
  });

  describe("removeBySymbolIds", () => {
    it.effect(
      "removes documents so they no longer appear in search",
      Effect.fn(function* () {
        const svc = yield* Bm25Writer;
        yield* svc.createIndex();

        yield* svc.addDocuments([
          makeSymbol({ id: "pkg/mod/Alpha", name: "Alpha" }),
          makeSymbol({ id: "pkg/mod/Beta", name: "Beta" }),
          makeSymbol({ id: "pkg/mod/Gamma", name: "Gamma" }),
          makeSymbol({ id: "pkg/mod/Delta", name: "Delta" }),
        ]);

        yield* svc.removeBySymbolIds(["pkg/mod/Alpha"]);

        // Search for Alpha - it may still match in the engine, but
        // the mapping will filter it out
        const results = yield* svc.search("Alpha", 10);
        const ids = A.map(results, (r) => r.symbolId);
        expect(ids).not.toContain("pkg/mod/Alpha");
      })
    );
  });

  describe("listSymbolIds", () => {
    it.effect(
      "returns currently indexed symbol IDs",
      Effect.fn(function* () {
        const svc = yield* Bm25Writer;
        yield* svc.createIndex();
        yield* addMinDocuments(svc);

        const ids = yield* svc.listSymbolIds();
        expect(ids).toContain("pkg/mod/PackageName");
        expect(ids).toContain("pkg/mod/FileSystem");
        expect(ids).toContain("pkg/mod/IndexingError");
      })
    );
  });

  describe("empty search", () => {
    it.effect(
      "returns empty array for query with no matches",
      Effect.fn(function* () {
        const svc = yield* Bm25Writer;
        yield* svc.createIndex();
        yield* addMinDocuments(svc);

        const results = yield* svc.search("xyznonexistent", 10);
        expect(A.length(results)).toBe(0);
      })
    );
  });

  describe("save and load", () => {
    it.effect(
      "mock save and load are no-ops",
      Effect.fn(function* () {
        const svc = yield* Bm25Writer;
        yield* svc.createIndex();
        yield* addMinDocuments(svc);

        // Mock save/load should succeed as no-ops
        yield* svc.save();
        yield* svc.load();
      })
    );
  });
});
