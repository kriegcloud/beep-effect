import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { OrganizationRepo, ScimProviderRepo, UserRepo } from "@beep/iam-infra";
import { BS } from "@beep/schema";
import { Slug } from "@beep/schema/build/src/primitives.ts";
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
 * Helper to create a unique slug for organizations.
 */
const makeTestSlug = (prefix: string): Slug.Type => Slug.make(`${prefix}-${crypto.randomUUID().slice(0, 8)}`);

/**
 * Helper to create a mock user for foreign key requirements.
 */
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("test"),
    name: overrides?.name ?? "Test User",
  });

/**
 * Helper to create a mock organization for foreign key requirements.
 */
const makeMockOrganization = (ownerUserId: User.Model["id"], overrides?: Partial<{ name: string; slug: Slug.Type }>) =>
  Organization.Model.jsonCreate.make({
    name: overrides?.name ?? "Test Organization",
    slug: overrides?.slug ?? makeTestSlug("test-org"),
    ownerUserId,
  });

/**
 * Helper to create a mock ScimProvider for insert operations.
 * Note: scimToken is an M.Sensitive field, so we must use insert.make() (not jsonCreate.make()).
 */
const makeMockScimProvider = (
  overrides?: Partial<{ providerId: string; scimToken: string; organizationId: O.Option<Organization.Model["id"]> }>
) =>
  Entities.ScimProvider.Model.insert.make({
    providerId: overrides?.providerId ?? `provider-${crypto.randomUUID()}`,
    scimToken: overrides?.scimToken ?? `token-${crypto.randomUUID()}`,
    organizationId: overrides?.organizationId ?? O.none(),
  });

describe("ScimProviderRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert ScimProvider and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup: Create User and Organization for FK relationship
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("insert-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Insert SCIM Org" }));

          const mockedScimProvider = makeMockScimProvider({
            providerId: `provider-insert-${crypto.randomUUID()}`,
            scimToken: `token-insert-${crypto.randomUUID()}`,
            organizationId: O.some(org.id),
          });

          const inserted = yield* scimProviderRepo.insert(mockedScimProvider);

          // Verify schema conformance
          assertTrue(S.is(Entities.ScimProvider.Model)(inserted));

          // Verify fields
          strictEqual(inserted.providerId, mockedScimProvider.providerId);
          deepStrictEqual(inserted.organizationId, O.some(org.id));

          // Verify audit fields exist
          expect(inserted).toHaveProperty("id");
          expect(inserted).toHaveProperty("createdAt");
          expect(inserted).toHaveProperty("updatedAt");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted ScimProvider",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("unique-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Unique SCIM Org" }));

          const scimProvider1 = yield* scimProviderRepo.insert(
            makeMockScimProvider({
              providerId: `provider-unique-1-${crypto.randomUUID()}`,
              organizationId: O.some(org.id),
            })
          );
          const scimProvider2 = yield* scimProviderRepo.insert(
            makeMockScimProvider({
              providerId: `provider-unique-2-${crypto.randomUUID()}`,
              organizationId: O.some(org.id),
            })
          );

          // IDs should be different
          expect(scimProvider1.id).not.toBe(scimProvider2.id);

          // Both should be valid EntityId format (scim_provider__uuid)
          expect(scimProvider1.id).toMatch(/^scim_provider__[0-9a-f-]+$/);
          expect(scimProvider2.id).toMatch(/^scim_provider__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert ScimProvider without returning entity",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("insert-void-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "InsertVoid SCIM Org" }));

          const providerId = `provider-void-${crypto.randomUUID()}`;
          const mockedScimProvider = makeMockScimProvider({
            providerId,
            organizationId: O.some(org.id),
          });

          // insertVoid returns void
          const result = yield* scimProviderRepo.insertVoid(mockedScimProvider);
          strictEqual(result, undefined);

          // Verify the ScimProvider was actually persisted by attempting insert again.
          // A duplicate providerId should fail, proving the first insert worked.
          const duplicateResult = yield* Effect.either(scimProviderRepo.insertVoid(mockedScimProvider));

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
      "should return Some when ScimProvider exists",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("find-some-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Find Some SCIM Org" }));

          const providerId = `provider-find-${crypto.randomUUID()}`;
          const mockedScimProvider = makeMockScimProvider({
            providerId,
            organizationId: O.some(org.id),
          });
          const inserted = yield* scimProviderRepo.insert(mockedScimProvider);

          const found = yield* scimProviderRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.providerId, providerId);
            deepStrictEqual(found.value.organizationId, O.some(org.id));
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when ScimProvider does not exist",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;

          // Use a valid ScimProviderId format that doesn't exist (EntityId format: scim_provider__uuid)
          const nonExistentId = "scim_provider__00000000-0000-0000-0000-000000000000";
          const result = yield* scimProviderRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete ScimProvider entity with all fields",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("find-complete-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Find Complete SCIM Org" }));

          const mockedScimProvider = makeMockScimProvider({
            providerId: `provider-complete-${crypto.randomUUID()}`,
            organizationId: O.some(org.id),
          });
          const inserted = yield* scimProviderRepo.insert(mockedScimProvider);
          const found = yield* scimProviderRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("providerId");
            expect(found.value).toHaveProperty("scimToken");
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
      "should update ScimProvider providerId and return updated entity",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-provider-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Update Provider SCIM Org" }));

          const mockedScimProvider = makeMockScimProvider({
            providerId: `provider-original-${crypto.randomUUID()}`,
            organizationId: O.some(org.id),
          });
          const inserted = yield* scimProviderRepo.insert(mockedScimProvider);

          const newProviderId = `provider-updated-${crypto.randomUUID()}`;

          // Action: update - spread existing entity and override specific fields
          const updated = yield* scimProviderRepo.update({
            ...inserted,
            providerId: newProviderId,
          });

          // Verify returned entity has updated providerId
          strictEqual(updated.providerId, newProviderId);
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.organizationId, O.some(org.id));
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update scimToken field",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-token-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Update Token SCIM Org" }));

          const originalToken = `token-original-${crypto.randomUUID()}`;
          const mockedScimProvider = makeMockScimProvider({
            providerId: `provider-token-${crypto.randomUUID()}`,
            scimToken: originalToken,
            organizationId: O.some(org.id),
          });
          const inserted = yield* scimProviderRepo.insert(mockedScimProvider);

          const newToken = `token-updated-${crypto.randomUUID()}`;

          // Update scimToken
          const updated = yield* scimProviderRepo.update({
            ...inserted,
            scimToken: newToken,
          });

          // Note: scimToken is a Sensitive field, so we verify the update succeeded
          // by checking the entity was updated without error
          deepStrictEqual(updated.id, inserted.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-persist-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Update Persist SCIM Org" }));

          const mockedScimProvider = makeMockScimProvider({
            providerId: `provider-persist-${crypto.randomUUID()}`,
            organizationId: O.some(org.id),
          });
          const inserted = yield* scimProviderRepo.insert(mockedScimProvider);

          const newProviderId = `provider-persisted-${crypto.randomUUID()}`;
          yield* scimProviderRepo.update({
            ...inserted,
            providerId: newProviderId,
          });

          // Verify by fetching fresh
          const found = yield* scimProviderRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.providerId, newProviderId);
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
      "should update ScimProvider without returning entity",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-void-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "UpdateVoid SCIM Org" }));

          const mockedScimProvider = makeMockScimProvider({
            providerId: `provider-void-update-${crypto.randomUUID()}`,
            organizationId: O.some(org.id),
          });
          const inserted = yield* scimProviderRepo.insert(mockedScimProvider);

          const newProviderId = `provider-void-updated-${crypto.randomUUID()}`;

          // updateVoid returns void
          const result = yield* scimProviderRepo.updateVoid({
            ...inserted,
            providerId: newProviderId,
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* scimProviderRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.providerId, newProviderId);
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
      "should delete existing ScimProvider",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("delete-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Delete SCIM Org" }));

          const mockedScimProvider = makeMockScimProvider({
            providerId: `provider-delete-${crypto.randomUUID()}`,
            organizationId: O.some(org.id),
          });
          const inserted = yield* scimProviderRepo.insert(mockedScimProvider);

          // Verify ScimProvider exists
          const beforeDelete = yield* scimProviderRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* scimProviderRepo.delete(inserted.id);

          // Verify ScimProvider no longer exists
          const afterDelete = yield* scimProviderRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent ScimProvider",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;

          // Deleting a non-existent ID should not throw (EntityId format: scim_provider__uuid)
          const nonExistentId = "scim_provider__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(scimProviderRepo.delete(nonExistentId));

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
      "should insert multiple ScimProviders without returning entities",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("many-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Many SCIM Org" }));

          const prefix = crypto.randomUUID();
          const scimProviders = [
            makeMockScimProvider({ providerId: `provider-many-1-${prefix}`, organizationId: O.some(org.id) }),
            makeMockScimProvider({ providerId: `provider-many-2-${prefix}`, organizationId: O.some(org.id) }),
            makeMockScimProvider({ providerId: `provider-many-3-${prefix}`, organizationId: O.some(org.id) }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* scimProviderRepo.insertManyVoid(
            scimProviders as unknown as readonly [
              typeof Entities.ScimProvider.Model.insert.Type,
              ...(typeof Entities.ScimProvider.Model.insert.Type)[],
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
      "should fail with DatabaseError on duplicate providerId (unique constraint violation)",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("duplicate-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Duplicate SCIM Org" }));

          const providerId = `provider-duplicate-${crypto.randomUUID()}`;
          const scimProvider1 = makeMockScimProvider({ providerId, organizationId: O.some(org.id) });
          const scimProvider2 = makeMockScimProvider({ providerId, organizationId: O.some(org.id) });

          // First insert should succeed
          yield* scimProviderRepo.insert(scimProvider1);

          // Second insert with same providerId should fail
          const result = yield* Effect.either(scimProviderRepo.insert(scimProvider2));

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
      "should die when updating non-existent ScimProvider",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup: Create a valid ScimProvider to get a proper structure for update
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-nonexistent-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Update Nonexistent SCIM Org" }));

          const mockedScimProvider = makeMockScimProvider({
            providerId: `provider-temp-${crypto.randomUUID()}`,
            organizationId: O.some(org.id),
          });
          const inserted = yield* scimProviderRepo.insert(mockedScimProvider);

          // Delete the ScimProvider
          yield* scimProviderRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) ScimProvider
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            scimProviderRepo.update({
              ...inserted,
              providerId: `provider-should-not-work-${crypto.randomUUID()}`,
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
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("crud-workflow-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "CRUD Workflow SCIM Org" }));

          // CREATE
          const mockedScimProvider = makeMockScimProvider({
            providerId: `provider-crud-${crypto.randomUUID()}`,
            organizationId: O.some(org.id),
          });
          const created = yield* scimProviderRepo.insert(mockedScimProvider);
          assertTrue(S.is(Entities.ScimProvider.Model)(created));

          // READ
          const read = yield* scimProviderRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.providerId, mockedScimProvider.providerId);
          }

          // UPDATE
          const newProviderId = `provider-crud-updated-${crypto.randomUUID()}`;
          const updated = yield* scimProviderRepo.update({
            ...created,
            providerId: newProviderId,
          });
          strictEqual(updated.providerId, newProviderId);

          // Verify update persisted
          const readAfterUpdate = yield* scimProviderRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.providerId, newProviderId);
          }

          // DELETE
          yield* scimProviderRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* scimProviderRepo.findById(created.id);
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
      "should handle optional organizationId field (None)",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;

          // Create ScimProvider without organizationId
          const scimProviderWithoutOrg = yield* scimProviderRepo.insert(
            makeMockScimProvider({
              providerId: `provider-no-org-${crypto.randomUUID()}`,
              organizationId: O.none(),
            })
          );

          // organizationId should be None (optional fields are Option types)
          strictEqual(scimProviderWithoutOrg.organizationId._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional organizationId field (Some)",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("org-id-some-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "OrgId Some SCIM Org" }));

          // Create ScimProvider with organizationId
          const scimProviderWithOrg = yield* scimProviderRepo.insert(
            makeMockScimProvider({
              providerId: `provider-with-org-${crypto.randomUUID()}`,
              organizationId: O.some(org.id),
            })
          );

          // organizationId should be Some
          strictEqual(scimProviderWithOrg.organizationId._tag, "Some");
          if (scimProviderWithOrg.organizationId._tag === "Some") {
            deepStrictEqual(scimProviderWithOrg.organizationId.value, org.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update organizationId from None to Some",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-org-id-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Update OrgId SCIM Org" }));

          // Create ScimProvider without organizationId
          const scimProvider = yield* scimProviderRepo.insert(
            makeMockScimProvider({
              providerId: `provider-update-org-${crypto.randomUUID()}`,
              organizationId: O.none(),
            })
          );

          strictEqual(scimProvider.organizationId._tag, "None");

          // Update with organizationId
          const updated = yield* scimProviderRepo.update({
            ...scimProvider,
            organizationId: O.some(org.id),
          });

          strictEqual(updated.organizationId._tag, "Some");
          if (updated.organizationId._tag === "Some") {
            deepStrictEqual(updated.organizationId.value, org.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update organizationId from Some to None",
      () =>
        Effect.gen(function* () {
          const scimProviderRepo = yield* ScimProviderRepo;
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;

          // Setup
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("remove-org-id-scim") }));
          const org = yield* orgRepo.insert(makeMockOrganization(user.id, { name: "Remove OrgId SCIM Org" }));

          // Create ScimProvider with organizationId
          const scimProvider = yield* scimProviderRepo.insert(
            makeMockScimProvider({
              providerId: `provider-remove-org-${crypto.randomUUID()}`,
              organizationId: O.some(org.id),
            })
          );

          strictEqual(scimProvider.organizationId._tag, "Some");

          // Update to remove organizationId
          const updated = yield* scimProviderRepo.update({
            ...scimProvider,
            organizationId: O.none(),
          });

          strictEqual(updated.organizationId._tag, "None");
        }),
      TEST_TIMEOUT
    );
  });
});
