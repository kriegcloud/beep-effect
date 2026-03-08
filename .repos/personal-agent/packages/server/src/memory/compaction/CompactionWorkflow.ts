import {
  CompactionWorkflowResult as CompactionWorkflowResultSchema,
  ExecuteCompactionPayload as ExecuteCompactionPayloadSchema,
  type CompactionWorkflowResult,
  type ExecuteCompactionPayload
} from "@template/domain/ports"
import type { AuditEntryId, CompactionCheckpointId } from "@template/domain/ids"
import { Cause, DateTime, Effect } from "effect"
import * as Workflow from "effect/unstable/workflow/Workflow"
import { CompactionRunStatePortSqlite } from "../../CompactionRunStatePortSqlite.js"
import { encodeUnknownJsonSync } from "../../json/JsonStringCodecs.js"
import {
  CompactionCheckpointPortTag,
  GovernancePortTag
} from "../../PortTags.js"
import { CompactionCoordinator } from "./CompactionCoordinator.js"

export const CompactionWorkflow = Workflow.make({
  name: "CompactionWorkflow",
  payload: ExecuteCompactionPayloadSchema.fields,
  success: CompactionWorkflowResultSchema,
  idempotencyKey: (payload) => `${payload.sessionId}:${payload.turnId}`
})

const toFailureMessage = (cause: Cause.Cause<unknown>): string =>
  Cause.pretty(cause).slice(0, 1000)
const encodeJson = encodeUnknownJsonSync

const toFailedResult = (
  payload: ExecuteCompactionPayload,
  message: string
): CompactionWorkflowResult => ({
  status: "Failed",
  sessionId: payload.sessionId,
  turnId: payload.turnId,
  detailsArtifactId: null,
  message
})

const recordCompactionFailure = (
  payload: ExecuteCompactionPayload,
  cause: Cause.Cause<unknown>
) =>
  Effect.gen(function*() {
    const governancePort = yield* GovernancePortTag
    const compactionCheckpointPort = yield* CompactionCheckpointPortTag
    const now = yield* DateTime.now
    const message = toFailureMessage(cause)

    yield* governancePort.writeAudit({
      auditEntryId: `audit:compaction:${payload.sessionId}:${payload.turnId}:failed` as AuditEntryId,
      agentId: payload.agentId,
      sessionId: payload.sessionId,
      decision: "Deny",
      reason: `compaction_failed:${message.slice(0, 200)}`,
      createdAt: now
    }).pipe(Effect.ignore)

    yield* compactionCheckpointPort.create({
      checkpointId: `compaction:${payload.sessionId}:${payload.turnId}:failed` as CompactionCheckpointId,
      agentId: payload.agentId,
      sessionId: payload.sessionId,
      subroutineId: "compaction.coordinator",
      createdAt: now,
      summary: "compaction_failed",
      firstKeptTurnId: null,
      firstKeptMessageId: null,
      tokensBefore: null,
      tokensAfter: null,
      detailsJson: encodeJson({ message })
    }).pipe(Effect.ignore)

    return toFailedResult(payload, message)
  }).pipe(
    Effect.catchCause((recordCause) =>
      Effect.succeed(
        toFailedResult(
          payload,
          `compaction_failed_unrecorded: ${toFailureMessage(recordCause)}`
        )
      )
    )
  )

export const layer = CompactionWorkflow.toLayer(
  Effect.fn("CompactionWorkflow.execute")(function*(payload) {
    const runState = yield* CompactionRunStatePortSqlite
    const coordinator = yield* CompactionCoordinator

    const claim = yield* runState.claimOrCoalesce(payload)
    if (claim.status === "Coalesced") {
      return {
        status: "Coalesced",
        sessionId: payload.sessionId,
        turnId: payload.turnId,
        detailsArtifactId: null,
        message: "compaction already active for session"
      } satisfies CompactionWorkflowResult
    }

    const result = yield* coordinator.run(payload).pipe(
      Effect.catchCause((cause) =>
        recordCompactionFailure(payload, cause)
      )
    )

    const pending = yield* runState.releaseAndTakePending(
      payload.sessionId,
      payload.turnId
    ).pipe(
      Effect.catchCause((cause) =>
        Effect.logWarning("compaction_release_failed", {
          sessionId: payload.sessionId,
          turnId: payload.turnId,
          cause: toFailureMessage(cause)
        }).pipe(Effect.as(null))
      )
    )

    if (pending !== null) {
      yield* CompactionWorkflow.execute(pending, { discard: true }).pipe(
        Effect.tap((executionId) =>
          Effect.log("compaction_workflow_dispatched_pending", {
            sessionId: pending.sessionId,
            turnId: pending.turnId,
            executionId
          })
        ),
        Effect.asVoid,
        Effect.catchCause((cause) =>
          Effect.logWarning("compaction_pending_dispatch_failed", {
            sessionId: pending.sessionId,
            turnId: pending.turnId,
            cause: toFailureMessage(cause)
          })
        )
      )
    }

    return result
  })
)
