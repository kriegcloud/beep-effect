import {
  RepoRegistryStore,
  RepoRunStore,
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

const repoRegistryLayer = Layer.succeed(RepoRegistryStore)(
  RepoRegistryStore.of({
    getRepo: () => Effect.fail(repoStoreError()),
    listRepos: Effect.succeed([]),
    registerRepo: () => Effect.fail(repoStoreError()),
  })
);

const repoSnapshotLayer = Layer.succeed(RepoSnapshotStore)(
  RepoSnapshotStore.of({
    countSourceFiles: () => Effect.succeed(0),
    findSourceFiles: () => Effect.succeed([]),
    latestIndexArtifact: () => Effect.succeed(O.none()),
    latestSourceSnapshot: () => Effect.succeed(O.none()),
    replaceSnapshotArtifacts: () => Effect.fail(repoStoreError()),
    saveIndexArtifact: () => Effect.fail(repoStoreError()),
  })
);

const repoSymbolLayer = Layer.succeed(RepoSymbolStore)(
  RepoSymbolStore.of({
    findSymbolsByExactName: () => Effect.succeed([]),
    listExportedSymbolsForFile: () => Effect.succeed([]),
    listImportEdges: () => Effect.succeed([]),
    listImportEdgesForImporterFile: () => Effect.succeed([]),
    listImportEdgesForResolvedTargetFile: () => Effect.succeed([]),
    listSymbolRecords: () => Effect.succeed([]),
    searchSymbols: () => Effect.succeed([]),
  })
);

const repoRunLayer = Layer.succeed(RepoRunStore)(
  RepoRunStore.of({
    getRetrievalPacket: () => Effect.succeed(O.none()),
    getRun: () => Effect.succeed(O.none()),
    listRuns: Effect.succeed([]),
    saveRetrievalPacket: () => Effect.fail(repoStoreError()),
    saveRun: () => Effect.fail(repoStoreError()),
  })
);

describe("repo-memory store", () => {
  it.effect("provides the canonical store service tags", () =>
    Effect.gen(function* () {
      const registry = yield* RepoRegistryStore;
      const snapshot = yield* RepoSnapshotStore;
      const symbol = yield* RepoSymbolStore;
      const run = yield* RepoRunStore;

      expect(typeof registry.getRepo).toBe("function");
      expect(typeof snapshot.latestSourceSnapshot).toBe("function");
      expect(typeof symbol.searchSymbols).toBe("function");
      expect(typeof run.getRun).toBe("function");
    }).pipe(Effect.provide(Layer.mergeAll(repoRegistryLayer, repoSnapshotLayer, repoSymbolLayer, repoRunLayer)))
  );

  it("constructs typed store errors", () => {
    const error = repoStoreError();

    expect(error._tag).toBe("RepoStoreError");
    expect(error.message).toBe("unimplemented");
    expect(error.status).toBe(500);
  });
});
