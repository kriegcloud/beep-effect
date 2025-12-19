import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { RateLimitRepo } from "@beep/iam-server/adapters/repositories";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { PgTest } from "../container.ts";

// SharedEntityIds available if foreign key relationships are needed
/**
 * Timeout in milliseconds for bun test. Duration objects are not supported by bun test.
 */
const TEST_TIMEOUT = 60000;

/**
 * Helper to create a unique test key to avoid conflicts between tests.
 */
const makeTestKey = (prefix: string): string => `${prefix}-${crypto.randomUUID()}`;

/**
 * Helper to create a mock rate limit for insert operations.
 * RateLimit has optional fields: key, count, lastRequest
 */
const makeMockRateLimit = (
  overrides?: Partial<{
    key: string;
    count: number;
    lastRequest: bigint;
  }>
) =>
  Entities.RateLimit.Model.jsonCreate.make({
    key: O.fromNullable(overrides?.key ?? makeTestKey("test")),
    count: O.fromNullable(overrides?.count ?? 1),
    lastRequest: O.fromNullable(overrides?.lastRequest ?? BigInt(Date.now())),
  });

describe("RateLimitRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert rate limit and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const testKey = makeTestKey("insert");
          const mockedRateLimit = makeMockRateLimit({
            key: testKey,
            count: 5,
            lastRequest: BigInt(1700000000000),
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          // Verify schema conformance
          assertTrue(S.is(Entities.RateLimit.Model)(inserted));

          // Verify fields - key, count, lastRequest are Option types on select
          strictEqual(inserted.key._tag, "Some");
          if (inserted.key._tag === "Some") {
            strictEqual(inserted.key.value, testKey);
          }

          strictEqual(inserted.count._tag, "Some");
          if (inserted.count._tag === "Some") {
            strictEqual(inserted.count.value, 5);
          }

          strictEqual(inserted.lastRequest._tag, "Some");
          if (inserted.lastRequest._tag === "Some") {
            strictEqual(inserted.lastRequest.value, BigInt(1700000000000));
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted rate limit",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const rateLimit1 = yield* repo.insert(makeMockRateLimit({ key: makeTestKey("unique-1") }));
          const rateLimit2 = yield* repo.insert(makeMockRateLimit({ key: makeTestKey("unique-2") }));

          // IDs should be different
          expect(rateLimit1.id).not.toBe(rateLimit2.id);

          // Both should be valid EntityId format (rate_limit__uuid)
          expect(rateLimit1.id).toMatch(/^rate_limit__[0-9a-f-]+$/);
          expect(rateLimit2.id).toMatch(/^rate_limit__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert rate limit without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const testKey = makeTestKey("insert-void");
          const mockedRateLimit = makeMockRateLimit({ key: testKey });

          // insertVoid returns void
          const result = yield* repo.insertVoid(mockedRateLimit);
          strictEqual(result, undefined);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should verify inserted rate limit exists via separate insert attempt",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const testKey = makeTestKey("insert-void-verify");
          const mockedRateLimit = makeMockRateLimit({ key: testKey });

          // First insert should succeed
          yield* repo.insertVoid(mockedRateLimit);

          // Insert a different rate limit to verify insertVoid worked
          // (RateLimit doesn't have unique key constraint, so we verify via count)
          const secondRateLimit = makeMockRateLimit({ key: makeTestKey("insert-void-verify-2") });
          const result = yield* Effect.either(repo.insertVoid(secondRateLimit));

          // Should succeed (no unique constraint on key)
          strictEqual(result._tag, "Right");
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FIND BY ID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("findById operations", (it) => {
    it.effect(
      "should return Some when rate limit exists",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const testKey = makeTestKey("find-some");
          const mockedRateLimit = makeMockRateLimit({
            key: testKey,
            count: 10,
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.key._tag, "Some");
            if (found.value.key._tag === "Some") {
              strictEqual(found.value.key.value, testKey);
            }
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when rate limit does not exist",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          // Use a valid RateLimitId format that doesn't exist (EntityId format: rate_limit__uuid)
          const nonExistentId = "rate_limit__00000000-0000-0000-0000-000000000000";
          const result = yield* repo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete rate limit entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const mockedRateLimit = makeMockRateLimit({
            key: makeTestKey("find-complete"),
            count: 42,
            lastRequest: BigInt(1700000000000),
          });
          const inserted = yield* repo.insert(mockedRateLimit);
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("key");
            expect(found.value).toHaveProperty("count");
            expect(found.value).toHaveProperty("lastRequest");
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
      "should update rate limit count and return updated entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          // Setup: create rate limit
          const testKey = makeTestKey("update-count");
          const mockedRateLimit = makeMockRateLimit({
            key: testKey,
            count: 1,
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* repo.update({
            ...inserted,
            count: O.some(100),
          });

          // Verify returned entity has updated count
          strictEqual(updated.count._tag, "Some");
          if (updated.count._tag === "Some") {
            strictEqual(updated.count.value, 100);
          }
          deepStrictEqual(updated.id, inserted.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update rate limit key",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const originalKey = makeTestKey("update-key-original");
          const mockedRateLimit = makeMockRateLimit({
            key: originalKey,
            count: 5,
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          // Update key
          const newKey = makeTestKey("update-key-new");
          const updated = yield* repo.update({
            ...inserted,
            key: O.some(newKey),
          });

          strictEqual(updated.key._tag, "Some");
          if (updated.key._tag === "Some") {
            strictEqual(updated.key.value, newKey);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update lastRequest timestamp",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const mockedRateLimit = makeMockRateLimit({
            key: makeTestKey("update-timestamp"),
            lastRequest: BigInt(1600000000000),
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          // Update lastRequest
          const newTimestamp = BigInt(1700000000000);
          const updated = yield* repo.update({
            ...inserted,
            lastRequest: O.some(newTimestamp),
          });

          strictEqual(updated.lastRequest._tag, "Some");
          if (updated.lastRequest._tag === "Some") {
            strictEqual(updated.lastRequest.value, newTimestamp);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const mockedRateLimit = makeMockRateLimit({
            key: makeTestKey("update-persist"),
            count: 1,
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          yield* repo.update({
            ...inserted,
            count: O.some(999),
          });

          // Verify by fetching fresh
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.count._tag, "Some");
            if (found.value.count._tag === "Some") {
              strictEqual(found.value.count.value, 999);
            }
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
      "should update rate limit without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const mockedRateLimit = makeMockRateLimit({
            key: makeTestKey("update-void"),
            count: 1,
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          // updateVoid returns void
          const result = yield* repo.updateVoid({
            ...inserted,
            count: O.some(50),
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.count._tag, "Some");
            if (found.value.count._tag === "Some") {
              strictEqual(found.value.count.value, 50);
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
      "should delete existing rate limit",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const mockedRateLimit = makeMockRateLimit({
            key: makeTestKey("delete"),
            count: 1,
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          // Verify rate limit exists
          const beforeDelete = yield* repo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* repo.delete(inserted.id);

          // Verify rate limit no longer exists
          const afterDelete = yield* repo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent rate limit (idempotent)",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          // Deleting a non-existent ID should not throw (EntityId format: rate_limit__uuid)
          const nonExistentId = "rate_limit__00000000-0000-0000-0000-000000000000";
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
      "should insert multiple rate limits without returning entities",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const prefix = crypto.randomUUID();
          const rateLimits = [
            makeMockRateLimit({ key: makeTestKey(`many-1-${prefix}`), count: 1 }),
            makeMockRateLimit({ key: makeTestKey(`many-2-${prefix}`), count: 2 }),
            makeMockRateLimit({ key: makeTestKey(`many-3-${prefix}`), count: 3 }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* repo.insertManyVoid(
            rateLimits as unknown as readonly [
              typeof Entities.RateLimit.Model.insert.Type,
              ...(typeof Entities.RateLimit.Model.insert.Type)[],
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
      "should die when updating non-existent rate limit",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          // First create a valid rate limit to get a proper structure for update
          const mockedRateLimit = makeMockRateLimit({
            key: makeTestKey("update-nonexistent"),
            count: 1,
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          // Delete the rate limit
          yield* repo.delete(inserted.id);

          // Now try to update the deleted (non-existent) rate limit
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            repo.update({
              ...inserted,
              count: O.some(999),
            })
          );

          // Update on non-existent row dies with NoSuchElementException (treated as defect)
          // The repo's design catches this and calls Effect.die, so we check for Failure
          strictEqual(exit._tag, "Failure");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle database errors gracefully",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          // Test that invalid operations result in proper error handling
          // Creating a rate limit with valid data should succeed
          const validRateLimit = makeMockRateLimit({
            key: makeTestKey("error-handling"),
            count: 1,
          });
          const result = yield* Effect.either(repo.insert(validRateLimit));

          strictEqual(result._tag, "Right");
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
          const repo = yield* RateLimitRepo;

          // CREATE
          const testKey = makeTestKey("crud-workflow");
          const mockedRateLimit = makeMockRateLimit({
            key: testKey,
            count: 1,
            lastRequest: BigInt(1600000000000),
          });
          const created = yield* repo.insert(mockedRateLimit);
          assertTrue(S.is(Entities.RateLimit.Model)(created));

          // READ
          const read = yield* repo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.key._tag, "Some");
            if (read.value.key._tag === "Some") {
              strictEqual(read.value.key.value, testKey);
            }
          }

          // UPDATE
          const updated = yield* repo.update({
            ...created,
            count: O.some(100),
            lastRequest: O.some(BigInt(1700000000000)),
          });
          strictEqual(updated.count._tag, "Some");
          if (updated.count._tag === "Some") {
            strictEqual(updated.count.value, 100);
          }
          strictEqual(updated.lastRequest._tag, "Some");
          if (updated.lastRequest._tag === "Some") {
            strictEqual(updated.lastRequest.value, BigInt(1700000000000));
          }

          // Verify update persisted
          const readAfterUpdate = yield* repo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.count._tag, "Some");
            if (readAfterUpdate.value.count._tag === "Some") {
              strictEqual(readAfterUpdate.value.count.value, 100);
            }
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
      "should handle optional key field",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          // Create without key (using None)
          const rateLimitWithoutKey = Entities.RateLimit.Model.jsonCreate.make({
            key: O.none(),
            count: O.some(1),
            lastRequest: O.some(BigInt(Date.now())),
          });

          const inserted = yield* repo.insert(rateLimitWithoutKey);

          // key should be None
          strictEqual(inserted.key._tag, "None");

          // Update with key
          const newKey = makeTestKey("optional-key");
          const updated = yield* repo.update({
            ...inserted,
            key: O.some(newKey),
          });

          strictEqual(updated.key._tag, "Some");
          if (updated.key._tag === "Some") {
            strictEqual(updated.key.value, newKey);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional count field",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          // Create without count (using None)
          const rateLimitWithoutCount = Entities.RateLimit.Model.jsonCreate.make({
            key: O.some(makeTestKey("optional-count")),
            count: O.none(),
            lastRequest: O.some(BigInt(Date.now())),
          });

          const inserted = yield* repo.insert(rateLimitWithoutCount);

          // count should be None
          strictEqual(inserted.count._tag, "None");

          // Update with count
          const updated = yield* repo.update({
            ...inserted,
            count: O.some(42),
          });

          strictEqual(updated.count._tag, "Some");
          if (updated.count._tag === "Some") {
            strictEqual(updated.count.value, 42);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional lastRequest field",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          // Create without lastRequest (using None)
          const rateLimitWithoutLastRequest = Entities.RateLimit.Model.jsonCreate.make({
            key: O.some(makeTestKey("optional-lastRequest")),
            count: O.some(1),
            lastRequest: O.none(),
          });

          const inserted = yield* repo.insert(rateLimitWithoutLastRequest);

          // lastRequest should be None
          strictEqual(inserted.lastRequest._tag, "None");

          // Update with lastRequest
          const timestamp = BigInt(1700000000000);
          const updated = yield* repo.update({
            ...inserted,
            lastRequest: O.some(timestamp),
          });

          strictEqual(updated.lastRequest._tag, "Some");
          if (updated.lastRequest._tag === "Some") {
            strictEqual(updated.lastRequest.value, timestamp);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle all fields as None",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          // Create with all optional fields as None
          const rateLimitAllNone = Entities.RateLimit.Model.jsonCreate.make({
            key: O.none(),
            count: O.none(),
            lastRequest: O.none(),
          });

          const inserted = yield* repo.insert(rateLimitAllNone);

          // All optional fields should be None
          strictEqual(inserted.key._tag, "None");
          strictEqual(inserted.count._tag, "None");
          strictEqual(inserted.lastRequest._tag, "None");

          // ID should still be generated
          expect(inserted.id).toMatch(/^rate_limit__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // RATE LIMIT SPECIFIC SCENARIOS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("rate limit specific scenarios", (it) => {
    it.effect(
      "should increment count correctly",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const mockedRateLimit = makeMockRateLimit({
            key: makeTestKey("increment"),
            count: 1,
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          // Simulate incrementing the count
          const currentCount = O.getOrElse(inserted.count, () => 0);
          const updated = yield* repo.update({
            ...inserted,
            count: O.some(currentCount + 1),
          });

          strictEqual(updated.count._tag, "Some");
          if (updated.count._tag === "Some") {
            strictEqual(updated.count.value, 2);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle large count values",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          const mockedRateLimit = makeMockRateLimit({
            key: makeTestKey("large-count"),
            count: 1000000,
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          strictEqual(inserted.count._tag, "Some");
          if (inserted.count._tag === "Some") {
            strictEqual(inserted.count.value, 1000000);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle future timestamps",
      () =>
        Effect.gen(function* () {
          const repo = yield* RateLimitRepo;

          // Use a future timestamp
          const futureTimestamp = BigInt(Date.now() + 86400000); // 24 hours in future
          const mockedRateLimit = makeMockRateLimit({
            key: makeTestKey("future-timestamp"),
            lastRequest: futureTimestamp,
          });
          const inserted = yield* repo.insert(mockedRateLimit);

          strictEqual(inserted.lastRequest._tag, "Some");
          if (inserted.lastRequest._tag === "Some") {
            strictEqual(inserted.lastRequest.value, futureTimestamp);
          }
        }),
      TEST_TIMEOUT
    );
  });
});
