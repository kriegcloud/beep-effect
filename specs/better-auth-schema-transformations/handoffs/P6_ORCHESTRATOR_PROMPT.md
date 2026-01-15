# Better Auth Schema Transformations — Phase 6 Orchestrator Prompt

> Execute Phase 6: WalletAddress Entity

---

## Critical Rules

1. **USE ESTABLISHED PATTERNS** — Session, Account, Verification, RateLimit, TwoFactor patterns documented in handoffs
2. **NEVER use type assertions** — Use explicit type annotations instead
3. **Struct+Record pattern** — All Better Auth schemas use `F.pipe(S.Struct({...}), S.extend(S.Record({...})))`
4. **transformOrFail.decode returns Encoded** — NOT Type! Just return the raw encoded object
5. **Extract missing coreSchema fields from Record** — WalletAddress has NO `id`/`updatedAt` from Better Auth
6. **RUN VERIFICATION after implementation** — All checks must pass before reflection
7. **RUN REFLECTION after completion** — Update REFLECTION_LOG.md with learnings

---

## WalletAddress Schema Analysis

Unlike TwoFactor (ALL fields `returned: false`), WalletAddress has NO sensitive fields.
However, it's similar to RateLimit in that it LACKS `id` and `updatedAt` from Better Auth.

Better Auth SIWE plugin schema:
```typescript
walletAddress: {
  fields: {
    userId: { type: "string", references: { model: "user", field: "id" }, required: true },
    address: { type: "string", required: true },
    chainId: { type: "number", required: true },
    isPrimary: { type: "boolean", defaultValue: false },
    createdAt: { type: "date", required: true },
    // NOTE: No id, updatedAt — these come from database via Record extension
  }
}
```

---

## Context from Previous Phases

### Completed Files
- `packages/iam/client/src/v1/_common/session.schemas.ts` (Phase 1)
- `packages/iam/client/src/v1/_common/account.schemas.ts` (Phase 2)
- `packages/iam/client/src/v1/_common/verification.schemas.ts` (Phase 3)
- `packages/iam/client/src/v1/_common/rate-limit.schemas.ts` (Phase 4)
- `packages/iam/client/src/v1/_common/two-factor.schemas.ts` (Phase 5)
- `packages/iam/client/src/v1/_common/transformation-helpers.ts`

### Shared Helpers Available
```typescript
import { requireNumber, requireString, requireDate, requireBoolean, toDate } from "./transformation-helpers";
```

### Key Pattern from Phase 4 (RateLimit)
WalletAddress follows the RateLimit pattern — missing `id`/`updatedAt` from Better Auth:
```typescript
// Extract from Record extension (database provides these)
const idRaw = yield* requireString(ba, "id", ast);
if (idRaw === null) {
  return yield* ParseResult.fail(new ParseResult.Type(ast, idRaw, "id is required"));
}
const id = idRaw;

const updatedAtRaw = yield* requireDate(ba, "updatedAt", ast);
if (updatedAtRaw === null) {
  return yield* ParseResult.fail(new ParseResult.Type(ast, updatedAtRaw, "updatedAt is required"));
}
const updatedAt = updatedAtRaw;
```

---

## Phase 6 Task: WalletAddress Entity

### Step 6.1: Verify Research (Already Done)

Better Auth source: `tmp/better-auth/packages/better-auth/src/plugins/siwe/schema.ts`
- Fields: userId, address, chainId, isPrimary, createdAt
- NO `id` or `updatedAt` — extract from Record extension
- NO `returned: false` fields — all fields are API-safe

Domain model: `packages/iam/domain/src/entities/WalletAddress/WalletAddress.model.ts`
- userId: SharedEntityIds.UserId (FK)
- address: S.NonEmptyString
- chainId: S.Int
- isPrimary: BS.BoolWithDefault(false)

### Step 6.2: Create Schema File

Create `packages/iam/client/src/v1/_common/wallet-address.schemas.ts`:

```typescript
import { WalletAddress } from "@beep/iam-domain/entities";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireDate, requireNumber, requireString, toDate } from "./transformation-helpers";

const $I = $IamClientId.create("_common/wallet-address.schemas");

/**
 * Schema representing a Better Auth wallet address object.
 *
 * This captures the WalletAddress structure from Better Auth's SIWE plugin,
 * representing blockchain wallet addresses linked to users.
 *
 * @remarks
 * Better Auth's WalletAddress schema does NOT include `id` or `updatedAt`.
 * These fields come from the database layer and are captured via Record extension.
 * This pattern is similar to RateLimit.
 *
 * Uses Struct with Record extension to allow unknown properties from
 * Better Auth database layer.
 */
export const BetterAuthWalletAddressSchema = F.pipe(
  S.Struct({
    // Fields defined by Better Auth SIWE plugin (NO id or updatedAt)
    userId: S.String,
    address: S.String,
    chainId: S.Number,
    isPrimary: S.optionalWith(S.Boolean, { default: () => false }),
    createdAt: S.Date,
    // NOTE: id and updatedAt come from Record extension (database layer)
  }),
  S.extend(S.Record({ key: S.String, value: S.Unknown })),
  S.annotations(
    $I.annotations("BetterAuthWalletAddress", {
      description: "The wallet address object from Better Auth SIWE plugin.",
    })
  )
);

// ... rest of implementation following RateLimit pattern ...
```

### Step 6.3: Implement Transformation

Key implementation points:
1. Extract `id` from Record extension, validate with `IamEntityIds.WalletAddressId.is()`
2. Extract `updatedAt` from Record extension, validate non-null
3. Validate `userId` with `SharedEntityIds.UserId.is()`
4. Pass `chainId` through (number → S.Int handled by schema)
5. Handle `isPrimary` boolean with default false

### Step 6.4: Export and Verify

1. Add export to `packages/iam/client/src/v1/_common/index.ts`
2. Run verification:
   ```bash
   bun run check --filter=@beep/iam-client
   bun run lint:fix --filter=@beep/iam-client
   npx tsc -p packages/iam/client/tsconfig.json --noEmit
   ```

### Step 6.5: Run Reflection (MANDATORY)

Update `REFLECTION_LOG.md` with Phase 6 learnings:
1. What worked well during WalletAddress implementation?
2. How did the missing `id`/`updatedAt` pattern (from RateLimit) transfer?
3. Any differences between SIWE plugin and core schemas?
4. Any prompt refinements for remaining entities?

### Step 6.6: Create Handoff for Phase 7 (if applicable)

If more entities remain, create `handoffs/HANDOFF_P7.md` and `handoffs/P7_ORCHESTRATOR_PROMPT.md`.

---

## Success Criteria for Phase 6

- [ ] `BetterAuthWalletAddressSchema` created with Struct+Record pattern
- [ ] `DomainWalletAddressFromBetterAuthWalletAddress` transformation working
- [ ] Extracts `id` and `updatedAt` from Record extension (RateLimit pattern)
- [ ] Uses type annotation pattern (NO type assertions)
- [ ] Validates `id` with `IamEntityIds.WalletAddressId.is()`
- [ ] Validates `userId` with `SharedEntityIds.UserId.is()`
- [ ] Handles `chainId` as number
- [ ] Handles `isPrimary` boolean with default
- [ ] Exported from `packages/iam/client/src/v1/_common/index.ts`
- [ ] All `bun run check/lint:fix` pass for @beep/iam-client
- [ ] REFLECTION_LOG.md updated with Phase 6 learnings

---

## Common Mistakes to Avoid

1. **DO NOT** expect `id` or `updatedAt` in Struct — they're in Record extension only
2. **DO NOT** use `new Model({...})` in decode — return raw encoded object
3. **DO NOT** call `ParseResult.decode()` at end of decode callback
4. **DO NOT** use type assertions (`as T`)
5. **DO NOT** forget M.Generated null validation for createdAt/updatedAt
6. **DO NOT** assume plugin schemas have same structure as core schemas

---

## Verification Commands

```bash
# After implementation
bun run check --filter=@beep/iam-client
bun run lint:fix --filter=@beep/iam-client
npx tsc -p packages/iam/client/tsconfig.json --noEmit

# If errors, iterate until all pass
```

---

## Notes on WalletAddress Entity

WalletAddress represents blockchain wallet addresses for Sign-In With Ethereum (SIWE):
- Links a wallet address to a user account
- Stores chain ID for multi-chain support
- Has `isPrimary` flag for default wallet selection
- Part of the SIWE plugin, not core Better Auth

The transformation must:
1. Extract `id` and `updatedAt` from Record extension (database provides these)
2. Validate userId as valid User ID format
3. Handle chainId as number (domain uses S.Int)
4. Handle isPrimary boolean with default false
