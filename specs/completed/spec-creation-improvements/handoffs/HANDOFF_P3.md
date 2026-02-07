# Phase 3 Handoff: Structured Self-Improvement

**Date**: 2026-01-21
**From**: Phase 2 (Context Engineering Integration)
**To**: Phase 3 (Structured Self-Improvement)
**Status**: Ready for execution

---

## Rolling Summary (Updated Each Phase)

**Spec**: spec-creation-improvements
**Current Phase**: 3 of 5
**Status**: Ready for execution

### Key Decisions Made

- Phase 1: Created `llms.txt` (domain-grouped pattern), state machine (Mermaid stateDiagram-v2), complexity calculator (6-factor formula), pattern registry
- Phase 2: Tiered memory model (Working/Episodic/Semantic/Procedural), context budget (4K tokens max), rolling summary compression pattern, context hoarding anti-pattern

### Active Constraints

- No breaking changes to existing REFLECTION_LOG entries
- All patterns must be backwards-compatible
- Quality scoring uses 102-point scale (industry standard from Agent Skills)

### Accumulated Patterns

- `year-filtered-search`: Include year in research queries (85/102)
- `tiered-memory-handoffs`: Four memory types in handoffs (82/102)
- `rolling-summary-compression`: Compressed summary per phase (79/102)
- `lost-in-middle-mitigation`: Critical info at doc start/end (80/102)

---

## Working Context for Phase 3

### Mission

Implement structured self-improvement framework based on Reflexion pattern and Agent Skills standard.

### Tasks for Phase 3

| # | Task | Complexity | Output |
|---|------|------------|--------|
| 3.1 | Define REFLECTION_LOG schema | Medium | Schema definition in SPEC_CREATION_GUIDE.md |
| 3.2 | Create skill quality scoring rubric | Medium | 8-category rubric (102 points max) |
| 3.3 | Define skill promotion workflow | Small | Workflow in SPEC_CREATION_GUIDE.md |
| 3.4 | Create SKILL.md template | Small | `specs/templates/SKILL.template.md` |

### Success Criteria

- [ ] REFLECTION_LOG schema defined with required fields
- [ ] Quality scoring rubric (8 categories, 102 points max)
- [ ] Skill promotion threshold defined (75+ for pattern registry)
- [ ] SKILL.md template created
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings
- [ ] HANDOFF_P4.md updated
- [ ] P4_ORCHESTRATOR_PROMPT.md updated

### Critical Files

| File | Relevance |
|------|-----------|
| `outputs/self-improvement-research.md` | Primary research source for Phase 3 |
| `specs/SPEC_CREATION_GUIDE.md` | Target for schema/workflow additions |
| `specs/PATTERN_REGISTRY.md` | Destination for promoted patterns |

---

## Episodic Context

### Phase 2 Summary

**Completed**: Context engineering integration

**Duration**: ~30 minutes

**Key Outcomes**:

- Added tiered memory model section to HANDOFF_STANDARDS.md
- Created `templates/CONTEXT_COMPILATION.template.md`
- Added context budget guidelines section to SPEC_CREATION_GUIDE.md
- Added context hoarding anti-pattern (#14) to SPEC_CREATION_GUIDE.md

### Decisions Made

| Decision | Rationale |
|----------|-----------|
| 4K token limit | 8x safety margin below 32K degradation threshold |
| Links for procedural | Procedural content rarely changes; links stay current |
| Rolling summary | Extractive compression preserves meaning while reducing tokens |
| 25/50/25 placement | Models recall start/end better than middle |

---

## Implementation Details

### Task 3.1: REFLECTION_LOG Schema

**Research Source**: `outputs/self-improvement-research.md`, Finding 1-2

Based on Reflexion framework and Agent Skills standard, define structured entry format:

```json
{
  "id": "refl-YYYY-MM-DD-NNN",
  "phase": "Phase N",
  "outcome": "success | partial | failure",
  "task": "Task description",
  "duration_minutes": 45,
  "reflection": {
    "what_worked": ["item1", "item2"],
    "what_failed": ["item1"],
    "key_insight": "Single most important learning",
    "pattern_candidate": {
      "name": "pattern-name",
      "description": "What it does",
      "applicability": "When to use",
      "confidence": "high | medium | low"
    }
  },
  "skill_extraction": {
    "ready_for_promotion": true | false,
    "quality_score": 82,
    "suggested_skill_name": "skill-name"
  }
}
```

**Implementation**: Add "Reflection Schema" section to SPEC_CREATION_GUIDE.md.

### Task 3.2: Quality Scoring Rubric

**Research Source**: `outputs/self-improvement-research.md`, Finding 3

8-category rubric (102 points max):

| Category | Max Points | Criteria |
|----------|------------|----------|
| Completeness | 15 | All required fields present |
| Actionability | 20 | Specific, executable recommendations |
| Reproducibility | 15 | Steps can be followed by another agent |
| Generalizability | 15 | Applies beyond current spec |
| Evidence | 15 | Backed by concrete outcomes |
| Format | 10 | Follows schema exactly |
| Integration | 12 | Links to related patterns |
| **Total** | **102** | |

**Thresholds**:
- 75+: Eligible for promotion to pattern registry
- 90+: Production-ready, consider skill file

### Task 3.3: Skill Promotion Workflow

**Research Source**: `outputs/self-improvement-research.md`, Finding 4

Workflow:
1. **Phase completion**: Prompted "What patterns should become skills?"
2. **Candidate identification**: Extract patterns with quality score
3. **Scoring**: Apply 8-category rubric
4. **Threshold check**: Score ≥75 → eligible for promotion
5. **Promotion**: Add to `specs/PATTERN_REGISTRY.md` or create SKILL.md

### Task 3.4: SKILL.md Template

Create template at `specs/templates/SKILL.template.md`:

```markdown
# Skill: {{SKILL_NAME}}

## Description
{{BRIEF_DESCRIPTION}}

## When to Use
- {{USE_CASE_1}}
- {{USE_CASE_2}}

## Instructions
1. {{STEP_1}}
2. {{STEP_2}}

## Examples

### Good Example
{{GOOD_EXAMPLE}}

### Anti-Pattern
{{ANTI_PATTERN}}

## Success Criteria
- {{CRITERION_1}}
- {{CRITERION_2}}

## Quality Score
- **Score**: {{SCORE}}/102
- **Extraction Date**: {{DATE}}
- **Source Spec**: {{SPEC_NAME}}
```

---

## Procedural Context

### Required Reading

| Topic | Documentation | Priority |
|-------|---------------|----------|
| Self-Improvement Research | `outputs/self-improvement-research.md` | HIGH |
| Existing Pattern Registry | `specs/PATTERN_REGISTRY.md` | HIGH |
| Agent Skills Standard | [github.com/anthropics/skills](https://github.com/anthropics/skills) | MEDIUM |

### Reference Implementations

| Pattern | Example | Notes |
|---------|---------|-------|
| Current reflection format | `specs/spec-creation-improvements/REFLECTION_LOG.md` | Shows existing structure |
| Pattern registry entry | `specs/PATTERN_REGISTRY.md` | Target format |

---

## Verification Commands

```bash
# Verify schema addition
grep -A 30 "Reflection Schema" specs/SPEC_CREATION_GUIDE.md

# Verify SKILL.md template
cat specs/templates/SKILL.template.md

# Verify quality rubric
grep -A 20 "Quality Scoring" specs/SPEC_CREATION_GUIDE.md
```

---

## Token Budget Verification

| Section | Budget | Estimate |
|---------|--------|----------|
| Rolling Summary | ~300 | ~280 |
| Working Context | ≤2,000 | ~850 |
| Episodic Context | ≤1,000 | ~350 |
| Semantic Context | ≤500 | ~0 |
| **Total** | **≤4,000** | ~1,480 |

---

## Next Phase Preview

**Phase 4**: DSPy-Style Agent Signatures
- Define signature format for agent prompts
- Create typed input/output specifications
- Integrate with existing orchestration patterns
