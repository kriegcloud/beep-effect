import { describe, expect, it } from "@effect/vitest"
import { DateTime, Effect, Exit, Schema } from "effect"
import type { AgentId, ConversationId, MessageId, SessionId, TurnId } from "../src/ids.js"
import { ContentBlock, MessageRecord, type TurnRecord } from "../src/ports.js"

describe("conversation schemas", () => {
  it("decodes and encodes content block unions", () => {
    const decode = Schema.decodeUnknownSync(ContentBlock)

    const text = decode({
      contentBlockType: "TextBlock",
      text: "hello"
    })
    const toolUse = decode({
      contentBlockType: "ToolUseBlock",
      toolCallId: "call_1",
      toolName: "time.now",
      inputJson: "{}"
    })

    expect(text.contentBlockType).toBe("TextBlock")
    expect(toolUse.contentBlockType).toBe("ToolUseBlock")
  })

  it("requires message content and valid blocks", () => {
    const decode = Schema.decodeUnknownSync(MessageRecord)
    const message = decode({
      messageId: "message:1",
      role: "UserRole",
      content: "hello",
      contentBlocks: [{ contentBlockType: "TextBlock", text: "hello" }]
    })

    expect(message.content).toBe("hello")
    expect(message.contentBlocks).toHaveLength(1)
  })

  it("rejects invalid block discriminators", () => {
    const decode = Schema.decodeUnknownEffect(ContentBlock)
    const result = Effect.runSyncExit(
      decode({
        contentBlockType: "UnknownBlock",
        text: "x"
      })
    )

    expect(Exit.isFailure(result)).toBe(true)
  })

  it("turn record shape can include structured message", () => {
    const turn: TurnRecord = {
      turnId: "turn:1" as TurnId,
      sessionId: "session:1" as SessionId,
      conversationId: "conversation:1" as ConversationId,
      turnIndex: 0,
      participantRole: "UserRole",
      participantAgentId: "agent:1" as AgentId,
      message: {
        messageId: "message:1" as MessageId,
        role: "UserRole",
        content: "hello",
        contentBlocks: [{ contentBlockType: "TextBlock", text: "hello" }]
      },
      modelFinishReason: null,
      modelUsageJson: null,
      createdAt: DateTime.fromDateUnsafe(new Date("2026-02-24T12:00:00.000Z"))
    }

    expect(turn.message.content).toBe("hello")
  })
})
