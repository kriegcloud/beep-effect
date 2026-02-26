import { expect, test } from "bun:test"
import type { HookCallback, HookCallbackMatcher } from "../src/Schema/Hooks.js"
import type { Options } from "../src/Schema/Options.js"
import { mergeOptions } from "../src/internal/options.js"
import { mergeHookMaps, withHook, withHooks } from "../src/Hooks/utils.js"

const makeMatcher = (): HookCallbackMatcher => {
  const hook: HookCallback = async () => ({ async: true })
  return { hooks: [hook] }
}

test("mergeHookMaps concatenates matchers per hook event", () => {
  const first = makeMatcher()
  const second = makeMatcher()

  const merged = mergeHookMaps(
    { PreToolUse: [first] },
    { PreToolUse: [second], PostToolUse: [first] }
  )

  expect(merged.PreToolUse).toHaveLength(2)
  expect(merged.PostToolUse).toHaveLength(1)
})

test("withHooks merges hooks into options", () => {
  const base: Options = {
    hooks: { PreToolUse: [makeMatcher()] }
  }

  const next = withHooks(base, withHook("PostToolUse", makeMatcher()))

  expect(next.hooks?.PreToolUse?.length).toBe(1)
  expect(next.hooks?.PostToolUse?.length).toBe(1)
})

test("mergeOptions deep-merges map fields and overrides scalars", () => {
  const base: Options = {
    model: "base-model",
    env: { BASE: "1" },
    extraArgs: { foo: "bar" },
    hooks: { PreToolUse: [makeMatcher()] }
  }

  const override: Options = {
    model: "override-model",
    env: { EXTRA: "2" },
    extraArgs: { baz: null },
    hooks: { PreToolUse: [makeMatcher()] }
  }

  const merged = mergeOptions(base, override)

  expect(merged.model).toBe("override-model")
  expect(merged.env).toEqual({ BASE: "1", EXTRA: "2" })
  expect(merged.extraArgs).toEqual({ foo: "bar", baz: null })
  expect(merged.hooks?.PreToolUse?.length).toBe(2)
})
