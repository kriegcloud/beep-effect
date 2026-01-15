# Better Auth Schema Transformations — Phase 3 Orchestrator Prompt

> Execute Phase 3: Verification Entity

---

## Critical Rules

1. **USE ESTABLISHED PATTERNS** — Session and Account patterns are documented in HANDOFF_P3.md
2. **NEVER use type assertions** — Use explicit type annotations instead
3. **Struct+Record pattern** — All Better Auth schemas use `F.pipe(S.Struct({...}), S.extend(S.Record({...})))`
4. **transformOrFail.decode returns Encoded** — NOT Type! Just return the raw encoded object
5. **RUN VERIFICATION after implementation** — All checks must pass before reflection
6. **RUN REFLECTION after completion** — Use `reflector` agent to capture learnings
7. **CHECK FOR returned: false** — Exclude fields marked as not returned in Better Auth schema

---

## Context from Previous Phases

### Completed Files
- `packages/iam/client/src/v1/_common/session.schemas.ts` (Phase 1)
- `packages/iam/client/src/v1/_common/account.schemas.ts` (Phase 2)
- `packages/iam/client/src/v1/_common/transformation-helpers.ts`
- Updated `packages/iam/client/src/v1/_common/index.ts`

### Shared Helpers Available
```typescript
import { requireNumber, requireString, requireDate, requireBoolean, toDate } from "./transformation-helpers";
```

### Key Pattern: Required Fields MUST Fail if Missing
```typescript
type VerificationModelEncoded = S.Schema.Encoded<typeof Verification.Model>;

decode: (betterAuthVerification, _options, ast) =>
  Effect.gen(function* () {
    // Validations...

    // REQUIRED FIELDS - Must be present, FAIL if missing
    const _rowId = yield* requireNumber(betterAuthVerification, "_rowId", ast);
    const version = yield* requireNumber(betterAuthVerification, "version", ast);
    const source = yield* requireString(betterAuthVerification, "source", ast);
    const deletedAt = yield* requireDate(betterAuthVerification, "deletedAt", ast);
    const createdBy = yield* requireString(betterAuthVerification, "createdBy", ast);
    const updatedBy = yield* requireString(betterAuthVerification, "updatedBy", ast);
    const deletedBy = yield* requireString(betterAuthVerification, "deletedBy", ast);

    const encodedVerification: VerificationModelEncoded = {
      id: betterAuthVerification.id,
      _rowId,
      version,
      source,
      deletedAt,
      createdBy,
      updatedBy,
      deletedBy,
      // ... other fields
    };

    return encodedVerification;  // Just return the object, NOT ParseResult.decode!
  }),
```

---

## Phase 3 Task: Verification Entity

### Step 3.1: Research Verification Schema

Read the Better Auth source directly:
```
tmp/better-auth/packages/core/src/db/schema/verification.ts
```

Also check the shared schema:
```
tmp/better-auth/packages/core/src/db/schema/shared.ts
```

Expected core fields:
- id, createdAt, updatedAt (from coreSchema)
- identifier — Email or unique identifier
- value — Verification token value
- expiresAt — Token expiration

**Important**: Check for `returned: false` fields — these should NOT be included in the client schema.

### Step 3.2: Locate Domain Model

Read `@beep/iam-domain/entities/Verification` to understand:
- All required fields
- Default values
- Custom transformations (Redacted, Option, DateTime.Utc)

```bash
cat packages/iam/domain/src/entities/Verification/Verification.model.ts
```

### Step 3.3: Create Schema File

Create `packages/iam/client/src/v1/_common/verification.schemas.ts`:

```typescript
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import { Verification } from "@beep/iam-domain/entities";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { requireNumber, requireString, requireDate, requireBoolean, toDate } from "./transformation-helpers";

const $I = $IamClientId.create("_common/verification.schemas");

// Schema for Better Auth verification
export const BetterAuthVerificationSchema = F.pipe(
  S.Struct({
    id: S.String,
    createdAt: S.Date,
    updatedAt: S.Date,
    identifier: S.String,
    value: S.String,  // VERIFY: Check if returned: false
    expiresAt: S.Date,
    // ... other fields from research
  }),
  S.extend(S.Record({ key: S.String, value: S.Unknown })),
  S.annotations($I.annotations("BetterAuthVerification", {
    description: "The verification object returned from the BetterAuth library.",
  })),
);

export type BetterAuthVerification = S.Schema.Type<typeof BetterAuthVerificationSchema>;
export type BetterAuthVerificationEncoded = S.Schema.Encoded<typeof BetterAuthVerificationSchema>;

// Type alias for proper typing without assertions
type VerificationModelEncoded = S.Schema.Encoded<typeof Verification.Model>;

// Transformation schema
export const DomainVerificationFromBetterAuthVerification = S.transformOrFail(
  BetterAuthVerificationSchema,
  Verification.Model,
  {
    strict: true,
    decode: (betterAuthVerification, _options, ast) =>
      Effect.gen(function* () {
        // Validate ID format
        const isValidId = IamEntityIds.VerificationId.is(betterAuthVerification.id);
        if (!isValidId) {
          return yield* ParseResult.fail(
            new ParseResult.Type(
              ast,
              betterAuthVerification.id,
              `Invalid verification ID format: expected "iam_verification__<uuid>", got "${betterAuthVerification.id}"`
            )
          );
        }

        // Construct encoded form with explicit type annotation
        const encodedVerification: VerificationModelEncoded = {
          // ... fields from research
        };

        return encodedVerification;  // Just return, no ParseResult.decode!
      }),

    encode: (verificationEncoded, _options, _ast) =>
      Effect.gen(function* () {
        // Convert back to BetterAuthVerification format
        // Use toDate() for timestamp conversions
      }),
  }
).annotations($I.annotations("DomainVerificationFromBetterAuthVerification", {
  description: "Transforms a Better Auth verification response into the domain Verification.Model.",
}));

export declare namespace DomainVerificationFromBetterAuthVerification {
  export type Type = typeof DomainVerificationFromBetterAuthVerification.Type;
  export type Encoded = typeof DomainVerificationFromBetterAuthVerification.Encoded;
}
```

### Step 3.4: Export and Verify

1. Add export to `packages/iam/client/src/v1/_common/index.ts`
2. Run verification:
   ```bash
   bun run check --filter=@beep/iam-client
   bun run build --filter=@beep/iam-client
   bun run lint:fix --filter=@beep/iam-client
   ```

### Step 3.5: Run Reflection (MANDATORY)

Update `REFLECTION_LOG.md` with Phase 3 learnings:
1. What worked well during Verification implementation?
2. What didn't work or required iteration?
3. Any surprising findings about the Verification entity?
4. Are there new patterns that should be extracted as shared helpers?
5. Any prompt refinements needed for Phase 4 (RateLimit)?

### Step 3.6: Create Handoff for Phase 4

Create `handoffs/HANDOFF_P4.md` and `handoffs/P4_ORCHESTRATOR_PROMPT.md`.

---

## Success Criteria for Phase 3

- [ ] `BetterAuthVerificationSchema` created with Struct+Record pattern
- [ ] `DomainVerificationFromBetterAuthVerification` transformation working
- [ ] Uses type annotation pattern (NO type assertions)
- [ ] Uses shared helpers (`require*` helpers, `toDate`)
- [ ] Exported from `packages/iam/client/src/v1/_common/index.ts`
- [ ] All `bun run check/build/lint:fix` pass
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings
- [ ] HANDOFF_P4.md created
- [ ] P4_ORCHESTRATOR_PROMPT.md created

---

## Common Mistakes to Avoid

1. **DO NOT** use `new Model({...})` in decode — return raw encoded object
2. **DO NOT** call `ParseResult.decode()` at end of decode callback
3. **DO NOT** use type assertions (`as T`)
4. **DO NOT** use `S.Class` for Better Auth schemas — use Struct+Record
5. **DO NOT** forget to add `S.extend(S.Record({...}))` for unknown properties
6. **DO NOT** skip ID format validation
7. **DO NOT** include fields with `returned: false` in client schema

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

## Notes for Verification Entity

Verification tokens are typically short-lived and sensitive. Key considerations:
- `value` field may contain the actual token — check if it's marked `returned: false`
- `expiresAt` is critical for token validity
- `identifier` typically stores email/phone for lookup

The domain model may use `Redacted` for the token value — check the model definition.
