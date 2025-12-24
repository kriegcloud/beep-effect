import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { ApiKeyRepo, UserRepo } from "@beep/iam-server/adapters/repositories";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
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
 * Helper to create a mock user for FK dependency.
 */
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("apikey-user"),
    name: overrides?.name ?? "API Key Test User",
  });

/**
 * Helper to create a mock API key for insert operations.
 */
const makeMockApiKey = (userId: string, overrides?: Partial<{ name: string; enabled: boolean }>) =>
  Entities.ApiKey.Model.jsonCreate.make({
    userId: userId as typeof Entities.ApiKey.Model.fields.userId.Type,
    name: O.fromNullable(overrides?.name),
    enabled: overrides?.enabled ?? true,
  });

describe("ApiKeyRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert apikey and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user first (FK dependency)
          const mockedUser = makeMockUser({ email: makeTestEmail("insert-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "Insert Test Key" });
          const inserted = yield* apiKeyRepo.insert(mockedApiKey);

          // Verify schema conformance
          assertTrue(S.is(Entities.ApiKey.Model)(inserted));

          // Verify fields
          deepStrictEqual(inserted.userId, insertedUser.id);
          strictEqual(inserted.enabled, true);
          strictEqual(inserted.rateLimitEnabled, true);

          // Verify optional name field
          strictEqual(inserted.name._tag, "Some");
          if (inserted.name._tag === "Some") {
            strictEqual(inserted.name.value, "Insert Test Key");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted apikey",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("unique-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const apiKey1 = yield* apiKeyRepo.insert(makeMockApiKey(insertedUser.id, { name: "Key 1" }));
          const apiKey2 = yield* apiKeyRepo.insert(makeMockApiKey(insertedUser.id, { name: "Key 2" }));

          // IDs should be different
          expect(apiKey1.id).not.toBe(apiKey2.id);

          // Both should be valid EntityId format (apikey__uuid)
          expect(apiKey1.id).toMatch(/^apikey__[0-9a-f-]+$/);
          expect(apiKey2.id).toMatch(/^apikey__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert apikey without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("insert-void-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "InsertVoid Test" });

          // insertVoid returns void
          const result = yield* apiKeyRepo.insertVoid(mockedApiKey);
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
      "should return Some when apikey exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("find-some-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "FindById Some" });
          const inserted = yield* apiKeyRepo.insert(mockedApiKey);

          const found = yield* apiKeyRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            deepStrictEqual(found.value.userId, insertedUser.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when apikey does not exist",
      () =>
        Effect.gen(function* () {
          const apiKeyRepo = yield* ApiKeyRepo;

          // Use a valid ApiKeyId format that doesn't exist (EntityId format: apikey__uuid)
          const nonExistentId = "apikey__00000000-0000-0000-0000-000000000000";
          const result = yield* apiKeyRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete apikey entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("find-complete-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "Complete ApiKey" });
          const inserted = yield* apiKeyRepo.insert(mockedApiKey);
          const found = yield* apiKeyRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("userId");
            expect(found.value).toHaveProperty("name");
            expect(found.value).toHaveProperty("enabled");
            expect(found.value).toHaveProperty("rateLimitEnabled");
            expect(found.value).toHaveProperty("rateLimitTimeWindow");
            expect(found.value).toHaveProperty("rateLimitMax");
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
      "should update apikey name and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("update-name-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "Original Name" });
          const inserted = yield* apiKeyRepo.insert(mockedApiKey);

          // Update name
          const updated = yield* apiKeyRepo.update({
            ...inserted,
            name: O.some("Updated Name"),
          });

          // Verify returned entity has updated name
          strictEqual(updated.name._tag, "Some");
          if (updated.name._tag === "Some") {
            strictEqual(updated.name.value, "Updated Name");
          }
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.userId, insertedUser.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update enabled field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("update-enabled-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "Enable Test", enabled: true });
          const inserted = yield* apiKeyRepo.insert(mockedApiKey);

          // Initially should be true
          strictEqual(inserted.enabled, true);

          // Update to false
          const updated = yield* apiKeyRepo.update({
            ...inserted,
            enabled: false,
          });

          strictEqual(updated.enabled, false);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update rateLimitEnabled field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("update-ratelimit-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "RateLimit Test" });
          const inserted = yield* apiKeyRepo.insert(mockedApiKey);

          strictEqual(inserted.rateLimitEnabled, true);

          const updated = yield* apiKeyRepo.update({
            ...inserted,
            rateLimitEnabled: false,
          });

          strictEqual(updated.rateLimitEnabled, false);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update rateLimitMax field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("update-ratelimit-max-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "RateLimitMax Test" });
          const inserted = yield* apiKeyRepo.insert(mockedApiKey);

          // Default should be 10
          strictEqual(inserted.rateLimitMax, 10);

          const updated = yield* apiKeyRepo.update({
            ...inserted,
            rateLimitMax: 100,
          });

          strictEqual(updated.rateLimitMax, 100);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("update-persist-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "Persist Test" });
          const inserted = yield* apiKeyRepo.insert(mockedApiKey);

          yield* apiKeyRepo.update({
            ...inserted,
            name: O.some("Persisted Update"),
            enabled: false,
          });

          // Verify by fetching fresh
          const found = yield* apiKeyRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.name._tag, "Some");
            if (found.value.name._tag === "Some") {
              strictEqual(found.value.name.value, "Persisted Update");
            }
            strictEqual(found.value.enabled, false);
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
      "should update apikey without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("update-void-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "UpdateVoid Original" });
          const inserted = yield* apiKeyRepo.insert(mockedApiKey);

          // updateVoid returns void
          const result = yield* apiKeyRepo.updateVoid({
            ...inserted,
            name: O.some("UpdateVoid Updated"),
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* apiKeyRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.name._tag, "Some");
            if (found.value.name._tag === "Some") {
              strictEqual(found.value.name.value, "UpdateVoid Updated");
            }
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
      "should delete existing apikey",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("delete-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "Delete Test Key" });
          const inserted = yield* apiKeyRepo.insert(mockedApiKey);

          // Verify apikey exists
          const beforeDelete = yield* apiKeyRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* apiKeyRepo.delete(inserted.id);

          // Verify apikey no longer exists
          const afterDelete = yield* apiKeyRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent apikey",
      () =>
        Effect.gen(function* () {
          const apiKeyRepo = yield* ApiKeyRepo;

          // Deleting a non-existent ID should not throw (EntityId format: apikey__uuid)
          const nonExistentId = "apikey__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(apiKeyRepo.delete(nonExistentId));

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
      "should insert multiple apikeys without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("many-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const apiKeys = [
            makeMockApiKey(insertedUser.id, { name: "Batch Key 1" }),
            makeMockApiKey(insertedUser.id, { name: "Batch Key 2" }),
            makeMockApiKey(insertedUser.id, { name: "Batch Key 3" }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* apiKeyRepo.insertManyVoid(
            apiKeys as unknown as readonly [
              typeof Entities.ApiKey.Model.insert.Type,
              ...(typeof Entities.ApiKey.Model.insert.Type)[],
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
      "should fail with DatabaseError when inserting apikey with non-existent userId (FK violation)",
      () =>
        Effect.gen(function* () {
          const apiKeyRepo = yield* ApiKeyRepo;

          // Use a non-existent userId
          const nonExistentUserId = "user__00000000-0000-0000-0000-000000000000";
          const mockedApiKey = makeMockApiKey(nonExistentUserId, { name: "FK Violation Test" });

          // Insert with non-existent FK should fail
          const result = yield* Effect.either(apiKeyRepo.insert(mockedApiKey));

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
      "should die when updating non-existent apikey",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create a valid user and apikey to get proper structure
          const mockedUser = makeMockUser({ email: makeTestEmail("update-nonexistent-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "Temp Key" });
          const inserted = yield* apiKeyRepo.insert(mockedApiKey);

          // Delete the apikey
          yield* apiKeyRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) apikey
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            apiKeyRepo.update({
              ...inserted,
              name: O.some("Should Not Work"),
            })
          );

          // Update on non-existent row dies with NoSuchElementException (treated as defect)
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
          const apiKeyRepo = yield* ApiKeyRepo;

          // Setup: create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("crud-workflow-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // CREATE
          const mockedApiKey = makeMockApiKey(insertedUser.id, { name: "CRUD Test Key" });
          const created = yield* apiKeyRepo.insert(mockedApiKey);
          assertTrue(S.is(Entities.ApiKey.Model)(created));

          // READ
          const read = yield* apiKeyRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.name._tag, "Some");
            if (read.value.name._tag === "Some") {
              strictEqual(read.value.name.value, "CRUD Test Key");
            }
          }

          // UPDATE
          const updated = yield* apiKeyRepo.update({
            ...created,
            name: O.some("Updated CRUD Key"),
            enabled: false,
            rateLimitMax: 50,
          });
          strictEqual(updated.name._tag, "Some");
          if (updated.name._tag === "Some") {
            strictEqual(updated.name.value, "Updated CRUD Key");
          }
          strictEqual(updated.enabled, false);
          strictEqual(updated.rateLimitMax, 50);

          // Verify update persisted
          const readAfterUpdate = yield* apiKeyRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.name._tag, "Some");
            if (readAfterUpdate.value.name._tag === "Some") {
              strictEqual(readAfterUpdate.value.name.value, "Updated CRUD Key");
            }
            strictEqual(readAfterUpdate.value.enabled, false);
            strictEqual(readAfterUpdate.value.rateLimitMax, 50);
          }

          // DELETE
          yield* apiKeyRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* apiKeyRepo.findById(created.id);
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
      "should handle optional name field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-name-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create without name (use empty Option)
          const apiKeyWithoutName = yield* apiKeyRepo.insert(
            Entities.ApiKey.Model.jsonCreate.make({
              userId: insertedUser.id as typeof Entities.ApiKey.Model.fields.userId.Type,
              name: O.none(),
            })
          );

          // name should be None (optional fields are Option types)
          strictEqual(apiKeyWithoutName.name._tag, "None");

          // Update with name
          const updated = yield* apiKeyRepo.update({
            ...apiKeyWithoutName,
            name: O.some("Added Name"),
          });

          strictEqual(updated.name._tag, "Some");
          strictEqual(
            O.getOrElse(updated.name, () => ""),
            "Added Name"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional prefix field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-prefix-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const apiKey = yield* apiKeyRepo.insert(makeMockApiKey(insertedUser.id, { name: "Prefix Test" }));

          strictEqual(apiKey.prefix._tag, "None");

          const updated = yield* apiKeyRepo.update({
            ...apiKey,
            prefix: O.some("pk_"),
          });

          strictEqual(updated.prefix._tag, "Some");
          strictEqual(
            O.getOrElse(updated.prefix, () => ""),
            "pk_"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional start field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-start-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const apiKey = yield* apiKeyRepo.insert(makeMockApiKey(insertedUser.id, { name: "Start Test" }));

          strictEqual(apiKey.start._tag, "None");

          const updated = yield* apiKeyRepo.update({
            ...apiKey,
            start: O.some("sk_live_"),
          });

          strictEqual(updated.start._tag, "Some");
          strictEqual(
            O.getOrElse(updated.start, () => ""),
            "sk_live_"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional key field (sensitive)",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-key-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const apiKey = yield* apiKeyRepo.insert(makeMockApiKey(insertedUser.id, { name: "Key Test" }));

          strictEqual(apiKey.key._tag, "None");

          const updated = yield* apiKeyRepo.update({
            ...apiKey,
            key: O.some(Redacted.make("sk_live_supersecretkey123")),
          });

          strictEqual(updated.key._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional refillInterval and refillAmount fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-refill-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const apiKey = yield* apiKeyRepo.insert(makeMockApiKey(insertedUser.id, { name: "Refill Test" }));

          strictEqual(apiKey.refillInterval._tag, "None");
          strictEqual(apiKey.refillAmount._tag, "None");

          const updated = yield* apiKeyRepo.update({
            ...apiKey,
            refillInterval: O.some(3600000), // 1 hour
            refillAmount: O.some(100),
          });

          strictEqual(updated.refillInterval._tag, "Some");
          strictEqual(
            O.getOrElse(updated.refillInterval, () => 0),
            3600000
          );
          strictEqual(updated.refillAmount._tag, "Some");
          strictEqual(
            O.getOrElse(updated.refillAmount, () => 0),
            100
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional requestCount and remaining fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-counts-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const apiKey = yield* apiKeyRepo.insert(makeMockApiKey(insertedUser.id, { name: "Counts Test" }));

          strictEqual(apiKey.requestCount._tag, "None");
          strictEqual(apiKey.remaining._tag, "None");

          const updated = yield* apiKeyRepo.update({
            ...apiKey,
            requestCount: O.some(42),
            remaining: O.some(58),
          });

          strictEqual(updated.requestCount._tag, "Some");
          strictEqual(
            O.getOrElse(updated.requestCount, () => 0),
            42
          );
          strictEqual(updated.remaining._tag, "Some");
          strictEqual(
            O.getOrElse(updated.remaining, () => 0),
            58
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional metadata field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-metadata-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const apiKey = yield* apiKeyRepo.insert(makeMockApiKey(insertedUser.id, { name: "Metadata Test" }));

          strictEqual(apiKey.metadata._tag, "None");

          const updated = yield* apiKeyRepo.update({
            ...apiKey,
            metadata: O.some('{"environment":"production","version":"1.0"}'),
          });

          strictEqual(updated.metadata._tag, "Some");
          strictEqual(
            O.getOrElse(updated.metadata, () => ""),
            '{"environment":"production","version":"1.0"}'
          );
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // DEFAULT VALUES
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("default values", (it) => {
    it.effect(
      "should apply default values on insert",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const apiKeyRepo = yield* ApiKeyRepo;

          // Create user for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("defaults-apikey") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const apiKey = yield* apiKeyRepo.insert(
            Entities.ApiKey.Model.jsonCreate.make({
              userId: insertedUser.id as typeof Entities.ApiKey.Model.fields.userId.Type,
            })
          );

          // Verify default values are applied
          strictEqual(apiKey.enabled, true);
          strictEqual(apiKey.rateLimitEnabled, true);
          strictEqual(apiKey.rateLimitTimeWindow, 86400000); // 24 hours in ms
          strictEqual(apiKey.rateLimitMax, 10);
        }),
      TEST_TIMEOUT
    );
  });
});
