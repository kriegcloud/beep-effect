# AGENTS.md Inventory Summary

**Date**: 2026-01-18
**Phase**: Agent Config Optimization - Phase 1
**Status**: Discovery Complete

## Executive Summary

This comprehensive inventory analyzed all AGENTS.md files across the beep-effect monorepo to establish a baseline for the agent configuration optimization initiative.

## Key Findings

### Coverage Metrics

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Packages** | 63 | 100% |
| **Packages with AGENTS.md** | 48 | 76% |
| **Packages missing AGENTS.md** | 12 | 19% |
| **Build artifacts (excluded)** | 3 | 5% |

### Quality Metrics

| Metric | Count | Percentage |
|--------|-------|------------|
| **Effect-Compliant Files** | 30 | 63% |
| **Non-Compliant Files** | 18 | 37% |
| **Files with Stale References** | 1 | 2% |
| **Files with MCP Tools** | 0 | 0% |

### Content Metrics

- **Total Lines**: 7,483 lines across 48 files
- **Average File Size**: 156 lines per file
- **Largest File**: apps/todox/AGENTS.md (672 lines)
- **Smallest File**: apps/web/AGENTS.md (56 lines)

## Issue Breakdown

### 1. Stale Package References (CRITICAL)

**Count**: 1 file
**Impact**: High - Confuses AI agents with references to deleted packages

**Affected File**:
- `packages/shared/server/AGENTS.md` (2 references)
  - `@beep/core-db` → Should reference current DB location
  - `@beep/core-env` → Should be `@beep/shared-env`

**Action Required**: Immediate update to prevent incorrect agent guidance

### 2. Missing AGENTS.md Files (HIGH PRIORITY)

**Count**: 12 packages
**Impact**: Medium - New packages lack agent guidance

**Affected Packages**:
- 5× `packages/knowledge/*` (server, tables, domain, ui, client)
- 5× `packages/calendar/*` (server, tables, domain, ui, client)
- 1× `packages/common/wrap`
- 1× `packages/ui/editor`

**Action Required**: Create from template with package-specific details

### 3. Effect Pattern Violations (MEDIUM PRIORITY)

**Count**: 18 files
**Impact**: Medium - Documentation shows anti-patterns

**Common Violations**:
- **Native array methods**: 17 files use `.map()`, `.filter()` instead of Effect utilities
- **Test anti-patterns**: 9 files use `Effect.runPromise` instead of `@beep/testkit`
- **Import violations**: 1 file uses direct imports from 'effect'

**Action Required**: Update code examples to follow `.claude/rules/effect-patterns.md`

## Repository Coverage

### By Category

| Category | Total | With AGENTS.md | Coverage |
|----------|-------|----------------|----------|
| **Apps** | 4 | 4 | 100% |
| **Packages** | 54 | 39 | 72% |
| **Tooling** | 5 | 5 | 100% |

### Compliance by Category

| Category | Compliant | Non-Compliant | Compliance Rate |
|----------|-----------|---------------|-----------------|
| **Apps** | 2 | 2 | 50% |
| **Packages** | 23 | 16 | 59% |
| **Tooling** | 3 | 2 | 60% |

## Top Issues by File

### Files Requiring Most Work

1. **packages/shared/ui/AGENTS.md**
   - 430 lines (largest in packages/)
   - 6 Effect violations (.map() 4×, .filter() 2×)

2. **apps/todox/AGENTS.md**
   - 672 lines (largest overall)
   - 4 Effect violations (.map() 4×)

3. **packages/iam/ui/AGENTS.md**
   - 225 lines
   - 2 Effect violations (.map() 1×, .filter() 1×)

### Files in Good Shape

The following files are fully compliant and can serve as reference examples:

- `packages/iam/client/AGENTS.md` (309 lines, fully compliant)
- `packages/shared/client/AGENTS.md` (314 lines, 2 violations only)
- `packages/runtime/client/AGENTS.md` (144 lines, fully compliant)

## Recommendations

### Phase Sequencing

1. **Phase 2: Fix Stale References** (Immediate)
   - 1 file to update
   - Estimated time: 15 minutes
   - Risk: Low

2. **Phase 3: Create Missing Files** (High Priority)
   - 12 files to create
   - Estimated time: 2-3 hours
   - Risk: Low (template-based)

3. **Phase 4: Fix Pattern Violations** (Medium Priority)
   - 18 files to update
   - Estimated time: 4-6 hours
   - Risk: Medium (requires code review)

### Success Criteria

- [ ] 100% package coverage with AGENTS.md
- [ ] 0 stale package references
- [ ] 100% Effect pattern compliance
- [ ] All cross-references validated

### Automation Opportunities

The following could be automated in future iterations:

1. **Stale reference detection** - Script to validate all `@beep/*` imports exist
2. **Pattern linting** - Custom rules for Effect pattern compliance
3. **Template generation** - Auto-generate AGENTS.md from package.json + code analysis
4. **Cross-reference validation** - Verify all internal links resolve correctly

## Next Steps

1. Review this inventory with the team
2. Proceed to Phase 2: Update stale references
3. Proceed to Phase 3: Create missing AGENTS.md files
4. Proceed to Phase 4: Fix Effect pattern violations
5. Run final verification and validation

## Appendix

### Analysis Scripts

The following scripts were created for this analysis:

- `/scripts/analyze-agents-md.ts` - Comprehensive AGENTS.md analyzer
- `/scripts/find-missing-agents.ts` - Package coverage checker

These scripts can be re-run anytime to verify progress:

```bash
# Run full analysis
bun run scripts/analyze-agents-md.ts

# Check for missing files
bun run scripts/find-missing-agents.ts
```

### Reference Documents

- Full inventory: `specs/agent-config-optimization/outputs/inventory-agents-md.md`
- Template: `.claude/agents/templates/agents-md-template.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Package structure: `documentation/PACKAGE_STRUCTURE.md`
