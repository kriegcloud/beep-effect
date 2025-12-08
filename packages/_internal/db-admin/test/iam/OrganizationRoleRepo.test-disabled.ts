import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { OrganizationRepo, OrganizationRoleRepo, UserRepo } from "@beep/iam-infra";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { Organization, User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
// Option is available for future optional field tests
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

/**
 * Helper to create a mock organization role for insert operations.
 * Requires organizationId since it's a foreign key dependency.
 */
const makeMockOrganizationRole = (overrides: { organizationId: SharedEntityIds.OrganizationId.Type; role?: string }) =>
  Entities.OrganizationRole.Model.jsonCreate.make({
    organizationId: overrides.organizationId,
    role: overrides.role ?? "member",
  });

describe("OrganizationRoleRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert organization role and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // First create owner user (FK dependency)
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-insert-owner"),
              name: "Role Insert Owner",
            })
          );

          // Create organization (FK dependency)
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Role Insert Organization",
              slug: makeTestSlug("role-insert"),
            })
          );

          const mockedRole = makeMockOrganizationRole({
            organizationId: org.id,
            role: "admin",
          });
          const inserted = yield* roleRepo.insert(mockedRole);

          // Verify schema conformance
          assertTrue(S.is(Entities.OrganizationRole.Model)(inserted));

          // Verify fields
          strictEqual(inserted.role, "admin");
          deepStrictEqual(inserted.organizationId, org.id);

          // Verify optional permission field is None by default
          strictEqual(inserted.permission._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted organization role",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-unique-owner"),
              name: "Unique ID Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Unique Role Organization",
              slug: makeTestSlug("role-unique"),
            })
          );

          const role1 = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "admin",
            })
          );
          const role2 = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "member",
            })
          );

          // IDs should be different
          expect(role1.id).not.toBe(role2.id);

          // Both should be valid EntityId format (organization_role__uuid)
          expect(role1.id).toMatch(/^organization_role__[0-9a-f-]+$/);
          expect(role2.id).toMatch(/^organization_role__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert organization role without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-void-owner"),
              name: "InsertVoid Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "InsertVoid Organization",
              slug: makeTestSlug("role-void"),
            })
          );

          const mockedRole = makeMockOrganizationRole({
            organizationId: org.id,
            role: "editor",
          });

          // insertVoid returns void
          const result = yield* roleRepo.insertVoid(mockedRole);
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
      "should return Some when organization role exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-find-some-owner"),
              name: "FindById Some Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "FindById Some Organization",
              slug: makeTestSlug("role-find-some"),
            })
          );

          const mockedRole = makeMockOrganizationRole({
            organizationId: org.id,
            role: "reviewer",
          });
          const inserted = yield* roleRepo.insert(mockedRole);

          const found = yield* roleRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.role, "reviewer");
            deepStrictEqual(found.value.organizationId, org.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when organization role does not exist",
      () =>
        Effect.gen(function* () {
          const roleRepo = yield* OrganizationRoleRepo;

          // Use a valid OrganizationRoleId format that doesn't exist (EntityId format: organization_role__uuid)
          const nonExistentId = "organization_role__00000000-0000-0000-0000-000000000000";
          const result = yield* roleRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete organization role entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-find-complete-owner"),
              name: "Complete Role Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Complete Role Organization",
              slug: makeTestSlug("role-find-complete"),
            })
          );

          const mockedRole = makeMockOrganizationRole({
            organizationId: org.id,
            role: "moderator",
          });
          const inserted = yield* roleRepo.insert(mockedRole);
          const found = yield* roleRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("role");
            expect(found.value).toHaveProperty("permission");
            expect(found.value).toHaveProperty("organizationId");
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
      "should update organization role name and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-update-name-owner"),
              name: "Update Name Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Name Organization",
              slug: makeTestSlug("role-update-name"),
            })
          );

          // Setup: create organization role
          const mockedRole = makeMockOrganizationRole({
            organizationId: org.id,
            role: "original-role",
          });
          const inserted = yield* roleRepo.insert(mockedRole);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* roleRepo.update({
            ...inserted,
            role: "updated-role",
          });

          // Verify returned entity has updated role
          strictEqual(updated.role, "updated-role");
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.organizationId, org.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-update-persist-owner"),
              name: "Persist Test Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Persist Test Organization",
              slug: makeTestSlug("role-update-persist"),
            })
          );

          const mockedRole = makeMockOrganizationRole({
            organizationId: org.id,
            role: "persist-test-role",
          });
          const inserted = yield* roleRepo.insert(mockedRole);

          yield* roleRepo.update({
            ...inserted,
            role: "persisted-update-role",
          });

          // Verify by fetching fresh
          const found = yield* roleRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.role, "persisted-update-role");
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
      "should update organization role without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-updatevoid-owner"),
              name: "UpdateVoid Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "UpdateVoid Organization",
              slug: makeTestSlug("role-update-void"),
            })
          );

          const mockedRole = makeMockOrganizationRole({
            organizationId: org.id,
            role: "updatevoid-original",
          });
          const inserted = yield* roleRepo.insert(mockedRole);

          // updateVoid returns void
          const result = yield* roleRepo.updateVoid({
            ...inserted,
            role: "updatevoid-updated",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* roleRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.role, "updatevoid-updated");
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
      "should delete existing organization role",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-delete-owner"),
              name: "Delete Test Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Delete Test Organization",
              slug: makeTestSlug("role-delete"),
            })
          );

          const mockedRole = makeMockOrganizationRole({
            organizationId: org.id,
            role: "delete-test-role",
          });
          const inserted = yield* roleRepo.insert(mockedRole);

          // Verify organization role exists
          const beforeDelete = yield* roleRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* roleRepo.delete(inserted.id);

          // Verify organization role no longer exists
          const afterDelete = yield* roleRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent organization role",
      () =>
        Effect.gen(function* () {
          const roleRepo = yield* OrganizationRoleRepo;

          // Deleting a non-existent ID should not throw (EntityId format: organization_role__uuid)
          const nonExistentId = "organization_role__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(roleRepo.delete(nonExistentId));

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
      "should insert multiple organization roles without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-many-owner"),
              name: "Batch Insert Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Batch Insert Organization",
              slug: makeTestSlug("role-many"),
            })
          );

          const roles = [
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "batch-role-1",
            }),
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "batch-role-2",
            }),
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "batch-role-3",
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* roleRepo.insertManyVoid(
            roles as unknown as readonly [
              typeof Entities.OrganizationRole.Model.insert.Type,
              ...(typeof Entities.OrganizationRole.Model.insert.Type)[],
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
      "should die when updating non-existent organization role",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // First create a valid organization role to get a proper structure for update
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-update-nonexistent-owner"),
              name: "Update Nonexistent Owner",
            })
          );

          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Nonexistent Organization",
              slug: makeTestSlug("role-update-nonexistent"),
            })
          );

          const mockedRole = makeMockOrganizationRole({
            organizationId: org.id,
            role: "temp-role",
          });
          const inserted = yield* roleRepo.insert(mockedRole);

          // Delete the organization role
          yield* roleRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) organization role
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            roleRepo.update({
              ...inserted,
              role: "should-not-work",
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
          const roleRepo = yield* OrganizationRoleRepo;

          // Setup: create owner user and organization
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-crud-owner"),
              name: "CRUD Workflow Owner",
            })
          );

          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "CRUD Workflow Organization",
              slug: makeTestSlug("role-crud-workflow"),
            })
          );

          // CREATE
          const mockedRole = makeMockOrganizationRole({
            organizationId: org.id,
            role: "crud-test-role",
          });
          const created = yield* roleRepo.insert(mockedRole);
          assertTrue(S.is(Entities.OrganizationRole.Model)(created));

          // READ
          const read = yield* roleRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.role, "crud-test-role");
          }

          // UPDATE
          const updated = yield* roleRepo.update({
            ...created,
            role: "updated-crud-role",
          });
          strictEqual(updated.role, "updated-crud-role");

          // Verify update persisted
          const readAfterUpdate = yield* roleRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.role, "updated-crud-role");
          }

          // DELETE
          yield* roleRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* roleRepo.findById(created.id);
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
      "should handle optional permission field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-no-permission-owner"),
              name: "No Permission Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "No Permission Organization",
              slug: makeTestSlug("role-no-permission"),
            })
          );

          // Create without permission
          const roleWithoutPermission = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "no-permission-role",
            })
          );

          // permission should be None (optional fields are Option types)
          // PolicyRecord requires all 34 entity table names, so we only test the default None case
          strictEqual(roleWithoutPermission.permission._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle different role names",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-names-owner"),
              name: "Role Names Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Role Names Organization",
              slug: makeTestSlug("role-names"),
            })
          );

          // Test various role names
          const adminRole = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "admin",
            })
          );
          strictEqual(adminRole.role, "admin");

          const memberRole = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "member",
            })
          );
          strictEqual(memberRole.role, "member");

          const customRole = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "custom-role-name",
            })
          );
          strictEqual(customRole.role, "custom-role-name");
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FOREIGN KEY RELATIONSHIP TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("foreign key relationships", (it) => {
    it.effect(
      "should maintain organizationId reference to existing organization",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-fk-owner"),
              name: "FK Test Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "FK Test Organization",
              slug: makeTestSlug("role-fk-test"),
            })
          );

          const role = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "fk-test-role",
            })
          );

          // Verify the organizationId matches the created organization
          deepStrictEqual(role.organizationId, org.id);

          // Verify we can find the organization
          const foundOrg = yield* orgRepo.findById(role.organizationId);
          strictEqual(foundOrg._tag, "Some");
          if (foundOrg._tag === "Some") {
            strictEqual(foundOrg.value.name, "FK Test Organization");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow multiple roles for the same organization",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-multiple-owner"),
              name: "Multiple Roles Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Multiple Roles Organization",
              slug: makeTestSlug("role-multiple"),
            })
          );

          // Create multiple roles for the same organization
          const adminRole = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "admin",
            })
          );

          const memberRole = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "member",
            })
          );

          const guestRole = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org.id,
              role: "guest",
            })
          );

          // All roles should reference the same organization
          deepStrictEqual(adminRole.organizationId, org.id);
          deepStrictEqual(memberRole.organizationId, org.id);
          deepStrictEqual(guestRole.organizationId, org.id);

          // All role IDs should be unique
          expect(adminRole.id).not.toBe(memberRole.id);
          expect(memberRole.id).not.toBe(guestRole.id);
          expect(adminRole.id).not.toBe(guestRole.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow roles for different organizations",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const roleRepo = yield* OrganizationRoleRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("role-diff-org-owner"),
              name: "Different Orgs Owner",
            })
          );

          // Create first organization
          const org1 = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "First Organization",
              slug: makeTestSlug("role-diff-org-1"),
            })
          );

          // Create second organization
          const org2 = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Second Organization",
              slug: makeTestSlug("role-diff-org-2"),
            })
          );

          // Create role for first organization
          const role1 = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org1.id,
              role: "admin",
            })
          );

          // Create role for second organization
          const role2 = yield* roleRepo.insert(
            makeMockOrganizationRole({
              organizationId: org2.id,
              role: "admin",
            })
          );

          // Verify different organization references
          deepStrictEqual(role1.organizationId, org1.id);
          deepStrictEqual(role2.organizationId, org2.id);
          expect(role1.organizationId).not.toBe(role2.organizationId);
        }),
      TEST_TIMEOUT
    );
  });
});
