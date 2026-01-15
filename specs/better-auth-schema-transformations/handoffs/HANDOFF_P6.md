# Handoff: Phase 5 (TwoFactor) → Phase 6 (WalletAddress)

> Context for implementing WalletAddress entity transformation

---

## Completed Entity

- **Entity**: TwoFactor
- **Files created**: `packages/iam/client/src/v1/_common/two-factor.schemas.ts`
- **Files modified**: `packages/iam/client/src/v1/_common/index.ts` (added export)
- **Helpers used**:
  - `requireNumber()`, `requireString()`, `requireDate()` — For required field validation
  - `toDate()` — For date conversion in encode direction

## Issues Encountered

1. **ALL Plugin Fields Have `returned: false`**: TwoFactor is unique because ALL plugin-specific fields (`secret`, `backupCodes`, `userId`) have `returned: false`. The Struct only contains coreSchema fields, with sensitive fields extracted from Record extension when present.

2. **Transformation Scope Limitation**: The transformation only works for internal data flows (database queries, admin APIs, testing) where sensitive fields ARE present. Standard API responses lack these fields and will fail.

## New Patterns Discovered

1. **Record Extension for `returned: false` Fields**: Even when fields are marked `returned: false` in Better Auth, the Record extension captures them when present in internal data flows. This extends the RateLimit pattern.

2. **Internal-Only Transformation Scope**: Some transformations serve internal flows only, not API responses. Document this clearly in the schema file.

3. **M.Sensitive vs BS.FieldSensitiveOptionOmittable**:
   - `M.Sensitive` — Required field with sensitivity wrapper
   - `BS.FieldSensitiveOptionOmittable` — Optional field with sensitivity wrapper

4. **Descriptive `returned: false` Errors**: Add specific error messages explaining fields "may have returned: false in API response" to help developers understand transformation failures.

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

**WalletAddress Analysis**:

1. **NO `returned: false` Fields**: Unlike TwoFactor, WalletAddress has NO fields marked `returned: false`. All fields are returned by the API.

2. **Plugin Schema Structure**: WalletAddress is from the SIWE (Sign-In With Ethereum) plugin. Its schema defines:
   - `userId` — FK to user (required)
   - `address` — Blockchain wallet address (required)
   - `chainId` — Blockchain network ID (number, required)
   - `isPrimary` — Whether primary wallet (boolean, default false)
   - `createdAt` — Creation timestamp (required)

3. **Missing coreSchema Fields**: WalletAddress does NOT have `id` or `updatedAt` from Better Auth. These come from the database layer via Record extension (similar to RateLimit pattern).

## Next Entity: WalletAddress

- **Entity**: WalletAddress
- **Source**: `tmp/better-auth/packages/better-auth/src/plugins/siwe/schema.ts`
- **Target**: `packages/iam/client/src/v1/_common/wallet-address.schemas.ts`
- **Domain**: `@beep/iam-domain/entities/WalletAddress`
- **Note**: Similar to RateLimit — no `id`/`updatedAt` from Better Auth, extract from Record extension

## WalletAddress Schema Research Summary

Better Auth schema (SIWE plugin):
```typescript
walletAddress: {
  fields: {
    userId: { type: "string", references: { model: "user", field: "id" }, required: true },
    address: { type: "string", required: true },
    chainId: { type: "number", required: true },
    isPrimary: { type: "boolean", defaultValue: false },
    createdAt: { type: "date", required: true },
    // NOTE: No id, updatedAt — these come from database
  }
}
```

Domain model:
```typescript
makeFields(IamEntityIds.WalletAddressId, {
  userId: SharedEntityIds.UserId,
  address: S.NonEmptyString,
  chainId: S.Int,
  isPrimary: BS.BoolWithDefault(false),
})
```

## Key Implementation Considerations

1. **Extract `id` and `updatedAt` from Record Extension**: Like RateLimit, these fields aren't in Better Auth schema but come from the database.

2. **Validate `userId` FK Format**: Use `SharedEntityIds.UserId.is()` to validate.

3. **Validate `id` Format**: Use `IamEntityIds.WalletAddressId.is()` to validate.

4. **Handle `chainId` as Number**: Better Auth provides number, domain expects `S.Int`. Pass through directly.

5. **Handle `isPrimary` Boolean**: Better Auth has default false, which matches domain `BS.BoolWithDefault(false)`.

6. **API-Safe Transformation**: Unlike TwoFactor, this transformation is safe for API responses (no `returned: false` fields).

## Suggested Approach

1. Create `BetterAuthWalletAddressSchema` with ONLY Better Auth's defined fields (NO id, updatedAt)
2. Use Struct+Record pattern as usual
3. Extract `id`, `updatedAt`, and audit fields from Record extension (RateLimit pattern)
4. Validate null for M.Generated fields (`createdAt`, `updatedAt`)
5. Apply ID validation for WalletAddressId and userId FK
6. Run verification before reflection
