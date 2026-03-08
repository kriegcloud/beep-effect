import { Duration, Effect, Exit, Option, Queue } from "effect"
import { SchedulerQueueError } from "../RlmError"
import { RlmRuntime } from "../Runtime"
import type { RlmCommand } from "../RlmTypes"

export const enqueue = Effect.fnUntraced(function*(command: RlmCommand) {
  const runtime = yield* RlmRuntime
  const size = yield* Queue.size(runtime.commands)
  if (size >= runtime.commandQueueCapacity) {
    return yield* new SchedulerQueueError({
      callId: command.callId,
      commandTag: command._tag,
      reason: "overloaded"
    })
  }

  const offerExit = yield* Effect.exit(
    Queue.offer(runtime.commands, command).pipe(
      Effect.timeoutOption(Duration.millis(1))
    )
  )
  if (Exit.isFailure(offerExit)) {
    return yield* new SchedulerQueueError({
      callId: command.callId,
      commandTag: command._tag,
      reason: "closed"
    })
  }
  if (Option.isNone(offerExit.value)) {
    return yield* new SchedulerQueueError({
      callId: command.callId,
      commandTag: command._tag,
      reason: "overloaded"
    })
  }
  if (!offerExit.value.value) {
    return yield* new SchedulerQueueError({
      callId: command.callId,
      commandTag: command._tag,
      reason: "closed"
    })
  }
})
