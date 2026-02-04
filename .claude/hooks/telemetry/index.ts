/**
 * Telemetry Hook - Shared Types and Utilities
 *
 * Provides schemas and utilities for agent usage telemetry.
 * Events are persisted to `.claude/.telemetry/usage.jsonl`.
 *
 * Privacy: Only logs agentType, timestamp, duration, outcome, sessionId.
 * NEVER logs prompt content, file contents, or user data.
 *
 * @module Telemetry
 * @since 1.0.0
 */

import * as Schema from "effect/Schema"
import * as Effect from "effect/Effect"
import * as DateTime from "effect/DateTime"
import { FileSystem } from "@effect/platform"
import * as fs from "fs"

// =============================================================================
// Event Schemas
// =============================================================================

/**
 * Trigger source for agent spawn
 */
export const TriggerSource = Schema.Literal("explicit", "suggested", "auto")
export type TriggerSource = Schema.Schema.Type<typeof TriggerSource>

/**
 * Outcome of agent execution
 */
export const AgentOutcome = Schema.Literal("success", "partial", "failed")
export type AgentOutcome = Schema.Schema.Type<typeof AgentOutcome>

/**
 * Start event - emitted when a subagent is spawned
 */
export const AgentStartEvent = Schema.Struct({
  eventType: Schema.Literal("start"),
  timestamp: Schema.String, // ISO 8601 string for JSONL compatibility
  sessionId: Schema.String,
  agentType: Schema.String,
  triggeredBy: TriggerSource,
})
export type AgentStartEvent = Schema.Schema.Type<typeof AgentStartEvent>

/**
 * Stop event - emitted when a subagent completes
 */
export const AgentStopEvent = Schema.Struct({
  eventType: Schema.Literal("stop"),
  timestamp: Schema.String, // ISO 8601 string for JSONL compatibility
  sessionId: Schema.String,
  agentType: Schema.String,
  durationMs: Schema.Number,
  outcome: AgentOutcome,
})
export type AgentStopEvent = Schema.Schema.Type<typeof AgentStopEvent>

/**
 * Union of all telemetry events
 */
export const AgentUsageEvent = Schema.Union(AgentStartEvent, AgentStopEvent)
export type AgentUsageEvent = Schema.Schema.Type<typeof AgentUsageEvent>

// =============================================================================
// State Management
// =============================================================================

/**
 * Active agent tracking in hook state
 */
export interface ActiveAgent {
  readonly agentType: string
  readonly startTime: number
}

/**
 * Telemetry portion of hook state
 */
export interface TelemetryState {
  readonly activeAgents: Record<string, ActiveAgent>
}

/**
 * Full hook state structure (includes other hook data)
 */
export interface HookState {
  readonly lastCallMs?: number | null
  readonly skillIndex?: unknown
  readonly patternCache?: unknown
  readonly telemetry?: TelemetryState
}

/**
 * Get project directory from environment or fallback to cwd
 */
const getProjectDir = (): string => {
  return process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
}

/**
 * Get absolute path for hook state file
 */
const getHookStatePath = (): string => {
  const projectDir = getProjectDir()
  return `${projectDir}/.claude/.hook-state.json`
}

/**
 * Get absolute path for telemetry log
 */
const getTelemetryPath = (): string => {
  const projectDir = getProjectDir()
  return `${projectDir}/.claude/.telemetry/usage.jsonl`
}

/**
 * Get absolute path for telemetry directory
 */
const getTelemetryDir = (): string => {
  const projectDir = getProjectDir()
  return `${projectDir}/.claude/.telemetry`
}

/**
 * Read hook state from disk
 */
export const readHookState = (): HookState => {
  try {
    const content = fs.readFileSync(getHookStatePath(), "utf-8")
    return JSON.parse(content) as HookState
  } catch {
    return {}
  }
}

/**
 * Write hook state to disk
 */
export const writeHookState = (state: HookState): void => {
  try {
    fs.writeFileSync(getHookStatePath(), JSON.stringify(state, null, 2), "utf-8")
  } catch {
    // Silently fail - hooks should not break agent flow
  }
}

/**
 * Get current telemetry state
 */
export const getTelemetryState = (): TelemetryState => {
  const state = readHookState()
  return state.telemetry ?? { activeAgents: {} }
}

/**
 * Update telemetry state while preserving other hook state
 */
export const updateTelemetryState = (telemetry: TelemetryState): void => {
  const state = readHookState()
  writeHookState({ ...state, telemetry })
}

// =============================================================================
// Event Persistence
// =============================================================================

/**
 * Append an event to the telemetry log
 */
export const appendEvent = (event: AgentUsageEvent): Effect.Effect<void, never, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fsService = yield* FileSystem.FileSystem
    const line = JSON.stringify(event) + "\n"
    const telemetryDir = getTelemetryDir()
    const telemetryPath = getTelemetryPath()

    // Ensure directory exists
    const dirExists = yield* fsService.exists(telemetryDir)
    if (!dirExists) {
      yield* fsService.makeDirectory(telemetryDir, { recursive: true })
    }

    // Append to JSONL file
    yield* Effect.tryPromise({
      try: async () => {
        fs.appendFileSync(telemetryPath, line, "utf-8")
      },
      catch: () => new Error("Failed to append telemetry event"),
    }).pipe(Effect.catchAll(() => Effect.void))
  })

/**
 * Append an event synchronously (for use in simple hook scripts)
 */
export const appendEventSync = (event: AgentUsageEvent): void => {
  try {
    const telemetryDir = getTelemetryDir()
    const telemetryPath = getTelemetryPath()

    // Ensure directory exists
    if (!fs.existsSync(telemetryDir)) {
      fs.mkdirSync(telemetryDir, { recursive: true })
    }
    const line = JSON.stringify(event) + "\n"
    fs.appendFileSync(telemetryPath, line, "utf-8")
  } catch {
    // Silently fail - hooks should not break agent flow
  }
}

// =============================================================================
// Input Schemas
// =============================================================================

/**
 * PreToolUse Task input schema
 */
export const PreToolUseTaskInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.Literal("PreToolUse"),
  tool_name: Schema.Literal("Task"),
  tool_input: Schema.Struct({
    description: Schema.String,
    prompt: Schema.String,
    subagent_type: Schema.String,
    model: Schema.optional(Schema.String),
    run_in_background: Schema.optional(Schema.Boolean),
    resume: Schema.optional(Schema.String),
  }),
  tool_use_id: Schema.String,
})
export type PreToolUseTaskInput = Schema.Schema.Type<typeof PreToolUseTaskInput>

/**
 * SubagentStop input schema
 */
export const SubagentStopInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  permission_mode: Schema.String,
  hook_event_name: Schema.Literal("SubagentStop"),
  subagent_id: Schema.optional(Schema.String),
  tool_name: Schema.optional(Schema.String),
  tool_input: Schema.optional(
    Schema.Struct({
      subagent_type: Schema.optional(Schema.String),
    })
  ),
  tool_result: Schema.optional(
    Schema.Struct({
      success: Schema.optional(Schema.Boolean),
    })
  ),
})
export type SubagentStopInput = Schema.Schema.Type<typeof SubagentStopInput>

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get current ISO timestamp
 */
export const nowIso = (): string => new Date().toISOString()

/**
 * Get current timestamp in milliseconds
 */
export const nowMs = (): number => Date.now()

/**
 * Determine trigger source from context
 * Default to "auto" since we cannot reliably determine from hook input
 */
export const determineTrigger = (): TriggerSource => "auto"

/**
 * Determine outcome from tool result
 */
export const determineOutcome = (toolResult?: { success?: boolean }): AgentOutcome => {
  if (!toolResult) return "success" // Assume success if no result available
  if (toolResult.success === true) return "success"
  if (toolResult.success === false) return "failed"
  return "partial"
}
