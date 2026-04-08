import { $RepoMemoryStoreId } from "@beep/identity/packages";
import type { RepoRun, RetrievalPacket, RunId } from "@beep/repo-memory-model";
import { Context, type Effect } from "effect";
import type * as O from "effect/Option";
import type { RepoStoreError } from "./RepoStoreError.js";

const $I = $RepoMemoryStoreId.create("RepoRunStore");

/**
 * Contract for run projections and retrieval packet persistence.
 *
 * @since 0.0.0
 * @category PortContract
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
 * @since 0.0.0
 * @category PortContract
 */
export class RepoRunStore extends Context.Service<RepoRunStore, RepoRunStoreShape>()($I`RepoRunStore`) {}
