/**
 * Semantic artifact store algebra.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryStoreId } from "@beep/identity/packages";
import type { RepoId, RepoSemanticArtifacts, SourceSnapshotId } from "@beep/repo-memory-model";
import { Context, type Effect } from "effect";
import type * as O from "effect/Option";
import type { RepoStoreError } from "./RepoStoreError.js";

const $I = $RepoMemoryStoreId.create("RepoSemanticStore");

/**
 * Contract for snapshot-scoped semantic artifact persistence.
 *
 * @example
 * ```ts
 * import type { RepoSemanticStoreShape } from "@beep/repo-memory-store"
 *
 * const methods = [
 *   "getSemanticArtifacts",
 *   "latestSemanticArtifacts",
 *   "saveSemanticArtifacts"
 * ] satisfies ReadonlyArray<keyof RepoSemanticStoreShape>
 * ```
 *
 * @since 0.0.0
 * @category port contract
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
 * @example
 * ```ts
 * import { RepoSemanticStore } from "@beep/repo-memory-store"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const store = yield* RepoSemanticStore
 *   return store.latestSemanticArtifacts
 * })
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export class RepoSemanticStore extends Context.Service<RepoSemanticStore, RepoSemanticStoreShape>()(
  $I`RepoSemanticStore`
) {}
