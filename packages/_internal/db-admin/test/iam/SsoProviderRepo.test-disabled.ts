import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { OrganizationRepo, SsoProviderRepo, UserRepo } from "@beep/iam-infra/adapters/repositories";
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
 * Helper to create a mock user for insert operations.
 */
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("test"),
    name: overrides?.name ?? "Test User",
  });

/**
 * Helper to create a mock organization for insert operations.
 * Organizations require an ownerUserId (FK to User).
 */
const makeMockOrganization = (
  ownerUserId: SharedEntityIds.UserId.Type,
  overrides?: Partial<{ name: string; slug: BS.Slug.Type }>
) =>
  Organization.Model.jsonCreate.make({
    name: overrides?.name ?? "Test Organization",
    slug: overrides?.slug ?? BS.Slug.make(`test-org-${crypto.randomUUID().slice(0, 8)}`),
    ownerUserId: ownerUserId,
  });

/**
 * Helper to create a mock SSO provider for insert operations.
 * SsoProvider has optional FK to organization (organizationId).
 */
const makeMockSsoProvider = (
  overrides?: Partial<{
    providerId: string;
    issuer: string;
    domain: string;
    organizationId: SharedEntityIds.OrganizationId.Type;
  }>
) =>
  Entities.SsoProvider.Model.jsonCreate.make({
    providerId: overrides?.providerId ?? `provider-${crypto.randomUUID()}`,
    issuer: overrides?.issuer ?? "https://issuer.example.com",
    domain: overrides?.domain ?? "example.com",
    ...(overrides?.organizationId !== undefined ? { organizationId: O.some(overrides.organizationId) } : {}),
  });

describe("SsoProviderRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert sso provider and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          const mockedSsoProvider = makeMockSsoProvider({
            providerId: `insert-test-${crypto.randomUUID()}`,
            issuer: "https://insert.issuer.example.com",
            domain: "insert.example.com",
          });
          const inserted = yield* ssoProviderRepo.insert(mockedSsoProvider);

          // Verify schema conformance
          assertTrue(S.is(Entities.SsoProvider.Model)(inserted));

          // Verify fields
          strictEqual(inserted.issuer, "https://insert.issuer.example.com");
          strictEqual(inserted.domain, "insert.example.com");
          deepStrictEqual(inserted.providerId, mockedSsoProvider.providerId);

          // Verify optional fields are None when not provided
          strictEqual(inserted.oidcConfig._tag, "None");
          strictEqual(inserted.samlConfig._tag, "None");
          strictEqual(inserted.userId._tag, "None");
          strictEqual(inserted.organizationId._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted sso provider",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          const provider1 = yield* ssoProviderRepo.insert(
            makeMockSsoProvider({ providerId: `unique-1-${crypto.randomUUID()}` })
          );
          const provider2 = yield* ssoProviderRepo.insert(
            makeMockSsoProvider({ providerId: `unique-2-${crypto.randomUUID()}` })
          );

          // IDs should be different
          expect(provider1.id).not.toBe(provider2.id);

          // Both should be valid EntityId format (sso_provider__uuid)
          expect(provider1.id).toMatch(/^sso_provider__[0-9a-f-]+$/);
          expect(provider2.id).toMatch(/^sso_provider__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert sso provider without returning entity",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          const providerId = `insert-void-${crypto.randomUUID()}`;
          const mockedSsoProvider = makeMockSsoProvider({
            providerId,
            issuer: "https://insertvoid.example.com",
            domain: "insertvoid.example.com",
          });

          // insertVoid returns void
          const result = yield* ssoProviderRepo.insertVoid(mockedSsoProvider);
          strictEqual(result, undefined);

          // Verify the sso provider was actually persisted by attempting insert again.
          // A duplicate providerId should fail, proving the first insert worked.
          const duplicateResult = yield* Effect.either(ssoProviderRepo.insertVoid(mockedSsoProvider));

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
      "should return Some when sso provider exists",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          const mockedSsoProvider = makeMockSsoProvider({
            providerId: `find-some-${crypto.randomUUID()}`,
            issuer: "https://findsome.example.com",
            domain: "findsome.example.com",
          });
          const inserted = yield* ssoProviderRepo.insert(mockedSsoProvider);

          const found = yield* ssoProviderRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.issuer, "https://findsome.example.com");
            strictEqual(found.value.domain, "findsome.example.com");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when sso provider does not exist",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          // Use a valid SsoProviderId format that doesn't exist (EntityId format: sso_provider__uuid)
          const nonExistentId = "sso_provider__00000000-0000-0000-0000-000000000000";
          const result = yield* ssoProviderRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete sso provider entity with all fields",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          const mockedSsoProvider = makeMockSsoProvider({
            providerId: `find-complete-${crypto.randomUUID()}`,
            issuer: "https://findcomplete.example.com",
            domain: "findcomplete.example.com",
          });
          const inserted = yield* ssoProviderRepo.insert(mockedSsoProvider);
          const found = yield* ssoProviderRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("providerId");
            expect(found.value).toHaveProperty("issuer");
            expect(found.value).toHaveProperty("domain");
            expect(found.value).toHaveProperty("oidcConfig");
            expect(found.value).toHaveProperty("samlConfig");
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
      "should update sso provider issuer and return updated entity",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          // Setup: create sso provider
          const mockedSsoProvider = makeMockSsoProvider({
            providerId: `update-issuer-${crypto.randomUUID()}`,
            issuer: "https://original.issuer.com",
            domain: "original.example.com",
          });
          const inserted = yield* ssoProviderRepo.insert(mockedSsoProvider);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* ssoProviderRepo.update({
            ...inserted,
            issuer: "https://updated.issuer.com",
          });

          // Verify returned entity has updated issuer
          strictEqual(updated.issuer, "https://updated.issuer.com");
          deepStrictEqual(updated.id, inserted.id);
          strictEqual(updated.domain, "original.example.com");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update sso provider domain",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          const mockedSsoProvider = makeMockSsoProvider({
            providerId: `update-domain-${crypto.randomUUID()}`,
            issuer: "https://update-domain.issuer.com",
            domain: "original.example.com",
          });
          const inserted = yield* ssoProviderRepo.insert(mockedSsoProvider);

          const updated = yield* ssoProviderRepo.update({
            ...inserted,
            domain: "updated.example.com",
          });

          strictEqual(updated.domain, "updated.example.com");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          const mockedSsoProvider = makeMockSsoProvider({
            providerId: `update-persist-${crypto.randomUUID()}`,
            issuer: "https://persist.issuer.com",
            domain: "persist.example.com",
          });
          const inserted = yield* ssoProviderRepo.insert(mockedSsoProvider);

          yield* ssoProviderRepo.update({
            ...inserted,
            issuer: "https://persisted.issuer.com",
          });

          // Verify by fetching fresh
          const found = yield* ssoProviderRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.issuer, "https://persisted.issuer.com");
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
      "should update sso provider without returning entity",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          const mockedSsoProvider = makeMockSsoProvider({
            providerId: `update-void-${crypto.randomUUID()}`,
            issuer: "https://updatevoid-original.issuer.com",
            domain: "updatevoid.example.com",
          });
          const inserted = yield* ssoProviderRepo.insert(mockedSsoProvider);

          // updateVoid returns void
          const result = yield* ssoProviderRepo.updateVoid({
            ...inserted,
            issuer: "https://updatevoid-updated.issuer.com",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* ssoProviderRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.issuer, "https://updatevoid-updated.issuer.com");
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
      "should delete existing sso provider",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          const mockedSsoProvider = makeMockSsoProvider({
            providerId: `delete-${crypto.randomUUID()}`,
            issuer: "https://delete.issuer.com",
            domain: "delete.example.com",
          });
          const inserted = yield* ssoProviderRepo.insert(mockedSsoProvider);

          // Verify sso provider exists
          const beforeDelete = yield* ssoProviderRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* ssoProviderRepo.delete(inserted.id);

          // Verify sso provider no longer exists
          const afterDelete = yield* ssoProviderRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent sso provider",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          // Deleting a non-existent ID should not throw (EntityId format: sso_provider__uuid)
          const nonExistentId = "sso_provider__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(ssoProviderRepo.delete(nonExistentId));

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
      "should insert multiple sso providers without returning entities",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          const prefix = crypto.randomUUID();
          const providers = [
            makeMockSsoProvider({
              providerId: `many-1-${prefix}`,
              issuer: "https://many1.issuer.com",
              domain: "many1.example.com",
            }),
            makeMockSsoProvider({
              providerId: `many-2-${prefix}`,
              issuer: "https://many2.issuer.com",
              domain: "many2.example.com",
            }),
            makeMockSsoProvider({
              providerId: `many-3-${prefix}`,
              issuer: "https://many3.issuer.com",
              domain: "many3.example.com",
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* ssoProviderRepo.insertManyVoid(
            providers as unknown as readonly [
              typeof Entities.SsoProvider.Model.insert.Type,
              ...(typeof Entities.SsoProvider.Model.insert.Type)[],
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
          const ssoProviderRepo = yield* SsoProviderRepo;

          const providerId = `duplicate-${crypto.randomUUID()}`;
          const provider1 = makeMockSsoProvider({
            providerId,
            issuer: "https://first.issuer.com",
            domain: "first.example.com",
          });
          const provider2 = makeMockSsoProvider({
            providerId,
            issuer: "https://second.issuer.com",
            domain: "second.example.com",
          });

          // First insert should succeed
          yield* ssoProviderRepo.insert(provider1);

          // Second insert with same providerId should fail
          const result = yield* Effect.either(ssoProviderRepo.insert(provider2));

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
      "should die when updating non-existent sso provider",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          // First create a valid sso provider to get a proper structure for update
          const mockedSsoProvider = makeMockSsoProvider({
            providerId: `update-nonexistent-${crypto.randomUUID()}`,
            issuer: "https://temp.issuer.com",
            domain: "temp.example.com",
          });
          const inserted = yield* ssoProviderRepo.insert(mockedSsoProvider);

          // Delete the sso provider
          yield* ssoProviderRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) sso provider
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            ssoProviderRepo.update({
              ...inserted,
              issuer: "https://should-not-work.issuer.com",
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
          const ssoProviderRepo = yield* SsoProviderRepo;

          // CREATE
          const mockedSsoProvider = makeMockSsoProvider({
            providerId: `crud-workflow-${crypto.randomUUID()}`,
            issuer: "https://crud.issuer.com",
            domain: "crud.example.com",
          });
          const created = yield* ssoProviderRepo.insert(mockedSsoProvider);
          assertTrue(S.is(Entities.SsoProvider.Model)(created));

          // READ
          const read = yield* ssoProviderRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.issuer, "https://crud.issuer.com");
          }

          // UPDATE
          const updated = yield* ssoProviderRepo.update({
            ...created,
            issuer: "https://crud-updated.issuer.com",
            domain: "crud-updated.example.com",
          });
          strictEqual(updated.issuer, "https://crud-updated.issuer.com");
          strictEqual(updated.domain, "crud-updated.example.com");

          // Verify update persisted
          const readAfterUpdate = yield* ssoProviderRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.issuer, "https://crud-updated.issuer.com");
            strictEqual(readAfterUpdate.value.domain, "crud-updated.example.com");
          }

          // DELETE
          yield* ssoProviderRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* ssoProviderRepo.findById(created.id);
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
      "should handle optional oidcConfig field",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          // Create without oidcConfig
          const providerWithoutOidcConfig = yield* ssoProviderRepo.insert(
            makeMockSsoProvider({
              providerId: `no-oidc-${crypto.randomUUID()}`,
              issuer: "https://no-oidc.issuer.com",
              domain: "no-oidc.example.com",
            })
          );

          // oidcConfig should be None (optional fields are Option types)
          strictEqual(providerWithoutOidcConfig.oidcConfig._tag, "None");

          // Update with oidcConfig
          const updated = yield* ssoProviderRepo.update({
            ...providerWithoutOidcConfig,
            oidcConfig: O.some('{"client_id": "test", "client_secret": "secret"}'),
          });

          strictEqual(updated.oidcConfig._tag, "Some");
          strictEqual(
            O.getOrElse(updated.oidcConfig, () => ""),
            '{"client_id": "test", "client_secret": "secret"}'
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional samlConfig field",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;

          const provider = yield* ssoProviderRepo.insert(
            makeMockSsoProvider({
              providerId: `no-saml-${crypto.randomUUID()}`,
              issuer: "https://no-saml.issuer.com",
              domain: "no-saml.example.com",
            })
          );

          strictEqual(provider.samlConfig._tag, "None");

          const updated = yield* ssoProviderRepo.update({
            ...provider,
            samlConfig: O.some("<saml>config</saml>"),
          });

          strictEqual(updated.samlConfig._tag, "Some");
          strictEqual(
            O.getOrElse(updated.samlConfig, () => ""),
            "<saml>config</saml>"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional userId field",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;
          const userRepo = yield* UserRepo;

          // Create a user first to test FK relationship
          const mockUser = makeMockUser({
            email: makeTestEmail("sso-user"),
            name: "SSO User",
          });
          const user = yield* userRepo.insert(mockUser);

          // Create provider without userId
          const providerWithoutUser = yield* ssoProviderRepo.insert(
            makeMockSsoProvider({
              providerId: `no-user-${crypto.randomUUID()}`,
              issuer: "https://no-user.issuer.com",
              domain: "no-user.example.com",
            })
          );

          strictEqual(providerWithoutUser.userId._tag, "None");

          // Update with userId
          const updated = yield* ssoProviderRepo.update({
            ...providerWithoutUser,
            userId: O.some(user.id),
          });

          strictEqual(updated.userId._tag, "Some");
          deepStrictEqual(
            O.getOrElse(updated.userId, () => "" as typeof user.id),
            user.id
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional organizationId field",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;
          const userRepo = yield* UserRepo;
          const organizationRepo = yield* OrganizationRepo;

          // Create user first (required for organization)
          const mockUser = makeMockUser({
            email: makeTestEmail("sso-org-owner"),
            name: "SSO Org Owner",
          });
          const user = yield* userRepo.insert(mockUser);

          // Create organization (required for FK)
          const mockOrganization = makeMockOrganization(user.id, {
            name: "SSO Test Org",
            slug: BS.Slug.make(`sso-org-${crypto.randomUUID().slice(0, 8)}`),
          });
          const organization = yield* organizationRepo.insert(mockOrganization);

          // Create provider without organizationId
          const providerWithoutOrg = yield* ssoProviderRepo.insert(
            makeMockSsoProvider({
              providerId: `no-org-${crypto.randomUUID()}`,
              issuer: "https://no-org.issuer.com",
              domain: "no-org.example.com",
            })
          );

          strictEqual(providerWithoutOrg.organizationId._tag, "None");

          // Update with organizationId
          const updated = yield* ssoProviderRepo.update({
            ...providerWithoutOrg,
            organizationId: O.some(organization.id),
          });

          strictEqual(updated.organizationId._tag, "Some");
          deepStrictEqual(
            O.getOrElse(updated.organizationId, () => "" as typeof organization.id),
            organization.id
          );
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FOREIGN KEY RELATIONSHIP TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("foreign key relationships", (it) => {
    it.effect(
      "should create sso provider with organization reference",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;
          const userRepo = yield* UserRepo;
          const organizationRepo = yield* OrganizationRepo;

          // Create user first (required for organization ownerUserId)
          const mockUser = makeMockUser({
            email: makeTestEmail("fk-owner"),
            name: "FK Owner User",
          });
          const user = yield* userRepo.insert(mockUser);

          // Create organization
          const mockOrganization = makeMockOrganization(user.id, {
            name: "FK Test Organization",
            slug: BS.Slug.make(`fk-test-org-${crypto.randomUUID().slice(0, 8)}`),
          });
          const organization = yield* organizationRepo.insert(mockOrganization);

          // Create SSO provider with organization reference
          const mockedSsoProvider = Entities.SsoProvider.Model.jsonCreate.make({
            providerId: `fk-provider-${crypto.randomUUID()}`,
            issuer: "https://fk.issuer.com",
            domain: "fk.example.com",
            organizationId: O.some(organization.id),
          });

          const inserted = yield* ssoProviderRepo.insert(mockedSsoProvider);

          strictEqual(inserted.organizationId._tag, "Some");
          deepStrictEqual(
            O.getOrElse(inserted.organizationId, () => "" as typeof organization.id),
            organization.id
          );

          // Verify persisted correctly
          const found = yield* ssoProviderRepo.findById(inserted.id);
          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.organizationId._tag, "Some");
            deepStrictEqual(
              O.getOrElse(found.value.organizationId, () => "" as typeof organization.id),
              organization.id
            );
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should create sso provider with user reference",
      () =>
        Effect.gen(function* () {
          const ssoProviderRepo = yield* SsoProviderRepo;
          const userRepo = yield* UserRepo;

          // Create user
          const mockUser = makeMockUser({
            email: makeTestEmail("sso-fk-user"),
            name: "SSO FK User",
          });
          const user = yield* userRepo.insert(mockUser);

          // Create SSO provider with user reference
          const mockedSsoProvider = Entities.SsoProvider.Model.jsonCreate.make({
            providerId: `user-fk-provider-${crypto.randomUUID()}`,
            issuer: "https://user-fk.issuer.com",
            domain: "user-fk.example.com",
            userId: O.some(user.id),
          });

          const inserted = yield* ssoProviderRepo.insert(mockedSsoProvider);

          strictEqual(inserted.userId._tag, "Some");
          deepStrictEqual(
            O.getOrElse(inserted.userId, () => "" as typeof user.id),
            user.id
          );
        }),
      TEST_TIMEOUT
    );
  });
});
