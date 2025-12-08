import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { OAuthApplicationRepo, OrganizationRepo, UserRepo } from "@beep/iam-infra";
import { BS } from "@beep/schema";

import { Organization, User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
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
 * Helper to create a unique test slug to avoid conflicts between tests.
 */
const makeTestSlug = (prefix: string): BS.Slug.Type => BS.Slug.make(`${prefix}-${crypto.randomUUID().slice(0, 8)}`);

/**
 * Helper to create a mock user for FK dependency.
 */
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("oauth-app-user"),
    name: overrides?.name ?? "OAuth App Test User",
  });

/**
 * Helper to create a mock organization for FK dependency.
 */
const makeMockOrganization = (ownerUserId: string, overrides?: Partial<{ name: string; slug: BS.Slug.Type }>) =>
  Organization.Model.jsonCreate.make({
    name: overrides?.name ?? "Test Organization",
    slug: overrides?.slug ?? makeTestSlug("test-org"),
    ownerUserId: ownerUserId as typeof Organization.Model.fields.ownerUserId.Type,
  });

/**
 * Helper to create a mock OAuth application for insert operations.
 * Note: userId field is Option<UserId>, so we pass the Option directly (not double-wrapped).
 * Note: clientSecret field is Option<Redacted<string>>, so we wrap the string in Redacted.
 */
const makeMockOAuthApplication = (
  organizationId: string,
  overrides?: Partial<{
    name: string;
    icon: string;
    clientId: string;
    clientSecret: string;
    disabled: boolean;
    userId: string;
  }>
) =>
  Entities.OAuthApplication.Model.jsonCreate.make({
    organizationId: organizationId as typeof Entities.OAuthApplication.Model.fields.organizationId.Type,
    name: O.fromNullable(overrides?.name),
    icon: O.fromNullable(overrides?.icon),
    clientId: O.fromNullable(overrides?.clientId),
    // clientSecret is M.Sensitive, so it expects Option<Redacted<string>>
    clientSecret: O.map(O.fromNullable(overrides?.clientSecret), Redacted.make),
    disabled: overrides?.disabled ?? false,
    // userId expects Option<UserId>, so we pass the Option directly without double-wrapping
    userId: O.fromNullable(overrides?.userId) as typeof Entities.OAuthApplication.Model.fields.userId.Type,
  });

describe("OAuthApplicationRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert oauth application and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user first (for org ownership)
          const mockedUser = makeMockUser({ email: makeTestEmail("insert-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization (FK dependency)
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Insert Test Org",
            slug: makeTestSlug("insert-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, {
            name: "Insert Test OAuth App",
            clientId: "test-client-id",
          });
          const inserted = yield* oauthAppRepo.insert(mockedOAuthApp);

          // Verify schema conformance
          assertTrue(S.is(Entities.OAuthApplication.Model)(inserted));

          // Verify fields
          deepStrictEqual(inserted.organizationId, insertedOrg.id);
          strictEqual(inserted.disabled, false);

          // Verify optional name field
          strictEqual(inserted.name._tag, "Some");
          if (inserted.name._tag === "Some") {
            strictEqual(inserted.name.value, "Insert Test OAuth App");
          }

          // Verify optional clientId field
          strictEqual(inserted.clientId._tag, "Some");
          if (inserted.clientId._tag === "Some") {
            strictEqual(inserted.clientId.value, "test-client-id");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted oauth application",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("unique-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Unique Test Org",
            slug: makeTestSlug("unique-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const oauthApp1 = yield* oauthAppRepo.insert(
            makeMockOAuthApplication(insertedOrg.id, { name: "OAuth App 1" })
          );
          const oauthApp2 = yield* oauthAppRepo.insert(
            makeMockOAuthApplication(insertedOrg.id, { name: "OAuth App 2" })
          );

          // IDs should be different
          expect(oauthApp1.id).not.toBe(oauthApp2.id);

          // Both should be valid EntityId format (oauth_application__uuid)
          expect(oauthApp1.id).toMatch(/^oauth_application__[0-9a-f-]+$/);
          expect(oauthApp2.id).toMatch(/^oauth_application__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert oauth application without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("insert-void-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "InsertVoid Test Org",
            slug: makeTestSlug("insertvoid-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, { name: "InsertVoid Test" });

          // insertVoid returns void
          const result = yield* oauthAppRepo.insertVoid(mockedOAuthApp);
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
      "should return Some when oauth application exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("find-some-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "FindById Some Org",
            slug: makeTestSlug("findsome-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, { name: "FindById Some" });
          const inserted = yield* oauthAppRepo.insert(mockedOAuthApp);

          const found = yield* oauthAppRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            deepStrictEqual(found.value.organizationId, insertedOrg.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when oauth application does not exist",
      () =>
        Effect.gen(function* () {
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Use a valid OAuthApplicationId format that doesn't exist
          const nonExistentId = "oauth_application__00000000-0000-0000-0000-000000000000";
          const result = yield* oauthAppRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete oauth application entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("find-complete-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "FindById Complete Org",
            slug: makeTestSlug("findcomplete-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, { name: "Complete OAuth App" });
          const inserted = yield* oauthAppRepo.insert(mockedOAuthApp);
          const found = yield* oauthAppRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("organizationId");
            expect(found.value).toHaveProperty("name");
            expect(found.value).toHaveProperty("icon");
            expect(found.value).toHaveProperty("metadata");
            expect(found.value).toHaveProperty("clientId");
            expect(found.value).toHaveProperty("clientSecret");
            expect(found.value).toHaveProperty("redirectURLs");
            expect(found.value).toHaveProperty("type");
            expect(found.value).toHaveProperty("disabled");
            expect(found.value).toHaveProperty("userId");
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
      "should update oauth application name and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("update-name-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Update Name Org",
            slug: makeTestSlug("updatename-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, { name: "Original Name" });
          const inserted = yield* oauthAppRepo.insert(mockedOAuthApp);

          // Update name
          const updated = yield* oauthAppRepo.update({
            ...inserted,
            name: O.some("Updated Name"),
          });

          // Verify returned entity has updated name
          strictEqual(updated.name._tag, "Some");
          if (updated.name._tag === "Some") {
            strictEqual(updated.name.value, "Updated Name");
          }
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.organizationId, insertedOrg.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update disabled field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("update-disabled-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Update Disabled Org",
            slug: makeTestSlug("updatedisabled-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, {
            name: "Disable Test",
            disabled: false,
          });
          const inserted = yield* oauthAppRepo.insert(mockedOAuthApp);

          // Initially should be false
          strictEqual(inserted.disabled, false);

          // Update to true
          const updated = yield* oauthAppRepo.update({
            ...inserted,
            disabled: true,
          });

          strictEqual(updated.disabled, true);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update clientId and clientSecret fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("update-client-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Update Client Org",
            slug: makeTestSlug("updateclient-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, { name: "Client Test" });
          const inserted = yield* oauthAppRepo.insert(mockedOAuthApp);

          strictEqual(inserted.clientId._tag, "None");
          strictEqual(inserted.clientSecret._tag, "None");

          const updated = yield* oauthAppRepo.update({
            ...inserted,
            clientId: O.some("new-client-id-12345"),
            clientSecret: O.some(Redacted.make("super-secret-value")),
          });

          strictEqual(updated.clientId._tag, "Some");
          strictEqual(
            O.getOrElse(updated.clientId, () => ""),
            "new-client-id-12345"
          );
          strictEqual(updated.clientSecret._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update type field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("update-type-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Update Type Org",
            slug: makeTestSlug("updatetype-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, { name: "Type Test" });
          const inserted = yield* oauthAppRepo.insert(mockedOAuthApp);

          strictEqual(inserted.type._tag, "None");

          const updated = yield* oauthAppRepo.update({
            ...inserted,
            type: O.some("web_application"),
          });

          strictEqual(updated.type._tag, "Some");
          strictEqual(
            O.getOrElse(updated.type, () => ""),
            "web_application"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("update-persist-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Update Persist Org",
            slug: makeTestSlug("updatepersist-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, { name: "Persist Test" });
          const inserted = yield* oauthAppRepo.insert(mockedOAuthApp);

          yield* oauthAppRepo.update({
            ...inserted,
            name: O.some("Persisted Update"),
            disabled: true,
          });

          // Verify by fetching fresh
          const found = yield* oauthAppRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.name._tag, "Some");
            if (found.value.name._tag === "Some") {
              strictEqual(found.value.name.value, "Persisted Update");
            }
            strictEqual(found.value.disabled, true);
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
      "should update oauth application without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("update-void-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "UpdateVoid Org",
            slug: makeTestSlug("updatevoid-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, { name: "UpdateVoid Original" });
          const inserted = yield* oauthAppRepo.insert(mockedOAuthApp);

          // updateVoid returns void
          const result = yield* oauthAppRepo.updateVoid({
            ...inserted,
            name: O.some("UpdateVoid Updated"),
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* oauthAppRepo.findById(inserted.id);

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
      "should delete existing oauth application",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("delete-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Delete Org",
            slug: makeTestSlug("delete-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, { name: "Delete Test OAuth App" });
          const inserted = yield* oauthAppRepo.insert(mockedOAuthApp);

          // Verify oauth application exists
          const beforeDelete = yield* oauthAppRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* oauthAppRepo.delete(inserted.id);

          // Verify oauth application no longer exists
          const afterDelete = yield* oauthAppRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent oauth application",
      () =>
        Effect.gen(function* () {
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Deleting a non-existent ID should not throw
          const nonExistentId = "oauth_application__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(oauthAppRepo.delete(nonExistentId));

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
      "should insert multiple oauth applications without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("many-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Many Org",
            slug: makeTestSlug("many-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const oauthApps = [
            makeMockOAuthApplication(insertedOrg.id, { name: "Batch OAuth App 1" }),
            makeMockOAuthApplication(insertedOrg.id, { name: "Batch OAuth App 2" }),
            makeMockOAuthApplication(insertedOrg.id, { name: "Batch OAuth App 3" }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* oauthAppRepo.insertManyVoid(
            oauthApps as unknown as readonly [
              typeof Entities.OAuthApplication.Model.insert.Type,
              ...(typeof Entities.OAuthApplication.Model.insert.Type)[],
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
      "should fail with DatabaseError when inserting oauth application with non-existent organizationId (FK violation)",
      () =>
        Effect.gen(function* () {
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Use a non-existent organizationId
          const nonExistentOrgId = "organization__00000000-0000-0000-0000-000000000000";
          const mockedOAuthApp = makeMockOAuthApplication(nonExistentOrgId, { name: "FK Violation Test" });

          // Insert with non-existent FK should fail
          const result = yield* Effect.either(oauthAppRepo.insert(mockedOAuthApp));

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
      "should die when updating non-existent oauth application",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create a valid user and org to get proper structure
          const mockedUser = makeMockUser({ email: makeTestEmail("update-nonexistent-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Update NonExistent Org",
            slug: makeTestSlug("updatenonexistent-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, { name: "Temp OAuth App" });
          const inserted = yield* oauthAppRepo.insert(mockedOAuthApp);

          // Delete the oauth application
          yield* oauthAppRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) oauth application
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            oauthAppRepo.update({
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
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Setup: create user and org for FK
          const mockedUser = makeMockUser({ email: makeTestEmail("crud-workflow-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "CRUD Workflow Org",
            slug: makeTestSlug("crudworkflow-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // CREATE
          const mockedOAuthApp = makeMockOAuthApplication(insertedOrg.id, {
            name: "CRUD Test OAuth App",
            clientId: "crud-client-id",
          });
          const created = yield* oauthAppRepo.insert(mockedOAuthApp);
          assertTrue(S.is(Entities.OAuthApplication.Model)(created));

          // READ
          const read = yield* oauthAppRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.name._tag, "Some");
            if (read.value.name._tag === "Some") {
              strictEqual(read.value.name.value, "CRUD Test OAuth App");
            }
          }

          // UPDATE
          const updated = yield* oauthAppRepo.update({
            ...created,
            name: O.some("Updated CRUD OAuth App"),
            disabled: true,
            type: O.some("mobile_application"),
          });
          strictEqual(updated.name._tag, "Some");
          if (updated.name._tag === "Some") {
            strictEqual(updated.name.value, "Updated CRUD OAuth App");
          }
          strictEqual(updated.disabled, true);
          strictEqual(updated.type._tag, "Some");
          if (updated.type._tag === "Some") {
            strictEqual(updated.type.value, "mobile_application");
          }

          // Verify update persisted
          const readAfterUpdate = yield* oauthAppRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.name._tag, "Some");
            if (readAfterUpdate.value.name._tag === "Some") {
              strictEqual(readAfterUpdate.value.name.value, "Updated CRUD OAuth App");
            }
            strictEqual(readAfterUpdate.value.disabled, true);
            strictEqual(readAfterUpdate.value.type._tag, "Some");
          }

          // DELETE
          yield* oauthAppRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* oauthAppRepo.findById(created.id);
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
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-name-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Optional Name Org",
            slug: makeTestSlug("optionalname-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // Create without name (use empty Option)
          const oauthAppWithoutName = yield* oauthAppRepo.insert(
            Entities.OAuthApplication.Model.jsonCreate.make({
              organizationId: insertedOrg.id as typeof Entities.OAuthApplication.Model.fields.organizationId.Type,
              name: O.none(),
            })
          );

          // name should be None (optional fields are Option types)
          strictEqual(oauthAppWithoutName.name._tag, "None");

          // Update with name
          const updated = yield* oauthAppRepo.update({
            ...oauthAppWithoutName,
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
      "should handle optional icon field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-icon-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Optional Icon Org",
            slug: makeTestSlug("optionalicon-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const oauthApp = yield* oauthAppRepo.insert(makeMockOAuthApplication(insertedOrg.id, { name: "Icon Test" }));

          strictEqual(oauthApp.icon._tag, "None");

          const updated = yield* oauthAppRepo.update({
            ...oauthApp,
            icon: O.some("https://example.com/icon.png"),
          });

          strictEqual(updated.icon._tag, "Some");
          strictEqual(
            O.getOrElse(updated.icon, () => ""),
            "https://example.com/icon.png"
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
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-metadata-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Optional Metadata Org",
            slug: makeTestSlug("optionalmetadata-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const oauthApp = yield* oauthAppRepo.insert(
            makeMockOAuthApplication(insertedOrg.id, { name: "Metadata Test" })
          );

          strictEqual(oauthApp.metadata._tag, "None");

          const updated = yield* oauthAppRepo.update({
            ...oauthApp,
            metadata: O.some('{"scopes":["read","write"],"version":"1.0"}'),
          });

          strictEqual(updated.metadata._tag, "Some");
          strictEqual(
            O.getOrElse(updated.metadata, () => ""),
            '{"scopes":["read","write"],"version":"1.0"}'
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional redirectURLs field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-redirecturls-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Optional RedirectURLs Org",
            slug: makeTestSlug("optionalredirect-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const oauthApp = yield* oauthAppRepo.insert(
            makeMockOAuthApplication(insertedOrg.id, { name: "RedirectURLs Test" })
          );

          strictEqual(oauthApp.redirectURLs._tag, "None");

          const updated = yield* oauthAppRepo.update({
            ...oauthApp,
            redirectURLs: O.some('["https://example.com/callback","https://example.com/oauth/redirect"]'),
          });

          strictEqual(updated.redirectURLs._tag, "Some");
          strictEqual(
            O.getOrElse(updated.redirectURLs, () => ""),
            '["https://example.com/callback","https://example.com/oauth/redirect"]'
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional userId field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-userid-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create another user to assign as app owner
          const appOwnerUser = yield* userRepo.insert(
            makeMockUser({ email: makeTestEmail("app-owner-oauth-app"), name: "App Owner" })
          );

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Optional UserId Org",
            slug: makeTestSlug("optionaluserid-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const oauthApp = yield* oauthAppRepo.insert(
            makeMockOAuthApplication(insertedOrg.id, { name: "UserId Test" })
          );

          strictEqual(oauthApp.userId._tag, "None");

          // userId field is Option<UserId>, so O.some(userId) where userId is the inner type
          const updated = yield* oauthAppRepo.update({
            ...oauthApp,
            userId: O.some(appOwnerUser.id),
          });

          strictEqual(updated.userId._tag, "Some");
          if (updated.userId._tag === "Some") {
            deepStrictEqual(updated.userId.value, appOwnerUser.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional clientSecret field (sensitive)",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-clientsecret-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Optional ClientSecret Org",
            slug: makeTestSlug("optionalclientsecret-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const oauthApp = yield* oauthAppRepo.insert(
            makeMockOAuthApplication(insertedOrg.id, { name: "ClientSecret Test" })
          );

          strictEqual(oauthApp.clientSecret._tag, "None");

          // clientSecret is M.Sensitive, so it expects Option<Redacted<string>>
          const updated = yield* oauthAppRepo.update({
            ...oauthApp,
            clientSecret: O.some(Redacted.make("sk_live_supersecretkey123456789")),
          });

          strictEqual(updated.clientSecret._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional type field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("optional-type-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Optional Type Org",
            slug: makeTestSlug("optionaltype-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const oauthApp = yield* oauthAppRepo.insert(makeMockOAuthApplication(insertedOrg.id, { name: "Type Test" }));

          strictEqual(oauthApp.type._tag, "None");

          const updated = yield* oauthAppRepo.update({
            ...oauthApp,
            type: O.some("spa"),
          });

          strictEqual(updated.type._tag, "Some");
          strictEqual(
            O.getOrElse(updated.type, () => ""),
            "spa"
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
          const orgRepo = yield* OrganizationRepo;
          const oauthAppRepo = yield* OAuthApplicationRepo;

          // Create user for org ownership
          const mockedUser = makeMockUser({ email: makeTestEmail("defaults-oauth-app") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Create organization for FK
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Defaults Org",
            slug: makeTestSlug("defaults-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const oauthApp = yield* oauthAppRepo.insert(
            Entities.OAuthApplication.Model.jsonCreate.make({
              organizationId: insertedOrg.id as typeof Entities.OAuthApplication.Model.fields.organizationId.Type,
            })
          );

          // Verify default values are applied
          strictEqual(oauthApp.disabled, false);
        }),
      TEST_TIMEOUT
    );
  });
});
