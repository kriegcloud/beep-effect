# IAM Repository Test Generator - Original Prompt

Create comprehensive unit tests for all IAM repository files in
@packages/iam/server/src/adapters/repos/. Deploy parallel subagents to create a test file for each
repository, following the exact patterns established in the working UserRepo.test.ts at
/packages/_internal/db-admin/test/UserRepo.test.ts.

## Repositories to Test

The following repositories need test files created in /packages/_internal/db-admin/test/:

1. Account.repo.ts → AccountRepo.test.ts
2. ApiKey.repo.ts → ApiKeyRepo.test.ts
3. DeviceCode.repo.ts → DeviceCodeRepo.test.ts
4. Invitation.repo.ts → InvitationRepo.test.ts
5. Jwks.repo.ts → JwksRepo.test.ts
6. Member.repo.ts → MemberRepo.test.ts
7. OAuthAccessToken.repo.ts → OAuthAccessTokenRepo.test.ts
8. OAuthApplication.repo.ts → OAuthApplicationRepo.test.ts
9. OAuthConsent.repo.ts → OAuthConsentRepo.test.ts
10. Organization.repo.ts → OrganizationRepo.test.ts
11. OrganizationRole.repo.ts → OrganizationRoleRepo.test.ts
12. Passkey.repo.ts → PasskeyRepo.test.ts
13. RateLimit.repo.ts → RateLimitRepo.test.ts
14. ScimProvider.repo.ts → ScimProviderRepo.test.ts
15. Session.repo.ts → SessionRepo.test.ts
16. SsoProvider.repo.ts → SsoProviderRepo.test.ts
17. Subscription.repo.ts → SubscriptionRepo.test.ts
18. TeamMember.repo.ts → TeamMemberRepo.test.ts
19. Team.repo.ts → TeamRepo.test.ts
20. TwoFactor.repo.ts → TwoFactorRepo.test.ts
21. Verification.repo.ts → VerificationRepo.test.ts
22. WalletAddress.repo.ts → WalletAddressRepo.test.ts

## Critical Test Patterns (from UserRepo.test.ts)

### Test Structure

- Use @beep/testkit layer() function for Effect-based tests
- Use Testcontainers PostgreSQL for real database integration tests
- Timeout constant: const TEST_TIMEOUT = 60000 (not Duration objects)
- Tests must cover all CRUD operations from Repo.make: insert, insertVoid, update, updateVoid, findById, delete, insertManyVoid

### EntityId Format

- Public IDs use format: {tableName}__{uuid} (e.g., user__00000000-0000-0000-0000-000000000000)
- Use the entity's Id.make() factory to generate valid IDs
- For non-existent ID tests, use format with table prefix

### Branded Type Comparisons

- Use deepStrictEqual instead of strictEqual for branded types (Email, EmailId, etc.)
- Branded types serialize identically but have different object references

### Error Handling

- NoSuchElementException is a defect (die), use Effect.exit not Effect.either
- ParseError is a defect (die)
- DatabaseError is a failure, can use Effect.either

### Required Test Cases per Repository

1. Insert: Insert and verify returned entity matches
2. InsertVoid: Insert without return value
3. FindById: Find existing entity, returns Some
4. FindById non-existent: Returns None
5. Update: Update entity, verify changes
6. Update non-existent: Dies with failure
7. UpdateVoid: Update without return
8. Delete: Delete entity, verify removal
9. Delete non-existent: Should not error
10. InsertManyVoid: Batch insert
11. Complete CRUD workflow: Full lifecycle test
12. Optional fields: Test nullable/optional fields

### Foreign Key Dependencies

Many repos require parent entities. Create them in test setup:
- Account requires User
- Session requires User
- Member requires Organization and User
- etc.

### Mock Data

- Create makeMock{Entity} helper using @faker-js/faker
- Use @beep/schema EntityId factories for IDs
- Use @beep/schema branded schemas (Email, etc.)
