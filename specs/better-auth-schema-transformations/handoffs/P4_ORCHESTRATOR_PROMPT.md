# Better Auth Schema Transformations — Phase 4 Orchestrator Prompt

> Execute Phase 4: RateLimit Entity

---

## Critical Rules

1. **USE ESTABLISHED PATTERNS** — Session, Account, Verification patterns documented in handoffs
2. **NEVER use type assertions** — Use explicit type annotations instead
3. **Struct+Record pattern** — All Better Auth schemas use `F.pipe(S.Struct({...}), S.extend(S.Record({...})))`
4. **transformOrFail.decode returns Encoded** — NOT Type! Just return the raw encoded object
5. **RUN VERIFICATION after implementation** — All checks must pass before reflection
6. **RUN REFLECTION after completion** — Update REFLECTION_LOG.md with learnings

---

## ⚠️ CRITICAL: RateLimit is DIFFERENT

Unlike Session, Account, and Verification, Better Auth's RateLimit schema:

1. **Does NOT extend coreSchema** — No `id`, `createdAt`, `updatedAt` fields from Better Auth
2. **Has only 3 fields** — `key`, `count`, `lastRequest`
3. **Our database adds ID** — The domain model expects `id` from `makeFields(IamEntityIds.RateLimitId, {...})`
4. **BigIntFromNumber for lastRequest** — Domain uses `S.BigIntFromNumber` (encoded as number, Type as bigint)

This means the BetterAuthRateLimitSchema will receive records that have been AUGMENTED by our database with `id`, `_rowId`, `version`, audit fields via the Record extension pattern.

---

## Context from Previous Phases

### Completed Files
- `packages/iam/client/src/v1/_common/session.schemas.ts` (Phase 1)
- `packages/iam/client/src/v1/_common/account.schemas.ts` (Phase 2)
- `packages/iam/client/src/v1/_common/verification.schemas.ts` (Phase 3)
- `packages/iam/client/src/v1/_common/transformation-helpers.ts`

### Shared Helpers Available
```typescript
import { requireNumber, requireString, requireDate, requireBoolean, toDate } from "./transformation-helpers";
```

---

## Phase 4 Task: RateLimit Entity

### Step 4.1: Research RateLimit Schema (ALREADY DONE)

Better Auth RateLimit schema (from `tmp/better-auth/packages/core/src/db/schema/rate-limit.ts`):
```typescript
export const rateLimitSchema = z.object({
  key: z.string(),        // Rate limit key identifier
  count: z.number(),      // Number of requests made
  lastRequest: z.number() // Last request time in milliseconds
});
```

**NOTE: No coreSchema extension, no id/createdAt/updatedAt!**

### Step 4.2: Review Domain Model (ALREADY DONE)

Domain RateLimit model (`@beep/iam-domain/entities/RateLimit`):
```typescript
makeFields(IamEntityIds.RateLimitId, {
  key: BS.FieldOptionOmittable(S.NonEmptyString),           // null | string
  count: BS.FieldOptionOmittable(S.Int),                    // null | number
  lastRequest: BS.FieldOptionOmittable(S.BigIntFromNumber), // null | number → bigint
})
```

**From makeFields**: `id`, `_rowId`, `version`, `source`, `createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy`

### Step 4.3: Create Schema File

Create `packages/iam/client/src/v1/_common/rate-limit.schemas.ts`:

```typescript
import { RateLimit } from "@beep/iam-domain/entities";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireDate, requireNumber, requireString, toDate } from "./transformation-helpers";

const $I = $IamClientId.create("_common/rate-limit.schemas");

/**
 * Schema representing a Better Auth rate limit object.
 *
 * IMPORTANT: Better Auth's RateLimit schema does NOT extend coreSchema.
 * The native schema only has: key, count, lastRequest
 *
 * However, our database augments these records with id and audit fields.
 * The Record extension captures these database-added fields.
 */
export const BetterAuthRateLimitSchema = F.pipe(
  S.Struct({
    // Better Auth native fields
    key: S.String,
    count: S.Number,
    lastRequest: S.Number, // Timestamp in milliseconds
  }),
  S.extend(S.Record({ key: S.String, value: S.Unknown })),
  S.annotations(
    $I.annotations("BetterAuthRateLimit", {
      description: "The rate limit object returned from the BetterAuth library.",
    })
  )
);

export type BetterAuthRateLimit = S.Schema.Type<typeof BetterAuthRateLimitSchema>;
export type BetterAuthRateLimitEncoded = S.Schema.Encoded<typeof BetterAuthRateLimitSchema>;

type RateLimitModelEncoded = S.Schema.Encoded<typeof RateLimit.Model>;

/**
 * Transforms a Better Auth rate limit object into the domain RateLimit.Model.
 *
 * IMPORTANT: Unlike other entities, Better Auth's RateLimit doesn't have id or
 * audit fields. These are added by our database and accessed via Record extension.
 *
 * Field handling:
 * - id: REQUIRED from Record extension (database-generated)
 * - key/count/lastRequest: Required from Better Auth native fields
 * - Audit fields: REQUIRED from Record extension (database-generated)
 */
export const DomainRateLimitFromBetterAuthRateLimit = S.transformOrFail(
  BetterAuthRateLimitSchema,
  RateLimit.Model,
  {
    strict: true,
    decode: (betterAuthRateLimit, _options, ast) =>
      Effect.gen(function* () {
        // =======================================================================
        // ID VALIDATION - Must be present from database (via Record extension)
        // =======================================================================

        const id = yield* requireString(betterAuthRateLimit, "id", ast);
        if (id === null) {
          return yield* ParseResult.fail(
            new ParseResult.Type(ast, id, "RateLimit id is required but was null")
          );
        }

        const isValidRateLimitId = IamEntityIds.RateLimitId.is(id);
        if (!isValidRateLimitId) {
          return yield* ParseResult.fail(
            new ParseResult.Type(
              ast,
              id,
              `Invalid rate limit ID format: expected "iam_ratelimit__<uuid>", got "${id}"`
            )
          );
        }

        // =======================================================================
        // REQUIRED FIELDS from database (via Record extension)
        // =======================================================================

        const _rowId = yield* requireNumber(betterAuthRateLimit, "_rowId", ast);
        const version = yield* requireNumber(betterAuthRateLimit, "version", ast);
        const source = yield* requireString(betterAuthRateLimit, "source", ast);
        const createdAt = yield* requireDate(betterAuthRateLimit, "createdAt", ast);
        const updatedAt = yield* requireDate(betterAuthRateLimit, "updatedAt", ast);
        const deletedAt = yield* requireDate(betterAuthRateLimit, "deletedAt", ast);
        const createdBy = yield* requireString(betterAuthRateLimit, "createdBy", ast);
        const updatedBy = yield* requireString(betterAuthRateLimit, "updatedBy", ast);
        const deletedBy = yield* requireString(betterAuthRateLimit, "deletedBy", ast);

        // Construct the encoded form of RateLimit.Model
        const encodedRateLimit: RateLimitModelEncoded = {
          // Core identity fields (from database)
          id,
          _rowId,
          version,

          // Timestamp fields (from database)
          createdAt,
          updatedAt,

          // Better Auth native fields
          // Domain uses FieldOptionOmittable, so pass values directly (not null)
          key: betterAuthRateLimit.key,
          count: betterAuthRateLimit.count,
          // lastRequest: BigIntFromNumber expects encoded form as number
          lastRequest: betterAuthRateLimit.lastRequest,

          // Audit fields (from database)
          source,
          deletedAt,
          createdBy,
          updatedBy,
          deletedBy,
        };

        return encodedRateLimit;
      }),

    encode: (rateLimitEncoded, _options, _ast) =>
      Effect.gen(function* () {
        // id might be undefined in the encoded form (has default), handle that
        const id = rateLimitEncoded.id ?? IamEntityIds.RateLimitId.create();

        // Convert dates - these may be DateTime.Utc or Date
        const createdAt = rateLimitEncoded.createdAt
          ? toDate(rateLimitEncoded.createdAt)
          : undefined;
        const updatedAt = rateLimitEncoded.updatedAt
          ? toDate(rateLimitEncoded.updatedAt)
          : undefined;

        // Return BetterAuthRateLimit form with database fields included
        const betterAuthRateLimit: BetterAuthRateLimit = {
          // Better Auth native fields
          key: rateLimitEncoded.key ?? "",
          count: rateLimitEncoded.count ?? 0,
          // lastRequest is BigInt in Type form, number in Encoded form
          lastRequest: typeof rateLimitEncoded.lastRequest === "bigint"
            ? Number(rateLimitEncoded.lastRequest)
            : (rateLimitEncoded.lastRequest ?? 0),
          // Include database fields for round-trip
          id,
          _rowId: rateLimitEncoded._rowId,
          version: rateLimitEncoded.version,
          source: rateLimitEncoded.source ?? undefined,
          createdAt,
          updatedAt,
          deletedAt: rateLimitEncoded.deletedAt ? toDate(rateLimitEncoded.deletedAt) : undefined,
          createdBy: rateLimitEncoded.createdBy ?? undefined,
          updatedBy: rateLimitEncoded.updatedBy ?? undefined,
          deletedBy: rateLimitEncoded.deletedBy ?? undefined,
        };

        return betterAuthRateLimit;
      }),
  }
).annotations(
  $I.annotations("DomainRateLimitFromBetterAuthRateLimit", {
    description:
      "Transforms a Better Auth rate limit response into the domain RateLimit.Model, handling the unique case where Better Auth doesn't provide id or audit fields.",
  })
);

export declare namespace DomainRateLimitFromBetterAuthRateLimit {
  export type Type = typeof DomainRateLimitFromBetterAuthRateLimit.Type;
  export type Encoded = typeof DomainRateLimitFromBetterAuthRateLimit.Encoded;
}
```

### Step 4.4: Export and Verify

1. Add export to `packages/iam/client/src/v1/_common/index.ts`
2. Run verification:
   ```bash
   bun run check --filter=@beep/iam-client
   bun run build --filter=@beep/iam-client
   bun run lint:fix --filter=@beep/iam-client
   ```

### Step 4.5: Run Reflection (MANDATORY)

Update `REFLECTION_LOG.md` with Phase 4 learnings:
1. What worked well during RateLimit implementation?
2. What challenges arose from the missing coreSchema fields?
3. How did BigIntFromNumber handling work?
4. Any new patterns needed for entities without Better Auth IDs?
5. Any prompt refinements for remaining entities?

### Step 4.6: Create Handoff for Phase 5

Create `handoffs/HANDOFF_P5.md` and `handoffs/P5_ORCHESTRATOR_PROMPT.md` for the next entity (Organization or Member).

---

## Success Criteria for Phase 4

- [ ] `BetterAuthRateLimitSchema` created with Struct+Record pattern
- [ ] `DomainRateLimitFromBetterAuthRateLimit` transformation working
- [ ] Uses type annotation pattern (NO type assertions)
- [ ] Handles missing Better Auth id/audit fields correctly
- [ ] Handles BigIntFromNumber for lastRequest
- [ ] Exported from `packages/iam/client/src/v1/_common/index.ts`
- [ ] All `bun run check/build/lint:fix` pass
- [ ] REFLECTION_LOG.md updated with Phase 4 learnings
- [ ] HANDOFF_P5.md created
- [ ] P5_ORCHESTRATOR_PROMPT.md created

---

## Common Mistakes to Avoid

1. **DO NOT** expect id/createdAt/updatedAt from Better Auth native schema — they come from Record extension
2. **DO NOT** use `new Model({...})` in decode — return raw encoded object
3. **DO NOT** call `ParseResult.decode()` at end of decode callback
4. **DO NOT** use type assertions (`as T`)
5. **DO NOT** forget BigInt → number conversion in encode direction
6. **DO NOT** skip ID format validation (id comes from database via Record extension)

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

## Notes on RateLimit Entity

RateLimit is unique among Better Auth entities:
- Used for tracking API rate limiting
- Doesn't persist user-visible data
- Records are typically short-lived (cleared after rate limit window)
- The `key` is typically a combination of IP/user/endpoint
- `count` tracks requests within the window
- `lastRequest` is the timestamp of most recent request

The transformation must handle that Better Auth expects minimal fields but our domain model has full audit capabilities.
