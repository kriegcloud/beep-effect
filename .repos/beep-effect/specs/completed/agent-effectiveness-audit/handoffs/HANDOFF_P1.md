# Handoff: Phase 1 - Skill Quality Assessment

> Context for scoring all 45 skills using standardized quality rubric.

---

## Context

P0 established baseline metrics:
- **45 skills** inventoried with metadata
- **7 skills** missing frontmatter (blocks quality scoring)
- **3 auth skills** redundant (80% overlap)
- **2 skills** with naming inconsistencies

**Predecessor Patterns Applied**:
- Agent Overlap Scoring (85): Adapt to skill quality rubric
- Conservative Agent Consolidation (85): Score before removing

---

## Mission

Score all 45 skills on quality rubric (0-102 scale), identify top 10 and bottom 10, create improvement plan.

---

## Quality Rubric (from spec)

| Category | Weight | Criteria |
|----------|--------|----------|
| **Clarity** | 15 | Clear trigger conditions, unambiguous purpose |
| **Completeness** | 15 | Sufficient content to be actionable |
| **Accuracy** | 20 | Technically correct, follows Effect patterns |
| **Usefulness** | 25 | Provides value agents can't derive themselves |
| **Discoverability** | 15 | Name/triggers match user intent |
| **Maintenance** | 10 | Low staleness risk, minimal dependencies |

**Score Range**: 0-102 (max possible with all weights)

---

## Prerequisites

Before scoring, address:

1. **Missing Frontmatter (7 skills)**:
   - cli
   - discovery-kit
   - filesystem
   - path
   - platform-layers
   - prompt-refinement
   - research-orchestration

2. **Naming Inconsistencies (2 skills)**:
   - `Better Auth Best Practices` → `better-auth-best-practices`
   - `Create Auth Skill` → `create-auth-skill`

---

## Agent Assignments

| Agent | Task | Output |
|-------|------|--------|
| code-reviewer (×3) | Score 15 skills each against rubric | Scored skill lists |
| reflector | Synthesize scores, identify patterns | Quality analysis |
| Explore | Compare skill content to rules (redundancy) | Redundancy report |

---

## Scoring Process

1. **Batch skills into 3 groups** (15 each)
2. **Deploy 3 code-reviewer agents** in parallel
3. **Each agent scores against 6-category rubric**
4. **Reflector synthesizes** all scores
5. **Create ranked list** with improvement actions

---

## Key Files

| File | Purpose |
|------|---------|
| `outputs/skill-catalog.md` | P0 skill inventory |
| `.claude/skills/*/SKILL.md` | Skill definitions |
| `.claude/rules/effect-patterns.md` | Compare for redundancy |
| `specs/_guide/patterns/reflection-system.md` | Rubric source |

---

## Success Criteria

- [ ] All 45 skills scored
- [ ] Top 10 most valuable identified
- [ ] Bottom 10 consolidation candidates identified
- [ ] Skill improvement plan created
- [ ] `outputs/P1_QUALITY_ASSESSMENT.md` created
- [ ] `outputs/skill-rankings.md` created
- [ ] REFLECTION_LOG.md updated

---

## Deliverables

1. `outputs/P1_QUALITY_ASSESSMENT.md` - Complete assessment
2. `outputs/skill-rankings.md` - Sorted by score
3. `outputs/skill-improvement-plan.md` - Actions per skill
4. `outputs/skill-redundancy-report.md` - Skills duplicating rules

---

## Token Budget

This handoff: ~500 tokens (12% of 4K budget)

---

## Reference

- P0 findings: `outputs/P0_BASELINE.md`
- Skill catalog: `outputs/skill-catalog.md`
- Spec README: `specs/agent-effectiveness-audit/README.md`
