import { ChannelNotFound } from "@template/domain/errors"
import type { GenerationConfigOverride, ModelOverride } from "@template/domain/config"
import type { AgentId, ChannelId, SessionId } from "@template/domain/ids"
import type { ChannelCapability, ChannelType } from "@template/domain/status"
import { Effect, Stream } from "effect"
import { ChannelCore } from "../ChannelCore.js"
import { ChannelPortTag } from "../PortTags.js"

type InitializePayload = {
  readonly agentId: string
  readonly attachTo?: {
    readonly sessionId: string
  }
}

type ReceiveMessagePayload = {
  readonly content: string
  readonly userId: string
  readonly modelOverride?: ModelOverride
  readonly generationConfigOverride?: GenerationConfigOverride
}

type SetModelPreferencePayload = {
  readonly modelOverride?: ModelOverride | null
  readonly generationConfigOverride?: GenerationConfigOverride | null
}

type ChannelAddress = {
  readonly entityId: unknown
}

export const makeChannelAdapterLayer = (params: {
  readonly module: string
  readonly channelType: ChannelType
  readonly capabilities: ReadonlyArray<ChannelCapability>
}) =>
  Effect.gen(function*() {
    const channelCore = yield* ChannelCore
    const channelPort = yield* ChannelPortTag

    return {
      initialize: (request: {
        readonly address: ChannelAddress
        readonly payload: InitializePayload
      }) =>
        channelCore.initializeChannel({
          channelId: String(request.address.entityId) as ChannelId,
          channelType: params.channelType,
          agentId: request.payload.agentId as AgentId,
          capabilities: params.capabilities,
          ...(request.payload.attachTo
            ? {
                attachTo: {
                  sessionId: request.payload.attachTo.sessionId as SessionId
                }
              }
            : {})
        }).pipe(
          Effect.withSpan(`${params.module}.initialize`),
          Effect.annotateLogs({ module: params.module, entityId: request.address.entityId })
        ),

      receiveMessage: (request: {
        readonly address: ChannelAddress
        readonly payload: ReceiveMessagePayload
      }) => {
        const channelId = String(request.address.entityId) as ChannelId
        return Stream.unwrap(
          channelCore.buildTurnPayload({
            channelId,
            content: request.payload.content,
            contentBlocks: [{ contentBlockType: "TextBlock" as const, text: request.payload.content }],
            userId: request.payload.userId,
            modelOverride: request.payload.modelOverride,
            generationConfigOverride: request.payload.generationConfigOverride
          }).pipe(
            Effect.map((turnPayload) => channelCore.processTurn(turnPayload))
          )
        ).pipe(
          Stream.withSpan(`${params.module}.receiveMessage`)
        )
      },

      getHistory: (request: {
        readonly address: ChannelAddress
        readonly payload: Record<string, never>
      }) =>
        channelCore.getHistory(String(request.address.entityId) as ChannelId).pipe(
          Effect.withSpan(`${params.module}.getHistory`),
          Effect.annotateLogs({ module: params.module, entityId: request.address.entityId })
        ),

      getStatus: (request: {
        readonly address: ChannelAddress
        readonly payload: Record<string, never>
      }) =>
        Effect.gen(function*() {
          const channelId = String(request.address.entityId) as ChannelId
          const channel = yield* channelPort.get(channelId)
          if (channel === null) {
            return yield* new ChannelNotFound({ channelId })
          }
          return {
            channelId: channel.channelId,
            channelType: channel.channelType,
            capabilities: [...channel.capabilities],
            activeSessionId: channel.activeSessionId,
            activeConversationId: channel.activeConversationId,
            modelOverride: channel.modelOverride,
            generationConfigOverride: channel.generationConfigOverride,
            createdAt: channel.createdAt
          }
        }).pipe(
          Effect.withSpan(`${params.module}.getStatus`),
          Effect.annotateLogs({ module: params.module, entityId: request.address.entityId })
        ),

      setModelPreference: (request: {
        readonly address: ChannelAddress
        readonly payload: SetModelPreferencePayload
      }) =>
        channelCore.setModelPreference({
          channelId: String(request.address.entityId) as ChannelId,
          ...("modelOverride" in request.payload ? { modelOverride: request.payload.modelOverride } : {}),
          ...("generationConfigOverride" in request.payload
            ? { generationConfigOverride: request.payload.generationConfigOverride }
            : {})
        }).pipe(
          Effect.withSpan(`${params.module}.setModelPreference`),
          Effect.annotateLogs({ module: params.module, entityId: request.address.entityId })
        )
    }
  })
