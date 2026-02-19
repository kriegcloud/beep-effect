import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";

import type { IndexedSymbol } from "../../src/IndexedSymbol.js";
import { EmbeddingService, EmbeddingServiceMock } from "../../src/indexer/EmbeddingService.js";
import type { SymbolWithVector } from "../../src/indexer/LanceDbWriter.js";
import { LanceDbWriter, LanceDbWriterMock } from "../../src/indexer/LanceDbWriter.js";
import { RelationResolver, RelationResolverLive } from "../../src/search/RelationResolver.js";

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

const TestLayer = Layer.mergeAll(EmbeddingServiceMock, LanceDbWriterMock, RelationResolverLive);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

layer(TestLayer)("RelationResolver", (it) => {
  describe("similar relation", () => {
    it.effect("returns vector search results excluding the source symbol", Effect.fn(function* () {
        const lanceSvc = yield* LanceDbWriter;
        const embeddingSvc = yield* EmbeddingService;
        const resolverSvc = yield* RelationResolver;

        yield* lanceSvc.createTable();

        // Create multiple symbols with different embeddings
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
          }),
          makeSymbol({
            id: "pkg/mod/Gamma",
            name: "Gamma",
            kind: "error",
            description: "Gamma error indicating a processing failure condition.",
          }),
        ];

        // Get embeddings for each symbol
        const vectors = yield* Effect.forEach(symbols, (s) => embeddingSvc.embed(s.embeddingText));

        const symbolsWithVectors: ReadonlyArray<SymbolWithVector> = A.map(
          symbols,
          (s, i): SymbolWithVector => ({
            symbol: s,
            vector: vectors[i] ?? new Float32Array(768),
          })
        );

        yield* lanceSvc.upsert([], symbolsWithVectors);

        const results = yield* resolverSvc.resolve({
          symbolId: "pkg/mod/Alpha",
          relation: "similar",
          limit: 5,
        });

        // Results should not include the source symbol
        const ids = A.map(results, (r) => r.id);
        expect(ids).not.toContain("pkg/mod/Alpha");

        // Should return other symbols
        expect(A.length(results)).toBeGreaterThanOrEqual(1);

        // Each result should have a relationDetail string
        for (const r of results) {
          expect(r.relationDetail).toContain("Similar symbol");
        }
      })
    );

    it.effect("respects the limit parameter", Effect.fn(function* () {
        const lanceSvc = yield* LanceDbWriter;
        const embeddingSvc = yield* EmbeddingService;
        const resolverSvc = yield* RelationResolver;

        yield* lanceSvc.createTable();

        // Create many symbols
        const symbols = A.map(
          ["A", "B", "C", "D", "E"],
          (name): IndexedSymbol =>
            makeSymbol({
              id: `pkg/mod/${name}`,
              name,
              description: `Symbol ${name} for testing relation resolver limits.`,
            })
        );

        const vectors = yield* Effect.forEach(symbols, (s) => embeddingSvc.embed(s.embeddingText));

        const symbolsWithVectors: ReadonlyArray<SymbolWithVector> = A.map(
          symbols,
          (s, i): SymbolWithVector => ({
            symbol: s,
            vector: vectors[i] ?? new Float32Array(768),
          })
        );

        yield* lanceSvc.upsert([], symbolsWithVectors);

        const results = yield* resolverSvc.resolve({
          symbolId: "pkg/mod/A",
          relation: "similar",
          limit: 2,
        });

        expect(A.length(results)).toBeLessThanOrEqual(2);
      })
    );
  });

  describe("same-module relation (stubbed)", () => {
    it.effect("returns empty array for now", Effect.fn(function* () {
        const resolverSvc = yield* RelationResolver;

        const results = yield* resolverSvc.resolve({
          symbolId: "pkg/mod/Alpha",
          relation: "same-module",
          limit: 10,
        });

        expect(A.isReadonlyArrayEmpty(results)).toBe(true);
      })
    );
  });

  describe("imports relation (stubbed)", () => {
    it.effect("returns empty array for now", Effect.fn(function* () {
        const resolverSvc = yield* RelationResolver;

        const results = yield* resolverSvc.resolve({
          symbolId: "pkg/mod/Alpha",
          relation: "imports",
          limit: 10,
        });

        expect(A.isReadonlyArrayEmpty(results)).toBe(true);
      })
    );
  });

  describe("imported-by relation (stubbed)", () => {
    it.effect("returns empty array for now", Effect.fn(function* () {
        const resolverSvc = yield* RelationResolver;

        const results = yield* resolverSvc.resolve({
          symbolId: "pkg/mod/Alpha",
          relation: "imported-by",
          limit: 10,
        });

        expect(A.isReadonlyArrayEmpty(results)).toBe(true);
      })
    );
  });

  describe("provides relation (stubbed)", () => {
    it.effect("returns empty array for now", Effect.fn(function* () {
        const resolverSvc = yield* RelationResolver;

        const results = yield* resolverSvc.resolve({
          symbolId: "pkg/mod/Alpha",
          relation: "provides",
          limit: 10,
        });

        expect(A.isReadonlyArrayEmpty(results)).toBe(true);
      })
    );
  });

  describe("depends-on relation (stubbed)", () => {
    it.effect("returns empty array for now", Effect.fn(function* () {
        const resolverSvc = yield* RelationResolver;

        const results = yield* resolverSvc.resolve({
          symbolId: "pkg/mod/Alpha",
          relation: "depends-on",
          limit: 10,
        });

        expect(A.isReadonlyArrayEmpty(results)).toBe(true);
      })
    );
  });
});
