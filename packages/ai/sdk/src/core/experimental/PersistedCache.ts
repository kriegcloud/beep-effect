import * as PersistedCache from "@effect/experimental/PersistedCache"
import * as Persistence from "@effect/experimental/Persistence"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as PrimaryKey from "effect/PrimaryKey"
import * as Schema from "effect/Schema"
import type { QueryHandle } from "../Query.js"
import { AgentSdkError, TransportError } from "../Errors.js"
import { AccountInfo, ModelInfo, SlashCommand } from "../Schema/Common.js"

export * from "@effect/experimental/PersistedCache"
export * as Persistence from "@effect/experimental/Persistence"

const SupportedCommandsSchema = Schema.Array(SlashCommand)
const SupportedModelsSchema = Schema.Array(ModelInfo)

/**
 * Persisted request for supported slash commands.
 */
export class SupportedCommandsRequest extends Schema.TaggedRequest<SupportedCommandsRequest>()(
  "SupportedCommandsRequest",
  {
    success: SupportedCommandsSchema,
    failure: AgentSdkError,
    payload: {}
  }
) implements Persistence.Persistable<typeof SupportedCommandsSchema, typeof AgentSdkError> {
  [PrimaryKey.symbol]() {
    return "SupportedCommands"
  }
}

/**
 * Persisted request for supported models.
 */
export class SupportedModelsRequest extends Schema.TaggedRequest<SupportedModelsRequest>()(
  "SupportedModelsRequest",
  {
    success: SupportedModelsSchema,
    failure: AgentSdkError,
    payload: {}
  }
) implements Persistence.Persistable<typeof SupportedModelsSchema, typeof AgentSdkError> {
  [PrimaryKey.symbol]() {
    return "SupportedModels"
  }
}

/**
 * Persisted request for account info.
 */
export class AccountInfoRequest extends Schema.TaggedRequest<AccountInfoRequest>()(
  "AccountInfoRequest",
  {
    success: AccountInfo,
    failure: AgentSdkError,
    payload: {}
  }
) implements Persistence.Persistable<typeof AccountInfo, typeof AgentSdkError> {
  [PrimaryKey.symbol]() {
    return "AccountInfo"
  }
}

const supportedCommandsKey = new SupportedCommandsRequest({})
const supportedModelsKey = new SupportedModelsRequest({})
const accountInfoKey = new AccountInfoRequest({})

/**
 * Cache entries for query metadata calls.
 */
export type QueryMetadataCache = {
  readonly supportedCommands: PersistedCache.PersistedCache<SupportedCommandsRequest>
  readonly supportedModels: PersistedCache.PersistedCache<SupportedModelsRequest>
  readonly accountInfo: PersistedCache.PersistedCache<AccountInfoRequest>
}

/**
 * Options for metadata caching.
 */
export type QueryMetadataCacheOptions = {
  readonly storeIdPrefix?: string
  readonly timeToLive?: Duration.DurationInput
  readonly inMemoryCapacity?: number
  readonly inMemoryTTL?: Duration.DurationInput
}

const cacheErrorTags = new Set([
  "ConfigError",
  "DecodeError",
  "TransportError",
  "HookError",
  "McpError"
])

const toCacheError = (message: string, cause: unknown): AgentSdkError => {
  if (
    typeof cause === "object" &&
    cause !== null &&
    "_tag" in cause &&
    cacheErrorTags.has(String((cause as { _tag?: string })._tag))
  ) {
    return cause as AgentSdkError
  }
  return TransportError.make({
    message,
    cause
  })
}

/**
 * Build metadata caches for a query handle.
 */
export const makeQueryMetadataCache = Effect.fn("PersistedCache.makeQueryMetadataCache")(function*(
  handle: QueryHandle,
  options?: QueryMetadataCacheOptions
) {
  const storeIdPrefix = options?.storeIdPrefix ?? "claude-agent-sdk"
  const timeToLive = options?.timeToLive ?? "1 minute"
  const inMemoryCapacity = options?.inMemoryCapacity ?? 64
  const inMemoryTTL = options?.inMemoryTTL ?? "30 seconds"

  const supportedCommands = yield* PersistedCache.make({
    storeId: `${storeIdPrefix}-supported-commands`,
    lookup: () => handle.supportedCommands,
    timeToLive: () => timeToLive,
    inMemoryCapacity,
    inMemoryTTL
  })
  const supportedModels = yield* PersistedCache.make({
    storeId: `${storeIdPrefix}-supported-models`,
    lookup: () => handle.supportedModels,
    timeToLive: () => timeToLive,
    inMemoryCapacity,
    inMemoryTTL
  })
  const accountInfo = yield* PersistedCache.make({
    storeId: `${storeIdPrefix}-account-info`,
    lookup: () => handle.accountInfo,
    timeToLive: () => timeToLive,
    inMemoryCapacity,
    inMemoryTTL
  })

  return {
    supportedCommands,
    supportedModels,
    accountInfo
  } satisfies QueryMetadataCache
})

/**
 * Override a QueryHandle to use cached metadata lookups.
 */
export const withQueryMetadataCache = (
  handle: QueryHandle,
  cache: QueryMetadataCache
): QueryHandle => ({
  ...handle,
  supportedCommands: cache.supportedCommands.get(supportedCommandsKey).pipe(
    Effect.mapError((cause) => toCacheError("Failed to read cached commands", cause))
  ),
  supportedModels: cache.supportedModels.get(supportedModelsKey).pipe(
    Effect.mapError((cause) => toCacheError("Failed to read cached models", cause))
  ),
  accountInfo: cache.accountInfo.get(accountInfoKey).pipe(
    Effect.mapError((cause) => toCacheError("Failed to read cached account info", cause))
  )
})

/**
 * Build a cached query handle with default metadata caches.
 *
 * @example
 * ```ts
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     const sdk = yield* AgentSdk
 *     const handle = yield* sdk.query("Hello")
 *     const cached = yield* makeCachedQueryHandle(handle)
 *     return yield* cached.supportedModels
 *   })
 * )
 * ```
 */
export const makeCachedQueryHandle = Effect.fn("PersistedCache.makeCachedQueryHandle")(function*(
  handle: QueryHandle,
  options?: QueryMetadataCacheOptions
) {
  const cache = yield* makeQueryMetadataCache(handle, options)
  return withQueryMetadataCache(handle, cache)
})
