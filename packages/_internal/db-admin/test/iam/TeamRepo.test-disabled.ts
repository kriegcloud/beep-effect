import { describe, expect } from "bun:test";
import { OrganizationRepo, TeamRepo, UserRepo } from "@beep/iam-infra/adapters/repositories";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { Organization, Team, User } from "@beep/shared-domain/entities";
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
 * Helper to create a mock team for insert operations.
 * Requires organizationId since it's a foreign key dependency (OrgTable).
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

describe("TeamRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert team and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // First create owner user (FK dependency for organization)
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-insert-owner"),
              name: "Team Insert Owner",
            })
          );

          // Create organization (FK dependency for team)
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Team Insert Organization",
              slug: makeTestSlug("team-insert-org"),
            })
          );

          const slug = makeTestSlug("insert-team");
          const mockedTeam = makeMockTeam({
            organizationId: org.id,
            name: "Insert Test Team",
            slug,
          });
          const inserted = yield* teamRepo.insert(mockedTeam);

          // Verify schema conformance
          assertTrue(S.is(Team.Model)(inserted));

          // Verify fields
          strictEqual(inserted.name, "Insert Test Team");
          strictEqual(inserted.slug, slug);

          // Verify the team has an id with correct prefix
          expect(inserted.id).toMatch(/^team__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted team",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-unique-owner"),
              name: "Unique ID Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Unique ID Organization",
              slug: makeTestSlug("unique-org"),
            })
          );

          const team1 = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: "Unique Team 1",
              slug: makeTestSlug("unique-1"),
            })
          );
          const team2 = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: "Unique Team 2",
              slug: makeTestSlug("unique-2"),
            })
          );

          // IDs should be different
          expect(team1.id).not.toBe(team2.id);

          // Both should be valid EntityId format (team__uuid)
          expect(team1.id).toMatch(/^team__[0-9a-f-]+$/);
          expect(team2.id).toMatch(/^team__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert team without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-void-owner"),
              name: "InsertVoid Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "InsertVoid Organization",
              slug: makeTestSlug("void-org"),
            })
          );

          const slug = makeTestSlug("insert-void");
          const mockedTeam = makeMockTeam({
            organizationId: org.id,
            name: "InsertVoid Test Team",
            slug,
          });

          // insertVoid returns void
          const result = yield* teamRepo.insertVoid(mockedTeam);
          strictEqual(result, undefined);

          // Verify the team was actually persisted by attempting insert again.
          // A duplicate slug should fail, proving the first insert worked.
          const duplicateResult = yield* Effect.either(teamRepo.insertVoid(mockedTeam));

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
      "should return Some when team exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-find-some-owner"),
              name: "FindById Some Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "FindById Some Organization",
              slug: makeTestSlug("find-some-org"),
            })
          );

          const mockedTeam = makeMockTeam({
            organizationId: org.id,
            name: "FindById Some Team",
            slug: makeTestSlug("find-some"),
          });
          const inserted = yield* teamRepo.insert(mockedTeam);

          const found = yield* teamRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.name, "FindById Some Team");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when team does not exist",
      () =>
        Effect.gen(function* () {
          const teamRepo = yield* TeamRepo;

          // Use a valid TeamId format that doesn't exist (EntityId format: team__uuid)
          const nonExistentId = "team__00000000-0000-0000-0000-000000000000";
          const result = yield* teamRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete team entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-find-complete-owner"),
              name: "Complete Team Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Complete Team Organization",
              slug: makeTestSlug("find-complete-org"),
            })
          );

          const mockedTeam = makeMockTeam({
            organizationId: org.id,
            name: "Complete Team",
            slug: makeTestSlug("find-complete"),
          });
          const inserted = yield* teamRepo.insert(mockedTeam);
          const found = yield* teamRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("name");
            expect(found.value).toHaveProperty("slug");
            expect(found.value).toHaveProperty("description");
            expect(found.value).toHaveProperty("metadata");
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
      "should update team name and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-update-name-owner"),
              name: "Update Name Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Name Organization",
              slug: makeTestSlug("update-name-org"),
            })
          );

          // Setup: create team
          const mockedTeam = makeMockTeam({
            organizationId: org.id,
            name: "Original Team Name",
            slug: makeTestSlug("update-name"),
          });
          const inserted = yield* teamRepo.insert(mockedTeam);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* teamRepo.update({
            ...inserted,
            name: "Updated Team Name",
          });

          // Verify returned entity has updated name
          strictEqual(updated.name, "Updated Team Name");
          deepStrictEqual(updated.id, inserted.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update team slug",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-update-slug-owner"),
              name: "Update Slug Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Slug Organization",
              slug: makeTestSlug("update-slug-org"),
            })
          );

          const originalSlug = makeTestSlug("original-slug");
          const mockedTeam = makeMockTeam({
            organizationId: org.id,
            name: "Slug Test Team",
            slug: originalSlug,
          });
          const inserted = yield* teamRepo.insert(mockedTeam);

          strictEqual(inserted.slug, originalSlug);

          const newSlug = makeTestSlug("new-slug");
          const updated = yield* teamRepo.update({
            ...inserted,
            slug: newSlug,
          });

          strictEqual(updated.slug, newSlug);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-update-persist-owner"),
              name: "Persist Test Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Persist Test Organization",
              slug: makeTestSlug("update-persist-org"),
            })
          );

          const mockedTeam = makeMockTeam({
            organizationId: org.id,
            name: "Persist Test Team",
            slug: makeTestSlug("update-persist"),
          });
          const inserted = yield* teamRepo.insert(mockedTeam);

          yield* teamRepo.update({
            ...inserted,
            name: "Persisted Update Team",
          });

          // Verify by fetching fresh
          const found = yield* teamRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.name, "Persisted Update Team");
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
      "should update team without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-updatevoid-owner"),
              name: "UpdateVoid Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "UpdateVoid Organization",
              slug: makeTestSlug("update-void-org"),
            })
          );

          const mockedTeam = makeMockTeam({
            organizationId: org.id,
            name: "UpdateVoid Original Team",
            slug: makeTestSlug("update-void"),
          });
          const inserted = yield* teamRepo.insert(mockedTeam);

          // updateVoid returns void
          const result = yield* teamRepo.updateVoid({
            ...inserted,
            name: "UpdateVoid Updated Team",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* teamRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.name, "UpdateVoid Updated Team");
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
      "should delete existing team",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-delete-owner"),
              name: "Delete Test Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Delete Test Organization",
              slug: makeTestSlug("delete-org"),
            })
          );

          const mockedTeam = makeMockTeam({
            organizationId: org.id,
            name: "Delete Test Team",
            slug: makeTestSlug("delete"),
          });
          const inserted = yield* teamRepo.insert(mockedTeam);

          // Verify team exists
          const beforeDelete = yield* teamRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* teamRepo.delete(inserted.id);

          // Verify team no longer exists
          const afterDelete = yield* teamRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent team",
      () =>
        Effect.gen(function* () {
          const teamRepo = yield* TeamRepo;

          // Deleting a non-existent ID should not throw (EntityId format: team__uuid)
          const nonExistentId = "team__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(teamRepo.delete(nonExistentId));

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
      "should insert multiple teams without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-many-owner"),
              name: "Batch Insert Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Batch Insert Organization",
              slug: makeTestSlug("batch-org"),
            })
          );

          const prefix = crypto.randomUUID().slice(0, 8);
          const teams = [
            makeMockTeam({
              organizationId: org.id,
              name: "Batch Team 1",
              slug: BS.Slug.make(`batch-1-${prefix}`),
            }),
            makeMockTeam({
              organizationId: org.id,
              name: "Batch Team 2",
              slug: BS.Slug.make(`batch-2-${prefix}`),
            }),
            makeMockTeam({
              organizationId: org.id,
              name: "Batch Team 3",
              slug: BS.Slug.make(`batch-3-${prefix}`),
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* teamRepo.insertManyVoid(
            teams as unknown as readonly [typeof Team.Model.insert.Type, ...(typeof Team.Model.insert.Type)[]]
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
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-duplicate-owner"),
              name: "Duplicate Slug Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Duplicate Slug Organization",
              slug: makeTestSlug("duplicate-org"),
            })
          );

          const slug = makeTestSlug("duplicate");
          const team1 = makeMockTeam({
            organizationId: org.id,
            name: "First Team",
            slug,
          });
          const team2 = makeMockTeam({
            organizationId: org.id,
            name: "Second Team",
            slug, // Same slug as team1
          });

          // First insert should succeed
          yield* teamRepo.insert(team1);

          // Second insert with same slug should fail
          const result = yield* Effect.either(teamRepo.insert(team2));

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
      "should die when updating non-existent team",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // First create a valid team to get a proper structure for update
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-update-nonexistent-owner"),
              name: "Update Nonexistent Owner",
            })
          );

          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Nonexistent Organization",
              slug: makeTestSlug("update-nonexistent-org"),
            })
          );

          const mockedTeam = makeMockTeam({
            organizationId: org.id,
            name: "Temp Team",
            slug: makeTestSlug("update-nonexistent"),
          });
          const inserted = yield* teamRepo.insert(mockedTeam);

          // Delete the team
          yield* teamRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) team
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            teamRepo.update({
              ...inserted,
              name: "Should Not Work",
            })
          );

          // Update on non-existent row dies with NoSuchElementException (treated as defect)
          // The repo's design catches this and calls Effect.die, so we check for Failure
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
          const teamRepo = yield* TeamRepo;

          // Setup: create owner user and organization
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-crud-owner"),
              name: "CRUD Workflow Owner",
            })
          );

          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "CRUD Workflow Organization",
              slug: makeTestSlug("crud-workflow-org"),
            })
          );

          // CREATE
          const mockedTeam = makeMockTeam({
            organizationId: org.id,
            name: "CRUD Test Team",
            slug: makeTestSlug("crud-workflow"),
          });
          const created = yield* teamRepo.insert(mockedTeam);
          assertTrue(S.is(Team.Model)(created));

          // READ
          const read = yield* teamRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.name, "CRUD Test Team");
          }

          // UPDATE
          const updated = yield* teamRepo.update({
            ...created,
            name: "Updated CRUD Team",
          });
          strictEqual(updated.name, "Updated CRUD Team");

          // Verify update persisted
          const readAfterUpdate = yield* teamRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.name, "Updated CRUD Team");
          }

          // DELETE
          yield* teamRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* teamRepo.findById(created.id);
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
      "should handle optional description field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-no-desc-owner"),
              name: "No Description Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "No Description Organization",
              slug: makeTestSlug("no-desc-org"),
            })
          );

          // Create without description
          const teamWithoutDesc = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: "No Description Team",
              slug: makeTestSlug("no-desc"),
            })
          );

          // description should be None (optional fields are Option types)
          strictEqual(teamWithoutDesc.description._tag, "None");

          // Update with description
          const updated = yield* teamRepo.update({
            ...teamWithoutDesc,
            description: O.some("This is a team description"),
          });

          strictEqual(updated.description._tag, "Some");
          strictEqual(
            O.getOrElse(updated.description, () => ""),
            "This is a team description"
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
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-no-metadata-owner"),
              name: "No Metadata Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "No Metadata Organization",
              slug: makeTestSlug("no-metadata-org"),
            })
          );

          const team = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: "No Metadata Team",
              slug: makeTestSlug("no-metadata"),
            })
          );

          strictEqual(team.metadata._tag, "None");

          const updated = yield* teamRepo.update({
            ...team,
            metadata: O.some('{"color": "blue"}'),
          });

          strictEqual(updated.metadata._tag, "Some");
          strictEqual(
            O.getOrElse(updated.metadata, () => ""),
            '{"color": "blue"}'
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should clear optional field by setting to None",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-clear-field-owner"),
              name: "Clear Field Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Clear Field Organization",
              slug: makeTestSlug("clear-field-org"),
            })
          );

          // Create with description
          const teamInput = {
            ...makeMockTeam({
              organizationId: org.id,
              name: "Clear Field Team",
              slug: makeTestSlug("clear-field"),
            }),
          };

          const team = yield* teamRepo.insert(teamInput);

          // Set description
          const withDesc = yield* teamRepo.update({
            ...team,
            description: O.some("Initial description"),
          });
          strictEqual(withDesc.description._tag, "Some");

          // Clear description
          const cleared = yield* teamRepo.update({
            ...withDesc,
            description: O.none(),
          });
          strictEqual(cleared.description._tag, "None");
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FOREIGN KEY RELATIONSHIP TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("foreign key relationships", (it) => {
    it.effect(
      "should fail when inserting team with non-existent organization",
      () =>
        Effect.gen(function* () {
          const teamRepo = yield* TeamRepo;

          // Try to create a team with a non-existent organization ID
          const mockedTeam = makeMockTeam({
            organizationId: "organization__00000000-0000-0000-0000-000000000000",
            name: "Orphan Team",
            slug: makeTestSlug("orphan"),
          });

          const result = yield* Effect.either(teamRepo.insert(mockedTeam));

          // Should fail with foreign key constraint violation
          strictEqual(result._tag, "Left");
          if (result._tag === "Left") {
            expect(result.left._tag).toBe("DatabaseError");
            // Foreign key violations are typically FOREIGN_KEY_VIOLATION
            expect(result.left.type).toBe("FOREIGN_KEY_VIOLATION");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should enforce unique team name per organization",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-unique-name-owner"),
              name: "Unique Name Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Unique Name Organization",
              slug: makeTestSlug("unique-name-org"),
            })
          );

          const teamName = "Duplicate Name Team";

          // First team with unique slug
          yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org.id,
              name: teamName,
              slug: makeTestSlug("unique-name-1"),
            })
          );

          // Second team with same name in same org but different slug
          // The table has a composite unique index on (organizationId, name)
          const result = yield* Effect.either(
            teamRepo.insert(
              makeMockTeam({
                organizationId: org.id,
                name: teamName,
                slug: makeTestSlug("unique-name-2"),
              })
            )
          );

          // Should fail due to composite unique constraint
          strictEqual(result._tag, "Left");
          if (result._tag === "Left") {
            expect(result.left._tag).toBe("DatabaseError");
            expect(result.left.type).toBe("UNIQUE_VIOLATION");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow same team name in different organizations",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const teamRepo = yield* TeamRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("team-multi-org-owner"),
              name: "Multi Org Owner",
            })
          );

          // Create first organization
          const org1 = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "First Organization",
              slug: makeTestSlug("multi-org-1"),
            })
          );

          // Create second organization
          const org2 = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Second Organization",
              slug: makeTestSlug("multi-org-2"),
            })
          );

          const teamName = "Same Name Team";

          // Create team in first org
          const team1 = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org1.id,
              name: teamName,
              slug: makeTestSlug("multi-org-team-1"),
            })
          );

          // Create team with same name in second org - should succeed
          const team2 = yield* teamRepo.insert(
            makeMockTeam({
              organizationId: org2.id,
              name: teamName,
              slug: makeTestSlug("multi-org-team-2"),
            })
          );

          // Both teams should exist with the same name
          strictEqual(team1.name, teamName);
          strictEqual(team2.name, teamName);
          expect(team1.id).not.toBe(team2.id);
        }),
      TEST_TIMEOUT
    );
  });
});
