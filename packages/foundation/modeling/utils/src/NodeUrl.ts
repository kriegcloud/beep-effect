/**
 * Node URL helpers wrapped in `Effect`.
 *
 * Provides typed wrappers around Node's file URL conversion utilities so
 * path and `file:` URL conversions can participate in Effect workflows.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as NodeUrl from "node:url";
import { Effect, PlatformError } from "effect";

/**
 * Converts a `file:` URL into a platform path string.
 *
 * Wraps Node's `fileURLToPath` in `Effect.try`, translating thrown errors
 * into a typed `BadArgument`.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { fromFileUrl } from "@beep/utils/NodeUrl"
 *
 * const program = Effect.gen(function* () {
 *   const path = yield* fromFileUrl(new URL("file:///tmp/beep.txt"))
 *   return path
 * })
 *
 * void program
 * ```
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { fromFileUrl } from "@beep/utils/NodeUrl"
 *
 * const invalid = fromFileUrl(new URL("https://example.com/file.txt"))
 *
 * const recovered = Effect.catchTag(invalid, "BadArgument", () =>
 *   Effect.succeed("/tmp/fallback.txt")
 * )
 *
 * void recovered
 * ```
 *
 * @param url - The `file:` URL to convert.
 * @returns An effect that succeeds with the platform path string.
 * @category utilities
 * @since 0.0.0
 */
export const fromFileUrl = (url: URL): Effect.Effect<string, PlatformError.BadArgument> =>
  Effect.try({
    try: () => NodeUrl.fileURLToPath(url),
    catch: () =>
      new PlatformError.BadArgument({
        module: "Path",
        method: "fromFileUrl",
        description: "URL must be a valid file: URL",
      }),
  });

/**
 * Converts a platform path string into a `file:` URL.
 *
 * Wraps Node's `pathToFileURL` in `Effect.try`, translating thrown errors
 * into a typed `BadArgument`.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { toFileUrl } from "@beep/utils/NodeUrl"
 *
 * const program = Effect.gen(function* () {
 *   const url = yield* toFileUrl("/tmp/beep.txt")
 *   return url.href
 * })
 *
 * void program
 * ```
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { toFileUrl } from "@beep/utils/NodeUrl"
 *
 * const recovered = Effect.catchTag(toFileUrl(""), "BadArgument", () =>
 *   Effect.succeed(new URL("file:///tmp/fallback.txt"))
 * )
 *
 * void recovered
 * ```
 *
 * @param path - The platform path string to convert.
 * @returns An effect that succeeds with a `file:` URL.
 * @category utilities
 * @since 0.0.0
 */
export const toFileUrl = (path: string): Effect.Effect<URL, PlatformError.BadArgument> =>
  Effect.try({
    try: () => NodeUrl.pathToFileURL(path),
    catch: () =>
      new PlatformError.BadArgument({
        module: "Path",
        method: "toFileUrl",
        description: "Path must be a valid filesystem path",
      }),
  });

/**
 * Converts a `file:` URL back into a platform path string.
 *
 * @example
 * ```ts
 * import { fileURLToPath } from "@beep/utils/NodeUrl"
 *
 * const path = fileURLToPath(new URL("file:///tmp/beep.txt"))
 * void path
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const fileURLToPath = NodeUrl.fileURLToPath;
