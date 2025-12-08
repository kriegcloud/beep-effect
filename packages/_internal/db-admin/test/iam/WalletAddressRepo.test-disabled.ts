import { describe, expect } from "bun:test";
import { Entities } from "@beep/iam-domain";
import { UserRepo, WalletAddressRepo } from "@beep/iam-infra";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
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
 * WalletAddress has a foreign key to User, so we need a user first.
 */
const makeMockUser = (overrides?: Partial<{ email: BS.Email.Type; name: string }>) =>
  User.Model.jsonCreate.make({
    email: overrides?.email ?? makeTestEmail("wallet-test"),
    name: overrides?.name ?? "Wallet Test User",
  });

/**
 * Helper to create a mock wallet address for insert operations.
 */
const makeMockWalletAddress = (
  userId: (typeof User.Model.Type)["id"],
  overrides?: Partial<{
    address: string;
    chainId: number;
    isPrimary: boolean;
  }>
) =>
  Entities.WalletAddress.Model.jsonCreate.make({
    userId,
    address: overrides?.address ?? `0x${crypto.randomUUID().replace(/-/g, "")}`,
    chainId: overrides?.chainId ?? 1,
    isPrimary: overrides?.isPrimary ?? false,
  });

describe("WalletAddressRepo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert wallet address and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          // Create user first (FK dependency)
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("insert-wallet") }));

          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0xABCDEF1234567890abcdef1234567890ABCDEF12",
            chainId: 1,
            isPrimary: true,
          });
          const inserted = yield* walletRepo.insert(mockedWallet);

          // Verify schema conformance
          assertTrue(S.is(Entities.WalletAddress.Model)(inserted));

          // Verify fields
          deepStrictEqual(inserted.userId, user.id);
          strictEqual(inserted.address, "0xABCDEF1234567890abcdef1234567890ABCDEF12");
          strictEqual(inserted.chainId, 1);
          strictEqual(inserted.isPrimary, true);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted wallet address",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          // Create user first
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("unique-wallet") }));

          const wallet1 = yield* walletRepo.insert(
            makeMockWalletAddress(user.id, { address: "0x1111111111111111111111111111111111111111", chainId: 1 })
          );
          const wallet2 = yield* walletRepo.insert(
            makeMockWalletAddress(user.id, { address: "0x2222222222222222222222222222222222222222", chainId: 1 })
          );

          // IDs should be different
          expect(wallet1.id).not.toBe(wallet2.id);

          // Both should be valid EntityId format (wallet_address__uuid)
          expect(wallet1.id).toMatch(/^wallet_address__[0-9a-f-]+$/);
          expect(wallet2.id).toMatch(/^wallet_address__[0-9a-f-]+$/);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert wallet address without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          // Create user first
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("insert-void-wallet") }));

          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0x3333333333333333333333333333333333333333",
            chainId: 137,
          });

          // insertVoid returns void
          const result = yield* walletRepo.insertVoid(mockedWallet);
          strictEqual(result, undefined);

          // Verify the wallet was actually persisted by attempting insert again with same unique key.
          // A duplicate (userId, address, chainId) should fail, proving the first insert worked.
          const duplicateResult = yield* Effect.either(walletRepo.insertVoid(mockedWallet));

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
      "should return Some when wallet address exists",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          // Create user first
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("find-some-wallet") }));

          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0x4444444444444444444444444444444444444444",
            chainId: 56,
          });
          const inserted = yield* walletRepo.insert(mockedWallet);

          const found = yield* walletRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            deepStrictEqual(found.value.id, inserted.id);
            deepStrictEqual(found.value.userId, user.id);
            strictEqual(found.value.address, "0x4444444444444444444444444444444444444444");
            strictEqual(found.value.chainId, 56);
          }
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when wallet address does not exist",
      () =>
        Effect.gen(function* () {
          const walletRepo = yield* WalletAddressRepo;

          // Use a valid WalletAddressId format that doesn't exist
          const nonExistentId = "wallet_address__00000000-0000-0000-0000-000000000000";
          const result = yield* walletRepo.findById(nonExistentId);

          assertNone(result);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return complete wallet address entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          // Create user first
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("find-complete-wallet") }));

          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0x5555555555555555555555555555555555555555",
            chainId: 42161,
            isPrimary: true,
          });
          const inserted = yield* walletRepo.insert(mockedWallet);
          const found = yield* walletRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            // Verify all expected fields exist
            expect(found.value).toHaveProperty("id");
            expect(found.value).toHaveProperty("userId");
            expect(found.value).toHaveProperty("address");
            expect(found.value).toHaveProperty("chainId");
            expect(found.value).toHaveProperty("isPrimary");
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
      "should update isPrimary field and return updated entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          // Setup: create user and wallet
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-primary-wallet") }));
          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0x6666666666666666666666666666666666666666",
            chainId: 1,
            isPrimary: false,
          });
          const inserted = yield* walletRepo.insert(mockedWallet);

          // Initially should be false
          strictEqual(inserted.isPrimary, false);

          // Action: update - spread existing entity and override specific fields
          const updated = yield* walletRepo.update({
            ...inserted,
            isPrimary: true,
          });

          // Verify returned entity has updated isPrimary
          strictEqual(updated.isPrimary, true);
          deepStrictEqual(updated.id, inserted.id);
          deepStrictEqual(updated.userId, user.id);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update chainId field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-chainid-wallet") }));
          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0x7777777777777777777777777777777777777777",
            chainId: 1,
          });
          const inserted = yield* walletRepo.insert(mockedWallet);

          strictEqual(inserted.chainId, 1);

          const updated = yield* walletRepo.update({
            ...inserted,
            chainId: 137,
          });

          strictEqual(updated.chainId, 137);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should update address field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-address-wallet") }));
          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0x8888888888888888888888888888888888888888",
            chainId: 1,
          });
          const inserted = yield* walletRepo.insert(mockedWallet);

          strictEqual(inserted.address, "0x8888888888888888888888888888888888888888");

          const updated = yield* walletRepo.update({
            ...inserted,
            address: "0x9999999999999999999999999999999999999999",
          });

          strictEqual(updated.address, "0x9999999999999999999999999999999999999999");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-persist-wallet") }));
          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            chainId: 1,
            isPrimary: false,
          });
          const inserted = yield* walletRepo.insert(mockedWallet);

          yield* walletRepo.update({
            ...inserted,
            isPrimary: true,
          });

          // Verify by fetching fresh
          const found = yield* walletRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.isPrimary, true);
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
      "should update wallet address without returning entity",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-void-wallet") }));
          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            chainId: 1,
            isPrimary: false,
          });
          const inserted = yield* walletRepo.insert(mockedWallet);

          // updateVoid returns void
          const result = yield* walletRepo.updateVoid({
            ...inserted,
            isPrimary: true,
          });

          strictEqual(result, undefined);

          // Verify the update was persisted
          const found = yield* walletRepo.findById(inserted.id);

          strictEqual(found._tag, "Some");
          if (found._tag === "Some") {
            strictEqual(found.value.isPrimary, true);
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
      "should delete existing wallet address",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("delete-wallet") }));
          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
            chainId: 1,
          });
          const inserted = yield* walletRepo.insert(mockedWallet);

          // Verify wallet exists
          const beforeDelete = yield* walletRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete
          yield* walletRepo.delete(inserted.id);

          // Verify wallet no longer exists
          const afterDelete = yield* walletRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent wallet address (idempotent)",
      () =>
        Effect.gen(function* () {
          const walletRepo = yield* WalletAddressRepo;

          // Deleting a non-existent ID should not throw
          const nonExistentId = "wallet_address__00000000-0000-0000-0000-000000000000";
          const result = yield* Effect.either(walletRepo.delete(nonExistentId));

          // Should succeed (void operation on non-existent is typically a no-op)
          strictEqual(result._tag, "Right");
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should cascade delete when user is deleted",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("cascade-delete-wallet") }));
          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
            chainId: 1,
          });
          const inserted = yield* walletRepo.insert(mockedWallet);

          // Verify wallet exists
          const beforeDelete = yield* walletRepo.findById(inserted.id);
          strictEqual(beforeDelete._tag, "Some");

          // Delete the user (should cascade to wallet)
          yield* userRepo.delete(user.id);

          // Verify wallet no longer exists due to cascade
          const afterDelete = yield* walletRepo.findById(inserted.id);
          assertNone(afterDelete);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERT MANY VOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertManyVoid operations", (it) => {
    it.effect(
      "should insert multiple wallet addresses without returning entities",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("many-wallets") }));

          const wallets = [
            makeMockWalletAddress(user.id, {
              address: "0xEEEE111111111111111111111111111111111111",
              chainId: 1,
            }),
            makeMockWalletAddress(user.id, {
              address: "0xEEEE222222222222222222222222222222222222",
              chainId: 137,
            }),
            makeMockWalletAddress(user.id, {
              address: "0xEEEE333333333333333333333333333333333333",
              chainId: 42161,
            }),
          ] as const;

          // Type assertion needed for NonEmptyArray
          const result = yield* walletRepo.insertManyVoid(
            wallets as unknown as readonly [
              typeof Entities.WalletAddress.Model.insert.Type,
              ...(typeof Entities.WalletAddress.Model.insert.Type)[],
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
      "should fail with DatabaseError on duplicate unique constraint (userId, address, chainId)",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("duplicate-wallet") }));

          const wallet1 = makeMockWalletAddress(user.id, {
            address: "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
            chainId: 1,
          });
          const wallet2 = makeMockWalletAddress(user.id, {
            address: "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
            chainId: 1,
          });

          // First insert should succeed
          yield* walletRepo.insert(wallet1);

          // Second insert with same (userId, address, chainId) should fail
          const result = yield* Effect.either(walletRepo.insert(wallet2));

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
      "should allow same address on different chains for same user",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("multi-chain-wallet") }));

          const sameAddress = "0x0000000000000000000000000000000000000001";

          // Same address, different chains should be allowed
          const wallet1 = yield* walletRepo.insert(
            makeMockWalletAddress(user.id, { address: sameAddress, chainId: 1 })
          );
          const wallet2 = yield* walletRepo.insert(
            makeMockWalletAddress(user.id, { address: sameAddress, chainId: 137 })
          );

          // Both should succeed with different IDs
          expect(wallet1.id).not.toBe(wallet2.id);
          strictEqual(wallet1.address, sameAddress);
          strictEqual(wallet2.address, sameAddress);
          strictEqual(wallet1.chainId, 1);
          strictEqual(wallet2.chainId, 137);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should die when updating non-existent wallet address",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          // First create a valid wallet to get a proper structure for update
          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("update-nonexistent-wallet") }));
          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0x0000000000000000000000000000000000000002",
            chainId: 1,
          });
          const inserted = yield* walletRepo.insert(mockedWallet);

          // Delete the wallet
          yield* walletRepo.delete(inserted.id);

          // Now try to update the deleted (non-existent) wallet
          // The repo uses Effect.die for NoSuchElementException, so we use Exit to catch it
          const exit = yield* Effect.exit(
            walletRepo.update({
              ...inserted,
              isPrimary: true,
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
          const walletRepo = yield* WalletAddressRepo;

          // CREATE user first (FK dependency)
          const user = yield* userRepo.insert(
            makeMockUser({
              email: makeTestEmail("crud-workflow-wallet"),
              name: "CRUD Wallet User",
            })
          );

          // CREATE wallet
          const mockedWallet = makeMockWalletAddress(user.id, {
            address: "0x0000000000000000000000000000000000000003",
            chainId: 1,
            isPrimary: false,
          });
          const created = yield* walletRepo.insert(mockedWallet);
          assertTrue(S.is(Entities.WalletAddress.Model)(created));

          // READ
          const read = yield* walletRepo.findById(created.id);
          strictEqual(read._tag, "Some");
          if (read._tag === "Some") {
            strictEqual(read.value.address, "0x0000000000000000000000000000000000000003");
            strictEqual(read.value.isPrimary, false);
          }

          // UPDATE
          const updated = yield* walletRepo.update({
            ...created,
            isPrimary: true,
          });
          strictEqual(updated.isPrimary, true);

          // Verify update persisted
          const readAfterUpdate = yield* walletRepo.findById(created.id);
          strictEqual(readAfterUpdate._tag, "Some");
          if (readAfterUpdate._tag === "Some") {
            strictEqual(readAfterUpdate.value.isPrimary, true);
          }

          // DELETE
          yield* walletRepo.delete(created.id);

          // Verify deletion
          const readAfterDelete = yield* walletRepo.findById(created.id);
          assertNone(readAfterDelete);
        }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // OPTIONAL FIELDS / DEFAULT VALUES
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("optional fields and defaults", (it) => {
    it.effect(
      "should apply default value for isPrimary field",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("default-primary-wallet") }));

          // Create wallet without specifying isPrimary (should default to false)
          const wallet = yield* walletRepo.insert(
            Entities.WalletAddress.Model.jsonCreate.make({
              userId: user.id,
              address: "0x0000000000000000000000000000000000000004",
              chainId: 1,
            })
          );

          // isPrimary should default to false
          strictEqual(wallet.isPrimary, false);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle multiple wallets with different isPrimary states",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("multi-primary-wallet") }));

          // Create primary wallet
          const primaryWallet = yield* walletRepo.insert(
            makeMockWalletAddress(user.id, {
              address: "0x0000000000000000000000000000000000000005",
              chainId: 1,
              isPrimary: true,
            })
          );

          // Create secondary wallets
          const secondaryWallet1 = yield* walletRepo.insert(
            makeMockWalletAddress(user.id, {
              address: "0x0000000000000000000000000000000000000006",
              chainId: 137,
              isPrimary: false,
            })
          );

          const secondaryWallet2 = yield* walletRepo.insert(
            makeMockWalletAddress(user.id, {
              address: "0x0000000000000000000000000000000000000007",
              chainId: 42161,
              isPrimary: false,
            })
          );

          strictEqual(primaryWallet.isPrimary, true);
          strictEqual(secondaryWallet1.isPrimary, false);
          strictEqual(secondaryWallet2.isPrimary, false);

          // Update secondary to primary
          const newPrimary = yield* walletRepo.update({
            ...secondaryWallet1,
            isPrimary: true,
          });
          strictEqual(newPrimary.isPrimary, true);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle different chainId values correctly",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo;
          const walletRepo = yield* WalletAddressRepo;

          const user = yield* userRepo.insert(makeMockUser({ email: makeTestEmail("chainid-values-wallet") }));

          // Test various common chain IDs
          const chainIds = [1, 137, 42161, 10, 56, 43114, 8453] as const;
          const baseAddress = "0x000000000000000000000000000000000000";

          for (const chainId of chainIds) {
            const paddedChainId = chainId.toString().padStart(4, "0");
            const address = `${baseAddress}${paddedChainId}`;
            const wallet = yield* walletRepo.insert(
              makeMockWalletAddress(user.id, {
                address,
                chainId,
              })
            );

            strictEqual(wallet.chainId, chainId);
            strictEqual(wallet.address, address);
          }
        }),
      TEST_TIMEOUT
    );
  });
});
