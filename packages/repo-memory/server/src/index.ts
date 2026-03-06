import { $RepoMemoryServerId } from "@beep/identity/packages";
import {
  IndexRepoRunInput,
  QueryRepoRunInput,
  type RetrievalPacket,
  RunCursor,
  RunEventSequence,
  RunId,
  RunStreamFailure,
} from "@beep/repo-memory-domain";
import {
  LocalRepoMemoryDriver,
  type LocalRepoMemoryDriverError,
  RepoIndexArtifact,
} from "@beep/repo-memory-drivers-local";
import {
  AnswerDraftedEvent,
  IndexRun,
  QueryRun,
  type RepoRegistration,
  type RepoRegistrationInput,
  type RepoRun,
  RetrievalPacketMaterializedEvent,
  RunAcceptedAck,
  RunAcceptedEvent,
  RunCompletedEvent,
  RunFailedEvent,
  RunProgressUpdatedEvent,
  RunStartedEvent,
  RunStreamEvent,
  type StreamRunEventsRequest,
} from "@beep/runtime-protocol";
import { NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import { thunkEffectVoid, thunkTrue } from "@beep/utils";
import { DateTime, Effect, flow, Layer, Match, pipe, ServiceMap, String as Str, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Msgpack from "effect/unstable/encoding/Msgpack";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import * as Workflow from "effect/unstable/workflow/Workflow";
import { GroundedRetrievalService } from "./internal/GroundedRetrieval.js";
import { recordRunFinished, recordRunStarted } from "./internal/RepoMemoryMetrics.js";
import { TypeScriptIndexRequest, TypeScriptIndexService } from "./internal/TypeScriptIndex.js";

const $I = $RepoMemoryServerId.create("index");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeRunCursor = S.decodeUnknownSync(RunCursor);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);
const decodeRunEventPayload = S.decodeUnknownEffect(Msgpack.schema(RunStreamEvent));
const encodeRunEventPayload = S.encodeUnknownEffect(Msgpack.schema(RunStreamEvent));
const workflowVersion = "cluster-first-v0";

class RunAcceptanceDecision extends S.Class<RunAcceptanceDecision>($I`RunAcceptanceDecision`)(
  {
    ack: RunAcceptedAck,
    dispatch: S.Boolean,
  },
  $I.annote("RunAcceptanceDecision", {
    description: "Internal decision describing whether a workflow dispatch is still required after accepting a run.",
  })
) {}

/**
 * Typed orchestration error emitted by the repo-memory server.
 *
 * @since 0.0.0
 * @category Errors
 */
export class RepoMemoryServerError extends TaggedErrorClass<RepoMemoryServerError>($I`RepoMemoryServerError`)(
  "RepoMemoryServerError",
  {
    message: S.String,
    status: S.Number,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("RepoMemoryServerError", {
    description: "Typed error for repo-memory orchestration boundaries.",
  })
) {}

/**
 * Service contract for repo-memory orchestration and workflow entrypoints.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface RepoMemoryServerShape {
  readonly acceptIndexRun: (
    payload: IndexRepoRunInput,
    runId: RunId
  ) => Effect.Effect<RunAcceptanceDecision, RepoMemoryServerError>;
  readonly acceptQueryRun: (
    payload: QueryRepoRunInput,
    runId: RunId
  ) => Effect.Effect<RunAcceptanceDecision, RepoMemoryServerError>;
  readonly executeIndexRun: (
    payload: IndexRepoRunInput,
    runId: RunId
  ) => Effect.Effect<IndexRun, RepoMemoryServerError>;
  readonly executeQueryRun: (
    payload: QueryRepoRunInput,
    runId: RunId
  ) => Effect.Effect<QueryRun, RepoMemoryServerError>;
  readonly getRun: (runId: RunId) => Effect.Effect<RepoRun, RepoMemoryServerError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, RepoMemoryServerError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, RepoMemoryServerError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, RepoMemoryServerError>;
  readonly streamRunEvents: (request: StreamRunEventsRequest) => Stream.Stream<RunStreamEvent, RunStreamFailure>;
}

/**
 * Workflow contract for deterministic repository indexing runs.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const IndexRepoRunWorkflow = Workflow.make({
  name: "IndexRepoRun",
  payload: IndexRepoRunInput,
  success: IndexRun,
  error: RunStreamFailure,
  idempotencyKey: (payload) =>
    pipe(
      payload.sourceFingerprint,
      O.getOrElse(() => payload.repoId),
      (fingerprint) => `${workflowVersion}:${payload.repoId}:${fingerprint}`
    ),
});

/**
 * Workflow contract for deterministic repository query runs.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const QueryRepoRunWorkflow = Workflow.make({
  name: "QueryRepoRun",
  payload: QueryRepoRunInput,
  success: QueryRun,
  error: RunStreamFailure,
  idempotencyKey: (payload) =>
    pipe(
      payload.questionFingerprint,
      O.getOrElse(() => Str.toLowerCase(Str.trim(payload.question))),
      (fingerprint) => `${workflowVersion}:${payload.repoId}:${fingerprint}`
    ),
});

/**
 * Tuple of workflow contracts exposed by the repo-memory server.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const RepoRunWorkflows = [IndexRepoRunWorkflow, QueryRepoRunWorkflow] as const;

const isTerminalEvent = (event: RunStreamEvent): boolean =>
  event.kind === "completed" || event.kind === "failed" || event.kind === "interrupted";

const makeRepoMemoryServer = Effect.fn("RepoMemoryServer.make")(function* () {
  const driver = yield* LocalRepoMemoryDriver;
  const journal = yield* EventJournal.EventJournal;
  const reactivity = yield* Reactivity.Reactivity;
  const typeScriptIndex = yield* TypeScriptIndexService;
  const groundedRetrieval = yield* GroundedRetrievalService;

  const toServerError = (message: string, status: number, cause?: unknown): RepoMemoryServerError =>
    new RepoMemoryServerError({
      message,
      status,
      cause: O.isOption(cause) ? cause : O.fromUndefinedOr(cause),
    });

  const mapDriverError = <A>(effect: Effect.Effect<A, LocalRepoMemoryDriverError>) =>
    effect.pipe(Effect.mapError((error) => toServerError(error.message, error.status, error.cause)));

  const mapJournalError = <A, E>(method: string, effect: Effect.Effect<A, E>) =>
    effect.pipe(
      Effect.mapError((error) =>
        S.is(RepoMemoryServerError)(error) ? error : toServerError(`Failed to ${method}.`, 500, error)
      )
    );

  const annotateServerSpan = Effect.fn("RepoMemoryServer.annotateSpan")(function* (
    annotations: Record<string, unknown>
  ) {
    yield* Effect.annotateCurrentSpan(annotations);
  });

  const invalidationKeysForRun = Match.type<RepoRun>().pipe(
    Match.withReturnType<ReadonlyArray<string>>(),
    Match.discriminatorsExhaustive("kind")({
      index: (indexRun) =>
        A.make("runs", `run:${indexRun.id}`, `repo:${indexRun.repoId}`, `repo-index:${indexRun.repoId}`),
      query: (queryRun) => A.make("runs", `run:${queryRun.id}`, `repo:${queryRun.repoId}`),
    })
  );

  const invalidateForRun = Effect.fn("RepoMemoryServer.invalidateForRun")(function* (run: RepoRun) {
    yield* reactivity.invalidate(invalidationKeysForRun(run));
  });

  const requireRun = Effect.fn("RepoMemoryServer.requireRun")(function* (
    runId: RunId
  ): Effect.fn.Return<RepoRun, RepoMemoryServerError> {
    const maybeRun = yield* mapDriverError(driver.getRun(runId));

    return yield* O.match(maybeRun, {
      onNone: () => toServerError(`Run not found: "${runId}".`, 404),
      onSome: Effect.succeed,
    });
  });

  const requireIndexRun = Effect.fn("RepoMemoryServer.requireIndexRun")(function* (
    runId: RunId
  ): Effect.fn.Return<IndexRun, RepoMemoryServerError> {
    const run = yield* requireRun(runId);

    if (run.kind !== "index") {
      return yield* toServerError(`Run "${runId}" is not an index run.`, 400);
    }

    return run;
  });

  const requireQueryRun = Effect.fn("RepoMemoryServer.requireQueryRun")(function* (
    runId: RunId
  ): Effect.fn.Return<QueryRun, RepoMemoryServerError> {
    const run = yield* requireRun(runId);

    if (run.kind !== "query") {
      return yield* toServerError(`Run "${runId}" is not a query run.`, 400);
    }

    return run;
  });

  const persistRunSnapshot = Effect.fn("RepoMemoryServer.persistRunSnapshot")(function* (run: RepoRun) {
    yield* mapDriverError(driver.saveRun(run));
    yield* invalidateForRun(run);
  });

  const persistRetrievalPacket = Effect.fn("RepoMemoryServer.persistRetrievalPacket")(function* (
    runId: RunId,
    packet: RetrievalPacket
  ) {
    yield* mapDriverError(driver.saveRetrievalPacket(runId, packet));
    yield* reactivity.invalidate(A.make(`run:${runId}`, `repo:${packet.repoId}`));
  });

  const materializeRunEvent = Effect.fn("RepoMemoryServer.materializeRunEvent")(function* (
    event: RunStreamEvent
  ): Effect.fn.Return<void, RepoMemoryServerError> {
    return yield* reactivity.withBatch(
      RunStreamEvent.match(event, {
        accepted: (acceptedEvent) => persistRunSnapshot(acceptedEvent.run),
        started: (startedEvent) => persistRunSnapshot(startedEvent.run),
        completed: (completedEvent) => persistRunSnapshot(completedEvent.run),
        failed: (failedEvent) => persistRunSnapshot(failedEvent.run),
        interrupted: (interruptedEvent) => persistRunSnapshot(interruptedEvent.run),
        resumed: (resumedEvent) => persistRunSnapshot(resumedEvent.run),
        progress: Effect.fn("RepoMemoryServer.materializeProgress")(function* (progressEvent) {
          const run = yield* requireRun(progressEvent.runId);

          const updatedRun = Match.value(run).pipe(
            Match.discriminatorsExhaustive("kind")({
              index: (indexRun) =>
                new IndexRun({
                  ...indexRun,
                  status: "running",
                  lastEventSequence: progressEvent.sequence,
                }),
              query: (queryRun) =>
                new QueryRun({
                  ...queryRun,
                  status: "running",
                  lastEventSequence: progressEvent.sequence,
                }),
            })
          );

          yield* persistRunSnapshot(updatedRun);
        }),
        "retrieval-packet": Effect.fn("RepoMemoryServer.materializeRetrievalPacket")(function* (retrievalEvent) {
          const run = yield* requireQueryRun(retrievalEvent.runId);
          const updatedRun = new QueryRun({
            ...run,
            retrievalPacket: O.some(retrievalEvent.packet),
            lastEventSequence: retrievalEvent.sequence,
          });

          yield* persistRetrievalPacket(retrievalEvent.runId, retrievalEvent.packet);
          yield* persistRunSnapshot(updatedRun);
        }),
        answer: Effect.fn("RepoMemoryServer.materializeAnswer")(function* (answerEvent) {
          const run = yield* requireQueryRun(answerEvent.runId);
          const updatedRun = new QueryRun({
            ...run,
            answer: O.some(answerEvent.answer),
            citations: answerEvent.citations,
            lastEventSequence: answerEvent.sequence,
          });

          yield* persistRunSnapshot(updatedRun);
        }),
      })
    );
  });

  const appendRunEvent = Effect.fn("RepoMemoryServer.appendRunEvent")(function* (
    event: RunStreamEvent
  ): Effect.fn.Return<RunStreamEvent, RepoMemoryServerError> {
    const payload = yield* encodeRunEventPayload(event).pipe(
      Effect.mapError((cause) =>
        toServerError(`Failed to encode run event "${event.kind}" for "${event.runId}".`, 500, cause)
      )
    );

    return yield* mapJournalError(
      `append run event "${event.kind}" for "${event.runId}"`,
      journal.write({
        event: event.kind,
        primaryKey: event.runId,
        payload,
        effect: () => materializeRunEvent(event).pipe(Effect.as(event)),
      })
    );
  });

  const decodeJournalEvent = Effect.fn("RepoMemoryServer.decodeJournalEvent")(function* (entry: EventJournal.Entry) {
    return yield* decodeRunEventPayload(entry.payload).pipe(
      Effect.mapError((cause) =>
        toServerError(`Failed to decode run event payload for "${entry.primaryKey}".`, 500, cause)
      )
    );
  });

  const replayEventsForRun = Effect.fn("RepoMemoryServer.replayEventsForRun")(function* (
    request: StreamRunEventsRequest
  ): Effect.fn.Return<ReadonlyArray<RunStreamEvent>, RepoMemoryServerError> {
    const entries = yield* mapJournalError(`load journal entries for run "${request.runId}"`, journal.entries);
    const decoded = yield* Effect.forEach(entries, (entry) =>
      entry.primaryKey === request.runId ? decodeJournalEvent(entry).pipe(Effect.map(O.some)) : Effect.succeed(O.none())
    );
    const replayEvents = pipe(
      decoded,
      A.reduce(A.empty<RunStreamEvent>(), (events, maybeEvent) =>
        O.isSome(maybeEvent) ? pipe(events, A.append(maybeEvent.value)) : events
      ),
      A.filter((event) =>
        pipe(
          request.cursor,
          O.match({
            onNone: thunkTrue,
            onSome: (cursor) => event.sequence > cursor,
          })
        )
      )
    );

    if (A.isReadonlyArrayNonEmpty(replayEvents)) {
      return replayEvents;
    }

    const maybeRun = yield* mapDriverError(driver.getRun(request.runId));

    return yield* O.match(maybeRun, {
      onNone: () => toServerError(`Run not found: "${request.runId}".`, 404),
      onSome: () => Effect.succeed(replayEvents),
    });
  });

  const acceptedIndexRun = (runId: RunId, payload: IndexRepoRunInput, acceptedAt: DateTime.Utc): IndexRun =>
    new IndexRun({
      id: runId,
      repoId: payload.repoId,
      status: "accepted",
      acceptedAt,
      startedAt: O.none(),
      completedAt: O.none(),
      lastEventSequence: decodeRunEventSequence(1),
      indexedFileCount: O.none(),
      errorMessage: O.none(),
    });

  const acceptedQueryRun = (runId: RunId, payload: QueryRepoRunInput, acceptedAt: DateTime.Utc): QueryRun =>
    new QueryRun({
      id: runId,
      repoId: payload.repoId,
      question: payload.question,
      status: "accepted",
      acceptedAt,
      startedAt: O.none(),
      completedAt: O.none(),
      lastEventSequence: decodeRunEventSequence(1),
      answer: O.none(),
      citations: A.empty(),
      retrievalPacket: O.none(),
      errorMessage: O.none(),
    });

  const toRunningIndexRun = (run: IndexRun, startedAt: DateTime.Utc): IndexRun =>
    new IndexRun({
      ...run,
      status: "running",
      startedAt: O.some(startedAt),
      lastEventSequence: decodeRunEventSequence(2),
    });

  const toRunningQueryRun = (run: QueryRun, startedAt: DateTime.Utc): QueryRun =>
    new QueryRun({
      ...run,
      status: "running",
      startedAt: O.some(startedAt),
      lastEventSequence: decodeRunEventSequence(2),
    });

  const emitFailedRun = Effect.fn("RepoMemoryServer.emitFailedRun")(function* (
    runId: RunId,
    message: string
  ): Effect.fn.Return<void> {
    const attempt = Effect.gen(function* () {
      const run = yield* requireRun(runId);
      const completedAt = yield* DateTime.now;

      const failedRun = Match.value(run).pipe(
        Match.discriminatorsExhaustive("kind")({
          index: (indexRun) =>
            new IndexRun({
              ...indexRun,
              status: "failed",
              completedAt: O.some(completedAt),
              lastEventSequence: decodeRunEventSequence(indexRun.lastEventSequence + 1),
              errorMessage: O.some(message),
            }),
          query: (queryRun) =>
            new QueryRun({
              ...queryRun,
              status: "failed",
              completedAt: O.some(completedAt),
              lastEventSequence: decodeRunEventSequence(queryRun.lastEventSequence + 1),
              errorMessage: O.some(message),
            }),
        })
      );

      yield* appendRunEvent(
        new RunFailedEvent({
          runId,
          sequence: failedRun.lastEventSequence,
          emittedAt: completedAt,
          message,
          run: failedRun,
        })
      );
    });

    yield* attempt.pipe(Effect.catch(thunkEffectVoid));
  });

  const toAcceptanceDecision = (run: RepoRun, dispatch: boolean): RunAcceptanceDecision =>
    new RunAcceptanceDecision({
      ack: new RunAcceptedAck({
        runId: run.id,
        kind: run.kind,
        acceptedAt: run.acceptedAt,
      }),
      dispatch,
    });

  const acceptIndexRun: RepoMemoryServerShape["acceptIndexRun"] = Effect.fn("RepoMemoryServer.acceptIndexRun")(
    function* (payload, runId) {
      yield* annotateServerSpan({ repo_id: payload.repoId, run_id: runId, run_kind: "index" });
      const maybeRun = yield* mapDriverError(driver.getRun(runId));

      if (O.isSome(maybeRun)) {
        yield* annotateServerSpan({
          dispatch_required: false,
          accepted_existing_run: true,
        });
        return toAcceptanceDecision(maybeRun.value, false);
      }

      const acceptedAt = yield* DateTime.now;
      const run = acceptedIndexRun(runId, payload, acceptedAt);
      yield* appendRunEvent(
        new RunAcceptedEvent({
          runId,
          sequence: decodeRunEventSequence(1),
          emittedAt: acceptedAt,
          run,
        })
      );
      yield* annotateServerSpan({
        dispatch_required: true,
        accepted_existing_run: false,
      });

      return toAcceptanceDecision(run, true);
    }
  );

  const acceptQueryRun: RepoMemoryServerShape["acceptQueryRun"] = Effect.fn("RepoMemoryServer.acceptQueryRun")(
    function* (payload, runId) {
      yield* annotateServerSpan({ repo_id: payload.repoId, run_id: runId, run_kind: "query" });
      const maybeRun = yield* mapDriverError(driver.getRun(runId));

      if (O.isSome(maybeRun)) {
        yield* annotateServerSpan({
          dispatch_required: false,
          accepted_existing_run: true,
        });
        return toAcceptanceDecision(maybeRun.value, false);
      }

      const acceptedAt = yield* DateTime.now;
      const run = acceptedQueryRun(runId, payload, acceptedAt);
      yield* appendRunEvent(
        new RunAcceptedEvent({
          runId,
          sequence: decodeRunEventSequence(1),
          emittedAt: acceptedAt,
          run,
        })
      );
      yield* annotateServerSpan({
        dispatch_required: true,
        accepted_existing_run: false,
      });

      return toAcceptanceDecision(run, true);
    }
  );

  const executeIndexRun: RepoMemoryServerShape["executeIndexRun"] = Effect.fn("RepoMemoryServer.executeIndexRun")(
    function* (payload, runId) {
      yield* annotateServerSpan({ repo_id: payload.repoId, run_id: runId, run_kind: "index" });
      let startedAt: O.Option<DateTime.Utc> = O.none();

      const effect: Effect.Effect<IndexRun, RepoMemoryServerError> = Effect.gen(function* () {
        const repo = yield* mapDriverError(driver.getRepo(payload.repoId));
        const acceptedRun = yield* requireIndexRun(runId);
        const runStartedAt = yield* DateTime.now;
        startedAt = O.some(runStartedAt);
        const runningRun = toRunningIndexRun(acceptedRun, runStartedAt);

        yield* appendRunEvent(
          new RunStartedEvent({
            runId,
            sequence: decodeRunEventSequence(2),
            emittedAt: runStartedAt,
            run: runningRun,
          })
        );
        yield* recordRunStarted("index");

        yield* appendRunEvent(
          new RunProgressUpdatedEvent({
            runId,
            sequence: decodeRunEventSequence(3),
            emittedAt: yield* DateTime.now,
            phase: "indexing",
            message: "Extracting deterministic TypeScript artifacts from workspace-scoped tsconfig projects.",
            percent: O.some(decodeNonNegativeInt(50)),
          })
        );

        const indexedArtifacts = yield* typeScriptIndex
          .indexRepo(
            new TypeScriptIndexRequest({
              repoId: payload.repoId,
              repoPath: repo.repoPath,
            })
          )
          .pipe(Effect.mapError((error) => toServerError(error.message, error.status, error.cause)));

        const completedAt = yield* DateTime.now;
        const artifact = new RepoIndexArtifact({
          runId,
          repoId: payload.repoId,
          sourceSnapshotId: indexedArtifacts.snapshot.id,
          indexedFileCount: indexedArtifacts.snapshot.fileCount,
          completedAt,
        });

        yield* mapDriverError(
          driver.replaceSnapshotArtifacts({
            artifact,
            snapshot: indexedArtifacts.snapshot,
            files: indexedArtifacts.files,
            symbols: indexedArtifacts.symbols,
            importEdges: indexedArtifacts.importEdges,
          })
        );

        const completedRun = new IndexRun({
          ...runningRun,
          status: "completed",
          completedAt: O.some(completedAt),
          lastEventSequence: decodeRunEventSequence(4),
          indexedFileCount: O.some(indexedArtifacts.snapshot.fileCount),
        });

        yield* appendRunEvent(
          new RunCompletedEvent({
            runId,
            sequence: decodeRunEventSequence(4),
            emittedAt: completedAt,
            run: completedRun,
          })
        );
        yield* recordRunFinished(
          "index",
          "completed",
          DateTime.toEpochMillis(completedAt) - DateTime.toEpochMillis(runStartedAt)
        );

        return completedRun;
      });

      return yield* effect.pipe(
        Effect.catchTag("RepoMemoryServerError", (error) =>
          Effect.gen(function* () {
            const failedAt = yield* DateTime.now;

            yield* recordRunFinished(
              "index",
              "failed",
              pipe(
                startedAt,
                O.map((runStartedAt) => DateTime.toEpochMillis(failedAt) - DateTime.toEpochMillis(runStartedAt)),
                O.getOrUndefined
              )
            );
            yield* emitFailedRun(runId, error.message);
            return yield* error;
          })
        )
      );
    }
  );

  const executeQueryRun: RepoMemoryServerShape["executeQueryRun"] = Effect.fn("RepoMemoryServer.executeQueryRun")(
    function* (payload, runId) {
      yield* annotateServerSpan({ repo_id: payload.repoId, run_id: runId, run_kind: "query" });
      let startedAt: O.Option<DateTime.Utc> = O.none();

      const effect: Effect.Effect<QueryRun, RepoMemoryServerError> = Effect.gen(function* () {
        const acceptedRun = yield* requireQueryRun(runId);
        const runStartedAt = yield* DateTime.now;
        startedAt = O.some(runStartedAt);
        const runningRun = toRunningQueryRun(acceptedRun, runStartedAt);

        yield* appendRunEvent(
          new RunStartedEvent({
            runId,
            sequence: decodeRunEventSequence(2),
            emittedAt: runStartedAt,
            run: runningRun,
          })
        );
        yield* recordRunStarted("query");

        yield* appendRunEvent(
          new RunProgressUpdatedEvent({
            runId,
            sequence: decodeRunEventSequence(3),
            emittedAt: yield* DateTime.now,
            phase: "interpret",
            message: "Normalizing the question into one supported deterministic query shape.",
            percent: O.some(decodeNonNegativeInt(25)),
          })
        );

        yield* appendRunEvent(
          new RunProgressUpdatedEvent({
            runId,
            sequence: decodeRunEventSequence(4),
            emittedAt: yield* DateTime.now,
            phase: "retrieve",
            message: "Retrieving bounded source-grounded artifacts from the latest persisted snapshot.",
            percent: O.some(decodeNonNegativeInt(60)),
          })
        );

        const groundedQuery = yield* groundedRetrieval
          .resolve(payload)
          .pipe(Effect.mapError((error) => toServerError(error.message, error.status, error.cause)));

        yield* appendRunEvent(
          new RetrievalPacketMaterializedEvent({
            runId,
            sequence: decodeRunEventSequence(5),
            emittedAt: yield* DateTime.now,
            packet: groundedQuery.packet,
          })
        );

        yield* appendRunEvent(
          new AnswerDraftedEvent({
            runId,
            sequence: decodeRunEventSequence(6),
            emittedAt: yield* DateTime.now,
            answer: groundedQuery.answer,
            citations: groundedQuery.citations,
          })
        );

        const completedAt = yield* DateTime.now;
        const completedRun = new QueryRun({
          ...runningRun,
          status: "completed",
          completedAt: O.some(completedAt),
          lastEventSequence: decodeRunEventSequence(7),
          answer: O.some(groundedQuery.answer),
          citations: groundedQuery.citations,
          retrievalPacket: O.some(groundedQuery.packet),
        });

        yield* appendRunEvent(
          new RunCompletedEvent({
            runId,
            sequence: decodeRunEventSequence(7),
            emittedAt: completedAt,
            run: completedRun,
          })
        );
        yield* recordRunFinished(
          "query",
          "completed",
          DateTime.toEpochMillis(completedAt) - DateTime.toEpochMillis(runStartedAt)
        );

        return completedRun;
      });

      return yield* effect.pipe(
        Effect.catchTag("RepoMemoryServerError", (error) =>
          Effect.gen(function* () {
            const failedAt = yield* DateTime.now;

            yield* recordRunFinished(
              "query",
              "failed",
              pipe(
                startedAt,
                O.map((runStartedAt) => DateTime.toEpochMillis(failedAt) - DateTime.toEpochMillis(runStartedAt)),
                O.getOrUndefined
              )
            );
            yield* emitFailedRun(runId, error.message);
            return yield* error;
          })
        )
      );
    }
  );

  const getRun: RepoMemoryServerShape["getRun"] = Effect.fn("RepoMemoryServer.getRun")(function* (runId) {
    return yield* requireRun(runId);
  });

  const listRepos: RepoMemoryServerShape["listRepos"] = mapDriverError(driver.listRepos).pipe(
    Effect.withSpan("RepoMemoryServer.listRepos"),
    Effect.annotateLogs({ component: "repo-memory-server" })
  );

  const listRuns: RepoMemoryServerShape["listRuns"] = mapDriverError(driver.listRuns).pipe(
    Effect.withSpan("RepoMemoryServer.listRuns"),
    Effect.annotateLogs({ component: "repo-memory-server" })
  );

  const registerRepo: RepoMemoryServerShape["registerRepo"] = Effect.fn("RepoMemoryServer.registerRepo")(
    function* (input) {
      const registration = yield* mapDriverError(driver.registerRepo(input));
      yield* reactivity.invalidate(A.make("repos", `repo:${registration.id}`, `repo-index:${registration.id}`));
      return registration;
    }
  );

  const streamRunEvents: RepoMemoryServerShape["streamRunEvents"] = (request) =>
    Stream.scoped(
      Stream.unwrap(
        Effect.gen(function* () {
          yield* Effect.annotateCurrentSpan({
            run_id: request.runId,
            cursor_present: O.isSome(request.cursor),
          });
          const subscription = yield* journal.changes;
          const replayEvents = yield* replayEventsForRun(request).pipe(
            Effect.mapError((error) => new RunStreamFailure({ message: error.message, status: error.status }))
          );
          const lastReplayCursor = pipe(
            replayEvents,
            A.last,
            O.map((event) => decodeRunCursor(event.sequence)),
            O.orElse(() => request.cursor)
          );
          const replayStream = Stream.fromIterable(replayEvents);

          yield* Effect.annotateCurrentSpan({
            replay_event_count: replayEvents.length,
            replay_is_terminal: pipe(replayEvents, A.last, O.exists(isTerminalEvent)),
          });

          if (pipe(replayEvents, A.last, O.exists(isTerminalEvent))) {
            return replayStream;
          }

          const liveStream = Stream.fromSubscription(subscription).pipe(
            Stream.filter((entry) => entry.primaryKey === request.runId),
            Stream.mapEffect(
              flow(
                decodeJournalEvent,
                Effect.mapError((error) => new RunStreamFailure({ message: error.message, status: error.status }))
              )
            ),
            Stream.filter((event) =>
              pipe(
                lastReplayCursor,
                O.match({
                  onNone: thunkTrue,
                  onSome: (cursor) => event.sequence > cursor,
                })
              )
            ),
            Stream.takeUntil(isTerminalEvent)
          );

          return Stream.concat(replayStream, liveStream);
        }).pipe(Effect.withSpan("RepoMemoryServer.streamRunEvents"))
      )
    );

  return {
    acceptIndexRun,
    acceptQueryRun,
    executeIndexRun,
    executeQueryRun,
    getRun,
    listRepos,
    listRuns,
    registerRepo,
    streamRunEvents,
  } satisfies RepoMemoryServerShape;
});

/**
 * Service tag for repo-memory orchestration.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoMemoryServer extends ServiceMap.Service<RepoMemoryServer, RepoMemoryServerShape>()(
  $I`RepoMemoryServer`
) {
  static readonly layer: Layer.Layer<
    RepoMemoryServer,
    never,
    | GroundedRetrievalService
    | TypeScriptIndexService
    | LocalRepoMemoryDriver
    | EventJournal.EventJournal
    | Reactivity.Reactivity
  > = Layer.effect(
    RepoMemoryServer,
    makeRepoMemoryServer().pipe(
      Effect.withSpan("RepoMemoryServer.make"),
      Effect.annotateLogs({ component: "repo-memory-server" })
    )
  );
}

const toRunStreamFailure = (error: RepoMemoryServerError): RunStreamFailure =>
  new RunStreamFailure({
    message: error.message,
    status: error.status,
  });

/**
 * Live workflow layers for repository index and query runs.
 *
 * @since 0.0.0
 * @category Layers
 */
export const RepoRunWorkflowsLayer = Layer.mergeAll(
  IndexRepoRunWorkflow.toLayer(
    Effect.fn("RepoMemoryServer.IndexRepoRunWorkflow")(function* (payload, executionId) {
      const repoMemoryServer = yield* RepoMemoryServer;
      return yield* repoMemoryServer
        .executeIndexRun(payload, RunId.makeUnsafe(executionId))
        .pipe(Effect.mapError(toRunStreamFailure));
    })
  ),
  QueryRepoRunWorkflow.toLayer(
    Effect.fn("RepoMemoryServer.QueryRepoRunWorkflow")(function* (payload, executionId) {
      const repoMemoryServer = yield* RepoMemoryServer;
      return yield* repoMemoryServer
        .executeQueryRun(payload, RunId.makeUnsafe(executionId))
        .pipe(Effect.mapError(toRunStreamFailure));
    })
  )
);

export { GroundedRetrievalService } from "./internal/GroundedRetrieval.js";
export { TypeScriptIndexService } from "./internal/TypeScriptIndex.js";
