import { NoSuchFileError } from "@beep/tooling-utils/repo/Errors.js";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";

/**
 * Find the repository root by walking upward from the current working directory.
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

  let current = process.cwd();

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
      path: process.cwd(),
      message: "[findRepoRoot] Could not find repo root",
    })
  );
});
