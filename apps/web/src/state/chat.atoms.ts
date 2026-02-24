import type { GraphNode } from "@beep/web/lib/effect/mappers";
import { applyGraphSnippetAtom, GraphSnippetSchema } from "@beep/web/state/graph.atoms";
import { Effect, Match, pipe } from "effect";
import * as A from "effect/Array";
import * as Option from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Atom } from "effect/unstable/reactivity";

export interface ToolResultTrace {
  readonly isFailure: boolean;
  readonly preliminary: boolean;
  readonly result: unknown;
}

export interface ToolCallTrace {
  readonly id: string;
  readonly name: string;
  readonly params: unknown;
  readonly results: ReadonlyArray<ToolResultTrace>;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly toolCalls: ReadonlyArray<ToolCallTrace>;
  readonly streaming: boolean;
}

const ChatApiMessageSchema = S.Struct({
  role: S.Literals(["user", "assistant"]),
  content: S.NonEmptyString,
});

type ChatApiMessage = typeof ChatApiMessageSchema.Type;

const ChatTextDeltaSchema = S.Struct({
  id: S.String,
  delta: S.String,
});

const ChatToolCallSchema = S.Struct({
  id: S.String,
  name: S.String,
  params: S.Unknown,
  providerExecuted: S.optionalKey(S.Boolean),
});

const ChatToolResultSchema = S.Struct({
  id: S.String,
  name: S.String,
  isFailure: S.Boolean,
  preliminary: S.Boolean,
  result: S.Unknown,
});

const ChatDoneSchema = S.Struct({
  reason: S.String,
  message: S.optionalKey(S.String),
});

const decodeChatTextDelta = S.decodeUnknownOption(ChatTextDeltaSchema);
const decodeChatToolCall = S.decodeUnknownOption(ChatToolCallSchema);
const decodeChatToolResult = S.decodeUnknownOption(ChatToolResultSchema);
const decodeChatDone = S.decodeUnknownOption(ChatDoneSchema);
const decodeChatApiMessage = S.decodeUnknownOption(ChatApiMessageSchema);
const decodeGraphSnippet = S.decodeUnknownOption(GraphSnippetSchema);

const makeMessageId = () => crypto.randomUUID();

const parseJsonUnknown = (input: string): Option.Option<unknown> =>
  Effect.runSync(
    Effect.try({
      try: () => JSON.parse(input) as unknown,
      catch: () => null,
    }).pipe(
      Effect.match({
        onFailure: () => Option.none(),
        onSuccess: Option.some,
      })
    )
  );

const toApiMessages = (messages: ReadonlyArray<ChatMessage>): ReadonlyArray<ChatApiMessage> =>
  pipe(
    messages,
    A.reduce(A.empty<ChatApiMessage>(), (accumulator, message) => {
      const content = Str.trim(message.content);
      return Match.value(Str.isNonEmpty(content)).pipe(
        Match.when(false, () => accumulator),
        Match.orElse(() =>
          pipe(
            decodeChatApiMessage({
              role: message.role,
              content,
            }),
            Option.match({
              onNone: () => accumulator,
              onSome: (decoded) => pipe(accumulator, A.append(decoded)),
            })
          )
        )
      );
    })
  );

const withNodeContext = (content: string, contextNode: Option.Option<GraphNode>): string =>
  pipe(
    contextNode,
    Option.match({
      onNone: () => content,
      onSome: (node) =>
        `${content}\n\n[Selected graph node]\nName: ${node.name}\nType: ${node.type}\nSummary: ${node.summary}`,
    })
  );

const updateAssistantMessage = (
  messages: ReadonlyArray<ChatMessage>,
  assistantMessageId: string,
  update: (message: ChatMessage) => ChatMessage
): ReadonlyArray<ChatMessage> =>
  pipe(
    messages,
    A.map((message) => (message.id === assistantMessageId && message.role === "assistant" ? update(message) : message))
  );

const markAssistantDone = (
  messages: ReadonlyArray<ChatMessage>,
  assistantMessageId: string
): ReadonlyArray<ChatMessage> =>
  updateAssistantMessage(messages, assistantMessageId, (message) => ({
    ...message,
    streaming: false,
  }));

const appendAssistantDelta = (
  messages: ReadonlyArray<ChatMessage>,
  assistantMessageId: string,
  delta: string
): ReadonlyArray<ChatMessage> =>
  updateAssistantMessage(messages, assistantMessageId, (message) => ({
    ...message,
    content: `${message.content}${delta}`,
  }));

const appendAssistantError = (
  messages: ReadonlyArray<ChatMessage>,
  assistantMessageId: string,
  error: string
): ReadonlyArray<ChatMessage> =>
  updateAssistantMessage(messages, assistantMessageId, (message) => ({
    ...message,
    content: pipe(Str.trim(message.content), (trimmed) =>
      Match.value(Str.isNonEmpty(trimmed)).pipe(
        Match.when(true, () => `${message.content}\n\n${error}`),
        Match.orElse(() => error)
      )
    ),
  }));

const appendToolCall = (
  messages: ReadonlyArray<ChatMessage>,
  assistantMessageId: string,
  event: typeof ChatToolCallSchema.Type
): ReadonlyArray<ChatMessage> =>
  updateAssistantMessage(messages, assistantMessageId, (message) => ({
    ...message,
    toolCalls: pipe(
      message.toolCalls,
      A.findFirst((trace) => trace.id === event.id),
      Option.match({
        onNone: () =>
          pipe(
            message.toolCalls,
            A.append({
              id: event.id,
              name: event.name,
              params: event.params,
              results: A.empty(),
            })
          ),
        onSome: () => message.toolCalls,
      })
    ),
  }));

const appendToolResult = (
  messages: ReadonlyArray<ChatMessage>,
  assistantMessageId: string,
  event: typeof ChatToolResultSchema.Type
): ReadonlyArray<ChatMessage> =>
  updateAssistantMessage(messages, assistantMessageId, (message) => ({
    ...message,
    toolCalls: pipe(
      message.toolCalls,
      A.map((trace) =>
        trace.id === event.id
          ? {
              ...trace,
              results: pipe(
                trace.results,
                A.append({
                  isFailure: event.isFailure,
                  preliminary: event.preliminary,
                  result: event.result,
                })
              ),
            }
          : trace
      )
    ),
  }));

const parseSseBlock = (block: string): Option.Option<{ readonly event: string; readonly data: string }> => {
  const lines = A.fromIterable(Str.linesIterator(block));

  const event = pipe(
    lines,
    A.findFirst((line) => Str.startsWith("event: ")(line)),
    Option.map(Str.slice(7))
  );

  const data = pipe(
    lines,
    A.findFirst((line) => Str.startsWith("data: ")(line)),
    Option.map(Str.slice(6))
  );

  return Option.all({ event, data });
};

const splitSseBuffer = (buffer: string): { readonly blocks: ReadonlyArray<string>; readonly remainder: string } => {
  const segments = Str.split("\n\n")(buffer);

  return Match.value(Str.endsWith("\n\n")(buffer)).pipe(
    Match.when(true, () => ({
      blocks: pipe(segments, A.filter(Str.isNonEmpty)),
      remainder: "",
    })),
    Match.orElse(() =>
      A.matchRight(segments, {
        onEmpty: () => ({
          blocks: A.empty<string>(),
          remainder: "",
        }),
        onNonEmpty: (head, tail) => ({
          blocks: pipe(head, A.filter(Str.isNonEmpty)),
          remainder: tail,
        }),
      })
    )
  );
};

const handleSseEvent = (options: {
  readonly event: string;
  readonly data: string;
  readonly assistantMessageId: string;
  readonly get: Atom.FnContext;
}): void => {
  const payload = parseJsonUnknown(options.data);

  Match.value(options.event).pipe(
    Match.when("text", () =>
      pipe(
        payload,
        Option.flatMap(decodeChatTextDelta),
        Option.match({
          onNone: () => undefined,
          onSome: (event) => {
            options.get.set(
              chatMessagesAtom,
              appendAssistantDelta(options.get(chatMessagesAtom), options.assistantMessageId, event.delta)
            );
            return undefined;
          },
        })
      )
    ),
    Match.when("tool-call", () =>
      pipe(
        payload,
        Option.flatMap(decodeChatToolCall),
        Option.match({
          onNone: () => undefined,
          onSome: (event) => {
            options.get.set(
              chatMessagesAtom,
              appendToolCall(options.get(chatMessagesAtom), options.assistantMessageId, event)
            );
            return undefined;
          },
        })
      )
    ),
    Match.when("tool-result", () =>
      pipe(
        payload,
        Option.flatMap(decodeChatToolResult),
        Option.match({
          onNone: () => undefined,
          onSome: (event) => {
            options.get.set(
              chatMessagesAtom,
              appendToolResult(options.get(chatMessagesAtom), options.assistantMessageId, event)
            );
            return undefined;
          },
        })
      )
    ),
    Match.when("graph-snippet", () =>
      pipe(
        payload,
        Option.flatMap(decodeGraphSnippet),
        Option.match({
          onNone: () => undefined,
          onSome: (snippet) => {
            options.get.set(chatLatestGraphSnippetAtom, Option.some(snippet));
            options.get.set(applyGraphSnippetAtom, snippet);
            return undefined;
          },
        })
      )
    ),
    Match.when("done", () =>
      pipe(
        payload,
        Option.flatMap(decodeChatDone),
        Option.match({
          onNone: () => undefined,
          onSome: () => {
            options.get.set(
              chatMessagesAtom,
              markAssistantDone(options.get(chatMessagesAtom), options.assistantMessageId)
            );
            return undefined;
          },
        })
      )
    ),
    Match.orElse(() => undefined)
  );
};

const streamChatResponse = Effect.fn("ChatState.streamChatResponse")(function* (options: {
  readonly get: Atom.FnContext;
  readonly messages: ReadonlyArray<ChatApiMessage>;
  readonly assistantMessageId: string;
}) {
  const response = yield* Effect.tryPromise({
    try: () =>
      fetch("/api/chat", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messages: options.messages,
        }),
      }),
    catch: (cause) => `Chat request failed: ${cause}`,
  });

  yield* Match.value(response.ok).pipe(
    Match.when(true, () => Effect.void),
    Match.orElse(() => Effect.fail(`Chat request failed with status ${response.status}`))
  );

  const reader = yield* pipe(
    Option.fromNullishOr(response.body),
    Option.match({
      onNone: () => Effect.fail("Chat stream was empty"),
      onSome: (stream) => Effect.succeed(stream.getReader()),
    })
  );

  const decoder = new TextDecoder();

  yield* Effect.tryPromise({
    try: async () => {
      let remainder = "";

      for (;;) {
        const next = await reader.read();
        if (next.done) {
          break;
        }

        remainder = `${remainder}${decoder.decode(next.value, { stream: true })}`;

        const parsed = splitSseBuffer(remainder);
        remainder = parsed.remainder;

        pipe(
          parsed.blocks,
          A.reduce(undefined, (_, block) => {
            pipe(
              parseSseBlock(block),
              Option.match({
                onNone: () => undefined,
                onSome: ({ event, data }) =>
                  handleSseEvent({
                    event,
                    data,
                    assistantMessageId: options.assistantMessageId,
                    get: options.get,
                  }),
              })
            );
            return undefined;
          })
        );
      }

      const finalChunk = decoder.decode();
      const trailing = `${remainder}${finalChunk}`;

      pipe(
        trailing,
        Str.split("\n\n"),
        A.filter(Str.isNonEmpty),
        A.reduce(undefined, (_, block) => {
          pipe(
            parseSseBlock(block),
            Option.match({
              onNone: () => undefined,
              onSome: ({ event, data }) =>
                handleSseEvent({
                  event,
                  data,
                  assistantMessageId: options.assistantMessageId,
                  get: options.get,
                }),
            })
          );
          return undefined;
        })
      );
    },
    catch: (cause) => `Chat stream failed: ${cause}`,
  });
});

export const chatInputAtom = Atom.make("");

export const chatMessagesAtom = Atom.make<ReadonlyArray<ChatMessage>>(A.empty());

export const chatContextNodeAtom = Atom.make<Option.Option<GraphNode>>(Option.none());

export const chatLatestGraphSnippetAtom = Atom.make<Option.Option<typeof GraphSnippetSchema.Type>>(Option.none());

export const sendChatMessageAtom = Atom.fn<{ readonly content: string }>()((input, get) => {
  const trimmed = Str.trim(input.content);

  return Match.value(Str.isNonEmpty(trimmed)).pipe(
    Match.when(false, () => Effect.fail("Message cannot be empty.")),
    Match.orElse(() => {
      const contextualContent = withNodeContext(trimmed, get(chatContextNodeAtom));

      const userMessage: ChatMessage = {
        id: makeMessageId(),
        role: "user",
        content: contextualContent,
        toolCalls: A.empty(),
        streaming: false,
      };

      const assistantMessage: ChatMessage = {
        id: makeMessageId(),
        role: "assistant",
        content: "",
        toolCalls: A.empty(),
        streaming: true,
      };

      const nextMessages = pipe(get(chatMessagesAtom), A.append(userMessage), A.append(assistantMessage));
      const requestMessages = toApiMessages(nextMessages);

      get.set(chatMessagesAtom, nextMessages);
      get.set(chatLatestGraphSnippetAtom, Option.none());

      return streamChatResponse({
        get,
        messages: requestMessages,
        assistantMessageId: assistantMessage.id,
      }).pipe(
        Effect.ensuring(
          Effect.sync(() => {
            get.set(chatMessagesAtom, markAssistantDone(get(chatMessagesAtom), assistantMessage.id));
            get.set(chatInputAtom, "");
          })
        ),
        Effect.catch((error) =>
          Effect.sync(() => {
            get.set(
              chatMessagesAtom,
              pipe(
                get(chatMessagesAtom),
                (messages) => appendAssistantError(messages, assistantMessage.id, `${String(error)}`),
                (messages) => markAssistantDone(messages, assistantMessage.id)
              )
            );
          }).pipe(Effect.andThen(Effect.fail(`${String(error)}`)))
        ),
        Effect.map(() => assistantMessage)
      );
    })
  );
});

export const clearChatContextNodeAtom = Atom.fn<void>()((_, get) =>
  Effect.sync(() => {
    get.set(chatContextNodeAtom, Option.none());
  })
);
