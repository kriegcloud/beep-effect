# Phase 3 Handoff: Exhaustive Verification

**Date**: 2026-01-22
**From**: P2 Implementation Session
**To**: P3 Verification Orchestrator
**Status**: Ready for Verification

---

## Context Summary

### What Was Completed in P2

1. **Root-relative path generation** (spec L85-117)
   - Fixed handler to use `buildRootRelativePath` with repo-relative paths
   - Paths now correctly generate as `../../../packages/common/types/tsconfig.build.json`

2. **Topological sorting of references** (spec L119-136)
   - Added `topologicalSort` call to sort dependencies before dependents
   - Updated `computeReferenceDiff` to detect order mismatches

3. **File writing utilities**
   - `tsconfig-writer.ts` - reads/writes tsconfig references with jsonc-parser
   - Order-aware diff detection for topological sorting enforcement

### Known Issues Discovered

During P2 testing, the following issues were identified but NOT fully resolved:

1. **Topological sort order appears incorrect**
   - Current output for @beep/constants shows testkit before types/utils
   - Expected: leaf packages first, then dependents
   - Root cause: Likely issue in subset adjacency list construction or sort algorithm

2. **Not all packages were tested**
   - Only partial testing of `packages/common/*` packages
   - Full repo verification not completed

---

## P3 Objective

Execute exhaustive verification of `tsconfig-sync` command across ALL workspace packages (excluding apps & tooling) to:

1. Verify spec compliance for each package
2. Identify and document ALL bugs/issues
3. Create targeted fix handoffs for each issue category

---

## Verification Protocol

### Step 1: Package Enumeration

Get packages in topological order (deps first):

```bash
bun run repo-cli topo-sort 2>&1 | grep -E "^@beep/" | grep -v -E "^@beep/(web|mail|server$|repo-cli|tooling)"
```

### Step 2: For Each Package

Execute verification sequence:

```bash
# 1. Save original state
PKG="@beep/package-name"
PKG_DIR=$(bun run repo-cli topo-sort --paths 2>&1 | grep "$PKG" | cut -d: -f2)
cp "$PKG_DIR/tsconfig.build.json" "/tmp/original-tsconfig.json"
cp "$PKG_DIR/package.json" "/tmp/original-package.json"

# 2. Run tsconfig-sync
bun run repo-cli tsconfig-sync --filter "$PKG" --verbose

# 3. Capture new state
cp "$PKG_DIR/tsconfig.build.json" "/tmp/new-tsconfig.json"

# 4. Compare against spec requirements
```

### Step 3: Spec Compliance Checklist

For each package, verify:

| Requirement | Spec Reference | Check |
|-------------|----------------|-------|
| Root-relative paths | L85-117 | Paths match `../../../packages/...` format |
| Topological order | L119-136 | Deps appear before dependents in references |
| All workspace deps included | L169 | Every `@beep/*` dep has a reference |
| Transitive deps hoisted | L177-179 | Recursive peer deps included |
| No circular deps | L171 | No cycles in package graph |

### Step 4: Issue Documentation

For each issue found, document:

```markdown
## Issue: [Short Description]

**Package**: @beep/affected-package
**Spec Violation**: [Reference to spec line]
**Expected**: [What spec says should happen]
**Actual**: [What actually happened]
**Evidence**: [Command output or file diff]
**Severity**: Critical | High | Medium | Low
```

---

## Packages to Verify

Execute in this order (topological - deps first):

### Common Layer (Leaf Packages)
1. `@beep/types` - No deps expected
2. `@beep/invariant` - No deps expected
3. `@beep/identity` - Deps: types
4. `@beep/utils` - Deps: invariant, identity, types
5. `@beep/schema` - Deps: types, identity, invariant, utils
6. `@beep/constants` - Deps: schema, invariant, types
7. `@beep/errors` - Deps: various
8. `@beep/wrap` - Deps: various

### Shared Layer
9. `@beep/shared-domain` - Core domain models
10. `@beep/shared-env` - Environment config
11. `@beep/shared-tables` - Database schemas
12. `@beep/shared-server` - Server utilities
13. `@beep/shared-client` - Client utilities
14. `@beep/shared-ai` - AI utilities

### Domain Packages (per slice)
15. `@beep/iam-domain`
16. `@beep/iam-tables`
17. `@beep/iam-server`

18. `@beep/documents-domain`
19. `@beep/documents-tables`
20. `@beep/documents-server`

21. `@beep/calendar-domain`
22. `@beep/calendar-tables`
23. `@beep/calendar-server`
24. `@beep/calendar-client`
25. `@beep/calendar-ui`

26. `@beep/comms-domain`
27. `@beep/comms-tables`
28. `@beep/comms-server`
29. `@beep/comms-client`
30. `@beep/comms-ui`

31. `@beep/customization-domain`
32. `@beep/customization-tables`
33. `@beep/customization-server`
34. `@beep/customization-client`
35. `@beep/customization-ui`

36. `@beep/knowledge-domain`
37. `@beep/knowledge-tables`
38. `@beep/knowledge-server`
39. `@beep/knowledge-client`
40. `@beep/knowledge-ui`

### UI Layer
41. `@beep/ui-core`
42. `@beep/ui`
43. `@beep/ui-editor`

### Runtime
44. `@beep/runtime-client`

---

## Expected Outputs

### 1. Verification Report

Create `VERIFICATION_REPORT_P3.md` with:

- Summary of packages tested
- Pass/fail status per package
- Categorized issues found
- Recommended fixes

### 2. Issue Handoffs (if needed)

For each issue category, create:

- `FIX_TOPOLOGICAL_SORT.md` - If sorting is broken
- `FIX_PATH_CALCULATION.md` - If paths are wrong
- `FIX_TRANSITIVE_HOISTING.md` - If hoisting fails
- `FIX_REFERENCE_DETECTION.md` - If deps are missed

### 3. Updated Success Criteria

Mark off completed items in `README.md#Success Criteria`

---

## Commands Reference

```bash
# Full repo sync (for final verification)
bun run repo-cli tsconfig-sync

# Check mode (CI validation)
bun run repo-cli tsconfig-sync --check

# Single package with verbose
bun run repo-cli tsconfig-sync --filter @beep/schema --verbose

# Dry-run preview
bun run repo-cli tsconfig-sync --dry-run

# Without transitive hoisting
bun run repo-cli tsconfig-sync --no-hoist
```

---

## Key Files

| File | Purpose |
|------|---------|
| `tooling/cli/src/commands/tsconfig-sync/handler.ts` | Main orchestration |
| `tooling/cli/src/commands/tsconfig-sync/utils/tsconfig-writer.ts` | File I/O |
| `tooling/utils/src/repo/Graph.ts` | Topological sort |
| `tooling/utils/src/repo/Paths.ts` | Path calculation |
| `specs/tsconfig-sync-command/README.md` | Spec requirements |

---

## Definition of Done

P3 is complete when:

- [ ] All 44+ packages verified
- [ ] All issues documented with handoffs
- [ ] Zero spec violations remain (or documented as intentional)
- [ ] `--check` mode passes for full repo
- [ ] Success criteria in README.md updated
