# Handoff: Phase 3 (Verification) → Phase 4 (RateLimit)

> Context for implementing RateLimit entity transformation

---

## Completed Entity

- **Entity**: Verification
- **Files created**: `packages/iam/client/src/v1/_common/verification.schemas.ts`
- **Files modified**: `packages/iam/client/src/v1/_common/index.ts` (added export)
- **Helpers used**:
  - `requireNumber()`, `requireString()`, `requireDate()` — For required field validation
  - `toDate()` — For date conversion in encode direction

## Issues Encountered

None significant. The established patterns from Session/Account transferred cleanly to Verification.

## New Patterns Discovered

1. **Simple Entity Transformation**: Entities without foreign keys (like Verification) are significantly simpler to implement. No FK validation code needed.

2. **Token Field Returned by Default**: Better Auth's Verification schema does NOT mark `value` (the token) as `returned: false`. This is a security consideration for API exposure.

3. **NonEmptyString Passthrough**: Domain uses `S.NonEmptyString` but Better Auth uses plain `z.string()`. The transformation passes strings directly; the domain schema handles validation.

## Available Shared Helpers

Reference: `packages/iam/client/src/v1/_common/transformation-helpers.ts`

```typescript
// Convert various date formats to JS Date for encode direction
export const toDate = (value: string | number | Date | DateTime.Utc): Date => {
  if (value instanceof Date) return value;
  if (DateTime.isDateTime(value)) return DateTime.toDateUtc(value);
  return new Date(value);
};

// REQUIRED FIELD EXTRACTORS - These FAIL if the field is missing
export const requireField = <T extends object>(obj: T, key: string, ast: AST.AST): Effect.Effect<unknown, ParseResult.Type>;
export const requireNumber = <T extends object>(obj: T, key: string, ast: AST.AST): Effect.Effect<number, ParseResult.Type>;
export const requireString = <T extends object>(obj: T, key: string, ast: AST.AST): Effect.Effect<string | null, ParseResult.Type>;
export const requireDate = <T extends object>(obj: T, key: string, ast: AST.AST): Effect.Effect<Date | null, ParseResult.Type>;
export const requireBoolean = <T extends object>(obj: T, key: string, ast: AST.AST): Effect.Effect<boolean, ParseResult.Type>;
```

## Prompt Refinements for Next Phase

**CRITICAL**: RateLimit is fundamentally different from previous entities:

1. **No coreSchema**: Better Auth's RateLimit schema does NOT extend `coreSchema`. It has NO `id`, `createdAt`, `updatedAt` fields.

2. **No ID Generation**: Better Auth generates rate limit entries without an ID. The domain model requires an ID from `makeFields(IamEntityIds.RateLimitId, {...})`.

3. **Field Optionality Mismatch**: All three Better Auth fields (`key`, `count`, `lastRequest`) are required, but domain model wraps them with `BS.FieldOptionOmittable`.

4. **BigIntFromNumber**: Domain's `lastRequest` uses `S.BigIntFromNumber`, expecting encoded form to be `number` but Type form to be `bigint`.

## Next Entity: RateLimit

- **Entity**: RateLimit
- **Source**: `tmp/better-auth/packages/core/src/db/schema/rate-limit.ts`
- **Target**: `packages/iam/client/src/v1/_common/rate-limit.schemas.ts`
- **Domain**: `@beep/iam-domain/entities/RateLimit`

## RateLimit Schema Comparison

### Better Auth Schema (from source)
```typescript
export const rateLimitSchema = z.object({
  key: z.string(),      // Required
  count: z.number(),    // Required
  lastRequest: z.number(), // Required (timestamp in ms)
});
```
**Note: NO id, createdAt, updatedAt fields!**

### Domain Model Fields (from makeFields)
```typescript
makeFields(IamEntityIds.RateLimitId, {
  key: BS.FieldOptionOmittable(S.NonEmptyString),           // Optional in domain
  count: BS.FieldOptionOmittable(S.Int),                    // Optional in domain
  lastRequest: BS.FieldOptionOmittable(S.BigIntFromNumber), // Optional, BigInt in Type
})
```
**Plus from makeFields**: `id`, `_rowId`, `version`, `source`, `createdAt`, `updatedAt`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy`

## Key Implementation Considerations

1. **ID Generation**: May need to generate ID in the transformation since Better Auth doesn't provide one. Check if this is acceptable or if ID should come from elsewhere.

2. **Audit Fields**: Better Auth doesn't provide `_rowId`, `version`, `source`, or any audit fields. These MUST come from somewhere (require from record extension, or fail).

3. **BigInt Conversion**: `lastRequest` needs special handling - Better Auth provides `number`, domain expects `bigint` (via BigIntFromNumber encoded as `number`).

4. **Optional vs Required**: Consider if the transformation should always expect these fields from Better Auth (they're required in BA) or handle missing gracefully.

## Suggested Approach

Since Better Auth's RateLimit is fundamentally different (no ID, no audit fields), consider:

1. **Validate `_rowId`, `version`, etc. are present** via record extension (same pattern as other entities)
2. **Validate `id` is present** via record extension (unlike BA schema, our DB adds ID)
3. **Handle BigIntFromNumber** by passing the number directly (schema handles conversion)
4. **All BA fields (key, count, lastRequest)** should be present - fail if missing
