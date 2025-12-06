/**
 * Utilities for resolving file URLs to filesystem paths.
 *
 * Converts file:// URLs (like import.meta.url) to absolute paths and determines
 * current directory context.
 *
 * @since 0.1.0
 */
import * as NodeUrl from "node:url";
import { BadArgument } from "@effect/platform/Error";
import * as Path from "@effect/platform/Path";
import { Effect, pipe } from "effect";

/**
 * Convert a file URL to a filesystem path.
 *
 * @example
 * ```typescript
 * import { fromFileUrl } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const path = yield* fromFileUrl("file:///home/user/file.ts")
 *   console.log(path)
 *   // => /home/user/file.ts
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
 */
export const fromFileUrl = (url: URL | string): Effect.Effect<string, BadArgument> =>
  Effect.try({
    try: () => NodeUrl.fileURLToPath(url),
    catch: (error) =>
      new BadArgument({
        module: "Path",
        method: "fromFileUrl",
        description: `Invalid file URL: ${url}`,
        cause: error,
      }),
  });

/**
 * Effect that resolves to the current file's absolute path.
 *
 * @example
 * ```typescript
 * import { CurrentFile } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const currentFile = yield* CurrentFile
 *   console.log("Current file:", currentFile)
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
 */
export const CurrentFile = fromFileUrl(import.meta.url);

/**
 * Effect that resolves to the current file's directory path.
 *
 * @example
 * ```typescript
 * import { CurrentDirectory } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const dir = yield* CurrentDirectory
 *   console.log("Current directory:", dir)
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
 */
export const CurrentDirectory = pipe(
  Effect.Do,
  Effect.bind("currentFile", () => CurrentFile),
  Effect.bind("path", () => Path.Path),
  Effect.map(({ currentFile, path }) => path.dirname(currentFile))
);
