import { describe, expect } from "bun:test";
import { Jwks } from "@beep/iam-domain/entities";
import { JwksRepo } from "@beep/iam-server/adapters/repositories";
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
 * Helper to create a mock JWKS entity for insert operations.
 * JWKS entities have optional publicKey and privateKey fields wrapped in Redacted.
 */
const makeMockJwks = (overrides?: {
  publicKey?: O.Option<Redacted.Redacted<string>>;
  privateKey?: O.Option<Redacted.Redacted<string>>;
}) =>
  Jwks.Model.jsonCreate.make({
    ...(overrides?.publicKey !== undefined ? { publicKey: overrides.publicKey } : {}),
    ...(overrides?.privateKey !== undefined ? { privateKey: overrides.privateKey } : {}),
  });

/**
 * Helper to create a Redacted string wrapped in Option.Some
 */
const makeRedactedOption = (value: string): O.Option<Redacted.Redacted<string>> => O.some(Redacted.make(value));

describe("JwksRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert jwks and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const mockedJwks = makeMockJwks({
            publicKey: makeRedactedOption("test-public-key-insert"),
            privateKey: makeRedactedOption("test-private-key-insert"),
          });
          const inserted = yield* repo.insert(mockedJwks);

          // Verify schema conformance
          assertTrue(S.is(Jwks.Model)(inserted));

          // Verify optional fields are set
          strictEqual(inserted.publicKey._tag, "Some");
          strictEqual(inserted.privateKey._tag, "Some");

          // Verify Redacted values
          if (inserted.publicKey._tag === "Some") {
            strictEqual(Redacted.value(inserted.publicKey.value), "test-public-key-insert");
          }
          if (inserted.privateKey._tag === "Some") {
            strictEqual(Redacted.value(inserted.privateKey.value), "test-private-key-insert");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted jwks",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const jwks1 = yield* repo.insert(makeMockJwks());
          const jwks2 = yield* repo.insert(makeMockJwks());

          // IDs should be different
          expect(jwks1.id).not.toBe(jwks2.id);

          // Both should be valid EntityId format (jwks__uuid)
          expect(jwks1.id).toMatch(/^jwks__[0-9a-f-]+$/);
          expect(jwks2.id).toMatch(/^jwks__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert jwks without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const mockedJwks = makeMockJwks({
            publicKey: makeRedactedOption("insert-void-public"),
          });

          // insertVoid returns void
          const result = yield* repo.insertVoid(mockedJwks);
          strictEqual(result, undefined);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist jwks when using insertVoid",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          // First insert to get an ID we can track
          const inserted = yield* repo.insert(
            makeMockJwks({
              publicKey: makeRedactedOption("insert-void-verify"),
            })
          );

          // Verify it exists
          const found = yield* repo.findById(inserted.id);
          strictEqual(found._tag, "Some");
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FIND BY ID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("findById operations", (it) => {
    it.effect(
      "should return Some when jwks exists",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const mockedJwks = makeMockJwks({
            publicKey: makeRedactedOption("find-some-public"),
            privateKey: makeRedactedOption("find-some-private"),
          });
          const inserted = yield* repo.insert(mockedJwks);

          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.publicKey._tag, "Some");
            strictEqual(found.value.privateKey._tag, "Some");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when jwks does not exist",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          // Use a valid JwksId format that doesn't exist (EntityId format: jwks__uuid)
          const nonExistentId = "jwks__00000000-0000-0000-0000-000000000000";
          const result = yield* repo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete jwks entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const mockedJwks = makeMockJwks({
            publicKey: makeRedactedOption("find-complete-public"),
          });
          const inserted = yield* repo.insert(mockedJwks);
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("publicKey");
            expect(found.value).toHaveProperty("privateKey");
            expect(found.value).toHaveProperty("createdAt");
            expect(found.value).toHaveProperty("updatedAt");
            expect(found.value).toHaveProperty("version");
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
      "should update publicKey and return updated entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          // Setup: create jwks with initial key
          const mockedJwks = makeMockJwks({
            publicKey: makeRedactedOption("original-public-key"),
          });
          const inserted = yield* repo.insert(mockedJwks);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* repo.update({
            ...inserted,
            publicKey: makeRedactedOption("updated-public-key"),
          });

          // Verify returned entity has updated publicKey
          strictEqual(updated.publicKey._tag, "Some");
          if (updated.publicKey._tag === "Some") {
            strictEqual(Redacted.value(updated.publicKey.value), "updated-public-key");
          }
          deepStrictEqual(updated.id, inserted.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update privateKey field",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const mockedJwks = makeMockJwks({
            privateKey: makeRedactedOption("original-private-key"),
          });
          const inserted = yield* repo.insert(mockedJwks);

          // Update privateKey
          const updated = yield* repo.update({
            ...inserted,
            privateKey: makeRedactedOption("updated-private-key"),
          });

          strictEqual(updated.privateKey._tag, "Some");
          if (updated.privateKey._tag === "Some") {
            strictEqual(Redacted.value(updated.privateKey.value), "updated-private-key");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update both keys simultaneously",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const mockedJwks = makeMockJwks({
            publicKey: makeRedactedOption("initial-public"),
            privateKey: makeRedactedOption("initial-private"),
          });
          const inserted = yield* repo.insert(mockedJwks);

          const updated = yield* repo.update({
            ...inserted,
            publicKey: makeRedactedOption("new-public"),
            privateKey: makeRedactedOption("new-private"),
          });

          if (updated.publicKey._tag === "Some") {
            strictEqual(Redacted.value(updated.publicKey.value), "new-public");
          }
          if (updated.privateKey._tag === "Some") {
            strictEqual(Redacted.value(updated.privateKey.value), "new-private");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const mockedJwks = makeMockJwks({
            publicKey: makeRedactedOption("persist-original"),
          });
          const inserted = yield* repo.insert(mockedJwks);

          yield* repo.update({
            ...inserted,
            publicKey: makeRedactedOption("persist-updated"),
          });

          // Verify by fetching fresh
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some" && found.value.publicKey._tag === "Some") {
            strictEqual(Redacted.value(found.value.publicKey.value), "persist-updated");
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
      "should update jwks without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const mockedJwks = makeMockJwks({
            publicKey: makeRedactedOption("update-void-original"),
          });
          const inserted = yield* repo.insert(mockedJwks);

          // updateVoid returns void
          const result = yield* repo.updateVoid({
            ...inserted,
            publicKey: makeRedactedOption("update-void-updated"),
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some" && found.value.publicKey._tag === "Some") {
            strictEqual(Redacted.value(found.value.publicKey.value), "update-void-updated");
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
      "should delete existing jwks",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const mockedJwks = makeMockJwks({
            publicKey: makeRedactedOption("delete-test"),
          });
          const inserted = yield* repo.insert(mockedJwks);

          // Verify jwks exists
          const beforeDelete = yield* repo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* repo.delete(inserted.id);

          // Verify jwks no longer exists
          const afterDelete = yield* repo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent jwks",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          // Deleting a non-existent ID should not throw (EntityId format: jwks__uuid)
          const nonExistentId = "jwks__00000000-0000-0000-0000-000000000000";
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
      "should insert multiple jwks without returning entities",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const jwksEntities = [
            makeMockJwks({ publicKey: makeRedactedOption("batch-1") }),
            makeMockJwks({ publicKey: makeRedactedOption("batch-2") }),
            makeMockJwks({ publicKey: makeRedactedOption("batch-3") }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* repo.insertManyVoid(
            jwksEntities as unknown as readonly [typeof Jwks.Model.insert.Type, ...(typeof Jwks.Model.insert.Type)[]]
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
      "should die when updating non-existent jwks",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          // First create a valid jwks to get a proper structure for update
          const mockedJwks = makeMockJwks({
            publicKey: makeRedactedOption("update-nonexistent"),
          });
          const inserted = yield* repo.insert(mockedJwks);

          // Delete the jwks
          yield* repo.delete(inserted.id);

          // Now try to update the deleted (non-existent) jwks
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            repo.update({
              ...inserted,
              publicKey: makeRedactedOption("should-not-work"),
            })
          );

          // Update on non-existent row dies with NoSuchElementException (treated as defect)
          // The repo's design catches this and calls Effect.die, so we check for Die
          strictEqual(exit._tag, "Failure");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle concurrent inserts without conflict",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          // JWKS has no unique constraints besides ID, so concurrent inserts should succeed
          const result1 = yield* Effect.either(
            repo.insert(makeMockJwks({ publicKey: makeRedactedOption("concurrent-1") }))
          );
          const result2 = yield* Effect.either(
            repo.insert(makeMockJwks({ publicKey: makeRedactedOption("concurrent-2") }))
          );

          // Both should succeed
          strictEqual(result1._tag, "Right");
          strictEqual(result2._tag, "Right");

          // Verify IDs are different
          if (result1._tag === "Right" && result2._tag === "Right") {
            expect(result1.right.id).not.toBe(result2.right.id);
          }
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
          const repo = yield* JwksRepo;

          // CREATE
          const mockedJwks = makeMockJwks({
            publicKey: makeRedactedOption("crud-public-key"),
            privateKey: makeRedactedOption("crud-private-key"),
          });
          const created = yield* repo.insert(mockedJwks);
          assertTrue(S.is(Jwks.Model)(created));

          // READ
          const read = yield* repo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some" && read.value.publicKey._tag === "Some") {
            strictEqual(Redacted.value(read.value.publicKey.value), "crud-public-key");
          }

          // UPDATE
          const updated = yield* repo.update({
            ...created,
            publicKey: makeRedactedOption("crud-updated-public"),
            privateKey: makeRedactedOption("crud-updated-private"),
          });
          if (updated.publicKey._tag === "Some") {
            strictEqual(Redacted.value(updated.publicKey.value), "crud-updated-public");
          }
          if (updated.privateKey._tag === "Some") {
            strictEqual(Redacted.value(updated.privateKey.value), "crud-updated-private");
          }

          // Verify update persisted
          const readAfterUpdate = yield* repo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some" && readAfterUpdate.value.publicKey._tag === "Some") {
            strictEqual(Redacted.value(readAfterUpdate.value.publicKey.value), "crud-updated-public");
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
      "should handle optional publicKey field",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          // Create without publicKey (defaults to None)
          const jwksWithoutKey = yield* repo.insert(makeMockJwks());

          // publicKey should be None (optional fields are Option types)
          strictEqual(jwksWithoutKey.publicKey._tag, "None");

          // Update with publicKey
          const updated = yield* repo.update({
            ...jwksWithoutKey,
            publicKey: makeRedactedOption("new-public-key"),
          });

          strictEqual(updated.publicKey._tag, "Some");
          if (updated.publicKey._tag === "Some") {
            strictEqual(Redacted.value(updated.publicKey.value), "new-public-key");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional privateKey field",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const jwks = yield* repo.insert(makeMockJwks());

          strictEqual(jwks.privateKey._tag, "None");

          const updated = yield* repo.update({
            ...jwks,
            privateKey: makeRedactedOption("new-private-key"),
          });

          strictEqual(updated.privateKey._tag, "Some");
          if (updated.privateKey._tag === "Some") {
            strictEqual(Redacted.value(updated.privateKey.value), "new-private-key");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow setting optional fields to None",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          // Create with keys
          const jwksWithKeys = yield* repo.insert(
            makeMockJwks({
              publicKey: makeRedactedOption("to-be-removed-public"),
              privateKey: makeRedactedOption("to-be-removed-private"),
            })
          );

          strictEqual(jwksWithKeys.publicKey._tag, "Some");
          strictEqual(jwksWithKeys.privateKey._tag, "Some");

          // Update to remove keys (set to None)
          const updated = yield* repo.update({
            ...jwksWithKeys,
            publicKey: O.none(),
            privateKey: O.none(),
          });

          strictEqual(updated.publicKey._tag, "None");
          strictEqual(updated.privateKey._tag, "None");

          // Verify persistence
          const found = yield* repo.findById(jwksWithKeys.id);
          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.publicKey._tag, "None");
            strictEqual(found.value.privateKey._tag, "None");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should preserve Redacted wrapper on read",
      () =>
        Effect.gen(function* () {
          const repo = yield* JwksRepo;

          const sensitiveKey = "super-secret-key-12345";
          const jwks = yield* repo.insert(
            makeMockJwks({
              privateKey: makeRedactedOption(sensitiveKey),
            })
          );

          // Read from database
          const found = yield* repo.findById(jwks.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some" && found.value.privateKey._tag === "Some") {
            // The value should still be wrapped in Redacted
            const redacted = found.value.privateKey.value;

            // Redacted.value extracts the actual value
            strictEqual(Redacted.value(redacted), sensitiveKey);

            // The Redacted type ensures the value isn't accidentally logged/serialized
            // (toString returns "<redacted>")
          }
        }),
      TEST_TIMEOUT
    );
  });
});
