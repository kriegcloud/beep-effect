import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase, PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import type { DbError } from "./errors";

export type ConnectionOptions = {
  url: Redacted.Redacted<string>;
  ssl: boolean;
};

export type DbClient<TFullSchema extends Record<string, unknown> = Record<string, never>> =
  PostgresJsDatabase<TFullSchema>;

export type TransactionClient<TFullSchema extends Record<string, unknown> = Record<string, never>> = PgTransaction<
  PostgresJsQueryResultHKT,
  TFullSchema,
  ExtractTablesWithRelations<TFullSchema>
>;

export type TransactionContextShape<TFullSchema extends Record<string, unknown>> = <U>(
  fn: (client: TransactionClient<TFullSchema>) => Promise<U>
) => Effect.Effect<U, DbError, never>;

export type ExecuteFn<TFullSchema extends Record<string, unknown> = Record<string, never>> = <T>(
  fn: (client: DbClient<TFullSchema> | TransactionClient<TFullSchema>) => Promise<T>
) => Effect.Effect<T, DbError>;

export type Transaction<TFullSchema extends Record<string, unknown>> = <T, E, R>(
  txExecute: (tx: TransactionContextShape<TFullSchema>) => Effect.Effect<T, E, R>
) => Effect.Effect<T, DbError | E, R>;

export type MakeQuery<TFullSchema extends Record<string, unknown>> = <A, E, R, Input = never>(
  queryFn: (execute: ExecuteFn<TFullSchema>, input: Input) => Effect.Effect<A, E, R>
) => (...args: [Input] extends [never] ? [] : [input: Input]) => Effect.Effect<A, E, R>;

export type MakeQueryTx<TFullSchema extends Record<string, unknown>> = <A, E, R, Input>(
  queryFn: (execute: ExecuteFn<TFullSchema>, input: Input) => Effect.Effect<A, E, R>
) => (...args: [Input] extends [never] ? [] : [input: Input]) => Effect.Effect<A, DbError | E, R>;
