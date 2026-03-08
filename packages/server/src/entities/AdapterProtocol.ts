/**
 * Shared RPC definitions for channel adapter entities.
 *
 * Both CLIAdapterEntity and WebChatAdapterEntity consume these RPCs so that
 * any client can talk to any adapter through a single, consistent contract.
 */
import { GenerationConfigOverrideSchema, ModelOverrideSchema } from "@template/domain/config"
import { ChannelNotFound, ChannelTypeMismatch, SessionNotFound } from "@template/domain/errors"
import { TurnStreamEvent } from "@template/domain/events"
import { ChannelAttachTarget, ChannelHistoryResponse, ChannelStatus } from "@template/domain/ports"
import { ChannelType } from "@template/domain/status"
import { Schema } from "effect"
import { ClusterSchema } from "effect/unstable/cluster"
import { Rpc } from "effect/unstable/rpc"
import { TurnProcessingError } from "../turn/TurnProcessingWorkflow.js"

// ---------------------------------------------------------------------------
// Shared schemas
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// RPCs
// ---------------------------------------------------------------------------

/**
 * One-time channel bootstrap. Persisted and idempotent — safe to replay.
 *
 * Payload carries the `agentId` and desired `channelType` so the adapter can
 * create the underlying channel. `attachTo` optionally reuses an existing
 * session for multi-channel fan-in.
 */
export const InitializeRpc = Rpc.make("initialize", {
  payload: {
    channelType: ChannelType,
    agentId: Schema.String,
    userId: Schema.String,
    attachTo: Schema.optionalKey(ChannelAttachTarget)
  },
  success: Schema.Void,
  error: Schema.Union([ChannelTypeMismatch, SessionNotFound]),
  primaryKey: ({ agentId }) => `initialize:${agentId}`
}).annotate(ClusterSchema.Persisted, true)

/**
 * Send user content and receive a streaming sequence of `TurnStreamEvent`s.
 */
export const ReceiveMessageRpc = Rpc.make("receiveMessage", {
  payload: {
    content: Schema.String,
    userId: Schema.String,
    modelOverride: Schema.optionalKey(ModelOverrideSchema),
    generationConfigOverride: Schema.optionalKey(GenerationConfigOverrideSchema)
  },
  success: TurnStreamEvent,
  error: Schema.Union([ChannelNotFound, TurnProcessingError]),
  stream: true
})

/**
 * Retrieve the full turn history for the channel's active session.
 */
export const GetHistoryRpc = Rpc.make("getHistory", {
  payload: {},
  success: ChannelHistoryResponse,
  error: ChannelNotFound
})

/**
 * Return a point-in-time status snapshot for the channel.
 */
export const GetStatusRpc = Rpc.make("getStatus", {
  payload: {},
  success: ChannelStatus,
  error: ChannelNotFound
})

export const SetModelPreferenceRpc = Rpc.make("setModelPreference", {
  payload: {
    modelOverride: Schema.optionalKey(Schema.Union([ModelOverrideSchema, Schema.Null])),
    generationConfigOverride: Schema.optionalKey(Schema.Union([GenerationConfigOverrideSchema, Schema.Null]))
  },
  success: Schema.Void,
  error: ChannelNotFound
})
