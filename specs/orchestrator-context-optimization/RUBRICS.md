# Evaluation Rubrics: Orchestrator Context Optimization

> Scoring criteria for evaluating orchestrator context management effectiveness.

---

## Overview

This document defines evaluation criteria for measuring the success of orchestrator context optimization. Use these rubrics to:

1. **Assess current state** during Phase 0 (Analysis)
2. **Validate improvements** during Phase 3 (Validation)
3. **Measure ongoing compliance** in future spec executions

---

## Primary Metrics

### 1. Delegation Compliance Score

**Definition**: Percentage of research/code tasks delegated to appropriate sub-agents.

| Score | Range | Description |
|-------|-------|-------------|
| 5 | > 90% | Exemplary - nearly all tasks delegated |
| 4 | 75-90% | Good - most tasks delegated, minor lapses |
| 3 | 50-74% | Acceptable - some direct work, needs improvement |
| 2 | 25-49% | Poor - significant direct work by orchestrator |
| 1 | < 25% | Failing - orchestrator doing most work directly |

**Measurement Method**:
- Count total research/code tasks in a phase
- Count tasks delegated to sub-agents
- Calculate: `(delegated / total) * 100`

**Evidence Required**:
- List of tasks with delegation status
- Sub-agent tool calls in conversation history
- Any direct work justified with rationale

---

### 2. Phase Completion Rate

**Definition**: Percentage of phases completed without context exhaustion.

| Score | Range | Description |
|-------|-------|-------------|
| 5 | > 95% | Exemplary - phases consistently complete |
| 4 | 85-95% | Good - rare context issues |
| 3 | 70-84% | Acceptable - occasional context stress |
| 2 | 50-69% | Poor - frequent context exhaustion |
| 1 | < 50% | Failing - most phases exhaust context |

**Measurement Method**:
- Count total phases attempted
- Count phases completed without context exhaustion or emergency checkpoint
- Calculate: `(completed / total) * 100`

**Evidence Required**:
- Phase completion timestamps
- Checkpoint events logged
- Context exhaustion incidents documented

---

### 3. Context Budget Adherence

**Definition**: Orchestrator stays within defined context budget limits.

| Score | Range | Description |
|-------|-------|-------------|
| 5 | Always Green | Never exceeded 50% of any limit |
| 4 | Mostly Green | Occasionally Yellow, never Red |
| 3 | Mixed | Reached Yellow multiple times, no Red |
| 2 | Yellow Dominant | Frequently Yellow, occasional Red with recovery |
| 1 | Red Frequent | Multiple Red Zone violations |

**Budget Thresholds**:
- Green: < 50% of any limit
- Yellow: 50-75% of any limit
- Red: > 75% of any limit

**Measurement Method**:
- Track tool calls, file reads, delegations per phase
- Record highest zone reached
- Note any Red Zone incidents

---

### 4. Checkpoint Quality

**Definition**: Quality and timeliness of checkpoint/handoff documents.

| Score | Criteria |
|-------|----------|
| 5 | Proactive checkpoints before limits; complete context; easy resume |
| 4 | Timely checkpoints at Yellow Zone; good context; minor gaps |
| 3 | Checkpoints at limits; adequate context; some missing details |
| 2 | Late checkpoints under stress; incomplete context; difficult resume |
| 1 | No checkpoints; context lost; cannot resume effectively |

**Evaluation Checklist**:
- [ ] Checkpoint created before Red Zone (proactive)
- [ ] Completed work clearly listed
- [ ] In-progress work state documented
- [ ] Remaining work itemized
- [ ] Resume instructions provided
- [ ] Sub-agent outputs referenced

---

### 5. Phase Sizing Compliance

**Definition**: Phases adhere to sizing constraints.

| Score | Criteria |
|-------|----------|
| 5 | All phases have 5-6 items; splits done proactively |
| 4 | Phases have 5-7 items; splits done when needed |
| 3 | Some phases have 7-8 items; occasional oversizing |
| 2 | Multiple phases exceed 8 items; reactive splits |
| 1 | No sizing discipline; unbounded phases |

**Thresholds**:
- Optimal: 5-6 work items per phase
- Acceptable: 7 work items
- Split required: 8+ work items

---

## Composite Scoring

### Overall Orchestrator Effectiveness Score

Calculate weighted average:

| Metric | Weight |
|--------|--------|
| Delegation Compliance | 30% |
| Phase Completion Rate | 25% |
| Context Budget Adherence | 20% |
| Checkpoint Quality | 15% |
| Phase Sizing Compliance | 10% |

**Formula**: `(D * 0.30) + (P * 0.25) + (B * 0.20) + (C * 0.15) + (S * 0.10)`

### Interpretation

| Score | Rating | Action |
|-------|--------|--------|
| 4.5-5.0 | Excellent | Maintain current practices |
| 3.5-4.4 | Good | Minor refinements needed |
| 2.5-3.4 | Acceptable | Targeted improvements required |
| 1.5-2.4 | Poor | Significant changes needed |
| 1.0-1.4 | Failing | Complete methodology overhaul |

---

## Evaluation Templates

### Phase Evaluation Template

Use this template at the end of each phase:

```markdown
# Phase [N] Evaluation

**Date**: YYYY-MM-DD
**Evaluator**: [orchestrator/reviewer]

## Delegation Compliance
- Total tasks: N
- Delegated tasks: N
- Delegation rate: X%
- Score: [1-5]
- Notes: [specific observations]

## Context Budget
- Direct tool calls: X/20
- Large file reads: X/5
- Sub-agent delegations: X/10
- Highest zone reached: [Green/Yellow/Red]
- Score: [1-5]
- Notes: [specific observations]

## Phase Sizing
- Work items planned: N
- Work items executed: N
- Phase split required: Y/N
- Score: [1-5]
- Notes: [specific observations]

## Checkpoint Quality
- Checkpoints created: N
- Checkpoint timing: [Proactive/Reactive/None]
- Score: [1-5]
- Notes: [specific observations]

## Composite Score
[Calculate weighted average]

## Recommendations
[Specific improvements for next phase]
```

---

### Spec-Level Evaluation Template

Use this template at spec completion:

```markdown
# Spec Evaluation: [Spec Name]

**Evaluation Date**: YYYY-MM-DD
**Total Phases**: N
**Total Sessions**: N

## Metric Summary

| Metric | Score | Evidence |
|--------|-------|----------|
| Delegation Compliance | X/5 | [summary] |
| Phase Completion Rate | X/5 | X/N phases |
| Context Budget Adherence | X/5 | [zone summary] |
| Checkpoint Quality | X/5 | [summary] |
| Phase Sizing Compliance | X/5 | [summary] |

## Composite Score: X.X/5.0

## Strengths
- [What worked well]

## Areas for Improvement
- [What needs work]

## Methodology Refinements
- [Specific changes to apply in future specs]

## REFLECTION_LOG Updates
- [Learnings to add to reflection log]
```

---

## Anti-Pattern Detection Rubric

Use this rubric to identify specific anti-patterns during evaluation:

### Anti-Pattern 1: Inline Research

**Detection Criteria**:
- 5+ sequential Glob/Grep/Read operations by orchestrator
- No codebase-researcher delegation for exploration tasks
- Research results written inline rather than captured by sub-agent

**Severity**:
- Mild: 5-10 direct tool calls for research
- Moderate: 10-20 direct tool calls
- Severe: 20+ direct tool calls

**Score Impact**: -0.5 to -1.5 on Delegation Compliance

---

### Anti-Pattern 2: Unbounded Phases

**Detection Criteria**:
- Phase has 8+ work items
- No sub-phases defined (P[N]a, P[N]b)
- Multiple large tasks in single phase

**Severity**:
- Mild: 8-9 items, could be split
- Moderate: 10-12 items, should have been split
- Severe: 13+ items, egregious oversizing

**Score Impact**: -0.5 to -1.5 on Phase Sizing Compliance

---

### Anti-Pattern 3: Late Checkpointing

**Detection Criteria**:
- Checkpoint created in Red Zone
- "Context is getting long" language in checkpoint
- Incomplete or rushed checkpoint content

**Severity**:
- Mild: Checkpoint at 75% limit
- Moderate: Checkpoint at 90% limit
- Severe: Checkpoint after context issues

**Score Impact**: -0.5 to -1.5 on Checkpoint Quality

---

### Anti-Pattern 4: Direct Code Writing

**Detection Criteria**:
- Source code written directly by orchestrator
- No effect-code-writer or test-writer delegation
- Code patterns inconsistent with codebase standards

**Severity**:
- Mild: < 50 lines written directly
- Moderate: 50-200 lines written directly
- Severe: 200+ lines written directly

**Score Impact**: -1.0 to -2.0 on Delegation Compliance

---

## Baseline Measurements

### Pre-Spec Baseline (Estimated)

Based on observations from `knowledge-graph-integration` and similar specs:

| Metric | Baseline | Target |
|--------|----------|--------|
| Delegation Compliance | ~30% | > 90% |
| Phase Completion Rate | ~60% | > 95% |
| Context Budget Adherence | Yellow/Red common | Mostly Green |
| Checkpoint Quality | Reactive | Proactive |
| Phase Sizing | 8-12 items/phase | 5-7 items/phase |

### Post-Spec Target

After implementing orchestrator context optimization:

| Metric | Target | Measurement Point |
|--------|--------|-------------------|
| Delegation Compliance | > 90% | Next 3 specs |
| Phase Completion Rate | > 95% | Next 3 specs |
| Context Budget Adherence | Score 4+ | Each phase |
| Checkpoint Quality | Score 4+ | Each phase |
| Phase Sizing | Score 4+ | Each spec |

---

## Validation Protocol

### Phase 3 Validation Steps

1. **Review Updated Documentation**
   - Run spec-reviewer on SPEC_CREATION_GUIDE.md
   - Run spec-reviewer on HANDOFF_STANDARDS.md
   - Score documentation clarity

2. **Simulated Orchestration Test**
   - Execute mini-task following new rules
   - Track all metrics
   - Compare to baseline

3. **Expert Review**
   - Human review of rule clarity
   - Identification of edge cases
   - Recommendations for refinement

4. **Final Scoring**
   - Apply rubrics to validation results
   - Calculate composite score
   - Determine if spec is production-ready

### Production Readiness Criteria

The spec is production-ready when:
- [ ] Documentation review score: 4.0+
- [ ] Simulated test demonstrates delegation works
- [ ] No critical anti-patterns detected
- [ ] All deliverables exist and are complete
- [ ] REFLECTION_LOG has meaningful learnings

---

## Continuous Monitoring

After spec completion, monitor ongoing effectiveness:

### Monthly Review

- Count specs executed with new methodology
- Calculate average delegation compliance
- Track context exhaustion incidents
- Update methodology if patterns emerge

### Quarterly Assessment

- Full rubric evaluation of 3 sample specs
- Trend analysis of key metrics
- Methodology refinement proposals
- Update SPEC_CREATION_GUIDE as needed
