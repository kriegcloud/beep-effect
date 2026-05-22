import {
  buildLogFilename,
  buildRecoveryMessage,
  CreateWorktreeOptions,
  type CwdError,
  claudeCode,
  createWorktree,
  createWorktreeScoped,
  Display,
  ExecResult,
  type FailedStep,
  LogFilenameOptions,
  makeTerminalCleanupHandler,
  noSandbox,
  ProcessCommand,
  RecoveryInput,
  resolveCwd,
  SandboxProcess,
  TextDeltaBuffer,
  TextDeltaBufferOptions,
  type Worktree,
  WorktreeInfo,
} from "@beep/sandbox";
import type { Effect, FileSystem, Path, Scope } from "effect";
import { describe, expect, it } from "tstyche";

describe("@beep/sandbox package exports", () => {
  it("resolves root exports through the package map", () => {
    const agent = claudeCode();
    const provider = noSandbox();
    const result = ExecResult.make({ exitCode: 0, stderr: "", stdout: "ok" });
    const command = ProcessCommand.make({ command: "git" });
    const worktree = WorktreeInfo.make({ branch: "main", path: "/repo" });
    const managedWorktree = createWorktree(CreateWorktreeOptions.make({ repoDir: "/repo" }));
    const scopedWorktree = createWorktreeScoped(CreateWorktreeOptions.make({ repoDir: "/repo" }));
    const failedStep: FailedStep = "diff";
    const recoveryInput = RecoveryInput.make({
      failedStep,
      hasCommits: true,
      hasDiff: true,
      hasUntracked: false,
      patchDir: ".sandcastle/patches/now",
    });
    const textDeltaBuffer = new TextDeltaBuffer(
      () => undefined,
      TextDeltaBufferOptions.make({ debounceMs: 1, lengthThreshold: 8 })
    );
    const terminalHandler = makeTerminalCleanupHandler({ isTTY: false }, { write: () => true });

    expect(agent.name).type.toBe<string>();
    expect(provider.name).type.toBe<string>();
    expect(result.stdout).type.toBe<string>();
    expect(command.command).type.toBe<string>();
    expect(worktree.branch).type.toBe<string>();
    expect(managedWorktree).type.toBeAssignableTo<Effect.Effect<Worktree, unknown, Path.Path | SandboxProcess>>();
    expect(scopedWorktree).type.toBeAssignableTo<
      Effect.Effect<Worktree, unknown, Path.Path | SandboxProcess | Scope.Scope>
    >();
    expect(recoveryInput.failedStep).type.toBe<FailedStep>();
    expect(buildRecoveryMessage(recoveryInput)).type.toBe<string>();
    expect(buildLogFilename("main")).type.toBe<string>();
    expect(buildLogFilename("main", LogFilenameOptions.make({}))).type.toBe<string>();
    expect(Display.key).type.toBeAssignableTo<string>();
    expect(SandboxProcess.key).type.toBeAssignableTo<string>();
    expect(textDeltaBuffer.write("hello")).type.toBe<void>();
    expect(terminalHandler()).type.toBe<void>();
    expect(resolveCwd(".")).type.toBeAssignableTo<Effect.Effect<string, CwdError, FileSystem.FileSystem | Path.Path>>();
    expect(failedStep).type.toBe<"diff">();
  });
});
