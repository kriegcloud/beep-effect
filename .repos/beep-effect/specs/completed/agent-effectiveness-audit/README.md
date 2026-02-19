# Agent Effectiveness Audit

> Systematic measurement and improvement of agent infrastructure effectiveness following rationalization, validating optimizations and identifying remaining gaps.

---

## Executive Summary

This spec follows the completed `agent-infrastructure-rationalization` spec, which achieved:
- Agent consolidation (31 → 27 agents, 1 merge)
- IDE sync standardization (symlinks to `.claude/`)
- Unused directory cleanup (`.codex/`, `.opencode/` removed)
- 10 patterns promoted to PATTERN_REGISTRY.md

However, the rationalization spec identified several metrics that could not be validated without usage data, and subsequent analysis reveals remaining optimization opportunities.

### Validated Gaps (from Reflection Synthesis)

| Gap | Evidence | Impact |
|-----|----------|--------|
| **No agent usage tracking** | P0 noted "no usage tracking gap" | Cannot measure effectiveness |
| **Hook optimization incomplete** | 5,500 tokens/prompt (40% above 4K target) | Context degradation |
| **Agent confusion rate unmeasured** | 58% historical rate, no post-rationalization measurement | Selection errors persist |
| **Skill quality unscored** | 53 skills, 0 quality assessments | Unknown value-add |
| **Pattern adoption still low** | 10 patterns promoted, adoption unmeasured | Learnings not applied |
| **Context file quality unknown** | `context/` directory created, not validated | Potential staleness |

### Target Outcomes

| Metric | Current | Target | Method |
|--------|---------|--------|--------|
| Agent usage visibility | None | 100% tracked | Hook-based telemetry |
| Token per prompt | ~5,500 | ≤4,000 | Lazy loading, compression |
| Agent confusion rate | 58% (historical) | <20% | Capability matrix + docs |
| Skill coverage score | Unknown | Measured for all | Quality rubric |
| Pattern adoption | Unknown | ≥30% | Automated detection |
| Context freshness | Unknown | <30 days stale | Automated refresh |

---

## Problem Statement

### Current State (Post-Rationalization)

```
Agent Infrastructure (Rationalized State)
├── .claude/                    # PRIMARY - 27 agents, 5 rules, 36+ skills
│   ├── agents/ (27 files)      # Consolidated from 28, all in manifest
│   ├── skills/ (36+ dirs)      # Single source of truth
│   ├── rules/ (5 files)        # Added meta-thinking, code-standards
│   └── hooks/ (4 systems)      # Startup context: ~5,500 tokens
├── .cursor/rules/ (5 files)    # Synced from .claude/rules/
├── .windsurf/                   # Symlinks to .claude/
│   ├── rules/ → .claude/rules/
│   └── skills/ → .claude/skills/
└── context/                     # NEW from agent-context-optimization
    ├── effect/                  # Effect module patterns
    ├── platform/                # Platform patterns
    └── internal/                # Repo-specific context
```

### Remaining Pain Points

| Issue | Impact | Evidence |
|-------|--------|----------|
| **Blind optimization** | Cannot validate improvements | No usage telemetry |
| **Prompt bloat** | Context degradation at 5K+ | P0 measured 5,500 tokens |
| **Skill discovery** | Unknown value of 53 skills | No quality scores |
| **Stale context** | Potential misinformation | No freshness checks |
| **Confusion persistence** | Agent selection errors | No post-fix measurement |
| **Manual pattern application** | Low adoption despite registry | No automation |

---

## Success Criteria

### Primary Metrics (Required)

- [x] **SC-1**: Agent usage telemetry implemented (which agents called, when, success rate)
- [x] **SC-2**: Per-prompt token count reduced to ≤4,000 (98% I/O reduction achieved)
- [x] **SC-3**: All 45 skills scored on quality rubric (mean 94.6/102)
- [ ] **SC-4**: Agent confusion rate measured and ≤20% in test scenarios (requires manual testing)
- [x] **SC-5**: Context file freshness validation automated

### Secondary Metrics (Desired)

- [ ] **SC-6**: Top 10 skills have usage documentation
- [ ] **SC-7**: Pattern adoption automation (detect when applicable)
- [ ] **SC-8**: Agent capability matrix discoverable in ≤1 navigation step
- [ ] **SC-9**: Hook startup time reduced by ≥20%

---

## Phase Overview

| Phase | Focus | Agents | Deliverables | Duration |
|-------|-------|--------|--------------|----------|
| **P0** | Baseline Measurement | Explore (×3 parallel) | Usage audit, token audit, skill inventory | 1 session |
| **P1** | Skill Quality Assessment | code-reviewer, reflector | Quality scores, coverage gaps, improvement plan | 1 session |
| **P2** | Hook Optimization | codebase-researcher, doc-writer | Optimized hooks, lazy loading, token reduction | 1 session |
| **P3** | Telemetry Implementation | effect-code-writer, test-writer | Usage tracking hooks, dashboard | 1-2 sessions |
| **P4** | Context Freshness Automation | doc-writer, Bash agent | Refresh scripts, staleness detection | 1 session |
| **P5** | Verification & Documentation | architecture-pattern-enforcer, reflector | Final metrics, updated docs | 1 session |

---

## Phase Details

### P0: Baseline Measurement

**Objective**: Establish precise baseline metrics for agent effectiveness.

**Entry Criteria**: None (starting phase)

**Exit Criteria**:
- [ ] Token count per prompt measured (from hook output)
- [ ] All 27 agents cataloged with trigger patterns
- [ ] All 53 skills inventoried with usage indicators
- [ ] Context file inventory with last-modified dates
- [ ] Baseline metrics in `outputs/P0_BASELINE.md`

**Agent Assignments**:

| Agent | Task | Output |
|-------|------|--------|
| Explore (token audit) | Analyze `.claude/hooks/` output, measure per-prompt tokens | Token breakdown |
| Explore (agent triggers) | Catalog agent trigger patterns from manifest + definitions | Trigger matrix |
| Explore (skill inventory) | Map all skills with descriptions, trigger patterns | Skill catalog |

**Deliverables**:
- `outputs/P0_BASELINE.md` - Complete baseline metrics
- `outputs/token-breakdown.md` - Token cost per component
- `outputs/agent-trigger-matrix.md` - When each agent activates
- `outputs/skill-catalog.md` - All skills with metadata

---

### P1: Skill Quality Assessment

**Objective**: Score all skills using standardized quality rubric.

**Entry Criteria**: P0 complete with skill catalog

**Exit Criteria**:
- [ ] Quality rubric defined (adapting from `specs/_guide/patterns/reflection-system.md`)
- [ ] All 53 skills scored
- [ ] Top 10 most valuable skills identified
- [ ] Bottom 10 candidates for removal/consolidation identified
- [ ] Skill improvement plan created

**Quality Rubric Categories** (adapted from reflection system):

| Category | Weight | Criteria |
|----------|--------|----------|
| Clarity | 15 | Clear trigger conditions, unambiguous purpose |
| Completeness | 15 | Sufficient content to be actionable |
| Accuracy | 20 | Technically correct, follows Effect patterns |
| Usefulness | 25 | Provides value agents can't derive themselves |
| Discoverability | 15 | Name/triggers match user intent |
| Maintenance | 10 | Low staleness risk, minimal dependencies |

**Agent Assignments**:

| Agent | Task | Output |
|-------|------|--------|
| code-reviewer | Score skills against rubric (batch of 18 each) | Scored skill list |
| reflector | Synthesize scores, identify patterns | Quality analysis |
| Explore | Compare skill content to rules (redundancy check) | Redundancy report |

**Deliverables**:
- `outputs/P1_QUALITY_ASSESSMENT.md` - All skills with scores
- `outputs/skill-rankings.md` - Sorted by score
- `outputs/skill-improvement-plan.md` - Actions per skill

---

### P2: Hook Optimization

**Objective**: Reduce per-prompt token count from ~5,500 to ≤4,000.

**Entry Criteria**: P0 token breakdown complete

**Exit Criteria**:
- [ ] Hook startup flow documented
- [ ] Token reduction opportunities identified (≥30% potential)
- [ ] Lazy loading implemented for large context
- [ ] Optimized hooks pass verification
- [ ] Token count validated at ≤4,000

**Optimization Strategies** (from rationalization reflection):

| Strategy | Token Savings | Implementation |
|----------|---------------|----------------|
| Lazy skill loading | ~1,000 | Load only on trigger match |
| Context compression | ~500 | Extractive summarization |
| Deduplication | ~300 | Remove rules duplicated in skills |
| Index-based navigation | ~200 | Replace inline content with links |

**Key Hook Files**:
- `.claude/hooks/startup.ts` - Main startup hook
- `.claude/hooks/session-context.ts` - Session context generator
- `.claude/hooks/user-prompt-submit.ts` - Per-prompt hook

**Agent Assignments**:

| Agent | Task | Output |
|-------|------|--------|
| codebase-researcher | Analyze hook flow, identify optimization points | Hook analysis |
| doc-writer | Create optimized hook implementations | Modified hooks |
| Explore | Validate token count post-optimization | Validation report |

**Deliverables**:
- `outputs/P2_HOOK_OPTIMIZATION.md` - Analysis and changes
- `outputs/hook-flow-diagram.md` - Visual flow with token costs
- Modified `.claude/hooks/` files (with backup)

---

### P3: Telemetry Implementation

**Objective**: Implement agent usage tracking for effectiveness measurement.

**Entry Criteria**: P2 hook optimization complete

**Exit Criteria**:
- [ ] Usage telemetry hook implemented
- [ ] Agent call logging functional (which agent, when, duration)
- [ ] Success/failure tracking for agent tasks
- [ ] Simple dashboard/report generation
- [ ] Privacy-respecting design (no content logging)

**Telemetry Design**:

```typescript
interface AgentUsageEvent {
  timestamp: DateTime.Utc;
  agentType: string;
  triggeredBy: "explicit" | "suggested" | "auto";
  duration: Duration;
  outcome: "success" | "partial" | "failed";
  tokensBefore: number;
  tokensAfter: number;
}
```

**Implementation Approach**:
- Hook into Task tool invocations
- Write to `.claude/.telemetry/usage.jsonl`
- Provide `bun run agents:usage-report` command

**Agent Assignments**:

| Agent | Task | Output |
|-------|------|--------|
| effect-code-writer | Implement telemetry hook | Hook code |
| test-writer | Create telemetry tests | Test file |
| doc-writer | Document telemetry usage | Documentation |

**Deliverables**:
- `outputs/P3_TELEMETRY.md` - Implementation summary
- `.claude/hooks/telemetry.ts` - Telemetry hook
- `tooling/cli/src/commands/agents-usage-report/` - Report command

---

### P4: Context Freshness Automation

**Objective**: Automate detection and refresh of stale context files.

**Entry Criteria**: P3 telemetry functional

**Exit Criteria**:
- [ ] Freshness check script implemented
- [ ] Staleness threshold defined (30 days default)
- [ ] Refresh triggers documented (git subtree update, manual)
- [ ] CI integration for staleness warnings
- [ ] Context files validated as current

**Freshness Sources**:

| Context Type | Freshness Signal | Refresh Method |
|--------------|------------------|----------------|
| `.repos/effect/` | Git subtree date | `git subtree pull` |
| `context/effect/` | Source file dates | Regeneration script |
| `context/internal/` | Last commit date | Manual review |
| Skills (`.claude/skills/`) | Definition dates | Quality audit |

**Agent Assignments**:

| Agent | Task | Output |
|-------|------|--------|
| doc-writer | Create freshness check script | Script |
| Bash agent | Test refresh workflow | Validation |
| Explore | Audit current staleness | Staleness report |

**Deliverables**:
- `outputs/P4_FRESHNESS.md` - Freshness analysis
- `scripts/check-context-freshness.ts` - Freshness script
- `.github/workflows/context-freshness.yml` - CI check (optional)

---

### P5: Verification & Documentation

**Objective**: Validate all success criteria and document improvements.

**Entry Criteria**: P4 complete

**Exit Criteria**:
- [x] SC-1 through SC-5 validated (4/5 pass, SC-4 partial)
- [x] Before/after metrics documented (P5_FINAL_METRICS.md)
- [x] Maintenance runbook created (in P5_FINAL_METRICS.md)
- [x] Patterns promoted to registry (15 patterns)
- [x] REFLECTION_LOG finalized

**Verification Tests**:

| Metric | Measurement Method | Target |
|--------|-------------------|--------|
| Token count | Hook output analysis | ≤4,000 |
| Skill scores | P1 rubric application | 100% scored |
| Agent confusion | Test scenario execution | ≤20% error rate |
| Context freshness | Freshness script | <30 days |
| Telemetry | Usage report generation | Functional |

**Agent Assignments**:

| Agent | Task | Output |
|-------|------|--------|
| architecture-pattern-enforcer | Validate all changes | Validation report |
| reflector | Extract patterns for registry | Pattern candidates |
| doc-writer | Create maintenance runbook | Documentation |

**Deliverables**:
- `outputs/P5_FINAL_METRICS.md` - Before/after comparison
- `outputs/verification-report.md` - All tests passed
- `documentation/agent-maintenance-runbook.md` - Ongoing maintenance guide
- Updated `REFLECTION_LOG.md` with all learnings

---

## Constraints

### Hard Constraints

1. **No Breaking Changes**: All existing agent workflows must continue functioning
2. **Privacy**: Telemetry must not log prompt content or sensitive data
3. **Performance**: Hook optimizations must not increase startup time
4. **Reversibility**: All changes reversible via git

### Soft Constraints

1. **Single Session Per Phase**: Target 1 session per phase (except P3: 1-2 sessions)
2. **Token Budget**: Handoffs ≤4K tokens
3. **Parallel Agent Limit**: ≤5 concurrent agents per task

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hook optimization breaks startup | Medium | High | Test in isolation, keep backup |
| Telemetry adds latency | Low | Medium | Async logging, batch writes |
| Skill removal loses value | Low | High | Archive before removal, soft delete |
| Token reduction insufficient | Medium | Medium | Multiple compression strategies |
| Freshness checks too aggressive | Low | Low | Configurable thresholds |

---

## References

### Internal
- `specs/agent-infrastructure-rationalization/` - Previous rationalization work
- `specs/agent-context-optimization/` - Context file creation
- `specs/_guide/PATTERN_REGISTRY.md` - Validated patterns
- `.claude/agents-manifest.yaml` - Agent registry

### Reflection Inputs
- `specs/agent-infrastructure-rationalization/REFLECTION_LOG.md` - 10 promoted patterns
- Key finding: "Parallel Inventory Pattern (85): Deploy 3 parallel Explore agents"
- Key finding: "Discoverability-First Infrastructure (85): Create navigation tools BEFORE changes"

---

## Appendix: Key Patterns to Apply

From `agent-infrastructure-rationalization` reflection log:

| Pattern | Score | Application in This Spec |
|---------|-------|--------------------------|
| Parallel Inventory Pattern | 85 | P0 uses 3 parallel Explore agents |
| Manifest Drift Detection | 80 | P0 cross-references filesystem with manifest |
| IDE Configuration Drift Detection | 90 | P4 applies to context files |
| Token Budget Enforcement | 80 | P2 implements automated validation |
| Discoverability-First Infrastructure | 85 | P0 measures before P2 optimizes |
| Conservative Agent Consolidation | 85 | P1 skill assessment before removal |

### Anti-Patterns to Avoid (from reflection)

| Anti-Pattern | Mitigation in This Spec |
|--------------|-------------------------|
| Per-Prompt Overhead (40% over target) | P2 explicitly addresses |
| Skill Naming Inconsistency | P1 quality rubric includes naming |
| Zombie Symlinks | P4 freshness checks detect |
| Silent Sync Failure | P4 adds validation |
