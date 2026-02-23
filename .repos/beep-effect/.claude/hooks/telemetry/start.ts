#!/usr/bin/env bun
/**
 * Telemetry Start Hook - PreToolUse Handler
 *
 * Captures agent spawn events when Task tool is invoked.
 * Records: sessionId, agentType, timestamp
 * Stores startTime in hook state for duration calculation.
 *
 * Privacy: NEVER logs prompt content or task description.
 *
 * @module TelemetryStart
 * @since 1.0.0
 */

import { Effect, Console, pipe } from "effect"
import { Terminal } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import * as Schema from "effect/Schema"
import {
  PreToolUseTaskInput,
  AgentStartEvent,
  getTelemetryState,
  updateTelemetryState,
  appendEventSync,
  nowIso,
  nowMs,
  determineTrigger,
} from "./index"

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  // Read stdin
  const stdin = yield* terminal.readLine

  // Parse input - use a lenient schema first to check if this is a Task tool
  const rawInput = yield* Schema.decode(Schema.parseJson(Schema.Unknown))(stdin)

  // Type guard for basic structure check
  if (
    typeof rawInput !== "object" ||
    rawInput === null ||
    !("tool_name" in rawInput) ||
    (rawInput as { tool_name: unknown }).tool_name !== "Task"
  ) {
    // Not a Task tool invocation, skip silently
    return
  }

  // Parse the full Task input
  const input = yield* Schema.decode(Schema.parseJson(PreToolUseTaskInput))(stdin).pipe(
    Effect.catchAll(() => Effect.fail("parse-error" as const))
  )

  if (input === "parse-error") {
    // Could not parse Task input, skip silently
    return
  }

  const sessionId = input.session_id
  const agentType = input.tool_input.subagent_type
  const timestamp = nowIso()
  const startTime = nowMs()

  // Create start event
  const event: AgentStartEvent = {
    eventType: "start",
    timestamp,
    sessionId,
    agentType,
    triggeredBy: determineTrigger(),
  }

  // Persist event to JSONL
  appendEventSync(event)

  // Store in hook state for duration calculation on stop
  const telemetryState = getTelemetryState()
  updateTelemetryState({
    ...telemetryState,
    activeAgents: {
      ...telemetryState.activeAgents,
      [sessionId]: {
        agentType,
        startTime,
      },
    },
  })

  // Output nothing - this hook is silent
})

const runnable = pipe(
  program,
  Effect.provide(BunContext.layer),
  Effect.catchAll(() => Effect.void) // Never fail - hooks should not break agent flow
)

BunRuntime.runMain(runnable)
