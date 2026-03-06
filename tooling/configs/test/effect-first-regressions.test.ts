import { fileURLToPath } from "node:url";
import { buildAllowlistSnapshotModuleFromJsoncText } from "@beep/repo-configs/internal/eslint/EffectLawsAllowlistSnapshotCodegen";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, FileSystem } from "effect";

const effectImportRulePath = fileURLToPath(new URL("../src/eslint/EffectImportStyleRule.ts", import.meta.url));
const noNativeRuntimeRulePath = fileURLToPath(new URL("../src/eslint/NoNativeRuntimeRule.ts", import.meta.url));
const requireCategoryTagRulePath = fileURLToPath(new URL("../src/eslint/RequireCategoryTagRule.ts", import.meta.url));
const schemaFirstRulePath = fileURLToPath(new URL("../src/eslint/SchemaFirstRule.ts", import.meta.url));
const terseEffectStyleRulePath = fileURLToPath(new URL("../src/eslint/TerseEffectStyleRule.ts", import.meta.url));

const ruleFilePaths = [
  effectImportRulePath,
  noNativeRuntimeRulePath,
  requireCategoryTagRulePath,
  schemaFirstRulePath,
  terseEffectStyleRulePath,
];

const allowlistRuntimePath = fileURLToPath(new URL("../src/eslint/EffectLawsAllowlist.ts", import.meta.url));
const snapshotCodegenPath = fileURLToPath(
  new URL("../src/internal/eslint/EffectLawsAllowlistSnapshotCodegen.ts", import.meta.url)
);
const allowlistSchemasPath = fileURLToPath(
  new URL("../src/internal/eslint/EffectLawsAllowlistSchemas.ts", import.meta.url)
);
const generatedSnapshotPath = fileURLToPath(
  new URL("../src/internal/eslint/generated/EffectLawsAllowlistSnapshot.ts", import.meta.url)
);
const allowlistJsoncPath = fileURLToPath(new URL("../../../standards/effect-laws.allowlist.jsonc", import.meta.url));

const readText = Effect.fn(function* (path: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.readFileString(path);
});

layer(NodeServices.layer)("effect-first regressions", (it) => {
  describe("effect-first regressions", () => {
    it.effect(
      "disallows Match.value usage in eslint rules",
      Effect.fn(function* () {
        for (const filePath of ruleFilePaths) {
          const source = yield* readText(filePath);
          expect(source.includes("Match.value("), `${filePath} should not use Match.value`).toBe(false);
        }
      })
    );

    it.effect(
      "disallows try/catch blocks in eslint rule runtime modules",
      Effect.fn(function* () {
        for (const filePath of [...ruleFilePaths, allowlistRuntimePath]) {
          const source = yield* readText(filePath);
          expect(source).not.toMatch(/\btry\s*\{|\bcatch\s*\(/);
        }
      })
    );

    it.effect(
      "keeps allowlist runtime free of Promise APIs",
      Effect.fn(function* () {
        const source = yield* readText(allowlistRuntimePath);
        expect(source).not.toMatch(/Promise<|Effect\.runPromise|\.then\(|\.catch\(|\basync\b|\bawait\b/);
      })
    );

    it.effect(
      "reuses shared internal rule modules",
      Effect.fn(function* () {
        const effectImportSource = yield* readText(effectImportRulePath);
        const noNativeRuntimeSource = yield* readText(noNativeRuntimeRulePath);
        const requireCategorySource = yield* readText(requireCategoryTagRulePath);

        expect(effectImportSource.includes("../internal/eslint/RuleAstSchemas.ts")).toBe(true);
        expect(noNativeRuntimeSource.includes("../internal/eslint/RuleAstSchemas.ts")).toBe(true);
        expect(requireCategorySource.includes("../internal/eslint/RuleAstSchemas.ts")).toBe(true);
        expect(noNativeRuntimeSource.includes("../internal/eslint/RuleHelpers.ts")).toBe(true);
        expect(requireCategorySource.includes("../internal/eslint/RuleHelpers.ts")).toBe(true);

        for (const source of [effectImportSource, noNativeRuntimeSource, requireCategorySource]) {
          expect(source.includes("const firstSome =")).toBe(false);
        }
      })
    );

    it.effect(
      "disallows direct JSON.stringify in internal eslint source",
      Effect.fn(function* () {
        for (const filePath of [snapshotCodegenPath, allowlistSchemasPath]) {
          const source = yield* readText(filePath);
          expect(source.includes("JSON.stringify(")).toBe(false);
        }
      })
    );

    it.effect(
      "keeps generated allowlist snapshot in sync with standards allowlist",
      Effect.fn(function* () {
        const allowlistJsonc = yield* readText(allowlistJsoncPath);
        const expectedGeneratedSnapshot = yield* buildAllowlistSnapshotModuleFromJsoncText(allowlistJsonc);
        const actualGeneratedSnapshot = yield* readText(generatedSnapshotPath);
        expect(actualGeneratedSnapshot).toBe(expectedGeneratedSnapshot);
      })
    );
  });
});
