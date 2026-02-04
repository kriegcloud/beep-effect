/**
 * Chat API route using Effect AI patterns.
 *
 * Provides streaming chat responses using @effect/ai LanguageModel.
 *
 * @module todox/api/chat
 */

import { serverRuntime } from "@beep/runtime-server";
import { LlmLive } from "@beep/todox/services/ai";
import { AiError, LanguageModel, Prompt } from "@effect/ai";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Match from "effect/Match";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import type { NextRequest } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT =
  "You generate markdown documents for users. Unless specified, this is a draft. Keep things shortish. Do not add any supplementary text, as everything you say will be placed into a document. If you're confused however, it's okay to ask a user for info. Responses must be either a chat response, or a document. Don't add bold styling to headings.";

const MessageRole = S.Union(S.Literal("user"), S.Literal("assistant"), S.Literal("system"));
type MessageRole = typeof MessageRole.Type;

const MessageSchema = S.Struct({
  role: MessageRole,
  content: S.String,
});

const RequestBody = S.Struct({
  messages: S.Array(MessageSchema),
});

const writeEvent = (writer: WritableStreamDefaultWriter<Uint8Array>, encoder: TextEncoder, data: unknown) =>
  Effect.sync(() => {
    writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  });

const mapAiErrorToMessage = (error: AiError.AiError): string =>
  Match.value(error).pipe(
    Match.tag("HttpRequestError", (e) => `Network error: ${e.message}`),
    Match.tag("HttpResponseError", (e) => `Server error: HTTP ${e.response.status}`),
    Match.tag("MalformedInput", (e) => `Invalid input: ${e.description ?? "Data validation failed"}`),
    Match.tag("MalformedOutput", (e) => `Invalid response: ${e.description ?? "Response parsing failed"}`),
    Match.tag("UnknownError", (e) => `Unexpected error: ${e.message}`),
    Match.exhaustive
  );

export async function POST(request: NextRequest): Promise<Response> {
  const body: unknown = await request.json();
  const parseResult = S.decodeUnknownEither(RequestBody)(body);

  if (Either.isLeft(parseResult)) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = parseResult.right;
  const encoder = new TextEncoder();
  const responseStream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = responseStream.writable.getWriter();

  const prompt = Prompt.make([
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ]);

  serverRuntime.runFork(
    Effect.gen(function* () {
      const model = yield* LanguageModel.LanguageModel;

      yield* model.streamText({ prompt }).pipe(
        Stream.runForEach((part) =>
          Match.value(part).pipe(
            Match.discriminator("type")("text-delta", ({ delta }) => writeEvent(writer, encoder, { delta })),
            Match.discriminator("type")("error", ({ error }) => {
              const message = AiError.isAiError(error) ? mapAiErrorToMessage(error) : String(error);
              return writeEvent(writer, encoder, { error: message });
            }),
            Match.orElse(() => Effect.void)
          )
        )
      );

      yield* writeEvent(writer, encoder, { done: true });
    }).pipe(
      Effect.catchTags({
        HttpRequestError: (e) =>
          Effect.gen(function* () {
            yield* Effect.logError("Chat API: Network error", { error: e.message });
            yield* writeEvent(writer, encoder, { error: mapAiErrorToMessage(e) });
          }),
        HttpResponseError: (e) =>
          Effect.gen(function* () {
            yield* Effect.logError("Chat API: Server error", { status: e.response.status });
            yield* writeEvent(writer, encoder, { error: mapAiErrorToMessage(e) });
          }),
        MalformedInput: (e) =>
          Effect.gen(function* () {
            yield* Effect.logError("Chat API: Malformed input", { description: e.description });
            yield* writeEvent(writer, encoder, { error: mapAiErrorToMessage(e) });
          }),
        MalformedOutput: (e) =>
          Effect.gen(function* () {
            yield* Effect.logError("Chat API: Malformed output", { description: e.description });
            yield* writeEvent(writer, encoder, { error: mapAiErrorToMessage(e) });
          }),
        UnknownError: (e) =>
          Effect.gen(function* () {
            yield* Effect.logError("Chat API: Unknown error", { message: e.message });
            yield* writeEvent(writer, encoder, { error: mapAiErrorToMessage(e) });
          }),
      }),
      Effect.ensuring(Effect.sync(() => writer.close())),
      Effect.provide(LlmLive)
    )
  );

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
