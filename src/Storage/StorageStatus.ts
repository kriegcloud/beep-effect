import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import { SyncService, type RemoteStatus } from "../Sync/SyncService.js"
import { StorageConfig, type StorageConfigData } from "./StorageConfig.js"

export type StorageStatus = {
  readonly config?: {
    readonly enabled: StorageConfigData["enabled"]
    readonly cleanup: StorageConfigData["cleanup"]
    readonly syncIntervalMs: number
  }
  readonly sync?: ReadonlyArray<RemoteStatus>
}

export const status = Effect.gen(function*() {
  const config = yield* Effect.serviceOption(StorageConfig)
  const sync = yield* Effect.serviceOption(SyncService)

  const resolvedConfig = Option.isSome(config)
    ? {
        enabled: config.value.settings.enabled,
        cleanup: config.value.settings.cleanup,
        syncIntervalMs: Duration.toMillis(config.value.settings.sync.interval)
      }
    : undefined

  const resolvedSync = Option.isSome(sync)
    ? yield* sync.value.status()
    : undefined

  return {
    ...(resolvedConfig ? { config: resolvedConfig } : {}),
    ...(resolvedSync ? { sync: resolvedSync } : {})
  } satisfies StorageStatus
})
