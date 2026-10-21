/**
 * Repository root discovery.
 *
 * Walks upward from a starting directory looking for repository markers
 * (`.git` directory or `bun.lock` file) to locate the monorepo root.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { A } from "@beep/utils";
import { Walker } from "@beep/walker/Walker";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import { NoSuchFileError } from "./errors/index.ts";
import type * as FileSystem from "effect/FileSystem";

/**
 * Markers that indicate a repository root directory.
 *
 * @category configuration
 * @since 0.0.0
 */
const ROOT_MARKERS: ReadonlyArray<string> = [".git", "bun.lock"];

/**
 * The posix `effect/Path` service, so `findRepoRoot` keeps its `FileSystem`-only requirement.
 *
 * The previous hand-rolled ascent split on `/` only; posix semantics keep that.
 */
const posixPath = Path.layer.pipe(Layer.build, Effect.map(Context.get(Path.Path)), Effect.scoped);

/**
 * The nearest directory on the lexical ascent from `start` holding a root marker.
 *
 * Markers are probed nearest directory first and in `ROOT_MARKERS` order per
 * directory; an unreadable probe counts as absent. A relative start ascends to
 * `.` and stops there instead of jumping to `/`.
 */
const findMarkedAncestor = Effect.fn(function* (start: string) {
  const path = yield* Path.Path;
  const dirs = yield* Walker.ascend(start);
  const marker = yield* Walker.findUpward(dirs, (dir) => A.map(ROOT_MARKERS, (name) => path.join(dir, name)));
  return O.map(marker, path.dirname);
});

/**
 * Find the repository root by walking upward from the given directory
 * (or the current working directory) until a root marker is found.
 *
 * **Details**
 *
 * Root markers are `.git` (directory) and `bun.lock` (file). The ascent is
 * `@beep/walker`'s lexical `Walker.ascend` with posix path semantics, so the
 * returned directory is normalized (no trailing separator). A relative start
 * ascends to `.` and stops there; it never jumps to the filesystem root.
 *
 * **Example** (Find root from cwd)
 *
 * ```typescript
 * import * as Effect from "effect/Effect";
 * import { findRepoRoot } from "@beep/repo-utils/Root"
 *
 * const program = findRepoRoot()
 * console.log(program)
 * ```
 *
 * @param startFrom - Optional starting directory. Defaults to `process.cwd()`.
 * @returns An Effect that succeeds with the absolute path of the repo root.
 * @category utilities
 * @since 0.0.0
 */
export const findRepoRoot: (
  startFrom?: undefined | string
) => Effect.Effect<string, NoSuchFileError, FileSystem.FileSystem> = Effect.fn(function* (startFrom) {
  const start = startFrom ?? process.cwd();
  const root = yield* findMarkedAncestor(start).pipe(Effect.provideServiceEffect(Path.Path, posixPath));
  if (O.isSome(root)) {
    return root.value;
  }
  return yield* NoSuchFileError.make({
    path: start,
    message: `Could not find repository root (looked for ${A.join(", ")(ROOT_MARKERS)}) starting from "${start}"`,
  });
});
