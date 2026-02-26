/**
 * Execution backend contracts for benchmark live agent runs.
 *
 * @since 0.0.0
 * @module
 */

import type { AgentName } from "../../schemas/index.js";

/**
 * Backend selection mode accepted from CLI.
 *
 * @since 0.0.0
 * @category models
 */
export type ExecutionBackendMode = "auto" | "cli" | "sdk";

/**
 * Concrete backend used by one run.
 *
 * @since 0.0.0
 * @category models
 */
export type ExecutionBackend = "cli" | "sdk";

/**
 * Unified reasoning effort levels supported by benchmark CLI.
 *
 * @since 0.0.0
 * @category models
 */
export type BenchmarkReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";

/**
 * Claude effort levels supported by benchmark CLI.
 *
 * @since 0.0.0
 * @category models
 */
export type BenchmarkClaudeEffort = "low" | "medium" | "high";

/**
 * Execution request payload normalized across backends.
 *
 * @since 0.0.0
 * @category models
 */
export interface ExecutionRequest {
  readonly agent: AgentName;
  readonly model: string;
  readonly promptPacket: string;
  readonly cwd: string;
  readonly timeoutMinutes: number;
  readonly timeoutCapMs: number | undefined;
  readonly reasoningEffort: BenchmarkReasoningEffort | undefined;
  readonly claudeEffort: BenchmarkClaudeEffort | undefined;
}

/**
 * Result payload normalized across CLI and SDK paths.
 *
 * @since 0.0.0
 * @category models
 */
export interface ExecutionResult {
  readonly backend: ExecutionBackend;
  readonly commandDescription: string;
  readonly success: boolean;
  readonly timedOut: boolean;
  readonly stdout: string;
  readonly stderr: string;
  readonly assistantText: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly costUsd: number | null;
  readonly completionObserved: boolean;
  readonly exitCode: number | null;
  readonly signal: string | null;
  readonly fallbackReason: string | null;
}

/**
 * Availability probe result for one SDK path.
 *
 * @since 0.0.0
 * @category models
 */
export interface SdkAvailability {
  readonly available: boolean;
  readonly reason: string | null;
}

/**
 * Runtime resolver returned by backend selection.
 *
 * @since 0.0.0
 * @category models
 */
export interface ExecutionResolver {
  readonly codexSdkAvailability: SdkAvailability;
  readonly claudeSdkAvailability: SdkAvailability;
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
}
