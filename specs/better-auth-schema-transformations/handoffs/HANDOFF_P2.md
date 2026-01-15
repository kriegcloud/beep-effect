# Handoff: Phase 1 → Phase 2

## Completed Entity: Session

### Files Created/Modified
- `packages/iam/client/src/v1/_common/session.schemas.ts` (NEW)
  - `BetterAuthSessionSchema` - Struct+Record schema for Better Auth session
  - `DomainSessionFromBetterAuthSession` - transformOrFail to Session.Model
- `packages/iam/client/src/v1/_common/common.schemas.ts` (MODIFIED)
  - Changed `BetterAuthUser` from S.Class to Struct+Record pattern
  - Updated `DomainUserFromBetterAuthUser` with type annotation pattern
- `packages/iam/client/src/v1/_common/transformation-helpers.ts` (NEW)
  - `require*` helpers (`requireNumber`, `requireString`, `requireDate`, `requireBoolean`)
  - `toDate()` helper function
- `packages/iam/client/src/v1/_common/index.ts` (MODIFIED)
  - Added export for session.schemas.ts

### Helpers Used
- `require*` helpers — Used to validate and extract required fields (fail if missing)
- `toDate()` — Used for Date conversion in encode direction

### Helpers Extracted
- `requireNumber()`, `requireString()`, `requireDate()`, `requireBoolean()` — Validate and extract required fields, FAIL with ParseResult.Type if missing
- `toDate(value: string | number | Date | DateTime.Utc): Date` — Converts various date formats to JS Date

## Issues Encountered

### 1. transformOrFail.decode Return Type
**Problem**: Initially unclear what the decode callback should return.
**Discovery**: With `strict: true`, decode must return `Effect<Target.Encoded, ParseIssue, R>`, NOT `Effect<Target.Type, ParseIssue, R>`.
**Solution**: Return the encoded object directly; schema framework internally decodes to Type.

### 2. Type Assertion Ban
**Problem**: User explicitly banned type assertions like `as S.Schema.Encoded<typeof Model>`.
**Solution**: Use explicit type annotations instead:
```typescript
type ModelEncoded = S.Schema.Encoded<typeof Model>;
const encoded: ModelEncoded = { ... };
return encoded;
```

### 3. Better Auth Returns Unknown Properties
**Problem**: Better Auth plugins add fields not reflected in TypeScript types.
**Solution**: Use `S.Struct({...}).pipe(S.extend(S.Record({...})))` pattern instead of `S.Class`.

### 4. Required/Optional Mismatch
**Problem**: `activeOrganizationId` is REQUIRED in domain Session.Model but optional in Better Auth types.
**Solution**: Explicit runtime check with `ParseResult.fail` if null/undefined.

## New Patterns Discovered

### Pattern 1: Struct+Record for Better Auth Schemas
```typescript
export const BetterAuthEntitySchema = F.pipe(
  S.Struct({ /* known fields */ }),
  S.extend(S.Record({ key: S.String, value: S.Unknown })),
  S.annotations({ /* ... */ }),
);

export type BetterAuthEntity = S.Schema.Type<typeof BetterAuthEntitySchema>;
```

### Pattern 2: Type Annotation for Encoded Return
```typescript
type TargetModelEncoded = S.Schema.Encoded<typeof Target.Model>;

decode: (source, _options, ast) =>
  Effect.gen(function* () {
    // Validations...

    const encoded: TargetModelEncoded = {
      // Construct encoded form
    };

    return encoded; // NOT ParseResult.decode, just return the object
  }),
```

### Pattern 3: Bidirectional Null/Undefined Coercion
```typescript
// In decode: Better Auth's undefined → Domain's null
ipAddress: betterAuthSession.ipAddress ?? null,

// In encode: Domain's null → Better Auth's undefined
ipAddress: sessionEncoded.ipAddress ?? undefined,
```

## Available Shared Helpers

Reference: `packages/iam/client/src/v1/_common/transformation-helpers.ts`

| Helper | Purpose |
|--------|---------|
| `requireNumber()` | Extract required number field, FAIL if missing |
| `requireString()` | Extract required string field, FAIL if missing (returns string \| null) |
| `requireDate()` | Extract required date field, FAIL if missing (returns Date \| null) |
| `requireBoolean()` | Extract required boolean field, FAIL if missing |
| `toDate()` | Convert DateTime.Utc/Date/string/number to JavaScript Date for encode direction |

## Prompt Refinements for Next Phase

### Critical Rule: transformOrFail.decode Returns Encoded
When implementing decode callback with `strict: true`:
- **DO NOT** return a Model instance
- **DO NOT** call `ParseResult.decode()` at the end
- **DO** return the raw encoded object with proper type annotation

### Type Annotation Pattern
Instead of type assertion (BANNED):
```typescript
// WRONG - type assertion
return { ... } as S.Schema.Encoded<typeof Model>;
```

Use type annotation (CORRECT):
```typescript
// CORRECT - type annotation
type ModelEncoded = S.Schema.Encoded<typeof Model>;
const encoded: ModelEncoded = { ... };
return encoded;
```

### Required Field Check Pattern
For fields that are REQUIRED in domain but optional in Better Auth:
```typescript
if (!betterAuthEntity.requiredField) {
  return yield* ParseResult.fail(
    new ParseResult.Type(ast, betterAuthEntity.requiredField, "requiredField is required but was null or undefined")
  );
}
```

## Next Entity: Account

- **Entity**: Account
- **Docs**: http://localhost:8080/api/v1/auth/reference#model/account
- **Source**: `tmp/better-auth/packages/core/src/db/schema/account.ts`
- **Target**: `packages/iam/client/src/v1/_common/account.schemas.ts`
- **Domain**: `@beep/iam-domain/entities/Account`

### Key Considerations for Account
1. Account has `providerId` and `accountId` fields - verify ID validation requirements
2. Check for sensitive fields (accessToken, refreshToken, etc.) that use `returned: false`
3. May have plugin-added fields from OAuth plugins
4. Research Account.Model field requirements before implementing
