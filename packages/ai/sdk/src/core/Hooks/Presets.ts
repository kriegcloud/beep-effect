import * as Clock from "effect/Clock"
import * as Effect from "effect/Effect"
import { onPermissionRequest, onPostToolUse, onPostToolUseFailure, onPreToolUse, tap } from "./Hook.js"
import { mergeHookMaps } from "./utils.js"
import type { HookEvent, PermissionRequestHookInput } from "../Schema/Hooks.js"

const allEvents: ReadonlyArray<HookEvent> = [
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
]

export const consoleLogger = (options?: {
  readonly events?: ReadonlyArray<HookEvent>
  readonly format?: "json" | "pretty"
}) =>
  tap(options?.events ?? allEvents, (input) =>
    Effect.sync(() => {
      if (options?.format === "json") {
        console.log(JSON.stringify(input))
        return
      }
      console.log(`[${input.hook_event_name}] ${input.session_id}`)
    })
  )

export const autoApprove = (tools: ReadonlyArray<string>) =>
  onPermissionRequest((input: PermissionRequestHookInput) =>
    tools.includes(input.tool_name)
      ? Effect.succeed({
          hookSpecificOutput: {
            hookEventName: "PermissionRequest",
            decision: { behavior: "allow" }
          }
        })
      : Effect.succeed({})
  )

export const autoDeny = (options: {
  readonly tools: ReadonlyArray<string>
  readonly match?: string
  readonly message?: string
  readonly interrupt?: boolean
}) =>
  onPermissionRequest((input: PermissionRequestHookInput) => {
    if (!options.tools.includes(input.tool_name)) {
      return Effect.succeed({})
    }
    if (options.match) {
      const raw = JSON.stringify(input.tool_input ?? "")
      if (!raw.includes(options.match)) {
        return Effect.succeed({})
      }
    }
    return Effect.succeed({
      hookSpecificOutput: {
        hookEventName: "PermissionRequest",
        decision: {
          behavior: "deny",
          ...(options.message ? { message: options.message } : {}),
          ...(options.interrupt !== undefined ? { interrupt: options.interrupt } : {})
        }
      }
    })
  })

export const timing = <R>(
  onComplete: (toolName: string, durationMs: number) => Effect.Effect<void, never, R>
) =>
  Effect.gen(function*() {
    const startTimes = new Map<string, number>()
    const onStart = yield* onPreToolUse((input) =>
      Clock.currentTimeMillis.pipe(
        Effect.tap((now) =>
          Effect.sync(() => {
            startTimes.set(input.tool_use_id, now)
          })
        ),
        Effect.asVoid,
        Effect.as({})
      )
    )
    const onFinish = yield* onPostToolUse((input) =>
      Clock.currentTimeMillis.pipe(
        Effect.flatMap((now) => {
          const startedAt = startTimes.get(input.tool_use_id)
          if (startedAt === undefined) return Effect.succeed({})
          startTimes.delete(input.tool_use_id)
          return onComplete(input.tool_name, Math.max(0, now - startedAt)).pipe(
            Effect.as({})
          )
        })
      )
    )
    const onFailure = yield* onPostToolUseFailure((input) =>
      Clock.currentTimeMillis.pipe(
        Effect.flatMap((now) => {
          const startedAt = startTimes.get(input.tool_use_id)
          if (startedAt === undefined) return Effect.succeed({})
          startTimes.delete(input.tool_use_id)
          return onComplete(input.tool_name, Math.max(0, now - startedAt)).pipe(
            Effect.as({})
          )
        })
      )
    )
    return mergeHookMaps(onStart, onFinish, onFailure)
  })
