import {
  TSMorphService,
  TSMorphServiceLive,
  TsMorphFileOutlineRequest,
  TsMorphProjectScopeRequest,
  TsMorphSourceTextRequest,
} from "@beep/repo-utils/TSMorph/index";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer, Path } from "effect";
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

const decodeFileOutlineRequest = S.decodeUnknownSync(TsMorphFileOutlineRequest);
const decodeProjectScopeRequest = S.decodeUnknownSync(TsMorphProjectScopeRequest);
const decodeSourceTextRequest = S.decodeUnknownSync(TsMorphSourceTextRequest);

layer(TestLayer)("TSMorphService", (it) => {
  describe("resolveProjectScope", () => {
    it.effect(
      "resolves a workspace tsconfig into a stable scope",
      Effect.fn(function* () {
        const service = yield* TSMorphService;
        const scope = yield* service.resolveProjectScope(
          decodeProjectScopeRequest({
            entrypoint: {
              _tag: "tsconfig",
              tsConfigPath: TSCONFIG_PATH,
            },
            repoRootPath: REPO_ROOT,
            mode: "syntax",
            referencePolicy: "workspaceOnly",
          })
        );

        expect(scope.scopeId).toBe("tooling/repo-utils/tsconfig.json::syntax#workspaceOnly");
        expect(scope.cacheKey).toBe("tooling/repo-utils/tsconfig.json::syntax#workspaceOnly");
        expect(scope.repoRootPath).toBe(REPO_ROOT);
        expect(scope.workspaceDirectoryPath).toBe(WORKSPACE_ROOT);
        expect(scope.tsConfigPath).toBe(TSCONFIG_PATH);
      })
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
      })
    );
  });

  describe("getFileOutline", () => {
    it.effect(
      "extracts a non-empty outline for a known TypeScript file",
      Effect.fn(function* () {
        const service = yield* TSMorphService;
        const scope = yield* service.resolveProjectScope(
          decodeProjectScopeRequest({
            entrypoint: {
              _tag: "tsconfig",
              tsConfigPath: TSCONFIG_PATH,
            },
            repoRootPath: REPO_ROOT,
            mode: "syntax",
            referencePolicy: "workspaceOnly",
          })
        );
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
      })
    );
  });
});
