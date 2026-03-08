/**
 * WebSocket transport routes for the WebChat channel adapter.
 *
 * Transport contract:
 *   GET /ws/chat/:channelId
 *
 * Protocol:
 *   1. Server sends: {"type":"connected"}
 *   2. Client sends: {"type":"init","agentId":"agent:bootstrap","userId":"user:web:anon","attachTo":{"sessionId":"session:shared"}}
 *   3. Server sends: {"type":"initialized"}
 *   4. Client sends: {"type":"message","content":"hello","threadId":"optional"}
 *   5. Server streams: turn events as JSON frames
 */
import { AiProviderName } from "@template/domain/config"
import { Cause, Effect, Option, Schema, Stream } from "effect"
import * as HttpRouter from "effect/unstable/http/HttpRouter"
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
import type * as Socket from "effect/unstable/socket/Socket"
import { WebChatAdapterEntity } from "../entities/WebChatAdapterEntity.js"
import { encodeTurnEventJson, withFailedTurnEvent } from "./TurnStreamTransport.js"

// ---------------------------------------------------------------------------
// Frame Schemas
// ---------------------------------------------------------------------------

const InitFrameSchema = Schema.Struct({
  type: Schema.Literal("init"),
  agentId: Schema.optional(Schema.String),
  userId: Schema.optional(Schema.String),
  attachTo: Schema.optional(Schema.Struct({
    sessionId: Schema.String
  }))
})

const MessageFrameSchema = Schema.Struct({
  type: Schema.Literal("message"),
  content: Schema.String,
  threadId: Schema.optional(Schema.String),
  model: Schema.optional(Schema.Struct({
    provider: AiProviderName,
    modelId: Schema.String
  })),
  generationConfig: Schema.optional(Schema.Struct({
    temperature: Schema.optionalKey(Schema.Number),
    maxOutputTokens: Schema.optionalKey(Schema.Number),
    topP: Schema.optionalKey(Schema.Number)
  }))
})

const ClientFrameSchema = Schema.Union([InitFrameSchema, MessageFrameSchema])

const ConnectedFrame = Schema.Struct({ type: Schema.Literal("connected") })
const InitializedFrame = Schema.Struct({ type: Schema.Literal("initialized") })
const ErrorFrameSchema = Schema.Struct({
  type: Schema.Literal("error"),
  code: Schema.String,
  message: Schema.String
})

// ---------------------------------------------------------------------------
// Codecs
// ---------------------------------------------------------------------------

const decodeClientFrame = Schema.decodeUnknownOption(Schema.fromJsonString(ClientFrameSchema))
const encodeConnected = Schema.encodeSync(Schema.fromJsonString(ConnectedFrame))
const encodeInitialized = Schema.encodeSync(Schema.fromJsonString(InitializedFrame))
const encodeErrorFrame = Schema.encodeSync(Schema.fromJsonString(ErrorFrameSchema))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** @internal — exported for testing */
export const extractChannelId = (url: string): string => {
  const parsed = new URL(url, "http://localhost")
  const parts = parsed.pathname.split("/").filter(Boolean)
  // /ws/chat/:channelId → parts = ["ws", "chat", "<channelId>"]
  return parts[2] ?? ""
}

/**
 * Frame types that the client can send over the WebSocket.
 */
interface InitFrame {
  readonly type: "init"
  readonly agentId: string
  readonly userId: string
  readonly attachTo: {
    readonly sessionId: string
  } | undefined
}

interface MessageFrame {
  readonly type: "message"
  readonly content: string
  readonly threadId: string | undefined
  readonly model: { readonly provider: "anthropic" | "openai" | "openrouter" | "google"; readonly modelId: string } | undefined
  readonly generationConfig: {
    readonly temperature?: number
    readonly maxOutputTokens?: number
    readonly topP?: number
  } | undefined
}

export type ClientFrame = InitFrame | MessageFrame

/** @internal — exported for testing */
export const parseFrame = (data: string | Uint8Array): ClientFrame | null => {
  const text = typeof data === "string" ? data : new TextDecoder().decode(data)
  const result = decodeClientFrame(text)
  if (Option.isNone(result)) return null
  const frame = result.value
  if (frame.type === "init") {
    return {
      type: "init" as const,
      agentId: frame.agentId ?? "agent:bootstrap",
      userId: frame.userId ?? "user:web:anon",
      attachTo: frame.attachTo
    }
  }
  return {
    type: "message" as const,
    content: frame.content,
    threadId: frame.threadId,
    model: frame.model,
    generationConfig: frame.generationConfig
  }
}

/** @internal — exported for testing. Transport-level errors only (not message processing). */
export const errorFrame = (code: string, message: string): string =>
  encodeErrorFrame({ type: "error" as const, code, message })

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

const wsChat = HttpRouter.add(
  "GET",
  "/ws/chat/:channelId",
  (_request) =>
    Effect.gen(function*() {
      const serverRequest = yield* HttpServerRequest.HttpServerRequest
      const channelId = extractChannelId(serverRequest.url)

      if (!channelId) {
        return yield* HttpServerResponse.json(
          { error: "BadRequest", message: "Missing channelId" },
          { status: 400 }
        )
      }

      const socket = yield* serverRequest.upgrade
      const write = yield* socket.writer

      // Mutable state for the connection lifecycle
      let initialized = false
      let userId = "user:web:anon"
      const makeClient = yield* WebChatAdapterEntity.client

      const handleFrame = (
        data: string | Uint8Array,
        writeFn: (chunk: string | Uint8Array | Socket.CloseEvent) => Effect.Effect<void, Socket.SocketError>
      ): Effect.Effect<void> => {
        const frame = parseFrame(data)
        if (frame === null) {
          return writeFn(errorFrame("INVALID_FRAME", "Could not parse frame")).pipe(
            Effect.ignore
          )
        }

        if (frame.type === "init") {
          if (initialized) {
            return writeFn(errorFrame("ALREADY_INITIALIZED", "Channel already initialized")).pipe(
              Effect.ignore
            )
          }
          const client = makeClient(channelId)
          userId = frame.userId
          return client.initialize({
            channelType: "WebChat",
            agentId: frame.agentId,
            userId,
            ...(frame.attachTo !== undefined
              ? { attachTo: frame.attachTo }
              : {})
          }).pipe(
            Effect.andThen(() => {
              initialized = true
              return writeFn(encodeInitialized({ type: "initialized" as const }))
            }),
            Effect.catchCause((cause) =>
              writeFn(errorFrame("INIT_FAILED", Cause.pretty(cause))).pipe(
                Effect.ignore
              )
            )
          )
        }

        if (frame.type === "message") {
          if (!initialized) {
            return writeFn(errorFrame("NOT_INITIALIZED", "Send init frame first")).pipe(
              Effect.ignore
            )
          }
          const client = makeClient(channelId)
          return withFailedTurnEvent(
            client.receiveMessage({
              content: frame.content,
              userId,
              ...frame.model ? { modelOverride: frame.model } : {},
              ...frame.generationConfig ? { generationConfigOverride: frame.generationConfig } : {}
            }),
            {
              fallbackMessage: "Message stream failed unexpectedly",
              defaultTurnId: "",
              defaultSessionId: ""
            }
          ).pipe(
            Stream.runForEach((event) => writeFn(encodeTurnEventJson(event))),
            Effect.catchCause((cause) =>
              writeFn(errorFrame("MESSAGE_STREAM_FAILED", Cause.pretty(cause))).pipe(
                Effect.ignore
              )
            )
          )
        }

        return writeFn(errorFrame("UNKNOWN_FRAME", "Unknown frame type")).pipe(
          Effect.ignore
        )
      }

      yield* socket.runRaw(
        (data) => handleFrame(data, write),
        {
          onOpen: write(encodeConnected({ type: "connected" as const })).pipe(Effect.ignore)
        }
      )

      // runRaw blocks until the socket closes; this return may not be reached
      // but is required by the type system. The upgrade already happened above.
      return HttpServerResponse.empty({ status: 101 })
    }).pipe(
      Effect.catchCause(() =>
        HttpServerResponse.json(
          { error: "InternalServerError" },
          { status: 500 }
        )
      )
    )
)

// ---------------------------------------------------------------------------
// Combined layer
// ---------------------------------------------------------------------------

export const layer = wsChat
