import type {
  ExecutePostCommitPayload,
  PostCommitResult,
  PostCommitSubroutineOutcome
} from "@template/domain/ports"
import { Cause, DateTime, Effect, Layer, ServiceMap } from "effect"
import type * as WorkflowEngine from "effect/unstable/workflow/WorkflowEngine"
import { AgentConfig } from "../ai/AgentConfig.js"
import { SessionMetricsPortTag, SessionTurnPortTag } from "../PortTags.js"
import { SubroutineCatalog } from "../memory/SubroutineCatalog.js"
import { SubroutineControlPlane } from "../memory/SubroutineControlPlane.js"
import { CompactionWorkflow } from "../memory/compaction/CompactionWorkflow.js"
import { TranscriptProjector } from "../memory/TranscriptProjector.js"

export interface PostCommitExecutorService {
  readonly execute: (
    payload: ExecutePostCommitPayload
  ) => Effect.Effect<
    PostCommitResult,
    never,
    WorkflowEngine.WorkflowEngine | WorkflowEngine.WorkflowInstance
  >
}

export class PostCommitExecutor extends ServiceMap.Service<PostCommitExecutor>()(
  "server/turn/PostCommitExecutor",
  {
    make: Effect.gen(function*() {
      const catalog = yield* SubroutineCatalog
      const controlPlane = yield* SubroutineControlPlane
      const projector = yield* TranscriptProjector
      const agentConfig = yield* AgentConfig
      const sessionTurnPort = yield* SessionTurnPortTag
      const sessionMetricsPort = yield* SessionMetricsPortTag

      const execute: PostCommitExecutorService["execute"] = (payload) =>
        Effect.gen(function*() {
          yield* Effect.log("post_commit_execute_start", {
            turnId: payload.turnId,
            agentId: payload.agentId,
            sessionId: payload.sessionId
          })

          const now = yield* DateTime.now

          const postTurnSubs = yield* catalog.getByTrigger(payload.agentId, "PostTurn")
          const subroutineOutcomes: Array<PostCommitSubroutineOutcome> = []

          for (const sub of postTurnSubs) {
            const outcome = yield* controlPlane.execute({
              agentId: payload.agentId,
              sessionId: payload.sessionId,
              conversationId: payload.conversationId,
              subroutineId: sub.config.id,
              turnId: payload.turnId,
              triggerType: "PostTurn",
              triggerReason: `post-commit turn ${payload.turnId}`,
              enqueuedAt: now,
              idempotencyKey: `post-commit:${payload.turnId}:${sub.config.id}`
            })
            subroutineOutcomes.push({
              subroutineId: sub.config.id,
              success: outcome.accepted && outcome.success,
              errorTag: outcome.errorTag
            })
          }

          let projectionSuccess = true
          let projectionError: string | null = null
          yield* projector.projectFromStore(payload.agentId, payload.sessionId).pipe(
            Effect.catchCause((cause) =>
              Effect.sync(() => {
                projectionSuccess = false
                projectionError = Cause.pretty(cause)
              })
            )
          )

          yield* Effect.gen(function*() {
            const session = yield* sessionTurnPort.getSession(payload.sessionId)
            if (session === null) {
              return
            }

            const compactionConfig = agentConfig.server.storage.compaction
            const shouldTrigger = yield* sessionMetricsPort.shouldTriggerCompaction(
              payload.sessionId,
              {
                tokenPressureRatio: compactionConfig.thresholds.tokenPressureRatio,
                tokenCapacity: session.tokenCapacity,
                toolResultBytes: compactionConfig.thresholds.toolResultBytes,
                artifactBytes: compactionConfig.thresholds.artifactBytes,
                fileTouches: compactionConfig.thresholds.fileTouches,
                cooldownSeconds: compactionConfig.cooldownSeconds,
                now
              }
            )
            if (!shouldTrigger) {
              return
            }

            yield* CompactionWorkflow.execute(
              {
                triggerSource: "PostCommitMetrics",
                agentId: payload.agentId,
                sessionId: payload.sessionId,
                conversationId: payload.conversationId,
                turnId: payload.turnId,
                triggeredAt: now
              },
              { discard: true }
            ).pipe(
              Effect.tap((executionId) =>
                Effect.log("compaction_workflow_dispatched", {
                  turnId: payload.turnId,
                  sessionId: payload.sessionId,
                  executionId
                })
              ),
              Effect.asVoid
            )

            yield* sessionMetricsPort.increment(payload.sessionId, {
              lastCompactionAt: now
            })
          }).pipe(
            Effect.catchCause((cause) =>
              Effect.logWarning("post_commit_compaction_gate_failed", {
                turnId: payload.turnId,
                sessionId: payload.sessionId,
                cause: Cause.pretty(cause)
              })
            )
          )

          return {
            subroutines: subroutineOutcomes,
            projectionSuccess,
            projectionError
          } satisfies PostCommitResult
        })

      return { execute } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
