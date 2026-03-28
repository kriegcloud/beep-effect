import * as S from "@beep/ai-sdk/Schema/index";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";

test("AgentInput decodes with required fields", () => {
  const input = {
    description: "short task",
    prompt: "do the thing",
    subagent_type: "builder",
  };
  const decoded = Schema.decodeUnknownSync(S.AgentInput)(input);
  expect(decoded.description).toBe("short task");
});

test("AgentInput rejects unknown fields", () => {
  const input = {
    description: "short task",
    prompt: "do the thing",
    subagent_type: "builder",
    extra: "nope",
  };
  const result = Effect.runSync(Effect.result(Schema.decodeUnknownEffect(S.AgentInput)(input)));
  expect(Result.isFailure(result)).toBe(true);
});

test("SDKUserMessage preserves unknown fields", () => {
  const input = {
    type: "user",
    message: { role: "user", content: "hi" },
    parent_tool_use_id: null,
    session_id: "session-1",
    extra_field: 123,
  };
  const decoded = Schema.decodeUnknownSync(S.SDKUserMessage)(input);
  expect(Object.prototype.hasOwnProperty.call(decoded, "extra_field")).toBe(true);
});

test("AskUserQuestionInput enforces question count", () => {
  const input = {
    questions: [],
    answers: {},
    metadata: {},
  };
  const result = Effect.runSync(Effect.result(Schema.decodeUnknownEffect(S.AskUserQuestionInput)(input)));
  expect(Result.isFailure(result)).toBe(true);
});
