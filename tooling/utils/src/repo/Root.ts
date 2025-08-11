import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import { NoSuchFileError } from "./Errors";

export const findRepoRoot = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const currentDir = yield* path.fromFileUrl(new URL(import.meta.url));
  let current = path.dirname(currentDir);

  while (true) {
    const hasGit = yield* fs.exists(path.join(current, ".git"));
    const hasPnpm = yield* fs.exists(path.join(current, "pnpm-workspace.yaml"));

    if (hasGit || hasPnpm) {
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
    }),
  );
});
