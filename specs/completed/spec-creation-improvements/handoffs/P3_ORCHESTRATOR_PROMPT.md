# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 execution.

---

## Pre-Flight Checklist

Before executing this phase, verify:
- [ ] Phase 2 deliverables exist (tiered memory model in HANDOFF_STANDARDS.md, CONTEXT_COMPILATION.template.md)
- [ ] Context budget guidelines in SPEC_CREATION_GUIDE.md
- [ ] REFLECTION_LOG.md has Phase 2 learnings

---

## Prompt

You are executing Phase 3 (Structured Self-Improvement) of the Spec Creation Improvements spec.

### Context

Phase 1 implemented foundation files (llms.txt, state machine, complexity calculator, pattern registry). Phase 2 implemented tiered context architecture (Working/Episodic/Semantic/Procedural memory model, 4K token budget, context hoarding anti-pattern). Phase 3 implements structured self-improvement based on Reflexion pattern and Agent Skills standard.

### Your Mission

Implement skill-extractable reflection format and automatic promotion workflow.

### Deliverables

1. "Reflection Schema" section in `specs/SPEC_CREATION_GUIDE.md`
2. Quality scoring rubric (8 categories, 102 points max)
3. Skill promotion workflow documentation
4. `specs/templates/SKILL.template.md`

### Implementation Tasks

**Task 3.1: Add Reflection Schema to SPEC_CREATION_GUIDE.md**

Read `outputs/self-improvement-research.md` for structured entry format (Finding 1-2).

Add new "Reflection Schema" section with:
- JSON schema for structured entries
- Required fields (id, phase, outcome, task, reflection object)
- Pattern candidate extraction format
- Skill extraction readiness fields

**Task 3.2: Add Quality Scoring Rubric**

Add to `specs/SPEC_CREATION_GUIDE.md`:
- 8-category rubric (102 points max)
- Scoring criteria per category
- Promotion thresholds (75+ for registry, 90+ for skill file)

**Task 3.3: Define Skill Promotion Workflow**

Add to `specs/SPEC_CREATION_GUIDE.md`:
- Workflow steps (extraction → scoring → threshold check → promotion)
- Phase completion prompt ("What patterns should become skills?")
- Promotion destinations (PATTERN_REGISTRY.md or SKILL.md)

**Task 3.4: Create SKILL.md Template**

Create `specs/templates/SKILL.template.md` with:
- Skill name and description sections
- When to use guidelines
- Step-by-step instructions
- Good example / anti-pattern sections
- Quality score metadata

### Critical Patterns

**Reflection Entry Schema**:
```json
{
  "id": "refl-YYYY-MM-DD-NNN",
  "phase": "Phase N",
  "outcome": "success | partial | failure",
  "task": "Task description",
  "reflection": {
    "what_worked": [],
    "what_failed": [],
    "key_insight": "",
    "pattern_candidate": {
      "name": "",
      "description": "",
      "applicability": "",
      "confidence": "high | medium | low"
    }
  },
  "skill_extraction": {
    "ready_for_promotion": true | false,
    "quality_score": 0,
    "suggested_skill_name": ""
  }
}
```

**Quality Rubric**:
```markdown
| Category | Max Points |
|----------|------------|
| Completeness | 15 |
| Actionability | 20 |
| Reproducibility | 15 |
| Generalizability | 15 |
| Evidence | 15 |
| Format | 10 |
| Integration | 12 |
| **Total** | **102** |
```

**Promotion Thresholds**:
- 75+: Eligible for PATTERN_REGISTRY.md
- 90+: Production-ready, create SKILL.md file

### Reference Files

- Research: `outputs/self-improvement-research.md`
- Target: `specs/SPEC_CREATION_GUIDE.md`
- Pattern registry: `specs/PATTERN_REGISTRY.md`
- Template location: `specs/templates/SKILL.template.md` (create)

### Verification

```bash
# Verify reflection schema added
grep -A 30 "Reflection Schema" specs/SPEC_CREATION_GUIDE.md

# Verify quality rubric added
grep -A 20 "Quality Scoring" specs/SPEC_CREATION_GUIDE.md

# Verify SKILL.md template created
cat specs/templates/SKILL.template.md
```

### Success Criteria

- [ ] REFLECTION_LOG schema defined with required fields
- [ ] Quality scoring rubric (8 categories, 102 points max)
- [ ] Skill promotion threshold defined (75+ for registry)
- [ ] SKILL.md template created
- [ ] REFLECTION_LOG.md updated with Phase 3 learnings
- [ ] HANDOFF_P4.md updated
- [ ] P4_ORCHESTRATOR_PROMPT.md updated

### Handoff Document

Read full context in: `specs/spec-creation-improvements/handoffs/HANDOFF_P3.md`

### Next Phase

After completing Phase 3:
1. Update `REFLECTION_LOG.md` with learnings
2. Update `handoffs/HANDOFF_P4.md`
3. Update `handoffs/P4_ORCHESTRATOR_PROMPT.md`
