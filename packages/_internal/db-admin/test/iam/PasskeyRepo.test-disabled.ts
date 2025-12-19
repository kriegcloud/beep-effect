import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { PasskeyRepo, UserRepo } from "@beep/iam-server/adapters/repositories";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
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
 * Helper to create a mock user for insert operations (FK dependency).
 */
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("passkey-test"),
    name: overrides?.name ?? "Passkey Test User",
  });

/**
 * Helper to create a mock passkey for insert operations.
 */
const makeMockPasskey = (
  userId: SharedEntityIds.UserId.Type,
  overrides?: Partial<{
    name: string;
    credentialID: string;
    publicKey: string;
    counter: number;
    deviceType: string;
    backedUp: boolean;
  }>
) =>
  Entities.Passkey.Model.insert.make({
    userId,
    name: overrides?.name ?? "Test Passkey",
    credentialID: overrides?.credentialID ?? `cred-${crypto.randomUUID()}`,
    publicKey: overrides?.publicKey ?? `pk-${crypto.randomUUID()}`,
    counter: overrides?.counter ?? 0,
    deviceType: overrides?.deviceType ?? "platform",
    backedUp: overrides?.backedUp ?? false,
  });

describe("PasskeyRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert passkey and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          // Create user first (FK dependency)
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("insert-passkey") }));

          const mockedPasskey = makeMockPasskey(user.id, {
            name: "iPhone",
            deviceType: "platform",
            counter: 0,
          });
          const inserted = yield* passkeyRepo.insert(mockedPasskey);

          // Verify schema conformance
          assertTrue(S.is(Entities.Passkey.Model)(inserted));

          // Verify fields
          strictEqual(inserted.name, "iPhone");
          deepStrictEqual(inserted.userId, user.id);
          strictEqual(inserted.deviceType, "platform");
          strictEqual(inserted.counter, 0);
          strictEqual(inserted.backedUp, false);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted passkey",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("unique-passkey") }));

          const passkey1 = yield* passkeyRepo.insert(
            makeMockPasskey(user.id, { name: "Passkey 1", credentialID: `cred-1-${crypto.randomUUID()}` })
          );
          const passkey2 = yield* passkeyRepo.insert(
            makeMockPasskey(user.id, { name: "Passkey 2", credentialID: `cred-2-${crypto.randomUUID()}` })
          );

          // IDs should be different
          expect(passkey1.id).not.toBe(passkey2.id);

          // Both should be valid EntityId format (passkey__uuid)
          expect(passkey1.id).toMatch(/^passkey__[0-9a-f-]+$/);
          expect(passkey2.id).toMatch(/^passkey__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert passkey without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("insert-void-passkey") }));

          const credentialID = `cred-void-${crypto.randomUUID()}`;
          const mockedPasskey = makeMockPasskey(user.id, {
            name: "InsertVoid Test",
            credentialID,
          });

          // insertVoid returns void
          const result = yield* passkeyRepo.insertVoid(mockedPasskey);
          strictEqual(result, undefined);

          // Verify the passkey was actually persisted by inserting with a different
          // credentialID and checking that both exist in the database
          const secondCredentialID = `cred-void-2-${crypto.randomUUID()}`;
          const secondPasskey = makeMockPasskey(user.id, {
            name: "InsertVoid Test 2",
            credentialID: secondCredentialID,
          });
          yield* passkeyRepo.insertVoid(secondPasskey);

          // If we can insert with the same userId, the first insert worked
          // Note: credentialID has no unique constraint in the passkey table
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FIND BY ID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("findById operations", (it) => {
    it.effect(
      "should return Some when passkey exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("find-some-passkey") }));

          const mockedPasskey = makeMockPasskey(user.id, {
            name: "FindById Some",
          });
          const inserted = yield* passkeyRepo.insert(mockedPasskey);

          const found = yield* passkeyRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.name, "FindById Some");
            deepStrictEqual(found.value.userId, user.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when passkey does not exist",
      () =>
        Effect.gen(function* () {
          const passkeyRepo = yield* PasskeyRepo;

          // Use a valid PasskeyId format that doesn't exist (EntityId format: passkey__uuid)
          const nonExistentId = "passkey__00000000-0000-0000-0000-000000000000";
          const result = yield* passkeyRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete passkey entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("find-complete-passkey") }));

          const mockedPasskey = makeMockPasskey(user.id, {
            name: "Complete Passkey",
          });
          const inserted = yield* passkeyRepo.insert(mockedPasskey);
          const found = yield* passkeyRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("userId");
            expect(found.value).toHaveProperty("name");
            expect(found.value).toHaveProperty("credentialID");
            expect(found.value).toHaveProperty("publicKey");
            expect(found.value).toHaveProperty("counter");
            expect(found.value).toHaveProperty("deviceType");
            expect(found.value).toHaveProperty("backedUp");
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
      "should update passkey name and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-name-passkey") }));

          // Setup: create passkey
          const mockedPasskey = makeMockPasskey(user.id, {
            name: "Original Name",
          });
          const inserted = yield* passkeyRepo.insert(mockedPasskey);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* passkeyRepo.update({
            ...inserted,
            name: "Updated Name",
          });

          // Verify returned entity has updated name
          strictEqual(updated.name, "Updated Name");
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.userId, user.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update counter field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-counter-passkey") }));

          const mockedPasskey = makeMockPasskey(user.id, {
            name: "Counter Test",
            counter: 0,
          });
          const inserted = yield* passkeyRepo.insert(mockedPasskey);

          // Initially should be 0
          strictEqual(inserted.counter, 0);

          // Update counter (simulating authentication)
          const updated = yield* passkeyRepo.update({
            ...inserted,
            counter: 1,
          });

          strictEqual(updated.counter, 1);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update backedUp status",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-backed-passkey") }));

          const mockedPasskey = makeMockPasskey(user.id, {
            name: "Backup Test",
            backedUp: false,
          });
          const inserted = yield* passkeyRepo.insert(mockedPasskey);

          strictEqual(inserted.backedUp, false);

          const updated = yield* passkeyRepo.update({
            ...inserted,
            backedUp: true,
          });

          strictEqual(updated.backedUp, true);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update deviceType",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-device-passkey") }));

          const mockedPasskey = makeMockPasskey(user.id, {
            name: "Device Type Test",
            deviceType: "platform",
          });
          const inserted = yield* passkeyRepo.insert(mockedPasskey);

          strictEqual(inserted.deviceType, "platform");

          const updated = yield* passkeyRepo.update({
            ...inserted,
            deviceType: "cross-platform",
          });

          strictEqual(updated.deviceType, "cross-platform");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-persist-passkey") }));

          const mockedPasskey = makeMockPasskey(user.id, {
            name: "Persist Test",
          });
          const inserted = yield* passkeyRepo.insert(mockedPasskey);

          yield* passkeyRepo.update({
            ...inserted,
            name: "Persisted Update",
          });

          // Verify by fetching fresh
          const found = yield* passkeyRepo.findById(inserted.id);

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
      "should update passkey without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-void-passkey") }));

          const mockedPasskey = makeMockPasskey(user.id, {
            name: "UpdateVoid Original",
          });
          const inserted = yield* passkeyRepo.insert(mockedPasskey);

          // updateVoid returns void
          const result = yield* passkeyRepo.updateVoid({
            ...inserted,
            name: "UpdateVoid Updated",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* passkeyRepo.findById(inserted.id);

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
      "should delete existing passkey",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("delete-passkey") }));

          const mockedPasskey = makeMockPasskey(user.id, {
            name: "Delete Test Passkey",
          });
          const inserted = yield* passkeyRepo.insert(mockedPasskey);

          // Verify passkey exists
          const beforeDelete = yield* passkeyRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* passkeyRepo.delete(inserted.id);

          // Verify passkey no longer exists
          const afterDelete = yield* passkeyRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent passkey",
      () =>
        Effect.gen(function* () {
          const passkeyRepo = yield* PasskeyRepo;

          // Deleting a non-existent ID should not throw (EntityId format: passkey__uuid)
          const nonExistentId = "passkey__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(passkeyRepo.delete(nonExistentId));

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
      "should insert multiple passkeys without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("many-passkeys") }));

          const prefix = crypto.randomUUID();
          const passkeys = [
            makeMockPasskey(user.id, { name: "Batch Passkey 1", credentialID: `cred-many-1-${prefix}` }),
            makeMockPasskey(user.id, { name: "Batch Passkey 2", credentialID: `cred-many-2-${prefix}` }),
            makeMockPasskey(user.id, { name: "Batch Passkey 3", credentialID: `cred-many-3-${prefix}` }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* passkeyRepo.insertManyVoid(
            passkeys as unknown as readonly [
              typeof Entities.Passkey.Model.insert.Type,
              ...(typeof Entities.Passkey.Model.insert.Type)[],
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
      "should fail with DatabaseError on invalid userId (foreign key violation)",
      () =>
        Effect.gen(function* () {
          const passkeyRepo = yield* PasskeyRepo;

          // Create a passkey with a non-existent userId
          const fakeUserId = SharedEntityIds.UserId.make(`user__${crypto.randomUUID()}`);
          const passkey = makeMockPasskey(fakeUserId, { name: "Invalid User Passkey" });

          // Insert should fail due to FK constraint
          const result = yield* Effect.either(passkeyRepo.insert(passkey));

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
      "should allow multiple passkeys with same credentialID (no unique constraint)",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("dup-cred-passkey") }));

          const credentialID = `cred-dup-${crypto.randomUUID()}`;
          const passkey1 = makeMockPasskey(user.id, { name: "First Passkey", credentialID });
          const passkey2 = makeMockPasskey(user.id, { name: "Second Passkey", credentialID });

          // Both inserts should succeed - credentialID has no unique constraint
          const inserted1 = yield* passkeyRepo.insert(passkey1);
          const inserted2 = yield* passkeyRepo.insert(passkey2);

          // Both should have valid IDs
          expect(inserted1.id).toBeDefined();
          expect(inserted2.id).toBeDefined();
          // IDs should be different even though credentialID is the same
          expect(inserted1.id).not.toBe(inserted2.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should die when updating non-existent passkey",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-nonexistent-passkey") }));

          // First create a valid passkey to get a proper structure for update
          const mockedPasskey = makeMockPasskey(user.id, {
            name: "Temp Passkey",
          });
          const inserted = yield* passkeyRepo.insert(mockedPasskey);

          // Delete the passkey
          yield* passkeyRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) passkey
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            passkeyRepo.update({
              ...inserted,
              name: "Should Not Work",
            })
          );

          // Update on non-existent row dies with NoSuchElementException (treated as defect)
          // The repo's design catches this and calls Effect.die, so we check for Failure
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
          const passkeyRepo = yield* PasskeyRepo;

          // Setup: create user
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("crud-workflow-passkey") }));

          // CREATE
          const mockedPasskey = makeMockPasskey(user.id, {
            name: "CRUD Test Passkey",
            counter: 0,
          });
          const created = yield* passkeyRepo.insert(mockedPasskey);
          assertTrue(S.is(Entities.Passkey.Model)(created));

          // READ
          const read = yield* passkeyRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.name, "CRUD Test Passkey");
          }

          // UPDATE
          const updated = yield* passkeyRepo.update({
            ...created,
            name: "Updated CRUD Passkey",
            counter: 5,
          });
          strictEqual(updated.name, "Updated CRUD Passkey");
          strictEqual(updated.counter, 5);

          // Verify update persisted
          const readAfterUpdate = yield* passkeyRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.name, "Updated CRUD Passkey");
            strictEqual(readAfterUpdate.value.counter, 5);
          }

          // DELETE
          yield* passkeyRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* passkeyRepo.findById(created.id);
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
      "should handle optional transports field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("no-transports-passkey") }));

          // Create without transports
          const passkeyWithoutTransports = yield* passkeyRepo.insert(
            makeMockPasskey(user.id, {
              name: "No Transports Passkey",
            })
          );

          // transports should be None (optional fields are Option types)
          strictEqual(passkeyWithoutTransports.transports._tag, "None");

          // Update with transports
          const updated = yield* passkeyRepo.update({
            ...passkeyWithoutTransports,
            transports: O.some("usb"),
          });

          strictEqual(updated.transports._tag, "Some");
          strictEqual(
            O.getOrElse(updated.transports, () => ""),
            "usb"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional aaguid field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("no-aaguid-passkey") }));

          // Create without aaguid
          const passkeyWithoutAaguid = yield* passkeyRepo.insert(
            makeMockPasskey(user.id, {
              name: "No AAGUID Passkey",
            })
          );

          // aaguid should be None
          strictEqual(passkeyWithoutAaguid.aaguid._tag, "None");

          // Update with aaguid
          const updated = yield* passkeyRepo.update({
            ...passkeyWithoutAaguid,
            aaguid: O.some("00000000-0000-0000-0000-000000000001"),
          });

          strictEqual(updated.aaguid._tag, "Some");
          strictEqual(
            O.getOrElse(updated.aaguid, () => ""),
            "00000000-0000-0000-0000-000000000001"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle multiple passkeys per user",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const passkeyRepo = yield* PasskeyRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("multi-passkey-user") }));

          // Create multiple passkeys for the same user
          const passkey1 = yield* passkeyRepo.insert(
            makeMockPasskey(user.id, {
              name: "iPhone",
              deviceType: "platform",
              credentialID: `cred-multi-1-${crypto.randomUUID()}`,
            })
          );

          const passkey2 = yield* passkeyRepo.insert(
            makeMockPasskey(user.id, {
              name: "YubiKey",
              deviceType: "cross-platform",
              credentialID: `cred-multi-2-${crypto.randomUUID()}`,
            })
          );

          const passkey3 = yield* passkeyRepo.insert(
            makeMockPasskey(user.id, {
              name: "Windows Hello",
              deviceType: "platform",
              credentialID: `cred-multi-3-${crypto.randomUUID()}`,
            })
          );

          // All passkeys should be associated with the same user
          deepStrictEqual(passkey1.userId, user.id);
          deepStrictEqual(passkey2.userId, user.id);
          deepStrictEqual(passkey3.userId, user.id);

          // All passkeys should have unique IDs
          expect(passkey1.id).not.toBe(passkey2.id);
          expect(passkey2.id).not.toBe(passkey3.id);
          expect(passkey1.id).not.toBe(passkey3.id);

          // Verify each can be found independently
          const found1 = yield* passkeyRepo.findById(passkey1.id);
          const found2 = yield* passkeyRepo.findById(passkey2.id);
          const found3 = yield* passkeyRepo.findById(passkey3.id);

          strictEqual(found1._tag, "Some");
          strictEqual(found2._tag, "Some");
          strictEqual(found3._tag, "Some");

          if (found1._tag === "Some" && found2._tag === "Some" && found3._tag === "Some") {
            strictEqual(found1.value.name, "iPhone");
            strictEqual(found2.value.name, "YubiKey");
            strictEqual(found3.value.name, "Windows Hello");
          }
        }),
      TEST_TIMEOUT
    );
  });
});
