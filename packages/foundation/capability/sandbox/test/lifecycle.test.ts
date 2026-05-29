import {
  ExecResult,
  ExpandPromptShellExpressionsOptions,
  expandPromptShellExpressions,
  ProcessResult,
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
import { A } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { Duration, Effect, Fiber, Layer, Match, Ref, Schema } from "effect";
import { TestClock } from "effect/testing";
import type { DisplayEntry, SandboxExecOptions, SandboxHandle } from "@beep/sandbox";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));
const appendCommandCwd = (
  calls: Array<{ readonly command: string; readonly cwd?: string }>,
  command: string,
  cwd: string | undefined
) => {
  if (cwd === undefined) {
    A.appendInPlace(calls, { command });
  } else {
    A.appendInPlace(calls, { command, cwd });
  }
};
const appendArgsCwd = (
  calls: Array<{ readonly cwd?: string; readonly args: ReadonlyArray<string> }>,
  args: ReadonlyArray<string>,
  cwd: string | undefined
) => {
  if (cwd === undefined) {
    A.appendInPlace(calls, { args });
  } else {
    A.appendInPlace(calls, { args, cwd });
  }
};

describe("@beep/sandbox lifecycle foundation", () => {
  it.effect(
    "preserves prompt shell expressions without executing them",
    Effect.fnUntraced(function* () {
      const commands: Array<{ readonly command: string; readonly cwd?: string }> = [];
      const displayRef = yield* Ref.make<ReadonlyArray<DisplayEntry>>([]);
      const DisplayLayer = SilentDisplay.layer(displayRef);
      const sandbox: SandboxHandle = {
        close: Effect.void,
        copyFileOut: () => Effect.void,
        exec: (command, options) =>
          Effect.sync(() => {
            appendCommandCwd(commands, command, options?.cwd);

            return ExecResult.make({
              exitCode: 0,
              stderr: "",
              stdout: command === "echo sandbox" ? "sandbox\n" : "unexpected\n",
            });
          }),
        worktreePath: "/sandbox/repo",
      };
      const prompt = yield* substitutePromptArgs("Context: !`echo sandbox` {{VALUE}}", {
        VALUE: "!`echo substituted`",
      }).pipe(provideScopedLayer(DisplayLayer));
      const expanded = yield* expandPromptShellExpressions(
        sandbox,
        ExpandPromptShellExpressionsOptions.make({
          cwd: "/sandbox/repo",
          prompt,
        })
      ).pipe(provideScopedLayer(DisplayLayer));

      expect(expanded).toBe("Context: !`echo sandbox` !`echo substituted`");
      expect(commands).toEqual([]);
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
              ProcessResult.make({
                exitCode: 0,
                stderr: "",
                stdout: Match.value(command.args[1]).pipe(
                  Match.when("user.name", () => "Host User\n"),
                  Match.when("user.email", () => "host@test\n"),
                  Match.orElse(() => "")
                ),
              })
            )
          ),
          runShell: Effect.fn("SandboxProcess.runShell")((command, options) =>
            Effect.sync(() => {
              appendCommandCwd(hostShellCalls, command, options?.cwd);

              return ProcessResult.make({ exitCode: 0, stderr: "", stdout: "" });
            })
          ),
        })
      );
      const sandbox: SandboxHandle = {
        close: Effect.void,
        copyFileOut: () => Effect.void,
        exec: (command, options) =>
          Effect.sync(() => {
            if (options === undefined) {
              A.appendInPlace(sandboxExecCalls, { command });
            } else {
              A.appendInPlace(sandboxExecCalls, { command, options });
            }

            return ExecResult.make({ exitCode: 0, stderr: "", stdout: "" });
          }),
        worktreePath: "/sandbox/repo",
      };

      yield* prepareSandboxLifecycle(
        sandbox,
        SandboxLifecycleSetupOptions.make({
          hooks: SandboxHooks.make({
            host: HostLifecycleHooks.make({
              onSandboxReady: [HostLifecycleHookCommand.make({ command: "echo host-ready > marker" })],
            }),
            sandbox: SandboxLifecycleHooks.make({
              onSandboxReady: [
                SandboxLifecycleHookCommand.make({
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
      ).pipe(provideScopedLayer(Layer.mergeAll(DisplayLayer, ProcessLayer)));

      expect(A.map(sandboxExecCalls, (call) => call.command)).toEqual([
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
            Effect.succeed(ProcessResult.make({ exitCode: 0, stderr: "", stdout: "" }))
          ),
          runShell: Effect.fn("SandboxProcess.runShell")(() => Effect.never),
        })
      );
      const fiber = yield* runHostHooks(
        [HostLifecycleHookCommand.make({ command: "slow-hook", timeoutMs: Duration.millis(5) })],
        "/repo"
      ).pipe(Effect.flip, provideScopedLayer(ProcessLayer), Effect.forkChild);

      yield* TestClock.adjust(Duration.millis(5));
      const error = yield* Fiber.join(fiber);

      expect(Schema.is(HookTimeoutError)(error)).toBe(true);
      if (!Schema.is(HookTimeoutError)(error)) {
        return;
      }
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
              appendArgsCwd(gitCalls, command.args, command.cwd);

              return ProcessResult.make({
                exitCode: 0,
                stderr: "",
                stdout: A.contains(command.args, "--count") ? "1\n" : "",
              });
            })
          ),
          runShell: Effect.fn("SandboxProcess.runShell")(() =>
            Effect.succeed(ProcessResult.make({ exitCode: 0, stderr: "", stdout: "" }))
          ),
        })
      );
      const merged = yield* mergeToHead(
        MergeToHeadOptions.make({
          baseHead: "base",
          hostRepoDir: "/host/repo",
          sourceBranch: "sandcastle/test",
          targetBranch: "main",
          worktreePath: "/host/repo/.sandcastle/worktrees/test",
        })
      ).pipe(provideScopedLayer(Layer.mergeAll(DisplayLayer, ProcessLayer)));

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
