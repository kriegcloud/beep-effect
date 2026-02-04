import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Schema from "effect/Schema"
import * as S from "../src/Schema/index.js"

test("AgentInput decodes with required fields", () => {
  const input = {
    description: "short task",
    prompt: "do the thing",
    subagent_type: "builder"
  }
  const decoded = Effect.runSync(Schema.decodeUnknown(S.AgentInput)(input))
  expect(decoded.description).toBe("short task")
})

test("AgentInput rejects unknown fields", () => {
  const input = {
    description: "short task",
    prompt: "do the thing",
    subagent_type: "builder",
    extra: "nope"
  }
  const result = Effect.runSync(Effect.either(Schema.decodeUnknown(S.AgentInput)(input)))
  expect(Either.isLeft(result)).toBe(true)
})

test("SDKUserMessage preserves unknown fields", () => {
  const input = {
    type: "user",
    message: { content: "hi" },
    parent_tool_use_id: null,
    session_id: "session-1",
    extra_field: 123
  }
  const decoded = Effect.runSync(Schema.decodeUnknown(S.SDKUserMessage)(input)) as Record<string, unknown>
  expect(decoded.extra_field).toBe(123)
})

test("AskUserQuestionInput enforces question count", () => {
  const input = {
    questions: [],
    answers: {},
    metadata: {}
  }
  const result = Effect.runSync(Effect.either(Schema.decodeUnknown(S.AskUserQuestionInput)(input)))
  expect(Either.isLeft(result)).toBe(true)
})
