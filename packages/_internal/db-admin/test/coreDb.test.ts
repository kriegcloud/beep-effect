import { DbError, extractPostgresErrorFromCause } from "@beep/core-db/errors";
import * as Entities from "@beep/iam-domain/entities";
import * as IamRepos from "@beep/iam-infra/adapters/repositories";
import { IamDb } from "@beep/iam-infra/db";
import * as IamDbSchema from "@beep/iam-tables/schema";
import * as BS from "@beep/schema/schema";
import { describe, expect, it } from "@effect/vitest";
import { faker } from "@faker-js/faker";
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { PgContainer } from "./pg-container";

describe("@beep/core-db", () =>
  it.layer(PgContainer.Live, { timeout: "30 seconds" })("test core db errors", (it) => {
    it.effect(
      "mocked drizzle db should work",
      Effect.fnUntraced(function* () {
        const { db } = yield* IamDb.IamDb;
        const userRepo = yield* IamRepos.UserRepo;

        const now = yield* DateTime.now;
        const mockedUser = Entities.User.Model.insert.make({
          email: BS.Email.make("test1@example.com"),
          name: "beep",
          emailVerified: false,
          createdAt: now,
          updatedAt: now,
          image: O.some(faker.image.avatar()),
        });

        yield* userRepo.insert(mockedUser);

        const encodedMockedUser = yield* S.encode(Entities.User.Model.insert)(mockedUser);

        // This should cause a unique violation since we're inserting the same user again
        const insertResult = yield* db
          .insert(IamDbSchema.userTable)
          .values(encodedMockedUser)
          .returning()
          .pipe(
            Effect.sandbox,
            Effect.catchTags({
              Fail: (cause) =>
                Effect.gen(function* () {
                  // Now we have access to the full Cause structure
                  // Use our extraction function on the cause
                  const postgresError = extractPostgresErrorFromCause(cause);

                  if (postgresError) {
                    // Successfully extracted PostgresError - verify it's the expected unique violation
                    yield* Console.log(
                      `Successfully extracted PostgresError: ${postgresError.code} - ${postgresError.message}`
                    );
                    expect(postgresError.code).toEqual("23505");
                    expect(postgresError.constraint_name).toEqual("user_id_unique");

                    // Create our tagged DbError for consistency
                    const dbError = DbError.match(postgresError);
                    if (dbError) {
                      yield* Console.log(`Created tagged DbError: ${dbError.type}`);
                      expect(dbError.type).toEqual("unique_violation");
                    }

                    return "error_handled" as const;
                  }
                  yield* Effect.logError("Failed to extract PostgresError from Cause");
                  return yield* Effect.succeed(cause);
                }),
              Die: (cause) =>
                Effect.gen(function* () {
                  yield* Console.log(`Caught defect: ${cause.defect}`);
                  return yield* Effect.succeed(cause);
                }),
              Interrupt: (cause) =>
                Effect.gen(function* () {
                  yield* Console.log(`Caught interruption: ${cause.fiberId}`);
                  return yield* Effect.succeed(cause);
                }),
            }),
            Effect.unsandbox
          );

        yield* Console.log(`Insert result: ${JSON.stringify(insertResult)}`);

        const users = yield* db.query.userTable.findMany();

        // Should have only 1 user since the second insert failed with unique violation
        expect(users.length).toEqual(2);
      })
    );
  }));
