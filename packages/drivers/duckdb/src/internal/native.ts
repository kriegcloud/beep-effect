/**
 * Native DuckDB instance policy and lifecycle helpers.
 *
 * **Details**
 *
 * File-backed opens, including READ_ONLY opens on both surfaces, go through
 * `DuckDBInstance.fromCache`. DuckDB refuses mixed access modes for one file
 * in a process instead of creating private instances that can read reused
 * blocks and release a writer's file lock. In-memory databases always get a
 * private instance. Read-write configuration is passed through unchanged.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { thunkUndefined } from "@beep/utils";
import { DuckDBInstance } from "@duckdb/node-api";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import * as Result from "effect/Result";
import * as Str from "effect/String";
import { toSqlError } from "./classify.ts";
import type { DuckDBConnection } from "@duckdb/node-api";
import type * as Scope from "effect/Scope";
import type { SqlError } from "effect/sql/SqlError";

const ACCESS_MODE = "access_mode";
const READ_ONLY = "READ_ONLY";
const MEMORY_PATH = ":memory:";

class ResolvedInstance extends Data.Class<{
  readonly path: string;
  readonly options: Record<string, string>;
  readonly cached: boolean;
}> {}

type InstanceInput = {
  readonly databasePath: string;
  readonly databaseOptions?: Record<string, string> | undefined;
  readonly readOnly?: boolean | undefined;
};

const isAccessModeKey = (key: string): boolean => Str.toLowerCase(key) === ACCESS_MODE;

const isInMemoryPath = (path: string): boolean => path === "" || Str.startsWith(MEMORY_PATH)(path);

const resolveInstance = (input: InstanceInput): ResolvedInstance => {
  const base = input.databaseOptions ?? {};
  const options =
    input.readOnly === true
      ? R.set(
          R.filter(base, (_, key) => !isAccessModeKey(key)),
          ACCESS_MODE,
          READ_ONLY
        )
      : base;
  const cached = !isInMemoryPath(input.databasePath);
  return new ResolvedInstance({ path: input.databasePath, options, cached });
};

const openNativeInstance = (resolved: ResolvedInstance): Promise<DuckDBInstance> =>
  resolved.cached
    ? DuckDBInstance.fromCache(resolved.path, resolved.options)
    : DuckDBInstance.create(resolved.path, resolved.options);

/**
 * Run a native DuckDB call and ignore any failure it throws.
 *
 * **Example** (Ignoring a throwing native call)
 *
 * ```ts
 * import { ignoreNative } from "./native.ts"
 *
 * // A throwing native call is swallowed instead of propagating.
 * ignoreNative(() => {
 *   throw new Error("native call failed")
 * })
 * ```
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const ignoreNative = (f: () => void): void => {
  Result.try(f).pipe(Result.getOrElse(thunkUndefined));
};

/**
 * Close a native DuckDB resource while suppressing close-time failures.
 *
 * **Example** (Swallowing close failures)
 *
 * ```ts
 * import { ignoreNativeClose } from "./native.ts"
 *
 * // A throwing close is swallowed instead of propagating during teardown.
 * ignoreNativeClose(() => {
 *   throw new Error("close failed")
 * })
 * ```
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const ignoreNativeClose: (close: () => void) => void = ignoreNative;

/**
 * Open a scoped DuckDB instance under the client instance policy.
 *
 * **Details**
 *
 * File-backed opens, READ_ONLY ones included, go through `fromCache`; a
 * READ_ONLY open beside an in-process read-write open is refused with a
 * `ConnectionError`. In-memory paths get a private instance. The instance
 * wrapper is closed when the scope closes; closing it never affects another
 * client sharing the same cached database.
 *
 * **Example** (Acquiring an in-memory instance)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { acquireInstance } from "./native.ts"
 *
 * const program = Effect.scoped(acquireInstance({ databasePath: ":memory:" }))
 * ```
 *
 * @internal
 * @category constructors
 * @since 0.0.0
 */
export const acquireInstance = (input: InstanceInput): Effect.Effect<DuckDBInstance, SqlError, Scope.Scope> =>
  Effect.acquireRelease(
    Effect.tryPromise({
      try: () => openNativeInstance(resolveInstance(input)),
      catch: (cause) => toSqlError(cause, "connect"),
    }),
    (instance) => Effect.sync(() => ignoreNativeClose(() => instance.closeSync()))
  );

/**
 * Open an unscoped DuckDB instance under the legacy instance policy.
 *
 * **Details**
 *
 * Same cached file policy as the client, including READ_ONLY refusal beside
 * an in-process read-write open. The caller owns closing the instance.
 *
 * **Example** (Opening a legacy instance)
 *
 * ```ts
 * import { openLegacyInstance } from "./native.ts"
 *
 * const instance = openLegacyInstance({ databasePath: ":memory:" })
 * ```
 *
 * @internal
 * @category constructors
 * @since 0.0.0
 */
export const openLegacyInstance = (input: InstanceInput): Promise<DuckDBInstance> =>
  openNativeInstance(resolveInstance(input));

/**
 * Open a scoped connection on a DuckDB instance.
 *
 * **Example** (Acquiring a connection)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { acquireConnection, acquireInstance } from "./native.ts"
 *
 * const program = Effect.scoped(
 *   Effect.flatMap(acquireInstance({ databasePath: ":memory:" }), acquireConnection)
 * )
 * ```
 *
 * @internal
 * @category constructors
 * @since 0.0.0
 */
export const acquireConnection = (instance: DuckDBInstance): Effect.Effect<DuckDBConnection, SqlError, Scope.Scope> =>
  Effect.acquireRelease(
    Effect.tryPromise({
      try: () => instance.connect(),
      catch: (cause) => toSqlError(cause, "connect"),
    }),
    (connection) => Effect.sync(() => ignoreNativeClose(() => connection.closeSync()))
  );

/**
 * Release a native DuckDB connection and its owning instance.
 *
 * **Example** (Releasing connection and instance)
 *
 * ```ts
 * import { releaseNativeConnection } from "./native.ts"
 *
 * // Effect that closes the connection, then its owning instance, on release.
 * const release = releaseNativeConnection
 * ```
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const releaseNativeConnection = (native: {
  readonly connection: DuckDBConnection;
  readonly instance: DuckDBInstance;
}): Effect.Effect<void> =>
  Effect.sync(() => {
    ignoreNativeClose(() => native.connection.closeSync());
    ignoreNativeClose(() => native.instance.closeSync());
  });
