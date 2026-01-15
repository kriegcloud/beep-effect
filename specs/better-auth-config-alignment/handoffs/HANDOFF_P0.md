# Better Auth Config Alignment — P0 Handoff (Initial)

> Entry point for orchestrating agent. Start here.

---

## Spec Overview

**Goal**: Align Better Auth plugin configurations with Drizzle table schemas so OpenAPI documentation reflects all custom fields.

**Key Constraint**: Not all Better Auth plugins support `additionalFields` configuration. Research each plugin's documentation to determine support.

---

## Files to Know

| File | Purpose |
|------|---------|
| `packages/iam/server/src/adapters/better-auth/Options.ts` | **Primary edit target** - Server Better Auth config |
| `packages/iam/client/src/adapters/better-auth/client.ts` | Client config - may need type inference updates |
| `packages/iam/tables/src/tables/*.table.ts` | IAM Drizzle tables |
| `packages/shared/tables/src/tables/*.table.ts` | Shared Drizzle tables |
| `packages/shared/tables/src/table/Table.ts` | Table.make factory (default columns) |
| `packages/shared/tables/src/org-table/OrgTable.ts` | OrgTable.make factory (org-scoped defaults) |
| `packages/shared/tables/src/common.ts` | globalColumns definition |
| `tmp/better-auth/packages/core/src/db/type.ts` | **Better Auth source types** - authoritative reference |
| `tmp/better-auth/packages/better-auth/src/types/plugins.ts` | **InferOptionSchema type** - determines partial support |
| `tmp/better-auth/packages/<plugin>/src/types.ts` | **Plugin options types** - check for additionalFields |
| `tmp/better-auth/packages/better-auth/src/plugins/<name>/` | **Built-in plugin source** - for twoFactor, admin, etc. |

---

## Better Auth DBFieldAttributeConfig (CRITICAL)

The `additionalFields` configuration uses `DBFieldAttribute<T>` type. **Read the source file above for authoritative reference.**

### Key Default Values (IMPORTANT)

| Property | Default | Implication |
|----------|---------|-------------|
| `required` | **`true`** | Nullable Drizzle columns MUST explicitly set `required: false` |
| `returned` | `true` | Field included in API responses by default |
| `input` | `true` | Field accepted on create by default |

### Available Properties

```typescript
{
  type: "string" | "number" | "boolean" | "date" | "json" | "string[]" | "number[]",
  required?: boolean,      // Default: TRUE!
  returned?: boolean,      // Default: true
  input?: boolean,         // Default: true
  defaultValue?: value | (() => value),
  onUpdate?: () => value,
  unique?: boolean,
  index?: boolean,
  fieldName?: string,      // Custom DB column name
  references?: { model, field, onDelete? },
  transform?: { input?, output? },
  validator?: { input?, output? },
  bigint?: boolean,
  sortable?: boolean,
}
```

---

## Table Factory Default Columns

### Table.make provides:
- `id` (string) - branded entity ID
- `_rowId` (number) - internal auto-increment
- `createdAt` (date) - UTC, auto-set
- `updatedAt` (date) - UTC, auto-updated
- `deletedAt` (date) - soft delete
- `createdBy` (string) - user/system ID
- `updatedBy` (string) - user/system ID
- `deletedBy` (string) - user/system ID
- `version` (number) - optimistic locking
- `source` (string) - origin tracking

### OrgTable.make adds:
- `organizationId` (string) - FK to organization.id

### Current Options.ts `additionalFieldsCommon`:
Already handles Table.make defaults. Always spread this in additionalFields.

---

## P0 Tasks: Documentation Gathering

### Task 0.1: Research Better Auth Plugin Schema Support

**PRIMARY METHOD**: Analyze Better Auth source code directly (most reliable):

```bash
# Step 1: Locate plugin source
# External plugins (passkey, stripe, sso):
ls tmp/better-auth/packages/<plugin>/src/types.ts

# Built-in plugins (twoFactor, admin, username, etc.):
ls tmp/better-auth/packages/better-auth/src/plugins/<plugin>/types.ts

# Step 2: Check schema type
grep -A10 "schema?" <types.ts path>

# Step 3: Determine support level
# If schema uses InferOptionSchema → PARTIAL support (modelName + fields only)
# If schema has additionalFields property → FULL support
# If no schema property → MINIMAL/NONE
```

**FALLBACK METHOD**: Web search if source unavailable:
```
"Better Auth <plugin-name> plugin schema additionalFields site:better-auth.com"
"Better Auth <plugin-name> configuration github"
```

**Plugins to research (in priority order):**

1. **organization** (P0) - creates/extends organization, member, team, teamMember, invitation, organizationRole
2. **username** (P1) - extends user model
3. **twoFactor** (P1) - creates twoFactor model
4. **passkey** (P1) - creates passkey model
5. **phoneNumber** (P1) - extends user model
6. **anonymous** (P1) - extends user model
7. **admin** (P1) - extends user model
8. **stripe** (P2) - creates subscription model
9. **sso** (P2) - creates ssoProvider, scimProvider models
10. **siwe** (P2) - creates walletAddress model
11. **jwt** (P3) - creates jwks model
12. **oidcProvider** (P3) - creates oauth models
13. **deviceAuthorization** (P3) - creates deviceCode model
14. **apiKey** (P3) - creates apiKey model
15. **lastLoginMethod** (P3) - extends user model

### Task 0.2: Document Plugin Schema Support

Create `outputs/plugin-schema-support.md` with:

```markdown
# Plugin Schema Configuration Support

| Plugin | Has Schema Option | additionalFields Supported | Configuration Pattern |
|--------|------------------|---------------------------|----------------------|
| organization | Yes/No | Yes/No | `organization({ schema: { ... } })` |
| ... | | | |
```

### Task 0.3: Map Better Auth Core Fields

For models that appear in multiple plugins, document which fields are "core" (managed by Better Auth) vs "additional" (your custom columns):

```markdown
# Better Auth Core Fields

## User Model
Core fields (do NOT add to additionalFields):
- name
- email
- emailVerified
- image

## Session Model
Core fields:
- ...

## Organization Model
Core fields:
- ...
```

---

## P0 Verification Checklist

- [ ] Researched all 15 plugins listed above
- [ ] Created `outputs/plugin-schema-support.md`
- [ ] Documented which plugins support schema configuration
- [ ] Documented which plugins do NOT support schema configuration
- [ ] Identified Better Auth core fields for each model
- [ ] Updated `REFLECTION_LOG.md` with Phase 0 learnings

---

## P0 Completion → P1 Handoff

After completing P0:
1. Update `REFLECTION_LOG.md` with plugin documentation findings
2. Create `HANDOFF_P1.md` with refined prompts based on learnings
3. P1 will focus on core models (user, session, account)

---

## Research Methodology (CRITICAL)

**Source code analysis is the authoritative method.** The Better Auth source in `tmp/better-auth/` contains the definitive type definitions.

### Schema Support Detection Pattern

```bash
# Quick check for ALL plugins at once:
# Find plugins using InferOptionSchema (PARTIAL support)
grep -r "InferOptionSchema" tmp/better-auth/packages/*/src/types.ts

# Find plugins with additionalFields (FULL support)
grep -r "additionalFields" tmp/better-auth/packages/*/src/types.ts
```

### Key Type Definitions Location
- `tmp/better-auth/packages/better-auth/src/types/plugins.ts` - Contains `InferOptionSchema` type
- `tmp/better-auth/packages/<plugin>/src/types.ts` - Plugin-specific options

### Web Search (Fallback Only)

If source code is unavailable, use web search:
```
"Better Auth <plugin-name> plugin schema additionalFields site:better-auth.com"
"Better Auth <plugin-name> configuration github"
```

---

## Orchestrator Prompt for P0

```markdown
# P0 Orchestrator: Plugin Schema Support Research

## Your Task
Research Better Auth source code for each plugin to determine:
1. Does the plugin have a `schema` configuration option?
2. Does it use `InferOptionSchema` (partial support) or custom type (full support)?
3. Does the schema option support `additionalFields`?
4. What fields does the plugin automatically manage (if extending user model)?

## Tools Available (Priority Order)
1. `Read` + `Grep` for Better Auth source code in `tmp/better-auth/`
2. `WebSearch` for official Better Auth documentation (fallback)
3. `Read` for examining current Options.ts configuration
4. `Read` for examining Drizzle table definitions

## Schema Support Levels to Document
- **Full**: `additionalFields` supported (organization plugin models, core models)
- **Partial**: Only `modelName` + `fields` (column renaming) - passkey, twoFactor, etc.
- **Minimal**: No schema configuration available

## Output Required
Create `outputs/plugin-schema-support.md` with:
- Support level for each plugin
- Configuration pattern for each support level
- Fields automatically managed by user-extending plugins

## Key Insight to Remember
Better Auth plugins are HETEROGENEOUS:
- `InferOptionSchema<typeof schema>` → PARTIAL (modelName + fields only)
- Custom type with `additionalFields` → FULL support
- No schema property → MINIMAL/NONE

## After Completion
1. Update REFLECTION_LOG.md Phase 0 section
2. Create HANDOFF_P1.md for next phase
```

---

## Notes for Executing Agent

1. **Don't assume uniformity** - each plugin is different
2. **Check existing config** - Options.ts already has partial configurations
3. **Compare to tables** - Drizzle tables are the source of truth for columns
4. **Document gaps** - if a plugin doesn't support schema config, note it clearly
5. **Update reflection log** - learnings from this phase inform all subsequent phases
