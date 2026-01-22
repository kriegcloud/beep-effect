# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the naming-conventions-refactor spec.

### Context

This is the second phase of a ~53 file rename migration. Phase 0 (table files) should be complete. This phase focuses on value object files.

### Your Mission

Add `.value.ts` postfix to all 17 value object files across 6 packages:
- `@beep/knowledge-domain` (2 files)
- `@beep/shared-domain` (1 file)
- `@beep/iam-domain` (1 file)
- `@beep/documents-domain` (2 files)
- `@beep/calendar-domain` (9 files)
- `@beep/comms-domain` (2 files)

### Critical Patterns

**ALWAYS preview before applying:**
```typescript
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/knowledge/domain/src/value-objects/Attributes.ts",
  name: "attributes.value.ts",
  preview: true  // ALWAYS preview first
})
```

**Naming transformation:**
- PascalCase → kebab-case.value.ts: `Attributes.ts` → `attributes.value.ts`
- Already kebab-case → add postfix: `calendar-view.ts` → `calendar-view.value.ts`
- Plural → singular: `mail.values.ts` → `mail.value.ts`

### Reference Files

- Full file list: `specs/naming-conventions-refactor/handoffs/HANDOFF_P1.md`
- Tool docs: `.claude/skills/mcp-refactor-typescript.md`
- Source rules: `specs/canonical-naming-conventions/outputs/naming-rules-draft.md`

### Verification

After each package:
```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/shared-domain
bun run check --filter @beep/iam-domain
bun run check --filter @beep/documents-domain
bun run check --filter @beep/calendar-domain
bun run check --filter @beep/comms-domain
```

Final verification:
```bash
find packages -path "*/value-objects/*" -name "*.ts" -not -name "index.ts" -not -name "*.value.ts"
# Expected: no output
```

### Success Criteria

- [ ] All 17 value object files renamed with `.value.ts` postfix
- [ ] All import paths updated automatically
- [ ] All 6 domain packages pass type checks
- [ ] Verification command returns no files without `.value.ts` postfix
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings

### Handoff Document

Read full context in: `specs/naming-conventions-refactor/handoffs/HANDOFF_P1.md`

### Next Phase

After completing Phase 1:
1. Update `specs/naming-conventions-refactor/REFLECTION_LOG.md` with learnings
2. Proceed to Phase 2: Schema File Renames
3. Use `P2_ORCHESTRATOR_PROMPT.md`
