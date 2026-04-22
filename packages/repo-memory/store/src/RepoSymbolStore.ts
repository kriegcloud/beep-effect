/**
 * Repository symbol graph store algebra.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryStoreId } from "@beep/identity/packages";
import type { RepoId, RepoImportEdge, RepoSymbolRecord, SourceSnapshotId } from "@beep/repo-memory-model";
import type { FilePath } from "@beep/schema";
import { Context, type Effect } from "effect";
import type { RepoStoreError } from "./RepoStoreError.js";

const $I = $RepoMemoryStoreId.create("RepoSymbolStore");

/**
 * Contract for symbol graph persistence and lookup.
 *
 * @example
 * ```ts
 * import type { RepoSymbolStoreShape } from "@beep/repo-memory-store"
 *
 * const methods = [
 *   "listSymbolRecords",
 *   "searchSymbols",
 *   "listImportEdges"
 * ] satisfies ReadonlyArray<keyof RepoSymbolStoreShape>
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export interface RepoSymbolStoreShape {
  readonly findSymbolsByExactName: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    symbolName: string
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, RepoStoreError>;
  readonly listExportedSymbolsForFile: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    filePath: FilePath
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, RepoStoreError>;
  readonly listImportEdges: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ) => Effect.Effect<ReadonlyArray<RepoImportEdge>, RepoStoreError>;
  readonly listImportEdgesForImporterFile: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    importerFilePath: FilePath
  ) => Effect.Effect<ReadonlyArray<RepoImportEdge>, RepoStoreError>;
  readonly listImportEdgesForResolvedTargetFile: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    resolvedTargetFilePath: FilePath
  ) => Effect.Effect<ReadonlyArray<RepoImportEdge>, RepoStoreError>;
  readonly listSymbolRecords: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, RepoStoreError>;
  readonly searchSymbols: (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    query: string,
    limit: number
  ) => Effect.Effect<ReadonlyArray<RepoSymbolRecord>, RepoStoreError>;
}

/**
 * Symbol store service.
 *
 * @example
 * ```ts
 * import { RepoSymbolStore } from "@beep/repo-memory-store"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const store = yield* RepoSymbolStore
 *   return store.searchSymbols
 * })
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export class RepoSymbolStore extends Context.Service<RepoSymbolStore, RepoSymbolStoreShape>()($I`RepoSymbolStore`) {}
