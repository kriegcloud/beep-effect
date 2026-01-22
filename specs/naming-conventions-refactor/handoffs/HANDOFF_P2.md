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

## Files to Rename (9 total)

### Package: @beep/iam-domain (5 files)

Located in `packages/iam/domain/src/entities/*/schemas/`:

| Entity | Current Name | Target Name | Status |
|--------|--------------|-------------|--------|
| member | `member-status.ts` | `member-status.schema.ts` | Pending |
| member | `member-role.ts` | `member-role.schema.ts` | Pending |
| invitation | `invitation-status.ts` | `invitation-status.schema.ts` | Pending |
| passkey | `authenticator-attachment.ts` | `authenticator-attachment.schema.ts` | Pending |
| device-code | `device-code-status.ts` | `device-code-status.schema.ts` | Pending |

### Package: @beep/shared-domain (4 files)

Located in `packages/shared/domain/src/entities/*/schemas/`:

| Entity | Current Name | Target Name | Status |
|--------|--------------|-------------|--------|
| file | `UploadKey.ts` | `upload-key.schema.ts` | Pending |
| folder | `WithUploadedFiles.ts` | `with-uploaded-files.schema.ts` | Pending |
| upload-session | `UploadSessionMetadata.ts` | `upload-session-metadata.schema.ts` | Pending |
| user | `UserRole.ts` | `user-role.schema.ts` | Pending |

**Note**: 3 files in shared-domain already have correct `.schema.ts` postfix (skip these):
- `OrganizationType.schema.ts`
- `SubscriptionStatus.schema.ts`
- `SubscriptionTier.schema.ts`

### Package: @beep/knowledge-server (OUT OF SCOPE)

Located in `packages/knowledge/server/src/Extraction/schemas/`:

These are LLM structured output schemas, not domain entity schemas. They follow a different pattern (PascalCase) and serve a different purpose. **Exclude from this refactor**:
- `EntityOutput.ts`
- `MentionOutput.ts`
- `RelationOutput.ts`

---

## Pre-Execution Verification

Verify the schema files match expectations:

```bash
# List all source files in schemas directories that don't have .schema.ts postfix
# (excludes build/ directories)
find packages -path "*/src/*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts"
```

Expected output: 9 files (5 from iam-domain, 4 from shared-domain).

---

## Tool Availability Check

Before starting, verify MCP refactor tool availability:

```bash
# Check if MCP tools are configured (look for mcp-refactor-typescript in output)
# In Claude Code, MCP tools appear as mcp__<server>__<tool> functions
```

**If MCP tool unavailable**, use fallback workflow:
1. `git mv <old> <new>` for each file
2. Manually update import paths in:
   - `index.ts` barrel exports in the schemas directory
   - Parent entity files that import from schemas
   - Any other cross-file imports
3. Run `bun run check` to catch missed imports

**Phase 1 learnings**: Cross-file imports within the same directory may be missed. Always verify with type checks.

---

## Implementation Order

1. **@beep/iam-domain** (5 files)
   - Rename all 5 schema files
   - Run: `bun run check --filter @beep/iam-domain`

2. **@beep/shared-domain** (4 files)
   - Rename all 4 schema files
   - Run: `bun run check --filter @beep/shared-domain`

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
# Check affected packages
bun run check --filter @beep/iam-domain
bun run check --filter @beep/shared-domain

# Verify no schema files missing postfix (excludes build/ and knowledge-server)
find packages -path "*/src/*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts" | grep -v "knowledge/server"
# Expected: no output (all have .schema.ts postfix)
```

---

## Known Issues & Gotchas

1. **Index file exports**: Each `schemas/` directory has an `index.ts` that re-exports all schemas. The MCP tool should update these automatically.

2. **Model imports**: Domain models (`*.model.ts`) import from schema files. Verify these imports are updated.

3. **Already correct files**: 3 files in shared-domain already have `.schema.ts` postfix - skip these:
   - `OrganizationType.schema.ts`
   - `SubscriptionStatus.schema.ts`
   - `SubscriptionTier.schema.ts`

4. **Excluded: knowledge-server schemas**: The `Extraction/schemas/` files are LLM output schemas, not domain schemas. They use PascalCase intentionally and are excluded from this refactor.

5. **Casing change**: Some files change from PascalCase to kebab-case (e.g., `UploadKey.ts` → `upload-key.schema.ts`). This is intentional per naming conventions.

---

## Success Criteria

Phase 2 is complete when:

- [ ] All 9 schema files renamed with `.schema.ts` postfix
- [ ] All import paths updated automatically
- [ ] `bun run check --filter @beep/iam-domain` passes
- [ ] `bun run check --filter @beep/shared-domain` passes
- [ ] Verification command returns no files without `.schema.ts` postfix
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings
- [ ] HANDOFF_P3.md reviewed and ready

---

## Next Phase

After completing Phase 2, proceed to Phase 3: Miscellaneous Renames.

See: `handoffs/HANDOFF_P3.md`
