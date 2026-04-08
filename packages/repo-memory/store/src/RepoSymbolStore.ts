import { $RepoMemoryStoreId } from "@beep/identity/packages";
import type { RepoId, RepoImportEdge, RepoSymbolRecord, SourceSnapshotId } from "@beep/repo-memory-model";
import type { FilePath } from "@beep/schema";
import { Context, type Effect } from "effect";
import type { RepoStoreError } from "./RepoStoreError.js";

const $I = $RepoMemoryStoreId.create("RepoSymbolStore");

/**
 * Contract for symbol graph persistence and lookup.
 *
 * @since 0.0.0
 * @category PortContract
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
 * @since 0.0.0
 * @category PortContract
 */
export class RepoSymbolStore extends Context.Service<RepoSymbolStore, RepoSymbolStoreShape>()($I`RepoSymbolStore`) {}
