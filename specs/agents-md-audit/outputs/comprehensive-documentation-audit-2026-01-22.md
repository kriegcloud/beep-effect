# Comprehensive Documentation & Agent Configuration Audit

> **Generated**: 2026-01-22
> **Auditor**: Claude Opus 4.5
> **Scope**: Full repository documentation audit - agents, rules, specs, packages, CLAUDE.md

---

## Executive Summary

This audit identified **130+ issues** across 6 major categories. The repository has significant documentation inconsistencies, stale references, and conflicting instructions that impair both AI agent performance and developer onboarding.

| Category | Files Audited | Critical Issues | Medium Issues | Low Issues |
|----------|---------------|-----------------|---------------|------------|
| Agent Definitions (.claude/agents/*.md) | 21 | 6 | 4 | 12 |
| Package AGENTS.md | 40+ | 6 | 4 | 2 |
| Specs Structure | 10 | 5 | 8 | 5 |
| Documentation Patterns | 6 | 3 | 6 | 5 |
| Rules/CLAUDE.md Cross-reference | 5 | 2 | 8 | 3 |
| MCP Tool Shortcuts | 9 | - | 9 | - |

**Compliance Rate**: 50% (5 of 10 specs fully compliant)

---

## CATEGORY 1: Agent Definition Files (.claude/agents/*.md)

### 1.1 MCP Tool Shortcuts in Agent Files (REMOVE)

**Issue**: 6 agents declare MCP tools in `tools:` sections. These should NOT be there as they're environment-specific.

| File | MCP Tools Found |
|------|-----------------|
| `code-observability-writer.md` | `mcp__effect_docs__*`, `mcp__MCP_DOCKER__*` |
| `effect-predicate-master.md` | `mcp__effect_docs__*` |
| `effect-researcher.md` | `mcp__effect_docs__*`, `mcp__MCP_DOCKER__*` |
| `effect-schema-expert.md` | `mcp__effect_docs__*` |
| `mcp-researcher.md` | `mcp__effect_docs__*`, `mcp__MCP_DOCKER__*` |
| `test-writer.md` | `mcp__effect_docs__*` |

**Fix**: Remove from `tools:` declarations, document as "optional MCP integrations" instead.

### 1.2 Conflicting Test Pattern in test-writer.md

**Location**: Line 119
**Issue**: Shows `import { describe } from "bun:test"` but `.claude/rules/effect-patterns.md` states:
> "NEVER use `describe` blocks with testkit effect helpers"

**Fix**: Remove the `describe` import example.

### 1.3 Missing Slices in architecture-pattern-enforcer.md

**Location**: Lines 48-54
**Issue**: Missing `calendar` and `knowledge` slices from architecture audit list.

**Current**:
```
| Slice     | Location           |
|-----------|-------------------|
| iam       | packages/iam/*    |
| documents | packages/documents/* |
```

**Should include**:
```
| calendar  | packages/calendar/*  |
| knowledge | packages/knowledge/* |
```

### 1.4 Template Syntax Issue in code-observability-writer.md

**Location**: Lines 122-137
**Issue**: Uses non-standard `${{package-name}}` template syntax.

**Fix**: Replace with clearer placeholder format or document the syntax.

### 1.5 CLAUDE.md Doesn't Document All 21 Agents

**Issue**: CLAUDE.md lists 9 agents but there are 21 total. 12 agents undocumented:
- tsconfig-auditor
- prompt-refiner
- effect-researcher
- package-error-fixer
- ai-trends-researcher
- effect-predicate-master
- jsdoc-fixer
- agents-md-updater
- readme-updater
- wealth-management-domain-expert
- effect-schema-expert
- spec-reviewer

---

## CATEGORY 2: Package-Level AGENTS.md Files

### 2.1 Stale @beep/core-* Package References

**Count**: 20 files with stale `@beep/core-*` references

**Files affected**:
- `specs/agent-config-optimization/QUICK_START.md`
- `.claude/agents/readme-updater.md`
- `.claude/agents/agents-md-updater.md`
- `.claude/standards/documentation.md`
- `packages/shared/server/AGENTS.md`
- And 15 more in spec handoffs/outputs

**Fix**: Replace `@beep/core-*` with current package names.

### 2.2 Hardcoded Absolute Paths

**File**: `packages/iam/client/AGENTS.md`
**Lines**: 37-38
**Issue**: Contains hardcoded `/home/elpresidank/YeeBois/projects/beep-effect/...` paths

**Fix**: Remove absolute paths or convert to relative.

### 2.3 Missing Peer Dependencies Documentation

**File**: `packages/shared/client/AGENTS.md`
**Lines**: 310-312
**Issue**: Documents that `@beep/errors` is imported but not declared in `package.json`

**Fix**: Add `@beep/errors` to peer dependencies or document why it's acceptable.

### 2.4 Duplicate EntityId Documentation

**File**: `packages/shared/domain/AGENTS.md`
**Line**: 14
**Issue**: `SubscriptionId` appears in both `SharedEntityIds` and `IamEntityIds`, creating exhaustive matching redundancy.

---

## CATEGORY 3: Specs Structure Issues

### 3.1 CRITICAL: Broken Reference in README

**File**: `specs/README.md`
**Issue**: References `iam-client-method-wrappers` but directory doesn't exist.

**Fix**: Remove the table row for `iam-client-method-wrappers`.

### 3.2 Missing Orchestrator Prompts (Blocks Phase Execution)

| Spec | Missing File | Impact |
|------|--------------|--------|
| `knowledge-graph-integration` | `P4_ORCHESTRATOR_PROMPT.md` | Phase 4 blocked |
| `naming-conventions-refactor` | `P1_ORCHESTRATOR_PROMPT.md` | Phase 1 blocked |
| `naming-conventions-refactor` | `P2_ORCHESTRATOR_PROMPT.md` | Phase 2 blocked |
| `naming-conventions-refactor` | `P3_ORCHESTRATOR_PROMPT.md` | Phase 3 blocked |
| `todox-design` | `HANDOFF_P0.md` (inverse) | Context incomplete |

### 3.3 Non-Standard Handoff Naming

**File**: `specs/agents-md-audit/handoffs/FIX_ORCHESTRATOR_PROMPT.md`
**Issue**: Should be `P0_ORCHESTRATOR_PROMPT.md` per standard pattern.

### 3.4 Missing REFLECTION_LOG.md

**Spec**: `specs/agents/`
**Issue**: All specs require `REFLECTION_LOG.md` per `specs/_guide/README.md`.

### 3.5 Stale Cross-References (13 instances)

**Spec**: `spec-creation-improvements`
**Broken references**:
- `specs/llms` (non-existent)
- `specs/full-iam-client` (non-existent)
- `specs/llms-full` (non-existent)
- `specs/templates` (should be `specs/_guide/templates/`)

---

## CATEGORY 4: Documentation Patterns

### 4.1 CRITICAL: Missing service-patterns.md

**Referenced in**: `.claude/rules/effect-patterns.md` line 396
**Status**: FILE DOES NOT EXIST

**Effect-patterns.md says**:
```
| **Services** | `documentation/patterns/service-patterns.md` | Service design, Layer composition |
```

**Actual files in documentation/patterns/**:
- database-patterns.md
- external-api-integration.md
- iam-client-patterns.md
- rls-patterns.md
- agent-signatures.md

**Fix**: Create `service-patterns.md` or remove the reference.

### 4.2 Non-Standard Effect Schema API

**File**: `documentation/patterns/external-api-integration.md`
**Line**: ~119
**Issue**: Uses `S.NullOr(S.String)` which is not standard Effect Schema.

**Standard patterns**:
- `S.optionalWith(S.String, { nullable: true })`
- `S.Union(S.Null, S.String)`

### 4.3 Missing Knowledge Slice Documentation

**File**: `documentation/PACKAGE_STRUCTURE.md`
**Issue**: Lists all slices but omits `knowledge/` package which exists.

### 4.4 Confusing RLS Manual SQL Example

**File**: `documentation/patterns/rls-patterns.md`
**Line**: ~269
**Issue**: Shows manual SQL escaping but then says "TenantContext handles this internally".

**Fix**: Remove manual SQL example, show only TenantContext usage.

### 4.5 _internal Import Anti-Pattern

**File**: `documentation/patterns/iam-client-patterns.md`
**Line**: 339
**Issue**: Shows `import * as Common from "@beep/iam-client/_internal"` as example.

**Fix**: Replace with public API imports.

---

## CATEGORY 5: CLAUDE.md and Rules Cross-Reference

### 5.1 Testing Rule Triple Duplication

**Same rule appears in 3 locations**:
1. `CLAUDE.md` line 75
2. `.claude/rules/general.md` line 52
3. `.claude/rules/effect-patterns.md` line 316

**Recommendation**: Keep one authoritative source, reference from others.

### 5.2 Incomplete Code Quality Rules in CLAUDE.md

**CLAUDE.md has 3 items**, **general.md has 5 items**.

**Missing from CLAUDE.md**:
- Testing utilities rule (`@beep/testkit`)
- Environment access rule (`@beep/env`)

### 5.3 Commands Table Duplication

**Appears verbatim in**:
- `CLAUDE.md` lines 30-41
- `.claude/rules/general.md` lines 25-36

**Maintenance risk**: Changes must be synced to both.

### 5.4 Architecture Section Naming Inconsistency

| File | Section Name |
|------|--------------|
| CLAUDE.md | `## Architecture & Boundaries` |
| general.md | `## Architecture Boundaries` |

### 5.5 Incomplete Testing Runners Documentation

**CLAUDE.md** only documents `effect()` and `layer()` runners.
**effect-patterns.md** documents all 4: `effect()`, `scoped()`, `live()`, `layer()`.

---

## CATEGORY 6: Old Path References (Legacy Migration)

### 6.1 Old Spec Guide Paths Still Present

**Count**: 18 files with old `specs/SPEC_CREATION_GUIDE.md` references

**Old** → **New**:
- `specs/SPEC_CREATION_GUIDE.md` → `specs/_guide/README.md`
- `specs/HANDOFF_STANDARDS.md` → `specs/_guide/HANDOFF_STANDARDS.md`
- `specs/PATTERN_REGISTRY.md` → `specs/_guide/PATTERN_REGISTRY.md`
- `specs/llms.txt` → `specs/_guide/llms.txt`

### 6.2 Deleted Spec References

**Count**: 5 files still reference deleted specs

**Deleted specs**:
- `specs/ai-friendliness-audit/` (18 references)
- `specs/jetbrains-mcp-skill/` (4 references)
- `specs/new-specialized-agents/` (2 references)

### 6.3 META_SPEC_TEMPLATE References

**Count**: 12 files reference `META_SPEC_TEMPLATE`

**Old**: `specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md`
**New**: `specs/_guide/PATTERN_REGISTRY.md`

---

## Priority Fix Order

### TIER 1: CRITICAL (Fix Immediately)

1. **Remove `iam-client-method-wrappers` from `specs/README.md`** - Broken link
2. **Create missing orchestrator prompts** (4 files) - Blocks phase execution
3. **Create `documentation/patterns/service-patterns.md`** or remove reference
4. **Add `REFLECTION_LOG.md` to `specs/agents/`**

### TIER 2: HIGH (Fix This Session)

5. **Remove MCP tool shortcuts from 6 agent files**
6. **Fix `@beep/core-*` references** (20 files)
7. **Add missing slices to `architecture-pattern-enforcer.md`** (calendar, knowledge)
8. **Fix old spec guide paths** (18 files)
9. **Remove deleted spec references** (24 references across 5 files)
10. **Update `PACKAGE_STRUCTURE.md`** with knowledge slice

### TIER 3: MEDIUM (Fix This Week)

11. **Standardize handoff naming** in agents-md-audit
12. **Fix stale cross-references** in spec-creation-improvements (13)
13. **Update CLAUDE.md** to document all 21 agents OR add categorization
14. **Consolidate testing rules** - keep one source of truth
15. **Remove hardcoded paths** from package AGENTS.md files
16. **Fix non-standard Effect Schema APIs** in external-api-integration.md

### TIER 4: LOW (Process Improvement)

17. **Consolidate commands table** - keep in one location
18. **Standardize section naming** across files
19. **Document all 4 test runners** in CLAUDE.md
20. **Clean up empty template directories** (5 specs)
21. **Add CI validation** for handoff file pairs

---

## Issue Summary by File

| File | Critical | Medium | Low |
|------|----------|--------|-----|
| specs/README.md | 1 | 0 | 0 |
| specs/naming-conventions-refactor/handoffs/ | 3 | 0 | 0 |
| documentation/patterns/service-patterns.md | 1 (missing) | 0 | 0 |
| .claude/agents/*.md (6 files) | 0 | 6 | 0 |
| 20 files with @beep/core-* | 0 | 20 | 0 |
| 18 files with old spec paths | 0 | 18 | 0 |
| 5 files with deleted spec refs | 0 | 5 | 0 |
| CLAUDE.md | 0 | 3 | 2 |

---

## Methodology

### Audit Scope
1. All `.claude/agents/*.md` files (21)
2. All `**/AGENTS.md` package files (40+)
3. All `specs/` directories and handoff files
4. All `documentation/patterns/*.md` files
5. `CLAUDE.md` and `.claude/rules/*.md`
6. Cross-references between all of the above

### Verification Methods
- File existence checks
- Package.json cross-reference for @beep/* packages
- Path resolution for all references
- Pattern matching for deprecated/stale strings
- Agent parallel exploration (5 concurrent audits)

### Excluded
- Content accuracy of documentation (not fact-checked)
- Code example compilation (not type-checked)
- Historical handoff files (treated as archive)
