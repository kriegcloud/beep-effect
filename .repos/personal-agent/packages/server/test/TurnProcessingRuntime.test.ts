import { describe, expect, it } from "@effect/vitest"
import { DateTime } from "effect"
import { _test } from "../src/turn/TurnProcessingRuntime.js"
import {
  type ProcessTurnPayload,
  type ProcessTurnResult,
  TurnModelFailure,
  TurnPolicyDenied
} from "../src/turn/TurnProcessingWorkflow.js"

describe("TurnProcessingRuntime", () => {
  it("maps tool blocks into tool.result and tool.error events", () => {
    const input: ProcessTurnPayload = {
      turnId: "turn:test",
      sessionId: "session:test",
      conversationId: "conversation:test",
      agentId: "agent:test",
      userId: "user:test",
      channelId: "channel:test",
      content: "run tools",
      contentBlocks: [],
      createdAt: DateTime.fromDateUnsafe(new Date("2026-03-02T00:00:00.000Z")),
      inputTokens: 1
    }

    const result: ProcessTurnResult = {
      turnId: input.turnId,
      accepted: true,
      auditReasonCode: "turn_processing_accepted",
      assistantContent: "done",
      assistantContentBlocks: [
        {
          contentBlockType: "ToolUseBlock",
          toolCallId: "tc:ok",
          toolName: "search",
          inputJson: "{}"
        },
        {
          contentBlockType: "ToolResultBlock",
          toolCallId: "tc:ok",
          toolName: "search",
          outputJson: "{\"ok\":true}",
          isError: false
        },
        {
          contentBlockType: "ToolUseBlock",
          toolCallId: "tc:fail",
          toolName: "shell_execute",
          inputJson: "{\"cmd\":\"false\"}"
        },
        {
          contentBlockType: "ToolResultBlock",
          toolCallId: "tc:fail",
          toolName: "shell_execute",
          outputJson: "{\"ok\":false,\"errorCode\":\"InvalidReadRequest\",\"message\":\"offset must be a positive integer\"}",
          isError: false
        },
        {
          contentBlockType: "TextBlock",
          text: "done"
        }
      ],
      iterationsUsed: 2,
      toolCallsTotal: 2,
      iterationStats: [{
        iteration: 1,
        finishReason: "tool-calls",
        toolCallsThisIteration: 2,
        toolCallsTotal: 2
      }],
      modelFinishReason: "stop",
      modelUsageJson: "{}"
    }

    const events = _test.toSuccessEvents(input, result)

    expect(events.map((event) => event.type)).toEqual([
      "iteration.completed",
      "tool.call",
      "tool.result",
      "tool.call",
      "tool.error",
      "assistant.delta",
      "turn.completed"
    ])
    expect(events.map((event) => event.sequence)).toEqual([2, 3, 4, 5, 6, 7, 8])

    const successEvent = events.find((event) => event.type === "tool.result")
    expect(successEvent).toMatchObject({
      toolCallId: "tc:ok",
      toolName: "search",
      outputJson: "{\"ok\":true}",
      isError: false
    })

    const failureEvent = events.find((event) => event.type === "tool.error")
    expect(failureEvent).toMatchObject({
      toolCallId: "tc:fail",
      toolName: "shell_execute",
      outputJson: "{\"ok\":false,\"errorCode\":\"InvalidReadRequest\",\"message\":\"offset must be a positive integer\"}"
    })
  })

  it("maps typed turn failures into turn.failed events", () => {
    const input: ProcessTurnPayload = {
      turnId: "turn:failed",
      sessionId: "session:failed",
      conversationId: "conversation:failed",
      agentId: "agent:test",
      userId: "user:test",
      channelId: "channel:test",
      content: "hello",
      contentBlocks: [],
      createdAt: DateTime.fromDateUnsafe(new Date("2026-03-02T00:00:00.000Z")),
      inputTokens: 1
    }

    const policyDeniedEvent = _test.toFailedEvent(
      input,
      new TurnPolicyDenied({
        turnId: input.turnId,
        reason: "memory_access_denied"
      })
    )
    expect(policyDeniedEvent).toMatchObject({
      type: "turn.failed",
      sequence: 2,
      turnId: input.turnId,
      sessionId: input.sessionId,
      errorCode: "policy_denied",
      message: "memory_access_denied"
    })

    const checkpointMismatchEvent = _test.toFailedEvent(
      input,
      new TurnModelFailure({
        turnId: input.turnId,
        reason: "checkpoint_payload_mismatch"
      })
    )
    expect(checkpointMismatchEvent).toMatchObject({
      type: "turn.failed",
      sequence: 2,
      turnId: input.turnId,
      sessionId: input.sessionId,
      errorCode: "checkpoint_payload_mismatch",
      message: "checkpoint_payload_mismatch"
    })

    const unexpectedFailureEvent = _test.toFailedEvent(
      input,
      { message: "unexpected defect while streaming" }
    )
    expect(unexpectedFailureEvent).toMatchObject({
      type: "turn.failed",
      turnId: input.turnId,
      sessionId: input.sessionId
    })
    expect(unexpectedFailureEvent.message).toContain("unexpected defect while streaming")
  })
})
