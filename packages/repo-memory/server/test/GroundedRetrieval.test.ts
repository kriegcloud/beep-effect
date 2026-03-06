import { RunId } from "@beep/repo-memory-domain";
import { LocalRepoMemoryDriver, LocalRepoMemoryDriverConfig } from "@beep/repo-memory-drivers-local";
import { RepoRegistrationInput, type RunStreamEvent } from "@beep/runtime-protocol";
import { FilePath } from "@beep/schema";
import { makeSqlTestLayer, NodeSqliteTestDriver, TestDatabaseInfo } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, pipe, Stream } from "effect";
import * as A from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import { GroundedRetrievalService, RepoMemoryServer, TypeScriptIndexService } from "../src/index.js";

const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRunId = S.decodeUnknownSync(RunId);
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

const makeServerLayer = () => {
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
  const typeScriptIndexLayer = TypeScriptIndexService.layer.pipe(Layer.provide(sqlLayer));
  const groundedLayer = GroundedRetrievalService.layer.pipe(Layer.provide(driverLayer));
  const repoMemoryServerLayer = RepoMemoryServer.layer.pipe(
    Layer.provideMerge(driverLayer),
    Layer.provideMerge(typeScriptIndexLayer),
    Layer.provideMerge(EventJournal.layerMemory),
    Layer.provideMerge(Reactivity.layer),
    Layer.provideMerge(groundedLayer)
  );

  return Layer.mergeAll(
    sqlLayer,
    driverLayer,
    typeScriptIndexLayer,
    EventJournal.layerMemory,
    Reactivity.layer,
    groundedLayer,
    repoMemoryServerLayer
  );
};

const withServer = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.provide(makeServerLayer(), { local: true }));

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
      'import { helper } from "./util";',
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
    ["export const helper = (value: number): number => value + 1;", ""].join("\n")
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
  const server = yield* RepoMemoryServer;
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

const runQuery = (input: { readonly repoId: string; readonly question: string; readonly runLabel: string }) =>
  Effect.gen(function* () {
    const server = yield* RepoMemoryServer;
    const runId = decodeRunId(`run:query:${input.runLabel}`);
    const payload = {
      repoId: input.repoId,
      question: input.question,
      questionFingerprint: O.none(),
    } as const;
    const acceptance = yield* server.acceptQueryRun(payload, runId);

    if (acceptance.dispatch) {
      yield* server.executeQueryRun(payload, runId);
    }

    const run = yield* server.getRun(runId);
    const events = yield* Stream.runCollect(server.streamRunEvents({ runId, cursor: O.none() }));

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

const assertCitationAlignment = (input: {
  readonly events: ReadonlyArray<RunStreamEvent>;
  readonly run: {
    readonly citations: ReadonlyArray<{ readonly id: string }>;
    readonly retrievalPacket: O.Option<{
      readonly citations: ReadonlyArray<{ readonly id: string }>;
    }>;
  };
}) => {
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

describe("RepoMemoryServer grounded retrieval", () => {
  it.effect("answers file import questions with grounded citations", () =>
    withServer(
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
        assertCitationAlignment(result);
      })
    )
  );

  it.effect("answers importer and symbol count queries deterministically", () =>
    withServer(
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
        expect(O.getOrThrow(countSymbols.run.answer)).toContain("4 captured TypeScript symbols");
        expect(countSymbols.run.citations).toEqual([]);
        expect(countPacket.summary).toContain("Counted indexed TypeScript symbols");
        expect(countPacket.notes).toContain("countSymbols=4");
      })
    )
  );

  it.effect("answers locate, describe, export, and keyword queries with stable grounded citations", () =>
    withServer(
      Effect.gen(function* () {
        const { registration } = yield* indexFixtureRepo;
        const locate = yield* runQuery({
          repoId: registration.id,
          question: "where is `greet`?",
          runLabel: "locate-greet",
        });
        const describe = yield* runQuery({
          repoId: registration.id,
          question: "describe `answer`",
          runLabel: "describe-answer",
        });
        const exports = yield* runQuery({
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
          describe.run.kind !== "query" ||
          exports.run.kind !== "query" ||
          keyword.run.kind !== "query"
        ) {
          return yield* Effect.die("Expected query run projections.");
        }

        expect(O.getOrThrow(locate.run.answer)).toContain("src/index.ts");
        expect(locate.run.citations.length).toBeGreaterThan(0);
        assertCitationAlignment(locate);

        expect(O.getOrThrow(describe.run.answer)).toContain("Signature:");
        expect(O.getOrThrow(describe.run.answer)).toContain("answer");
        expect(describe.run.citations.length).toBeGreaterThan(0);
        assertCitationAlignment(describe);

        expect(O.getOrThrow(exports.run.answer)).toContain("answer (const)");
        expect(O.getOrThrow(exports.run.answer)).toContain("greet (function)");
        expect(exports.run.citations.length).toBeGreaterThan(0);
        assertCitationAlignment(exports);

        expect(O.getOrThrow(keyword.run.answer)).toContain("helper in");
        expect(O.getOrThrow(keyword.run.answer)).toContain("src/util.ts");
        expect(keyword.run.citations.length).toBeGreaterThan(0);
        assertCitationAlignment(keyword);
      })
    )
  );

  it.effect("keeps unsupported queries explicit and bounded", () =>
    withServer(
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
