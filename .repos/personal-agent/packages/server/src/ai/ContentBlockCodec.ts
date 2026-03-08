import type { ContentBlock } from "@template/domain/ports"
import type { ModelFinishReason } from "@template/domain/status"
import { Effect, Schema } from "effect"
import type * as Response from "effect/unstable/ai/Response"
import { decodeUnknownJsonEffect, encodeUnknownJsonEffect } from "../json/JsonStringCodecs.js"

const encodeUnknownJson = encodeUnknownJsonEffect

export const encodePartsToContentBlocks = (
  parts: ReadonlyArray<Response.Part<any>>
): Effect.Effect<ReadonlyArray<ContentBlock>, Schema.SchemaError> =>
  Effect.gen(function*() {
    const blocks: Array<ContentBlock> = []

    for (const part of parts) {
      switch (part.type) {
        case "text": {
          blocks.push({
            contentBlockType: "TextBlock",
            text: part.text
          })
          break
        }
        case "tool-call": {
          blocks.push({
            contentBlockType: "ToolUseBlock",
            toolCallId: part.id,
            toolName: part.name,
            inputJson: yield* encodeUnknownJson(part.params)
          })
          break
        }
        case "tool-result": {
          blocks.push({
            contentBlockType: "ToolResultBlock",
            toolCallId: part.id,
            toolName: part.name,
            outputJson: yield* encodeUnknownJson(part.result),
            isError: part.isFailure
          })
          break
        }
        case "file": {
          if (part.mediaType.startsWith("image/")) {
            blocks.push({
              contentBlockType: "ImageBlock",
              mediaType: part.mediaType,
              source: toImageSource(part.data),
              altText: null
            })
          }
          break
        }
        default:
          break
      }
    }

    return blocks
  })

export const encodeUsageToJson = (
  usage: Response.Usage
): Effect.Effect<string, Schema.SchemaError> => encodeUnknownJson(usage)

export const decodeUsageFromJson = (
  json: string
): Effect.Effect<unknown, Schema.SchemaError> => decodeUnknownJsonEffect(json)

export const encodeFinishReason = (
  reason: Response.FinishReason
): ModelFinishReason => reason as ModelFinishReason

const toImageSource = (data: Uint8Array): string =>
  `data:application/octet-stream;base64,${Buffer.from(data).toString("base64")}`
