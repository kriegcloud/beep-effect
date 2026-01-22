# Naming Conventions Refactor Spec

> Execute the ~48 file renames defined in `specs/canonical-naming-conventions/`.

---

## Overview

This specification orchestrates the execution of file renames to align the codebase with the canonical naming conventions established in the parent spec.

**Source Specification**: `specs/canonical-naming-conventions/`
**Tool Reference**: `.claude/skills/mcp-refactor-typescript.md`

---

## Goals

1. Rename all 19 table files from camelCase to kebab-case
2. Add `.value.ts` postfix to all 18 value object files
3. Add `.schema.ts` postfix to all 9 schema files (excludes knowledge-server LLM schemas)
4. Rename miscellaneous files (job files, edge cases)
5. Ensure all import paths are updated automatically via MCP tooling
6. Verify no build or type errors after each phase

---

## Phase Overview

| Phase | Scope | File Count | Risk Level | Description |
|-------|-------|------------|------------|-------------|
| P0 | Table files | 19 | Low | camelCase to kebab-case (e.g., `apiKey.table.ts` → `api-key.table.ts`) |
| P1 | Value objects | 18 | Medium | Add `.value.ts` postfix (e.g., `Attributes.ts` → `attributes.value.ts`) |
| P2 | Schema files | 9 | Medium | Add `.schema.ts` postfix (e.g., `member-status.ts` → `member-status.schema.ts`) |
| P3 | Miscellaneous | ~2 | Low | Job files, edge cases, consolidation |

---

## Tool Selection

All file renames use the `mcp-refactor-typescript` MCP tools which:
- Auto-update all import paths across the codebase
- Handle dynamic imports and re-exports
- Support preview mode for verification before applying

**Key Tool**: `mcp__mcp-refactor-typescript__file_operations`

```typescript
// Example: Rename with preview
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/iam/tables/src/tables/apiKey.table.ts",
  name: "api-key.table.ts",
  preview: true  // ALWAYS preview first
})
```

---

## Success Criteria

Phase completion requires ALL of the following:

- [ ] All files in phase renamed
- [ ] All imports updated automatically
- [ ] `bun run check` passes for affected packages
- [ ] No runtime errors in affected code paths
- [ ] REFLECTION_LOG.md updated with phase learnings
- [ ] Handoff documents created for next phase (if applicable)

---

## Verification Commands

```bash
# Verify no remaining camelCase table files
find packages -name "*.table.ts" | xargs basename -a 2>/dev/null | grep -E '[A-Z]'

# Verify all value objects have .value.ts postfix (excludes build/)
find packages -path "*/src/value-objects/*" -name "*.ts" -not -name "index.ts" -not -name "*.value.ts"

# Verify all schemas have .schema.ts postfix (excludes build/ and knowledge-server)
find packages -path "*/src/*/schemas/*" -name "*.ts" -not -name "index.ts" -not -name "*.schema.ts" | grep -v "knowledge/server"

# Verify build passes
bun run check
```

---

## Rollback Strategy

If a phase introduces errors that cannot be resolved:

```bash
# Rollback all uncommitted changes
git checkout -- .

# If committed, reset to previous commit
git reset --hard HEAD~1
```

**Prevention**: Always use `preview: true` before applying renames.

---

## Execution Order

1. **Complete one package before moving to next** - reduces risk of partial migrations
2. **Complete one phase before moving to next** - ensures verification between categories
3. **Run verification after each file** - catch issues early

---

## File Summary

| Category | Total Files | Package Distribution |
|----------|-------------|---------------------|
| Table files | 19 | IAM (13), Documents (2), Knowledge (4) |
| Value objects | 18 | Knowledge (2), Shared (2), IAM (1), Documents (2), Calendar (9), Comms (2) |
| Schema files | 9 | IAM domain (5), Shared domain (4) |
| Miscellaneous | ~2 | Server job files |

---

## Related Documentation

- [Source Spec](../canonical-naming-conventions/) - Naming rules and migration lists
- [MCP Refactor Tool](.claude/skills/mcp-refactor-typescript.md) - Tool documentation
- [Naming Rules Draft](../canonical-naming-conventions/outputs/naming-rules-draft.md) - Complete file lists
- [Implementation Readiness](../canonical-naming-conventions/outputs/implementation-readiness-review.md) - Pre-flight review

## Post-Refactor: CLI Template Update

After completing the refactor, update the `@beep/repo-cli` create-slice templates:

**Location**: `tooling/cli/src/commands/create-slice/`

Templates must be updated to generate files following the new conventions:
- Table files: `kebab-case.table.ts`
- Schema files: `kebab-case.schema.ts`
- Value object files: `kebab-case.value.ts`

This ensures new slices automatically follow the canonical naming conventions.

---

*Status: Ready for Phase 0 execution*
*Complexity: Medium (2-3 sessions)*
*Created: 2026-01-21*
