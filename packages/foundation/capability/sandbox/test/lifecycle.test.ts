import {
  type DisplayEntry,
  ExecResult,
  ExpandPromptShellExpressionsOptions,
  expandPromptShellExpressions,
  ProcessResult,
  type SandboxExecOptions,
  type SandboxHandle,
  SandboxProcess,
  SilentDisplay,
  substitutePromptArgs,
} from "@beep/sandbox";
import {
  HostLifecycleHookCommand,
  HostLifecycleHooks,
  MergeToHeadOptions,
  mergeToHead,
  prepareSandboxLifecycle,
  runHostHooks,
  SandboxHooks,
  SandboxLifecycleHookCommand,
  SandboxLifecycleHooks,
  SandboxLifecycleSetupOptions,
} from "@beep/sandbox/Lifecycle";
import { HookTimeoutError } from "@beep/sandbox/Sandbox.errors";
import { describe, expect, it } from "@effect/vitest";
import { Duration, Effect, Fiber, Layer, Ref } from "effect";
import { TestClock } from "effect/testing";

describe("@beep/sandbox lifecycle foundation", () => {
  it.effect(
    "expands marked prompt shell expressions inside the sandbox only",
    Effect.fnUntraced(function* () {
      const commands: Array<{ readonly command: string; readonly cwd?: string }> = [];
      const displayRef = yield* Ref.make<ReadonlyArray<DisplayEntry>>([]);
      const DisplayLayer = SilentDisplay.layer(displayRef);
      const sandbox: SandboxHandle = {
        close: () => Effect.void,
        copyFileOut: () => Effect.void,
        exec: (command, options) =>
          Effect.sync(() => {
            commands.push({ command, cwd: options?.cwd });

            return new ExecResult({
              exitCode: 0,
              stderr: "",
              stdout: command === "echo sandbox" ? "sandbox\n" : "unexpected\n",
            });
          }),
        worktreePath: "/sandbox/repo",
      };
      const prompt = yield* substitutePromptArgs("Context: !`echo sandbox` {{VALUE}}", {
        VALUE: "!`echo substituted`",
      }).pipe(Effect.provide(DisplayLayer));
      const expanded = yield* expandPromptShellExpressions(
        sandbox,
        new ExpandPromptShellExpressionsOptions({
          cwd: "/sandbox/repo",
          prompt,
        })
      ).pipe(Effect.provide(DisplayLayer));

      expect(expanded).toBe("Context: sandbox !`echo substituted`");
      expect(commands).toEqual([{ command: "echo sandbox", cwd: "/sandbox/repo" }]);
    })
  );

  it.effect(
    "sets git safe-directory and identity before running ready hooks",
    Effect.fnUntraced(function* () {
      const sandboxExecCalls: Array<{ readonly command: string; readonly options?: SandboxExecOptions }> = [];
      const hostShellCalls: Array<{ readonly command: string; readonly cwd?: string }> = [];
      const displayRef = yield* Ref.make<ReadonlyArray<DisplayEntry>>([]);
      const DisplayLayer = SilentDisplay.layer(displayRef);
      const ProcessLayer = Layer.succeed(
        SandboxProcess,
        SandboxProcess.of({
          run: Effect.fn("SandboxProcess.run")((command) =>
            Effect.succeed(
              new ProcessResult({
                exitCode: 0,
                stderr: "",
                stdout:
                  command.args[1] === "user.name"
                    ? "Host User\n"
                    : command.args[1] === "user.email"
                      ? "host@test\n"
                      : "",
              })
            )
          ),
          runShell: Effect.fn("SandboxProcess.runShell")((command, options) =>
            Effect.sync(() => {
              hostShellCalls.push({ command, cwd: options?.cwd });

              return new ProcessResult({ exitCode: 0, stderr: "", stdout: "" });
            })
          ),
        })
      );
      const sandbox: SandboxHandle = {
        close: () => Effect.void,
        copyFileOut: () => Effect.void,
        exec: (command, options) =>
          Effect.sync(() => {
            sandboxExecCalls.push({ command, options });

            return new ExecResult({ exitCode: 0, stderr: "", stdout: "" });
          }),
        worktreePath: "/sandbox/repo",
      };

      yield* prepareSandboxLifecycle(
        sandbox,
        new SandboxLifecycleSetupOptions({
          hooks: new SandboxHooks({
            host: new HostLifecycleHooks({
              onSandboxReady: [new HostLifecycleHookCommand({ command: "echo host-ready > marker" })],
            }),
            sandbox: new SandboxLifecycleHooks({
              onSandboxReady: [
                new SandboxLifecycleHookCommand({
                  command: "apt-get install -y git",
                  sudo: true,
                }),
              ],
            }),
          }),
          hostRepoDir: "/host/repo",
          hostWorktreePath: "/host/worktree",
          sandboxRepoDir: "/sandbox/repo",
        })
      ).pipe(Effect.provide(Layer.mergeAll(DisplayLayer, ProcessLayer)));

      expect(sandboxExecCalls.map((call) => call.command)).toEqual([
        "git config --global --add safe.directory '/sandbox/repo'",
        "git config --global user.name 'Host User'",
        "git config --global user.email 'host@test'",
        "apt-get install -y git",
      ]);
      expect(sandboxExecCalls[3]?.options?.sudo).toBe(true);
      expect(hostShellCalls).toEqual([{ command: "echo host-ready > marker", cwd: "/host/worktree" }]);
    })
  );

  it.effect(
    "returns typed hook timeout errors",
    Effect.fnUntraced(function* () {
      const ProcessLayer = Layer.succeed(
        SandboxProcess,
        SandboxProcess.of({
          run: Effect.fn("SandboxProcess.run")(() =>
            Effect.succeed(new ProcessResult({ exitCode: 0, stderr: "", stdout: "" }))
          ),
          runShell: Effect.fn("SandboxProcess.runShell")(() => Effect.never),
        })
      );
      const fiber = yield* runHostHooks(
        [new HostLifecycleHookCommand({ command: "slow-hook", timeoutMs: Duration.millis(5) })],
        "/repo"
      ).pipe(Effect.flip, Effect.provide(ProcessLayer), Effect.forkChild);

      yield* TestClock.adjust(Duration.millis(5));
      const error = yield* Fiber.join(fiber);

      expect(error).toBeInstanceOf(HookTimeoutError);
      expect(error._tag).toBe("HookTimeoutError");
      expect(error.command).toBe("slow-hook");
    })
  );

  it.effect(
    "merges temporary branches to head before detaching and deleting them",
    Effect.fnUntraced(function* () {
      const gitCalls: Array<{ readonly cwd?: string; readonly args: ReadonlyArray<string> }> = [];
      const displayRef = yield* Ref.make<ReadonlyArray<DisplayEntry>>([]);
      const DisplayLayer = SilentDisplay.layer(displayRef);
      const ProcessLayer = Layer.succeed(
        SandboxProcess,
        SandboxProcess.of({
          run: Effect.fn("SandboxProcess.run")((command) =>
            Effect.sync(() => {
              gitCalls.push({ args: command.args, cwd: command.cwd });

              return new ProcessResult({
                exitCode: 0,
                stderr: "",
                stdout: command.args.includes("--count") ? "1\n" : "",
              });
            })
          ),
          runShell: Effect.fn("SandboxProcess.runShell")(() =>
            Effect.succeed(new ProcessResult({ exitCode: 0, stderr: "", stdout: "" }))
          ),
        })
      );
      const merged = yield* mergeToHead(
        new MergeToHeadOptions({
          baseHead: "base",
          hostRepoDir: "/host/repo",
          sourceBranch: "sandcastle/test",
          targetBranch: "main",
          worktreePath: "/host/repo/.sandcastle/worktrees/test",
        })
      ).pipe(Effect.provide(Layer.mergeAll(DisplayLayer, ProcessLayer)));

      expect(merged).toBe(true);
      expect(gitCalls).toEqual([
        { args: ["rev-list", "base..sandcastle/test", "--count"], cwd: "/host/repo" },
        { args: ["merge", "sandcastle/test"], cwd: "/host/repo" },
        { args: ["checkout", "--detach"], cwd: "/host/repo/.sandcastle/worktrees/test" },
        { args: ["branch", "-D", "sandcastle/test"], cwd: "/host/repo" },
      ]);
    })
  );
});
