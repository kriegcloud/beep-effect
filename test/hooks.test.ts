import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import { HookError } from "../src/Errors.js"
import { Hooks } from "../src/index.js"
import { runEffect } from "./effect-test.js"

test("Hook.matcher converts duration to seconds", () => {
  const matcher = Hooks.matcher({
    timeout: "2 seconds",
    hooks: []
  })
  expect(matcher.timeout).toBe(2)
})

test("Hook.callback runs effect handler", async () => {
  const hookEffect = Hooks.callback(() =>
    Effect.succeed({
      continue: true
    })
  )
  const callback = await runEffect(hookEffect)
  const result = await callback(
    {
      hook_event_name: "SessionStart",
      session_id: "session-1",
      transcript_path: "/tmp",
      cwd: "/tmp",
      source: "startup"
    },
    undefined,
    { signal: new AbortController().signal }
  )
  if ("async" in result) {
    throw new Error("Expected sync hook output")
  }
  expect(result.continue).toBe(true)
})

test("Hook.callback maps failures to HookError", async () => {
  const hookEffect = Hooks.callback(() =>
    Effect.fail(HookError.make({ message: "boom" }))
  )
  const callback = await runEffect(hookEffect)
  try {
    await callback(
      {
        hook_event_name: "SessionStart",
        session_id: "session-1",
        transcript_path: "/tmp",
        cwd: "/tmp",
        source: "startup"
      },
      undefined,
      { signal: new AbortController().signal }
    )
    throw new Error("Expected hook callback to fail")
  } catch (error) {
    const failure = error as { readonly message?: string }
    expect(failure.message).toBe("Hook handler failed")
    expect(String(error)).toContain("HookError")
  }
})

test("Hook.callback aborts when signal is already aborted", async () => {
  const hookEffect = Hooks.callback(() => Effect.never)
  const callback = await runEffect(hookEffect)
  const controller = new AbortController()
  controller.abort()

  try {
    await callback(
      {
        hook_event_name: "SessionStart",
        session_id: "session-1",
        transcript_path: "/tmp",
        cwd: "/tmp",
        source: "startup"
      },
      undefined,
      { signal: controller.signal }
    )
    throw new Error("Expected hook callback to abort")
  } catch (error) {
    expect(String(error)).toContain("FiberFailure")
  }
})
