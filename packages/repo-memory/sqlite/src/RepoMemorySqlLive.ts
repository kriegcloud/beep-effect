import { RepoRegistryStore, RepoRunStore, RepoSnapshotStore, RepoSymbolStore } from "@beep/repo-memory-store";
import { Layer } from "effect";
import { RepoMemorySql, type RepoMemorySqlConfig } from "./internal/RepoMemorySql.js";

const repoRegistryStoreLayer = Layer.effect(
  RepoRegistryStore,
  RepoMemorySql.useSync((sql) =>
    RepoRegistryStore.of({
      getRepo: sql.getRepo,
      listRepos: sql.listRepos,
      registerRepo: sql.registerRepo,
    })
  )
);

const repoSnapshotStoreLayer = Layer.effect(
  RepoSnapshotStore,
  RepoMemorySql.useSync((sql) =>
    RepoSnapshotStore.of({
      countSourceFiles: sql.countSourceFiles,
      findSourceFiles: sql.findSourceFiles,
      latestIndexArtifact: sql.latestIndexArtifact,
      latestSourceSnapshot: sql.latestSourceSnapshot,
      replaceSnapshotArtifacts: sql.replaceSnapshotArtifacts,
      saveIndexArtifact: sql.saveIndexArtifact,
    })
  )
);

const repoSymbolStoreLayer = Layer.effect(
  RepoSymbolStore,
  RepoMemorySql.useSync((sql) =>
    RepoSymbolStore.of({
      findSymbolsByExactName: sql.findSymbolsByExactName,
      listExportedSymbolsForFile: sql.listExportedSymbolsForFile,
      listImportEdges: sql.listImportEdges,
      listImportEdgesForImporterFile: sql.listImportEdgesForImporterFile,
      listImportEdgesForResolvedTargetFile: sql.listImportEdgesForResolvedTargetFile,
      listSymbolRecords: sql.listSymbolRecords,
      searchSymbols: sql.searchSymbols,
    })
  )
);

const repoRunStoreLayer = Layer.effect(
  RepoRunStore,
  RepoMemorySql.useSync((sql) =>
    RepoRunStore.of({
      getRetrievalPacket: sql.getRetrievalPacket,
      getRun: sql.getRun,
      listRuns: sql.listRuns,
      saveRetrievalPacket: sql.saveRetrievalPacket,
      saveRun: sql.saveRun,
    })
  )
);

/**
 * Live sqlite-backed repo-memory store layers.
 *
 * @since 0.0.0
 * @category Services
 */
export const RepoMemorySqlLive = (config: RepoMemorySqlConfig) =>
  Layer.mergeAll(repoRegistryStoreLayer, repoSnapshotStoreLayer, repoSymbolStoreLayer, repoRunStoreLayer).pipe(
    Layer.provide(RepoMemorySql.layer(config))
  );
