import * as Effect from "effect/Effect";
import * as pg from "pg";
import type * as Redacted from "effect/Redacted";
import type {NodePgQueryResultHKT} from "drizzle-orm/node-postgres";
import type {
  PgTransaction,
} from "drizzle-orm/pg-core";
import * as S from "effect/Schema";

import type {NodePgDatabase} from "drizzle-orm/node-postgres";
import type {ExtractTablesWithRelations} from "drizzle-orm";
import { DatabaseError } from "./errors";
export type DbSchema = Record<string, unknown>

export type MakeDbServiceOptions<TFullSchema extends DbSchema = DbSchema> = {
  schema: TFullSchema,
}


export type TransactionClient<TFullSchema extends DbSchema = DbSchema> = PgTransaction<
  NodePgQueryResultHKT,
  TFullSchema,
  ExtractTablesWithRelations<TFullSchema>
>;

export type Client<TFullSchema extends DbSchema = DbSchema> = NodePgDatabase<TFullSchema> & {
  $client: pg.Pool;
}

export type TransactionContextShape = <U>(
  fn: <TFullSchema extends DbSchema = DbSchema>(client: TransactionClient<TFullSchema>) => Promise<U>
) => Effect.Effect<U, DatabaseError>

export type ExecuteFn<TFullSchema extends DbSchema = DbSchema> = <T>(
  fn: (client: Client<TFullSchema> | TransactionClient<TFullSchema>) => Promise<T>
) => Effect.Effect<T, DatabaseError>;

export type Transaction = <T, E, R>(
  txExecute: (tx: TransactionContextShape) => Effect.Effect<T, E, R>
) => Effect.Effect<T, DatabaseError | E, R>;

export type MakeQuery<TFullSchema extends DbSchema = DbSchema> = <A, E, R, Input>(
  queryFn: (execute: ExecuteFn<TFullSchema>, input: Input) => Effect.Effect<A, E, R>,
) => (...args: [Input] extends [never] ? [] : [input: Input]) => Effect.Effect<A, E, R>

export type MakeQueryWithSchemaOptions<
  TFullSchema extends DbSchema,
  InputSchema extends S.Schema.AnyNoContext,
  OutputSchema extends S.Schema.AnyNoContext,
  A,
  E,
> = {
  readonly inputSchema: InputSchema;
  readonly outputSchema: OutputSchema;
  readonly queryFn: (
    execute: ExecuteFn<TFullSchema>,
    encodedInput: S.Schema.Encoded<InputSchema>,
    options?: undefined | { spanPrefix?: undefined | string },
  ) => Effect.Effect<A, E, never>;
};
export type ClientConnectionOptions = {
  readonly url: Redacted.Redacted<string>;
  readonly ssl: boolean;
};
export type MakeQueryWithSchema<TFullSchema extends DbSchema = DbSchema> = <
  InputSchema extends S.Schema.AnyNoContext,
  OutputSchema extends S.Schema.AnyNoContext,
  A,
  E,
>(
  options: MakeQueryWithSchemaOptions<TFullSchema, InputSchema, OutputSchema, A, E>,
) => (
  rawData: unknown,
) => Effect.Effect<S.Schema.Type<OutputSchema>, E | DatabaseError, never>

export interface DatabaseService<TFullSchema extends DbSchema = DbSchema> {
  readonly client: Client<TFullSchema>;
  readonly execute: ExecuteFn<TFullSchema>;
  readonly transaction: Transaction;
  readonly makeQuery: MakeQuery<TFullSchema>;
  readonly makeQueryWithSchema: MakeQueryWithSchema<TFullSchema>;
}