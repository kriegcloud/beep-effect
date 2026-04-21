/**
 * Public Effect-first Bun SQLite Drizzle driver factory.
 *
 * @since 0.0.0
 * @module
 */

/// <reference types="bun" />

import type { Database } from "bun:sqlite";
import {
  type DrizzleBunSqliteDatabaseConfig,
  drizzle as drizzleBun,
  type SQLiteBunDatabase,
} from "drizzle-orm/bun-sqlite";
import { type MutationOption, NoopCache } from "drizzle-orm/cache/core/cache";
import type { WithCacheConfig } from "drizzle-orm/cache/core/types";
import type { Logger } from "drizzle-orm/logger";
import type { AnyRelations, EmptyRelations } from "drizzle-orm/relations";
import type { Query, SQLWrapper } from "drizzle-orm/sql/sql";
import { sql } from "drizzle-orm/sql/sql";
import type { SelectedFieldsOrdered } from "drizzle-orm/sqlite-core/query-builders/select.types";
import type { PreparedQueryConfig, SQLiteExecuteMethod, SQLitePreparedQuery } from "drizzle-orm/sqlite-core/session";
import type { DrizzleConfig } from "drizzle-orm/utils";
import { Cause, Effect, Exit, Layer } from "effect";
import * as P from "effect/Predicate";
import { DrizzleEffectCache, type DrizzleEffectCacheShape } from "./cache-effect.js";
import {
  type EffectDrizzleError,
  type EffectDrizzleQueryError,
  EffectTransactionRollbackError,
  effectDrizzleErrorFromUnknown,
  effectDrizzleQueryErrorFromUnknown,
  isEffectTransactionRollbackError,
} from "./Errors.js";
import "./QueryEffect.js";
import { DrizzleEffectLogger, type DrizzleEffectLoggerShape } from "./Logger.js";

/**
 * Effect-friendly Drizzle config for Bun SQLite.
 *
 * Logger and cache are supplied through Effect services rather than config.
 *
 * @since 0.0.0
 * @category Types
 */
export type EffectDrizzleConfig<
  TSchema extends Record<string, unknown> = Record<string, never>,
  TRelations extends AnyRelations = EmptyRelations,
> = Omit<DrizzleConfig<TSchema, TRelations>, "cache" | "logger">;

/**
 * Effect helper surface attached to an `SQLiteBunDatabase`.
 *
 * @since 0.0.0
 * @category Models
 */
export interface EffectDrizzleOperations<
  TSchema extends Record<string, unknown> = Record<string, never>,
  TRelations extends AnyRelations = EmptyRelations,
> {
  readonly all: <T = unknown>(query: SQLWrapper | string) => Effect.Effect<ReadonlyArray<T>, EffectDrizzleQueryError>;
  readonly depth: number;
  readonly get: <T = unknown>(query: SQLWrapper | string) => Effect.Effect<T, EffectDrizzleQueryError>;
  readonly rollback: () => Effect.Effect<never, EffectTransactionRollbackError>;
  readonly run: (query: SQLWrapper | string) => Effect.Effect<unknown, EffectDrizzleQueryError>;
  readonly transaction: <A, E, R>(
    transaction: (tx: EffectDrizzleDatabase<TSchema, TRelations>) => Effect.Effect<A, E, R>,
    config?: { readonly behavior?: "deferred" | "immediate" | "exclusive" | undefined }
  ) => Effect.Effect<A, E | EffectTransactionRollbackError | EffectDrizzleError, R>;
  readonly values: <T extends unknown[] = unknown[]>(
    query: SQLWrapper | string
  ) => Effect.Effect<T[], EffectDrizzleQueryError>;
}

/**
 * Regular Drizzle Bun SQLite database decorated with Effect helpers.
 *
 * Query builders remain Drizzle-native and become yieldable through the query bridge
 * installed by {@link QueryEffect}.
 *
 * @since 0.0.0
 * @category Models
 */
export type EffectDrizzleDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
  TRelations extends AnyRelations = EmptyRelations,
> = SQLiteBunDatabase<TSchema, TRelations> & {
  readonly effect: EffectDrizzleOperations<TSchema, TRelations>;
};

type MakeParams<TSchema extends Record<string, unknown>, TRelations extends AnyRelations> =
  | []
  | [string]
  | [string, EffectDrizzleConfig<TSchema, TRelations>]
  | [
      EffectDrizzleConfig<TSchema, TRelations> &
        ({ connection?: DrizzleBunSqliteDatabaseConfig } | { client: Database }),
    ];

type CacheQueryMetadata = {
  readonly type: "select" | "update" | "delete" | "insert";
  readonly tables: ReadonlyArray<string>;
};

type PrepareQuery = (
  query: Query,
  fields: SelectedFieldsOrdered | undefined,
  executeMethod: SQLiteExecuteMethod,
  isResponseInArrayMode: boolean,
  customResultMapper?: (rows: unknown[][], mapColumnValue?: (value: unknown) => unknown) => unknown,
  queryMetadata?: CacheQueryMetadata,
  cacheConfig?: WithCacheConfig
) => SQLitePreparedQuery<PreparedQueryConfig>;

const preparedQueryStateSymbol = Symbol.for("@beep/shared-server/factories/effect-drizzle/prepared-query-state");

const hasPrepareQuery = (
  value: unknown
): value is {
  readonly prepareQuery: (
    query: Query,
    fields: SelectedFieldsOrdered | undefined,
    executeMethod: SQLiteExecuteMethod,
    isResponseInArrayMode: boolean,
    customResultMapper?: (rows: unknown[][], mapColumnValue?: (value: unknown) => unknown) => unknown
  ) => SQLitePreparedQuery<PreparedQueryConfig>;
} => P.isObject(value) && P.isFunction(Reflect.get(value, "prepareQuery"));

const toSql = (query: SQLWrapper | string) => (P.isString(query) ? sql.raw(query) : query.getSQL());

const describeQuery = (query: SQLWrapper | string) =>
  P.isString(query)
    ? {
        params: [],
        sql: query,
      }
    : {
        params: [],
        sql: "[sql-wrapper]",
      };

const beginSql = (behavior?: "deferred" | "immediate" | "exclusive"): string =>
  P.isUndefined(behavior) ? "begin" : `begin ${behavior}`;

const releaseSql = (depth: number): string => `release savepoint sp_${String(depth)}`;
const rollbackToSql = (depth: number): string => `rollback to savepoint sp_${String(depth)}`;
const savepointSql = (depth: number): string => `savepoint sp_${String(depth)}`;

function defineEffectOperations<TSchema extends Record<string, unknown>, TRelations extends AnyRelations>(
  db: SQLiteBunDatabase<TSchema, TRelations>,
  effect: EffectDrizzleOperations<TSchema, TRelations>
): asserts db is EffectDrizzleDatabase<TSchema, TRelations> {
  Object.defineProperty(db, "effect", {
    configurable: true,
    enumerable: true,
    value: effect,
    writable: true,
  });
}

const installPreparedQueryCacheMetadata = (
  session: {
    readonly prepareQuery: (
      query: Query,
      fields: SelectedFieldsOrdered | undefined,
      executeMethod: SQLiteExecuteMethod,
      isResponseInArrayMode: boolean,
      customResultMapper?: (rows: unknown[][], mapColumnValue?: (value: unknown) => unknown) => unknown
    ) => SQLitePreparedQuery<PreparedQueryConfig>;
  },
  cache: DrizzleEffectCacheShape
): void => {
  const originalPrepareQuery = session.prepareQuery.bind(session);
  const prepareQuery: PrepareQuery = (
    query,
    fields,
    executeMethod,
    isResponseInArrayMode,
    customResultMapper,
    queryMetadata,
    cacheConfig
  ) => {
    const preparedQuery = originalPrepareQuery(query, fields, executeMethod, isResponseInArrayMode, customResultMapper);

    Object.defineProperty(preparedQuery, preparedQueryStateSymbol, {
      configurable: true,
      value: {
        cache,
        cacheConfig,
        query,
        queryMetadata,
      },
      writable: true,
    });

    return preparedQuery;
  };

  Object.defineProperty(session, "prepareQuery", {
    configurable: true,
    value: prepareQuery,
    writable: true,
  });
};

const installDatabaseCacheInvalidation = (
  db: { readonly $cache: { readonly invalidate: (params: MutationOption) => Promise<void> } },
  cache: DrizzleEffectCacheShape
): void => {
  Object.defineProperty(db, "$cache", {
    configurable: true,
    value: {
      ...db.$cache,
      invalidate: (params: MutationOption) => Effect.runPromise(cache.onMutate(params)),
    },
    writable: true,
  });
};

const findRollbackError = (exit: Exit.Exit<unknown, unknown>): EffectTransactionRollbackError | undefined => {
  if (Exit.isSuccess(exit)) {
    return undefined;
  }

  const failure = Cause.squash(exit.cause);

  return isEffectTransactionRollbackError(failure) ? failure : undefined;
};

const makeEffectOperations = <TSchema extends Record<string, unknown>, TRelations extends AnyRelations>(
  getDb: () => EffectDrizzleDatabase<TSchema, TRelations>,
  client: Database,
  depth: number
): EffectDrizzleOperations<TSchema, TRelations> => {
  const transaction = Effect.fn("EffectDrizzle.transaction")(function* <A, E, R>(
    runTransaction: (tx: EffectDrizzleDatabase<TSchema, TRelations>) => Effect.Effect<A, E, R>,
    config?: { readonly behavior?: "deferred" | "immediate" | "exclusive" | undefined }
  ) {
    const db = getDb();
    const controlOpen = depth === 0 ? beginSql(config?.behavior) : savepointSql(depth);
    const controlSuccess = depth === 0 ? "commit" : releaseSql(depth);
    const controlFailure = depth === 0 ? "rollback" : rollbackToSql(depth);
    const previousEffect = db.effect;
    const txEffect = makeEffectOperations(() => db, client, depth + 1);

    yield* Effect.try({
      try: () => client.run(controlOpen),
      catch: effectDrizzleErrorFromUnknown("Failed to open SQLite transaction control block."),
    });

    defineEffectOperations(db, txEffect);

    const exit = yield* Effect.exit(runTransaction(db));

    defineEffectOperations(db, previousEffect);

    if (Exit.isSuccess(exit)) {
      yield* Effect.try({
        try: () => client.run(controlSuccess),
        catch: effectDrizzleErrorFromUnknown("Failed to complete SQLite transaction."),
      });

      return exit.value;
    }

    yield* Effect.try({
      try: () => client.run(controlFailure),
      catch: effectDrizzleErrorFromUnknown("Failed to rewind SQLite transaction."),
    });

    const rollbackError = findRollbackError(exit);

    if (!P.isUndefined(rollbackError)) {
      return yield* rollbackError;
    }

    return yield* Effect.failCause(exit.cause);
  });

  return {
    all: <T = unknown>(query: SQLWrapper | string) => {
      const db = getDb();
      const statement = toSql(query);
      const staticQuery = describeQuery(query);

      return Effect.try({
        try: () => db.all<T>(statement),
        catch: (cause) => effectDrizzleQueryErrorFromUnknown(staticQuery.sql, staticQuery.params, cause),
      });
    },
    depth,
    get: <T = unknown>(query: SQLWrapper | string) => {
      const db = getDb();
      const statement = toSql(query);
      const staticQuery = describeQuery(query);

      return Effect.try({
        try: () => db.get<T>(statement),
        catch: (cause) => effectDrizzleQueryErrorFromUnknown(staticQuery.sql, staticQuery.params, cause),
      });
    },
    rollback: () => Effect.fail(new EffectTransactionRollbackError({})),
    run: (query: SQLWrapper | string) => {
      const db = getDb();
      const statement = toSql(query);
      const staticQuery = describeQuery(query);

      return Effect.try({
        try: () => db.run(statement),
        catch: (cause) => effectDrizzleQueryErrorFromUnknown(staticQuery.sql, staticQuery.params, cause),
      });
    },
    transaction,
    values: <T extends unknown[] = unknown[]>(query: SQLWrapper | string) => {
      const db = getDb();
      const statement = toSql(query);
      const staticQuery = describeQuery(query);

      return Effect.try({
        try: () => db.values<T>(statement),
        catch: (cause) => effectDrizzleQueryErrorFromUnknown(staticQuery.sql, staticQuery.params, cause),
      });
    },
  };
};

const decorateDatabase = <TSchema extends Record<string, unknown>, TRelations extends AnyRelations>(
  db: SQLiteBunDatabase<TSchema, TRelations> & { readonly $client: Database }
): EffectDrizzleDatabase<TSchema, TRelations> => {
  let decorated!: EffectDrizzleDatabase<TSchema, TRelations>;
  const effect: EffectDrizzleOperations<TSchema, TRelations> = makeEffectOperations(() => decorated, db.$client, 0);
  defineEffectOperations(db, effect);
  decorated = db;

  return decorated;
};

const makeLoggerAdapter = (logger: DrizzleEffectLoggerShape): Logger => ({
  logQuery: (query: string, params: unknown[]) => {
    // Bun SQLite logging hooks are synchronous, so the Effect logger has to be bridged here.
    Effect.runSync(logger.logQuery(query, params));
  },
});

const drizzleWithLogger = <TSchema extends Record<string, unknown>, TRelations extends AnyRelations>(
  logger: Logger,
  ...params: MakeParams<TSchema, TRelations>
): SQLiteBunDatabase<TSchema, TRelations> & { readonly $client: Database } => {
  if (params[0] === undefined) {
    return drizzleBun<TSchema, TRelations>({
      logger,
    });
  }

  if (P.isString(params[0])) {
    if (P.isUndefined(params[1])) {
      return drizzleBun<TSchema, TRelations>(params[0], {
        logger,
      });
    }

    return drizzleBun<TSchema, TRelations>(params[0], {
      ...params[1],
      logger,
    });
  }

  return drizzleBun<TSchema, TRelations>({
    ...params[0],
    logger,
  });
};

/**
 * Construct an Effect-first Bun SQLite Drizzle database.
 *
 * Query builders remain standard Drizzle builders and become `yield*`-compatible
 * through the query bridge exported by this module. Raw SQL helpers and
 * transactions live under `db.effect`.
 *
 * @example
 * ```ts
 * import { Database } from "bun:sqlite"
 * import { Effect } from "effect"
 * import { makeWithDefaults } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const program = Effect.gen(function* () {
 *
 *
 * })
 * ```
 *
 * @since 0.0.0
 * @category Constructors
 */
export const make = Effect.fn("EffectDrizzle.make")(function* <
  TSchema extends Record<string, unknown> = Record<string, never>,
  TRelations extends AnyRelations = EmptyRelations,
>(...params: MakeParams<TSchema, TRelations>) {
  const cache = yield* DrizzleEffectCache;
  const logger = yield* DrizzleEffectLogger;
  const db = drizzleWithLogger(makeLoggerAdapter(logger), ...params);
  const session = Reflect.get(db, "session");

  if (hasPrepareQuery(session)) {
    installPreparedQueryCacheMetadata(session, cache);
  }
  installDatabaseCacheInvalidation(db, cache);

  return decorateDatabase(db);
});

/**
 * Default no-op Effect services used by the Drizzle integration.
 *
 * @since 0.0.0
 * @category Layers
 */
export const DefaultServices = Layer.merge(DrizzleEffectCache.Default, DrizzleEffectLogger.Default);

/**
 * Convenience constructor that provides {@link DefaultServices}.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const makeWithDefaults = <
  TSchema extends Record<string, unknown> = Record<string, never>,
  TRelations extends AnyRelations = EmptyRelations,
>(
  ...params: MakeParams<TSchema, TRelations>
) =>
  make<TSchema, TRelations>(...params).pipe(
    Effect.provideService(
      DrizzleEffectLogger,
      DrizzleEffectLogger.of({
        logQuery: Effect.fn("DrizzleEffectLogger.logQuery.noop")(() => Effect.void),
      } satisfies DrizzleEffectLoggerShape)
    ),
    Effect.provideService(DrizzleEffectCache, DrizzleEffectCache.of(DrizzleEffectCache.fromDrizzle(new NoopCache())))
  );

/**
 * Alias that mirrors Drizzle's `drizzle(...)` naming.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const drizzle = make;
