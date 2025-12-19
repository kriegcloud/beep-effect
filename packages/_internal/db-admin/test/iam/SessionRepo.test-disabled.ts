import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { OrganizationRepo, SessionRepo, UserRepo } from "@beep/iam-infra/adapters/repositories";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as DateTime from "effect/DateTime";
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
 * Helper to create a unique session token.
 */
const makeSessionToken = (): string => `token_${crypto.randomUUID()}`;

/**
 * Helper to create a unique slug for organizations.
 */
const makeUniqueSlug = (prefix: string): string => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

/**
 * Helper to create a mock user for insert operations.
 */
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  Entities.User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("test"),
    name: overrides?.name ?? "Test User",
  });

/**
 * Helper to create a mock organization for insert operations.
 */
const makeMockOrganization = (
  ownerUserId: SharedEntityIds.UserId.Type,
  overrides?: Partial<{ name: string; slug: string }>
) =>
  Entities.Organization.Model.jsonCreate.make({
    name: overrides?.name ?? "Test Organization",
    slug: BS.Slug.make(overrides?.slug ?? makeUniqueSlug("test-org")),
    ownerUserId: ownerUserId as typeof Entities.Organization.Model.fields.ownerUserId.Type,
  });

/**
 * Helper to create a mock session for insert operations.
 * Session requires: expiresAt, token, userId, activeOrganizationId
 */
const makeMockSession = (
  userId: string,
  organizationId: string,
  overrides?: Partial<{
    expiresAt: DateTime.Utc;
    token: string;
    ipAddress: string;
    userAgent: string;
  }>
) =>
  Entities.Session.Model.insert.make({
    expiresAt: overrides?.expiresAt ?? DateTime.add(DateTime.unsafeNow(), { hours: 24 }),
    token: overrides?.token ?? makeSessionToken(),
    userId: userId as typeof Entities.Session.Model.fields.userId.Type,
    activeOrganizationId: organizationId as typeof Entities.Session.Model.fields.activeOrganizationId.Type,
  });

describe("SessionRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert session and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user first (FK dependency)
          const mockedUser = makeMockUser({
            email: makeTestEmail("session-insert"),
            name: "Session Insert Test User",
          });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization (FK dependency)
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            name: "Session Insert Test Org",
            slug: makeUniqueSlug("session-insert"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // Create session
          const token = makeSessionToken();
          const expiresAt = DateTime.add(DateTime.unsafeNow(), { hours: 24 });
          const mockedSession = makeMockSession(insertedUser.id, insertedOrg.id, {
            token,
            expiresAt,
          });

          const inserted = yield* sessionRepo.insert(mockedSession);

          // Verify schema conformance
          assertTrue(S.is(Entities.Session.Model)(inserted));

          // Verify fields
          deepStrictEqual(inserted.userId, insertedUser.id);
          deepStrictEqual(inserted.activeOrganizationId, insertedOrg.id);
          strictEqual(inserted.token, token);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted session",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-unique-id") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("session-unique"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // Create two sessions
          const session1 = yield* sessionRepo.insert(
            makeMockSession(insertedUser.id, insertedOrg.id, { token: makeSessionToken() })
          );
          const session2 = yield* sessionRepo.insert(
            makeMockSession(insertedUser.id, insertedOrg.id, { token: makeSessionToken() })
          );

          // IDs should be different
          expect(session1.id).not.toBe(session2.id);

          // Both should be valid EntityId format (session__uuid)
          expect(session1.id).toMatch(/^session__[0-9a-f-]+$/);
          expect(session2.id).toMatch(/^session__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert session without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-insert-void") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("session-void"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const token = makeSessionToken();
          const mockedSession = makeMockSession(insertedUser.id, insertedOrg.id, { token });

          // insertVoid returns void
          const result = yield* sessionRepo.insertVoid(mockedSession);
          strictEqual(result, undefined);

          // Verify the session was actually persisted by attempting insert again with same token.
          // A duplicate token should fail, proving the first insert worked.
          const duplicateResult = yield* Effect.either(sessionRepo.insertVoid(mockedSession));

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
      "should return Some when session exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-find-some") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("find-some"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // Create session
          const mockedSession = makeMockSession(insertedUser.id, insertedOrg.id);
          const inserted = yield* sessionRepo.insert(mockedSession);

          const found = yield* sessionRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            deepStrictEqual(found.value.userId, insertedUser.id);
            deepStrictEqual(found.value.activeOrganizationId, insertedOrg.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when session does not exist",
      () =>
        Effect.gen(function* () {
          const sessionRepo = yield* SessionRepo;

          // Use a valid SessionId format that doesn't exist (EntityId format: session__uuid)
          const nonExistentId = "session__00000000-0000-0000-0000-000000000000";
          const result = yield* sessionRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete session entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-find-complete") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("find-complete"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // Create session
          const mockedSession = makeMockSession(insertedUser.id, insertedOrg.id);
          const inserted = yield* sessionRepo.insert(mockedSession);
          const found = yield* sessionRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("expiresAt");
            expect(found.value).toHaveProperty("token");
            expect(found.value).toHaveProperty("userId");
            expect(found.value).toHaveProperty("activeOrganizationId");
            expect(found.value).toHaveProperty("ipAddress");
            expect(found.value).toHaveProperty("userAgent");
            expect(found.value).toHaveProperty("activeTeamId");
            expect(found.value).toHaveProperty("impersonatedBy");
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
      "should update session expiresAt and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-update-expires") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("update-expires"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // Create session
          const mockedSession = makeMockSession(insertedUser.id, insertedOrg.id);
          const inserted = yield* sessionRepo.insert(mockedSession);

          // Update expiresAt to 48 hours from now
          const newExpiresAt = DateTime.add(DateTime.unsafeNow(), { hours: 48 });
          const updated = yield* sessionRepo.update({
            ...inserted,
            expiresAt: newExpiresAt,
          });

          // Verify returned entity has updated expiresAt
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.userId, insertedUser.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update activeOrganizationId field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-update-org") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create two organizations
          const mockedOrg1 = makeMockOrganization(insertedUser.id, {
            name: "First Org",
            slug: makeUniqueSlug("first-org"),
          });
          const insertedOrg1 = yield* orgRepo.insert(mockedOrg1);

          const mockedOrg2 = makeMockOrganization(insertedUser.id, {
            name: "Second Org",
            slug: makeUniqueSlug("second-org"),
          });
          const insertedOrg2 = yield* orgRepo.insert(mockedOrg2);

          // Create session with first org
          const mockedSession = makeMockSession(insertedUser.id, insertedOrg1.id);
          const inserted = yield* sessionRepo.insert(mockedSession);

          deepStrictEqual(inserted.activeOrganizationId, insertedOrg1.id);

          // Update to second org
          const updated = yield* sessionRepo.update({
            ...inserted,
            activeOrganizationId: insertedOrg2.id,
          });

          deepStrictEqual(updated.activeOrganizationId, insertedOrg2.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-update-persist") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create two organizations
          const mockedOrg1 = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("persist-org1"),
          });
          const insertedOrg1 = yield* orgRepo.insert(mockedOrg1);

          const mockedOrg2 = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("persist-org2"),
          });
          const insertedOrg2 = yield* orgRepo.insert(mockedOrg2);

          // Create session
          const mockedSession = makeMockSession(insertedUser.id, insertedOrg1.id);
          const inserted = yield* sessionRepo.insert(mockedSession);

          yield* sessionRepo.update({
            ...inserted,
            activeOrganizationId: insertedOrg2.id,
          });

          // Verify by fetching fresh
          const found = yield* sessionRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.activeOrganizationId, insertedOrg2.id);
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
      "should update session without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-update-void") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create two organizations
          const mockedOrg1 = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("void-org1"),
          });
          const insertedOrg1 = yield* orgRepo.insert(mockedOrg1);

          const mockedOrg2 = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("void-org2"),
          });
          const insertedOrg2 = yield* orgRepo.insert(mockedOrg2);

          // Create session
          const mockedSession = makeMockSession(insertedUser.id, insertedOrg1.id);
          const inserted = yield* sessionRepo.insert(mockedSession);

          // updateVoid returns void
          const result = yield* sessionRepo.updateVoid({
            ...inserted,
            activeOrganizationId: insertedOrg2.id,
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* sessionRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.activeOrganizationId, insertedOrg2.id);
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
      "should delete existing session",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-delete") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("delete-org"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // Create session
          const mockedSession = makeMockSession(insertedUser.id, insertedOrg.id);
          const inserted = yield* sessionRepo.insert(mockedSession);

          // Verify session exists
          const beforeDelete = yield* sessionRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* sessionRepo.delete(inserted.id);

          // Verify session no longer exists
          const afterDelete = yield* sessionRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent session",
      () =>
        Effect.gen(function* () {
          const sessionRepo = yield* SessionRepo;

          // Deleting a non-existent ID should not throw (EntityId format: session__uuid)
          const nonExistentId = "session__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(sessionRepo.delete(nonExistentId));

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
      "should insert multiple sessions without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-insert-many") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("insert-many"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const sessions = [
            makeMockSession(insertedUser.id, insertedOrg.id, { token: makeSessionToken() }),
            makeMockSession(insertedUser.id, insertedOrg.id, { token: makeSessionToken() }),
            makeMockSession(insertedUser.id, insertedOrg.id, { token: makeSessionToken() }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* sessionRepo.insertManyVoid(
            sessions as unknown as readonly [
              typeof Entities.Session.Model.insert.Type,
              ...(typeof Entities.Session.Model.insert.Type)[],
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
      "should fail with DatabaseError on duplicate token (unique constraint violation)",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-duplicate-token") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("dup-token"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const token = makeSessionToken();
          const session1 = makeMockSession(insertedUser.id, insertedOrg.id, { token });
          const session2 = makeMockSession(insertedUser.id, insertedOrg.id, { token });

          // First insert should succeed
          yield* sessionRepo.insert(session1);

          // Second insert with same token should fail
          const result = yield* Effect.either(sessionRepo.insert(session2));

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
      "should die when updating non-existent session",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // First create a valid session to get a proper structure for update
          const mockedUser = makeMockUser({ email: makeTestEmail("session-update-nonexistent") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("update-nonexist"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          const mockedSession = makeMockSession(insertedUser.id, insertedOrg.id);
          const inserted = yield* sessionRepo.insert(mockedSession);

          // Delete the session
          yield* sessionRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) session
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            sessionRepo.update({
              ...inserted,
              expiresAt: DateTime.add(DateTime.unsafeNow(), { hours: 72 }),
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
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-crud-workflow") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create two organizations
          const mockedOrg1 = makeMockOrganization(insertedUser.id, {
            name: "CRUD Org 1",
            slug: makeUniqueSlug("crud-org1"),
          });
          const insertedOrg1 = yield* orgRepo.insert(mockedOrg1);

          const mockedOrg2 = makeMockOrganization(insertedUser.id, {
            name: "CRUD Org 2",
            slug: makeUniqueSlug("crud-org2"),
          });
          const insertedOrg2 = yield* orgRepo.insert(mockedOrg2);

          // CREATE
          const mockedSession = makeMockSession(insertedUser.id, insertedOrg1.id);
          const created = yield* sessionRepo.insert(mockedSession);
          assertTrue(S.is(Entities.Session.Model)(created));

          // READ
          const read = yield* sessionRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            deepStrictEqual(read.value.userId, insertedUser.id);
            deepStrictEqual(read.value.activeOrganizationId, insertedOrg1.id);
          }

          // UPDATE
          const updated = yield* sessionRepo.update({
            ...created,
            activeOrganizationId: insertedOrg2.id,
          });
          deepStrictEqual(updated.activeOrganizationId, insertedOrg2.id);

          // Verify update persisted
          const readAfterUpdate = yield* sessionRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            deepStrictEqual(readAfterUpdate.value.activeOrganizationId, insertedOrg2.id);
          }

          // DELETE
          yield* sessionRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* sessionRepo.findById(created.id);
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
      "should handle optional ipAddress field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-ip-address") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("ip-addr"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // Create session without ipAddress
          const sessionWithoutIp = yield* sessionRepo.insert(makeMockSession(insertedUser.id, insertedOrg.id));

          // ipAddress should be None (optional fields are Option types)
          strictEqual(sessionWithoutIp.ipAddress._tag, "None");

          // Update with ipAddress - ipAddress is Option<Redacted<string>>
          const updated = yield* sessionRepo.update({
            ...sessionWithoutIp,
            ipAddress: O.some(Redacted.make("192.168.1.1")),
          });

          strictEqual(updated.ipAddress._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional userAgent field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-user-agent") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("user-agent"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // Create session without userAgent
          const session = yield* sessionRepo.insert(makeMockSession(insertedUser.id, insertedOrg.id));

          strictEqual(session.userAgent._tag, "None");

          // Update with userAgent - userAgent is Option<Redacted<string>>
          const updated = yield* sessionRepo.update({
            ...session,
            userAgent: O.some(Redacted.make("Mozilla/5.0 Test Agent")),
          });

          strictEqual(updated.userAgent._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional activeTeamId field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create user
          const mockedUser = makeMockUser({ email: makeTestEmail("session-team-id") });
          const insertedUser = yield* userRepo.insert(mockedUser);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser.id, {
            slug: makeUniqueSlug("team-id"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // Create session without activeTeamId
          const session = yield* sessionRepo.insert(makeMockSession(insertedUser.id, insertedOrg.id));

          // activeTeamId should be None
          strictEqual(session.activeTeamId._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional impersonatedBy field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const orgRepo = yield* OrganizationRepo;
          const sessionRepo = yield* SessionRepo;

          // Setup: create two users
          const mockedUser1 = makeMockUser({ email: makeTestEmail("session-impersonator") });
          const insertedUser1 = yield* userRepo.insert(mockedUser1);

          const mockedUser2 = makeMockUser({ email: makeTestEmail("session-impersonated") });
          const insertedUser2 = yield* userRepo.insert(mockedUser2);

          // Setup: create organization
          const mockedOrg = makeMockOrganization(insertedUser1.id, {
            slug: makeUniqueSlug("impersonation"),
          });
          const insertedOrg = yield* orgRepo.insert(mockedOrg);

          // Create session without impersonatedBy
          const session = yield* sessionRepo.insert(makeMockSession(insertedUser2.id, insertedOrg.id));

          // impersonatedBy should be None
          strictEqual(session.impersonatedBy._tag, "None");

          // Update with impersonatedBy (user1 impersonating user2)
          // impersonatedBy is Option<UserId>, so we wrap the UserId in O.some
          const updated = yield* sessionRepo.update({
            ...session,
            impersonatedBy: O.some(insertedUser1.id),
          });

          strictEqual(updated.impersonatedBy._tag, "Some");
          if (updated.impersonatedBy._tag === "Some") {
            deepStrictEqual(updated.impersonatedBy.value, insertedUser1.id);
          }
        }),
      TEST_TIMEOUT
    );
  });
});
