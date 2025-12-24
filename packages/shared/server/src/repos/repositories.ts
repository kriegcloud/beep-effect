/**
 * Consolidated repository namespace with all shared repository services and layers.
 *
 * @since 0.1.0
 */
import type { Db } from "@beep/shared-server/Db";
import * as Layer from "effect/Layer";
import type { SharedDb } from "../db";
import { FileRepo } from "./File.repo";
import { FolderRepo } from "./Folder.repo";
import { UploadSessionRepo } from "./UploadSession.repo";

/**
 * Union type of all shared repository services.
 *
 * @example
 * ```typescript
 * import type { SharedRepos } from "@beep/shared-server"
 * import * as Effect from "effect/Effect"
 *
 * type MyServices = SharedRepos | OtherService
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type SharedRepos = FileRepo | FolderRepo | UploadSessionRepo;

/**
 * Layer type providing all shared repositories with database dependencies.
 *
 * @example
 * ```typescript
 * import type { SharedReposLive } from "@beep/shared-server"
 *
 * type MyLayer = SharedReposLive | OtherLayer
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type SharedReposLive = Layer.Layer<SharedRepos, never, Db.SliceDbRequirements | SharedDb.SharedDb>;

/**
 * Combined layer providing all shared repository services.
 *
 * @example
 * ```typescript
 * import { SharedRepos } from "@beep/shared-server"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const fileRepo = yield* FileRepo
 *   const folderRepo = yield* FolderRepo
 *   // Use repositories...
 * }).pipe(Effect.provide(SharedRepos.layer))
 * ```
 *
 * @category layers
 * @since 0.1.0
 */
export const layer: SharedReposLive = Layer.mergeAll(FileRepo.Default, FolderRepo.Default, UploadSessionRepo.Default);

/**
 * Re-exports File repository implementation.
 *
 * @example
 * ```typescript
 * import { FileRepo } from "@beep/shared-server/repos/repositories"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./File.repo";

/**
 * Re-exports Folder repository implementation.
 *
 * @example
 * ```typescript
 * import { FolderRepo } from "@beep/shared-server/repos/repositories"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./Folder.repo";

/**
 * Re-exports UploadSession repository implementation.
 *
 * @example
 * ```typescript
 * import { UploadSessionRepo } from "@beep/shared-server/repos/repositories"
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./UploadSession.repo";
