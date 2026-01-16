# Phase 1: IAM Entity IDs - Orchestrator Prompt

## Context (Stable Prefix)
- **Spec**: oauth-provider-migration
- **Phase**: 1 of 7
- **Package**: `@beep/shared-domain`
- **Location**: `packages/shared/domain/src/entity-ids/iam/`

---

## Objective

Create 4 new entity ID schemas for OAuth Provider entities. These IDs are foundational - all subsequent phases depend on them.

---

## Files to Modify

| File | Action |
|------|--------|
| `ids.ts` | Add 4 new ID schema exports |
| `table-name.ts` | Add 4 table names to `TableName` union |
| `any-id.ts` | Add 4 IDs to `AnyId` union |

---

## Insertion Order Guidance

**IMPORTANT**: Append new entries after the last existing entry in each file:
- In `ids.ts`: Add after `DeviceCodeId` definition
- In `table-name.ts`: Add after the last `Ids.*.tableName` entry
- In `any-id.ts`: Add after the last `Ids.*` entry in the union

This maintains consistency and avoids confusion about where to insert code.

---

## Implementation Steps

### Step 1: Read Existing Pattern

Read `ids.ts` and study the pattern used for `AccountId`, `DeviceCodeId`, or similar:

```typescript
// Key imports at top of ids.ts
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/iam/ids");
const make = EntityId.builder("iam");
```

### Step 2: Add OAuthClientId

```typescript
export const OAuthClientId = make("oauth_client", {
  brand: "OAuthClientId",
}).annotations(
  $I.annotations("OAuthClientId", {
    description: "A unique identifier for an OAuth client",
  })
);

export declare namespace OAuthClientId {
  export type Type = S.Schema.Type<typeof OAuthClientId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthClientId>;

  export namespace RowId {
    export type Type = typeof OAuthClientId.privateSchema.Type;
    export type Encoded = typeof OAuthClientId.privateSchema.Encoded;
  }
}
```

### Step 3: Add OAuthAccessTokenId

```typescript
export const OAuthAccessTokenId = make("oauth_access_token", {
  brand: "OAuthAccessTokenId",
}).annotations(
  $I.annotations("OAuthAccessTokenId", {
    description: "A unique identifier for an OAuth access token",
  })
);

export declare namespace OAuthAccessTokenId {
  export type Type = S.Schema.Type<typeof OAuthAccessTokenId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthAccessTokenId>;

  export namespace RowId {
    export type Type = typeof OAuthAccessTokenId.privateSchema.Type;
    export type Encoded = typeof OAuthAccessTokenId.privateSchema.Encoded;
  }
}
```

### Step 4: Add OAuthRefreshTokenId

```typescript
export const OAuthRefreshTokenId = make("oauth_refresh_token", {
  brand: "OAuthRefreshTokenId",
}).annotations(
  $I.annotations("OAuthRefreshTokenId", {
    description: "A unique identifier for an OAuth refresh token",
  })
);

export declare namespace OAuthRefreshTokenId {
  export type Type = S.Schema.Type<typeof OAuthRefreshTokenId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthRefreshTokenId>;

  export namespace RowId {
    export type Type = typeof OAuthRefreshTokenId.privateSchema.Type;
    export type Encoded = typeof OAuthRefreshTokenId.privateSchema.Encoded;
  }
}
```

### Step 5: Add OAuthConsentId

```typescript
export const OAuthConsentId = make("oauth_consent", {
  brand: "OAuthConsentId",
}).annotations(
  $I.annotations("OAuthConsentId", {
    description: "A unique identifier for an OAuth consent record",
  })
);

export declare namespace OAuthConsentId {
  export type Type = S.Schema.Type<typeof OAuthConsentId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthConsentId>;

  export namespace RowId {
    export type Type = typeof OAuthConsentId.privateSchema.Type;
    export type Encoded = typeof OAuthConsentId.privateSchema.Encoded;
  }
}
```

### Step 6: Update table-name.ts

Add the new table names to the `TableName` class:

```typescript
export class TableName extends BS.StringLiteralKit(
  // ... existing entries
  Ids.OAuthClientId.tableName,
  Ids.OAuthAccessTokenId.tableName,
  Ids.OAuthRefreshTokenId.tableName,
  Ids.OAuthConsentId.tableName,
).annotations(/* ... */) {}
```

### Step 7: Update any-id.ts

Add the new IDs to the `AnyId` union:

```typescript
export class AnyId extends S.Union(
  // ... existing entries
  Ids.OAuthClientId,
  Ids.OAuthAccessTokenId,
  Ids.OAuthRefreshTokenId,
  Ids.OAuthConsentId,
).annotations(/* ... */) {}
```

---

## Effect Patterns Reminder

- **Namespace imports**: `import * as S from "effect/Schema";`
- **NO default imports**: Never use `import Schema from "effect/Schema"`
- **PascalCase constructors**: `S.String`, `S.NonEmptyString`, etc.

---

## Verification

```bash
bun run check --filter @beep/shared-domain
```

**Expected**: No type errors

---

## Troubleshooting

### Common Issues

1. **Missing import in table-name.ts**: Ensure `Ids` namespace is imported
2. **Circular dependency**: Order of exports in ids.ts may matter
3. **Brand collision**: Each brand must be unique across all entity IDs

---

## Post-Execution Checklist

- [ ] All 4 IDs added to `ids.ts` with proper namespace declarations
- [ ] All 4 table names added to `table-name.ts`
- [ ] All 4 IDs added to `any-id.ts` union
- [ ] `bun run check --filter @beep/shared-domain` passes
- [ ] Updated REFLECTION_LOG.md with learnings
- [ ] Updated HANDOFF_P1.md with execution results
- [ ] Review P2_ORCHESTRATOR_PROMPT.md and update based on learnings

---

## Handoff

When complete:
1. Log learnings to `specs/oauth-provider-migration/REFLECTION_LOG.md`
2. Complete `handoffs/HANDOFF_P1.md` with execution summary
3. Review and update `P2_ORCHESTRATOR_PROMPT.md` based on Phase 1 learnings
4. Proceed to Phase 2 (Domain Models)
