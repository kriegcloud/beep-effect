import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { InvitationRepo, OrganizationRepo, UserRepo } from "@beep/iam-server/adapters/repositories";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { Organization, User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as DateTime from "effect/DateTime";
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
 * Returns Redacted<Email> for use with models that use BS.Email (like User).
 */
const makeTestEmail = (prefix: string): BS.Email.Type => BS.Email.make(`${prefix}-${crypto.randomUUID()}@example.com`);

/**
 * Helper to create a unique plain email for Invitation model.
 * Uses EmailBase (plain branded string) since M.Sensitive(EmailBase) expects the non-Redacted type.
 */
const makeTestEmailPlain = (prefix: string): BS.EmailBase.Type =>
  BS.EmailBase.make(`${prefix}-${crypto.randomUUID()}@example.com`);

/**
 * Helper to create a unique slug to avoid conflicts between tests.
 */
const makeTestSlug = (prefix: string): BS.Slug.Type => BS.Slug.make(`${prefix}-${crypto.randomUUID().slice(0, 8)}`);

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
const makeMockOrganization = (overrides: {
  ownerUserId: SharedEntityIds.UserId.Type;
  name?: string;
  slug?: BS.Slug.Type;
}) =>
  Organization.Model.jsonCreate.make({
    ownerUserId: overrides.ownerUserId,
    name: overrides.name ?? "Test Organization",
    slug: overrides.slug ?? makeTestSlug("test-org"),
  });

/**
 * Helper to create a future expiration date for invitations.
 */
const makeFutureExpiresAt = (): DateTime.Utc => {
  const now = DateTime.unsafeNow();
  return DateTime.add(now, { days: 7 });
};

/**
 * Helper to create a mock invitation for insert operations.
 * Requires inviterId since it's a foreign key dependency.
 * Note: organizationId and role use FieldOptionOmittable, so they expect Option types when provided.
 */
const makeMockInvitation = (overrides: {
  inviterId: SharedEntityIds.UserId.Type;
  email?: BS.EmailBase.Type;
  expiresAt?: DateTime.Utc;
  organizationId?: SharedEntityIds.OrganizationId.Type;
  role?: string;
  status?: "pending" | "accepted" | "rejected" | "cancelled";
}) =>
  Entities.Invitation.Model.insert.make({
    inviterId: overrides.inviterId,
    email: overrides.email ?? makeTestEmailPlain("invitee"),
    expiresAt: overrides.expiresAt ?? makeFutureExpiresAt(),
    ...(overrides.organizationId !== undefined ? { organizationId: O.some(overrides.organizationId) } : {}),
    ...(overrides.role !== undefined ? { role: O.some(overrides.role) } : {}),
    ...(overrides.status !== undefined ? { status: overrides.status } : {}),
  });

describe("InvitationRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert invitation and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // First create inviter user (FK dependency)
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-insert-inviter"),
              name: "Inviter User",
            })
          );

          const inviteeEmail = makeTestEmailPlain("invitation-insert-invitee");
          const expiresAt = makeFutureExpiresAt();
          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: inviteeEmail,
            expiresAt,
          });
          const inserted = yield* invitationRepo.insert(mockedInvitation);

          // Verify schema conformance
          assertTrue(S.is(Entities.Invitation.Model)(inserted));

          // Verify fields (email is plain BS.EmailBase.Type since M.Sensitive doesn't wrap in Redacted)
          deepStrictEqual(inserted.email, inviteeEmail);
          deepStrictEqual(inserted.inviterId, inviter.id);

          // Verify default values are applied
          strictEqual(inserted.status, "pending");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted invitation",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-unique-inviter"),
              name: "Unique ID Inviter",
            })
          );

          const invitation1 = yield* invitationRepo.insert(
            makeMockInvitation({
              inviterId: inviter.id,
              email: makeTestEmailPlain("invitation-unique-1"),
            })
          );
          const invitation2 = yield* invitationRepo.insert(
            makeMockInvitation({
              inviterId: inviter.id,
              email: makeTestEmailPlain("invitation-unique-2"),
            })
          );

          // IDs should be different
          expect(invitation1.id).not.toBe(invitation2.id);

          // Both should be valid EntityId format (invitation__uuid)
          expect(invitation1.id).toMatch(/^invitation__[0-9a-f-]+$/);
          expect(invitation2.id).toMatch(/^invitation__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert invitation without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-void-inviter"),
              name: "InsertVoid Inviter",
            })
          );

          const inviteeEmail = makeTestEmailPlain("invitation-void-invitee");
          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: inviteeEmail,
          });

          // insertVoid returns void
          const result = yield* invitationRepo.insertVoid(mockedInvitation);
          strictEqual(result, undefined);

          // Verify the invitation was actually persisted by attempting insert again.
          // A duplicate email + inviter should fail, proving the first insert worked.
          const duplicateResult = yield* Effect.either(invitationRepo.insertVoid(mockedInvitation));

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
      "should return Some when invitation exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-find-some-inviter"),
              name: "FindById Some Inviter",
            })
          );

          const inviteeEmail = makeTestEmailPlain("invitation-find-some-invitee");
          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: inviteeEmail,
          });
          const inserted = yield* invitationRepo.insert(mockedInvitation);

          const found = yield* invitationRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            deepStrictEqual(found.value.email, inviteeEmail);
            deepStrictEqual(found.value.inviterId, inviter.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when invitation does not exist",
      () =>
        Effect.gen(function* () {
          const invitationRepo = yield* InvitationRepo;

          // Use a valid InvitationId format that doesn't exist (EntityId format: invitation__uuid)
          const nonExistentId = "invitation__00000000-0000-0000-0000-000000000000";
          const result = yield* invitationRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete invitation entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-find-complete-inviter"),
              name: "Complete Invitation Inviter",
            })
          );

          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: makeTestEmailPlain("invitation-find-complete-invitee"),
          });
          const inserted = yield* invitationRepo.insert(mockedInvitation);
          const found = yield* invitationRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("email");
            expect(found.value).toHaveProperty("inviterId");
            expect(found.value).toHaveProperty("status");
            expect(found.value).toHaveProperty("expiresAt");
            expect(found.value).toHaveProperty("role");
            expect(found.value).toHaveProperty("teamId");
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
      "should update invitation status and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-update-status-inviter"),
              name: "Update Status Inviter",
            })
          );

          // Setup: create invitation
          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: makeTestEmailPlain("invitation-update-status-invitee"),
          });
          const inserted = yield* invitationRepo.insert(mockedInvitation);

          // Initially should be "pending" (default)
          strictEqual(inserted.status, "pending");

          // Action: update - spread existing entity and override specific fields
          const updated = yield* invitationRepo.update({
            ...inserted,
            status: "accepted",
          });

          // Verify returned entity has updated status
          strictEqual(updated.status, "accepted");
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.inviterId, inviter.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update invitation role",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-update-role-inviter"),
              name: "Update Role Inviter",
            })
          );

          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: makeTestEmailPlain("invitation-update-role-invitee"),
          });
          const inserted = yield* invitationRepo.insert(mockedInvitation);

          // Initially role should be None (optional field)
          strictEqual(inserted.role._tag, "None");

          // Update with role
          const updated = yield* invitationRepo.update({
            ...inserted,
            role: O.some("admin"),
          });

          strictEqual(updated.role._tag, "Some");
          strictEqual(
            O.getOrElse(updated.role, () => ""),
            "admin"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update invitation status to rejected",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-update-rejected-inviter"),
              name: "Update Rejected Inviter",
            })
          );

          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: makeTestEmailPlain("invitation-update-rejected-invitee"),
          });
          const inserted = yield* invitationRepo.insert(mockedInvitation);

          strictEqual(inserted.status, "pending");

          const updated = yield* invitationRepo.update({
            ...inserted,
            status: "rejected",
          });

          strictEqual(updated.status, "rejected");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update invitation status to cancelled",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-update-cancelled-inviter"),
              name: "Update Cancelled Inviter",
            })
          );

          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: makeTestEmailPlain("invitation-update-cancelled-invitee"),
          });
          const inserted = yield* invitationRepo.insert(mockedInvitation);

          strictEqual(inserted.status, "pending");

          const updated = yield* invitationRepo.update({
            ...inserted,
            status: "cancelled",
          });

          strictEqual(updated.status, "cancelled");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-update-persist-inviter"),
              name: "Persist Test Inviter",
            })
          );

          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: makeTestEmailPlain("invitation-update-persist-invitee"),
          });
          const inserted = yield* invitationRepo.insert(mockedInvitation);

          yield* invitationRepo.update({
            ...inserted,
            status: "accepted",
          });

          // Verify by fetching fresh
          const found = yield* invitationRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.status, "accepted");
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
      "should update invitation without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-updatevoid-inviter"),
              name: "UpdateVoid Inviter",
            })
          );

          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: makeTestEmailPlain("invitation-updatevoid-invitee"),
          });
          const inserted = yield* invitationRepo.insert(mockedInvitation);

          // updateVoid returns void
          const result = yield* invitationRepo.updateVoid({
            ...inserted,
            status: "accepted",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* invitationRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.status, "accepted");
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
      "should delete existing invitation",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-delete-inviter"),
              name: "Delete Test Inviter",
            })
          );

          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: makeTestEmailPlain("invitation-delete-invitee"),
          });
          const inserted = yield* invitationRepo.insert(mockedInvitation);

          // Verify invitation exists
          const beforeDelete = yield* invitationRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* invitationRepo.delete(inserted.id);

          // Verify invitation no longer exists
          const afterDelete = yield* invitationRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent invitation",
      () =>
        Effect.gen(function* () {
          const invitationRepo = yield* InvitationRepo;

          // Deleting a non-existent ID should not throw (EntityId format: invitation__uuid)
          const nonExistentId = "invitation__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(invitationRepo.delete(nonExistentId));

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
      "should insert multiple invitations without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-many-inviter"),
              name: "Batch Insert Inviter",
            })
          );

          const invitations = [
            makeMockInvitation({
              inviterId: inviter.id,
              email: makeTestEmailPlain("invitation-batch-1"),
            }),
            makeMockInvitation({
              inviterId: inviter.id,
              email: makeTestEmailPlain("invitation-batch-2"),
            }),
            makeMockInvitation({
              inviterId: inviter.id,
              email: makeTestEmailPlain("invitation-batch-3"),
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* invitationRepo.insertManyVoid(
            invitations as unknown as readonly [
              typeof Entities.Invitation.Model.insert.Type,
              ...(typeof Entities.Invitation.Model.insert.Type)[],
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
      "should fail with DatabaseError on duplicate invitation (unique constraint violation)",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-duplicate-inviter"),
              name: "Duplicate Inviter",
            })
          );

          const inviteeEmail = makeTestEmailPlain("invitation-duplicate-invitee");
          const invitation1 = makeMockInvitation({
            inviterId: inviter.id,
            email: inviteeEmail,
          });
          const invitation2 = makeMockInvitation({
            inviterId: inviter.id,
            email: inviteeEmail, // Same email as invitation1
          });

          // First insert should succeed
          yield* invitationRepo.insert(invitation1);

          // Second insert with same email should fail
          const result = yield* Effect.either(invitationRepo.insert(invitation2));

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
      "should die when updating non-existent invitation",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // First create a valid invitation to get a proper structure for update
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-update-nonexistent-inviter"),
              name: "Update Nonexistent Inviter",
            })
          );

          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: makeTestEmailPlain("invitation-update-nonexistent-invitee"),
          });
          const inserted = yield* invitationRepo.insert(mockedInvitation);

          // Delete the invitation
          yield* invitationRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) invitation
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            invitationRepo.update({
              ...inserted,
              status: "accepted",
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
          const invitationRepo = yield* InvitationRepo;

          // Setup: create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-crud-inviter"),
              name: "CRUD Workflow Inviter",
            })
          );

          // CREATE
          const inviteeEmail = makeTestEmailPlain("invitation-crud-invitee");
          const mockedInvitation = makeMockInvitation({
            inviterId: inviter.id,
            email: inviteeEmail,
          });
          const created = yield* invitationRepo.insert(mockedInvitation);
          assertTrue(S.is(Entities.Invitation.Model)(created));

          // READ
          const read = yield* invitationRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            deepStrictEqual(read.value.email, inviteeEmail);
            strictEqual(read.value.status, "pending");
          }

          // UPDATE
          const updated = yield* invitationRepo.update({
            ...created,
            status: "accepted",
            role: O.some("member"),
          });
          strictEqual(updated.status, "accepted");
          strictEqual(updated.role._tag, "Some");

          // Verify update persisted
          const readAfterUpdate = yield* invitationRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.status, "accepted");
            strictEqual(
              O.getOrElse(readAfterUpdate.value.role, () => ""),
              "member"
            );
          }

          // DELETE
          yield* invitationRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* invitationRepo.findById(created.id);
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
      "should handle optional role field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-no-role-inviter"),
              name: "No Role Inviter",
            })
          );

          // Create without role
          const invitationWithoutRole = yield* invitationRepo.insert(
            makeMockInvitation({
              inviterId: inviter.id,
              email: makeTestEmailPlain("invitation-no-role-invitee"),
            })
          );

          // role should be None (optional fields are Option types)
          strictEqual(invitationWithoutRole.role._tag, "None");

          // Update with role
          const updated = yield* invitationRepo.update({
            ...invitationWithoutRole,
            role: O.some("admin"),
          });

          strictEqual(updated.role._tag, "Some");
          strictEqual(
            O.getOrElse(updated.role, () => ""),
            "admin"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional teamId field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-no-team-inviter"),
              name: "No Team Inviter",
            })
          );

          const invitation = yield* invitationRepo.insert(
            makeMockInvitation({
              inviterId: inviter.id,
              email: makeTestEmailPlain("invitation-no-team-invitee"),
            })
          );

          // teamId should be None (optional)
          strictEqual(invitation.teamId._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional organizationId field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-org-inviter"),
              name: "Org Inviter",
            })
          );

          // Create invitation without organization
          const invitationWithoutOrg = yield* invitationRepo.insert(
            makeMockInvitation({
              inviterId: inviter.id,
              email: makeTestEmailPlain("invitation-no-org-invitee"),
            })
          );

          // organizationId should be None
          strictEqual(invitationWithoutOrg.organizationId._tag, "None");

          // Create an organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: inviter.id,
              name: "Test Org for Invitation",
              slug: makeTestSlug("invitation-test-org"),
            })
          );

          // Update with organizationId
          const updated = yield* invitationRepo.update({
            ...invitationWithoutOrg,
            organizationId: O.some(org.id),
          });

          strictEqual(updated.organizationId._tag, "Some");
          deepStrictEqual(O.getOrUndefined(updated.organizationId), org.id);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FOREIGN KEY RELATIONSHIP TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("foreign key relationships", (it) => {
    it.effect(
      "should maintain inviterId reference to existing user",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-fk-inviter"),
              name: "FK Test Inviter",
            })
          );

          const invitation = yield* invitationRepo.insert(
            makeMockInvitation({
              inviterId: inviter.id,
              email: makeTestEmailPlain("invitation-fk-invitee"),
            })
          );

          // Verify the inviterId matches the created user
          deepStrictEqual(invitation.inviterId, inviter.id);

          // Verify we can find the inviter
          const foundInviter = yield* userRepo.findById(invitation.inviterId);
          strictEqual(foundInviter._tag, "Some");
          if (foundInviter._tag === "Some") {
            strictEqual(foundInviter.value.name, "FK Test Inviter");
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
          const invitationRepo = yield* InvitationRepo;

          // Create inviter user
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-fk-org-inviter"),
              name: "FK Org Test Inviter",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: inviter.id,
              name: "FK Test Organization",
              slug: makeTestSlug("fk-test-org"),
            })
          );

          // Create invitation with organization reference
          const inviteeEmail = makeTestEmailPlain("invitation-fk-org-invitee");
          const mockedInvitation = Entities.Invitation.Model.insert.make({
            inviterId: inviter.id,
            email: inviteeEmail,
            expiresAt: makeFutureExpiresAt(),
            organizationId: org.id,
          });

          const invitation = yield* invitationRepo.insert(mockedInvitation);

          // Verify the organizationId reference
          strictEqual(invitation.organizationId._tag, "Some");
          deepStrictEqual(O.getOrUndefined(invitation.organizationId), org.id);

          // Verify we can find the organization
          const foundOrg = yield* orgRepo.findById(org.id);
          strictEqual(foundOrg._tag, "Some");
          if (foundOrg._tag === "Some") {
            strictEqual(foundOrg.value.name, "FK Test Organization");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow invitation workflow from pending to accepted",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const invitationRepo = yield* InvitationRepo;

          // Create inviter (org admin)
          const inviter = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("invitation-workflow-inviter"),
              name: "Workflow Inviter",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: inviter.id,
              name: "Workflow Test Organization",
              slug: makeTestSlug("workflow-org"),
            })
          );

          // Create invitation
          const inviteeEmail = makeTestEmailPlain("invitation-workflow-invitee");
          const invitation = yield* invitationRepo.insert(
            Entities.Invitation.Model.insert.make({
              inviterId: inviter.id,
              email: inviteeEmail,
              expiresAt: makeFutureExpiresAt(),
              organizationId: org.id,
              role: O.some("member"),
            })
          );

          // Verify initial state
          strictEqual(invitation.status, "pending");
          deepStrictEqual(O.getOrUndefined(invitation.organizationId), org.id);
          strictEqual(
            O.getOrElse(invitation.role, () => ""),
            "member"
          );

          // Simulate acceptance
          const accepted = yield* invitationRepo.update({
            ...invitation,
            status: "accepted",
          });

          strictEqual(accepted.status, "accepted");

          // Verify persistence
          const found = yield* invitationRepo.findById(invitation.id);
          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.status, "accepted");
          }
        }),
      TEST_TIMEOUT
    );
  });
});
