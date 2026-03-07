import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Duration, Effect, Layer, Match } from "effect";
import * as P from "effect/Predicate";
import { AgentRuntime, type PersistenceLayers } from "./AgentRuntime.js";
import { AgentRuntimeConfig } from "./AgentRuntimeConfig.js";
import { AgentSdk } from "./AgentSdk.js";
import { AgentSdkConfig } from "./AgentSdkConfig.js";
import { ConfigError } from "./Errors.js";
import { QuerySupervisor } from "./QuerySupervisor.js";
import { QuerySupervisorConfig, type QuerySupervisorSettings } from "./QuerySupervisorConfig.js";
import { type CloudflareSandboxEnv, layerCloudflare } from "./Sandbox/SandboxCloudflare.js";
import { layerLocal } from "./Sandbox/SandboxLocal.js";
import type { SandboxService } from "./Sandbox/SandboxService.js";
import { ArtifactStore, AuditEventStore, ChatHistoryStore, SessionIndexStore, StorageConfig } from "./Storage/index.js";
import {
  type CloudflareStorageBindings,
  type StorageBackend,
  type StorageMode,
  layers as storageLayers,
} from "./Storage/StorageLayers.js";

type QuickConfigCloudflareSandbox = {
  readonly provider: "cloudflare";
  readonly sandboxId: string;
  readonly env: CloudflareSandboxEnv;
  readonly sleepAfter?: string;
  readonly apiKey?: string;
  readonly sessionAccessToken?: string;
  readonly envVars?: Record<string, string | undefined>;
  readonly execTimeoutMs?: number;
};

/**
 * @since 0.0.0
 */
export type QuickConfig = Readonly<{
  readonly apiKey?: string;
  readonly model?: string;
  readonly timeout?: Duration.Input;
  readonly concurrency?: number;
  readonly persistence?: "memory" | "filesystem" | { readonly directory: string } | { readonly sync: string };
  // Execution backend. Different from Options.sandbox (Claude Code sandbox flags).
  readonly sandbox?: "local" | QuickConfigCloudflareSandbox;
  readonly supervisor?: Partial<QuerySupervisorSettings>;
  readonly storageBackend?: StorageBackend;
  readonly storageMode?: StorageMode;
  readonly storageBindings?: CloudflareStorageBindings;
  readonly allowUnsafeKv?: boolean;
  readonly tenant?: string;
}>;

type ResolvedQuickConfig = {
  readonly apiKey?: string;
  readonly model?: string;
  readonly timeout: Duration.Input;
  readonly concurrency: number;
  readonly persistence: NonNullable<QuickConfig["persistence"]>;
  readonly sandbox?: QuickConfig["sandbox"];
  readonly supervisor?: Partial<QuerySupervisorSettings>;
  readonly storageBackend?: StorageBackend;
  readonly storageMode?: StorageMode;
  readonly storageBindings?: CloudflareStorageBindings;
  readonly allowUnsafeKv?: boolean;
  readonly tenant?: string;
};

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
  persistence: config?.persistence ?? "memory",
});

const tenantPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

const failConfig = (message: string): Effect.Effect<never, ConfigError> =>
  Effect.fail(
    ConfigError.make({
      message,
    })
  );

const validateQuickConfig = Effect.fn("QuickConfig.validateQuickConfig")(function* (config: ResolvedQuickConfig) {
  const backend = config.storageBackend;
  const mode = config.storageMode;
  const isSyncPersistence = P.isObject(config.persistence) && "sync" in config.persistence;

  if (backend === "kv" && mode === "journaled") {
    return yield* failConfig("QuickConfig: storageBackend 'kv' cannot be used with storageMode 'journaled'.");
  }

  if (backend === "kv" && config.allowUnsafeKv !== true) {
    return yield* failConfig(
      "QuickConfig: storageBackend 'kv' is disabled by default due KV's 1 write/sec/key limit. Prefer storageBackend 'r2', or set allowUnsafeKv: true to override."
    );
  }

  if (isSyncPersistence && (backend === "r2" || backend === "kv")) {
    return yield* failConfig(
      `QuickConfig: persistence.sync is not supported with storageBackend '${backend}'. Use backend 'bun' or 'filesystem'.`
    );
  }

  if (config.tenant !== undefined && !tenantPattern.test(config.tenant)) {
    return yield* failConfig("QuickConfig: invalid tenant format. Expected /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.");
  }
});

type RuntimeParts = {
  readonly runtime: Layer.Layer<AgentRuntime, unknown, never>;
  readonly supervisor: Layer.Layer<QuerySupervisor, unknown, never>;
};

const buildRuntimeParts = (config: ResolvedQuickConfig): RuntimeParts => {
  const runtimeConfigLayer = AgentRuntimeConfig.layerWith({
    queryTimeout: Duration.fromInput(config.timeout),
  });
  const supervisorConfigLayer = QuerySupervisorConfig.layerWith({
    concurrencyLimit: config.concurrency,
    ...config.supervisor,
  });
  const sdkOverrides = {
    ...(config.apiKey !== undefined ? { apiKey: config.apiKey } : {}),
    ...(config.model !== undefined ? { model: config.model } : {}),
  };
  const sdkConfigLayer =
    config.apiKey !== undefined || config.model !== undefined
      ? AgentSdkConfig.layerWithOverrides(sdkOverrides)
      : AgentSdkConfig.layer;

  const sdkLayer = AgentSdk.layer.pipe(Layer.provide(sdkConfigLayer));

  const supervisorLayer = QuerySupervisor.layer.pipe(Layer.provide(supervisorConfigLayer), Layer.provide(sdkLayer));

  const runtime = AgentRuntime.layer.pipe(Layer.provide(runtimeConfigLayer), Layer.provide(supervisorLayer));

  return { runtime, supervisor: supervisorLayer };
};

const memoryPersistenceLayers = (runtime: Layer.Layer<AgentRuntime, unknown, never>): PersistenceLayers => ({
  runtime,
  chatHistory: ChatHistoryStore.layerMemory,
  artifacts: ArtifactStore.layerMemory,
  auditLog: AuditEventStore.layerMemory,
  sessionIndex: SessionIndexStore.layerMemory,
  storageConfig: StorageConfig.layer,
});

const resolveSandboxLayer = (
  config: ResolvedQuickConfig
): Layer.Layer<SandboxService, unknown, QuerySupervisor> | Layer.Layer<SandboxService, unknown, never> | undefined => {
  if (!config.sandbox) return undefined;
  if (config.sandbox === "local") {
    return layerLocal;
  }
  return layerCloudflare({
    env: config.sandbox.env,
    sandboxId: config.sandbox.sandboxId,
    ...(config.sandbox.sleepAfter !== undefined ? { sleepAfter: config.sandbox.sleepAfter } : {}),
    ...(config.sandbox.apiKey !== undefined ? { apiKey: config.sandbox.apiKey } : {}),
    ...(config.sandbox.sessionAccessToken !== undefined
      ? { sessionAccessToken: config.sandbox.sessionAccessToken }
      : {}),
    ...(config.sandbox.envVars !== undefined ? { envVars: config.sandbox.envVars } : {}),
    ...(config.sandbox.execTimeoutMs !== undefined ? { execTimeoutMs: config.sandbox.execTimeoutMs } : {}),
  });
};

const resolveStorageLayers = (config: ResolvedQuickConfig) => {
  const backend = config.storageBackend ?? "bun";
  const mode = config.storageMode ?? "standard";
  const directory =
    P.isObject(config.persistence) && "directory" in config.persistence ? config.persistence.directory : undefined;
  const commonOptions = {
    mode,
    ...(config.allowUnsafeKv !== undefined ? { allowUnsafeKv: config.allowUnsafeKv } : {}),
    ...(config.tenant !== undefined ? { tenant: config.tenant } : {}),
    ...(directory !== undefined ? { directory } : {}),
    ...(config.storageBindings !== undefined ? { bindings: config.storageBindings } : {}),
  };

  return Match.value(backend).pipe(
    Match.when("filesystem", () => {
      const layers = storageLayers({
        backend: "filesystem",
        ...commonOptions,
      });
      const bunFileSystemLayer = Layer.merge(BunFileSystem.layer, BunPath.layer);
      return {
        chatHistory: layers.chatHistory.pipe(Layer.provide(bunFileSystemLayer)),
        artifacts: layers.artifacts.pipe(Layer.provide(bunFileSystemLayer)),
        auditLog: layers.auditLog.pipe(Layer.provide(bunFileSystemLayer)),
        sessionIndex: layers.sessionIndex.pipe(Layer.provide(bunFileSystemLayer)),
      };
    }),
    Match.when("r2", () =>
      storageLayers({
        backend: "r2",
        ...commonOptions,
      })
    ),
    Match.when("kv", () =>
      storageLayers({
        backend: "kv",
        ...commonOptions,
      })
    ),
    Match.orElse(() =>
      storageLayers({
        backend: "bun",
        ...commonOptions,
      })
    )
  );
};

const buildRuntimeLayer = (resolved: ResolvedQuickConfig) => {
  const { runtime, supervisor } = buildRuntimeParts(resolved);
  const sandboxLayer = resolveSandboxLayer(resolved);

  let persistence: Layer.Layer<AgentRuntime, unknown, unknown>;

  if (resolved.persistence === "memory") {
    persistence = AgentRuntime.layerWithPersistence({
      layers: memoryPersistenceLayers(runtime),
    });
  } else if (P.isObject(resolved.persistence) && "sync" in resolved.persistence) {
    persistence = AgentRuntime.layerWithRemoteSync({
      url: resolved.persistence.sync,
      layers: {
        runtime,
      },
    });
  } else {
    const storage = resolveStorageLayers(resolved);
    persistence = AgentRuntime.layerWithPersistence({
      layers: {
        runtime,
        chatHistory: storage.chatHistory,
        artifacts: storage.artifacts,
        auditLog: storage.auditLog,
        sessionIndex: storage.sessionIndex,
        storageConfig: StorageConfig.layer,
      },
    });
  }

  const withSupervisor = Layer.merge(persistence, supervisor);
  if (sandboxLayer) {
    return sandboxLayer.pipe(Layer.provideMerge(withSupervisor));
  }
  return withSupervisor;
};

/**
 * Build a convenience AgentRuntime layer using simplified configuration.
 *
 * The returned layer provides `AgentRuntime` and `QuerySupervisor`.
 * When `sandbox` is configured, `SandboxService` is also provided.
 */
/**
 * @since 0.0.0
 */
export function runtimeLayer(
  config: QuickConfig & { sandbox: NonNullable<QuickConfig["sandbox"]> }
): Layer.Layer<AgentRuntime | QuerySupervisor | SandboxService, unknown, unknown>;
/**
 * @since 0.0.0
 */
export function runtimeLayer(config?: QuickConfig): Layer.Layer<AgentRuntime | QuerySupervisor, unknown, unknown>;
/**
 * @since 0.0.0
 */
export function runtimeLayer(config?: QuickConfig) {
  const resolved = resolveQuickConfig(config);
  return Layer.unwrap(validateQuickConfig(resolved).pipe(Effect.map(() => buildRuntimeLayer(resolved))));
}

type RuntimeCreator = ReturnType<typeof runtimeLayer>;

/**
 * Build a convenience AgentRuntime layer using simplified configuration.
 *
 * The returned layer provides `AgentRuntime` and `QuerySupervisor`.
 * When `sandbox` is configured, `SandboxService` is also provided.
 */
/**
 * @since 0.0.0
 */
export function managedRuntime(config: QuickConfig & { sandbox: NonNullable<QuickConfig["sandbox"]> }): RuntimeCreator;
/**
 * @since 0.0.0
 */
export function managedRuntime(config?: QuickConfig): RuntimeCreator;
/**
 * @since 0.0.0
 */
export function managedRuntime(config?: QuickConfig): RuntimeCreator {
  return runtimeLayer(config);
}

/**
 * @since 0.0.0
 */
export const makeManagedRuntime = (config?: QuickConfig) => runtimeLayer(config);
