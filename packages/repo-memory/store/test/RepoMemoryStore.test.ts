import {
  RepoRegistryStore,
  RepoRunStore,
  RepoSemanticStore,
  RepoSnapshotStore,
  RepoStoreError,
  RepoSymbolStore,
} from "@beep/repo-memory-store";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as O from "effect/Option";

const repoStoreError = () =>
  new RepoStoreError({
    message: "unimplemented",
    status: 500,
    cause: O.none(),
  });
const repoRegistryGetRepo = Effect.fn("RepoRegistryStore.getRepo")(() => Effect.fail(repoStoreError()));
const repoRegistryRegisterRepo = Effect.fn("RepoRegistryStore.registerRepo")(() => Effect.fail(repoStoreError()));
const repoSnapshotCountSourceFiles = Effect.fn("RepoSnapshotStore.countSourceFiles")(() => Effect.succeed(0));
const repoSnapshotFindSourceFiles = Effect.fn("RepoSnapshotStore.findSourceFiles")(() => Effect.succeed([]));
const repoSnapshotLatestIndexArtifact = Effect.fn("RepoSnapshotStore.latestIndexArtifact")(() =>
  Effect.succeed(O.none())
);
const repoSnapshotLatestSourceSnapshot = Effect.fn("RepoSnapshotStore.latestSourceSnapshot")(() =>
  Effect.succeed(O.none())
);
const repoSnapshotReplaceSnapshotArtifacts = Effect.fn("RepoSnapshotStore.replaceSnapshotArtifacts")(() =>
  Effect.fail(repoStoreError())
);
const repoSnapshotSaveIndexArtifact = Effect.fn("RepoSnapshotStore.saveIndexArtifact")(() =>
  Effect.fail(repoStoreError())
);
const repoSymbolFindSymbolsByExactName = Effect.fn("RepoSymbolStore.findSymbolsByExactName")(() => Effect.succeed([]));
const repoSymbolListExportedSymbolsForFile = Effect.fn("RepoSymbolStore.listExportedSymbolsForFile")(() =>
  Effect.succeed([])
);
const repoSymbolListImportEdges = Effect.fn("RepoSymbolStore.listImportEdges")(() => Effect.succeed([]));
const repoSymbolListImportEdgesForImporterFile = Effect.fn("RepoSymbolStore.listImportEdgesForImporterFile")(() =>
  Effect.succeed([])
);
const repoSymbolListImportEdgesForResolvedTargetFile = Effect.fn(
  "RepoSymbolStore.listImportEdgesForResolvedTargetFile"
)(() => Effect.succeed([]));
const repoSymbolListSymbolRecords = Effect.fn("RepoSymbolStore.listSymbolRecords")(() => Effect.succeed([]));
const repoSymbolSearchSymbols = Effect.fn("RepoSymbolStore.searchSymbols")(() => Effect.succeed([]));
const repoRunGetRetrievalPacket = Effect.fn("RepoRunStore.getRetrievalPacket")(() => Effect.succeed(O.none()));
const repoRunGetRun = Effect.fn("RepoRunStore.getRun")(() => Effect.succeed(O.none()));
const repoRunSaveRetrievalPacket = Effect.fn("RepoRunStore.saveRetrievalPacket")(() => Effect.fail(repoStoreError()));
const repoRunSaveRun = Effect.fn("RepoRunStore.saveRun")(() => Effect.fail(repoStoreError()));
const repoSemanticGetSemanticArtifacts = Effect.fn("RepoSemanticStore.getSemanticArtifacts")(() =>
  Effect.succeed(O.none())
);
const repoSemanticLatestSemanticArtifacts = Effect.fn("RepoSemanticStore.latestSemanticArtifacts")(() =>
  Effect.succeed(O.none())
);
const repoSemanticSaveSemanticArtifacts = Effect.fn("RepoSemanticStore.saveSemanticArtifacts")(() =>
  Effect.fail(repoStoreError())
);

const repoRegistryLayer = Layer.succeed(RepoRegistryStore)(
  RepoRegistryStore.of({
    getRepo: repoRegistryGetRepo,
    listRepos: Effect.succeed([]),
    registerRepo: repoRegistryRegisterRepo,
  })
);

const repoSnapshotLayer = Layer.succeed(RepoSnapshotStore)(
  RepoSnapshotStore.of({
    countSourceFiles: repoSnapshotCountSourceFiles,
    findSourceFiles: repoSnapshotFindSourceFiles,
    latestIndexArtifact: repoSnapshotLatestIndexArtifact,
    latestSourceSnapshot: repoSnapshotLatestSourceSnapshot,
    replaceSnapshotArtifacts: repoSnapshotReplaceSnapshotArtifacts,
    saveIndexArtifact: repoSnapshotSaveIndexArtifact,
  })
);

const repoSymbolLayer = Layer.succeed(RepoSymbolStore)(
  RepoSymbolStore.of({
    findSymbolsByExactName: repoSymbolFindSymbolsByExactName,
    listExportedSymbolsForFile: repoSymbolListExportedSymbolsForFile,
    listImportEdges: repoSymbolListImportEdges,
    listImportEdgesForImporterFile: repoSymbolListImportEdgesForImporterFile,
    listImportEdgesForResolvedTargetFile: repoSymbolListImportEdgesForResolvedTargetFile,
    listSymbolRecords: repoSymbolListSymbolRecords,
    searchSymbols: repoSymbolSearchSymbols,
  })
);

const repoRunLayer = Layer.succeed(RepoRunStore)(
  RepoRunStore.of({
    getRetrievalPacket: repoRunGetRetrievalPacket,
    getRun: repoRunGetRun,
    listRuns: Effect.succeed([]),
    saveRetrievalPacket: repoRunSaveRetrievalPacket,
    saveRun: repoRunSaveRun,
  })
);

const repoSemanticLayer = Layer.succeed(RepoSemanticStore)(
  RepoSemanticStore.of({
    getSemanticArtifacts: repoSemanticGetSemanticArtifacts,
    latestSemanticArtifacts: repoSemanticLatestSemanticArtifacts,
    saveSemanticArtifacts: repoSemanticSaveSemanticArtifacts,
  })
);

describe("repo-memory store", () => {
  it.effect("provides the canonical store service tags", () =>
    Effect.gen(function* () {
      const registry = yield* RepoRegistryStore;
      const snapshot = yield* RepoSnapshotStore;
      const symbol = yield* RepoSymbolStore;
      const run = yield* RepoRunStore;
      const semantic = yield* RepoSemanticStore;

      expect(typeof registry.getRepo).toBe("function");
      expect(typeof snapshot.latestSourceSnapshot).toBe("function");
      expect(typeof symbol.searchSymbols).toBe("function");
      expect(typeof run.getRun).toBe("function");
      expect(typeof semantic.latestSemanticArtifacts).toBe("function");
    }).pipe(
      Effect.provide(
        Layer.mergeAll(repoRegistryLayer, repoSnapshotLayer, repoSymbolLayer, repoRunLayer, repoSemanticLayer)
      )
    )
  );

  it("constructs typed store errors", () => {
    const error = repoStoreError();

    expect(error._tag).toBe("RepoStoreError");
    expect(error.message).toBe("unimplemented");
    expect(error.status).toBe(500);
  });
});
