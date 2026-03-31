import {
  Citation,
  CitationSpan,
  RepoId,
  RetrievalCountPayload,
  RetrievalPacket,
  RetrievalPacketMaterializedEvent,
  RunAcceptedEvent,
  RunCursor,
  RunEventSequence,
  RunId,
  RunProgressUpdatedEvent,
  StreamRunEventsRequest,
} from "@beep/repo-memory-model";
import { RepoMemorySqlConfig, RepoMemorySqlLive } from "@beep/repo-memory-sqlite";
import { RepoRunStore } from "@beep/repo-memory-store";
import { FilePath, NonNegativeInt, PosInt } from "@beep/schema";
import { makeSqlTestLayer, NodeSqliteTestDriver, TestDatabaseInfo } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import { RepoRunEventLog } from "../src/internal/RepoRunEventLog.ts";

const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodePosInt = S.decodeUnknownSync(PosInt);
const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeRunCursor = S.decodeUnknownSync(RunCursor);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);
const decodeRunId = S.decodeUnknownSync(RunId);
const makeUtc = (value: number): DateTime.Utc => DateTime.toUtc(DateTime.makeUnsafe(value));

const repoId = decodeRepoId("repo:event-log:test");
const queryRunId = decodeRunId("run:query:event-log:test");
const filePath = decodeFilePath("/tmp/repo/src/index.ts");

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
  const eventLogLayer = RepoRunEventLog.layer.pipe(
    Layer.provideMerge(storeLayer),
    Layer.provideMerge(EventJournal.layerMemory),
    Layer.provideMerge(Reactivity.layer)
  );

  return Layer.mergeAll(sqlLayer, storeLayer, EventJournal.layerMemory, Reactivity.layer, eventLogLayer);
};

const withRuntime = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.provide(makeRuntimeLayer(), { local: true }));

const makeCitation = () =>
  new Citation({
    id: "citation:event-log",
    repoId,
    label: "index.ts",
    rationale: "Event log test citation.",
    span: new CitationSpan({
      filePath,
      startLine: decodePosInt(1),
      endLine: decodePosInt(1),
      startColumn: O.some(decodePosInt(1)),
      endColumn: O.some(decodePosInt(8)),
      symbolName: O.some("answer"),
    }),
  });

const makePacket = (retrievedAt: DateTime.Utc) =>
  new RetrievalPacket({
    repoId,
    sourceSnapshotId: O.none(),
    query: "describe symbol `answer`",
    normalizedQuery: "describe symbol `answer`",
    queryKind: "countSymbols",
    retrievedAt,
    outcome: "resolved",
    summary: "Event-log packet summary.",
    citations: [makeCitation()],
    notes: ["event-log-note"],
    payload: O.some(
      new RetrievalCountPayload({
        target: "symbols",
        count: decodeNonNegativeInt(1),
      })
    ),
    issue: O.none(),
  });

describe("repo run event log", () => {
  it.effect("replays only events after the requested cursor and persists retrieval packets", () =>
    withRuntime(
      Effect.gen(function* () {
        const repoRunEventLog = yield* RepoRunEventLog;
        const repoRunStore = yield* RepoRunStore;
        const acceptedAt = makeUtc(1_706_400_000_000);
        const packetAt = makeUtc(1_706_400_003_000);
        const packet = makePacket(packetAt);

        yield* repoRunEventLog.appendRunEvent(
          new RunAcceptedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(1),
            emittedAt: acceptedAt,
            runKind: "query",
            repoId,
            question: O.some("describe symbol `answer`"),
          })
        );
        yield* repoRunEventLog.appendRunEvent(
          new RunProgressUpdatedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(2),
            emittedAt: makeUtc(1_706_400_001_000),
            phase: "grounding",
            message: "Normalizing the question.",
            percent: O.some(decodeNonNegativeInt(25)),
          })
        );
        yield* repoRunEventLog.appendRunEvent(
          new RetrievalPacketMaterializedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(3),
            emittedAt: packetAt,
            packet,
          })
        );

        const storedPacket = yield* repoRunStore.getRetrievalPacket(queryRunId);
        expect(O.isSome(storedPacket)).toBe(true);
        expect(
          pipe(
            storedPacket,
            O.map((value) => value.summary),
            O.getOrUndefined
          )
        ).toBe("Event-log packet summary.");

        const replayed = yield* repoRunEventLog.replayEventsForRun(
          new StreamRunEventsRequest({
            runId: queryRunId,
            cursor: O.some(decodeRunCursor(1)),
          })
        );

        expect(
          pipe(
            replayed,
            A.map((event) => event.sequence)
          )
        ).toEqual([decodeRunEventSequence(2), decodeRunEventSequence(3)]);
        expect(
          pipe(
            replayed,
            A.map((event) => event.kind)
          )
        ).toEqual(["progress", "retrieval-packet"]);
      })
    )
  );

  it.effect("returns a typed 404 when replay is requested for a missing run", () =>
    withRuntime(
      Effect.gen(function* () {
        const repoRunEventLog = yield* RepoRunEventLog;
        const error = yield* Effect.flip(
          repoRunEventLog.replayEventsForRun(
            new StreamRunEventsRequest({
              runId: decodeRunId("run:query:event-log:missing"),
              cursor: O.none(),
            })
          )
        );

        expect(error._tag).toBe("RepoRunServiceError");
        expect(error.status).toBe(404);
      })
    )
  );

  it.effect("fails replay when a stored journal payload cannot be decoded", () =>
    withRuntime(
      Effect.gen(function* () {
        const journal = yield* EventJournal.EventJournal;
        const repoRunEventLog = yield* RepoRunEventLog;

        yield* journal.write({
          event: "accepted",
          primaryKey: queryRunId,
          payload: new Uint8Array([0xff, 0x00, 0x7f]),
          effect: () => Effect.void,
        });

        const error = yield* Effect.flip(
          repoRunEventLog.replayEventsForRun(
            new StreamRunEventsRequest({
              runId: queryRunId,
              cursor: O.none(),
            })
          )
        );

        expect(error._tag).toBe("RepoRunServiceError");
        expect(error.status).toBe(500);
        expect(error.message).toContain("Failed to decode run event payload");
      })
    )
  );
});
