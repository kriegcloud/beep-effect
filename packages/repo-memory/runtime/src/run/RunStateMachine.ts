import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import {
  type IndexRepoRunInput,
  IndexRun,
  type QueryRepoRunInput,
  QueryRun,
  type RepoRun,
  type RepoRunStatus,
  type RetrievalPacket,
  RunEventSequence,
  type RunId,
} from "@beep/repo-memory-model";
import { LiteralKit, makeStatusCauseError, NonNegativeInt, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
import { type DateTime, Effect, Match, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoMemoryRuntimeId.create("run/RunStateMachine");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);

const nextRunEventSequence = (run: RepoRun) => decodeRunEventSequence(run.lastEventSequence + 1);

const noErrorMessage = O.none<string>();

const updateRunStatus = (
  run: RepoRun,
  patch: {
    readonly status: RepoRunStatus;
    readonly startedAt: O.Option<DateTime.Utc>;
    readonly completedAt: O.Option<DateTime.Utc>;
    readonly lastEventSequence: RunEventSequence;
    readonly errorMessage: O.Option<string>;
  }
): RepoRun =>
  Match.value(run).pipe(
    Match.discriminatorsExhaustive("kind")({
      index: (indexRun) =>
        new IndexRun({
          ...indexRun,
          status: patch.status,
          startedAt: patch.startedAt,
          completedAt: patch.completedAt,
          lastEventSequence: patch.lastEventSequence,
          errorMessage: patch.errorMessage,
        }),
      query: (queryRun) =>
        new QueryRun({
          ...queryRun,
          status: patch.status,
          startedAt: patch.startedAt,
          completedAt: patch.completedAt,
          lastEventSequence: patch.lastEventSequence,
          errorMessage: patch.errorMessage,
        }),
    })
  );

/**
 * Typed transition error emitted by the repo-run state machine.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunStateMachineError extends TaggedErrorClass<RunStateMachineError>($I`RunStateMachineError`)(
  "RunStateMachineError",
  StatusCauseFields,
  $I.annote("RunStateMachineError", {
    description: "Typed transition error emitted by the repo-run state machine.",
  })
) {}

const toRunStateMachineError = makeStatusCauseError(RunStateMachineError);

const invalidTransition = (runId: RunId, status: RepoRunStatus, command: string) =>
  Effect.fail(toRunStateMachineError(`Run "${runId}" cannot ${command} while it is "${status}".`, 409));

/**
 * Execution lifecycle event kinds emitted when a run starts or resumes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RunExecutionTransitionKind = LiteralKit(["started", "resumed"]).annotate(
  $I.annote("RunExecutionTransitionKind", {
    description: "Execution lifecycle event kinds emitted when a run starts or resumes.",
  })
);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type RunExecutionTransitionKind = typeof RunExecutionTransitionKind.Type;

/**
 * Transition describing whether execution emits `started` or `resumed`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunExecutionTransition extends S.Class<RunExecutionTransition>($I`RunExecutionTransition`)(
  {
    eventKind: RunExecutionTransitionKind,
    run: S.Union([IndexRun, QueryRun]).pipe(S.toTaggedUnion("kind")),
  },
  $I.annote("RunExecutionTransition", {
    description: "Transition describing whether execution emits `started` or `resumed`.",
  })
) {}

/**
 * Build the accepted index run projection for a new workflow execution.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const acceptedIndexRun = (options: {
  readonly acceptedAt: DateTime.Utc;
  readonly payload: IndexRepoRunInput;
  readonly runId: RunId;
}): IndexRun =>
  new IndexRun({
    id: options.runId,
    repoId: options.payload.repoId,
    status: "accepted",
    acceptedAt: options.acceptedAt,
    startedAt: O.none(),
    completedAt: O.none(),
    lastEventSequence: decodeRunEventSequence(1),
    indexedFileCount: O.none(),
    errorMessage: O.none(),
  });

/**
 * Build the accepted query run projection for a new workflow execution.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const acceptedQueryRun = (options: {
  readonly acceptedAt: DateTime.Utc;
  readonly payload: QueryRepoRunInput;
  readonly runId: RunId;
}): QueryRun =>
  new QueryRun({
    id: options.runId,
    repoId: options.payload.repoId,
    question: options.payload.question,
    status: "accepted",
    acceptedAt: options.acceptedAt,
    startedAt: O.none(),
    completedAt: O.none(),
    lastEventSequence: decodeRunEventSequence(1),
    answer: O.none(),
    citations: [],
    retrievalPacket: O.none(),
    errorMessage: O.none(),
  });

/**
 * Transition a run into active execution, emitting either `started` or `resumed`.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const beginRunExecution = Effect.fn("RunStateMachine.beginRunExecution")(function* (
  run: RepoRun,
  at: DateTime.Utc
): Effect.fn.Return<RunExecutionTransition, RunStateMachineError> {
  return yield* Match.value(run.status).pipe(
    Match.when("accepted", () =>
      Effect.succeed(
        new RunExecutionTransition({
          eventKind: "started",
          run: updateRunStatus(run, {
            status: "running",
            startedAt: O.some(at),
            completedAt: O.none(),
            lastEventSequence: nextRunEventSequence(run),
            errorMessage: noErrorMessage,
          }),
        })
      )
    ),
    Match.when("interrupted", () =>
      Effect.succeed(
        new RunExecutionTransition({
          eventKind: "resumed",
          run: updateRunStatus(run, {
            status: "running",
            startedAt: pipe(
              run.startedAt,
              O.orElse(() => O.some(at))
            ),
            completedAt: O.none(),
            lastEventSequence: nextRunEventSequence(run),
            errorMessage: noErrorMessage,
          }),
        })
      )
    ),
    Match.orElse((status) => invalidTransition(run.id, status, "begin execution"))
  );
});

/**
 * Transition a run into the interrupted terminal state.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const interruptRun = Effect.fn("RunStateMachine.interruptRun")(function* (
  run: RepoRun,
  interruptedAt: DateTime.Utc
): Effect.fn.Return<RepoRun, RunStateMachineError> {
  return yield* Match.value(run.status).pipe(
    Match.when("accepted", () =>
      Effect.succeed(
        updateRunStatus(run, {
          status: "interrupted",
          startedAt: run.startedAt,
          completedAt: O.some(interruptedAt),
          lastEventSequence: nextRunEventSequence(run),
          errorMessage: noErrorMessage,
        })
      )
    ),
    Match.when("running", () =>
      Effect.succeed(
        updateRunStatus(run, {
          status: "interrupted",
          startedAt: run.startedAt,
          completedAt: O.some(interruptedAt),
          lastEventSequence: nextRunEventSequence(run),
          errorMessage: noErrorMessage,
        })
      )
    ),
    Match.orElse((status) => invalidTransition(run.id, status, "interrupt"))
  );
});

/**
 * Transition a run into the failed terminal state.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const failRun = Effect.fn("RunStateMachine.failRun")(function* (
  run: RepoRun,
  failedAt: DateTime.Utc,
  message: string
): Effect.fn.Return<RepoRun, RunStateMachineError> {
  return yield* Match.value(run.status).pipe(
    Match.when("accepted", () =>
      Effect.succeed(
        updateRunStatus(run, {
          status: "failed",
          startedAt: run.startedAt,
          completedAt: O.some(failedAt),
          lastEventSequence: nextRunEventSequence(run),
          errorMessage: O.some(message),
        })
      )
    ),
    Match.when("running", () =>
      Effect.succeed(
        updateRunStatus(run, {
          status: "failed",
          startedAt: run.startedAt,
          completedAt: O.some(failedAt),
          lastEventSequence: nextRunEventSequence(run),
          errorMessage: O.some(message),
        })
      )
    ),
    Match.when("interrupted", () =>
      Effect.succeed(
        updateRunStatus(run, {
          status: "failed",
          startedAt: run.startedAt,
          completedAt: O.some(failedAt),
          lastEventSequence: nextRunEventSequence(run),
          errorMessage: O.some(message),
        })
      )
    ),
    Match.orElse((status) => invalidTransition(run.id, status, "fail"))
  );
});

/**
 * Transition an index run into the completed terminal state.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const completeIndexRun = Effect.fn("RunStateMachine.completeIndexRun")(function* (
  run: IndexRun,
  completedAt: DateTime.Utc,
  indexedFileCount: number
): Effect.fn.Return<IndexRun, RunStateMachineError> {
  return yield* Match.value(run.status).pipe(
    Match.when("running", () =>
      Effect.succeed(
        new IndexRun({
          ...run,
          status: "completed",
          completedAt: O.some(completedAt),
          lastEventSequence: nextRunEventSequence(run),
          indexedFileCount: O.some(decodeNonNegativeInt(indexedFileCount)),
          errorMessage: noErrorMessage,
        })
      )
    ),
    Match.orElse((status) => invalidTransition(run.id, status, "complete"))
  );
});

/**
 * Transition a query run into the completed terminal state.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const completeQueryRun = Effect.fn("RunStateMachine.completeQueryRun")(function* (
  run: QueryRun,
  completedAt: DateTime.Utc,
  answer: string,
  citations: QueryRun["citations"],
  retrievalPacket: RetrievalPacket
): Effect.fn.Return<QueryRun, RunStateMachineError> {
  return yield* Match.value(run.status).pipe(
    Match.when("running", () =>
      Effect.succeed(
        new QueryRun({
          ...run,
          status: "completed",
          completedAt: O.some(completedAt),
          lastEventSequence: nextRunEventSequence(run),
          answer: O.some(answer),
          citations,
          retrievalPacket: O.some(retrievalPacket),
          errorMessage: noErrorMessage,
        })
      )
    ),
    Match.orElse((status) => invalidTransition(run.id, status, "complete"))
  );
});
