import { describe, expect } from "bun:test";
import { UserRepo } from "@beep/iam-server/adapters/repositories";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
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
 * Helper to create a unique test email to avoid conflicts between tests.
 */
const makeTestEmail = (prefix: string): BS.Email.Type => BS.Email.make(`${prefix}-${crypto.randomUUID()}@example.com`);

/**
 * Helper to create a mock user for insert operations.
 */
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("test"),
    name: overrides?.name ?? "Test User",
  });

describe("UserRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert user and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const mockedUser = makeMockUser({
            email: makeTestEmail("insert"),
            name: "Insert Test User",
          });
          const inserted = yield* repo.insert(mockedUser);

          // Verify schema conformance
          assertTrue(S.is(User.Model)(inserted));

          // Verify fields
          strictEqual(inserted.name, "Insert Test User");
          deepStrictEqual(inserted.email, mockedUser.email);

          // Verify default values are applied
          strictEqual(inserted.emailVerified, false);
          strictEqual(inserted.banned, false);
          strictEqual(inserted.isAnonymous, false);
          strictEqual(inserted.twoFactorEnabled, false);
          strictEqual(inserted.phoneNumberVerified, false);
          strictEqual(inserted.role, "user");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted user",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const user1 = yield* repo.insert(makeMockUser({ email: makeTestEmail("unique-1") }));
          const user2 = yield* repo.insert(makeMockUser({ email: makeTestEmail("unique-2") }));

          // IDs should be different
          expect(user1.id).not.toBe(user2.id);

          // Both should be valid EntityId format (user__uuid)
          expect(user1.id).toMatch(/^user__[0-9a-f-]+$/);
          expect(user2.id).toMatch(/^user__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert user without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const email = makeTestEmail("insert-void");
          const mockedUser = makeMockUser({ email, name: "InsertVoid Test" });

          // insertVoid returns void
          const result = yield* repo.insertVoid(mockedUser);
          strictEqual(result, undefined);

          // Verify the user was actually persisted by attempting insert again.
          // A duplicate email should fail, proving the first insert worked.
          const duplicateResult = yield* Effect.either(repo.insertVoid(mockedUser));

          // Should fail with unique constraint violation
          strictEqual(duplicateResult._tag, "Left");
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FIND BY ID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("findById operations", (it) => {
    it.effect(
      "should return Some when user exists",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const mockedUser = makeMockUser({
            email: makeTestEmail("find-some"),
            name: "FindById Some",
          });
          const inserted = yield* repo.insert(mockedUser);

          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.name, "FindById Some");
            deepStrictEqual(found.value.email, mockedUser.email);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when user does not exist",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          // Use a valid UserId format that doesn't exist (EntityId format: user__uuid)
          const nonExistentId = "user__00000000-0000-0000-0000-000000000000";
          const result = yield* repo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete user entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const mockedUser = makeMockUser({
            email: makeTestEmail("find-complete"),
            name: "Complete User",
          });
          const inserted = yield* repo.insert(mockedUser);
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("email");
            expect(found.value).toHaveProperty("name");
            expect(found.value).toHaveProperty("emailVerified");
            expect(found.value).toHaveProperty("role");
            expect(found.value).toHaveProperty("banned");
            expect(found.value).toHaveProperty("isAnonymous");
            expect(found.value).toHaveProperty("twoFactorEnabled");
            expect(found.value).toHaveProperty("phoneNumberVerified");
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
      "should update user name and return updated entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          // Setup: create user
          const mockedUser = makeMockUser({
            email: makeTestEmail("update-name"),
            name: "Original Name",
          });
          const inserted = yield* repo.insert(mockedUser);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* repo.update({
            ...inserted,
            name: "Updated Name",
          });

          // Verify returned entity has updated name
          strictEqual(updated.name, "Updated Name");
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.email, mockedUser.email);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update emailVerified field",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const mockedUser = makeMockUser({
            email: makeTestEmail("update-verified"),
            name: "Email Verify Test",
          });
          const inserted = yield* repo.insert(mockedUser);

          // Initially should be false
          strictEqual(inserted.emailVerified, false);

          // Update to true
          const updated = yield* repo.update({
            ...inserted,
            emailVerified: true,
          });

          strictEqual(updated.emailVerified, true);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update banned status",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const mockedUser = makeMockUser({
            email: makeTestEmail("update-banned"),
            name: "Ban Test User",
          });
          const inserted = yield* repo.insert(mockedUser);

          strictEqual(inserted.banned, false);

          const updated = yield* repo.update({
            ...inserted,
            banned: true,
            banReason: O.some("Test ban reason"),
          });

          strictEqual(updated.banned, true);
          strictEqual(
            O.getOrElse(updated.banReason, () => ""),
            "Test ban reason"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update role",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const mockedUser = makeMockUser({
            email: makeTestEmail("update-role"),
            name: "Role Test User",
          });
          const inserted = yield* repo.insert(mockedUser);

          strictEqual(inserted.role, "user");

          const updated = yield* repo.update({
            ...inserted,
            role: "admin",
          });

          strictEqual(updated.role, "admin");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const mockedUser = makeMockUser({
            email: makeTestEmail("update-persist"),
            name: "Persist Test",
          });
          const inserted = yield* repo.insert(mockedUser);

          yield* repo.update({
            ...inserted,
            name: "Persisted Update",
          });

          // Verify by fetching fresh
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.name, "Persisted Update");
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
      "should update user without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const mockedUser = makeMockUser({
            email: makeTestEmail("update-void"),
            name: "UpdateVoid Original",
          });
          const inserted = yield* repo.insert(mockedUser);

          // updateVoid returns void
          const result = yield* repo.updateVoid({
            ...inserted,
            name: "UpdateVoid Updated",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.name, "UpdateVoid Updated");
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
      "should delete existing user",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const mockedUser = makeMockUser({
            email: makeTestEmail("delete"),
            name: "Delete Test User",
          });
          const inserted = yield* repo.insert(mockedUser);

          // Verify user exists
          const beforeDelete = yield* repo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* repo.delete(inserted.id);

          // Verify user no longer exists
          const afterDelete = yield* repo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent user",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          // Deleting a non-existent ID should not throw (EntityId format: user__uuid)
          const nonExistentId = "user__00000000-0000-0000-0000-000000000000";
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
      "should insert multiple users without returning entities",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const prefix = crypto.randomUUID();
          const users = [
            makeMockUser({ email: makeTestEmail(`many-1-${prefix}`), name: "Batch User 1" }),
            makeMockUser({ email: makeTestEmail(`many-2-${prefix}`), name: "Batch User 2" }),
            makeMockUser({ email: makeTestEmail(`many-3-${prefix}`), name: "Batch User 3" }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* repo.insertManyVoid(
            users as unknown as readonly [typeof User.Model.insert.Type, ...(typeof User.Model.insert.Type)[]]
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
      "should fail with DatabaseError on duplicate email (unique constraint violation)",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const email = makeTestEmail("duplicate");
          const user1 = makeMockUser({ email, name: "First User" });
          const user2 = makeMockUser({ email, name: "Second User" });

          // First insert should succeed
          yield* repo.insert(user1);

          // Second insert with same email should fail
          const result = yield* Effect.either(repo.insert(user2));

          strictEqual(result._tag, "Left");
          if (result._tag === "Left") {
            // Should be a DatabaseError with unique violation type
            expect(result.left._tag).toBe("DatabaseError");
            expect(result.left.type).toBe("UNIQUE_VIOLATION");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should die when updating non-existent user",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          // First create a valid user to get a proper structure for update
          const mockedUser = makeMockUser({
            email: makeTestEmail("update-nonexistent"),
            name: "Temp User",
          });
          const inserted = yield* repo.insert(mockedUser);

          // Delete the user
          yield* repo.delete(inserted.id);

          // Now try to update the deleted (non-existent) user
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            repo.update({
              ...inserted,
              name: "Should Not Work",
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
          const repo = yield* UserRepo;

          // CREATE
          const mockedUser = makeMockUser({
            email: makeTestEmail("crud-workflow"),
            name: "CRUD Test User",
          });
          const created = yield* repo.insert(mockedUser);
          assertTrue(S.is(User.Model)(created));

          // READ
          const read = yield* repo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.name, "CRUD Test User");
          }

          // UPDATE
          const updated = yield* repo.update({
            ...created,
            name: "Updated CRUD User",
            emailVerified: true,
          });
          strictEqual(updated.name, "Updated CRUD User");
          strictEqual(updated.emailVerified, true);

          // Verify update persisted
          const readAfterUpdate = yield* repo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.name, "Updated CRUD User");
            strictEqual(readAfterUpdate.value.emailVerified, true);
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
  // OPTIONAL FIELDS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("optional fields", (it) => {
    it.effect(
      "should handle optional image field",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          // Create without image
          const userWithoutImage = yield* repo.insert(
            makeMockUser({
              email: makeTestEmail("no-image"),
              name: "No Image User",
            })
          );

          // image should be None (optional fields are Option types)
          strictEqual(userWithoutImage.image._tag, "None");

          // Update with image
          const updated = yield* repo.update({
            ...userWithoutImage,
            image: O.some("https://example.com/avatar.png"),
          });

          strictEqual(updated.image._tag, "Some");
          strictEqual(
            O.getOrElse(updated.image, () => ""),
            "https://example.com/avatar.png"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional username field",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const user = yield* repo.insert(
            makeMockUser({
              email: makeTestEmail("no-username"),
              name: "No Username User",
            })
          );

          strictEqual(user.username._tag, "None");

          const updated = yield* repo.update({
            ...user,
            username: O.some("testuser"),
          });

          strictEqual(updated.username._tag, "Some");
          strictEqual(
            O.getOrElse(updated.username, () => ""),
            "testuser"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional phoneNumber field",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const user = yield* repo.insert(
            makeMockUser({
              email: makeTestEmail("no-phone"),
              name: "No Phone User",
            })
          );

          strictEqual(user.phoneNumber._tag, "None");
          strictEqual(user.phoneNumberVerified, false);

          const updated = yield* repo.update({
            ...user,
            phoneNumber: O.some(BS.Phone.make("+1234567890")),
            phoneNumberVerified: true,
          });

          strictEqual(updated.phoneNumber._tag, "Some");
          strictEqual(updated.phoneNumberVerified, true);
        }),
      TEST_TIMEOUT
    );
  });
});
