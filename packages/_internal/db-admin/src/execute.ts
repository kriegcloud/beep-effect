import { PostgresErrorEnum } from "@beep/core-db";
import { PostgresErrorCode } from "@beep/core-db/postgres/postgres-error.enum";
import * as Entities from "@beep/iam-domain/entities";
import { Email } from "@beep/schema/schema";
import { reverseRecord } from "@beep/utils/data/record.utils";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import { SqlError } from "@effect/sql/SqlError";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import * as PgClient from "@effect/sql-pg/PgClient";
import { DrizzleQueryError } from "drizzle-orm";
import { Cause, Config, Console, Effect, Exit, Layer, Option, pipe, Schema, String as Str } from "effect";
import * as Data from "effect/Data";
import postgres from "postgres";
import * as DbSchema from "./schema";

const SEPARATOR = "=".repeat(100);

const programThatErrors = Effect.gen(function* () {
  const db = yield* PgDrizzle.make({
    schema: DbSchema,
  });
  const mockedUser = Entities.User.Model.insert.make({
    email: Email.make(`test1-${crypto.randomUUID()}@example.com`),
    name: "beep",
  });

  const encodedMockedUser = yield* Schema.encode(Entities.User.Model.insert)(mockedUser);
  // intentionally insert a duplicate to violate constraint
  yield* db.insert(DbSchema.userTable).values(encodedMockedUser);
  const error = yield* db.insert(DbSchema.userTable).values(encodedMockedUser).returning().pipe(Effect.flip);

  yield* Console.log(JSON.stringify(error, null, 2));
  yield* Console.log("=".repeat(100));

  return yield* Effect.fail(error);
}).pipe(
  Effect.catchTags({
    ParseError: Effect.die,
  })
);

class DbError extends Data.TaggedError("DbError")<{
  readonly type: keyof typeof PostgresErrorEnum | "UNKNOWN";
  readonly message: string;
  readonly pgError: postgres.PostgresError | null;
  readonly drizzleQueryError: DrizzleQueryError | null;
  readonly sqlError: SqlError | null;
  readonly cause: unknown;
}> {}

const inspectFailure = (cause: Cause.Cause<unknown>) => {
  let pgError: postgres.PostgresError | null = null;
  let sqlError: SqlError | null = null;
  let drizzleQueryError: DrizzleQueryError | null = null;
  let type: keyof typeof PostgresErrorEnum | "UNKNOWN" = "UNKNOWN";
  let message = "Unknown Error.";

  if (Cause.isFailType(cause)) {
    console.log("Captured Cause:");
    console.log(JSON.stringify(cause, null, 2));
    console.log(SEPARATOR);

    pipe(
      Cause.failureOption(cause),
      Option.match({
        onNone: () => console.error("No error found."),
        onSome: (error) => {
          if (error instanceof SqlError) {
            sqlError = error;
            message = error.message;

            if (error.cause instanceof DrizzleQueryError) {
              drizzleQueryError = error.cause;

              // Temporary workaround: JSON round-tripping exposes the nested PostgresError
              // because FiberFailure hides it behind non-enumerable symbols.
              pipe(error.cause, JSON.stringify, JSON.parse, (errorCause) => {
                if (Cause.isFailType(errorCause.cause.cause)) {
                  pgError = new postgres.PostgresError(errorCause.cause.cause.failure.cause);

                  if (Schema.is(PostgresErrorCode)(pgError.code)) {
                    type = reverseRecord(PostgresErrorEnum)[pgError.code];
                  }
                }
              });
            }
          }
        },
      })
    );
  }

  const dbError = new DbError({
    type,
    message,
    cause,
    pgError,
    sqlError,
    drizzleQueryError,
  });

  console.log(JSON.stringify(dbError, null, 2));
  console.log(SEPARATOR);
  return dbError;
};

const program = Effect.gen(function* () {
  const exit = yield* Effect.exit(programThatErrors);
  return yield* Exit.match(exit, {
    onSuccess: () => Console.log("Success!"),
    onFailure: (cause) => inspectFailure(cause),
  });
});
const dbLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    return PgClient.layer({
      url: yield* Config.redacted("DB_PG_URL"),
      ssl: yield* Config.boolean("DB_PG_SSL"),
      transformQueryNames: Str.camelToSnake,
      transformResultNames: Str.snakeToCamel,
    });
  })
);
NodeRuntime.runMain(program.pipe(Effect.provide(dbLayer)));
