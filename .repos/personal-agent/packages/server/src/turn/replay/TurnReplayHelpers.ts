import { Option } from "effect"
import * as Prompt from "effect/unstable/ai/Prompt"
import { stableJsonStringify } from "../../json/CanonicalJson.js"
import {
  decodeJsonRecordOption,
  decodeUnknownJsonOrInput
} from "../../json/JsonStringCodecs.js"

export const parseReplayInputJson = (
  inputJson: string
): Option.Option<Record<string, unknown>> =>
  decodeJsonRecordOption(inputJson)

export const parseReplayOutputJson = (outputJson: string): unknown | string =>
  decodeUnknownJsonOrInput(outputJson)

export const findPendingToolCallIdForReplay = (
  history: Prompt.Prompt,
  params: {
    readonly toolName: string
    readonly input: Record<string, unknown>
  }
): Option.Option<string> => {
  const expectedInputJson = stableJsonStringify(params.input)
  const toolResultIds = new Set<string>()
  const toolCalls: Array<{
    readonly id: string
    readonly name: string
    readonly inputJson: string
  }> = []

  for (const message of history.content) {
    for (const rawPart of message.content) {
      if (typeof rawPart === "string") {
        continue
      }
      const part = rawPart
      if (part.type === "tool-result") {
        toolResultIds.add(part.id)
        continue
      }
      if (part.type === "tool-call") {
        toolCalls.push({
          id: part.id,
          name: part.name,
          inputJson: stableJsonStringify(part.params)
        })
      }
    }
  }

  const unresolvedCalls = toolCalls.filter((call) => !toolResultIds.has(call.id))
  const exactMatch = unresolvedCalls.filter((call) =>
    call.name === params.toolName && call.inputJson === expectedInputJson
  )
  if (exactMatch.length > 0) {
    return Option.some(exactMatch[exactMatch.length - 1]!.id)
  }

  const nameOnlyMatch = unresolvedCalls.filter((call) => call.name === params.toolName)
  if (nameOnlyMatch.length === 1) {
    return Option.some(nameOnlyMatch[0]!.id)
  }

  return Option.none()
}
