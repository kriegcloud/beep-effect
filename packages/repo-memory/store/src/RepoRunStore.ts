/**
 * Repo run projection and retrieval packet store algebra.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryStoreId } from "@beep/identity/packages";
import type { RepoRun, RetrievalPacket, RunId } from "@beep/repo-memory-model";
import { Context, type Effect } from "effect";
import type * as O from "effect/Option";
import type { RepoStoreError } from "./RepoStoreError.js";

const $I = $RepoMemoryStoreId.create("RepoRunStore");

/**
 * Contract for run projections and retrieval packet persistence.
 *
 * @example
 * ```ts
 * import type { RepoRunStoreShape } from "@beep/repo-memory-store"
 *
 * const methods = [
 *   "getRun",
 *   "listRuns",
 *   "saveRun"
 * ] satisfies ReadonlyArray<keyof RepoRunStoreShape>
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export interface RepoRunStoreShape {
  readonly getRetrievalPacket: (runId: RunId) => Effect.Effect<O.Option<RetrievalPacket>, RepoStoreError>;
  readonly getRun: (runId: RunId) => Effect.Effect<O.Option<RepoRun>, RepoStoreError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, RepoStoreError>;
  readonly saveRetrievalPacket: (
    runId: RunId,
    packet: RetrievalPacket
  ) => Effect.Effect<RetrievalPacket, RepoStoreError>;
  readonly saveRun: (run: RepoRun) => Effect.Effect<RepoRun, RepoStoreError>;
}

/**
 * Run store service.
 *
 * @example
 * ```ts
 * import { RepoRunStore } from "@beep/repo-memory-store"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const store = yield* RepoRunStore
 *   return store.listRuns
 * })
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export class RepoRunStore extends Context.Service<RepoRunStore, RepoRunStoreShape>()($I`RepoRunStore`) {}
