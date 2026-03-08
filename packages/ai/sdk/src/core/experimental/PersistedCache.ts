import { type Duration, Effect, HashSet } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Persistable from "effect/unstable/persistence/Persistable";
import * as PersistedCache from "effect/unstable/persistence/PersistedCache";
import { AgentSdkError, TransportError } from "../Errors.js";
import { normalizeAccountInfo, normalizeModelInfoList, normalizeSlashCommandList } from "../internal/normalize.js";
import type { QueryHandle } from "../Query.js";
import { AccountInfo, ModelInfo, SlashCommand } from "../Schema/Common.js";

/**
 * @since 0.0.0
 */
export * from "effect/unstable/persistence/PersistedCache";
/**
 * @since 0.0.0
 */
export * as Persistence from "effect/unstable/persistence/Persistence";

const SupportedCommandsSchema = S.Array(SlashCommand);
const SupportedModelsSchema = S.Array(ModelInfo);

/**
 * Persisted request for supported slash commands.
 */
/**
 * @since 0.0.0
 */
export class SupportedCommandsRequest extends Persistable.Class()("SupportedCommandsRequest", {
  success: SupportedCommandsSchema,
  error: AgentSdkError,
  primaryKey: () => "SupportedCommands",
}) {}

/**
 * Persisted request for supported models.
 */
/**
 * @since 0.0.0
 */
export class SupportedModelsRequest extends Persistable.Class()("SupportedModelsRequest", {
  success: SupportedModelsSchema,
  error: AgentSdkError,
  primaryKey: () => "SupportedModels",
}) {}

/**
 * Persisted request for account info.
 */
/**
 * @since 0.0.0
 */
export class AccountInfoRequest extends Persistable.Class()("AccountInfoRequest", {
  success: AccountInfo,
  error: AgentSdkError,
  primaryKey: () => "AccountInfo",
}) {}

const supportedCommandsKey = new SupportedCommandsRequest();
const supportedModelsKey = new SupportedModelsRequest();
const accountInfoKey = new AccountInfoRequest();

/**
 * Cache entries for query metadata calls.
 */
/**
 * @since 0.0.0
 */
export type QueryMetadataCache = Readonly<{
  readonly supportedCommands: PersistedCache.PersistedCache<SupportedCommandsRequest>;
  readonly supportedModels: PersistedCache.PersistedCache<SupportedModelsRequest>;
  readonly accountInfo: PersistedCache.PersistedCache<AccountInfoRequest>;
}>;

/**
 * Options for metadata caching.
 */
/**
 * @since 0.0.0
 */
export type QueryMetadataCacheOptions = Readonly<{
  readonly storeIdPrefix?: string;
  readonly timeToLive?: Duration.Input;
  readonly inMemoryCapacity?: number;
  readonly inMemoryTTL?: Duration.Input;
}>;

const cacheErrorTags = HashSet.fromIterable(["ConfigError", "DecodeError", "TransportError", "HookError", "McpError"]);

const isAgentSdkError = (cause: unknown): cause is AgentSdkError =>
  P.isObject(cause) &&
  P.hasProperty("_tag")(cause) &&
  P.isString(cause._tag) &&
  HashSet.has(cacheErrorTags, cause._tag);

const toCacheError = (message: string, cause: unknown): AgentSdkError => {
  if (isAgentSdkError(cause)) {
    return cause;
  }
  return TransportError.make(message, cause);
};

/**
 * Build metadata caches for a query handle.
 */
/**
 * @since 0.0.0
 */
export const makeQueryMetadataCache = Effect.fn("PersistedCache.makeQueryMetadataCache")(function* (
  handle: QueryHandle,
  options?: QueryMetadataCacheOptions
) {
  const storeIdPrefix = options?.storeIdPrefix ?? "claude-agent-sdk";
  const timeToLive = options?.timeToLive ?? "1 minute";
  const inMemoryCapacity = options?.inMemoryCapacity ?? 64;
  const inMemoryTTL = options?.inMemoryTTL ?? "30 seconds";

  const supportedCommands = yield* PersistedCache.make({
    storeId: `${storeIdPrefix}-supported-commands`,
    lookup: (_key: SupportedCommandsRequest) =>
      handle.supportedCommands.pipe(Effect.flatMap(normalizeSlashCommandList)),
    timeToLive: () => timeToLive,
    inMemoryCapacity,
    ...(inMemoryTTL ? { inMemoryTTL: () => inMemoryTTL } : {}),
  });
  const supportedModels = yield* PersistedCache.make({
    storeId: `${storeIdPrefix}-supported-models`,
    lookup: (_key: SupportedModelsRequest) => handle.supportedModels.pipe(Effect.flatMap(normalizeModelInfoList)),
    timeToLive: () => timeToLive,
    inMemoryCapacity,
    ...(inMemoryTTL ? { inMemoryTTL: () => inMemoryTTL } : {}),
  });
  const accountInfo = yield* PersistedCache.make({
    storeId: `${storeIdPrefix}-account-info`,
    lookup: (_key: AccountInfoRequest) => handle.accountInfo.pipe(Effect.flatMap(normalizeAccountInfo)),
    timeToLive: () => timeToLive,
    inMemoryCapacity,
    ...(inMemoryTTL ? { inMemoryTTL: () => inMemoryTTL } : {}),
  });

  return {
    supportedCommands,
    supportedModels,
    accountInfo,
  };
});

/**
 * Override a QueryHandle to use cached metadata lookups.
 */
/**
 * @since 0.0.0
 */
export const withQueryMetadataCache = (handle: QueryHandle, cache: QueryMetadataCache): QueryHandle => ({
  ...handle,
  supportedCommands: cache.supportedCommands
    .get(supportedCommandsKey)
    .pipe(Effect.mapError((cause) => toCacheError("Failed to read cached commands", cause))),
  supportedModels: cache.supportedModels
    .get(supportedModelsKey)
    .pipe(Effect.mapError((cause) => toCacheError("Failed to read cached models", cause))),
  accountInfo: cache.accountInfo
    .get(accountInfoKey)
    .pipe(Effect.mapError((cause) => toCacheError("Failed to read cached account info", cause))),
});

/**
 * Build a cached query handle with default metadata caches.
 *
 * @example
 * ```ts-morph
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
/**
 * @since 0.0.0
 */
export const makeCachedQueryHandle = Effect.fn("PersistedCache.makeCachedQueryHandle")(function* (
  handle: QueryHandle,
  options?: undefined | QueryMetadataCacheOptions
) {
  const cache = yield* makeQueryMetadataCache(handle, options);
  return withQueryMetadataCache(handle, cache);
});
