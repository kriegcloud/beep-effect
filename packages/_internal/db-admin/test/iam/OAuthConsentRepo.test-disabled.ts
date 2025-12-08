import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { OAuthConsentRepo, OrganizationRepo, UserRepo } from "@beep/iam-infra";
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

/**
 * Helper to create a mock OAuth consent for insert operations.
 * Requires organizationId since it's a foreign key dependency.
 */
const makeMockOAuthConsent = (overrides: {
  organizationId: SharedEntityIds.OrganizationId.Type;
  clientId?: string;
  scopes?: string;
  consentGiven?: boolean;
  userId?: SharedEntityIds.UserId.Type;
}) =>
  Entities.OAuthConsent.Model.jsonCreate.make({
    organizationId: overrides.organizationId,
    clientId: overrides.clientId ?? `client-${crypto.randomUUID().slice(0, 8)}`,
    scopes: overrides.scopes ?? "read write",
    consentGiven: overrides.consentGiven ?? false,
    ...(overrides.userId ? { userId: O.some(overrides.userId) } : {}),
  });

describe("OAuthConsentRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert OAuth consent and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user (FK dependency for organization)
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-insert-owner"),
              name: "Consent Insert Owner",
            })
          );

          // Create organization (FK dependency for consent)
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Consent Insert Organization",
              slug: makeTestSlug("consent-insert"),
            })
          );

          const clientId = `client-${crypto.randomUUID().slice(0, 8)}`;
          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId,
            scopes: "read write profile",
            consentGiven: true,
          });
          const inserted = yield* consentRepo.insert(mockedConsent);

          // Verify schema conformance
          assertTrue(S.is(Entities.OAuthConsent.Model)(inserted));

          // Verify fields
          strictEqual(inserted.clientId, clientId);
          strictEqual(inserted.scopes, "read write profile");
          strictEqual(inserted.consentGiven, true);
          deepStrictEqual(inserted.organizationId, org.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted OAuth consent",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-unique-owner"),
              name: "Unique ID Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Unique ID Organization",
              slug: makeTestSlug("consent-unique"),
            })
          );

          const consent1 = yield* consentRepo.insert(
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-1-${crypto.randomUUID().slice(0, 8)}`,
              scopes: "read",
            })
          );
          const consent2 = yield* consentRepo.insert(
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-2-${crypto.randomUUID().slice(0, 8)}`,
              scopes: "write",
            })
          );

          // IDs should be different
          expect(consent1.id).not.toBe(consent2.id);

          // Both should be valid EntityId format (oauth_consent__uuid)
          expect(consent1.id).toMatch(/^oauth_consent__[0-9a-f-]+$/);
          expect(consent2.id).toMatch(/^oauth_consent__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert OAuth consent without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-void-owner"),
              name: "InsertVoid Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "InsertVoid Organization",
              slug: makeTestSlug("consent-void"),
            })
          );

          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId: `client-void-${crypto.randomUUID().slice(0, 8)}`,
            scopes: "read",
          });

          // insertVoid returns void
          const result = yield* consentRepo.insertVoid(mockedConsent);
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
      "should return Some when OAuth consent exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-find-some-owner"),
              name: "FindById Some Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "FindById Some Organization",
              slug: makeTestSlug("consent-find-some"),
            })
          );

          const clientId = `client-find-${crypto.randomUUID().slice(0, 8)}`;
          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId,
            scopes: "read write",
          });
          const inserted = yield* consentRepo.insert(mockedConsent);

          const found = yield* consentRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.clientId, clientId);
            strictEqual(found.value.scopes, "read write");
            deepStrictEqual(found.value.organizationId, org.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when OAuth consent does not exist",
      () =>
        Effect.gen(function* () {
          const consentRepo = yield* OAuthConsentRepo;

          // Use a valid OAuthConsentId format that doesn't exist (EntityId format: oauth_consent__uuid)
          const nonExistentId = "oauth_consent__00000000-0000-0000-0000-000000000000";
          const result = yield* consentRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete OAuth consent entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-find-complete-owner"),
              name: "Complete Consent Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Complete Consent Organization",
              slug: makeTestSlug("consent-find-complete"),
            })
          );

          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId: `client-complete-${crypto.randomUUID().slice(0, 8)}`,
            scopes: "read write profile email",
          });
          const inserted = yield* consentRepo.insert(mockedConsent);
          const found = yield* consentRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("clientId");
            expect(found.value).toHaveProperty("scopes");
            expect(found.value).toHaveProperty("consentGiven");
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
      "should update OAuth consent scopes and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-update-scopes-owner"),
              name: "Update Scopes Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Scopes Organization",
              slug: makeTestSlug("consent-update-scopes"),
            })
          );

          // Setup: create consent
          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId: `client-update-${crypto.randomUUID().slice(0, 8)}`,
            scopes: "read",
          });
          const inserted = yield* consentRepo.insert(mockedConsent);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* consentRepo.update({
            ...inserted,
            scopes: "read write profile email",
          });

          // Verify returned entity has updated scopes
          strictEqual(updated.scopes, "read write profile email");
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.organizationId, org.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update consentGiven field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-update-given-owner"),
              name: "Update Given Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Given Organization",
              slug: makeTestSlug("consent-update-given"),
            })
          );

          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId: `client-given-${crypto.randomUUID().slice(0, 8)}`,
            scopes: "read",
            consentGiven: false,
          });
          const inserted = yield* consentRepo.insert(mockedConsent);

          // Initially should be false
          strictEqual(inserted.consentGiven, false);

          // Update to true
          const updated = yield* consentRepo.update({
            ...inserted,
            consentGiven: true,
          });

          strictEqual(updated.consentGiven, true);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update clientId field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-update-clientid-owner"),
              name: "Update ClientId Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update ClientId Organization",
              slug: makeTestSlug("consent-update-clientid"),
            })
          );

          const originalClientId = `client-original-${crypto.randomUUID().slice(0, 8)}`;
          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId: originalClientId,
            scopes: "read",
          });
          const inserted = yield* consentRepo.insert(mockedConsent);

          strictEqual(inserted.clientId, originalClientId);

          const newClientId = `client-updated-${crypto.randomUUID().slice(0, 8)}`;
          const updated = yield* consentRepo.update({
            ...inserted,
            clientId: newClientId,
          });

          strictEqual(updated.clientId, newClientId);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-update-persist-owner"),
              name: "Persist Test Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Persist Test Organization",
              slug: makeTestSlug("consent-update-persist"),
            })
          );

          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId: `client-persist-${crypto.randomUUID().slice(0, 8)}`,
            scopes: "read",
          });
          const inserted = yield* consentRepo.insert(mockedConsent);

          yield* consentRepo.update({
            ...inserted,
            scopes: "read write admin",
          });

          // Verify by fetching fresh
          const found = yield* consentRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.scopes, "read write admin");
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
      "should update OAuth consent without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-updatevoid-owner"),
              name: "UpdateVoid Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "UpdateVoid Organization",
              slug: makeTestSlug("consent-updatevoid"),
            })
          );

          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId: `client-updatevoid-${crypto.randomUUID().slice(0, 8)}`,
            scopes: "read",
          });
          const inserted = yield* consentRepo.insert(mockedConsent);

          // updateVoid returns void
          const result = yield* consentRepo.updateVoid({
            ...inserted,
            scopes: "read write profile",
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* consentRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.scopes, "read write profile");
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
      "should delete existing OAuth consent",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-delete-owner"),
              name: "Delete Test Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Delete Test Organization",
              slug: makeTestSlug("consent-delete"),
            })
          );

          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId: `client-delete-${crypto.randomUUID().slice(0, 8)}`,
            scopes: "read",
          });
          const inserted = yield* consentRepo.insert(mockedConsent);

          // Verify consent exists
          const beforeDelete = yield* consentRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* consentRepo.delete(inserted.id);

          // Verify consent no longer exists
          const afterDelete = yield* consentRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent OAuth consent",
      () =>
        Effect.gen(function* () {
          const consentRepo = yield* OAuthConsentRepo;

          // Deleting a non-existent ID should not throw (EntityId format: oauth_consent__uuid)
          const nonExistentId = "oauth_consent__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(consentRepo.delete(nonExistentId));

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
      "should insert multiple OAuth consents without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-many-owner"),
              name: "Batch Insert Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Batch Insert Organization",
              slug: makeTestSlug("consent-many"),
            })
          );

          const prefix = crypto.randomUUID().slice(0, 8);
          const consents = [
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-batch-1-${prefix}`,
              scopes: "read",
            }),
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-batch-2-${prefix}`,
              scopes: "write",
            }),
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-batch-3-${prefix}`,
              scopes: "admin",
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* consentRepo.insertManyVoid(
            consents as unknown as readonly [
              typeof Entities.OAuthConsent.Model.insert.Type,
              ...(typeof Entities.OAuthConsent.Model.insert.Type)[],
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
      "should die when updating non-existent OAuth consent",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // First create a valid consent to get a proper structure for update
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-update-nonexistent-owner"),
              name: "Update Nonexistent Owner",
            })
          );

          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update Nonexistent Organization",
              slug: makeTestSlug("consent-update-nonexistent"),
            })
          );

          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId: `client-nonexistent-${crypto.randomUUID().slice(0, 8)}`,
            scopes: "read",
          });
          const inserted = yield* consentRepo.insert(mockedConsent);

          // Delete the consent
          yield* consentRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) consent
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            consentRepo.update({
              ...inserted,
              scopes: "should not work",
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
          const consentRepo = yield* OAuthConsentRepo;

          // Setup: create owner user and organization
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-crud-owner"),
              name: "CRUD Workflow Owner",
            })
          );

          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "CRUD Workflow Organization",
              slug: makeTestSlug("consent-crud"),
            })
          );

          // CREATE
          const mockedConsent = makeMockOAuthConsent({
            organizationId: org.id,
            clientId: `client-crud-${crypto.randomUUID().slice(0, 8)}`,
            scopes: "read",
            consentGiven: false,
          });
          const created = yield* consentRepo.insert(mockedConsent);
          assertTrue(S.is(Entities.OAuthConsent.Model)(created));

          // READ
          const read = yield* consentRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.scopes, "read");
            strictEqual(read.value.consentGiven, false);
          }

          // UPDATE
          const updated = yield* consentRepo.update({
            ...created,
            scopes: "read write profile",
            consentGiven: true,
          });
          strictEqual(updated.scopes, "read write profile");
          strictEqual(updated.consentGiven, true);

          // Verify update persisted
          const readAfterUpdate = yield* consentRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.scopes, "read write profile");
            strictEqual(readAfterUpdate.value.consentGiven, true);
          }

          // DELETE
          yield* consentRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* consentRepo.findById(created.id);
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
      "should handle optional userId field - None when not provided",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-no-userid-owner"),
              name: "No UserId Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "No UserId Organization",
              slug: makeTestSlug("consent-no-userid"),
            })
          );

          // Create consent without userId
          const consentWithoutUser = yield* consentRepo.insert(
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-no-user-${crypto.randomUUID().slice(0, 8)}`,
              scopes: "read",
            })
          );

          // userId should be None (optional fields are Option types)
          strictEqual(consentWithoutUser.userId._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional userId field - Some when provided",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-with-userid-owner"),
              name: "With UserId Owner",
            })
          );

          // Create consenting user
          const consentingUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-with-userid-user"),
              name: "Consenting User",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "With UserId Organization",
              slug: makeTestSlug("consent-with-userid"),
            })
          );

          // Create consent with userId
          const consentWithUser = yield* consentRepo.insert(
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-with-user-${crypto.randomUUID().slice(0, 8)}`,
              scopes: "read write",
              userId: consentingUser.id,
            })
          );

          // userId should be Some
          strictEqual(consentWithUser.userId._tag, "Some");
          deepStrictEqual(
            O.getOrElse(consentWithUser.userId, () => ""),
            consentingUser.id
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update optional userId field from None to Some",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-update-userid-owner"),
              name: "Update UserId Owner",
            })
          );

          // Create user to assign later
          const userToAssign = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-update-userid-user"),
              name: "User To Assign",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Update UserId Organization",
              slug: makeTestSlug("consent-update-userid"),
            })
          );

          // Create consent without userId initially
          const consent = yield* consentRepo.insert(
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-update-user-${crypto.randomUUID().slice(0, 8)}`,
              scopes: "read",
            })
          );

          strictEqual(consent.userId._tag, "None");

          // Update with userId
          const updated = yield* consentRepo.update({
            ...consent,
            userId: O.some(userToAssign.id),
          });

          strictEqual(updated.userId._tag, "Some");
          deepStrictEqual(
            O.getOrElse(updated.userId, () => ""),
            userToAssign.id
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle consentGiven default value",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-default-given-owner"),
              name: "Default Given Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Default Given Organization",
              slug: makeTestSlug("consent-default-given"),
            })
          );

          // Create consent without specifying consentGiven (should default to false)
          const consent = yield* consentRepo.insert(
            Entities.OAuthConsent.Model.jsonCreate.make({
              organizationId: org.id,
              clientId: `client-default-${crypto.randomUUID().slice(0, 8)}`,
              scopes: "read",
            })
          );

          // consentGiven should default to false
          strictEqual(consent.consentGiven, false);

          // Update to true
          const updated = yield* consentRepo.update({
            ...consent,
            consentGiven: true,
          });

          strictEqual(updated.consentGiven, true);
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
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-fk-org-owner"),
              name: "FK Org Test Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "FK Test Organization",
              slug: makeTestSlug("consent-fk-org"),
            })
          );

          const consent = yield* consentRepo.insert(
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-fk-${crypto.randomUUID().slice(0, 8)}`,
              scopes: "read",
            })
          );

          // Verify the organizationId matches the created organization
          deepStrictEqual(consent.organizationId, org.id);

          // Verify we can find the organization
          const foundOrg = yield* orgRepo.findById(consent.organizationId);
          strictEqual(foundOrg._tag, "Some");
          if (foundOrg._tag === "Some") {
            strictEqual(foundOrg.value.name, "FK Test Organization");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should maintain userId reference to existing user when provided",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-fk-user-owner"),
              name: "FK User Test Owner",
            })
          );

          // Create consenting user
          const consentingUser = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-fk-user-consenter"),
              name: "FK Consenting User",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "FK User Test Organization",
              slug: makeTestSlug("consent-fk-user"),
            })
          );

          const consent = yield* consentRepo.insert(
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-fk-user-${crypto.randomUUID().slice(0, 8)}`,
              scopes: "read write",
              userId: consentingUser.id,
            })
          );

          // Verify the userId matches the created user
          strictEqual(consent.userId._tag, "Some");
          if (consent.userId._tag === "Some") {
            deepStrictEqual(consent.userId.value, consentingUser.id);

            // Verify we can find the user
            const foundUser = yield* userRepo.findById(consent.userId.value);
            strictEqual(foundUser._tag, "Some");
            if (foundUser._tag === "Some") {
              strictEqual(foundUser.value.name, "FK Consenting User");
            }
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow multiple consents for same organization with different clients",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const consentRepo = yield* OAuthConsentRepo;

          // Create owner user
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("consent-multi-client-owner"),
              name: "Multi Client Owner",
            })
          );

          // Create organization
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Multi Client Organization",
              slug: makeTestSlug("consent-multi-client"),
            })
          );

          // Create multiple consents for the same organization
          const consent1 = yield* consentRepo.insert(
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-multi-1-${crypto.randomUUID().slice(0, 8)}`,
              scopes: "read",
            })
          );

          const consent2 = yield* consentRepo.insert(
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-multi-2-${crypto.randomUUID().slice(0, 8)}`,
              scopes: "write",
            })
          );

          const consent3 = yield* consentRepo.insert(
            makeMockOAuthConsent({
              organizationId: org.id,
              clientId: `client-multi-3-${crypto.randomUUID().slice(0, 8)}`,
              scopes: "admin",
            })
          );

          // All consents should have the same organizationId
          deepStrictEqual(consent1.organizationId, org.id);
          deepStrictEqual(consent2.organizationId, org.id);
          deepStrictEqual(consent3.organizationId, org.id);

          // But different IDs
          expect(consent1.id).not.toBe(consent2.id);
          expect(consent2.id).not.toBe(consent3.id);
          expect(consent1.id).not.toBe(consent3.id);
        }),
      TEST_TIMEOUT
    );
  });
});
