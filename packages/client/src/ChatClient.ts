import { TurnFailureCode, TurnStreamEvent } from "@template/domain/events"
import {
  ChannelHistoryResponse,
  CheckpointNotFoundResponse,
  CheckpointRecordResponse,
  DecideCheckpointErrorResponse,
  ListPendingCheckpointsResponse,
  ListChannelsResponse,
  type InitializeChannelRequest
} from "@template/domain/ports"
import type { CheckpointDecision } from "@template/domain/status"
import {
  classifyTurnFailureText,
  toTurnFailureMessageFromUnknown
} from "@template/domain/turnFailure"
import { Config, Effect, Layer, Option, Schema, ServiceMap, Stream } from "effect"
import * as Sse from "effect/unstable/encoding/Sse"
import * as HttpClient from "effect/unstable/http/HttpClient"
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest"

export type DecideCheckpointResult =
  | { readonly kind: "ack" }
  | { readonly kind: "stream"; readonly stream: Stream.Stream<TurnStreamEvent, unknown> }

export class CheckpointDecisionError extends Schema.ErrorClass<CheckpointDecisionError>(
  "CheckpointDecisionError"
)({
  _tag: Schema.tag("CheckpointDecisionError"),
  status: Schema.Number,
  message: Schema.String,
  errorCode: Schema.NullOr(TurnFailureCode),
  body: Schema.Unknown
}) {}

export interface ChannelInitializeOptions {
  readonly attachTo?: {
    readonly sessionId: string
  }
}

export class ChatClient extends ServiceMap.Service<ChatClient>()("client/ChatClient", {
  make: Effect.gen(function*() {
    const baseUrl = yield* Config.string("PA_SERVER_URL").pipe(
      Config.withDefault(() => "http://localhost:3000")
    )

    const rawHttpClient = yield* HttpClient.HttpClient
    const httpClient = rawHttpClient.pipe(
      HttpClient.filterStatusOk
    )

    const decodeTurnSseStream = (stream: Stream.Stream<Uint8Array, unknown>) =>
      stream.pipe(
        Stream.decodeText(),
        Stream.pipeThroughChannel(Sse.decodeDataSchema(TurnStreamEvent)),
        Stream.map((event) => event.data)
      )

    const initialize = (
      channelId: string,
      agentId: string,
      options?: ChannelInitializeOptions
    ) => {
      const payload: InitializeChannelRequest = {
        channelType: "CLI",
        agentId,
        ...(options?.attachTo !== undefined
          ? { attachTo: options.attachTo }
          : {})
      }

      return HttpClientRequest.bodyJsonUnsafe(
        HttpClientRequest.post(`${baseUrl}/channels/${channelId}/initialize`),
        payload
      ).pipe(
        (request) => httpClient.execute(request),
        Effect.asVoid,
        Effect.scoped
      )
    }

    const sendMessage = (channelId: string, content: string) =>
      HttpClientRequest.bodyJsonUnsafe(
        HttpClientRequest.post(`${baseUrl}/channels/${channelId}/messages`),
        { content }
      ).pipe(
        (request) => httpClient.execute(request),
        Effect.map((response) => decodeTurnSseStream(response.stream))
      )

    const getHistory = (channelId: string) =>
      httpClient.execute(
        HttpClientRequest.get(`${baseUrl}/channels/${channelId}/history`)
      ).pipe(
        Effect.flatMap((response) => response.json),
        Effect.map((body) => {
          const decoded = Schema.decodeUnknownOption(ChannelHistoryResponse)(body)
          return Option.isSome(decoded) ? decoded.value : []
        }),
        Effect.scoped
      )

    const listChannels = (agentId?: string) => {
      const query = agentId !== undefined ? `?agentId=${encodeURIComponent(agentId)}` : ""
      return httpClient.execute(
        HttpClientRequest.get(`${baseUrl}/channels${query}`)
      ).pipe(
        Effect.flatMap((response) => response.json),
        Effect.map((body) => {
          const decoded = Schema.decodeUnknownOption(ListChannelsResponse)(body)
          return Option.isSome(decoded) ? decoded.value.items : []
        }),
        Effect.scoped
      )
    }

    const deleteChannel = (channelId: string) =>
      httpClient.execute(
        HttpClientRequest.delete(`${baseUrl}/channels/${channelId}`)
      ).pipe(
        Effect.asVoid,
        Effect.scoped
      )

    const listPendingCheckpoints = (agentId?: string) => {
      const query = agentId !== undefined ? `?agentId=${encodeURIComponent(agentId)}` : ""
      return httpClient.execute(
        HttpClientRequest.get(`${baseUrl}/checkpoints/pending${query}`)
      ).pipe(
        Effect.flatMap((response) => response.json),
        Effect.map((body) => {
          const decoded = Schema.decodeUnknownOption(ListPendingCheckpointsResponse)(body)
          return Option.isSome(decoded) ? decoded.value.items : []
        }),
        Effect.scoped
      )
    }

    const getCheckpoint = (checkpointId: string) =>
      Effect.gen(function*() {
        const response = yield* rawHttpClient.execute(
          HttpClientRequest.get(`${baseUrl}/checkpoints/${checkpointId}`)
        )

        const body = yield* response.json.pipe(
          Effect.catchCause(() =>
            response.text.pipe(
              Effect.map((text) => ({ message: text })),
              Effect.catchCause(() => Effect.succeed({}))
            )
          )
        )

        if (response.status === 404) {
          const decodedMissing = Schema.decodeUnknownOption(CheckpointNotFoundResponse)(body)
          if (Option.isSome(decodedMissing)) {
            return null
          }
          return null
        }

        if (response.status < 200 || response.status >= 300) {
          return null
        }

        const decoded = Schema.decodeUnknownOption(CheckpointRecordResponse)(body)
        if (Option.isSome(decoded)) {
          return decoded.value
        }
        return null
      })

    const decideCheckpoint = (
      checkpointId: string,
      decision: CheckpointDecision
    ) =>
      Effect.gen(function*() {
        const request = HttpClientRequest.bodyJsonUnsafe(
          HttpClientRequest.post(`${baseUrl}/checkpoints/${checkpointId}/decide`),
          { decision, decidedBy: "user:cli:local" }
        )

        const response = yield* rawHttpClient.execute(request)
        const contentType = response.headers["content-type"] ?? ""
        if (response.status >= 200 && response.status < 300) {
          if (contentType.includes("text/event-stream")) {
            const stream = decodeTurnSseStream(response.stream)
            return { kind: "stream" as const, stream }
          }
          return { kind: "ack" as const }
        }

        const body = yield* response.json.pipe(
          Effect.catchCause(() =>
            response.text.pipe(
              Effect.map((text) => ({ message: text })),
              Effect.catchCause(() => Effect.succeed({}))
            )
          )
        )
        const message = toCheckpointDecisionErrorMessage(response.status, body)
        const errorCode = toCheckpointDecisionErrorCode(body)
        return yield* new CheckpointDecisionError({
          status: response.status,
          message,
          errorCode,
          body
        })
      })

    const health = httpClient.execute(
      HttpClientRequest.get(`${baseUrl}/health`)
    ).pipe(
      Effect.flatMap((response) => response.json),
      Effect.tap((body) => Effect.logInfo(JSON.stringify(body))),
      Effect.scoped
    )

    return {
      initialize,
      sendMessage,
      decideCheckpoint,
      getHistory,
      listChannels,
      deleteChannel,
      listPendingCheckpoints,
      getCheckpoint,
      health
    } as const
  })
}) {
  static layer = Layer.effect(this, this.make)
}

const getStringField = (value: unknown, key: string): string => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return ""
  }
  const field = (value as Record<string, unknown>)[key]
  return typeof field === "string" ? field : ""
}

const toCheckpointDecisionErrorCode = (body: unknown): TurnFailureCode | null => {
  const structured = Schema.decodeUnknownOption(DecideCheckpointErrorResponse)(body)
  if (Option.isSome(structured)) {
    switch (structured.value.error) {
      case "CheckpointNotFound":
      case "CheckpointExpired":
        return "checkpoint_payload_invalid"
      case "CheckpointAlreadyDecided":
        return "checkpoint_transition_failed"
    }
  }

  const explicit = getStringField(body, "errorCode")
  if (explicit.length > 0) {
    return classifyTurnFailureText(explicit)
  }

  const reason = getStringField(body, "reason")
  if (reason.length > 0) {
    return classifyTurnFailureText(reason)
  }

  return null
}

const toCheckpointDecisionErrorMessage = (status: number, body: unknown): string => {
  const structured = Schema.decodeUnknownOption(DecideCheckpointErrorResponse)(body)
  if (Option.isSome(structured)) {
    switch (structured.value.error) {
      case "CheckpointNotFound":
        return `checkpoint_not_found:${structured.value.checkpointId}`
      case "CheckpointExpired":
        return `checkpoint_expired:${structured.value.checkpointId}`
      case "CheckpointAlreadyDecided":
        return `checkpoint_already_decided:${structured.value.currentStatus}`
    }
  }

  const message = toTurnFailureMessageFromUnknown(body, "")
  if (message.length > 0) {
    return message
  }
  const error = getStringField(body, "error")
  if (error.length > 0) {
    const currentStatus = getStringField(body, "currentStatus")
    if (currentStatus.length > 0) {
      return `${error}:${currentStatus}`
    }
    return error
  }
  return `checkpoint_decision_failed_status_${status}`
}
