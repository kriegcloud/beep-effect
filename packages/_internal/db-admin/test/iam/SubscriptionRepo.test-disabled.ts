import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { OrganizationRepo, SubscriptionRepo, UserRepo } from "@beep/iam-infra/adapters/repositories";
import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain";
import { Organization, User } from "@beep/shared-domain/entities";
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
 * Helper to create a mock user for insert operations (required for Organization.ownerUserId).
 */
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("test"),
    name: overrides?.name ?? "Test User",
  });

/**
 * Helper to create a mock organization for insert operations (required for Subscription.organizationId).
 */
const makeMockOrganization = (
  ownerUserId: SharedEntityIds.UserId.Type,
  overrides?: Partial<{ name: string; slug: string }>
) =>
  Organization.Model.jsonCreate.make({
    name: overrides?.name ?? "Test Organization",
    slug: BS.Slug.make(overrides?.slug ?? `test-org-${crypto.randomUUID()}`.slice(0, 50)),
    ownerUserId,
    isPersonal: false,
  });

/**
 * Helper to create a mock subscription for insert operations.
 */
const makeMockSubscription = (
  organizationId: SharedEntityIds.OrganizationId.Type,
  overrides?: Partial<{ plan: string; status: string; stripeSubscriptionId: string }>
) =>
  Entities.Subscription.Model.jsonCreate.make({
    plan: overrides?.plan ?? "free",
    status: overrides?.status ?? "active",
    organizationId,
    stripeSubscriptionId: overrides?.stripeSubscriptionId ? O.some(overrides.stripeSubscriptionId) : O.none(),
    periodStart: O.none(),
    periodEnd: O.none(),
    cancelAtPeriodEnd: false,
  });

/**
 * Helper to create a user and organization, returning both for subscription tests.
 */
const createUserAndOrganization = Effect.gen(function* () {
  const userRepo = yield* UserRepo;
  const orgRepo = yield* OrganizationRepo;

  const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("subscription-test") }));
  const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Subscription Test Org" }));

  return { user, org };
});

describe("SubscriptionRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert subscription and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const mockedSubscription = makeMockSubscription(org.id, {
            plan: "pro",
            status: "active",
          });
          const inserted = yield* repo.insert(mockedSubscription);

          // Verify schema conformance
          assertTrue(S.is(Entities.Subscription.Model)(inserted));

          // Verify fields
          strictEqual(inserted.plan, "pro");
          strictEqual(inserted.status, "active");
          deepStrictEqual(inserted.organizationId, org.id);

          // Verify default values are applied
          strictEqual(inserted.cancelAtPeriodEnd, false);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted subscription",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const sub1 = yield* repo.insert(makeMockSubscription(org.id, { plan: "basic" }));
          const sub2 = yield* repo.insert(makeMockSubscription(org.id, { plan: "pro" }));

          // IDs should be different
          expect(sub1.id).not.toBe(sub2.id);

          // Both should be valid EntityId format (subscription__uuid)
          expect(sub1.id).toMatch(/^subscription__[0-9a-f-]+$/);
          expect(sub2.id).toMatch(/^subscription__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert subscription without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const mockedSubscription = makeMockSubscription(org.id, { plan: "insert-void-test" });

          // insertVoid returns void
          const result = yield* repo.insertVoid(mockedSubscription);
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
      "should return Some when subscription exists",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const mockedSubscription = makeMockSubscription(org.id, {
            plan: "find-some-plan",
            status: "active",
          });
          const inserted = yield* repo.insert(mockedSubscription);

          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.plan, "find-some-plan");
            deepStrictEqual(found.value.organizationId, org.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when subscription does not exist",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;

          // Use a valid SubscriptionId format that doesn't exist (EntityId format: subscription__uuid)
          const nonExistentId = "subscription__00000000-0000-0000-0000-000000000000";
          const result = yield* repo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete subscription entity with all fields",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const mockedSubscription = makeMockSubscription(org.id, {
            plan: "complete-test",
          });
          const inserted = yield* repo.insert(mockedSubscription);
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("plan");
            expect(found.value).toHaveProperty("status");
            expect(found.value).toHaveProperty("organizationId");
            expect(found.value).toHaveProperty("stripeSubscriptionId");
            expect(found.value).toHaveProperty("periodStart");
            expect(found.value).toHaveProperty("periodEnd");
            expect(found.value).toHaveProperty("cancelAtPeriodEnd");
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
      "should update subscription plan and return updated entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          // Setup: create subscription
          const mockedSubscription = makeMockSubscription(org.id, {
            plan: "basic",
          });
          const inserted = yield* repo.insert(mockedSubscription);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* repo.update({
            ...inserted,
            plan: "enterprise",
          });

          // Verify returned entity has updated plan
          strictEqual(updated.plan, "enterprise");
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.organizationId, org.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update status field",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const mockedSubscription = makeMockSubscription(org.id, {
            plan: "pro",
            status: "active",
          });
          const inserted = yield* repo.insert(mockedSubscription);

          // Initially should be active
          strictEqual(inserted.status, "active");

          // Update to canceled
          const updated = yield* repo.update({
            ...inserted,
            status: "canceled",
          });

          strictEqual(updated.status, "canceled");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update cancelAtPeriodEnd field",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const mockedSubscription = makeMockSubscription(org.id, {
            plan: "pro",
          });
          const inserted = yield* repo.insert(mockedSubscription);

          strictEqual(inserted.cancelAtPeriodEnd, false);

          const updated = yield* repo.update({
            ...inserted,
            cancelAtPeriodEnd: true,
          });

          strictEqual(updated.cancelAtPeriodEnd, true);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const mockedSubscription = makeMockSubscription(org.id, {
            plan: "basic",
          });
          const inserted = yield* repo.insert(mockedSubscription);

          yield* repo.update({
            ...inserted,
            plan: "premium",
          });

          // Verify by fetching fresh
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.plan, "premium");
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
      "should update subscription without returning entity",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const mockedSubscription = makeMockSubscription(org.id, {
            plan: "update-void-original",
          });
          const inserted = yield* repo.insert(mockedSubscription);

          // updateVoid returns void
          const result = yield* repo.updateVoid({
            ...inserted,
            plan: "update-void-updated",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* repo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.plan, "update-void-updated");
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
      "should delete existing subscription",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const mockedSubscription = makeMockSubscription(org.id, {
            plan: "delete-test",
          });
          const inserted = yield* repo.insert(mockedSubscription);

          // Verify subscription exists
          const beforeDelete = yield* repo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* repo.delete(inserted.id);

          // Verify subscription no longer exists
          const afterDelete = yield* repo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent subscription",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;

          // Deleting a non-existent ID should not throw (EntityId format: subscription__uuid)
          const nonExistentId = "subscription__00000000-0000-0000-0000-000000000000";
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
      "should insert multiple subscriptions without returning entities",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const subscriptions = [
            makeMockSubscription(org.id, { plan: "batch-plan-1" }),
            makeMockSubscription(org.id, { plan: "batch-plan-2" }),
            makeMockSubscription(org.id, { plan: "batch-plan-3" }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* repo.insertManyVoid(
            subscriptions as unknown as readonly [
              typeof Entities.Subscription.Model.insert.Type,
              ...(typeof Entities.Subscription.Model.insert.Type)[],
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
      "should fail with DatabaseError on foreign key violation (invalid organizationId)",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;

          // Use a non-existent organization ID
          const nonExistentOrgId = SharedEntityIds.OrganizationId.make(
            "organization__00000000-0000-0000-0000-000000000000"
          );
          const subscription = Entities.Subscription.Model.jsonCreate.make({
            plan: "test",
            status: "active",
            organizationId: nonExistentOrgId,
            stripeSubscriptionId: O.none(),
            periodStart: O.none(),
            periodEnd: O.none(),
            cancelAtPeriodEnd: false,
          });

          // Insert should fail due to foreign key constraint
          const result = yield* Effect.either(repo.insert(subscription));

          strictEqual(result._tag, "Left");
          if (result._tag === "Left") {
            // Should be a DatabaseError with foreign key violation type
            expect(result.left._tag).toBe("DatabaseError");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should die when updating non-existent subscription",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          // First create a valid subscription to get a proper structure for update
          const mockedSubscription = makeMockSubscription(org.id, {
            plan: "update-nonexistent",
          });
          const inserted = yield* repo.insert(mockedSubscription);

          // Delete the subscription
          yield* repo.delete(inserted.id);

          // Now try to update the deleted (non-existent) subscription
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            repo.update({
              ...inserted,
              plan: "should-not-work",
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
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          // CREATE
          const mockedSubscription = makeMockSubscription(org.id, {
            plan: "crud-test-plan",
            status: "active",
          });
          const created = yield* repo.insert(mockedSubscription);
          assertTrue(S.is(Entities.Subscription.Model)(created));

          // READ
          const read = yield* repo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.plan, "crud-test-plan");
          }

          // UPDATE
          const updated = yield* repo.update({
            ...created,
            plan: "crud-updated-plan",
            status: "canceled",
          });
          strictEqual(updated.plan, "crud-updated-plan");
          strictEqual(updated.status, "canceled");

          // Verify update persisted
          const readAfterUpdate = yield* repo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.plan, "crud-updated-plan");
            strictEqual(readAfterUpdate.value.status, "canceled");
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
      "should handle optional stripeSubscriptionId field",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          // Create without stripeSubscriptionId
          const subscriptionWithoutStripe = yield* repo.insert(
            makeMockSubscription(org.id, {
              plan: "no-stripe",
            })
          );

          // stripeSubscriptionId should be None (optional fields are Option types)
          strictEqual(subscriptionWithoutStripe.stripeSubscriptionId._tag, "None");

          // Update with stripeSubscriptionId
          const updated = yield* repo.update({
            ...subscriptionWithoutStripe,
            stripeSubscriptionId: O.some("sub_123456789"),
          });

          strictEqual(updated.stripeSubscriptionId._tag, "Some");
          strictEqual(
            O.getOrElse(updated.stripeSubscriptionId, () => ""),
            "sub_123456789"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional periodStart field",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const subscription = yield* repo.insert(
            makeMockSubscription(org.id, {
              plan: "no-period-start",
            })
          );

          strictEqual(subscription.periodStart._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional periodEnd field",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          const subscription = yield* repo.insert(
            makeMockSubscription(org.id, {
              plan: "no-period-end",
            })
          );

          strictEqual(subscription.periodEnd._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle default status field",
      () =>
        Effect.gen(function* () {
          const repo = yield* SubscriptionRepo;
          const { org } = yield* createUserAndOrganization;

          // Create subscription without explicitly setting status
          const subscription = yield* repo.insert(
            Entities.Subscription.Model.jsonCreate.make({
              plan: "default-status-test",
              organizationId: org.id,
              stripeSubscriptionId: O.none(),
              periodStart: O.none(),
              periodEnd: O.none(),
              cancelAtPeriodEnd: false,
            })
          );

          // Default status should be "incomplete" as per the model definition
          strictEqual(subscription.status, "incomplete");
        }),
      TEST_TIMEOUT
    );
  });
});
