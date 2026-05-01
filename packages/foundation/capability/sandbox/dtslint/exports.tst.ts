import {
  buildLogFilename,
  claudeCode,
  Display,
  ExecResult,
  noSandbox,
  ProcessCommand,
  SandboxProcess,
  WorktreeInfo,
} from "@beep/sandbox";
import { describe, expect, it } from "tstyche";

describe("@beep/sandbox package exports", () => {
  it("resolves root exports through the package map", () => {
    const agent = claudeCode();
    const provider = noSandbox();
    const result = new ExecResult({ exitCode: 0, stderr: "", stdout: "ok" });
    const command = new ProcessCommand({ command: "git" });
    const worktree = new WorktreeInfo({ branch: "main", path: "/repo" });

    expect(agent.name).type.toBe<string>();
    expect(provider.name).type.toBe<string>();
    expect(result.stdout).type.toBe<string>();
    expect(command.command).type.toBe<string>();
    expect(worktree.branch).type.toBe<string>();
    expect(buildLogFilename("main", undefined, undefined)).type.toBe<string>();
    expect(Display.key).type.toBeAssignableTo<string>();
    expect(SandboxProcess.key).type.toBeAssignableTo<string>();
  });
});
