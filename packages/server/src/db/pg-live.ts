import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as FileSystem from "@effect/platform/FileSystem";
import * as PgClient from "@effect/sql-pg/PgClient";
import * as SqlClient from "@effect/sql/SqlClient";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import { identity } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as Str from "effect/String";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { types } from "pg";

types.setTypeParser(types.builtins.DATE, identity);
types.setTypeParser(types.builtins.TIMESTAMP, identity);
types.setTypeParser(types.builtins.TIMESTAMPTZ, identity);
types.setTypeParser(types.builtins.JSON, identity);
types.setTypeParser(types.builtins.JSONB, identity);

export const pgConfig: PgClient.PgClientConfig = {
  transformQueryNames: Str.camelToSnake,
  transformResultNames: Str.snakeToCamel,
  transformJson: true,
  types,
};

export const PgLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const databaseUrl = yield* Config.redacted("DATABASE_URL");

    return PgClient.layer({
      url: databaseUrl,
      idleTimeout: "10 seconds",
      connectTimeout: "10 seconds",
      ...pgConfig,
    });
  }),
).pipe(Layer.orDie);

// ===============================
// Testcontainers
// ===============================

class PgContainer extends Effect.Service<PgContainer>()("PgContainer", {
  scoped: Effect.acquireRelease(
    Effect.promise(() => new PostgreSqlContainer("postgres:alpine").start()),
    (container) => Effect.promise(() => container.stop()),
  ),
}) {}

const ApplySchemaDump = Layer.effectDiscard(
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    const fs = yield* FileSystem.FileSystem;
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const schemaPath = path.resolve(currentDir, "migrations/sql/_schema.sql");
    const schema = yield* fs.readFileString(schemaPath);
    yield* sql.unsafe(schema);
  }),
).pipe(Layer.provide(NodeFileSystem.layer), Layer.orDie);

const PgClientTest = Layer.unwrapEffect(
  Effect.gen(function* () {
    const container = yield* PgContainer;
    return PgClient.layer({
      url: Redacted.make(container.getConnectionUri()),
      ...pgConfig,
    });
  }),
).pipe(Layer.provide(PgContainer.Default), Layer.orDie);

export const PgTest = ApplySchemaDump.pipe(Layer.provideMerge(PgClientTest));

// ===============================
// Test Utils
// ===============================

class TransactionRollback extends Schema.TaggedError<TransactionRollback>("TestRollback")(
  "TestRollback",
  {
    value: Schema.Any,
  },
) {}

export const withTransactionRollback = <A, E, R>(self: Effect.Effect<A, E, R>) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    return yield* sql
      .withTransaction(
        Effect.gen(function* () {
          const value = yield* self;
          return yield* new TransactionRollback({ value });
        }),
      )
      .pipe(
        Effect.catchIf(Schema.is(TransactionRollback), (error) => Effect.succeed(error.value as A)),
      );
  });
