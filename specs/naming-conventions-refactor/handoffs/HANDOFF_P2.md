# Phase 2 Handoff: Schema File Renames

**Date**: 2026-01-21
**From**: Phase 1 (Value Object Renames)
**To**: Phase 2 (Schema File Renames)
**Status**: Pending Phase 1 completion

---

## Phase 2 Summary

Add `.schema.ts` postfix to all schema files in entity `schemas/` directories.

### Key Context

- Schema files define validation/enum schemas for domain entities
- Located in `*/entities/*/schemas/` directories
- Current state: no postfix (e.g., `member-status.ts`)
- Target state: `.schema.ts` postfix (e.g., `member-status.schema.ts`)

---

## Files to Rename (~15 total)

### Package: @beep/iam-domain

Located in `packages/iam/domain/src/entities/*/schemas/`:

**Note**: Exact file list should be verified by running:
```bash
find packages/iam/domain -path "*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts"
```

#### Expected Files (from naming-rules-draft.md):

| Entity | Current Name | Target Name | Status |
|--------|--------------|-------------|--------|
| member | `member-status.ts` | `member-status.schema.ts` | Pending |
| member | `member-role.ts` | `member-role.schema.ts` | Pending |
| invitation | `invitation-status.ts` | `invitation-status.schema.ts` | Pending |
| passkey | `authenticator-attachment.ts` | `authenticator-attachment.schema.ts` | Pending |

*Additional schema files may exist - enumerate before execution.*

---

## Pre-Execution Verification

**IMPORTANT**: Before executing Phase 2, enumerate all schema files:

```bash
# List all files in schemas directories that don't have .schema.ts postfix
find packages -path "*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts"
```

Update this handoff document with the complete list before proceeding.

---

## Implementation Order

1. **Enumerate all schema files** using the verification command above
2. **Group by entity** for logical organization
3. **Rename one entity's schemas at a time**
4. **Verify after each entity group**

---

## Tool Usage Pattern

```typescript
// Schema file rename
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/iam/domain/src/entities/member/schemas/member-status.ts",
  name: "member-status.schema.ts",
  preview: true
})
```

---

## Verification Steps

After renaming schema files:

```bash
# Check IAM domain
bun run check --filter @beep/iam-domain

# Verify no schema files missing postfix
find packages -path "*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts"
# Expected: no output (all have .schema.ts postfix)
```

---

## Known Issues & Gotchas

1. **Index file exports**: Each `schemas/` directory has an `index.ts` that re-exports all schemas. The MCP tool should update these automatically.

2. **Model imports**: Domain models (`*.model.ts`) import from schema files. Verify these imports are updated.

3. **Partial adoption**: Some schema files may already have the `.schema.ts` postfix. Skip these.

---

## Success Criteria

Phase 2 is complete when:

- [ ] All schema files renamed with `.schema.ts` postfix
- [ ] All import paths updated automatically
- [ ] `bun run check --filter @beep/iam-domain` passes
- [ ] Other domain packages pass (if they have schema files)
- [ ] Verification command returns no files without `.schema.ts` postfix
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] HANDOFF_P3.md reviewed and ready

---

## Next Phase

After completing Phase 2, proceed to Phase 3: Miscellaneous Renames.

See: `handoffs/HANDOFF_P3.md`
