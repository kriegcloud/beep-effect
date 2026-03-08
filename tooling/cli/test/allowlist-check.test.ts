import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import { describe, expect, it } from "vitest";
import { ALLOWLIST_PATH, AllowlistCheckOptions, runAllowlistCheck } from "../src/commands/Laws/AllowlistCheck.js";

const testLayer = Layer.mergeAll(NodeServices.layer);

const withTempRepo = <A, E, R>(use: (tmpDir: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const tmpDir = yield* fs.makeTempDirectory();
      yield* fs.writeFileString(`${tmpDir}/bun.lock`, "");

      return { fs, tmpDir } as const;
    }),
    ({ tmpDir }) => use(tmpDir),
    ({ fs, tmpDir }) => fs.remove(tmpDir, { recursive: true })
  );

const writeRepoFile = Effect.fn(function* (repoRoot: string, relativePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const absolutePath = path.join(repoRoot, relativePath);
  const directoryPath = path.dirname(absolutePath);

  yield* fs.makeDirectory(directoryPath, { recursive: true });
  yield* fs.writeFileString(absolutePath, content);
});

describe("allowlist-check", () => {
  it("passes when all referenced files exist", async () => {
    await Effect.runPromise(
      withTempRepo((tmpDir) =>
        Effect.gen(function* () {
          yield* writeRepoFile(tmpDir, "packages/demo/src/index.ts", "export const value = 1;\n");
          yield* writeRepoFile(
            tmpDir,
            ALLOWLIST_PATH,
            [
              "{",
              '  "$schema": "./effect-laws.allowlist.schema.json",',
              '  "version": 1,',
              '  "entries": [',
              "    {",
              '      "rule": "beep-laws/no-native-runtime",',
              '      "file": "packages/demo/src/index.ts",',
              '      "kind": "object-method",',
              '      "reason": "test",',
              '      "owner": "@beep/test",',
              '      "issue": "TEST-ALLOWLIST"',
              "    }",
              "  ]",
              "}",
            ].join("\n")
          );

          const summary = yield* runAllowlistCheck(
            new AllowlistCheckOptions({
              cwd: tmpDir,
            })
          );

          expect(summary.ok).toBe(true);
          expect(summary.diagnostics).toEqual([]);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("fails when an allowlist entry points at a missing file", async () => {
    await Effect.runPromise(
      withTempRepo((tmpDir) =>
        Effect.gen(function* () {
          yield* writeRepoFile(
            tmpDir,
            ALLOWLIST_PATH,
            [
              "{",
              '  "$schema": "./effect-laws.allowlist.schema.json",',
              '  "version": 1,',
              '  "entries": [',
              "    {",
              '      "rule": "beep-laws/no-native-runtime",',
              '      "file": "packages/demo/src/missing.ts",',
              '      "kind": "object-method",',
              '      "reason": "test",',
              '      "owner": "@beep/test",',
              '      "issue": "TEST-ALLOWLIST"',
              "    }",
              "  ]",
              "}",
            ].join("\n")
          );

          const summary = yield* runAllowlistCheck(
            new AllowlistCheckOptions({
              cwd: tmpDir,
            })
          );

          expect(summary.ok).toBe(false);
          expect(summary.diagnostics).toEqual([
            "entries.0.file: Referenced file does not exist: packages/demo/src/missing.ts",
          ]);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("resolves allowlist paths from the repository root when started in a subdirectory", async () => {
    await Effect.runPromise(
      withTempRepo((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const workingDir = path.join(tmpDir, "packages/demo");

          yield* writeRepoFile(tmpDir, "packages/demo/src/index.ts", "export const value = 1;\n");
          yield* writeRepoFile(
            tmpDir,
            ALLOWLIST_PATH,
            [
              "{",
              '  "$schema": "./effect-laws.allowlist.schema.json",',
              '  "version": 1,',
              '  "entries": [',
              "    {",
              '      "rule": "beep-laws/no-native-runtime",',
              '      "file": "packages/demo/src/index.ts",',
              '      "kind": "object-method",',
              '      "reason": "test",',
              '      "owner": "@beep/test",',
              '      "issue": "TEST-ALLOWLIST"',
              "    }",
              "  ]",
              "}",
            ].join("\n")
          );

          const summary = yield* runAllowlistCheck(
            new AllowlistCheckOptions({
              cwd: workingDir,
            })
          );

          expect(summary.ok).toBe(true);
          expect(summary.diagnostics).toEqual([]);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });
});
