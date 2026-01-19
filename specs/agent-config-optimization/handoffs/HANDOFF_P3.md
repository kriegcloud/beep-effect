# Phase 3 Handoff: Implementation - Apply Optimizations

**Date**: 2026-01-18
**From**: Phase 2 (Analysis)
**To**: Phase 3 (Implementation)
**Status**: Ready for implementation

---

## Previous Phase Summary

### Phase 2 Results

Phase 2 analyzed all Phase 1 inventories and produced:

| Analysis | Output File | Key Findings |
|----------|-------------|--------------|
| Redundancy | redundancy-report.md | 12 patterns, 3,200-4,500 lines recoverable |
| Bloat | bloat-analysis.md | 47 patterns, 6,200-8,500 lines recoverable |
| Benchmarks | benchmark-analysis.md | Above average vs industry; 28-68% above optimal prompt length |
| Opportunities | improvement-opportunities.md | 43 prioritized items |

### Key Metrics from Phase 2

| Metric | Value |
|--------|-------|
| Total improvement opportunities | 43 |
| CRITICAL priority items | 2 |
| HIGH priority items | 15 |
| MEDIUM priority items | 18 |
| LOW priority items | 8 |
| Estimated line savings | 6,750-9,750 (15-22% reduction) |

---

## Phase 2 Verification (CRITICAL)

Before starting Phase 3, verify Phase 2 outputs exist:

```bash
ls -la specs/agent-config-optimization/outputs/ | grep -E "(redundancy|bloat|benchmark|improvement)"
# Expected: 4 files
```

**If files don't exist, do NOT proceed with Phase 3.**

---

## Objective

Implement the 43 improvement opportunities identified in Phase 2, organized into 4 sub-phases:
- **P3A**: Fix critical issues (stale references)
- **P3B**: Create missing documentation
- **P3C**: Apply compression optimizations
- **P3D**: Update cross-references and templates

---

## Sub-Phase 3A: Critical Fixes (30 minutes)

### OPT-001: Fix Stale Package References

**File**: `packages/shared/server/AGENTS.md`
**Line**: 5
**Issue**: References deleted packages `@beep/core-db` and `@beep/core-env`

**Action**:
1. Read the file
2. Replace `@beep/core-db` with appropriate current reference
3. Replace `@beep/core-env` with `@beep/shared-env`
4. Verify no other stale references exist

**Verification**:
```bash
grep -r "@beep/core-" packages/ | wc -l
# Expected: 0
```

### OPT-002: Handle Stub Documentation

**File**: `.claude/commands/port.md`
**Issue**: 9-line placeholder with no useful content

**Action**: Either expand to useful content or remove entirely.

---

## Sub-Phase 3B: Create Missing Documentation (5-7 hours)

### OPT-003: Create Missing AGENTS.md Files (12 packages)

**Packages**:
- `packages/knowledge/server`
- `packages/knowledge/tables`
- `packages/knowledge/domain`
- `packages/knowledge/ui`
- `packages/knowledge/client`
- `packages/calendar/server`
- `packages/calendar/tables`
- `packages/calendar/domain`
- `packages/calendar/ui`
- `packages/calendar/client`
- `packages/common/wrap`
- `packages/ui/editor`

**Template**: `.claude/agents/templates/agents-md-template.md`

**For each package**:
1. Read `package.json` to get package name and dependencies
2. Analyze `src/` directory structure
3. Generate AGENTS.md from template
4. Verify with `bun run lint`

### OPT-004: Create Missing README.md Files (10 packages)

Same packages as OPT-003 (minus those with existing READMEs).

**Template**: Use domain README pattern from existing packages.

### OPT-028: Complete Required Sections (17 packages)

Add missing sections to existing READMEs per inventory-readme.md gap analysis.

---

## Sub-Phase 3C: Apply Compression Optimizations (20-30 hours)

### Largest File Compression

| OPT ID | File | Current | Target | Action |
|--------|------|---------|--------|--------|
| OPT-005 | test-writer.md | 1,220 | 600-800 | Convert API to tables, reference testkit/README.md |
| OPT-006 | effect-schema-expert.md | 947 | 650-750 | Consolidate patterns into 3 tables |
| OPT-007 | effect-predicate-master.md | 792 | 620-700 | Remove redundant columns |
| OPT-008 | effect-testing-patterns.md | 772 | 520-600 | Keep 1 example per pattern |
| OPT-009 | apps/todox/AGENTS.md | 672 | 450-520 | Reference CLAUDE.md |
| OPT-017 | packages/shared/ui/AGENTS.md | 430 | 280-320 | Convert to tables |

### Pattern Violation Fixes

| OPT ID | Scope | Count | Action |
|--------|-------|-------|--------|
| OPT-011 | AGENTS.md Effect violations | 18 files | Replace native methods with Effect utilities |
| OPT-012 | README.md Effect violations | 31 files | Update examples to follow effect-patterns.md |

### Redundancy Removal

| OPT ID | Pattern | Files | Action |
|--------|---------|-------|--------|
| OPT-010 | Redundant import blocks | 5 files | Reference effect-imports.md |
| OPT-015 | Excessive examples | 9 files | Keep 1 canonical example |
| OPT-016 | Redundant skills | 2 files | Merge into effect-patterns.md |

---

## Sub-Phase 3D: Update Cross-References (10-14 hours)

### Template Creation

| OPT ID | Template | Purpose |
|--------|----------|---------|
| OPT-018 | domain-agents-md.template | Standardize 14 domain AGENTS.md |
| OPT-019 | domain-readme.template | Standardize 14 domain README.md |

### Section Deduplication

| OPT ID | Section | Files | Action |
|--------|---------|-------|--------|
| OPT-013 | Verifications | 48 AGENTS.md | Create shared template |
| OPT-014 | Effect patterns | Multiple | Reference effect-patterns.md |
| OPT-020 | Authoring guardrails | 14 domain | Create shared template |
| OPT-021 | Contributor checklists | 14 domain | Create shared template |
| OPT-022 | Installation instructions | 49 README.md | Create MONOREPO_INSTALL_TEMPLATE.md |
| OPT-025 | CLAUDE.md context | 5 files | Replace with reference links |

### Metadata Addition

| OPT ID | Field | Files | Purpose |
|--------|-------|-------|---------|
| OPT-026 | version | 22 agents | Track staleness |
| OPT-027 | depends_on | 22 agents | Document relationships |

---

## Success Criteria

### Quantitative

| Metric | Current | Target | Verification |
|--------|---------|--------|--------------|
| Total lines | 44,181 | 34,000-37,000 | `wc -l` |
| Stale references | 2 | 0 | `grep @beep/core` |
| AGENTS.md coverage | 76% | 100% | Script |
| Effect compliance | 63% | 100% | Pattern check |
| Avg agent length | 320 lines | 200-250 lines | `wc -l` |

### Qualitative

- [ ] All AGENTS.md files have consistent structure
- [ ] All README.md files have required sections
- [ ] No duplicate Effect pattern explanations
- [ ] Cross-references resolve correctly
- [ ] Templates created and documented

---

## Verification Commands

```bash
# After Sub-Phase 3A
grep -r "@beep/core-" packages/  # Should return 0 results

# After Sub-Phase 3B
ls packages/knowledge/*/AGENTS.md packages/calendar/*/AGENTS.md | wc -l
# Expected: 10

# After Sub-Phase 3C
wc -l .claude/agents/test-writer.md
# Expected: 600-800

# After Sub-Phase 3D
grep -c "See .claude/rules/effect-patterns.md" packages/*/AGENTS.md | grep -v ":0" | wc -l
# Expected: 20+
```

---

## Risk Assessment

### Low Risk (P3A, P3B)
- Fixing stale references: Simple find-replace
- Creating missing files: Template-based, low chance of error

### Medium Risk (P3C)
- Compression: Ensure no information lost
- Pattern fixes: Verify examples still work

### High Risk (P3D)
- Template extraction: Ensure all packages can use template
- Cross-reference updates: Ensure all links resolve

---

## Phase 3 Outputs

| Output | Description |
|--------|-------------|
| Fixed files | All OPT items implemented |
| Templates | domain-agents-md.template, domain-readme.template |
| Shared files | verification-commands.md, guardrails.md, etc. |
| Metrics report | Before/after line counts |

---

## Next Phase

After Phase 3 completion, proceed to Phase 4: Validation.

Phase 4 will:
1. Run comprehensive validation checks
2. Verify all cross-references
3. Confirm line count reduction targets met
4. Update REFLECTION_LOG.md with final metrics

---

## Related Documentation

- [README.md](../README.md) - Spec overview
- [MASTER_ORCHESTRATION.md](../MASTER_ORCHESTRATION.md) - Full workflow
- [REFLECTION_LOG.md](../REFLECTION_LOG.md) - Methodology learnings
- Phase 2 Outputs:
  - `outputs/redundancy-report.md`
  - `outputs/bloat-analysis.md`
  - `outputs/benchmark-analysis.md`
  - `outputs/improvement-opportunities.md`
