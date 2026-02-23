/**
 * Repository utilities service layer.
 *
 * Provides the RepoUtils service for repository-wide operations including
 * workspace resolution, dependency collection, and tsconfig management.
 *
 * @since 0.1.0
 */
import type * as FileSystem from "@effect/platform/FileSystem";
import type * as Path from "@effect/platform/Path";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import { type FsUtils, FsUtilsLive } from "./FsUtils.js";
import { DomainError } from "./repo/Errors.js";
import { findRepoRoot, getWorkspaceDir, resolveWorkspaceDirs } from "./repo/index.js";
import type { GetWorkSpaceDir } from "./repo.js";

interface IRepoUtilsEffect {
  readonly REPOSITORY_ROOT: string;
  readonly RepoWorkspaceMap: HashMap.HashMap<string, string>;
  readonly getWorkspaceDir: GetWorkSpaceDir;
}

/**
 * Internal constructor for the RepoUtils service.
 *
 * Exposes convenient, Effect-based filesystem and glob helpers with
 * observability spans and sensible error messages. All functions are
 * pure wrappers that defer side-effects to the provided FileSystem and Path
 * services.
 */
const make: Effect.Effect<IRepoUtilsEffect, DomainError, FileSystem.FileSystem | FsUtils | Path.Path> = Effect.gen(
  function* () {
    const REPOSITORY_ROOT = yield* findRepoRoot;

    const RepoWorkspaceMap = yield* resolveWorkspaceDirs;

    return {
      REPOSITORY_ROOT,
      RepoWorkspaceMap,
      getWorkspaceDir,
    } as const;
  }
).pipe(Effect.mapError(DomainError.selfOrMap));

/**
 * Public interface of the RepoUtils service. Prefer to depend on this tag in
 * your Effects and provide {@link RepoUtilsLive} at the edges.
 *
 * @example
 * ```typescript
 * import { RepoUtils } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const repo = yield* RepoUtils
 *   console.log("Repository root:", repo.REPOSITORY_ROOT)
 *   const dir = yield* repo.getWorkspaceDir("@beep/common-schema")
 *   console.log("Workspace dir:", dir)
 * })
 * ```
 *
 * @category Services
 * @since 0.1.0
 */

export interface RepoUtils extends Effect.Effect.Success<typeof make> {}

/**
 * Service tag for dependency injection via Effect Context.
 *
 * @example
 * ```typescript
 * import { RepoUtils } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const repo = yield* RepoUtils
 *   const workspaces = repo.RepoWorkspaceMap
 * })
 * ```
 *
 * @category Services
 * @since 0.1.0
 */
export const RepoUtils = Context.GenericTag<RepoUtils>("@beep/tooling-utils/RepoUtils");
/**
 * Live Layer implementation backed by Bun's FileSystem/Path.
 *
 * Compose into your runtime or test layers as needed.
 *
 * @example
 * ```typescript
 * import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const repo = yield* RepoUtils
 *   const dir = yield* repo.getWorkspaceDir("@beep/iam-domain")
 * }).pipe(Effect.provide(RepoUtilsLive))
 * ```
 *
 * @category Services
 * @since 0.1.0
 */

export const RepoUtilsLive = Layer.effect(RepoUtils, make).pipe(
  Layer.provide(FsUtilsLive),
  Layer.provide(BunFileSystem.layer),
  Layer.provide(BunPath.layerPosix)
);
