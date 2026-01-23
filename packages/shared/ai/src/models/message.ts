import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedAiId.create("models/message");

export class ChatMessageRole extends BS.StringLiteralKit("system", "user", "assistant", "tool").annotations(
  $I.annotations("ChatMessageRole", {
    description: "ChatMessageRole",
  })
) {}

export declare namespace ChatMessageRole {
  export type Type = typeof ChatMessageRole.Type;
}

export class ChatMessageToolCallFunction extends S.Class<ChatMessageToolCallFunction>($I`ChatMessageToolCallFunction`)(
  {
    name: S.String,
    arguments: S.String,
  },
  $I.annotations("ChatMessageToolCallFunction", {
    description: "ChatMessageToolCallFunction",
  })
) {}

export class ChatMessageToolCall extends S.Class<ChatMessageToolCall>($I`ChatMessageToolCall`)(
  {
    id: S.String,
    type: S.tag("function"),
    function: ChatMessageToolCallFunction,
    thoughtSignature: S.optionalWith(S.String, { as: "Option" }).pipe(S.fromKey("thought_signature")).annotations({
      description:
        "Google Gemini thought_signature - encrypted representation of model's internal reasoning. Must be preserved when present to maintain context.",
    }),
  },
  $I.annotations("ChatMessageToolCall", {
    description: "ChatMessageToolCall",
  })
) {}

export class ChatMessage extends S.Class<ChatMessage>($I`ChatMessage`)(
  {
    role: ChatMessageRole,
    content: S.String,
    name: S.optionalWith(S.String, { as: "Option" }),
    toolCallId: S.optionalWith(S.String, { as: "Option" }).pipe(S.fromKey("tool_call_id")).annotations({
      description: 'For role === "tool": the id of the tool call this message responds to',
    }),
    toolCalls: S.optionalWith(S.Array(ChatMessageToolCall), { as: "Option" })
      .pipe(S.fromKey("tool_calls"))
      .annotations({
        description:
          'For role === "assistant": include tool calls emitted by the model so that\nsubsequent tool messages are valid according to the OpenAI API.\nFor Google/Gemini models, thought_signature must be preserved to maintain\nreasoning context across function calls.',
      }),
  },
  $I.annotations("ChatMessage", {
    description: "ChatMessage",
  })
) {}

export class ConversationMessage extends S.NonEmptyArray(ChatMessage).annotations(
  $I.annotations("ConversationMessage", {
    description: "ConversationMessage",
  })
) {}

export declare namespace ConversationMessage {
  export type Type = typeof ConversationMessage.Type;
  export type Encoded = typeof ConversationMessage.Encoded;
}
