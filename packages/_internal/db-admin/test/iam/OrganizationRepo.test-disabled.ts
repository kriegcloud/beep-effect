import { describe, expect } from "bun:test";
import { OrganizationRepo, UserRepo } from "@beep/iam-infra";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
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
 * Helper to create a unique slug to avoid conflicts between tests.
 */
const makeTestSlug = (prefix: string): string => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

/**
 * Helper to create a mock user for insert operations.
 */
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("test"),
    name: overrides?.name ?? "Test User",
  });

/**
 * Helper to create a mock organization for insert operations.
 * Requires ownerUserId since it's a foreign key dependency.
 */
const makeMockOrganization = (overrides: { ownerUserId: SharedEntityIds.UserId.Type; name?: string; slug?: string }) =>
  Organization.Model.jsonCreate.make({
    ownerUserId: overrides.ownerUserId,
    name: overrides.name ?? "Test Organization",
    slug: BS.Slug.make(overrides.slug ?? makeTestSlug("test-org")),
  });

describe("OrganizationRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert organization and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // First create owner user (FK dependency)
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-insert-owner"),
              name: "Organization Owner",
            })
          );

          const slug = makeTestSlug("insert-org");
          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "Insert Test Organization",
            slug,
          });
          const inserted = yield* orgRepo.insert(mockedOrg);

          // Verify schema conformance
          assertTrue(S.is(Organization.Model)(inserted));

          // Verify fields
          strictEqual(inserted.name, "Insert Test Organization");
          strictEqual(inserted.slug, slug);
          deepStrictEqual(inserted.ownerUserId, owner.id);

          // Verify default values are applied
          strictEqual(inserted.type, "individual");
          strictEqual(inserted.isPersonal, false);
          strictEqual(inserted.subscriptionTier, "free");
          strictEqual(inserted.subscriptionStatus, "active");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted organization",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-unique-owner"),
              name: "Unique ID Owner",
            })
          );

          const org1 = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Unique Org 1",
              slug: makeTestSlug("unique-1"),
            })
          );
          const org2 = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Unique Org 2",
              slug: makeTestSlug("unique-2"),
            })
          );

          // IDs should be different
          expect(org1.id).not.toBe(org2.id);

          // Both should be valid EntityId format (organization__uuid)
          expect(org1.id).toMatch(/^organization__[0-9a-f-]+$/);
          expect(org2.id).toMatch(/^organization__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert organization without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-void-owner"),
              name: "InsertVoid Owner",
            })
          );

          const slug = makeTestSlug("insert-void");
          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "InsertVoid Test Organization",
            slug,
          });

          // insertVoid returns void
          const result = yield* orgRepo.insertVoid(mockedOrg);
          strictEqual(result, undefined);

          // Verify the organization was actually persisted by attempting insert again.
          // A duplicate slug should fail, proving the first insert worked.
          const duplicateResult = yield* Effect.either(orgRepo.insertVoid(mockedOrg));

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
      "should return Some when organization exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-find-some-owner"),
              name: "FindById Some Owner",
            })
          );

          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "FindById Some Organization",
            slug: makeTestSlug("find-some"),
          });
          const inserted = yield* orgRepo.insert(mockedOrg);

          const found = yield* orgRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.name, "FindById Some Organization");
            deepStrictEqual(found.value.ownerUserId, owner.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when organization does not exist",
      () =>
        Effect.gen(function* () {
          const orgRepo = yield* OrganizationRepo;

          // Use a valid OrganizationId format that doesn't exist (EntityId format: organization__uuid)
          const nonExistentId = "organization__00000000-0000-0000-0000-000000000000";
          const result = yield* orgRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete organization entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-find-complete-owner"),
              name: "Complete Org Owner",
            })
          );

          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "Complete Organization",
            slug: makeTestSlug("find-complete"),
          });
          const inserted = yield* orgRepo.insert(mockedOrg);
          const found = yield* orgRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("name");
            expect(found.value).toHaveProperty("slug");
            expect(found.value).toHaveProperty("ownerUserId");
            expect(found.value).toHaveProperty("type");
            expect(found.value).toHaveProperty("isPersonal");
            expect(found.value).toHaveProperty("subscriptionTier");
            expect(found.value).toHaveProperty("subscriptionStatus");
            expect(found.value).toHaveProperty("logo");
            expect(found.value).toHaveProperty("metadata");
            expect(found.value).toHaveProperty("maxMembers");
            expect(found.value).toHaveProperty("features");
            expect(found.value).toHaveProperty("settings");
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
      "should update organization name and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-update-name-owner"),
              name: "Update Name Owner",
            })
          );

          // Setup: create organization
          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "Original Organization Name",
            slug: makeTestSlug("update-name"),
          });
          const inserted = yield* orgRepo.insert(mockedOrg);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* orgRepo.update({
            ...inserted,
            name: "Updated Organization Name",
          });

          // Verify returned entity has updated name
          strictEqual(updated.name, "Updated Organization Name");
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.ownerUserId, owner.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update organization type",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-update-type-owner"),
              name: "Update Type Owner",
            })
          );

          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "Type Test Organization",
            slug: makeTestSlug("update-type"),
          });
          const inserted = yield* orgRepo.insert(mockedOrg);

          // Initially should be "individual" (default)
          strictEqual(inserted.type, "individual");

          // Update to "team"
          const updated = yield* orgRepo.update({
            ...inserted,
            type: "team",
          });

          strictEqual(updated.type, "team");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update subscription tier",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-update-tier-owner"),
              name: "Update Tier Owner",
            })
          );

          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "Tier Test Organization",
            slug: makeTestSlug("update-tier"),
          });
          const inserted = yield* orgRepo.insert(mockedOrg);

          strictEqual(inserted.subscriptionTier, "free");

          const updated = yield* orgRepo.update({
            ...inserted,
            subscriptionTier: "pro",
          });

          strictEqual(updated.subscriptionTier, "pro");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update subscription status",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-update-status-owner"),
              name: "Update Status Owner",
            })
          );

          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "Status Test Organization",
            slug: makeTestSlug("update-status"),
          });
          const inserted = yield* orgRepo.insert(mockedOrg);

          strictEqual(inserted.subscriptionStatus, "active");

          const updated = yield* orgRepo.update({
            ...inserted,
            subscriptionStatus: "canceled",
          });

          strictEqual(updated.subscriptionStatus, "canceled");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-update-persist-owner"),
              name: "Persist Test Owner",
            })
          );

          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "Persist Test Organization",
            slug: makeTestSlug("update-persist"),
          });
          const inserted = yield* orgRepo.insert(mockedOrg);

          yield* orgRepo.update({
            ...inserted,
            name: "Persisted Update Organization",
          });

          // Verify by fetching fresh
          const found = yield* orgRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.name, "Persisted Update Organization");
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
      "should update organization without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-updatevoid-owner"),
              name: "UpdateVoid Owner",
            })
          );

          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "UpdateVoid Original Organization",
            slug: makeTestSlug("update-void"),
          });
          const inserted = yield* orgRepo.insert(mockedOrg);

          // updateVoid returns void
          const result = yield* orgRepo.updateVoid({
            ...inserted,
            name: "UpdateVoid Updated Organization",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* orgRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.name, "UpdateVoid Updated Organization");
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
      "should delete existing organization",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-delete-owner"),
              name: "Delete Test Owner",
            })
          );

          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "Delete Test Organization",
            slug: makeTestSlug("delete"),
          });
          const inserted = yield* orgRepo.insert(mockedOrg);

          // Verify organization exists
          const beforeDelete = yield* orgRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* orgRepo.delete(inserted.id);

          // Verify organization no longer exists
          const afterDelete = yield* orgRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent organization",
      () =>
        Effect.gen(function* () {
          const orgRepo = yield* OrganizationRepo;

          // Deleting a non-existent ID should not throw (EntityId format: organization__uuid)
          const nonExistentId = "organization__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(orgRepo.delete(nonExistentId));

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
      "should insert multiple organizations without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-many-owner"),
              name: "Batch Insert Owner",
            })
          );

          const prefix = crypto.randomUUID().slice(0, 8);
          const orgs = [
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Batch Organization 1",
              slug: `batch-1-${prefix}`,
            }),
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Batch Organization 2",
              slug: `batch-2-${prefix}`,
            }),
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Batch Organization 3",
              slug: `batch-3-${prefix}`,
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* orgRepo.insertManyVoid(
            orgs as unknown as readonly [
              typeof Organization.Model.insert.Type,
              ...(typeof Organization.Model.insert.Type)[],
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
      "should fail with DatabaseError on duplicate slug (unique constraint violation)",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-duplicate-owner"),
              name: "Duplicate Slug Owner",
            })
          );

          const slug = makeTestSlug("duplicate");
          const org1 = makeMockOrganization({
            ownerUserId: owner.id,
            name: "First Organization",
            slug,
          });
          const org2 = makeMockOrganization({
            ownerUserId: owner.id,
            name: "Second Organization",
            slug, // Same slug as org1
          });

          // First insert should succeed
          yield* orgRepo.insert(org1);

          // Second insert with same slug should fail
          const result = yield* Effect.either(orgRepo.insert(org2));

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
      "should die when updating non-existent organization",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // First create a valid organization to get a proper structure for update
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-update-nonexistent-owner"),
              name: "Update Nonexistent Owner",
            })
          );

          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "Temp Organization",
            slug: makeTestSlug("update-nonexistent"),
          });
          const inserted = yield* orgRepo.insert(mockedOrg);

          // Delete the organization
          yield* orgRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) organization
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            orgRepo.update({
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
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup: create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-crud-owner"),
              name: "CRUD Workflow Owner",
            })
          );

          // CREATE
          const mockedOrg = makeMockOrganization({
            ownerUserId: owner.id,
            name: "CRUD Test Organization",
            slug: makeTestSlug("crud-workflow"),
          });
          const created = yield* orgRepo.insert(mockedOrg);
          assertTrue(S.is(Organization.Model)(created));

          // READ
          const read = yield* orgRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.name, "CRUD Test Organization");
          }

          // UPDATE
          const updated = yield* orgRepo.update({
            ...created,
            name: "Updated CRUD Organization",
            type: "team",
          });
          strictEqual(updated.name, "Updated CRUD Organization");
          strictEqual(updated.type, "team");

          // Verify update persisted
          const readAfterUpdate = yield* orgRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.name, "Updated CRUD Organization");
            strictEqual(readAfterUpdate.value.type, "team");
          }

          // DELETE
          yield* orgRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* orgRepo.findById(created.id);
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
      "should handle optional logo field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-no-logo-owner"),
              name: "No Logo Owner",
            })
          );

          // Create without logo
          const orgWithoutLogo = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "No Logo Organization",
              slug: makeTestSlug("no-logo"),
            })
          );

          // logo should be None (optional fields are Option types)
          strictEqual(orgWithoutLogo.logo._tag, "None");

          // Update with logo
          const updated = yield* orgRepo.update({
            ...orgWithoutLogo,
            logo: O.some("https://example.com/logo.png" as BS.Url.Type),
          });

          strictEqual(updated.logo._tag, "Some");
          strictEqual(
            O.getOrElse(updated.logo, () => ""),
            "https://example.com/logo.png"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional metadata field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-no-metadata-owner"),
              name: "No Metadata Owner",
            })
          );

          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "No Metadata Organization",
              slug: makeTestSlug("no-metadata"),
            })
          );

          strictEqual(org.metadata._tag, "None");

          const updated = yield* orgRepo.update({
            ...org,
            metadata: O.some('{"theme": "dark"}'),
          });

          strictEqual(updated.metadata._tag, "Some");
          strictEqual(
            O.getOrElse(updated.metadata, () => ""),
            '{"theme": "dark"}'
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional maxMembers field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-no-maxmembers-owner"),
              name: "No MaxMembers Owner",
            })
          );

          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "No MaxMembers Organization",
              slug: makeTestSlug("no-maxmembers"),
            })
          );

          strictEqual(org.maxMembers._tag, "None");

          const updated = yield* orgRepo.update({
            ...org,
            maxMembers: O.some(100),
          });

          strictEqual(updated.maxMembers._tag, "Some");
          strictEqual(
            O.getOrElse(updated.maxMembers, () => 0),
            100
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle isPersonal flag",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-personal-owner"),
              name: "Personal Org Owner",
            })
          );

          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Personal Organization",
              slug: makeTestSlug("personal"),
            })
          );

          // Initially should be false (default)
          strictEqual(org.isPersonal, false);

          const updated = yield* orgRepo.update({
            ...org,
            isPersonal: true,
          });

          strictEqual(updated.isPersonal, true);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FOREIGN KEY RELATIONSHIP TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("foreign key relationships", (it) => {
    it.effect(
      "should maintain ownerUserId reference to existing user",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-fk-owner"),
              name: "FK Test Owner",
            })
          );

          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "FK Test Organization",
              slug: makeTestSlug("fk-test"),
            })
          );

          // Verify the ownerUserId matches the created user
          deepStrictEqual(org.ownerUserId, owner.id);

          // Verify we can find the owner
          const foundOwner = yield* userRepo.findById(org.ownerUserId);
          strictEqual(foundOwner._tag, "Some");
          if (foundOwner._tag === "Some") {
            strictEqual(foundOwner.value.name, "FK Test Owner");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow transferring organization ownership",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Create original owner
          const originalOwner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-transfer-original"),
              name: "Original Owner",
            })
          );

          // Create new owner
          const newOwner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("org-transfer-new"),
              name: "New Owner",
            })
          );

          // Create organization with original owner
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: originalOwner.id,
              name: "Transfer Test Organization",
              slug: makeTestSlug("transfer"),
            })
          );

          deepStrictEqual(org.ownerUserId, originalOwner.id);

          // Transfer ownership to new owner
          const updated = yield* orgRepo.update({
            ...org,
            ownerUserId: newOwner.id,
          });

          deepStrictEqual(updated.ownerUserId, newOwner.id);

          // Verify persistence
          const found = yield* orgRepo.findById(org.id);
          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.ownerUserId, newOwner.id);
          }
        }),
      TEST_TIMEOUT
    );
  });
});
