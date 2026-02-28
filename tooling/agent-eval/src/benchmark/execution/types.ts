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
 * @domain agent-eval
 * @provides ExecutionBackendMode
 * @depends none
 * @errors none
 * @since 0.0.0
 * @category models
 */
export type ExecutionBackendMode = "auto" | "cli" | "sdk";

/**
 * Concrete backend used by one run.
 *
 * @domain agent-eval
 * @provides ExecutionBackend
 * @depends none
 * @errors none
 * @since 0.0.0
 * @category models
 */
export type ExecutionBackend = "cli" | "sdk";

/**
 * Unified reasoning effort levels supported by benchmark CLI.
 *
 * @domain agent-eval
 * @provides BenchmarkReasoningEffort
 * @depends none
 * @errors none
 * @since 0.0.0
 * @category models
 */
export type BenchmarkReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";

/**
 * Claude effort levels supported by benchmark CLI.
 *
 * @domain agent-eval
 * @provides BenchmarkClaudeEffort
 * @depends none
 * @errors none
 * @since 0.0.0
 * @category models
 */
export type BenchmarkClaudeEffort = "low" | "medium" | "high";

/**
 * Execution request payload normalized across backends.
 *
 * @domain agent-eval
 * @provides ExecutionRequest
 * @depends AgentName
 * @errors none
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
 * @domain agent-eval
 * @provides ExecutionResult
 * @depends ExecutionBackend
 * @errors none
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
 * @domain agent-eval
 * @provides SdkAvailability
 * @depends none
 * @errors none
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
 * @domain agent-eval
 * @provides ExecutionResolver
 * @depends SdkAvailability, ExecutionRequest, ExecutionResult
 * @errors none
 * @since 0.0.0
 * @category models
 */
export interface ExecutionResolver {
  readonly codexSdkAvailability: SdkAvailability;
  readonly claudeSdkAvailability: SdkAvailability;
  execute(request: ExecutionRequest): Promise<ExecutionResult>;
}
