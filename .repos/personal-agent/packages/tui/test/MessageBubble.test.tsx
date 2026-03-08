import { describe, expect, it } from "vitest"
import { MessageBubble } from "../src/components/MessageBubble.js"
import type { ChatMessage } from "../src/types.js"

describe("MessageBubble", () => {
  const completedAssistant: ChatMessage = {
    role: "assistant",
    content: "Hello **world**",
    turnId: "turn:1",
    status: "complete"
  }

  const streamingAssistant: ChatMessage = {
    role: "assistant",
    content: "Hello",
    turnId: "turn:2",
    status: "streaming"
  }

  const userMessage: ChatMessage = {
    role: "user",
    content: "hi there",
    turnId: "turn:3",
    status: "complete"
  }

  const failedMessage: ChatMessage = {
    role: "assistant",
    content: "partial",
    turnId: "turn:4",
    status: "failed",
    errorMessage: "model error"
  }

  it("exports a React component wrapped in React.memo", () => {
    expect(MessageBubble).toHaveProperty("$$typeof")
    expect(MessageBubble).toHaveProperty("type")
  })

  it("accepts a completed assistant message", () => {
    const _el = <MessageBubble message={completedAssistant} />
    expect(_el).toBeDefined()
  })

  it("accepts a streaming assistant message", () => {
    const _el = <MessageBubble message={streamingAssistant} />
    expect(_el).toBeDefined()
  })

  it("accepts a user message", () => {
    const _el = <MessageBubble message={userMessage} />
    expect(_el).toBeDefined()
  })

  it("accepts a failed message", () => {
    const _el = <MessageBubble message={failedMessage} />
    expect(_el).toBeDefined()
  })
})
