/**
 * Resolve the DuckDB native addon from the folder that holds the compiled
 * practice KG executable, whatever the launcher's working directory.
 *
 * **Details**
 *
 * `bun build --compile` keeps the `@duckdb/node-bindings-*` addons external
 * and the MCPB package ships them in `node_modules` beside the executable. A
 * compiled executable resolves bare specifiers from its embedded virtual root
 * (`B:\\~BUN\\root`, `/$bunfs/root`), so without help the addon only loads
 * through `NODE_PATH` or from a working directory that happens to hold that
 * `node_modules`. The resolver tries, in order:
 *
 * 1. `node_modules` in the directory of `process.execPath` (the executable's
 *    own folder);
 * 2. Bun's default resolution, which honours `NODE_PATH` (the manifest sets it
 *    for Claude Desktop) and finally the working directory.
 *
 * Only `@duckdb/node-bindings-*` requests are touched; every other specifier
 * goes straight to the default resolution. When the host runs from source,
 * `process.execPath` is the `bun` binary, nothing sits beside it, and the
 * default resolution applies unchanged.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import NodeModule from "node:module";
import * as N from "effect/Number";
import * as O from "effect/Option";
import * as Str from "effect/String";

const NativeAddonPrefix = "@duckdb/node-bindings-";

/**
 * Resolve a specifier from a directory, throwing when it does not resolve.
 *
 * **Example** (Use Bun's resolver)
 *
 * ```ts
 * import type { ResolveFrom } from "../../src/NativeAddon.ts"
 *
 * const resolveFrom: ResolveFrom = (specifier, directory) => Bun.resolveSync(specifier, directory)
 * console.log(typeof resolveFrom) // "function"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ResolveFrom = (specifier: string, directory: string) => string;

/**
 * Whether a module request names a DuckDB native addon.
 *
 * **Example** (Recognise the addon specifier)
 *
 * ```ts
 * import { isNativeAddonRequest } from "../../src/NativeAddon.ts"
 *
 * console.log(isNativeAddonRequest("@duckdb/node-bindings-win32-x64/duckdb.node")) // true
 * console.log(isNativeAddonRequest("effect/Effect")) // false
 * ```
 *
 * @param request - The specifier passed to `require`.
 * @returns `true` for `@duckdb/node-bindings-*` requests.
 * @category predicates
 * @since 0.0.0
 */
export const isNativeAddonRequest: (request: string) => boolean = Str.startsWith(NativeAddonPrefix);

/**
 * The directory that holds an executable path, for POSIX and Windows paths.
 *
 * **Example** (Take the executable folder)
 *
 * ```ts
 * import { executableDirectory } from "../../src/NativeAddon.ts"
 *
 * console.log(executableDirectory("C:\\Ext\\practice-kg-mcp.exe")) // "C:\\Ext\\"
 * console.log(executableDirectory("/opt/ext/practice-kg-mcp")) // "/opt/ext/"
 * ```
 *
 * @param executablePath - Usually `process.execPath`.
 * @returns The directory part with its trailing separator, or `.` when the
 *   path has no separator.
 * @category utilities
 * @since 0.0.0
 */
export const executableDirectory = (executablePath: string): string => {
  const cut = O.reduceCompact([Str.lastIndexOf("/")(executablePath), Str.lastIndexOf("\\")(executablePath)], -1, N.max);
  return cut < 0 ? "." : Str.slice(0, cut + 1)(executablePath);
};

/**
 * Resolve a DuckDB native addon from the executable's own folder.
 *
 * **Details**
 *
 * The working directory never takes part: the lookup starts from the
 * directory of `executablePath`. `None` means the caller falls back to the
 * default resolution (`NODE_PATH`, then the working directory).
 *
 * **Example** (Resolve beside the executable)
 *
 * ```ts
 * import { resolveNativeAddon } from "../../src/NativeAddon.ts"
 * import * as O from "effect/Option"
 *
 * const resolved = resolveNativeAddon(
 *   "@duckdb/node-bindings-linux-x64/duckdb.node",
 *   "/opt/ext/practice-kg-mcp",
 *   (specifier, directory) => `${directory}node_modules/${specifier}`
 * )
 * console.log(O.getOrNull(resolved)) // "/opt/ext/node_modules/@duckdb/node-bindings-linux-x64/duckdb.node"
 * ```
 *
 * @param request - The specifier passed to `require`.
 * @param executablePath - Usually `process.execPath`.
 * @param resolveFrom - Resolver anchored at a directory; throws when absent.
 * @returns The resolved file, or `None` for other requests or a missing addon.
 * @category use-cases
 * @since 0.0.0
 */
export const resolveNativeAddon = (
  request: string,
  executablePath: string,
  resolveFrom: ResolveFrom
): O.Option<string> =>
  isNativeAddonRequest(request)
    ? O.liftThrowable(() => resolveFrom(request, executableDirectory(executablePath)))()
    : O.none();

type ResolveFilename = (this: unknown, request: string, ...rest: ReadonlyArray<unknown>) => string;

type ModuleResolver = {
  _resolveFilename: ResolveFilename;
};

let installed = false;

/**
 * Route DuckDB native addon requests through {@link resolveNativeAddon}.
 *
 * **Details**
 *
 * Wraps `Module._resolveFilename` once per process; repeated calls are
 * no-ops. Must run before `@duckdb/node-bindings` is evaluated, which is why
 * `NativeAddon.install.ts` is the first import of the host entrypoint.
 *
 * **Example** (Install before DuckDB loads)
 *
 * ```ts
 * import { installNativeAddonResolver } from "../../src/NativeAddon.ts"
 *
 * installNativeAddonResolver()
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const installNativeAddonResolver = (): void => {
  if (installed) {
    return;
  }
  installed = true;
  const resolver = NodeModule as unknown as ModuleResolver;
  const fallback = resolver._resolveFilename;
  resolver._resolveFilename = function (this: unknown, request: string, ...rest: ReadonlyArray<unknown>) {
    return O.getOrElse(
      resolveNativeAddon(request, process.execPath, (specifier, directory) => Bun.resolveSync(specifier, directory)),
      () => fallback.call(this, request, ...rest)
    );
  };
};
