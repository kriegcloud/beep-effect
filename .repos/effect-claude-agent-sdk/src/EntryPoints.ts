import * as Layer from "effect/Layer"
import { AgentRuntime } from "./AgentRuntime.js"
import { SessionConfig } from "./SessionConfig.js"
import { SessionManager } from "./SessionManager.js"
import { SessionService, type SessionHistoryOptions } from "./SessionService.js"
import type { SDKSessionOptions } from "./Schema/Session.js"
import { ChatHistoryStore } from "./Storage/ChatHistoryStore.js"

export type EntryPrefix = string

export type SessionEntryLayers = {
  readonly sessionConfig?: Layer.Layer<SessionConfig>
  readonly sessionManager?: Layer.Layer<SessionManager>
  readonly chatHistory?: Layer.Layer<ChatHistoryStore>
}

export type SessionEntryOptions = {
  readonly prefix?: EntryPrefix
  readonly history?: SessionHistoryOptions
  readonly layers?: SessionEntryLayers
}

export type RuntimeEntryLayers = {
  readonly runtime?: Layer.Layer<AgentRuntime>
}

export type RuntimeEntryOptions = {
  readonly prefix?: EntryPrefix
  readonly layers?: RuntimeEntryLayers
}

export const sessionLayer = (
  options: SDKSessionOptions,
  entry?: SessionEntryOptions
) => {
  const prefix = entry?.prefix ?? "AGENTSDK"
  const sessionConfig = entry?.layers?.sessionConfig ?? SessionConfig.layerFromEnv(prefix)
  const managerLayer =
    entry?.layers?.sessionManager ??
    SessionManager.layer.pipe(Layer.provide(sessionConfig))
  const baseLayer = SessionService.layer(options).pipe(Layer.provide(managerLayer))

  if (!entry?.history) {
    return baseLayer
  }

  const historyLayer = entry.layers?.chatHistory ?? ChatHistoryStore.layerMemory
  return SessionService.layerWithHistory(options, entry.history).pipe(
    Layer.provide(managerLayer),
    Layer.provide(historyLayer)
  )
}

export const runtimeLayer = (entry?: RuntimeEntryOptions) => {
  if (entry?.layers?.runtime) return entry.layers.runtime
  return AgentRuntime.layerDefaultFromEnv(entry?.prefix ?? "AGENTSDK")
}
