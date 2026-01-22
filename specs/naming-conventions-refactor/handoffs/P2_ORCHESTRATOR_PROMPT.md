# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the naming-conventions-refactor spec.

### Context

This is the third phase of a ~53 file rename migration. Phases 0 (tables) and 1 (value objects) should be complete. This phase focuses on schema files.

### Your Mission

Add `.schema.ts` postfix to all schema files in entity `schemas/` directories (~15 files).

**Pre-Execution**: Enumerate all schema files first:
```bash
find packages -path "*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts"
```

### Critical Patterns

**ALWAYS preview before applying:**
```typescript
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/iam/domain/src/entities/member/schemas/member-status.ts",
  name: "member-status.schema.ts",
  preview: true  // ALWAYS preview first
})
```

**Expected files (from naming-rules-draft.md):**
- `member-status.ts` → `member-status.schema.ts`
- `member-role.ts` → `member-role.schema.ts`
- `invitation-status.ts` → `invitation-status.schema.ts`
- `authenticator-attachment.ts` → `authenticator-attachment.schema.ts`

*Additional schema files may exist - enumerate before execution.*

### Reference Files

- Full context: `specs/naming-conventions-refactor/handoffs/HANDOFF_P2.md`
- Tool docs: `.claude/skills/mcp-refactor-typescript.md`
- Source rules: `specs/canonical-naming-conventions/outputs/naming-rules-draft.md`

### Verification

After renaming:
```bash
bun run check --filter @beep/iam-domain
# Other domain packages if they have schema files
```

Final verification:
```bash
find packages -path "*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts"
# Expected: no output
```

### Success Criteria

- [ ] All schema files enumerated
- [ ] All schema files renamed with `.schema.ts` postfix
- [ ] All import paths updated automatically
- [ ] `bun run check --filter @beep/iam-domain` passes
- [ ] Verification command returns no files without `.schema.ts` postfix
- [ ] REFLECTION_LOG.md updated with Phase 2 learnings

### Handoff Document

Read full context in: `specs/naming-conventions-refactor/handoffs/HANDOFF_P2.md`

### Next Phase

After completing Phase 2:
1. Update `specs/naming-conventions-refactor/REFLECTION_LOG.md` with learnings
2. Proceed to Phase 3: Miscellaneous Renames
3. Use `P3_ORCHESTRATOR_PROMPT.md`
