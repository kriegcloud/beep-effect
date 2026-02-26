import { BunFileSystem, BunPath } from "@effect/platform-bun"
import * as Duration from "effect/Duration"
import * as Layer from "effect/Layer"
import * as ManagedRuntime from "effect/ManagedRuntime"
import { AgentRuntime, type PersistenceLayers } from "./AgentRuntime.js"
import { AgentRuntimeConfig } from "./AgentRuntimeConfig.js"
import { AgentSdk } from "./AgentSdk.js"
import { AgentSdkConfig } from "./AgentSdkConfig.js"
import { ConfigError } from "./Errors.js"
import { QuerySupervisor } from "./QuerySupervisor.js"
import { QuerySupervisorConfig, type QuerySupervisorSettings } from "./QuerySupervisorConfig.js"
import { layerCloudflare, type CloudflareSandboxEnv } from "./Sandbox/SandboxCloudflare.js"
import { layerLocal } from "./Sandbox/SandboxLocal.js"
import { SandboxService } from "./Sandbox/SandboxService.js"
import { ArtifactStore } from "./Storage/ArtifactStore.js"
import { AuditEventStore } from "./Storage/AuditEventStore.js"
import { ChatHistoryStore } from "./Storage/ChatHistoryStore.js"
import { SessionIndexStore } from "./Storage/SessionIndexStore.js"
import { StorageConfig } from "./Storage/StorageConfig.js"
import {
  layers as storageLayers,
  type CloudflareStorageBindings,
  type StorageBackend,
  type StorageMode
} from "./Storage/StorageLayers.js"

type QuickConfigCloudflareSandbox = {
  readonly provider: "cloudflare"
  readonly sandboxId: string
  readonly env: CloudflareSandboxEnv
  readonly sleepAfter?: string
  readonly apiKey?: string
  readonly sessionAccessToken?: string
  readonly envVars?: Record<string, string | undefined>
  readonly execTimeoutMs?: number
}

export type QuickConfig = {
  readonly apiKey?: string
  readonly model?: string
  readonly timeout?: Duration.DurationInput
  readonly concurrency?: number
  readonly persistence?:
    | "memory"
    | "filesystem"
    | { readonly directory: string }
    | { readonly sync: string }
  // Execution backend. Different from Options.sandbox (Claude Code sandbox flags).
  readonly sandbox?: "local" | QuickConfigCloudflareSandbox
  readonly supervisor?: Partial<QuerySupervisorSettings>
  readonly storageBackend?: StorageBackend
  readonly storageMode?: StorageMode
  readonly storageBindings?: CloudflareStorageBindings
  readonly allowUnsafeKv?: boolean
  readonly tenant?: string
}

type ResolvedQuickConfig = {
  readonly apiKey?: string
  readonly model?: string
  readonly timeout: Duration.DurationInput
  readonly concurrency: number
  readonly persistence: NonNullable<QuickConfig["persistence"]>
  readonly sandbox?: QuickConfig["sandbox"]
  readonly supervisor?: Partial<QuerySupervisorSettings>
  readonly storageBackend?: StorageBackend
  readonly storageMode?: StorageMode
  readonly storageBindings?: CloudflareStorageBindings
  readonly allowUnsafeKv?: boolean
  readonly tenant?: string
}

const resolveQuickConfig = (config?: QuickConfig): ResolvedQuickConfig => ({
  ...(config?.apiKey !== undefined ? { apiKey: config.apiKey } : {}),
  ...(config?.model !== undefined ? { model: config.model } : {}),
  ...(config?.sandbox !== undefined ? { sandbox: config.sandbox } : {}),
  ...(config?.supervisor !== undefined ? { supervisor: config.supervisor } : {}),
  ...(config?.storageBackend !== undefined ? { storageBackend: config.storageBackend } : {}),
  ...(config?.storageMode !== undefined ? { storageMode: config.storageMode } : {}),
  ...(config?.storageBindings !== undefined ? { storageBindings: config.storageBindings } : {}),
  ...(config?.allowUnsafeKv !== undefined ? { allowUnsafeKv: config.allowUnsafeKv } : {}),
  ...(config?.tenant !== undefined ? { tenant: config.tenant } : {}),
  timeout: config?.timeout ?? Duration.minutes(5),
  concurrency: config?.concurrency ?? 4,
  persistence: config?.persistence ?? "memory"
})

const tenantPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/

const validateQuickConfig = (config: ResolvedQuickConfig) => {
  const backend = config.storageBackend
  const mode = config.storageMode
  const isSyncPersistence = typeof config.persistence === "object" && "sync" in config.persistence

  if (backend === "kv" && mode === "journaled") {
    throw ConfigError.make({
      message: "QuickConfig: storageBackend 'kv' cannot be used with storageMode 'journaled'."
    })
  }

  if (backend === "kv" && config.allowUnsafeKv !== true) {
    throw ConfigError.make({
      message:
        "QuickConfig: storageBackend 'kv' is disabled by default due KV's 1 write/sec/key limit. Prefer storageBackend 'r2', or set allowUnsafeKv: true to override."
    })
  }

  if (isSyncPersistence && (backend === "r2" || backend === "kv")) {
    throw ConfigError.make({
      message: `QuickConfig: persistence.sync is not supported with storageBackend '${backend}'. Use backend 'bun' or 'filesystem'.`
    })
  }

  if (config.tenant !== undefined && !tenantPattern.test(config.tenant)) {
    throw ConfigError.make({
      message: "QuickConfig: invalid tenant format. Expected /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/."
    })
  }
}

type RuntimeParts = {
  readonly runtime: Layer.Layer<AgentRuntime, unknown, never>
  readonly supervisor: Layer.Layer<QuerySupervisor, unknown, never>
}

const buildRuntimeParts = (config: ResolvedQuickConfig): RuntimeParts => {
  const runtimeConfigLayer = AgentRuntimeConfig.layerWith({
    queryTimeout: Duration.decode(config.timeout)
  })
  const supervisorConfigLayer = QuerySupervisorConfig.layerWith({
    concurrencyLimit: config.concurrency,
    ...config.supervisor
  })
  const sdkOverrides: { apiKey?: string; model?: string } = {}
  if (config.apiKey !== undefined) {
    sdkOverrides.apiKey = config.apiKey
  }
  if (config.model !== undefined) {
    sdkOverrides.model = config.model
  }
  const sdkConfigLayer = Object.keys(sdkOverrides).length > 0
    ? AgentSdkConfig.layerWithOverrides(sdkOverrides)
    : AgentSdkConfig.layer

  const sdkLayer = AgentSdk.layer.pipe(
    Layer.provide(sdkConfigLayer)
  )

  const supervisorLayer = QuerySupervisor.layer.pipe(
    Layer.provide(supervisorConfigLayer),
    Layer.provide(sdkLayer)
  )

  const runtime = AgentRuntime.layer.pipe(
    Layer.provide(runtimeConfigLayer),
    Layer.provide(supervisorLayer)
  )

  return { runtime, supervisor: supervisorLayer }
}

const memoryPersistenceLayers = (runtime: Layer.Layer<AgentRuntime, unknown, never>): PersistenceLayers => ({
  runtime,
  chatHistory: ChatHistoryStore.layerMemory,
  artifacts: ArtifactStore.layerMemory,
  auditLog: AuditEventStore.layerMemory,
  sessionIndex: SessionIndexStore.layerMemory,
  storageConfig: StorageConfig.layer
})

const resolveSandboxLayer = (
  config: ResolvedQuickConfig
):
  | Layer.Layer<SandboxService, unknown, QuerySupervisor>
  | Layer.Layer<SandboxService, unknown, never>
  | undefined => {
  if (!config.sandbox) return undefined
  if (config.sandbox === "local") {
    return layerLocal
  }
  return layerCloudflare({
    env: config.sandbox.env,
    sandboxId: config.sandbox.sandboxId,
    ...(config.sandbox.sleepAfter !== undefined
      ? { sleepAfter: config.sandbox.sleepAfter }
      : {}),
    ...(config.sandbox.apiKey !== undefined ? { apiKey: config.sandbox.apiKey } : {}),
    ...(config.sandbox.sessionAccessToken !== undefined
      ? { sessionAccessToken: config.sandbox.sessionAccessToken }
      : {}),
    ...(config.sandbox.envVars !== undefined ? { envVars: config.sandbox.envVars } : {}),
    ...(config.sandbox.execTimeoutMs !== undefined
      ? { execTimeoutMs: config.sandbox.execTimeoutMs }
      : {})
  })
}

const resolveStorageLayers = (config: ResolvedQuickConfig) => {
  const backend = config.storageBackend ?? "bun"
  const mode = config.storageMode ?? "standard"
  const directory = typeof config.persistence === "object" && "directory" in config.persistence
    ? config.persistence.directory
    : undefined
  const commonOptions = {
    mode,
    ...(config.allowUnsafeKv !== undefined ? { allowUnsafeKv: config.allowUnsafeKv } : {}),
    ...(config.tenant !== undefined ? { tenant: config.tenant } : {}),
    ...(directory !== undefined ? { directory } : {}),
    ...(config.storageBindings !== undefined ? { bindings: config.storageBindings } : {})
  }
  switch (backend) {
    case "filesystem": {
      const layers = storageLayers({
        backend: "filesystem",
        ...commonOptions
      })
      const bunFileSystemLayers = [BunFileSystem.layer, BunPath.layer] as const
      return {
        chatHistory: layers.chatHistory.pipe(Layer.provide(bunFileSystemLayers)),
        artifacts: layers.artifacts.pipe(Layer.provide(bunFileSystemLayers)),
        auditLog: layers.auditLog.pipe(Layer.provide(bunFileSystemLayers)),
        sessionIndex: layers.sessionIndex.pipe(Layer.provide(bunFileSystemLayers))
      }
    }
    case "r2":
      return storageLayers({
        backend: "r2",
        ...commonOptions
      })
    case "kv":
      return storageLayers({
        backend: "kv",
        ...commonOptions
      })
    default:
      return storageLayers({
        backend: "bun",
        ...commonOptions
      })
  }
}

/**
 * Build a convenience AgentRuntime layer using simplified configuration.
 *
 * The returned layer provides `AgentRuntime` and `QuerySupervisor`.
 * When `sandbox` is configured, `SandboxService` is also provided.
 */
export function runtimeLayer(
  config: QuickConfig & { sandbox: NonNullable<QuickConfig["sandbox"]> }
): Layer.Layer<AgentRuntime | QuerySupervisor | SandboxService, unknown, never>
export function runtimeLayer(
  config?: QuickConfig
): Layer.Layer<AgentRuntime | QuerySupervisor, unknown, never>
export function runtimeLayer(config?: QuickConfig) {
  const resolved = resolveQuickConfig(config)
  validateQuickConfig(resolved)
  const { runtime, supervisor } = buildRuntimeParts(resolved)
  const sandboxLayer = resolveSandboxLayer(resolved)

  let persistence: Layer.Layer<AgentRuntime, unknown, never>

  if (resolved.persistence === "memory") {
    persistence = AgentRuntime.layerWithPersistence({
      layers: memoryPersistenceLayers(runtime)
    })
  } else if (typeof resolved.persistence === "object" && "sync" in resolved.persistence) {
    persistence = AgentRuntime.layerWithRemoteSync({
      url: resolved.persistence.sync,
      layers: {
        runtime
      }
    })
  } else {
    const storage = resolveStorageLayers(resolved)
    persistence = AgentRuntime.layerWithPersistence({
      layers: {
        runtime,
        chatHistory: storage.chatHistory,
        artifacts: storage.artifacts,
        auditLog: storage.auditLog,
        sessionIndex: storage.sessionIndex,
        storageConfig: StorageConfig.layer
      }
    })
  }

  const withSupervisor = Layer.merge(persistence, supervisor)
  if (sandboxLayer) {
    return sandboxLayer.pipe(Layer.provideMerge(withSupervisor))
  }
  return withSupervisor
}

/**
 * Build a ManagedRuntime from QuickConfig.
 *
 * Unlike `runtimeLayer()` (which returns a Layer for composition),
 * `managedRuntime()` returns a lifecycle-managed runtime with `.runPromise()`
 * and `.dispose()`. Services are baked in — no `Effect.provide` needed.
 *
 * Ideal for:
 * - Cloudflare Workers (cache per-isolate, reuse across requests)
 * - Multi-query sessions (avoid rebuilding layers per call)
 * - Scripts that want simpler lifecycle management
 */
export function managedRuntime(
  config: QuickConfig & { sandbox: NonNullable<QuickConfig["sandbox"]> }
): ManagedRuntime.ManagedRuntime<AgentRuntime | QuerySupervisor | SandboxService, unknown>
export function managedRuntime(
  config?: QuickConfig
): ManagedRuntime.ManagedRuntime<AgentRuntime | QuerySupervisor, unknown>
export function managedRuntime(config?: QuickConfig) {
  return ManagedRuntime.make(runtimeLayer(config))
}
