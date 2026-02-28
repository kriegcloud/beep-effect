import { createExecutionResolver } from "@beep/agent-eval/benchmark/execution/index";
import type { ExecutionRequest, ExecutionResult } from "@beep/agent-eval/benchmark/execution/types";
import { AgentEvalInvariantError } from "@beep/agent-eval/errors";
import { describe, expect, it } from "vitest";

const baseResult = (backend: "cli" | "sdk"): ExecutionResult => ({
  backend,
  commandDescription: `${backend}-command`,
  success: true,
  timedOut: false,
  stdout: "",
  stderr: "",
  assistantText: "",
  inputTokens: 0,
  outputTokens: 0,
  costUsd: null,
  completionObserved: true,
  exitCode: null,
  signal: null,
  fallbackReason: null,
});

const codexRequest: ExecutionRequest = {
  agent: "codex",
  model: "gpt-5.2",
  promptPacket: "prompt",
  cwd: ".",
  timeoutMinutes: 1,
  timeoutCapMs: undefined,
  reasoningEffort: "minimal",
  claudeEffort: undefined,
};

const claudeRequest: ExecutionRequest = {
  ...codexRequest,
  agent: "claude",
  model: "claude-sonnet-4-6",
  reasoningEffort: undefined,
  claudeEffort: "medium",
};

describe("execution resolver", () => {
  it("prefers sdk when available in auto mode", async () => {
    let cliCalls = 0;
    let codexSdkCalls = 0;
    const resolver = await createExecutionResolver(
      {
        mode: "auto",
        agents: ["codex"],
      },
      {
        runCliExecution: async () => {
          cliCalls += 1;
          return baseResult("cli");
        },
        runCodexSdkExecution: async () => {
          codexSdkCalls += 1;
          return baseResult("sdk");
        },
        runClaudeSdkExecution: async () => baseResult("sdk"),
        probeCodexSdkAvailability: async () => ({ available: true, reason: null }),
        probeClaudeSdkAvailability: async () => ({ available: true, reason: null }),
      }
    );

    const result = await resolver.execute(codexRequest);
    expect(result.backend).toBe("sdk");
    expect(result.fallbackReason).toBeNull();
    expect(codexSdkCalls).toBe(1);
    expect(cliCalls).toBe(0);
  });

  it("falls back to cli in auto mode when sdk is unavailable", async () => {
    let cliCalls = 0;
    const resolver = await createExecutionResolver(
      {
        mode: "auto",
        agents: ["codex"],
      },
      {
        runCliExecution: async () => {
          cliCalls += 1;
          return baseResult("cli");
        },
        runCodexSdkExecution: async () => baseResult("sdk"),
        runClaudeSdkExecution: async () => baseResult("sdk"),
        probeCodexSdkAvailability: async () => ({ available: false, reason: "codex sdk missing" }),
        probeClaudeSdkAvailability: async () => ({ available: true, reason: null }),
      }
    );

    const result = await resolver.execute(codexRequest);
    expect(result.backend).toBe("cli");
    expect(result.fallbackReason?.includes("codex sdk missing")).toBe(true);
    expect(cliCalls).toBe(1);
  });

  it("throws in sdk mode when no requested sdk path is available", async () => {
    await expect(
      createExecutionResolver(
        {
          mode: "sdk",
          agents: ["codex", "claude"],
        },
        {
          runCliExecution: async () => baseResult("cli"),
          runCodexSdkExecution: async () => baseResult("sdk"),
          runClaudeSdkExecution: async () => baseResult("sdk"),
          probeCodexSdkAvailability: async () => ({ available: false, reason: "missing codex sdk" }),
          probeClaudeSdkAvailability: async () => ({ available: false, reason: "missing claude sdk" }),
        }
      )
    ).rejects.toBeInstanceOf(AgentEvalInvariantError);
  });

  it("falls back per-agent in sdk mode when one sdk path is unavailable", async () => {
    let cliCalls = 0;
    const resolver = await createExecutionResolver(
      {
        mode: "sdk",
        agents: ["codex", "claude"],
      },
      {
        runCliExecution: async () => {
          cliCalls += 1;
          return baseResult("cli");
        },
        runCodexSdkExecution: async () => baseResult("sdk"),
        runClaudeSdkExecution: async () => baseResult("sdk"),
        probeCodexSdkAvailability: async () => ({ available: true, reason: null }),
        probeClaudeSdkAvailability: async () => ({ available: false, reason: "missing claude sdk" }),
      }
    );

    const result = await resolver.execute(claudeRequest);
    expect(result.backend).toBe("cli");
    expect(result.fallbackReason?.includes("missing claude sdk")).toBe(true);
    expect(cliCalls).toBe(1);
  });
});
