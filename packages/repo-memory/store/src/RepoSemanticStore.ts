import { $RepoMemoryStoreId } from "@beep/identity/packages";
import type { RepoId, RepoSemanticArtifacts, SourceSnapshotId } from "@beep/repo-memory-model";
import { Context, type Effect } from "effect";
import type * as O from "effect/Option";
import type { RepoStoreError } from "./RepoStoreError.js";

const $I = $RepoMemoryStoreId.create("RepoSemanticStore");

/**
 * Contract for snapshot-scoped semantic artifact persistence.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface RepoSemanticStoreShape {
  readonly getSemanticArtifacts: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ) => Effect.Effect<O.Option<RepoSemanticArtifacts>, RepoStoreError>;
  readonly latestSemanticArtifacts: (repoId: RepoId) => Effect.Effect<O.Option<RepoSemanticArtifacts>, RepoStoreError>;
  readonly saveSemanticArtifacts: (
    artifacts: RepoSemanticArtifacts
  ) => Effect.Effect<RepoSemanticArtifacts, RepoStoreError>;
}

/**
 * Semantic artifact store service.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoSemanticStore extends Context.Service<RepoSemanticStore, RepoSemanticStoreShape>()(
  $I`RepoSemanticStore`
) {}
