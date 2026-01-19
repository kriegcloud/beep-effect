# Quick Start: Orchestrator Context Optimization

> 5-minute triage guide for new Claude instances.

---

## What is This Spec?

This spec addresses **orchestrator context exhaustion** in multi-phase specifications by:
- Defining mandatory delegation rules (orchestrators coordinate, don't execute)
- Establishing phase sizing constraints (5-7 work items max per phase)
- Creating context budget protocols (when to checkpoint)
- Updating orchestrator prompt templates

---

## Current Status

| Phase | Description | Status |
|-------|-------------|--------|
| P0 | Analysis: Research current patterns, identify anti-patterns | ✅ Complete |
| P1 | Design: Define delegation rules and constraints | ✅ Complete |
| P2 | Implementation: Update SPEC_CREATION_GUIDE and related docs | ✅ Complete |
| **P3** | Validation: Trial run with test spec phase | **In Progress** |

---

## Quick Decision Tree

```
START
  │
  ├─ Is SPEC_CREATION_GUIDE.md updated with delegation rules?
  │   ├─ NO → Check if P0 complete
  │   │   ├─ NO → Start Phase 0 (Analysis)
  │   │   └─ YES → Start Phase 1 (Design) or Phase 2 (Implementation)
  │   └─ YES → Is validation complete?
  │       ├─ NO → Start Phase 3 (Validation)
  │       └─ YES → Spec complete
```

---

## Key Files to Read

| Priority | File | Purpose |
|----------|------|---------|
| 1 | Current phase prompt | `handoffs/P[N]_ORCHESTRATOR_PROMPT.md` |
| 2 | Full context | `handoffs/HANDOFF_P[N].md` |
| 3 | Phase workflow | `MASTER_ORCHESTRATION.md` |
| 4 | Problem context | `README.md` |

---

## Deep Dive Links

Jump directly to key sections:

### README.md
- [Success Criteria](README.md#success-criteria) - Behavioral metrics and artifact targets
- [Anti-Patterns to Eliminate](README.md#anti-patterns-to-eliminate) - Inline research, unbounded phases, late checkpoints
- [Mandatory Delegation Matrix](README.md#3-mandatory-delegation-matrix) - Which agent for which task

### MASTER_ORCHESTRATION.md
- [Phase 0 Details](MASTER_ORCHESTRATION.md#phase-0-analysis) - Current pattern research
- [Phase 1 Details](MASTER_ORCHESTRATION.md#phase-1-design) - Delegation rules design
- [Phase 2 Details](MASTER_ORCHESTRATION.md#phase-2-implementation) - Documentation updates
- [Phase 3 Details](MASTER_ORCHESTRATION.md#phase-3-validation) - Trial run validation
- [Sub-Agent Reflection Protocol](MASTER_ORCHESTRATION.md#sub-agent-reflection-protocol) - Capturing learnings

### RUBRICS.md
- [Spec Evaluation Criteria](RUBRICS.md#spec-evaluation-rubric) - Scoring guide for quality assessment

---

## The Core Problem

**Orchestrators exhaust context by doing work instead of delegating:**

```
# BAD - Orchestrator as executor
Orchestrator: "Let me find the service patterns..."
[Glob] → 15 files
[Read] → file 1 (200 lines)
[Read] → file 2 (150 lines)
[Grep] → pattern search
[Read] → file 3 (300 lines)
... (context consumed on research)

# GOOD - Orchestrator as coordinator
Orchestrator: "I need service pattern context."
[Task: codebase-researcher] → "Find Effect.Service patterns in packages/iam/"
(Returns summary in ~500 tokens, orchestrator synthesizes)
```

---

## Delegation Matrix (Quick Reference)

| Task Type | Delegate To |
|-----------|-------------|
| Code exploration | `codebase-researcher` |
| Effect API lookup | `mcp-researcher` |
| Code implementation | `effect-code-writer` |
| Test implementation | `test-writer` |
| Architecture check | `architecture-pattern-enforcer` |
| Documentation | `doc-writer` |

**Rule**: If the task involves > 3 file reads or > 5 tool calls, DELEGATE IT.

---

## Phase Sizing Constraints

Each phase MUST have:
- **Max 7 work items** (5-7 recommended)
- **Expected duration**: 1-2 sessions
- **Checkpoint triggers defined** before starting

**Split indicator**: If a phase has 8+ work items, split into P[N]a and P[N]b.

---

## Context Budget Heuristics

**Checkpoint when**:
- 15+ tool calls without delegation
- 3+ large file reads (> 200 lines each)
- Completing 3 major sub-tasks
- Feeling "context pressure" (subjective but valid)

**Checkpoint action**:
1. Create interim `HANDOFF_P[N]_CHECKPOINT.md`
2. Summarize progress and remaining work
3. Continue in same session OR hand off

---

## Getting Started

1. Read `handoffs/P0_ORCHESTRATOR_PROMPT.md`
2. Follow the Analysis phase workflow
3. **Remember**: Your job is to COORDINATE, not EXECUTE

---

## Sub-Agent Reflection Protocol

When delegating to sub-agents, request reflections:

**Naming Convention**: `outputs/reflections/[phase]-[agent]-[task].reflection.md`

Example: `outputs/reflections/p0-codebase-researcher-0.1.reflection.md`

**Reflection Content**:
- What worked?
- What didn't work?
- What I wish I knew when I started
- Recommendations for repository docs
- Recommendations for agent configuration

**Orchestrator Responsibility**:
- Request reflections when spawning sub-agents
- Synthesize reflections at phase end
- Extract actionable improvements

See `MASTER_ORCHESTRATION.md` > "Sub-Agent Reflection Protocol" for full details.

---

## Verification Commands

```bash
# After updating SPEC_CREATION_GUIDE
bun run lint:fix specs/

# Validate markdown structure
# (manual review - ensure sections present)
```
