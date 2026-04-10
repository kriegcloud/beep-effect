import {
  QueryRepoRunInput,
  type QueryRun,
  type RepoId,
  RepoRegistrationInput,
  RunId,
  type RunStreamEvent,
  StreamRunEventsRequest,
} from "@beep/repo-memory-model";
import {
  GroundedRetrievalService,
  RepoRunService,
  RepoSemanticEnrichmentService,
  TypeScriptIndexService,
} from "@beep/repo-memory-runtime";
import { RepoMemorySqlConfig, RepoMemorySqlLive } from "@beep/repo-memory-sqlite";
import { RepoSnapshotStore, RepoSymbolStore } from "@beep/repo-memory-store";
import { FilePath } from "@beep/schema";
import { BunSqliteTestDriver, makeSqlTestLayer, NodeSqliteTestDriver, TestDatabaseInfo } from "@beep/test-utils";
import * as Str from "@beep/utils/Str";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, pipe, Stream } from "effect";
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
const sqlTestDriver = process.versions.bun === undefined ? NodeSqliteTestDriver : BunSqliteTestDriver;

const makeRuntimeLayer = () => {
  const sqlLayer = makeSqlTestLayer({
    config: undefined,
    driver: sqlTestDriver,
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

const createCollisionFixtureRepo = Effect.gen(function* () {
  const info = yield* TestDatabaseInfo;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoPath = path.join(info.tempDir, "fixtures", "collision-repo");
  const sourceDir = path.join(repoPath, "src");
  const featureDir = path.join(sourceDir, "feature");

  yield* fs.makeDirectory(sourceDir, { recursive: true });
  yield* fs.makeDirectory(featureDir, { recursive: true });
  yield* fs.writeFileString(
    path.join(sourceDir, "dep.ts"),
    ["export class Foo {", "  constructor(readonly name: string) {}", "}", ""].join("\n")
  );
  yield* fs.writeFileString(
    path.join(sourceDir, "index.ts"),
    [
      'import { Foo, type Foo } from "./dep";',
      "",
      "export function makeFoo(name: string): Foo;",
      "export function makeFoo(name: string, count: number): ReadonlyArray<Foo>;",
      "export function makeFoo(name: string, count = 1): Foo | ReadonlyArray<Foo> {",
      "  if (count === 1) {",
      "    return new Foo(name);",
      "  }",
      "",
      "  return Array.from({ length: count }, (_, index) => new Foo(`${name}-${index}`));",
      "}",
      "",
      'export const singleFoo: Foo = makeFoo("fixture") as Foo;',
      "",
    ].join("\n")
  );
  yield* fs.writeFileString(
    path.join(featureDir, "index.ts"),
    ['import { Foo } from "../dep";', "", 'export const featureFoo = new Foo("feature");', ""].join("\n")
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
  const repoPath = yield* createFixtureRepo;
  const registration = yield* server.registerRepo(
    new RepoRegistrationInput({
      repoPath,
      displayName: O.some("Grounded Fixture"),
    })
  );
  const runId = decodeRunId(`run:index:${registration.id}:fixture`);
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

  return {
    registration,
    runId,
  };
});

const indexCollisionFixtureRepo = Effect.gen(function* () {
  const server = yield* RepoRunService;
  const repoPath = yield* createCollisionFixtureRepo;
  const registration = yield* server.registerRepo(
    new RepoRegistrationInput({
      repoPath,
      displayName: O.some("Collision Fixture"),
    })
  );
  const runId = decodeRunId(`run:index:${registration.id}:collision`);
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

  return {
    registration,
    runId,
  };
});

const runQuery = Effect.fn("GroundedRetrievalTest.runQuery")(function* (input: {
  readonly repoId: RepoId;
  readonly question: string;
  readonly runLabel: string;
}) {
  const server = yield* RepoRunService;
  const runId = decodeRunId(`run:query:${input.runLabel}`);
  const payload = new QueryRepoRunInput({
    repoId: input.repoId,
    question: input.question,
    questionFingerprint: O.none(),
  });
  const acceptance = yield* server.acceptQueryRun(payload, runId);

  if (acceptance.dispatch) {
    yield* server.executeQueryRun(payload, runId);
  }

  const run = yield* server.getRun(runId);
  const events = yield* Stream.runCollect(
    server.streamRunEvents(new StreamRunEventsRequest({ runId, cursor: O.none() }))
  );

  return {
    events,
    run,
    runId,
  };
});

const retrievalEvent = (events: ReadonlyArray<RunStreamEvent>) =>
  A.findFirst(
    events,
    (event): event is Extract<RunStreamEvent, { readonly kind: "retrieval-packet" }> =>
      event.kind === "retrieval-packet"
  );

const answerEvent = (events: ReadonlyArray<RunStreamEvent>) =>
  A.findFirst(
    events,
    (event): event is Extract<RunStreamEvent, { readonly kind: "answer" }> => event.kind === "answer"
  );

const assertCitationAlignment = (input: { readonly events: ReadonlyArray<RunStreamEvent>; readonly run: QueryRun }) => {
  const retrieval = retrievalEvent(input.events);
  const answer = answerEvent(input.events);
  const runCitationIds = pipe(
    input.run.citations,
    A.map((citation) => citation.id)
  );
  const packet = O.getOrThrow(input.run.retrievalPacket);

  expect(
    pipe(
      packet.citations,
      A.map((citation) => citation.id)
    )
  ).toEqual(runCitationIds);
  if (O.isSome(answer)) {
    expect(
      pipe(
        answer.value.citations,
        A.map((citation) => citation.id)
      )
    ).toEqual(runCitationIds);
  }
  if (O.isSome(retrieval)) {
    expect(
      pipe(
        retrieval.value.packet.citations,
        A.map((citation) => citation.id)
      )
    ).toEqual(runCitationIds);
  }
};

const packetNlpNotes = (run: QueryRun): ReadonlyArray<string> =>
  pipe(
    O.getOrThrow(run.retrievalPacket).notes,
    A.filter((note) => pipe(note, Str.startsWith("nlp:")))
  );

const citationIds = (run: QueryRun): ReadonlyArray<string> =>
  pipe(
    run.citations,
    A.map((citation) => citation.id)
  );

describe("repo-memory runtime grounded retrieval", () => {
  it.effect("answers file import questions with grounded citations", () =>
    withRuntime(
      Effect.gen(function* () {
        const { registration } = yield* indexFixtureRepo;
        const result = yield* runQuery({
          repoId: registration.id,
          question: "what does `src/index.ts` import?",
          runLabel: "imports",
        });

        if (result.run.kind !== "query") {
          return yield* Effect.die("Expected a query run.");
        }

        const retrieval = retrievalEvent(result.events);
        const answer = answerEvent(result.events);

        expect(O.getOrThrow(result.run.answer)).toContain("./util");
        expect(O.getOrThrow(result.run.answer)).toContain("./types");
        expect(result.run.citations.length).toBeGreaterThan(0);
        expect(O.getOrThrow(retrieval).kind).toBe("retrieval-packet");
        expect(O.getOrThrow(answer).kind).toBe("answer");

        const packet = O.getOrThrow(result.run.retrievalPacket);
        expect(O.isSome(packet.sourceSnapshotId)).toBe(true);
        expect(packet.summary).toContain("Listed import declarations");
        expect(A.some(packet.notes, (note) => pipe(note, Str.startsWith("sourceSnapshotId=")))).toBe(true);
        expect(A.some(packet.notes, (note) => pipe(note, Str.startsWith("semanticDatasetQuads=")))).toBe(true);
        assertCitationAlignment({ events: result.events, run: result.run });
      })
    )
  );

  it.effect("answers importer and symbol count queries deterministically", () =>
    withRuntime(
      Effect.gen(function* () {
        const { registration } = yield* indexFixtureRepo;
        const importers = yield* runQuery({
          repoId: registration.id,
          question: "who imports `./util`?",
          runLabel: "importers",
        });
        const countSymbols = yield* runQuery({
          repoId: registration.id,
          question: "how many symbols are indexed?",
          runLabel: "count-symbols",
        });

        if (importers.run.kind !== "query" || countSymbols.run.kind !== "query") {
          return yield* Effect.die("Expected query run projections.");
        }

        expect(O.getOrThrow(importers.run.answer)).toContain("src/index.ts");
        expect(importers.run.citations.length).toBeGreaterThan(0);

        const countPacket = O.getOrThrow(countSymbols.run.retrievalPacket);
        expect(O.getOrThrow(countSymbols.run.answer)).toContain("5 captured TypeScript symbols");
        expect(countSymbols.run.citations).toEqual([]);
        expect(countPacket.summary).toContain("Counted indexed TypeScript symbols");
        expect(countPacket.notes).toContain("countSymbols=5");
      })
    )
  );

  it.effect("answers symbol importer queries with grounded import-edge citations", () =>
    withRuntime(
      Effect.gen(function* () {
        const { registration } = yield* indexFixtureRepo;
        const exact = yield* runQuery({
          repoId: registration.id,
          question: "who uses `helper`?",
          runLabel: "symbol-importers-helper",
        });
        const relaxed = yield* runQuery({
          repoId: registration.id,
          question: "where is repo memory answer helper used?",
          runLabel: "symbol-importers-relaxed-helper",
        });

        if (exact.run.kind !== "query" || relaxed.run.kind !== "query") {
          return yield* Effect.die("Expected query run projections.");
        }

        const exactPacket = O.getOrThrow(exact.run.retrievalPacket);
        expect(O.getOrThrow(exact.run.answer)).toContain('Files importing symbol "helper"');
        expect(O.getOrThrow(exact.run.answer)).toContain("src/util.ts");
        expect(O.getOrThrow(exact.run.answer)).toContain("src/index.ts");
        expect(exact.run.citations.length).toBeGreaterThan(1);
        expect(exactPacket.summary).toContain('Listed files importing symbol "helper"');
        expect(exactPacket.notes).toContain("symbolName=helper");
        expect(
          A.some(exactPacket.notes, (note) => note === "symbolFilePath=src/util.ts" || note.endsWith("/src/util.ts"))
        ).toBe(true);
        expect(exactPacket.notes).toContain("importerCount=1");
        expect(exactPacket.notes).toContain("typeOnlyImporterCount=0");
        expect(packetNlpNotes(exact.run)).toEqual([]);
        assertCitationAlignment({ events: exact.events, run: exact.run });

        const relaxedPacket = O.getOrThrow(relaxed.run.retrievalPacket);
        expect(O.getOrThrow(relaxed.run.answer)).toContain('Files importing symbol "repoMemoryAnswerHelper"');
        expect(O.getOrThrow(relaxed.run.answer)).toContain("src/util.ts");
        expect(O.getOrThrow(relaxed.run.answer)).toContain("src/index.ts");
        expect(relaxedPacket.notes).toContain("symbolName=repoMemoryAnswerHelper");
        expect(
          A.some(relaxedPacket.notes, (note) => note === "symbolFilePath=src/util.ts" || note.endsWith("/src/util.ts"))
        ).toBe(true);
        expect(relaxedPacket.notes).toContain("importerCount=1");
        expect(relaxedPacket.notes).toContain("typeOnlyImporterCount=0");
        expect(packetNlpNotes(relaxed.run)).toContain("nlp:match-strategy=symbol-exact-variant");
        expect(packetNlpNotes(relaxed.run)).toContain("nlp:matched-variant=repoMemoryAnswerHelper");
        assertCitationAlignment({ events: relaxed.events, run: relaxed.run });
      })
    )
  );

  it.effect("supports bounded NLP enrichment for symbol, file, importer, and dependent queries", () =>
    withRuntime(
      Effect.gen(function* () {
        const { registration } = yield* indexFixtureRepo;
        const spacedSymbol = yield* runQuery({
          repoId: registration.id,
          question: "where is repo memory answer helper?",
          runLabel: "locate-spaced-helper",
        });
        const relaxedImports = yield* runQuery({
          repoId: registration.id,
          question: "what does src/index import?",
          runLabel: "imports-relaxed",
        });
        const relaxedImporters = yield* runQuery({
          repoId: registration.id,
          question: "who imports util?",
          runLabel: "importers-relaxed",
        });
        const relaxedDependents = yield* runQuery({
          repoId: registration.id,
          question: "dependents of util",
          runLabel: "dependents-relaxed",
        });

        if (
          spacedSymbol.run.kind !== "query" ||
          relaxedImports.run.kind !== "query" ||
          relaxedImporters.run.kind !== "query" ||
          relaxedDependents.run.kind !== "query"
        ) {
          return yield* Effect.die("Expected query run projections.");
        }

        expect(O.getOrThrow(spacedSymbol.run.answer)).toContain("src/util.ts");
        expect(packetNlpNotes(spacedSymbol.run)).toContain("nlp:match-strategy=symbol-exact-variant");
        expect(packetNlpNotes(spacedSymbol.run)).toContain("nlp:matched-variant=repoMemoryAnswerHelper");
        assertCitationAlignment({ events: spacedSymbol.events, run: spacedSymbol.run });

        expect(O.getOrThrow(relaxedImports.run.answer)).toContain("./util");
        expect(O.getOrThrow(relaxedImports.run.answer)).toContain("./types");
        expect(packetNlpNotes(relaxedImports.run)).toContain("nlp:match-strategy=file-suffix");
        assertCitationAlignment({ events: relaxedImports.events, run: relaxedImports.run });

        expect(O.getOrThrow(relaxedImporters.run.answer)).toContain("src/index.ts");
        expect(packetNlpNotes(relaxedImporters.run)).toContain("nlp:match-strategy=module-suffix");
        assertCitationAlignment({ events: relaxedImporters.events, run: relaxedImporters.run });

        expect(O.getOrThrow(relaxedDependents.run.answer)).toContain("src/index.ts");
        expect(packetNlpNotes(relaxedDependents.run)).toContain("nlp:match-strategy=file-suffix");
        assertCitationAlignment({ events: relaxedDependents.events, run: relaxedDependents.run });
      })
    )
  );

  it.effect(
    "keeps exact and relaxed symbol queries aligned while surfacing normalization notes only for relaxed phrasing",
    () =>
      withRuntime(
        Effect.gen(function* () {
          const { registration } = yield* indexFixtureRepo;
          const exact = yield* runQuery({
            repoId: registration.id,
            question: "where is `repoMemoryAnswerHelper`?",
            runLabel: "locate-helper-exact",
          });
          const relaxed = yield* runQuery({
            repoId: registration.id,
            question: "  where   is repo memory answer helper?  ",
            runLabel: "locate-helper-relaxed",
          });

          if (exact.run.kind !== "query" || relaxed.run.kind !== "query") {
            return yield* Effect.die("Expected query run projections.");
          }

          expect(O.getOrThrow(relaxed.run.answer)).toEqual(O.getOrThrow(exact.run.answer));
          expect(citationIds(relaxed.run)).toEqual(citationIds(exact.run));
          expect(O.getOrThrow(relaxed.run.retrievalPacket).summary).toEqual(
            O.getOrThrow(exact.run.retrievalPacket).summary
          );
          expect(packetNlpNotes(exact.run)).toEqual([]);
          expect(packetNlpNotes(relaxed.run)).toContain("nlp:normalized-question=where is repo memory answer helper?");
          expect(packetNlpNotes(relaxed.run)).toContain("nlp:matched-variant=repoMemoryAnswerHelper");
          assertCitationAlignment({ events: exact.events, run: exact.run });
          assertCitationAlignment({ events: relaxed.events, run: relaxed.run });
        })
      )
  );

  it.effect("answers repo-local dependency and dependent queries with resolved file paths", () =>
    withRuntime(
      Effect.gen(function* () {
        const { registration } = yield* indexFixtureRepo;
        const dependencies = yield* runQuery({
          repoId: registration.id,
          question: "what does `src/index.ts` depend on?",
          runLabel: "dependencies",
        });
        const dependents = yield* runQuery({
          repoId: registration.id,
          question: "what depends on `src/util.ts`?",
          runLabel: "dependents",
        });

        if (dependencies.run.kind !== "query" || dependents.run.kind !== "query") {
          return yield* Effect.die("Expected query run projections.");
        }

        const dependenciesPacket = O.getOrThrow(dependencies.run.retrievalPacket);
        const dependentsPacket = O.getOrThrow(dependents.run.retrievalPacket);

        expect(O.getOrThrow(dependencies.run.answer)).toContain("src/util.ts");
        expect(O.getOrThrow(dependencies.run.answer)).toContain("src/types.ts");
        expect(dependencies.run.citations.length).toBeGreaterThan(0);
        expect(dependenciesPacket.summary).toContain("resolved file dependencies");
        expect(dependenciesPacket.notes).toContain("dependencyCount=2");
        expect(dependenciesPacket.notes).toContain("unresolvedImportCount=0");
        assertCitationAlignment({ events: dependencies.events, run: dependencies.run });

        expect(O.getOrThrow(dependents.run.answer)).toContain("src/index.ts");
        expect(dependents.run.citations.length).toBeGreaterThan(0);
        expect(dependentsPacket.summary).toContain("files depending on");
        expect(dependentsPacket.notes).toContain("dependentCount=1");
        assertCitationAlignment({ events: dependents.events, run: dependents.run });
      })
    )
  );

  it.effect("deduplicates overloaded symbols and mixed value/type imports before snapshot persistence", () =>
    withRuntime(
      Effect.gen(function* () {
        const snapshotStore = yield* RepoSnapshotStore;
        const symbolStore = yield* RepoSymbolStore;
        const { registration } = yield* indexCollisionFixtureRepo;
        const latestSnapshot = yield* snapshotStore.latestSourceSnapshot(registration.id);
        const snapshotId = O.getOrThrow(latestSnapshot).id;
        const symbols = yield* symbolStore.listSymbolRecords(registration.id, snapshotId);
        const importEdges = yield* symbolStore.listImportEdges(registration.id, snapshotId);
        const makeFooSymbols = pipe(
          symbols,
          A.filter((symbol) => symbol.symbolName === "makeFoo")
        );
        const fooImportEdges = pipe(
          importEdges,
          A.filter((edge) => edge.moduleSpecifier === "./dep" && pipe(edge.importedName, O.getOrUndefined) === "Foo")
        );

        expect(makeFooSymbols).toHaveLength(1);
        expect(makeFooSymbols[0]?.declarationText).toContain("count = 1");
        expect(fooImportEdges).toHaveLength(1);
      })
    )
  );

  it.effect("answers locate, describe, export, and keyword queries with stable grounded citations", () =>
    withRuntime(
      Effect.gen(function* () {
        const { registration } = yield* indexFixtureRepo;
        const locate = yield* runQuery({
          repoId: registration.id,
          question: "where is `greet`?",
          runLabel: "locate-greet",
        });
        const describeAnswer = yield* runQuery({
          repoId: registration.id,
          question: "describe `answer`",
          runLabel: "describe-answer",
        });
        const exportsForIndex = yield* runQuery({
          repoId: registration.id,
          question: "what does `src/index.ts` export?",
          runLabel: "exports-index",
        });
        const keyword = yield* runQuery({
          repoId: registration.id,
          question: "search `helper`",
          runLabel: "keyword-helper",
        });

        if (
          locate.run.kind !== "query" ||
          describeAnswer.run.kind !== "query" ||
          exportsForIndex.run.kind !== "query" ||
          keyword.run.kind !== "query"
        ) {
          return yield* Effect.die("Expected query run projections.");
        }

        expect(O.getOrThrow(locate.run.answer)).toContain("src/index.ts");
        expect(locate.run.citations.length).toBeGreaterThan(0);
        expect(packetNlpNotes(locate.run)).toEqual([]);
        assertCitationAlignment({ events: locate.events, run: locate.run });

        expect(O.getOrThrow(describeAnswer.run.answer)).toContain("Signature:");
        expect(O.getOrThrow(describeAnswer.run.answer)).toContain("answer");
        expect(describeAnswer.run.citations.length).toBeGreaterThan(0);
        assertCitationAlignment({ events: describeAnswer.events, run: describeAnswer.run });

        expect(O.getOrThrow(exportsForIndex.run.answer)).toContain("answer (const)");
        expect(O.getOrThrow(exportsForIndex.run.answer)).toContain("greet (function)");
        expect(exportsForIndex.run.citations.length).toBeGreaterThan(0);
        assertCitationAlignment({ events: exportsForIndex.events, run: exportsForIndex.run });

        expect(O.getOrThrow(keyword.run.answer)).toContain("helper (const) in");
        expect(O.getOrThrow(keyword.run.answer)).toContain("src/util.ts");
        expect(keyword.run.citations.length).toBeGreaterThan(0);
        assertCitationAlignment({ events: keyword.events, run: keyword.run });
      })
    )
  );

  it.effect("keeps ambiguous file dependency queries bounded instead of guessing", () =>
    withRuntime(
      Effect.gen(function* () {
        const { registration } = yield* indexCollisionFixtureRepo;
        const result = yield* runQuery({
          repoId: registration.id,
          question: "dependencies of index",
          runLabel: "ambiguous-index",
        });

        if (result.run.kind !== "query") {
          return yield* Effect.die("Expected a query run.");
        }

        const packet = O.getOrThrow(result.run.retrievalPacket);
        expect(O.getOrThrow(result.run.answer)).toContain('Ambiguous file query "index"');
        expect(O.getOrThrow(result.run.answer)).toContain("src/index.ts");
        expect(O.getOrThrow(result.run.answer)).toContain("src/feature/index.ts");
        expect(result.run.citations.length).toBe(2);
        assertCitationAlignment({ events: result.events, run: result.run });
        expect(packet.summary).toContain("matched multiple indexed files");
        expect(packet.notes).toContain("candidateCount=2");
        expect(packetNlpNotes(result.run)).toContain("nlp:match-strategy=file-suffix");
      })
    )
  );

  it.effect("keeps unsupported queries explicit and bounded", () =>
    withRuntime(
      Effect.gen(function* () {
        const { registration } = yield* indexFixtureRepo;
        const result = yield* runQuery({
          repoId: registration.id,
          question: "what architecture patterns does this repo prefer?",
          runLabel: "unsupported",
        });

        if (result.run.kind !== "query") {
          return yield* Effect.die("Expected a query run.");
        }

        const packet = O.getOrThrow(result.run.retrievalPacket);
        expect(O.getOrThrow(result.run.answer)).toContain("Unsupported query shape.");
        expect(result.run.citations).toEqual([]);
        expect(packet.summary).toContain("did not match one of the supported deterministic query shapes");
        expect(O.isSome(packet.sourceSnapshotId)).toBe(true);
      })
    )
  );
});
