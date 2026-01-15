# Better Auth Schema Transformations — Phase 2 Orchestrator Prompt

> Execute Phase 2: Account Entity

---

## Critical Rules

1. **USE ESTABLISHED PATTERNS** — Session (Phase 1) patterns are documented in HANDOFF_P2.md
2. **NEVER use type assertions** — Use explicit type annotations instead
3. **Struct+Record pattern** — All Better Auth schemas use `F.pipe(S.Struct({...}), S.extend(S.Record({...})))`
4. **transformOrFail.decode returns Encoded** — NOT Type! Just return the raw encoded object
5. **RUN VERIFICATION after implementation** — All checks must pass before reflection
6. **RUN REFLECTION after completion** — Use `reflector` agent to capture learnings

---

## Context from Phase 1 (Session)

### Completed Files
- `packages/iam/client/src/v1/_common/session.schemas.ts`
- `packages/iam/client/src/v1/_common/transformation-helpers.ts`
- Updated `packages/iam/client/src/v1/_common/common.schemas.ts`

### Shared Helpers Available
```typescript
import { requireNumber, requireString, requireDate, requireBoolean, toDate } from "./transformation-helpers";
```

### Key Pattern: Required Fields MUST Fail if Missing
```typescript
type AccountModelEncoded = S.Schema.Encoded<typeof Account.Model>;

decode: (betterAuthAccount, _options, ast) =>
  Effect.gen(function* () {
    // Validations...

    // REQUIRED FIELDS - Must be present, FAIL if missing
    const _rowId = yield* requireNumber(betterAuthAccount, "_rowId", ast);
    const version = yield* requireNumber(betterAuthAccount, "version", ast);
    const source = yield* requireString(betterAuthAccount, "source", ast);
    const deletedAt = yield* requireDate(betterAuthAccount, "deletedAt", ast);
    const createdBy = yield* requireString(betterAuthAccount, "createdBy", ast);
    const updatedBy = yield* requireString(betterAuthAccount, "updatedBy", ast);
    const deletedBy = yield* requireString(betterAuthAccount, "deletedBy", ast);

    const encodedAccount: AccountModelEncoded = {
      id: betterAuthAccount.id,
      _rowId,
      version,
      source,
      deletedAt,
      createdBy,
      updatedBy,
      deletedBy,
      // ... other fields
    };

    return encodedAccount;  // Just return the object, NOT ParseResult.decode!
  }),
```

---

## Phase 2 Task: Account Entity

### Step 2.1: Research Account Schema

Read the Better Auth source directly:
```
tmp/better-auth/packages/core/src/db/schema/account.ts
```

Expected core fields:
- id, userId, providerId, accountId
- accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt
- idToken, expiresAt, password (hashed)
- createdAt, updatedAt

**Important**: Check for `returned: false` fields — these should NOT be included in the client schema.

### Step 2.2: Locate Domain Model

Read `@beep/iam-domain/entities/Account` to understand:
- All required fields
- Default values
- Custom transformations (Redacted, Option, DateTime.Utc)

### Step 2.3: Create Schema File

Create `packages/iam/client/src/v1/_common/account.schemas.ts`:

```typescript
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";  // or SharedEntityIds if Account uses shared IDs
import { Account } from "@beep/iam-domain/entities";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireNumber, requireString, requireDate, requireBoolean, toDate } from "./transformation-helpers";

const $I = $IamClientId.create("_common/account.schemas");

// Schema for Better Auth account
export const BetterAuthAccountSchema = F.pipe(
  S.Struct({
    id: S.String,
    userId: S.String,
    providerId: S.String,
    accountId: S.String,
    // ... other fields from research
    createdAt: S.Date,
    updatedAt: S.Date,
  }),
  S.extend(S.Record({ key: S.String, value: S.Unknown })),
  S.annotations($I.annotations("BetterAuthAccount", {
    description: "The account object returned from the BetterAuth library.",
  })),
);

export type BetterAuthAccount = S.Schema.Type<typeof BetterAuthAccountSchema>;
export type BetterAuthAccountEncoded = S.Schema.Encoded<typeof BetterAuthAccountSchema>;

// Type alias for proper typing without assertions
type AccountModelEncoded = S.Schema.Encoded<typeof Account.Model>;

// Transformation schema
export const DomainAccountFromBetterAuthAccount = S.transformOrFail(BetterAuthAccountSchema, Account.Model, {
  strict: true,
  decode: (betterAuthAccount, _options, ast) =>
    Effect.gen(function* () {
      // Validate ID formats...

      // Construct encoded form with explicit type annotation
      const encodedAccount: AccountModelEncoded = {
        // ... fields
      };

      return encodedAccount;  // Just return, no ParseResult.decode!
    }),

  encode: (accountEncoded, _options, _ast) =>
    Effect.gen(function* () {
      // Convert back to BetterAuthAccount format
      // Use toDate() for timestamp conversions
    }),
}).annotations($I.annotations("DomainAccountFromBetterAuthAccount", {
  description: "Transforms a Better Auth account response into the domain Account.Model.",
}));

export declare namespace DomainAccountFromBetterAuthAccount {
  export type Type = typeof DomainAccountFromBetterAuthAccount.Type;
  export type Encoded = typeof DomainAccountFromBetterAuthAccount.Encoded;
}
```

### Step 2.4: Export and Verify

1. Add export to `packages/iam/client/src/v1/_common/index.ts`
2. Run verification:
   ```bash
   bun run check --filter=@beep/iam-client
   bun run build --filter=@beep/iam-client
   bun run lint:fix --filter=@beep/iam-client
   ```

### Step 2.5: Run Reflection (MANDATORY)

Invoke the `reflector` agent:
```
Reflect on Phase 2 (Account) of the Better Auth Schema Transformations spec.

Review:
1. What worked well during Account implementation?
2. What didn't work or required iteration?
3. Any surprising findings about the Account entity?
4. Are there new patterns that should be extracted as shared helpers?
5. Any prompt refinements needed for Phase 3 (Verification)?

Update REFLECTION_LOG.md with Phase 2 learnings.
```

### Step 2.6: Create Handoff for Phase 3

Create `handoffs/HANDOFF_P3.md` and `handoffs/P3_ORCHESTRATOR_PROMPT.md`.

---

## Success Criteria for Phase 2

- [ ] `BetterAuthAccountSchema` created with Struct+Record pattern
- [ ] `DomainAccountFromBetterAuthAccount` transformation working
- [ ] Uses type annotation pattern (NO type assertions)
- [ ] Uses shared helpers (`require*` helpers, `toDate`)
- [ ] Exported from `packages/iam/client/src/v1/_common/index.ts`
- [ ] All `bun run check/build/lint:fix` pass
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] HANDOFF_P3.md created
- [ ] P3_ORCHESTRATOR_PROMPT.md created

---

## Common Mistakes to Avoid

1. **DO NOT** use `new Model({...})` in decode — return raw encoded object
2. **DO NOT** call `ParseResult.decode()` at end of decode callback
3. **DO NOT** use type assertions (`as T`)
4. **DO NOT** use `S.Class` for Better Auth schemas — use Struct+Record
5. **DO NOT** forget to add `S.extend(S.Record({...}))` for unknown properties
6. **DO NOT** skip ID format validation

---

## Verification Commands

```bash
# After implementation
bun run check --filter=@beep/iam-client
bun run build --filter=@beep/iam-client
bun run lint:fix --filter=@beep/iam-client

# If errors, iterate until all pass
```
