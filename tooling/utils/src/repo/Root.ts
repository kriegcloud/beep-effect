import { NoSuchFileError } from "@beep/tooling-utils/repo/Errors";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";

/**
 * Find the repository root by walking upward from this module's directory.
 *
 * A directory is considered the repo root if it contains either a `.git`
 * directory or a Bun workspace marker (`bun.lock`).
 *
 * @returns Absolute path to the repo root
 * @throws NoSuchFileError if no matching directory is found
 */
export const findRepoRoot = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const currentDir = yield* path.fromFileUrl(new URL(import.meta.url));
  let current = path.dirname(currentDir);

  while (true) {
    const hasGit = yield* fs.exists(path.join(current, ".git"));
    const hasBunLock = yield* fs.exists(path.join(current, "bun.lock"));

    if (hasGit || hasBunLock) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return yield* Effect.fail(
    new NoSuchFileError({
      path: currentDir,
      message: "[findRepoRoot] Could not find repo root",
    })
  );
});
