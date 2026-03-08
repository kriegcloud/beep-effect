import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import {
  AnswerDraftedEvent,
  IndexRepoRunInput,
  IndexRun,
  type InterruptRepoRunRequest,
  QueryRepoRunInput,
  QueryRun,
  RepoIndexArtifact,
  type RepoRegistration,
  type RepoRegistrationInput,
  type RepoRun,
  type ResumeRepoRunRequest,
  type RetrievalPacket,
  RetrievalPacketMaterializedEvent,
  RunAcceptedAck,
  RunAcceptedEvent,
  RunCommandAck,
  RunCompletedEvent,
  RunCursor,
  RunEventSequence,
  RunFailedEvent,
  RunId,
  RunInterruptedEvent,
  RunProgressUpdatedEvent,
  RunResumedEvent,
  RunStartedEvent,
  RunStreamEvent,
  RunStreamFailure,
  type StreamRunEventsRequest,
} from "@beep/repo-memory-model";
import {
  RepoRegistryStore,
  type RepoRegistryStoreShape,
  RepoRunStore,
  type RepoRunStoreShape,
  RepoSnapshotStore,
  type RepoSnapshotStoreShape,
  type RepoStoreError,
  RepoSymbolStore,
  type RepoSymbolStoreShape,
} from "@beep/repo-memory-store";
import { makeStatusCauseError, NonNegativeInt, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
import { thunkEffectVoid, thunkTrue } from "@beep/utils";
import {
  DateTime,
  Duration,
  Effect,
  flow,
  Layer,
  Match,
  pipe,
  Semaphore,
  ServiceMap,
  String as Str,
  Stream,
} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Msgpack from "effect/unstable/encoding/Msgpack";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import * as Workflow from "effect/unstable/workflow/Workflow";
import * as WorkflowEngine from "effect/unstable/workflow/WorkflowEngine";
import {
  TypeScriptIndexRequest,
  TypeScriptIndexService as TypeScriptIndexServiceInternal,
} from "../indexing/TypeScriptIndexer.js";
import { GroundedRetrievalService as GroundedRetrievalServiceInternal } from "../retrieval/GroundedRetrieval.js";
import { projectRunEvent, type RunProjectorError } from "../run/RunProjector.js";
import {
  acceptedIndexRun,
  acceptedQueryRun,
  beginRunExecution,
  completeIndexRun,
  completeQueryRun,
  failRun,
  interruptRun,
  type RunExecutionTransition,
  type RunStateMachineError,
} from "../run/RunStateMachine.js";
import { recordRunFinished, recordRunStarted } from "../telemetry/RepoMemoryTelemetry.js";

const $I = $RepoMemoryRuntimeId.create("internal/RepoMemoryRuntime");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeRunCursor = S.decodeUnknownSync(RunCursor);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);
const decodeRunEventPayload = S.decodeUnknownEffect(Msgpack.schema(RunStreamEvent));
const encodeRunEventPayload = S.encodeUnknownEffect(Msgpack.schema(RunStreamEvent));
const workflowVersion = "cluster-first-v0";
const workflowSuspensionPollInterval = Duration.millis(25);
const workflowSuspensionPollMaxAttempts = 200;
type RepoRuntimeStoreShape = RepoRegistryStoreShape & RepoRunStoreShape & RepoSnapshotStoreShape & RepoSymbolStoreShape;

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
 * Typed orchestration error emitted by the repo run service.
 *
 * @since 0.0.0
 * @category Errors
 */
export class RepoRunServiceError extends TaggedErrorClass<RepoRunServiceError>($I`RepoRunServiceError`)(
  "RepoRunServiceError",
  StatusCauseFields,
  $I.annote("RepoRunServiceError", {
    description: "Typed error for repo run service orchestration boundaries.",
  })
) {}

/**
 * Service contract for repo-memory orchestration and workflow entrypoints.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface RepoRunServiceShape {
  readonly acceptIndexRun: (
    payload: IndexRepoRunInput,
    runId: RunId
  ) => Effect.Effect<RunAcceptanceDecision, RepoRunServiceError>;
  readonly acceptQueryRun: (
    payload: QueryRepoRunInput,
    runId: RunId
  ) => Effect.Effect<RunAcceptanceDecision, RepoRunServiceError>;
  readonly executeIndexRun: (payload: IndexRepoRunInput, runId: RunId) => Effect.Effect<IndexRun, RepoRunServiceError>;
  readonly executeQueryRun: (payload: QueryRepoRunInput, runId: RunId) => Effect.Effect<QueryRun, RepoRunServiceError>;
  readonly getRun: (runId: RunId) => Effect.Effect<RepoRun, RepoRunServiceError>;
  readonly interruptRun: (
    request: InterruptRepoRunRequest
  ) => Effect.Effect<RunCommandAck, RepoRunServiceError, WorkflowEngine.WorkflowEngine>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, RepoRunServiceError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, RepoRunServiceError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, RepoRunServiceError>;
  readonly resumeRun: (
    request: ResumeRepoRunRequest
  ) => Effect.Effect<RunCommandAck, RepoRunServiceError, WorkflowEngine.WorkflowEngine>;
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
 * Tuple of workflow contracts exposed by the repo run service.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const RepoRunWorkflows = [IndexRepoRunWorkflow, QueryRepoRunWorkflow] as const;

const isTerminalEvent = (event: RunStreamEvent): boolean =>
  event.kind === "completed" || event.kind === "failed" || event.kind === "interrupted";

const makeRepoRunService = Effect.fn("RepoRunService.make")(function* () {
  const repoRegistryStore = yield* RepoRegistryStore;
  const repoRunStore = yield* RepoRunStore;
  const repoSnapshotStore = yield* RepoSnapshotStore;
  const repoSymbolStore = yield* RepoSymbolStore;
  const driver: RepoRuntimeStoreShape = {
    ...repoRegistryStore,
    ...repoRunStore,
    ...repoSnapshotStore,
    ...repoSymbolStore,
  };
  const journal = yield* EventJournal.EventJournal;
  const reactivity = yield* Reactivity.Reactivity;
  const typeScriptIndex = yield* TypeScriptIndexServiceInternal;
  const groundedRetrieval = yield* GroundedRetrievalServiceInternal;
  const runCommandSemaphore = yield* Semaphore.makePartitioned<RunId>({ permits: 1 });

  const toRunServiceError = makeStatusCauseError(RepoRunServiceError);

  const mapDriverError = <A>(effect: Effect.Effect<A, RepoStoreError>) =>
    effect.pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)));

  const mapJournalError = <A, E>(method: string, effect: Effect.Effect<A, E>) =>
    effect.pipe(
      Effect.mapError((error) =>
        S.is(RepoRunServiceError)(error) ? error : toRunServiceError(`Failed to ${method}.`, 500, error)
      )
    );

  const mapProjectorError = <A>(effect: Effect.Effect<A, RunProjectorError>) =>
    effect.pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)));

  const mapStateMachineError = <A>(effect: Effect.Effect<A, RunStateMachineError>) =>
    effect.pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)));

  const annotateRunServiceSpan = Effect.fn("RepoRunService.annotateSpan")(function* (
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

  const invalidateForRun = Effect.fn("RepoRunService.invalidateForRun")(function* (run: RepoRun) {
    yield* reactivity.invalidate(invalidationKeysForRun(run));
  });

  const requireRun = Effect.fn("RepoRunService.requireRun")(function* (
    runId: RunId
  ): Effect.fn.Return<RepoRun, RepoRunServiceError> {
    const maybeRun = yield* mapDriverError(driver.getRun(runId));

    return yield* O.match(maybeRun, {
      onNone: () => toRunServiceError(`Run not found: "${runId}".`, 404),
      onSome: Effect.succeed,
    });
  });

  const requireIndexRun = Effect.fn("RepoRunService.requireIndexRun")(function* (
    runId: RunId
  ): Effect.fn.Return<IndexRun, RepoRunServiceError> {
    const run = yield* requireRun(runId);

    if (run.kind !== "index") {
      return yield* toRunServiceError(`Run "${runId}" is not an index run.`, 400);
    }

    return run;
  });

  const requireQueryRun = Effect.fn("RepoRunService.requireQueryRun")(function* (
    runId: RunId
  ): Effect.fn.Return<QueryRun, RepoRunServiceError> {
    const run = yield* requireRun(runId);

    if (run.kind !== "query") {
      return yield* toRunServiceError(`Run "${runId}" is not a query run.`, 400);
    }

    return run;
  });

  const persistRunSnapshot = Effect.fn("RepoRunService.persistRunSnapshot")(function* (run: RepoRun) {
    yield* mapDriverError(driver.saveRun(run));
    yield* invalidateForRun(run);
  });

  const persistRetrievalPacket = Effect.fn("RepoRunService.persistRetrievalPacket")(function* (
    runId: RunId,
    packet: RetrievalPacket
  ) {
    yield* mapDriverError(driver.saveRetrievalPacket(runId, packet));
    yield* reactivity.invalidate(A.make(`run:${runId}`, `repo:${packet.repoId}`));
  });

  const materializeRunEvent = Effect.fn("RepoRunService.materializeRunEvent")(function* (
    event: RunStreamEvent
  ): Effect.fn.Return<void, RepoRunServiceError> {
    return yield* reactivity.withBatch(
      Effect.gen(function* () {
        const currentRun = yield* mapDriverError(driver.getRun(event.runId));
        const projectedRun = yield* mapProjectorError(projectRunEvent(currentRun, event));

        if (event.kind === "retrieval-packet") {
          yield* persistRetrievalPacket(event.runId, event.packet);
        }

        yield* persistRunSnapshot(projectedRun);
      })
    );
  });

  const appendRunEvent = Effect.fn("RepoRunService.appendRunEvent")(function* (
    event: RunStreamEvent
  ): Effect.fn.Return<RunStreamEvent, RepoRunServiceError> {
    const payload = yield* encodeRunEventPayload(event).pipe(
      Effect.mapError((cause) =>
        toRunServiceError(`Failed to encode run event "${event.kind}" for "${event.runId}".`, 500, cause)
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

  const decodeJournalEvent = Effect.fn("RepoRunService.decodeJournalEvent")(function* (entry: EventJournal.Entry) {
    return yield* decodeRunEventPayload(entry.payload).pipe(
      Effect.mapError((cause) =>
        toRunServiceError(`Failed to decode run event payload for "${entry.primaryKey}".`, 500, cause)
      )
    );
  });

  const replayEventsForRun = Effect.fn("RepoRunService.replayEventsForRun")(function* (
    request: StreamRunEventsRequest
  ): Effect.fn.Return<ReadonlyArray<RunStreamEvent>, RepoRunServiceError> {
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
      onNone: () => toRunServiceError(`Run not found: "${request.runId}".`, 404),
      onSome: () => Effect.succeed(replayEvents),
    });
  });

  const ensureProjectedIndexRun = Effect.fn("RepoRunService.ensureProjectedIndexRun")(function* (
    run: RepoRun
  ): Effect.fn.Return<IndexRun, RepoRunServiceError> {
    if (run.kind !== "index") {
      return yield* toRunServiceError(`Expected an index run projection for "${run.id}".`, 500);
    }

    return run;
  });

  const ensureProjectedQueryRun = Effect.fn("RepoRunService.ensureProjectedQueryRun")(function* (
    run: RepoRun
  ): Effect.fn.Return<QueryRun, RepoRunServiceError> {
    if (run.kind !== "query") {
      return yield* toRunServiceError(`Expected a query run projection for "${run.id}".`, 500);
    }

    return run;
  });

  const nextSequenceForRun = (run: RepoRun): RunEventSequence => decodeRunEventSequence(run.lastEventSequence + 1);

  const appendExecutionTransitionEvent = Effect.fn("RepoRunService.appendExecutionTransitionEvent")(function* (
    runId: RunId,
    emittedAt: DateTime.Utc,
    transition: RunExecutionTransition
  ): Effect.fn.Return<RepoRun, RepoRunServiceError> {
    yield* Match.value(transition.eventKind).pipe(
      Match.when("started", () =>
        appendRunEvent(
          new RunStartedEvent({
            runId,
            sequence: transition.run.lastEventSequence,
            emittedAt,
            run: transition.run,
          })
        )
      ),
      Match.when("resumed", () =>
        appendRunEvent(
          new RunResumedEvent({
            runId,
            sequence: transition.run.lastEventSequence,
            emittedAt,
            run: transition.run,
          })
        )
      ),
      Match.exhaustive
    );

    return transition.run;
  });

  const appendProjectedEvent = Effect.fn("RepoRunService.appendProjectedEvent")(function* (
    currentRun: RepoRun,
    event: Extract<RunStreamEvent, { readonly kind: "progress" | "retrieval-packet" | "answer" }>
  ): Effect.fn.Return<RepoRun, RepoRunServiceError> {
    yield* appendRunEvent(event);
    return yield* mapProjectorError(projectRunEvent(O.some(currentRun), event));
  });

  const suspendIfRunInterrupted = Effect.fn("RepoRunService.suspendIfRunInterrupted")(function* (
    runId: RunId
  ): Effect.fn.Return<void, RepoRunServiceError> {
    const runOption = yield* mapDriverError(driver.getRun(runId));

    if (O.isNone(runOption) || runOption.value.status !== "interrupted") {
      return;
    }

    const instanceOption = yield* Effect.serviceOption(WorkflowEngine.WorkflowInstance);

    if (O.isNone(instanceOption)) {
      yield* Effect.logWarning(`Run "${runId}" was interrupted without a workflow instance to suspend.`);
      return;
    }

    return yield* Workflow.suspend(instanceOption.value);
  });

  const waitForWorkflowSuspended = Effect.fn("RepoRunService.waitForWorkflowSuspended")(function* (
    run: RepoRun
  ): Effect.fn.Return<void, RepoRunServiceError, WorkflowEngine.WorkflowEngine> {
    for (let attempt = 0; attempt < workflowSuspensionPollMaxAttempts; attempt += 1) {
      const result = yield* Match.value(run).pipe(
        Match.discriminatorsExhaustive("kind")({
          index: () => IndexRepoRunWorkflow.poll(run.id),
          query: () => QueryRepoRunWorkflow.poll(run.id),
        })
      );

      if (result !== undefined && result._tag === "Suspended") {
        return;
      }

      yield* Effect.sleep(workflowSuspensionPollInterval);
    }

    return yield* toRunServiceError(
      `Run "${run.id}" did not reach a suspended workflow state after interruption.`,
      409
    );
  });

  const emitInterruptedRun = Effect.fn("RepoRunService.emitInterruptedRun")(function* (
    runId: RunId,
    interruptedAt: DateTime.Utc
  ): Effect.fn.Return<void> {
    const attempt = Effect.gen(function* () {
      const run = yield* requireRun(runId);
      const interruptedRun = yield* mapStateMachineError(interruptRun(run, interruptedAt));

      yield* appendRunEvent(
        new RunInterruptedEvent({
          runId,
          sequence: interruptedRun.lastEventSequence,
          emittedAt: interruptedAt,
          run: interruptedRun,
        })
      );
    });

    yield* attempt.pipe(Effect.catch(thunkEffectVoid));
  });

  const emitFailedRun = Effect.fn("RepoRunService.emitFailedRun")(function* (
    runId: RunId,
    message: string
  ): Effect.fn.Return<void> {
    const attempt = Effect.gen(function* () {
      const run = yield* requireRun(runId);
      const failedAt = yield* DateTime.now;
      const failedRun = yield* mapStateMachineError(failRun(run, failedAt, message));

      yield* appendRunEvent(
        new RunFailedEvent({
          runId,
          sequence: failedRun.lastEventSequence,
          emittedAt: failedAt,
          message,
          run: failedRun,
        })
      );
    });

    yield* attempt.pipe(Effect.catch(thunkEffectVoid));
  });

  const toRunCommandAck = (runId: RunId, command: "interrupt" | "resume", requestedAt: DateTime.Utc): RunCommandAck =>
    new RunCommandAck({
      runId,
      command,
      requestedAt,
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

  const validateRunCanBeginExecution = Effect.fn("RepoRunService.validateRunCanBeginExecution")(function* (
    run: RepoRun,
    at: DateTime.Utc
  ): Effect.fn.Return<void, RepoRunServiceError> {
    // Guard only. The durable started/resumed transition is appended by the workflow execution path.
    yield* mapStateMachineError(beginRunExecution(run, at));
  });

  const acceptIndexRun: RepoRunServiceShape["acceptIndexRun"] = Effect.fn("RepoRunService.acceptIndexRun")(
    function* (payload, runId) {
      yield* annotateRunServiceSpan({ repo_id: payload.repoId, run_id: runId, run_kind: "index" });
      const maybeRun = yield* mapDriverError(driver.getRun(runId));

      if (O.isSome(maybeRun)) {
        yield* annotateRunServiceSpan({
          dispatch_required: false,
          accepted_existing_run: true,
        });
        return toAcceptanceDecision(maybeRun.value, false);
      }

      const acceptedAt = yield* DateTime.now;
      const run = acceptedIndexRun({
        runId,
        payload,
        acceptedAt,
      });
      yield* appendRunEvent(
        new RunAcceptedEvent({
          runId,
          sequence: run.lastEventSequence,
          emittedAt: acceptedAt,
          run,
        })
      );
      yield* annotateRunServiceSpan({
        dispatch_required: true,
        accepted_existing_run: false,
      });

      return toAcceptanceDecision(run, true);
    }
  );

  const acceptQueryRun: RepoRunServiceShape["acceptQueryRun"] = Effect.fn("RepoRunService.acceptQueryRun")(
    function* (payload, runId) {
      yield* annotateRunServiceSpan({ repo_id: payload.repoId, run_id: runId, run_kind: "query" });
      const maybeRun = yield* mapDriverError(driver.getRun(runId));

      if (O.isSome(maybeRun)) {
        yield* annotateRunServiceSpan({
          dispatch_required: false,
          accepted_existing_run: true,
        });
        return toAcceptanceDecision(maybeRun.value, false);
      }

      const acceptedAt = yield* DateTime.now;
      const run = acceptedQueryRun({
        runId,
        payload,
        acceptedAt,
      });
      yield* appendRunEvent(
        new RunAcceptedEvent({
          runId,
          sequence: run.lastEventSequence,
          emittedAt: acceptedAt,
          run,
        })
      );
      yield* annotateRunServiceSpan({
        dispatch_required: true,
        accepted_existing_run: false,
      });

      return toAcceptanceDecision(run, true);
    }
  );

  const interruptRunCommand: RepoRunServiceShape["interruptRun"] = Effect.fn("RepoRunService.interruptRun")(
    function* (request) {
      return yield* runCommandSemaphore.withPermits(
        request.runId,
        1
      )(
        Effect.gen(function* () {
          const run = yield* requireRun(request.runId);
          const requestedAt = yield* DateTime.now;
          const interruptedRun = yield* mapStateMachineError(interruptRun(run, requestedAt));

          yield* annotateRunServiceSpan({
            run_id: request.runId,
            run_kind: run.kind,
            run_status: run.status,
            command: "interrupt",
          });
          yield* appendRunEvent(
            new RunInterruptedEvent({
              runId: request.runId,
              sequence: interruptedRun.lastEventSequence,
              emittedAt: requestedAt,
              run: interruptedRun,
            })
          );
          yield* recordRunFinished(
            run.kind,
            "interrupted",
            pipe(
              run.startedAt,
              O.map((startedAt) => DateTime.toEpochMillis(requestedAt) - DateTime.toEpochMillis(startedAt)),
              O.getOrUndefined
            )
          );
          yield* waitForWorkflowSuspended(interruptedRun);

          return toRunCommandAck(request.runId, "interrupt", requestedAt);
        })
      );
    }
  );

  const resumeRunCommand: RepoRunServiceShape["resumeRun"] = Effect.fn("RepoRunService.resumeRun")(function* (request) {
    return yield* runCommandSemaphore.withPermits(
      request.runId,
      1
    )(
      Effect.gen(function* () {
        const run = yield* requireRun(request.runId);
        const requestedAt = yield* DateTime.now;

        yield* annotateRunServiceSpan({
          run_id: request.runId,
          run_kind: run.kind,
          run_status: run.status,
          command: "resume",
        });
        yield* validateRunCanBeginExecution(run, requestedAt);
        yield* waitForWorkflowSuspended(run);

        const currentRun = yield* requireRun(request.runId);
        yield* validateRunCanBeginExecution(currentRun, requestedAt);
        yield* Match.value(currentRun).pipe(
          Match.discriminatorsExhaustive("kind")({
            index: () => IndexRepoRunWorkflow.resume(request.runId),
            query: () => QueryRepoRunWorkflow.resume(request.runId),
          })
        );

        return toRunCommandAck(request.runId, "resume", requestedAt);
      })
    );
  });

  const executeIndexRun: RepoRunServiceShape["executeIndexRun"] = Effect.fn("RepoRunService.executeIndexRun")(
    function* (payload, runId) {
      yield* annotateRunServiceSpan({ repo_id: payload.repoId, run_id: runId, run_kind: "index" });
      let executionStartedAt: O.Option<DateTime.Utc> = O.none();

      const effect: Effect.Effect<IndexRun, RepoRunServiceError> = Effect.gen(function* () {
        const repo = yield* mapDriverError(driver.getRepo(payload.repoId));
        const currentRun = yield* requireIndexRun(runId);
        const lifecycleAt = yield* DateTime.now;
        executionStartedAt = O.some(lifecycleAt);
        const transition = yield* mapStateMachineError(beginRunExecution(currentRun, lifecycleAt));
        let runningRun = yield* ensureProjectedIndexRun(
          yield* appendExecutionTransitionEvent(runId, lifecycleAt, transition)
        );

        if (transition.eventKind === "started") {
          yield* recordRunStarted("index");
        }

        runningRun = yield* ensureProjectedIndexRun(
          yield* appendProjectedEvent(
            runningRun,
            new RunProgressUpdatedEvent({
              runId,
              sequence: nextSequenceForRun(runningRun),
              emittedAt: yield* DateTime.now,
              phase: "indexing",
              message: "Extracting deterministic TypeScript artifacts from workspace-scoped tsconfig projects.",
              percent: O.some(decodeNonNegativeInt(50)),
            })
          )
        );
        yield* suspendIfRunInterrupted(runId);

        const indexedArtifacts = yield* typeScriptIndex
          .indexRepo(
            new TypeScriptIndexRequest({
              repoId: payload.repoId,
              repoPath: repo.repoPath,
              runId,
            })
          )
          .pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)));

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

        const completedRun = yield* mapStateMachineError(
          completeIndexRun(runningRun, completedAt, indexedArtifacts.snapshot.fileCount)
        );

        yield* appendRunEvent(
          new RunCompletedEvent({
            runId,
            sequence: completedRun.lastEventSequence,
            emittedAt: completedAt,
            run: completedRun,
          })
        );
        yield* recordRunFinished(
          "index",
          "completed",
          DateTime.toEpochMillis(completedAt) - DateTime.toEpochMillis(lifecycleAt)
        );

        return completedRun;
      });

      return yield* effect.pipe(
        Effect.onInterrupt(() =>
          Effect.gen(function* () {
            const interruptedAt = yield* DateTime.now;

            yield* recordRunFinished(
              "index",
              "interrupted",
              pipe(
                executionStartedAt,
                O.map((startedAt) => DateTime.toEpochMillis(interruptedAt) - DateTime.toEpochMillis(startedAt)),
                O.getOrUndefined
              )
            );
            yield* emitInterruptedRun(runId, interruptedAt);
          })
        ),
        Effect.catchTag("RepoRunServiceError", (error) =>
          Effect.gen(function* () {
            const failedAt = yield* DateTime.now;

            yield* recordRunFinished(
              "index",
              "failed",
              pipe(
                executionStartedAt,
                O.map((startedAt) => DateTime.toEpochMillis(failedAt) - DateTime.toEpochMillis(startedAt)),
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

  const executeQueryRun: RepoRunServiceShape["executeQueryRun"] = Effect.fn("RepoRunService.executeQueryRun")(
    function* (payload, runId) {
      yield* annotateRunServiceSpan({ repo_id: payload.repoId, run_id: runId, run_kind: "query" });
      let executionStartedAt: O.Option<DateTime.Utc> = O.none();

      const effect: Effect.Effect<QueryRun, RepoRunServiceError> = Effect.gen(function* () {
        const currentRun = yield* requireQueryRun(runId);
        const lifecycleAt = yield* DateTime.now;
        executionStartedAt = O.some(lifecycleAt);
        const transition = yield* mapStateMachineError(beginRunExecution(currentRun, lifecycleAt));
        let runningRun = yield* ensureProjectedQueryRun(
          yield* appendExecutionTransitionEvent(runId, lifecycleAt, transition)
        );

        if (transition.eventKind === "started") {
          yield* recordRunStarted("query");
        }

        runningRun = yield* ensureProjectedQueryRun(
          yield* appendProjectedEvent(
            runningRun,
            new RunProgressUpdatedEvent({
              runId,
              sequence: nextSequenceForRun(runningRun),
              emittedAt: yield* DateTime.now,
              phase: "interpret",
              message: "Normalizing the question into one supported deterministic query shape.",
              percent: O.some(decodeNonNegativeInt(25)),
            })
          )
        );

        runningRun = yield* ensureProjectedQueryRun(
          yield* appendProjectedEvent(
            runningRun,
            new RunProgressUpdatedEvent({
              runId,
              sequence: nextSequenceForRun(runningRun),
              emittedAt: yield* DateTime.now,
              phase: "retrieve",
              message: "Retrieving bounded source-grounded artifacts from the latest persisted snapshot.",
              percent: O.some(decodeNonNegativeInt(60)),
            })
          )
        );
        yield* suspendIfRunInterrupted(runId);

        const groundedQuery = yield* groundedRetrieval
          .resolve(payload)
          .pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)));

        runningRun = yield* ensureProjectedQueryRun(
          yield* appendProjectedEvent(
            runningRun,
            new RetrievalPacketMaterializedEvent({
              runId,
              sequence: nextSequenceForRun(runningRun),
              emittedAt: yield* DateTime.now,
              packet: groundedQuery.packet,
            })
          )
        );

        runningRun = yield* ensureProjectedQueryRun(
          yield* appendProjectedEvent(
            runningRun,
            new AnswerDraftedEvent({
              runId,
              sequence: nextSequenceForRun(runningRun),
              emittedAt: yield* DateTime.now,
              answer: groundedQuery.answer,
              citations: groundedQuery.citations,
            })
          )
        );

        const completedAt = yield* DateTime.now;
        const completedRun = yield* mapStateMachineError(
          completeQueryRun(runningRun, completedAt, groundedQuery.answer, groundedQuery.citations, groundedQuery.packet)
        );

        yield* appendRunEvent(
          new RunCompletedEvent({
            runId,
            sequence: completedRun.lastEventSequence,
            emittedAt: completedAt,
            run: completedRun,
          })
        );
        yield* recordRunFinished(
          "query",
          "completed",
          DateTime.toEpochMillis(completedAt) - DateTime.toEpochMillis(lifecycleAt)
        );

        return completedRun;
      });

      return yield* effect.pipe(
        Effect.onInterrupt(() =>
          Effect.gen(function* () {
            const interruptedAt = yield* DateTime.now;

            yield* recordRunFinished(
              "query",
              "interrupted",
              pipe(
                executionStartedAt,
                O.map((startedAt) => DateTime.toEpochMillis(interruptedAt) - DateTime.toEpochMillis(startedAt)),
                O.getOrUndefined
              )
            );
            yield* emitInterruptedRun(runId, interruptedAt);
          })
        ),
        Effect.catchTag("RepoRunServiceError", (error) =>
          Effect.gen(function* () {
            const failedAt = yield* DateTime.now;

            yield* recordRunFinished(
              "query",
              "failed",
              pipe(
                executionStartedAt,
                O.map((startedAt) => DateTime.toEpochMillis(failedAt) - DateTime.toEpochMillis(startedAt)),
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

  const getRun: RepoRunServiceShape["getRun"] = Effect.fn("RepoRunService.getRun")(function* (runId) {
    return yield* requireRun(runId);
  });

  const listRepos: RepoRunServiceShape["listRepos"] = mapDriverError(driver.listRepos).pipe(
    Effect.withSpan("RepoRunService.listRepos"),
    Effect.annotateLogs({ component: "repo-memory-runtime" })
  );

  const listRuns: RepoRunServiceShape["listRuns"] = mapDriverError(driver.listRuns).pipe(
    Effect.withSpan("RepoRunService.listRuns"),
    Effect.annotateLogs({ component: "repo-memory-runtime" })
  );

  const registerRepo: RepoRunServiceShape["registerRepo"] = Effect.fn("RepoRunService.registerRepo")(function* (input) {
    const registration = yield* mapDriverError(driver.registerRepo(input));
    yield* reactivity.invalidate(A.make("repos", `repo:${registration.id}`, `repo-index:${registration.id}`));
    return registration;
  });

  const streamRunEvents: RepoRunServiceShape["streamRunEvents"] = (request) =>
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
        }).pipe(Effect.withSpan("RepoRunService.streamRunEvents"))
      )
    );

  return {
    acceptIndexRun,
    acceptQueryRun,
    executeIndexRun,
    executeQueryRun,
    getRun,
    interruptRun: interruptRunCommand,
    listRepos,
    listRuns,
    registerRepo,
    resumeRun: resumeRunCommand,
    streamRunEvents,
  } satisfies RepoRunServiceShape;
});

/**
 * Service tag for repo-memory orchestration.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoRunService extends ServiceMap.Service<RepoRunService, RepoRunServiceShape>()($I`RepoRunService`) {
  static readonly layer: Layer.Layer<
    RepoRunService,
    never,
    | GroundedRetrievalServiceInternal
    | TypeScriptIndexServiceInternal
    | RepoRegistryStore
    | RepoRunStore
    | RepoSnapshotStore
    | RepoSymbolStore
    | EventJournal.EventJournal
    | Reactivity.Reactivity
  > = Layer.effect(
    RepoRunService,
    makeRepoRunService().pipe(
      Effect.withSpan("RepoRunService.make"),
      Effect.annotateLogs({ component: "repo-memory-runtime" })
    )
  );
}

const toRunStreamFailure = (error: RepoRunServiceError): RunStreamFailure =>
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
    Effect.fn("RepoRunService.IndexRepoRunWorkflow")(function* (payload, executionId) {
      const repoRunService = yield* RepoRunService;
      return yield* repoRunService
        .executeIndexRun(payload, RunId.makeUnsafe(executionId))
        .pipe(Effect.mapError(toRunStreamFailure));
    })
  ),
  QueryRepoRunWorkflow.toLayer(
    Effect.fn("RepoRunService.QueryRepoRunWorkflow")(function* (payload, executionId) {
      const repoRunService = yield* RepoRunService;
      return yield* repoRunService
        .executeQueryRun(payload, RunId.makeUnsafe(executionId))
        .pipe(Effect.mapError(toRunStreamFailure));
    })
  )
);

/**
 * Deterministic grounded retrieval service export.
 *
 * @since 0.0.0
 * @category Layers
 */
export const GroundedRetrievalService = GroundedRetrievalServiceInternal;

/**
 * Deterministic TypeScript index service export.
 *
 * @since 0.0.0
 * @category Layers
 */
export const TypeScriptIndexService = TypeScriptIndexServiceInternal;
