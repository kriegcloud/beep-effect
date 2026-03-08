import { Effect, Stream } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import { AgentRuntime } from "./AgentRuntime.js";
import { type RuntimeEntryOptions, runtimeLayer } from "./EntryPoint.js";
import * as QueryResult from "./QueryResult.js";
import type { SDKMessage, SDKResultSuccess } from "./Schema/Message.js";
import type { Options } from "./Schema/Options.js";

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> => P.isObject(value);

const toRecord = (value: unknown): Readonly<Record<string, unknown>> | undefined =>
  isRecord(value) ? value : undefined;

const extractTextFromContent = (content: unknown): ReadonlyArray<string> => {
  if (!A.isArray(content)) {
    return [];
  }

  const chunks: Array<string> = [];
  for (const item of content) {
    const record = toRecord(item);
    if (!record) {
      continue;
    }
    if (record.type !== "text") {
      continue;
    }
    const text = record.text;
    if (P.isString(text) && text.length > 0) {
      chunks.push(text);
    }
  }

  return chunks;
};

const extractTextFromStreamEvent = (event: unknown): ReadonlyArray<string> => {
  const record = toRecord(event);
  if (!record) {
    return [];
  }

  const topText = record.text;
  if (P.isString(topText) && topText.length > 0) {
    return [topText];
  }

  const delta = toRecord(record.delta);
  if (delta) {
    const deltaText = delta.text;
    if (P.isString(deltaText) && deltaText.length > 0) {
      return [deltaText];
    }
    const deltaContent = delta.content;
    if (P.isString(deltaContent) && deltaContent.length > 0) {
      return [deltaContent];
    }
  }

  const contentBlock = toRecord(record.content_block);
  if (contentBlock) {
    const text = contentBlock.text;
    if (P.isString(text) && text.length > 0) {
      return [text];
    }
  }

  const message = toRecord(record.message);
  if (message) {
    const fromMessage = extractTextFromContent(message.content);
    if (fromMessage.length > 0) {
      return fromMessage;
    }
  }

  return extractTextFromContent(record.content);
};

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const extractTextChunks = (message: SDKMessage): ReadonlyArray<string> => {
  if (message.type === "assistant") {
    const envelope = toRecord(message.message);
    return extractTextFromContent(envelope?.content);
  }

  if (message.type === "stream_event") {
    return extractTextFromStreamEvent(message.event);
  }

  return [];
};

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const extractResultText = (message: SDKMessage): string | undefined =>
  message.type === "result" && message.subtype === "success" ? message.result : undefined;

/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const toTextStream = <E>(stream: Stream.Stream<SDKMessage, E>) =>
  stream.pipe(
    Stream.mapAccum(
      () => false,
      (hasText, message) => {
        const chunks = extractTextChunks(message);
        if (chunks.length > 0) {
          const next: readonly [boolean, ReadonlyArray<string>] = [true, chunks];
          return next;
        }

        if (!hasText) {
          const resultText = extractResultText(message);
          if (resultText !== undefined && resultText.length > 0) {
            const next: readonly [boolean, ReadonlyArray<string>] = [true, [resultText]];
            return next;
          }
        }

        const next: readonly [boolean, ReadonlyArray<string>] = [hasText, []];
        return next;
      }
    )
  );

/**
 * @since 0.0.0
 * @category UseCase
 */
export const run = (prompt: string, options?: Options, entry?: RuntimeEntryOptions): Promise<SDKResultSuccess> =>
  Effect.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const runtime = yield* AgentRuntime;
        return yield* QueryResult.collectResultSuccess(runtime.stream(prompt, options));
      }).pipe(Effect.provide(runtimeLayer(entry)))
    )
  );

/**
 * @since 0.0.0
 * @category UseCase
 */
export const streamText = (prompt: string, options?: Options, entry?: RuntimeEntryOptions): AsyncIterable<string> =>
  (async function* () {
    const iterable = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const runtime = yield* AgentRuntime;
          const stream = toTextStream(runtime.stream(prompt, options));
          return yield* Stream.toAsyncIterableEffect(stream);
        }).pipe(Effect.provide(runtimeLayer(entry)))
      )
    );

    for await (const chunk of iterable) {
      yield chunk;
    }
  })();
