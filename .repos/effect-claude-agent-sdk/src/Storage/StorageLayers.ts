import { BunFileSystem, BunKeyValueStore, BunPath } from "@effect/platform-bun"
import type * as Duration from "effect/Duration"
import * as Layer from "effect/Layer"
import { ArtifactStore } from "./ArtifactStore.js"
import { AuditEventStore } from "./AuditEventStore.js"
import { ChatHistoryStore } from "./ChatHistoryStore.js"
import { SessionIndexStore } from "./SessionIndexStore.js"
import { defaultStorageDirectory } from "./defaults.js"

export type StorageLayerOptions = {
  readonly directory?: string
}

export type StorageLayers<E = unknown, R = unknown> = {
  readonly chatHistory: Layer.Layer<ChatHistoryStore, E, R>
  readonly artifacts: Layer.Layer<ArtifactStore, E, R>
  readonly auditLog: Layer.Layer<AuditEventStore, E, R>
  readonly sessionIndex: Layer.Layer<SessionIndexStore, E, R>
}

export type StorageSyncLayerOptions = StorageLayerOptions & {
  readonly syncInterval?: Duration.DurationInput
  readonly disablePing?: boolean
  readonly syncChatHistory?: boolean
  readonly syncArtifacts?: boolean
}

const resolveDirectory = (directory: string | undefined) =>
  directory === undefined ? undefined : { directory }

const resolveLayers = (
  options: StorageLayerOptions | undefined,
  kind: "filesystem" | "bun",
  mode: "standard" | "journaled"
) => {
  const directory = resolveDirectory(options?.directory)
  const journaled = mode === "journaled"
  return {
    chatHistory: kind === "bun"
      ? journaled
        ? ChatHistoryStore.layerJournaledFileSystemBun(directory)
        : ChatHistoryStore.layerFileSystemBun(directory)
      : journaled
        ? ChatHistoryStore.layerJournaledFileSystem(directory)
        : ChatHistoryStore.layerFileSystem(directory),
    artifacts: kind === "bun"
      ? journaled
        ? ArtifactStore.layerJournaledFileSystemBun(directory)
        : ArtifactStore.layerFileSystemBun(directory)
      : journaled
        ? ArtifactStore.layerJournaledFileSystem(directory)
        : ArtifactStore.layerFileSystem(directory),
    auditLog: kind === "bun"
      ? AuditEventStore.layerFileSystemBun(directory)
      : AuditEventStore.layerFileSystem(directory),
    sessionIndex: kind === "bun"
      ? SessionIndexStore.layerFileSystemBun(directory)
      : SessionIndexStore.layerFileSystem(directory)
  }
}

export const layersFileSystem = (options?: StorageLayerOptions) =>
  resolveLayers(options, "filesystem", "standard")

export const layersFileSystemJournaled = (options?: StorageLayerOptions) =>
  resolveLayers(options, "filesystem", "journaled")

const bunFileSystemLayer = BunFileSystem.layer
const bunPathLayer = BunPath.layer

export const layersFileSystemBun = (
  options?: StorageLayerOptions
): StorageLayers<unknown, never> => {
  const layers = resolveLayers(options, "bun", "standard")
  return {
    chatHistory: layers.chatHistory.pipe(
      Layer.provide([bunFileSystemLayer, bunPathLayer])
    ),
    artifacts: layers.artifacts.pipe(
      Layer.provide([bunFileSystemLayer, bunPathLayer])
    ),
    auditLog: layers.auditLog.pipe(
      Layer.provide([bunFileSystemLayer, bunPathLayer])
    ),
    sessionIndex: layers.sessionIndex.pipe(
      Layer.provide([bunFileSystemLayer, bunPathLayer])
    )
  }
}

export const layersFileSystemBunJournaled = (
  options?: StorageLayerOptions
): StorageLayers<unknown, never> => {
  const layers = resolveLayers(options, "bun", "journaled")
  return {
    chatHistory: layers.chatHistory.pipe(
      Layer.provide([bunFileSystemLayer, bunPathLayer])
    ),
    artifacts: layers.artifacts.pipe(
      Layer.provide([bunFileSystemLayer, bunPathLayer])
    ),
    auditLog: layers.auditLog.pipe(
      Layer.provide([bunFileSystemLayer, bunPathLayer])
    ),
    sessionIndex: layers.sessionIndex.pipe(
      Layer.provide([bunFileSystemLayer, bunPathLayer])
    )
  }
}

export const layerFileSystem = (options?: StorageLayerOptions) => {
  const layers = resolveLayers(options, "filesystem", "standard")
  return Layer.mergeAll(
    layers.chatHistory,
    layers.artifacts,
    layers.auditLog,
    layers.sessionIndex
  )
}

export const layerFileSystemBun = (options?: StorageLayerOptions) => {
  const layers = layersFileSystemBun(options)
  return Layer.mergeAll(
    layers.chatHistory,
    layers.artifacts,
    layers.auditLog,
    layers.sessionIndex
  )
}

export const layerFileSystemJournaled = (options?: StorageLayerOptions) => {
  const layers = resolveLayers(options, "filesystem", "journaled")
  return Layer.mergeAll(
    layers.chatHistory,
    layers.artifacts,
    layers.auditLog,
    layers.sessionIndex
  )
}

export const layerFileSystemBunJournaled = (options?: StorageLayerOptions) => {
  const layers = layersFileSystemBunJournaled(options)
  return Layer.mergeAll(
    layers.chatHistory,
    layers.artifacts,
    layers.auditLog,
    layers.sessionIndex
  )
}

export const layersFileSystemBunJournaledWithSyncWebSocket = (
  url: string,
  options?: StorageSyncLayerOptions
): StorageLayers<unknown, never> => {
  const directory = options?.directory
  const syncInterval = options?.syncInterval
  const disablePing = options?.disablePing
  const syncChatHistory = options?.syncChatHistory ?? true
  const syncArtifacts = options?.syncArtifacts ?? false
  const kvsLayer = BunKeyValueStore.layerFileSystem(
    directory ?? defaultStorageDirectory
  )

  const baseLayers = layersFileSystemBunJournaled(
    directory !== undefined ? { directory } : undefined
  )

  return {
    chatHistory: syncChatHistory
      ? ChatHistoryStore.layerJournaledWithSyncWebSocket(
          url,
          disablePing !== undefined || syncInterval !== undefined
            ? {
                ...(disablePing !== undefined ? { disablePing } : {}),
                ...(syncInterval !== undefined ? { syncInterval } : {})
              }
            : undefined
        ).pipe(Layer.provide(kvsLayer))
      : baseLayers.chatHistory,
    artifacts: syncArtifacts
      ? ArtifactStore.layerJournaledWithSyncWebSocket(
          url,
          disablePing !== undefined || syncInterval !== undefined
            ? {
                ...(disablePing !== undefined ? { disablePing } : {}),
                ...(syncInterval !== undefined ? { syncInterval } : {})
              }
            : undefined
        ).pipe(Layer.provide(kvsLayer))
      : baseLayers.artifacts,
    auditLog: baseLayers.auditLog,
    sessionIndex: baseLayers.sessionIndex
  }
}
