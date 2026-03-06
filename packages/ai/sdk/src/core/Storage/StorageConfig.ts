import { $AiSdkId } from "@beep/identity/packages";
import { Config, Duration, Effect, Layer, ServiceMap } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { layerConfigFromEnv } from "../internal/config.js";

const $I = $AiSdkId.create("core/Storage/StorageConfig");
const StorageDuration = S.DurationFromMillis.annotate(
  $I.annote("StorageDuration", {
    description: "Runtime duration value used by storage configuration after config decoding.",
  })
);

/**
 * @since 0.0.0
 */
class StorageEnabledConfig extends S.Class<StorageEnabledConfig>($I`StorageEnabledConfig`)(
  {
    chatHistory: S.Boolean,
    artifacts: S.Boolean,
    auditLog: S.Boolean,
  },
  $I.annote("StorageEnabledConfig", {
    description: "Feature toggles controlling storage subsystems.",
  })
) {}

class StorageChatRetention extends S.Class<StorageChatRetention>($I`StorageChatRetention`)(
  {
    maxEvents: S.Number,
    maxAge: StorageDuration,
  },
  $I.annote("StorageChatRetention", {
    description: "Retention limits applied to stored chat history events.",
  })
) {}

class StorageArtifactRetention extends S.Class<StorageArtifactRetention>($I`StorageArtifactRetention`)(
  {
    maxArtifacts: S.Number,
    maxArtifactBytes: S.Number,
    maxAge: StorageDuration,
  },
  $I.annote("StorageArtifactRetention", {
    description: "Retention limits applied to persisted artifacts.",
  })
) {}

class StorageAuditRetention extends S.Class<StorageAuditRetention>($I`StorageAuditRetention`)(
  {
    maxEntries: S.Number,
    maxAge: StorageDuration,
  },
  $I.annote("StorageAuditRetention", {
    description: "Retention limits applied to persisted audit log entries.",
  })
) {}

class StorageRetentionConfig extends S.Class<StorageRetentionConfig>($I`StorageRetentionConfig`)(
  {
    chat: StorageChatRetention,
    artifacts: StorageArtifactRetention,
    audit: StorageAuditRetention,
  },
  $I.annote("StorageRetentionConfig", {
    description: "Retention settings grouped by storage domain.",
  })
) {}

class StoragePaginationConfig extends S.Class<StoragePaginationConfig>($I`StoragePaginationConfig`)(
  {
    chatPageSize: S.Number,
    artifactPageSize: S.Number,
  },
  $I.annote("StoragePaginationConfig", {
    description: "Pagination settings for storage list APIs.",
  })
) {}

class StorageKvConfig extends S.Class<StorageKvConfig>($I`StorageKvConfig`)(
  {
    indexPageSize: S.Number,
  },
  $I.annote("StorageKvConfig", {
    description: "Key-value store tuning values for storage indexes.",
  })
) {}

class StorageCleanupConfig extends S.Class<StorageCleanupConfig>($I`StorageCleanupConfig`)(
  {
    enabled: S.Boolean,
    interval: StorageDuration,
    runOnStart: S.Boolean,
  },
  $I.annote("StorageCleanupConfig", {
    description: "Background cleanup configuration for storage maintenance.",
  })
) {}

class StorageSyncConfig extends S.Class<StorageSyncConfig>($I`StorageSyncConfig`)(
  {
    interval: StorageDuration,
  },
  $I.annote("StorageSyncConfig", {
    description: "Storage synchronization cadence settings.",
  })
) {}

/**
 * @since 0.0.0
 */
export class StorageConfigData extends S.Class<StorageConfigData>($I`StorageConfigData`)(
  {
    enabled: StorageEnabledConfig,
    retention: StorageRetentionConfig,
    pagination: StoragePaginationConfig,
    kv: StorageKvConfig,
    cleanup: StorageCleanupConfig,
    sync: StorageSyncConfig,
  },
  $I.annote("StorageConfigData", {
    description: "Fully resolved runtime storage configuration data.",
  })
) {}

/**
 * @since 0.0.0
 */
export class StorageConfigSettings extends S.Class<StorageConfigSettings>($I`StorageConfigSettings`)(
  {
    settings: StorageConfigData,
  },
  $I.annote("StorageConfigSettings", {
    description: "StorageConfig service payload containing resolved storage settings.",
  })
) {}

/**
 * @since 0.0.0
 */
export type StorageConfigShape = StorageConfigSettings;

const defaultSettings = new StorageConfigData({
  enabled: new StorageEnabledConfig({
    chatHistory: true,
    artifacts: true,
    auditLog: false,
  }),
  retention: new StorageRetentionConfig({
    chat: new StorageChatRetention({
      maxEvents: 10_000,
      maxAge: Duration.days(30),
    }),
    artifacts: new StorageArtifactRetention({
      maxArtifacts: 5_000,
      maxArtifactBytes: 500_000_000,
      maxAge: Duration.days(90),
    }),
    audit: new StorageAuditRetention({
      maxEntries: 100_000,
      maxAge: Duration.days(180),
    }),
  }),
  pagination: new StoragePaginationConfig({
    chatPageSize: 100,
    artifactPageSize: 100,
  }),
  kv: new StorageKvConfig({
    indexPageSize: 500,
  }),
  cleanup: new StorageCleanupConfig({
    enabled: true,
    interval: Duration.hours(1),
    runOnStart: false,
  }),
  sync: new StorageSyncConfig({
    interval: Duration.millis(0),
  }),
});
const thunkFallback =
  <T>(fallback: T) =>
  () =>
    fallback;
const normalizeBoolean = (value: O.Option<boolean>, fallback: boolean) => O.getOrElse(value, thunkFallback(fallback));

const normalizeNumber = (value: O.Option<number>, fallback: number, min: number) =>
  Math.max(min, O.getOrElse(value, thunkFallback(fallback)));

const normalizeDuration = (value: O.Option<Duration.Duration>, fallback: Duration.Duration) =>
  O.getOrElse(value, thunkFallback(fallback));

const makeStorageConfig = Effect.gen(function* () {
  const chatEnabled = yield* Config.option(Config.boolean("STORAGE_CHAT_ENABLED"));
  const artifactsEnabled = yield* Config.option(Config.boolean("STORAGE_ARTIFACTS_ENABLED"));
  const auditEnabled = yield* Config.option(Config.boolean("STORAGE_AUDIT_ENABLED"));

  const chatMaxEvents = yield* Config.option(Config.int("STORAGE_CHAT_MAX_EVENTS"));
  const chatMaxAge = yield* Config.option(Config.duration("STORAGE_CHAT_MAX_AGE"));

  const artifactMaxCount = yield* Config.option(Config.int("STORAGE_ARTIFACT_MAX_COUNT"));
  const artifactMaxBytes = yield* Config.option(Config.int("STORAGE_ARTIFACT_MAX_BYTES"));
  const artifactMaxAge = yield* Config.option(Config.duration("STORAGE_ARTIFACT_MAX_AGE"));

  const auditMaxEntries = yield* Config.option(Config.int("STORAGE_AUDIT_MAX_ENTRIES"));
  const auditMaxAge = yield* Config.option(Config.duration("STORAGE_AUDIT_MAX_AGE"));

  const chatPageSize = yield* Config.option(Config.int("STORAGE_CHAT_PAGE_SIZE"));
  const artifactPageSize = yield* Config.option(Config.int("STORAGE_ARTIFACT_PAGE_SIZE"));
  const indexPageSize = yield* Config.option(Config.int("STORAGE_INDEX_PAGE_SIZE"));

  const cleanupEnabled = yield* Config.option(Config.boolean("STORAGE_CLEANUP_ENABLED"));
  const cleanupInterval = yield* Config.option(Config.duration("STORAGE_CLEANUP_INTERVAL"));
  const cleanupRunOnStart = yield* Config.option(Config.boolean("STORAGE_CLEANUP_RUN_ON_START"));
  const syncInterval = yield* Config.option(Config.duration("STORAGE_SYNC_INTERVAL"));

  const settings = new StorageConfigData({
    enabled: new StorageEnabledConfig({
      chatHistory: normalizeBoolean(chatEnabled, defaultSettings.enabled.chatHistory),
      artifacts: normalizeBoolean(artifactsEnabled, defaultSettings.enabled.artifacts),
      auditLog: normalizeBoolean(auditEnabled, defaultSettings.enabled.auditLog),
    }),
    retention: new StorageRetentionConfig({
      chat: new StorageChatRetention({
        maxEvents: normalizeNumber(chatMaxEvents, defaultSettings.retention.chat.maxEvents, 0),
        maxAge: normalizeDuration(chatMaxAge, defaultSettings.retention.chat.maxAge),
      }),
      artifacts: new StorageArtifactRetention({
        maxArtifacts: normalizeNumber(artifactMaxCount, defaultSettings.retention.artifacts.maxArtifacts, 0),
        maxArtifactBytes: normalizeNumber(artifactMaxBytes, defaultSettings.retention.artifacts.maxArtifactBytes, 0),
        maxAge: normalizeDuration(artifactMaxAge, defaultSettings.retention.artifacts.maxAge),
      }),
      audit: new StorageAuditRetention({
        maxEntries: normalizeNumber(auditMaxEntries, defaultSettings.retention.audit.maxEntries, 0),
        maxAge: normalizeDuration(auditMaxAge, defaultSettings.retention.audit.maxAge),
      }),
    }),
    pagination: new StoragePaginationConfig({
      chatPageSize: normalizeNumber(chatPageSize, defaultSettings.pagination.chatPageSize, 1),
      artifactPageSize: normalizeNumber(artifactPageSize, defaultSettings.pagination.artifactPageSize, 1),
    }),
    kv: new StorageKvConfig({
      indexPageSize: normalizeNumber(indexPageSize, defaultSettings.kv.indexPageSize, 1),
    }),
    cleanup: new StorageCleanupConfig({
      enabled: normalizeBoolean(cleanupEnabled, defaultSettings.cleanup.enabled),
      interval: normalizeDuration(cleanupInterval, defaultSettings.cleanup.interval),
      runOnStart: normalizeBoolean(cleanupRunOnStart, defaultSettings.cleanup.runOnStart),
    }),
    sync: new StorageSyncConfig({
      interval: normalizeDuration(syncInterval, defaultSettings.sync.interval),
    }),
  });

  return new StorageConfigSettings({ settings });
});
// export class AgentConfig extends ServiceMap.Service<AgentConfig, { readonly projectDir: string }>()($I`AgentConfig`) {}
//  Effect.Effect<, Config.ConfigError, never>
/**
 * @since 0.0.0
 */
export class StorageConfig extends ServiceMap.Service<StorageConfig, StorageConfigShape>()($I`StorageConfig`) {
  /**
   * Build StorageConfig by reading configuration from environment variables.
   */
  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    StorageConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)));

  /**
   * Default configuration layer for storage.
   */
  static readonly layer = Layer.effect(StorageConfig, makeStorageConfig);
}
