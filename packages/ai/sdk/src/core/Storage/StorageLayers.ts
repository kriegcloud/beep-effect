import { KeyValueStore } from "@effect/platform"
import { BunFileSystem, BunKeyValueStore, BunPath } from "@effect/platform-bun"
import type { FileSystem } from "@effect/platform/FileSystem"
import type { Path } from "@effect/platform/Path"
import type * as Duration from "effect/Duration"
import * as Layer from "effect/Layer"
import { ArtifactStore } from "./ArtifactStore.js"
import { AuditEventStore } from "./AuditEventStore.js"
import { ChatHistoryStore } from "./ChatHistoryStore.js"
import { SessionIndexStore } from "./SessionIndexStore.js"
import { type KVNamespace, layerKV } from "./StorageKV.js"
import { type R2Bucket, layerR2 } from "./StorageR2.js"
import {
  defaultArtifactEventJournalKey,
  defaultArtifactIdentityKey,
  defaultArtifactPrefix,
  defaultAuditEventJournalKey,
  defaultAuditIdentityKey,
  defaultChatEventJournalKey,
  defaultChatHistoryPrefix,
  defaultChatIdentityKey,
  defaultSessionIndexPrefix,
  defaultStorageDirectory
} from "./defaults.js"
import type { ConflictPolicy } from "../Sync/ConflictPolicy.js"
import { SyncConfig, SyncService } from "../Sync/SyncService.js"

export type StorageLayerOptions = {
  readonly directory?: string
  readonly tenant?: string
}

export type StorageBackend = "filesystem" | "bun" | "r2" | "kv"
export type StorageMode = "standard" | "journaled"

export type CloudflareStorageBindings = {
  readonly r2Bucket?: R2Bucket
  readonly kvNamespace?: KVNamespace
}

export type StorageLayers<E = unknown, R = unknown> = {
  readonly chatHistory: Layer.Layer<ChatHistoryStore, E, R>
  readonly artifacts: Layer.Layer<ArtifactStore, E, R>
  readonly auditLog: Layer.Layer<AuditEventStore, E, R>
  readonly sessionIndex: Layer.Layer<SessionIndexStore, E, R>
}

export type StorageLayersWithSync<E = unknown, R = unknown> = StorageLayers<E, R> & {
  readonly sync?: Layer.Layer<SyncService, E, R>
}

export type StorageSyncLayerOptions<R = never> = StorageLayerOptions & {
  readonly syncInterval?: Duration.DurationInput
  readonly disablePing?: boolean
  readonly protocols?: string | Array<string>
  readonly syncChatHistory?: boolean
  readonly syncArtifacts?: boolean
  readonly conflictPolicy?: Layer.Layer<ConflictPolicy, unknown, R>
  readonly exposeSync?: boolean
}

export type StorageSyncOptions<R = never> = Omit<StorageSyncLayerOptions<R>, "directory"> & {
  readonly url: string
}

export type StorageLayerBundleOptions<R = never> = StorageLayerOptions & {
  readonly backend?: StorageBackend
  readonly mode?: StorageMode
  readonly sync?: StorageSyncOptions<R>
  readonly bindings?: CloudflareStorageBindings
  readonly allowUnsafeKv?: boolean
}

const tenantPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/

const validateTenant = (tenant: string | undefined) => {
  if (tenant === undefined) return
  if (!tenantPattern.test(tenant)) {
    throw new Error(
      "StorageLayers: invalid tenant format. Expected /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/."
    )
  }
}

type TenantScope = {
  readonly chatPrefix: string
  readonly artifactPrefix: string
  readonly sessionIndexPrefix: string
  readonly chatJournalKey: string
  readonly chatIdentityKey: string
  readonly artifactJournalKey: string
  readonly artifactIdentityKey: string
  readonly auditJournalKey: string
  readonly auditIdentityKey: string
}

const tenantKey = (base: string, tenant: string | undefined) =>
  tenant === undefined ? base : `${base}/tenants/${tenant}`

const resolveTenantScope = (tenant: string | undefined): TenantScope => {
  validateTenant(tenant)
  return {
    chatPrefix: tenantKey(defaultChatHistoryPrefix, tenant),
    artifactPrefix: tenantKey(defaultArtifactPrefix, tenant),
    sessionIndexPrefix: tenantKey(defaultSessionIndexPrefix, tenant),
    chatJournalKey: tenantKey(defaultChatEventJournalKey, tenant),
    chatIdentityKey: tenantKey(defaultChatIdentityKey, tenant),
    artifactJournalKey: tenantKey(defaultArtifactEventJournalKey, tenant),
    artifactIdentityKey: tenantKey(defaultArtifactIdentityKey, tenant),
    auditJournalKey: tenantKey(defaultAuditEventJournalKey, tenant),
    auditIdentityKey: tenantKey(defaultAuditIdentityKey, tenant)
  }
}

const resolveDirectory = (directory: string | undefined) =>
  directory === undefined ? undefined : { directory }

const resolveLayers = (
  options: StorageLayerOptions | undefined,
  kind: "filesystem" | "bun",
  mode: "standard" | "journaled"
) => {
  const directory = resolveDirectory(options?.directory)
  const tenantScope = resolveTenantScope(options?.tenant)
  const journaled = mode === "journaled"
  const chatOptions = journaled
    ? {
        ...(directory ?? {}),
        prefix: tenantScope.chatPrefix,
        journalKey: tenantScope.chatJournalKey,
        identityKey: tenantScope.chatIdentityKey
      }
    : {
        ...(directory ?? {}),
        prefix: tenantScope.chatPrefix
      }
  const artifactOptions = journaled
    ? {
        ...(directory ?? {}),
        prefix: tenantScope.artifactPrefix,
        journalKey: tenantScope.artifactJournalKey,
        identityKey: tenantScope.artifactIdentityKey
      }
    : {
        ...(directory ?? {}),
        prefix: tenantScope.artifactPrefix
      }
  const auditOptions = {
    ...(directory ?? {}),
    journalKey: tenantScope.auditJournalKey,
    identityKey: tenantScope.auditIdentityKey
  }
  const sessionOptions = {
    ...(directory ?? {}),
    prefix: tenantScope.sessionIndexPrefix
  }
  return {
    chatHistory: kind === "bun"
      ? journaled
        ? ChatHistoryStore.layerJournaledFileSystemBun(chatOptions)
        : ChatHistoryStore.layerFileSystemBun(chatOptions)
      : journaled
        ? ChatHistoryStore.layerJournaledFileSystem(chatOptions)
        : ChatHistoryStore.layerFileSystem(chatOptions),
    artifacts: kind === "bun"
      ? journaled
        ? ArtifactStore.layerJournaledFileSystemBun(artifactOptions)
        : ArtifactStore.layerFileSystemBun(artifactOptions)
      : journaled
        ? ArtifactStore.layerJournaledFileSystem(artifactOptions)
        : ArtifactStore.layerFileSystem(artifactOptions),
    auditLog: kind === "bun"
      ? AuditEventStore.layerFileSystemBun(auditOptions)
      : AuditEventStore.layerFileSystem(auditOptions),
    sessionIndex: kind === "bun"
      ? SessionIndexStore.layerFileSystemBun(sessionOptions)
      : SessionIndexStore.layerFileSystem(sessionOptions)
  }
}

const resolveLayersFromKvs = <R>(
  kvsLayer: Layer.Layer<KeyValueStore.KeyValueStore, unknown, R>,
  mode: StorageMode,
  tenant: string | undefined
): StorageLayers<unknown, R> => {
  const tenantScope = resolveTenantScope(tenant)
  return {
    chatHistory: mode === "journaled"
      ? ChatHistoryStore.layerJournaled({
          prefix: tenantScope.chatPrefix,
          journalKey: tenantScope.chatJournalKey,
          identityKey: tenantScope.chatIdentityKey
        }).pipe(Layer.provide(kvsLayer))
      : ChatHistoryStore.layerKeyValueStore({
          prefix: tenantScope.chatPrefix
        }).pipe(Layer.provide(kvsLayer)),
    artifacts: mode === "journaled"
      ? ArtifactStore.layerJournaled({
          prefix: tenantScope.artifactPrefix,
          journalKey: tenantScope.artifactJournalKey,
          identityKey: tenantScope.artifactIdentityKey
        }).pipe(Layer.provide(kvsLayer))
      : ArtifactStore.layerKeyValueStore({
          prefix: tenantScope.artifactPrefix
        }).pipe(Layer.provide(kvsLayer)),
    auditLog: AuditEventStore.layerKeyValueStore({
      journalKey: tenantScope.auditJournalKey,
      identityKey: tenantScope.auditIdentityKey
    }).pipe(Layer.provide(kvsLayer)),
    sessionIndex: SessionIndexStore.layerKeyValueStore({
      prefix: tenantScope.sessionIndexPrefix
    }).pipe(Layer.provide(kvsLayer))
  }
}

const mergeLayers = <E, R>(layers: StorageLayers<E, R>) =>
  Layer.mergeAll(
    layers.chatHistory,
    layers.artifacts,
    layers.auditLog,
    layers.sessionIndex
  )

type BunDependencies = FileSystem | Path

const provideBunLayers = <E, R>(
  layers: StorageLayers<E, R>
): StorageLayers<E, Exclude<R, BunDependencies>> => ({
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
})

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
  return provideBunLayers(layers)
}

export const layersFileSystemBunJournaled = (
  options?: StorageLayerOptions
): StorageLayers<unknown, never> => {
  const layers = resolveLayers(options, "bun", "journaled")
  return provideBunLayers(layers)
}

export const layerFileSystem = (options?: StorageLayerOptions) => {
  const layers = resolveLayers(options, "filesystem", "standard")
  return mergeLayers(layers)
}

export const layerFileSystemBun = (options?: StorageLayerOptions) => {
  const layers = layersFileSystemBun(options)
  return mergeLayers(layers)
}

export const layerFileSystemJournaled = (options?: StorageLayerOptions) => {
  const layers = resolveLayers(options, "filesystem", "journaled")
  return mergeLayers(layers)
}

export const layerFileSystemBunJournaled = (options?: StorageLayerOptions) => {
  const layers = layersFileSystemBunJournaled(options)
  return mergeLayers(layers)
}

const resolveSyncOptions = (options?: StorageSyncLayerOptions<unknown>) =>
  options?.disablePing !== undefined || options?.protocols !== undefined
    ? {
        ...(options?.disablePing !== undefined ? { disablePing: options.disablePing } : {}),
        ...(options?.protocols !== undefined ? { protocols: options.protocols } : {})
      }
    : undefined

const resolveSyncFlags = (options?: StorageSyncLayerOptions<unknown>) => ({
  syncChatHistory: options?.syncChatHistory ?? true,
  syncArtifacts: options?.syncArtifacts ?? false,
  exposeSync: options?.exposeSync ?? false
})

const buildChatSyncLayers = <RBase, ROptions>(
  url: string,
  options: StorageSyncLayerOptions<ROptions> | undefined,
  kvsLayer: Layer.Layer<KeyValueStore.KeyValueStore, unknown, RBase>
): {
  readonly chatHistory: Layer.Layer<ChatHistoryStore, unknown, RBase | ROptions>
  readonly syncLayer: Layer.Layer<SyncService, unknown, RBase | ROptions>
} => {
  const tenantScope = resolveTenantScope(options?.tenant)
  const baseLayer = ChatHistoryStore.layerJournaledWithEventLog(
    {
      prefix: tenantScope.chatPrefix,
      journalKey: tenantScope.chatJournalKey,
      identityKey: tenantScope.chatIdentityKey,
      ...(options?.conflictPolicy !== undefined
        ? { conflictPolicy: options.conflictPolicy }
        : {})
    }
  ).pipe(Layer.provide(kvsLayer))
  const chatHistory = Layer.project(
    baseLayer,
    ChatHistoryStore,
    ChatHistoryStore,
    (store) => store
  )
  let syncLayer = SyncService.layerWebSocket(
    url,
    resolveSyncOptions(options)
  ).pipe(Layer.provide(baseLayer))
  if (options?.syncInterval !== undefined) {
    syncLayer = syncLayer.pipe(
      Layer.provide(SyncConfig.layer({ syncInterval: options.syncInterval }))
    )
  }
  return { chatHistory, syncLayer }
}

const buildJournaledSyncLayers = <RBase, ROptions>(
  url: string,
  options: StorageSyncLayerOptions<ROptions> | undefined,
  baseLayers: StorageLayers<unknown, RBase>,
  kvsLayer: Layer.Layer<KeyValueStore.KeyValueStore, unknown, RBase>
): StorageLayersWithSync<unknown, RBase | ROptions> => {
  const tenantScope = resolveTenantScope(options?.tenant)
  const flags = resolveSyncFlags(options)
  let syncLayer: Layer.Layer<SyncService, unknown, RBase | ROptions> | undefined
  const chatHistory = flags.syncChatHistory
    ? flags.exposeSync
      ? (() => {
          const chatSync = buildChatSyncLayers(url, options, kvsLayer)
          syncLayer = chatSync.syncLayer
          return chatSync.chatHistory
        })()
      : ChatHistoryStore.layerJournaledWithSyncWebSocket(
          url,
          {
            prefix: tenantScope.chatPrefix,
            journalKey: tenantScope.chatJournalKey,
            identityKey: tenantScope.chatIdentityKey,
            ...(options?.syncInterval !== undefined
              ? { syncInterval: options.syncInterval }
              : {}),
            ...(options?.disablePing !== undefined
              ? { disablePing: options.disablePing }
              : {}),
            ...(options?.protocols !== undefined ? { protocols: options.protocols } : {}),
            ...(options?.conflictPolicy !== undefined
              ? { conflictPolicy: options.conflictPolicy }
              : {})
          }
        ).pipe(Layer.provide(kvsLayer))
    : baseLayers.chatHistory

  const artifacts = flags.syncArtifacts
    ? ArtifactStore.layerJournaledWithSyncWebSocket(
        url,
        {
          prefix: tenantScope.artifactPrefix,
          journalKey: tenantScope.artifactJournalKey,
          identityKey: tenantScope.artifactIdentityKey,
          ...(options?.syncInterval !== undefined
            ? { syncInterval: options.syncInterval }
            : {}),
          ...(options?.disablePing !== undefined
            ? { disablePing: options.disablePing }
            : {}),
          ...(options?.protocols !== undefined ? { protocols: options.protocols } : {}),
          ...(options?.conflictPolicy !== undefined
            ? { conflictPolicy: options.conflictPolicy }
            : {})
        }
      ).pipe(Layer.provide(kvsLayer))
    : baseLayers.artifacts

  return {
    chatHistory,
    artifacts,
    auditLog: baseLayers.auditLog,
    sessionIndex: baseLayers.sessionIndex,
    ...(syncLayer ? { sync: syncLayer } : {})
  }
}

const layersFileSystemJournaledWithSyncWebSocket = <R = never>(
  url: string,
  options?: StorageSyncLayerOptions<R>
): StorageLayersWithSync<unknown, FileSystem | Path | R> => {
  const directory = options?.directory
  const kvsLayer = KeyValueStore.layerFileSystem(
    directory ?? defaultStorageDirectory
  )
  const baseLayers = layersFileSystemJournaled(
    {
      ...(directory !== undefined ? { directory } : {}),
      ...(options?.tenant !== undefined ? { tenant: options.tenant } : {})
    }
  )
  return buildJournaledSyncLayers(url, options, baseLayers, kvsLayer)
}

export const layersFileSystemBunJournaledWithSyncWebSocket = <R = never>(
  url: string,
  options?: StorageSyncLayerOptions<R>
): StorageLayersWithSync<unknown, R> => {
  const directory = options?.directory
  const kvsLayer = BunKeyValueStore.layerFileSystem(
    directory ?? defaultStorageDirectory
  )
  const baseLayers = layersFileSystemBunJournaled(
    {
      ...(directory !== undefined ? { directory } : {}),
      ...(options?.tenant !== undefined ? { tenant: options.tenant } : {})
    }
  )
  return buildJournaledSyncLayers(url, options, baseLayers, kvsLayer)
}

export const layerFileSystemBunJournaledWithSyncWebSocket = <R = never>(
  url: string,
  options?: StorageSyncLayerOptions<R>
) => {
  const layers = layersFileSystemBunJournaledWithSyncWebSocket(url, options)
  const combined = mergeLayers(layers)
  return layers.sync ? Layer.merge(combined, layers.sync) : combined
}

export function layers(
  options?: StorageLayerBundleOptions & { readonly backend?: "bun" }
): StorageLayersWithSync<unknown, never>
export function layers(
  options: StorageLayerBundleOptions & { readonly backend: "filesystem" }
): StorageLayersWithSync<unknown, FileSystem | Path>
export function layers(
  options: StorageLayerBundleOptions & { readonly backend: "r2" }
): StorageLayersWithSync<unknown, never>
export function layers(
  options: StorageLayerBundleOptions & { readonly backend: "kv" }
): StorageLayersWithSync<unknown, never>
export function layers(
  options?: StorageLayerBundleOptions
): StorageLayersWithSync<unknown, never> | StorageLayersWithSync<unknown, FileSystem | Path>
export function layers(
  options: StorageLayerBundleOptions = {}
): StorageLayersWithSync<unknown, never> | StorageLayersWithSync<unknown, FileSystem | Path> {
  validateTenant(options.tenant)
  const backend = options.backend ?? "bun"
  const mode = options.sync ? "journaled" : (options.mode ?? "standard")
  const directory = options.directory

  if (backend === "bun") {
    if (options.sync) {
      return layersFileSystemBunJournaledWithSyncWebSocket(
        options.sync.url,
        {
          ...options.sync,
          ...(directory !== undefined ? { directory } : {}),
          ...(options.tenant !== undefined ? { tenant: options.tenant } : {})
        }
      ) as StorageLayersWithSync<unknown, never>
    }
    return mode === "journaled"
      ? (layersFileSystemBunJournaled(
          {
            ...(directory !== undefined ? { directory } : {}),
            ...(options.tenant !== undefined ? { tenant: options.tenant } : {})
          }
        ) as StorageLayersWithSync<unknown, never>)
      : (layersFileSystemBun(
          {
            ...(directory !== undefined ? { directory } : {}),
            ...(options.tenant !== undefined ? { tenant: options.tenant } : {})
          }
        ) as StorageLayersWithSync<unknown, never>)
  }

  if (backend === "r2") {
    if (!options.bindings?.r2Bucket) {
      throw new Error("StorageLayers: backend 'r2' requires bindings.r2Bucket")
    }
    if (options.sync) {
      throw new Error(
        "StorageLayers: 'sync' is not yet supported with backend 'r2'. Use backend 'bun' or 'filesystem' for sync-enabled storage."
      )
    }
    const kvsLayer = layerR2(options.bindings.r2Bucket)
    return resolveLayersFromKvs(kvsLayer, mode, options.tenant) as StorageLayersWithSync<unknown, never>
  }

  if (backend === "kv") {
    if (options.allowUnsafeKv !== true) {
      throw new Error(
        "StorageLayers: backend 'kv' is disabled by default for runtime storage due KV's 1 write/sec/key limit. Prefer backend 'r2'. Set allowUnsafeKv: true to override."
      )
    }
    if (!options.bindings?.kvNamespace) {
      throw new Error("StorageLayers: backend 'kv' requires bindings.kvNamespace")
    }
    if (options.sync) {
      throw new Error(
        "StorageLayers: 'sync' is not yet supported with backend 'kv'. Use backend 'bun' or 'filesystem' for sync-enabled storage."
      )
    }
    if (mode === "journaled") {
      throw new Error(
        "StorageLayers: backend 'kv' cannot be used with mode 'journaled'. KV's 1 write/sec/key limit is incompatible with EventLog write patterns."
      )
    }
    const kvsLayer = layerKV(options.bindings.kvNamespace)
    return resolveLayersFromKvs(kvsLayer, mode, options.tenant) as StorageLayersWithSync<unknown, never>
  }

  if (options.sync) {
    return layersFileSystemJournaledWithSyncWebSocket(
      options.sync.url,
      {
        ...options.sync,
        ...(directory !== undefined ? { directory } : {}),
        ...(options.tenant !== undefined ? { tenant: options.tenant } : {})
      }
    ) as StorageLayersWithSync<unknown, FileSystem | Path>
  }

  return mode === "journaled"
    ? (layersFileSystemJournaled(
        {
          ...(directory !== undefined ? { directory } : {}),
          ...(options.tenant !== undefined ? { tenant: options.tenant } : {})
        }
      ) as StorageLayersWithSync<unknown, FileSystem | Path>)
    : (layersFileSystem(
        {
          ...(directory !== undefined ? { directory } : {}),
          ...(options.tenant !== undefined ? { tenant: options.tenant } : {})
        }
      ) as StorageLayersWithSync<unknown, FileSystem | Path>)
}
