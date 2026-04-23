/**
 * Typed error constructors for the Effect-first Drizzle Bun SQLite integration.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedServerId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { DrizzleQueryError } from "drizzle-orm/errors";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SharedServerId.create("factories/effect-drizzle/Errors");

const getErrorMessage = (cause: unknown, fallback: string): string => (P.isError(cause) ? cause.message : fallback);
type EffectDrizzleQueryErrorOptions = {
  readonly params: ReadonlyArray<unknown>;
};

/**
 * Generic infrastructure failure raised by the Effect Drizzle integration.
 *
 * @example
 * ```ts
 * import { EffectDrizzleError } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const error = new EffectDrizzleError({
 *   message: "Failed to open database",
 *   cause: "database unavailable"
 * })
 *
 * void error
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class EffectDrizzleError extends TaggedErrorClass<EffectDrizzleError>($I`EffectDrizzleError`)(
  "EffectDrizzleError",
  {
    message: S.String,
    cause: S.Unknown,
  },
  $I.annote("EffectDrizzleError", {
    description: "Generic infrastructure failure raised by the Effect Drizzle integration.",
  })
) {
  /**
   * Construct an `EffectDrizzleError` in data-first or data-last form.
   *
   * @since 0.0.0
   * @category constructors
   */
  static readonly new: {
    (cause: unknown, message: string): EffectDrizzleError;
    (message: string): (cause: unknown) => EffectDrizzleError;
  } = dual(
    2,
    (cause: unknown, message: string): EffectDrizzleError =>
      new EffectDrizzleError({
        message,
        cause,
      })
  );
}

/**
 * Query execution failure enriched with the SQL text and bound parameters.
 *
 * @example
 * ```ts
 * import { EffectDrizzleQueryError } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const error = new EffectDrizzleQueryError({
 *   query: "select 1",
 *   params: [],
 *   cause: "query failed"
 * })
 *
 * void error
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class EffectDrizzleQueryError extends TaggedErrorClass<EffectDrizzleQueryError>($I`EffectDrizzleQueryError`)(
  "EffectDrizzleQueryError",
  {
    query: S.String,
    params: S.Array(S.Unknown),
    cause: S.Unknown,
  },
  $I.annote("EffectDrizzleQueryError", {
    description: "Query execution failure enriched with the SQL text and bound parameters.",
  })
) {
  override get message(): string {
    return `Failed query: ${this.query}`;
  }
}

/**
 * Explicit rollback sentinel for Effect-managed SQLite transactions.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { EffectTransactionRollbackError } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const isRollback = S.is(EffectTransactionRollbackError)
 *
 * void isRollback
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class EffectTransactionRollbackError extends TaggedErrorClass<EffectTransactionRollbackError>(
  $I`EffectTransactionRollbackError`
)(
  "EffectTransactionRollbackError",
  {},
  $I.annote("EffectTransactionRollbackError", {
    description: "Explicit rollback sentinel for Effect-managed SQLite transactions.",
  })
) {
  override readonly message = "Rollback";
}

const isEffectDrizzleQueryError = S.is(EffectDrizzleQueryError);
const isRollbackError = S.is(EffectTransactionRollbackError);

/**
 * Migrator failed because the database already contains migrations during init.
 *
 * @example
 * ```ts
 * import { MigratorDatabaseMigrationsError } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const error = new MigratorDatabaseMigrationsError({
 *   exitCode: "databaseMigrations"
 * })
 *
 * void error
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class MigratorDatabaseMigrationsError extends TaggedErrorClass<MigratorDatabaseMigrationsError>(
  $I`MigratorDatabaseMigrationsError`
)(
  "MigratorDatabaseMigrationsError",
  {
    exitCode: S.Literal("databaseMigrations"),
  },
  $I.annote("MigratorDatabaseMigrationsError", {
    description: "Migrator failed because the database already contains migrations during init.",
  })
) {}

/**
 * Migrator failed because local migrations already exist during init.
 *
 * @example
 * ```ts
 * import { MigratorLocalMigrationsError } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const error = new MigratorLocalMigrationsError({
 *   exitCode: "localMigrations"
 * })
 *
 * void error
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class MigratorLocalMigrationsError extends TaggedErrorClass<MigratorLocalMigrationsError>(
  $I`MigratorLocalMigrationsError`
)(
  "MigratorLocalMigrationsError",
  {
    exitCode: S.Literal("localMigrations"),
  },
  $I.annote("MigratorLocalMigrationsError", {
    description: "Migrator failed because local migrations already exist during init.",
  })
) {}

/**
 * Schema union for migrator init failures.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { MigratorInitError } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const isMigratorInitError = S.is(MigratorInitError)
 *
 * void isMigratorInitError
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export const MigratorInitError = S.Union([MigratorDatabaseMigrationsError, MigratorLocalMigrationsError]).pipe(
  $I.annoteSchema("MigratorInitError", {
    description: "Schema union for migrator init failures.",
  })
);

/**
 * Runtime type for {@link MigratorInitError}.
 *
 * @example
 * ```ts
 * import type { MigratorInitError } from "@beep/shared-server/factories/effect-drizzle"
 * import { MigratorLocalMigrationsError } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const error: MigratorInitError = new MigratorLocalMigrationsError({
 *   exitCode: "localMigrations"
 * })
 *
 * void error
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export type MigratorInitError = typeof MigratorInitError.Type;

/**
 * Normalize any thrown value into an `EffectDrizzleError`.
 *
 * @example
 * ```ts
 * import { effectDrizzleErrorFromUnknown } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const error = effectDrizzleErrorFromUnknown(
 *   "database unavailable",
 *   "Failed to open database."
 * )
 *
 * void error
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const effectDrizzleErrorFromUnknown: {
  (cause: unknown, message: string): EffectDrizzleError;
  (message: string): (cause: unknown) => EffectDrizzleError;
} = dual(
  2,
  (cause: unknown, message: string): EffectDrizzleError =>
    new EffectDrizzleError({
      message,
      cause,
    })
);

/**
 * Normalize any thrown value into an `EffectDrizzleQueryError`.
 *
 * @example
 * ```ts
 * import { effectDrizzleQueryErrorFromUnknown } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const error = effectDrizzleQueryErrorFromUnknown("query failed", "select 1", {
 *   params: []
 * })
 *
 * void error
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const effectDrizzleQueryErrorFromUnknown: {
  (query: string, options: EffectDrizzleQueryErrorOptions): (cause: unknown) => EffectDrizzleQueryError;
  (cause: unknown, query: string, options: EffectDrizzleQueryErrorOptions): EffectDrizzleQueryError;
} = dual(3, (cause: unknown, query: string, options: EffectDrizzleQueryErrorOptions): EffectDrizzleQueryError => {
  if (isEffectDrizzleQueryError(cause)) {
    return cause;
  }

  if (cause instanceof DrizzleQueryError) {
    return new EffectDrizzleQueryError({
      query: cause.query,
      params: A.fromIterable(cause.params),
      cause: cause.cause ?? cause,
    });
  }

  return new EffectDrizzleQueryError({
    query,
    params: A.fromIterable(options.params),
    cause,
  });
});

/**
 * Normalize any thrown value into a typed migrator init failure.
 *
 * @example
 * ```ts
 * import { migratorInitErrorFromExitCode } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const error = migratorInitErrorFromExitCode("localMigrations")
 *
 * void error
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const migratorInitErrorFromExitCode = (
  exitCode: "databaseMigrations" | "localMigrations"
): MigratorDatabaseMigrationsError | MigratorLocalMigrationsError =>
  exitCode === "databaseMigrations"
    ? new MigratorDatabaseMigrationsError({ exitCode })
    : new MigratorLocalMigrationsError({ exitCode });

/**
 * Detect whether an unknown value is the rollback sentinel.
 *
 * @example
 * ```ts
 * import { isEffectTransactionRollbackError } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const isRollback = isEffectTransactionRollbackError("Rollback")
 *
 * void isRollback
 * ```
 *
 * @since 0.0.0
 * @category guards
 */
export const isEffectTransactionRollbackError = isRollbackError;

/**
 * Extract a human-readable query failure message from an unknown cause.
 *
 * @example
 * ```ts
 * import { getQueryFailureMessage } from "@beep/shared-server/factories/effect-drizzle"
 *
 * const message = getQueryFailureMessage("query failed", "select 1")
 *
 * void message
 * ```
 *
 * @since 0.0.0
 * @category helpers
 */
export const getQueryFailureMessage: {
  (query: string): (cause: unknown) => string;
  (cause: unknown, query: string): string;
} = dual(2, (cause: unknown, query: string): string => getErrorMessage(cause, `Failed to execute query: ${query}`));
