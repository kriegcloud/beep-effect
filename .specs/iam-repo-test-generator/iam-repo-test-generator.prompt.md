---
name: iam-repo-test-generator
version: 3
created: 2025-12-08T00:00:00Z
iterations: 2
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
   - Property-based tests (optional, using `effect/Arbitrary` and `effect/FastCheck` for round-trip, idempotence, and schema validation)

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

## Property-Based Testing with Effect Arbitrary & FastCheck

In addition to example-based tests, repository tests can leverage **property-based testing** to discover edge cases automatically. Effect provides two modules that enable this:

- **`effect/Arbitrary`** — Derives test data generators directly from Effect Schemas
- **`effect/FastCheck`** — Re-exports the complete `fast-check` library for property testing

### Why Property-Based Testing for Repositories

Property-based testing is valuable for repository operations because:

1. **Automatic edge case discovery**: Finds corner cases (empty strings, extreme numbers, special characters) developers might miss
2. **Schema-constraint alignment**: Generated data always respects all schema rules (patterns, ranges, formats)
3. **Round-trip verification**: Ensures insert → findById returns equivalent data
4. **Idempotence checking**: Verifies delete operations are idempotent
5. **Schema evolution**: When entity schemas change, arbitraries adapt automatically

### Core Concepts

#### Deriving Arbitraries from Schemas

Schemas encode all domain rules. Use `Arbitrary.make()` to automatically generate conforming test data:

```typescript
import * as Arbitrary from "effect/Arbitrary";
import * as FastCheck from "effect/FastCheck";
import * as S from "effect/Schema";
import { User } from "@beep/shared-domain/entities";

// Derive arbitrary from the entity's Model schema
const UserArb = Arbitrary.make(User.Model);

// Generate sample values for inspection
console.log(FastCheck.sample(UserArb, 5));
// → [{ id: "user__abc123...", email: "x@y.z", name: "qr", ... }, ...]
```

#### Key Functions

| Function | Purpose |
|----------|---------|
| `Arbitrary.make(schema)` | Returns `FastCheck.Arbitrary<A>` that generates values matching schema |
| `Arbitrary.makeLazy(schema)` | Returns `LazyArbitrary<A>` for deferred generation with context control |
| `FastCheck.sample(arb, count)` | Generate sample values for debugging |
| `FastCheck.assert(property)` | Run property assertions with automatic shrinking |
| `FastCheck.property(arb, predicate)` | Define a property to test |
| `FastCheck.asyncProperty(arb, predicate)` | Define an async property (for Effect tests) |

#### Constraint Types

Arbitraries automatically respect schema constraints:

| Schema Constraint | Arbitrary Behavior |
|-------------------|-------------------|
| `S.between(1, 100)` | Generates integers in range [1, 100] |
| `S.pattern(/^[a-z]+$/)` | Uses `stringMatching` for efficient generation |
| `S.nonEmptyString()` | Never generates empty strings |
| `S.optional(...)` | Sometimes generates `None`, sometimes `Some` |
| `S.Array(...)` | Generates arrays with configurable length |

### Import Pattern for Property Tests

```typescript
import { describe, expect } from "bun:test";
import * as Arbitrary from "effect/Arbitrary";
import * as FastCheck from "effect/FastCheck";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as O from "effect/Option";
import * as F from "effect/Function";
import { layer, strictEqual, deepStrictEqual } from "@beep/testkit";
```

### Repository Property Test Patterns

#### Pattern 1: Round-Trip Property (Insert → Find)

```typescript
layer(PgTest, { timeout: Duration.seconds(120) })("property: insert round-trip", (it) => {
  it.effect(
    "should retrieve inserted entity with equivalent data",
    () =>
      Effect.gen(function* () {
        const userRepo = yield* UserRepo;
        const accountRepo = yield* AccountRepo;

        // Generate arbitrary insert data
        const AccountInsertArb = Arbitrary.make(Account.Model.insert);

        // Create parent entity first
        const user = yield* userRepo.insert(makeMockUser({
          email: makeTestEmail("prop-roundtrip"),
        }));

        // Run property test
        yield* Effect.promise(() =>
          FastCheck.assert(
            FastCheck.asyncProperty(AccountInsertArb, async (accountData) => {
              // Override foreign key to use our test user
              const dataWithUser = { ...accountData, userId: user.id };

              const inserted = await Effect.runPromise(
                accountRepo.insert(dataWithUser)
              );
              const found = await Effect.runPromise(
                accountRepo.findById(inserted.id)
              );

              // Property: Found entity should match inserted entity
              return (
                O.isSome(found) &&
                found.value.id === inserted.id &&
                found.value.userId === user.id
              );
            }),
            { numRuns: 20 } // Limit runs for integration tests
          )
        );
      }),
    120000
  );
});
```

#### Pattern 2: CRUD Invariants

```typescript
it.effect(
  "property: create-read-update-delete maintains consistency",
  () =>
    Effect.gen(function* () {
      const repo = yield* AccountRepo;
      const userRepo = yield* UserRepo;

      const user = yield* userRepo.insert(makeMockUser({
        email: makeTestEmail("prop-crud"),
      }));

      const AccountInsertArb = Arbitrary.make(Account.Model.insert);

      yield* Effect.promise(() =>
        FastCheck.assert(
          FastCheck.asyncProperty(AccountInsertArb, async (accountData) => {
            const dataWithUser = { ...accountData, userId: user.id };

            // Create
            const created = await Effect.runPromise(repo.insert(dataWithUser));

            // Read - should exist
            const found1 = await Effect.runPromise(repo.findById(created.id));
            if (!O.isSome(found1)) return false;

            // Update
            const updated = await Effect.runPromise(
              repo.update({ ...created, providerId: "updated-provider" })
            );
            if (updated.providerId !== "updated-provider") return false;

            // Delete
            await Effect.runPromise(repo.delete(created.id));

            // Read again - should not exist
            const found2 = await Effect.runPromise(repo.findById(created.id));
            return O.isNone(found2);
          }),
          { numRuns: 10 }
        )
      );
    }),
  180000
);
```

#### Pattern 3: Delete Idempotence

```typescript
it.effect(
  "property: delete is idempotent",
  () =>
    Effect.gen(function* () {
      const repo = yield* AccountRepo;
      const userRepo = yield* UserRepo;

      const user = yield* userRepo.insert(makeMockUser({
        email: makeTestEmail("prop-idempotent"),
      }));

      const AccountInsertArb = Arbitrary.make(Account.Model.insert);

      yield* Effect.promise(() =>
        FastCheck.assert(
          FastCheck.asyncProperty(AccountInsertArb, async (accountData) => {
            const created = await Effect.runPromise(
              repo.insert({ ...accountData, userId: user.id })
            );

            // Delete twice - second should not throw
            await Effect.runPromise(repo.delete(created.id));
            await Effect.runPromise(repo.delete(created.id));

            // Verify deleted
            const found = await Effect.runPromise(repo.findById(created.id));
            return O.isNone(found);
          }),
          { numRuns: 10 }
        )
      );
    }),
  120000
);
```

### Customizing Arbitraries for Realistic Data

Use the `arbitrary` annotation on schemas for realistic test data:

```typescript
import { faker } from "@faker-js/faker";

// Realistic email generator
const RealisticEmail = S.String.pipe(
  S.pattern(/^[^@]+@[^@]+\.[^@]+$/)
).annotations({
  arbitrary: () => (fc) =>
    fc.constant(null).map(() => faker.internet.email())
});

// Realistic name generator
const RealisticName = S.NonEmptyString.annotations({
  arbitrary: () => (fc) =>
    fc.constant(null).map(() => faker.person.fullName())
});

// Limited set of provider IDs
const ProviderId = S.String.annotations({
  arbitrary: () => (fc) =>
    fc.constantFrom("google", "github", "microsoft", "apple", "discord")
});
```

### Critical Rules for Arbitrary Generation

#### 1. Use `S.pattern()` for String Patterns (NOT `S.filter()`)

```typescript
// ❌ WRONG - Custom filter is inefficient and can hang
const BadEmail = S.String.pipe(
  S.filter((s) => /^[^@]+@[^@]+\.[^@]+$/.test(s))
);

// ✅ CORRECT - Uses efficient stringMatching internally
const GoodEmail = S.String.pipe(
  S.pattern(/^[^@]+@[^@]+\.[^@]+$/)
);
```

**Why?** `S.pattern` uses `FastCheck.stringMatching(regexp)` which generates valid strings directly. Custom filters use rejection sampling, which can hang if the filter rejects too many values.

#### 2. Apply Filters AFTER Transformations

```typescript
// ❌ WRONG - Filter before transformation is ignored during arbitrary generation
const BadSchema = S.compose(
  S.NonEmptyString,  // ← Filter ignored!
  S.Trim
);

// ✅ CORRECT - Filters after transformations are applied
const GoodSchema = S.Trim.pipe(
  S.nonEmptyString()  // ← Filter applied
);
```

#### 3. Avoid Conflicting Filters

```typescript
// ❌ DANGER - Conflicting filters can hang generation
const ProblematicSchema = S.Int.pipe(
  S.between(1, 100),       // Must be 1-100
  S.filter((n) => n > 200) // But also > 200? Impossible!
);

// ✅ SAFE - Ensure filters are compatible
const WorkingSchema = S.Int.pipe(
  S.between(1, 100),
  S.filter((n) => n % 2 === 0)  // Even numbers in 1-100
);
```

#### 4. Handle Recursive Schemas with Depth Control

```typescript
// Recursive schemas default to maxDepth: 2
const TreeArb = Arbitrary.make(TreeSchema);

// Override for deeper structures
const DeepTreeArb = Arbitrary.makeLazy(TreeSchema)({ maxDepth: 5 });
```

### FastCheck Configuration Options

When running property tests, configure fast-check appropriately:

```typescript
FastCheck.assert(
  FastCheck.asyncProperty(arb, predicate),
  {
    numRuns: 20,           // Number of test runs (default: 100)
    seed: 12345,           // Optional: reproducible randomness
    verbose: 1,            // 0=silent, 1=show failures, 2=show all
    endOnFailure: true,    // Stop on first failure
    timeout: 30000,        // Per-property timeout
  }
);
```

For integration tests, use lower `numRuns` (10-20) to balance coverage vs test time.

### Shrinking and Counterexamples

fast-check automatically **shrinks** failing test cases to minimal examples:

```typescript
// If this fails with [10, 20, 30, 40, 50], fast-check will shrink to [0, 0, 0, 0, 0]
FastCheck.assert(
  FastCheck.property(
    FastCheck.array(FastCheck.integer()),
    (arr) => arr.length < 5
  )
);
// → Counterexample: [0, 0, 0, 0, 0] (minimal array of length 5)
```

This makes debugging easier by finding the simplest failing case.

### Sampling for Debugging

Use `FastCheck.sample()` to inspect what values are generated:

```typescript
const AccountInsertArb = Arbitrary.make(Account.Model.insert);

// Generate 10 samples to see what data looks like
const samples = FastCheck.sample(AccountInsertArb, 10);
console.log(JSON.stringify(samples, null, 2));

// Useful for:
// - Verifying generators produce expected values
// - Understanding what edge cases are covered
// - Debugging failing properties
```

### When to Use Property Tests vs Example Tests

| Use Property Tests When | Use Example Tests When |
|-------------------------|------------------------|
| Testing invariants (round-trip, idempotence) | Testing specific edge cases (null ID, duplicate key) |
| Verifying schema constraints are respected | Testing error messages and specific error types |
| Exploring the full input space | Testing specific business rules |
| Regression testing after schema changes | Testing integration with specific external data |

### Property Test Group Template

Add this as an optional 11th test group in repository tests:

```typescript
// ============================================================================
// PROPERTY-BASED TESTS (Optional)
// ============================================================================
layer(PgTest, { timeout: Duration.seconds(180) })("property-based tests", (it) => {
  it.effect(
    "property: insert and findById round-trip",
    () =>
      Effect.gen(function* () {
        const repo = yield* {Entity}Repo;
        // ... setup parent entities if needed ...

        const InsertArb = Arbitrary.make({Entity}.Model.insert);

        yield* Effect.promise(() =>
          FastCheck.assert(
            FastCheck.asyncProperty(InsertArb, async (insertData) => {
              // Override foreign keys as needed
              const data = { ...insertData, /* userId: parentUser.id */ };

              const inserted = await Effect.runPromise(repo.insert(data));
              const found = await Effect.runPromise(repo.findById(inserted.id));

              return O.isSome(found) && found.value.id === inserted.id;
            }),
            { numRuns: 15 }
          )
        );
      }),
    180000
  );

  it.effect(
    "property: delete is idempotent",
    () =>
      Effect.gen(function* () {
        const repo = yield* {Entity}Repo;
        // ... setup parent entities if needed ...

        const InsertArb = Arbitrary.make({Entity}.Model.insert);

        yield* Effect.promise(() =>
          FastCheck.assert(
            FastCheck.asyncProperty(InsertArb, async (insertData) => {
              const data = { ...insertData, /* userId: parentUser.id */ };

              const inserted = await Effect.runPromise(repo.insert(data));

              // Delete twice should not throw
              await Effect.runPromise(repo.delete(inserted.id));
              await Effect.runPromise(repo.delete(inserted.id));

              const found = await Effect.runPromise(repo.findById(inserted.id));
              return O.isNone(found);
            }),
            { numRuns: 10 }
          )
        );
      }),
    120000
  );

  it.effect(
    "property: schema encoding round-trips",
    () =>
      Effect.gen(function* () {
        const ModelArb = Arbitrary.make({Entity}.Model);

        yield* Effect.promise(() =>
          FastCheck.assert(
            FastCheck.property(ModelArb, (entity) => {
              const encoded = S.encodeSync({Entity}.Model)(entity);
              const decoded = S.decodeSync({Entity}.Model)(encoded);
              return decoded.id === entity.id;
            }),
            { numRuns: 50 }
          )
        );
      }),
    60000
  );
});
```

### Limitations and Considerations

1. **Integration test overhead**: Property tests with database operations are slower; limit `numRuns` to 10-20
2. **Foreign key setup**: Must create parent entities before running property tests on child entities
3. **Unique constraints**: May need to override generated unique fields (email, etc.) to avoid collisions
4. **Test isolation**: Each property run may create database records; consider cleanup strategies
5. **Testkit support**: The `@beep/testkit` `prop` method is currently a placeholder; use `FastCheck.assert` directly within `it.effect` as shown above

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

// For property-based tests (optional)
import * as Arbitrary from "effect/Arbitrary";
import * as FastCheck from "effect/FastCheck";
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
- effect/Arbitrary for schema-derived test generators
- effect/FastCheck for property-based testing

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | 6 issues (1 HIGH, 2 MEDIUM, 3 LOW) | Added describe() wrapper to template; Added EntityId table name reference; Clarified import paths for shared vs IAM entities; Added error type catalog; Added NonEmptyArray type assertion example; Added optional field detection guidance; Added repository method availability guidance |
| 2         | Property-based testing enhancement | Added comprehensive "Property-Based Testing with Effect Arbitrary & FastCheck" section covering: deriving arbitraries from schemas; repository property test patterns (round-trip, CRUD invariants, idempotence); critical rules for arbitrary generation (pattern vs filter, filter ordering, conflicting filters); FastCheck configuration; shrinking/counterexamples; when to use property vs example tests; property test group template; limitations and considerations |
