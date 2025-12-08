---
name: iam-repo-test-generator
version: 2
created: 2025-12-08T00:00:00Z
iterations: 1
---

# IAM Repository Test Generator - Refined Prompt

## Context

You are working in the `beep-effect` monorepo, a Bun-managed Effect-first full-stack application. The codebase uses:

- **Runtime**: Bun 1.3.x, Effect 3, `@effect/platform`, `@effect/sql-pg`
- **Database**: PostgreSQL with Drizzle ORM
- **Testing**: Bun's native test runner with `@beep/testkit` Effect integration
- **Architecture**: Vertical slices with `domain → tables → infra → sdk → ui` layering

### Relevant File Locations

| Category | Path |
|----------|------|
| **Repository sources** | `packages/iam/infra/src/adapters/repos/*.repo.ts` |
| **Test output directory** | `packages/_internal/db-admin/test/` |
| **Reference test file** | `packages/_internal/db-admin/test/UserRepo.test.ts` |
| **Test container setup** | `packages/_internal/db-admin/test/container.ts` |
| **Testkit utilities** | `tooling/testkit/src/` |
| **IAM entity models** | `packages/iam/domain/src/entities/*/` |
| **Shared entity models** | `packages/shared/domain/src/entities/*/` |
| **Entity ID schemas** | `packages/iam/domain/src/entity-ids.ts`, `packages/shared/domain/src/entity-ids.ts` |
| **Branded schemas** | `packages/common/schema/src/` |

### Entity Location Reference

| Entity | Model Location | ID Schema Location |
|--------|----------------|-------------------|
| User, Organization, Session, Team | `@beep/shared-domain/entities` | `SharedEntityIds` |
| Account, ApiKey, DeviceCode, Invitation, Jwks, Member, OAuthAccessToken, OAuthApplication, OAuthConsent, OrganizationRole, Passkey, RateLimit, ScimProvider, SsoProvider, Subscription, TeamMember, TwoFactor, Verification, WalletAddress | `@beep/iam-domain` | `IamEntityIds` |

**Important Import Notes:**
- **Shared entities** (User, Organization, Session, Team): Import models from `@beep/shared-domain/entities`, IDs from `SharedEntityIds`
- **IAM entities**: Import models from `@beep/iam-domain`, IDs from `IamEntityIds`
- **UserId, OrganizationId, TeamId, SessionId**: Always import from `SharedEntityIds`, even when used in IAM entity tests
- When testing IAM entities that reference User/Organization, import both `SharedEntityIds` and `IamEntityIds`

---

## Objective

Generate comprehensive unit test files for **22 IAM repositories**, each following the exact patterns established in `UserRepo.test.ts`.

### Success Criteria

1. **22 test files created** in `packages/_internal/db-admin/test/`:
   - `AccountRepo.test.ts`
   - `ApiKeyRepo.test.ts`
   - `DeviceCodeRepo.test.ts`
   - `InvitationRepo.test.ts`
   - `JwksRepo.test.ts`
   - `MemberRepo.test.ts`
   - `OAuthAccessTokenRepo.test.ts`
   - `OAuthApplicationRepo.test.ts`
   - `OAuthConsentRepo.test.ts`
   - `OrganizationRepo.test.ts`
   - `OrganizationRoleRepo.test.ts`
   - `PasskeyRepo.test.ts`
   - `RateLimitRepo.test.ts`
   - `ScimProviderRepo.test.ts`
   - `SessionRepo.test.ts`
   - `SsoProviderRepo.test.ts`
   - `SubscriptionRepo.test.ts`
   - `TeamMemberRepo.test.ts`
   - `TeamRepo.test.ts`
   - `TwoFactorRepo.test.ts`
   - `VerificationRepo.test.ts`
   - `WalletAddressRepo.test.ts`

2. **Each test file contains 10-12 test groups** covering:
   - Insert operations (insert with return, unique ID generation)
   - InsertVoid operations (insert without return, persistence verification)
   - FindById operations (existing returns Some, non-existent returns None)
   - Update operations (update field, update multiple, persistence check)
   - UpdateVoid operations (update without return)
   - Delete operations (delete existing, delete non-existent is idempotent)
   - InsertManyVoid operations (batch insert)
   - Error handling (unique constraint violation, update non-existent dies)
   - Complete CRUD workflow (full lifecycle test)
   - Optional fields (test nullable/optional field handling)

3. **All tests pass** when run with `bun run test --filter @beep/db-admin`

4. **Type-safe** with no TypeScript errors: `bun run check --filter @beep/db-admin`

---

## Role

You are an **Effect-first test engineer** specializing in repository integration testing. You have deep expertise in:

- Effect's service pattern (`Effect.Service`, `Layer`, `Context`)
- Effect error handling (`Effect.either` for failures, `Effect.exit` for defects)
- Effect Schema validation and branded types
- Testcontainers for database integration testing
- The `@beep/testkit` harness (`layer()`, `it.effect()`, assertions)

You write tests that are:
- **Deterministic**: Use `crypto.randomUUID()` for test isolation
- **Comprehensive**: Cover success paths, error paths, and edge cases
- **Effect-idiomatic**: No async/await, no native array methods, proper error handling
- **Well-structured**: Clear test group organization, descriptive names

---

## Constraints

### MUST Follow

1. **Effect-first code only**:
   ```typescript
   // REQUIRED
   Effect.gen(function* () { ... })
   yield* repo.insert(data)
   F.pipe(items, A.map(fn))

   // FORBIDDEN
   async/await
   items.map(fn)
   new Date()
   ```

2. **Namespace imports**:
   ```typescript
   import * as Effect from "effect/Effect";
   import * as O from "effect/Option";
   import * as S from "effect/Schema";
   import * as A from "effect/Array";
   import * as F from "effect/Function";
   import * as DateTime from "effect/DateTime";
   ```

3. **Test timeout as plain number**:
   ```typescript
   const TEST_TIMEOUT = 60000; // milliseconds, NOT Duration.seconds(60)
   ```

4. **Branded type comparisons**:
   ```typescript
   // REQUIRED for Email, EntityId, Phone, etc.
   deepStrictEqual(actual.email, expected.email);

   // WRONG - may fail for branded types
   strictEqual(actual.email, expected.email);
   ```

5. **Error handling distinction**:
   ```typescript
   // DatabaseError is a FAILURE - use Effect.either
   const result = yield* Effect.either(repo.insert(duplicate));
   strictEqual(result._tag, "Left");

   // NoSuchElementException is a DEFECT - use Effect.exit
   const exit = yield* Effect.exit(repo.update(nonExistent));
   strictEqual(exit._tag, "Failure");
   ```

   **Error Type Catalog:**
   | Error Type | Handling | Usage |
   |------------|----------|-------|
   | `DatabaseError` (unique violation) | `Effect.either` | Expected failures (constraint violations) |
   | `DatabaseError` (FK violation) | `Effect.either` | Missing parent entity |
   | `NoSuchElementException` | `Effect.exit` | Defects (update/delete non-existent) |
   | `ParseError` | `Effect.exit` | Schema validation failures (developer error) |
   | `SqlError` | `Effect.either` | Database connection issues |

6. **EntityId format**: `{tableName}__{uuid}`
   ```typescript
   // Non-existent ID for testing
   const nonExistentId = "account__00000000-0000-0000-0000-000000000000";

   // Regex validation
   expect(entity.id).toMatch(/^account__[0-9a-f-]+$/);
   ```

   **Table Name Reference** (from EntityId.make() definitions):
   | Entity | Table Name (for ID prefix) |
   |--------|---------------------------|
   | User | `user` |
   | Organization | `organization` |
   | Session | `session` |
   | Team | `team` |
   | Account | `account` |
   | ApiKey | `apikey` |
   | DeviceCode | `device_code` |
   | Invitation | `invitation` |
   | Jwks | `jwks` |
   | Member | `member` |
   | OAuthAccessToken | `oauth_access_token` |
   | OAuthApplication | `oauth_application` |
   | OAuthConsent | `oauth_consent` |
   | OrganizationRole | `organization_role` |
   | Passkey | `passkey` |
   | RateLimit | `rate_limit` |
   | ScimProvider | `scim_provider` |
   | SsoProvider | `sso_provider` |
   | Subscription | `subscription` |
   | TeamMember | `team_member` |
   | TwoFactor | `two_factor` |
   | Verification | `verification` |
   | WalletAddress | `wallet_address` |

   **Note**: Use the exact table name from EntityId.make() in test assertions. For example, use `apikey__uuid` not `api_key__uuid`.

7. **Foreign key setup**: Create parent entities before child entities
   ```typescript
   // Account requires User
   const user = yield* userRepo.insert(makeMockUser());
   const account = yield* accountRepo.insert(makeMockAccount({ userId: user.id }));
   ```

8. **Optional fields use Option**:
   ```typescript
   import * as O from "effect/Option";

   // Set optional field
   const updated = yield* repo.update({ ...entity, image: O.some("url") });

   // Check optional field
   strictEqual(updated.image._tag, "Some");
   strictEqual(O.getOrElse(updated.image, () => ""), "url");
   ```

   **Detecting Optional Fields**: Optional fields are typed as `Option<T>` in the entity model. Check the Model schema (`.model.ts` file) to identify which fields use `M.FieldOption()`, `S.optionalWith()`, or similar optional patterns. These require `O.some(value)` / `O.none()` handling in tests.

9. **Repository method availability**:
   - All repositories provide standard CRUD methods from `Repo.make()`: `insert`, `insertVoid`, `insertManyVoid`, `update`, `updateVoid`, `findById`, `delete`
   - Some repositories may have **custom methods** defined in their `.repo.ts` file (look for methods beyond the `Repo.make()` call)
   - If a repository has no custom methods, focus tests on the standard CRUD operations
   - Custom methods would appear in the Effect.gen block passed as third argument to `Repo.make()`

### MUST NOT Use

- Native array methods: `.map()`, `.filter()`, `.forEach()`, `.find()`, `.reduce()`
- Native string methods: `.split()`, `.trim()`, `.toLowerCase()`
- Native Date: `new Date()`, `Date.now()`
- Switch statements or long if-else chains
- `async/await` or bare Promises
- `strictEqual` for branded types (use `deepStrictEqual`)
- `Effect.either` for defects (use `Effect.exit`)
- Duration objects in test timeout (use plain milliseconds)

---

## Resources

### Files to Read Before Generating Each Test

1. **Reference test file** (MUST read first):
   ```
   packages/_internal/db-admin/test/UserRepo.test.ts
   ```

2. **Repository source file** (to understand custom methods):
   ```
   packages/iam/infra/src/adapters/repos/{Entity}.repo.ts
   ```

3. **Entity model file** (to understand schema and required fields):
   ```
   packages/iam/domain/src/entities/{Entity}/{Entity}.model.ts
   # OR for shared entities:
   packages/shared/domain/src/entities/{Entity}/{Entity}.model.ts
   ```

4. **Entity ID schema** (to get correct ID format):
   ```
   packages/iam/domain/src/entity-ids.ts
   packages/shared/domain/src/entity-ids.ts
   ```

5. **Test container setup**:
   ```
   packages/_internal/db-admin/test/container.ts
   ```

### Import Templates

```typescript
// Standard test imports
import { describe, expect } from "bun:test";
import { {Entity}Repo } from "@beep/iam-infra";
import { BS } from "@beep/schema";
import { {Entity} } from "@beep/iam-domain"; // or @beep/shared-domain/entities
import { assertNone, deepStrictEqual, layer, strictEqual, assertTrue } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { PgTest } from "./container";

// For entities with foreign keys, also import parent repos
import { UserRepo, OrganizationRepo, TeamRepo } from "@beep/iam-infra";
import { User, Organization, Team } from "@beep/shared-domain/entities";
```

---

## Output Specification

### File Structure Template

Each test file MUST follow this exact structure:

```typescript
import { describe, expect } from "bun:test";
// ... imports ...

/**
 * Timeout in milliseconds for bun test. Duration objects are not supported.
 */
const TEST_TIMEOUT = 60000;

/**
 * Helper to create a unique test identifier to avoid conflicts.
 */
const makeTestId = (prefix: string): string =>
  `${prefix}-${crypto.randomUUID()}`;

/**
 * Helper to create a mock {Entity} for insert operations.
 */
const makeMock{Entity} = (overrides?: Partial<{...}>) =>
  {Entity}.Model.jsonCreate.make({
    // Required fields with sensible defaults
    // Use overrides for customization
  });

// If entity has foreign keys, add helpers to create parent entities
const makeMockUser = (overrides?: Partial<{...}>) => { ... };

// IMPORTANT: Wrap all test groups in a describe block
describe("{Entity}Repo", () => {
  // ============================================================================
  // INSERT OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert {entity} and return entity with all fields",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );

    it.effect(
      "should generate unique id for each inserted {entity}",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERTVOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertVoid operations", (it) => {
    it.effect(
      "should insert {entity} without returning entity",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // FINDBYID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("findById operations", (it) => {
    it.effect(
      "should return Some when {entity} exists",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );

    it.effect(
      "should return None when {entity} does not exist",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // UPDATE OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("update operations", (it) => {
    it.effect(
      "should update {entity} field and return updated entity",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );

    it.effect(
      "should persist updated values",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // UPDATEVOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("updateVoid operations", (it) => {
    it.effect(
      "should update {entity} without returning entity",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("delete operations", (it) => {
    it.effect(
      "should delete existing {entity}",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );

    it.effect(
      "should not throw when deleting non-existent {entity}",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // INSERTMANYVOID OPERATIONS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("insertManyVoid operations", (it) => {
    it.effect(
      "should insert multiple {entities} without returning entities",
      () =>
        Effect.gen(function* () {
          const repo = yield* {Entity}Repo;
          // ... setup parent entities if needed ...

          const prefix = crypto.randomUUID();
          const entities = [
            makeMock{Entity}({ /* field1: makeTestId(`many-1-${prefix}`) */ }),
            makeMock{Entity}({ /* field1: makeTestId(`many-2-${prefix}`) */ }),
            makeMock{Entity}({ /* field1: makeTestId(`many-3-${prefix}`) */ }),
          ] as const;

          // IMPORTANT: Type assertion needed for NonEmptyArray
          const result = yield* repo.insertManyVoid(
            entities as unknown as readonly [
              typeof {Entity}.Model.insert.Type,
              ...(typeof {Entity}.Model.insert.Type)[]
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
      "should fail with DatabaseError on unique constraint violation",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );

    it.effect(
      "should die when updating non-existent {entity}",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // COMPLETE CRUD WORKFLOW
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("complete CRUD workflow", (it) => {
    it.effect(
      "should complete full create-read-update-delete cycle",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );
  });

  // ============================================================================
  // OPTIONAL FIELDS
  // ============================================================================
  layer(PgTest, { timeout: Duration.seconds(60) })("optional fields", (it) => {
    it.effect(
      "should handle optional {field} field",
      () => Effect.gen(function* () { ... }),
      TEST_TIMEOUT
    );
  });
}); // End of describe("{Entity}Repo")
```

---

## Examples

### Example: Insert Test with Foreign Key Setup

```typescript
it.effect(
  "should insert account and return entity with all fields",
  () =>
    Effect.gen(function* () {
      const userRepo = yield* UserRepo;
      const accountRepo = yield* AccountRepo;

      // Setup: Create parent entity (User)
      const user = yield* userRepo.insert(makeMockUser({
        email: makeTestEmail("account-insert"),
        name: "Account Test User",
      }));

      // Action: Insert Account
      const mockAccount = makeMockAccount({
        userId: user.id,
        accountId: makeTestId("google"),
        providerId: "google",
      });
      const inserted = yield* accountRepo.insert(mockAccount);

      // Verify schema conformance
      assertTrue(S.is(Account.Model)(inserted));

      // Verify fields
      deepStrictEqual(inserted.userId, user.id);
      strictEqual(inserted.providerId, "google");

      // Verify ID format
      expect(inserted.id).toMatch(/^account__[0-9a-f-]+$/);
    }),
  TEST_TIMEOUT
);
```

### Example: Update Non-Existent (Defect Handling)

```typescript
it.effect(
  "should die when updating non-existent account",
  () =>
    Effect.gen(function* () {
      const userRepo = yield* UserRepo;
      const accountRepo = yield* AccountRepo;

      // Setup: Create and then delete an account
      const user = yield* userRepo.insert(makeMockUser({
        email: makeTestEmail("update-nonexistent"),
      }));

      const mockAccount = makeMockAccount({
        userId: user.id,
        accountId: makeTestId("delete-test"),
        providerId: "github",
      });
      const inserted = yield* accountRepo.insert(mockAccount);
      yield* accountRepo.delete(inserted.id);

      // Action: Try to update deleted account
      const exit = yield* Effect.exit(
        accountRepo.update({
          ...inserted,
          providerId: "should-not-work",
        })
      );

      // Verify: Should be a defect (die), not a failure
      strictEqual(exit._tag, "Failure");
    }),
  TEST_TIMEOUT
);
```

### Example: Optional Field Handling

```typescript
it.effect(
  "should handle optional accessToken field",
  () =>
    Effect.gen(function* () {
      const userRepo = yield* UserRepo;
      const accountRepo = yield* AccountRepo;

      const user = yield* userRepo.insert(makeMockUser({
        email: makeTestEmail("optional-field"),
      }));

      // Create without optional field
      const accountWithoutToken = yield* accountRepo.insert(
        makeMockAccount({
          userId: user.id,
          accountId: makeTestId("no-token"),
          providerId: "google",
          // accessToken not provided
        })
      );

      // accessToken should be None
      strictEqual(accountWithoutToken.accessToken._tag, "None");

      // Update with optional field
      const updated = yield* accountRepo.update({
        ...accountWithoutToken,
        accessToken: O.some("new-access-token-xyz"),
      });

      // Verify field is now Some
      strictEqual(updated.accessToken._tag, "Some");
      strictEqual(O.getOrElse(updated.accessToken, () => ""), "new-access-token-xyz");
    }),
  TEST_TIMEOUT
);
```

---

## Dependency Graph for Test Setup

When testing entities with foreign keys, create parent entities first:

```
Level 0 (No dependencies):
  - User

Level 1 (Depends on User):
  - Organization (ownerUserId → User)
  - Account (userId → User)
  - ApiKey (userId → User)
  - TwoFactor (userId → User)
  - Passkey (userId → User)
  - Verification (userId → User)
  - RateLimit (userId → User) [if user-scoped]
  - DeviceCode (userId → User)
  - Jwks (no FK typically)

Level 2 (Depends on User + Organization):
  - Session (userId → User, activeOrganizationId → Organization)
  - Member (userId → User, organizationId → Organization)
  - Team (organizationId → Organization)
  - Invitation (inviterId → User, organizationId → Organization)
  - OrganizationRole (organizationId → Organization)
  - SsoProvider (organizationId → Organization)
  - ScimProvider (organizationId → Organization)
  - Subscription (organizationId → Organization)
  - OAuthApplication (organizationId → Organization) [if org-scoped]
  - WalletAddress (userId → User)

Level 3 (Depends on Team):
  - TeamMember (userId → User, teamId → Team, organizationId → Organization)
  - Session (activeTeamId → Team) [optional]

Level 4 (Depends on OAuthApplication):
  - OAuthAccessToken (userId → User, applicationId → OAuthApplication)
  - OAuthConsent (userId → User, applicationId → OAuthApplication)
```

---

## Verification Checklist

For each generated test file, verify:

- [ ] File created at correct path: `packages/_internal/db-admin/test/{Entity}Repo.test.ts`
- [ ] All imports use namespace style (`import * as Effect from "effect/Effect"`)
- [ ] `TEST_TIMEOUT = 60000` is a plain number, not Duration
- [ ] `makeMock{Entity}` helper uses `Entity.Model.jsonCreate.make()`
- [ ] Foreign key dependencies are created before child entities
- [ ] `deepStrictEqual` used for branded types (Email, EntityId, etc.)
- [ ] `Effect.either` used for DatabaseError assertions
- [ ] `Effect.exit` used for NoSuchElementException (defect) assertions
- [ ] Non-existent IDs use format: `{tableName}__00000000-0000-0000-0000-000000000000`
- [ ] All 10-12 test groups present (insert, insertVoid, findById, update, updateVoid, delete, insertManyVoid, error handling, CRUD workflow, optional fields)
- [ ] No native array methods (`.map()`, `.filter()`, etc.)
- [ ] No `async/await` or bare Promises
- [ ] No `new Date()` - use `DateTime.unsafeNow()` if needed
- [ ] Schema validation with `assertTrue(S.is(Entity.Model)(entity))`
- [ ] Unique test data using `crypto.randomUUID()`

---

## Execution Strategy

Deploy **parallel subagents** to maximize efficiency:

1. **Batch 1** (No dependencies - can run in parallel):
   - UserRepo (already done - reference)
   - OrganizationRepo
   - JwksRepo
   - RateLimitRepo
   - DeviceCodeRepo

2. **Batch 2** (Depends on User):
   - AccountRepo
   - ApiKeyRepo
   - TwoFactorRepo
   - PasskeyRepo
   - VerificationRepo
   - WalletAddressRepo

3. **Batch 3** (Depends on User + Organization):
   - SessionRepo
   - MemberRepo
   - TeamRepo
   - InvitationRepo
   - OrganizationRoleRepo
   - SsoProviderRepo
   - ScimProviderRepo
   - SubscriptionRepo
   - OAuthApplicationRepo

4. **Batch 4** (Depends on Team or OAuthApplication):
   - TeamMemberRepo
   - OAuthAccessTokenRepo
   - OAuthConsentRepo

Each subagent should:
1. Read the repository source file
2. Read the entity model file
3. Identify required fields and foreign keys
4. Generate test file following the template
5. Verify no TypeScript errors

---

## Metadata

### Research Sources

**Files Explored:**
- `packages/_internal/db-admin/test/UserRepo.test.ts` (reference template)
- `packages/_internal/db-admin/test/container.ts` (PgTest layer)
- `packages/iam/infra/src/adapters/repos/*.repo.ts` (all 22+ repos)
- `packages/iam/domain/src/entities/*/` (entity models)
- `packages/shared/domain/src/entities/*/` (shared entity models)
- `packages/shared/infra/src/internal/db/pg/repo.ts` (Repo.make implementation)
- `tooling/testkit/src/` (layer(), assertions)

**AGENTS.md Files Consulted:**
- `packages/iam/infra/AGENTS.md`
- `packages/_internal/db-admin/AGENTS.md`
- `tooling/testkit/AGENTS.md`
- `packages/shared/infra/AGENTS.md`

**Effect Documentation:**
- Effect.exit for defect handling
- Effect.either for failure handling
- Layer composition for tests
- Model/Repository patterns

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | 6 issues (1 HIGH, 2 MEDIUM, 3 LOW) | Added describe() wrapper to template; Added EntityId table name reference; Clarified import paths for shared vs IAM entities; Added error type catalog; Added NonEmptyArray type assertion example; Added optional field detection guidance; Added repository method availability guidance |
