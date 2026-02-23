# Improvement Opportunities: Prioritized Action List

**Date**: 2026-01-18
**Phase**: Agent Config Optimization - Phase 2
**Sources**: Redundancy Report, Bloat Analysis, Benchmark Analysis, Phase 1 Inventories

---

## Executive Summary

This document synthesizes all Phase 2 analyses into a prioritized list of **43 improvement opportunities** across 4 priority tiers, with estimated impact and implementation phases.

### Impact Summary

| Priority | Count | Line Savings | Effort | Phase |
|----------|-------|--------------|--------|-------|
| CRITICAL | 2 | 50 lines | 30 min | P3A |
| HIGH | 15 | 4,200-5,800 | 16-24 hrs | P3B-P3C |
| MEDIUM | 18 | 2,100-3,200 | 12-18 hrs | P3C-P3D |
| LOW | 8 | 400-700 | 6-8 hrs | P3D |
| **Total** | **43** | **6,750-9,750** | **34-50 hrs** | |

---

## CRITICAL Priority (Immediate Action Required)

### OPT-001: Fix Stale Package References

| Field | Value |
|-------|-------|
| **Description** | `packages/shared/server/AGENTS.md` references deleted packages |
| **Files Affected** | 1 file |
| **Specific Issues** | `@beep/core-db` (deleted), `@beep/core-env` (should be `@beep/shared-env`) |
| **Line** | Line 5 |
| **Impact** | Prevents AI agent confusion; ensures correct guidance |
| **Effort** | LOW (15 min) |
| **Phase** | P3A |
| **Action** | Replace references with current package names |

### OPT-002: Remove Stub Documentation

| Field | Value |
|-------|-------|
| **Description** | `.claude/commands/port.md` is a 9-line placeholder with no useful content |
| **Files Affected** | 1 file |
| **Impact** | Clean up configuration clutter |
| **Effort** | LOW (15 min) |
| **Phase** | P3A |
| **Action** | Either expand to useful content or remove entirely |

---

## HIGH Priority (Core Optimization)

### OPT-003: Create Missing AGENTS.md Files (12 packages)

| Field | Value |
|-------|-------|
| **Description** | 12 packages lack AGENTS.md, representing a 19% gap |
| **Files Affected** | 12 new files needed |
| **Specific Packages** | `knowledge/*` (5), `calendar/*` (5), `common/wrap`, `ui/editor` |
| **Impact** | 100% AGENTS.md coverage for improved AI agent guidance |
| **Effort** | HIGH (3-4 hrs) |
| **Phase** | P3B |
| **Action** | Generate from `.claude/agents/templates/agents-md-template.md` |

### OPT-004: Create Missing README.md Files (10 packages)

| Field | Value |
|-------|-------|
| **Description** | 10 packages lack README.md documentation |
| **Files Affected** | 10 new files needed |
| **Specific Packages** | `calendar/*` (5), `knowledge/client,server,tables,ui`, `ui/editor` |
| **Impact** | Complete documentation coverage |
| **Effort** | HIGH (2-3 hrs) |
| **Phase** | P3B |
| **Action** | Generate from domain README template |

### OPT-005: Compress test-writer.md (Largest Agent)

| Field | Value |
|-------|-------|
| **Description** | 1,220 lines - 52-144% above recommended max |
| **Files Affected** | `.claude/agents/test-writer.md` |
| **Current Lines** | 1,220 |
| **Target Lines** | 600-800 |
| **Impact** | 420-620 line reduction (-35-51%) |
| **Effort** | HIGH (3-4 hrs) |
| **Phase** | P3C |
| **Action** | Convert API reference to tables, reference testkit/README.md |

### OPT-006: Compress effect-schema-expert.md

| Field | Value |
|-------|-------|
| **Description** | 947 lines with verbose pattern catalog |
| **Files Affected** | `.claude/agents/effect-schema-expert.md` |
| **Current Lines** | 947 |
| **Target Lines** | 650-750 |
| **Impact** | 200-300 line reduction (-21-31%) |
| **Effort** | MEDIUM (2-3 hrs) |
| **Phase** | P3C |
| **Action** | Consolidate schema patterns into 3 tables |

### OPT-007: Compress effect-predicate-master.md

| Field | Value |
|-------|-------|
| **Description** | 792 lines with redundant tables |
| **Files Affected** | `.claude/agents/effect-predicate-master.md` |
| **Current Lines** | 792 |
| **Target Lines** | 620-700 |
| **Impact** | 90-170 line reduction |
| **Effort** | MEDIUM (1-2 hrs) |
| **Phase** | P3C |
| **Action** | Remove redundant columns, consolidate examples |

### OPT-008: Compress effect-testing-patterns.md

| Field | Value |
|-------|-------|
| **Description** | 772 lines with excessive TestClock examples |
| **Files Affected** | `.claude/commands/patterns/effect-testing-patterns.md` |
| **Current Lines** | 772 |
| **Target Lines** | 520-600 |
| **Impact** | 170-250 line reduction |
| **Effort** | MEDIUM (2-3 hrs) |
| **Phase** | P3C |
| **Action** | Keep 1 canonical example per pattern |

### OPT-009: Compress apps/todox/AGENTS.md

| Field | Value |
|-------|-------|
| **Description** | 672 lines - largest AGENTS.md |
| **Files Affected** | `apps/todox/AGENTS.md` |
| **Current Lines** | 672 |
| **Target Lines** | 450-520 |
| **Impact** | 150-220 line reduction |
| **Effort** | MEDIUM (2 hrs) |
| **Phase** | P3C |
| **Action** | Reference CLAUDE.md, remove redundant context |

### OPT-010: Remove Redundant Import Blocks

| Field | Value |
|-------|-------|
| **Description** | Import conventions repeated in 5 agent files |
| **Files Affected** | test-writer.md, effect-testing-patterns.md, effect-schema-expert.md, effect-predicate-master.md, code-observability-writer.md |
| **Impact** | 133-180 line reduction |
| **Effort** | LOW (1 hr) |
| **Phase** | P3C |
| **Action** | Reference `.claude/skills/effect-imports.md` |

### OPT-011: Fix Effect Pattern Violations (18 AGENTS.md)

| Field | Value |
|-------|-------|
| **Description** | 18 files contain code examples with native methods |
| **Files Affected** | See inventory-agents-md.md for full list |
| **Violations** | .map() (17x), .filter() (8x), Effect.runPromise (9x) |
| **Impact** | Pattern compliance 63% → 100% |
| **Effort** | MEDIUM (3-4 hrs) |
| **Phase** | P3C |
| **Action** | Replace native methods with Effect utilities |

### OPT-012: Fix Effect Pattern Violations (31 README.md)

| Field | Value |
|-------|-------|
| **Description** | 31 files contain code examples with native methods |
| **Files Affected** | See inventory-readme.md for full list |
| **Violations** | Native methods, async/await, missing Effect imports |
| **Impact** | Pattern compliance 35% → 100% |
| **Effort** | MEDIUM (4-5 hrs) |
| **Phase** | P3C |
| **Action** | Update examples to follow effect-patterns.md |

### OPT-013: Deduplicate Verifications Sections

| Field | Value |
|-------|-------|
| **Description** | Identical 6-8 line block in 48 AGENTS.md files |
| **Files Affected** | All 48 AGENTS.md |
| **Impact** | 288-384 line reduction |
| **Effort** | MEDIUM (2 hrs) |
| **Phase** | P3D |
| **Action** | Create `.claude/shared/verification-commands.md`, reference from all |

### OPT-014: Remove Redundant Effect Pattern Sections

| Field | Value |
|-------|-------|
| **Description** | Effect patterns re-explained in AGENTS.md files |
| **Files Affected** | packages/shared/ui, packages/iam/ui, others |
| **Impact** | 300-500 line reduction |
| **Effort** | MEDIUM (2 hrs) |
| **Phase** | P3D |
| **Action** | Replace with reference to .claude/rules/effect-patterns.md |

### OPT-015: Consolidate Excessive Examples (9 files)

| Field | Value |
|-------|-------|
| **Description** | Multiple redundant examples showing same concept |
| **Files Affected** | test-writer.md, effect-schema-expert.md, effect-testing-patterns.md, others |
| **Impact** | 1,044-1,350 line reduction |
| **Effort** | HIGH (4-5 hrs) |
| **Phase** | P3C |
| **Action** | Keep 1 canonical example per pattern, reference docs |

### OPT-016: Merge Redundant Skills

| Field | Value |
|-------|-------|
| **Description** | effect-check.md and forbidden-patterns.md overlap with effect-patterns.md |
| **Files Affected** | `.claude/skills/effect-check.md`, `.claude/skills/forbidden-patterns.md` |
| **Impact** | 432 line reduction |
| **Effort** | MEDIUM (1-2 hrs) |
| **Phase** | P3C |
| **Action** | Merge into effect-patterns.md rule, remove redundant files |

### OPT-017: Compress packages/shared/ui/AGENTS.md

| Field | Value |
|-------|-------|
| **Description** | 430 lines - largest in packages/ |
| **Files Affected** | `packages/shared/ui/AGENTS.md` |
| **Current Lines** | 430 |
| **Target Lines** | 280-320 |
| **Impact** | 110-150 line reduction |
| **Effort** | MEDIUM (2 hrs) |
| **Phase** | P3C |
| **Action** | Convert component list to table, remove verbose prose |

---

## MEDIUM Priority (Quality Improvements)

### OPT-018: Create Domain AGENTS.md Template

| Field | Value |
|-------|-------|
| **Description** | 14 domain AGENTS.md files share 60-80% identical structure |
| **Impact** | Future maintenance reduction |
| **Effort** | MEDIUM (2 hrs) |
| **Phase** | P3D |
| **Action** | Create `.claude/templates/domain-agents-md.template` |

### OPT-019: Create Domain README.md Template

| Field | Value |
|-------|-------|
| **Description** | 14 domain README.md files share 65-75% identical structure |
| **Impact** | Future maintenance reduction |
| **Effort** | MEDIUM (2 hrs) |
| **Phase** | P3D |
| **Action** | Create template with placeholder tokens |

### OPT-020: Deduplicate Authoring Guardrails

| Field | Value |
|-------|-------|
| **Description** | 14 domain AGENTS.md files repeat same guardrails |
| **Files Affected** | packages/*/domain/AGENTS.md |
| **Impact** | 168-224 line reduction |
| **Effort** | LOW (1 hr) |
| **Phase** | P3D |
| **Action** | Create shared guardrails template |

### OPT-021: Deduplicate Contributor Checklists

| Field | Value |
|-------|-------|
| **Description** | 14 domain AGENTS.md files repeat contributor checklist |
| **Impact** | 84-112 line reduction |
| **Effort** | LOW (1 hr) |
| **Phase** | P3D |
| **Action** | Create shared checklist template |

### OPT-022: Deduplicate Installation Instructions

| Field | Value |
|-------|-------|
| **Description** | 49 README.md files repeat identical 4-6 line installation section |
| **Impact** | 196-294 line reduction |
| **Effort** | LOW (1 hr) |
| **Phase** | P3D |
| **Action** | Create MONOREPO_INSTALL_TEMPLATE.md |

### OPT-023: Deduplicate Module Structure Diagrams

| Field | Value |
|-------|-------|
| **Description** | Domain README files repeat identical tree structure |
| **Impact** | 210-280 line reduction |
| **Effort** | LOW (1 hr) |
| **Phase** | P3D |
| **Action** | Create module structure template |

### OPT-024: Deduplicate Security Sections

| Field | Value |
|-------|-------|
| **Description** | IAM, Comms, Documents domain files repeat security guidance |
| **Impact** | 160-240 line reduction |
| **Effort** | LOW (1 hr) |
| **Phase** | P3D |
| **Action** | Create domain-security.md template |

### OPT-025: Remove CLAUDE.md Context Duplication

| Field | Value |
|-------|-------|
| **Description** | 5 files re-explain project architecture |
| **Files Affected** | apps/todox, packages/shared/ui, architecture-pattern-enforcer, effect-testing-patterns |
| **Impact** | 570-770 line reduction |
| **Effort** | MEDIUM (2 hrs) |
| **Phase** | P3D |
| **Action** | Replace with reference links to CLAUDE.md |

### OPT-026: Add Version Metadata to Agents

| Field | Value |
|-------|-------|
| **Description** | Industry best practice for tracking staleness |
| **Files Affected** | 22 agent files |
| **Impact** | Improved maintenance tracking |
| **Effort** | LOW (1 hr) |
| **Phase** | P3D |
| **Action** | Add `version` field to frontmatter |

### OPT-027: Add Dependency Documentation

| Field | Value |
|-------|-------|
| **Description** | Cross-agent dependencies not documented |
| **Impact** | Improved orchestration understanding |
| **Effort** | MEDIUM (2 hrs) |
| **Phase** | P3D |
| **Action** | Add `depends_on` field to agent frontmatter |

### OPT-028: Complete AGENTS.md Required Sections

| Field | Value |
|-------|-------|
| **Description** | 17 README files missing required sections |
| **Files Affected** | Various - see inventory-readme.md |
| **Missing Sections** | Installation, Usage, Key Exports, Dependencies |
| **Effort** | MEDIUM (3-4 hrs) |
| **Phase** | P3B |
| **Action** | Add missing sections from template |

### OPT-029-035: Compress Verbose Files (7 additional agents)

| ID | File | Current | Target | Savings |
|----|------|---------|--------|---------|
| OPT-029 | code-observability-writer.md | 404 | 280-320 | 85-125 |
| OPT-030 | architecture-pattern-enforcer.md | 548 | 380-440 | 110-170 |
| OPT-031 | jsdoc-fixer.md | 587 | 400-450 | 135-185 |
| OPT-032 | spec-reviewer.md | 675 | 450-520 | 155-225 |
| OPT-033 | doc-writer.md | 505 | 350-400 | 105-155 |
| OPT-034 | code-reviewer.md | 458 | 320-360 | 100-140 |
| OPT-035 | packages/iam/client/AGENTS.md | 309 | 220-250 | 60-90 |

---

## LOW Priority (Nice to Have)

### OPT-036: Add Anti-patterns Section to Agents

| Field | Value |
|-------|-------|
| **Description** | Industry best practice not currently implemented |
| **Impact** | Reduced errors, clearer guidance |
| **Effort** | LOW (3-4 hrs total) |
| **Phase** | P3D |
| **Action** | Add to all 22 agent files |

### OPT-037: Standardize Example Format

| Field | Value |
|-------|-------|
| **Description** | Example formats vary across files |
| **Impact** | Improved consistency |
| **Effort** | LOW (2 hrs) |
| **Phase** | P3D |
| **Action** | Create standard format, apply to all |

### OPT-038: Add Last Updated Metadata

| Field | Value |
|-------|-------|
| **Description** | Track documentation staleness |
| **Impact** | Maintenance visibility |
| **Effort** | LOW (1 hr) |
| **Phase** | P3D |
| **Action** | Add date field to frontmatter |

### OPT-039: Update effect-researcher.md Patterns

| Field | Value |
|-------|-------|
| **Description** | Outdated research patterns (pre-MCP) |
| **Files Affected** | `.claude/agents/effect-researcher.md` |
| **Impact** | 50-80 line optimization |
| **Effort** | LOW (1 hr) |
| **Phase** | P3D |
| **Action** | Update to use MCP tools |

### OPT-040-043: Minor Optimizations

| ID | Description | Impact | Effort |
|----|-------------|--------|--------|
| OPT-040 | Consolidate effect-imports.md with effect-patterns.md | 50-80 lines | LOW |
| OPT-041 | Remove duplicate cross-slice rules | 125-175 lines | LOW |
| OPT-042 | Standardize agent frontmatter boilerplate | 50-100 lines | LOW |
| OPT-043 | Create verification script automation | N/A (tooling) | LOW |

---

## Implementation Phases

### Phase 3A: Critical Fixes (30 minutes)
- OPT-001: Fix stale package references
- OPT-002: Handle stub documentation

### Phase 3B: Create Missing Documentation (5-7 hours)
- OPT-003: Create 12 missing AGENTS.md files
- OPT-004: Create 10 missing README.md files
- OPT-028: Complete required sections in existing READMEs

### Phase 3C: Apply Optimizations (20-30 hours)
- OPT-005 to OPT-009: Compress largest files
- OPT-010 to OPT-012: Fix pattern violations
- OPT-015 to OPT-017: Consolidate and deduplicate
- OPT-029 to OPT-035: Compress additional verbose files

### Phase 3D: Update Cross-References (10-14 hours)
- OPT-013, OPT-014: Deduplicate sections
- OPT-018 to OPT-027: Create templates, add metadata
- OPT-036 to OPT-043: Low priority enhancements

---

## Success Metrics

| Metric | Current | Target | Verification |
|--------|---------|--------|--------------|
| Line count | 44,181 | 34,000-37,000 | wc -l |
| Stale references | 2 | 0 | grep @beep/core |
| AGENTS.md coverage | 76% | 100% | script |
| Effect compliance | 63% | 100% | pattern check |
| Avg agent length | 320 lines | 200-250 lines | wc -l |
| Max agent length | 1,220 lines | 600-800 lines | wc -l |

---

## Verification Checklist

After implementation:
- [ ] `grep -r "@beep/core-" packages/` returns 0 results
- [ ] All 60+ packages have AGENTS.md
- [ ] All 60+ packages have README.md
- [ ] No native array methods in AGENTS.md examples
- [ ] No Effect.runPromise in test examples
- [ ] Total line count reduced by ≥20%
- [ ] Average agent file ≤250 lines
- [ ] Cross-reference links all resolve

---

*Generated for Phase 2 of agent-config-optimization spec*
