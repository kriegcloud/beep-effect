import {
  AgentCommandOptions,
  buildCompletionMessage,
  buildLogFilename,
  buildRunSummaryRows,
  claudeCode,
  codex,
  Display,
  ExecResult,
  InitError,
  MergeProviderEnvOptions,
  mergeProviderEnv,
  RunSummaryRowOptions,
  SandboxError,
  SilentDisplay,
  WorktreeTimeoutError,
} from "@beep/sandbox";
import { describe, expect, it } from "@effect/vitest";
import { Duration, Effect, Fiber, Ref } from "effect";
import { TestClock } from "effect/testing";

describe("@beep/sandbox", () => {
  it("builds run helper outputs with Pascal severity values", () => {
    expect(buildLogFilename("feature/a", "target/main", "Claude 1")).toBe("target-main-feature-a-claude-1.log");
    expect(
      buildRunSummaryRows(
        new RunSummaryRowOptions({
          agentName: "claude-code",
          branch: "feature/a",
          maxIterations: 1,
          sandboxName: "docker",
        })
      )
    ).toEqual({
      Agent: "claude-code",
      Branch: "feature/a",
      "Max iterations": "1",
      Sandbox: "docker",
    });
    expect(buildCompletionMessage("done", 1)).toEqual({
      message: "Run complete: agent finished after 1 iteration(s).",
      severity: "Success",
    });
  });

  it.effect("captures flat display entries", () =>
    Effect.gen(function* () {
      const ref = yield* Ref.make([]);
      const program = Effect.gen(function* () {
        const display = yield* Display;
        yield* display.status("Ready", "Success");
        yield* display.toolCall("Bash", "echo ok");
      });

      yield* program.pipe(Effect.provide(SilentDisplay.layer(ref)));
      const entries = yield* Ref.get(ref);

      expect(entries).toEqual([
        { _tag: "Status", message: "Ready", severity: "Success" },
        { _tag: "ToolCall", formattedArgs: "echo ok", name: "Bash" },
      ]);
    })
  );

  it.effect("keeps SandboxError.withTimeout typed and dual", () =>
    Effect.gen(function* () {
      const fiber = yield* Effect.never.pipe(
        SandboxError.withTimeout(1, () =>
          WorktreeTimeoutError.new("timeout", "worktree timed out", {
            operation: "create",
            path: "/tmp/repo",
            timeoutMs: Duration.millis(1),
          })
        ),
        Effect.flip,
        Effect.forkChild
      );
      yield* TestClock.adjust(Duration.millis(1));
      const error = yield* Fiber.join(fiber);

      expect(error._tag).toBe("WorktreeTimeoutError");
      expect(error.path).toBe("/tmp/repo");
    })
  );

  it("parses Claude and Codex stream lines without native JSON APIs", () => {
    const claude = claudeCode();
    const codexProvider = codex("gpt-5.4");

    expect(
      claude.parseStreamLine(
        '{"type":"assistant","message":{"content":[{"type":"text","text":"hello"},{"type":"tool_use","name":"Bash","input":{"command":"echo ok"}}]}}'
      )
    ).toEqual([
      { _tag: "Text", text: "hello" },
      { _tag: "ToolCall", args: "echo ok", name: "Bash" },
    ]);
    expect(
      codexProvider.parseStreamLine('{"type":"item.completed","item":{"type":"agent_message","text":"done"}}')
    ).toEqual([
      { _tag: "Text", text: "done" },
      { _tag: "Result", result: "done" },
    ]);
    expect(
      codexProvider.buildPrintCommand(
        new AgentCommandOptions({
          dangerouslySkipPermissions: true,
          prompt: "hello",
        })
      ).stdin
    ).toBe("hello");
  });

  it.effect("fails typed env merges with overlapping provider keys", () =>
    Effect.gen(function* () {
      const error = yield* mergeProviderEnv(
        new MergeProviderEnvOptions({
          agentProviderEnv: { SHARED: "agent" },
          resolvedEnv: {},
          sandboxProviderEnv: { SHARED: "sandbox" },
        })
      ).pipe(Effect.flip);

      expect(error).toBeInstanceOf(InitError);
      expect(error._tag).toBe("InitError");
    })
  );

  it("keeps schema-backed exec results constructible", () => {
    const result = new ExecResult({ exitCode: 0, stderr: "", stdout: "ok" });

    expect(result.stdout).toBe("ok");
  });
});
