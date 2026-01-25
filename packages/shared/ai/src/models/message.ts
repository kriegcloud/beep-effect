import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
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

const makeMessageKind = ChatMessageRole.toTagged("role").composer({
  content: S.String,
  name: S.optionalWith(S.String, { as: "Option" }),
  toolCallId: S.optionalWith(S.String, { as: "Option" }).pipe(S.fromKey("tool_call_id")).annotations({
    description: 'For role === "tool": the id of the tool call this message responds to',
  }),
  toolCalls: S.optionalWith(S.Array(ChatMessageToolCall), { as: "Option" }).pipe(S.fromKey("tool_calls")).annotations({
    description:
      'For role === "assistant": include tool calls emitted by the model so that\nsubsequent tool messages are valid according to the OpenAI API.\nFor Google/Gemini models, thought_signature must be preserved to maintain\nreasoning context across function calls.',
  }),
});

export class SystemChatMessage extends S.Class<SystemChatMessage>($I`SystemChatMessage`)(
  makeMessageKind.system({}),
  $I.annotations("SystemChatMessage", {
    description: "SystemChatMessage",
  })
) {}

export class AssistantChatMessage extends S.Class<AssistantChatMessage>($I`AssistantChatMessage`)(
  makeMessageKind.assistant({}),
  $I.annotations("AssistantChatMessage", {
    description: "AssistantChatMessage",
  })
) {}

export class ToolChatMessage extends S.Class<ToolChatMessage>($I`ToolChatMessage`)(
  makeMessageKind.tool({}),
  $I.annotations("ToolChatMessage", {
    description: "ToolChatMessage",
  })
) {}

export class UserChatMessage extends S.Class<UserChatMessage>($I`UserChatMessage`)(
  makeMessageKind.user({}),
  $I.annotations("UserChatMessage", {
    description: "UserChatMessage",
  })
) {}

export class ChatMessage extends S.Union(
  SystemChatMessage,
  AssistantChatMessage,
  UserChatMessage,
  ToolChatMessage
).annotations(
  $I.annotations("ChatMessage", {
    description: "ChatMessage",
  })
) {}

export declare namespace ChatMessage {
  export type Type = typeof ChatMessage.Type;
  export type Encoded = typeof ChatMessage.Encoded;
}

export class ConversationMessages extends S.NonEmptyArray(ChatMessage)
  .pipe(S.mutable)
  .annotations(
    $I.annotations("ConversationMessages", {
      description: "ConversationMessages",
    })
  ) {
  static readonly init = (msg: ChatMessage.Type): ConversationMessages.Type => A.make(msg);
}

export declare namespace ConversationMessages {
  export type Type = typeof ConversationMessages.Type;
  export type Encoded = typeof ConversationMessages.Encoded;
}
