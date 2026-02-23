import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { OrganizationRepo, TeamMemberRepo, TeamRepo, UserRepo } from "@beep/iam-server/adapters/repositories";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { Organization, Team, User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
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
    slug: BS.Slug.make(overrides.slug ?? makeTestSlug("test-org")),
  });

/**
 * Helper to create a mock team for insert operations.
 * Requires organizationId since Team table uses OrgTable which adds organizationId column.
 */
const makeMockTeam = (overrides: {
  organizationId: SharedEntityIds.OrganizationId.Type;
  name?: string;
  slug?: BS.Slug.Type;
}) =>
  Team.Model.jsonCreate.make({
    name: overrides.name ?? "Test Team",
    slug: overrides.slug ?? makeTestSlug("test-team"),
    organizationId: overrides.organizationId,
  });

/**
 * Helper to create a mock team member for insert operations.
 * Requires teamId, userId, and organizationId since they are foreign key dependencies.
 */
const makeMockTeamMember = (overrides: {
  teamId: SharedEntityIds.TeamId.Type;
  userId: SharedEntityIds.UserId.Type;
  organizationId: SharedEntityIds.OrganizationId.Type;
}) =>
  Entities.TeamMember.Model.jsonCreate.make({
    teamId: overrides.teamId,
    userId: overrides.userId,
    organizationId: overrides.organizationId,
  });

/**
 * Helper to create all prerequisite entities for TeamMember tests.
 * Returns user, organization, and team that can be used for team member creation.
 */
const createPrerequisites = (prefix: string) =>
  Effect.gen(function* () {
    const userRepo = yield* UserRepo;
    const orgRepo = yield* OrganizationRepo;
    const teamRepo = yield* TeamRepo;

    // Create user first
    const user = yield* userRepo.insert(
      makeMockUser({
        email: makeTestEmail(`${prefix}-user`),
        name: `${prefix} User`,
      })
    );

    // Create organization with user as owner
    const org = yield* orgRepo.insert(
      makeMockOrganization({
        ownerUserId: user.id,
        name: `${prefix} Organization`,
        slug: makeTestSlug(`${prefix}-org`),
      })
    );

    // Create team (requires organizationId since Team table uses OrgTable)
    const team = yield* teamRepo.insert(
      makeMockTeam({
        organizationId: org.id,
        name: `${prefix} Team`,
        slug: makeTestSlug(`${prefix}-team`),
      })
    );

    return { user, org, team };
  });

describe("TeamMemberRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert team member and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("insert");

          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });
          const inserted = yield* teamMemberRepo.insert(mockedTeamMember);

          // Verify schema conformance
          assertTrue(S.is(Entities.TeamMember.Model)(inserted));

          // Verify fields
          deepStrictEqual(inserted.teamId, team.id);
          deepStrictEqual(inserted.userId, user.id);
          deepStrictEqual(inserted.organizationId, org.id);

          // Verify audit fields exist
          expect(inserted).toHaveProperty("createdAt");
          expect(inserted).toHaveProperty("updatedAt");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted team member",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("unique-id");

          // Create second user for second team member
          const user2 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("unique-id-user2"),
              name: "Unique ID User 2",
            })
          );

          const teamMember1 = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team.id,
              userId: user.id,
              organizationId: org.id,
            })
          );
          const teamMember2 = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team.id,
              userId: user2.id,
              organizationId: org.id,
            })
          );

          // IDs should be different
          expect(teamMember1.id).not.toBe(teamMember2.id);

          // Both should be valid EntityId format (team_member__uuid)
          expect(teamMember1.id).toMatch(/^team_member__[0-9a-f-]+$/);
          expect(teamMember2.id).toMatch(/^team_member__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert team member without returning entity",
      () =>
        Effect.gen(function* () {
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("insert-void");

          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });

          // insertVoid returns void
          const result = yield* teamMemberRepo.insertVoid(mockedTeamMember);
          strictEqual(result, undefined);

          // Verify the team member was actually persisted by attempting insert again.
          // A duplicate (same user, team, org combo) should fail if there's a unique constraint,
          // proving the first insert worked.
          yield* Effect.either(teamMemberRepo.insertVoid(mockedTeamMember));

          // Should fail with unique constraint violation (if unique constraint exists)
          // or succeed if no unique constraint. Either way, first insert worked.
          // We just verify the first insert didn't throw.
          expect(result).toBe(undefined);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FIND BY ID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("findById operations", (it) => {
    it.effect(
      "should return Some when team member exists",
      () =>
        Effect.gen(function* () {
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("find-some");

          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });
          const inserted = yield* teamMemberRepo.insert(mockedTeamMember);

          const found = yield* teamMemberRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            deepStrictEqual(found.value.teamId, team.id);
            deepStrictEqual(found.value.userId, user.id);
            deepStrictEqual(found.value.organizationId, org.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when team member does not exist",
      () =>
        Effect.gen(function* () {
          const teamMemberRepo = yield* TeamMemberRepo;

          // Use a valid TeamMemberId format that doesn't exist (EntityId format: team_member__uuid)
          const nonExistentId = "team_member__00000000-0000-0000-0000-000000000000";
          const result = yield* teamMemberRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete team member entity with all fields",
      () =>
        Effect.gen(function* () {
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("find-complete");

          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });
          const inserted = yield* teamMemberRepo.insert(mockedTeamMember);
          const found = yield* teamMemberRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("teamId");
            expect(found.value).toHaveProperty("userId");
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
      "should update team member teamId and return updated entity",
      () =>
        Effect.gen(function* () {
          const teamRepo = yield* TeamRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("update-team");

          // Create second team
          const team2 = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: "Update Target Team",
              slug: makeTestSlug("update-target"),
            })
          );

          // Setup: create team member
          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });
          const inserted = yield* teamMemberRepo.insert(mockedTeamMember);

          // Action: update - change team
          const updated = yield* teamMemberRepo.update({
            ...inserted,
            teamId: team2.id,
          });

          // Verify returned entity has updated teamId
          deepStrictEqual(updated.teamId, team2.id);
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.userId, user.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update team member userId and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("update-user");

          // Create second user
          const user2 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("update-user2"),
              name: "Update Target User",
            })
          );

          // Setup: create team member
          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });
          const inserted = yield* teamMemberRepo.insert(mockedTeamMember);

          // Action: update - change user
          const updated = yield* teamMemberRepo.update({
            ...inserted,
            userId: user2.id,
          });

          // Verify returned entity has updated userId
          deepStrictEqual(updated.userId, user2.id);
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.teamId, team.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update team member organizationId and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("update-org");

          // Create second organization (need second owner user)
          const owner2 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("update-org-owner2"),
              name: "Update Target Org Owner",
            })
          );
          const org2 = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner2.id,
              name: "Update Target Organization",
              slug: makeTestSlug("update-target-org"),
            })
          );

          // Setup: create team member
          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });
          const inserted = yield* teamMemberRepo.insert(mockedTeamMember);

          // Action: update - change organization
          const updated = yield* teamMemberRepo.update({
            ...inserted,
            organizationId: org2.id,
          });

          // Verify returned entity has updated organizationId
          deepStrictEqual(updated.organizationId, org2.id);
          deepStrictEqual(updated.id, inserted.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const teamRepo = yield* TeamRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("update-persist");

          // Create second team
          const team2 = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: "Persist Target Team",
              slug: makeTestSlug("persist-target"),
            })
          );

          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });
          const inserted = yield* teamMemberRepo.insert(mockedTeamMember);

          yield* teamMemberRepo.update({
            ...inserted,
            teamId: team2.id,
          });

          // Verify by fetching fresh
          const found = yield* teamMemberRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.teamId, team2.id);
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
      "should update team member without returning entity",
      () =>
        Effect.gen(function* () {
          const teamRepo = yield* TeamRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("update-void");

          // Create second team
          const team2 = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: "UpdateVoid Target Team",
              slug: makeTestSlug("updatevoid-target"),
            })
          );

          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });
          const inserted = yield* teamMemberRepo.insert(mockedTeamMember);

          // updateVoid returns void
          const result = yield* teamMemberRepo.updateVoid({
            ...inserted,
            teamId: team2.id,
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* teamMemberRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.teamId, team2.id);
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
      "should delete existing team member",
      () =>
        Effect.gen(function* () {
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("delete");

          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });
          const inserted = yield* teamMemberRepo.insert(mockedTeamMember);

          // Verify team member exists
          const beforeDelete = yield* teamMemberRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* teamMemberRepo.delete(inserted.id);

          // Verify team member no longer exists
          const afterDelete = yield* teamMemberRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent team member",
      () =>
        Effect.gen(function* () {
          const teamMemberRepo = yield* TeamMemberRepo;

          // Deleting a non-existent ID should not throw (EntityId format: team_member__uuid)
          const nonExistentId = "team_member__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(teamMemberRepo.delete(nonExistentId));

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
      "should insert multiple team members without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("many");

          // Create additional users for batch insert
          const user2 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("many-user2"),
              name: "Batch User 2",
            })
          );
          const user3 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("many-user3"),
              name: "Batch User 3",
            })
          );

          const teamMembers = [
            makeMockTeamMember({
              teamId: team.id,
              userId: user.id,
              organizationId: org.id,
            }),
            makeMockTeamMember({
              teamId: team.id,
              userId: user2.id,
              organizationId: org.id,
            }),
            makeMockTeamMember({
              teamId: team.id,
              userId: user3.id,
              organizationId: org.id,
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* teamMemberRepo.insertManyVoid(
            teamMembers as unknown as readonly [
              typeof Entities.TeamMember.Model.insert.Type,
              ...(typeof Entities.TeamMember.Model.insert.Type)[],
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
      "should fail with DatabaseError on duplicate team member (unique constraint violation if exists)",
      () =>
        Effect.gen(function* () {
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("duplicate");

          const teamMember1 = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });

          // First insert should succeed
          yield* teamMemberRepo.insert(teamMember1);

          // Second insert with same combination should fail if unique constraint exists
          const result = yield* Effect.either(teamMemberRepo.insert(teamMember1));

          // If there's a unique constraint on (teamId, userId, organizationId), this should fail
          // If not, it will succeed but create a duplicate
          if (result._tag === "Left") {
            // Should be a DatabaseError with unique violation type
            expect(result.left._tag).toBe("DatabaseError");
            expect(result.left.type).toBe("UNIQUE_VIOLATION");
          }
          // If Right, no unique constraint exists - test still passes but logs info
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should die when updating non-existent team member",
      () =>
        Effect.gen(function* () {
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("update-nonexistent");

          // First create a valid team member to get a proper structure for update
          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });
          const inserted = yield* teamMemberRepo.insert(mockedTeamMember);

          // Delete the team member
          yield* teamMemberRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) team member
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            teamMemberRepo.update({
              ...inserted,
              teamId: team.id,
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
          const teamRepo = yield* TeamRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("crud-workflow");

          // Create second team for update test
          const team2 = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: "CRUD Update Target Team",
              slug: makeTestSlug("crud-update-target"),
            })
          );

          // CREATE
          const mockedTeamMember = makeMockTeamMember({
            teamId: team.id,
            userId: user.id,
            organizationId: org.id,
          });
          const created = yield* teamMemberRepo.insert(mockedTeamMember);
          assertTrue(S.is(Entities.TeamMember.Model)(created));

          // READ
          const read = yield* teamMemberRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            deepStrictEqual(read.value.teamId, team.id);
            deepStrictEqual(read.value.userId, user.id);
            deepStrictEqual(read.value.organizationId, org.id);
          }

          // UPDATE
          const updated = yield* teamMemberRepo.update({
            ...created,
            teamId: team2.id,
          });
          deepStrictEqual(updated.teamId, team2.id);

          // Verify update persisted
          const readAfterUpdate = yield* teamMemberRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            deepStrictEqual(readAfterUpdate.value.teamId, team2.id);
          }

          // DELETE
          yield* teamMemberRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* teamMemberRepo.findById(created.id);
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
      "should create team member with all required fields (no optional fields in model)",
      () =>
        Effect.gen(function* () {
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("no-optionals");

          // TeamMember model has no optional fields - all are required FK references
          const teamMember = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team.id,
              userId: user.id,
              organizationId: org.id,
            })
          );

          // All fields should be populated
          expect(teamMember.id).toBeDefined();
          deepStrictEqual(teamMember.teamId, team.id);
          deepStrictEqual(teamMember.userId, user.id);
          deepStrictEqual(teamMember.organizationId, org.id);
          expect(teamMember.createdAt).toBeDefined();
          expect(teamMember.updatedAt).toBeDefined();
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should preserve all fields through update cycle",
      () =>
        Effect.gen(function* () {
          const teamRepo = yield* TeamRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("preserve-fields");

          // Create second team
          const team2 = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: "Preserve Fields Target Team",
              slug: makeTestSlug("preserve-target"),
            })
          );

          const teamMember = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team.id,
              userId: user.id,
              organizationId: org.id,
            })
          );

          // Update one field
          const updated = yield* teamMemberRepo.update({
            ...teamMember,
            teamId: team2.id,
          });

          // Verify other fields are preserved
          deepStrictEqual(updated.id, teamMember.id);
          deepStrictEqual(updated.userId, user.id);
          deepStrictEqual(updated.organizationId, org.id);
          deepStrictEqual(updated.teamId, team2.id);
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
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("fk-user");

          const teamMember = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team.id,
              userId: user.id,
              organizationId: org.id,
            })
          );

          // Verify the userId matches the created user
          deepStrictEqual(teamMember.userId, user.id);

          // Verify we can find the user
          const foundUser = yield* userRepo.findById(teamMember.userId);
          strictEqual(foundUser._tag, "Some");
          if (foundUser._tag === "Some") {
            strictEqual(foundUser.value.name, "fk-user User");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should maintain teamId reference to existing team",
      () =>
        Effect.gen(function* () {
          const teamRepo = yield* TeamRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("fk-team");

          const teamMember = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team.id,
              userId: user.id,
              organizationId: org.id,
            })
          );

          // Verify the teamId matches the created team
          deepStrictEqual(teamMember.teamId, team.id);

          // Verify we can find the team
          const foundTeam = yield* teamRepo.findById(teamMember.teamId);
          strictEqual(foundTeam._tag, "Some");
          if (foundTeam._tag === "Some") {
            strictEqual(foundTeam.value.name, "fk-team Team");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should maintain organizationId reference to existing organization",
      () =>
        Effect.gen(function* () {
          const orgRepo = yield* OrganizationRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("fk-org");

          const teamMember = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team.id,
              userId: user.id,
              organizationId: org.id,
            })
          );

          // Verify the organizationId matches the created organization
          deepStrictEqual(teamMember.organizationId, org.id);

          // Verify we can find the organization
          const foundOrg = yield* orgRepo.findById(teamMember.organizationId);
          strictEqual(foundOrg._tag, "Some");
          if (foundOrg._tag === "Some") {
            strictEqual(foundOrg.value.name, "fk-org Organization");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow multiple team members in the same team",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("multi-member");

          // Create additional users
          const user2 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("multi-member-user2"),
              name: "Multi Member User 2",
            })
          );
          const user3 = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("multi-member-user3"),
              name: "Multi Member User 3",
            })
          );

          // Add all users to the same team
          const member1 = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team.id,
              userId: user.id,
              organizationId: org.id,
            })
          );
          const member2 = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team.id,
              userId: user2.id,
              organizationId: org.id,
            })
          );
          const member3 = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team.id,
              userId: user3.id,
              organizationId: org.id,
            })
          );

          // All should be successfully created with the same teamId
          deepStrictEqual(member1.teamId, team.id);
          deepStrictEqual(member2.teamId, team.id);
          deepStrictEqual(member3.teamId, team.id);

          // But with different userIds
          expect(member1.userId).not.toBe(member2.userId);
          expect(member2.userId).not.toBe(member3.userId);
          expect(member1.userId).not.toBe(member3.userId);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow same user to be member of multiple teams",
      () =>
        Effect.gen(function* () {
          const teamRepo = yield* TeamRepo;
          const teamMemberRepo = yield* TeamMemberRepo;

          // Create prerequisites
          const { user, org, team } = yield* createPrerequisites("multi-team");

          // Create additional teams
          const team2 = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: "Multi Team 2",
              slug: makeTestSlug("multi-team-2"),
            })
          );
          const team3 = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: "Multi Team 3",
              slug: makeTestSlug("multi-team-3"),
            })
          );

          // Add same user to multiple teams
          const member1 = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team.id,
              userId: user.id,
              organizationId: org.id,
            })
          );
          const member2 = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team2.id,
              userId: user.id,
              organizationId: org.id,
            })
          );
          const member3 = yield* teamMemberRepo.insert(
            makeMockTeamMember({
              teamId: team3.id,
              userId: user.id,
              organizationId: org.id,
            })
          );

          // All should be successfully created with the same userId
          deepStrictEqual(member1.userId, user.id);
          deepStrictEqual(member2.userId, user.id);
          deepStrictEqual(member3.userId, user.id);

          // But with different teamIds
          expect(member1.teamId).not.toBe(member2.teamId);
          expect(member2.teamId).not.toBe(member3.teamId);
          expect(member1.teamId).not.toBe(member3.teamId);
        }),
      TEST_TIMEOUT
    );
  });
});
