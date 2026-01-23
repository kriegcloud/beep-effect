import { $SharedAiId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { ReasoningEffort } from "./agent.ts";
import { ChatMessage } from "./message.ts";
import { ToolCall, ToolDefinition } from "./tools.ts";

const $I = $SharedAiId.create("models/chat");

export class ChatCompletionResponseUsage extends S.Class<ChatCompletionResponseUsage>($I`ChatCompletionResponseUsage`)(
  {
    promptTokens: S.NonNegativeInt,
    completionTokens: S.NonNegativeInt,
    totalTokens: S.NonNegativeInt,
  },
  $I.annotations("ChatCompletionResponseUsage", {
    description: "ChatCompletionResponseUsage",
  })
) {}

export class ChatCompletionResponse extends S.Class<ChatCompletionResponse>($I`ChatCompletionResponse`)(
  {
    id: S.String,
    model: S.String,
    content: S.String,
    toolCalls: S.optionalWith(S.Array(ToolCall), { as: "Option" }),
    usage: S.optionalWith(ChatCompletionResponseUsage, { as: "Option" }),
  },
  $I.annotations("ChatCompletionResponse", {
    description: "ChatCompletionResponse",
  })
) {}

export class ChatCompletionOptionsToolChoiceFunction extends S.TaggedClass<ChatCompletionOptionsToolChoiceFunction>(
  $I`ChatCompletionOptionsToolChoiceFunction`
)(
  "function",
  {
    function: S.Struct({
      name: S.String,
    }),
  },
  $I.annotations("ChatCompletionOptionsToolChoiceFunction", {
    description: "ChatCompletionOptionsToolChoiceFunction",
  })
) {}

export class ToolChoice extends S.Union(S.Literal("auto", "none"), ChatCompletionOptionsToolChoiceFunction).annotations(
  $I.annotations("ToolChoice", {
    description: "ToolChoice",
  })
) {}

export declare namespace ToolChoice {
  export type Type = typeof ToolChoice.Type;
  export type Encoded = typeof ToolChoice.Encoded;
}

export class ChatCompletionOptions extends S.Class<ChatCompletionOptions>($I`ChatCompletionOptions`)(
  {
    model: S.String,
    message: S.Array(ChatMessage),
    temperature: S.optionalWith(S.Number, { as: "Option" }),
    maxTokens: S.optionalWith(S.NonNegativeInt, { as: "Option" }),
    tools: S.optionalWith(S.Array(ToolDefinition), { as: "Option" }),
    toolChoice: S.optionalWith(ToolChoice, { as: "Option" }),
    reasoningEffort: S.optionalWith(ReasoningEffort, { as: "Option" }).pipe(S.fromKey("reasoning_effort")),
    stream: S.optionalWith(S.Boolean, { as: "Option" }).pipe(S.fromKey("stream")),
  },
  $I.annotations("ChatCompletionOptions", {
    description: "ChatCompletionOptions",
  })
) {}
