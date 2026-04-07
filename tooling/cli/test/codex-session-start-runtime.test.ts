import { describe, expect, it } from "vitest";
import {
  buildCodexSessionStartContext,
  buildSessionStartHookOutput,
} from "../src/commands/Codex/internal/CodexSessionStartRuntime.js";

describe("CodexSessionStartRuntime", () => {
  it("builds Graphiti-first startup guidance", () => {
    const context = buildCodexSessionStartContext("startup", "/tmp/beep-effect3");

    expect(context).toContain("Session source: startup.");
    expect(context).toContain("Working directory: /tmp/beep-effect3.");
    expect(context).toContain("Durable repo memory is Graphiti-first now");
    expect(context).toContain('group_ids: ["beep-dev"]');
    expect(context).toContain("bun run codex:hook:session-start");
    expect(context).toContain("legacy repo-memory tooling");
  });

  it("wraps additional context in the expected hook payload", () => {
    const output = JSON.parse(buildSessionStartHookOutput("hello"));

    expect(output).toEqual({
      continue: true,
      hookSpecificOutput: {
        additionalContext: "hello",
        hookEventName: "SessionStart",
      },
    });
  });
});
