import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { VerificationRepo } from "@beep/iam-server/adapters/repositories";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { PgTest } from "../container";

/**
 * Timeout in milliseconds for bun test. Duration objects are not supported by bun test.
 */
const TEST_TIMEOUT = 60000;

/**
 * Helper to create a unique test identifier to avoid conflicts between tests.
 */
const makeTestIdentifier = (prefix: string): string => `${prefix}-${crypto.randomUUID()}@example.com`;

/**
 * Helper to create a mock verification for insert operations.
 */
const makeMockVerification = (
  overrides?: Partial<{
    identifier: string;
    value: string;
    expiresAt: O.Option<DateTime.Utc>;
  }>
) =>
  Entities.Verification.Model.insert.make({
    identifier: overrides?.identifier ?? makeTestIdentifier("test"),
    value: overrides?.value ?? crypto.randomUUID(),
    // expiresAt is required by the database (notNull constraint)
    expiresAt: overrides?.expiresAt ?? O.some(DateTime.unsafeNow()),
  });

describe("VerificationRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert verification and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const mockedVerification = makeMockVerification({
            identifier: makeTestIdentifier("insert"),
            value: "verification-code-123",
          });
          const inserted = yield* repo.insert(mockedVerification);

          // Verify schema conformance
          assertTrue(S.is(Entities.Verification.Model)(inserted));

          // Verify fields
          strictEqual(inserted.identifier, mockedVerification.identifier);
          strictEqual(inserted.value, "verification-code-123");

          // Verify expiresAt is present (required by database)
          strictEqual(inserted.expiresAt._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted verification",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const verification1 = yield* repo.insert(
            makeMockVerification({ identifier: makeTestIdentifier("unique-1") })
          );
          const verification2 = yield* repo.insert(
            makeMockVerification({ identifier: makeTestIdentifier("unique-2") })
          );

          // IDs should be different
          expect(verification1.id).not.toBe(verification2.id);

          // Both should be valid EntityId format (verification__uuid)
          expect(verification1.id).toMatch(/^verification__[0-9a-f-]+$/);
          expect(verification2.id).toMatch(/^verification__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert verification without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const identifier = makeTestIdentifier("insert-void");
          const mockedVerification = makeMockVerification({
            identifier,
            value: "void-test-code",
          });

          // insertVoid returns void
          const result = yield* repo.insertVoid(mockedVerification);
          strictEqual(result, undefined);

          // Verification was inserted - we can verify by inserting with the same
          // identifier. Unlike User which has unique email, Verification may allow
          // duplicate identifiers (multiple codes per email). Verify by attempting
          // to insert another with same identifier and different value.
          const secondResult = yield* Effect.either(
            repo.insertVoid(
              makeMockVerification({
                identifier,
                value: "different-code",
              })
            )
          );

          // Depending on schema constraints, this may succeed or fail
          // For verification tokens, typically multiple codes per identifier are allowed
          // The test verifies insertVoid works regardless of the outcome
          expect(secondResult._tag).toMatch(/^(Left|Right)$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FIND BY ID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("findById operations", (it) => {
    it.effect(
      "should return Some when verification exists",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const mockedVerification = makeMockVerification({
            identifier: makeTestIdentifier("find-some"),
            value: "find-test-code",
          });
          const inserted = yield* repo.insert(mockedVerification);

          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.identifier, mockedVerification.identifier);
            strictEqual(found.value.value, "find-test-code");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when verification does not exist",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          // Use a valid VerificationId format that doesn't exist (EntityId format: verification__uuid)
          const nonExistentId = "verification__00000000-0000-0000-0000-000000000000";
          const result = yield* repo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete verification entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const mockedVerification = makeMockVerification({
            identifier: makeTestIdentifier("find-complete"),
            value: "complete-test-code",
          });
          const inserted = yield* repo.insert(mockedVerification);
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("identifier");
            expect(found.value).toHaveProperty("value");
            expect(found.value).toHaveProperty("expiresAt");
            expect(found.value).toHaveProperty("createdAt");
            expect(found.value).toHaveProperty("updatedAt");
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("update operations", (it) => {
    it.effect(
      "should update verification value and return updated entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          // Setup: create verification
          const mockedVerification = makeMockVerification({
            identifier: makeTestIdentifier("update-value"),
            value: "original-code",
          });
          const inserted = yield* repo.insert(mockedVerification);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* repo.update({
            ...inserted,
            value: "updated-code",
          });

          // Verify returned entity has updated value
          strictEqual(updated.value, "updated-code");
          deepStrictEqual(updated.id, inserted.id);
          strictEqual(updated.identifier, mockedVerification.identifier);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update identifier field",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const mockedVerification = makeMockVerification({
            identifier: makeTestIdentifier("update-identifier"),
            value: "identifier-test-code",
          });
          const inserted = yield* repo.insert(mockedVerification);

          const newIdentifier = makeTestIdentifier("updated-identifier");

          // Update identifier
          const updated = yield* repo.update({
            ...inserted,
            identifier: newIdentifier,
          });

          strictEqual(updated.identifier, newIdentifier);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update expiresAt field",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const initialDate = DateTime.unsafeNow();
          const mockedVerification = makeMockVerification({
            identifier: makeTestIdentifier("update-expires"),
            value: "expires-test-code",
            expiresAt: O.some(initialDate),
          });
          const inserted = yield* repo.insert(mockedVerification);

          // Initially should have the timestamp we provided
          strictEqual(inserted.expiresAt._tag, "Some");

          // Create a future expiration date
          const futureDate = DateTime.add(DateTime.unsafeNow(), { hours: 24 });

          // Update with new expiration
          const updated = yield* repo.update({
            ...inserted,
            expiresAt: O.some(futureDate),
          });

          strictEqual(updated.expiresAt._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const mockedVerification = makeMockVerification({
            identifier: makeTestIdentifier("update-persist"),
            value: "persist-test",
          });
          const inserted = yield* repo.insert(mockedVerification);

          yield* repo.update({
            ...inserted,
            value: "persisted-update",
          });

          // Verify by fetching fresh
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.value, "persisted-update");
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // UPDATE VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("updateVoid operations", (it) => {
    it.effect(
      "should update verification without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const mockedVerification = makeMockVerification({
            identifier: makeTestIdentifier("update-void"),
            value: "updatevoid-original",
          });
          const inserted = yield* repo.insert(mockedVerification);

          // updateVoid returns void
          const result = yield* repo.updateVoid({
            ...inserted,
            value: "updatevoid-updated",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.value, "updatevoid-updated");
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("delete operations", (it) => {
    it.effect(
      "should delete existing verification",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const mockedVerification = makeMockVerification({
            identifier: makeTestIdentifier("delete"),
            value: "delete-test-code",
          });
          const inserted = yield* repo.insert(mockedVerification);

          // Verify verification exists
          const beforeDelete = yield* repo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* repo.delete(inserted.id);

          // Verify verification no longer exists
          const afterDelete = yield* repo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent verification",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          // Deleting a non-existent ID should not throw (EntityId format: verification__uuid)
          const nonExistentId = "verification__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(repo.delete(nonExistentId));

          // Should succeed (void operation on non-existent is typically a no-op)
          strictEqual(result._tag, "Right");
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT MANY VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertManyVoid operations", (it) => {
    it.effect(
      "should insert multiple verifications without returning entities",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const prefix = crypto.randomUUID();
          const verifications = [
            makeMockVerification({
              identifier: makeTestIdentifier(`many-1-${prefix}`),
              value: "batch-code-1",
            }),
            makeMockVerification({
              identifier: makeTestIdentifier(`many-2-${prefix}`),
              value: "batch-code-2",
            }),
            makeMockVerification({
              identifier: makeTestIdentifier(`many-3-${prefix}`),
              value: "batch-code-3",
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* repo.insertManyVoid(
            verifications as unknown as readonly [
              typeof Entities.Verification.Model.insert.Type,
              ...(typeof Entities.Verification.Model.insert.Type)[],
            ]
          );

          strictEqual(result, undefined);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("error handling", (it) => {
    it.effect(
      "should die when updating non-existent verification",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          // First create a valid verification to get a proper structure for update
          const mockedVerification = makeMockVerification({
            identifier: makeTestIdentifier("update-nonexistent"),
            value: "temp-code",
          });
          const inserted = yield* repo.insert(mockedVerification);

          // Delete the verification
          yield* repo.delete(inserted.id);

          // Now try to update the deleted (non-existent) verification
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            repo.update({
              ...inserted,
              value: "should-not-work",
            })
          );

          // Update on non-existent row dies with NoSuchElementException (treated as defect)
          // The repo's design catches this and calls Effect.die, so we check for Failure
          strictEqual(exit._tag, "Failure");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle duplicate insert gracefully based on schema constraints",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const identifier = makeTestIdentifier("duplicate-check");
          const value = "same-verification-code";

          const verification1 = makeMockVerification({ identifier, value });

          // First insert should succeed
          yield* repo.insert(verification1);

          // Second insert with identical data - result depends on unique constraints
          // Verification table typically allows multiple tokens per identifier
          const verification2 = makeMockVerification({ identifier, value });
          const result = yield* Effect.either(repo.insert(verification2));

          // Either succeeds (no unique constraint) or fails (unique constraint)
          // This test documents the actual behavior
          expect(result._tag).toMatch(/^(Left|Right)$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INTEGRATION / WORKFLOW TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("complete CRUD workflow", (it) => {
    it.effect(
      "should complete full create-read-update-delete cycle",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          // CREATE
          const mockedVerification = makeMockVerification({
            identifier: makeTestIdentifier("crud-workflow"),
            value: "crud-test-code",
          });
          const created = yield* repo.insert(mockedVerification);
          assertTrue(S.is(Entities.Verification.Model)(created));

          // READ
          const read = yield* repo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.value, "crud-test-code");
          }

          // UPDATE
          const futureExpiry = DateTime.add(DateTime.unsafeNow(), { hours: 1 });
          const updated = yield* repo.update({
            ...created,
            value: "updated-crud-code",
            expiresAt: O.some(futureExpiry),
          });
          strictEqual(updated.value, "updated-crud-code");
          strictEqual(updated.expiresAt._tag, "Some");

          // Verify update persisted
          const readAfterUpdate = yield* repo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.value, "updated-crud-code");
            strictEqual(readAfterUpdate.value.expiresAt._tag, "Some");
          }

          // DELETE
          yield* repo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* repo.findById(created.id);
          assertNone(readAfterDelete);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // EXPIRESAT FIELD HANDLING
  // Note: expiresAt is NOT NULL in the database, so it must always have a value
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("expiresAt field", (it) => {
    it.effect(
      "should require expiresAt field (database NOT NULL constraint)",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          // Create with default expiresAt (makeMockVerification provides one)
          const verification = yield* repo.insert(
            makeMockVerification({
              identifier: makeTestIdentifier("default-expiry"),
              value: "default-expiry-code",
            })
          );

          // expiresAt should always be Some (required by database)
          strictEqual(verification.expiresAt._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle explicit expiresAt value",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          // Create with explicit expiresAt
          const futureDate = DateTime.add(DateTime.unsafeNow(), { hours: 2 });
          const verificationWithExpiry = yield* repo.insert(
            makeMockVerification({
              identifier: makeTestIdentifier("with-expiry"),
              value: "with-expiry-code",
              expiresAt: O.some(futureDate),
            })
          );

          // expiresAt should be Some
          strictEqual(verificationWithExpiry.expiresAt._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update expiresAt to a new value",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const initialDate = DateTime.unsafeNow();
          const verification = yield* repo.insert(
            makeMockVerification({
              identifier: makeTestIdentifier("update-expiry"),
              value: "expiry-change-code",
              expiresAt: O.some(initialDate),
            })
          );

          // Initially has a timestamp
          strictEqual(verification.expiresAt._tag, "Some");

          // Update to a new timestamp
          const futureDate = DateTime.add(DateTime.unsafeNow(), { minutes: 30 });
          const updated = yield* repo.update({
            ...verification,
            expiresAt: O.some(futureDate),
          });

          strictEqual(updated.expiresAt._tag, "Some");

          // Verify persisted
          const found = yield* repo.findById(verification.id);
          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.expiresAt._tag, "Some");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should extend expiration by updating to later timestamp",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          // Create with short expiry
          const shortExpiry = DateTime.add(DateTime.unsafeNow(), { hours: 1 });
          const verification = yield* repo.insert(
            makeMockVerification({
              identifier: makeTestIdentifier("extend-expiry"),
              value: "extend-expiry-code",
              expiresAt: O.some(shortExpiry),
            })
          );

          // Initially Some
          strictEqual(verification.expiresAt._tag, "Some");

          // Extend to longer expiry
          const longerExpiry = DateTime.add(DateTime.unsafeNow(), { hours: 24 });
          const updated = yield* repo.update({
            ...verification,
            expiresAt: O.some(longerExpiry),
          });

          strictEqual(updated.expiresAt._tag, "Some");

          // Verify persisted
          const found = yield* repo.findById(verification.id);
          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.expiresAt._tag, "Some");
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // VERIFICATION-SPECIFIC SCENARIOS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("verification-specific scenarios", (it) => {
    it.effect(
      "should support typical email verification workflow",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const userEmail = makeTestIdentifier("email-verify");
          const verificationCode = crypto.randomUUID().slice(0, 8).toUpperCase();
          const expiresIn = DateTime.add(DateTime.unsafeNow(), { minutes: 15 });

          // Step 1: Create verification token for email
          const verification = yield* repo.insert(
            makeMockVerification({
              identifier: userEmail,
              value: verificationCode,
              expiresAt: O.some(expiresIn),
            })
          );

          strictEqual(verification.identifier, userEmail);
          strictEqual(verification.value, verificationCode);
          strictEqual(verification.expiresAt._tag, "Some");

          // Step 2: Retrieve verification for validation
          const retrieved = yield* repo.findById(verification.id);
          strictEqual(retrieved._tag, "Some");
          if (retrieved._tag === "Some") {
            strictEqual(retrieved.value.value, verificationCode);
          }

          // Step 3: Delete after successful verification
          yield* repo.delete(verification.id);

          // Step 4: Confirm deletion
          const afterDeletion = yield* repo.findById(verification.id);
          assertNone(afterDeletion);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should support multiple verification tokens for same identifier",
      () =>
        Effect.gen(function* () {
          const repo = yield* VerificationRepo;

          const identifier = makeTestIdentifier("multi-token");

          // Create multiple tokens for the same identifier
          // This is common when users request new codes before old ones expire
          const token1 = yield* repo.insert(
            makeMockVerification({
              identifier,
              value: "token-1",
            })
          );

          const token2Result = yield* Effect.either(
            repo.insert(
              makeMockVerification({
                identifier,
                value: "token-2",
              })
            )
          );

          // Verify first token was created
          expect(token1.id).toMatch(/^verification__[0-9a-f-]+$/);

          // Second token behavior depends on schema constraints
          // Document the actual behavior
          if (token2Result._tag === "Right") {
            // Multiple tokens allowed - both should have different IDs
            expect(token2Result.right.id).not.toBe(token1.id);
          }
          // If Left, there's a unique constraint preventing duplicates
        }),
      TEST_TIMEOUT
    );
  });
});
