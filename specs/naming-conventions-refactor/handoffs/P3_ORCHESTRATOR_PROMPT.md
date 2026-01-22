# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 of the naming-conventions-refactor spec.

### Context

This is the final phase of a ~53 file rename migration. Phases 0-2 should be complete. This phase handles edge cases and miscellaneous renames.

### Your Mission

1. **Verify all previous phases completed**
2. **Rename job files** with `.job.ts` postfix (if any exist)
3. **Address any remaining edge cases**
4. **Final verification pass**

### Pre-Execution Verification

```bash
# Verify previous phases
# No camelCase table files
find packages -name "*.table.ts" | xargs basename -a 2>/dev/null | grep -E '[A-Z]'

# No value objects without .value.ts
find packages -path "*/value-objects/*" -name "*.ts" -not -name "index.ts" -not -name "*.value.ts"

# No schemas without .schema.ts
find packages -path "*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts"

# Enumerate job files
find packages -path "*/server/*" -name "*cleanup*" -o -name "*job*" | grep -v node_modules
```

### Critical Patterns

**Job file rename:**
```typescript
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/documents/server/src/cleanup-upload-sessions.ts",
  name: "cleanup-upload-sessions.job.ts",
  preview: true  // ALWAYS preview first
})
```

### Reference Files

- Full context: `specs/naming-conventions-refactor/handoffs/HANDOFF_P3.md`
- Tool docs: `.claude/skills/mcp-refactor-typescript.md`
- Source rules: `specs/canonical-naming-conventions/outputs/naming-rules-draft.md`

### Final Verification

```bash
# Full build check
bun run check

# Verify all naming conventions
find packages -name "*.table.ts" | xargs basename -a 2>/dev/null | grep -E '[A-Z]'
find packages -path "*/value-objects/*" -name "*.ts" -not -name "index.ts" -not -name "*.value.ts"
find packages -path "*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts"
# Expected: no output for all
```

### Success Criteria

- [ ] Previous phases verified complete
- [ ] All job files renamed with `.job.ts` postfix (if any)
- [ ] Any remaining edge cases addressed
- [ ] `bun run check` passes (full build)
- [ ] All verification commands pass
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings and final summary

### Post-Completion

After Phase 3:
1. Update `specs/naming-conventions-refactor/REFLECTION_LOG.md` with final summary
2. Consider creating naming conventions rule in `.claude/rules/`
3. Archive this spec as complete

### Summary Statistics (Expected)

| Phase | Files Renamed | Packages Affected |
|-------|---------------|-------------------|
| P0: Tables | 19 | 3 |
| P1: Value Objects | 17 | 6 |
| P2: Schemas | ~15 | 1 |
| P3: Miscellaneous | ~2 | 1 |
| **Total** | **~53** | **~11** |
