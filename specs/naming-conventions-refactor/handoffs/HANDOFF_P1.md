# Phase 1 Handoff: Value Object Renames

**Date**: 2026-01-21
**From**: Phase 0 (Table File Renames)
**To**: Phase 1 (Value Object Renames)
**Status**: Pending Phase 0 completion

---

## Phase 1 Summary

Add `.value.ts` postfix to all 18 value object files across 6 packages.

### Key Context

- Value objects are domain primitives (types, enums, branded types)
- Located in `*/value-objects/` directories
- Current state: no consistent postfix (e.g., `Attributes.ts`, `paths.ts`)
- Target state: `.value.ts` postfix with kebab-case (e.g., `attributes.value.ts`)

---

## Files to Rename (18 total)

### Package: @beep/knowledge-domain (2 files)

Located in `packages/knowledge/domain/src/value-objects/`:

| Current Name | Target Name | Status |
|--------------|-------------|--------|
| `Attributes.ts` | `attributes.value.ts` | Pending |
| `EvidenceSpan.ts` | `evidence-span.value.ts` | Pending |

### Package: @beep/shared-domain (2 files)

Located in `packages/shared/domain/src/value-objects/`:

| Current Name | Target Name | Status |
|--------------|-------------|--------|
| `EntitySource.ts` | `entity-source.value.ts` | Pending |
| `paths.ts` | `paths.value.ts` | Pending |

### Package: @beep/iam-domain (1 file)

Located in `packages/iam/domain/src/value-objects/`:

| Current Name | Target Name | Status |
|--------------|-------------|--------|
| `paths.ts` | `paths.value.ts` | Pending |

### Package: @beep/documents-domain (2 files)

Located in `packages/documents/domain/src/value-objects/`:

| Current Name | Target Name | Status |
|--------------|-------------|--------|
| `LinkType.ts` | `link-type.value.ts` | Pending |
| `TextStyle.ts` | `text-style.value.ts` | Pending |

### Package: @beep/calendar-domain (9 files)

Located in `packages/calendar/domain/src/value-objects/`:

| Current Name | Target Name | Status |
|--------------|-------------|--------|
| `calendar-color-option.ts` | `calendar-color-option.value.ts` | Pending |
| `time-grid-view.ts` | `time-grid-view.value.ts` | Pending |
| `calendar-event.ts` | `calendar-event.value.ts` | Pending |
| `calendar-view.ts` | `calendar-view.value.ts` | Pending |
| `day-grid-view.ts` | `day-grid-view.value.ts` | Pending |
| `calendar-filter.ts` | `calendar-filter.value.ts` | Pending |
| `list-view.ts` | `list-view.value.ts` | Pending |
| `date-picker-control.ts` | `date-picker-control.value.ts` | Pending |
| `calendar-range.ts` | `calendar-range.value.ts` | Pending |

### Package: @beep/comms-domain (2 files - consolidation)

Located in `packages/comms/domain/src/value-objects/`:

| Current Name | Target Name | Notes |
|--------------|-------------|-------|
| `mail.values.ts` | `mail.value.ts` | Plural → singular |
| `logging.values.ts` | `logging.value.ts` | Plural → singular |

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
   - `index.ts` barrel exports in the value-objects directory
   - Any cross-file imports within the same directory
   - Root-level `src/index.ts` if it re-exports value objects directly
3. Run `bun run check` to catch missed imports

---

## Implementation Order

Complete one package at a time:

1. **@beep/knowledge-domain** (2 files)
2. **@beep/shared-domain** (2 files)
3. **@beep/iam-domain** (1 file)
4. **@beep/documents-domain** (2 files)
5. **@beep/calendar-domain** (9 files)
6. **@beep/comms-domain** (2 files)

---

## Tool Usage Pattern

```typescript
// PascalCase → kebab-case.value.ts
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/knowledge/domain/src/value-objects/Attributes.ts",
  name: "attributes.value.ts",
  preview: true
})

// Already kebab-case → add postfix
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/calendar/domain/src/value-objects/calendar-view.ts",
  name: "calendar-view.value.ts",
  preview: true
})

// Plural → singular (consolidation)
mcp__mcp-refactor-typescript__file_operations({
  operation: "rename_file",
  sourcePath: "packages/comms/domain/src/value-objects/mail.values.ts",
  name: "mail.value.ts",
  preview: true
})
```

---

## Verification Steps

After completing each package:

```bash
# Check specific package
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/shared-domain
bun run check --filter @beep/iam-domain
bun run check --filter @beep/documents-domain
bun run check --filter @beep/calendar-domain
bun run check --filter @beep/comms-domain

# After all packages - verify no source files missing .value.ts (excludes build/)
find packages -path "*/src/value-objects/*" -name "*.ts" -not -name "index.ts" -not -name "*.value.ts"
# Expected: no output (all have .value.ts postfix)
```

---

## Known Issues & Gotchas

1. **Casing changes**: Some files change from PascalCase to kebab-case (e.g., `Attributes.ts` → `attributes.value.ts`). This is intentional per naming conventions.

2. **Plural to singular**: Comms domain files use `.values.ts` (plural) which should become `.value.ts` (singular).

3. **Index files**: Each value-objects directory has an `index.ts` barrel export that will need its import paths updated.

4. **Cross-package imports**: UI components or services may import these value objects.

---

## Success Criteria

Phase 1 is complete when:

- [ ] All 18 value object files renamed with `.value.ts` postfix
- [ ] All import paths updated automatically
- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] `bun run check --filter @beep/shared-domain` passes
- [ ] `bun run check --filter @beep/iam-domain` passes
- [ ] `bun run check --filter @beep/documents-domain` passes
- [ ] `bun run check --filter @beep/calendar-domain` passes
- [ ] `bun run check --filter @beep/comms-domain` passes
- [ ] Verification command returns no files without `.value.ts` postfix
- [ ] REFLECTION_LOG.md updated with Phase 1 learnings
- [ ] HANDOFF_P2.md reviewed and ready

---

## Next Phase

After completing Phase 1, proceed to Phase 2: Schema File Renames.

See: `handoffs/HANDOFF_P2.md`
