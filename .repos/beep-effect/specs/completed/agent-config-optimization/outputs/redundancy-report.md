# Redundancy Analysis Report

**Date**: 2026-01-18
**Phase**: Agent Config Optimization - Phase 2
**Scope**: 56 `.claude/` files, 48 `AGENTS.md` files, 49 `README.md` files

---

## Executive Summary

- **Total redundancies identified**: 12 major patterns
- **Files affected**: 145+ files across all categories
- **Potential savings**: 3,200-4,500 lines (~18-24% of total content)
- **Estimated effort to consolidate**: 40-60 hours

---

## Redundancy Table

| ID | Pattern | Files Affected | Dup Lines | Source of Truth | Savings |
|----|---------|----------------|-----------|-----------------|---------|
| R-001 | Agent Frontmatter Boilerplate | 22 `.claude/agents/*.md` | 40-60/file | `.claude/agents/templates/frontmatter.md` | 880-1,320 |
| R-002 | Domain Layer AGENTS.md Template | 14 `packages/*/domain/AGENTS.md` | 60-80/file | Domain.md template | 840-1,120 |
| R-003 | Domain Layer README.md Template | 14 `packages/*/domain/README.md` | 40-60/file | DOMAIN_README_TEMPLATE.md | 560-840 |
| R-004 | Verifications Section | 48 AGENTS.md files | 6-8/file | `.claude/shared/verification-commands.md` | 288-384 |
| R-005 | Authoring Guardrails Section | 14 domain AGENTS.md | 12-16/file | Domain guardrails template | 168-224 |
| R-006 | Effect Pattern References | 30+ config files | 8-12/file | `.claude/rules/effect-patterns.md` | 240-360 |
| R-007 | Contributor Checklist Boilerplate | 14 domain AGENTS.md | 6-8 items/file | Contributor checklist template | 84-112 |
| R-008 | Module Structure Diagrams | 14 domain README.md | 15-20/file | Module structure template | 210-280 |
| R-009 | Security Section Redundancy | 8 IAM/Comms domain files | 20-30/file | Domain security template | 160-240 |
| R-010 | Installation Instruction Copies | 49 README.md files | 4-6/file | MONOREPO_INSTALL_TEMPLATE.md | 196-294 |
| R-011 | Effect Namespace Import Tables | 8 agent files | 15-20/file | Single source in effect-patterns.md | 120-160 |
| R-012 | Cross-Slice Boundary Rules | 5 files | 25-35/file | `.claude/rules/architecture.md` | 125-175 |

---

## Detailed Findings

### R-001: Agent Frontmatter Boilerplate (880-1,320 lines)

**Affected Files**: All 22 agent files in `.claude/agents/*.md`

**Pattern**: Each agent redefines identical YAML structure with repetitive boilerplate.

**Example**:
- `code-reviewer.md` (L1-4)
- `architecture-pattern-enforcer.md` (L1-39)
- `test-writer.md` (L1-4)

**Recommendation**: Create `.claude/agents/templates/agent-frontmatter.md` with meta-variables.

---

### R-002: Domain Layer AGENTS.md Structure (840-1,120 lines)

**Affected Files**:
- `packages/iam/domain/AGENTS.md` (137 lines)
- `packages/documents/domain/AGENTS.md` (98 lines)
- `packages/comms/domain/AGENTS.md` (208 lines)
- Plus 11 similar domain packages

**Pattern**: All follow identical structure:
1. Purpose & Fit (3-5 lines)
2. Surface Map (10-20 lines)
3. Usage Snapshots (5-10 lines)
4. Authoring Guardrails (8-12 lines)
5. Quick Recipes (40-60 lines)
6. Verifications (3-5 lines)
7. Security (20-30 lines)
8. Contributor Checklist (6-10 items)

**Recommendation**: Create template with placeholders for entity names.

---

### R-003: Domain README.md Template Content (560-840 lines)

**Affected Files**: 14 domain README.md files

**Duplication Rate**: 65-75% of lines are copy-paste structure.

**Identical Sections**:
- Lines 14-20 (Installation section): Identical across all 14 READMEs
- Lines 97-143 (Usage section): 80% identical
- Module structure diagram pattern: Repeated in all

**Recommendation**: Create template with placeholder tokens.

---

### R-004: Verifications Section (288-384 lines)

**Affected Files**: All 48 AGENTS.md files

**Pattern**:
```markdown
## Verifications
- `bun run check --filter @beep/[package]`
- `bun run lint --filter @beep/[package]`
- `bun run test --filter @beep/[package]`
```

**Exact Match**: Identical 6-8 line block repeated 48 times.

**Recommendation**: Extract to shared file with variable substitution.

---

### R-005: Authoring Guardrails (168-224 lines)

**Affected Files**: 14 domain AGENTS.md files

**Pattern**: 95%+ identical content:
- Effect import patterns
- `makeFields` usage
- Symbol.for naming
- `BS` helpers preference

**Recommendation**: Create `.claude/templates/domain-guardrails.md`.

---

### R-006: Effect Pattern References (240-360 lines)

**Affected Files**: 30+ files

**Pattern**: Multiple files re-document the same import alias table:
- `code-reviewer.md`
- `test-writer.md`
- `effect-schema-expert.md`
- `code-observability-writer.md`

**Recommendation**: Reference single source `.claude/rules/effect-patterns.md`.

---

## Summary by Category

| Category | Redundant Lines | % of Total |
|----------|-----------------|------------|
| .claude/ Files | 1,365-2,015 | 7-11% |
| AGENTS.md Files | 1,540-2,080 | 21-28% |
| README.md Files | 966-1,414 | 5-8% |
| **Total** | **3,200-4,500** | **~18-24%** |

---

## Implementation Strategy

### Phase 1: Template Foundation (Week 1)
1. Create `.claude/templates/` for agent, domain AGENTS.md, domain README.md
2. Create `.claude/rules/architecture.md` supplement
3. Extract verification commands to `.claude/shared/verification-commands.md`

### Phase 2: Agent Consolidation (Week 2-3)
1. Update 22 `.claude/agents/*.md` files to use frontmatter template
2. Dedup Effect pattern references across 8 agents
3. Consolidate architecture rules across 5 files

### Phase 3: AGENTS.md Consolidation (Week 3-4)
1. Convert 14 domain AGENTS.md to template-based
2. Consolidate 48 Verifications sections
3. Extract guardrails, checklists, security sections

### Phase 4: README.md Consolidation (Week 4-5)
1. Convert 14 domain README.md to template-based
2. Dedup installation instructions across 49 files

---

## Automation Opportunities

1. **Template Generator Script**: `bun run scripts/generate-domain-docs.ts`
2. **Redundancy Linter**: Detect copy-pasted sections
3. **Cross-Reference Validator**: Ensure all internal links are accurate

---

*Generated for Phase 2 of agent-config-optimization spec*
