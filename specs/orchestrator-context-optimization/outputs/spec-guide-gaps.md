# SPEC_CREATION_GUIDE.md Gap Analysis

> Identification of missing delegation guidance, phase constraints, and context management in the current spec creation guide.

**Generated**: 2026-01-18
**Source**: `specs/SPEC_CREATION_GUIDE.md`

---

## Summary

| Category | Current State | Gap |
|----------|--------------|-----|
| Agent-Phase Mapping | EXISTS | Shows agents but doesn't REQUIRE delegation |
| Delegation Rules | MISSING | No mandatory delegation matrix |
| Phase Size Constraints | MISSING | No limits on work items per phase |
| Context Budget | MISSING | No tracking or checkpoint triggers |
| Orchestrator Template | MISSING | No standard template with context management |

---

## Detailed Gap Analysis

### Gap 1: Agent Mapping Without Requirement

**Current State**:
The guide has "## Agent-Phase Mapping" and "## Quick Reference: Agent Summaries" sections that describe agent capabilities:

```markdown
| Phase | Agent | Capability | Output |
|-------|-------|------------|--------|
| 1: Discovery | codebase-researcher | read-only | *Informs orchestrator only* |
```

**Gap**: The mapping shows WHAT agents can do, not WHEN orchestrators MUST use them.

**Impact**: Orchestrators may see agents as optional helpers rather than mandatory delegates.

**Recommendation**: Add new section after Agent-Phase Mapping:

```markdown
## Orchestrator Delegation Rules

> **CRITICAL**: Orchestrators coordinate, they do NOT execute.

### Mandatory Delegation Matrix

| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Code exploration (>3 files) | codebase-researcher | Sequential Glob/Read |
...
```

---

### Gap 2: No Phase Size Constraints

**Current State**:
The "## Standard Spec Structure" section mentions phases but has no size limits:

```markdown
specs/[SPEC_NAME]/
└── handoffs/
    ├── HANDOFF_P1.md
    ├── P1_ORCHESTRATOR_PROMPT.md
    └── ...
```

**Gap**: No guidance on how many work items a phase should have.

**Impact**: Phases are sized by feature scope, leading to context exhaustion.

**Recommendation**: Add new section after Standard Spec Structure:

```markdown
## Phase Sizing Constraints

### Hard Limits

| Metric | Maximum | Recommended |
|--------|---------|-------------|
| Work items per phase | 7 | 5-6 |
| Sessions per phase | 2 | 1 |

### Phase Split Triggers

A phase MUST be split when:
- 8+ work items
- 3+ "Large" work items
- > 2 sessions estimated
```

---

### Gap 3: No Context Budget Protocol

**Current State**:
The guide mentions "Self-Reflection Checkpoint" but only for phase transitions:

```markdown
### Self-Reflection Checkpoint

After Phase 1, answer:
- What detection methods worked?
...
Log to REFLECTION_LOG.md.
```

**Gap**: No guidance on tracking context consumption during phase execution.

**Impact**: Orchestrators don't know when to checkpoint until it's too late.

**Recommendation**: Add context budget protocol to HANDOFF_STANDARDS.md (cross-referenced from guide):

```markdown
## Context Budget Protocol

### Budget Zones

| Zone | Direct Tool Calls | Action |
|------|-------------------|--------|
| Green | 0-10 | Continue |
| Yellow | 11-15 | Assess |
| Red | 16+ | STOP |

### Checkpoint Triggers

Checkpoint when ANY of these occur:
- 15+ direct tool calls
- 4+ large file reads
- 3 sub-tasks completed
```

---

### Gap 4: Missing Orchestrator Template

**Current State**:
The guide has templates for handoff documents:

```markdown
## Orchestrator Prompt Template

Create a copy-paste ready prompt...
```

But the template lacks context management sections.

**Gap**: No standard template with delegation matrix, context budget tracking, and checkpoint triggers embedded.

**Impact**: Each orchestrator prompt is created ad-hoc without consistent context management.

**Recommendation**: Create `specs/templates/ORCHESTRATOR_PROMPT.template.md`:

```markdown
# Phase [N] Orchestrator Prompt

## Your Role: COORDINATOR, NOT EXECUTOR

**CRITICAL**: You MUST NOT:
- Read > 3 files directly
- Write any source code
- Search documentation manually

## Delegation Matrix
[embedded matrix]

## Context Budget
- Direct tool calls: [0/20 max]
- Large file reads: [0/5 max]
- Sub-agent delegations: [0/10 max]

**Checkpoint when any metric reaches 75%**

## Phase Work Items (max 7)
...
```

---

### Gap 5: Anti-Patterns Missing Key Entries

**Current State**:
The "## Anti-Patterns" section has 10 entries, ending at "### 10. Missing Orchestrator Prompts at Phase Completion"

**Gap**: Missing anti-patterns for:
- Orchestrator doing research directly
- Unbounded phase sizes
- Late context checkpoints

**Recommendation**: Add three new anti-patterns:

```markdown
### 11. Orchestrator Doing Research Directly
**Wrong**: Orchestrator performs sequential Glob/Read/Grep
**Right**: Orchestrator delegates research to codebase-researcher

### 12. Unbounded Phase Sizes
**Wrong**: Phase has 10+ work items
**Right**: Phase has 5-7 items, splits at 8+

### 13. Late Context Checkpoints
**Wrong**: Checkpoint after context stress
**Right**: Proactive checkpoint at Yellow Zone
```

---

## Implementation Plan

### Priority 1: Update SPEC_CREATION_GUIDE.md

| Section | Action | Location |
|---------|--------|----------|
| Orchestrator Delegation Rules | ADD | After Agent-Phase Mapping |
| Phase Sizing Constraints | ADD | After Standard Spec Structure |
| Anti-Patterns 11-13 | ADD | Extend existing section |

### Priority 2: Update HANDOFF_STANDARDS.md

| Section | Action | Location |
|---------|--------|----------|
| Context Budget Protocol | ADD | Before Mandatory Requirements |
| Intra-Phase Checkpoints | ADD | After existing content |
| Budget tracking checklist | ADD | In Verification Checklist |

### Priority 3: Create Templates

| Template | Location |
|----------|----------|
| ORCHESTRATOR_PROMPT.template.md | specs/templates/ |
| PHASE_CHECKPOINT.template.md | specs/templates/ |

---

## Verification

After updates, verify:

1. **SPEC_CREATION_GUIDE.md**:
   - [ ] Has "Orchestrator Delegation Rules" section
   - [ ] Has "Phase Sizing Constraints" section
   - [ ] Has anti-patterns 11, 12, 13

2. **HANDOFF_STANDARDS.md**:
   - [ ] Has "Context Budget Protocol" section
   - [ ] Has "Intra-Phase Checkpoints" section

3. **Templates**:
   - [ ] `ORCHESTRATOR_PROMPT.template.md` exists
   - [ ] Template includes delegation matrix
   - [ ] Template includes context budget tracker
