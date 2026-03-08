import * as EventLog from "@beep/ai-sdk/experimental/EventLog";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";

test("EventLog audit schema writes entries", async () => {
  const program = Effect.scoped(
    Effect.gen(function* () {
      const log = yield* EventLog.EventLog;
      const event = EventLog.normalizeAuditEventInput({
        event: "tool_use",
        payload: {
          sessionId: "session-1",
          toolName: "tool",
          status: "start",
        },
      });
      yield* log.write({
        schema: EventLog.AuditEventLog,
        ...event,
      });
      return yield* log.entries;
    }).pipe(Effect.provide(EventLog.layerMemoryWithAudit))
  );

  const entries = await Effect.runPromise(program);
  expect(entries.length).toBe(1);
  expect(entries[0]?.event).toBe("tool_use");
});
