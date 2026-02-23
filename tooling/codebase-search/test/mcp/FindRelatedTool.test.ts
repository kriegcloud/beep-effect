import type { IndexedSymbol, SymbolWithVector } from "@beep/codebase-search";
import {
  EmbeddingService,
  EmbeddingServiceMock,
  handleFindRelated,
  LanceDbWriter,
  LanceDbWriterMock,
  RelationResolverLive,
} from "@beep/codebase-search";
import { SymbolNotFoundError } from "@beep/codebase-search/errors";
import { expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
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

const BaseLayer = Layer.mergeAll(EmbeddingServiceMock, LanceDbWriterMock);
const TestLayer = Layer.mergeAll(BaseLayer, RelationResolverLive.pipe(Layer.provide(BaseLayer)));

const seedIndex = Effect.fn(function* () {
  const lance = yield* LanceDbWriter;
  const embedding = yield* EmbeddingService;

  const symbols = [
    makeSymbol({
      id: "@beep/pkg/mod/LayerA",
      name: "LayerA",
      kind: "layer",
      provides: ["ServiceX"],
      dependsOn: ["ServiceY"],
      imports: ["@beep/pkg/mod/ServiceY"],
    }),
    makeSymbol({
      id: "@beep/pkg/mod/ServiceX",
      name: "ServiceX",
      kind: "service",
    }),
    makeSymbol({
      id: "@beep/pkg/mod/ServiceY",
      name: "ServiceY",
      kind: "service",
    }),
  ];

  yield* lance.createTable();
  const vectors = yield* Effect.forEach(symbols, (symbol) => embedding.embed(symbol.embeddingText));
  const symbolVectors: ReadonlyArray<SymbolWithVector> = A.map(
    symbols,
    (symbol, index): SymbolWithVector => ({
      symbol,
      vector: vectors[index] ?? new Float32Array(768),
    })
  );
  yield* lance.upsert([], symbolVectors);
});

layer(TestLayer)("FindRelatedTool", (it) => {
  it.effect(
    "returns relationship payloads for imports/provides/depends",
    Effect.fn(function* () {
      yield* seedIndex();

      const imports = yield* handleFindRelated({
        symbolId: "@beep/pkg/mod/LayerA",
        relation: "imports",
      });
      expect(imports.related.map((item) => item.id)).toContain("@beep/pkg/mod/ServiceY");

      const provides = yield* handleFindRelated({
        symbolId: "@beep/pkg/mod/LayerA",
        relation: "provides",
      });
      expect(provides.related.map((item) => item.id)).toContain("@beep/pkg/mod/ServiceX");

      const depends = yield* handleFindRelated({
        symbolId: "@beep/pkg/mod/LayerA",
        relation: "depends-on",
      });
      expect(depends.related.map((item) => item.id)).toContain("@beep/pkg/mod/ServiceY");
    })
  );

  it.effect(
    "fails with SymbolNotFoundError for unknown IDs",
    Effect.fn(function* () {
      const error = yield* handleFindRelated({
        symbolId: "@beep/pkg/mod/Unknown",
        relation: "imports",
      }).pipe(Effect.flip);
      expect(error).toBeInstanceOf(SymbolNotFoundError);
    })
  );
});
