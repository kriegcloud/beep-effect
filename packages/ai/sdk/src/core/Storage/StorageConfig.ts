import { Config, Duration, Effect, Layer, ServiceMap } from "effect";
import * as O from "effect/Option";
import { layerConfigFromEnv } from "../internal/config.js";
/**
 * @since 0.0.0
 */
export type StorageConfigData = {
  readonly enabled: {
    readonly chatHistory: boolean;
    readonly artifacts: boolean;
    readonly auditLog: boolean;
  };
  readonly retention: {
    readonly chat: {
      readonly maxEvents: number;
      readonly maxAge: Duration.Duration;
    };
    readonly artifacts: {
      readonly maxArtifacts: number;
      readonly maxArtifactBytes: number;
      readonly maxAge: Duration.Duration;
    };
    readonly audit: {
      readonly maxEntries: number;
      readonly maxAge: Duration.Duration;
    };
  };
  readonly pagination: {
    readonly chatPageSize: number;
    readonly artifactPageSize: number;
  };
  readonly kv: {
    readonly indexPageSize: number;
  };
  readonly cleanup: {
    readonly enabled: boolean;
    readonly interval: Duration.Duration;
    readonly runOnStart: boolean;
  };
  readonly sync: {
    readonly interval: Duration.Duration;
  };
};

/**
 * @since 0.0.0
 */
export type StorageConfigSettings = {
  readonly settings: StorageConfigData;
};

const defaultSettings: StorageConfigData = {
  enabled: {
    chatHistory: true,
    artifacts: true,
    auditLog: false,
  },
  retention: {
    chat: {
      maxEvents: 10_000,
      maxAge: Duration.days(30),
    },
    artifacts: {
      maxArtifacts: 5_000,
      maxArtifactBytes: 500_000_000,
      maxAge: Duration.days(90),
    },
    audit: {
      maxEntries: 100_000,
      maxAge: Duration.days(180),
    },
  },
  pagination: {
    chatPageSize: 100,
    artifactPageSize: 100,
  },
  kv: {
    indexPageSize: 500,
  },
  cleanup: {
    enabled: true,
    interval: Duration.hours(1),
    runOnStart: false,
  },
  sync: {
    interval: Duration.millis(0),
  },
};

const normalizeBoolean = (value: O.Option<boolean>, fallback: boolean) => O.getOrElse(value, () => fallback);

const normalizeNumber = (value: O.Option<number>, fallback: number, min: number) =>
  Math.max(
    min,
    O.getOrElse(value, () => fallback)
  );

const normalizeDuration = (value: O.Option<Duration.Duration>, fallback: Duration.Duration) =>
  O.getOrElse(value, () => fallback);

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

  const settings: StorageConfigData = {
    enabled: {
      chatHistory: normalizeBoolean(chatEnabled, defaultSettings.enabled.chatHistory),
      artifacts: normalizeBoolean(artifactsEnabled, defaultSettings.enabled.artifacts),
      auditLog: normalizeBoolean(auditEnabled, defaultSettings.enabled.auditLog),
    },
    retention: {
      chat: {
        maxEvents: normalizeNumber(chatMaxEvents, defaultSettings.retention.chat.maxEvents, 0),
        maxAge: normalizeDuration(chatMaxAge, defaultSettings.retention.chat.maxAge),
      },
      artifacts: {
        maxArtifacts: normalizeNumber(artifactMaxCount, defaultSettings.retention.artifacts.maxArtifacts, 0),
        maxArtifactBytes: normalizeNumber(artifactMaxBytes, defaultSettings.retention.artifacts.maxArtifactBytes, 0),
        maxAge: normalizeDuration(artifactMaxAge, defaultSettings.retention.artifacts.maxAge),
      },
      audit: {
        maxEntries: normalizeNumber(auditMaxEntries, defaultSettings.retention.audit.maxEntries, 0),
        maxAge: normalizeDuration(auditMaxAge, defaultSettings.retention.audit.maxAge),
      },
    },
    pagination: {
      chatPageSize: normalizeNumber(chatPageSize, defaultSettings.pagination.chatPageSize, 1),
      artifactPageSize: normalizeNumber(artifactPageSize, defaultSettings.pagination.artifactPageSize, 1),
    },
    kv: {
      indexPageSize: normalizeNumber(indexPageSize, defaultSettings.kv.indexPageSize, 1),
    },
    cleanup: {
      enabled: normalizeBoolean(cleanupEnabled, defaultSettings.cleanup.enabled),
      interval: normalizeDuration(cleanupInterval, defaultSettings.cleanup.interval),
      runOnStart: normalizeBoolean(cleanupRunOnStart, defaultSettings.cleanup.runOnStart),
    },
    sync: {
      interval: normalizeDuration(syncInterval, defaultSettings.sync.interval),
    },
  };

  return { settings };
});
// export class AgentConfig extends ServiceMap.Service<AgentConfig, { readonly projectDir: string }>()($I`AgentConfig`) {}
//  Effect.Effect<, Config.ConfigError, never>
/**
 * @since 0.0.0
 */
export class StorageConfig extends ServiceMap.Service<
  StorageConfig,
  {
    settings: StorageConfigData;
  }
>()("@effect/claude-agent-sdk/StorageConfig") {
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
