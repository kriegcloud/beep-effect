import {
  createFileGenerationPlanService,
  type FileGenerationPlan,
  PlannedFile,
  PlannedSymlink,
} from "@beep/repo-cli/commands/CreatePackage/FileGenerationPlanService";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
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

describe("create-package security", () => {
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
