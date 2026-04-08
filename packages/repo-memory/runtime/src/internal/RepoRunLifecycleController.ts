import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import {
  type IndexRepoRunInput,
  type IndexRun,
  type InterruptRepoRunRequest,
  type QueryRepoRunInput,
  type QueryRun,
  type RepoRun,
  type ResumeRepoRunRequest,
  RunAcceptedAck,
  RunAcceptedEvent,
  RunCommandAck,
  RunFailedEvent,
  type RunId,
  RunInterruptedEvent,
} from "@beep/repo-memory-model";
import { RepoRegistryStore, RepoRunStore, RepoSnapshotStore } from "@beep/repo-memory-store";
import {
  Context,
  DateTime,
  Duration,
  Effect,
  FileSystem,
  Layer,
  Match,
  PartitionedSemaphore,
  pipe,
  Schedule,
} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Workflow from "effect/unstable/workflow/Workflow";
import * as WorkflowEngine from "effect/unstable/workflow/WorkflowEngine";
import {
  acceptedIndexRun,
  acceptedQueryRun,
  beginRunExecution,
  failRun,
  interruptRun,
} from "../run/RunStateMachine.js";
import { recordRunFinished } from "../telemetry/RepoMemoryTelemetry.js";
import { RepoRunEventLog } from "./RepoRunEventLog.js";
import {
  mapStatusCauseError,
  type RepoRunServiceError,
  toRunServiceError,
  workflowSuspensionPollInterval,
  workflowSuspensionPollMaxAttempts,
} from "./RepoRunServiceShared.js";
import { IndexRepoRunWorkflow, QueryRepoRunWorkflow } from "./RepoRunWorkflowContracts.js";

const $I = $RepoMemoryRuntimeId.create("internal/RepoRunLifecycleController");

/**
 * Internal decision describing whether a workflow dispatch is still required
 * after accepting a run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunAcceptanceDecision extends S.Class<RunAcceptanceDecision>($I`RunAcceptanceDecision`)(
  {
    ack: RunAcceptedAck,
    dispatch: S.Boolean,
  },
  $I.annote("RunAcceptanceDecision", {
    description: "Internal decision describing whether a workflow dispatch is still required after accepting a run.",
  })
) {}

/**
 * Internal lifecycle and run-command boundary for repo-memory runs.
 *
 * @since 0.0.0
 * @category PortContract
 */
type RepoRunLifecycleControllerShape = {
  readonly acceptIndexRun: (
    payload: IndexRepoRunInput,
    runId: RunId
  ) => Effect.Effect<RunAcceptanceDecision, RepoRunServiceError>;
  readonly acceptQueryRun: (
    payload: QueryRepoRunInput,
    runId: RunId
  ) => Effect.Effect<RunAcceptanceDecision, RepoRunServiceError>;
  readonly emitFailedRun: (runId: RunId, message: string) => Effect.Effect<void>;
  readonly emitInterruptedRun: (runId: RunId, interruptedAt: DateTime.Utc) => Effect.Effect<void>;
  readonly interruptRun: (
    request: InterruptRepoRunRequest
  ) => Effect.Effect<RunCommandAck, RepoRunServiceError, WorkflowEngine.WorkflowEngine>;
  readonly requireIndexRun: (runId: RunId) => Effect.Effect<IndexRun, RepoRunServiceError>;
  readonly requireQueryRun: (runId: RunId) => Effect.Effect<QueryRun, RepoRunServiceError>;
  readonly requireRun: (runId: RunId) => Effect.Effect<RepoRun, RepoRunServiceError>;
  readonly resumeRun: (
    request: ResumeRepoRunRequest
  ) => Effect.Effect<RunCommandAck, RepoRunServiceError, WorkflowEngine.WorkflowEngine>;
  readonly suspendIfRunInterrupted: (runId: RunId) => Effect.Effect<void, RepoRunServiceError>;
};

/**
 * Service tag for accepted-run lifecycle decisions and durable run commands.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoRunLifecycleController extends Context.Service<
  RepoRunLifecycleController,
  RepoRunLifecycleControllerShape
>()($I`RepoRunLifecycleController`) {
  static readonly layer: Layer.Layer<
    RepoRunLifecycleController,
    never,
    FileSystem.FileSystem | RepoRegistryStore | RepoRunEventLog | RepoRunStore | RepoSnapshotStore
  > = Layer.effect(
    RepoRunLifecycleController,
    Effect.suspend(() => makeRepoRunLifecycleController()).pipe(
      Effect.withSpan("RepoRunLifecycleController.make"),
      Effect.annotateLogs({ component: "repo-run-lifecycle-controller" })
    )
  );
}

const makeRepoRunLifecycleController = Effect.fn("RepoRunLifecycleController.make")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const repoRegistryStore = yield* RepoRegistryStore;
  const repoRunEventLog = yield* RepoRunEventLog;
  const repoRunStore = yield* RepoRunStore;
  const repoSnapshotStore = yield* RepoSnapshotStore;
  const runCommandSemaphore = yield* PartitionedSemaphore.make<RunId>({ permits: 1 });

  const requireRun: RepoRunLifecycleControllerShape["requireRun"] = Effect.fn("RepoRunLifecycleController.requireRun")(
    function* (runId) {
      const maybeRun = yield* mapStatusCauseError(repoRunStore.getRun(runId));

      return yield* O.match(maybeRun, {
        onNone: () => toRunServiceError(`Run not found: "${runId}".`, 404, undefined),
        onSome: Effect.succeed,
      });
    }
  );

  const requireIndexRun: RepoRunLifecycleControllerShape["requireIndexRun"] = Effect.fn(
    "RepoRunLifecycleController.requireIndexRun"
  )(function* (runId) {
    const run = yield* requireRun(runId);

    if (run.kind !== "index") {
      return yield* toRunServiceError(`Run "${runId}" is not an index run.`, 400, undefined);
    }

    return run;
  });

  const requireQueryRun: RepoRunLifecycleControllerShape["requireQueryRun"] = Effect.fn(
    "RepoRunLifecycleController.requireQueryRun"
  )(function* (runId) {
    const run = yield* requireRun(runId);

    if (run.kind !== "query") {
      return yield* toRunServiceError(`Run "${runId}" is not a query run.`, 400, undefined);
    }

    return run;
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

  const toRunCommandAck = (runId: RunId, command: "interrupt" | "resume", requestedAt: DateTime.Utc): RunCommandAck =>
    new RunCommandAck({
      runId,
      command,
      requestedAt,
    });

  const validateRunCanBeginExecution = Effect.fn("RepoRunLifecycleController.validateRunCanBeginExecution")(function* (
    run: RepoRun,
    at: DateTime.Utc
  ): Effect.fn.Return<void, RepoRunServiceError> {
    yield* mapStatusCauseError(beginRunExecution(run, at));
  });

  const waitForWorkflowSuspended = Effect.fn("RepoRunLifecycleController.waitForWorkflowSuspended")(function* (
    run: RepoRun
  ): Effect.fn.Return<void, RepoRunServiceError, WorkflowEngine.WorkflowEngine> {
    for (let attempt = 0; attempt < workflowSuspensionPollMaxAttempts; attempt += 1) {
      const result = yield* Match.value(run).pipe(
        Match.discriminatorsExhaustive("kind")({
          index: () => IndexRepoRunWorkflow.poll(run.id),
          query: () => QueryRepoRunWorkflow.poll(run.id),
        })
      );

      if (P.isTagged("Some")(result) && P.isTagged("Suspended")(result.value)) {
        return;
      }

      yield* Effect.sleep(workflowSuspensionPollInterval);
    }

    return yield* toRunServiceError(
      `Run "${run.id}" did not reach a suspended workflow state after interruption.`,
      409,
      undefined
    );
  });

  const acceptIndexRun: RepoRunLifecycleControllerShape["acceptIndexRun"] = Effect.fn(
    "RepoRunLifecycleController.acceptIndexRun"
  )(function* (payload, runId) {
    yield* Effect.annotateCurrentSpan({ repo_id: payload.repoId, run_id: runId, run_kind: "index" });

    const repo = yield* mapStatusCauseError(repoRegistryStore.getRepo(payload.repoId));
    const repoExists = yield* fs
      .exists(repo.repoPath)
      .pipe(
        Effect.mapError((cause) => toRunServiceError(`Failed to check repository path: ${cause.message}`, 500, cause))
      );
    if (!repoExists) {
      return yield* toRunServiceError(`Repository path does not exist: ${repo.repoPath}`, 400, undefined);
    }

    const maybeRun = yield* mapStatusCauseError(repoRunStore.getRun(runId));

    if (O.isSome(maybeRun)) {
      yield* Effect.annotateCurrentSpan({
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
    yield* repoRunEventLog.appendRunEvent(
      new RunAcceptedEvent({
        runId,
        sequence: run.lastEventSequence,
        emittedAt: acceptedAt,
        runKind: "index",
        repoId: payload.repoId,
        question: O.none(),
      })
    );
    yield* Effect.annotateCurrentSpan({
      dispatch_required: true,
      accepted_existing_run: false,
    });

    return toAcceptanceDecision(run, true);
  });

  const acceptQueryRun: RepoRunLifecycleControllerShape["acceptQueryRun"] = Effect.fn(
    "RepoRunLifecycleController.acceptQueryRun"
  )(function* (payload, runId) {
    yield* Effect.annotateCurrentSpan({ repo_id: payload.repoId, run_id: runId, run_kind: "query" });

    const latestSnapshot = yield* mapStatusCauseError(repoSnapshotStore.latestSourceSnapshot(payload.repoId));
    if (O.isNone(latestSnapshot)) {
      return yield* toRunServiceError(
        `No index exists for repository "${payload.repoId}". Run an index first.`,
        400,
        undefined
      );
    }

    const maybeRun = yield* mapStatusCauseError(repoRunStore.getRun(runId));

    if (O.isSome(maybeRun)) {
      yield* Effect.annotateCurrentSpan({
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
    yield* repoRunEventLog.appendRunEvent(
      new RunAcceptedEvent({
        runId,
        sequence: run.lastEventSequence,
        emittedAt: acceptedAt,
        runKind: "query",
        repoId: payload.repoId,
        question: O.some(payload.question),
      })
    );
    yield* Effect.annotateCurrentSpan({
      dispatch_required: true,
      accepted_existing_run: false,
    });

    return toAcceptanceDecision(run, true);
  });

  const suspendIfRunInterrupted: RepoRunLifecycleControllerShape["suspendIfRunInterrupted"] = Effect.fn(
    "RepoRunLifecycleController.suspendIfRunInterrupted"
  )(function* (runId) {
    const runOption = yield* mapStatusCauseError(repoRunStore.getRun(runId));

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

  const emitInterruptedRun: RepoRunLifecycleControllerShape["emitInterruptedRun"] = Effect.fn(
    "RepoRunLifecycleController.emitInterruptedRun"
  )(function* (runId, interruptedAt) {
    const attempt = Effect.gen(function* () {
      const run = yield* requireRun(runId);
      const interruptedRun = yield* mapStatusCauseError(interruptRun(run, interruptedAt));

      yield* repoRunEventLog.appendRunEvent(
        new RunInterruptedEvent({
          runId,
          sequence: interruptedRun.lastEventSequence,
          emittedAt: interruptedAt,
        })
      );
    });

    yield* attempt.pipe(Effect.catch(() => Effect.void));
  });

  const emitFailedRun: RepoRunLifecycleControllerShape["emitFailedRun"] = Effect.fn(
    "RepoRunLifecycleController.emitFailedRun"
  )(function* (runId, message) {
    const attempt = Effect.gen(function* () {
      const run = yield* requireRun(runId);
      const failedAt = yield* DateTime.now;
      const failedRun = yield* mapStatusCauseError(failRun(run, failedAt, message));

      yield* repoRunEventLog.appendRunEvent(
        new RunFailedEvent({
          runId,
          sequence: failedRun.lastEventSequence,
          emittedAt: failedAt,
          message,
        })
      );
    });

    yield* attempt.pipe(Effect.catch(() => Effect.void));
  });

  const interruptRunCommand: RepoRunLifecycleControllerShape["interruptRun"] = Effect.fn(
    "RepoRunLifecycleController.interruptRun"
  )(function* (request) {
    return yield* runCommandSemaphore.withPermits(
      request.runId,
      1
    )(
      Effect.gen(function* () {
        const run = yield* requireRun(request.runId);
        const requestedAt = yield* DateTime.now;
        const interruptedRun = yield* mapStatusCauseError(interruptRun(run, requestedAt));

        yield* Effect.annotateCurrentSpan({
          run_id: request.runId,
          run_kind: run.kind,
          run_status: run.status,
          command: "interrupt",
        });
        yield* repoRunEventLog.appendRunEvent(
          new RunInterruptedEvent({
            runId: request.runId,
            sequence: interruptedRun.lastEventSequence,
            emittedAt: requestedAt,
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
  });

  const resumeRun: RepoRunLifecycleControllerShape["resumeRun"] = Effect.fn("RepoRunLifecycleController.resumeRun")(
    function* (request) {
      return yield* runCommandSemaphore.withPermits(
        request.runId,
        1
      )(
        Effect.gen(function* () {
          const run = yield* requireRun(request.runId);
          const requestedAt = yield* DateTime.now;

          yield* Effect.annotateCurrentSpan({
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
    }
  );

  const staleRunReaperInterval = Duration.minutes(1);
  const staleRunThreshold = Duration.minutes(5);
  yield* Effect.gen(function* () {
    const runs = yield* mapStatusCauseError(repoRunStore.listRuns);
    const now = yield* DateTime.now;
    yield* Effect.forEach(
      A.filter(
        runs,
        (run) =>
          run.status === "accepted" &&
          DateTime.toEpochMillis(now) - DateTime.toEpochMillis(run.acceptedAt) > Duration.toMillis(staleRunThreshold)
      ),
      (run) =>
        emitFailedRun(
          run.id,
          `Run "${run.id}" timed out in accepted state after ${Duration.toMillis(staleRunThreshold)}ms.`
        ),
      { discard: true }
    );
  }).pipe(
    Effect.catch(() => Effect.void),
    Effect.repeat(Schedule.spaced(staleRunReaperInterval)),
    Effect.forkDetach,
    Effect.interruptible
  );

  return RepoRunLifecycleController.of({
    acceptIndexRun,
    acceptQueryRun,
    emitFailedRun,
    emitInterruptedRun,
    interruptRun: interruptRunCommand,
    requireIndexRun,
    requireQueryRun,
    requireRun,
    resumeRun,
    suspendIfRunInterrupted,
  });
});
