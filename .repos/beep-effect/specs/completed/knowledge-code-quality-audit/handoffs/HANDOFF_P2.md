# Phase 2 Handoff: Synthesis

**Date**: 2026-01-22
**From**: Phase 1 (Violation Inventory)
**To**: Phase 2 (Synthesis & Prioritization)
**Status**: Ready for execution

---

## Context for Phase 2

### Working Context (Critical)

**Mission**: Synthesize 18 violation reports into a prioritized remediation plan.

**Success Criteria**:
- [ ] Master violations document created (`outputs/MASTER_VIOLATIONS.md`)
- [ ] Violations deduplicated and cross-referenced
- [ ] Dependency graph established (which fixes must come first)
- [ ] Prioritized fix order by severity and impact
- [ ] Estimated effort per category

**Blocking Issues**: None - all 18 reports completed successfully.

### Episodic Context

**Phase 1 Results**:
- 18 agents deployed in parallel
- ~240 violations identified across 18 categories
- 3 Critical, ~60 High, ~150 Medium, ~30 Low/Info severity
- 4 hotspot files contain ~60% of violations

**Key Decision**: Fix duplicate code (V02) first to avoid repetitive fixes, then critical (V06), then by file hotspot.

### Semantic Context

**Violation Categories by Severity**:

| Severity | Categories |
|----------|------------|
| Critical | V06 (Native Error) |
| High | V01 (EntityId Tables), V04 (Error Construction), V10 (Array.map), V14 (EntityId Creation) |
| Medium | V02, V03, V05, V07, V08, V09, V11, V12, V13, V16, V18 |
| Low/Info | V15, V17 |

**Hotspot Files** (fix these for maximum impact):
1. `CanonicalSelector.ts` - V06, V07, V08, V11
2. `EntityClusterer.ts` - V09, V10, V12, V13
3. `SameAsLinker.ts` - V09, V11, V12, V14
4. `EmbeddingService.ts` - V03, V04, V11, V14

### Procedural Context (Links)

- Violation reports: `specs/knowledge-code-quality-audit/outputs/violations/V*.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Reflection log: `specs/knowledge-code-quality-audit/REFLECTION_LOG.md`
- Output location: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`

---

## Synthesis Tasks

### Task 1: Create Master Violations Document

Consolidate all 18 reports into a single `MASTER_VIOLATIONS.md` with:

1. **Executive Summary**: Total counts, severity distribution, hotspot files
2. **Violation Index**: Quick-reference table with links to detailed sections
3. **By-File View**: All violations grouped by file for efficient remediation
4. **Dependency Graph**: Which fixes must precede others

### Task 2: Identify Dependencies

Known dependencies:
- V02 (duplicate code) → V03, V15 (string methods) - fix duplication before string methods
- V12 (native Map) → V11 (non-null assertions) - Map.get()! patterns require Map fix first
- V09 (native Set) → V11 (non-null assertions) - Set patterns affect assertion patterns

### Task 3: Estimate Effort

| Category | Complexity | Estimated Fixes |
|----------|------------|-----------------|
| Simple (search-replace) | V15, V18 | ~25 |
| Moderate (logic change) | V03, V05, V08, V10, V13 | ~70 |
| Complex (refactor) | V06, V07, V09, V11, V12, V14 | ~80 |
| Infrastructure (new types) | V01, V02, V04 | ~30 |

### Task 4: Create Remediation Phases

Proposed order:
1. **Phase 3a**: V02 (extract duplicates), V06 (critical errors) - Foundation
2. **Phase 3b**: V01, V04, V14 - Type safety infrastructure
3. **Phase 3c**: V09, V12 - Data structure migrations (Set, Map)
4. **Phase 3d**: V03, V05, V10, V11, V13, V15 - Method replacements
5. **Phase 3e**: V07, V08, V16, V18 - Pattern modernization
6. **Phase 3f**: V17 - Chunk candidates (optional, performance-driven)

---

## Quality Gates

After synthesis:
1. **Completeness**: All 240 violations accounted for
2. **No Orphans**: Every violation has a remediation phase assignment
3. **Dependency Validity**: No circular dependencies in fix order
4. **Effort Sanity**: Total estimate aligns with violation count

---

## Next Phase Preparation

After Phase 2 completes:
1. Update `REFLECTION_LOG.md` with synthesis learnings
2. Create `HANDOFF_P3.md` for remediation phase
3. Create `P3_ORCHESTRATOR_PROMPT.md` for remediation execution
