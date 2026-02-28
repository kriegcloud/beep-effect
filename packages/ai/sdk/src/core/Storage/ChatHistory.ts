import type { ServiceMap } from "effect";
import { Effect, Stream } from "effect";
import * as A from "effect/Array";
import type { QueryHandle } from "../Query.js";
import type { SDKMessage, SDKUserMessage } from "../Schema/Message.js";
import type { ChatEventSource } from "../Schema/Storage.js";
import { ChatHistoryStore } from "./ChatHistoryStore.js";

/**
 * @since 0.0.0
 */
export type RecorderOptions = {
  readonly sessionId?: string;
  readonly source?: ChatEventSource;
  readonly inputSource?: ChatEventSource;
  readonly recordInput?: boolean;
  readonly recordOutput?: boolean;
  readonly strict?: boolean;
};

const defaultOutputSource: ChatEventSource = "sdk";
const defaultInputSource: ChatEventSource = "external";

type ChatHistoryStoreService = ServiceMap.Service.Shape<typeof ChatHistoryStore>;

const recordMessage = (
  store: ChatHistoryStoreService,
  sessionId: string | undefined,
  message: SDKMessage,
  source: ChatEventSource,
  strict: boolean
) => {
  const resolvedSessionId = sessionId ?? message.session_id;
  const effect = store.appendMessage(resolvedSessionId, message, { source }).pipe(Effect.asVoid);
  return strict ? effect.pipe(Effect.orDie) : effect.pipe(Effect.catch(() => Effect.void));
};

const recordMessages = (
  store: ChatHistoryStoreService,
  sessionId: string | undefined,
  messages: ReadonlyArray<SDKMessage>,
  source: ChatEventSource,
  strict: boolean
) => {
  if (messages.length === 0) return Effect.void;
  const resolvedSessionId = sessionId ?? messages[0]?.session_id;
  if (!resolvedSessionId) return Effect.void;
  const effect = store.appendMessages(resolvedSessionId, messages, { source }).pipe(Effect.asVoid);
  return strict ? effect.pipe(Effect.orDie) : effect.pipe(Effect.catch(() => Effect.void));
};

/**
 * @since 0.0.0
 */
export const withRecorder = Effect.fn("ChatHistory.withRecorder")(function* (
  handle: QueryHandle,
  options: RecorderOptions
) {
  const store = yield* ChatHistoryStore;
  const sessionId = options.sessionId;
  const outputSource = options.source ?? defaultOutputSource;
  const inputSource = options.inputSource ?? defaultInputSource;
  const recordOutput = options.recordOutput ?? true;
  const recordInput = options.recordInput ?? false;
  const strict = options.strict ?? false;

  const stream = recordOutput
    ? handle.stream.pipe(Stream.tap((message) => recordMessage(store, sessionId, message, outputSource, strict)))
    : handle.stream;

  const send = recordInput
    ? Effect.fn("ChatHistory.withRecorder.send")((message: SDKUserMessage) =>
        handle.send(message).pipe(Effect.tap(() => recordMessage(store, sessionId, message, inputSource, strict)))
      )
    : handle.send;

  const sendAll = recordInput
    ? Effect.fn("ChatHistory.withRecorder.sendAll")((messages: Iterable<SDKUserMessage>) => {
        const batch = A.fromIterable(messages);
        return handle
          .sendAll(batch)
          .pipe(Effect.tap(() => recordMessages(store, sessionId, batch, inputSource, strict)));
      })
    : handle.sendAll;

  const sendForked = recordInput
    ? Effect.fn("ChatHistory.withRecorder.sendForked")((message: SDKUserMessage) =>
        Effect.forkScoped(send(message)).pipe(Effect.asVoid)
      )
    : handle.sendForked;

  return {
    ...handle,
    stream,
    send,
    sendAll,
    sendForked,
  };
});

/**
 * @since 0.0.0
 */
export const ChatHistory = {
  withRecorder,
};
