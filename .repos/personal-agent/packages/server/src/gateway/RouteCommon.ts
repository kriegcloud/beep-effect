import { Effect } from "effect"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
import type * as Stream from "effect/Stream"

export const extractPathParam = (inputUrl: string, index: number): string => {
  const url = new URL(inputUrl, "http://localhost")
  const parts = url.pathname.split("/").filter(Boolean)
  return parts[index] ?? ""
}

export const badRequest = (message: string) =>
  HttpServerResponse.json(
    {
      error: "BadRequest",
      message
    },
    { status: 400 }
  )

export const internalServerError = () =>
  HttpServerResponse.json(
    { error: "InternalServerError" },
    { status: 500 }
  )

export const sseStreamResponse = <E>(stream: Stream.Stream<Uint8Array, E, never>) =>
  HttpServerResponse.stream(stream, {
    contentType: "text/event-stream",
    headers: {
      "cache-control": "no-cache",
      connection: "keep-alive"
    }
  })

export const toInternalServerErrorResponse = <A>(effect: Effect.Effect<A>) =>
  effect.pipe(
    Effect.catchCause(() => internalServerError())
  )
