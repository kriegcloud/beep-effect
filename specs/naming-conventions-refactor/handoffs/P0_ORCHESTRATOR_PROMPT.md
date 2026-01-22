# Phase 0 Orchestrator Prompt

Copy-paste this prompt to start Phase 0 implementation.

---

## Prompt

You are implementing Phase 0 of the naming-conventions-refactor spec.

### Context

This is the first phase of a ~53 file rename migration to align with canonical naming conventions. The source spec is `specs/canonical-naming-conventions/` which defines the rules. This phase focuses on table files only.

### Your Mission

Rename 19 table files from camelCase to kebab-case across 3 packages:
- `@beep/iam-tables` (13 files)
- `@beep/documents-tables` (2 files)
- `@beep/knowledge-tables` (4 files)

### Critical Patterns

**ALWAYS preview before applying:**
```typescript
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/iam/tables/src/tables/apiKey.table.ts",
  name: "api-key.table.ts",
  preview: true  // ALWAYS preview first
})
```

**Naming transformation:**
- `apiKey.table.ts` → `api-key.table.ts`
- `oauthAccessToken.table.ts` → `oauth-access-token.table.ts`
- `documentFile.table.ts` → `document-file.table.ts`

### Reference Files

- Full file list: `specs/naming-conventions-refactor/handoffs/HANDOFF_P0.md`
- Tool docs: `.claude/skills/mcp-refactor-typescript.md`
- Source rules: `specs/canonical-naming-conventions/outputs/naming-rules-draft.md`

### Verification

After each package:
```bash
bun run check --filter @beep/iam-tables
bun run check --filter @beep/documents-tables
bun run check --filter @beep/knowledge-tables
```

Final verification:
```bash
find packages -name "*.table.ts" | xargs basename -a 2>/dev/null | grep -E '[A-Z]'
# Expected: no output
```

### Success Criteria

- [ ] 13 IAM table files renamed
- [ ] 2 Documents table files renamed
- [ ] 4 Knowledge table files renamed
- [ ] All type checks pass
- [ ] No camelCase table files remain

### Handoff Document

Read full context in: `specs/naming-conventions-refactor/handoffs/HANDOFF_P0.md`

### Next Phase

After completing Phase 0:
1. Update `specs/naming-conventions-refactor/REFLECTION_LOG.md` with learnings
2. Proceed to Phase 1: Value Object Renames
3. Create `P1_ORCHESTRATOR_PROMPT.md` if not already present
