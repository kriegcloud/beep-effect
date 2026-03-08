import type { TurnFailureCode } from "@template/domain/events"
import type { AgentId, ChannelId, SessionId } from "@template/domain/ids"
import {
  type ChannelNotFoundResponse,
  type ChannelHistoryResponse,
  type ChannelTypeMismatchResponse,
  type ChannelStatus,
  InitializeChannelRequest,
  type InternalServerErrorResponse,
  type ListChannelsResponse,
  type OkResponse,
  SendChannelMessageRequest,
  type SessionNotFoundResponse,
  SetChannelModelPreferenceRequest
} from "@template/domain/ports"
import { DateTime, Effect, Layer, Option, Schema, Stream } from "effect"
import * as HttpRouter from "effect/unstable/http/HttpRouter"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
import { ChannelCore } from "../ChannelCore.js"
import {
  channelCapabilitiesForType,
  isSupportedChannelAdapterType
} from "../entities/ChannelAdapterProfiles.js"
import { RuntimeKernelReadiness } from "../runtime/RuntimeKernelReadiness.js"
import {
  badRequest,
  extractPathParam,
  internalServerError,
  sseStreamResponse
} from "./RouteCommon.js"
import { toSseTextStream, withFailedTurnEvent } from "./TurnStreamTransport.js"

const decodeInitializeChannelRequest = Schema.decodeUnknownOption(InitializeChannelRequest)
const decodeSendMessageRequest = Schema.decodeUnknownOption(SendChannelMessageRequest)
const decodeSetModelPreferenceRequest = Schema.decodeUnknownOption(SetChannelModelPreferenceRequest)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const mapChannelNotFoundFailure = (
  error: unknown
): { readonly errorCode: TurnFailureCode; readonly message: string } | null => {
  if (
    typeof error === "object" &&
    error !== null &&
    "_tag" in error &&
    typeof error._tag === "string"
  ) {
    const errorCode = error._tag
    if (errorCode === "ChannelNotFound" && "channelId" in error) {
      const channelId = typeof error.channelId === "string" ? error.channelId : "unknown"
      return {
        errorCode: "turn_processing_error",
        message: `Channel not found: ${channelId}`
      }
    }
  }

  return null
}

const SUPPORTED_CHANNEL_TYPE_LABEL = "CLI|WebChat"

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

const listChannels = HttpRouter.add(
  "GET",
  "/channels",
  (request) =>
    Effect.gen(function*() {
      const channelCore = yield* ChannelCore
      const url = new URL(request.url, "http://localhost")
      const agentId = url.searchParams.get("agentId") ?? undefined
      const items = yield* channelCore.listChannels(agentId as any)
      const response: ListChannelsResponse = {
        items: items.map((item) => ({
          ...item,
          createdAt: DateTime.formatIso(item.createdAt),
          lastTurnAt: item.lastTurnAt === null ? null : DateTime.formatIso(item.lastTurnAt)
        })),
        totalCount: items.length
      }
      return yield* HttpServerResponse.json(response)
    }).pipe(
      Effect.withSpan("ChannelRoutes.listChannels"),
      Effect.catchCause(() => {
        const response: InternalServerErrorResponse = { error: "InternalServerError" }
        return HttpServerResponse.json(
          response,
          { status: 500 }
        )
      }
      )
    )
)

const initializeChannel = HttpRouter.add(
  "POST",
  "/channels/:channelId/initialize",
  (request) =>
    Effect.gen(function*() {
      const channelCore = yield* ChannelCore
      const channelId = extractPathParam(request.url, 1) as ChannelId
      const rawBody = yield* request.json
      if (!isRecord(rawBody)) {
        return yield* badRequest("Expected JSON object payload")
      }

      const decodedBody = decodeInitializeChannelRequest(rawBody)
      if (Option.isNone(decodedBody)) {
        return yield* badRequest("Invalid initialize channel payload")
      }

      const channelType = decodedBody.value.channelType
      if (!isSupportedChannelAdapterType(channelType)) {
        return yield* badRequest(`Unsupported channelType. Supported values: ${SUPPORTED_CHANNEL_TYPE_LABEL}`)
      }

      yield* channelCore.initializeChannel({
        channelId,
        channelType,
        agentId: decodedBody.value.agentId as AgentId,
        capabilities: channelCapabilitiesForType(channelType),
        ...(decodedBody.value.attachTo !== undefined
          ? {
              attachTo: {
                sessionId: decodedBody.value.attachTo.sessionId as SessionId
              }
            }
          : {})
      })

      const response: OkResponse = { ok: true }
      return yield* HttpServerResponse.json(response)
    }).pipe(
      Effect.withSpan("ChannelRoutes.initializeChannel"),
      Effect.catchTag("SessionNotFound", (error) => {
        const response: SessionNotFoundResponse = {
          error: "SessionNotFound",
          sessionId: error.sessionId
        }
        return HttpServerResponse.json(
          response,
          { status: 404 }
        )
      }),
      Effect.catchTag("ChannelTypeMismatch", (error) => {
        const response: ChannelTypeMismatchResponse = {
          error: "ChannelTypeMismatch",
          channelId: error.channelId,
          existingType: error.existingType,
          requestedType: error.requestedType
        }
        return HttpServerResponse.json(
          response,
          { status: 409 }
        )
      }),
      Effect.catchCause(() => internalServerError())
    )
)

const sendMessage = HttpRouter.add(
  "POST",
  "/channels/:channelId/messages",
  (request) =>
    Effect.gen(function*() {
      const channelCore = yield* ChannelCore
      const channelId = extractPathParam(request.url, 1) as ChannelId
      const rawBody = yield* request.json
      const decodedBody = decodeSendMessageRequest(rawBody)
      if (Option.isNone(decodedBody)) {
        return yield* badRequest("Invalid send message payload")
      }

      const channelStream = Stream.unwrap(
        channelCore.buildTurnPayload({
          channelId,
          content: decodedBody.value.content,
          contentBlocks: [{ contentBlockType: "TextBlock" as const, text: decodedBody.value.content }],
          userId: "user:cli:local",
          ...decodedBody.value.model ? { modelOverride: decodedBody.value.model } : {},
          ...decodedBody.value.generationConfig ? { generationConfigOverride: decodedBody.value.generationConfig } : {}
        }).pipe(
          Effect.map((turnPayload) => channelCore.processTurn(turnPayload))
        )
      )

      const stream = toSseTextStream(
        withFailedTurnEvent(
          channelStream,
          {
            fallbackMessage: "Turn processing failed unexpectedly",
            mapKnownError: mapChannelNotFoundFailure
          }
        )
      )

      return sseStreamResponse(stream)
    }).pipe(
      Effect.withSpan("ChannelRoutes.sendMessage")
    )
)

const getHistory = HttpRouter.add(
  "GET",
  "/channels/:channelId/history",
  (request) =>
    Effect.gen(function*() {
      const channelCore = yield* ChannelCore
      const channelId = extractPathParam(request.url, 1) as ChannelId
      const turns = yield* channelCore.getHistory(channelId)

      const response: ChannelHistoryResponse = turns
      return yield* HttpServerResponse.json(response)
    }).pipe(
      Effect.withSpan("ChannelRoutes.getHistory"),
      Effect.catchTag("ChannelNotFound", (error) => {
        const response: ChannelNotFoundResponse = {
          error: "ChannelNotFound",
          channelId: error.channelId
        }
        return HttpServerResponse.json(
          response,
          { status: 404 }
        )
      }),
      Effect.catchCause(() => internalServerError())
    )
)

const getStatus = HttpRouter.add(
  "GET",
  "/channels/:channelId/status",
  (request) =>
    Effect.gen(function*() {
      const channelCore = yield* ChannelCore
      const channelId = extractPathParam(request.url, 1) as ChannelId
      const status: ChannelStatus = yield* channelCore.getStatus(channelId)

      return yield* HttpServerResponse.json(status)
    }).pipe(
      Effect.withSpan("ChannelRoutes.getStatus"),
      Effect.catchTag("ChannelNotFound", (error) => {
        const response: ChannelNotFoundResponse = {
          error: "ChannelNotFound",
          channelId: error.channelId
        }
        return HttpServerResponse.json(
          response,
          { status: 404 }
        )
      }),
      Effect.catchCause(() => internalServerError())
    )
)

const deleteChannel = HttpRouter.add(
  "DELETE",
  "/channels/:channelId",
  (request) =>
    Effect.gen(function*() {
      const channelCore = yield* ChannelCore
      const channelId = extractPathParam(request.url, 1)
      if (channelId.length === 0) {
        return yield* badRequest("Missing channelId")
      }
      yield* channelCore.deleteChannel(channelId as ChannelId)
      const response: OkResponse = { ok: true }
      return yield* HttpServerResponse.json(response)
    }).pipe(
      Effect.withSpan("ChannelRoutes.deleteChannel"),
      Effect.catchTag("ChannelNotFound", (error) => {
        const response: ChannelNotFoundResponse = {
          error: "ChannelNotFound",
          channelId: error.channelId
        }
        return HttpServerResponse.json(
          response,
          { status: 404 }
        )
      }),
      Effect.catchCause(() => internalServerError())
    )
)

const setModelPreference = HttpRouter.add(
  "PATCH",
  "/channels/:channelId/model",
  (request) =>
    Effect.gen(function*() {
      const channelCore = yield* ChannelCore
      const channelId = extractPathParam(request.url, 1) as ChannelId
      const rawBody = yield* request.json
      const decodedBody = decodeSetModelPreferenceRequest(rawBody)
      if (Option.isNone(decodedBody)) {
        return yield* badRequest("Invalid model preference payload")
      }

      yield* channelCore.setModelPreference({
        channelId,
        ...(decodedBody.value.model !== undefined ? { modelOverride: decodedBody.value.model } : {}),
        ...(decodedBody.value.generationConfig !== undefined ? { generationConfigOverride: decodedBody.value.generationConfig } : {})
      })
      const response: OkResponse = { ok: true }
      return yield* HttpServerResponse.json(response)
    }).pipe(
      Effect.withSpan("ChannelRoutes.setModelPreference"),
      Effect.catchTag("ChannelNotFound", (error) => {
        const response: ChannelNotFoundResponse = {
          error: "ChannelNotFound",
          channelId: error.channelId
        }
        return HttpServerResponse.json(
          response,
          { status: 404 }
        )
      }),
      Effect.catchCause(() => internalServerError())
    )
)

const buildHealthPayload = Effect.gen(function*() {
  const readinessServiceOption = yield* Effect.serviceOption(RuntimeKernelReadiness)
  return yield* Option.match(readinessServiceOption, {
    onSome: (readiness) => readiness.snapshot(),
    onNone: () =>
      Effect.succeed({
        readinessState: "ready" as const,
        payload: {
          status: "ok" as const,
          service: "personal-agent" as const,
          readiness: {
            state: "ready" as const,
            degradedReasons: [] as const
          },
          runtime: {
            supervisor: null,
            loops: [] as const,
            scheduler: { lastTick: null },
            subroutines: {
              queueDepth: 0,
              inFlightCount: 0,
              dedupeEntries: 0,
              lastWorkerError: null
            }
          },
          integrations: {
            summary: {
              total: 0,
              connected: 0,
              initializing: 0,
              error: 0,
              disconnected: 0,
              degraded: 0
            },
            integrations: [] as const
          }
        }
      } as const)
  })
})

const health = HttpRouter.add(
  "GET",
  "/health",
  () =>
    buildHealthPayload.pipe(
      Effect.flatMap(({ payload }) => HttpServerResponse.json(payload)),
      Effect.withSpan("ChannelRoutes.health"),
      Effect.catchCause(() => internalServerError())
    )
)

const readiness = HttpRouter.add(
  "GET",
  "/ready",
  () =>
    buildHealthPayload.pipe(
      Effect.flatMap(({ payload, readinessState }) =>
        HttpServerResponse.json(payload, {
          status: readinessState === "ready" ? 200 : 503
        })
      ),
      Effect.withSpan("ChannelRoutes.ready"),
      Effect.catchCause(() => internalServerError())
    )
)

// ---------------------------------------------------------------------------
// Combined layers
// ---------------------------------------------------------------------------

export const healthLayer = Layer.mergeAll(health, readiness) // always-on, never gated
export const layer = Layer.mergeAll(
  listChannels,
  initializeChannel,
  sendMessage,
  getHistory,
  getStatus,
  deleteChannel,
  setModelPreference
) // gatable
