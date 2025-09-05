import type * as DbErrors from "@beep/db-scope/errors";
import type { DbError } from "@beep/db-scope/errors";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgDatabase, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import type * as pg from "pg";

export type ConnectionOptions = {
  url: Redacted.Redacted<string>;
  ssl: boolean;
};

export type DbClient<TFullSchema extends Record<string, unknown> = Record<string, never>> =
  NodePgDatabase<TFullSchema> & {
    readonly $client: pg.Pool;
  };

export type TransactionClient<TFullSchema extends Record<string, unknown> = Record<string, never>> = PgTransaction<
  NodePgQueryResultHKT,
  TFullSchema,
  ExtractTablesWithRelations<TFullSchema>
>;

export type TransactionContextShape<TFullSchema extends Record<string, unknown>> = <U>(
  fn: (client: TransactionClient<TFullSchema>) => Promise<U>
) => Effect.Effect<U, DbError, never>;

export type ExecuteFn<TFullSchema extends Record<string, unknown> = Record<string, never>> = <T>(
  fn: (client: DbClient<TFullSchema> | TransactionClient<TFullSchema>) => Promise<T>
) => Effect.Effect<T, DbErrors.DbError>;
