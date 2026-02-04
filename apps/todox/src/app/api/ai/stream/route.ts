/**
 * SSE Streaming endpoint for AI text improvement.
 *
 * Provides Server-Sent Events streaming for progressive text generation
 * using TextImprovementService.
 *
 * @module todox/api/ai/stream
 */

import { serverRuntime } from "@beep/runtime-server";
import { LlmLive, TextImprovementService } from "@beep/todox/services/ai";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const RequestBody = S.Struct({
  text: S.String,
  instruction: S.String,
});

const TextImprovementLive = TextImprovementService.Default.pipe(Layer.provide(LlmLive));

export async function POST(request: NextRequest): Promise<Response> {
  const body: unknown = await request.json();
  const parseResult = S.decodeUnknownEither(RequestBody)(body);

  if (Either.isLeft(parseResult)) {
    return new Response(
      JSON.stringify({
        error: { code: "VALIDATION_ERROR", message: "Invalid request body" },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { text, instruction } = parseResult.right;
  const encoder = new TextEncoder();
  const responseStream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = responseStream.writable.getWriter();

  serverRuntime.runFork(
    Effect.gen(function* () {
      const service = yield* TextImprovementService;

      yield* service.improveTextStream(text, instruction).pipe(
        Stream.runForEach((delta) =>
          Effect.sync(() => {
            writer.write(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
          })
        )
      );

      yield* Effect.sync(() => {
        writer.write(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      });
    }).pipe(
      Effect.catchTag("TextImprovementError", (error) =>
        Effect.sync(() => {
          writer.write(
            encoder.encode(`data: ${JSON.stringify({ error: { code: error.code, message: error.message } })}\n\n`)
          );
        })
      ),
      Effect.ensuring(Effect.sync(() => writer.close())),
      Effect.provide(TextImprovementLive)
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
