/**
 * Repository source snapshot store algebra.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryStoreId } from "@beep/identity/packages";
import type {
  ReplaceSnapshotArtifactsInput,
  RepoId,
  RepoIndexArtifact,
  RepoSourceFile,
  RepoSourceSnapshot,
  SourceSnapshotId,
} from "@beep/repo-memory-model";
import { Context, type Effect } from "effect";
import type * as O from "effect/Option";
import type { RepoStoreError } from "./RepoStoreError.js";

const $I = $RepoMemoryStoreId.create("RepoSnapshotStore");

/**
 * Contract for repository snapshot and artifact persistence.
 *
 * @example
 * ```ts
 * import type { RepoSnapshotStoreShape } from "@beep/repo-memory-store"
 *
 * const methods = [
 *   "latestSourceSnapshot",
 *   "replaceSnapshotArtifacts",
 *   "saveIndexArtifact"
 * ] satisfies ReadonlyArray<keyof RepoSnapshotStoreShape>
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export interface RepoSnapshotStoreShape {
  readonly countSourceFiles: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ) => Effect.Effect<number, RepoStoreError>;
  readonly findSourceFiles: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    query: string,
    limit: number
  ) => Effect.Effect<ReadonlyArray<RepoSourceFile>, RepoStoreError>;
  readonly latestIndexArtifact: (repoId: RepoId) => Effect.Effect<O.Option<RepoIndexArtifact>, RepoStoreError>;
  readonly latestSourceSnapshot: (repoId: RepoId) => Effect.Effect<O.Option<RepoSourceSnapshot>, RepoStoreError>;
  readonly replaceSnapshotArtifacts: (
    input: ReplaceSnapshotArtifactsInput
  ) => Effect.Effect<RepoIndexArtifact, RepoStoreError>;
  readonly saveIndexArtifact: (artifact: RepoIndexArtifact) => Effect.Effect<RepoIndexArtifact, RepoStoreError>;
}

/**
 * Snapshot store service.
 *
 * @example
 * ```ts
 * import { RepoSnapshotStore } from "@beep/repo-memory-store"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const store = yield* RepoSnapshotStore
 *   return store.latestSourceSnapshot
 * })
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export class RepoSnapshotStore extends Context.Service<RepoSnapshotStore, RepoSnapshotStoreShape>()(
  $I`RepoSnapshotStore`
) {}
