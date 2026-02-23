/**
 * DatabaseError.$match Integration Tests
 *
 * Validates that DatabaseError.$match correctly extracts PgDatabaseError
 * from SqlError and properly matches against error codes for different
 * constraint violations.
 *
 * @module test/DatabaseError
 */

import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";

const AccountRepo = Entities.Account.Repo;
const UserRepo = Entities.User.Repo;

import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import { DatabaseError } from "@beep/shared-domain/errors/db-error";
import { layer, strictEqual } from "@beep/testkit";
import * as SqlClient from "@effect/sql/SqlClient";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { PgTest } from "./container";

/**
 * Timeout in milliseconds for bun test. Duration objects are not supported by bun test.
 */
const TEST_TIMEOUT = 120000;

/**
 * Helper to create a unique test email to avoid conflicts between tests.
 */
const makeTestEmail = (prefix: string): BS.Email.Type => BS.Email.make(`${prefix}-${crypto.randomUUID()}@example.com`);

/**
 * Helper to create a mock user for insert operations.
 */
const makeMockUser = (overrides?: undefined | Partial<{ readonly email: BS.Email.Type; readonly name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("test"),
    name: overrides?.name ?? "Test User",
  });

/**
 * Helper to create a mock account for insert operations.
 */
const makeMockAccount = (overrides: {
  readonly userId: SharedEntityIds.UserId.Type;
  readonly accountId?: undefined | string;
  readonly providerId?: undefined | string;
}) =>
  Entities.Account.Model.jsonCreate.make({
    userId: overrides.userId,
    accountId: overrides.accountId ?? `ext-account-${crypto.randomUUID()}`,
    providerId: overrides.providerId ?? "google",
  });

describe("DatabaseError.$match", () => {
  // ============================================================================
  // UNIQUE_VIOLATION TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("UNIQUE_VIOLATION extraction", (it) => {
    it.effect(
      "should extract PgDatabaseError and match UNIQUE_VIOLATION on duplicate insert",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const { data: user } = yield* userRepo.insert(
            makeMockUser({ email: makeTestEmail("unique-violation-test") })
          );

          // Create first account successfully
          const accountId = `unique-${crypto.randomUUID()}`;
          yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId,
              providerId: "google",
            })
          );

          // Attempt duplicate insert - should fail with unique violation
          const duplicateResult = yield* Effect.either(
            accountRepo.insert(
              makeMockAccount({
                userId: user.id,
                accountId, // Same accountId
                providerId: "google", // Same providerId
              })
            )
          );

          strictEqual(duplicateResult._tag, "Left", "Duplicate insert should fail");

          if (duplicateResult._tag === "Left") {
            // Use $match to extract and categorize the error
            const matchedError = DatabaseError.$match(duplicateResult.left);

            // Verify it's a DatabaseError
            strictEqual(matchedError._tag, "DatabaseError");

            // Verify the type was correctly identified (S.optional means raw value or undefined)
            strictEqual(matchedError.type, "UNIQUE_VIOLATION");

            // Verify pgError was extracted (not null)
            expect(matchedError.pgError).not.toBeNull();

            if (matchedError.pgError !== null) {
              // Verify the actual pg error code
              strictEqual(matchedError.pgError?.code, "23505");
            }
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should extract constraint name from UNIQUE_VIOLATION",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;

          // Create first user
          const email = makeTestEmail("constraint-name-test");
          yield* userRepo.insert(makeMockUser({ email, name: "First User" }));

          // Attempt duplicate email - users have unique email constraint
          const duplicateResult = yield* Effect.either(userRepo.insert(makeMockUser({ email, name: "Second User" })));

          strictEqual(duplicateResult._tag, "Left", "Duplicate email should fail");

          if (duplicateResult._tag === "Left") {
            const matchedError = DatabaseError.$match(duplicateResult.left);

            strictEqual(matchedError._tag, "DatabaseError");
            strictEqual(matchedError.type, "UNIQUE_VIOLATION");

            // pgError should have constraint info
            expect(matchedError.pgError).not.toBeNull();
            if (matchedError.pgError !== null) {
              expect(matchedError.pgError?.constraint).toBeDefined();
              expect(matchedError.pgError?.table).toBeDefined();
            }
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FOREIGN_KEY_VIOLATION TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("FOREIGN_KEY_VIOLATION extraction", (it) => {
    it.effect(
      "should extract PgDatabaseError and match FOREIGN_KEY_VIOLATION on invalid FK",
      () =>
        Effect.gen(function* () {
          const accountRepo = yield* AccountRepo;

          // Attempt to create account with non-existent user ID
          const fakeUserId = "shared_user__00000000-0000-0000-0000-000000000000" as SharedEntityIds.UserId.Type;

          const result = yield* Effect.either(
            accountRepo.insert(
              makeMockAccount({
                userId: fakeUserId,
                accountId: `fk-test-${crypto.randomUUID()}`,
                providerId: "google",
              })
            )
          );

          strictEqual(result._tag, "Left", "Insert with invalid FK should fail");

          if (result._tag === "Left") {
            const matchedError = DatabaseError.$match(result.left);

            strictEqual(matchedError._tag, "DatabaseError");
            strictEqual(matchedError.type, "FOREIGN_KEY_VIOLATION");

            expect(matchedError.pgError).not.toBeNull();
            if (matchedError.pgError !== null) {
              strictEqual(matchedError.pgError?.code, "23503");
              // FK violation should reference the table/constraint
              expect(matchedError.pgError?.table).toBeDefined();
            }
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // NOT_NULL_VIOLATION TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("NOT_NULL_VIOLATION extraction", (it) => {
    it.effect(
      "should extract PgDatabaseError and match NOT_NULL_VIOLATION",
      () =>
        Effect.gen(function* () {
          const sql = yield* SqlClient.SqlClient;

          // Create a test table with a NOT NULL constraint
          yield* sql`
            CREATE TABLE IF NOT EXISTS test_not_null_violation (
              id SERIAL PRIMARY KEY,
              required_field TEXT NOT NULL
            )
          `;

          // Attempt to insert NULL in a NOT NULL column
          const result = yield* Effect.either(sql`INSERT INTO test_not_null_violation (required_field) VALUES (NULL)`);

          strictEqual(result._tag, "Left", "Insert with NULL in NOT NULL column should fail");

          if (result._tag === "Left") {
            const matchedError = DatabaseError.$match(result.left);

            strictEqual(matchedError._tag, "DatabaseError");
            strictEqual(matchedError.type, "NOT_NULL_VIOLATION");

            expect(matchedError.pgError).not.toBeNull();
            if (matchedError.pgError !== null) {
              strictEqual(matchedError.pgError?.code, "23502");
              expect(matchedError.pgError?.column).toBe("required_field");
            }
          }

          // Cleanup
          yield* sql`DROP TABLE IF EXISTS test_not_null_violation`;
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // CHECK_VIOLATION TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("CHECK_VIOLATION extraction", (it) => {
    it.effect(
      "should extract PgDatabaseError and match CHECK_VIOLATION when constraint exists",
      () =>
        Effect.gen(function* () {
          const sql = yield* SqlClient.SqlClient;

          // First, create a table with a CHECK constraint for testing
          yield* sql`
            CREATE TABLE IF NOT EXISTS test_check_violation (
              id SERIAL PRIMARY KEY,
              value INT CHECK (value > 0)
            )
          `;

          // Attempt to insert value that violates CHECK constraint
          const result = yield* Effect.either(sql`INSERT INTO test_check_violation (value) VALUES (-1)`);

          strictEqual(result._tag, "Left", "Insert violating CHECK constraint should fail");

          if (result._tag === "Left") {
            const matchedError = DatabaseError.$match(result.left);

            strictEqual(matchedError._tag, "DatabaseError");
            strictEqual(matchedError.type, "CHECK_VIOLATION");

            expect(matchedError.pgError).not.toBeNull();
            if (matchedError.pgError !== null) {
              strictEqual(matchedError.pgError?.code, "23514");
            }
          }

          // Cleanup
          yield* sql`DROP TABLE IF EXISTS test_check_violation`;
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // extractPgError TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("extractPgError behavior", (it) => {
    it.effect(
      "should recursively extract PgDatabaseError from nested SqlError.cause",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;

          // Create first user
          const email = makeTestEmail("extract-nested");
          yield* userRepo.insert(makeMockUser({ email }));

          // Attempt duplicate
          const result = yield* Effect.either(userRepo.insert(makeMockUser({ email })));

          strictEqual(result._tag, "Left");

          if (result._tag === "Left") {
            // extractPgError should work regardless of wrapping depth
            const extracted = DatabaseError.extractPgError(result.left);

            expect(extracted).not.toBeNull();
            if (extracted !== null) {
              strictEqual(extracted.code, "23505"); // UNIQUE_VIOLATION code
            }
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return null for non-pg errors",
      () =>
        Effect.gen(function* () {
          // Create a regular Error (not a pg error)
          const regularError = new Error("This is not a database error");

          const extracted = DatabaseError.extractPgError(regularError);

          strictEqual(extracted, null);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // $match FALLBACK BEHAVIOR
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("$match fallback behavior", (it) => {
    it.effect(
      "should return DatabaseError without pgError for non-database errors",
      () =>
        Effect.gen(function* () {
          const regularError = new Error("Not a database error");

          const matchedError = DatabaseError.$match(regularError);

          strictEqual(matchedError._tag, "DatabaseError");
          // type should be undefined for non-pg errors (S.optional)
          strictEqual(matchedError.type, undefined);
          // pgError should be undefined for non-pg errors (S.optionalWith - not provided)
          strictEqual(matchedError.pgError, undefined);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should preserve original error in cause",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;

          const email = makeTestEmail("cause-preservation");
          yield* userRepo.insert(makeMockUser({ email }));

          const result = yield* Effect.either(userRepo.insert(makeMockUser({ email })));

          strictEqual(result._tag, "Left");

          if (result._tag === "Left") {
            const matchedError = DatabaseError.$match(result.left);

            // Original error should be preserved in cause
            expect(matchedError.cause).toBeDefined();
            // The cause should be the original SqlError
            strictEqual(matchedError.cause, result.left);
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // ERROR MATCHING FOR DIFFERENT HANDLING
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("error type-based handling", (it) => {
    it.effect(
      "should enable different error handling based on type",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for valid FK
          const { data: user } = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("type-handling") }));

          // Test UNIQUE_VIOLATION handling
          const accountId = `type-test-${crypto.randomUUID()}`;
          yield* accountRepo.insert(makeMockAccount({ userId: user.id, accountId, providerId: "google" }));

          const uniqueError = yield* Effect.either(
            accountRepo.insert(makeMockAccount({ userId: user.id, accountId, providerId: "google" }))
          );

          if (uniqueError._tag === "Left") {
            const matched = DatabaseError.$match(uniqueError.left);

            // Demonstrate type-based handling (type is raw value or undefined)
            const userMessage =
              matched.type === undefined
                ? "Unknown database error"
                : (() => {
                    switch (matched.type) {
                      case "UNIQUE_VIOLATION":
                        return "This record already exists";
                      case "FOREIGN_KEY_VIOLATION":
                        return "Referenced record does not exist";
                      case "NOT_NULL_VIOLATION":
                        return "Required field is missing";
                      case "CHECK_VIOLATION":
                        return "Value does not meet requirements";
                      default:
                        return `Database error: ${matched.type}`;
                    }
                  })();

            strictEqual(userMessage, "This record already exists");
          }

          // Test FOREIGN_KEY_VIOLATION handling
          const fakeUserId = "shared_user__00000000-0000-0000-0000-000000000001" as SharedEntityIds.UserId.Type;
          const fkError = yield* Effect.either(
            accountRepo.insert(makeMockAccount({ userId: fakeUserId, providerId: "github" }))
          );

          if (fkError._tag === "Left") {
            const matched = DatabaseError.$match(fkError.left);

            const userMessage =
              matched.type === undefined
                ? "Unknown database error"
                : (() => {
                    switch (matched.type) {
                      case "UNIQUE_VIOLATION":
                        return "This record already exists";
                      case "FOREIGN_KEY_VIOLATION":
                        return "Referenced record does not exist";
                      default:
                        return `Database error: ${matched.type}`;
                    }
                  })();

            strictEqual(userMessage, "Referenced record does not exist");
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // CONNECTION_EXCEPTION HANDLING
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(120) })("CONNECTION_EXCEPTION handling", (it) => {
    it.effect(
      "should handle CONNECTION_EXCEPTION error code (08000) when matched",
      () =>
        Effect.gen(function* () {
          // Create a mock error that simulates connection exception
          // Note: Actually triggering a connection exception in tests is difficult
          // without killing the container, so we test the matching logic directly

          // Import pg-protocol to create a proper PgDatabaseError
          const { DatabaseError: PgDatabaseError } = yield* Effect.promise(() => import("pg-protocol"));

          // Create a simulated connection error
          const pgError = new PgDatabaseError("Connection lost", 0, "error");
          pgError.code = "08000"; // CONNECTION_EXCEPTION

          const matchedError = DatabaseError.$match(pgError);

          strictEqual(matchedError._tag, "DatabaseError");
          strictEqual(matchedError.type, "CONNECTION_EXCEPTION");
        }),
      TEST_TIMEOUT
    );
  });
});
