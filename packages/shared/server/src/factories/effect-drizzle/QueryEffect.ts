/**
 * Yieldable bridge for Drizzle query builders and prepared queries.
 *
 * @since 0.0.0
 * @module \@beep/shared-server/factories/effect-drizzle/QueryEffect
 */

import { strategyFor } from "drizzle-orm/cache/core/cache";
import type { WithCacheConfig } from "drizzle-orm/cache/core/types";
import { QueryPromise } from "drizzle-orm/query-promise";
import type { Query } from "drizzle-orm/sql/sql";
import { fillPlaceholders } from "drizzle-orm/sql/sql";
import { SQLiteSelectBase } from "drizzle-orm/sqlite-core/query-builders/select";
import type { PreparedQueryConfig } from "drizzle-orm/sqlite-core/session";
import { SQLitePreparedQuery } from "drizzle-orm/sqlite-core/session";
import { Effect } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import type { DrizzleEffectCacheShape } from "./cache-effect.js";
import { effectDrizzleQueryErrorFromUnknown } from "./Errors.js";

/**
 * Failure channel used by Effect-wrapped Drizzle query execution.
 *
 * @since 0.0.0
 * @category Types
 */
export type QueryEffectError = ReturnType<typeof effectDrizzleQueryErrorFromUnknown>;

declare module "drizzle-orm/query-promise" {
  interface QueryPromise<T> extends Effect.Yieldable<QueryPromise<T>, T, QueryEffectError, never> {
    asEffect(): Effect.Effect<T, QueryEffectError>;
  }
}

declare module "drizzle-orm/sqlite-core/session" {
  interface SQLitePreparedQuery<T extends PreparedQueryConfig>
    extends Effect.Yieldable<SQLitePreparedQuery<T>, T["execute"], QueryEffectError, never> {
    asEffect(placeholderValues?: Record<string, unknown>): Effect.Effect<T["execute"], QueryEffectError>;
  }
}

const queryPromisePatchMarker = Symbol.for("@beep/shared-server/factories/effect-drizzle/query-promise-installed");
const sqliteSelectPatchMarker = Symbol.for("@beep/shared-server/factories/effect-drizzle/sqlite-select-installed");
const preparedQueryPatchMarker = Symbol.for("@beep/shared-server/factories/effect-drizzle/prepared-query-installed");
const preparedQueryStateSymbol = Symbol.for("@beep/shared-server/factories/effect-drizzle/prepared-query-state");

type CacheQueryMetadata = {
  readonly type: "select" | "update" | "delete" | "insert";
  readonly tables: ReadonlyArray<string>;
};

type PreparedQueryCacheState = {
  readonly cache: DrizzleEffectCacheShape;
  readonly cacheConfig: WithCacheConfig | undefined;
  readonly query: Query;
  readonly queryMetadata: CacheQueryMetadata | undefined;
};

const isQuery = (value: unknown): value is Query => {
  if (!P.isObject(value)) {
    return false;
  }

  return P.isString(Reflect.get(value, "sql")) && A.isArray(Reflect.get(value, "params"));
};

const isCacheQueryMetadata = (value: unknown): value is CacheQueryMetadata => {
  if (!P.isObject(value)) {
    return false;
  }

  const type = Reflect.get(value, "type");
  const tables = Reflect.get(value, "tables");

  return (
    P.isString(type) &&
    A.isArray(tables) &&
    A.every(tables, P.isString) &&
    (type === "select" || type === "update" || type === "delete" || type === "insert")
  );
};

const isDrizzleEffectCacheShape = (value: unknown): value is DrizzleEffectCacheShape => {
  if (!P.isObject(value)) {
    return false;
  }

  return (
    P.isFunction(Reflect.get(value, "get")) &&
    P.isFunction(Reflect.get(value, "onMutate")) &&
    P.isFunction(Reflect.get(value, "put")) &&
    P.isFunction(Reflect.get(value, "strategy"))
  );
};

const isWithCacheConfig = (value: unknown): value is WithCacheConfig => {
  if (!P.isObject(value)) {
    return false;
  }

  return P.isBoolean(Reflect.get(value, "enabled"));
};

const isPreparedQueryCacheState = (value: unknown): value is PreparedQueryCacheState => {
  if (!P.isObject(value)) {
    return false;
  }

  const cache = Reflect.get(value, "cache");
  const cacheConfig = Reflect.get(value, "cacheConfig");
  const query = Reflect.get(value, "query");
  const queryMetadata = Reflect.get(value, "queryMetadata");

  return (
    isDrizzleEffectCacheShape(cache) &&
    isQuery(query) &&
    (P.isUndefined(cacheConfig) || isWithCacheConfig(cacheConfig)) &&
    (P.isUndefined(queryMetadata) || isCacheQueryMetadata(queryMetadata))
  );
};

const getPreparedQueryCacheState = (preparedQuery: SQLitePreparedQuery<PreparedQueryConfig>) => {
  const state = Reflect.get(preparedQuery, preparedQueryStateSymbol);

  return isPreparedQueryCacheState(state) ? state : undefined;
};

const normalizeCacheConfig = (
  cache: DrizzleEffectCacheShape,
  cacheConfig: WithCacheConfig | undefined
): WithCacheConfig | undefined =>
  cache.strategy() === "all" && P.isUndefined(cacheConfig)
    ? {
        autoInvalidate: true,
        enabled: true,
      }
    : cacheConfig?.enabled === true
      ? cacheConfig
      : undefined;

const executePreparedQuery = (
  preparedQuery: SQLitePreparedQuery<PreparedQueryConfig>,
  queryText: string,
  params: ReadonlyArray<unknown>,
  placeholderValues?: Record<string, unknown>
) =>
  Effect.tryPromise({
    try: async () => await preparedQuery.execute(placeholderValues),
    catch: (cause) => effectDrizzleQueryErrorFromUnknown(queryText, params, cause),
  });

const executePreparedQueryWithCache = (
  preparedQuery: SQLitePreparedQuery<PreparedQueryConfig>,
  placeholderValues?: Record<string, unknown>
): Effect.Effect<unknown, QueryEffectError> => {
  const state = getPreparedQueryCacheState(preparedQuery);
  const query = state?.query ?? preparedQuery.getQuery();
  const params = fillPlaceholders(query.params, placeholderValues ?? {});
  const runPreparedQuery = executePreparedQuery(preparedQuery, query.sql, params, placeholderValues);

  if (P.isUndefined(state)) {
    return runPreparedQuery;
  }

  return Effect.gen(function* () {
    const cacheStrategy = yield* Effect.tryPromise({
      try: () =>
        strategyFor(
          query.sql,
          params,
          P.isUndefined(state.queryMetadata)
            ? undefined
            : {
                ...state.queryMetadata,
                tables: A.fromIterable(state.queryMetadata.tables),
              },
          normalizeCacheConfig(state.cache, state.cacheConfig)
        ),
      catch: (cause) => effectDrizzleQueryErrorFromUnknown(query.sql, params, cause),
    });

    if (cacheStrategy.type === "skip") {
      return yield* runPreparedQuery;
    }

    if (cacheStrategy.type === "invalidate") {
      const result = yield* runPreparedQuery;
      yield* state.cache.onMutate({ tables: cacheStrategy.tables });
      return result;
    }

    const fromCache = yield* state.cache.get(
      cacheStrategy.key,
      cacheStrategy.tables,
      cacheStrategy.isTag,
      cacheStrategy.autoInvalidate
    );

    if (!P.isUndefined(fromCache)) {
      return fromCache;
    }

    const result = yield* runPreparedQuery;

    if (A.isArray(result)) {
      yield* state.cache.put(
        cacheStrategy.key,
        result,
        cacheStrategy.autoInvalidate === true ? cacheStrategy.tables : [],
        cacheStrategy.isTag,
        cacheStrategy.config
      );
    }

    return result;
  }).pipe(Effect.mapError((cause) => effectDrizzleQueryErrorFromUnknown(query.sql, params, cause)));
};

const isPreparedQueryFactory = (
  value: unknown
): value is { readonly _prepare: () => SQLitePreparedQuery<PreparedQueryConfig> } =>
  P.isObject(value) && P.isFunction(Reflect.get(value, "_prepare"));

const installQueryPromisePatch = (): void => {
  if (P.hasProperty(QueryPromise.prototype, queryPromisePatchMarker)) {
    return;
  }

  Object.defineProperty(QueryPromise.prototype, "asEffect", {
    configurable: true,
    value(this: QueryPromise<unknown>) {
      if (isPreparedQueryFactory(this)) {
        return executePreparedQueryWithCache(this._prepare());
      }

      return Effect.tryPromise({
        try: () => this.execute(),
        catch: (cause) => effectDrizzleQueryErrorFromUnknown("unknown query", [], cause),
      });
    },
    writable: true,
  });
  Object.defineProperty(QueryPromise.prototype, Symbol.iterator, {
    configurable: true,
    value<T>(this: QueryPromise<T>) {
      return this.asEffect()[Symbol.iterator]();
    },
    writable: true,
  });
  Object.defineProperty(QueryPromise.prototype, queryPromisePatchMarker, {
    configurable: true,
    value: true,
    writable: false,
  });
};

const installPreparedQueryPatch = (): void => {
  if (P.hasProperty(SQLitePreparedQuery.prototype, preparedQueryPatchMarker)) {
    return;
  }

  Object.defineProperty(SQLitePreparedQuery.prototype, "asEffect", {
    configurable: true,
    value(this: SQLitePreparedQuery<PreparedQueryConfig>, placeholderValues?: Record<string, unknown>) {
      return executePreparedQueryWithCache(this, placeholderValues);
    },
    writable: true,
  });
  Object.defineProperty(SQLitePreparedQuery.prototype, Symbol.iterator, {
    configurable: true,
    value<T extends PreparedQueryConfig>(this: SQLitePreparedQuery<T>) {
      return this.asEffect()[Symbol.iterator]();
    },
    writable: true,
  });
  Object.defineProperty(SQLitePreparedQuery.prototype, preparedQueryPatchMarker, {
    configurable: true,
    value: true,
    writable: false,
  });
};

const installSqliteSelectPatch = (): void => {
  if (P.hasProperty(SQLiteSelectBase.prototype, sqliteSelectPatchMarker)) {
    return;
  }

  Object.defineProperty(SQLiteSelectBase.prototype, "asEffect", {
    configurable: true,
    value(this: { readonly _prepare: () => SQLitePreparedQuery<PreparedQueryConfig> }) {
      return executePreparedQueryWithCache(this._prepare());
    },
    writable: true,
  });
  Object.defineProperty(SQLiteSelectBase.prototype, Symbol.iterator, {
    configurable: true,
    value(this: { asEffect(): Effect.Effect<unknown, QueryEffectError> }) {
      return this.asEffect()[Symbol.iterator]();
    },
    writable: true,
  });
  Object.defineProperty(SQLiteSelectBase.prototype, sqliteSelectPatchMarker, {
    configurable: true,
    value: true,
    writable: false,
  });
};

/**
 * Install the Effect yieldable bridge on Drizzle query builders and prepared queries.
 *
 * Importing this module is sufficient to activate the adapter.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const installDrizzleEffectYieldables = (): void => {
  installQueryPromisePatch();
  installSqliteSelectPatch();
  installPreparedQueryPatch();
};

installDrizzleEffectYieldables();
