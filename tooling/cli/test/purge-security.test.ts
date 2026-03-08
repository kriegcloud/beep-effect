import { purgeAtRoot } from "@beep/repo-cli/commands/Purge";
import { FsUtilsLive } from "@beep/repo-utils/FsUtils";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path } from "effect";
import { describe, expect, it } from "vitest";

const testLayer = Layer.mergeAll(NodeServices.layer, FsUtilsLive.pipe(Layer.provide(NodeServices.layer)));

const withTempDirectories = <A, E, R>(use: (tmpDir: string, externalDir: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const tmpDir = yield* fs.makeTempDirectory();
      const externalDir = yield* fs.makeTempDirectory();

      return { externalDir, fs, tmpDir } as const;
    }),
    ({ externalDir, tmpDir }) => use(tmpDir, externalDir),
    ({ externalDir, fs, tmpDir }) =>
      Effect.all([
        fs.remove(tmpDir, { recursive: true, force: true }),
        fs.remove(externalDir, { recursive: true, force: true }),
      ]).pipe(Effect.asVoid)
  );

describe("purge security", () => {
  it("fails closed before deleting artifacts from a symlinked workspace outside the repo root", async () => {
    await Effect.runPromise(
      withTempDirectories((tmpDir, externalDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const workspaceDir = path.join(tmpDir, "packages", "pkg-outside");
          const externalDistDir = path.join(externalDir, "dist");
          const externalSentinelPath = path.join(externalDistDir, "sentinel.txt");

          yield* fs.writeFileString(
            path.join(tmpDir, "package.json"),
            '{ "name": "@beep/test-root", "workspaces": ["packages/*"] }\n'
          );
          yield* fs.makeDirectory(path.dirname(workspaceDir), { recursive: true });
          yield* fs.writeFileString(
            path.join(externalDir, "package.json"),
            '{ "name": "@beep/outside-workspace", "version": "1.0.0" }\n'
          );
          yield* fs.makeDirectory(externalDistDir, { recursive: true });
          yield* fs.writeFileString(externalSentinelPath, "keep\n");
          yield* fs.symlink(externalDir, workspaceDir);

          const succeeded = yield* purgeAtRoot(tmpDir, false).pipe(
            Effect.match({
              onFailure: () => false,
              onSuccess: () => true,
            })
          );

          expect(succeeded).toBe(false);
          expect(yield* fs.exists(externalDistDir)).toBe(true);
          expect(yield* fs.readFileString(externalSentinelPath)).toBe("keep\n");
        })
      ).pipe(Effect.provide(testLayer))
    );
  });
});
