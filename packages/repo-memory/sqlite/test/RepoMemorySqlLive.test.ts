import {
  Citation,
  ReplaceSnapshotArtifactsInput,
  RepoDocumentedReturn,
  RepoId,
  RepoImportEdge,
  RepoIndexArtifact,
  RepoJSDocReturnsTag,
  RepoJSDocSummaryTag,
  RepoRegistrationInput,
  RepoSemanticArtifacts,
  RepoSourceFile,
  RepoSourceSnapshot,
  RepoSymbolDocumentation,
  RepoSymbolRecord,
  RetrievalPacket,
  RunId,
  SourceSnapshotId,
} from "@beep/repo-memory-model";
import { RepoMemorySqlConfig, RepoMemorySqlLive } from "@beep/repo-memory-sqlite";
import {
  RepoRegistryStore,
  RepoRunStore,
  RepoSemanticStore,
  RepoSnapshotStore,
  RepoSymbolStore,
} from "@beep/repo-memory-store";
import { FilePath, NonNegativeInt, PosInt, Sha256Hex } from "@beep/schema";
import { EvidenceAnchor, FragmentSelector } from "@beep/semantic-web/evidence";
import { IRIReference } from "@beep/semantic-web/iri";
import { Entity, ObjectRef, ProvBundle } from "@beep/semantic-web/prov";
import { makeDataset, makeLiteral, makeNamedNode, makeQuad } from "@beep/semantic-web/rdf";
import { RDF_TYPE } from "@beep/semantic-web/vocab/rdf";
import { XSD_STRING } from "@beep/semantic-web/vocab/xsd";
import { makeSqlTestLayer, NodeSqliteTestDriver, TestDatabaseInfo } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";

const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeIriReference = S.decodeUnknownSync(IRIReference);
const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeObjectRef = S.decodeUnknownSync(ObjectRef);
const decodePosInt = S.decodeUnknownSync(PosInt);
const decodeRunId = S.decodeUnknownSync(RunId);
const decodeSha256Hex = S.decodeUnknownSync(Sha256Hex);
const decodeSourceSnapshotId = S.decodeUnknownSync(SourceSnapshotId);

const makeSqliteLayer = () => {
  const sqlLayer = makeSqlTestLayer({
    config: undefined,
    driver: NodeSqliteTestDriver,
  });
  const storeLayer = Layer.unwrap(
    Effect.gen(function* () {
      const info = yield* TestDatabaseInfo;
      const path = yield* Path.Path;

      return RepoMemorySqlLive(
        new RepoMemorySqlConfig({
          appDataDir: decodeFilePath(path.join(info.tempDir, "app-data")),
        })
      );
    })
  ).pipe(Layer.provide(sqlLayer));

  return Layer.mergeAll(sqlLayer, storeLayer);
};

const withSqlite = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.provide(makeSqliteLayer(), { local: true }));

const loadStores = Effect.gen(function* () {
  return {
    registry: yield* RepoRegistryStore,
    run: yield* RepoRunStore,
    semantic: yield* RepoSemanticStore,
    snapshot: yield* RepoSnapshotStore,
    symbol: yield* RepoSymbolStore,
  };
});

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
      readonly documentation?: RepoSymbolDocumentation;
      readonly endLine: number;
      readonly jsDocSummary?: string;
      readonly kind: "class" | "const" | "enum" | "function" | "interface" | "namespace" | "typeAlias";
      readonly name: string;
      readonly searchText?: string;
      readonly signature: string;
      readonly startLine: number;
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
  (() => {
    const repoId = decodeRepoId(options.registrationId);
    const sourceSnapshotId = decodeSourceSnapshotId(options.snapshotId);
    const fileCount = decodeNonNegativeInt(A.length(options.files));

    return new ReplaceSnapshotArtifactsInput({
      artifact: new RepoIndexArtifact({
        runId: decodeRunId(options.runId),
        repoId,
        sourceSnapshotId,
        indexedFileCount: fileCount,
        completedAt: DateTime.makeUnsafe(options.capturedAtMillis),
      }),
      snapshot: new RepoSourceSnapshot({
        id: sourceSnapshotId,
        repoId,
        capturedAt: DateTime.makeUnsafe(options.capturedAtMillis),
        fileCount,
      }),
      files: pipe(
        options.files,
        A.map(
          (file) =>
            new RepoSourceFile({
              repoId,
              sourceSnapshotId,
              filePath: decodeFilePath(file.filePath),
              contentHash: decodeSha256Hex(file.contentHash),
              lineCount: decodeNonNegativeInt(10),
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
                  repoId,
                  sourceSnapshotId,
                  symbolId: `${file.filePath}::${symbol.name}#${symbol.kind}`,
                  symbolName: symbol.name,
                  qualifiedName: symbol.name,
                  symbolKind: symbol.kind,
                  exported: true,
                  filePath: decodeFilePath(file.filePath),
                  startLine: decodePosInt(symbol.startLine),
                  endLine: decodePosInt(symbol.endLine),
                  signature: symbol.signature,
                  documentation: symbol.documentation === undefined ? O.none() : O.some(symbol.documentation),
                  jsDocSummary: symbol.jsDocSummary === undefined ? O.none() : O.some(symbol.jsDocSummary),
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
                  repoId,
                  sourceSnapshotId,
                  importerFilePath: decodeFilePath(file.filePath),
                  startLine: decodePosInt(index + 1),
                  endLine: decodePosInt(index + 1),
                  moduleSpecifier: importEdge.moduleSpecifier,
                  importedName: importEdge.importedName === undefined ? O.none() : O.some(importEdge.importedName),
                  resolvedTargetFilePath: O.none(),
                  typeOnly: importEdge.typeOnly ?? false,
                })
            )
          )
        )
      ),
    });
  })();

const makePacket = (options: {
  readonly citationId: string;
  readonly note: string;
  readonly registrationId: string;
  readonly snapshotId: string;
}) =>
  new RetrievalPacket({
    repoId: decodeRepoId(options.registrationId),
    sourceSnapshotId: O.some(decodeSourceSnapshotId(options.snapshotId)),
    query: "How many files?",
    retrievedAt: DateTime.makeUnsafe(1_706_000_000_000),
    summary: "A deterministic retrieval packet.",
    citations: [
      new Citation({
        id: options.citationId,
        repoId: decodeRepoId(options.registrationId),
        label: "answer",
        rationale: "Shared citation id for collision regression coverage.",
        span: {
          filePath: decodeFilePath("src/index.ts"),
          startLine: decodePosInt(1),
          endLine: decodePosInt(1),
          startColumn: O.none(),
          endColumn: O.none(),
          symbolName: O.some("answer"),
        },
      }),
    ],
    notes: A.make(options.note),
  });

const makeSemanticArtifacts = (options: { readonly registrationId: string; readonly snapshotId: string }) =>
  new RepoSemanticArtifacts({
    repoId: decodeRepoId(options.registrationId),
    sourceSnapshotId: decodeSourceSnapshotId(options.snapshotId),
    dataset: makeDataset([
      makeQuad(
        makeNamedNode(`urn:beep:repo-memory:file:${options.registrationId}:${options.snapshotId}:src%2Findex.ts`),
        RDF_TYPE,
        makeNamedNode("urn:beep:repo-memory:semantic#File")
      ),
      makeQuad(
        makeNamedNode(`urn:beep:repo-memory:file:${options.registrationId}:${options.snapshotId}:src%2Findex.ts`),
        makeNamedNode("urn:beep:repo-memory:semantic#filePath"),
        makeLiteral("src/index.ts", XSD_STRING.value)
      ),
    ]),
    provenance: new ProvBundle({
      records: [
        new Entity({
          provType: "Entity",
          id: O.some(
            decodeObjectRef(`urn:beep:repo-memory:semantic-dataset:${options.registrationId}:${options.snapshotId}`)
          ),
          wasGeneratedBy: O.none(),
          wasAttributedTo: O.none(),
          hadPrimarySource: O.none(),
          wasQuotedFrom: O.none(),
          wasRevisionOf: O.none(),
          wasDerivedFrom: O.none(),
          generatedAtTime: O.none(),
          invalidatedAtTime: O.none(),
          value: O.none(),
        }),
      ],
      lifecycle: O.none(),
    }),
    evidenceAnchors: [
      new EvidenceAnchor({
        id: decodeIriReference(
          `urn:beep:repo-memory:evidence:symbol:${options.registrationId}:${options.snapshotId}:answer`
        ),
        target: {
          source: decodeIriReference(
            `urn:beep:repo-memory:source:${options.registrationId}:${options.snapshotId}:src%2Findex.ts`
          ),
          selector: new FragmentSelector({
            kind: "fragment",
            value: "line=1,1",
            conformsTo: O.none(),
          }),
        },
        note: O.some("citationId=src/index.ts::answer#const"),
      }),
    ],
  });

describe("RepoMemorySqlLive", () => {
  it.effect("registers a repository and reads it back from SQLite", () =>
    withSqlite(
      Effect.gen(function* () {
        const { registry } = yield* loadStores;
        const repoPath = yield* createRepoFixture;
        const registration = yield* registry.registerRepo(
          new RepoRegistrationInput({
            repoPath,
            displayName: O.some("Fixture Repo"),
          })
        );
        const repo = yield* registry.getRepo(registration.id);
        const repos = yield* registry.listRepos;

        expect(repo.id).toBe(registration.id);
        expect(repo.repoPath).toBe(repoPath);
        expect(repo.displayName).toBe("Fixture Repo");
        expect(repos).toHaveLength(1);
        expect(
          pipe(
            repos,
            A.head,
            O.map((item) => item.id),
            O.getOrUndefined
          )
        ).toBe(registration.id);
      })
    )
  );

  it.effect("canonicalizes repo paths so symlink aliases reuse the same registration", () =>
    withSqlite(
      Effect.gen(function* () {
        const { registry } = yield* loadStores;
        const info = yield* TestDatabaseInfo;
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const repoPath = yield* createRepoFixture;
        const repoAliasPath = path.join(info.tempDir, "fixtures", "repo-alias");

        yield* fs.symlink(repoPath, repoAliasPath);

        const viaAlias = yield* registry.registerRepo(
          new RepoRegistrationInput({
            repoPath: decodeFilePath(repoAliasPath),
            displayName: O.some("Alias Registration"),
          })
        );
        const viaCanonical = yield* registry.registerRepo(
          new RepoRegistrationInput({
            repoPath,
            displayName: O.some("Canonical Registration"),
          })
        );
        const repos = yield* registry.listRepos;

        expect(viaAlias.id).toBe(viaCanonical.id);
        expect(viaAlias.repoPath).toBe(repoPath);
        expect(viaCanonical.repoPath).toBe(repoPath);
        expect(repos).toHaveLength(1);
      })
    )
  );

  it.effect("persists and reloads the latest index artifact", () =>
    withSqlite(
      Effect.gen(function* () {
        const { registry, snapshot } = yield* loadStores;
        const repoPath = yield* createRepoFixture;
        const registration = yield* registry.registerRepo(
          new RepoRegistrationInput({
            repoPath,
            displayName: O.none(),
          })
        );
        const artifact = new RepoIndexArtifact({
          runId: decodeRunId("run:index:test-artifact"),
          repoId: registration.id,
          sourceSnapshotId: decodeSourceSnapshotId("snapshot:test-artifact"),
          indexedFileCount: decodeNonNegativeInt(1),
          completedAt: DateTime.makeUnsafe(1_706_000_000_000),
        });

        yield* snapshot.saveIndexArtifact(artifact);
        const latest = yield* snapshot.latestIndexArtifact(registration.id);

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
    withSqlite(
      Effect.gen(function* () {
        const { registry, run } = yield* loadStores;
        const repoPath = yield* createRepoFixture;
        const registration = yield* registry.registerRepo(
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

        yield* run.saveRetrievalPacket(runId, packet);
        const stored = yield* run.getRetrievalPacket(runId);

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

  it.effect("persists semantic artifacts per snapshot and returns the latest row per repo", () =>
    withSqlite(
      Effect.gen(function* () {
        const { registry, semantic } = yield* loadStores;
        const repoPath = yield* createRepoFixture;
        const registration = yield* registry.registerRepo(
          new RepoRegistrationInput({
            repoPath,
            displayName: O.some("Semantic Fixture"),
          })
        );
        const firstArtifacts = makeSemanticArtifacts({
          registrationId: registration.id,
          snapshotId: "snapshot:semantic:one",
        });
        const secondArtifacts = makeSemanticArtifacts({
          registrationId: registration.id,
          snapshotId: "snapshot:semantic:two",
        });

        yield* semantic.saveSemanticArtifacts(firstArtifacts);
        yield* semantic.saveSemanticArtifacts(secondArtifacts);

        const firstStored = yield* semantic.getSemanticArtifacts(
          registration.id,
          decodeSourceSnapshotId("snapshot:semantic:one")
        );
        const latestStored = yield* semantic.latestSemanticArtifacts(registration.id);

        expect(O.isSome(firstStored)).toBe(true);
        expect(O.isSome(latestStored)).toBe(true);
        if (O.isSome(firstStored) && O.isSome(latestStored)) {
          expect(firstStored.value.sourceSnapshotId).toBe("snapshot:semantic:one");
          expect(latestStored.value.sourceSnapshotId).toBe("snapshot:semantic:two");
          expect(latestStored.value.dataset.quads).toHaveLength(2);
          expect(latestStored.value.evidenceAnchors).toHaveLength(1);
        }
      })
    )
  );

  it.effect("replaces snapshot artifacts atomically and refreshes the latest semantic lookup tables", () =>
    withSqlite(
      Effect.gen(function* () {
        const { registry, snapshot, symbol } = yield* loadStores;
        const repoPath = yield* createRepoFixture;
        const registration = yield* registry.registerRepo(
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
                  documentation: new RepoSymbolDocumentation({
                    span: {
                      filePath: decodeFilePath("src/index.ts"),
                      startLine: decodePosInt(1),
                      endLine: decodePosInt(3),
                      startColumn: O.none(),
                      endColumn: O.none(),
                      symbolName: O.some("answer"),
                    },
                    description: O.none(),
                    summary: O.some("The canonical answer constant."),
                    remarks: O.none(),
                    isDeprecated: false,
                    deprecationNote: O.none(),
                    params: A.empty(),
                    returns: O.some(
                      new RepoDocumentedReturn({
                        type: O.some("number"),
                        description: O.some("The resolved answer value."),
                      })
                    ),
                    throws: A.empty(),
                    see: A.empty(),
                    tags: A.make(
                      new RepoJSDocSummaryTag({
                        description: "The canonical answer constant.",
                      }),
                      new RepoJSDocReturnsTag({
                        type: O.some("number"),
                        description: O.some("The resolved answer value."),
                      })
                    ),
                  }),
                  endLine: 4,
                  kind: "const",
                  jsDocSummary: "The canonical answer constant.",
                  name: "answer",
                  searchText: "answer export const answer = 42; canonical answer resolved answer".toLowerCase(),
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

        yield* snapshot.replaceSnapshotArtifacts(initialArtifacts);
        yield* snapshot.replaceSnapshotArtifacts(replacementArtifacts);

        const latestSnapshot = yield* snapshot.latestSourceSnapshot(registration.id);
        const latestArtifact = yield* snapshot.latestIndexArtifact(registration.id);
        const currentSnapshotId = decodeSourceSnapshotId("snapshot:two");
        const fileCount = yield* snapshot.countSourceFiles(registration.id, currentSnapshotId);
        const indexedFiles = yield* snapshot.findSourceFiles(registration.id, currentSnapshotId, "src/", 10);
        const symbols = yield* symbol.listSymbolRecords(registration.id, currentSnapshotId);
        const imports = yield* symbol.listImportEdges(registration.id, currentSnapshotId);
        const legacyMatches = yield* symbol.searchSymbols(registration.id, currentSnapshotId, "legacyAnswer", 5);

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
            A.map((record) => record.symbolName)
          )
        ).toEqual(["answer", "sharedAnswer"]);
        expect(
          pipe(
            symbols,
            A.findFirst((record) => record.symbolName === "answer"),
            O.flatMap((record) => record.documentation),
            O.map((documentation) => pipe(documentation.summary, O.getOrUndefined)),
            O.getOrUndefined
          )
        ).toBe("The canonical answer constant.");
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
    withSqlite(
      Effect.gen(function* () {
        const { registry, run } = yield* loadStores;
        const repoPath = yield* createRepoFixture;
        const registration = yield* registry.registerRepo(
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

        yield* run.saveRetrievalPacket(firstRunId, firstPacket);
        yield* run.saveRetrievalPacket(secondRunId, secondPacket);

        const storedFirst = yield* run.getRetrievalPacket(firstRunId);
        const storedSecond = yield* run.getRetrievalPacket(secondRunId);

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
