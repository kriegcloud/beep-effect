# Better Auth Config Alignment — P1 Handoff (Core Models)

> Phase 1: Align core model configurations (user, session, account)

---

## Phase 0 Summary

Phase 0 research is complete. Key findings:

1. **Only organization plugin supports additionalFields** for its own models
2. **Core models (user, session) support additionalFields** via `options.user.additionalFields` and `options.session.additionalFields`
3. **Account model does NOT support additionalFields** in core options
4. **All other plugins use InferOptionSchema** = PARTIAL support (only modelName + fields renaming)

See `outputs/plugin-schema-support.md` and `outputs/core-fields.md` for complete details.

---

## P1 Objective

Ensure `Options.ts` has correct `additionalFields` configuration for:
1. **User model** — all custom Drizzle columns from `user.table.ts`
2. **Session model** — all custom Drizzle columns from `session.table.ts`
3. **Account model** — document that additionalFields NOT supported

---

## Files to Know

| File | Purpose |
|------|---------|
| `packages/iam/server/src/adapters/better-auth/Options.ts` | Primary edit target |
| `packages/shared/tables/src/tables/user.table.ts` | User Drizzle schema (NOTE: in shared, not iam) |
| `packages/shared/tables/src/tables/session.table.ts` | Session Drizzle schema (NOTE: in shared, not iam) |
| `packages/iam/tables/src/tables/account.table.ts` | Account Drizzle schema |
| `packages/shared/tables/src/table/Table.ts` | Table.make default columns |
| `packages/shared/tables/src/common.ts` | globalColumns (audit, tracking, version, source) |
| `specs/better-auth-config-alignment/outputs/core-fields.md` | Better Auth core fields reference |

---

## P1 Tasks

### Task 1.1: Read Current Configuration

Read `Options.ts` to understand:
1. What `additionalFieldsCommon` currently contains
2. What `options.user.additionalFields` currently contains
3. What `options.session.additionalFields` currently contains

### Task 1.2: Read Drizzle Table Schemas

For each table, identify:
- Columns that are Table.make defaults (already in `additionalFieldsCommon`)
- Columns that are Better Auth core fields (should NOT be in additionalFields)
- Custom columns (SHOULD be in additionalFields)

### Task 1.3: Compare and Document Gaps

Create a gap analysis:

| Model | Column | In Drizzle | In additionalFields | Action |
|-------|--------|-----------|---------------------|--------|
| user | displayName | ✅ | ❌ | Add |
| ... | ... | ... | ... | ... |

### Task 1.4: Update User additionalFields

For each custom user column:
1. Determine correct `type` based on Drizzle column type
2. Determine `required` based on `.notNull()` presence
3. Add field to `options.user.additionalFields`

### Task 1.5: Update Session additionalFields

Same process for session columns.

### Task 1.6: Document Account Limitation

Account model does NOT support additionalFields. Document any custom account columns that:
- Cannot be reflected in OpenAPI
- Will need separate handling

### Task 1.7: Verify Changes

```bash
bun run check
bun run build
```

---

## Configuration Reference

### Better Auth Core User Fields (DO NOT ADD)

These are automatically managed by Better Auth:
- `id`, `createdAt`, `updatedAt`
- `email`, `emailVerified`, `name`, `image`

### Better Auth Core Session Fields (DO NOT ADD)

- `id`, `createdAt`, `updatedAt`
- `userId`, `expiresAt`, `token`, `ipAddress`, `userAgent`

### Table.make Default Fields (should be in additionalFieldsCommon)

From `packages/shared/tables/src/table/Table.ts`:
- `_rowId`, `deletedAt`, `createdBy`, `updatedBy`, `deletedBy`, `version`, `source`

### DBFieldAttributeConfig Reference

```typescript
{
  type: "string" | "number" | "boolean" | "date" | "json" | "string[]" | "number[]",
  required?: boolean,      // Default: TRUE! Set false for nullable columns
  returned?: boolean,      // Default: true (include in API responses)
  input?: boolean,         // Default: true (accept on create/update)
  defaultValue?: value | (() => value),
  onUpdate?: () => value,
  unique?: boolean,
  index?: boolean,
  fieldName?: string,      // Custom DB column name
  transform?: { input?, output? },
  validator?: { input?, output? },
  bigint?: boolean,
  sortable?: boolean,
}
```

---

## Drizzle to Better Auth Type Mapping

| Drizzle Type | Better Auth Type |
|--------------|------------------|
| `text()` | `"string"` |
| `varchar()` | `"string"` |
| `integer()` | `"number"` |
| `boolean()` | `"boolean"` |
| `timestamp()` | `"date"` |
| `json()` / `jsonb()` | `"json"` |

### Required Mapping

| Drizzle | Better Auth `required` |
|---------|----------------------|
| `.notNull()` present | `required: true` (or omit, it's default) |
| No `.notNull()` | `required: false` ← MUST explicitly set! |

---

## Common Pitfalls

1. **Forgetting `required: false`** — Better Auth defaults to `required: true`, so nullable columns MUST explicitly set `required: false`

2. **Adding core fields** — Do NOT add `email`, `name`, etc. to additionalFields

3. **Adding Table.make fields individually** — Use `...additionalFieldsCommon` spread instead

4. **Plugin-managed fields** — If using username/admin/phoneNumber plugins, those fields are managed by the plugins, not core additionalFields

---

## P1 Completion Checklist

- [ ] User additionalFields complete (all custom columns)
- [ ] Session additionalFields complete (all custom columns)
- [ ] Account limitations documented
- [ ] No core fields accidentally added
- [ ] `required: false` set for all nullable columns
- [ ] `bun run check` passes
- [ ] `bun run build` passes
- [ ] REFLECTION_LOG.md Phase 1 section updated

---

## P1 → P2 Handoff

After completing P1:
1. Update `REFLECTION_LOG.md` Phase 1 section
2. Create `HANDOFF_P2.md` for organization models
3. P2 will focus on organization plugin models (organization, member, team, etc.)

---

## Orchestrator Prompt for P1

```markdown
# P1 Orchestrator: Core Models Alignment

## Your Task
Align Better Auth additionalFields configuration for user and session models with their Drizzle table schemas.

## Prerequisite Check
Verify Phase 0 outputs exist:
- `outputs/plugin-schema-support.md`
- `outputs/core-fields.md`

## Research Phase
1. Read current `Options.ts` configuration
2. Read `user.table.ts` and `session.table.ts` Drizzle schemas
3. Read `Table.ts` to understand default columns
4. Compare Drizzle columns to Better Auth core fields

## Implementation Phase
1. Identify custom columns not in core fields or Table.make defaults
2. Add missing columns to `options.user.additionalFields`
3. Add missing columns to `options.session.additionalFields`
4. Ensure `required: false` for nullable columns

## Verification Phase
1. Run `bun run check`
2. Run `bun run build`
3. Document any errors and fix

## Output Required
- Updated `Options.ts` with complete user/session additionalFields
- Gap analysis in reflection log
- Any account model limitations documented

## Key Constraints
- DO NOT add core fields (id, email, name, emailVerified, etc.)
- DO NOT add Table.make fields individually (use spread)
- MUST set `required: false` for nullable columns
- Account does NOT support additionalFields
```
