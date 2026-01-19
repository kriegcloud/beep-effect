# Rubrics: Agent Configuration Optimization

## Quality Scoring Criteria

This document defines measurable criteria for evaluating agent documentation quality.

---

## Agent Definition Quality (`.claude/agents/*.md`)

### Structure Score (0-10)

| Score | Criteria |
|-------|----------|
| 10 | All sections present, consistent order, clear headings |
| 7-9 | Minor section ordering issues |
| 4-6 | Missing 1-2 sections or inconsistent structure |
| 1-3 | Major structural issues |
| 0 | No recognizable structure |

**Required Sections**:
- Frontmatter (name, description, model, tools)
- Overview/Purpose
- Core Principles/Rules
- Workflow/Methodology
- Output Format
- Examples (if applicable)

### Conciseness Score (0-10)

| Score | Line Count | Criteria |
|-------|------------|----------|
| 10 | < 100 lines | Extremely concise, no bloat |
| 8-9 | 100-150 | Well-optimized |
| 6-7 | 150-250 | Acceptable with minor bloat |
| 4-5 | 250-400 | Significant bloat |
| 1-3 | 400-600 | Excessive verbosity |
| 0 | > 600 | Unacceptable bloat |

### Accuracy Score (0-10)

| Score | Criteria |
|-------|----------|
| 10 | All references valid, all examples work |
| 7-9 | Minor reference issues, examples mostly work |
| 4-6 | Some stale references or broken examples |
| 1-3 | Major accuracy issues |
| 0 | Predominantly inaccurate |

### Effect Compliance Score (0-10)

| Score | Criteria |
|-------|----------|
| 10 | All examples use namespace imports, `F.pipe`, Effect utilities |
| 7-9 | Minor violations (1-2 instances) |
| 4-6 | Mixed patterns (some Effect, some native) |
| 1-3 | Predominantly native JavaScript patterns |
| 0 | No Effect patterns |

---

## AGENTS.md File Quality

### Reference Validity Score (0-10)

| Score | Criteria |
|-------|----------|
| 10 | All @beep/* references resolve, all paths exist |
| 7-9 | 1-2 stale references |
| 4-6 | 3-5 stale references |
| 1-3 | 6+ stale references |
| 0 | Predominantly invalid references |

### Cleanup Score (0-10)

| Score | Criteria |
|-------|----------|
| 10 | No MCP shortcuts, no deprecated patterns |
| 7-9 | Minor cleanup needed |
| 4-6 | Some MCP shortcuts or deprecated patterns |
| 1-3 | Significant cleanup needed |
| 0 | Not cleaned up at all |

---

## Overall Quality Calculation

### Per-File Score

```
Agent Score = (Structure + Conciseness + Accuracy + Effect Compliance) / 4
AGENTS.md Score = (Reference Validity + Cleanup + Structure) / 3
```

### Aggregate Metrics

| Metric | Target | Formula |
|--------|--------|---------|
| Average Agent Score | ≥ 8.0 | Sum(Agent Scores) / Count |
| Average AGENTS.md Score | ≥ 8.0 | Sum(AGENTS.md Scores) / Count |
| Total Line Reduction | ≥ 20% | (Before - After) / Before |
| Zero Stale References | 0 | Count of broken @beep/* refs |
| Zero MCP Shortcuts | 0 | Count of MCP tool sections |

---

## Pass/Fail Thresholds

### Phase Completion Thresholds

| Phase | Required Score | Additional Criteria |
|-------|----------------|---------------------|
| P0 | N/A | Bootstrap agents improved |
| P1 | N/A | Inventory complete |
| P2 | N/A | Analysis complete |
| P3 | ≥ 7.0 avg | All files updated |
| P4 | ≥ 8.0 avg | Validation passed |

### Spec Completion Thresholds

| Criterion | Required |
|-----------|----------|
| Average Agent Score | ≥ 8.0 |
| Average AGENTS.md Score | ≥ 8.0 |
| Total Line Reduction | ≥ 20% |
| Stale References | 0 |
| MCP Shortcuts | 0 |
| Effect Compliance | 100% |

---

## Scoring Examples

### Example: Well-Optimized Agent

```markdown
File: .claude/agents/example-agent.md
Lines: 120

Structure: 10 (all sections, clear order)
Conciseness: 9 (120 lines, well within target)
Accuracy: 10 (all references valid)
Effect Compliance: 10 (namespace imports throughout)

Score: (10 + 9 + 10 + 10) / 4 = 9.75
```

### Example: Needs Improvement

```markdown
File: .claude/agents/verbose-agent.md
Lines: 450

Structure: 7 (sections present but poorly ordered)
Conciseness: 4 (450 lines, significant bloat)
Accuracy: 6 (3 stale references)
Effect Compliance: 8 (2 instances of native methods)

Score: (7 + 4 + 6 + 8) / 4 = 6.25
```

---

## Audit Checklist

### Per-Agent Checklist

- [ ] Frontmatter complete (name, description, model, tools)
- [ ] Line count < 250
- [ ] No stale @beep/* references
- [ ] All file paths exist
- [ ] Examples use namespace imports
- [ ] No native array/string methods
- [ ] Decision trees where appropriate
- [ ] Cross-references to related agents

### Per-AGENTS.md Checklist

- [ ] Package name matches directory
- [ ] No MCP tool shortcuts
- [ ] All @beep/* references valid
- [ ] Effect patterns in examples
- [ ] Required sections present (Overview, Key Exports, Dependencies)

---

## Improvement Priority Matrix

| Score Range | Priority | Action |
|-------------|----------|--------|
| 0-3 | Critical | Immediate rewrite |
| 4-5 | High | Major revision |
| 6-7 | Medium | Targeted fixes |
| 8-9 | Low | Minor polish |
| 10 | None | No action needed |

---

## Related Documentation

- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) - Full workflow
- [README.md](./README.md) - Spec overview
