#!/usr/bin/env bun
/**
 * Telemetry Stop Hook - SubagentStop Handler
 *
 * Captures agent completion events when subagent finishes.
 * Records: sessionId, agentType, durationMs, outcome
 * Clears activeAgent from hook state.
 *
 * Privacy: NEVER logs output content or results.
 *
 * @module TelemetryStop
 * @since 1.0.0
 */

import { Effect, Console, pipe } from "effect"
import { Terminal } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import * as Schema from "effect/Schema"
import {
  SubagentStopInput,
  AgentStopEvent,
  getTelemetryState,
  updateTelemetryState,
  appendEventSync,
  nowIso,
  nowMs,
  determineOutcome,
} from "./index"

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  // Read stdin
  const stdin = yield* terminal.readLine

  // Parse input with lenient schema
  const input = yield* Schema.decode(Schema.parseJson(SubagentStopInput))(stdin).pipe(
    Effect.catchAll(() => Effect.fail("parse-error" as const))
  )

  if (input === "parse-error") {
    // Could not parse input, skip silently
    return
  }

  const sessionId = input.session_id
  const timestamp = nowIso()
  const endTime = nowMs()

  // Get active agent info from state
  const telemetryState = getTelemetryState()
  const activeAgent = telemetryState.activeAgents[sessionId]

  if (!activeAgent) {
    // No matching start event found, log a minimal stop event anyway
    const agentType = input.tool_input?.subagent_type ?? "unknown"
    const event: AgentStopEvent = {
      eventType: "stop",
      timestamp,
      sessionId,
      agentType,
      durationMs: 0, // Unknown duration
      outcome: determineOutcome(input.tool_result),
    }
    appendEventSync(event)
    return
  }

  // Calculate duration
  const durationMs = endTime - activeAgent.startTime

  // Create stop event
  const event: AgentStopEvent = {
    eventType: "stop",
    timestamp,
    sessionId,
    agentType: activeAgent.agentType,
    durationMs,
    outcome: determineOutcome(input.tool_result),
  }

  // Persist event to JSONL
  appendEventSync(event)

  // Remove from active agents
  const { [sessionId]: _, ...remainingAgents } = telemetryState.activeAgents
  updateTelemetryState({
    ...telemetryState,
    activeAgents: remainingAgents,
  })

  // Output nothing - this hook is silent
})

const runnable = pipe(
  program,
  Effect.provide(BunContext.layer),
  Effect.catchAll(() => Effect.void) // Never fail - hooks should not break agent flow
)

BunRuntime.runMain(runnable)
