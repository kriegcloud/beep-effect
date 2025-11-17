import { DomainError } from "@beep/tooling-utils/repo/Errors";
import type * as FileSystem from "@effect/platform/FileSystem";
import type * as Path from "@effect/platform/Path";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import type { FsUtils } from "./FsUtils";
import type { GetWorkSpaceDir } from "./repo";
import { findRepoRoot, getWorkspaceDir, resolveWorkspaceDirs } from "./repo/index";

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
 */

export interface RepoUtils extends Effect.Effect.Success<typeof make> {}

/**
 * Service tag for dependency injection via Effect Context.
 *
 * Usage:
 * ```ts
 * import { RepoUtils } from "@beep/tooling-utils";
 * const utils = yield* RepoUtils; // inside Effect.gen
 * ```
 */
export const RepoUtils = Context.GenericTag<RepoUtils>("@beep/tooling-utils/RepoUtils");
/**
 * Live Layer implementation backed by Node's FileSystem/Path.
 * Compose into your runtime or test layers as needed.
 * @example
 * ```ts
 * import { RepoUtilsLive } from "@beep/tooling-utils";
 * import * as Effect from "effect/Effect";
 * const stuff = Effect.gen(function* () {
 *  const utils = yield* RepoUtilsLive;
 * }).pipe(Effect.provide(RepoUtilsLive));
 * ```
 */

export const RepoUtilsLive = Layer.provideMerge(
  Layer.effect(RepoUtils, make),
  Layer.provideMerge(BunFileSystem.layer, BunPath.layerPosix)
);
