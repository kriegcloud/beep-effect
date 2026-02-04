import * as Console from "effect/Console"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentSdk, Experimental } from "../src/index.js"
import type { HookEvent } from "../src/Schema/Hooks.js"
import type { SDKMessage } from "../src/Schema/Message.js"

const hookEvents = new Set<HookEvent>([
  "PreToolUse",
  "PostToolUse",
  "PostToolUseFailure",
  "Notification",
  "UserPromptSubmit",
  "SessionStart",
  "SessionEnd",
  "Stop",
  "SubagentStart",
  "SubagentStop",
  "PreCompact",
  "PermissionRequest",
  "Setup"
])

const toHookEvent = (value: string): HookEvent | undefined =>
  hookEvents.has(value as HookEvent) ? (value as HookEvent) : undefined

const logFromMessage = (
  log: Context.Tag.Service<typeof Experimental.EventLog.EventLog>,
  message: SDKMessage
) => {
  if (message.type === "tool_progress") {
    return log.write({
      schema: Experimental.EventLog.AuditEventSchema,
      event: "tool_use",
      payload: {
        sessionId: message.session_id,
        toolName: message.tool_name,
        toolUseId: message.tool_use_id,
        status: "start",
        durationMs: Math.round(message.elapsed_time_seconds * 1000)
      }
    })
  }

  if (message.type === "system" && message.subtype === "hook_response") {
    const hook = toHookEvent(message.hook_event)
    if (!hook) return Effect.void
    return log.write({
      schema: Experimental.EventLog.AuditEventSchema,
      event: "hook_event",
      payload: {
        sessionId: message.session_id,
        hook,
        toolUseId: undefined,
        outcome: message.exit_code === undefined || message.exit_code === 0 ? "success" : "failure"
      }
    })
  }

  return Effect.void
}

const program = Effect.scoped(
  Effect.gen(function*() {
    const sdk = yield* AgentSdk
    const log = yield* Experimental.EventLog.EventLog
    const handle = yield* sdk.query("Summarize the current repository.")
    yield* handle.stream.pipe(
      Stream.tap((message) => Console.log(message)),
      Stream.runForEach((message) => logFromMessage(log, message))
    )
  }).pipe(
    Effect.provide([
      AgentSdk.layerDefaultFromEnv(),
      Experimental.EventLog.layerMemory,
      Experimental.EventLog.layerAuditHandlers
    ])
  )
)

Effect.runPromise(program)
