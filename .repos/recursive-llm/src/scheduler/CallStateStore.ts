import { Effect, Option, Ref } from "effect"
import type { CallContext } from "../CallContext"
import { RlmRuntime } from "../Runtime"
import type { CallId, RlmCommand } from "../RlmTypes"
import { publishSchedulerWarning } from "./Events"

export const getCallStateOption = Effect.fnUntraced(function*(callId: CallId) {
  const runtime = yield* RlmRuntime
  const states = yield* Ref.get(runtime.callStates)
  return Option.fromNullable(states.get(callId))
})

export const setCallState = Effect.fnUntraced(function*(callId: CallId, state: CallContext) {
  const runtime = yield* RlmRuntime
  yield* Ref.update(runtime.callStates, (current) => {
    const next = new Map(current)
    next.set(callId, state)
    return next
  })
})

export const deleteCallState = (callId: CallId) =>
  Effect.gen(function*() {
    const runtime = yield* RlmRuntime
    yield* Ref.update(runtime.callStates, (current) => {
      const next = new Map(current)
      next.delete(callId)
      return next
    })
  })

export const getCallStateOrWarn = Effect.fnUntraced(function*(options: {
  readonly callId: CallId
  readonly commandTag: RlmCommand["_tag"]
}) {
  const callStateOption = yield* getCallStateOption(options.callId)
  if (Option.isNone(callStateOption)) {
    yield* publishSchedulerWarning({
      code: "STALE_COMMAND_DROPPED",
      message: `Dropped stale command ${options.commandTag} for inactive call ${options.callId}`,
      callId: options.callId,
      commandTag: options.commandTag
    })
    return Option.none<CallContext>()
  }
  return callStateOption
})
