import {
  formatSql,
  getPgErrorAliases,
  getPgErrorName,
  makeDrizzle,
  makeDrizzleLayer,
  migrate,
  PgErrorCode,
  type PgErrorCode as PgErrorCodeType,
  type PgErrorName as PgErrorNameType,
  PostgresClient,
  type PostgresClientValue,
  type PostgresDrizzle,
  type PostgresDrizzleDatabase,
  PostgresError,
} from "@beep/postgres";
import type { Effect, Layer } from "effect";
import type * as O from "effect/Option";
import { describe, expect, it } from "tstyche";

declare const client: PostgresClientValue;
declare const db: PostgresDrizzleDatabase;

describe("@beep/postgres", () => {
  it("exports SQLSTATE models", () => {
    expect<PgErrorCodeType>().type.toBe<"23505" | PgErrorCodeType>();
    expect<PgErrorNameType>().type.toBe<"UNIQUE_VIOLATION" | PgErrorNameType>();
    expect(PgErrorCode).type.not.toBe<never>();
    expect(getPgErrorName("23505")).type.toBe<O.Option<PgErrorNameType>>();
    expect(getPgErrorAliases("23505")).type.toBe<O.Option<ReadonlyArray<PgErrorNameType>>>();
  });

  it("exports Postgres errors and formatting helpers", () => {
    expect(PostgresError.fromUnknown("query", new Error("boom"))).type.toBe<PostgresError>();
    expect(formatSql("select 1")).type.toBe<string>();
  });

  it("exports client and Drizzle layer helpers", () => {
    expect(PostgresClient.fromPgClient(client)).type.not.toBe<never>();
    expect(makeDrizzle()).type.toBe<Effect.Effect<PostgresDrizzleDatabase, PostgresError, PostgresClientValue>>();
    expect(makeDrizzleLayer()).type.toBe<Layer.Layer<PostgresDrizzle, PostgresError, PostgresClientValue>>();
    expect(migrate(db, { migrationsFolder: "./drizzle" })).type.toBe<Effect.Effect<undefined, PostgresError>>();
  });
});
