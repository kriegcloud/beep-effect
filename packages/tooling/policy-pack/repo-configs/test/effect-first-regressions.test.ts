import * as NodeURL from "node:url";
import { buildAllowlistSnapshotModuleFromJsoncText } from "@beep/repo-configs/internal/laws/EffectLawsAllowlistSnapshotCodegen";
import { it } from "@beep/test-runner";
import { Str } from "@beep/utils";
import { NodeServices } from "@effect/platform-node";
import { describe, expect } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";

const allowlistRuntimePath = NodeURL.fileURLToPath(new URL("../src/laws/EffectLawsAllowlist.ts", import.meta.url));
const snapshotCodegenPath = NodeURL.fileURLToPath(
  new URL("../src/internal/laws/EffectLawsAllowlistSnapshotCodegen.ts", import.meta.url)
);
const allowlistSchemasPath = NodeURL.fileURLToPath(
  new URL("../src/internal/laws/EffectLawsAllowlistSchemas.ts", import.meta.url)
);
const generatedSnapshotPath = NodeURL.fileURLToPath(
  new URL("../src/internal/laws/generated/EffectLawsAllowlistSnapshot.ts", import.meta.url)
);
const allowlistJsoncPath = NodeURL.fileURLToPath(
  new URL("../../../../../standards/effect-laws.allowlist.jsonc", import.meta.url)
);

const readText = Effect.fn(function* (path: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.readFileString(path);
});

it.layer(NodeServices.layer, { timeout: "10 seconds" })("effect-first regressions", (it) => {
  describe("effect-first regressions", () => {
    it.effect(
      "keeps allowlist runtime free of Promise APIs",
      Effect.fn(function* () {
        const source = yield* readText(allowlistRuntimePath);
        expect(source).not.toMatch(/Promise<|Effect\.runPromise|\.then\(|\.catch\(|\basync\b|\bawait\b/);
      })
    );

    it.effect(
      "disallows direct JSON.stringify in internal laws source",
      Effect.fn(function* () {
        for (const filePath of [snapshotCodegenPath, allowlistSchemasPath]) {
          const source = yield* readText(filePath);
          expect(Str.contains(source, "JSON.stringify(")).toBe(false);
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
