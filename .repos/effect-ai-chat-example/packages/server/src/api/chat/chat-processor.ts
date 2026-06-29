import type { ChatModel } from "@/db/chat-model.js";
import * as Chat from "@app/domain/api/chat-rpc";
import * as Array from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as PubSub from "effect/PubSub";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import * as LanguageModel from "effect/unstable/ai/LanguageModel";
import * as Prompt from "effect/unstable/ai/Prompt";
import type * as Response from "effect/unstable/ai/Response";
import { ChatMailbox, ChatToolkit } from "./chat-toolkit.js";

export class ChatProcessor extends Context.Service<ChatProcessor>()(
  "ChatProcessor",
  {
    make: Effect.succeed({
      run: Effect.fnUntraced(function*(
        chat: typeof ChatModel.Type,
        message: string,
      ) {
        const mailbox = yield* ChatMailbox;
        const toolkit = yield* ChatToolkit;

        const userMsg: typeof Chat.Message.Type = {
          role: "user",
          content: message,
        };

        const newMessages: Array<typeof Chat.Message.Type> = [];

        let cont = true;
        while (cont) {
          const result = yield* LanguageModel
            .streamText({
              prompt: makePrompt([...chat.messages, userMsg, ...newMessages]),
              toolkit,
            })
            .pipe(
              Stream.runFoldEffect(
                () => ({
                  finish: Option.none<Response.FinishReason>(),
                  assistantParts: Array.empty<Chat.MessagePart>(),
                  toolResults: Array.empty<{
                    type: "tool-result";
                    id: string;
                    name: Chat.ToolName;
                    result: typeof Schema.Json.Type;
                    isFailure: boolean;
                  }>(),
                }),
                Effect.fnUntraced(function*(acc, part) {
                  if (part.type === "text-delta") {
                    yield* PubSub.publish(mailbox, [
                      { _tag: "Chunk" as const, delta: part.delta },
                    ]);
                    const last = acc.assistantParts[acc.assistantParts.length - 1];
                    if (last?.type === "text") {
                      return {
                        ...acc,
                        assistantParts: [
                          ...acc.assistantParts.slice(0, -1),
                          { type: "text", text: last.text + part.delta },
                        ],
                      };
                    }
                    return {
                      ...acc,
                      assistantParts: [
                        ...acc.assistantParts,
                        { type: "text", text: part.delta },
                      ],
                    };
                  } else if (part.type === "reasoning-delta") {
                    yield* PubSub.publish(mailbox, [
                      {
                        _tag: "ReasoningChunk" as const,
                        delta: part.delta,
                      },
                    ]);
                    const last = acc.assistantParts[acc.assistantParts.length - 1];
                    if (last?.type === "reasoning") {
                      return {
                        ...acc,
                        assistantParts: [
                          ...acc.assistantParts.slice(0, -1),
                          { type: "reasoning", text: last.text + part.delta },
                        ],
                      };
                    }
                    return {
                      ...acc,
                      assistantParts: [
                        ...acc.assistantParts,
                        { type: "reasoning", text: part.delta },
                      ],
                    };
                  } else if (part.type === "tool-call") {
                    return {
                      ...acc,
                      assistantParts: [
                        ...acc.assistantParts,
                        {
                          type: "tool-call" as const,
                          id: part.id,
                          name: part.name,
                          params: part.params as typeof Schema.Json.Type,
                        },
                      ],
                    };
                  } else if (part.type === "tool-result") {
                    return {
                      ...acc,
                      toolResults: [
                        ...acc.toolResults,
                        {
                          type: "tool-result" as const,
                          id: part.id,
                          name: part.name,
                          result: part.result as typeof Schema.Json.Type,
                          isFailure: part.isFailure,
                        },
                      ],
                    };
                  } else if (part.type === "finish") {
                    return { ...acc, finish: Option.some(part.reason) };
                  }
                  return acc;
                }),
              ),
            );

          const firstAssistantPart = result.assistantParts[0];
          if (firstAssistantPart) {
            newMessages.push({
              role: "assistant",
              content: result.assistantParts.length === 1
                  && firstAssistantPart.type === "text"
                ? firstAssistantPart.text
                : result.assistantParts,
            });
          }

          if (result.toolResults.length > 0) {
            newMessages.push({ role: "tool", content: result.toolResults });
          }

          cont = result.finish.pipe(Option.exists((f) => f === "tool-calls"));
        }

        return newMessages as ReadonlyArray<typeof Chat.Message.Type>;
      }),
    }),
  },
) {
  static layer: Layer.Layer<ChatProcessor> = Layer.effect(this, this.make);
}

export const makePrompt = (
  messages: readonly (typeof Chat.Message.Type)[],
): Array<Prompt.MessageEncoded> => {
  const result: Array<Prompt.MessageEncoded> = [
    {
      role: "system",
      content:
        "You are a helpful assistant. You have access to tools for getting the current date/time, weather information, and random jokes. Use them when appropriate.",
    },
  ];
  for (const msg of messages) {
    if (msg.role === "user" && typeof msg.content === "string") {
      result.push({ role: "user", content: msg.content });
    } else if (msg.role === "user" && Array.isArray(msg.content)) {
      const parts: Array<Prompt.UserMessagePartEncoded> = [];
      for (const part of msg.content) {
        if (typeof part === "string") continue;
        if (part.type === "text") {
          parts.push({ type: "text", text: part.text });
        }
      }
      if (parts.length > 0) {
        result.push({ role: "user", content: parts });
      }
    } else if (msg.role === "assistant" && typeof msg.content === "string") {
      result.push({
        role: "assistant",
        content: [{ type: "text" as const, text: msg.content }],
      });
    } else if (msg.role === "assistant" && Array.isArray(msg.content)) {
      const parts: Array<Prompt.AssistantMessagePartEncoded> = [];
      for (const part of msg.content) {
        if (typeof part === "string") continue;
        if (part.type === "text") {
          parts.push({ type: "text", text: part.text });
        } else if (part.type === "reasoning") {
          parts.push({ type: "reasoning", text: part.text });
        } else if (part.type === "tool-call") {
          parts.push({
            type: "tool-call",
            id: part.id,
            name: part.name,
            params: part.params,
          });
        }
      }
      result.push({ role: "assistant", content: parts });
    } else if (msg.role === "tool" && Array.isArray(msg.content)) {
      const parts: Array<Prompt.ToolMessagePartEncoded> = [];
      for (const part of msg.content) {
        if (typeof part === "string") continue;
        if (part.type === "tool-result") {
          parts.push({
            type: "tool-result",
            id: part.id,
            name: part.name,
            result: part.result,
            isFailure: part.isFailure,
          });
        }
      }
      result.push({ role: "tool", content: parts });
    }
  }
  return result;
};
