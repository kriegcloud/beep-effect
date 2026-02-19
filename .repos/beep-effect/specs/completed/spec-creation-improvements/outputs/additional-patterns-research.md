# Research Report: Additional Patterns

## Research Parameters
- **Topic**: Dry Runs, Pattern Registries, and Complexity Scoring
- **Date**: 2026-01-21
- **Queries Used**:
  - `AI agent dry run validation pattern registry 2025 2026`
  - `specification complexity scoring estimator task breakdown engineering`

## Executive Summary

AI agent validation in production relies on verification-aware planning, schema enforcement, and modular testing. Agent registries have emerged with five approaches (MCP Registry, A2A Agent Cards, AGNTCY, Microsoft Entra, NANDA Index). Complexity scoring for specifications adapts established software engineering techniques: Work Breakdown Structure, story points, and cyclomatic complexity metrics. These patterns enable predictable spec execution and reusable pattern libraries.

## Key Findings

### Finding 1: Verification-Aware Planning for Validation

**Source**: [Prompt Engineering - Agents at Work 2026](https://promptengineering.org/agents-at-work-the-2026-playbook-for-building-reliable-agentic-workflows/)
**Credibility**: HIGH (Technical guide)
**Summary**: "Verification-aware planning" encodes pass-fail checks for each subtask:
- Agents proceed or halt based on verification results
- VeriMAP (arXiv) formalizes this approach
- Each step has explicit success criteria

This is the "dry run" equivalent for AI agents—validate before executing irreversible actions.

**Relevance to beep-effect**: Each phase should have verification steps defined upfront. Handoff only proceeds if verification passes.

---

### Finding 2: Five Agent Registry Approaches

**Source**: [arXiv:2508.03095 - Evolution of AI Agent Registry Solutions](https://arxiv.org/abs/2508.03095)
**Credibility**: HIGH (Academic paper)
**Summary**: Five registry approaches for agent discovery:
1. **MCP Registry**: Centralized publication of mcp.json descriptors
2. **A2A Agent Cards**: Decentralized self-describing JSON manifests
3. **AGNTCY Agent Directory Service**: Open directory
4. **Microsoft Entra Agent ID**: Enterprise SaaS with zero-trust
5. **NANDA Index AgentFacts**: Cryptographically verifiable facts

Key insight: Each agent needs model ID, version, intended purpose, performance expectations, and validation history.

**Relevance to beep-effect**: Pattern registry should capture pattern ID, source spec, applicable contexts, and validation status.

---

### Finding 3: Schema Validation for Reliable Outputs

**Source**: [PWC - Validating Multi-Agent AI Systems](https://www.pwc.com/us/en/services/audit-assurance/library/validating-multi-agent-ai-systems.html)
**Credibility**: HIGH (Big Four consulting firm)
**Summary**: Schema drift is top cause of broken automations:
- OpenAI and Anthropic provide Structured Outputs for schema enforcement
- Keeps every step machine-parseable
- Enables validations before data moves on

Best practice: Define output schema for each agent/phase, validate before proceeding.

**Relevance to beep-effect**: Phase outputs should have defined schemas. Handoffs validate against schema before acceptance.

---

### Finding 4: Work Breakdown Structure for Complexity

**Source**: [GeeksforGeeks - Software Testing Estimation](https://www.geeksforgeeks.org/software-testing/software-testing-estimation-techniques/)
**Credibility**: HIGH (Technical reference)
**Summary**: Work Breakdown Structure (WBS) technique:
- Divide complex projects into modules
- Modules into sub-modules
- Sub-modules into functionality
- Continue until smallest independent tasks

Top-down approach, used when team isn't confident in estimates. Breaks down uncertainty into manageable pieces.

**Relevance to beep-effect**: Spec phases are WBS. Complexity = sum of task complexities at leaf level.

---

### Finding 5: Story Points for Relative Estimation

**Source**: [Atlassian - Story Points in Agile](https://www.atlassian.com/agile/project-management/estimation)
**Credibility**: HIGH (Industry standard reference)
**Summary**: Story points assess:
- **Effort**: How much work?
- **Complexity**: How hard technically?
- **Risk/Uncertainty**: How unknown?

Values are relative, not absolute. Fibonacci sequence (1, 2, 3, 5, 8, 13) common.

Benefits:
- Encourages team collaboration
- Reduces emotional bias
- Improves forecasting over time

**Relevance to beep-effect**: Spec complexity could use modified story points: effort + technical complexity + uncertainty.

---

### Finding 6: Cyclomatic Complexity Adaptation

**Source**: [The Valuable Dev - Complexity Metrics](https://thevaluable.dev/complexity-metrics-software/)
**Credibility**: HIGH (Technical analysis)
**Summary**: Research on complexity metrics ongoing since 1970s. Key insights:
- High cyclomatic complexity correlates with error-prone code
- Multiple metrics needed—no single measure captures all
- Complexity predicts maintenance difficulty

Factors for spec complexity:
- Number of conditional transitions
- Number of agents involved
- Cross-package dependencies
- External integrations

**Relevance to beep-effect**: Create multi-factor complexity score, not single metric.

---

### Finding 7: Project Complexity Determination

**Source**: [PMI - Project Complexity and Rigor](https://www.pmi.org/learning/library/project-complexity-determine-rigor-9874)
**Credibility**: HIGH (Project Management Institute)
**Summary**: Project complexity determines required rigor level:
- Technical competencies needed
- Skills constellation required
- Risk management approach

More complex projects need:
- More detailed planning
- More frequent checkpoints
- More formal documentation

**Relevance to beep-effect**: High-complexity specs need more phases, more verification, stricter handoff protocols.

---

### Finding 8: Agent Evaluation Best Practices

**Source**: [Efficient Coder - AI Agent Evaluations Guide](https://www.xugj520.cn/en/archives/ai-agent-evaluations-guide-2025.html)
**Credibility**: HIGH (Technical guide)
**Summary**: Good evaluations turn vague feelings into measurable signals:
- Define concrete metrics per task
- Build verification into the plan
- Use observability for debugging

Key stat: 89% of teams with production agents have implemented observability (vs. 52% for evals).

**Relevance to beep-effect**: Each phase needs observable metrics. Success criteria must be measurable.

---

## Cross-Reference Analysis

| Type | Notes |
|------|-------|
| **Consensus** | All sources agree on explicit verification before proceeding. Schema validation is essential. Multi-factor complexity beats single metrics. |
| **Conflicts** | Story points (relative) vs. cyclomatic complexity (absolute). Resolution: Use relative for planning, absolute factors for scoring. |
| **Gaps** | No research on spec-specific complexity formulas. Need to develop and calibrate based on beep-effect experience. |

## Practical Examples

### Spec Complexity Calculator

```markdown
## Complexity Scoring Formula

### Factors

| Factor | Weight | Scale | Description |
|--------|--------|-------|-------------|
| Phase Count | 2 | 1-10 | Number of phases in spec |
| Agent Diversity | 3 | 1-5 | Unique agents involved |
| Cross-Package | 4 | 0-5 | Packages touched outside spec domain |
| External Dependencies | 3 | 0-5 | External APIs, services |
| Uncertainty | 5 | 1-5 | Unknown requirements, novel patterns |
| Research Required | 2 | 0-5 | External research phases |

### Calculation

```
Complexity Score =
  (Phase Count × 2) +
  (Agent Diversity × 3) +
  (Cross-Package × 4) +
  (External Dependencies × 3) +
  (Uncertainty × 5) +
  (Research Required × 2)
```

### Thresholds

| Score | Complexity | Recommended Phases | Checkpoint Frequency |
|-------|------------|-------------------|---------------------|
| 0-20 | Low | 2-3 | Per-phase |
| 21-40 | Medium | 3-5 | Per-phase + mid-phase |
| 41-60 | High | 5-7 | Per-task |
| 61+ | Critical | 7+ | Continuous |
```

### Example Calculation: spec-creation-improvements

```
Factor: Phase Count = 6 phases → 6 × 2 = 12
Factor: Agent Diversity = 5 agents → 5 × 3 = 15
Factor: Cross-Package = 1 (specs only) → 1 × 4 = 4
Factor: External Dependencies = 0 → 0 × 3 = 0
Factor: Uncertainty = 3 (research-driven) → 3 × 5 = 15
Factor: Research Required = 4 (Phase 0 heavy) → 4 × 2 = 8

Total: 12 + 15 + 4 + 0 + 15 + 8 = 54

Classification: High Complexity
Recommendation: 5-7 phases, per-task checkpoints
```

### Pattern Registry Structure

```markdown
# Pattern Registry

## Pattern: year-filtered-search

### Metadata
| Field | Value |
|-------|-------|
| ID | `pattern-2026-001` |
| Source Spec | `spec-creation-improvements` |
| Discovered | Phase 0 |
| Confidence | HIGH |
| Quality Score | 82/102 |

### Description
Always include year filter (2025/2026) in research queries to improve relevance.

### Applicable When
- Research phases of any specification
- External documentation gathering
- Trend validation

### Example
```
// Before
"AI agent memory patterns"

// After
"AI agent memory patterns 2025 2026"
```

### Validation
- Tested in spec-creation-improvements Phase 0
- Reduced irrelevant results by ~60%
- Cross-validated with 3+ successful research tasks

### Related Patterns
- `parallel-search-consolidation`
- `source-credibility-rating`
```

### Verification-Aware Handoff Protocol

```markdown
## Phase 2 → Phase 3 Handoff Verification

### Pre-Handoff Checklist

| Check | Criteria | Status |
|-------|----------|--------|
| Output exists | `outputs/context-engineering-update.md` created | [ ] |
| Schema valid | Matches HANDOFF_SCHEMA.json | [ ] |
| Sources count | ≥5 HIGH credibility sources cited | [ ] |
| Cross-reference | Consensus/conflicts documented | [ ] |
| Recommendations | P0/P1/P2 priorities assigned | [ ] |

### Verification Script
```bash
#!/bin/bash
# verify-phase2.sh

# Check output exists
[ -f "outputs/context-engineering-update.md" ] || exit 1

# Validate schema
bun run validate-handoff --file outputs/context-engineering-update.md

# Count HIGH sources
HIGH_COUNT=$(grep -c "Credibility.*HIGH" outputs/context-engineering-update.md)
[ "$HIGH_COUNT" -ge 5 ] || exit 1

echo "Phase 2 verification passed"
```

### Failure Protocol
If verification fails:
1. Document failure reason in REFLECTION_LOG.md
2. Return to Phase 2 for remediation
3. Do NOT proceed to Phase 3
```

## Recommendations for beep-effect

| Priority | Recommendation | Implementation Notes |
|----------|----------------|---------------------|
| P0 | Add complexity calculator to SPEC_CREATION_GUIDE.md | Use multi-factor formula above |
| P0 | Define verification checklist per phase | Schema + criteria + script |
| P1 | Create `specs/PATTERN_REGISTRY.md` | Start with patterns from this spec |
| P1 | Add quality scoring to reflection entries | 102-point rubric |
| P2 | Automate verification scripts | Per-phase validation |
| P2 | Track complexity calibration data | Improve formula over time |

## Sources

### High Credibility (7 sources)
- [Prompt Engineering - Agents at Work 2026](https://promptengineering.org/agents-at-work-the-2026-playbook-for-building-reliable-agentic-workflows/) - Verification-aware planning
- [arXiv:2508.03095 - Agent Registries](https://arxiv.org/abs/2508.03095) - Five registry approaches
- [PWC - Validating Multi-Agent AI Systems](https://www.pwc.com/us/en/services/audit-assurance/library/validating-multi-agent-ai-systems.html) - Schema validation
- [Atlassian - Story Points](https://www.atlassian.com/agile/project-management/estimation) - Relative estimation
- [The Valuable Dev - Complexity Metrics](https://thevaluable.dev/complexity-metrics-software/) - Metric analysis
- [PMI - Project Complexity](https://www.pmi.org/learning/library/project-complexity-determine-rigor-9874) - Complexity-rigor relationship
- [GeeksforGeeks - Testing Estimation](https://www.geeksforgeeks.org/software-testing/software-testing-estimation-techniques/) - WBS technique

### Medium Credibility
- [Efficient Coder - AI Agent Evaluations](https://www.xugj520.cn/en/archives/ai-agent-evaluations-guide-2025.html) - Evaluation practices
- [Machine Learning Mastery - Agentic AI Trends 2026](https://machinelearningmastery.com/7-agentic-ai-trends-to-watch-in-2026/) - Industry context
- [LangChain - State of Agent Engineering](https://www.langchain.com/state-of-agent-engineering) - Production statistics
