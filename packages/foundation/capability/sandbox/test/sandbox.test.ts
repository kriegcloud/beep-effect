import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  AgentCommandOptions,
  AgentError,
  AgentIdleTimeoutError,
  type AgentProvider,
  AgentStreamEmitter,
  buildCompletionMessage,
  buildLogFilename,
  buildRunSummaryRows,
  CreateWorktreeOptions,
  callbackAgentStreamEmitterLayer,
  claudeCode,
  codex,
  createWorktree,
  Display,
  type DisplayEntry,
  ExecResult,
  FileDisplay,
  formatErrorMessage,
  InitError,
  InteractiveExecResult,
  interactive,
  MergeProviderEnvOptions,
  mergeProviderEnv,
  type NoSandboxProvider,
  noSandbox,
  opencode,
  orchestrate,
  PrintCommand,
  ProcessResult,
  pi,
  RunSummaryRowOptions,
  redactSensitiveText,
  SandboxError,
  SandboxExecOptions,
  type SandboxHandle,
  SandboxProcess,
  SandboxProcessLive,
  type SandboxProvider,
  SilentDisplay,
  WorktreeTimeoutError,
} from "@beep/sandbox";
import { NodeChildProcessSpawner, NodeServices } from "@effect/platform-node";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Duration, Effect, Exit, Fiber, Layer, Ref } from "effect";
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

  it.effect(
    "runs a created worktree without creating a second worktree and closes it explicitly",
    Effect.fnUntraced(function* () {
      const repoDir = yield* Effect.promise(() => mkdtemp(join(tmpdir(), "beep-sandbox-worktree-")));
      const gitCommands: Array<ReadonlyArray<string>> = [];
      const displayRef = yield* Ref.make<ReadonlyArray<DisplayEntry>>([]);
      const createdSandboxPaths: Array<string> = [];
      const worktreePath = join(repoDir, ".sandcastle", "worktrees", "feature-reuse");
      const ProcessLayer = Layer.succeed(
        SandboxProcess,
        SandboxProcess.of({
          run: Effect.fn("SandboxProcess.run")(function* (command) {
            if (command.command === "git") {
              gitCommands.push(command.args);

              if (command.args.includes("add")) {
                yield* Effect.promise(() => mkdir(worktreePath, { recursive: true }));
              }

              if (command.args.includes("rev-parse")) {
                return new ProcessResult({ exitCode: 0, stderr: "", stdout: "feature/reuse\n" });
              }
            }

            return new ProcessResult({ exitCode: 0, stderr: "", stdout: "" });
          }),
          runShell: Effect.fn("SandboxProcess.runShell")(() =>
            Effect.succeed(new ProcessResult({ exitCode: 0, stderr: "", stdout: "" }))
          ),
        })
      );
      const sandbox: SandboxProvider = {
        _tag: "None",
        create: (options) => {
          createdSandboxPaths.push(options.worktreePath);

          return Effect.succeed({
            close: () => Effect.void,
            copyFileOut: () => Effect.void,
            exec: () =>
              Effect.succeed(
                new ExecResult({
                  exitCode: 0,
                  stderr: "",
                  stdout: '{"type":"item.completed","item":{"type":"agent_message","text":"done"}}\\nDONE',
                })
              ),
            worktreePath: options.worktreePath,
          });
        },
        env: {},
        name: "test-sandbox",
      };
      const TestLayer = Layer.mergeAll(
        ProcessLayer,
        NodeFileSystem.layer,
        NodePath.layer,
        SilentDisplay.layer(displayRef),
        callbackAgentStreamEmitterLayer(() => undefined)
      );

      const worktree = yield* createWorktree(new CreateWorktreeOptions({ branch: "feature/reuse", repoDir })).pipe(
        Effect.provide(TestLayer)
      );
      const result = yield* worktree
        .run({
          agent: codex("gpt-5.4"),
          maxIterations: 1,
          prompt: "hello",
          sandbox,
        })
        .pipe(Effect.provide(TestLayer));

      yield* worktree.close().pipe(Effect.provide(TestLayer));
      yield* worktree.close().pipe(Effect.provide(TestLayer));
      yield* Effect.promise(() => rm(repoDir, { force: true, recursive: true }));

      expect(result.branch).toBe("feature/reuse");
      expect(createdSandboxPaths).toEqual([worktreePath]);
      expect(gitCommands.filter((args) => args.includes("add"))).toHaveLength(1);
      expect(gitCommands.filter((args) => args.includes("remove"))).toHaveLength(1);
    })
  );

  it.effect(
    "captures flat display entries",
    Effect.fnUntraced(function* () {
      const ref = yield* Ref.make<ReadonlyArray<DisplayEntry>>([]);
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

  it.effect(
    "redacts secret-shaped display output",
    Effect.fnUntraced(function* () {
      const ref = yield* Ref.make<ReadonlyArray<DisplayEntry>>([]);
      const program = Effect.gen(function* () {
        const display = yield* Display;
        yield* display.intro("OPENAI_API_KEY=sk-test-secret");
        yield* display.status("OPENAI_API_KEY=sk-test-secret", "Warn");
        yield* display.spinner("Authorization: Bearer secret-token-value", Effect.void);
        yield* display.summary("OPENAI_API_KEY=sk-test-secret", {
          "Authorization: Bearer secret-token-value": "OPENAI_API_KEY=sk-test-secret",
        });
        yield* display.taskLog("OPENAI_API_KEY=sk-test-secret", (message) =>
          Effect.sync(() => message("Authorization: Bearer secret-token-value"))
        );
        yield* display.text("Authorization: Bearer secret-token-value");
        yield* display.toolCall("Bash", "export OPENAI_API_KEY=sk-test-secret");
      });

      yield* program.pipe(Effect.provide(SilentDisplay.layer(ref)));
      const entries = yield* Ref.get(ref);

      expect(entries).toEqual([
        { _tag: "Intro", title: "OPENAI_API_KEY=[REDACTED]" },
        { _tag: "Status", message: "OPENAI_API_KEY=[REDACTED]", severity: "Warn" },
        { _tag: "Spinner", message: "Authorization: [REDACTED]" },
        {
          _tag: "Summary",
          rows: {
            "Authorization: [REDACTED]": "OPENAI_API_KEY=[REDACTED]",
          },
          title: "OPENAI_API_KEY=[REDACTED]",
        },
        {
          _tag: "TaskLog",
          messages: ["Authorization: [REDACTED]"],
          title: "OPENAI_API_KEY=[REDACTED]",
        },
        { _tag: "Text", message: "Authorization: [REDACTED]" },
        { _tag: "ToolCall", formattedArgs: "export OPENAI_API_KEY=[REDACTED]", name: "Bash" },
      ]);
    })
  );

  it.effect(
    "redacts file display output",
    Effect.fnUntraced(function* () {
      const tempDir = yield* Effect.promise(() => mkdtemp(join(tmpdir(), "beep-sandbox-display-")));
      const logPath = join(tempDir, "run.log");
      const DisplayLayer = FileDisplay.layer(logPath).pipe(
        Layer.provide(NodeFileSystem.layer),
        Layer.provide(NodePath.layer)
      );
      const program = Effect.gen(function* () {
        const display = yield* Display;
        yield* display.status("OPENAI_API_KEY=sk-test-secret", "Warn");
        yield* display.spinner("Authorization: Bearer secret-token-value", Effect.void);
        yield* display.summary("OPENAI_API_KEY=sk-test-secret", {
          "Authorization: Bearer secret-token-value": "OPENAI_API_KEY=sk-test-secret",
        });
        yield* display.taskLog("OPENAI_API_KEY=sk-test-secret", (message) =>
          Effect.sync(() => message("Authorization: Bearer secret-token-value"))
        );
        yield* display.text("Authorization: Bearer secret-token-value");
      });

      yield* program.pipe(Effect.provide(DisplayLayer));
      const rendered = yield* Effect.promise(() => readFile(logPath, "utf8"));

      yield* Effect.promise(() => rm(tempDir, { force: true, recursive: true }));

      expect(rendered).toContain("OPENAI_API_KEY=[REDACTED]");
      expect(rendered).toContain("Authorization: [REDACTED]");
      expect(rendered).not.toContain("secret-token-value");
      expect(rendered).not.toContain("sk-test-secret");
    })
  );

  it("redacts formatted sandbox errors", () => {
    const rendered = formatErrorMessage(
      new AgentError({
        cause: "OPENAI_API_KEY=sk-test-secret",
        message: "Authorization: Bearer secret-token-value",
      })
    );

    expect(rendered).toContain("Authorization: [REDACTED]");
    expect(rendered).not.toContain("secret-token-value");
    expect(rendered).not.toContain("sk-test-secret");
  });

  it("redacts standalone secret-shaped text", () => {
    const rendered = redactSensitiveText("Authorization: Bearer secret-token-value\nOPENAI_API_KEY=sk-test-secret");

    expect(rendered).toContain("Authorization: [REDACTED]");
    expect(rendered).toContain("OPENAI_API_KEY=[REDACTED]");
    expect(rendered).not.toContain("secret-token-value");
    expect(rendered).not.toContain("sk-test-secret");
  });

  it.effect(
    "forwards redacted agent stream callback events",
    Effect.fnUntraced(function* () {
      const seen: Array<unknown> = [];
      const timestamp = yield* DateTime.now;
      const program = Effect.gen(function* () {
        const emitter = yield* AgentStreamEmitter;
        yield* emitter.emit({
          _tag: "ToolCall",
          formattedArgs: "OPENAI_API_KEY=sk-test-secret",
          iteration: 1,
          name: "Bash",
          timestamp,
        });
      });

      yield* program.pipe(
        Effect.provide(
          callbackAgentStreamEmitterLayer((event) => {
            seen.push(event);
          })
        )
      );

      expect(seen).toHaveLength(1);
      expect(seen).toEqual([
        {
          _tag: "ToolCall",
          formattedArgs: "OPENAI_API_KEY=[REDACTED]",
          iteration: 1,
          name: "Bash",
          timestamp,
        },
      ]);
    })
  );

  it.effect(
    "swallows agent stream callback failures",
    Effect.fnUntraced(function* () {
      const timestamp = yield* DateTime.now;
      const program = Effect.gen(function* () {
        const emitter = yield* AgentStreamEmitter;
        yield* emitter.emit({
          _tag: "Text",
          iteration: 1,
          message: "hello",
          timestamp,
        });
      }).pipe(
        Effect.provide(
          callbackAgentStreamEmitterLayer(() => {
            throw new Error("callback failed");
          })
        )
      );

      const exit = yield* Effect.exit(program);

      expect(Exit.isSuccess(exit)).toBe(true);
    })
  );

  it.effect(
    "keeps SandboxError.withTimeout typed and dual",
    Effect.fnUntraced(function* () {
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

  it("parses built-in agent provider stream lines without native JSON APIs", () => {
    const claude = claudeCode();
    const codexProvider = codex("gpt-5.4");
    const piProvider = pi("sonnet-4.5");
    const opencodeProvider = opencode("qwen/qwen3-coder");

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
    expect(
      piProvider.parseStreamLine(
        '{"type":"message_update","assistantMessageEvent":{"type":"text_delta","delta":"hello"}}'
      )
    ).toEqual([{ _tag: "Text", text: "hello" }]);
    expect(
      piProvider.parseStreamLine('{"type":"tool_execution_start","toolName":"Bash","args":{"command":"echo pi"}}')
    ).toEqual([{ _tag: "ToolCall", args: "echo pi", name: "Bash" }]);
    expect(piProvider.parseStreamLine('{"type":"agent_error","error":{"message":"pi failed"}}')).toEqual([
      { _tag: "Result", result: "pi failed" },
    ]);
    expect(
      piProvider.parseStreamLine(
        '{"type":"agent_end","messages":[{"role":"user","content":[{"type":"text","text":"ignored"}]},{"role":"assistant","content":[{"type":"text","text":"final"},{"type":"image"}]}]}'
      )
    ).toEqual([{ _tag: "Result", result: "final" }]);
    expect(
      piProvider.buildPrintCommand(
        new AgentCommandOptions({
          dangerouslySkipPermissions: true,
          prompt: "hello pi",
        })
      )
    ).toEqual({
      command: "pi -p --mode json --no-session --model 'sonnet-4.5'",
      stdin: "hello pi",
    });
    expect(
      opencodeProvider.buildPrintCommand(new AgentCommandOptions({ dangerouslySkipPermissions: true, prompt: "hi" }))
    ).toMatchObject({
      command: "opencode run --model 'qwen/qwen3-coder' 'hi'",
    });
  });

  it.effect(
    "fails typed env merges with overlapping provider keys",
    Effect.fnUntraced(function* () {
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

  it.effect(
    "runs interactive sessions through sandbox interactiveExec",
    Effect.fnUntraced(function* () {
      const tempDir = yield* Effect.promise(() => mkdtemp(join(tmpdir(), "beep-sandbox-interactive-")));
      const displayRef = yield* Ref.make<ReadonlyArray<DisplayEntry>>([]);
      let capturedArgs: ReadonlyArray<string> = [];
      let capturedCwd = "";
      let capturedEnv: Readonly<Record<string, string>> = {};
      let capturedStderr: NodeJS.WritableStream | undefined;
      let capturedStdin: NodeJS.ReadableStream | undefined;
      let capturedStdout: NodeJS.WritableStream | undefined;
      let closed = false;
      const agent: AgentProvider = {
        buildInteractiveArgs: (options) => [
          "agent",
          options.prompt,
          options.dangerouslySkipPermissions ? "skip-permissions" : "ask-permissions",
        ],
        buildPrintCommand: () => new PrintCommand({ command: "unused" }),
        captureSessions: false,
        env: { AGENT_ENV: "1" },
        name: "test-agent",
        parseStreamLine: () => [],
      };
      const sandbox: NoSandboxProvider = {
        _tag: "None",
        create: ({ env, worktreePath }) =>
          Effect.succeed({
            close: () =>
              Effect.sync(() => {
                closed = true;
              }),
            copyFileOut: () => Effect.void,
            exec: () => Effect.succeed(new ExecResult({ exitCode: 0, stderr: "", stdout: "" })),
            interactiveExec: (args, options) =>
              Effect.sync(() => {
                capturedArgs = args;
                capturedCwd = options.cwd ?? "";
                capturedEnv = env;
                capturedStderr = options.stderr;
                capturedStdin = options.stdin;
                capturedStdout = options.stdout;

                return new InteractiveExecResult({ exitCode: 7 });
              }),
            worktreePath,
          }),
        env: { SANDBOX_ENV: "1" },
        name: "test-sandbox",
      };

      const result = yield* interactive({
        agent,
        cwd: tempDir,
        prompt: "hello interactive",
        sandbox,
      }).pipe(Effect.provide(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer, SilentDisplay.layer(displayRef))));

      yield* Effect.promise(() => rm(tempDir, { force: true, recursive: true }));

      expect(result.exitCode).toBe(7);
      expect(capturedArgs).toEqual(["agent", "hello interactive", "skip-permissions"]);
      expect(capturedCwd).toBe(tempDir);
      expect(capturedEnv).toMatchObject({ AGENT_ENV: "1", SANDBOX_ENV: "1" });
      expect(capturedStderr).toBe(process.stderr);
      expect(capturedStdin).toBe(process.stdin);
      expect(capturedStdout).toBe(process.stdout);
      expect(closed).toBe(true);
    })
  );

  it.effect(
    "streams stdout lines while preserving collected output",
    Effect.fnUntraced(function* () {
      const ProcessLayer = SandboxProcessLive.pipe(
        Layer.provide(NodeChildProcessSpawner.layer.pipe(Layer.provideMerge(NodeServices.layer)))
      );
      const result = yield* Effect.gen(function* () {
        const tempDir = yield* Effect.promise(() => mkdtemp(join(tmpdir(), "beep-sandbox-stream-")));
        const lines: Array<string> = [];
        const sandbox = yield* noSandbox().create({ env: {}, worktreePath: tempDir });
        const execResult = yield* sandbox.exec(
          "printf 'one\\ntwo\\npartial'",
          new SandboxExecOptions({
            onLine: (line) => {
              lines.push(line);
            },
          })
        );

        yield* Effect.promise(() => rm(tempDir, { force: true, recursive: true }));

        return { lines, result: execResult };
      }).pipe(Effect.provide(ProcessLayer));

      expect(result.result.stdout).toBe("one\ntwo\npartial");
      expect(result.lines).toEqual(["one", "two", "partial"]);
    })
  );

  it.effect(
    "fails silent agent iterations with AgentIdleTimeoutError",
    Effect.fnUntraced(function* () {
      const displayRef = yield* Ref.make<ReadonlyArray<DisplayEntry>>([]);
      const provider: AgentProvider = {
        buildPrintCommand: () => new PrintCommand({ command: "wait" }),
        name: "silent-agent",
        parseStreamLine: () => [],
      };
      const sandbox: SandboxHandle = {
        close: () => Effect.void,
        copyFileOut: () => Effect.void,
        exec: Effect.fn("SilentSandbox.exec")(function* () {
          return yield* Effect.never;
        }),
        worktreePath: "/tmp/silent-worktree",
      };

      const fiber = yield* orchestrate({
        branch: "main",
        idleTimeoutMs: Duration.millis(10),
        iterations: 1,
        prompt: "wait",
        provider,
        sandbox,
        sandboxRepoDir: "/tmp/silent-worktree",
      }).pipe(
        Effect.flip,
        Effect.provide(
          Layer.mergeAll(
            SilentDisplay.layer(displayRef),
            callbackAgentStreamEmitterLayer(() => {})
          )
        ),
        Effect.forkChild
      );

      yield* TestClock.adjust(Duration.millis(10));
      const error = yield* Fiber.join(fiber);

      expect(error).toBeInstanceOf(AgentIdleTimeoutError);
      expect(error._tag).toBe("AgentIdleTimeoutError");
    })
  );
});
