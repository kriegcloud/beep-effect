import {
  Citation,
  RepoImportEdge,
  RepoSourceFile,
  RepoSourceSnapshot,
  RepoSymbolRecord,
  RetrievalPacket,
  RunId,
  SourceSnapshotId,
} from "@beep/repo-memory-domain";
import {
  LocalRepoMemoryDriver,
  LocalRepoMemoryDriverConfig,
  ReplaceSnapshotArtifactsInput,
  RepoIndexArtifact,
} from "@beep/repo-memory-drivers-local";
import { RepoRegistrationInput } from "@beep/runtime-protocol";
import { FilePath, Sha256Hex } from "@beep/schema";
import { makeSqlTestLayer, NodeSqliteTestDriver, TestDatabaseInfo } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";

const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRunId = S.decodeUnknownSync(RunId);
const decodeSha256Hex = S.decodeUnknownSync(Sha256Hex);
const decodeSourceSnapshotId = S.decodeUnknownSync(SourceSnapshotId);

const makeDriverLayer = () => {
  const sqlLayer = makeSqlTestLayer({
    config: undefined,
    driver: NodeSqliteTestDriver,
  });
  const driverLayer = Layer.unwrap(
    Effect.gen(function* () {
      const info = yield* TestDatabaseInfo;
      const path = yield* Path.Path;

      return LocalRepoMemoryDriver.layer(
        new LocalRepoMemoryDriverConfig({
          appDataDir: decodeFilePath(path.join(info.tempDir, "app-data")),
        })
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

const makeSnapshotArtifacts = (options: {
  readonly capturedAtMillis: number;
  readonly files: ReadonlyArray<{
    readonly filePath: string;
    readonly contentHash: string;
    readonly exportedSymbols: ReadonlyArray<{
      readonly endLine: number;
      readonly name: string;
      readonly searchText?: string;
      readonly signature: string;
      readonly startLine: number;
      readonly kind: "class" | "const" | "enum" | "function" | "interface" | "namespace" | "typeAlias";
    }>;
    readonly imports?: ReadonlyArray<{
      readonly importedName?: string;
      readonly moduleSpecifier: string;
      readonly typeOnly?: boolean;
    }>;
  }>;
  readonly registrationId: string;
  readonly runId: string;
  readonly snapshotId: string;
}) =>
  new ReplaceSnapshotArtifactsInput({
    artifact: new RepoIndexArtifact({
      runId: decodeRunId(options.runId),
      repoId: options.registrationId,
      sourceSnapshotId: decodeSourceSnapshotId(options.snapshotId),
      indexedFileCount: A.length(options.files),
      completedAt: DateTime.makeUnsafe(options.capturedAtMillis),
    }),
    snapshot: new RepoSourceSnapshot({
      id: decodeSourceSnapshotId(options.snapshotId),
      repoId: options.registrationId,
      capturedAt: DateTime.makeUnsafe(options.capturedAtMillis),
      fileCount: A.length(options.files),
    }),
    files: pipe(
      options.files,
      A.map(
        (file) =>
          new RepoSourceFile({
            repoId: options.registrationId,
            sourceSnapshotId: decodeSourceSnapshotId(options.snapshotId),
            filePath: decodeFilePath(file.filePath),
            contentHash: decodeSha256Hex(file.contentHash),
            lineCount: 10,
            workspaceName: "root",
            tsconfigPath: decodeFilePath("tsconfig.json"),
          })
      )
    ),
    symbols: pipe(
      options.files,
      A.flatMap((file) =>
        pipe(
          file.exportedSymbols,
          A.map(
            (symbol) =>
              new RepoSymbolRecord({
                repoId: options.registrationId,
                sourceSnapshotId: decodeSourceSnapshotId(options.snapshotId),
                symbolId: `${file.filePath}::${symbol.name}#${symbol.kind}`,
                symbolName: symbol.name,
                qualifiedName: symbol.name,
                symbolKind: symbol.kind,
                exported: true,
                filePath: decodeFilePath(file.filePath),
                startLine: symbol.startLine,
                endLine: symbol.endLine,
                signature: symbol.signature,
                jsDocSummary: O.none(),
                declarationText: symbol.signature,
                searchText: symbol.searchText ?? `${symbol.name} ${symbol.signature}`.toLowerCase(),
              })
          )
        )
      )
    ),
    importEdges: pipe(
      options.files,
      A.flatMap((file) =>
        pipe(
          file.imports ?? [],
          A.map(
            (importEdge, index) =>
              new RepoImportEdge({
                repoId: options.registrationId,
                sourceSnapshotId: decodeSourceSnapshotId(options.snapshotId),
                importerFilePath: decodeFilePath(file.filePath),
                startLine: index + 1,
                endLine: index + 1,
                moduleSpecifier: importEdge.moduleSpecifier,
                importedName: importEdge.importedName === undefined ? O.none() : O.some(importEdge.importedName),
                typeOnly: importEdge.typeOnly ?? false,
              })
          )
        )
      )
    ),
  });

const makePacket = (options: {
  readonly citationId: string;
  readonly note: string;
  readonly registrationId: string;
  readonly snapshotId: string;
}) =>
  new RetrievalPacket({
    repoId: options.registrationId,
    sourceSnapshotId: O.some(decodeSourceSnapshotId(options.snapshotId)),
    query: "How many files?",
    retrievedAt: DateTime.makeUnsafe(1_706_000_000_000),
    summary: "A deterministic retrieval packet.",
    citations: [
      new Citation({
        id: options.citationId,
        repoId: options.registrationId,
        label: "answer",
        rationale: "Shared citation id for collision regression coverage.",
        span: {
          filePath: decodeFilePath("src/index.ts"),
          startLine: 1,
          endLine: 1,
          startColumn: O.none(),
          endColumn: O.none(),
          symbolName: O.some("answer"),
        },
      }),
    ],
    notes: A.make(options.note),
  });

describe("LocalRepoMemoryDriver", () => {
  it.effect("registers a repository and reads it back from SQLite", () =>
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
        expect(
          pipe(
            repos,
            A.head,
            O.map((repo) => repo.id),
            O.getOrUndefined
          )
        ).toBe(registration.id);
      })
    )
  );

  it.effect("persists and reloads the latest index artifact", () =>
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
          sourceSnapshotId: decodeSourceSnapshotId("snapshot:test-artifact"),
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

  it.effect("persists and reloads retrieval packets", () =>
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
          sourceSnapshotId: O.some(decodeSourceSnapshotId("snapshot:test-packet")),
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

  it.effect("replaces snapshot artifacts atomically and refreshes the latest semantic lookup tables", () =>
    withDriver(
      Effect.gen(function* () {
        const driver = yield* LocalRepoMemoryDriver;
        const repoPath = yield* createRepoFixture;
        const registration = yield* driver.registerRepo(
          new RepoRegistrationInput({
            repoPath,
            displayName: O.some("Snapshot Fixture"),
          })
        );

        const initialArtifacts = makeSnapshotArtifacts({
          capturedAtMillis: 1_706_000_000_000,
          files: [
            {
              filePath: "src/legacy.ts",
              contentHash: "1111111111111111111111111111111111111111111111111111111111111111",
              exportedSymbols: [
                {
                  endLine: 1,
                  kind: "const",
                  name: "legacyAnswer",
                  signature: "export const legacyAnswer = 41;",
                  startLine: 1,
                },
              ],
              imports: [{ moduleSpecifier: "./shared", importedName: "sharedAnswer" }],
            },
          ],
          registrationId: registration.id,
          runId: "run:index:snapshot:one",
          snapshotId: "snapshot:one",
        });

        const replacementArtifacts = makeSnapshotArtifacts({
          capturedAtMillis: 1_706_000_100_000,
          files: [
            {
              filePath: "src/index.ts",
              contentHash: "2222222222222222222222222222222222222222222222222222222222222222",
              exportedSymbols: [
                {
                  endLine: 4,
                  kind: "const",
                  name: "answer",
                  signature: "export const answer = 42;",
                  startLine: 4,
                },
              ],
              imports: [{ moduleSpecifier: "./shared", importedName: "sharedAnswer" }],
            },
            {
              filePath: "src/shared.ts",
              contentHash: "3333333333333333333333333333333333333333333333333333333333333333",
              exportedSymbols: [
                {
                  endLine: 1,
                  kind: "function",
                  name: "sharedAnswer",
                  signature: "export function sharedAnswer(): number",
                  startLine: 1,
                },
              ],
            },
          ],
          registrationId: registration.id,
          runId: "run:index:snapshot:two",
          snapshotId: "snapshot:two",
        });

        yield* driver.replaceSnapshotArtifacts(initialArtifacts);
        yield* driver.replaceSnapshotArtifacts(replacementArtifacts);

        const latestSnapshot = yield* driver.latestSourceSnapshot(registration.id);
        const latestArtifact = yield* driver.latestIndexArtifact(registration.id);
        const currentSnapshotId = decodeSourceSnapshotId("snapshot:two");
        const fileCount = yield* driver.countSourceFiles(registration.id, currentSnapshotId);
        const indexedFiles = yield* driver.findSourceFiles(registration.id, currentSnapshotId, "src/", 10);
        const symbols = yield* driver.listSymbolRecords(registration.id, currentSnapshotId);
        const imports = yield* driver.listImportEdges(registration.id, currentSnapshotId);
        const legacyMatches = yield* driver.searchSymbols(registration.id, currentSnapshotId, "legacyAnswer", 5);

        expect(O.isSome(latestSnapshot)).toBe(true);
        expect(O.isSome(latestArtifact)).toBe(true);
        if (O.isSome(latestSnapshot) && O.isSome(latestArtifact)) {
          expect(latestSnapshot.value.id).toBe(currentSnapshotId);
          expect(latestArtifact.value.sourceSnapshotId).toBe(currentSnapshotId);
        }
        expect(fileCount).toBe(2);
        expect(
          pipe(
            indexedFiles,
            A.map((file) => file.filePath)
          )
        ).toEqual(["src/index.ts", "src/shared.ts"]);
        expect(
          pipe(
            symbols,
            A.map((symbol) => symbol.symbolName)
          )
        ).toEqual(["answer", "sharedAnswer"]);
        expect(
          pipe(
            imports,
            A.map((edge) => edge.moduleSpecifier)
          )
        ).toEqual(["./shared"]);
        expect(legacyMatches).toEqual([]);
      })
    )
  );

  it.effect("stores retrieval packets independently when citations share the same id across runs", () =>
    withDriver(
      Effect.gen(function* () {
        const driver = yield* LocalRepoMemoryDriver;
        const repoPath = yield* createRepoFixture;
        const registration = yield* driver.registerRepo(
          new RepoRegistrationInput({
            repoPath,
            displayName: O.some("Citation Fixture"),
          })
        );

        const firstRunId = decodeRunId("run:query:first");
        const secondRunId = decodeRunId("run:query:second");
        const firstPacket = makePacket({
          citationId: "citation:shared",
          note: "first-packet",
          registrationId: registration.id,
          snapshotId: "snapshot:first",
        });
        const secondPacket = makePacket({
          citationId: "citation:shared",
          note: "second-packet",
          registrationId: registration.id,
          snapshotId: "snapshot:second",
        });

        yield* driver.saveRetrievalPacket(firstRunId, firstPacket);
        yield* driver.saveRetrievalPacket(secondRunId, secondPacket);

        const storedFirst = yield* driver.getRetrievalPacket(firstRunId);
        const storedSecond = yield* driver.getRetrievalPacket(secondRunId);

        expect(O.isSome(storedFirst)).toBe(true);
        expect(O.isSome(storedSecond)).toBe(true);
        if (O.isSome(storedFirst) && O.isSome(storedSecond)) {
          expect(storedFirst.value.notes).toEqual(["first-packet"]);
          expect(storedSecond.value.notes).toEqual(["second-packet"]);
          expect(
            pipe(
              storedFirst.value.citations,
              A.head,
              O.map((citation) => citation.id),
              O.getOrUndefined
            )
          ).toBe("citation:shared");
          expect(
            pipe(
              storedSecond.value.citations,
              A.head,
              O.map((citation) => citation.id),
              O.getOrUndefined
            )
          ).toBe("citation:shared");
        }
      })
    )
  );
});
