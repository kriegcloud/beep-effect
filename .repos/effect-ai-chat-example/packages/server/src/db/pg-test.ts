import * as PgClient from "@effect/sql-pg/PgClient";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { SqlClient } from "effect/unstable/sql/SqlClient";
import { pgConfig } from "./pg-live.js";

const getTestDbUrl = (): string => {
  const url = process.env.TEST_DB_URL;
  if (!url) {
    throw new Error("TEST_DB_URL not set. Ensure globalSetup is configured in vitest.config.ts");
  }
  return url;
};

export const PgTest = Layer.unwrap(
  Effect.sync(() =>
    PgClient.layer({
      url: Redacted.make(getTestDbUrl()),
      ...pgConfig,
    })
  ),
).pipe(Layer.orDie);

class TransactionRollback extends Schema.TaggedErrorClass<TransactionRollback>()(
  "TestRollback",
  { value: Schema.Any },
) {}

export const withTransactionRollback = <A, E, R>(self: Effect.Effect<A, E, R>) =>
  Effect.gen(function*() {
    const sql = yield* SqlClient;
    return yield* sql
      .withTransaction(
        Effect.gen(function*() {
          const value = yield* self;
          return yield* new TransactionRollback({ value });
        }),
      )
      .pipe(
        Effect.catchIf(Schema.is(TransactionRollback), (error) => Effect.succeed(error.value as A)),
      );
  });
