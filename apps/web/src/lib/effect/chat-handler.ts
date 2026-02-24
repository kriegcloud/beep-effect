import { $I } from "@beep/identity/packages";
import {
  GraphFactsResultSchema,
  GraphLinkSchema,
  GraphNodeDetailsSchema,
  GraphNodeSchema,
  GraphSearchResultSchema,
} from "@beep/web/lib/effect/mappers";
import {
  GetFactsParametersSchema,
  GetNodeParametersSchema,
  KnowledgeGraphToolkit,
  SearchGraphParametersSchema,
} from "@beep/web/lib/effect/tools";
import { Effect, Match, pipe } from "effect";
import * as A from "effect/Array";
import * as Option from "effect/Option";
import * as Queue from "effect/Queue";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import { LanguageModel, Prompt, type Response, type Tool, type Toolkit } from "effect/unstable/ai";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

const $EffectId = $I.create("web").create("effect");
const $ChatHandlerId = $EffectId.create("chat-handler");
const $ChatErrorsId = $ChatHandlerId.create("errors");

export const MAX_TOOL_ITERATIONS = 3;

export const LegacyPatternDenyList = [
  "Context.Tag",
  "Context.GenericTag",
  "Effect.catchAll",
  "@effect/platform",
  "Schema.decode",
] as const;

export const CanonicalRegressionRules = [
  {
    query: "how do i create a tagged service?",
    mustContain: "ServiceMap.Service",
    mustNotContain: ["Context.GenericTag", "Context.Tag"] as const,
  },
  {
    query: "how do i catch errors?",
    mustContain: "Effect.catch",
    mustNotContain: ["Effect.catchAll"] as const,
  },
  {
    query: "where is filesystem?",
    mustContain: "main effect package",
    mustNotContain: ["@effect/platform"] as const,
  },
  {
    query: "schema decoding methods?",
    mustContain: "decodeUnknownEffect",
    mustNotContain: ["Schema.decode"] as const,
  },
  {
    query: "how do i create a layer?",
    mustContain: "Layer.effect",
    mustNotContain: ["Layer.scoped"] as const,
  },
] as const;

const SystemPromptLines = [
  "You are an Effect v4 knowledge assistant.",
  "Use the SearchGraph, GetNode, and GetFacts tools for factual grounding before answering.",
  "Always cite which graph facts or nodes support your answer.",
  "NEVER suggest v3 or invalid patterns: Context.Tag, Context.GenericTag, Effect.catchAll, @effect/platform, Schema.decode.",
  "Prefer Effect v4 APIs: ServiceMap.Service, Effect.catch, decodeUnknownEffect, Layer.effect, Layer.succeed.",
  "If graph facts are insufficient, say what is unknown instead of guessing.",
] as const;

export const SYSTEM_PROMPT = pipe(SystemPromptLines, A.join("\n"));

export const ChatMessageSchema = S.Struct({
  role: S.Literals(["user", "assistant"]),
  content: S.NonEmptyString,
}).annotate(
  $ChatHandlerId.annotate("ChatMessageSchema", {
    title: "Chat Message",
    description: "One chat message accepted by the chat API.",
  })
);

export type ChatMessage = typeof ChatMessageSchema.Type;

export const ChatRequestSchema = S.Struct({
  messages: S.NonEmptyArray(ChatMessageSchema),
}).annotate(
  $ChatHandlerId.annotate("ChatRequestSchema", {
    title: "Chat Request",
    description: "Input payload for POST /api/chat.",
  })
);

export type ChatRequest = typeof ChatRequestSchema.Type;

export const GraphSnippetSchema = S.Struct({
  nodes: S.Array(GraphNodeSchema),
  links: S.Array(GraphLinkSchema),
}).annotate(
  $ChatHandlerId.annotate("GraphSnippetSchema", {
    title: "Graph Snippet",
    description: "Graph nodes/links extracted from tool results for UI highlighting.",
  })
);

export type GraphSnippet = typeof GraphSnippetSchema.Type;

export class ChatRequestDecodeError extends S.TaggedErrorClass<ChatRequestDecodeError>(
  $ChatErrorsId`ChatRequestDecodeError`
)(
  "ChatRequestDecodeError",
  {
    message: S.String,
  },
  {
    title: "Chat Request Decode Error",
    description: "Incoming chat request body could not be decoded.",
  }
) {}

export class ChatStreamError extends S.TaggedErrorClass<ChatStreamError>($ChatErrorsId`ChatStreamError`)(
  "ChatStreamError",
  {
    message: S.String,
  },
  {
    title: "Chat Stream Error",
    description: "Chat stream execution failed.",
  }
) {}

export const ChatSseEventTypeSchema = S.Literals([
  "text",
  "tool-call",
  "tool-result",
  "graph-snippet",
  "done",
]).annotate(
  $ChatHandlerId.annotate("ChatSseEventTypeSchema", {
    title: "Chat SSE Event Type",
    description: "Event types produced by the streaming chat endpoint.",
  })
);

export type ChatSseEventType = typeof ChatSseEventTypeSchema.Type;

interface SseEnvelope {
  readonly event: ChatSseEventType;
  readonly data: unknown;
}

interface ToolCallInstruction {
  readonly id: string;
  readonly name: "SearchGraph" | "GetNode" | "GetFacts";
  readonly params: unknown;
}

type KnowledgeGraphTools = Toolkit.Tools<typeof KnowledgeGraphToolkit>;
type ChatStreamPart = Response.StreamPart<KnowledgeGraphTools>;
type ChatToolResultPart = Prompt.ToolMessagePart;

const decodeChatRequest = S.decodeUnknownEffect(ChatRequestSchema);
const decodeGraphSearchResult = S.decodeUnknownOption(GraphSearchResultSchema);
const decodeGraphNodeDetails = S.decodeUnknownOption(GraphNodeDetailsSchema);
const decodeGraphFactsResult = S.decodeUnknownOption(GraphFactsResultSchema);

const textEncoder = new TextEncoder();

export const encodeSseEnvelope = (envelope: SseEnvelope): Uint8Array =>
  textEncoder.encode(`event: ${envelope.event}\ndata: ${JSON.stringify(envelope.data)}\n\n`);

const offerSseEnvelope = Effect.fn("ChatHandler.offerSseEnvelope")(function* (
  queue: Queue.Enqueue<Uint8Array>,
  envelope: SseEnvelope
) {
  yield* Queue.offer(queue, encodeSseEnvelope(envelope));
});

const makeTextPromptPart = (text: string): Prompt.TextPart =>
  Prompt.makePart("text", {
    text,
  });

const makePromptMessage = (message: ChatMessage): Prompt.Message =>
  Match.value(message).pipe(
    Match.when({ role: "user" }, (value) =>
      Prompt.userMessage({
        content: [makeTextPromptPart(value.content)],
      })
    ),
    Match.when({ role: "assistant" }, (value) =>
      Prompt.assistantMessage({
        content: [makeTextPromptPart(value.content)],
      })
    ),
    Match.exhaustive
  );

export const makeChatPrompt = (request: ChatRequest): Prompt.Prompt =>
  pipe(
    request.messages,
    A.map(makePromptMessage),
    A.prepend(
      Prompt.systemMessage({
        content: SYSTEM_PROMPT,
      })
    ),
    Prompt.fromMessages
  );

const toKnownToolInstruction = (part: ChatStreamPart): Option.Option<ToolCallInstruction> =>
  Match.value(part).pipe(
    Match.when({ type: "tool-call", providerExecuted: true }, () => Option.none()),
    Match.when({ type: "tool-call", name: "SearchGraph" }, (value) =>
      Option.some<ToolCallInstruction>({
        id: value.id,
        name: "SearchGraph",
        params: value.params,
      })
    ),
    Match.when({ type: "tool-call", name: "GetNode" }, (value) =>
      Option.some<ToolCallInstruction>({
        id: value.id,
        name: "GetNode",
        params: value.params,
      })
    ),
    Match.when({ type: "tool-call", name: "GetFacts" }, (value) =>
      Option.some<ToolCallInstruction>({
        id: value.id,
        name: "GetFacts",
        params: value.params,
      })
    ),
    Match.orElse(() => Option.none())
  );

interface ToolExecutionEvent {
  readonly isFailure: boolean;
  readonly preliminary: boolean;
  readonly encodedResult: unknown;
  readonly result: unknown;
}

const toToolExecutionEvent = <T extends Tool.Any>(event: Tool.HandlerResult<T>): ToolExecutionEvent => ({
  isFailure: event.isFailure,
  preliminary: event.preliminary,
  encodedResult: event.encodedResult,
  result: event.result,
});

const toToolResultPart = (options: {
  readonly instruction: ToolCallInstruction;
  readonly event: ToolExecutionEvent;
}): ChatToolResultPart =>
  Prompt.makePart("tool-result", {
    id: options.instruction.id,
    name: options.instruction.name,
    isFailure: options.event.isFailure,
    result: options.event.encodedResult,
  });

const extractToolCalls = (parts: ReadonlyArray<ChatStreamPart>): ReadonlyArray<ToolCallInstruction> =>
  pipe(parts, A.map(toKnownToolInstruction), A.getSomes);

const extractFinishReason = (parts: ReadonlyArray<ChatStreamPart>): string =>
  pipe(
    parts,
    A.findLast((part) => part.type === "finish"),
    Option.match({
      onNone: () => "stop",
      onSome: (part) => part.reason,
    })
  );

export const extractGraphSnippet = (options: {
  readonly toolName: ToolCallInstruction["name"];
  readonly result: unknown;
}): Option.Option<GraphSnippet> =>
  Match.value(options.toolName).pipe(
    Match.when("SearchGraph", () =>
      pipe(
        decodeGraphSearchResult(options.result),
        Option.map((result) => ({
          nodes: result.nodes,
          links: result.links,
        }))
      )
    ),
    Match.when("GetNode", () =>
      pipe(
        decodeGraphNodeDetails(options.result),
        Option.map((result) => ({
          nodes: pipe(
            Option.fromNullishOr(result.node),
            Option.match({
              onNone: () => result.neighbors,
              onSome: (node) => pipe(result.neighbors, A.prepend(node)),
            }),
            A.dedupeWith((left, right) => left.id === right.id)
          ),
          links: result.links,
        }))
      )
    ),
    Match.when("GetFacts", () =>
      pipe(
        decodeGraphFactsResult(options.result),
        Option.map((result) => ({
          nodes: A.empty(),
          links: result.links,
        }))
      )
    ),
    Match.exhaustive
  );

const emitGraphSnippet = Effect.fn("ChatHandler.emitGraphSnippet")(function* (
  queue: Queue.Enqueue<Uint8Array>,
  instruction: ToolCallInstruction,
  result: unknown
) {
  const maybeSnippet = extractGraphSnippet({
    toolName: instruction.name,
    result,
  });

  yield* Option.match(maybeSnippet, {
    onNone: () => Effect.void,
    onSome: (snippet) =>
      offerSseEnvelope(queue, {
        event: "graph-snippet",
        data: snippet,
      }),
  });
});

const emitPartEvent = Effect.fn("ChatHandler.emitPartEvent")(function* (
  queue: Queue.Enqueue<Uint8Array>,
  part: ChatStreamPart
) {
  yield* Match.value(part).pipe(
    Match.when({ type: "text-delta" }, (textPart) =>
      offerSseEnvelope(queue, {
        event: "text",
        data: {
          id: textPart.id,
          delta: textPart.delta,
        },
      })
    ),
    Match.when({ type: "tool-call" }, (toolCallPart) =>
      offerSseEnvelope(queue, {
        event: "tool-call",
        data: {
          id: toolCallPart.id,
          name: toolCallPart.name,
          params: toolCallPart.params,
          providerExecuted: toolCallPart.providerExecuted,
        },
      })
    ),
    Match.orElse(() => Effect.void)
  );
});

const runModelRound = Effect.fn("ChatHandler.runModelRound")(function* (options: {
  readonly prompt: Prompt.Prompt;
  readonly queue: Queue.Enqueue<Uint8Array>;
}) {
  const partsRef = yield* Ref.make(A.empty<ChatStreamPart>());

  const stream = LanguageModel.streamText({
    prompt: options.prompt,
    toolkit: KnowledgeGraphToolkit,
    toolChoice: "auto",
    concurrency: 1,
    disableToolCallResolution: true,
  });

  yield* stream.pipe(
    Stream.runForEach(
      Effect.fn("ChatHandler.collectRoundPart")(function* (part: ChatStreamPart) {
        yield* Ref.update(partsRef, A.append(part));
        yield* emitPartEvent(options.queue, part);
      })
    ),
    Effect.mapError(
      (cause) =>
        new ChatStreamError({
          message: `LanguageModel.streamText failed: ${cause}`,
        })
    )
  );

  return yield* Ref.get(partsRef);
});

const loadToolStream = Effect.fn("ChatHandler.loadToolStream")(function* (options: {
  readonly toolkit: Toolkit.WithHandler<KnowledgeGraphTools>;
  readonly instruction: ToolCallInstruction;
}) {
  return yield* Match.value(options.instruction)
    .pipe(
      Match.when({ name: "SearchGraph" }, (instruction) =>
        S.decodeUnknownEffect(SearchGraphParametersSchema)(instruction.params).pipe(
          Effect.flatMap((params) => options.toolkit.handle("SearchGraph", params)),
          Effect.map(Stream.map(toToolExecutionEvent))
        )
      ),
      Match.when({ name: "GetNode" }, (instruction) =>
        S.decodeUnknownEffect(GetNodeParametersSchema)(instruction.params).pipe(
          Effect.flatMap((params) => options.toolkit.handle("GetNode", params)),
          Effect.map(Stream.map(toToolExecutionEvent))
        )
      ),
      Match.when({ name: "GetFacts" }, (instruction) =>
        S.decodeUnknownEffect(GetFactsParametersSchema)(instruction.params).pipe(
          Effect.flatMap((params) => options.toolkit.handle("GetFacts", params)),
          Effect.map(Stream.map(toToolExecutionEvent))
        )
      ),
      Match.exhaustive
    )
    .pipe(
      Effect.mapError(
        (cause) =>
          new ChatStreamError({
            message: `Tool dispatch failed: ${cause}`,
          })
      )
    );
});

const runToolCall = Effect.fn("ChatHandler.runToolCall")(function* (options: {
  readonly toolkit: Toolkit.WithHandler<KnowledgeGraphTools>;
  readonly instruction: ToolCallInstruction;
  readonly queue: Queue.Enqueue<Uint8Array>;
}) {
  const stream = yield* loadToolStream(options);

  const events = pipe(yield* Stream.runCollect(stream), A.fromIterable);

  yield* pipe(
    events,
    A.reduce(Effect.void, (effect, event) =>
      effect.pipe(
        Effect.andThen(
          offerSseEnvelope(options.queue, {
            event: "tool-result",
            data: {
              id: options.instruction.id,
              name: options.instruction.name,
              isFailure: event.isFailure,
              preliminary: event.preliminary,
              result: event.encodedResult,
            },
          })
        ),
        Effect.andThen(emitGraphSnippet(options.queue, options.instruction, event.result))
      )
    )
  );

  return pipe(
    events,
    A.findLast((event) => event.preliminary === false),
    Option.map((event) =>
      toToolResultPart({
        instruction: options.instruction,
        event,
      })
    )
  );
});

const runToolCalls = Effect.fn("ChatHandler.runToolCalls")(function* (options: {
  readonly queue: Queue.Enqueue<Uint8Array>;
  readonly instructions: ReadonlyArray<ToolCallInstruction>;
}) {
  const toolkit = yield* KnowledgeGraphToolkit;
  const maybeToolResults = yield* Effect.forEach(options.instructions, (instruction) =>
    runToolCall({
      toolkit,
      instruction,
      queue: options.queue,
    })
  );

  return pipe(maybeToolResults, A.getSomes);
});

interface RunRoundsOptions {
  readonly prompt: Prompt.Prompt;
  readonly queue: Queue.Enqueue<Uint8Array>;
  readonly remainingIterations: number;
}

let runRounds: (options: RunRoundsOptions) => Effect.Effect<void, unknown, unknown>;

runRounds = Effect.fn("ChatHandler.runRounds")(function* (options: RunRoundsOptions) {
  yield* Match.value(options.remainingIterations <= 0).pipe(
    Match.when(true, () =>
      offerSseEnvelope(options.queue, {
        event: "done",
        data: {
          reason: "tool-iteration-limit",
          maxIterations: MAX_TOOL_ITERATIONS,
        },
      })
    ),
    Match.orElse(() =>
      Effect.gen(function* () {
        const parts = yield* runModelRound({
          prompt: options.prompt,
          queue: options.queue,
        });

        const promptWithAssistant = Prompt.concat(options.prompt, Prompt.fromResponseParts(parts));
        const toolCalls = extractToolCalls(parts);

        return yield* Match.value(A.isReadonlyArrayNonEmpty(toolCalls)).pipe(
          Match.when(false, () =>
            offerSseEnvelope(options.queue, {
              event: "done",
              data: {
                reason: extractFinishReason(parts),
              },
            })
          ),
          Match.orElse(() =>
            Effect.gen(function* () {
              const toolResults = yield* runToolCalls({
                queue: options.queue,
                instructions: toolCalls,
              });

              const promptWithToolResults = Prompt.concat(
                promptWithAssistant,
                Prompt.fromMessages([
                  Prompt.toolMessage({
                    content: toolResults,
                  }),
                ])
              );

              return yield* runRounds({
                prompt: promptWithToolResults,
                queue: options.queue,
                remainingIterations: options.remainingIterations - 1,
              });
            })
          )
        );
      })
    )
  );
});

const emitDoneWithUnknownError = Effect.fn("ChatHandler.emitDoneWithUnknownError")(function* (
  queue: Queue.Enqueue<Uint8Array>
) {
  yield* offerSseEnvelope(queue, {
    event: "done",
    data: {
      reason: "error",
      message: "Chat stream failed",
    },
  });
});

export const createChatSseResponse = Effect.fn("ChatHandler.createChatSseResponse")(function* (request: ChatRequest) {
  const queue = yield* Queue.unbounded<Uint8Array>();

  const producer = runRounds({
    prompt: makeChatPrompt(request),
    queue,
    remainingIterations: MAX_TOOL_ITERATIONS,
  }).pipe(
    Effect.catch(() => emitDoneWithUnknownError(queue)),
    Effect.ensuring(Queue.shutdown(queue))
  );

  yield* Effect.forkScoped(producer);

  return HttpServerResponse.stream(Stream.fromQueue(queue), {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
});

export const decodeChatRequestUnknown = (input: unknown): Effect.Effect<ChatRequest, ChatRequestDecodeError> =>
  decodeChatRequest(input).pipe(
    Effect.mapError(
      (cause) =>
        new ChatRequestDecodeError({
          message: cause.message,
        })
    )
  );
