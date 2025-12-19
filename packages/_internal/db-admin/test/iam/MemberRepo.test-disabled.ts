import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { MemberRepo, OrganizationRepo, UserRepo } from "@beep/iam-infra/adapters/repositories";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { Organization, User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as DateTime from "effect/DateTime";
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

/**
 * Helper to create a mock member for insert operations.
 * Requires userId and organizationId since they are foreign key dependencies.
 */
const makeMockMember = (overrides: {
  userId: SharedEntityIds.UserId.Type;
  organizationId: SharedEntityIds.OrganizationId.Type;
  role?: "admin" | "member" | "owner";
  status?: "active" | "inactive" | "offline" | "suspended" | "deleted" | "invited";
}) =>
  Entities.Member.Model.jsonCreate.make({
    userId: overrides.userId,
    organizationId: overrides.organizationId,
    ...(overrides.role !== undefined ? { role: overrides.role } : {}),
    ...(overrides.status !== undefined ? { status: overrides.status } : {}),
  });

describe("MemberRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert member and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user (FK dependency for organization)
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-insert-owner"),
              name: "Organization Owner",
            })
          );

          // Create member user (FK dependency for member)
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-insert-user"),
              name: "Member User",
            })
          );

          // Create organization (FK dependency for member)
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Member Test Organization",
              slug: makeTestSlug("member-insert"),
            })
          );

          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
            role: "member",
            status: "active",
          });
          const inserted = yield* memberRepo.insert(mockedMember);

          // Verify schema conformance
          assertTrue(S.is(Entities.Member.Model)(inserted));

          // Verify fields
          deepStrictEqual(inserted.userId, memberUser.id);
          deepStrictEqual(inserted.organizationId, org.id);
          strictEqual(inserted.role, "member");
          strictEqual(inserted.status, "active");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted member",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-unique-owner"),
              name: "Unique ID Owner",
            })
          );

          // Create two member users
          const memberUser1 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-unique-user-1"),
              name: "Member User 1",
            })
          );

          const memberUser2 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-unique-user-2"),
              name: "Member User 2",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Unique Member Organization",
              slug: makeTestSlug("member-unique"),
            })
          );

          const member1 = yield* memberRepo.insert(
            makeMockMember({
              userId: memberUser1.id,
              organizationId: org.id,
            })
          );
          const member2 = yield* memberRepo.insert(
            makeMockMember({
              userId: memberUser2.id,
              organizationId: org.id,
            })
          );

          // IDs should be different
          expect(member1.id).not.toBe(member2.id);

          // Both should be valid EntityId format (member__uuid)
          expect(member1.id).toMatch(/^member__[0-9a-f-]+$/);
          expect(member2.id).toMatch(/^member__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert member without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-void-owner"),
              name: "InsertVoid Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-void-user"),
              name: "InsertVoid Member User",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "InsertVoid Organization",
              slug: makeTestSlug("member-void"),
            })
          );

          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
          });

          // insertVoid returns void
          const result = yield* memberRepo.insertVoid(mockedMember);
          strictEqual(result, undefined);

          // Verify the member was actually persisted by attempting insert again.
          // A duplicate userId+organizationId should fail, proving the first insert worked.
          const duplicateResult = yield* Effect.either(memberRepo.insertVoid(mockedMember));

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
      "should return Some when member exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-find-some-owner"),
              name: "FindById Some Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-find-some-user"),
              name: "FindById Some Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "FindById Some Organization",
              slug: makeTestSlug("member-find-some"),
            })
          );

          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
            role: "admin",
            status: "active",
          });
          const inserted = yield* memberRepo.insert(mockedMember);

          const found = yield* memberRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            deepStrictEqual(found.value.userId, memberUser.id);
            deepStrictEqual(found.value.organizationId, org.id);
            strictEqual(found.value.role, "admin");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when member does not exist",
      () =>
        Effect.gen(function* () {
          const memberRepo = yield* MemberRepo;

          // Use a valid MemberId format that doesn't exist (EntityId format: member__uuid)
          const nonExistentId = "member__00000000-0000-0000-0000-000000000000";
          const result = yield* memberRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete member entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-find-complete-owner"),
              name: "Complete Member Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-find-complete-user"),
              name: "Complete Member User",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Complete Member Organization",
              slug: makeTestSlug("member-find-complete"),
            })
          );

          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
          });
          const inserted = yield* memberRepo.insert(mockedMember);
          const found = yield* memberRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("userId");
            expect(found.value).toHaveProperty("organizationId");
            expect(found.value).toHaveProperty("role");
            expect(found.value).toHaveProperty("status");
            expect(found.value).toHaveProperty("lastActiveAt");
            expect(found.value).toHaveProperty("permissions");
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
      "should update member role and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-role-owner"),
              name: "Update Role Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-role-user"),
              name: "Update Role Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Role Organization",
              slug: makeTestSlug("member-update-role"),
            })
          );

          // Setup: create member with initial role
          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
            role: "member",
          });
          const inserted = yield* memberRepo.insert(mockedMember);

          strictEqual(inserted.role, "member");

          // Action: update role to admin
          const updated = yield* memberRepo.update({
            ...inserted,
            role: "admin",
          });

          // Verify returned entity has updated role
          strictEqual(updated.role, "admin");
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.userId, memberUser.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update member status",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-status-owner"),
              name: "Update Status Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-status-user"),
              name: "Update Status Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Status Organization",
              slug: makeTestSlug("member-update-status"),
            })
          );

          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
            status: "inactive",
          });
          const inserted = yield* memberRepo.insert(mockedMember);

          strictEqual(inserted.status, "inactive");

          // Update to active
          const updated = yield* memberRepo.update({
            ...inserted,
            status: "active",
          });

          strictEqual(updated.status, "active");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update to owner role",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-owner-owner"),
              name: "Update Owner Role Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-owner-user"),
              name: "Update Owner Role Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Owner Role Organization",
              slug: makeTestSlug("member-update-owner"),
            })
          );

          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
            role: "admin",
          });
          const inserted = yield* memberRepo.insert(mockedMember);

          strictEqual(inserted.role, "admin");

          const updated = yield* memberRepo.update({
            ...inserted,
            role: "owner",
          });

          strictEqual(updated.role, "owner");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update to suspended status",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-suspended-owner"),
              name: "Update Suspended Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-suspended-user"),
              name: "Update Suspended Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Suspended Organization",
              slug: makeTestSlug("member-update-suspended"),
            })
          );

          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
            status: "active",
          });
          const inserted = yield* memberRepo.insert(mockedMember);

          strictEqual(inserted.status, "active");

          const updated = yield* memberRepo.update({
            ...inserted,
            status: "suspended",
          });

          strictEqual(updated.status, "suspended");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-persist-owner"),
              name: "Persist Test Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-persist-user"),
              name: "Persist Test Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Persist Test Organization",
              slug: makeTestSlug("member-update-persist"),
            })
          );

          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
            role: "member",
          });
          const inserted = yield* memberRepo.insert(mockedMember);

          yield* memberRepo.update({
            ...inserted,
            role: "admin",
          });

          // Verify by fetching fresh
          const found = yield* memberRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.role, "admin");
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
      "should update member without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-updatevoid-owner"),
              name: "UpdateVoid Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-updatevoid-user"),
              name: "UpdateVoid Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "UpdateVoid Organization",
              slug: makeTestSlug("member-updatevoid"),
            })
          );

          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
            role: "member",
          });
          const inserted = yield* memberRepo.insert(mockedMember);

          // updateVoid returns void
          const result = yield* memberRepo.updateVoid({
            ...inserted,
            role: "admin",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* memberRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.role, "admin");
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
      "should delete existing member",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-delete-owner"),
              name: "Delete Test Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-delete-user"),
              name: "Delete Test Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Delete Test Organization",
              slug: makeTestSlug("member-delete"),
            })
          );

          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
          });
          const inserted = yield* memberRepo.insert(mockedMember);

          // Verify member exists
          const beforeDelete = yield* memberRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* memberRepo.delete(inserted.id);

          // Verify member no longer exists
          const afterDelete = yield* memberRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent member",
      () =>
        Effect.gen(function* () {
          const memberRepo = yield* MemberRepo;

          // Deleting a non-existent ID should not throw (EntityId format: member__uuid)
          const nonExistentId = "member__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(memberRepo.delete(nonExistentId));

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
      "should insert multiple members without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-many-owner"),
              name: "Batch Insert Owner",
            })
          );

          // Create three member users
          const memberUser1 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-many-user-1"),
              name: "Batch Member 1",
            })
          );

          const memberUser2 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-many-user-2"),
              name: "Batch Member 2",
            })
          );

          const memberUser3 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-many-user-3"),
              name: "Batch Member 3",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Batch Insert Organization",
              slug: makeTestSlug("member-many"),
            })
          );

          const members = [
            makeMockMember({
              userId: memberUser1.id,
              organizationId: org.id,
              role: "member",
            }),
            makeMockMember({
              userId: memberUser2.id,
              organizationId: org.id,
              role: "admin",
            }),
            makeMockMember({
              userId: memberUser3.id,
              organizationId: org.id,
              role: "member",
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* memberRepo.insertManyVoid(
            members as unknown as readonly [
              typeof Entities.Member.Model.insert.Type,
              ...(typeof Entities.Member.Model.insert.Type)[],
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
      "should fail with DatabaseError on duplicate userId+organizationId (unique constraint violation)",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-duplicate-owner"),
              name: "Duplicate Constraint Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-duplicate-user"),
              name: "Duplicate Constraint Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Duplicate Constraint Organization",
              slug: makeTestSlug("member-duplicate"),
            })
          );

          const member1 = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
            role: "member",
          });
          const member2 = makeMockMember({
            userId: memberUser.id, // Same userId
            organizationId: org.id, // Same organizationId
            role: "admin", // Different role doesn't matter
          });

          // First insert should succeed
          yield* memberRepo.insert(member1);

          // Second insert with same userId+organizationId should fail
          const result = yield* Effect.either(memberRepo.insert(member2));

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
      "should die when updating non-existent member",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-nonexistent-owner"),
              name: "Update Nonexistent Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-update-nonexistent-user"),
              name: "Update Nonexistent Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Nonexistent Organization",
              slug: makeTestSlug("member-update-nonexistent"),
            })
          );

          // First create a valid member to get a proper structure for update
          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
          });
          const inserted = yield* memberRepo.insert(mockedMember);

          // Delete the member
          yield* memberRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) member
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            memberRepo.update({
              ...inserted,
              role: "admin",
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
          const memberRepo = yield* MemberRepo;

          // Setup: create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-crud-owner"),
              name: "CRUD Workflow Owner",
            })
          );

          // Setup: create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-crud-user"),
              name: "CRUD Workflow Member",
            })
          );

          // Setup: create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "CRUD Workflow Organization",
              slug: makeTestSlug("member-crud"),
            })
          );

          // CREATE
          const mockedMember = makeMockMember({
            userId: memberUser.id,
            organizationId: org.id,
            role: "member",
            status: "invited",
          });
          const created = yield* memberRepo.insert(mockedMember);
          assertTrue(S.is(Entities.Member.Model)(created));

          // READ
          const read = yield* memberRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.role, "member");
            strictEqual(read.value.status, "invited");
          }

          // UPDATE
          const updated = yield* memberRepo.update({
            ...created,
            role: "admin",
            status: "active",
          });
          strictEqual(updated.role, "admin");
          strictEqual(updated.status, "active");

          // Verify update persisted
          const readAfterUpdate = yield* memberRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.role, "admin");
            strictEqual(readAfterUpdate.value.status, "active");
          }

          // DELETE
          yield* memberRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* memberRepo.findById(created.id);
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
      "should handle optional lastActiveAt field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-no-lastactive-owner"),
              name: "No LastActive Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-no-lastactive-user"),
              name: "No LastActive Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "No LastActive Organization",
              slug: makeTestSlug("member-no-lastactive"),
            })
          );

          // Create without lastActiveAt
          const memberWithoutLastActive = yield* memberRepo.insert(
            makeMockMember({
              userId: memberUser.id,
              organizationId: org.id,
            })
          );

          const now = yield* DateTime.now.pipe(Effect.map(DateTime.toUtc));
          // lastActiveAt should be None (optional fields are Option types)
          strictEqual(memberWithoutLastActive.lastActiveAt._tag, "None");

          // Update with lastActiveAt

          const updated = yield* memberRepo.update({
            ...memberWithoutLastActive,
            lastActiveAt: O.some(now),
          });

          strictEqual(updated.lastActiveAt._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional permissions field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-no-permissions-owner"),
              name: "No Permissions Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-no-permissions-user"),
              name: "No Permissions Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "No Permissions Organization",
              slug: makeTestSlug("member-no-permissions"),
            })
          );

          const member = yield* memberRepo.insert(
            makeMockMember({
              userId: memberUser.id,
              organizationId: org.id,
            })
          );

          // permissions should be None by default
          strictEqual(member.permissions._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle default role value",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-default-role-owner"),
              name: "Default Role Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-default-role-user"),
              name: "Default Role Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Default Role Organization",
              slug: makeTestSlug("member-default-role"),
            })
          );

          // Create without explicitly setting role - should use default
          const member = yield* memberRepo.insert(
            makeMockMember({
              userId: memberUser.id,
              organizationId: org.id,
            })
          );

          // Default role should be "member"
          strictEqual(member.role, "member");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle default status value",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-default-status-owner"),
              name: "Default Status Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-default-status-user"),
              name: "Default Status Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Default Status Organization",
              slug: makeTestSlug("member-default-status"),
            })
          );

          // Create without explicitly setting status - should use default
          const member = yield* memberRepo.insert(
            makeMockMember({
              userId: memberUser.id,
              organizationId: org.id,
            })
          );

          // Default status should be "inactive"
          strictEqual(member.status, "inactive");
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FOREIGN KEY RELATIONSHIP TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("foreign key relationships", (it) => {
    it.effect(
      "should maintain userId reference to existing user",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-fk-user-owner"),
              name: "FK User Test Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-fk-user-user"),
              name: "FK User Test Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "FK User Test Organization",
              slug: makeTestSlug("member-fk-user"),
            })
          );

          const member = yield* memberRepo.insert(
            makeMockMember({
              userId: memberUser.id,
              organizationId: org.id,
            })
          );

          // Verify the userId matches the created user
          deepStrictEqual(member.userId, memberUser.id);

          // Verify we can find the user
          const foundUser = yield* userRepo.findById(member.userId);
          strictEqual(foundUser._tag, "Some");
          if (foundUser._tag === "Some") {
            strictEqual(foundUser.value.name, "FK User Test Member");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should maintain organizationId reference to existing organization",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-fk-org-owner"),
              name: "FK Org Test Owner",
            })
          );

          // Create member user
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-fk-org-user"),
              name: "FK Org Test Member",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "FK Org Test Organization",
              slug: makeTestSlug("member-fk-org"),
            })
          );

          const member = yield* memberRepo.insert(
            makeMockMember({
              userId: memberUser.id,
              organizationId: org.id,
            })
          );

          // Verify the organizationId matches the created organization
          deepStrictEqual(member.organizationId, org.id);

          // Verify we can find the organization
          const foundOrg = yield* orgRepo.findById(member.organizationId);
          strictEqual(foundOrg._tag, "Some");
          if (foundOrg._tag === "Some") {
            strictEqual(foundOrg.value.name, "FK Org Test Organization");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow same user to be member of multiple organizations",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const memberRepo = yield* MemberRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-multi-org-owner"),
              name: "Multi Org Owner",
            })
          );

          // Create member user (will be member of multiple orgs)
          const memberUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("member-multi-org-user"),
              name: "Multi Org Member",
            })
          );

          // Create two organizations
          const org1 = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Multi Org 1",
              slug: makeTestSlug("member-multi-org-1"),
            })
          );

          const org2 = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Multi Org 2",
              slug: makeTestSlug("member-multi-org-2"),
            })
          );

          // Add same user as member to both organizations
          const member1 = yield* memberRepo.insert(
            makeMockMember({
              userId: memberUser.id,
              organizationId: org1.id,
              role: "member",
            })
          );

          const member2 = yield* memberRepo.insert(
            makeMockMember({
              userId: memberUser.id,
              organizationId: org2.id,
              role: "admin",
            })
          );

          // Both memberships should exist with different IDs
          expect(member1.id).not.toBe(member2.id);
          deepStrictEqual(member1.userId, memberUser.id);
          deepStrictEqual(member2.userId, memberUser.id);
          deepStrictEqual(member1.organizationId, org1.id);
          deepStrictEqual(member2.organizationId, org2.id);
          strictEqual(member1.role, "member");
          strictEqual(member2.role, "admin");
        }),
      TEST_TIMEOUT
    );
  });
});
