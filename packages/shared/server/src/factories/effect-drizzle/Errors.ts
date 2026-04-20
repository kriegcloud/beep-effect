/**
 * Typed error constructors for the Effect-first Drizzle Bun SQLite integration.
 *
 * @since 0.0.0
 * @module \@beep/shared-server/factories/effect-drizzle/Errors
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

/**
 * Generic infrastructure failure raised by the Effect Drizzle integration.
 *
 * @since 0.0.0
 * @category Errors
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
   * @category Constructors
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
 * @since 0.0.0
 * @category Errors
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
 * @since 0.0.0
 * @category Errors
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
 * @since 0.0.0
 * @category Errors
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
 * @since 0.0.0
 * @category Errors
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
 * @since 0.0.0
 * @category Errors
 */
export const MigratorInitError = S.Union([MigratorDatabaseMigrationsError, MigratorLocalMigrationsError]).pipe(
  $I.annoteSchema("MigratorInitError", {
    description: "Schema union for migrator init failures.",
  })
);

/**
 * Runtime type for {@link MigratorInitError}.
 *
 * @since 0.0.0
 * @category Errors
 */
export type MigratorInitError = typeof MigratorInitError.Type;

/**
 * Normalize any thrown value into an `EffectDrizzleError`.
 *
 * @since 0.0.0
 * @category Constructors
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
 * @since 0.0.0
 * @category Constructors
 */
export const effectDrizzleQueryErrorFromUnknown = (
  query: string,
  params: ReadonlyArray<unknown>,
  cause: unknown
): EffectDrizzleQueryError => {
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
    params: A.fromIterable(params),
    cause,
  });
};

/**
 * Normalize any thrown value into a typed migrator init failure.
 *
 * @since 0.0.0
 * @category Constructors
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
 * @since 0.0.0
 * @category Guards
 */
export const isEffectTransactionRollbackError = isRollbackError;

/**
 * Extract a human-readable query failure message from an unknown cause.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const getQueryFailureMessage = (cause: unknown, query: string): string =>
  getErrorMessage(cause, `Failed to execute query: ${query}`);
