import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import { InboundAttachment, InboundMessage } from "../src/channel.js"

describe("InboundMessage", () => {
  it("decodes a minimal valid message", () => {
    const input = {
      channelId: "cli-1",
      userId: "user-42",
      text: "Hello, world!",
      timestamp: "2026-02-25T12:00:00Z",
      isGroup: false,
      attachments: [],
      metadata: {}
    }
    const result = Schema.decodeUnknownSync(InboundMessage)(input)
    expect(result.channelId).toBe("cli-1")
    expect(result.userId).toBe("user-42")
    expect(result.text).toBe("Hello, world!")
    expect(result.isGroup).toBe(false)
    expect(result.attachments).toEqual([])
    expect(result.userName).toBeUndefined()
    expect(result.threadId).toBeUndefined()
  })

  it("decodes a message with all optional fields", () => {
    const input = {
      channelId: "telegram-1",
      userId: "user-7",
      userName: "Alice",
      text: "Hi there",
      timestamp: "2026-02-25T14:30:00Z",
      threadId: "thread-99",
      isGroup: true,
      attachments: [
        {
          id: "att-1",
          name: "photo.png",
          mimeType: "image/png",
          size: 1024,
          url: "https://example.com/photo.png",
          kind: "image"
        }
      ],
      metadata: { source: "telegram", messageId: 12345 }
    }
    const result = Schema.decodeUnknownSync(InboundMessage)(input)
    expect(result.userName).toBe("Alice")
    expect(result.threadId).toBe("thread-99")
    expect(result.isGroup).toBe(true)
    expect(result.attachments).toHaveLength(1)
    expect(result.attachments[0].name).toBe("photo.png")
    expect(result.attachments[0].kind).toBe("image")
    expect(result.metadata).toEqual({ source: "telegram", messageId: 12345 })
  })

  it("rejects a message with missing required fields", () => {
    const input = { channelId: "cli-1" }
    expect(() => Schema.decodeUnknownSync(InboundMessage)(input)).toThrow()
  })

  it("rejects a message with an invalid timestamp", () => {
    const input = {
      channelId: "cli-1",
      userId: "user-42",
      text: "Hello",
      timestamp: "not-a-date",
      isGroup: false,
      attachments: [],
      metadata: {}
    }
    expect(() => Schema.decodeUnknownSync(InboundMessage)(input)).toThrow()
  })
})

describe("InboundAttachment", () => {
  it("decodes with no optional fields (empty object)", () => {
    const result = Schema.decodeUnknownSync(InboundAttachment)({})
    expect(result.id).toBeUndefined()
    expect(result.name).toBeUndefined()
    expect(result.mimeType).toBeUndefined()
    expect(result.size).toBeUndefined()
    expect(result.url).toBeUndefined()
    expect(result.kind).toBeUndefined()
  })

  it("decodes with all optional fields provided", () => {
    const input = {
      id: "att-1",
      name: "document.pdf",
      mimeType: "application/pdf",
      size: 2048,
      url: "https://example.com/document.pdf",
      kind: "file"
    }
    const result = Schema.decodeUnknownSync(InboundAttachment)(input)
    expect(result.id).toBe("att-1")
    expect(result.name).toBe("document.pdf")
    expect(result.mimeType).toBe("application/pdf")
    expect(result.size).toBe(2048)
    expect(result.url).toBe("https://example.com/document.pdf")
    expect(result.kind).toBe("file")
  })

  it("rejects an invalid kind value", () => {
    const input = { kind: "spreadsheet" }
    expect(() => Schema.decodeUnknownSync(InboundAttachment)(input)).toThrow()
  })
})
