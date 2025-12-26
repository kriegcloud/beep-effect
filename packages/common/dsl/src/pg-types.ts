import { type Effect, Schema } from "effect";
import type { PgError, UnknownError } from "./errors.ts";
import type { EventSequenceNumber } from "./schema/mod.ts";
import type { QueryBuilder } from "./schema/state/pg/query-builder/api.ts";
import type { PreparedBindValues } from "./util.ts";

/**
 * Common interface for SQLite databases used by LiveStore to facilitate a consistent API across different platforms.
 * Always assumes a synchronous SQLite build with the `bytecode` and `session` extensions enabled.
 * Can be either in-memory or persisted to disk.
 */
export interface PgDb<TReq = any, TMetadata extends TReq = TReq> {
  _tag: "PgDb";
  metadata: TMetadata;
  /** Debug information (currently not persisted and only available at runtime) */
  debug: PgDebugInfo;
  prepare(queryStr: string): PreparedStatement;
  execute(
    queryStr: string,
    bindValues?: PreparedBindValues | undefined,
    options?: { onRowsChanged?: (rowsChanged: number) => void }
  ): void;
  execute(queryBuilder: QueryBuilder.Any, options?: { onRowsChanged?: (rowsChanged: number) => void }): void;

  select<T>(queryStr: string, bindValues?: PreparedBindValues | undefined): ReadonlyArray<T>;
  select<T>(queryBuilder: QueryBuilder<T, any, any>): T;

  export(): Uint8Array<ArrayBuffer>;
  import: (data: Uint8Array<ArrayBuffer> | PgDb<TReq>) => void;
  close(): void;
  destroy(): void;
  session(): PgDbSession;
  makeChangeset: (data: Uint8Array<ArrayBuffer>) => PgDbChangeset;
}

export type PgDebugInfo = { head: EventSequenceNumber.Client.Composite };

// TODO refactor this helper type. It's quite cumbersome to use and should be revisited.
export type MakePgDb<
  TReq = { dbPointer: number; persistenceInfo: PersistenceInfo },
  TInput_ extends { _tag: string } = { _tag: string },
  TMetadata_ extends TReq = TReq,
  R = never,
> = <
  TInput extends TInput_,
  TMetadata extends TMetadata_ & { _tag: TInput["_tag"] } = TMetadata_ & { _tag: TInput["_tag"] },
>(
  input: TInput
) => Effect.Effect<PgDb<TReq, Extract<TMetadata, { _tag: TInput["_tag"] }>>, PgError | UnknownError, R>;

export interface PreparedStatement {
  execute(
    bindValues: PreparedBindValues | undefined,
    options?: { onRowsChanged?: (rowsChanged: number) => void }
  ): void;
  select<T>(bindValues: PreparedBindValues | undefined): ReadonlyArray<T>;
  finalize(): void;
  sql: string;
}

export type PgDbSession = {
  changeset: () => Uint8Array<ArrayBuffer> | undefined;
  finish: () => void;
};

export type PgDbChangeset = {
  // TODO combining changesets (requires changes in the SQLite WASM binding)
  invert: () => PgDbChangeset;
  apply: () => void;
};

export const PersistenceInfo = Schema.Struct(
  {
    fileName: Schema.String,
  },
  { key: Schema.String, value: Schema.Any }
).annotations({ title: "LiveStore.PersistenceInfo" });

export type PersistenceInfo<With extends {} = {}> = typeof PersistenceInfo.Type & With;
