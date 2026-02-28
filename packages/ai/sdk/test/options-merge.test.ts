import { mergeHookMaps, withHook, withHooks } from "@beep/ai-sdk/Hooks/utils";
import { mergeOptions } from "@beep/ai-sdk/internal/options";
import type { HookCallback, HookCallbackMatcher } from "@beep/ai-sdk/Schema/Hooks";
import type { Options } from "@beep/ai-sdk/Schema/Options";
import { expect, test } from "@effect/vitest";

const makeMatcher = (): HookCallbackMatcher => {
  const hook: HookCallback = async () => ({ async: true });
  return { hooks: [hook] };
};

test("mergeHookMaps concatenates matchers per hook event", () => {
  const first = makeMatcher();
  const second = makeMatcher();

  const merged = mergeHookMaps(
    withHook("PreToolUse", first),
    mergeHookMaps(withHook("PreToolUse", second), withHook("PostToolUse", first))
  );

  expect(merged.PreToolUse).toHaveLength(2);
  expect(merged.PostToolUse).toHaveLength(1);
});

test("withHooks merges hooks into options", () => {
  const base: Options = {
    hooks: withHook("PreToolUse", makeMatcher()),
  };

  const next = withHooks(base, withHook("PostToolUse", makeMatcher()));

  expect(next.hooks?.PreToolUse?.length).toBe(1);
  expect(next.hooks?.PostToolUse?.length).toBe(1);
});

test("mergeOptions deep-merges map fields and overrides scalars", () => {
  const base: Options = {
    model: "base-model",
    env: { BASE: "1" },
    extraArgs: { foo: "bar" },
    hooks: withHook("PreToolUse", makeMatcher()),
  };

  const override: Options = {
    model: "override-model",
    env: { EXTRA: "2" },
    extraArgs: { baz: null },
    hooks: withHook("PreToolUse", makeMatcher()),
  };

  const merged = mergeOptions(base, override);

  expect(merged.model).toBe("override-model");
  expect(merged.env).toEqual({ BASE: "1", EXTRA: "2" });
  expect(merged.extraArgs).toEqual({ foo: "bar", baz: null });
  expect(merged.hooks?.PreToolUse?.length).toBe(2);
});
