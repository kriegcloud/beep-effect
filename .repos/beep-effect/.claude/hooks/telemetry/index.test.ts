/**
 * Telemetry Hook Tests
 *
 * Tests for event schemas, utility functions, and privacy compliance.
 *
 * @module Telemetry/Test
 */

import { describe } from "@beep/testkit"
import { live, strictEqual, assertTrue, assertFalse, deepStrictEqual } from "@beep/testkit"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as Either from "effect/Either"
import {
  AgentStartEvent,
  AgentStopEvent,
  AgentUsageEvent,
  TriggerSource,
  AgentOutcome,
  nowIso,
  nowMs,
  determineTrigger,
  determineOutcome,
} from "./index"

// =============================================================================
// Schema Validation Tests
// =============================================================================

describe("AgentStartEvent Schema", () => {
  live("decodes valid start event", () =>
    Effect.gen(function* () {
      const validEvent = {
        eventType: "start" as const,
        timestamp: "2024-01-15T10:30:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        triggeredBy: "explicit" as const,
      }

      const result = Schema.decodeUnknownEither(AgentStartEvent)(validEvent)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        strictEqual(result.right.eventType, "start")
        strictEqual(result.right.sessionId, "session-abc-123")
        strictEqual(result.right.agentType, "codebase-researcher")
        strictEqual(result.right.triggeredBy, "explicit")
      }
    })
  )

  live("decodes start event with suggested trigger", () =>
    Effect.gen(function* () {
      const validEvent = {
        eventType: "start" as const,
        timestamp: "2024-01-15T10:30:00.000Z",
        sessionId: "session-def-456",
        agentType: "effect-expert",
        triggeredBy: "suggested" as const,
      }

      const result = Schema.decodeUnknownEither(AgentStartEvent)(validEvent)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        strictEqual(result.right.triggeredBy, "suggested")
      }
    })
  )

  live("decodes start event with auto trigger", () =>
    Effect.gen(function* () {
      const validEvent = {
        eventType: "start" as const,
        timestamp: "2024-01-15T10:30:00.000Z",
        sessionId: "session-ghi-789",
        agentType: "test-writer",
        triggeredBy: "auto" as const,
      }

      const result = Schema.decodeUnknownEither(AgentStartEvent)(validEvent)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        strictEqual(result.right.triggeredBy, "auto")
      }
    })
  )

  live("rejects start event with invalid eventType", () =>
    Effect.gen(function* () {
      const invalidEvent = {
        eventType: "stop",
        timestamp: "2024-01-15T10:30:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        triggeredBy: "explicit",
      }

      const result = Schema.decodeUnknownEither(AgentStartEvent)(invalidEvent)
      assertTrue(Either.isLeft(result))
    })
  )

  live("rejects start event with missing sessionId", () =>
    Effect.gen(function* () {
      const invalidEvent = {
        eventType: "start",
        timestamp: "2024-01-15T10:30:00.000Z",
        agentType: "codebase-researcher",
        triggeredBy: "explicit",
      }

      const result = Schema.decodeUnknownEither(AgentStartEvent)(invalidEvent)
      assertTrue(Either.isLeft(result))
    })
  )

  live("rejects start event with invalid triggeredBy value", () =>
    Effect.gen(function* () {
      const invalidEvent = {
        eventType: "start",
        timestamp: "2024-01-15T10:30:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        triggeredBy: "manual",
      }

      const result = Schema.decodeUnknownEither(AgentStartEvent)(invalidEvent)
      assertTrue(Either.isLeft(result))
    })
  )
})

describe("AgentStopEvent Schema", () => {
  live("decodes valid stop event with success outcome", () =>
    Effect.gen(function* () {
      const validEvent = {
        eventType: "stop" as const,
        timestamp: "2024-01-15T10:35:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        durationMs: 300000,
        outcome: "success" as const,
      }

      const result = Schema.decodeUnknownEither(AgentStopEvent)(validEvent)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        strictEqual(result.right.eventType, "stop")
        strictEqual(result.right.durationMs, 300000)
        strictEqual(result.right.outcome, "success")
      }
    })
  )

  live("decodes stop event with partial outcome", () =>
    Effect.gen(function* () {
      const validEvent = {
        eventType: "stop" as const,
        timestamp: "2024-01-15T10:35:00.000Z",
        sessionId: "session-def-456",
        agentType: "test-writer",
        durationMs: 120000,
        outcome: "partial" as const,
      }

      const result = Schema.decodeUnknownEither(AgentStopEvent)(validEvent)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        strictEqual(result.right.outcome, "partial")
      }
    })
  )

  live("decodes stop event with failed outcome", () =>
    Effect.gen(function* () {
      const validEvent = {
        eventType: "stop" as const,
        timestamp: "2024-01-15T10:35:00.000Z",
        sessionId: "session-ghi-789",
        agentType: "effect-expert",
        durationMs: 5000,
        outcome: "failed" as const,
      }

      const result = Schema.decodeUnknownEither(AgentStopEvent)(validEvent)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        strictEqual(result.right.outcome, "failed")
      }
    })
  )

  live("rejects stop event with invalid eventType", () =>
    Effect.gen(function* () {
      const invalidEvent = {
        eventType: "start",
        timestamp: "2024-01-15T10:35:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        durationMs: 300000,
        outcome: "success",
      }

      const result = Schema.decodeUnknownEither(AgentStopEvent)(invalidEvent)
      assertTrue(Either.isLeft(result))
    })
  )

  live("rejects stop event with missing durationMs", () =>
    Effect.gen(function* () {
      const invalidEvent = {
        eventType: "stop",
        timestamp: "2024-01-15T10:35:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        outcome: "success",
      }

      const result = Schema.decodeUnknownEither(AgentStopEvent)(invalidEvent)
      assertTrue(Either.isLeft(result))
    })
  )

  live("rejects stop event with invalid outcome value", () =>
    Effect.gen(function* () {
      const invalidEvent = {
        eventType: "stop",
        timestamp: "2024-01-15T10:35:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        durationMs: 300000,
        outcome: "completed",
      }

      const result = Schema.decodeUnknownEither(AgentStopEvent)(invalidEvent)
      assertTrue(Either.isLeft(result))
    })
  )

  live("rejects stop event with string durationMs", () =>
    Effect.gen(function* () {
      const invalidEvent = {
        eventType: "stop",
        timestamp: "2024-01-15T10:35:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        durationMs: "300000",
        outcome: "success",
      }

      const result = Schema.decodeUnknownEither(AgentStopEvent)(invalidEvent)
      assertTrue(Either.isLeft(result))
    })
  )
})

describe("AgentUsageEvent Union Schema", () => {
  live("decodes start event through union", () =>
    Effect.gen(function* () {
      const startEvent = {
        eventType: "start" as const,
        timestamp: "2024-01-15T10:30:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        triggeredBy: "explicit" as const,
      }

      const result = Schema.decodeUnknownEither(AgentUsageEvent)(startEvent)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        strictEqual(result.right.eventType, "start")
      }
    })
  )

  live("decodes stop event through union", () =>
    Effect.gen(function* () {
      const stopEvent = {
        eventType: "stop" as const,
        timestamp: "2024-01-15T10:35:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        durationMs: 300000,
        outcome: "success" as const,
      }

      const result = Schema.decodeUnknownEither(AgentUsageEvent)(stopEvent)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        strictEqual(result.right.eventType, "stop")
      }
    })
  )

  live("rejects event with unknown eventType", () =>
    Effect.gen(function* () {
      const invalidEvent = {
        eventType: "pause",
        timestamp: "2024-01-15T10:35:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
      }

      const result = Schema.decodeUnknownEither(AgentUsageEvent)(invalidEvent)
      assertTrue(Either.isLeft(result))
    })
  )
})

describe("TriggerSource Schema", () => {
  live("decodes explicit trigger", () =>
    Effect.gen(function* () {
      const result = Schema.decodeUnknownEither(TriggerSource)("explicit")
      assertTrue(Either.isRight(result))
      if (Either.isRight(result)) {
        strictEqual(result.right, "explicit")
      }
    })
  )

  live("decodes suggested trigger", () =>
    Effect.gen(function* () {
      const result = Schema.decodeUnknownEither(TriggerSource)("suggested")
      assertTrue(Either.isRight(result))
      if (Either.isRight(result)) {
        strictEqual(result.right, "suggested")
      }
    })
  )

  live("decodes auto trigger", () =>
    Effect.gen(function* () {
      const result = Schema.decodeUnknownEither(TriggerSource)("auto")
      assertTrue(Either.isRight(result))
      if (Either.isRight(result)) {
        strictEqual(result.right, "auto")
      }
    })
  )

  live("rejects invalid trigger value", () =>
    Effect.gen(function* () {
      const result = Schema.decodeUnknownEither(TriggerSource)("manual")
      assertTrue(Either.isLeft(result))
    })
  )
})

describe("AgentOutcome Schema", () => {
  live("decodes success outcome", () =>
    Effect.gen(function* () {
      const result = Schema.decodeUnknownEither(AgentOutcome)("success")
      assertTrue(Either.isRight(result))
      if (Either.isRight(result)) {
        strictEqual(result.right, "success")
      }
    })
  )

  live("decodes partial outcome", () =>
    Effect.gen(function* () {
      const result = Schema.decodeUnknownEither(AgentOutcome)("partial")
      assertTrue(Either.isRight(result))
      if (Either.isRight(result)) {
        strictEqual(result.right, "partial")
      }
    })
  )

  live("decodes failed outcome", () =>
    Effect.gen(function* () {
      const result = Schema.decodeUnknownEither(AgentOutcome)("failed")
      assertTrue(Either.isRight(result))
      if (Either.isRight(result)) {
        strictEqual(result.right, "failed")
      }
    })
  )

  live("rejects invalid outcome value", () =>
    Effect.gen(function* () {
      const result = Schema.decodeUnknownEither(AgentOutcome)("completed")
      assertTrue(Either.isLeft(result))
    })
  )
})

// =============================================================================
// Utility Function Tests
// =============================================================================

describe("nowIso utility", () => {
  live("returns valid ISO 8601 timestamp", () =>
    Effect.gen(function* () {
      const timestamp = nowIso()

      assertTrue(typeof timestamp === "string")
      assertTrue(timestamp.length > 0)

      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      assertTrue(isoRegex.test(timestamp), `Expected ISO format, got: ${timestamp}`)
    })
  )

  live("returns timestamp close to current time", () =>
    Effect.gen(function* () {
      const before = Date.now()
      const timestamp = nowIso()
      const after = Date.now()

      const parsed = new Date(timestamp).getTime()
      assertTrue(parsed >= before)
      assertTrue(parsed <= after)
    })
  )
})

describe("nowMs utility", () => {
  live("returns number timestamp", () =>
    Effect.gen(function* () {
      const timestamp = nowMs()
      assertTrue(typeof timestamp === "number")
    })
  )

  live("returns reasonable timestamp value", () =>
    Effect.gen(function* () {
      const timestamp = nowMs()

      const year2020 = new Date("2020-01-01").getTime()
      const year2100 = new Date("2100-01-01").getTime()

      assertTrue(timestamp > year2020, "Timestamp should be after 2020")
      assertTrue(timestamp < year2100, "Timestamp should be before 2100")
    })
  )

  live("returns timestamp close to current time", () =>
    Effect.gen(function* () {
      const before = Date.now()
      const timestamp = nowMs()
      const after = Date.now()

      assertTrue(timestamp >= before)
      assertTrue(timestamp <= after)
    })
  )
})

describe("determineTrigger utility", () => {
  live("returns auto as default trigger source", () =>
    Effect.gen(function* () {
      const trigger = determineTrigger()
      strictEqual(trigger, "auto")
    })
  )

  live("return value is a valid TriggerSource", () =>
    Effect.gen(function* () {
      const trigger = determineTrigger()
      const result = Schema.decodeUnknownEither(TriggerSource)(trigger)
      assertTrue(Either.isRight(result))
    })
  )
})

describe("determineOutcome utility", () => {
  live("returns success when toolResult is undefined", () =>
    Effect.gen(function* () {
      const outcome = determineOutcome(undefined)
      strictEqual(outcome, "success")
    })
  )

  live("returns success when toolResult.success is true", () =>
    Effect.gen(function* () {
      const outcome = determineOutcome({ success: true })
      strictEqual(outcome, "success")
    })
  )

  live("returns failed when toolResult.success is false", () =>
    Effect.gen(function* () {
      const outcome = determineOutcome({ success: false })
      strictEqual(outcome, "failed")
    })
  )

  live("returns partial when toolResult.success is undefined", () =>
    Effect.gen(function* () {
      const outcome = determineOutcome({})
      strictEqual(outcome, "partial")
    })
  )

  live("returns partial when toolResult.success is null-like", () =>
    Effect.gen(function* () {
      const outcome = determineOutcome({ success: undefined })
      strictEqual(outcome, "partial")
    })
  )

  live("return value is always a valid AgentOutcome", () =>
    Effect.gen(function* () {
      const testCases = [
        undefined,
        {},
        { success: true },
        { success: false },
        { success: undefined },
      ]

      for (const testCase of testCases) {
        const outcome = determineOutcome(testCase)
        const result = Schema.decodeUnknownEither(AgentOutcome)(outcome)
        assertTrue(Either.isRight(result), `Invalid outcome for input: ${JSON.stringify(testCase)}`)
      }
    })
  )
})

// =============================================================================
// Privacy Compliance Tests
// =============================================================================

describe("Privacy Compliance", () => {
  live("AgentStartEvent schema does not accept promptContent field", () =>
    Effect.gen(function* () {
      const eventWithPrompt = {
        eventType: "start" as const,
        timestamp: "2024-01-15T10:30:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        triggeredBy: "explicit" as const,
        promptContent: "This is sensitive user prompt data",
      }

      const result = Schema.decodeUnknownEither(AgentStartEvent)(eventWithPrompt)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        const decoded = result.right
        assertFalse("promptContent" in decoded)
      }
    })
  )

  live("AgentStopEvent schema does not accept fileContents field", () =>
    Effect.gen(function* () {
      const eventWithFile = {
        eventType: "stop" as const,
        timestamp: "2024-01-15T10:35:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        durationMs: 300000,
        outcome: "success" as const,
        fileContents: "sensitive file data from /etc/passwd",
      }

      const result = Schema.decodeUnknownEither(AgentStopEvent)(eventWithFile)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        const decoded = result.right
        assertFalse("fileContents" in decoded)
      }
    })
  )

  live("AgentStartEvent only contains allowed fields", () =>
    Effect.gen(function* () {
      const validEvent = {
        eventType: "start" as const,
        timestamp: "2024-01-15T10:30:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        triggeredBy: "explicit" as const,
      }

      const result = Schema.decodeUnknownEither(AgentStartEvent)(validEvent)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        const decoded = result.right
        const keys = Object.keys(decoded)
        const allowedKeys = ["eventType", "timestamp", "sessionId", "agentType", "triggeredBy"]

        strictEqual(keys.length, allowedKeys.length)
        for (const key of keys) {
          assertTrue(allowedKeys.includes(key), `Unexpected key: ${key}`)
        }
      }
    })
  )

  live("AgentStopEvent only contains allowed fields", () =>
    Effect.gen(function* () {
      const validEvent = {
        eventType: "stop" as const,
        timestamp: "2024-01-15T10:35:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        durationMs: 300000,
        outcome: "success" as const,
      }

      const result = Schema.decodeUnknownEither(AgentStopEvent)(validEvent)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        const decoded = result.right
        const keys = Object.keys(decoded)
        const allowedKeys = ["eventType", "timestamp", "sessionId", "agentType", "durationMs", "outcome"]

        strictEqual(keys.length, allowedKeys.length)
        for (const key of keys) {
          assertTrue(allowedKeys.includes(key), `Unexpected key: ${key}`)
        }
      }
    })
  )

  live("events never contain user data even with extra fields in input", () =>
    Effect.gen(function* () {
      const eventWithSensitiveData = {
        eventType: "start" as const,
        timestamp: "2024-01-15T10:30:00.000Z",
        sessionId: "session-abc-123",
        agentType: "codebase-researcher",
        triggeredBy: "explicit" as const,
        userEmail: "user@example.com",
        filePath: "/home/user/secrets.txt",
        errorMessage: "Error at line 42 in /etc/passwd",
        stackTrace: "at processSecretFile (/app/secrets.js:10)",
      }

      const result = Schema.decodeUnknownEither(AgentStartEvent)(eventWithSensitiveData)
      assertTrue(Either.isRight(result))

      if (Either.isRight(result)) {
        const decoded = result.right
        assertFalse("userEmail" in decoded)
        assertFalse("filePath" in decoded)
        assertFalse("errorMessage" in decoded)
        assertFalse("stackTrace" in decoded)
      }
    })
  )

  live("constructed events match privacy-safe schema", () =>
    Effect.gen(function* () {
      const startEvent = {
        eventType: "start" as const,
        timestamp: nowIso(),
        sessionId: "test-session-id",
        agentType: "test-agent",
        triggeredBy: determineTrigger(),
      }

      const startResult = Schema.decodeUnknownEither(AgentStartEvent)(startEvent)
      assertTrue(Either.isRight(startResult))

      const stopEvent = {
        eventType: "stop" as const,
        timestamp: nowIso(),
        sessionId: "test-session-id",
        agentType: "test-agent",
        durationMs: nowMs() - (nowMs() - 1000),
        outcome: determineOutcome({ success: true }),
      }

      const stopResult = Schema.decodeUnknownEither(AgentStopEvent)(stopEvent)
      assertTrue(Either.isRight(stopResult))
    })
  )
})
