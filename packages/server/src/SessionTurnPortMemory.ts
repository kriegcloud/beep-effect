import { ContextWindowExceeded, SessionNotFound } from "@template/domain/errors"
import type { SessionId } from "@template/domain/ids"
import type { SessionState, SessionTurnPort, TurnRecord } from "@template/domain/ports"
import { Effect, HashMap, Layer, Option, Ref, ServiceMap } from "effect"

export class SessionTurnPortMemory extends ServiceMap.Service<SessionTurnPortMemory>()(
  "server/SessionTurnPortMemory",
  {
    make: Effect.gen(function*() {
      const sessions = yield* Ref.make(HashMap.empty<SessionId, SessionState>())
      const turns = yield* Ref.make(HashMap.empty<SessionId, Array<TurnRecord>>())

      const startSession: SessionTurnPort["startSession"] = (state) =>
        Effect.all([
          Ref.update(sessions, HashMap.set(state.sessionId, state)),
          Ref.update(turns, HashMap.set(state.sessionId, [] as Array<TurnRecord>))
        ]).pipe(Effect.asVoid)

      const appendTurn: SessionTurnPort["appendTurn"] = (turn) =>
        Ref.update(turns, (map) => {
          const current = HashMap.get(map, turn.sessionId)
          const existingTurns = Option.isSome(current) ? current.value : ([] as Array<TurnRecord>)
          if (existingTurns.some((existing) => existing.turnId === turn.turnId)) {
            return map
          }
          const nextTurn: TurnRecord = {
            ...turn,
            turnIndex: existingTurns.length
          }
          const next = [...existingTurns, nextTurn]
          return HashMap.set(map, turn.sessionId, next)
        })

      const deleteSession: SessionTurnPort["deleteSession"] = (sessionId) =>
        Effect.all([
          Ref.update(sessions, HashMap.remove(sessionId)),
          Ref.update(turns, HashMap.remove(sessionId))
        ]).pipe(Effect.asVoid)

      const updateContextWindow: SessionTurnPort["updateContextWindow"] = (sessionId, deltaTokens) =>
        Ref.get(sessions).pipe(
          Effect.flatMap((map): Effect.Effect<void, ContextWindowExceeded | SessionNotFound> => {
            const current = HashMap.get(map, sessionId)
            if (Option.isNone(current)) {
              return Effect.fail<ContextWindowExceeded | SessionNotFound>(new SessionNotFound({ sessionId }))
            }

            const attemptedTokensUsed = Math.max(current.value.tokensUsed + deltaTokens, 0)
            if (attemptedTokensUsed > current.value.tokenCapacity) {
              return Effect.fail<ContextWindowExceeded | SessionNotFound>(
                new ContextWindowExceeded({
                  sessionId,
                  tokenCapacity: current.value.tokenCapacity,
                  attemptedTokensUsed
                })
              )
            }

            const updated: SessionState = {
              ...current.value,
              tokensUsed: attemptedTokensUsed
            }
            const next = HashMap.set(map, sessionId, updated)
            return Ref.set(sessions, next)
          })
        )

      const listTurns = (sessionId: SessionId) =>
        Ref.get(turns).pipe(
          Effect.map((map) => {
            const current = HashMap.get(map, sessionId)
            return Option.isSome(current) ? [...current.value] : ([] as Array<TurnRecord>)
          })
        )

      const getSession = (sessionId: SessionId) =>
        Ref.get(sessions).pipe(
          Effect.map((map) => {
            const current = HashMap.get(map, sessionId)
            return Option.isSome(current) ? current.value : null
          })
        )

      return {
        startSession,
        appendTurn,
        deleteSession,
        updateContextWindow,
        getSession,
        listTurns
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
