import { describe, expect, test } from "bun:test"
import * as LanguageModel from "@effect/ai/LanguageModel"
import * as Response from "@effect/ai/Response"
import { extractSubmitAnswer } from "../src/SubmitTool"

const makeResponse = (options: {
  readonly text?: string
  readonly toolCalls?: ReadonlyArray<{
    readonly name: string
    readonly params: unknown
  }>
}): LanguageModel.GenerateTextResponse<any> => {
  const parts: Array<Response.PartEncoded> = []

  if (options.text !== undefined) {
    parts.push(Response.makePart("text", { text: options.text }))
  }

  if (options.toolCalls !== undefined) {
    for (let index = 0; index < options.toolCalls.length; index += 1) {
      const toolCall = options.toolCalls[index]!
      parts.push(Response.makePart("tool-call", {
        id: `tool-call-${index}`,
        name: toolCall.name,
        params: toolCall.params,
        providerExecuted: false
      }))
    }
  }

  parts.push(Response.makePart("finish", {
    reason: "stop" as const,
    usage: new Response.Usage({
      inputTokens: undefined,
      outputTokens: undefined,
      totalTokens: undefined
    })
  }))

  return new LanguageModel.GenerateTextResponse<any>(parts as any)
}

describe("extractSubmitAnswer", () => {
  test("plain mode accepts SUBMIT answer payload", () => {
    const response = makeResponse({
      toolCalls: [{ name: "SUBMIT", params: { answer: "done" } }]
    })
    const extracted = extractSubmitAnswer(response, { outputMode: "plain" })
    expect(extracted).toEqual({
      _tag: "Found",
      value: { answer: "done", source: "answer" }
    })
  })

  test("plain mode accepts SUBMIT variable payload", () => {
    const response = makeResponse({
      toolCalls: [{ name: "SUBMIT", params: { variable: "finalAnswer" } }]
    })
    const extracted = extractSubmitAnswer(response, { outputMode: "plain" })
    expect(extracted).toEqual({
      _tag: "Found",
      value: { source: "variable", variable: "finalAnswer" }
    })
  })

  test("plain mode rejects SUBMIT value payload", () => {
    const response = makeResponse({
      toolCalls: [{ name: "SUBMIT", params: { value: { ok: true } } }]
    })
    const extracted = extractSubmitAnswer(response, { outputMode: "plain" })
    expect(extracted._tag).toBe("Invalid")
  })

  test("structured mode accepts SUBMIT value payload", () => {
    const response = makeResponse({
      toolCalls: [{ name: "SUBMIT", params: { value: { answer: 42 } } }]
    })
    const extracted = extractSubmitAnswer(response, { outputMode: "structured" })
    expect(extracted).toEqual({
      _tag: "Found",
      value: { source: "value", value: { answer: 42 } }
    })
  })

  test("structured mode accepts SUBMIT variable payload", () => {
    const response = makeResponse({
      toolCalls: [{ name: "SUBMIT", params: { variable: "finalValue" } }]
    })
    const extracted = extractSubmitAnswer(response, { outputMode: "structured" })
    expect(extracted).toEqual({
      _tag: "Found",
      value: { source: "variable", variable: "finalValue" }
    })
  })

  test("structured mode rejects SUBMIT answer payload", () => {
    const response = makeResponse({
      toolCalls: [{ name: "SUBMIT", params: { answer: "42" } }]
    })
    const extracted = extractSubmitAnswer(response, { outputMode: "structured" })
    expect(extracted._tag).toBe("Invalid")
  })

  test("rejects ambiguous payloads containing answer and value", () => {
    const response = makeResponse({
      toolCalls: [{ name: "SUBMIT", params: { answer: "42", value: 42 } }]
    })
    const extracted = extractSubmitAnswer(response, { outputMode: "plain" })
    expect(extracted._tag).toBe("Invalid")
  })

  test("rejects empty SUBMIT variable names", () => {
    const response = makeResponse({
      toolCalls: [{ name: "SUBMIT", params: { variable: "" } }]
    })
    const extracted = extractSubmitAnswer(response, { outputMode: "plain" })
    expect(extracted._tag).toBe("Invalid")
  })

  test("rejects multiple SUBMIT tool calls", () => {
    const response = makeResponse({
      toolCalls: [
        { name: "SUBMIT", params: { answer: "first" } },
        { name: "SUBMIT", params: { answer: "second" } }
      ]
    })
    const extracted = extractSubmitAnswer(response, { outputMode: "plain" })
    expect(extracted._tag).toBe("Invalid")
  })
})
