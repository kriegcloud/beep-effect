import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import {
  AnswerDraftedEvent,
  type IndexRepoRunInput,
  type IndexRun,
  type InterruptRepoRunRequest,
  type QueryRepoRunInput,
  type QueryRun,
  RepoIndexArtifact,
  type RepoRegistration,
  type RepoRegistrationInput,
  type RepoRun,
  type ResumeRepoRunRequest,
  RetrievalPacketMaterializedEvent,
  type RunCommandAck,
  RunCompletedEvent,
  RunId,
  RunProgressUpdatedEvent,
  type RunStreamEvent,
  type RunStreamFailure,
  type StreamRunEventsRequest,
} from "@beep/repo-memory-model";
import {
  RepoRegistryStore,
  RepoRunStore,
  RepoSemanticStore,
  RepoSnapshotStore,
  RepoSymbolStore,
} from "@beep/repo-memory-store";
import { NonNegativeInt } from "@beep/schema";
import { Config, Context, DateTime, Effect, type FileSystem, Layer, pipe, type Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type * as EventJournal from "effect/unstable/eventlog/EventJournal";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import type * as WorkflowEngine from "effect/unstable/workflow/WorkflowEngine";
import {
  type IndexedTypeScriptArtifacts,
  TypeScriptIndexRequest,
  TypeScriptIndexService as TypeScriptIndexServiceInternal,
} from "../indexing/TypeScriptIndexer.js";
import { GroundedRetrievalService as GroundedRetrievalServiceInternal } from "../retrieval/GroundedRetrieval.js";
import { beginRunExecution, completeIndexRun, completeQueryRun } from "../run/RunStateMachine.js";
import {
  RepoSemanticEnrichmentRequest,
  RepoSemanticEnrichmentService as RepoSemanticEnrichmentServiceInternal,
} from "../semantic/RepoSemanticEnrichmentService.js";
import { profileRunPhase, recordRunFinished, recordRunStarted } from "../telemetry/RepoMemoryTelemetry.js";
import { RepoRunEventLog } from "./RepoRunEventLog.js";
import { RepoRunLifecycleController, type RunAcceptanceDecision } from "./RepoRunLifecycleController.js";
import { RepoRunProjectionBootstrap } from "./RepoRunProjectionBootstrap.js";
import {
  mapStatusCauseError,
  RepoRunServiceError,
  type RepoRuntimeStoreShape,
  toRunServiceError,
  toRunStreamFailure,
} from "./RepoRunServiceShared.js";
import {
  IndexRepoRunWorkflow,
  QueryRepoRunWorkflow,
  RepoRunWorkflows,
  setRepoRunWorkflowVersion,
} from "./RepoRunWorkflowContracts.js";

const $I = $RepoMemoryRuntimeId.create("internal/RepoMemoryRuntime");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

/**
 * Service contract for repo-memory orchestration and workflow entrypoints.
 *
 * @since 0.0.0
 * @category PortContract
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

const makeRepoRunService = Effect.fn("RepoRunService.make")(function* () {
  const repoRegistryStore = yield* RepoRegistryStore;
  const repoRunStore = yield* RepoRunStore;
  const repoSemanticStore = yield* RepoSemanticStore;
  const repoSnapshotStore = yield* RepoSnapshotStore;
  const repoSymbolStore = yield* RepoSymbolStore;
  const driver: RepoRuntimeStoreShape = {
    ...repoRegistryStore,
    ...repoRunStore,
    ...repoSemanticStore,
    ...repoSnapshotStore,
    ...repoSymbolStore,
  };
  const typeScriptIndex = yield* TypeScriptIndexServiceInternal;
  const semanticEnrichment = yield* RepoSemanticEnrichmentServiceInternal;
  const groundedRetrieval = yield* GroundedRetrievalServiceInternal;
  const repoRunEventLog = yield* RepoRunEventLog;
  const repoRunLifecycleController = yield* RepoRunLifecycleController;
  const repoRunProjectionBootstrap = yield* RepoRunProjectionBootstrap;
  const reactivity = yield* Reactivity.Reactivity;

  const sessionId = yield* Config.string("BEEP_REPO_MEMORY_SESSION_ID").pipe(Config.withDefault("default"));
  setRepoRunWorkflowVersion(`cluster-first-v0:${sessionId}`);

  const annotateRunServiceSpan = Effect.fn("RepoRunService.annotateSpan")(function* (
    annotations: Record<string, unknown>
  ) {
    yield* Effect.annotateCurrentSpan(annotations);
  });

  const persistSemanticArtifactsBestEffort = Effect.fn("RepoRunService.persistSemanticArtifactsBestEffort")(function* (
    runId: RunId,
    indexedArtifacts: IndexedTypeScriptArtifacts
  ) {
    const attempt = Effect.gen(function* () {
      const semanticArtifacts = yield* semanticEnrichment
        .deriveSemanticArtifacts(
          new RepoSemanticEnrichmentRequest({
            artifacts: indexedArtifacts,
            runId,
          })
        )
        .pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)));

      yield* mapStatusCauseError(driver.saveSemanticArtifacts(semanticArtifacts));
    });

    yield* attempt.pipe(
      Effect.catchTag("RepoRunServiceError", (error) =>
        Effect.logWarning(`Semantic enrichment skipped for run "${runId}": ${error.message}`)
      )
    );
  });

  const executeIndexRun: RepoRunServiceShape["executeIndexRun"] = Effect.fn("RepoRunService.executeIndexRun")(
    function* (payload, runId) {
      yield* annotateRunServiceSpan({ repo_id: payload.repoId, run_id: runId, run_kind: "index" });
      let executionStartedAt: O.Option<DateTime.Utc> = O.none();

      const effect: Effect.Effect<IndexRun, RepoRunServiceError> = Effect.gen(function* () {
        const repo = yield* mapStatusCauseError(driver.getRepo(payload.repoId));
        const currentRun = yield* repoRunLifecycleController.requireIndexRun(runId);
        const lifecycleAt = yield* DateTime.now;
        executionStartedAt = O.some(lifecycleAt);
        const transition = yield* mapStatusCauseError(beginRunExecution(currentRun, lifecycleAt));
        let runningRun = yield* repoRunEventLog.ensureProjectedIndexRun(
          yield* repoRunEventLog.appendExecutionTransitionEvent(runId, lifecycleAt, transition)
        );

        if (transition.eventKind === "started") {
          yield* recordRunStarted("index");
        }

        runningRun = yield* repoRunEventLog.ensureProjectedIndexRun(
          yield* repoRunEventLog.appendProjectedEvent(
            runningRun,
            new RunProgressUpdatedEvent({
              runId,
              sequence: repoRunEventLog.nextSequenceForRun(runningRun),
              emittedAt: yield* DateTime.now,
              phase: "indexing",
              message: "Extracting deterministic TypeScript artifacts from workspace-scoped tsconfig projects.",
              percent: O.some(decodeNonNegativeInt(50)),
            })
          )
        );
        yield* repoRunLifecycleController.suspendIfRunInterrupted(runId);

        const indexedArtifacts = yield* profileRunPhase(
          "index",
          "indexing",
          typeScriptIndex
            .indexRepo(
              new TypeScriptIndexRequest({
                repoId: payload.repoId,
                repoPath: repo.repoPath,
                runId,
              })
            )
            .pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)))
        );

        const completedAt = yield* DateTime.now;

        yield* mapStatusCauseError(
          driver.replaceSnapshotArtifacts({
            artifact: new RepoIndexArtifact({
              runId,
              repoId: payload.repoId,
              sourceSnapshotId: indexedArtifacts.snapshot.id,
              indexedFileCount: indexedArtifacts.snapshot.fileCount,
              completedAt,
            }),
            snapshot: indexedArtifacts.snapshot,
            files: indexedArtifacts.files,
            symbols: indexedArtifacts.symbols,
            importEdges: indexedArtifacts.importEdges,
          })
        );
        yield* persistSemanticArtifactsBestEffort(runId, indexedArtifacts);

        const completedRun = yield* mapStatusCauseError(
          completeIndexRun(runningRun, completedAt, indexedArtifacts.snapshot.fileCount)
        );

        yield* repoRunEventLog.appendRunEvent(
          new RunCompletedEvent({
            runId,
            sequence: completedRun.lastEventSequence,
            emittedAt: completedAt,
            indexedFileCount: O.some(indexedArtifacts.snapshot.fileCount),
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
            yield* repoRunLifecycleController.emitInterruptedRun(runId, interruptedAt);
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
            yield* repoRunLifecycleController.emitFailedRun(runId, error.message);
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
        const currentRun = yield* repoRunLifecycleController.requireQueryRun(runId);
        const lifecycleAt = yield* DateTime.now;
        executionStartedAt = O.some(lifecycleAt);
        const transition = yield* mapStatusCauseError(beginRunExecution(currentRun, lifecycleAt));
        let runningRun = yield* repoRunEventLog.ensureProjectedQueryRun(
          yield* repoRunEventLog.appendExecutionTransitionEvent(runId, lifecycleAt, transition)
        );

        if (transition.eventKind === "started") {
          yield* recordRunStarted("query");
        }

        runningRun = yield* repoRunEventLog.appendQueryStageProgress(runningRun, {
          phase: "grounding",
          message: "Normalizing the question into one supported deterministic query shape.",
          percent: 25,
        });
        const grounding = yield* profileRunPhase(
          "query",
          "grounding",
          groundedRetrieval
            .ground(payload)
            .pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)))
        );

        runningRun = yield* repoRunEventLog.appendQueryStageProgress(runningRun, {
          phase: "retrieval",
          message: "Retrieving bounded source-grounded artifacts from the latest persisted snapshot.",
          percent: 60,
        });
        yield* repoRunLifecycleController.suspendIfRunInterrupted(runId);

        const retrievedEvidence = yield* profileRunPhase(
          "query",
          "retrieval",
          groundedRetrieval
            .retrieve(grounding)
            .pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)))
        );

        runningRun = yield* repoRunEventLog.appendQueryStageProgress(runningRun, {
          phase: "packet",
          message: "Freezing the bounded retrieval packet for durable inspection and replay.",
          percent: 80,
        });
        yield* repoRunLifecycleController.suspendIfRunInterrupted(runId);

        const retrievalPacket = yield* profileRunPhase(
          "query",
          "packet",
          groundedRetrieval
            .materializePacket(retrievedEvidence)
            .pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)))
        );

        runningRun = yield* repoRunEventLog.appendQueryStageProgress(runningRun, {
          phase: "answer",
          message: "Rendering the final answer from the frozen retrieval packet only.",
          percent: 95,
        });
        yield* repoRunLifecycleController.suspendIfRunInterrupted(runId);

        const groundedAnswer = yield* profileRunPhase(
          "query",
          "answer",
          groundedRetrieval
            .draftAnswer(retrievalPacket)
            .pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)))
        );

        runningRun = yield* repoRunEventLog.ensureProjectedQueryRun(
          yield* repoRunEventLog.appendProjectedEvent(
            runningRun,
            new RetrievalPacketMaterializedEvent({
              runId,
              sequence: repoRunEventLog.nextSequenceForRun(runningRun),
              emittedAt: yield* DateTime.now,
              packet: retrievalPacket,
            })
          )
        );

        runningRun = yield* repoRunEventLog.ensureProjectedQueryRun(
          yield* repoRunEventLog.appendProjectedEvent(
            runningRun,
            new AnswerDraftedEvent({
              runId,
              sequence: repoRunEventLog.nextSequenceForRun(runningRun),
              emittedAt: yield* DateTime.now,
              answer: groundedAnswer,
              citations: retrievalPacket.citations,
            })
          )
        );

        const completedAt = yield* DateTime.now;
        const completedRun = yield* mapStatusCauseError(
          completeQueryRun(runningRun, completedAt, groundedAnswer, retrievalPacket.citations, retrievalPacket)
        );

        yield* repoRunEventLog.appendRunEvent(
          new RunCompletedEvent({
            runId,
            sequence: completedRun.lastEventSequence,
            emittedAt: completedAt,
            indexedFileCount: O.none(),
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
            yield* repoRunLifecycleController.emitInterruptedRun(runId, interruptedAt);
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
            yield* repoRunLifecycleController.emitFailedRun(runId, error.message);
            return yield* error;
          })
        )
      );
    }
  );

  const getRun: RepoRunServiceShape["getRun"] = repoRunProjectionBootstrap.requireRun;

  const listRepos: RepoRunServiceShape["listRepos"] = mapStatusCauseError(driver.listRepos).pipe(
    Effect.withSpan("RepoRunService.listRepos"),
    Effect.annotateLogs({ component: "repo-memory-runtime" })
  );

  const listRuns: RepoRunServiceShape["listRuns"] = repoRunProjectionBootstrap.listRuns;

  const registerRepo: RepoRunServiceShape["registerRepo"] = Effect.fn("RepoRunService.registerRepo")(function* (input) {
    const registration = yield* mapStatusCauseError(driver.registerRepo(input));
    yield* reactivity.invalidate(A.make("repos", `repo:${registration.id}`, `repo-index:${registration.id}`));
    return registration;
  });

  return {
    acceptIndexRun: repoRunLifecycleController.acceptIndexRun,
    acceptQueryRun: repoRunLifecycleController.acceptQueryRun,
    executeIndexRun,
    executeQueryRun,
    getRun,
    interruptRun: repoRunLifecycleController.interruptRun,
    listRepos,
    listRuns,
    registerRepo,
    resumeRun: repoRunLifecycleController.resumeRun,
    streamRunEvents: repoRunProjectionBootstrap.streamRunEvents,
  } satisfies RepoRunServiceShape;
});

/**
 * Service tag for repo-memory orchestration.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoRunService extends Context.Service<RepoRunService, RepoRunServiceShape>()($I`RepoRunService`) {
  static readonly layer: Layer.Layer<
    RepoRunService,
    never,
    | EventJournal.EventJournal
    | FileSystem.FileSystem
    | GroundedRetrievalServiceInternal
    | RepoRegistryStore
    | RepoRunStore
    | RepoSemanticEnrichmentServiceInternal
    | RepoSemanticStore
    | RepoSnapshotStore
    | RepoSymbolStore
    | Reactivity.Reactivity
    | TypeScriptIndexServiceInternal
  > = Layer.effect(
    RepoRunService,
    makeRepoRunService().pipe(
      Effect.withSpan("RepoRunService.make"),
      Effect.annotateLogs({ component: "repo-memory-runtime" }),
      Effect.orDie
    )
  ).pipe(
    Layer.provide(RepoRunProjectionBootstrap.layer),
    Layer.provide(RepoRunLifecycleController.layer),
    Layer.provide(RepoRunEventLog.layer)
  );
}

/**
 * Live workflow layers for repository index and query runs.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const RepoRunWorkflowsLayer = Layer.mergeAll(
  IndexRepoRunWorkflow.toLayer(
    Effect.fn("RepoRunService.IndexRepoRunWorkflow")(function* (payload, executionId) {
      const repoRunService = yield* RepoRunService;
      return yield* repoRunService
        .executeIndexRun(payload, RunId.make(executionId))
        .pipe(Effect.mapError(toRunStreamFailure));
    })
  ),
  QueryRepoRunWorkflow.toLayer(
    Effect.fn("RepoRunService.QueryRepoRunWorkflow")(function* (payload, executionId) {
      const repoRunService = yield* RepoRunService;
      return yield* repoRunService
        .executeQueryRun(payload, RunId.make(executionId))
        .pipe(Effect.mapError(toRunStreamFailure));
    })
  )
);

export {
  /**
   * Internal workflow tag for index repo runs.
   *
   * @since 0.0.0
   * @category PortContract
   */
  IndexRepoRunWorkflow,
  /**
   * Internal workflow tag for query repo runs.
   *
   * @since 0.0.0
   * @category PortContract
   */
  QueryRepoRunWorkflow,
  /**
   * Typed orchestration error emitted by the repo run service.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RepoRunServiceError,
  /**
   * Internal workflow registration set for repository runs.
   *
   * @since 0.0.0
   * @category PortContract
   */
  RepoRunWorkflows,
};
