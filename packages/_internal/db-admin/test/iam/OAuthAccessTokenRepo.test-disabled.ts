import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { OAuthAccessTokenRepo, OrganizationRepo, UserRepo } from "@beep/iam-infra";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { Organization, User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import { pipe, Redacted } from "effect";
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
 * Helper to create a mock OAuth access token for insert operations.
 * Requires organizationId since it's a required field.
 * userId is optional for the model and must be wrapped in Option.
 */
const makeMockOAuthAccessToken = (overrides: {
  organizationId: SharedEntityIds.OrganizationId.Type;
  userId?: SharedEntityIds.UserId.Type;
  clientId?: string;
  scopes?: string;
}) =>
  Entities.OAuthAccessToken.Model.jsonCreate.make({
    organizationId: overrides.organizationId,
    ...(overrides.userId !== undefined ? { userId: O.some(overrides.userId) } : {}),
    ...(overrides.clientId !== undefined ? { clientId: O.some(overrides.clientId) } : {}),
    ...(overrides.scopes !== undefined ? { scopes: O.some(overrides.scopes) } : {}),
  });

describe("OAuthAccessTokenRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert oauth access token and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // First create user (for ownerUserId on organization)
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("token-insert-owner"),
              name: "Token Insert Owner",
            })
          );

          // Create organization (FK dependency)
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "Token Insert Organization",
              slug: makeTestSlug("token-insert"),
            })
          );

          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
            userId: owner.id,
            clientId: `client-${crypto.randomUUID()}`,
            scopes: "read write",
          });
          const inserted = yield* tokenRepo.insert(mockedToken);

          // Verify schema conformance
          assertTrue(S.is(Entities.OAuthAccessToken.Model)(inserted));

          // Verify required field
          deepStrictEqual(inserted.organizationId, org.id);

          // Verify optional fields are Option types
          strictEqual(inserted.userId._tag, "Some");
          strictEqual(inserted.clientId._tag, "Some");
          strictEqual(inserted.scopes._tag, "Some");
          strictEqual(inserted.accessToken._tag, "None");
          strictEqual(inserted.refreshToken._tag, "None");
          strictEqual(inserted.accessTokenExpiresAt._tag, "None");
          strictEqual(inserted.refreshTokenExpiresAt._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted oauth access token",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-unique-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-unique"),
            })
          );

          const token1 = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
              clientId: `client-1-${crypto.randomUUID()}`,
            })
          );
          const token2 = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
              clientId: `client-2-${crypto.randomUUID()}`,
            })
          );

          // IDs should be different
          expect(token1.id).not.toBe(token2.id);

          // Both should be valid EntityId format (oauth_access_token__uuid)
          expect(token1.id).toMatch(/^oauth_access_token__[0-9a-f-]+$/);
          expect(token2.id).toMatch(/^oauth_access_token__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert oauth access token without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-void-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-void"),
            })
          );

          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
            clientId: `void-${crypto.randomUUID()}`,
          });

          // insertVoid returns void
          const result = yield* tokenRepo.insertVoid(mockedToken);
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
      "should return Some when oauth access token exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-find-some-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-find-some"),
            })
          );

          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
            userId: owner.id,
            scopes: "read profile",
          });
          const inserted = yield* tokenRepo.insert(mockedToken);

          const found = yield* tokenRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            deepStrictEqual(found.value.organizationId, org.id);
            strictEqual(found.value.userId._tag, "Some");
            if (found.value.userId._tag === "Some") {
              deepStrictEqual(found.value.userId.value, owner.id);
            }
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when oauth access token does not exist",
      () =>
        Effect.gen(function* () {
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Use a valid OAuthAccessTokenId format that doesn't exist
          const nonExistentId = "oauth_access_token__00000000-0000-0000-0000-000000000000";
          const result = yield* tokenRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete oauth access token entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-find-complete-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-find-complete"),
            })
          );

          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
          });
          const inserted = yield* tokenRepo.insert(mockedToken);
          const found = yield* tokenRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("organizationId");
            expect(found.value).toHaveProperty("userId");
            expect(found.value).toHaveProperty("clientId");
            expect(found.value).toHaveProperty("scopes");
            expect(found.value).toHaveProperty("accessToken");
            expect(found.value).toHaveProperty("refreshToken");
            expect(found.value).toHaveProperty("accessTokenExpiresAt");
            expect(found.value).toHaveProperty("refreshTokenExpiresAt");
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
      "should update oauth access token scopes and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-update-scopes-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-update-scopes"),
            })
          );

          // Setup: create token
          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
            scopes: "read",
          });
          const inserted = yield* tokenRepo.insert(mockedToken);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* tokenRepo.update({
            ...inserted,
            scopes: O.some("read write admin"),
          });

          // Verify returned entity has updated scopes
          strictEqual(updated.scopes._tag, "Some");
          strictEqual(
            O.getOrElse(updated.scopes, () => ""),
            "read write admin"
          );
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.organizationId, org.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update accessToken field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-update-access-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-update-access"),
            })
          );

          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
          });
          const inserted = yield* tokenRepo.insert(mockedToken);

          // Initially should be None
          strictEqual(inserted.accessToken._tag, "None");

          // Update with access token
          const updated = yield* tokenRepo.update({
            ...inserted,
            accessToken: O.some(Redacted.make("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test_access_token")),
          });

          strictEqual(updated.accessToken._tag, "Some");
          strictEqual(
            pipe(
              updated.accessToken,
              O.map(Redacted.value),
              O.getOrElse(() => "")
            ),
            "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test_access_token"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update clientId field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-update-client-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-update-client"),
            })
          );

          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
            clientId: "original-client-id",
          });
          const inserted = yield* tokenRepo.insert(mockedToken);

          strictEqual(
            O.getOrElse(inserted.clientId, () => ""),
            "original-client-id"
          );

          const updated = yield* tokenRepo.update({
            ...inserted,
            clientId: O.some("updated-client-id"),
          });

          strictEqual(
            O.getOrElse(updated.clientId, () => ""),
            "updated-client-id"
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
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-update-persist-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-update-persist"),
            })
          );

          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
            scopes: "read",
          });
          const inserted = yield* tokenRepo.insert(mockedToken);

          yield* tokenRepo.update({
            ...inserted,
            scopes: O.some("read write delete"),
          });

          // Verify by fetching fresh
          const found = yield* tokenRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(
              O.getOrElse(found.value.scopes, () => ""),
              "read write delete"
            );
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
      "should update oauth access token without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-updatevoid-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-updatevoid"),
            })
          );

          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
            scopes: "read",
          });
          const inserted = yield* tokenRepo.insert(mockedToken);

          // updateVoid returns void
          const result = yield* tokenRepo.updateVoid({
            ...inserted,
            scopes: O.some("read write"),
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* tokenRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(
              O.getOrElse(found.value.scopes, () => ""),
              "read write"
            );
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
      "should delete existing oauth access token",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-delete-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-delete"),
            })
          );

          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
          });
          const inserted = yield* tokenRepo.insert(mockedToken);

          // Verify token exists
          const beforeDelete = yield* tokenRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* tokenRepo.delete(inserted.id);

          // Verify token no longer exists
          const afterDelete = yield* tokenRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent oauth access token (idempotent)",
      () =>
        Effect.gen(function* () {
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Deleting a non-existent ID should not throw
          const nonExistentId = "oauth_access_token__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(tokenRepo.delete(nonExistentId));

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
      "should insert multiple oauth access tokens without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-many-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-many"),
            })
          );

          const prefix = crypto.randomUUID();
          const tokens = [
            makeMockOAuthAccessToken({
              organizationId: org.id,
              clientId: `batch-1-${prefix}`,
              scopes: "read",
            }),
            makeMockOAuthAccessToken({
              organizationId: org.id,
              clientId: `batch-2-${prefix}`,
              scopes: "write",
            }),
            makeMockOAuthAccessToken({
              organizationId: org.id,
              clientId: `batch-3-${prefix}`,
              scopes: "admin",
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* tokenRepo.insertManyVoid(
            tokens as unknown as readonly [
              typeof Entities.OAuthAccessToken.Model.insert.Type,
              ...(typeof Entities.OAuthAccessToken.Model.insert.Type)[],
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
      "should die when updating non-existent oauth access token",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // First create a valid token to get a proper structure for update
          const owner = yield* userRepo.insert(
            makeMockUser({ email: makeTestEmail("token-update-nonexistent-owner") })
          );
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-update-nonexistent"),
            })
          );

          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
          });
          const inserted = yield* tokenRepo.insert(mockedToken);

          // Delete the token
          yield* tokenRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) token
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            tokenRepo.update({
              ...inserted,
              scopes: O.some("should-not-work"),
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
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Setup: create user and organization
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("token-crud-owner"),
              name: "CRUD Workflow Owner",
            })
          );
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "CRUD Workflow Organization",
              slug: makeTestSlug("token-crud"),
            })
          );

          // CREATE
          const mockedToken = makeMockOAuthAccessToken({
            organizationId: org.id,
            userId: owner.id,
            clientId: `crud-${crypto.randomUUID()}`,
            scopes: "read",
          });
          const created = yield* tokenRepo.insert(mockedToken);
          assertTrue(S.is(Entities.OAuthAccessToken.Model)(created));

          // READ
          const read = yield* tokenRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(
              O.getOrElse(read.value.scopes, () => ""),
              "read"
            );
            deepStrictEqual(read.value.organizationId, org.id);
          }

          // UPDATE
          const updated = yield* tokenRepo.update({
            ...created,
            scopes: O.some("read write admin"),
            accessToken: O.some(Redacted.make("updated-access-token")),
          });
          strictEqual(
            O.getOrElse(updated.scopes, () => ""),
            "read write admin"
          );
          strictEqual(
            pipe(
              updated.accessToken,
              O.map(Redacted.value),
              O.getOrElse(() => "")
            ),
            "updated-access-token"
          );

          // Verify update persisted
          const readAfterUpdate = yield* tokenRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(
              O.getOrElse(readAfterUpdate.value.scopes, () => ""),
              "read write admin"
            );
            strictEqual(
              pipe(
                readAfterUpdate.value.accessToken,
                O.map(Redacted.value),
                O.getOrElse(() => "")
              ),
              "updated-access-token"
            );
          }

          // DELETE
          yield* tokenRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* tokenRepo.findById(created.id);
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
      "should handle optional accessToken field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-opt-access-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-opt-access"),
            })
          );

          // Create without accessToken
          const tokenWithoutAccess = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
            })
          );

          // accessToken should be None (optional fields are Option types)
          strictEqual(tokenWithoutAccess.accessToken._tag, "None");

          // Update with accessToken
          const updated = yield* tokenRepo.update({
            ...tokenWithoutAccess,
            accessToken: O.some(Redacted.make("ya29.a0ARrdaM_test_access_token")),
          });

          strictEqual(updated.accessToken._tag, "Some");
          strictEqual(
            pipe(
              updated.accessToken,
              O.map(Redacted.value),
              O.getOrElse(() => "")
            ),
            "ya29.a0ARrdaM_test_access_token"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional refreshToken field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-opt-refresh-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-opt-refresh"),
            })
          );

          const token = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
            })
          );

          strictEqual(token.refreshToken._tag, "None");

          const updated = yield* tokenRepo.update({
            ...token,
            refreshToken: O.some(Redacted.make("1//0test_refresh_token")),
          });

          strictEqual(updated.refreshToken._tag, "Some");
          strictEqual(
            pipe(
              updated.refreshToken,
              O.map(Redacted.value),
              O.getOrElse(() => "")
            ),
            "1//0test_refresh_token"
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
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create users and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-opt-userid-owner") }));
          const tokenUser = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-opt-userid-user") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-opt-userid"),
            })
          );

          // Create without userId
          const token = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
            })
          );

          strictEqual(token.userId._tag, "None");

          // Update with userId
          const updated = yield* tokenRepo.update({
            ...token,
            userId: O.some(tokenUser.id),
          });

          strictEqual(updated.userId._tag, "Some");
          if (updated.userId._tag === "Some") {
            deepStrictEqual(updated.userId.value, tokenUser.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional clientId field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-opt-clientid-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-opt-clientid"),
            })
          );

          // Create without clientId
          const token = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
            })
          );

          strictEqual(token.clientId._tag, "None");

          const updated = yield* tokenRepo.update({
            ...token,
            clientId: O.some("my-oauth-client-id"),
          });

          strictEqual(updated.clientId._tag, "Some");
          strictEqual(
            O.getOrElse(updated.clientId, () => ""),
            "my-oauth-client-id"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional scopes field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-opt-scopes-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-opt-scopes"),
            })
          );

          // Create without scopes
          const token = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
            })
          );

          strictEqual(token.scopes._tag, "None");

          const updated = yield* tokenRepo.update({
            ...token,
            scopes: O.some("openid email profile"),
          });

          strictEqual(updated.scopes._tag, "Some");
          strictEqual(
            O.getOrElse(updated.scopes, () => ""),
            "openid email profile"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle multiple optional fields together",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("token-opt-multi-owner") }));
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-opt-multi"),
            })
          );

          const token = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
            })
          );

          // Update with all optional fields at once
          const updated = yield* tokenRepo.update({
            ...token,
            accessToken: O.some(Redacted.make("access-token-value")),
            refreshToken: O.some(Redacted.make("refresh-token-value")),
            clientId: O.some("client-id-value"),
            scopes: O.some("read write"),
            userId: O.some(owner.id),
          });

          strictEqual(updated.accessToken._tag, "Some");
          strictEqual(updated.refreshToken._tag, "Some");
          strictEqual(updated.clientId._tag, "Some");
          strictEqual(updated.scopes._tag, "Some");
          strictEqual(updated.userId._tag, "Some");

          // Verify persisted
          const found = yield* tokenRepo.findById(token.id);
          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(
              pipe(
                found.value.accessToken,
                O.map(Redacted.value),
                O.getOrElse(() => "")
              ),
              "access-token-value"
            );
            strictEqual(
              pipe(
                found.value.refreshToken,
                O.map(Redacted.value),
                O.getOrElse(() => "")
              ),
              "refresh-token-value"
            );
            strictEqual(
              O.getOrElse(found.value.clientId, () => ""),
              "client-id-value"
            );
            strictEqual(
              O.getOrElse(found.value.scopes, () => ""),
              "read write"
            );
          }
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FOREIGN KEY RELATIONSHIP TESTS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("foreign key relationships", (it) => {
    it.effect(
      "should correctly associate token with organization",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("token-fk-org-owner"),
              name: "FK Org Test Owner",
            })
          );
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              name: "FK Org Test Organization",
              slug: makeTestSlug("token-fk-org"),
            })
          );

          // Create token linked to organization
          const token = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
            })
          );

          // Verify FK relationship
          deepStrictEqual(token.organizationId, org.id);

          // Verify we can find the organization
          const foundOrg = yield* orgRepo.findById(token.organizationId);
          strictEqual(foundOrg._tag, "Some");
          if (foundOrg._tag === "Some") {
            strictEqual(foundOrg.value.name, "FK Org Test Organization");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should correctly associate token with user",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("token-fk-user-owner"),
              name: "FK User Test Owner",
            })
          );
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-fk-user"),
            })
          );

          // Create token linked to user
          const token = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
              userId: owner.id,
            })
          );

          // Verify FK relationship
          strictEqual(token.userId._tag, "Some");
          if (token.userId._tag === "Some") {
            deepStrictEqual(token.userId.value, owner.id);

            // Verify we can find the user
            const foundUser = yield* userRepo.findById(token.userId.value);
            strictEqual(foundUser._tag, "Some");
            if (foundUser._tag === "Some") {
              strictEqual(foundUser.value.name, "FK User Test Owner");
            }
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow multiple tokens for same organization",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("token-fk-multi-owner"),
              name: "Multi Token Owner",
            })
          );
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-fk-multi"),
            })
          );

          // Create multiple tokens for same organization
          const token1 = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
              clientId: `client-1-${crypto.randomUUID()}`,
              scopes: "read",
            })
          );

          const token2 = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
              clientId: `client-2-${crypto.randomUUID()}`,
              scopes: "write",
            })
          );

          const token3 = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
              clientId: `client-3-${crypto.randomUUID()}`,
              scopes: "admin",
            })
          );

          // All tokens should have same organizationId
          deepStrictEqual(token1.organizationId, org.id);
          deepStrictEqual(token2.organizationId, org.id);
          deepStrictEqual(token3.organizationId, org.id);

          // But different token IDs
          expect(token1.id).not.toBe(token2.id);
          expect(token2.id).not.toBe(token3.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow multiple tokens for same user",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const tokenRepo = yield* OAuthAccessTokenRepo;

          // Create user and organization
          const owner = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("token-fk-multiuser-owner"),
              name: "Multi Token User Owner",
            })
          );
          const org = yield* orgRepo.insert(
            makeMockOrganization({
              ownerUserId: owner.id,
              slug: makeTestSlug("token-fk-multiuser"),
            })
          );

          // Create multiple tokens for same user
          const token1 = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
              userId: owner.id,
              clientId: `user-client-1-${crypto.randomUUID()}`,
            })
          );

          const token2 = yield* tokenRepo.insert(
            makeMockOAuthAccessToken({
              organizationId: org.id,
              userId: owner.id,
              clientId: `user-client-2-${crypto.randomUUID()}`,
            })
          );

          // Both tokens should have same userId
          strictEqual(token1.userId._tag, "Some");
          strictEqual(token2.userId._tag, "Some");
          if (token1.userId._tag === "Some" && token2.userId._tag === "Some") {
            deepStrictEqual(token1.userId.value, owner.id);
            deepStrictEqual(token2.userId.value, owner.id);
          }

          // But different token IDs
          expect(token1.id).not.toBe(token2.id);
        }),
      TEST_TIMEOUT
    );
  });
});
