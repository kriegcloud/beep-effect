import type { IndexedSymbol, SymbolWithVector } from "@beep/codebase-search";
import {
  EmbeddingService,
  EmbeddingServiceMock,
  LanceDbWriter,
  LanceDbWriterMock,
  RelationResolver,
  RelationResolverLive,
} from "@beep/codebase-search";
import { SymbolNotFoundError } from "@beep/codebase-search/errors";
import { expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";

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

const MockServicesLayer = Layer.mergeAll(EmbeddingServiceMock, LanceDbWriterMock);
const TestLayer = Layer.mergeAll(MockServicesLayer, RelationResolverLive.pipe(Layer.provide(MockServicesLayer)));

const seedIndex = Effect.fn(function* (symbols: ReadonlyArray<IndexedSymbol>) {
  const lanceSvc = yield* LanceDbWriter;
  const embeddingSvc = yield* EmbeddingService;

  yield* lanceSvc.createTable();

  const vectors = yield* Effect.forEach(symbols, (symbol) => embeddingSvc.embed(symbol.embeddingText));
  const symbolVectors: ReadonlyArray<SymbolWithVector> = A.map(
    symbols,
    (symbol, index): SymbolWithVector => ({
      symbol,
      vector: vectors[index] ?? new Float32Array(768),
    })
  );

  yield* lanceSvc.upsert([], symbolVectors);
});

layer(TestLayer)("RelationResolver", (it) => {
  it.effect(
    "resolves imports and imported-by relations from metadata",
    Effect.fn(function* () {
      const resolver = yield* RelationResolver;

      const symbols = [
        makeSymbol({
          id: "@beep/pkg/mod/A",
          name: "A",
          package: "@beep/pkg",
          module: "mod",
          imports: ["@beep/pkg/mod/B"],
          description: "Symbol A imports B.",
        }),
        makeSymbol({
          id: "@beep/pkg/mod/B",
          name: "B",
          package: "@beep/pkg",
          module: "mod",
          description: "Symbol B.",
        }),
      ];

      yield* seedIndex(symbols);

      const imports = yield* resolver.resolve({
        symbolId: "@beep/pkg/mod/A",
        relation: "imports",
        limit: 5,
      });
      expect(imports.map((result) => result.id)).toContain("@beep/pkg/mod/B");

      const importedBy = yield* resolver.resolve({
        symbolId: "@beep/pkg/mod/B",
        relation: "imported-by",
        limit: 5,
      });
      expect(importedBy.map((result) => result.id)).toContain("@beep/pkg/mod/A");
    })
  );

  it.effect(
    "resolves same-module, provides, and depends-on relations",
    Effect.fn(function* () {
      const resolver = yield* RelationResolver;

      const symbols = [
        makeSymbol({
          id: "@beep/pkg/mod/LayerA",
          name: "LayerA",
          kind: "layer",
          package: "@beep/pkg",
          module: "mod",
          provides: ["ServiceX"],
          dependsOn: ["ServiceY"],
          description: "LayerA provides ServiceX and depends on ServiceY.",
        }),
        makeSymbol({
          id: "@beep/pkg/mod/ServiceX",
          name: "ServiceX",
          kind: "service",
          package: "@beep/pkg",
          module: "mod",
          description: "Service X.",
        }),
        makeSymbol({
          id: "@beep/pkg/mod/ServiceY",
          name: "ServiceY",
          kind: "service",
          package: "@beep/pkg",
          module: "mod",
          description: "Service Y.",
        }),
      ];

      yield* seedIndex(symbols);

      const sameModule = yield* resolver.resolve({
        symbolId: "@beep/pkg/mod/LayerA",
        relation: "same-module",
        limit: 10,
      });
      expect(A.length(sameModule)).toBeGreaterThanOrEqual(2);

      const provides = yield* resolver.resolve({
        symbolId: "@beep/pkg/mod/LayerA",
        relation: "provides",
        limit: 10,
      });
      expect(provides.map((result) => result.id)).toContain("@beep/pkg/mod/ServiceX");

      const depends = yield* resolver.resolve({
        symbolId: "@beep/pkg/mod/LayerA",
        relation: "depends-on",
        limit: 10,
      });
      expect(depends.map((result) => result.id)).toContain("@beep/pkg/mod/ServiceY");
    })
  );

  it.effect(
    "returns similar symbols and excludes source symbol",
    Effect.fn(function* () {
      const resolver = yield* RelationResolver;

      const symbols = [
        makeSymbol({
          id: "@beep/pkg/mod/Alpha",
          name: "Alpha",
          description: "Alpha schema for validation and parsing.",
        }),
        makeSymbol({
          id: "@beep/pkg/mod/Beta",
          name: "Beta",
          description: "Beta schema for validation and parsing.",
        }),
      ];

      yield* seedIndex(symbols);

      const similar = yield* resolver.resolve({
        symbolId: "@beep/pkg/mod/Alpha",
        relation: "similar",
        limit: 5,
      });

      expect(similar.map((result) => result.id)).not.toContain("@beep/pkg/mod/Alpha");
      expect(A.length(similar)).toBeGreaterThanOrEqual(1);
    })
  );

  it.effect(
    "fails with SymbolNotFoundError for unknown symbol IDs",
    Effect.fn(function* () {
      const resolver = yield* RelationResolver;
      const error = yield* resolver
        .resolve({
          symbolId: "@beep/pkg/mod/Unknown",
          relation: "imports",
          limit: 5,
        })
        .pipe(Effect.flip);
      expect(error).toBeInstanceOf(SymbolNotFoundError);
    })
  );
});
