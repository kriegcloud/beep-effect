import {
  Citation,
  CitationSpan,
  RepoId,
  RetrievalCountPayload,
  RetrievalPacket,
  RetrievalPacketMaterializedEvent,
  RunAcceptedEvent,
  RunCompletedEvent,
  RunCursor,
  RunEventSequence,
  RunId,
  RunProgressUpdatedEvent,
  RunStreamEvent,
  StreamRunEventsRequest,
} from "@beep/repo-memory-model";
import { RepoRunEventLog } from "@beep/repo-memory-runtime/internal/RepoRunEventLog";
import { RepoRunProjectionBootstrap } from "@beep/repo-memory-runtime/internal/RepoRunProjectionBootstrap";
import { projectRunEvent } from "@beep/repo-memory-runtime/run/RunProjector";
import { RepoMemorySqlConfig, RepoMemorySqlLive } from "@beep/repo-memory-sqlite";
import { RepoRunStore } from "@beep/repo-memory-store";
import { FilePath, NonNegativeInt, PosInt } from "@beep/schema";
import { BunSqliteTestDriver, makeSqlTestLayer, NodeSqliteTestDriver, TestDatabaseInfo } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect, Layer, pipe, Ref, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Msgpack from "effect/unstable/encoding/Msgpack";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";

const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodePosInt = S.decodeUnknownSync(PosInt);
const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeRunCursor = S.decodeUnknownSync(RunCursor);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);
const decodeRunId = S.decodeUnknownSync(RunId);
const encodeRunEventPayload = S.encodeUnknownEffect(Msgpack.schema(RunStreamEvent));
const sqlTestDriver = process.versions.bun === undefined ? NodeSqliteTestDriver : BunSqliteTestDriver;
type RepoRunStoreShape = Parameters<typeof RepoRunStore.of>[0];
type RepoRunEventLogShape = Parameters<typeof RepoRunEventLog.of>[0];
type EffectSuccess<T> = T extends (...args: infer _Args) => Effect.Effect<infer A, infer _E, infer _R> ? A : never;

const repoId = decodeRepoId("repo:projection-bootstrap:test");
const queryRunId = decodeRunId("run:query:projection-bootstrap:test");
const filePath = decodeFilePath("/tmp/repo/src/index.ts");

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
  const eventLogLayer = RepoRunEventLog.layer.pipe(
    Layer.provideMerge(storeLayer),
    Layer.provideMerge(EventJournal.layerMemory),
    Layer.provideMerge(Reactivity.layer)
  );
  const projectionBootstrapLayer = RepoRunProjectionBootstrap.layer.pipe(
    Layer.provideMerge(storeLayer),
    Layer.provideMerge(eventLogLayer)
  );

  return Layer.mergeAll(
    sqlLayer,
    storeLayer,
    EventJournal.layerMemory,
    Reactivity.layer,
    eventLogLayer,
    projectionBootstrapLayer
  );
};

const withRuntime = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.provide(makeRuntimeLayer(), { local: true }));

const makeUtc = (value: number): DateTime.Utc => DateTime.toUtc(DateTime.makeUnsafe(value));

const makeCitation = () =>
  new Citation({
    id: "citation:projection-bootstrap",
    repoId,
    label: "index.ts",
    rationale: "Projection bootstrap test citation.",
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
    summary: "Projection bootstrap packet summary.",
    citations: [makeCitation()],
    notes: ["projection-bootstrap-note"],
    payload: O.some(
      new RetrievalCountPayload({
        target: "symbols",
        count: decodeNonNegativeInt(1),
      })
    ),
    issue: O.none(),
  });

const unexpectedEffect = <A>(message: string): Effect.Effect<A> => Effect.die(new Error(message));
const staleBootstrapGetRetrievalPacket: RepoRunStoreShape["getRetrievalPacket"] = Effect.fn(
  "RepoRunStore.getRetrievalPacket"
)(() => Effect.succeed(O.none()));
const staleBootstrapSaveRetrievalPacket: RepoRunStoreShape["saveRetrievalPacket"] = Effect.fn(
  "RepoRunStore.saveRetrievalPacket"
)((_runId, _packet) =>
  unexpectedEffect<EffectSuccess<RepoRunStoreShape["saveRetrievalPacket"]>>(
    "saveRetrievalPacket should not run during stream bootstrap"
  )
);
const staleBootstrapSaveRun: RepoRunStoreShape["saveRun"] = Effect.fn("RepoRunStore.saveRun")((_run) =>
  unexpectedEffect<EffectSuccess<RepoRunStoreShape["saveRun"]>>("saveRun should not run during stream bootstrap")
);
const staleBootstrapAppendExecutionTransitionEvent: RepoRunEventLogShape["appendExecutionTransitionEvent"] = Effect.fn(
  "RepoRunEventLog.appendExecutionTransitionEvent"
)((_runId, _emittedAt, _transition) =>
  unexpectedEffect<EffectSuccess<RepoRunEventLogShape["appendExecutionTransitionEvent"]>>(
    "appendExecutionTransitionEvent should not run during stream bootstrap"
  )
);
const staleBootstrapAppendProjectedEvent: RepoRunEventLogShape["appendProjectedEvent"] = Effect.fn(
  "RepoRunEventLog.appendProjectedEvent"
)((_currentRun, _event) =>
  unexpectedEffect<EffectSuccess<RepoRunEventLogShape["appendProjectedEvent"]>>(
    "appendProjectedEvent should not run during stream bootstrap"
  )
);
const staleBootstrapAppendQueryStageProgress: RepoRunEventLogShape["appendQueryStageProgress"] = Effect.fn(
  "RepoRunEventLog.appendQueryStageProgress"
)((_currentRun, _progress) =>
  unexpectedEffect<EffectSuccess<RepoRunEventLogShape["appendQueryStageProgress"]>>(
    "appendQueryStageProgress should not run during stream bootstrap"
  )
);
const staleBootstrapAppendRunEvent: RepoRunEventLogShape["appendRunEvent"] = Effect.fn(
  "RepoRunEventLog.appendRunEvent"
)((_event) =>
  unexpectedEffect<EffectSuccess<RepoRunEventLogShape["appendRunEvent"]>>(
    "appendRunEvent should not run during stream bootstrap"
  )
);
const staleBootstrapEnsureProjectedIndexRun: RepoRunEventLogShape["ensureProjectedIndexRun"] = Effect.fn(
  "RepoRunEventLog.ensureProjectedIndexRun"
)((_run) =>
  unexpectedEffect<EffectSuccess<RepoRunEventLogShape["ensureProjectedIndexRun"]>>(
    "ensureProjectedIndexRun should not run during stream bootstrap"
  )
);
const staleBootstrapEnsureProjectedQueryRun: RepoRunEventLogShape["ensureProjectedQueryRun"] = Effect.fn(
  "RepoRunEventLog.ensureProjectedQueryRun"
)((_run) =>
  unexpectedEffect<EffectSuccess<RepoRunEventLogShape["ensureProjectedQueryRun"]>>(
    "ensureProjectedQueryRun should not run during stream bootstrap"
  )
);
const staleBootstrapOpenLiveRunEventsAfter: RepoRunEventLogShape["openLiveRunEventsAfter"] = Effect.fn(
  "RepoRunEventLog.openLiveRunEventsAfter"
)((_runId, _cursor) => Effect.succeed(Stream.empty));

describe("repo run projection bootstrap", () => {
  it.effect("hydrates persisted runs through the snapshot-primary read path", () =>
    withRuntime(
      Effect.gen(function* () {
        const repoRunEventLog = yield* RepoRunEventLog;
        const repoRunProjectionBootstrap = yield* RepoRunProjectionBootstrap;

        yield* repoRunEventLog.appendRunEvent(
          new RunAcceptedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(1),
            emittedAt: makeUtc(1_706_500_000_000),
            runKind: "query",
            repoId,
            question: O.some("describe symbol `answer`"),
          })
        );

        const run = yield* repoRunProjectionBootstrap.requireRun(queryRunId);
        const runs = yield* repoRunProjectionBootstrap.listRuns;

        expect(run.id).toBe(queryRunId);
        expect(run.status).toBe("accepted");
        expect(run.lastEventSequence).toBe(decodeRunEventSequence(1));
        expect(
          pipe(
            runs,
            A.map((value) => value.id)
          )
        ).toContain(queryRunId);
      })
    )
  );

  it.effect("prepares replay-only handoff after the requested cursor", () =>
    withRuntime(
      Effect.gen(function* () {
        const repoRunEventLog = yield* RepoRunEventLog;
        const repoRunProjectionBootstrap = yield* RepoRunProjectionBootstrap;
        const packet = makePacket(makeUtc(1_706_500_003_000));

        yield* repoRunEventLog.appendRunEvent(
          new RunAcceptedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(1),
            emittedAt: makeUtc(1_706_500_000_000),
            runKind: "query",
            repoId,
            question: O.some("describe symbol `answer`"),
          })
        );
        yield* repoRunEventLog.appendRunEvent(
          new RunProgressUpdatedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(2),
            emittedAt: makeUtc(1_706_500_001_000),
            phase: "grounding",
            message: "Normalizing the question.",
            percent: O.some(decodeNonNegativeInt(25)),
          })
        );
        yield* repoRunEventLog.appendRunEvent(
          new RetrievalPacketMaterializedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(3),
            emittedAt: makeUtc(1_706_500_003_000),
            packet,
          })
        );

        const bootstrap = yield* repoRunProjectionBootstrap.prepareStream(
          new StreamRunEventsRequest({
            runId: queryRunId,
            cursor: O.some(decodeRunCursor(1)),
          })
        );

        expect(bootstrap.run.id).toBe(queryRunId);
        expect(
          pipe(
            bootstrap.replayEvents,
            A.map((event) => event.sequence)
          )
        ).toEqual([decodeRunEventSequence(2), decodeRunEventSequence(3)]);
        expect(bootstrap.effectiveCursor).toEqual(O.some(decodeRunCursor(3)));
        expect(bootstrap.terminalAfterReplay).toBe(false);
      })
    )
  );

  it.effect("returns replay-only terminal bootstrap when the requested cursor is already exhausted", () =>
    withRuntime(
      Effect.gen(function* () {
        const repoRunEventLog = yield* RepoRunEventLog;
        const repoRunProjectionBootstrap = yield* RepoRunProjectionBootstrap;

        yield* repoRunEventLog.appendRunEvent(
          new RunAcceptedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(1),
            emittedAt: makeUtc(1_706_500_000_000),
            runKind: "query",
            repoId,
            question: O.some("describe symbol `answer`"),
          })
        );
        yield* repoRunEventLog.appendRunEvent(
          new RunCompletedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(2),
            emittedAt: makeUtc(1_706_500_002_000),
            indexedFileCount: O.none(),
          })
        );

        const request = new StreamRunEventsRequest({
          runId: queryRunId,
          cursor: O.some(decodeRunCursor(2)),
        });
        const bootstrap = yield* repoRunProjectionBootstrap.prepareStream(request);
        const replayed = yield* Stream.runCollect(repoRunProjectionBootstrap.streamRunEvents(request));

        expect(bootstrap.terminalAfterReplay).toBe(true);
        expect(bootstrap.replayEvents).toEqual([]);
        expect(bootstrap.effectiveCursor).toEqual(O.some(decodeRunCursor(2)));
        expect(replayed).toEqual([]);
      })
    )
  );

  it.effect("fails typed when the requested cursor is ahead of the stored snapshot sequence", () =>
    withRuntime(
      Effect.gen(function* () {
        const repoRunEventLog = yield* RepoRunEventLog;
        const repoRunProjectionBootstrap = yield* RepoRunProjectionBootstrap;

        yield* repoRunEventLog.appendRunEvent(
          new RunAcceptedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(1),
            emittedAt: makeUtc(1_706_500_000_000),
            runKind: "query",
            repoId,
            question: O.some("describe symbol `answer`"),
          })
        );

        const error = yield* Effect.flip(
          repoRunProjectionBootstrap.prepareStream(
            new StreamRunEventsRequest({
              runId: queryRunId,
              cursor: O.some(decodeRunCursor(2)),
            })
          )
        );

        expect(error._tag).toBe("RepoRunServiceError");
        expect(error.status).toBe(409);
      })
    )
  );

  it.effect("reconciles a contiguous journal tail when the stored snapshot lags behind", () =>
    withRuntime(
      Effect.gen(function* () {
        const journal = yield* EventJournal.EventJournal;
        const repoRunEventLog = yield* RepoRunEventLog;
        const repoRunProjectionBootstrap = yield* RepoRunProjectionBootstrap;

        yield* repoRunEventLog.appendRunEvent(
          new RunAcceptedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(1),
            emittedAt: makeUtc(1_706_500_000_000),
            runKind: "query",
            repoId,
            question: O.some("describe symbol `answer`"),
          })
        );
        yield* repoRunEventLog.appendRunEvent(
          new RunProgressUpdatedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(2),
            emittedAt: makeUtc(1_706_500_001_000),
            phase: "grounding",
            message: "Normalizing the question.",
            percent: O.some(decodeNonNegativeInt(25)),
          })
        );

        const extraPayload = yield* encodeRunEventPayload(
          new RunProgressUpdatedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(3),
            emittedAt: makeUtc(1_706_500_003_000),
            phase: "retrieval",
            message: "Loading bounded evidence.",
            percent: O.some(decodeNonNegativeInt(60)),
          })
        );

        yield* journal.write({
          event: "progress",
          primaryKey: queryRunId,
          payload: extraPayload,
          effect: () => Effect.void,
        });

        const bootstrap = yield* repoRunProjectionBootstrap.prepareStream(
          new StreamRunEventsRequest({
            runId: queryRunId,
            cursor: O.some(decodeRunCursor(1)),
          })
        );

        expect(bootstrap.run.lastEventSequence).toBe(decodeRunEventSequence(3));
        expect(
          pipe(
            bootstrap.replayEvents,
            A.map((event) => event.sequence)
          )
        ).toEqual([decodeRunEventSequence(2), decodeRunEventSequence(3)]);
        expect(bootstrap.effectiveCursor).toEqual(O.some(decodeRunCursor(3)));
      })
    )
  );

  it.effect("fails typed when the decoded journal tail skips past the stored snapshot sequence", () =>
    withRuntime(
      Effect.gen(function* () {
        const journal = yield* EventJournal.EventJournal;
        const repoRunEventLog = yield* RepoRunEventLog;
        const repoRunProjectionBootstrap = yield* RepoRunProjectionBootstrap;

        yield* repoRunEventLog.appendRunEvent(
          new RunAcceptedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(1),
            emittedAt: makeUtc(1_706_500_000_000),
            runKind: "query",
            repoId,
            question: O.some("describe symbol `answer`"),
          })
        );
        yield* repoRunEventLog.appendRunEvent(
          new RunProgressUpdatedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(2),
            emittedAt: makeUtc(1_706_500_001_000),
            phase: "grounding",
            message: "Normalizing the question.",
            percent: O.some(decodeNonNegativeInt(25)),
          })
        );

        const extraPayload = yield* encodeRunEventPayload(
          new RunProgressUpdatedEvent({
            runId: queryRunId,
            sequence: decodeRunEventSequence(4),
            emittedAt: makeUtc(1_706_500_003_000),
            phase: "retrieval",
            message: "Loading bounded evidence.",
            percent: O.some(decodeNonNegativeInt(60)),
          })
        );

        yield* journal.write({
          event: "progress",
          primaryKey: queryRunId,
          payload: extraPayload,
          effect: () => Effect.void,
        });

        const error = yield* Effect.flip(
          repoRunProjectionBootstrap.prepareStream(
            new StreamRunEventsRequest({
              runId: queryRunId,
              cursor: O.none(),
            })
          )
        );

        expect(error._tag).toBe("RepoRunServiceError");
        expect(error.status).toBe(500);
        expect(error.message).toContain("missing contiguous sequence");
      })
    )
  );

  it.effect("refreshes stale active snapshots without failing replay bootstrap", () =>
    Effect.gen(function* () {
      const acceptedEvent = new RunAcceptedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(1),
        emittedAt: makeUtc(1_706_500_000_000),
        runKind: "query",
        repoId,
        question: O.some("describe symbol `answer`"),
      });
      const progressEvent = new RunProgressUpdatedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(2),
        emittedAt: makeUtc(1_706_500_001_000),
        phase: "grounding",
        message: "Normalizing the question.",
        percent: O.some(decodeNonNegativeInt(25)),
      });
      const acceptedRun = yield* projectRunEvent(O.none(), acceptedEvent);
      const progressedRun = yield* projectRunEvent(O.some(acceptedRun), progressEvent);
      const getRunCalls = yield* Ref.make(0);
      const getRun: RepoRunStoreShape["getRun"] = Effect.fn("RepoRunStore.getRun")((_runId) =>
        Ref.modify(getRunCalls, (count) => [O.some(count === 0 ? acceptedRun : progressedRun), count + 1] as const)
      );
      const readRunEvents: RepoRunEventLogShape["readRunEvents"] = Effect.fn("RepoRunEventLog.readRunEvents")(
        (_runId) => Effect.succeed([acceptedEvent, progressEvent])
      );

      const storeLayer = Layer.succeed(
        RepoRunStore,
        RepoRunStore.of({
          getRetrievalPacket: staleBootstrapGetRetrievalPacket,
          getRun,
          listRuns: Effect.succeed([progressedRun]),
          saveRetrievalPacket: staleBootstrapSaveRetrievalPacket,
          saveRun: staleBootstrapSaveRun,
        })
      );
      const eventLogLayer = Layer.succeed(
        RepoRunEventLog,
        RepoRunEventLog.of({
          appendExecutionTransitionEvent: staleBootstrapAppendExecutionTransitionEvent,
          appendProjectedEvent: staleBootstrapAppendProjectedEvent,
          appendQueryStageProgress: staleBootstrapAppendQueryStageProgress,
          appendRunEvent: staleBootstrapAppendRunEvent,
          ensureProjectedIndexRun: staleBootstrapEnsureProjectedIndexRun,
          ensureProjectedQueryRun: staleBootstrapEnsureProjectedQueryRun,
          nextSequenceForRun: () => {
            throw new Error("nextSequenceForRun should not run during stream bootstrap");
          },
          openLiveRunEventsAfter: staleBootstrapOpenLiveRunEventsAfter,
          readRunEvents,
        })
      );
      const bootstrapLayer = RepoRunProjectionBootstrap.layer.pipe(
        Layer.provide(storeLayer),
        Layer.provide(eventLogLayer)
      );
      const replayed = yield* Effect.gen(function* () {
        const bootstrap = yield* RepoRunProjectionBootstrap;

        return yield* Stream.runCollect(
          bootstrap.streamRunEvents(
            new StreamRunEventsRequest({
              runId: queryRunId,
              cursor: O.some(decodeRunCursor(1)),
            })
          )
        );
      }).pipe(Effect.provide(bootstrapLayer, { local: true }));

      expect(yield* Ref.get(getRunCalls)).toBe(2);
      expect(
        pipe(
          replayed,
          A.map((event) => event.sequence)
        )
      ).toEqual([decodeRunEventSequence(2)]);
    })
  );

  it.effect("refreshes stale snapshots before rejecting a replay cursor", () =>
    Effect.gen(function* () {
      const acceptedEvent = new RunAcceptedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(1),
        emittedAt: makeUtc(1_706_500_000_000),
        runKind: "query",
        repoId,
        question: O.some("describe symbol `answer`"),
      });
      const progressEvent = new RunProgressUpdatedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(2),
        emittedAt: makeUtc(1_706_500_001_000),
        phase: "grounding",
        message: "Normalizing the question.",
        percent: O.some(decodeNonNegativeInt(25)),
      });
      const acceptedRun = yield* projectRunEvent(O.none(), acceptedEvent);
      const progressedRun = yield* projectRunEvent(O.some(acceptedRun), progressEvent);
      const getRunCalls = yield* Ref.make(0);
      const getRun: RepoRunStoreShape["getRun"] = Effect.fn("RepoRunStore.getRun")((_runId) =>
        Ref.modify(getRunCalls, (count) => [O.some(count === 0 ? acceptedRun : progressedRun), count + 1] as const)
      );
      const readRunEvents: RepoRunEventLogShape["readRunEvents"] = Effect.fn("RepoRunEventLog.readRunEvents")(
        (_runId) => Effect.succeed([acceptedEvent, progressEvent])
      );

      const storeLayer = Layer.succeed(
        RepoRunStore,
        RepoRunStore.of({
          getRetrievalPacket: staleBootstrapGetRetrievalPacket,
          getRun,
          listRuns: Effect.succeed([progressedRun]),
          saveRetrievalPacket: staleBootstrapSaveRetrievalPacket,
          saveRun: staleBootstrapSaveRun,
        })
      );
      const eventLogLayer = Layer.succeed(
        RepoRunEventLog,
        RepoRunEventLog.of({
          appendExecutionTransitionEvent: staleBootstrapAppendExecutionTransitionEvent,
          appendProjectedEvent: staleBootstrapAppendProjectedEvent,
          appendQueryStageProgress: staleBootstrapAppendQueryStageProgress,
          appendRunEvent: staleBootstrapAppendRunEvent,
          ensureProjectedIndexRun: staleBootstrapEnsureProjectedIndexRun,
          ensureProjectedQueryRun: staleBootstrapEnsureProjectedQueryRun,
          nextSequenceForRun: () => {
            throw new Error("nextSequenceForRun should not run during stream bootstrap");
          },
          openLiveRunEventsAfter: staleBootstrapOpenLiveRunEventsAfter,
          readRunEvents,
        })
      );
      const bootstrapLayer = RepoRunProjectionBootstrap.layer.pipe(
        Layer.provide(storeLayer),
        Layer.provide(eventLogLayer)
      );
      const bootstrap = yield* Effect.gen(function* () {
        const projectionBootstrap = yield* RepoRunProjectionBootstrap;

        return yield* projectionBootstrap.prepareStream(
          new StreamRunEventsRequest({
            runId: queryRunId,
            cursor: O.some(decodeRunCursor(2)),
          })
        );
      }).pipe(Effect.provide(bootstrapLayer, { local: true }));

      expect(yield* Ref.get(getRunCalls)).toBe(2);
      expect(bootstrap.replayEvents).toEqual([]);
      expect(bootstrap.effectiveCursor).toEqual(O.some(decodeRunCursor(2)));
    })
  );
});
