import * as Effect from "effect/Effect"
import * as EventLog from "../src/experimental/EventLog.js"

const program = Effect.scoped(
  Effect.gen(function*() {
    const log = yield* EventLog.EventLog
    yield* log.write({
      schema: EventLog.AuditEventSchema,
      event: "hook_event",
      payload: {
        sessionId: "session-1",
        hook: "SessionStart",
        outcome: "success"
      }
    })
    const entries = yield* log.entries
    yield* Effect.log(`Entries: ${entries.length}`)
  }).pipe(
    Effect.provide([EventLog.layerMemory, EventLog.layerAuditHandlers])
  )
)

Effect.runPromise(program)
