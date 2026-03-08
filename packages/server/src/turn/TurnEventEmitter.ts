import type { TurnStreamEvent } from "@template/domain/events"
import { Effect, ServiceMap } from "effect"

export type LiveTurnStreamEvent =
  | Omit<Extract<TurnStreamEvent, { readonly type: "assistant.delta" }>, "sequence">
  | Omit<Extract<TurnStreamEvent, { readonly type: "tool.call" }>, "sequence">
  | Omit<Extract<TurnStreamEvent, { readonly type: "tool.result" }>, "sequence">
  | Omit<Extract<TurnStreamEvent, { readonly type: "tool.error" }>, "sequence">
  | Omit<Extract<TurnStreamEvent, { readonly type: "iteration.completed" }>, "sequence">

export interface TurnEventEmitter {
  readonly emit: (event: LiveTurnStreamEvent) => Effect.Effect<void>
}

export const TurnEventEmitterTag = ServiceMap.Service<TurnEventEmitter>(
  "server/turn/TurnEventEmitter"
)

export const noopTurnEventEmitter: TurnEventEmitter = {
  emit: () => Effect.void
}

const turnEmitterRegistry = new Map<string, Array<TurnEventEmitter>>()

export const registerTurnEventEmitter = (
  turnId: string,
  emitter: TurnEventEmitter
): Effect.Effect<void> =>
  Effect.sync(() => {
    const existing = turnEmitterRegistry.get(turnId) ?? []
    turnEmitterRegistry.set(turnId, [...existing, emitter])
  })

export const clearTurnEventEmitter = (
  turnId: string,
  emitter: TurnEventEmitter
): Effect.Effect<void> =>
  Effect.sync(() => {
    const existing = turnEmitterRegistry.get(turnId)
    if (existing === undefined || existing.length === 0) {
      return
    }
    const next = existing.filter((candidate) => candidate !== emitter)
    if (next.length === 0) {
      turnEmitterRegistry.delete(turnId)
      return
    }
    turnEmitterRegistry.set(turnId, next)
  })

export const emitTurnLiveEvent = (
  turnId: string,
  event: LiveTurnStreamEvent
): Effect.Effect<void> => {
  const emitters = turnEmitterRegistry.get(turnId)
  if (emitters === undefined || emitters.length === 0) {
    return Effect.void
  }
  return Effect.forEach(emitters, (emitter) => emitter.emit(event), { discard: true })
}
