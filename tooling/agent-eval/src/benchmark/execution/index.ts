/**
 * Execution backend resolver for CLI and SDK run paths.
 *
 * @since 0.0.0
 * @module
 */

import { AgentEvalInvariantError } from "../../errors.js";
import type { AgentName } from "../../schemas/index.js";
import { probeClaudeSdkAvailability, runClaudeSdkExecution } from "./claude-sdk-executor.js";
import { runCliExecution } from "./cli-executor.js";
import { probeCodexSdkAvailability, runCodexSdkExecution } from "./codex-sdk-executor.js";
import type {
  ExecutionBackendMode,
  ExecutionRequest,
  ExecutionResolver,
  ExecutionResult,
  SdkAvailability,
} from "./types.js";

interface ExecutionResolverDependencies {
  readonly runCliExecution: (request: ExecutionRequest) => Promise<ExecutionResult>;
  readonly runCodexSdkExecution: (request: ExecutionRequest) => Promise<ExecutionResult>;
  readonly runClaudeSdkExecution: (request: ExecutionRequest) => Promise<ExecutionResult>;
  readonly probeCodexSdkAvailability: () => Promise<SdkAvailability>;
  readonly probeClaudeSdkAvailability: () => Promise<SdkAvailability>;
}

/**
 * Options for runtime execution resolver construction.
 *
 * @since 0.0.0
 * @category models
 */
export interface CreateExecutionResolverOptions {
  readonly mode: ExecutionBackendMode;
  readonly agents: ReadonlyArray<AgentName>;
}

const defaultExecutionResolverDependencies: ExecutionResolverDependencies = {
  runCliExecution,
  runCodexSdkExecution,
  runClaudeSdkExecution,
  probeCodexSdkAvailability,
  probeClaudeSdkAvailability,
};

const dedupeAgents = (agents: ReadonlyArray<AgentName>): ReadonlyArray<AgentName> => {
  const unique: Array<AgentName> = [];
  for (const agent of agents) {
    if (!unique.includes(agent)) {
      unique.push(agent);
    }
  }
  return unique;
};

const sdkAvailabilityForAgent = (
  agent: AgentName,
  codexSdkAvailability: SdkAvailability,
  claudeSdkAvailability: SdkAvailability
): SdkAvailability => (agent === "codex" ? codexSdkAvailability : claudeSdkAvailability);

const sdkRunnerForAgent = (
  agent: AgentName,
  dependencies: ExecutionResolverDependencies
): ((request: ExecutionRequest) => Promise<ExecutionResult>) =>
  agent === "codex" ? dependencies.runCodexSdkExecution : dependencies.runClaudeSdkExecution;

const withFallbackReason = (result: ExecutionResult, reason: string): ExecutionResult => ({
  ...result,
  fallbackReason: reason,
});

const causeMessage = (cause: unknown): string => {
  if (typeof cause === "object" && cause !== null && "message" in cause) {
    const message = cause.message;
    if (typeof message === "string") {
      return message;
    }
  }
  return String(cause);
};

/**
 * Create one execution resolver for the whole suite.
 *
 * @param options - Selected execution mode and requested agents.
 * @param dependencies - Optional dependency overrides for deterministic tests.
 * @returns Resolver with per-run execute function and probed SDK availability.
 * @since 0.0.0
 * @category functions
 */
export const createExecutionResolver = async (
  options: CreateExecutionResolverOptions,
  dependencies: ExecutionResolverDependencies = defaultExecutionResolverDependencies
): Promise<ExecutionResolver> => {
  const [codexSdkAvailability, claudeSdkAvailability] = await Promise.all([
    dependencies.probeCodexSdkAvailability(),
    dependencies.probeClaudeSdkAvailability(),
  ]);

  const requestedAgents = dedupeAgents(options.agents);
  const requestedSdkAvailableCount = requestedAgents.reduce((count, agent) => {
    const availability = sdkAvailabilityForAgent(agent, codexSdkAvailability, claudeSdkAvailability);
    return availability.available ? count + 1 : count;
  }, 0);

  if (options.mode === "sdk" && requestedAgents.length > 0 && requestedSdkAvailableCount === 0) {
    const codexReason = codexSdkAvailability.reason ?? "unknown";
    const claudeReason = claudeSdkAvailability.reason ?? "unknown";
    throw new AgentEvalInvariantError({
      message: `Execution backend sdk requested but no requested agent SDK is available. codex=${codexReason}; claude=${claudeReason}`,
    });
  }

  return {
    codexSdkAvailability,
    claudeSdkAvailability,
    execute: async (request) => {
      if (options.mode === "cli") {
        return dependencies.runCliExecution(request);
      }

      const agentSdkAvailability = sdkAvailabilityForAgent(request.agent, codexSdkAvailability, claudeSdkAvailability);
      if (agentSdkAvailability.available) {
        const runSdk = sdkRunnerForAgent(request.agent, dependencies);
        try {
          return await runSdk(request);
        } catch (cause) {
          const fallbackReason = `SDK execution failed for ${request.agent}: ${causeMessage(cause)}`;
          const cliResult = await dependencies.runCliExecution(request);
          return withFallbackReason(cliResult, fallbackReason);
        }
      }

      const unavailableReason = agentSdkAvailability.reason ?? "unknown";
      const modeContext = options.mode === "sdk" ? "sdk mode fallback to CLI" : "auto mode fallback to CLI";
      const fallbackReason = `SDK unavailable for ${request.agent} (${modeContext}): ${unavailableReason}`;
      const cliResult = await dependencies.runCliExecution(request);
      return withFallbackReason(cliResult, fallbackReason);
    },
  };
};
