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

Located in `packages/shared/server/src/jobs/`:

| Package | Current Path | Target Name | Notes |
|---------|--------------|-------------|-------|
| shared-server | `packages/shared/server/src/jobs/cleanup-upload-sessions.ts` | `cleanup-upload-sessions.job.ts` | Add `.job.ts` postfix |

**Note**: Verify actual job files exist and their current naming:
```bash
find packages -path "*/jobs/*" -name "*.ts" -not -name "index.ts" | grep -v node_modules | grep -v build
```

---

## Pre-Execution Verification

Before executing Phase 3:

1. **Verify all previous phases completed**
   ```bash
   # No camelCase table files
   find packages -name "*.table.ts" | xargs basename -a 2>/dev/null | grep -E '[A-Z]'

   # No value objects without .value.ts (excludes build/)
   find packages -path "*/src/value-objects/*" -name "*.ts" -not -name "index.ts" -not -name "*.value.ts"

   # No schemas without .schema.ts (excludes build/ and knowledge-server)
   find packages -path "*/src/*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts" | grep -v "knowledge/server"
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

# No value objects without .value.ts (excludes build/)
find packages -path "*/src/value-objects/*" -name "*.ts" -not -name "index.ts" -not -name "*.value.ts"

# No schemas without .schema.ts (excludes build/ and knowledge-server)
find packages -path "*/src/*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts" | grep -v "knowledge/server"
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
3. **Update `@beep/repo-cli` templates** in `tooling/cli/src/commands/create-slice/`:
   - Update Handlebars templates to use new naming conventions
   - Ensure generated table files use kebab-case (e.g., `{{kebab-case name}}.table.ts`)
   - Ensure generated schema files include `.schema.ts` postfix
   - Ensure generated value object files include `.value.ts` postfix
4. **Consider creating PR** with the refactored files
5. **Archive this spec** as complete

---

## Summary Statistics (Expected)

| Phase | Files Renamed | Packages Affected |
|-------|---------------|-------------------|
| P0: Tables | 19 | 3 (iam-tables, documents-tables, knowledge-tables) |
| P1: Value Objects | 18 | 6 (knowledge-domain, shared-domain, iam-domain, documents-domain, calendar-domain, comms-domain) |
| P2: Schemas | 9 | 2 (iam-domain, shared-domain) |
| P3: Miscellaneous | 1 | 1 (shared-server) |
| **Total** | **47** | **~12** |
