import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import { Hooks, Storage } from "../src/index.js"
import type {
  PermissionRequestHookInput,
  PreToolUseHookInput,
  PostToolUseHookInput
} from "../src/Schema/Hooks.js"

const baseInput = {
  session_id: "session-1",
  transcript_path: "",
  cwd: "",
  permission_mode: undefined
}

const preToolUse: PreToolUseHookInput = {
  ...baseInput,
  hook_event_name: "PreToolUse",
  tool_name: "search",
  tool_input: {},
  tool_use_id: "tool-1"
}

const postToolUse: PostToolUseHookInput = {
  ...baseInput,
  hook_event_name: "PostToolUse",
  tool_name: "search",
  tool_input: {},
  tool_response: {},
  tool_use_id: "tool-1"
}

test("Hooks.withAuditLogging emits audit entries", async () => {
  const program = Effect.gen(function*() {
    const hooks = yield* Hooks.withAuditLogging("")
    const preHook = hooks.PreToolUse?.[0]?.hooks[0]
    const postHook = hooks.PostToolUse?.[0]?.hooks[0]
    if (!preHook || !postHook) return [] as ReadonlyArray<string>

    const signal = new AbortController().signal
    yield* Effect.tryPromise({
      try: () => preHook(preToolUse, preToolUse.tool_use_id, { signal }),
      catch: () => undefined
    })
    yield* Effect.tryPromise({
      try: () => postHook(postToolUse, postToolUse.tool_use_id, { signal }),
      catch: () => undefined
    })

    const store = yield* Storage.AuditEventStore
    const entries = yield* store.entries
    return entries.map((entry) => entry.event)
  }).pipe(Effect.provide(Storage.AuditEventStore.layerMemory))

  const events = await Effect.runPromise(program)
  expect(events.includes("tool_use")).toBe(true)
  expect(events.includes("hook_event")).toBe(true)
})

test("Hooks.wrapPermissionHooks logs permission decisions", async () => {
  const program = Effect.gen(function*() {
    const wrapped = yield* Hooks.wrapPermissionHooks({
      PermissionRequest: [
        {
          matcher: undefined,
          timeout: undefined,
          hooks: [
            async () => ({
              hookSpecificOutput: {
                hookEventName: "PermissionRequest",
                decision: {
                  behavior: "deny",
                  message: "nope"
                }
              }
            })
          ]
        }
      ]
    }, "")

    const hook = wrapped.PermissionRequest?.[0]?.hooks[0]
    if (!hook) return [] as ReadonlyArray<string>

    const input: PermissionRequestHookInput = {
      ...baseInput,
      hook_event_name: "PermissionRequest",
      tool_name: "search",
      tool_input: {},
      permission_suggestions: []
    }

    const signal = new AbortController().signal
    yield* Effect.tryPromise({
      try: () => hook(input, "tool-1", { signal }),
      catch: () => undefined
    })

    const store = yield* Storage.AuditEventStore
    const entries = yield* store.entries
    return entries.map((entry) => entry.event)
  }).pipe(Effect.provide(Storage.AuditEventStore.layerMemory))

  const events = await Effect.runPromise(program)
  expect(events.includes("permission_decision")).toBe(true)
})

test("Hooks.wrapPermissionHooks logs PreToolUse permission decisions", async () => {
  const program = Effect.gen(function*() {
    const wrapped = yield* Hooks.wrapPermissionHooks({
      PreToolUse: [
        {
          matcher: undefined,
          timeout: undefined,
          hooks: [
            async () => ({
              hookSpecificOutput: {
                hookEventName: "PreToolUse",
                permissionDecision: "deny",
                permissionDecisionReason: "nope"
              }
            })
          ]
        }
      ]
    }, "")

    const hook = wrapped.PreToolUse?.[0]?.hooks[0]
    if (!hook) return [] as ReadonlyArray<string>

    const signal = new AbortController().signal
    yield* Effect.tryPromise({
      try: () => hook(preToolUse, preToolUse.tool_use_id, { signal }),
      catch: () => undefined
    })

    const store = yield* Storage.AuditEventStore
    const entries = yield* store.entries
    return entries.map((entry) => entry.event)
  }).pipe(Effect.provide(Storage.AuditEventStore.layerMemory))

  const events = await Effect.runPromise(program)
  expect(events.includes("permission_decision")).toBe(true)
})

test("Hooks.withAuditLogging respects logHookOutcomes false", async () => {
  const program = Effect.gen(function*() {
    const hooks = yield* Hooks.withAuditLogging("", { logHookOutcomes: false })
    const preHook = hooks.PreToolUse?.[0]?.hooks[0]
    if (!preHook) return [] as ReadonlyArray<string>

    const signal = new AbortController().signal
    yield* Effect.tryPromise({
      try: () => preHook(preToolUse, preToolUse.tool_use_id, { signal }),
      catch: () => undefined
    })

    const store = yield* Storage.AuditEventStore
    const entries = yield* store.entries
    return entries.map((entry) => entry.event)
  }).pipe(Effect.provide(Storage.AuditEventStore.layerMemory))

  const events = await Effect.runPromise(program)
  expect(events.includes("hook_event")).toBe(false)
  expect(events.includes("tool_use")).toBe(true)
})
