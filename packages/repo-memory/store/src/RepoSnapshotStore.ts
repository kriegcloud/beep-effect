import { $RepoMemoryStoreId } from "@beep/identity/packages";
import type {
  ReplaceSnapshotArtifactsInput,
  RepoId,
  RepoIndexArtifact,
  RepoSourceFile,
  RepoSourceSnapshot,
  SourceSnapshotId,
} from "@beep/repo-memory-model";
import { type Effect, ServiceMap } from "effect";
import type * as O from "effect/Option";
import type { RepoStoreError } from "./RepoStoreError.js";

const $I = $RepoMemoryStoreId.create("RepoSnapshotStore");

/**
 * Contract for repository snapshot and artifact persistence.
 *
 * @since 0.0.0
 * @category PortContract
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
 * @since 0.0.0
 * @category PortContract
 */
export class RepoSnapshotStore extends ServiceMap.Service<RepoSnapshotStore, RepoSnapshotStoreShape>()(
  $I`RepoSnapshotStore`
) {}
