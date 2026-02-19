/**
 * Repository root discovery.
 *
 * Walks upward from a starting directory looking for repository markers
 * (`.git` directory or `bun.lock` file) to locate the monorepo root.
 *
 * @since 0.0.0
 * @module
 */
import { Effect, FileSystem } from "effect";
import { NoSuchFileError } from "./errors/index.js";

/**
 * Markers that indicate a repository root directory.
 *
 * @since 0.0.0
 * @category constants
 */
const ROOT_MARKERS: ReadonlyArray<string> = [".git", "bun.lock"];

/**
 * Find the repository root by walking upward from the given directory
 * (or the current working directory) until a root marker is found.
 *
 * Root markers are `.git` (directory) and `bun.lock` (file).
 *
 * @param startFrom - Optional starting directory. Defaults to `process.cwd()`.
 * @returns An Effect that succeeds with the absolute path of the repo root,
 *   or fails with `NoSuchFileError` if no root marker is found.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { findRepoRoot } from "@beep/repo-utils/Root"
 *
 * const program = Effect.gen(function*() {
 *   const root = yield* findRepoRoot()
 *   console.log("Repo root:", root)
 * })
 * ```
 *
 * @since 0.0.0
 * @category functions
 */
export const findRepoRoot = (startFrom?: string): Effect.Effect<string, NoSuchFileError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const start = startFrom ?? process.cwd();

    let current = start;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      for (const marker of ROOT_MARKERS) {
        const markerPath = current.endsWith("/") ? current + marker : `${current}/${marker}`;
        const exists = yield* fs.exists(markerPath).pipe(Effect.orElseSucceed(() => false));
        if (exists) {
          return current;
        }
      }

      // Move to parent directory
      const parent = parentDir(current);
      if (parent === current) {
        // Reached filesystem root without finding a marker
        return yield* Effect.fail(
          new NoSuchFileError({
            path: start,
            message: `Could not find repository root (looked for ${ROOT_MARKERS.join(", ")}) starting from "${start}"`,
          })
        );
      }
      current = parent;
    }
  });

/**
 * Get the parent directory of a path (pure string operation).
 */
const parentDir = (p: string): string => {
  const lastSlash = p.lastIndexOf("/");
  if (lastSlash <= 0) return "/";
  return p.substring(0, lastSlash);
};
