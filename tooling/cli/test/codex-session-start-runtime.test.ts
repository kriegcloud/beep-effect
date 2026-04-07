import { PassThrough } from "node:stream";
import { NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import * as TestConsole from "effect/testing/TestConsole";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildCodexSessionStartContext,
  buildSessionStartHookOutput,
  readHookInput,
  runCodexSessionStartHook,
} from "../src/commands/Codex/internal/CodexSessionStartRuntime.js";

const CommandTestLayer = Layer.mergeAll(NodeServices.layer, TestConsole.layer);
const originalStdinDescriptor = Object.getOwnPropertyDescriptor(process, "stdin");
const validHookInput = {
  cwd: "/tmp/beep-effect3",
  hook_event_name: "SessionStart",
  model: "gpt-5.4",
  permission_mode: "acceptEdits",
  session_id: "session-1",
  source: "clear",
  transcript_path: null,
} as const;

const installMockStdin = (isTTY = false): PassThrough => {
  const stdin = new PassThrough();
  Object.defineProperty(stdin, "isTTY", {
    configurable: true,
    value: isTTY,
  });
  Object.defineProperty(process, "stdin", {
    configurable: true,
    value: stdin,
  });

  return stdin;
};

afterEach(() => {
  if (originalStdinDescriptor !== undefined) {
    Object.defineProperty(process, "stdin", originalStdinDescriptor);
  }
});

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

  it("returns undefined when stdin is a TTY", async () => {
    installMockStdin(true);

    await expect(Effect.runPromise(readHookInput)).resolves.toBeUndefined();
  });

  it("returns undefined when stdin is empty", async () => {
    const stdin = installMockStdin();
    const result = Effect.runPromise(readHookInput);
    stdin.end("");

    await expect(result).resolves.toBeUndefined();
  });

  it("fails when stdin JSON is not an object", async () => {
    const stdin = installMockStdin();
    const result = Effect.runPromise(readHookInput);
    stdin.end('"hello"');

    await expect(result).rejects.toMatchObject({
      message: expect.stringContaining("Failed to decode Codex SessionStart hook input"),
    });
  });

  it("fails when stdin JSON does not satisfy the SessionStart schema", async () => {
    const stdin = installMockStdin();
    const result = Effect.runPromise(readHookInput);
    stdin.end(JSON.stringify({ source: "startup" }));

    await expect(result).rejects.toMatchObject({
      message: expect.stringContaining("Failed to decode Codex SessionStart hook input"),
    });
  });

  it("uses the SessionStart stdin payload when present", async () => {
    const stdin = installMockStdin();
    const result = Effect.runPromise(
      Effect.gen(function* () {
        yield* runCodexSessionStartHook;
        return yield* TestConsole.logLines;
      }).pipe(Effect.provide(CommandTestLayer))
    );
    stdin.end(JSON.stringify(validHookInput));

    const logLines = await result;
    const output = JSON.parse(logLines[0] ?? "");

    expect(output.hookSpecificOutput.additionalContext).toContain("Session source: clear.");
    expect(output.hookSpecificOutput.additionalContext).toContain("Working directory: /tmp/beep-effect3.");
  });

  it("logs a soft-failure payload when stdin decoding fails", async () => {
    const stdin = installMockStdin();
    const result = Effect.runPromise(
      Effect.gen(function* () {
        yield* runCodexSessionStartHook;
        return yield* TestConsole.logLines;
      }).pipe(Effect.provide(CommandTestLayer))
    );
    stdin.end("{");

    const logLines = await result;
    const output = JSON.parse(logLines[0] ?? "");

    expect(output.hookSpecificOutput.additionalContext).toContain("Graphiti startup context failed softly:");
    expect(output.hookSpecificOutput.additionalContext).toContain("Failed to decode Codex SessionStart hook input");
  });
});
