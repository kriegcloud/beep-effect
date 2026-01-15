# Better Auth Schema Transformations — Phase 5 Orchestrator Prompt

> Execute Phase 5: TwoFactor Entity

---

## Critical Rules

1. **USE ESTABLISHED PATTERNS** — Session, Account, Verification, RateLimit patterns documented in handoffs
2. **NEVER use type assertions** — Use explicit type annotations instead
3. **Struct+Record pattern** — All Better Auth schemas use `F.pipe(S.Struct({...}), S.extend(S.Record({...})))`
4. **transformOrFail.decode returns Encoded** — NOT Type! Just return the raw encoded object
5. **EXCLUDE returned: false fields** — These are NEVER returned by Better Auth API
6. **RUN VERIFICATION after implementation** — All checks must pass before reflection
7. **RUN REFLECTION after completion** — Update REFLECTION_LOG.md with learnings

---

## ⚠️ CRITICAL: TwoFactor Has Secret Fields

Unlike previous entities, TwoFactor contains authentication secrets (TOTP secrets, backup codes).

1. **returned: false fields MUST be excluded** — Better Auth marks sensitive fields with `{ returned: false }`. These should NOT appear in `BetterAuthTwoFactorSchema`.
2. **Check domain for FieldSensitiveOptionOmittable** — Domain model may use sensitive wrappers
3. **Read the source first** — MUST read `tmp/better-auth/packages/better-auth/src/plugins/two-factor/schema.ts` before implementing

---

## Context from Previous Phases

### Completed Files
- `packages/iam/client/src/v1/_common/session.schemas.ts` (Phase 1)
- `packages/iam/client/src/v1/_common/account.schemas.ts` (Phase 2)
- `packages/iam/client/src/v1/_common/verification.schemas.ts` (Phase 3)
- `packages/iam/client/src/v1/_common/rate-limit.schemas.ts` (Phase 4)
- `packages/iam/client/src/v1/_common/transformation-helpers.ts`

### Shared Helpers Available
```typescript
import { requireNumber, requireString, requireDate, requireBoolean, toDate } from "./transformation-helpers";
```

### Key Pattern from Phase 4
When `M.Generated` fields need null validation:
```typescript
const createdAtRaw = yield* requireDate(ba, "createdAt", ast);
if (createdAtRaw === null) {
  return yield* ParseResult.fail(new ParseResult.Type(ast, createdAtRaw, "createdAt is required"));
}
const createdAt = createdAtRaw; // TypeScript narrows to Date
```

---

## Phase 5 Task: TwoFactor Entity

### Step 5.1: Research TwoFactor Schema (MUST DO FIRST)

Read the Better Auth source file:
```
tmp/better-auth/packages/better-auth/src/plugins/two-factor/schema.ts
```

**Identify**:
1. All field definitions
2. Which fields have `returned: false` annotation (EXCLUDE from client schema)
3. Whether it extends `coreSchema`
4. Field types and optionality

### Step 5.2: Review Domain Model

Read the domain model:
```
packages/iam/domain/src/entities/TwoFactor/TwoFactor.model.ts
```

**Identify**:
1. Field definitions from `makeFields`
2. Which fields use `BS.FieldSensitiveOptionOmittable` (for secrets)
3. Foreign key relationships (expect `userId`)

### Step 5.3: Create Schema File

Create `packages/iam/client/src/v1/_common/two-factor.schemas.ts`:

**Structure** (fill in fields after research):
```typescript
import { TwoFactor } from "@beep/iam-domain/entities";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireDate, requireNumber, requireString, toDate } from "./transformation-helpers";

const $I = $IamClientId.create("_common/two-factor.schemas");

/**
 * Schema representing a Better Auth two-factor authentication object.
 *
 * NOTE: Fields marked `returned: false` in Better Auth source are EXCLUDED.
 * These contain sensitive data (TOTP secrets) that are never returned by the API.
 *
 * Uses Struct with Record extension for plugin fields.
 */
export const BetterAuthTwoFactorSchema = F.pipe(
  S.Struct({
    // Core fields from coreSchema (id, createdAt, updatedAt)
    id: S.String,
    createdAt: S.Date,
    updatedAt: S.Date,
    // TwoFactor-specific fields (EXCLUDE returned: false)
    // ... fill in from research ...
    userId: S.String,
  }),
  S.extend(S.Record({ key: S.String, value: S.Unknown })),
  S.annotations(
    $I.annotations("BetterAuthTwoFactor", {
      description: "The two-factor auth object returned from the BetterAuth library.",
    })
  )
);

// ... rest of implementation following established patterns ...
```

### Step 5.4: Export and Verify

1. Add export to `packages/iam/client/src/v1/_common/index.ts`
2. Run verification:
   ```bash
   bun run check --filter=@beep/iam-client
   bun run build --filter=@beep/iam-client
   bun run lint:fix --filter=@beep/iam-client
   ```

### Step 5.5: Run Reflection (MANDATORY)

Update `REFLECTION_LOG.md` with Phase 5 learnings:
1. What worked well during TwoFactor implementation?
2. How did `returned: false` field exclusion work?
3. Any sensitive field handling patterns discovered?
4. Any new patterns needed for plugin schemas?
5. Any prompt refinements for remaining entities?

### Step 5.6: Create Handoff for Phase 6

Create `handoffs/HANDOFF_P6.md` and `handoffs/P6_ORCHESTRATOR_PROMPT.md` for WalletAddress.

---

## Success Criteria for Phase 5

- [ ] Better Auth source file read and analyzed
- [ ] `returned: false` fields identified and EXCLUDED
- [ ] `BetterAuthTwoFactorSchema` created with Struct+Record pattern
- [ ] `DomainTwoFactorFromBetterAuthTwoFactor` transformation working
- [ ] Uses type annotation pattern (NO type assertions)
- [ ] Handles sensitive fields appropriately
- [ ] Foreign key validation (userId)
- [ ] Exported from `packages/iam/client/src/v1/_common/index.ts`
- [ ] All `bun run check/build/lint:fix` pass
- [ ] REFLECTION_LOG.md updated with Phase 5 learnings
- [ ] HANDOFF_P6.md created
- [ ] P6_ORCHESTRATOR_PROMPT.md created

---

## Common Mistakes to Avoid

1. **DO NOT** include `returned: false` fields in client schema — they're never returned
2. **DO NOT** use `new Model({...})` in decode — return raw encoded object
3. **DO NOT** call `ParseResult.decode()` at end of decode callback
4. **DO NOT** use type assertions (`as T`)
5. **DO NOT** forget M.Generated null validation for createdAt/updatedAt
6. **DO NOT** skip reading the Better Auth source file first

---

## Verification Commands

```bash
# After implementation
bun run check --filter=@beep/iam-client
bun run build --filter=@beep/iam-client
bun run lint:fix --filter=@beep/iam-client

# If errors, iterate until all pass
```

---

## Notes on TwoFactor Entity

TwoFactor represents TOTP/backup code authentication for a user:
- Stores the enabled state and configuration
- Contains sensitive fields (TOTP secret, backup codes) marked `returned: false`
- Has `userId` foreign key to link to the user
- Part of the two-factor plugin, not core Better Auth

The transformation must:
1. Only include fields that Better Auth actually returns
2. Validate userId as valid User ID format
3. Handle sensitive field wrappers in domain model
