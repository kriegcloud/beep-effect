import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import * as Response from "effect/unstable/ai/Response"
import {
  decodeUsageFromJson,
  encodeFinishReason,
  encodePartsToContentBlocks,
  encodeUsageToJson
} from "../src/ai/ContentBlockCodec.js"

describe("ContentBlockCodec", () => {
  describe("encodePartsToContentBlocks", () => {
    it.effect("converts TextPart to TextBlock", () =>
      Effect.gen(function*() {
        const parts = [
          Response.makePart("text", { text: "hello" })
        ]
        const blocks = yield* encodePartsToContentBlocks(parts)
        expect(blocks).toEqual([
          { contentBlockType: "TextBlock", text: "hello" }
        ])
      }))

    it.effect("converts ToolCallPart to ToolUseBlock with JSON-encoded params", () =>
      Effect.gen(function*() {
        const parts = [
          Response.makePart("tool-call", {
            id: "call_1",
            name: "my_tool",
            params: { foo: 1 },
            providerExecuted: false
          })
        ]
        const blocks = yield* encodePartsToContentBlocks(parts)
        expect(blocks).toEqual([
          {
            contentBlockType: "ToolUseBlock",
            toolCallId: "call_1",
            toolName: "my_tool",
            inputJson: "{\"foo\":1}"
          }
        ])
      }))

    it.effect("converts ToolResultPart (success) to ToolResultBlock with isError: false", () =>
      Effect.gen(function*() {
        const parts = [
          Response.makePart("tool-result", {
            id: "call_1",
            name: "my_tool",
            isFailure: false,
            result: { text: "ok" },
            encodedResult: { text: "ok" },
            providerExecuted: false,
            preliminary: false
          })
        ]
        const blocks = yield* encodePartsToContentBlocks(parts)
        expect(blocks).toHaveLength(1)
        expect(blocks[0]).toMatchObject({
          contentBlockType: "ToolResultBlock",
          toolCallId: "call_1",
          toolName: "my_tool",
          isError: false
        })
        const outputJson = Schema.decodeUnknownSync(Schema.fromJsonString(Schema.Unknown))(
          (blocks[0] as any).outputJson
        )
        expect(outputJson).toEqual({ text: "ok" })
      }))

    it.effect("converts ToolResultPart (failure) to ToolResultBlock with isError: true", () =>
      Effect.gen(function*() {
        const parts = [
          Response.makePart("tool-result", {
            id: "call_2",
            name: "failing_tool",
            isFailure: true,
            result: { error: "boom" },
            encodedResult: { error: "boom" },
            providerExecuted: false,
            preliminary: false
          })
        ]
        const blocks = yield* encodePartsToContentBlocks(parts)
        expect(blocks).toHaveLength(1)
        expect(blocks[0]).toMatchObject({
          contentBlockType: "ToolResultBlock",
          toolCallId: "call_2",
          toolName: "failing_tool",
          isError: true
        })
      }))

    it.effect("converts FilePart (image) to ImageBlock with base64 source", () =>
      Effect.gen(function*() {
        const data = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
        const parts = [
          Response.makePart("file", {
            mediaType: "image/png",
            data
          })
        ]
        const blocks = yield* encodePartsToContentBlocks(parts)
        expect(blocks).toHaveLength(1)
        expect(blocks[0]).toMatchObject({
          contentBlockType: "ImageBlock",
          mediaType: "image/png",
          altText: null
        })
        expect((blocks[0] as any).source).toContain("base64,")
      }))

    it.effect("filters out non-content parts (finish, response-metadata, reasoning)", () =>
      Effect.gen(function*() {
        const parts = [
          Response.makePart("text", { text: "keep me" }),
          Response.makePart("finish", {
            reason: "stop",
            usage: new Response.Usage({
              inputTokens: { uncached: 5, total: 5, cacheRead: undefined, cacheWrite: undefined },
              outputTokens: { total: 3, text: 3, reasoning: undefined }
            }),
            response: undefined
          }),
          Response.makePart("reasoning", { text: "thinking..." }),
          Response.makePart("response-metadata", {
            id: "resp_1",
            modelId: "test",
            timestamp: undefined,
            request: undefined
          })
        ]
        const blocks = yield* encodePartsToContentBlocks(parts)
        expect(blocks).toEqual([
          { contentBlockType: "TextBlock", text: "keep me" }
        ])
      }))

    it.effect("filters out non-image file parts", () =>
      Effect.gen(function*() {
        const parts = [
          Response.makePart("file", {
            mediaType: "application/pdf",
            data: new Uint8Array([1, 2, 3])
          })
        ]
        const blocks = yield* encodePartsToContentBlocks(parts)
        expect(blocks).toEqual([])
      }))
  })

  describe("encodeUsageToJson / decodeUsageFromJson", () => {
    it.effect("round-trips Usage through JSON string", () =>
      Effect.gen(function*() {
        const usage = new Response.Usage({
          inputTokens: { uncached: 10, total: 10, cacheRead: undefined, cacheWrite: undefined },
          outputTokens: { total: 6, text: 6, reasoning: undefined }
        })
        const json = yield* encodeUsageToJson(usage)
        expect(typeof json).toBe("string")

        const parsed = Schema.decodeUnknownSync(Schema.fromJsonString(Schema.Unknown))(json) as any
        expect(parsed.inputTokens.total).toBe(10)
        expect(parsed.outputTokens.total).toBe(6)

        const decoded = yield* decodeUsageFromJson(json)
        expect(decoded).toMatchObject({
          inputTokens: { total: 10 },
          outputTokens: { total: 6 }
        })
      }))
  })

  describe("encodeFinishReason", () => {
    it("maps all FinishReason values to ModelFinishReason", () => {
      const reasons = [
        "stop",
        "length",
        "content-filter",
        "tool-calls",
        "error",
        "pause",
        "other",
        "unknown"
      ] as const

      for (const reason of reasons) {
        expect(encodeFinishReason(reason)).toBe(reason)
      }
    })
  })
})
