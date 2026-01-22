# Phase 4 Handoff: Documentation & Cleanup

**From**: P3 (Comprehensive Testing)
**To**: P4 (Documentation & Cleanup)
**Date**: 2026-01-22

---

## Executive Summary

P3 added comprehensive tests. P4 completes the spec by updating documentation, removing dead code, and archiving the parent spec.

---

## Pre-requisites

- **P0 complete**: Next.js apps build successfully
- **P1 complete**: package.json sync working
- **P2 complete**: Handler refactored to < 300 LOC
- **P3 complete**: Test coverage > 80%
- All tests passing

**Verification**:
```bash
bun run build --filter @beep/web
bun run build --filter @beep/todox
bun run repo-cli tsconfig-sync --check
bun run test --filter @beep/repo-cli
```

---

## Tasks

### Task 1: Update `tooling/cli/AGENTS.md`

Add documentation for the `tsconfig-sync` command:

```markdown
## tsconfig-sync Command

### Purpose
Synchronizes TypeScript configuration across the monorepo:
- **Package tsconfig files**: Updates `references` arrays to match `package.json` dependencies
- **Next.js app tsconfig files**: Generates `paths` aliases and `references` for all dependencies
- **package.json ordering**: Sorts dependencies topologically (workspace first, then external alphabetically)

### Usage

\`\`\`bash
# Sync all packages and apps
bun run repo-cli tsconfig-sync

# Check for drift without modifying
bun run repo-cli tsconfig-sync --check

# Preview changes
bun run repo-cli tsconfig-sync --dry-run --verbose

# Sync specific package
bun run repo-cli tsconfig-sync --filter @beep/schema

# Sync only packages (skip Next.js apps)
bun run repo-cli tsconfig-sync --packages-only

# Sync only Next.js apps (skip packages)
bun run repo-cli tsconfig-sync --apps-only
\`\`\`

### Options

| Option | Description |
|--------|-------------|
| `--check` | Validate configs without modifying (exit 1 if drift detected) |
| `--dry-run` | Show what would change without writing |
| `--filter <pkg>` | Only sync the specified package |
| `--verbose` | Show detailed output |
| `--no-hoist` | Skip transitive dependency hoisting |
| `--packages-only` | Only sync packages, skip apps |
| `--apps-only` | Only sync apps, skip packages |

### What Gets Synced

**For packages (`tsconfig.build.json`, `tsconfig.src.json`, `tsconfig.test.json`)**:
- `references` array derived from `package.json` dependencies
- Root-relative paths (`../../../packages/...`)
- Topologically sorted (deps before dependents)

**For Next.js apps (`tsconfig.json`)**:
- `compilerOptions.paths` for all @beep/* dependencies (including transitive)
- `references` array pointing to dependency tsconfig.build.json files
- Self-referential path alias (`@beep/app-name/*` → `./src/*`)

**For package.json** (when enabled):
- Dependencies sorted: workspace packages topological, external alphabetical
- Version specifiers enforced: `workspace:^` for internal, `catalog:` for external
```

### Task 2: Update `CLAUDE.md` Commands Reference

Add to the Commands Reference table:

```markdown
| **Sync** | `bun run repo-cli tsconfig-sync` |
```

### Task 3: Remove TODO Comment

Delete lines 535-536 from `handler.ts`:
```typescript
// TODO: In Phase 3, use mergedDeps to update package.json
void mergeSortedDeps(sortedDeps);
```

This code should now be replaced with actual package.json writing from P1.

### Task 4: Create Final VERIFICATION_REPORT

Create `specs/tsconfig-sync-completion/handoffs/VERIFICATION_REPORT_FINAL.md`:

```markdown
# Final Verification Report: tsconfig-sync-completion

**Date**: [DATE]
**Status**: COMPLETE

## Summary

The tsconfig-sync command is now feature-complete with:
- Next.js transitive dependency path aliases (P0)
- package.json dependency synchronization (P1)
- Modular, testable handler architecture (P2)
- Comprehensive test coverage (P3)
- Updated documentation (P4)

## Verification Results

| Test | Result | Notes |
|------|--------|-------|
| `bun run build --filter @beep/web` | PASS | |
| `bun run build --filter @beep/todox` | PASS | |
| `bun run repo-cli tsconfig-sync --check` | PASS | |
| `bun run test --filter @beep/repo-cli` | PASS | X tests, 0 failures |
| Handler LOC | < 300 | Refactored from 772 LOC |
| Test coverage | > 80% | |

## Files Modified

[List all files modified across all phases]

## Known Limitations

1. Marketing app has no @beep/* dependencies (expected)
2. Upstream type errors in some packages unrelated to tsconfig-sync

## Conclusion

Spec is complete. Parent spec `tsconfig-sync-command` can be archived.
```

### Task 5: Archive Parent Spec

Add to `specs/tsconfig-sync-command/README.md`:

```markdown
---

## Status: ARCHIVED

This spec was completed through Phase 5. Additional completion work is documented in:
- [tsconfig-sync-completion](../tsconfig-sync-completion/README.md)

The command is now feature-complete and production-ready.
```

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| AGENTS.md updated | `tsconfig-sync` command documented |
| CLAUDE.md updated | Commands Reference includes tsconfig-sync |
| TODO removed | No TODO comments in handler.ts |
| VERIFICATION_REPORT created | Final report exists |
| Parent spec archived | README.md marked as archived |
| All tests pass | `bun run test --filter @beep/repo-cli` |

---

## Files to Modify

| File | Change |
|------|--------|
| `tooling/cli/AGENTS.md` | Add tsconfig-sync documentation |
| `CLAUDE.md` | Add to Commands Reference |
| `tooling/cli/src/commands/tsconfig-sync/handler.ts` | Remove TODO comment |
| `specs/tsconfig-sync-completion/handoffs/VERIFICATION_REPORT_FINAL.md` | NEW - create |
| `specs/tsconfig-sync-command/README.md` | Add archived status |
