import type { Instant } from "@template/domain/ports"

export const CliInvocationModes = ["Argv", "Shell"] as const

export type CliInvocationMode = typeof CliInvocationModes[number]

export interface CliRunRequest {
  readonly mode: CliInvocationMode
  readonly command: string
  readonly args?: ReadonlyArray<string>
  readonly cwd: string
  readonly env: Readonly<Record<string, string | undefined>>
  readonly timeoutMs: number
  readonly idleTimeoutMs?: number
  readonly outputLimitBytes: number
}

export interface CliRunResult {
  readonly pid: number | null
  readonly exitCode: number
  readonly stdout: string
  readonly stderr: string
  readonly truncatedStdout: boolean
  readonly truncatedStderr: boolean
  readonly startedAt: Instant
  readonly completedAt: Instant
}

export const CLI_TRUNCATED_OUTPUT_MARKER = "\n...[truncated]"
