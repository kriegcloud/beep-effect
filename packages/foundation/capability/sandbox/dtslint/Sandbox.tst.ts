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
  OpenCodeOptions,
  opencode,
  PiOptions,
  pi,
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
    const piAgent = pi("sonnet-4.5", PiOptions.make({ env: { PI_API_KEY: "test" } }));
    const opencodeAgent = opencode("qwen/qwen3-coder", OpenCodeOptions.make({ env: { OPEN_CODE: "1" } }));
    const sandbox = noSandbox(NoSandboxOptions.make({}));
    const dockerProvider = docker(ContainerProviderOptions.make({ imageName: "sandbox:latest" }));
    const podmanProvider = podman(ContainerProviderOptions.make({ imageName: "sandbox:latest" }));
    const program = run({
      agent,
      branchStrategy: HeadBranchStrategy.make({}),
      prompt: "hello",
      sandbox,
      timeouts: Timeouts.make({ copyToWorktreeMs: Duration.millis(1) }),
    });

    expect(
      codexAgent.buildPrintCommand(AgentCommandOptions.make({ dangerouslySkipPermissions: true, prompt: "x" }))
    ).type.toBeAssignableTo<{
      readonly command: string;
    }>();
    expect(dockerProvider.name).type.toBe<string>();
    expect(piAgent.parseStreamLine("{}")).type.toBeAssignableTo<ReadonlyArray<{ readonly _tag: string }>>();
    expect(opencodeAgent.buildInteractiveArgs).type.toBeAssignableTo<
      undefined | ((options: AgentCommandOptions) => ReadonlyArray<string>)
    >();
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
