import { BunContext } from "@effect/platform-bun";
import { Effect } from "effect";
import { beforeAll, describe, expect, it } from "vitest";
import { findMatches, type HookInput, loadPatterns } from "../../hooks/pattern-detector/core";
import type { PatternDefinition } from "../../patterns/schema";

let patterns: PatternDefinition[] = [];

beforeAll(async () => {
  patterns = await Effect.runPromise(loadPatterns.pipe(Effect.provide(BunContext.layer)));
});

describe("tsc-suggest-scripts", () => {
  const shouldMatch = [
    "tsc",
    "tsc --build",
    "tsc --build .",
    "tsc --noEmit",
    "tsc --watch",
    "tsc -p tsconfig.json",
    "tsc --project tsconfig.json",
  ];

  const shouldNotMatch = [
    "mise run typecheck",
    "mise run tc",
    "npm run typecheck",
    "bun run typecheck",
    "yarn typecheck",
  ];

  it.each(shouldMatch)("should match: %s", (command) => {
    const input: HookInput = {
      hook_event_name: "PostToolUse",
      tool_name: "Bash",
      tool_input: { command },
    };
    const matched = findMatches(input, patterns);
    const hasTag = matched.some((p) => p.tag === "tsc-context");
    expect(hasTag).toBe(true);
  });

  it.each(shouldNotMatch)("should NOT match: %s", (command) => {
    const input: HookInput = {
      hook_event_name: "PostToolUse",
      tool_name: "Bash",
      tool_input: { command },
    };
    const matched = findMatches(input, patterns);
    const hasTag = matched.some((p) => p.tag === "tsc-context");
    expect(hasTag).toBe(false);
  });
});
