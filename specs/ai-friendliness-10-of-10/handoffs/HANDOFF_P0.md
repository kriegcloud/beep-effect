# Phase 0 Handoff: Discovery & Baseline

**Date**: 2026-02-04
**From**: Spec Creation
**To**: Phase 0 (Discovery)
**Status**: Ready for execution

---

## Context for Phase 0

### Working Context (≤2,000 tokens)

**Current Task**: Establish comprehensive baseline of AI-friendliness state.

**Success Criteria**:
1. Complete package inventory with ai-context.md status
2. Quality scores for all 66 AGENTS.md files
3. 20+ error patterns identified from reflection logs
4. List of all rules needing worked examples
5. Onboarding friction points documented

**Blocking Issues**: None

**Immediate Dependencies**:
- `.claude/scripts/context-crawler.ts` - Module discovery
- `specs/*/REFLECTION_LOG.md` - Error pattern source
- `.claude/rules/*.md` - Rules to audit

### Episodic Context (≤1,000 tokens)

**Spec Creation Outcome**: Comprehensive spec created with 6 phases, validated against real-world sources.

**Key Decisions Made**:
- ai-context.md provides discovery; AGENTS.md provides depth
- Error catalog uses YAML format with safe/unsafe classification
- Onboarding combines skill (interactive) + documentation (reference)
- Self-healing limited to safe auto-fixes only

**Patterns Discovered**:
- Infrastructure exists but content missing (0% ai-context.md coverage)
- 66 AGENTS.md files available as source material

### Semantic Context (≤500 tokens)

**Tech Stack**: Effect-TS monorepo, Bun, TypeScript
**Package Count**: 62+ packages across packages/, apps/, tooling/
**Doc Infrastructure**: `/modules`, `/module`, `/module-search` commands ready

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- ai-context writer: `.claude/skills/ai-context-writer/SKILL.md`

---

## Tasks to Complete

### Task 0.1: Package Inventory

**Objective**: Create complete list of packages with ai-context.md status.

**Steps**:
1. Use `find packages apps tooling -type d -maxdepth 2` to list directories
2. Check each for ai-context.md existence
3. Note which have AGENTS.md (conversion source)
4. Output to `outputs/packages-inventory.md`

**Expected Output**:
```markdown
# Package Inventory

## Coverage Summary
- Total packages: 62
- With ai-context.md: 0 (0%)
- With AGENTS.md: 66 (106%)

## Package List

| Package | ai-context.md | AGENTS.md | Priority |
|---------|---------------|-----------|----------|
| packages/shared/domain | ❌ | ✅ | High |
| packages/iam/client | ❌ | ✅ | High |
...
```

### Task 0.2: AGENTS.md Quality Audit

**Objective**: Score existing AGENTS.md files for conversion quality.

**Scoring Rubric**:
| Criterion | Points |
|-----------|--------|
| Has clear purpose statement | 2 |
| Lists key files | 2 |
| Documents patterns | 2 |
| Includes examples | 2 |
| Notes gotchas/guardrails | 2 |
| **Total** | **10** |

**Steps**:
1. Read each AGENTS.md file
2. Score against rubric
3. Note files below 6/10 for extra attention
4. Output to `outputs/agents-md-quality.md`

### Task 0.3: Error Pattern Extraction

**Objective**: Mine REFLECTION_LOG files for common error patterns.

**Steps**:
1. Grep `specs/*/REFLECTION_LOG.md` for error mentions
2. Grep `.claude/rules/*.md` for NEVER patterns
3. Check common TypeScript/Effect errors from codebase
4. Categorize by type: TypeScript, Effect, Biome, Turborepo
5. Output to `outputs/error-patterns.md`

**Target**: 20+ unique error patterns

### Task 0.4: Rules Without Examples Audit

**Objective**: Identify abstract rules lacking worked examples.

**Steps**:
1. Read `.claude/rules/*.md` files
2. Identify rules using formal notation without examples
3. List rules that reference patterns without showing them
4. Output to `outputs/rules-without-examples.md`

### Task 0.5: Onboarding Friction Analysis

**Objective**: Document where new agents struggle.

**Steps**:
1. Review existing onboarding documentation
2. Identify assumed knowledge (Effect, TypeScript, monorepo)
3. Note missing "getting started" paths
4. Check for undefined terminology
5. Output to `outputs/onboarding-gaps.md`

---

## Verification Steps

After each task:
```bash
# Verify output file created
cat specs/ai-friendliness-10-of-10/outputs/[filename].md

# Check word count (should be substantive)
wc -l specs/ai-friendliness-10-of-10/outputs/[filename].md
```

After all tasks:
```bash
# Verify all 5 outputs exist
ls specs/ai-friendliness-10-of-10/outputs/
# Expected: 5 files

# Update reflection log
# Add entry with findings
```

---

## Success Criteria Checklist

- [ ] `outputs/packages-inventory.md` - Complete package list with status
- [ ] `outputs/agents-md-quality.md` - Quality scores for 66 files
- [ ] `outputs/error-patterns.md` - 20+ error patterns identified
- [ ] `outputs/rules-without-examples.md` - Abstract rules listed
- [ ] `outputs/onboarding-gaps.md` - Friction points documented
- [ ] REFLECTION_LOG.md updated with P0 learnings

---

## Handoff to P1

After P0 completion, create:
1. `handoffs/HANDOFF_P1.md` with discovery findings
2. `handoffs/P1_ORCHESTRATOR_PROMPT.md` for ai-context generation
