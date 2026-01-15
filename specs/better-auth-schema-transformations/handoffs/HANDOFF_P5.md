# Handoff: Phase 4 (RateLimit) → Phase 5 (TwoFactor)

> Context for implementing TwoFactor entity transformation

---

## Completed Entity

- **Entity**: RateLimit
- **Files created**: `packages/iam/client/src/v1/_common/rate-limit.schemas.ts`
- **Files modified**: `packages/iam/client/src/v1/_common/index.ts` (added export)
- **Helpers used**:
  - `requireNumber()`, `requireString()`, `requireDate()` — For required field validation
  - `toDate()` — For date conversion in encode direction

## Issues Encountered

1. **Type Error with M.Generated Fields**: `requireDate` returns `Date | null` but `M.Generated` fields expect non-null `Date`. Required explicit null validation with type narrowing:
   ```typescript
   const createdAtRaw = yield* requireDate(ba, "createdAt", ast);
   if (createdAtRaw === null) {
     return yield* ParseResult.fail(new ParseResult.Type(ast, createdAtRaw, "createdAt required"));
   }
   const createdAt = createdAtRaw; // Narrowed to Date
   ```

## New Patterns Discovered

1. **Non-coreSchema Entities**: RateLimit doesn't extend Better Auth's `coreSchema`, meaning NO `id`, `createdAt`, `updatedAt` from Better Auth. All identity/audit fields come from database via Record extension.

2. **M.Generated vs FieldOptionOmittable Distinction**:
   - `M.Generated` fields: Required in DB, encoded type is non-nullable (e.g., `Date`)
   - `BS.FieldOptionOmittable` fields: Optional in DB, encoded type is `null | T`

3. **BigIntFromNumber Transparency**: `lastRequest` uses `S.BigIntFromNumber` (encoded: number, Type: bigint). The transformation just passes the number through; the schema handles conversion.

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

**CRITICAL**: TwoFactor has `returned: false` fields that should NOT appear in client schemas.

1. **returned: false Fields**: Check Better Auth source for fields marked `{ returned: false }`. These contain sensitive data (TOTP secrets) and should be EXCLUDED from `BetterAuthTwoFactorSchema`.

2. **Plugin Location**: TwoFactor schema is in `tmp/better-auth/packages/better-auth/src/plugins/two-factor/schema.ts`, NOT in core schemas.

3. **Sensitive Fields**: TwoFactor deals with authentication secrets. Be careful about what's exposed in the transformation schema.

## Next Entity: TwoFactor

- **Entity**: TwoFactor
- **Source**: `tmp/better-auth/packages/better-auth/src/plugins/two-factor/schema.ts`
- **Target**: `packages/iam/client/src/v1/_common/two-factor.schemas.ts`
- **Domain**: `@beep/iam-domain/entities/TwoFactor`
- **Note**: Has `returned: false` fields — NEVER include those in client schemas

## TwoFactor Schema Research Required

Before implementing, you MUST:

1. Read `tmp/better-auth/packages/better-auth/src/plugins/two-factor/schema.ts` to identify:
   - All field definitions
   - Fields with `returned: false` annotation (EXCLUDE these from client schema)
   - Whether it extends `coreSchema` (expect yes, unlike RateLimit)

2. Read `@beep/iam-domain/entities/TwoFactor` to understand:
   - Domain field definitions
   - Which fields are sensitive (`FieldSensitiveOptionOmittable`)
   - Foreign key relationships

## Key Implementation Considerations

1. **Sensitive Fields Exclusion**: Fields marked `returned: false` in Better Auth should NOT be in `BetterAuthTwoFactorSchema`. The API never returns them.

2. **FieldSensitiveOptionOmittable**: If domain uses this wrapper for secrets, encoded form is `null | string` (NOT `null | Redacted<string>`).

3. **Plugin vs Core Schema**: TwoFactor is from a plugin, so field names/shapes may differ from core entities.

4. **User FK**: TwoFactor likely has `userId` as foreign key. Validate with `SharedEntityIds.UserId.is()`.

## Suggested Approach

1. Read Better Auth source to identify all fields and which have `returned: false`
2. Create `BetterAuthTwoFactorSchema` with ONLY fields that are returned by the API
3. Use standard Struct+Record pattern
4. Apply ID validation for TwoFactor ID and any FKs
5. Handle sensitive fields appropriately
6. Run verification before reflection
