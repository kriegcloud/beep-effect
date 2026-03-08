import {
  ExecutePostCommitPayload as ExecutePostCommitPayloadSchema,
  type ExecutePostCommitPayload,
  type PostCommitResult
} from "@template/domain/ports"
import { POST_COMMIT_MAX_ATTEMPTS } from "@template/domain/system-defaults"
import { Cause, Duration, Effect, Schema } from "effect"
import * as DurableClock from "effect/unstable/workflow/DurableClock"
import * as Workflow from "effect/unstable/workflow/Workflow"
import type * as WorkflowEngine from "effect/unstable/workflow/WorkflowEngine"
import { PostCommitExecutor } from "./PostCommitExecutor.js"

export const PostCommitWorkflowResult = Schema.Struct({
  status: Schema.Literals(["Succeeded", "FailedPermanent"]),
  attempts: Schema.Number,
  failureSummary: Schema.Union([Schema.String, Schema.Null])
})
export type PostCommitWorkflowResult = typeof PostCommitWorkflowResult.Type

export const PostCommitWorkflow = Workflow.make({
  name: "PostCommitWorkflow",
  payload: ExecutePostCommitPayloadSchema.fields,
  success: PostCommitWorkflowResult,
  idempotencyKey: (payload) => payload.turnId
})

const executeAttempt = <R>(
  executor: {
    readonly execute: (
      payload: ExecutePostCommitPayload
    ) => Effect.Effect<PostCommitResult, never, R>
  },
  payload: ExecutePostCommitPayload
): Effect.Effect<PostCommitResult, never, R> =>
  executor.execute(payload).pipe(
    Effect.timeout(Duration.seconds(30)),
    Effect.catchCause((cause) =>
      Effect.succeed({
        subroutines: [],
        projectionSuccess: false,
        projectionError: `execution_error: ${Cause.pretty(cause)}`
      } satisfies PostCommitResult)
    )
  )

const hasRetryableFailure = (result: PostCommitResult): boolean =>
  !result.projectionSuccess || result.subroutines.some((subroutine) => !subroutine.success)

const summarizeFailure = (result: PostCommitResult): string => {
  const parts: string[] = []
  if (!result.projectionSuccess) {
    parts.push(`projection: ${result.projectionError ?? "unknown"}`)
  }
  const failedSubroutines = result.subroutines.filter((subroutine) => !subroutine.success)
  if (failedSubroutines.length > 0) {
    parts.push(
      `subroutines: ${failedSubroutines.map((subroutine) => `${subroutine.subroutineId}(${subroutine.errorTag})`).join(", ")}`
    )
  }
  return parts.join("; ").slice(0, 500)
}

export const postCommitBackoffSeconds = (attempt: number): number =>
  5 * Math.pow(2, Math.max(0, attempt - 1))

type SleepForRetry<R = never> = (
  attempt: number,
  payload: ExecutePostCommitPayload
) => Effect.Effect<void, never, R>

const durableSleepForRetry: SleepForRetry<
  WorkflowEngine.WorkflowEngine | WorkflowEngine.WorkflowInstance
> = (attempt, payload) =>
  DurableClock.sleep({
    name: `post-commit:${payload.turnId}:attempt:${attempt}`,
    duration: Duration.seconds(postCommitBackoffSeconds(attempt)),
    inMemoryThreshold: Duration.zero
  })

export const runPostCommitWithRetry = <
  R = WorkflowEngine.WorkflowEngine | WorkflowEngine.WorkflowInstance
>(options: {
  readonly payload: ExecutePostCommitPayload
  readonly executor: {
    readonly execute: (
      payload: ExecutePostCommitPayload
    ) => Effect.Effect<PostCommitResult, never, R>
  }
  readonly sleepForRetry?: SleepForRetry<R>
  readonly maxAttempts?: number
}): Effect.Effect<PostCommitWorkflowResult, never, R> => {
  const sleepForRetry = (options.sleepForRetry ?? durableSleepForRetry) as SleepForRetry<R>
  const maxAttempts = options.maxAttempts ?? POST_COMMIT_MAX_ATTEMPTS

  const runAttempt = (attempt: number): Effect.Effect<PostCommitWorkflowResult, never, R> =>
    Effect.gen(function*() {
      yield* Effect.log("post_commit_workflow_attempt", {
        turnId: options.payload.turnId,
        sessionId: options.payload.sessionId,
        attempt
      })

      const result = yield* executeAttempt(options.executor, options.payload)
      if (!hasRetryableFailure(result)) {
        yield* Effect.log("post_commit_workflow_succeeded", {
          turnId: options.payload.turnId,
          attempts: attempt
        })
        return {
          status: "Succeeded" as const,
          attempts: attempt,
          failureSummary: null
        }
      }

      const failureSummary = summarizeFailure(result)
      if (attempt >= maxAttempts) {
        yield* Effect.logError("post_commit_workflow_failed_permanent", {
          turnId: options.payload.turnId,
          attempts: attempt,
          failureSummary
        })
        return {
          status: "FailedPermanent" as const,
          attempts: attempt,
          failureSummary
        }
      }

      yield* Effect.log("post_commit_workflow_retry_scheduled", {
        turnId: options.payload.turnId,
        attempts: attempt,
        retryInSeconds: postCommitBackoffSeconds(attempt)
      })
      yield* sleepForRetry(attempt, options.payload)
      return yield* runAttempt(attempt + 1)
    })

  return runAttempt(1)
}

export const layer = PostCommitWorkflow.toLayer(
  Effect.fn("PostCommitWorkflow.execute")(function*(payload) {
    const executor = yield* PostCommitExecutor
    return yield* runPostCommitWithRetry({ payload, executor })
  })
)
