import { Duration, Effect } from "effect";
import * as O from "effect/Option";
import { type RemoteStatus, SyncService } from "../Sync/index.js";
import { StorageConfig, type StorageConfigData } from "./StorageConfig.js";

/**
 * @since 0.0.0
 * @category DataAccess
 */
export type StorageStatus = Readonly<{
  readonly config?: {
    readonly enabled: StorageConfigData["enabled"];
    readonly cleanup: StorageConfigData["cleanup"];
    readonly syncIntervalMs: number;
  };
  readonly sync?: ReadonlyArray<RemoteStatus>;
}>;

/**
 * @since 0.0.0
 * @category DataAccess
 */
export const status = Effect.gen(function* () {
  const config = yield* Effect.serviceOption(StorageConfig);
  const sync = yield* Effect.serviceOption(SyncService);

  const resolvedConfig = O.isSome(config)
    ? {
        enabled: config.value.settings.enabled,
        cleanup: config.value.settings.cleanup,
        syncIntervalMs: Duration.toMillis(config.value.settings.sync.interval),
      }
    : undefined;

  const resolvedSync = O.isSome(sync) ? yield* sync.value.status() : undefined;

  return {
    ...(resolvedConfig ? { config: resolvedConfig } : {}),
    ...(resolvedSync ? { sync: resolvedSync } : {}),
  } satisfies StorageStatus;
});
