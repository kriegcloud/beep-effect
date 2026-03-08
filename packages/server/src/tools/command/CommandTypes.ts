import type { AgentId, ChannelId, CheckpointId, SessionId, ToolName, TurnId } from "@template/domain/ids"
import type { Instant } from "@template/domain/ports"

export const CommandInvocationSources = [
  "tool",
  "checkpoint_replay",
  "schedule",
  "integration",
  "cli"
] as const

export type CommandInvocationSource = typeof CommandInvocationSources[number]

export interface CommandInvocationContext {
  readonly source: CommandInvocationSource
  readonly agentId?: AgentId
  readonly sessionId?: SessionId
  readonly turnId?: TurnId
  readonly channelId?: ChannelId
  readonly checkpointId?: CheckpointId
  readonly toolName?: ToolName
}

interface CommandRequestBase {
  readonly cwd?: string
  readonly timeoutMs?: number
  readonly outputLimitBytes?: number
  readonly envOverrides?: Readonly<Record<string, string>>
}

export interface ShellCommandRequest extends CommandRequestBase {
  readonly mode: "Shell"
  readonly command: string
}

export interface ArgvCommandRequest extends CommandRequestBase {
  readonly mode: "Argv"
  readonly executable: string
  readonly args?: ReadonlyArray<string>
}

export type CommandRequest =
  | ShellCommandRequest
  | ArgvCommandRequest

interface CommandPlanBase {
  readonly cwd: string
  readonly timeoutMs: number
  readonly outputLimitBytes: number
  readonly env: Readonly<Record<string, string | undefined>>
  readonly fingerprint: string
}

export interface ShellCommandPlan extends CommandPlanBase {
  readonly mode: "Shell"
  readonly command: string
}

export interface ArgvCommandPlan extends CommandPlanBase {
  readonly mode: "Argv"
  readonly executable: string
  readonly args: ReadonlyArray<string>
}

export type CommandPlan =
  | ShellCommandPlan
  | ArgvCommandPlan

export interface CommandPlanPatch {
  readonly cwd?: string
  readonly timeoutMs?: number
  readonly outputLimitBytes?: number
  readonly envAdditions?: Readonly<Record<string, string>>
}

export interface CommandResult {
  readonly exitCode: number
  readonly stdout: string
  readonly stderr: string
  readonly truncatedStdout: boolean
  readonly truncatedStderr: boolean
  readonly startedAt: Instant
  readonly completedAt: Instant
}

export const DEFAULT_COMMAND_TIMEOUT_MS = 15_000
export const DEFAULT_COMMAND_OUTPUT_LIMIT_BYTES = 16 * 1024
export const TRUNCATED_OUTPUT_MARKER = "\n...[truncated]"
