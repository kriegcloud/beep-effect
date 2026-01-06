import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { AccountRepo, UserRepo } from "@beep/iam-server/db";
import { BS } from "@beep/schema";
import type { SharedEntityIds } from "@beep/shared-domain";
import { User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { PgTest } from "./container";

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
 * Account requires a valid userId foreign key.
 */
const makeMockUser = (overrides?: Partial<{ readonly email: BS.Email.Type; readonly name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("test"),
    name: overrides?.name ?? "Test User",
  });

/**
 * Helper to create a mock account for insert operations.
 * Requires a valid userId from an existing user.
 */
const makeMockAccount = (overrides: {
  readonly userId: SharedEntityIds.UserId.Type;
  readonly accountId?: string;
  readonly providerId?: string;
}) =>
  Entities.Account.Model.jsonCreate.make({
    userId: overrides.userId,
    accountId: overrides.accountId ?? `ext-account-${crypto.randomUUID()}`,
    providerId: overrides.providerId ?? "google",
  });

describe("AccountRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert account and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // First create a user (FK dependency)
          const mockedUser = makeMockUser({
            email: makeTestEmail("account-insert"),
            name: "Account Insert Test User",
          });
          const insertedUser = yield* userRepo.insert(mockedUser);

          const mockedAccount = makeMockAccount({
            userId: insertedUser.id,
            accountId: `google-${crypto.randomUUID()}`,
            providerId: "google",
          });
          const inserted = yield* accountRepo.insert(mockedAccount);

          // Verify schema conformance
          assertTrue(S.is(Entities.Account.Model)(inserted));

          // Verify fields
          strictEqual(inserted.providerId, "google");
          deepStrictEqual(inserted.userId, insertedUser.id);
          strictEqual(inserted.accountId, mockedAccount.accountId);

          // Verify optional fields default to None
          strictEqual(inserted.accessToken._tag, "None");
          strictEqual(inserted.refreshToken._tag, "None");
          strictEqual(inserted.idToken._tag, "None");
          strictEqual(inserted.accessTokenExpiresAt._tag, "None");
          strictEqual(inserted.refreshTokenExpiresAt._tag, "None");
          strictEqual(inserted.scope._tag, "None");
          strictEqual(inserted.password._tag, "None");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted account",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("unique-accounts") }));

          const account1 = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `github-${crypto.randomUUID()}`,
              providerId: "github",
            })
          );
          const account2 = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `twitter-${crypto.randomUUID()}`,
              providerId: "twitter",
            })
          );

          // IDs should be different
          expect(account1.id).not.toBe(account2.id);

          // Both should be valid EntityId format (account__uuid)
          expect(account1.id).toMatch(/^account__[0-9a-f-]+$/);
          expect(account2.id).toMatch(/^account__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
    it.effect(
      "should insert account without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("insert-void-account") }));

          const accountId = `void-${crypto.randomUUID()}`;
          const mockedAccount = makeMockAccount({
            userId: user.id,
            accountId,
            providerId: "google",
          });

          // insertVoid returns void
          const result = yield* accountRepo.insertVoid(mockedAccount);
          strictEqual(result, undefined);

          // Verify the account was actually persisted by attempting insert again.
          // A duplicate (userId, providerId) or (accountId, providerId) should fail.
          const duplicateResult = yield* Effect.either(accountRepo.insertVoid(mockedAccount));

          // Should fail with unique constraint violation
          strictEqual(duplicateResult._tag, "Left");
        }),
      TEST_TIMEOUT
    );
    it.effect(
      "should return Some when account exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("find-some-account") }));

          const mockedAccount = makeMockAccount({
            userId: user.id,
            accountId: `find-some-${crypto.randomUUID()}`,
            providerId: "github",
          });
          const inserted = yield* accountRepo.insert(mockedAccount);

          const found = yield* accountRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            strictEqual(found.value.providerId, "github");
            deepStrictEqual(found.value.userId, user.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when account does not exist",
      () =>
        Effect.gen(function* () {
          const accountRepo = yield* AccountRepo;

          // Use a valid AccountId format that doesn't exist (EntityId format: account__uuid)
          const nonExistentId = "account__00000000-0000-0000-0000-000000000000";
          const result = yield* accountRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete account entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("find-complete-account") }));

          const mockedAccount = makeMockAccount({
            userId: user.id,
            accountId: `complete-${crypto.randomUUID()}`,
            providerId: "linkedin",
          });
          const inserted = yield* accountRepo.insert(mockedAccount);
          const found = yield* accountRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("accountId");
            expect(found.value).toHaveProperty("providerId");
            expect(found.value).toHaveProperty("userId");
            expect(found.value).toHaveProperty("accessToken");
            expect(found.value).toHaveProperty("refreshToken");
            expect(found.value).toHaveProperty("idToken");
            expect(found.value).toHaveProperty("accessTokenExpiresAt");
            expect(found.value).toHaveProperty("refreshTokenExpiresAt");
            expect(found.value).toHaveProperty("scope");
            expect(found.value).toHaveProperty("password");
            expect(found.value).toHaveProperty("createdAt");
            expect(found.value).toHaveProperty("updatedAt");
          }
        }),
      TEST_TIMEOUT
    );
    it.effect(
      "should update account providerId and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-provider") }));

          const mockedAccount = makeMockAccount({
            userId: user.id,
            accountId: `update-${crypto.randomUUID()}`,
            providerId: "google",
          });
          const inserted = yield* accountRepo.insert(mockedAccount);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* accountRepo.update({
            ...inserted,
            providerId: "google-oauth2",
          });

          // Verify returned entity has updated providerId
          strictEqual(updated.providerId, "google-oauth2");
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.userId, user.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update scope field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-scope") }));

          const mockedAccount = makeMockAccount({
            userId: user.id,
            accountId: `scope-${crypto.randomUUID()}`,
            providerId: "google",
          });
          const inserted = yield* accountRepo.insert(mockedAccount);

          // Initially should be None
          strictEqual(inserted.scope._tag, "None");

          // Update with scope
          const updated = yield* accountRepo.update({
            ...inserted,
            scope: O.some("email profile openid"),
          });

          strictEqual(updated.scope._tag, "Some");
          strictEqual(
            O.getOrElse(updated.scope, () => ""),
            "email profile openid"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-persist-account") }));

          const mockedAccount = makeMockAccount({
            userId: user.id,
            accountId: `persist-${crypto.randomUUID()}`,
            providerId: "github",
          });
          const inserted = yield* accountRepo.insert(mockedAccount);

          yield* accountRepo.update({
            ...inserted,
            scope: O.some("repo user:email"),
          });

          // Verify by fetching fresh
          const found = yield* accountRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(
              O.getOrElse(found.value.scope, () => ""),
              "repo user:email"
            );
          }
        }),
      TEST_TIMEOUT
    );
    it.effect(
      "should update account without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-void-account") }));

          const mockedAccount = makeMockAccount({
            userId: user.id,
            accountId: `void-update-${crypto.randomUUID()}`,
            providerId: "google",
          });
          const inserted = yield* accountRepo.insert(mockedAccount);

          // updateVoid returns void
          const result = yield* accountRepo.updateVoid({
            ...inserted,
            scope: O.some("drive.readonly"),
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* accountRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(
              O.getOrElse(found.value.scope, () => ""),
              "drive.readonly"
            );
          }
        }),
      TEST_TIMEOUT
    );
    it.effect(
      "should delete existing account",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("delete-account") }));

          const mockedAccount = makeMockAccount({
            userId: user.id,
            accountId: `delete-${crypto.randomUUID()}`,
            providerId: "github",
          });
          const inserted = yield* accountRepo.insert(mockedAccount);

          // Verify account exists
          const beforeDelete = yield* accountRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* accountRepo.delete(inserted.id);

          // Verify account no longer exists
          const afterDelete = yield* accountRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent account (idempotent)",
      () =>
        Effect.gen(function* () {
          const accountRepo = yield* AccountRepo;

          // Deleting a non-existent ID should not throw (EntityId format: account__uuid)
          const nonExistentId = "account__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(accountRepo.delete(nonExistentId));

          // Should succeed (void operation on non-existent is typically a no-op)
          strictEqual(result._tag, "Right");
        }),
      TEST_TIMEOUT
    );
    it.effect(
      "should insert multiple accounts without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("batch-accounts") }));

          const prefix = crypto.randomUUID();
          const accounts = [
            makeMockAccount({
              userId: user.id,
              accountId: `batch-1-${prefix}`,
              providerId: "google",
            }),
            makeMockAccount({
              userId: user.id,
              accountId: `batch-2-${prefix}`,
              providerId: "github",
            }),
            makeMockAccount({
              userId: user.id,
              accountId: `batch-3-${prefix}`,
              providerId: "twitter",
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* accountRepo.insertManyVoid(
            accounts as unknown as readonly [
              typeof Entities.Account.Model.insert.Type,
              ...(typeof Entities.Account.Model.insert.Type)[],
            ]
          );

          strictEqual(result, undefined);
        }),
      TEST_TIMEOUT
    );
    it.effect(
      "should fail with DatabaseError on duplicate (accountId, providerId) unique constraint violation",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("duplicate-account") }));

          const accountId = `dup-${crypto.randomUUID()}`;
          const account1 = makeMockAccount({
            userId: user.id,
            accountId,
            providerId: "google",
          });
          const account2 = makeMockAccount({
            userId: user.id,
            accountId, // Same accountId
            providerId: "google", // Same providerId
          });

          // First insert should succeed
          yield* accountRepo.insert(account1);

          // Second insert with same (accountId, providerId) should fail
          const result = yield* Effect.either(accountRepo.insert(account2));

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
      "should die when updating non-existent account",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // First create a valid account to get a proper structure for update
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-nonexistent-account") }));

          const mockedAccount = makeMockAccount({
            userId: user.id,
            accountId: `temp-${crypto.randomUUID()}`,
            providerId: "google",
          });
          const inserted = yield* accountRepo.insert(mockedAccount);

          // Delete the account
          yield* accountRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) account
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            accountRepo.update({
              ...inserted,
              scope: O.some("should-not-work"),
            })
          );

          // Update on non-existent row dies with NoSuchElementException (treated as defect)
          // The repo's design catches this and calls Effect.die, so we check for Die
          strictEqual(exit._tag, "Failure");
        }),
      TEST_TIMEOUT
    );
    it.effect(
      "should complete full create-read-update-delete cycle",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Setup: Create user for FK
          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("crud-workflow-account"),
              name: "CRUD Account Test User",
            })
          );

          // CREATE
          const mockedAccount = makeMockAccount({
            userId: user.id,
            accountId: `crud-${crypto.randomUUID()}`,
            providerId: "google",
          });
          const created = yield* accountRepo.insert(mockedAccount);
          assertTrue(S.is(Entities.Account.Model)(created));

          // READ
          const read = yield* accountRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.providerId, "google");
            deepStrictEqual(read.value.userId, user.id);
          }

          // UPDATE
          const updated = yield* accountRepo.update({
            ...created,
            scope: O.some("email profile"),
            providerId: "google-oauth2",
          });
          strictEqual(updated.providerId, "google-oauth2");
          strictEqual(
            O.getOrElse(updated.scope, () => ""),
            "email profile"
          );

          // Verify update persisted
          const readAfterUpdate = yield* accountRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.providerId, "google-oauth2");
            strictEqual(
              O.getOrElse(readAfterUpdate.value.scope, () => ""),
              "email profile"
            );
          }

          // DELETE
          yield* accountRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* accountRepo.findById(created.id);
          assertNone(readAfterDelete);
        }),
      TEST_TIMEOUT
    );
    // ============================================================================
    // OPTIONAL FIELDS
    // ============================================================================
    it.effect(
      "should handle optional accessToken field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("access-token-account") }));

          // Create without accessToken
          const accountWithoutToken = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `no-token-${crypto.randomUUID()}`,
              providerId: "google",
            })
          );

          // accessToken should be None (optional fields are Option types)
          strictEqual(accountWithoutToken.accessToken._tag, "None");

          // Update with accessToken
          const updated = yield* accountRepo.update({
            ...accountWithoutToken,
            accessToken: O.some(Redacted.make("ya29.a0ARrdaM_test_access_token")),
          });

          strictEqual(updated.accessToken._tag, "Some");
          if (updated.accessToken._tag === "Some") {
            strictEqual(Redacted.value(updated.accessToken.value), "ya29.a0ARrdaM_test_access_token");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional refreshToken field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("refresh-token-account") }));

          const account = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `refresh-${crypto.randomUUID()}`,
              providerId: "google",
            })
          );

          strictEqual(account.refreshToken._tag, "None");

          const updated = yield* accountRepo.update({
            ...account,
            refreshToken: O.some(Redacted.make("1//0test_refresh_token")),
          });

          strictEqual(updated.refreshToken._tag, "Some");
          if (updated.refreshToken._tag === "Some") {
            strictEqual(Redacted.value(updated.refreshToken.value), "1//0test_refresh_token");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional idToken field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("id-token-account") }));

          const account = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `id-token-${crypto.randomUUID()}`,
              providerId: "google",
            })
          );

          strictEqual(account.idToken._tag, "None");

          const updated = yield* accountRepo.update({
            ...account,
            idToken: O.some(Redacted.make("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test_id_token")),
          });

          strictEqual(updated.idToken._tag, "Some");
          if (updated.idToken._tag === "Some") {
            strictEqual(Redacted.value(updated.idToken.value), "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.test_id_token");
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional scope field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("scope-account") }));

          const account = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `scope-test-${crypto.randomUUID()}`,
              providerId: "google",
            })
          );

          strictEqual(account.scope._tag, "None");

          const updated = yield* accountRepo.update({
            ...account,
            scope: O.some("openid email profile https://www.googleapis.com/auth/drive.readonly"),
          });

          strictEqual(updated.scope._tag, "Some");
          strictEqual(
            O.getOrElse(updated.scope, () => ""),
            "openid email profile https://www.googleapis.com/auth/drive.readonly"
          );
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle optional password field (for credential providers)",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("password-account") }));

          // Create credential-based account
          const account = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `credential-${crypto.randomUUID()}`,
              providerId: "credential",
            })
          );

          strictEqual(account.password._tag, "None");

          // Update with a valid password (must have uppercase, lowercase, number, special char)
          const validPassword = BS.Password.make("TestP@ssw0rd!");
          const updated = yield* accountRepo.update({
            ...account,
            password: O.some(validPassword),
          });

          strictEqual(updated.password._tag, "Some");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle multiple optional token fields together",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user for FK
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("multi-token-account") }));

          const account = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `multi-${crypto.randomUUID()}`,
              providerId: "google",
            })
          );

          // Update with all token fields at once
          const updated = yield* accountRepo.update({
            ...account,
            accessToken: O.some(Redacted.make("access-token-value")),
            refreshToken: O.some(Redacted.make("refresh-token-value")),
            idToken: O.some(Redacted.make("id-token-value")),
            scope: O.some("email profile"),
          });

          strictEqual(updated.accessToken._tag, "Some");
          strictEqual(updated.refreshToken._tag, "Some");
          strictEqual(updated.idToken._tag, "Some");
          strictEqual(updated.scope._tag, "Some");

          // Verify persisted
          const found = yield* accountRepo.findById(account.id);
          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            if (found.value.accessToken._tag === "Some") {
              strictEqual(Redacted.value(found.value.accessToken.value), "access-token-value");
            }
            if (found.value.refreshToken._tag === "Some") {
              strictEqual(Redacted.value(found.value.refreshToken.value), "refresh-token-value");
            }
            if (found.value.idToken._tag === "Some") {
              strictEqual(Redacted.value(found.value.idToken.value), "id-token-value");
            }
            strictEqual(
              O.getOrElse(found.value.scope, () => ""),
              "email profile"
            );
          }
        }),
      TEST_TIMEOUT
    );
    it.effect(
      "should correctly associate account with user",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user
          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("fk-test"),
              name: "FK Test User",
            })
          );

          // Create account linked to user
          const account = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `fk-${crypto.randomUUID()}`,
              providerId: "github",
            })
          );

          // Verify FK relationship
          deepStrictEqual(account.userId, user.id);

          // Verify we can find the account and it still has correct userId
          const found = yield* accountRepo.findById(account.id);
          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.userId, user.id);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should allow multiple accounts for same user (different providers)",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const accountRepo = yield* AccountRepo;

          // Create user
          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("multi-provider"),
              name: "Multi Provider User",
            })
          );

          // Create multiple accounts for same user with different providers
          const googleAccount = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `google-${crypto.randomUUID()}`,
              providerId: "google",
            })
          );

          const githubAccount = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `github-${crypto.randomUUID()}`,
              providerId: "github",
            })
          );

          const twitterAccount = yield* accountRepo.insert(
            makeMockAccount({
              userId: user.id,
              accountId: `twitter-${crypto.randomUUID()}`,
              providerId: "twitter",
            })
          );

          // All accounts should have same userId
          deepStrictEqual(googleAccount.userId, user.id);
          deepStrictEqual(githubAccount.userId, user.id);
          deepStrictEqual(twitterAccount.userId, user.id);

          // But different account IDs
          expect(googleAccount.id).not.toBe(githubAccount.id);
          expect(githubAccount.id).not.toBe(twitterAccount.id);
        }),
      TEST_TIMEOUT
    );
  });
});
