# Handoff: Phase 2 (Account) → Phase 3 (Verification)

> Context for implementing Verification entity transformation

---

## Completed Entity

- **Entity**: Account
- **Files created**: `packages/iam/client/src/v1/_common/account.schemas.ts`
- **Files modified**: `packages/iam/client/src/v1/_common/index.ts` (added export)
- **Helpers used**:
  - `requireNumber()`, `requireString()`, `requireDate()` — For required field validation
  - `toDate()` — For date conversion in encode direction

## Issues Encountered

None significant. The Phase 1 patterns transferred cleanly to Account implementation.

## New Patterns Discovered

1. **Entity ID Namespaces**: Account uses `IamEntityIds.AccountId` (prefix: `iam_account__`) indicating it's an IAM-specific entity. Verification will likely also use IAM namespace since it's an IAM entity.

2. **Simple FK Structures**: Account only has `userId` as a foreign key, unlike Session which has 4 FKs. Simpler entities require less validation code.

3. **Sensitive Field Encoding**: OAuth tokens using `FieldSensitiveOptionOmittable` are encoded as `null | string`, not `null | Redacted<string>`. The schema handles Redacted wrapping.

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

No refinements needed. The orchestrator prompt for Phase 3 should follow the same pattern as Phase 2.

## Next Entity: Verification

- **Entity**: Verification
- **Docs**: http://localhost:8080/api/v1/auth/reference#model/verification
- **Source**: `tmp/better-auth/packages/core/src/db/schema/verification.ts`
- **Target**: `packages/iam/client/src/v1/_common/verification.schemas.ts`
- **Domain**: `@beep/iam-domain/entities/Verification`

## Verification Entity Notes

Based on Better Auth documentation, Verification typically handles:
- Email verification tokens
- Password reset tokens
- Magic link tokens

Expected fields (verify from source):
- id, createdAt, updatedAt (core fields)
- identifier — The email or token identifier
- value — The verification token value
- expiresAt — When the verification expires

**Important**: Check if `value` has `returned: false` — if so, exclude from client schema.
