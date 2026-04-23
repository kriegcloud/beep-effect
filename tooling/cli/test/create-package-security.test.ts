import {
  ConfigUpdateTarget,
  checkConfigNeedsUpdate,
  updateTsconfigPackages,
} from "@beep/repo-cli/commands/CreatePackage/ConfigUpdater";
import {
  createFileGenerationPlanService,
  FileGenerationPlan,
  GenerationAction,
  PlannedFile,
  PlannedSymlink,
} from "@beep/repo-cli/commands/CreatePackage/FileGenerationPlanService";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as jsonc from "jsonc-parser";
import { describe, expect, it } from "vitest";

const testLayer = Layer.mergeAll(NodeServices.layer);

const withTempDirectory = <A, E, R>(use: (tmpDir: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      return yield* fs.makeTempDirectory();
    }),
    use,
    (tmpDir) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        yield* fs.remove(tmpDir, { recursive: true, force: true });
      })
  );

const makeSymlinkPlan = (outputDir: string) =>
  new FileGenerationPlan({
    outputDir,
    actions: [new GenerationAction.cases.symlink({ relativePath: "CLAUDE.md", target: "AGENTS.md" })],
  });

const writeRootConfigFiles = Effect.fn(function* (rootDir: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  yield* fs.writeFileString(
    path.join(rootDir, "tsconfig.packages.json"),
    `{
  "references": [
    { "path": "packages/common/identity" }
  ]
}
`
  );
  yield* fs.writeFileString(
    path.join(rootDir, "tsconfig.json"),
    `{
  "compilerOptions": {
    "paths": {
      "@beep/identity": ["./packages/common/identity/src/index.ts"],
      "@beep/identity/*": ["./packages/common/identity/src/*"]
    }
  }
}
`
  );
  yield* fs.writeFileString(
    path.join(rootDir, "tstyche.json"),
    `{
  "testFileMatch": [
    "packages/common/identity/dtslint/**/*.tst.*"
  ]
}
`
  );
});

describe("create-package security", () => {
  it("updateTsconfigPackages preserves existing references idempotently", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const filePath = path.join(tmpDir, "tsconfig.packages.json");

          yield* writeRootConfigFiles(tmpDir);

          const changed = yield* updateTsconfigPackages(tmpDir, "packages/common/identity");
          const parsed = jsonc.parse(yield* fs.readFileString(filePath), undefined, {
            allowTrailingComma: true,
            disallowComments: false,
          });

          expect(changed).toBe(false);
          expect(parsed.references).toEqual([{ path: "packages/common/identity" }]);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("checkConfigNeedsUpdate reports no drift for existing root config entries", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          yield* writeRootConfigFiles(tmpDir);

          const result = yield* checkConfigNeedsUpdate(
            tmpDir,
            new ConfigUpdateTarget({
              packageName: "identity",
              packagePath: "packages/common/identity",
            })
          );

          expect(result.tsconfigPackages).toBe(false);
          expect(result.tsconfigPaths).toBe(false);
          expect(result.tstycheConfig).toBe(false);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("rejects traversal paths at the schema boundary", () => {
    expect(() => new PlannedFile({ relativePath: "../escape.txt", content: "owned\n" })).toThrow();
    expect(() => new PlannedSymlink({ relativePath: "CLAUDE.md", target: "../AGENTS.md" })).toThrow();
  });

  it("executePlan rejects forged file writes that escape the output directory", async () => {
    const service = createFileGenerationPlanService();

    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const outputDir = path.join(tmpDir, "pkg");
          const externalPath = path.join(tmpDir, "external.txt");

          yield* fs.makeDirectory(outputDir, { recursive: true });
          yield* fs.writeFileString(externalPath, "safe\n");

          const forgedPlan = {
            outputDir,
            actions: [{ kind: "write-file", relativePath: "../external.txt", content: "owned\n" }],
          } as unknown as FileGenerationPlan;

          const succeeded = yield* service.executePlan(forgedPlan).pipe(
            Effect.match({
              onFailure: () => false,
              onSuccess: () => true,
            })
          );
          expect(succeeded).toBe(false);
          expect(yield* fs.readFileString(externalPath)).toBe("safe\n");
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("executePlan rejects forged symlink targets that escape the output directory", async () => {
    const service = createFileGenerationPlanService();

    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const outputDir = path.join(tmpDir, "pkg");
          const symlinkPath = path.join(outputDir, "CLAUDE.md");

          yield* fs.makeDirectory(outputDir, { recursive: true });

          const forgedPlan = {
            outputDir,
            actions: [{ kind: "symlink", relativePath: "CLAUDE.md", target: "../AGENTS.md" }],
          } as unknown as FileGenerationPlan;

          const succeeded = yield* service.executePlan(forgedPlan).pipe(
            Effect.match({
              onFailure: () => false,
              onSuccess: () => true,
            })
          );
          expect(succeeded).toBe(false);
          expect(yield* fs.exists(symlinkPath)).toBe(false);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("executePlan skips an existing symlink when the target already matches", async () => {
    const service = createFileGenerationPlanService();

    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const outputDir = path.join(tmpDir, "pkg");
          const symlinkPath = path.join(outputDir, "CLAUDE.md");

          yield* fs.makeDirectory(outputDir, { recursive: true });
          yield* fs.writeFileString(path.join(outputDir, "AGENTS.md"), "target\n");
          yield* fs.symlink("AGENTS.md", symlinkPath);

          const result = yield* service.executePlan(makeSymlinkPlan(outputDir));

          expect(result.createdSymlinks).toBe(0);
          expect(result.skippedSymlinks).toBe(1);
          expect(yield* fs.readLink(symlinkPath)).toBe("AGENTS.md");
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("executePlan replaces an existing non-symlink path with the planned symlink", async () => {
    const service = createFileGenerationPlanService();

    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const outputDir = path.join(tmpDir, "pkg");
          const symlinkPath = path.join(outputDir, "CLAUDE.md");

          yield* fs.makeDirectory(outputDir, { recursive: true });
          yield* fs.writeFileString(symlinkPath, "stale file\n");

          const result = yield* service.executePlan(makeSymlinkPlan(outputDir));

          expect(result.createdSymlinks).toBe(1);
          expect(result.skippedSymlinks).toBe(0);
          expect(yield* fs.readLink(symlinkPath)).toBe("AGENTS.md");
        })
      ).pipe(Effect.provide(testLayer))
    );
  });

  it("executePlan rejects a symlinked output directory before writing outside the intended root", async () => {
    const service = createFileGenerationPlanService();

    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const outputDir = path.join(tmpDir, "pkg-link");
          const externalRoot = path.join(tmpDir, "external-root");
          const escapedPath = path.join(externalRoot, "README.md");

          yield* fs.makeDirectory(externalRoot, { recursive: true });
          yield* fs.symlink(externalRoot, outputDir);

          const forgedPlan = {
            outputDir,
            actions: [{ kind: "write-file", relativePath: "README.md", content: "owned\n" }],
          } as unknown as FileGenerationPlan;

          const succeeded = yield* service.executePlan(forgedPlan).pipe(
            Effect.match({
              onFailure: () => false,
              onSuccess: () => true,
            })
          );
          expect(succeeded).toBe(false);
          expect(yield* fs.exists(escapedPath)).toBe(false);
        })
      ).pipe(Effect.provide(testLayer))
    );
  });
});
