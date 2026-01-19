# Orchestrator Context Optimization Spec

> Optimize multi-phase spec orchestration for context preservation through mandatory delegation, phase sizing constraints, and context budget management.

---

## Problem Statement

Large specs (e.g., `knowledge-graph-integration`) exhibit orchestrator context exhaustion because:

1. **Orchestrators perform work directly** instead of delegating to specialized sub-agents
2. **No explicit phase size constraints** lead to unbounded phases requiring intra-phase compaction
3. **Missing delegation guidance** in orchestrator prompts allows ad-hoc research/coding
4. **Context budget not tracked** - orchestrators don't know when to checkpoint

### Observed Symptoms

- Orchestrator context closes mid-phase requiring manual continuation
- Research and code written inline instead of via `codebase-researcher`, `effect-code-writer`, etc.
- Handoff documents created after context stress rather than proactively
- Phases defined by feature scope rather than context budget

---

## Success Criteria

| Criteria | Metric | Target |
|----------|--------|--------|
| **Delegation compliance** | % of research/code tasks delegated to sub-agents | > 90% |
| **Phase completion rate** | % of phases completed without context exhaustion | > 95% |
| **Orchestrator focus** | Orchestrator actions limited to coordination, not execution | Mandatory |
| **Context checkpoint triggers** | Explicit rules for when to create handoffs | Defined |

---

## Scope

### In Scope

- Orchestrator prompt template updates (SPEC_CREATION_GUIDE.md, HANDOFF_STANDARDS.md)
- Agent definition updates for delegation boundaries
- Phase sizing guidelines and constraints
- Context budget tracking mechanisms
- Intra-phase checkpoint protocol for large phases

### Out of Scope

- Changes to individual agent capabilities
- Claude context window size optimization (platform-level)
- Non-spec orchestration patterns

---

## Key Deliverables

| Deliverable | Location | Description |
|-------------|----------|-------------|
| Orchestrator Delegation Rules | `specs/SPEC_CREATION_GUIDE.md` | Mandatory delegation requirements |
| Phase Sizing Constraints | `specs/SPEC_CREATION_GUIDE.md` | Max work items per phase |
| Context Budget Protocol | `specs/HANDOFF_STANDARDS.md` | When to checkpoint |
| Orchestrator Prompt Template | `specs/templates/ORCHESTRATOR_PROMPT.template.md` | Standard template with delegation rules |
| Agent Capability Matrix | `specs/AGENT_DELEGATION_MATRIX.md` | Which agent for which task type |

---

## Phases Overview

| Phase | Duration | Objective |
|-------|----------|-----------|
| **P0: Analysis** | 1 session | Research current orchestrator patterns and identify anti-patterns |
| **P1: Design** | 1 session | Define delegation rules, phase constraints, context budget protocol |
| **P2: Implementation** | 1-2 sessions | Update SPEC_CREATION_GUIDE, HANDOFF_STANDARDS, agent definitions |
| **P3: Validation** | 1 session | Trial run with a test spec phase |

---

## Core Principles

### 1. Orchestrator as Coordinator, Not Executor

The orchestrator's role is strictly:
- **PLAN** phases and task breakdowns
- **DELEGATE** all research, code, and documentation to sub-agents
- **SYNTHESIZE** sub-agent outputs into handoffs
- **CHECKPOINT** when approaching context limits

### 2. Explicit Phase Sizing

Each phase MUST define upfront:
- Maximum number of work items (recommended: 5-7)
- Expected session count (1-2 per phase)
- Checkpoint trigger conditions

### 3. Mandatory Delegation Matrix

| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Codebase exploration | `codebase-researcher` | Grep/Glob/Read sequences |
| Effect documentation | `mcp-researcher` | Effect API lookups |
| Code implementation | `effect-code-writer` | Writing source files |
| Test implementation | `test-writer` | Writing test files |
| Architecture validation | `architecture-pattern-enforcer` | Layer boundary checks |
| Documentation writing | `doc-writer` | README/AGENTS.md creation |

### 4. Context Budget Management

Orchestrators MUST track context budget via heuristics:
- **Tool calls**: Each tool call consumes context (~500-2000 tokens)
- **Read operations**: Large file reads consume proportionally
- **Delegation overhead**: Sub-agent task = ~1000 tokens (prompt + response summary)

**Checkpoint triggers**:
- 15+ tool calls in a session without delegation
- 3+ file reads > 200 lines each
- Manual sign: "Context feeling heavy" (subjective but valid)

---

## Anti-Patterns to Eliminate

### Anti-Pattern 1: Inline Research
```
# BAD - Orchestrator doing research directly
Orchestrator: Let me search for existing patterns...
[Grep for "Effect.Service"]
[Read file A]
[Read file B]
[Grep for imports]
[Read file C]
... (10+ tool calls, context consumed)

# GOOD - Delegated research
Orchestrator: I need to understand existing service patterns.
[Task: codebase-researcher - "Find all Effect.Service definitions and their dependency patterns in packages/iam/"]
(Agent returns summary, orchestrator continues with synthesized knowledge)
```

### Anti-Pattern 2: Unbounded Phases
```
# BAD - Phase defined by feature scope
Phase 2: Extraction Pipeline
- Implement NLP chunking
- Implement mention extraction
- Implement entity extraction
- Implement relation extraction
- Implement grounder
- Implement pipeline orchestration
- Write all tests
- Add observability
(8+ major work items = multiple session context exhaustion)

# GOOD - Phase sized to context budget
Phase 2a: Extraction Core (5 items max)
- NLP chunking service
- Mention extraction service
- Entity extraction service
- Verification tests
- Checkpoint handoff

Phase 2b: Extraction Advanced
- Relation extraction service
- Grounder service
- Pipeline orchestration
- Integration tests
- Checkpoint handoff
```

### Anti-Pattern 3: Late Checkpoints
```
# BAD - Handoff created after context stress
[... 50+ tool calls ...]
"Context is getting long, let me quickly create a handoff..."
(Rushed, incomplete handoff due to pressure)

# GOOD - Proactive checkpointing
[After 15-20 tool calls or completing 3 sub-tasks]
"Checkpoint: Creating interim handoff before continuing."
(Deliberate, comprehensive handoff)
```

---

## Reference Documentation

| Document | Purpose |
|----------|---------|
| `specs/SPEC_CREATION_GUIDE.md` | Current spec creation workflow (to be updated) |
| `specs/HANDOFF_STANDARDS.md` | Current handoff requirements (to be updated) |
| `.claude/agents/*.md` | Agent definitions (reference for delegation matrix) |
| `specs/knowledge-graph-integration/` | Example of large spec with context issues |

---

## Getting Started

1. Read `QUICK_START.md` for 5-minute orientation
2. Start with `handoffs/P0_ORCHESTRATOR_PROMPT.md`
3. Follow `MASTER_ORCHESTRATION.md` for detailed phase workflows

---

## Changelog

| Date | Change |
|------|--------|
| 2026-01-18 | Initial spec creation |
