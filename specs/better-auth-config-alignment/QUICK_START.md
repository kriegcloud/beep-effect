# Better Auth Config Alignment: Quick Start

> Get oriented in 5 minutes. Full details in [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md).

---

## What You're Doing

Aligning Better Auth's runtime configuration with your Drizzle table schemas so:
1. OpenAPI documentation shows all your custom fields
2. Type inference works correctly across server/client
3. Plugin expectations match your table structures

---

## Key Files to Know

| File | What It Contains |
|------|-----------------|
| `packages/iam/server/src/adapters/better-auth/Options.ts` | Server Better Auth config - **main edit target** |
| `packages/iam/client/src/adapters/better-auth/client.ts` | Client config - may need updates for type inference |
| `packages/iam/tables/src/tables/*.table.ts` | IAM Drizzle tables |
| `packages/shared/tables/src/tables/*.table.ts` | Shared Drizzle tables |

---

## The Pattern

### Drizzle Table → Better Auth Config

```typescript
// packages/shared/tables/src/tables/user.table.ts
export const user = Table.make(SharedEntityIds.UserId)({
  // These are ADDITIONAL columns beyond Table.make defaults
  uploadLimit: pg.integer("upload_limit").notNull().default(100),
  stripeCustomerId: pg.text("stripe_customer_id"),
  // ...
});
```

```typescript
// packages/iam/server/src/adapters/better-auth/Options.ts
user: {
  additionalFields: {
    uploadLimit: { type: "number", required: true, defaultValue: 100 },
    stripeCustomerId: { type: "string", required: false },
    // + additionalFieldsCommon for audit columns
  },
}
```

---

## Critical Warning: Plugin Schema Support Levels

**Plugins have FOUR levels of schema support:**

| Support Level | Plugins | What You Can Configure |
|---------------|---------|----------------------|
| **Full** | Core models (user, session, account), organization plugin (except teamMember) | `modelName`, `fields`, **`additionalFields`** |
| **Partial** | passkey, twoFactor, apiKey, phoneNumber, anonymous, admin, jwt, oidcProvider | `modelName`, `fields` (column renaming) - NO additionalFields |
| **Minimal** | sso, teamMember (organization plugin) | `modelName` + `fields` only |
| **None** | scim, siwe, some internal models | Hardcoded schema - no configuration options |

### Key Insight: `InferOptionSchema` vs Custom Schema

Check plugin source types to determine support level:
- `InferOptionSchema<typeof schema>` → **Partial** (modelName + fields only)
- Custom schema type with `additionalFields` → **Full** support
- Hardcoded schema in plugin code → **None** (no configuration)

**For plugins without additionalFields support**: Your extra Drizzle columns (audit fields, etc.) will work at the database level but WON'T appear in Better Auth's OpenAPI documentation.

---

## Quick Workflow

### 1. Research Plugin Schema Support

**PRIMARY METHOD** - Read Better Auth source code directly:
```bash
# Check plugin's schema options type
grep -r "InferOptionSchema" tmp/better-auth/packages/<plugin>/src/types.ts
# If found: only modelName + fields supported (NO additionalFields)

# Check for custom schema types with additionalFields
grep -r "additionalFields" tmp/better-auth/packages/<plugin>/src/
# If found: full additionalFields support
```

**FALLBACK** - Web search if source unavailable:
```
"Better Auth <plugin-name> plugin schema configuration site:better-auth.com"
```

### 2. Read Drizzle Table

```typescript
// Find columns BEYOND Table.make defaults
const myTable = Table.make(MyEntityId)({
  customField1: ...,  // <- These need additionalFields entries
  customField2: ...,
});
```

### 3. Add to Options.ts

```typescript
<model>: {
  additionalFields: {
    customField1: { type: "...", required: ... },
    customField2: { type: "...", required: ... },
    ...additionalFieldsCommon,  // Always include this
  },
}
```

### 4. Verify

```bash
bun run check --filter @beep/iam-server
bun run build --filter @beep/iam-server
```

---

## Type Mapping Reference

| Drizzle | Better Auth `type` |
|---------|-------------------|
| `pg.text()` | `"string"` |
| `pg.integer()` | `"number"` |
| `pg.boolean()` | `"boolean"` |
| `datetime()` | `"date"` |
| `pg.jsonb()` | `"json"` |
| `pg.text().array()` | `"string[]"` |
| `pg.integer().array()` | `"number[]"` |
| `myPgEnum()` | `"string"` or literal array `["a", "b", "c"]` |

### Required Field Mapping

**CRITICAL**: Better Auth's `required` defaults to `true`, NOT `false`!

| Drizzle Modifier | Better Auth Config |
|-----------------|-------------|
| `.notNull()` | `required: true` (or omit - it's the default) |
| No `.notNull()` | `required: false` (MUST be explicit!) |
| `.default(val)` | `defaultValue: val` |

### Full DBFieldAttributeConfig

```typescript
{
  type: "string" | "number" | "boolean" | "date" | "json" | "string[]" | "number[]",
  required?: boolean,      // Default: TRUE (not false!)
  returned?: boolean,      // Default: true - include in API responses
  input?: boolean,         // Default: true - accept on create
  defaultValue?: value | (() => value),
  onUpdate?: () => value,  // Called on updates
  unique?: boolean,
  index?: boolean,
  fieldName?: string,      // Custom DB column name
  references?: { model, field, onDelete? },
  // ... plus transform, validator, bigint, sortable
}
```

See `tmp/better-auth/packages/core/src/db/type.ts` for complete type definition.

---

## Default Columns (Already Handled)

The `additionalFieldsCommon` variable handles Table.make defaults:
- `_rowId`, `createdAt`, `updatedAt`, `deletedAt`
- `createdBy`, `updatedBy`, `deletedBy`
- `version`, `source`

**Always spread `...additionalFieldsCommon` in your additionalFields.**

---

## Priority Order

1. **P0**: Discovery & Documentation Gathering (REQUIRED PREREQUISITE)
2. **P1**: Core models (user, session, account)
3. **P2**: Organization plugin models
4. **P3**: Authentication plugins (passkey, twoFactor, etc.)
5. **P4**: Integration plugins (stripe, sso, oidc, etc.)

**IMPORTANT**: Phase 0 MUST be completed before proceeding. It determines which fields are plugin-managed vs require explicit `additionalFields` configuration.

---

## Next Steps

1. Read [README.md](./README.md) for full entity mapping
2. Read [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) for detailed workflow
3. Start with Phase 0: Documentation gathering
4. Update [REFLECTION_LOG.md](./REFLECTION_LOG.md) after each phase
