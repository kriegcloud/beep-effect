import { RepoRegistrationInput, RunId } from "@beep/repo-memory-model";
import {
  GroundedRetrievalService,
  RepoRunService,
  RepoSemanticEnrichmentService,
  TypeScriptIndexService,
} from "@beep/repo-memory-runtime";
import {
  findSymbolMatches,
  prepareGroundedQuery,
  resolveFileCandidates,
  searchKeywordMatches,
  selectImporterEdges,
  selectSingleMatch,
} from "@beep/repo-memory-runtime/internal/QueryPreparation";
import { RepoMemorySqlConfig, RepoMemorySqlLive } from "@beep/repo-memory-sqlite";
import { RepoSnapshotStore, RepoSymbolStore } from "@beep/repo-memory-store";
import { FilePath } from "@beep/schema";
import { makeSqlTestLayer, NodeSqliteTestDriver, TestDatabaseInfo } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";

const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRunId = S.decodeUnknownSync(RunId);
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const makeRuntimeLayer = () => {
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
  const typeScriptIndexLayer = TypeScriptIndexService.layer.pipe(Layer.provide([sqlLayer, storeLayer]));
  const semanticEnrichmentLayer = RepoSemanticEnrichmentService.layer;
  const groundedLayer = GroundedRetrievalService.layer.pipe(Layer.provide(storeLayer));
  const repoRunServiceLayer = RepoRunService.layer.pipe(
    Layer.provideMerge(storeLayer),
    Layer.provideMerge(typeScriptIndexLayer),
    Layer.provideMerge(semanticEnrichmentLayer),
    Layer.provideMerge(EventJournal.layerMemory),
    Layer.provideMerge(Reactivity.layer),
    Layer.provideMerge(groundedLayer),
    Layer.provideMerge(sqlLayer)
  );

  return Layer.mergeAll(
    sqlLayer,
    storeLayer,
    typeScriptIndexLayer,
    semanticEnrichmentLayer,
    EventJournal.layerMemory,
    Reactivity.layer,
    groundedLayer,
    repoRunServiceLayer
  );
};

const withRuntime = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.provide(makeRuntimeLayer(), { local: true }));

const createFixtureRepo = Effect.gen(function* () {
  const info = yield* TestDatabaseInfo;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoPath = path.join(info.tempDir, "fixtures", "repo");
  const sourceDir = path.join(repoPath, "src");

  yield* fs.makeDirectory(sourceDir, { recursive: true });
  yield* fs.writeFileString(
    path.join(sourceDir, "index.ts"),
    [
      'import { helper, repoMemoryAnswerHelper } from "./util";',
      'import type { Thing } from "./types";',
      "",
      "export const answer = helper(41);",
      "",
      "export function greet(name: string, _thing?: Thing): string {",
      "  return `hello ${name}`;",
      "}",
      "",
    ].join("\n")
  );
  yield* fs.writeFileString(
    path.join(sourceDir, "util.ts"),
    [
      "export const helper = (value: number): number => value + 1;",
      "",
      "export const repoMemoryAnswerHelper = (value: number): number => helper(value);",
      "",
    ].join("\n")
  );
  yield* fs.writeFileString(
    path.join(sourceDir, "types.ts"),
    ["export interface Thing {", "  readonly name: string;", "}", ""].join("\n")
  );
  yield* fs.writeFileString(
    path.join(repoPath, "tsconfig.json"),
    encodeJson({
      compilerOptions: {
        module: "ESNext",
        target: "ES2022",
      },
      include: ["src/**/*.ts"],
    })
  );

  return decodeFilePath(repoPath);
});

const indexFixtureRepo = Effect.gen(function* () {
  const server = yield* RepoRunService;
  const snapshotStore = yield* RepoSnapshotStore;
  const symbolStore = yield* RepoSymbolStore;
  const repoPath = yield* createFixtureRepo;
  const registration = yield* server.registerRepo(
    new RepoRegistrationInput({
      repoPath,
      displayName: O.some("Query Preparation Fixture"),
    })
  );
  const runId = decodeRunId(`run:index:${registration.id}:query-preparation`);
  const acceptance = yield* server.acceptIndexRun(
    {
      repoId: registration.id,
      sourceFingerprint: O.none(),
    },
    runId
  );

  if (acceptance.dispatch) {
    yield* server.executeIndexRun(
      {
        repoId: registration.id,
        sourceFingerprint: O.none(),
      },
      runId
    );
  }

  const snapshotId = pipe(
    yield* snapshotStore.latestSourceSnapshot(registration.id),
    O.map((snapshot) => snapshot.id),
    O.getOrThrow
  );
  const importEdges = yield* symbolStore.listImportEdges(registration.id, snapshotId);

  return {
    importEdges,
    registration,
    snapshotId,
    snapshotStore,
    symbolStore,
  };
});

describe("repo-memory query preparation", () => {
  it.effect("prepares deterministic interpretations for the supported bounded query families", () =>
    Effect.gen(function* () {
      const cases = A.make(
        {
          question: "  where   is repo memory answer helper?  ",
          expectedKind: "locateSymbol" as const,
          assert: (preparation: ReturnType<typeof prepareGroundedQuery>) => {
            expect(preparation.normalizedQuery).toBe("where is repo memory answer helper?");
            expect(preparation.questionNotes).toContain("nlp:normalized-question=where is repo memory answer helper?");
            if (preparation.interpretation.kind !== "locateSymbol") {
              expect.fail("expected locateSymbol interpretation");
              return;
            }

            expect(preparation.interpretation.symbolName).toBe("repo memory answer helper");
          },
        },
        {
          question: "describe `answer`",
          expectedKind: "describeSymbol" as const,
          assert: (preparation: ReturnType<typeof prepareGroundedQuery>) => {
            if (preparation.interpretation.kind !== "describeSymbol") {
              expect.fail("expected describeSymbol interpretation");
              return;
            }

            expect(preparation.interpretation.symbolName).toBe("answer");
          },
        },
        {
          question: "what does src/index import?",
          expectedKind: "listFileImports" as const,
          assert: (preparation: ReturnType<typeof prepareGroundedQuery>) => {
            if (preparation.interpretation.kind !== "listFileImports") {
              expect.fail("expected listFileImports interpretation");
              return;
            }

            expect(preparation.interpretation.fileQuery).toBe("src/index");
          },
        },
        {
          question: "what does `src/index.ts` export?",
          expectedKind: "listFileExports" as const,
          assert: (preparation: ReturnType<typeof prepareGroundedQuery>) => {
            if (preparation.interpretation.kind !== "listFileExports") {
              expect.fail("expected listFileExports interpretation");
              return;
            }

            expect(preparation.interpretation.fileQuery).toBe("src/index.ts");
          },
        },
        {
          question: "who imports util?",
          expectedKind: "listFileImporters" as const,
          assert: (preparation: ReturnType<typeof prepareGroundedQuery>) => {
            if (preparation.interpretation.kind !== "listFileImporters") {
              expect.fail("expected listFileImporters interpretation");
              return;
            }

            expect(preparation.interpretation.moduleQuery).toBe("util");
          },
        },
        {
          question: "what depends on `src/util.ts`?",
          expectedKind: "listFileDependents" as const,
          assert: (preparation: ReturnType<typeof prepareGroundedQuery>) => {
            if (preparation.interpretation.kind !== "listFileDependents") {
              expect.fail("expected listFileDependents interpretation");
              return;
            }

            expect(preparation.interpretation.fileQuery).toBe("src/util.ts");
          },
        },
        {
          question: "dependencies of src/index",
          expectedKind: "listFileDependencies" as const,
          assert: (preparation: ReturnType<typeof prepareGroundedQuery>) => {
            if (preparation.interpretation.kind !== "listFileDependencies") {
              expect.fail("expected listFileDependencies interpretation");
              return;
            }

            expect(preparation.interpretation.fileQuery).toBe("src/index");
          },
        },
        {
          question: "search repo memory answer helper",
          expectedKind: "keywordSearch" as const,
          assert: (preparation: ReturnType<typeof prepareGroundedQuery>) => {
            if (preparation.interpretation.kind !== "keywordSearch") {
              expect.fail("expected keywordSearch interpretation");
              return;
            }

            expect(preparation.interpretation.query).toBe("repo memory answer helper");
          },
        }
      );

      yield* Effect.forEach(cases, (testCase) =>
        Effect.sync(() => {
          const preparation = prepareGroundedQuery(testCase.question);
          expect(preparation.queryKind).toBe(testCase.expectedKind);
          expect(preparation.interpretation.kind).toBe(testCase.expectedKind);
          testCase.assert(preparation);
        })
      );
    })
  );

  it.effect("keeps unsupported phrasings explicit when they cannot map to deterministic shapes", () =>
    Effect.gen(function* () {
      const cases = A.make(
        "what architecture patterns does this repo prefer?",
        "summarize the whole repository for me",
        "which modules feel most important?"
      );

      yield* Effect.forEach(cases, (question) =>
        Effect.sync(() => {
          const preparation = prepareGroundedQuery(question);

          expect(preparation.queryKind).toBe("unsupported");
          if (preparation.interpretation.kind !== "unsupported") {
            expect.fail("expected unsupported interpretation");
            return;
          }

          expect(preparation.interpretation.reason.length).toBeGreaterThan(0);
          expect(preparation.interpretation.reason).toContain("deterministic query path");
        })
      );
    })
  );

  it.effect("applies bounded variant ranking and emits inspectable selection notes", () =>
    withRuntime(
      Effect.gen(function* () {
        const { importEdges, registration, snapshotId, snapshotStore, symbolStore } = yield* indexFixtureRepo;

        const cases = A.make(
          {
            label: "symbol",
            effect: findSymbolMatches(
              symbolStore,
              registration.id,
              snapshotId
            )("repo memory answer helper").pipe(
              Effect.map((selection) => ({
                matches: pipe(
                  selection.matches,
                  A.map((symbol) => ({ label: symbol.symbolName }))
                ),
                nlpNotes: selection.nlpNotes,
              }))
            ),
            expectedLabel: "repoMemoryAnswerHelper",
            expectedNotes: A.make(
              "nlp:match-strategy=symbol-exact-variant",
              "nlp:matched-variant=repoMemoryAnswerHelper"
            ),
          },
          {
            label: "file",
            effect: resolveFileCandidates(snapshotStore)(registration.id, snapshotId, "util").pipe(
              Effect.map((selection) => ({
                matches: pipe(
                  selection.matches,
                  A.map((file) => ({ label: file.filePath }))
                ),
                nlpNotes: selection.nlpNotes,
              }))
            ),
            expectedLabel: "src/util.ts",
            expectedNotes: A.make("nlp:match-strategy=file-suffix"),
          },
          {
            label: "module",
            effect: Effect.succeed(selectImporterEdges("types", importEdges)).pipe(
              Effect.map((selection) => ({
                matches: pipe(
                  selection.matches,
                  A.map((edge) => ({ label: edge.importerFilePath }))
                ),
                nlpNotes: selection.nlpNotes,
              }))
            ),
            expectedLabel: "src/index.ts",
            expectedNotes: A.make("nlp:match-strategy=module-suffix"),
          },
          {
            label: "keyword",
            effect: searchKeywordMatches(
              symbolStore,
              registration.id,
              snapshotId
            )("repo memory answer helper").pipe(
              Effect.map((selection) => ({
                matches: pipe(
                  selection.matches,
                  A.map((symbol) => ({ label: symbol.symbolName }))
                ),
                nlpNotes: selection.nlpNotes,
              }))
            ),
            expectedLabel: "repoMemoryAnswerHelper",
            expectedNotes: A.make("nlp:match-strategy=keyword-variant", "nlp:matched-variant=repoMemoryAnswerHelper"),
          }
        );

        yield* Effect.forEach(cases, (testCase) =>
          Effect.gen(function* () {
            const selection = selectSingleMatch(yield* testCase.effect);

            expect(selection.kind, testCase.label).toBe("single");
            if (selection.kind !== "single") {
              expect.fail(`expected a single ${testCase.label} selection`);
              return;
            }

            if (testCase.expectedLabel.includes("/")) {
              expect(selection.match.label.endsWith(testCase.expectedLabel)).toBe(true);
            } else {
              expect(selection.match.label).toBe(testCase.expectedLabel);
            }
            yield* Effect.forEach(testCase.expectedNotes, (note) =>
              Effect.sync(() => {
                expect(selection.nlpNotes).toContain(note);
              })
            );
          })
        );
      })
    )
  );
});
