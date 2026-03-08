import type { TurnFailedEvent, TurnStreamEvent } from "@template/domain/events"
import { Cause, Effect, Exit, Fiber, Layer, Queue, Ref, ServiceMap, Stream } from "effect"
import * as WorkflowEngine from "effect/unstable/workflow/WorkflowEngine"
import { isRecoveredToolErrorOutput } from "./RecoveredToolError.js"
import {
  clearTurnEventEmitter,
  registerTurnEventEmitter,
  TurnEventEmitterTag,
  type TurnEventEmitter
} from "./TurnEventEmitter.js"
import {
  type ProcessTurnPayload,
  type ProcessTurnResult,
  type TurnProcessingError,
  TurnProcessingWorkflow
} from "./TurnProcessingWorkflow.js"
import { toTurnFailureCode, toTurnFailureIdentity, toTurnFailureMessage } from "./TurnFailureMapping.js"

export class TurnProcessingRuntime extends ServiceMap.Service<TurnProcessingRuntime>()(
  "server/TurnProcessingRuntime",
  {
    make: Effect.gen(function*() {
      const workflowEngine = yield* WorkflowEngine.WorkflowEngine

      const withEngine = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
        effect.pipe(
          Effect.provideService(WorkflowEngine.WorkflowEngine, workflowEngine)
        )

      const processTurn = Effect.fn("TurnProcessingRuntime.processTurn")(function*(input: ProcessTurnPayload) {
        const executionId = yield* makeExecutionId(input.turnId)
        const existing = yield* withEngine(TurnProcessingWorkflow.poll(executionId))

        if (existing !== undefined) {
          if (existing._tag === "Complete") {
            return yield* existing.exit
          }
          return yield* withEngine(TurnProcessingWorkflow.execute(input))
        }

        return yield* withEngine(TurnProcessingWorkflow.execute(input))
      })

      const processTurnStream = (input: ProcessTurnPayload): Stream.Stream<TurnStreamEvent, TurnProcessingError> => {
        const stream = Stream.unwrap(Effect.gen(function*() {
          const sequenceRef = yield* Ref.make(0)
          const liveEventCountRef = yield* Ref.make(0)
          const queue = yield* Queue.bounded<TurnStreamEvent, Cause.Done>(512)

          const offerEvent = (
            event: TurnStreamEventWithoutSequence
          ) =>
            assignSequence(sequenceRef, event).pipe(
              Effect.flatMap((eventWithSequence) => Queue.offer(queue, eventWithSequence))
            )

          const emitLiveEvent: TurnEventEmitter["emit"] = (event) =>
            Ref.update(liveEventCountRef, (count) => count + 1).pipe(
              Effect.flatMap(() => offerEvent(event))
            )

          const logSummary = (params: {
            readonly replayFallbackUsed: boolean
          }) =>
            Effect.gen(function*() {
              const liveEventCount = yield* Ref.get(liveEventCountRef)
              const totalEventCount = yield* Ref.get(sequenceRef)
              yield* Effect.logInfo({
                event: "turn_stream_emit_summary",
                turnId: input.turnId,
                sessionId: input.sessionId,
                replayFallbackUsed: params.replayFallbackUsed,
                liveEventCount,
                totalEventCount
              })
            })

          const producer = Effect.gen(function*() {
            yield* offerEvent({
              type: "turn.started",
              turnId: input.turnId,
              sessionId: input.sessionId,
              createdAt: input.createdAt
            })

            const turnEventEmitter: TurnEventEmitter = { emit: emitLiveEvent }
            yield* registerTurnEventEmitter(input.turnId, turnEventEmitter)
            const runtimeExit = yield* processTurn(input).pipe(
              Effect.provideService(TurnEventEmitterTag, turnEventEmitter),
              Effect.ensuring(clearTurnEventEmitter(input.turnId, turnEventEmitter)),
              Effect.exit
            )

            if (Exit.isFailure(runtimeExit)) {
              const error = Cause.squash(runtimeExit.cause)
              yield* offerEvent(toEventWithoutSequence(toFailedEvent(input, error)))
              yield* logSummary({ replayFallbackUsed: false })
              return
            }

            const result = runtimeExit.value
            const liveEventCount = yield* Ref.get(liveEventCountRef)

            if (liveEventCount > 0) {
              if (
                result.checkpointId !== undefined
                && result.checkpointAction !== undefined
              ) {
                yield* offerEvent({
                  type: "turn.checkpoint_required",
                  turnId: input.turnId,
                  sessionId: input.sessionId,
                  checkpointId: result.checkpointId,
                  action: result.checkpointAction,
                  reason: result.checkpointReason ?? "checkpoint required"
                })
              }

              yield* offerEvent({
                type: "turn.completed",
                turnId: input.turnId,
                sessionId: input.sessionId,
                accepted: result.accepted,
                auditReasonCode: result.auditReasonCode,
                iterationsUsed: result.iterationsUsed,
                toolCallsTotal: result.toolCallsTotal,
                modelFinishReason: result.modelFinishReason,
                modelUsageJson: result.modelUsageJson
              })
              yield* logSummary({ replayFallbackUsed: false })
              return
            }

            const fallbackEvents = toSuccessEvents(input, result)
            for (const event of fallbackEvents) {
              yield* offerEvent(toEventWithoutSequence(event))
            }
            yield* logSummary({ replayFallbackUsed: true })
          }).pipe(
            Effect.catchCause((cause) =>
              Effect.gen(function*() {
                yield* Effect.logWarning({
                  event: "turn_stream_producer_failed",
                  turnId: input.turnId,
                  sessionId: input.sessionId,
                  cause
                })
                yield* offerEvent(toEventWithoutSequence(toFailedEvent(input, Cause.squash(cause))))
                yield* logSummary({ replayFallbackUsed: false })
              })),
            Effect.ensuring(Queue.end(queue))
          )

          const producerFiber = yield* producer.pipe(Effect.forkDetach)
          return Stream.fromQueue(queue).pipe(
            Stream.ensuring(Fiber.interrupt(producerFiber))
          )
        })).pipe(
          Stream.withSpan("TurnProcessingRuntime.processTurnStream")
        )
        return stream as Stream.Stream<TurnStreamEvent, TurnProcessingError>
      }

      return {
        processTurn,
        processTurnStream
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const toSuccessEvents = (
  input: ProcessTurnPayload,
  result: ProcessTurnResult
): ReadonlyArray<TurnStreamEvent> => {
  const base = { turnId: input.turnId, sessionId: input.sessionId }

  const iterationEvents: ReadonlyArray<TurnStreamEvent> = result.iterationStats.map(
    (stat) => ({
      type: "iteration.completed" as const,
      ...base,
      sequence: 0,
      iteration: stat.iteration,
      finishReason: stat.finishReason,
      toolCallsThisIteration: stat.toolCallsThisIteration,
      toolCallsTotal: stat.toolCallsTotal
    })
  )

  const contentEvents: ReadonlyArray<TurnStreamEvent> = result.assistantContentBlocks.flatMap(
    (block): ReadonlyArray<TurnStreamEvent> => {
      switch (block.contentBlockType) {
        case "TextBlock":
          return [{ type: "assistant.delta" as const, ...base, sequence: 0, delta: block.text }]
        case "ToolUseBlock":
          return [{
            type: "tool.call" as const, ...base, sequence: 0,
            toolCallId: block.toolCallId, toolName: block.toolName, inputJson: block.inputJson
          }]
        case "ToolResultBlock":
          if (block.isError || isRecoveredToolErrorOutput(block.outputJson)) {
            return [{
              type: "tool.error" as const, ...base, sequence: 0,
              toolCallId: block.toolCallId, toolName: block.toolName, outputJson: block.outputJson
            }]
          }
          return [{
            type: "tool.result" as const, ...base, sequence: 0,
            toolCallId: block.toolCallId, toolName: block.toolName,
            outputJson: block.outputJson, isError: false
          }]
        case "ImageBlock":
          return []
      }
    }
  )

  const checkpointEvent: TurnStreamEvent | null = (
    result.checkpointId !== undefined
    && result.checkpointAction !== undefined
  )
    ? {
      type: "turn.checkpoint_required" as const,
      ...base,
      sequence: 0,
      checkpointId: result.checkpointId,
      action: result.checkpointAction,
      reason: result.checkpointReason ?? "checkpoint required"
    }
    : null

  const completedEvent: TurnStreamEvent = {
    type: "turn.completed",
    ...base,
    sequence: 0,
    accepted: result.accepted,
    auditReasonCode: result.auditReasonCode,
    iterationsUsed: result.iterationsUsed,
    toolCallsTotal: result.toolCallsTotal,
    modelFinishReason: result.modelFinishReason,
    modelUsageJson: result.modelUsageJson
  }

  const allEvents = [
    ...iterationEvents,
    ...contentEvents,
    ...(checkpointEvent !== null ? [checkpointEvent] : []),
    completedEvent
  ]

  return allEvents.map((event, i) => ({ ...event, sequence: i + 2 }))
}

const toFailedEvent = (
  input: ProcessTurnPayload,
  error: unknown
): TurnFailedEvent => {
  const identity = toTurnFailureIdentity(error)
  const message = toTurnFailureMessage(error, "Turn processing failed unexpectedly")
  const errorCode = toTurnFailureCode(error, message)

  return {
    type: "turn.failed",
    sequence: 2,
    turnId: identity.turnId.length > 0 ? identity.turnId : input.turnId,
    sessionId: identity.sessionId.length > 0 ? identity.sessionId : input.sessionId,
    errorCode,
    message
  }
}

/** @internal — exported for testing */
export const _test = {
  toSuccessEvents,
  toFailedEvent
}

const toEventWithoutSequence = (
  event: TurnStreamEvent
): TurnStreamEventWithoutSequence => {
  const { sequence: _sequence, ...rest } = event
  return rest as TurnStreamEventWithoutSequence
}

const assignSequence = Effect.fn("TurnProcessingRuntime.assignSequence")(function*(
  sequenceRef: Ref.Ref<number>,
  event: TurnStreamEventWithoutSequence
) {
  const sequence = yield* Ref.updateAndGet(sequenceRef, (current) => current + 1)
  return { ...event, sequence } as TurnStreamEvent
})

type TurnStreamEventWithoutSequence = TurnStreamEvent extends infer Event
  ? Event extends TurnStreamEvent
    ? Omit<Event, "sequence">
    : never
  : never

const makeExecutionId = Effect.fn("TurnProcessingRuntime.makeExecutionId")(function*(idempotencyKey: string) {
  const buffer = yield* Effect.promise(() =>
    crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`TurnProcessingWorkflow-${idempotencyKey}`)
    )
  )

  const hex = Array.from(new Uint8Array(buffer).slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("")
  return hex
})
