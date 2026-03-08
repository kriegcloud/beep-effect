import { Effect, Layer, Stream } from "effect"
import * as LanguageModel from "effect/unstable/ai/LanguageModel"
import * as Response from "effect/unstable/ai/Response"

const DEFAULT_RESPONSE_TEXT = "stub assistant response"

const makeUsage = () =>
  new Response.Usage({
    inputTokens: {
      uncached: 24,
      total: 24,
      cacheRead: undefined,
      cacheWrite: undefined
    },
    outputTokens: {
      total: 8,
      text: 8,
      reasoning: undefined
    }
  })

const toResponseText = (options: unknown): string => {
  const maybeOptions = options as {
    readonly prompt?: {
      readonly content?: ReadonlyArray<{
        readonly role?: string
        readonly content?: ReadonlyArray<{ readonly type?: string; readonly text?: string }> | string
      }>
    }
  }

  const messages = maybeOptions.prompt?.content
  if (!Array.isArray(messages)) {
    return DEFAULT_RESPONSE_TEXT
  }

  const latestUser = [...messages]
    .reverse()
    .find((message) => message.role === "user")

  if (!latestUser || !Array.isArray(latestUser.content)) {
    return DEFAULT_RESPONSE_TEXT
  }

  const userText = latestUser.content
    .filter((part: { readonly type?: string; readonly text?: string }) =>
      part.type === "text" && typeof part.text === "string")
    .map((part: { readonly text?: string }) => part.text ?? "")
    .join(" ")
    .trim()

  if (userText.length === 0) {
    return DEFAULT_RESPONSE_TEXT
  }

  return `stub assistant response: ${userText.slice(0, 120)}`
}

export const makeDeterministicTestLanguageModel = (): LanguageModel.Service => ({
  generateText: (options: unknown) => {
    const text = toResponseText(options)
    const usage = makeUsage()

    const parts: Array<Response.Part<any>> = [
      Response.makePart("text", { text }),
      Response.makePart("finish", {
        reason: "stop",
        usage,
        response: undefined
      })
    ]

    return Effect.succeed(
      new LanguageModel.GenerateTextResponse(parts)
    ) as any
  },
  streamText: (options: unknown) => {
    const text = toResponseText(options)
    const usage = makeUsage()

    return Stream.make(
      Response.makePart("text-start", { id: "text:0" }),
      Response.makePart("text-delta", { id: "text:0", delta: text }),
      Response.makePart("text-end", { id: "text:0" }),
      Response.makePart("finish", {
        reason: "stop",
        usage,
        response: undefined
      })
    ) as any
  },
  generateObject: (_options: unknown) =>
    Effect.die(
      new Error("Deterministic test language model does not implement generateObject")
    ) as any
})

export const layer = Layer.succeed(
  LanguageModel.LanguageModel,
  makeDeterministicTestLanguageModel()
)
