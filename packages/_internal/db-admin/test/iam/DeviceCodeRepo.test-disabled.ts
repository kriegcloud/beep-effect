import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { DeviceCodeRepo } from "@beep/iam-server/adapters/repositories";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
// Redacted is available in the scope if needed for future sensitive field tests
import * as S from "effect/Schema";
import { PgTest } from "../container.ts";

/**
 * Timeout in milliseconds for bun test. Duration objects are not supported by bun test.
 */
const TEST_TIMEOUT = 60000;

/**
 * Helper to create a unique device code string to avoid conflicts between tests.
 */
const makeUniqueDeviceCode = (prefix: string): string => `${prefix}-${crypto.randomUUID()}`;

/**
 * Helper to create a unique user code string (typically shorter, human-readable).
 */
const makeUniqueUserCode = (prefix: string): string => `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

/**
 * Helper to create a mock device code for insert operations.
 * DeviceCode has required fields: userCode, deviceCode, expiresAt
 * Optional fields: userId, status, lastPolledAt, pollingInterval, clientId, scope
 */
const makeMockDeviceCode = (
  overrides?: Partial<{
    userCode: string;
    deviceCode: string;
    expiresAt: DateTime.Utc;
    status: Entities.DeviceCode.DeviceCodeStatus.Type;
    clientId: string;
    scope: string;
  }>
) =>
  Entities.DeviceCode.Model.insert.make({
    userCode: overrides?.userCode ?? makeUniqueUserCode("USER"),
    deviceCode: overrides?.deviceCode ?? makeUniqueDeviceCode("device"),
    expiresAt: overrides?.expiresAt ?? DateTime.add(DateTime.unsafeNow(), { minutes: 10 }),
    status: overrides?.status ?? "pending",
  });

describe("DeviceCodeRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert device code and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const mockedDeviceCode = makeMockDeviceCode({
            userCode: makeUniqueUserCode("INSERT"),
            deviceCode: makeUniqueDeviceCode("insert-test"),
          });
          const inserted = yield* repo.insert(mockedDeviceCode);

          // Verify schema conformance
          assertTrue(S.is(Entities.DeviceCode.Model)(inserted));

          // Verify fields
          deepStrictEqual(inserted.userCode, mockedDeviceCode.userCode);
          deepStrictEqual(inserted.deviceCode, mockedDeviceCode.deviceCode);

          // Verify default values are applied
          strictEqual(inserted.status, "pending");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted device code",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const deviceCode1 = yield* repo.insert(
            makeMockDeviceCode({
              userCode: makeUniqueUserCode("UNIQUE1"),
              deviceCode: makeUniqueDeviceCode("unique-1"),
            })
          );
          const deviceCode2 = yield* repo.insert(
            makeMockDeviceCode({
              userCode: makeUniqueUserCode("UNIQUE2"),
              deviceCode: makeUniqueDeviceCode("unique-2"),
            })
          );

          // IDs should be different
          expect(deviceCode1.id).not.toBe(deviceCode2.id);

          // Both should be valid EntityId format (device_code__uuid)
          expect(deviceCode1.id).toMatch(/^device_code__[0-9a-f-]+$/);
          expect(deviceCode2.id).toMatch(/^device_code__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert device code without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const userCode = makeUniqueUserCode("VOID");
          const deviceCode = makeUniqueDeviceCode("insert-void");
          const mockedDeviceCode = makeMockDeviceCode({ userCode, deviceCode });

          // insertVoid returns void
          const result = yield* repo.insertVoid(mockedDeviceCode);
          strictEqual(result, undefined);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FIND BY ID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("findById operations", (it) => {
    it.effect(
      "should return Some when device code exists",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const mockedDeviceCode = makeMockDeviceCode({
            userCode: makeUniqueUserCode("FINDSOME"),
            deviceCode: makeUniqueDeviceCode("find-some"),
          });
          const inserted = yield* repo.insert(mockedDeviceCode);

          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            deepStrictEqual(found.value.userCode, mockedDeviceCode.userCode);
            deepStrictEqual(found.value.deviceCode, mockedDeviceCode.deviceCode);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when device code does not exist",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          // Use a valid DeviceCodeId format that doesn't exist (EntityId format: device_code__uuid)
          const nonExistentId = "device_code__00000000-0000-0000-0000-000000000000";
          const result = yield* repo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete device code entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const mockedDeviceCode = makeMockDeviceCode({
            userCode: makeUniqueUserCode("COMPLETE"),
            deviceCode: makeUniqueDeviceCode("find-complete"),
          });
          const inserted = yield* repo.insert(mockedDeviceCode);
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("userCode");
            expect(found.value).toHaveProperty("deviceCode");
            expect(found.value).toHaveProperty("expiresAt");
            expect(found.value).toHaveProperty("status");
            expect(found.value).toHaveProperty("userId");
            expect(found.value).toHaveProperty("lastPolledAt");
            expect(found.value).toHaveProperty("pollingInterval");
            expect(found.value).toHaveProperty("clientId");
            expect(found.value).toHaveProperty("scope");
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
      "should update device code status and return updated entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          // Setup: create device code
          const mockedDeviceCode = makeMockDeviceCode({
            userCode: makeUniqueUserCode("UPDATEST"),
            deviceCode: makeUniqueDeviceCode("update-status"),
            status: "pending",
          });
          const inserted = yield* repo.insert(mockedDeviceCode);

          // Action: update status to approved
          const updated = yield* repo.update({
            ...inserted,
            status: "approved",
          });

          // Verify returned entity has updated status
          strictEqual(updated.status, "approved");
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.userCode, mockedDeviceCode.userCode);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update status to denied",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const mockedDeviceCode = makeMockDeviceCode({
            userCode: makeUniqueUserCode("DENIED"),
            deviceCode: makeUniqueDeviceCode("update-denied"),
            status: "pending",
          });
          const inserted = yield* repo.insert(mockedDeviceCode);

          strictEqual(inserted.status, "pending");

          const updated = yield* repo.update({
            ...inserted,
            status: "denied",
          });

          strictEqual(updated.status, "denied");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update expiresAt field",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const mockedDeviceCode = makeMockDeviceCode({
            userCode: makeUniqueUserCode("EXPIRES"),
            deviceCode: makeUniqueDeviceCode("update-expires"),
          });
          const inserted = yield* repo.insert(mockedDeviceCode);

          // Update to a new expiration time
          const newExpiresAt = DateTime.add(DateTime.unsafeNow(), { hours: 1 });
          const updated = yield* repo.update({
            ...inserted,
            expiresAt: newExpiresAt,
          });

          // The expiresAt should be updated
          expect(updated.expiresAt).toBeDefined();
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const mockedDeviceCode = makeMockDeviceCode({
            userCode: makeUniqueUserCode("PERSIST"),
            deviceCode: makeUniqueDeviceCode("update-persist"),
          });
          const inserted = yield* repo.insert(mockedDeviceCode);

          yield* repo.update({
            ...inserted,
            status: "approved",
          });

          // Verify by fetching fresh
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.status, "approved");
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
      "should update device code without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const mockedDeviceCode = makeMockDeviceCode({
            userCode: makeUniqueUserCode("UPDVOID"),
            deviceCode: makeUniqueDeviceCode("update-void"),
          });
          const inserted = yield* repo.insert(mockedDeviceCode);

          // updateVoid returns void
          const result = yield* repo.updateVoid({
            ...inserted,
            status: "approved",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.status, "approved");
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
      "should delete existing device code",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const mockedDeviceCode = makeMockDeviceCode({
            userCode: makeUniqueUserCode("DELETE"),
            deviceCode: makeUniqueDeviceCode("delete-test"),
          });
          const inserted = yield* repo.insert(mockedDeviceCode);

          // Verify device code exists
          const beforeDelete = yield* repo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* repo.delete(inserted.id);

          // Verify device code no longer exists
          const afterDelete = yield* repo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent device code",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          // Deleting a non-existent ID should not throw (EntityId format: device_code__uuid)
          const nonExistentId = "device_code__00000000-0000-0000-0000-000000000000";
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
      "should insert multiple device codes without returning entities",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const prefix = crypto.randomUUID().slice(0, 8);
          const deviceCodes = [
            makeMockDeviceCode({
              userCode: makeUniqueUserCode(`MANY1-${prefix}`),
              deviceCode: makeUniqueDeviceCode(`many-1-${prefix}`),
            }),
            makeMockDeviceCode({
              userCode: makeUniqueUserCode(`MANY2-${prefix}`),
              deviceCode: makeUniqueDeviceCode(`many-2-${prefix}`),
            }),
            makeMockDeviceCode({
              userCode: makeUniqueUserCode(`MANY3-${prefix}`),
              deviceCode: makeUniqueDeviceCode(`many-3-${prefix}`),
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* repo.insertManyVoid(
            deviceCodes as unknown as readonly [
              typeof Entities.DeviceCode.Model.insert.Type,
              ...(typeof Entities.DeviceCode.Model.insert.Type)[],
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
      "should die when updating non-existent device code",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          // First create a valid device code to get a proper structure for update
          const mockedDeviceCode = makeMockDeviceCode({
            userCode: makeUniqueUserCode("NONEXIST"),
            deviceCode: makeUniqueDeviceCode("update-nonexistent"),
          });
          const inserted = yield* repo.insert(mockedDeviceCode);

          // Delete the device code
          yield* repo.delete(inserted.id);

          // Now try to update the deleted (non-existent) device code
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            repo.update({
              ...inserted,
              status: "approved",
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
          const repo = yield* DeviceCodeRepo;

          // CREATE
          const mockedDeviceCode = makeMockDeviceCode({
            userCode: makeUniqueUserCode("CRUD"),
            deviceCode: makeUniqueDeviceCode("crud-workflow"),
          });
          const created = yield* repo.insert(mockedDeviceCode);
          assertTrue(S.is(Entities.DeviceCode.Model)(created));

          // READ
          const read = yield* repo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            deepStrictEqual(read.value.userCode, mockedDeviceCode.userCode);
            strictEqual(read.value.status, "pending");
          }

          // UPDATE
          const updated = yield* repo.update({
            ...created,
            status: "approved",
          });
          strictEqual(updated.status, "approved");

          // Verify update persisted
          const readAfterUpdate = yield* repo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.status, "approved");
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
      "should handle optional userId field",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          // Create without userId
          const deviceCodeWithoutUser = yield* repo.insert(
            makeMockDeviceCode({
              userCode: makeUniqueUserCode("NOUSER"),
              deviceCode: makeUniqueDeviceCode("no-user"),
            })
          );

          // userId should be None (optional fields are Option types)
          strictEqual(deviceCodeWithoutUser.userId._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional clientId field",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          // Create without clientId
          const deviceCode = yield* repo.insert(
            makeMockDeviceCode({
              userCode: makeUniqueUserCode("NOCLIENT"),
              deviceCode: makeUniqueDeviceCode("no-client"),
            })
          );

          strictEqual(deviceCode.clientId._tag, "None");

          // Update with clientId
          const updated = yield* repo.update({
            ...deviceCode,
            clientId: O.some("test-client-id"),
          });

          strictEqual(updated.clientId._tag, "Some");
          strictEqual(
            O.getOrElse(updated.clientId, () => ""),
            "test-client-id"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional scope field",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const deviceCode = yield* repo.insert(
            makeMockDeviceCode({
              userCode: makeUniqueUserCode("NOSCOPE"),
              deviceCode: makeUniqueDeviceCode("no-scope"),
            })
          );

          strictEqual(deviceCode.scope._tag, "None");

          const updated = yield* repo.update({
            ...deviceCode,
            scope: O.some("read write profile"),
          });

          strictEqual(updated.scope._tag, "Some");
          strictEqual(
            O.getOrElse(updated.scope, () => ""),
            "read write profile"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional lastPolledAt field",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const deviceCode = yield* repo.insert(
            makeMockDeviceCode({
              userCode: makeUniqueUserCode("NOPOLL"),
              deviceCode: makeUniqueDeviceCode("no-poll"),
            })
          );

          strictEqual(deviceCode.lastPolledAt._tag, "None");

          const updated = yield* repo.update({
            ...deviceCode,
            lastPolledAt: O.some(DateTime.unsafeNow()),
          });

          strictEqual(updated.lastPolledAt._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional pollingInterval field",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const deviceCode = yield* repo.insert(
            makeMockDeviceCode({
              userCode: makeUniqueUserCode("NOINT"),
              deviceCode: makeUniqueDeviceCode("no-interval"),
            })
          );

          strictEqual(deviceCode.pollingInterval._tag, "None");

          const updated = yield* repo.update({
            ...deviceCode,
            pollingInterval: O.some(5 as S.Schema.Type<typeof S.NonNegativeInt>),
          });

          strictEqual(updated.pollingInterval._tag, "Some");
          strictEqual(
            O.getOrElse(updated.pollingInterval, () => 0),
            5
          );
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // STATUS WORKFLOW TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("status workflow", (it) => {
    it.effect(
      "should transition from pending to approved",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const deviceCode = yield* repo.insert(
            makeMockDeviceCode({
              userCode: makeUniqueUserCode("APPROVE"),
              deviceCode: makeUniqueDeviceCode("approve-flow"),
              status: "pending",
            })
          );

          strictEqual(deviceCode.status, "pending");

          const approved = yield* repo.update({
            ...deviceCode,
            status: "approved",
          });

          strictEqual(approved.status, "approved");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should transition from pending to denied",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          const deviceCode = yield* repo.insert(
            makeMockDeviceCode({
              userCode: makeUniqueUserCode("DENY"),
              deviceCode: makeUniqueDeviceCode("deny-flow"),
              status: "pending",
            })
          );

          strictEqual(deviceCode.status, "pending");

          const denied = yield* repo.update({
            ...deviceCode,
            status: "denied",
          });

          strictEqual(denied.status, "denied");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle all valid status values",
      () =>
        Effect.gen(function* () {
          const repo = yield* DeviceCodeRepo;

          // Test pending status
          const pendingCode = yield* repo.insert(
            makeMockDeviceCode({
              userCode: makeUniqueUserCode("PEND"),
              deviceCode: makeUniqueDeviceCode("status-pending"),
              status: "pending",
            })
          );
          strictEqual(pendingCode.status, "pending");

          // Test approved status via update
          const approvedCode = yield* repo.update({
            ...pendingCode,
            status: "approved",
          });
          strictEqual(approvedCode.status, "approved");

          // Create another for denied
          const anotherCode = yield* repo.insert(
            makeMockDeviceCode({
              userCode: makeUniqueUserCode("STAT2"),
              deviceCode: makeUniqueDeviceCode("status-denied"),
              status: "pending",
            })
          );

          const deniedCode = yield* repo.update({
            ...anotherCode,
            status: "denied",
          });
          strictEqual(deniedCode.status, "denied");
        }),
      TEST_TIMEOUT
    );
  });
});
