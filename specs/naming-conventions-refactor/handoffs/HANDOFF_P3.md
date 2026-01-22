# Phase 3 Handoff: Miscellaneous Renames

**Date**: 2026-01-21
**From**: Phase 2 (Schema File Renames)
**To**: Phase 3 (Miscellaneous Renames)
**Status**: Pending Phase 2 completion

---

## Phase 3 Summary

Handle edge cases and miscellaneous file renames that don't fit into the previous categories.

### Key Context

- Job files should use `.job.ts` postfix
- Any remaining files not covered by Phases 0-2
- Final verification pass

---

## Files to Rename (~2 total)

### Server Job Files

Located in `packages/*/server/src/`:

| Package | Current Name | Target Name | Notes |
|---------|--------------|-------------|-------|
| documents-server | `cleanup-upload-sessions.ts` | `cleanup-upload-sessions.job.ts` | If not already postfixed |

**Note**: Verify actual job files exist and their current naming:
```bash
find packages -path "*/server/*" -name "*job*" -o -name "*cleanup*" | grep -v node_modules
```

---

## Pre-Execution Verification

Before executing Phase 3:

1. **Verify all previous phases completed**
   ```bash
   # No camelCase table files
   find packages -name "*.table.ts" | xargs basename -a 2>/dev/null | grep -E '[A-Z]'

   # No value objects without .value.ts
   find packages -path "*/value-objects/*" -name "*.ts" -not -name "index.ts" -not -name "*.value.ts"

   # No schemas without .schema.ts
   find packages -path "*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts"
   ```

2. **Enumerate remaining files to rename**
   ```bash
   # Find job files
   find packages -path "*/server/*" -name "*.ts" | xargs grep -l "job\|Job" | head -20
   ```

---

## Implementation Order

1. **Verify previous phases** are complete
2. **Enumerate remaining files** using verification commands
3. **Rename job files** with `.job.ts` postfix
4. **Final verification pass**

---

## Tool Usage Pattern

```typescript
// Job file rename
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/documents/server/src/cleanup-upload-sessions.ts",
  name: "cleanup-upload-sessions.job.ts",
  preview: true
})
```

---

## Final Verification

After all phases complete:

```bash
# Full build check
bun run check

# Verify naming conventions
# No camelCase table files
find packages -name "*.table.ts" | xargs basename -a 2>/dev/null | grep -E '[A-Z]'

# No value objects without .value.ts
find packages -path "*/value-objects/*" -name "*.ts" -not -name "index.ts" -not -name "*.value.ts"

# No schemas without .schema.ts
find packages -path "*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts"
```

---

## Known Issues & Gotchas

1. **Small scope**: Phase 3 is intentionally small - most work is done in Phases 0-2.

2. **Discovery phase**: May need to discover additional edge cases during execution.

3. **Build verification**: Final build check is critical before considering the refactor complete.

---

## Success Criteria

Phase 3 is complete when:

- [ ] All job files renamed with `.job.ts` postfix (if any)
- [ ] Any remaining edge cases addressed
- [ ] `bun run check` passes (full build)
- [ ] All verification commands pass
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings and final summary

---

## Post-Completion

After Phase 3:

1. **Update REFLECTION_LOG.md** with final summary
2. **Update naming rules** in `.claude/rules/naming-conventions.md` (create if not exists)
3. **Consider creating PR** with the refactored files
4. **Archive this spec** as complete

---

## Summary Statistics (Expected)

| Phase | Files Renamed | Packages Affected |
|-------|---------------|-------------------|
| P0: Tables | 19 | 3 |
| P1: Value Objects | 17 | 6 |
| P2: Schemas | ~15 | 1 |
| P3: Miscellaneous | ~2 | 1 |
| **Total** | **~53** | **~11** |
