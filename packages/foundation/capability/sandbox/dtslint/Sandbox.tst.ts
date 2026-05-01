import {
  AgentCommandOptions,
  type AgentStreamEmitter,
  ContainerProviderOptions,
  claudeCode,
  codex,
  type Display,
  docker,
  HeadBranchStrategy,
  NoSandboxOptions,
  noSandbox,
  podman,
  type RunResult,
  run,
  type SandboxError,
  type SandboxProcess,
  Timeouts,
} from "@beep/sandbox";
import { Duration, type Effect, type FileSystem, type Path } from "effect";
import { describe, expect, it } from "tstyche";

describe("@beep/sandbox types", () => {
  it("keeps provider constructors and run typed", () => {
    const agent = claudeCode();
    const codexAgent = codex("gpt-5.4");
    const sandbox = noSandbox(new NoSandboxOptions({}));
    const dockerProvider = docker(new ContainerProviderOptions({ imageName: "sandbox:latest" }));
    const podmanProvider = podman(new ContainerProviderOptions({ imageName: "sandbox:latest" }));
    const program = run({
      agent,
      branchStrategy: new HeadBranchStrategy({}),
      prompt: "hello",
      sandbox,
      timeouts: new Timeouts({ copyToWorktreeMs: Duration.millis(1) }),
    });

    expect(
      codexAgent.buildPrintCommand(new AgentCommandOptions({ dangerouslySkipPermissions: true, prompt: "x" }))
    ).type.toBeAssignableTo<{
      readonly command: string;
    }>();
    expect(dockerProvider.name).type.toBe<string>();
    expect(podmanProvider.name).type.toBe<string>();
    expect(program).type.toBeAssignableTo<
      Effect.Effect<
        RunResult,
        SandboxError,
        SandboxProcess | FileSystem.FileSystem | Path.Path | Display | AgentStreamEmitter
      >
    >();
  });
});
