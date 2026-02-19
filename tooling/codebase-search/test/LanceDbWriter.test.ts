import { describe, expect, layer } from "@effect/vitest";
import { Effect } from "effect";
import * as A from "effect/Array";

import type { IndexedSymbol } from "../src/IndexedSymbol.js";
import type { SymbolWithVector } from "../src/indexer/LanceDbWriter.js";
import { LanceDbWriter, LanceDbWriterMock } from "../src/indexer/LanceDbWriter.js";

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
// Tests
// ---------------------------------------------------------------------------

layer(LanceDbWriterMock)("LanceDbWriter (Mock)", (it) => {
  describe("createTable", () => {
    it.effect(
      "succeeds and resets state",
      Effect.fn(function* () {
        const svc = yield* LanceDbWriter;
        yield* svc.createTable();
        const count = yield* svc.countRows();
        expect(count).toBe(0);
      })
    );
  });

  describe("upsert", () => {
    it.effect(
      "adds symbols that can be found via vectorSearch",
      Effect.fn(function* () {
        const svc = yield* LanceDbWriter;
        yield* svc.createTable();

        const swv = makeSymbolWithVector({}, 42);
        yield* svc.upsert([], [swv]);

        const results = yield* svc.vectorSearch(makeVector(42), { limit: 10 });
        expect(A.length(results)).toBeGreaterThanOrEqual(1);
        expect(results[0]?.id).toBe(swv.symbol.id);
      })
    );

    it.effect(
      "deletes old rows for modified files before inserting",
      Effect.fn(function* () {
        const svc = yield* LanceDbWriter;
        yield* svc.createTable();

        // Insert initial symbol
        const initial = makeSymbolWithVector({ id: "old/symbol", filePath: "src/foo.ts" }, 1);
        yield* svc.upsert([], [initial]);
        expect(yield* svc.countRows()).toBe(1);

        // Upsert: delete old file, insert new symbol for same file
        const updated = makeSymbolWithVector({ id: "new/symbol", filePath: "src/foo.ts" }, 2);
        yield* svc.upsert(["src/foo.ts"], [updated]);

        const count = yield* svc.countRows();
        expect(count).toBe(1);

        const results = yield* svc.vectorSearch(makeVector(2), { limit: 10 });
        expect(results[0]?.id).toBe("new/symbol");
      })
    );
  });

  describe("deleteByFiles", () => {
    it.effect(
      "removes rows for specified files",
      Effect.fn(function* () {
        const svc = yield* LanceDbWriter;
        yield* svc.createTable();

        yield* svc.upsert(
          [],
          [
            makeSymbolWithVector({ id: "a/1", filePath: "src/a.ts" }, 1),
            makeSymbolWithVector({ id: "b/1", filePath: "src/b.ts" }, 2),
          ]
        );
        expect(yield* svc.countRows()).toBe(2);

        yield* svc.deleteByFiles(["src/a.ts"]);
        expect(yield* svc.countRows()).toBe(1);
      })
    );
  });

  describe("vectorSearch", () => {
    it.effect(
      "returns results sorted by similarity",
      Effect.fn(function* () {
        const svc = yield* LanceDbWriter;
        yield* svc.createTable();

        // Insert symbols with different vectors
        yield* svc.upsert(
          [],
          [makeSymbolWithVector({ id: "sym/close" }, 10), makeSymbolWithVector({ id: "sym/far" }, 99)]
        );

        // Search with a vector close to seed 10
        const results = yield* svc.vectorSearch(makeVector(10), { limit: 10 });
        expect(A.length(results)).toBe(2);
        // First result should be the closest match
        expect(results[0]?.id).toBe("sym/close");
        // Scores should be descending
        expect((results[0]?.score ?? 0) >= (results[1]?.score ?? 0)).toBe(true);
      })
    );

    it.effect(
      "filters by kind",
      Effect.fn(function* () {
        const svc = yield* LanceDbWriter;
        yield* svc.createTable();

        yield* svc.upsert(
          [],
          [
            makeSymbolWithVector({ id: "sym/schema", kind: "schema" }, 1),
            makeSymbolWithVector({ id: "sym/service", kind: "service" }, 2),
          ]
        );

        const results = yield* svc.vectorSearch(makeVector(1), {
          limit: 10,
          kind: "schema",
        });
        expect(A.length(results)).toBe(1);
        expect(results[0]?.id).toBe("sym/schema");
      })
    );

    it.effect(
      "filters by package",
      Effect.fn(function* () {
        const svc = yield* LanceDbWriter;
        yield* svc.createTable();

        yield* svc.upsert(
          [],
          [
            makeSymbolWithVector({ id: "sym/utils", package: "@beep/repo-utils" }, 1),
            makeSymbolWithVector({ id: "sym/cli", package: "@beep/cli" }, 2),
          ]
        );

        const results = yield* svc.vectorSearch(makeVector(1), {
          limit: 10,
          package: "@beep/cli",
        });
        expect(A.length(results)).toBe(1);
        expect(results[0]?.id).toBe("sym/cli");
      })
    );
  });

  describe("countRows", () => {
    it.effect(
      "returns correct count",
      Effect.fn(function* () {
        const svc = yield* LanceDbWriter;
        yield* svc.createTable();

        expect(yield* svc.countRows()).toBe(0);

        yield* svc.upsert(
          [],
          [
            makeSymbolWithVector({ id: "a/1" }, 1),
            makeSymbolWithVector({ id: "b/1" }, 2),
            makeSymbolWithVector({ id: "c/1" }, 3),
          ]
        );

        expect(yield* svc.countRows()).toBe(3);
      })
    );
  });
});
