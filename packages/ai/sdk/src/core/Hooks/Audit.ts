import * as Clock from "effect/Clock"
import * as Context from "effect/Context"
import type * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Ref from "effect/Ref"
import type {
  HookCallback,
  HookEvent,
  HookInput,
  HookJSONOutput
} from "../Schema/Hooks.js"
import { HookError } from "../Errors.js"
import { AuditEventStore } from "../Storage/AuditEventStore.js"
import { callback, matcher } from "./Hook.js"
import type { HookContext } from "./Hook.js"
import type { HookMap } from "./utils.js"

export type AuditLoggingOptions = {
  readonly strict?: boolean
  readonly logHookOutcomes?: boolean
  readonly logPermissionDecisions?: boolean
  readonly matcher?: string
  readonly timeout?: Duration.DurationInput
}

const hookEvents: ReadonlyArray<HookEvent> = [
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

const promptDecision = "prompt" as const

type AuditEventStoreService = Context.Tag.Service<typeof AuditEventStore>
type ResolvedPermissionDecision = {
  readonly decision: "allow" | "deny" | "prompt"
  readonly reason?: string
}

const recordWrite = (
  store: AuditEventStoreService,
  strict: boolean,
  effect: Effect.Effect<void, unknown>
) => (strict ? effect : effect.pipe(Effect.catchAll(() => Effect.void)))

const resolveHookToolUseId = (input: HookInput, toolUseId: string | undefined) =>
  toolUseId ?? ("tool_use_id" in input ? input.tool_use_id : undefined)

const recordHookOutcome = (
  store: AuditEventStoreService,
  strict: boolean,
  input: HookInput,
  toolUseId: string | undefined,
  outcome: "success" | "failure",
  sessionId: string
) => {
  const resolvedToolUseId = resolveHookToolUseId(input, toolUseId)
  return recordWrite(
    store,
    strict,
    store.write({
      event: "hook_event",
      payload: {
        sessionId,
        hook: input.hook_event_name,
        ...(resolvedToolUseId ? { toolUseId: resolvedToolUseId } : {}),
        outcome
      }
    })
  )
}

const recordPermissionPrompt = (
  store: AuditEventStoreService,
  strict: boolean,
  input: HookInput,
  sessionId: string
) =>
  input.hook_event_name === "PermissionRequest"
    ? recordWrite(
        store,
        strict,
        store.write({
          event: "permission_decision",
          payload: {
            sessionId,
            toolName: input.tool_name,
            decision: promptDecision
          }
        })
      )
    : Effect.void

const resolvePermissionDecision = (output: HookJSONOutput): ResolvedPermissionDecision | undefined => {
  if ("hookSpecificOutput" in output && output.hookSpecificOutput?.hookEventName === "PermissionRequest") {
    const decision = output.hookSpecificOutput.decision
    const reason = "message" in decision && decision.message
      ? decision.message
      : "reason" in output && output.reason
        ? output.reason
        : undefined
    return {
      decision: decision.behavior,
      ...(reason ? { reason } : {})
    }
  }

  if ("hookSpecificOutput" in output && output.hookSpecificOutput) {
    const hookSpecific = output.hookSpecificOutput
    if ("permissionDecision" in hookSpecific && hookSpecific.permissionDecision) {
      const decision =
        hookSpecific.permissionDecision === "ask"
          ? "prompt"
          : hookSpecific.permissionDecision
      const reason = "permissionDecisionReason" in hookSpecific
        ? hookSpecific.permissionDecisionReason
        : "reason" in output && output.reason
          ? output.reason
          : undefined
      return {
        decision,
        ...(reason ? { reason } : {})
      }
    }
  }

  if ("decision" in output && output.decision) {
    const reason = "reason" in output && output.reason ? output.reason : undefined
    return {
      decision: output.decision === "approve" ? "allow" : "deny",
      ...(reason ? { reason } : {})
    }
  }

  return undefined
}

const wrapPermissionCallback = (
  hook: HookCallback,
  store: AuditEventStoreService,
  strict: boolean,
  sessionId: string
): HookCallback => async (input, toolUseId, options) => {
  const output = await hook(input, toolUseId, options)
  if (input.hook_event_name !== "PermissionRequest" && input.hook_event_name !== "PreToolUse") {
    return output
  }

  const resolved = resolvePermissionDecision(output)
  if (!resolved) return output

  const resolvedSessionId = sessionId || input.session_id
  const effect = store.write({
    event: "permission_decision",
    payload: {
      sessionId: resolvedSessionId,
      toolName: input.tool_name,
      decision: resolved.decision,
      ...(resolved.reason ? { reason: resolved.reason } : {})
    }
  })

  await Effect.runPromise(recordWrite(store, strict, effect))
  return output
}

export const wrapPermissionHooks = Effect.fn("Hooks.wrapPermissionHooks")(function*(
  hooks: HookMap,
  sessionId: string,
  options?: AuditLoggingOptions
) {
  const logPermissionDecisions = options?.logPermissionDecisions ?? true
  if (!logPermissionDecisions) return hooks
  const store = yield* AuditEventStore
  const strict = options?.strict ?? false
  const matchers = hooks.PermissionRequest
  const preToolMatchers = hooks.PreToolUse
  if ((!matchers || matchers.length === 0) && (!preToolMatchers || preToolMatchers.length === 0)) {
    return hooks
  }

  const wrapped: HookMap = {
    ...hooks,
    ...(matchers && matchers.length > 0
      ? {
          PermissionRequest: matchers.map((matcherEntry) => ({
            matcher: matcherEntry.matcher,
            timeout: matcherEntry.timeout,
            hooks: matcherEntry.hooks.map((hook) =>
              wrapPermissionCallback(hook, store, strict, sessionId)
            )
          }))
        }
      : {}),
    ...(preToolMatchers && preToolMatchers.length > 0
      ? {
          PreToolUse: preToolMatchers.map((matcherEntry) => ({
            matcher: matcherEntry.matcher,
            timeout: matcherEntry.timeout,
            hooks: matcherEntry.hooks.map((hook) =>
              wrapPermissionCallback(hook, store, strict, sessionId)
            )
          }))
        }
      : {})
  }

  return wrapped
})

const recordToolStart = (
  store: AuditEventStoreService,
  strict: boolean,
  input: HookInput,
  sessionId: string
) =>
  input.hook_event_name === "PreToolUse"
    ? recordWrite(
        store,
        strict,
        store.write({
          event: "tool_use",
          payload: {
            sessionId,
            toolName: input.tool_name,
            toolUseId: input.tool_use_id,
            status: "start"
          }
        })
      )
    : Effect.void

const recordToolFinish = (
  store: AuditEventStoreService,
  strict: boolean,
  input: HookInput,
  sessionId: string,
  status: "success" | "failure",
  durationMs?: number
) =>
  input.hook_event_name === "PostToolUse" || input.hook_event_name === "PostToolUseFailure"
    ? recordWrite(
        store,
        strict,
        store.write({
          event: "tool_use",
          payload: {
            sessionId,
            toolName: input.tool_name,
            toolUseId: input.tool_use_id,
            status,
            ...(durationMs !== undefined ? { durationMs } : {})
          }
        })
      )
    : Effect.void

const resolveDuration = (
  startRef: Ref.Ref<ReadonlyMap<string, number>>,
  toolUseId: string
) =>
  Ref.modify(startRef, (state) => {
    const start = state.get(toolUseId)
    if (start === undefined) return [undefined, state] as const
    const next = new Map(state)
    next.delete(toolUseId)
    return [start, next] as const
  }).pipe(
    Effect.flatMap((start) =>
      start === undefined
        ? Effect.succeed(undefined)
        : Clock.currentTimeMillis.pipe(Effect.map((now) => now - start))
    )
  )

export const withAuditLogging = Effect.fn("Hooks.withAuditLogging")(function*(
  sessionId: string,
  options?: AuditLoggingOptions
) {
  const store = yield* AuditEventStore
  const strict = options?.strict ?? false
  const logHookOutcomes = options?.logHookOutcomes ?? true
  const logPermissionDecisions = options?.logPermissionDecisions ?? true
  const toolUseStarts = yield* Ref.make<ReadonlyMap<string, number>>(new Map())

  const handler = (input: HookInput, context: HookContext) =>
    Effect.gen(function*() {
      const resolvedSessionId = sessionId || input.session_id

      if (input.hook_event_name === "PreToolUse") {
        const now = yield* Clock.currentTimeMillis
        yield* Ref.update(toolUseStarts, (state) => {
          const next = new Map(state)
          next.set(input.tool_use_id, now)
          return next
        })
        yield* recordToolStart(store, strict, input, resolvedSessionId)
      }

      if (input.hook_event_name === "PostToolUse") {
        const durationMs = yield* resolveDuration(toolUseStarts, input.tool_use_id)
        yield* recordToolFinish(
          store,
          strict,
          input,
          resolvedSessionId,
          "success",
          durationMs
        )
      }

      if (input.hook_event_name === "PostToolUseFailure") {
        const durationMs = yield* resolveDuration(toolUseStarts, input.tool_use_id)
        yield* recordToolFinish(
          store,
          strict,
          input,
          resolvedSessionId,
          "failure",
          durationMs
        )
      }

      if (logPermissionDecisions) {
        yield* recordPermissionPrompt(store, strict, input, resolvedSessionId)
      }

      if (logHookOutcomes) {
        yield* recordHookOutcome(
          store,
          strict,
          input,
          context.toolUseID,
          "success",
          resolvedSessionId
        )
      }

      return {} satisfies HookJSONOutput
    }).pipe(
      Effect.catchAll((cause) => {
        const recordFailure = logHookOutcomes
          ? recordHookOutcome(
              store,
              false,
              input,
              context.toolUseID,
              "failure",
              sessionId || input.session_id
            )
          : Effect.void
        return recordFailure.pipe(Effect.zipRight(Effect.fail(cause)))
      }),
      Effect.mapError((cause) =>
        HookError.make({
          message: "Audit hook failed",
          cause
        })
      )
    )

  const auditCallback = yield* callback(handler)
  const auditMatcher = matcher({
    matcher: options?.matcher,
    timeout: options?.timeout,
    hooks: [auditCallback]
  })

  const hooks: Partial<Record<HookEvent, HookMap[HookEvent]>> = {}
  for (const event of hookEvents) {
    hooks[event] = [auditMatcher]
  }

  return hooks as HookMap
})
