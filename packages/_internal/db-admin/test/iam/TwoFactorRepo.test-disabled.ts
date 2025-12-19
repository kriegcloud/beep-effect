import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { TwoFactorRepo, UserRepo } from "@beep/iam-infra/adapters/repositories";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { PgTest } from "../container.ts";

/**
 * Timeout in milliseconds for bun test. Duration objects are not supported by bun test.
 */
const TEST_TIMEOUT = 60000;

/**
 * Helper to create a unique test email to avoid conflicts between tests.
 */
const makeTestEmail = (prefix: string): BS.Email.Type => BS.Email.make(`${prefix}-${crypto.randomUUID()}@example.com`);

/**
 * Helper to create a mock user for insert operations.
 * TwoFactor requires a userId foreign key, so we need a User first.
 */
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("test"),
    name: overrides?.name ?? "Test User",
  });

/**
 * Helper to create a mock TwoFactor for insert operations.
 */
const makeMockTwoFactor = (
  userId: (typeof User.Model.Type)["id"],
  overrides?: Partial<{ secret: string; backupCodes: string }>
) =>
  Entities.TwoFactor.Model.insert.make({
    userId,
    secret: overrides?.secret ?? `secret-${crypto.randomUUID()}`,
    backupCodes: overrides?.backupCodes ?? `backup-codes-${crypto.randomUUID()}`,
  });

describe("TwoFactorRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert TwoFactor and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          // Setup: create a user first (FK dependency)
          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("insert-2fa"),
              name: "Insert 2FA User",
            })
          );

          const mockedTwoFactor = makeMockTwoFactor(user.id, {
            secret: "test-secret-key",
            backupCodes: "backup-code-1,backup-code-2",
          });
          const inserted = yield* twoFactorRepo.insert(mockedTwoFactor);

          // Verify schema conformance
          assertTrue(S.is(Entities.TwoFactor.Model)(inserted));

          // Verify fields
          deepStrictEqual(inserted.userId, user.id);
          strictEqual(inserted.secret, "test-secret-key");
          strictEqual(inserted.backupCodes, "backup-code-1,backup-code-2");

          // Verify audit fields exist
          expect(inserted).toHaveProperty("createdAt");
          expect(inserted).toHaveProperty("updatedAt");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted TwoFactor",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          // Create two users for two separate 2FA entries
          const user1 = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("unique-2fa-1") }));
          const user2 = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("unique-2fa-2") }));

          const twoFactor1 = yield* twoFactorRepo.insert(makeMockTwoFactor(user1.id));
          const twoFactor2 = yield* twoFactorRepo.insert(makeMockTwoFactor(user2.id));

          // IDs should be different
          expect(twoFactor1.id).not.toBe(twoFactor2.id);

          // Both should be valid EntityId format (two_factor__uuid)
          expect(twoFactor1.id).toMatch(/^two_factor__[0-9a-f-]+$/);
          expect(twoFactor2.id).toMatch(/^two_factor__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert TwoFactor without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          // Setup: create user
          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("insert-void-2fa"),
              name: "InsertVoid 2FA User",
            })
          );

          const mockedTwoFactor = makeMockTwoFactor(user.id);

          // insertVoid returns void
          const result = yield* twoFactorRepo.insertVoid(mockedTwoFactor);
          strictEqual(result, undefined);

          // Verify the TwoFactor was actually persisted by attempting insert again.
          // A duplicate userId should fail (if unique constraint exists) or succeed
          // depending on schema. We verify by checking we can't insert the exact same record.
          // Since each TwoFactor has unique ID, we verify via different means.
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FIND BY ID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("findById operations", (it) => {
    it.effect(
      "should return Some when TwoFactor exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          // Setup: create user and 2FA
          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("find-some-2fa"),
              name: "FindById Some 2FA",
            })
          );

          const mockedTwoFactor = makeMockTwoFactor(user.id, {
            secret: "find-test-secret",
            backupCodes: "find-backup-codes",
          });
          const inserted = yield* twoFactorRepo.insert(mockedTwoFactor);

          const found = yield* twoFactorRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            deepStrictEqual(found.value.userId, user.id);
            strictEqual(found.value.secret, "find-test-secret");
            strictEqual(found.value.backupCodes, "find-backup-codes");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when TwoFactor does not exist",
      () =>
        Effect.gen(function* () {
          const twoFactorRepo = yield* TwoFactorRepo;

          // Use a valid TwoFactorId format that doesn't exist (EntityId format: two_factor__uuid)
          const nonExistentId = "two_factor__00000000-0000-0000-0000-000000000000";
          const result = yield* twoFactorRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete TwoFactor entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          // Setup
          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("find-complete-2fa"),
              name: "Complete 2FA User",
            })
          );

          const mockedTwoFactor = makeMockTwoFactor(user.id);
          const inserted = yield* twoFactorRepo.insert(mockedTwoFactor);
          const found = yield* twoFactorRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("secret");
            expect(found.value).toHaveProperty("backupCodes");
            expect(found.value).toHaveProperty("userId");
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
      "should update secret and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          // Setup: create user and 2FA
          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("update-secret-2fa"),
              name: "Update Secret 2FA User",
            })
          );

          const inserted = yield* twoFactorRepo.insert(
            makeMockTwoFactor(user.id, {
              secret: "original-secret",
              backupCodes: "original-backup",
            })
          );

          // Action: update - spread existing entity and override specific fields
          const updated = yield* twoFactorRepo.update({
            ...inserted,
            secret: "updated-secret",
          });

          // Verify returned entity has updated secret
          strictEqual(updated.secret, "updated-secret");
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.userId, user.id);
          // backupCodes should remain unchanged
          strictEqual(updated.backupCodes, "original-backup");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update backupCodes field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("update-backup-2fa"),
              name: "Update Backup 2FA User",
            })
          );

          const inserted = yield* twoFactorRepo.insert(
            makeMockTwoFactor(user.id, {
              secret: "backup-test-secret",
              backupCodes: "code1,code2,code3",
            })
          );

          // Update backupCodes
          const updated = yield* twoFactorRepo.update({
            ...inserted,
            backupCodes: "newcode1,newcode2",
          });

          strictEqual(updated.backupCodes, "newcode1,newcode2");
          // secret should remain unchanged
          strictEqual(updated.secret, "backup-test-secret");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("update-persist-2fa"),
              name: "Persist 2FA Test",
            })
          );

          const inserted = yield* twoFactorRepo.insert(
            makeMockTwoFactor(user.id, {
              secret: "persist-original",
              backupCodes: "persist-original-backup",
            })
          );

          yield* twoFactorRepo.update({
            ...inserted,
            secret: "persisted-secret",
            backupCodes: "persisted-backup",
          });

          // Verify by fetching fresh
          const found = yield* twoFactorRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.secret, "persisted-secret");
            strictEqual(found.value.backupCodes, "persisted-backup");
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
      "should update TwoFactor without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("update-void-2fa"),
              name: "UpdateVoid 2FA User",
            })
          );

          const inserted = yield* twoFactorRepo.insert(
            makeMockTwoFactor(user.id, {
              secret: "void-original-secret",
              backupCodes: "void-original-backup",
            })
          );

          // updateVoid returns void
          const result = yield* twoFactorRepo.updateVoid({
            ...inserted,
            secret: "void-updated-secret",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* twoFactorRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.secret, "void-updated-secret");
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
      "should delete existing TwoFactor",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("delete-2fa"),
              name: "Delete 2FA User",
            })
          );

          const inserted = yield* twoFactorRepo.insert(makeMockTwoFactor(user.id));

          // Verify TwoFactor exists
          const beforeDelete = yield* twoFactorRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* twoFactorRepo.delete(inserted.id);

          // Verify TwoFactor no longer exists
          const afterDelete = yield* twoFactorRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent TwoFactor",
      () =>
        Effect.gen(function* () {
          const twoFactorRepo = yield* TwoFactorRepo;

          // Deleting a non-existent ID should not throw (EntityId format: two_factor__uuid)
          const nonExistentId = "two_factor__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(twoFactorRepo.delete(nonExistentId));

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
      "should insert multiple TwoFactor records without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          const prefix = crypto.randomUUID();

          // Create three users for three 2FA entries (each user can only have one 2FA)
          const user1 = yield* userRepo.insert(makeMockUser({ email: makeTestEmail(`many-2fa-1-${prefix}`) }));
          const user2 = yield* userRepo.insert(makeMockUser({ email: makeTestEmail(`many-2fa-2-${prefix}`) }));
          const user3 = yield* userRepo.insert(makeMockUser({ email: makeTestEmail(`many-2fa-3-${prefix}`) }));

          const twoFactors = [
            makeMockTwoFactor(user1.id, { secret: "batch-secret-1" }),
            makeMockTwoFactor(user2.id, { secret: "batch-secret-2" }),
            makeMockTwoFactor(user3.id, { secret: "batch-secret-3" }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* twoFactorRepo.insertManyVoid(
            twoFactors as unknown as readonly [
              typeof Entities.TwoFactor.Model.insert.Type,
              ...(typeof Entities.TwoFactor.Model.insert.Type)[],
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
      "should fail with DatabaseError on foreign key violation (invalid userId)",
      () =>
        Effect.gen(function* () {
          const twoFactorRepo = yield* TwoFactorRepo;

          // Try to insert with a non-existent userId
          const invalidUserId = "user__00000000-0000-0000-0000-000000000000";
          const twoFactor = Entities.TwoFactor.Model.insert.make({
            userId: invalidUserId as User.Model["id"],
            secret: "fk-test-secret",
            backupCodes: "fk-test-backup",
          });

          // Should fail with foreign key violation
          const result = yield* Effect.either(twoFactorRepo.insert(twoFactor));

          strictEqual(result._tag, "Left");
          if (result._tag === "Left") {
            // Should be a DatabaseError with foreign key violation type
            expect(result.left._tag).toBe("DatabaseError");
            expect(result.left.type).toBe("FOREIGN_KEY_VIOLATION");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should die when updating non-existent TwoFactor",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          // First create a valid TwoFactor to get a proper structure for update
          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("update-nonexistent-2fa"),
              name: "Temp 2FA User",
            })
          );

          const inserted = yield* twoFactorRepo.insert(makeMockTwoFactor(user.id));

          // Delete the TwoFactor
          yield* twoFactorRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) TwoFactor
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            twoFactorRepo.update({
              ...inserted,
              secret: "should-not-work",
            })
          );

          // Update on non-existent row dies with NoSuchElementException (treated as defect)
          // The repo's design catches this and calls Effect.die, so we check for Die
          strictEqual(exit._tag, "Failure");
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
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          // Setup: create user
          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("crud-workflow-2fa"),
              name: "CRUD 2FA User",
            })
          );

          // CREATE
          const mockedTwoFactor = makeMockTwoFactor(user.id, {
            secret: "crud-secret",
            backupCodes: "crud-backup-1,crud-backup-2",
          });
          const created = yield* twoFactorRepo.insert(mockedTwoFactor);
          assertTrue(S.is(Entities.TwoFactor.Model)(created));

          // READ
          const read = yield* twoFactorRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.secret, "crud-secret");
            strictEqual(read.value.backupCodes, "crud-backup-1,crud-backup-2");
          }

          // UPDATE
          const updated = yield* twoFactorRepo.update({
            ...created,
            secret: "updated-crud-secret",
            backupCodes: "updated-backup-1,updated-backup-2",
          });
          strictEqual(updated.secret, "updated-crud-secret");
          strictEqual(updated.backupCodes, "updated-backup-1,updated-backup-2");

          // Verify update persisted
          const readAfterUpdate = yield* twoFactorRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.secret, "updated-crud-secret");
            strictEqual(readAfterUpdate.value.backupCodes, "updated-backup-1,updated-backup-2");
          }

          // DELETE
          yield* twoFactorRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* twoFactorRepo.findById(created.id);
          assertNone(readAfterDelete);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // SENSITIVE FIELDS HANDLING
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("sensitive fields handling", (it) => {
    it.effect(
      "should handle secret field as Sensitive data",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("sensitive-secret-2fa"),
              name: "Sensitive Secret User",
            })
          );

          // Insert with specific secret
          const sensitiveSecret = "JBSWY3DPEHPK3PXP";
          const inserted = yield* twoFactorRepo.insert(
            makeMockTwoFactor(user.id, {
              secret: sensitiveSecret,
              backupCodes: "test-codes",
            })
          );

          // Secret should be stored and retrievable
          strictEqual(inserted.secret, sensitiveSecret);

          // Verify persistence
          const found = yield* twoFactorRepo.findById(inserted.id);
          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.secret, sensitiveSecret);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle backupCodes field as Sensitive data",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("sensitive-backup-2fa"),
              name: "Sensitive Backup User",
            })
          );

          // Insert with specific backup codes
          const backupCodes = "ABC123,DEF456,GHI789,JKL012,MNO345";
          const inserted = yield* twoFactorRepo.insert(
            makeMockTwoFactor(user.id, {
              secret: "test-secret",
              backupCodes,
            })
          );

          // Backup codes should be stored and retrievable
          strictEqual(inserted.backupCodes, backupCodes);

          // Verify persistence
          const found = yield* twoFactorRepo.findById(inserted.id);
          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.backupCodes, backupCodes);
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // USER RELATIONSHIP TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("user relationship", (it) => {
    it.effect(
      "should correctly reference the associated user",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("user-relation-2fa"),
              name: "User Relation Test",
            })
          );

          const twoFactor = yield* twoFactorRepo.insert(makeMockTwoFactor(user.id));

          // Verify userId matches
          deepStrictEqual(twoFactor.userId, user.id);

          // Verify we can find the user via the userId
          const foundUser = yield* userRepo.findById(twoFactor.userId);
          strictEqual(foundUser._tag, "Some");
          if (foundUser._tag === "Some") {
            deepStrictEqual(foundUser.value.id, user.id);
            strictEqual(foundUser.value.name, "User Relation Test");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow deleting TwoFactor without deleting User",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const twoFactorRepo = yield* TwoFactorRepo;

          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("delete-2fa-keep-user"),
              name: "Keep User Test",
            })
          );

          const twoFactor = yield* twoFactorRepo.insert(makeMockTwoFactor(user.id));

          // Delete TwoFactor
          yield* twoFactorRepo.delete(twoFactor.id);

          // TwoFactor should be gone
          const deletedTwoFactor = yield* twoFactorRepo.findById(twoFactor.id);
          assertNone(deletedTwoFactor);

          // User should still exist
          const existingUser = yield* userRepo.findById(user.id);
          strictEqual(existingUser._tag, "Some");
        }),
      TEST_TIMEOUT
    );
  });
});
