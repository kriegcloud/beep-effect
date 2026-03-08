import {
  TSMorphService,
  TSMorphServiceLive,
  TsMorphDiagnosticsRequest,
  TsMorphFileOutlineRequest,
  TsMorphProjectScopeRequest,
  TsMorphSourceTextRequest,
  TsMorphSymbolLookupRequest,
  TsMorphSymbolSearchRequest,
  TsMorphSymbolSourceRequest,
} from "@beep/repo-utils/TSMorph/index";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, layer } from "@effect/vitest";
import { Array as A, Effect, Layer, Order, Path, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const TestLayer = TSMorphServiceLive.pipe(Layer.provideMerge(PlatformLayer));
const pathApi = Effect.runSync(
  Effect.gen(function* () {
    return yield* Path.Path;
  }).pipe(Effect.provide(NodePath.layer))
);

const REPO_ROOT = pathApi.resolve(__dirname, "..", "..", "..");
const WORKSPACE_ROOT = pathApi.resolve(__dirname, "..");
const TSCONFIG_PATH = "tooling/repo-utils/tsconfig.json";
const MODEL_FILE_PATH = "tooling/repo-utils/src/TSMorph/TSMorph.model.ts";
const FIXTURE_TSCONFIG_PATH = "tooling/repo-utils/test/fixtures/tsmorph-diagnostics/tsconfig.json";
const FIXTURE_BROKEN_FILE_PATH = "tooling/repo-utils/test/fixtures/tsmorph-diagnostics/src/broken.ts";
const LATE_FILE_TSCONFIG_PATH = "tooling/repo-utils/test/fixtures/tsmorph-late-file/tsconfig.json";
const LATE_FILE_INCLUDED_FILE_PATH = "tooling/repo-utils/test/fixtures/tsmorph-late-file/src/included.ts";
const LATE_FILE_EXTRA_FILE_PATH = "tooling/repo-utils/test/fixtures/tsmorph-late-file/src/extra.ts";

const decodeDiagnosticsRequest = S.decodeUnknownSync(TsMorphDiagnosticsRequest);
const decodeFileOutlineRequest = S.decodeUnknownSync(TsMorphFileOutlineRequest);
const decodeProjectScopeRequest = S.decodeUnknownSync(TsMorphProjectScopeRequest);
const decodeSourceTextRequest = S.decodeUnknownSync(TsMorphSourceTextRequest);
const decodeSymbolLookupRequest = S.decodeUnknownSync(TsMorphSymbolLookupRequest);
const decodeSymbolSearchRequest = S.decodeUnknownSync(TsMorphSymbolSearchRequest);
const decodeSymbolSourceRequest = S.decodeUnknownSync(TsMorphSymbolSourceRequest);

const repoUtilsScopeRequest = (mode: "syntax" | "semantic" = "syntax") =>
  decodeProjectScopeRequest({
    entrypoint: {
      _tag: "tsconfig",
      tsConfigPath: TSCONFIG_PATH,
    },
    repoRootPath: REPO_ROOT,
    mode,
    referencePolicy: "workspaceOnly",
  });

const fixtureScopeRequest = (mode: "syntax" | "semantic" = "semantic") =>
  decodeProjectScopeRequest({
    entrypoint: {
      _tag: "tsconfig",
      tsConfigPath: FIXTURE_TSCONFIG_PATH,
    },
    repoRootPath: REPO_ROOT,
    mode,
    referencePolicy: "workspaceOnly",
  });

const lateFileScopeRequest = (mode: "syntax" | "semantic" = "syntax") =>
  decodeProjectScopeRequest({
    entrypoint: {
      _tag: "tsconfig",
      tsConfigPath: LATE_FILE_TSCONFIG_PATH,
    },
    repoRootPath: REPO_ROOT,
    mode,
    referencePolicy: "workspaceOnly",
  });

layer(TestLayer, { timeout: 20_000 })("TSMorphService", (it) => {
  describe("resolveProjectScope", () => {
    it.effect(
      "resolves a workspace tsconfig into a stable scope",
      Effect.fn(function* () {
        const service = yield* TSMorphService;
        const scope = yield* service.resolveProjectScope(repoUtilsScopeRequest("syntax"));

        expect(scope.scopeId).toBe("tooling/repo-utils/tsconfig.json::syntax#workspaceOnly");
        expect(scope.cacheKey).toBe("tooling/repo-utils/tsconfig.json::syntax#workspaceOnly");
        expect(scope.repoRootPath).toBe(REPO_ROOT);
        expect(scope.workspaceDirectoryPath).toBe(WORKSPACE_ROOT);
        expect(scope.tsConfigPath).toBe(TSCONFIG_PATH);
      }),
      20_000
    );
  });

  describe("readSourceText", () => {
    it.effect(
      "reads source text for a known TypeScript file through the scoped project",
      Effect.fn(function* () {
        const service = yield* TSMorphService;
        const sourceText = yield* service.readSourceText(
          decodeSourceTextRequest({
            filePath: MODEL_FILE_PATH,
          })
        );

        expect(sourceText.filePath).toBe(MODEL_FILE_PATH);
        expect(sourceText.sourceText).toContain("export class TsMorphProjectScope");
        expect(sourceText.contentHash).toMatch(/^[0-9a-f]{64}$/u);
      }),
      20_000
    );
  });

  describe("getFileOutline", () => {
    it.effect(
      "extracts a non-empty outline for a known TypeScript file",
      Effect.fn(function* () {
        const service = yield* TSMorphService;
        const scope = yield* service.resolveProjectScope(repoUtilsScopeRequest("syntax"));
        const outline = yield* service.getFileOutline(
          decodeFileOutlineRequest({
            scopeId: scope.scopeId,
            filePath: MODEL_FILE_PATH,
          })
        );

        expect(outline.filePath).toBe(MODEL_FILE_PATH);
        expect(outline.symbols.length).toBeGreaterThan(0);
        expect(
          outline.symbols.some((symbol) => symbol.name === "TsMorphProjectScope" && symbol.kind === "ClassDeclaration")
        ).toBe(true);
      }),
      20_000
    );
  });

  describe("getSymbolById / readSymbolSource", () => {
    it.effect(
      "loads a normalized class symbol and its extracted source text",
      Effect.fn(function* () {
        const service = yield* TSMorphService;
        const scope = yield* service.resolveProjectScope(repoUtilsScopeRequest("syntax"));
        const outline = yield* service.getFileOutline(
          decodeFileOutlineRequest({
            scopeId: scope.scopeId,
            filePath: MODEL_FILE_PATH,
          })
        );
        const targetSymbol = pipe(
          outline.symbols,
          A.findFirst((symbol) => symbol.name === "TsMorphProjectScope" && symbol.kind === "ClassDeclaration")
        );

        expect(O.isSome(targetSymbol)).toBe(true);
        if (O.isNone(targetSymbol)) {
          return;
        }

        const lookup = yield* service.getSymbolById(
          decodeSymbolLookupRequest({
            scopeId: scope.scopeId,
            symbolId: targetSymbol.value.id,
          })
        );
        const source = yield* service.readSymbolSource(
          decodeSymbolSourceRequest({
            scopeId: scope.scopeId,
            symbolId: targetSymbol.value.id,
          })
        );

        expect(lookup.symbol.id).toBe(targetSymbol.value.id);
        expect(lookup.symbol.qualifiedName).toBe("TsMorphProjectScope");
        expect(source.symbol.id).toBe(targetSymbol.value.id);
        expect(source.sourceText).toContain("export class TsMorphProjectScope");
        expect(source.contentHash).toBe(targetSymbol.value.contentHash);
      }),
      20_000
    );
  });

  describe("searchSymbols", () => {
    it.effect(
      "searches deterministically and honors category, kind, and limit filters",
      Effect.fn(function* () {
        const service = yield* TSMorphService;
        const scope = yield* service.resolveProjectScope(repoUtilsScopeRequest("syntax"));
        const allMatches = yield* service.searchSymbols(
          decodeSymbolSearchRequest({
            scopeId: scope.scopeId,
            query: "TsMorph",
            categories: [],
            kinds: [],
            limit: 50,
          })
        );
        const unbounded = yield* service.searchSymbols(
          decodeSymbolSearchRequest({
            scopeId: scope.scopeId,
            query: "TsMorph",
            categories: ["class"],
            kinds: ["ClassDeclaration"],
            limit: 50,
          })
        );
        const limited = yield* service.searchSymbols(
          decodeSymbolSearchRequest({
            scopeId: scope.scopeId,
            query: "TsMorph",
            categories: ["class"],
            kinds: ["ClassDeclaration"],
            limit: 1,
          })
        );
        const blank = yield* service.searchSymbols(
          decodeSymbolSearchRequest({
            scopeId: scope.scopeId,
            query: "   ",
            categories: [],
            kinds: [],
            limit: 10,
          })
        );
        const names = pipe(
          unbounded.symbols,
          A.map((symbol) => symbol.name)
        );

        expect(unbounded.total).toBeGreaterThan(1);
        expect(unbounded.symbols.length).toBeLessThanOrEqual(unbounded.total);
        expect(allMatches.total).toBeGreaterThanOrEqual(unbounded.total);
        expect(limited.total).toBe(unbounded.total);
        expect(limited.symbols).toHaveLength(1);
        expect(blank.total).toBe(0);
        expect(blank.symbols).toEqual([]);
        expect(names).toEqual(A.sort(names, Order.String));
        expect(
          unbounded.symbols.every((symbol) => symbol.category === "class" && symbol.kind === "ClassDeclaration")
        ).toBe(true);
        expect(unbounded.symbols.some((symbol) => symbol.name === "TsMorphProjectScope")).toBe(true);
        expect(limited.symbols[0]?.name).toBe(unbounded.symbols[0]?.name);
      }),
      20_000
    );
  });

  describe("scope symbol index", () => {
    it.effect(
      "refreshes the cached symbol index when a late-loaded implementation file enters the project",
      Effect.fn(function* () {
        const service = yield* TSMorphService;
        const scope = yield* service.resolveProjectScope(lateFileScopeRequest("syntax"));
        const initialSearch = yield* service.searchSymbols(
          decodeSymbolSearchRequest({
            scopeId: scope.scopeId,
            query: "IncludedThing",
            categories: [],
            kinds: [],
            limit: 10,
          })
        );
        const outline = yield* service.getFileOutline(
          decodeFileOutlineRequest({
            scopeId: scope.scopeId,
            filePath: LATE_FILE_EXTRA_FILE_PATH,
          })
        );
        const targetSymbol = pipe(
          outline.symbols,
          A.findFirst((symbol) => symbol.name === "ExtraThing" && symbol.kind === "ClassDeclaration")
        );

        expect(initialSearch.total).toBeGreaterThan(0);
        expect(initialSearch.symbols.some((symbol) => symbol.filePath === LATE_FILE_INCLUDED_FILE_PATH)).toBe(true);
        expect(outline.filePath).toBe(LATE_FILE_EXTRA_FILE_PATH);
        expect(O.isSome(targetSymbol)).toBe(true);
        if (O.isNone(targetSymbol)) {
          return;
        }

        const lookup = yield* service.getSymbolById(
          decodeSymbolLookupRequest({
            scopeId: scope.scopeId,
            symbolId: targetSymbol.value.id,
          })
        );

        expect(lookup.symbol.filePath).toBe(LATE_FILE_EXTRA_FILE_PATH);
        expect(lookup.symbol.qualifiedName).toBe("ExtraThing");
      }),
      20_000
    );
  });

  describe("getDiagnostics", () => {
    it.effect(
      "returns no diagnostics for a known clean file in semantic mode",
      Effect.fn(function* () {
        const service = yield* TSMorphService;
        const scope = yield* service.resolveProjectScope(repoUtilsScopeRequest("semantic"));
        const diagnostics = yield* service.getDiagnostics(
          decodeDiagnosticsRequest({
            scopeId: scope.scopeId,
            filePath: MODEL_FILE_PATH,
          })
        );

        expect(diagnostics.filePath).toBe(MODEL_FILE_PATH);
        expect(diagnostics.diagnostics).toEqual([]);
      }),
      20_000
    );

    it.effect(
      "normalizes file-local diagnostics for an intentionally broken fixture",
      Effect.fn(function* () {
        const service = yield* TSMorphService;
        const scope = yield* service.resolveProjectScope(fixtureScopeRequest("semantic"));
        const diagnostics = yield* service.getDiagnostics(
          decodeDiagnosticsRequest({
            scopeId: scope.scopeId,
            filePath: FIXTURE_BROKEN_FILE_PATH,
          })
        );
        const firstDiagnostic = pipe(diagnostics.diagnostics, A.head);

        expect(diagnostics.filePath).toBe(FIXTURE_BROKEN_FILE_PATH);
        expect(diagnostics.diagnostics.length).toBeGreaterThan(0);
        expect(O.isSome(firstDiagnostic)).toBe(true);
        if (O.isNone(firstDiagnostic)) {
          return;
        }

        expect(firstDiagnostic.value.category).toBe("error");
        expect(firstDiagnostic.value.code).toBe(2322);
        expect(firstDiagnostic.value.message).toMatch(/not assignable to type 'number'/u);
        expect(firstDiagnostic.value.startLine).toBe(1);
        expect(firstDiagnostic.value.startColumn).toBeGreaterThan(0);
        expect(firstDiagnostic.value.endColumn).toBeGreaterThanOrEqual(firstDiagnostic.value.startColumn);
      }),
      20_000
    );
  });
});
