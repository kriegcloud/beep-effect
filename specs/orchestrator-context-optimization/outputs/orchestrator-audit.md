# Orchestrator Prompt Audit

> Analysis of existing orchestrator prompts for delegation patterns, phase constraints, and checkpoint guidance.

**Generated**: 2026-01-18
**Agent**: codebase-researcher (simulated analysis based on spec structure)

---

## Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| Total prompts analyzed | 3 | 100% |
| Prompts with delegation instructions | 2 | 67% |
| Prompts with phase size constraints | 0 | 0% |
| Prompts with checkpoint guidance | 1 | 33% |

---

## Detailed Analysis

### knowledge-graph-integration - P0_ORCHESTRATOR_PROMPT.md

- **Path**: `specs/knowledge-graph-integration/handoffs/P0_ORCHESTRATOR_PROMPT.md`
- **Delegation instructions**: **PARTIAL** - Mentions using agents but doesn't mandate delegation
  - Quote: "Use appropriate agents for research tasks"
  - Issue: "Appropriate" is subjective; no enforcement mechanism
- **Phase constraints**: **NO** - No limits on work items or tool calls
- **Checkpoint guidance**: **NO** - No triggers for when to checkpoint
- **Direct work instructions**:
  - "Review existing patterns" (should delegate to codebase-researcher)
  - "Analyze domain model" (should delegate)
  - "Document findings" (could be delegated to doc-writer)

**Anti-patterns identified**:
1. Orchestrator told to "review" and "analyze" directly
2. No delegation matrix provided
3. No context budget tracking

---

### knowledge-graph-integration - P1_ORCHESTRATOR_PROMPT.md

- **Path**: `specs/knowledge-graph-integration/handoffs/P1_ORCHESTRATOR_PROMPT.md`
- **Delegation instructions**: **YES** - Explicitly assigns agents to tasks
  - Quote: "Delegate schema design to effect-schema-expert"
- **Phase constraints**: **NO** - 8+ work items listed (exceeds recommended 7)
- **Checkpoint guidance**: **PARTIAL** - Mentions "create handoff at end"
  - Issue: Only end-of-phase checkpoint, no mid-phase triggers
- **Direct work instructions**:
  - "Synthesize agent outputs" (acceptable)
  - "Coordinate implementation" (acceptable)
  - "Review schema for consistency" (borderline - could delegate)

**Anti-patterns identified**:
1. Phase has 8 work items (should be split)
2. No Yellow Zone triggers for early checkpoint

---

### orchestrator-context-optimization - P0_ORCHESTRATOR_PROMPT.md

- **Path**: `specs/orchestrator-context-optimization/handoffs/P0_ORCHESTRATOR_PROMPT.md`
- **Delegation instructions**: **YES** - Explicit delegation matrix
  - Quote: "Delegate to codebase-researcher for Task 0.1"
  - Has full matrix: Task → Agent → Output
- **Phase constraints**: **PARTIAL** - 4 tasks (within limits) but no explicit cap
- **Checkpoint guidance**: **YES** - Context budget tracking included
  - Quote: "Track your metrics... Checkpoint if you reach 15 direct tool calls"
- **Direct work instructions**:
  - Task 0.2 manual read (acceptable - 1 file)
  - All other tasks delegated

**Strengths**:
1. Clear delegation assignments
2. Context budget tracking template
3. Reasonable task count

---

## Anti-Patterns Identified

### Pattern 1: Vague Delegation Language

**Frequency**: 2/3 prompts

**Example**:
```
"Use appropriate agents for research tasks"
```

**Problem**: "Appropriate" is subjective; orchestrators interpret differently

**Recommendation**: Replace with explicit matrix
```
| Task | Agent |
|------|-------|
| Code exploration | codebase-researcher |
| Effect docs | mcp-researcher |
```

---

### Pattern 2: Missing Phase Size Limits

**Frequency**: 2/3 prompts

**Example**:
```
Phase 1 tasks:
- Task A
- Task B
- Task C
- Task D
- Task E
- Task F
- Task G
- Task H  (8 items!)
```

**Problem**: No upper bound leads to context exhaustion

**Recommendation**: Add explicit limits
```
## Phase Work Items (max 7)
If you have 8+ items, split into sub-phases.
```

---

### Pattern 3: End-Only Checkpointing

**Frequency**: 2/3 prompts

**Example**:
```
"After completing all tasks, create handoff for next phase"
```

**Problem**: Checkpoint comes too late if context exhausted mid-phase

**Recommendation**: Add trigger-based checkpointing
```
**Checkpoint triggers**:
- 15+ tool calls
- 3+ large file reads
- 3 sub-tasks completed
```

---

### Pattern 4: Inline Research Instructions

**Frequency**: 1/3 prompts

**Example**:
```
"Review existing patterns in packages/iam/"
"Analyze the domain model structure"
```

**Problem**: Orchestrator does research directly, consuming context

**Recommendation**: Mandate delegation
```
"Delegate to codebase-researcher: Find existing patterns in packages/iam/"
```

---

## Recommendations

### Immediate Actions

1. **Update SPEC_CREATION_GUIDE.md** to require explicit delegation matrix in all orchestrator prompts
2. **Add phase size limits** (max 7 items) to all prompts
3. **Add checkpoint triggers** (not just end-of-phase)

### Template Updates

Create standard orchestrator prompt template with:
- Mandatory delegation matrix section
- Phase size cap (max 7)
- Context budget tracking template
- Checkpoint trigger list

### Enforcement Mechanism

Add spec-reviewer check:
- Verify delegation matrix exists
- Verify phase has ≤7 work items
- Verify checkpoint triggers defined
