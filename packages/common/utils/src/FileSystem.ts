/**
 * A module containing utilities for interacting with the file system.
 *
 * @module
 * @since 0.0.0
 */

import { Effect, FileSystem, Path, pipe, Stream } from "effect";
import { dual } from "effect/Function";

/**
 * Creates a dual API helper that waits for the first file-system watch event
 * in `directory` whose basename matches `name`.
 *
 * The returned function subscribes to `FileSystem.watch(directory)`, filters
 * events by exact file name, and resolves with the first matching
 * `WatchEvent`. If the watch stream ends before a match is observed, the
 * effect succeeds with `Option.none()`.
 *
 * Supports both call styles:
 * - Data-first: `waitForFile("/tmp", "done.txt")`
 * - Data-last: `pipe("/tmp", waitForFile("done.txt"))`
 *
 * @since 0.0.0
 * @category utility
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { makeWaitForFile } from "@beep/utils/FileSystem"
 *
 * const program = Effect.gen(function* () {
 * 
 *
 * 
 * })
 *
 * void program
 * ```
 */
export const makeWaitForFile = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const waitForFile = (directory: string, name: string) =>
    pipe(
      fs.watch(directory),
      Stream.filter((e) => path.basename(e.path) === name),
      Stream.runHead
    );

  const fn: {
    (directory: string, name: string): ReturnType<typeof waitForFile>;
    (name: string): (directory: string) => ReturnType<typeof waitForFile>;
  } = dual(2, waitForFile);

  return fn;
});
