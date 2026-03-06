import { describe, expect, test } from "bun:test";
import { RetrievalPacket, RunId } from "@beep/repo-memory-domain";
import { RepoRegistrationInput } from "@beep/runtime-protocol";
import { FilePath } from "@beep/schema";
import { BunSqliteTestDriver, makeSqlTestLayer, TestDatabaseInfo } from "@beep/test-utils";
import { DateTime, Effect, Layer } from "effect";
import * as A from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import { LocalRepoMemoryDriver, LocalRepoMemoryDriverConfig, RepoIndexArtifact } from "../src/index.js";

const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRunId = S.decodeUnknownSync(RunId);

const makeDriverLayer = () => {
  const sqlLayer = makeSqlTestLayer({
    config: undefined,
    driver: BunSqliteTestDriver,
  });
  const driverLayer = Layer.effectServices(
    Effect.gen(function* () {
      const info = yield* TestDatabaseInfo;
      const path = yield* Path.Path;

      return yield* Layer.build(
        LocalRepoMemoryDriver.layer(
          new LocalRepoMemoryDriverConfig({
            appDataDir: decodeFilePath(path.join(info.tempDir, "app-data")),
          })
        )
      );
    })
  ).pipe(Layer.provide(sqlLayer));

  return Layer.mergeAll(sqlLayer, driverLayer);
};

const withDriver = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.provide(makeDriverLayer(), { local: true }));

const createRepoFixture = Effect.gen(function* () {
  const info = yield* TestDatabaseInfo;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoPath = path.join(info.tempDir, "fixtures", "repo");
  const sourceDir = path.join(repoPath, "src");

  yield* fs.makeDirectory(sourceDir, { recursive: true });
  yield* fs.writeFileString(path.join(sourceDir, "index.ts"), "export const answer = 42;\n");
  yield* fs.writeFileString(path.join(repoPath, "README.md"), "# fixture\n");

  return decodeFilePath(repoPath);
});

describe("LocalRepoMemoryDriver", () => {
  test("registers a repository and reads it back from SQLite", async () => {
    await Effect.runPromise(
      withDriver(
        Effect.gen(function* () {
          const driver = yield* LocalRepoMemoryDriver;
          const repoPath = yield* createRepoFixture;
          const registration = yield* driver.registerRepo(
            new RepoRegistrationInput({
              repoPath,
              displayName: O.some("Fixture Repo"),
            })
          );
          const repo = yield* driver.getRepo(registration.id);
          const repos = yield* driver.listRepos;

          expect(repo.id).toBe(registration.id);
          expect(repo.repoPath).toBe(repoPath);
          expect(repo.displayName).toBe("Fixture Repo");
          expect(repos).toHaveLength(1);
          expect(repos[0]?.id).toBe(registration.id);
        })
      )
    );
  });

  test("persists and reloads the latest index artifact", async () => {
    await Effect.runPromise(
      withDriver(
        Effect.gen(function* () {
          const driver = yield* LocalRepoMemoryDriver;
          const repoPath = yield* createRepoFixture;
          const registration = yield* driver.registerRepo(
            new RepoRegistrationInput({
              repoPath,
              displayName: O.none(),
            })
          );
          const artifact = new RepoIndexArtifact({
            runId: decodeRunId("run:index:test-artifact"),
            repoId: registration.id,
            sourceSnapshotId: "snapshot:test-artifact",
            indexedFileCount: 1,
            completedAt: DateTime.makeUnsafe(1_706_000_000_000),
          });

          yield* driver.saveIndexArtifact(artifact);
          const latest = yield* driver.latestIndexArtifact(registration.id);

          expect(O.isSome(latest)).toBe(true);
          if (O.isSome(latest)) {
            expect(latest.value.runId).toBe(artifact.runId);
            expect(latest.value.repoId).toBe(registration.id);
            expect(latest.value.indexedFileCount).toBe(1);
          }
        })
      )
    );
  });

  test("persists and reloads retrieval packets", async () => {
    await Effect.runPromise(
      withDriver(
        Effect.gen(function* () {
          const driver = yield* LocalRepoMemoryDriver;
          const repoPath = yield* createRepoFixture;
          const registration = yield* driver.registerRepo(
            new RepoRegistrationInput({
              repoPath,
              displayName: O.none(),
            })
          );
          const runId = decodeRunId("run:query:test-packet");
          const packet = new RetrievalPacket({
            repoId: registration.id,
            query: "How many files?",
            retrievedAt: DateTime.makeUnsafe(1_706_000_000_000),
            summary: "A deterministic retrieval packet.",
            citations: A.empty(),
            notes: A.make("local-driver test note"),
          });

          yield* driver.saveRetrievalPacket(runId, packet);
          const stored = yield* driver.getRetrievalPacket(runId);

          expect(O.isSome(stored)).toBe(true);
          if (O.isSome(stored)) {
            expect(stored.value.repoId).toBe(registration.id);
            expect(stored.value.query).toBe("How many files?");
            expect(stored.value.summary).toBe("A deterministic retrieval packet.");
            expect(stored.value.notes).toEqual(["local-driver test note"]);
          }
        })
      )
    );
  });
});
