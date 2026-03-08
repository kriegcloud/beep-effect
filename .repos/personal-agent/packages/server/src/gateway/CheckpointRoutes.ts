import type { CheckpointId } from "@template/domain/ids"
import {
  DecideCheckpointRequest,
  type DecideCheckpointAlreadyDecidedResponse,
  type DecideCheckpointExpiredResponse,
  type DecideCheckpointNotFoundResponse,
  type CheckpointNotFoundResponse,
  type CheckpointRecordResponse,
  type ListPendingCheckpointsResponse,
  type OkResponse
} from "@template/domain/ports"
import { Effect, Layer, Schema } from "effect"
import * as HttpRouter from "effect/unstable/http/HttpRouter"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
import { ChannelCore } from "../ChannelCore.js"
import {
  badRequest,
  extractPathParam,
  internalServerError,
  sseStreamResponse
} from "./RouteCommon.js"
import { decodeUnknownJsonOption } from "../json/JsonStringCodecs.js"
import { toSseTextStream, withFailedTurnEvent } from "./TurnStreamTransport.js"

const decodeDecideCheckpointRequest = Schema.decodeUnknownOption(DecideCheckpointRequest)
const decodeJsonBody = decodeUnknownJsonOption

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

const listPending = HttpRouter.add(
  "GET",
  "/checkpoints/pending",
  (request) =>
    Effect.gen(function*() {
      const channelCore = yield* ChannelCore
      const url = new URL(request.url, "http://localhost")
      const agentId = url.searchParams.get("agentId") || undefined
      const checkpoints = yield* channelCore.listPendingCheckpoints(agentId as any)
      const response: ListPendingCheckpointsResponse = {
        items: checkpoints,
        totalCount: checkpoints.length
      }
      return yield* HttpServerResponse.json(response)
    }).pipe(
      Effect.withSpan("CheckpointRoutes.listPending"),
      Effect.catchCause(() => internalServerError())
    )
)

const getCheckpoint = HttpRouter.add(
  "GET",
  "/checkpoints/:checkpointId",
  (request) =>
    Effect.gen(function*() {
      const channelCore = yield* ChannelCore
      const checkpointId = extractPathParam(request.url, 1) as CheckpointId
      if (checkpointId.length === 0) {
        return yield* badRequest("Missing checkpointId")
      }
      const checkpoint = yield* channelCore.getCheckpoint(checkpointId)
      if (checkpoint === null) {
        const response: CheckpointNotFoundResponse = {
          error: "CheckpointNotFound",
          checkpointId
        }
        return yield* HttpServerResponse.json(
          response,
          { status: 404 }
        )
      }
      const response: CheckpointRecordResponse = checkpoint
      return yield* HttpServerResponse.json(response)
    }).pipe(
      Effect.withSpan("CheckpointRoutes.getCheckpoint"),
      Effect.catchCause(() => internalServerError())
    )
)

const decideCheckpoint = HttpRouter.add(
  "POST",
  "/checkpoints/:checkpointId/decide",
  (request) =>
    Effect.gen(function*() {
      const channelCore = yield* ChannelCore
      const checkpointId = extractPathParam(request.url, 1) as CheckpointId
      if (checkpointId.length === 0) {
        return yield* badRequest("Missing checkpointId")
      }

      const rawBodyText = yield* request.text.pipe(
        Effect.catchCause(() => Effect.succeed("__READ_FAILED__"))
      )
      if (rawBodyText === "__READ_FAILED__" || rawBodyText.length === 0) {
        return yield* badRequest("Invalid JSON payload")
      }

      const rawBody = decodeJsonBody(rawBodyText)
      if (rawBody._tag === "None") {
        return yield* badRequest("Invalid JSON payload")
      }

      const decoded = decodeDecideCheckpointRequest(rawBody.value)
      if (decoded._tag === "None") {
        return yield* badRequest(
          "Invalid payload: decision must be Approved|Rejected|Deferred, decidedBy required"
        )
      }

      const decidedBy = decoded.value.decidedBy.trim()
      if (decidedBy.length === 0) {
        return yield* badRequest("Invalid payload: decidedBy must be a non-empty string")
      }

      const result = yield* channelCore.decideCheckpoint({
        checkpointId,
        decision: decoded.value.decision,
        decidedBy
      })

      if (result.kind === "ack") {
        const response: OkResponse = { ok: true }
        return yield* HttpServerResponse.json(response)
      }

      // Approved with replay stream — return SSE
      const sseStream = toSseTextStream(
        withFailedTurnEvent(result.stream, {
          fallbackMessage: "Replay stream failed unexpectedly"
        })
      )

      return sseStreamResponse(sseStream)
    }).pipe(
      Effect.withSpan("CheckpointRoutes.decideCheckpoint"),
      Effect.catchTag("CheckpointNotFound", (error) => {
        const response: DecideCheckpointNotFoundResponse = {
          error: "CheckpointNotFound",
          checkpointId: error.checkpointId
        }
        return HttpServerResponse.json(
          response,
          { status: 404 }
        )
      }),
      Effect.catchTag("CheckpointAlreadyDecided", (error) => {
        const response: DecideCheckpointAlreadyDecidedResponse = {
          error: "CheckpointAlreadyDecided",
          checkpointId: error.checkpointId,
          currentStatus: error.currentStatus as DecideCheckpointAlreadyDecidedResponse["currentStatus"]
        }
        return HttpServerResponse.json(
          response,
          { status: 409 }
        )
      }),
      Effect.catchTag("CheckpointExpired", (error) => {
        const response: DecideCheckpointExpiredResponse = {
          error: "CheckpointExpired",
          checkpointId: error.checkpointId
        }
        return HttpServerResponse.json(
          response,
          { status: 410 }
        )
      }),
      Effect.catchCause(() => internalServerError())
    )
)

// ---------------------------------------------------------------------------
// Combined layer
// ---------------------------------------------------------------------------

export const layer = Layer.mergeAll(listPending, getCheckpoint, decideCheckpoint)
