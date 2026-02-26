import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as EventLog from "../src/experimental/EventLog.js"

test("EventLog audit schema writes entries", async () => {
  const program = Effect.scoped(
    Effect.gen(function*() {
      const log = yield* EventLog.EventLog
      yield* log.write({
        schema: EventLog.AuditEventSchema,
        event: "tool_use",
        payload: {
          sessionId: "session-1",
          toolName: "tool",
          status: "start"
        }
      })
      return yield* log.entries
    }).pipe(
      Effect.provide([EventLog.layerMemory, EventLog.layerAuditHandlers])
    )
  )

  const entries = await Effect.runPromise(program)
  expect(entries.length).toBe(1)
  expect(entries[0]?.event).toBe("tool_use")
})
