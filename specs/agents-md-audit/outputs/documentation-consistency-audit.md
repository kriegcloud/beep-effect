# Documentation Consistency Audit Report

> Generated: 2026-01-22
> Auditor: Claude Opus 4.5
> Scope: Full repository documentation audit against specs/_guide/ canonical sources

---

## Summary

| Category | Files Checked | Issues Found |
|----------|---------------|--------------|
| Agent definitions (.claude/agents/*.md) | 21 | 3 files with issues |
| Spec READMEs (specs/*/README.md) | 11 | 4 files with issues |
| Spec handoffs (specs/*/handoffs/*.md) | 70+ | 20+ files with old refs |
| REFLECTION_LOGs (specs/*/REFLECTION_LOG.md) | 9 | 3 files with issues |
| Project documentation (documentation/**/*.md) | 16 | 2 files with issues |
| Root files (CLAUDE.md, AGENTS.md) | 2 | 1 file with issues |
| Rules files (.claude/rules/*.md) | 3 | 0 issues |
| Skills (.claude/skills/*.md) | 14 | 1 file with issues |
| Commands (.claude/commands/*.md) | 6 | 1 file with issues |

**Total unique issues: 67+ references need correction**

---

## Canonical Source of Truth

These files define the current authoritative standards:

| File | Purpose |
|------|---------|
| `specs/_guide/README.md` | Spec creation workflow, phase progression, complexity calculator |
| `specs/_guide/HANDOFF_STANDARDS.md` | Dual handoff requirements, context budgets, token limits |
| `specs/_guide/PATTERN_REGISTRY.md` | Reusable patterns library |
| `specs/_guide/patterns/anti-patterns.md` | 14 anti-patterns to avoid |
| `specs/_guide/patterns/reflection-system.md` | Reflection schema, quality scoring |
| `specs/_guide/patterns/validation-dry-runs.md` | Pre-flight verification |
| `specs/_guide/patterns/bootstrapped-slice-specs.md` | Extending existing slices |
| `specs/_guide/llms.txt` | AI-readable spec index |

---

## Path Migration Reference

| Old Path | New Path |
|----------|----------|
| `specs/SPEC_CREATION_GUIDE.md` | `specs/_guide/README.md` |
| `specs/HANDOFF_STANDARDS.md` | `specs/_guide/HANDOFF_STANDARDS.md` |
| `specs/PATTERN_REGISTRY.md` | `specs/_guide/PATTERN_REGISTRY.md` |
| `specs/llms.txt` | `specs/_guide/llms.txt` |
| `specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` | `specs/_guide/PATTERN_REGISTRY.md` |

## Deleted Specs (No Longer Exist)

- `specs/ai-friendliness-audit/` - Deleted, was gold standard example
- `specs/jetbrains-mcp-skill/` - Deleted, outputs moved to skill
- `specs/new-specialized-agents/` - Deleted, split into individual specs

---

## Critical Issues (Must Fix)

### 1. AGENTS.md (Root configuration file)

**Location**: `/AGENTS.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 90 | `[SPEC_CREATION_GUIDE](specs/SPEC_CREATION_GUIDE.md)` | `[Spec Guide](specs/_guide/README.md)` |
| 91 | `[META_SPEC_TEMPLATE](specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md)` | `[PATTERN_REGISTRY](specs/_guide/PATTERN_REGISTRY.md)` |
| 98 | `Use HANDOFF_P[N].md to preserve context` | `Use HANDOFF_P[N].md AND P[N]_ORCHESTRATOR_PROMPT.md (both required)` |

---

### 2. .claude/agents/reflector.md

**Location**: `/.claude/agents/reflector.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 19 | `"Analyze the reflection log from ai-friendliness-audit"` | `"Analyze the reflection log from canonical-naming-conventions"` |
| 49 | `description: Name of the spec to analyze (e.g., "ai-friendliness-audit")` | `description: Name of the spec to analyze (e.g., "canonical-naming-conventions")` |
| 111 | `- specs/ai-friendliness-audit/REFLECTION_LOG.md (K entries)` | `- specs/canonical-naming-conventions/REFLECTION_LOG.md (K entries)` |
| 237 | `specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` | `specs/_guide/PATTERN_REGISTRY.md` |
| 273 | `Request: Analyze the reflection log from ai-friendliness-audit` | `Request: Analyze the reflection log from canonical-naming-conventions` |
| 274 | `Glob for specs/ai-friendliness-audit/REFLECTION_LOG.md` | `Glob for specs/canonical-naming-conventions/REFLECTION_LOG.md` |
| 276 | `outputs/meta-reflection-ai-friendliness-audit.md` | `outputs/meta-reflection-canonical-naming-conventions.md` |
| 306 | `specs/HANDOFF_STANDARDS.md` | `specs/_guide/HANDOFF_STANDARDS.md` |

---

### 3. .claude/commands/new-spec.md

**Location**: `/.claude/commands/new-spec.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 171 | `[HANDOFF_STANDARDS.md](../../specs/HANDOFF_STANDARDS.md)` | `[HANDOFF_STANDARDS.md](../../specs/_guide/HANDOFF_STANDARDS.md)` |
| 190 | `specs/PATTERN_REGISTRY.md` | `specs/_guide/PATTERN_REGISTRY.md` |
| 228 | `following the Standard Spec Structure from SPEC_CREATION_GUIDE.md` | `following the Standard Spec Structure from specs/_guide/README.md` |
| 237 | `[SPEC_CREATION_GUIDE](../../specs/SPEC_CREATION_GUIDE.md)` | `[Spec Guide](../../specs/_guide/README.md)` |
| 238 | `[HANDOFF_STANDARDS](../../specs/HANDOFF_STANDARDS.md)` | `[HANDOFF_STANDARDS](../../specs/_guide/HANDOFF_STANDARDS.md)` |
| 239 | `[PATTERN_REGISTRY](../../specs/PATTERN_REGISTRY.md)` | `[PATTERN_REGISTRY](../../specs/_guide/PATTERN_REGISTRY.md)` |
| 240 | `[llms.txt](../../specs/llms.txt)` | `[llms.txt](../../specs/_guide/llms.txt)` |
| 275 | `README.md follows META_SPEC_TEMPLATE structure` | `README.md follows specs/_guide/README.md structure` |

---

### 4. .claude/skills/jetbrains-mcp.md

**Location**: `/.claude/skills/jetbrains-mcp.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 239 | `specs/jetbrains-mcp-skill/outputs/tool-inventory.md` | Remove line (spec deleted) |
| 240 | `specs/jetbrains-mcp-skill/outputs/workflow-analysis.md` | Remove line (spec deleted) |
| 241 | `specs/jetbrains-mcp-skill/outputs/decision-tree.md` | Remove line (spec deleted) |
| 242 | `specs/jetbrains-mcp-skill/outputs/comparison-matrix.md` | Remove line (spec deleted) |

**Action**: Remove entire "Related" section (lines 237-242) or replace with valid references.

---

### 5. specs/agents/README.md

**Location**: `/specs/agents/README.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 9 | `[new-specialized-agents](../new-specialized-agents/README.md) initiative` | Remove reference, reword sentence |
| 178 | `[new-specialized-agents](../new-specialized-agents/README.md) - Parent spec` | Remove line |
| 179 | `[ai-friendliness-audit](../ai-friendliness-audit/README.md) - META_SPEC_TEMPLATE reference` | Remove line |

---

## Medium Issues (Should Fix)

### 6. specs/todox-design/README.md

**Location**: `/specs/todox-design/README.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 207 | `[SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md)` | `[Spec Guide](../_guide/README.md)` |
| 208 | `[HANDOFF_STANDARDS](../HANDOFF_STANDARDS.md)` | `[HANDOFF_STANDARDS](../_guide/HANDOFF_STANDARDS.md)` |

---

### 7. specs/canonical-naming-conventions/README.md

**Location**: `/specs/canonical-naming-conventions/README.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 244 | `specs/ai-friendliness-audit/ - Related AI-friendliness patterns` | Remove line |

---

### 8. specs/canonical-naming-conventions/MASTER_ORCHESTRATION.md

**Location**: `/specs/canonical-naming-conventions/MASTER_ORCHESTRATION.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 523 | `specs/ai-friendliness-audit/: Related AI-friendliness patterns` | Remove line |

---

### 9. specs/spec-creation-improvements/README.md

**Location**: `/specs/spec-creation-improvements/README.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 224 | `specs/ai-friendliness-audit/ - Related AI-friendliness patterns` | Remove line |

---

### 10. documentation/patterns/agent-signatures.md

**Location**: `/documentation/patterns/agent-signatures.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 293 | `[SPEC_CREATION_GUIDE.md](../specs/SPEC_CREATION_GUIDE.md)` | `[Spec Guide](../specs/_guide/README.md)` |

---

### 11. documentation/patterns/external-api-integration.md

**Location**: `/documentation/patterns/external-api-integration.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 345 | `[Handoff Standards](../../specs/HANDOFF_STANDARDS.md)` | `[Handoff Standards](../../specs/_guide/HANDOFF_STANDARDS.md)` |

---

### 12. specs/_guide/README.md

**Location**: `/specs/_guide/README.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 170 | `Follow META_SPEC_TEMPLATE structure from specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md` | `Follow the Standard Spec Structure defined in this guide` |

---

### 13. specs/_guide/PATTERN_REGISTRY.md

**Location**: `/specs/_guide/PATTERN_REGISTRY.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 144 | `[Creation Guide](./SPEC_CREATION_GUIDE.md)` | `[Creation Guide](./README.md)` |
| 155 | `specs/llms.txt` | `specs/_guide/llms.txt` |
| 186 | `Implemented in SPEC_CREATION_GUIDE.md` | `Implemented in README.md` |
| 359 | `Schema implemented in SPEC_CREATION_GUIDE.md` | `Schema implemented in README.md` |
| 513 | `[SPEC_CREATION_GUIDE.md](./SPEC_CREATION_GUIDE.md)` | `[README.md](./README.md)` |

---

### 14. specs/_guide/patterns/reflection-system.md

**Location**: `/specs/_guide/patterns/reflection-system.md`

| Line | Found | Should Be |
|------|-------|-----------|
| 225 | `specs/PATTERN_REGISTRY.md` | `specs/_guide/PATTERN_REGISTRY.md` |
| 296 | `specs/PATTERN_REGISTRY.md` | `specs/_guide/PATTERN_REGISTRY.md` |
| 307 | `specs/PATTERN_REGISTRY.md` | `specs/_guide/PATTERN_REGISTRY.md` |
| 378 | `specs/PATTERN_REGISTRY.md` | `specs/_guide/PATTERN_REGISTRY.md` |

---

## Low Priority (Historical Documents)

### specs/spec-creation-improvements/handoffs/*

These are historical handoff documents from a completed spec. They contain many references to old paths but serve as historical record.

**Files affected**:
- `handoffs/HANDOFF_P0.md` - ~4 refs
- `handoffs/HANDOFF_P1.md` - ~12 refs
- `handoffs/HANDOFF_P2.md` - ~8 refs
- `handoffs/HANDOFF_P3.md` - ~6 refs
- `handoffs/HANDOFF_P5.md` - ~10 refs
- `handoffs/P1_ORCHESTRATOR_PROMPT.md` - ~5 refs
- `handoffs/P2_ORCHESTRATOR_PROMPT.md` - ~4 refs
- `handoffs/P3_ORCHESTRATOR_PROMPT.md` - ~3 refs
- `handoffs/P5_ORCHESTRATOR_PROMPT.md` - ~5 refs

**Recommendation**: Add deprecation notice at top of each file noting path changes, OR bulk-update with sed.

---

### specs/_guide/outputs/methodology-improvements-2026-01-18.md

Historical methodology document with ~12 references to old paths.

**Recommendation**: Add deprecation notice or bulk-update.

---

### specs/rls-implementation/REFLECTION_LOG.md

| Line | Found | Should Be |
|------|-------|-----------|
| 69 | `Update SPEC_CREATION_GUIDE.md` | `Update specs/_guide/README.md` |

---

### specs/spec-creation-improvements/REFLECTION_LOG.md

Multiple references to old paths (lines 119-122, 170, 335-336).

**Recommendation**: Update or add note about path migration.

---

### specs/naming-conventions-refactor/REFLECTION_LOG.md

References to old `SPEC_CREATION_GUIDE.md` path.

---

## Files Checked (No Issues)

### Agent Definitions (Clean)
- .claude/agents/architecture-pattern-enforcer.md
- .claude/agents/code-observability-writer.md
- .claude/agents/code-reviewer.md
- .claude/agents/codebase-researcher.md
- .claude/agents/doc-writer.md
- .claude/agents/effect-predicate-master.md
- .claude/agents/effect-researcher.md
- .claude/agents/effect-schema-expert.md
- .claude/agents/jsdoc-fixer.md
- .claude/agents/mcp-researcher.md
- .claude/agents/package-error-fixer.md
- .claude/agents/prompt-refiner.md
- .claude/agents/spec-reviewer.md
- .claude/agents/test-writer.md
- .claude/agents/tsconfig-auditor.md
- .claude/agents/web-researcher.md
- .claude/agents/wealth-management-domain-expert.md
- .claude/agents/agents-md-updater.md
- .claude/agents/readme-updater.md
- .claude/agents/ai-trends-researcher.md

### Rules (Clean)
- .claude/rules/behavioral.md
- .claude/rules/general.md
- .claude/rules/effect-patterns.md

### Skills (Clean except jetbrains-mcp.md)
- .claude/skills/atomic-component.md
- .claude/skills/collection-patterns.md
- .claude/skills/datetime-patterns.md
- .claude/skills/effect-atom.md
- .claude/skills/effect-check.md
- .claude/skills/effect-imports.md
- .claude/skills/forbidden-patterns.md
- .claude/skills/form-field.md
- .claude/skills/match-patterns.md
- .claude/skills/mcp-refactor-typescript.md
- .claude/skills/mui-component-override.md
- .claude/skills/playwright-mcp.md
- .claude/skills/visual-testing.md

### Spec READMEs (Clean)
- specs/README.md
- specs/orgtable-auto-rls/README.md
- specs/naming-conventions-refactor/README.md
- specs/rls-implementation/README.md
- specs/agent-config-optimization/README.md
- specs/agents-md-audit/README.md
- specs/knowledge-graph-integration/README.md

---

## Summary by Issue Type

| Issue Type | Count | Priority |
|------------|-------|----------|
| References to deleted `ai-friendliness-audit` spec | 18 | Critical |
| References to deleted `jetbrains-mcp-skill` spec | 4 | Critical |
| References to deleted `new-specialized-agents` spec | 2 | Critical |
| References to `specs/SPEC_CREATION_GUIDE.md` | 33+ | Critical/Medium |
| References to `specs/HANDOFF_STANDARDS.md` (old location) | 15+ | Medium |
| References to `specs/PATTERN_REGISTRY.md` (old location) | 12+ | Medium |
| References to `specs/llms.txt` (old location) | 8+ | Medium |
| Missing dual handoff file requirement mention | 1 | Medium |
| References to `META_SPEC_TEMPLATE` | 12 | Medium |

---

## Fix Order Recommendation

1. **AGENTS.md** - Root config, highest visibility
2. **.claude/commands/new-spec.md** - Active skill, blocks proper spec creation
3. **.claude/agents/reflector.md** - Active agent, misleading examples
4. **.claude/skills/jetbrains-mcp.md** - Broken "Related" section
5. **specs/agents/README.md** - Broken links to deleted specs
6. **specs/todox-design/README.md** - Active spec with broken refs
7. **specs/canonical-naming-conventions/*.md** - Active spec files
8. **documentation/patterns/*.md** - Reference documentation
9. **specs/_guide/README.md** and **PATTERN_REGISTRY.md** - Self-references
10. **specs/_guide/patterns/reflection-system.md** - Pattern documentation
11. **Historical handoff files** - Bulk update or add deprecation notices
