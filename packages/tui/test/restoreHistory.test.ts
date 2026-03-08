import { AtomRegistry } from "effect/unstable/reactivity"
import { describe, expect, it } from "vitest"
import { messagesAtom, toolEventsAtom } from "../src/atoms/session.js"
import { applyRestoredHistory, restoreHistory } from "../src/state/restoreHistory.js"

describe("restoreHistory", () => {
  it("returns empty for non-array input", () => {
    expect(restoreHistory(null)).toEqual({ messages: [], toolEvents: [] })
    expect(restoreHistory(undefined)).toEqual({ messages: [], toolEvents: [] })
    expect(restoreHistory("string")).toEqual({ messages: [], toolEvents: [] })
    expect(restoreHistory(42)).toEqual({ messages: [], toolEvents: [] })
  })

  it("returns empty for empty array", () => {
    expect(restoreHistory([])).toEqual({ messages: [], toolEvents: [] })
  })

  it("skips entries without turnId", () => {
    const result = restoreHistory([{ participantRole: "UserRole", message: { content: "hi" } }])
    expect(result.messages).toHaveLength(0)
  })

  it("restores UserRole as user message", () => {
    const result = restoreHistory([
      {
        participantRole: "UserRole",
        turnId: "t1",
        message: {
          content: "hello",
          contentBlocks: [{ contentBlockType: "TextBlock", text: "hello" }]
        }
      }
    ])
    expect(result.messages).toHaveLength(1)
    expect(result.messages[0]).toMatchObject({
      role: "user",
      content: "hello",
      turnId: "t1",
      status: "complete"
    })
  })

  it("restores AssistantRole as assistant message using TextBlock", () => {
    const result = restoreHistory([
      {
        participantRole: "AssistantRole",
        turnId: "t2",
        message: {
          content: "fallback",
          contentBlocks: [{ contentBlockType: "TextBlock", text: "from blocks" }]
        }
      }
    ])
    expect(result.messages).toHaveLength(1)
    expect(result.messages[0]).toMatchObject({
      role: "assistant",
      content: "from blocks",
      turnId: "t2"
    })
  })

  it("falls back to message.content when no TextBlock", () => {
    const result = restoreHistory([
      {
        participantRole: "AssistantRole",
        turnId: "t2",
        message: { content: "fallback text", contentBlocks: [] }
      }
    ])
    expect(result.messages[0]!.content).toBe("fallback text")
  })

  it("extracts ToolUseBlock from AssistantRole into toolEvents", () => {
    const result = restoreHistory([
      {
        participantRole: "AssistantRole",
        turnId: "t3",
        message: {
          content: "",
          contentBlocks: [
            { contentBlockType: "TextBlock", text: "Let me check." },
            {
              contentBlockType: "ToolUseBlock",
              toolCallId: "tc1",
              toolName: "file_read",
              inputJson: '{"path":"/tmp/f.txt"}'
            }
          ]
        }
      }
    ])
    expect(result.toolEvents).toHaveLength(1)
    expect(result.toolEvents[0]).toMatchObject({
      turnId: "t3",
      toolCallId: "tc1",
      toolName: "file_read",
      inputJson: '{"path":"/tmp/f.txt"}',
      outputJson: null,
      isError: false,
      status: "called"
    })
  })

  it("ToolRole does NOT produce a ChatMessage", () => {
    const result = restoreHistory([
      {
        participantRole: "ToolRole",
        turnId: "t4",
        message: {
          content: "tool output",
          contentBlocks: [
            {
              contentBlockType: "ToolResultBlock",
              toolCallId: "tc1",
              toolName: "file_read",
              outputJson: '{"content":"hello"}',
              isError: false
            }
          ]
        }
      }
    ])
    expect(result.messages).toHaveLength(0)
  })

  it("pairs ToolUseBlock and ToolResultBlock by toolCallId", () => {
    const result = restoreHistory([
      {
        participantRole: "AssistantRole",
        turnId: "t3",
        message: {
          content: "",
          contentBlocks: [
            {
              contentBlockType: "ToolUseBlock",
              toolCallId: "tc1",
              toolName: "file_read",
              inputJson: '{"path":"/tmp"}'
            }
          ]
        }
      },
      {
        participantRole: "ToolRole",
        turnId: "t4",
        message: {
          content: "",
          contentBlocks: [
            {
              contentBlockType: "ToolResultBlock",
              toolCallId: "tc1",
              toolName: "file_read",
              outputJson: '{"content":"data"}',
              isError: false
            }
          ]
        }
      }
    ])

    expect(result.toolEvents).toHaveLength(1)
    expect(result.toolEvents[0]).toMatchObject({
      turnId: "t3",
      toolCallId: "tc1",
      toolName: "file_read",
      inputJson: '{"path":"/tmp"}',
      outputJson: '{"content":"data"}',
      isError: false,
      status: "completed"
    })
  })

  it("handles orphan ToolResultBlock (no matching ToolUseBlock)", () => {
    const result = restoreHistory([
      {
        participantRole: "ToolRole",
        turnId: "t5",
        message: {
          content: "",
          contentBlocks: [
            {
              contentBlockType: "ToolResultBlock",
              toolCallId: "orphan1",
              toolName: "shell_execute",
              outputJson: '{"exitCode":0}',
              isError: false
            }
          ]
        }
      }
    ])
    expect(result.toolEvents).toHaveLength(1)
    expect(result.toolEvents[0]).toMatchObject({
      toolCallId: "orphan1",
      toolName: "shell_execute",
      status: "completed"
    })
  })

  it("propagates isError from ToolResultBlock", () => {
    const result = restoreHistory([
      {
        participantRole: "AssistantRole",
        turnId: "t6",
        message: {
          content: "",
          contentBlocks: [
            { contentBlockType: "ToolUseBlock", toolCallId: "tc2", toolName: "file_read", inputJson: "{}" }
          ]
        }
      },
      {
        participantRole: "ToolRole",
        turnId: "t7",
        message: {
          content: "",
          contentBlocks: [
            {
              contentBlockType: "ToolResultBlock",
              toolCallId: "tc2",
              toolName: "file_read",
              outputJson: '{"errorCode":"NOT_FOUND"}',
              isError: true
            }
          ]
        }
      }
    ])
    expect(result.toolEvents[0]!.isError).toBe(true)
  })

  it("handles multiple tool calls in a single assistant turn", () => {
    const result = restoreHistory([
      {
        participantRole: "AssistantRole",
        turnId: "t8",
        message: {
          content: "",
          contentBlocks: [
            { contentBlockType: "ToolUseBlock", toolCallId: "tc_a", toolName: "file_read", inputJson: '{"path":"a"}' },
            { contentBlockType: "ToolUseBlock", toolCallId: "tc_b", toolName: "file_write", inputJson: '{"path":"b"}' }
          ]
        }
      },
      {
        participantRole: "ToolRole",
        turnId: "t9",
        message: {
          content: "",
          contentBlocks: [
            { contentBlockType: "ToolResultBlock", toolCallId: "tc_a", toolName: "file_read", outputJson: '{"content":"x"}', isError: false },
            { contentBlockType: "ToolResultBlock", toolCallId: "tc_b", toolName: "file_write", outputJson: '{"bytesWritten":5}', isError: false }
          ]
        }
      }
    ])

    expect(result.toolEvents).toHaveLength(2)
    expect(result.toolEvents[0]!.toolCallId).toBe("tc_a")
    expect(result.toolEvents[0]!.status).toBe("completed")
    expect(result.toolEvents[1]!.toolCallId).toBe("tc_b")
    expect(result.toolEvents[1]!.status).toBe("completed")
  })

  it("handles malformed contentBlocks gracefully", () => {
    const result = restoreHistory([
      {
        participantRole: "AssistantRole",
        turnId: "t10",
        message: {
          content: "fallback",
          contentBlocks: [{ contentBlockType: "ToolUseBlock" }] // missing toolCallId/toolName
        }
      }
    ])
    expect(result.messages).toHaveLength(1)
    expect(result.messages[0]!.content).toBe("fallback")
    expect(result.toolEvents).toHaveLength(0)
  })
})

describe("applyRestoredHistory", () => {
  it("sets both messagesAtom and toolEventsAtom", () => {
    const registry = AtomRegistry.make()
    const history = restoreHistory([
      {
        participantRole: "UserRole",
        turnId: "t1",
        message: { content: "hi", contentBlocks: [{ contentBlockType: "TextBlock", text: "hi" }] }
      },
      {
        participantRole: "AssistantRole",
        turnId: "t2",
        message: {
          content: "",
          contentBlocks: [
            { contentBlockType: "TextBlock", text: "ok" },
            { contentBlockType: "ToolUseBlock", toolCallId: "tc1", toolName: "time_now", inputJson: "{}" }
          ]
        }
      },
      {
        participantRole: "ToolRole",
        turnId: "t3",
        message: {
          content: "",
          contentBlocks: [
            { contentBlockType: "ToolResultBlock", toolCallId: "tc1", toolName: "time_now", outputJson: '{"nowIso":"2025-01-01T00:00:00Z"}', isError: false }
          ]
        }
      }
    ])

    applyRestoredHistory(registry, history)

    expect(registry.get(messagesAtom)).toHaveLength(2)
    expect(registry.get(messagesAtom)[0]!.role).toBe("user")
    expect(registry.get(messagesAtom)[1]!.role).toBe("assistant")
    expect(registry.get(toolEventsAtom)).toHaveLength(1)
    expect(registry.get(toolEventsAtom)[0]!.status).toBe("completed")
  })
})
