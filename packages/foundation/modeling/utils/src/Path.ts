/**
 * Path utilities wrapping `node:path`, mirroring effect's `Path` service
 * interface.
 *
 * The pure operations (`join`, `basename`, `parse`, ...) are plain synchronous
 * functions — they cannot fail on string input, matching effect's own sync
 * `Path` service. The `file:` URL conversions (`fromFileUrl`/`toFileUrl`) are
 * `Effect`-returning and fail with `PlatformError.BadArgument`; they are
 * re-exported from the sibling `NodeUrl` module rather than reimplemented. This
 * is the sanctioned home for `node:path` access.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { createRequire } from "node:module";
import type { Path as PlatformPath } from "effect";

/**
 * Synchronous `node:path` handle. Acquired via `createRequire` (rather than a
 * static `import ... from "node:path"`) so this module can mirror effect's
 * `Path` interface over the sync `node:path` API while remaining its
 * sanctioned home.
 */
const NPath: typeof import("node:path") = createRequire(import.meta.url)("node:path");

/**
 * `file:` URL conversions re-exported from the sibling `NodeUrl` module:
 * `fromFileUrl` (URL to path) and `toFileUrl` (path to URL). Both are
 * `Effect`-returning and fail with `PlatformError.BadArgument` on invalid input.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { fromFileUrl, toFileUrl } from "@beep/utils/Path"
 *
 * const url = Effect.runSync(toFileUrl("/tmp/beep.txt"))
 * console.log(Effect.runSync(fromFileUrl(url)))
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export { fromFileUrl, toFileUrl } from "./NodeUrl.ts";

/**
 * A parsed path, mirroring effect's `Path.Parsed` (and Node's `ParsedPath`).
 *
 * @example
 * ```ts
 * import type { Parsed } from "@beep/utils/Path"
 *
 * const parsed: Parsed = { root: "/", dir: "/x", base: "y.ts", ext: ".ts", name: "y" }
 * console.log(parsed.name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Parsed = PlatformPath.Path.Parsed;

/**
 * The platform-specific path segment separator (`"/"` on POSIX, `"\\"` on
 * Windows).
 *
 * @example
 * ```ts
 * import { sep } from "@beep/utils/Path"
 *
 * console.log(typeof sep)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const sep: string = NPath.sep;

/**
 * Joins path segments into a single normalized path.
 *
 * @example
 * ```ts
 * import { join } from "@beep/utils/Path"
 *
 * console.log(join("a", "b", "c"))
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const join = (...paths: ReadonlyArray<string>): string => NPath.join(...paths);

/**
 * Resolves a sequence of path segments into an absolute path.
 *
 * @example
 * ```ts
 * import { resolve } from "@beep/utils/Path"
 *
 * console.log(resolve("a", "b").length > 0)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const resolve = (...pathSegments: ReadonlyArray<string>): string => NPath.resolve(...pathSegments);

/**
 * Normalizes a path, collapsing `.`/`..` segments and redundant separators.
 *
 * @example
 * ```ts
 * import { normalize } from "@beep/utils/Path"
 *
 * console.log(normalize("a//b/../c"))
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const normalize: (path: string) => string = NPath.normalize;

/**
 * Computes the relative path from `from` to `to`.
 *
 * @example
 * ```ts
 * import { relative } from "@beep/utils/Path"
 *
 * console.log(relative("/a/b", "/a/c"))
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const relative: (from: string, to: string) => string = NPath.relative;

/**
 * Returns the last portion of a path, optionally stripping `suffix`.
 *
 * @example
 * ```ts
 * import { basename } from "@beep/utils/Path"
 *
 * console.log(basename("/a/b/c.ts", ".ts"))
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const basename: (path: string, suffix?: string) => string = NPath.basename;

/**
 * Returns the directory portion of a path.
 *
 * @example
 * ```ts
 * import { dirname } from "@beep/utils/Path"
 *
 * console.log(dirname("/a/b/c.ts"))
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const dirname: (path: string) => string = NPath.dirname;

/**
 * Returns the extension of a path, including the leading dot.
 *
 * @example
 * ```ts
 * import { extname } from "@beep/utils/Path"
 *
 * console.log(extname("/a/b/c.ts"))
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const extname: (path: string) => string = NPath.extname;

/**
 * Reports whether a path is absolute.
 *
 * @example
 * ```ts
 * import { isAbsolute } from "@beep/utils/Path"
 *
 * console.log(isAbsolute("/a/b"))
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const isAbsolute: (path: string) => boolean = NPath.isAbsolute;

/**
 * Parses a path into its `root`/`dir`/`base`/`ext`/`name` components.
 *
 * @example
 * ```ts
 * import { parse } from "@beep/utils/Path"
 *
 * console.log(parse("/a/b/c.ts").name)
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const parse: (path: string) => Parsed = NPath.parse;

/**
 * Formats a {@link Parsed}-shaped object back into a path string.
 *
 * @example
 * ```ts
 * import { format } from "@beep/utils/Path"
 *
 * console.log(format({ dir: "/a/b", base: "c.ts" }))
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const format: (pathObject: Partial<Parsed>) => string = NPath.format;

/**
 * Returns the equivalent namespace-prefixed path (a no-op outside Windows).
 *
 * @example
 * ```ts
 * import { toNamespacedPath } from "@beep/utils/Path"
 *
 * console.log(toNamespacedPath("/a/b").length > 0)
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const toNamespacedPath: (path: string) => string = NPath.toNamespacedPath;
