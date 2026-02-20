import { expect, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import type { IndexedSymbol } from "../../src/IndexedSymbol.js";
import { EmbeddingService, EmbeddingServiceMock } from "../../src/indexer/EmbeddingService.js";
import type { SymbolWithVector } from "../../src/indexer/LanceDbWriter.js";
import { LanceDbWriter, LanceDbWriterMock } from "../../src/indexer/LanceDbWriter.js";
import { handleBrowseSymbols } from "../../src/mcp/BrowseSymbolsTool.js";

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

const TestLayer = Layer.mergeAll(EmbeddingServiceMock, LanceDbWriterMock);

const seedIndex = Effect.fn(function* () {
  const lance = yield* LanceDbWriter;
  const embedding = yield* EmbeddingService;

  const symbols = [
    makeSymbol({
      id: "@beep/pkg/mod/Alpha",
      name: "Alpha",
      kind: "schema",
      package: "@beep/pkg",
      module: "mod",
    }),
    makeSymbol({
      id: "@beep/pkg/mod/Beta",
      name: "Beta",
      kind: "service",
      package: "@beep/pkg",
      module: "mod",
    }),
    makeSymbol({
      id: "@beep/cli/commands/Gamma",
      name: "Gamma",
      kind: "command",
      package: "@beep/cli",
      module: "commands",
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

layer(TestLayer)("BrowseSymbolsTool", (it) => {
  it.effect(
    "browses package, module, and symbol levels",
    Effect.fn(function* () {
      yield* seedIndex();

      const packages = yield* handleBrowseSymbols({});
      expect(packages.level).toBe("packages");
      expect(packages.items.map((item) => item.name)).toContain("@beep/pkg");

      const modules = yield* handleBrowseSymbols({ package: "@beep/pkg" });
      expect(modules.level).toBe("modules");
      expect(modules.items.map((item) => item.name)).toContain("mod");

      const symbols = yield* handleBrowseSymbols({ package: "@beep/pkg", module: "mod" });
      expect(symbols.level).toBe("symbols");
      expect(symbols.items.map((item) => item.name)).toContain("Alpha");
    })
  );
});
