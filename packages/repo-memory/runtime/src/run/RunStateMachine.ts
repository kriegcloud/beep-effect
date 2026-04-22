/**
 * Pure state transitions for repo-memory run projections.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import {
  AnswerQueryStage,
  GroundingQueryStage,
  type IndexRepoRunInput,
  IndexRun,
  PacketQueryStage,
  type QueryRepoRunInput,
  QueryRun,
  QueryStageTrace,
  type RepoRun,
  type RepoRunStatus,
  type RetrievalPacket,
  RetrievalQueryStage,
  RunEventSequence,
  type RunId,
} from "@beep/repo-memory-model";
import { LiteralKit, NonNegativeInt, StatusCauseTaggedErrorClass } from "@beep/schema";
import { type DateTime, Effect, Match, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoMemoryRuntimeId.create("run/RunStateMachine");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);

const nextRunEventSequence = (run: RepoRun) => decodeRunEventSequence(run.lastEventSequence + 1);

const noErrorMessage = O.none<string>();

const makePendingQueryStageTrace = () =>
  new QueryStageTrace({
    grounding: new GroundingQueryStage({
      status: "pending",
      startedAt: O.none(),
      completedAt: O.none(),
      latestMessage: O.none(),
      percent: O.none(),
      artifactAvailable: O.none(),
    }),
    retrieval: new RetrievalQueryStage({
      status: "pending",
      startedAt: O.none(),
      completedAt: O.none(),
      latestMessage: O.none(),
      percent: O.none(),
      artifactAvailable: O.none(),
    }),
    packet: new PacketQueryStage({
      status: "pending",
      startedAt: O.none(),
      completedAt: O.none(),
      latestMessage: O.none(),
      percent: O.none(),
      artifactAvailable: O.none(),
    }),
    answer: new AnswerQueryStage({
      status: "pending",
      startedAt: O.none(),
      completedAt: O.none(),
      latestMessage: O.none(),
      percent: O.none(),
      artifactAvailable: O.none(),
    }),
  });

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
 * @example
 * ```ts
 * import { RunStateMachineError } from "@beep/repo-memory-runtime/run/RunStateMachine"
 *
 * const error = RunStateMachineError.noCause("Invalid transition.", 409)
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class RunStateMachineError extends StatusCauseTaggedErrorClass<RunStateMachineError>($I`RunStateMachineError`)(
  "RunStateMachineError",
  $I.annote("RunStateMachineError", {
    description: "Typed transition error emitted by the repo-run state machine.",
  })
) {}

const invalidTransition = (runId: RunId, status: RepoRunStatus, command: string) =>
  Effect.fail(RunStateMachineError.noCause(`Run "${runId}" cannot ${command} while it is "${status}".`, 409));

/**
 * Execution lifecycle event kinds emitted when a run starts or resumes.
 *
 * @example
 * ```ts
 * import { RunExecutionTransitionKind } from "@beep/repo-memory-runtime/run/RunStateMachine"
 *
 * const schema = RunExecutionTransitionKind
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export const RunExecutionTransitionKind = LiteralKit(["started", "resumed"]).annotate(
  $I.annote("RunExecutionTransitionKind", {
    description: "Execution lifecycle event kinds emitted when a run starts or resumes.",
  })
);

/**
 * Runtime type for {@link RunExecutionTransitionKind}.
 *
 * @example
 * ```ts
 * import type { RunExecutionTransitionKind } from "@beep/repo-memory-runtime/run/RunStateMachine"
 *
 * const kind: RunExecutionTransitionKind = "started"
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export type RunExecutionTransitionKind = typeof RunExecutionTransitionKind.Type;

/**
 * Transition describing whether execution emits `started` or `resumed`.
 *
 * @example
 * ```ts
 * import { RunExecutionTransition } from "@beep/repo-memory-runtime/run/RunStateMachine"
 *
 * const schema = RunExecutionTransition
 * ```
 *
 * @since 0.0.0
 * @category domain model
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
 * @example
 * ```ts
 * import { acceptedIndexRun } from "@beep/repo-memory-runtime/run/RunStateMachine"
 *
 * const makeRun = acceptedIndexRun
 * ```
 *
 * @since 0.0.0
 * @category domain logic
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
 * @example
 * ```ts
 * import { acceptedQueryRun } from "@beep/repo-memory-runtime/run/RunStateMachine"
 *
 * const makeRun = acceptedQueryRun
 * ```
 *
 * @since 0.0.0
 * @category domain logic
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
    queryStages: O.some(makePendingQueryStageTrace()),
    errorMessage: O.none(),
  });

/**
 * Transition a run into active execution, emitting either `started` or `resumed`.
 *
 * @example
 * ```ts
 * import { beginRunExecution } from "@beep/repo-memory-runtime/run/RunStateMachine"
 *
 * const transition = beginRunExecution
 * ```
 *
 * @since 0.0.0
 * @category domain logic
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
 * @example
 * ```ts
 * import { interruptRun } from "@beep/repo-memory-runtime/run/RunStateMachine"
 *
 * const transition = interruptRun
 * ```
 *
 * @since 0.0.0
 * @category domain logic
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
 * @example
 * ```ts
 * import { failRun } from "@beep/repo-memory-runtime/run/RunStateMachine"
 *
 * const transition = failRun
 * ```
 *
 * @since 0.0.0
 * @category domain logic
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
 * @example
 * ```ts
 * import { completeIndexRun } from "@beep/repo-memory-runtime/run/RunStateMachine"
 *
 * const transition = completeIndexRun
 * ```
 *
 * @since 0.0.0
 * @category domain logic
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
 * @example
 * ```ts
 * import { completeQueryRun } from "@beep/repo-memory-runtime/run/RunStateMachine"
 *
 * const transition = completeQueryRun
 * ```
 *
 * @since 0.0.0
 * @category domain logic
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
