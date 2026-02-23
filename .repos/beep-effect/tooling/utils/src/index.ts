/**
 * Tooling utilities public API.
 *
 * Exposes:
 * - FsUtils / FsUtilsLive: Effect-based filesystem/glob helpers
 * - RepoUtils / RepoUtilsLive: repository utility service layer
 * - Repo: repository utilities namespace (workspaces, dependencies, tsconfig)
 * - collectUniqueNpmDependencies: unique dependency collection
 * - schemas: Effect schemas used by the tooling
 *
 * @since 0.1.0
 */

import * as RepoNamespace from "./repo.js";

/**
 * Re-exports all filesystem utilities from the FsUtils module.
 *
 * @example
 * ```typescript
 * import { FsUtils, FsUtilsLive } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const utils = yield* FsUtils
 *   yield* utils.writeJson("output.json", { status: "ok" })
 * }).pipe(Effect.provide(FsUtilsLive))
 * ```
 *
 * @category services
 * @since 0.1.0
 */
export * from "./FsUtils.js";

/**
 * Re-exports all repository utilities from the RepoUtils module.
 *
 * @example
 * ```typescript
 * import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const repo = yield* RepoUtils
 *   console.log("Repository root:", repo.REPOSITORY_ROOT)
 * }).pipe(Effect.provide(RepoUtilsLive))
 * ```
 *
 * @category services
 * @since 0.1.0
 */
export * from "./RepoUtils.js";

/**
 * Re-exports unique dependency collection utilities.
 *
 * @example
 * ```typescript
 * import { collectUniqueNpmDependencies } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./repo/UniqueDependencies.js";

/**
 * Repository-level utilities namespace for monorepo operations.
 *
 * Provides functions to work with workspaces, dependencies, tsconfig files,
 * and other monorepo-wide operations.
 *
 * @example
 * ```typescript
 * import { Repo } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const workspaces = yield* Repo.resolveWorkspaceDirs
 *   console.log(workspaces)
 * })
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export const Repo = RepoNamespace;

/**
 * Re-exports all repository utilities from the repo submodule.
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./repo/index.js";
/**
 * Re-exports all Effect Schema utilities and environment variable schemas.
 *
 * @example
 * ```typescript
 * import { DotEnv, EnvironmentVariableName } from "@beep/tooling-utils"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./schemas/index.js";
/**
 * Re-exports types used by the tooling utilities.
 *
 * @category types
 * @since 0.1.0
 */
export * from "./types.js";
