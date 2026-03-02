import {
  probeClaudeSdkAvailability,
  runClaudeSdkExecution,
} from "@beep/agent-eval/benchmark/execution/claude-sdk-executor";
import type { ExecutionRequest } from "@beep/agent-eval/benchmark/execution/types";
import { AgentEvalInvariantError } from "@beep/agent-eval/errors";
import { describe, expect, it } from "vitest";

const claudeCredentialsRequiredMessage =
  "Claude @beep/ai-sdk execution requires ANTHROPIC_API_KEY/API_KEY or CLAUDE_CODE_SESSION_ACCESS_TOKEN.";

const request: ExecutionRequest = {
  agent: "claude",
  model: "claude-sonnet-4-6",
  promptPacket: "prompt",
  cwd: ".",
  timeoutMinutes: 1,
  timeoutCapMs: undefined,
  reasoningEffort: undefined,
  claudeEffort: "medium",
};

const restoreEnvVar = (name: string, value: string | undefined): void => {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
};

const withClearedClaudeCredentials = async <A>(effect: () => Promise<A>): Promise<A> => {
  const previousAnthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const previousApiKey = process.env.API_KEY;
  const previousSessionToken = process.env.CLAUDE_CODE_SESSION_ACCESS_TOKEN;

  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.API_KEY;
  delete process.env.CLAUDE_CODE_SESSION_ACCESS_TOKEN;

  try {
    return await effect();
  } finally {
    restoreEnvVar("ANTHROPIC_API_KEY", previousAnthropicApiKey);
    restoreEnvVar("API_KEY", previousApiKey);
    restoreEnvVar("CLAUDE_CODE_SESSION_ACCESS_TOKEN", previousSessionToken);
  }
};

describe("claude sdk executor", () => {
  it("reports sdk unavailable when Claude credentials are missing", async () => {
    const availability = await withClearedClaudeCredentials(() => probeClaudeSdkAvailability());
    expect(availability).toEqual({
      available: false,
      reason: claudeCredentialsRequiredMessage,
    });
  });

  it("throws a typed invariant error when sdk execution is requested without credentials", async () => {
    await expect(withClearedClaudeCredentials(() => runClaudeSdkExecution(request))).rejects.toBeInstanceOf(
      AgentEvalInvariantError
    );
    await expect(withClearedClaudeCredentials(() => runClaudeSdkExecution(request))).rejects.toMatchObject({
      message: claudeCredentialsRequiredMessage,
    });
  });
});
