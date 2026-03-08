import { describe, expect, it } from "vitest"
import { formatToolInput, formatToolOutput } from "../src/formatters/toolSummary.js"
import type { ToolEvent } from "../src/types.js"

// Test the formatting logic that ToolCallInline will use — the component
// itself is React/JSX so we test the data transformation, not rendering.

describe("ToolCallInline formatting", () => {
  const makeEvent = (overrides: Partial<ToolEvent>): ToolEvent => ({
    turnId: "t1",
    toolCallId: "tc1",
    toolName: "file_read",
    inputJson: '{"path":"/src/foo.ts"}',
    outputJson: null,
    isError: false,
    status: "called",
    ...overrides
  })

  it("in-flight tool shows name + input summary", () => {
    const event = makeEvent({})
    const input = formatToolInput(event.toolName, event.inputJson)
    expect(input).toBe("/src/foo.ts")
  })

  it("completed tool shows output summary", () => {
    const event = makeEvent({
      status: "completed",
      outputJson: '{"content":"hello world"}'
    })
    const output = formatToolOutput(event.toolName, event.outputJson, event.isError)
    expect(output).toBe("11 chars")
  })

  it("error tool shows error summary", () => {
    const event = makeEvent({
      status: "completed",
      isError: true,
      outputJson: '{"errorCode":"NOT_FOUND","message":"File not found"}'
    })
    const output = formatToolOutput(event.toolName, event.outputJson, event.isError)
    expect(output).toBe("ERR: NOT_FOUND: File not found")
  })
})
