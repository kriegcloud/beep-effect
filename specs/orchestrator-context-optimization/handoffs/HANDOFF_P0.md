# Phase 0 Handoff: Analysis

**Date**: 2026-01-18
**From**: Spec Creation
**To**: Phase 0 (Analysis)
**Status**: Ready for implementation

---

## Context

This is the initial phase - no previous phases completed. The spec addresses orchestrator context exhaustion in multi-phase specifications by establishing mandatory delegation rules, phase sizing constraints, and context budget management.

### Problem Being Solved

Large specs (e.g., `knowledge-graph-integration`) exhibit orchestrator context exhaustion because:
1. Orchestrators perform work directly instead of delegating to sub-agents
2. No explicit phase size constraints lead to unbounded phases
3. Missing delegation guidance allows ad-hoc research/coding
4. Context budget not tracked - orchestrators don't know when to checkpoint

---

## Phase 0 Objectives

1. **Audit existing orchestrator prompts** for delegation patterns
2. **Analyze SPEC_CREATION_GUIDE.md** for delegation gaps
3. **Create agent capability matrix** from agent definitions
4. **Document context issues** from knowledge-graph-integration spec

---

## Tasks with Delegation Assignments

| Task | Description | Delegate To | Output |
|------|-------------|-------------|--------|
| 0.1 | Audit orchestrator prompts | `codebase-researcher` | `outputs/orchestrator-audit.md` |
| 0.2 | Analyze SPEC_CREATION_GUIDE gaps | Manual (brief read) | `outputs/spec-guide-gaps.md` |
| 0.3 | Create agent capability matrix | `codebase-researcher` | `outputs/agent-matrix.md` |
| 0.4 | Analyze KGI context issues | `reflector` or Manual | `outputs/kgi-context-analysis.md` |

**Note**: Task 0.2 is manual because it's a focused read of one specific file, not broad research.

---

## Agent Prompts

### Task 0.1: codebase-researcher

```
Analyze all orchestrator prompts in specs/*/handoffs/*ORCHESTRATOR_PROMPT*.md

For each prompt found, extract:
1. Does it instruct delegation to sub-agents? (Y/N with evidence)
2. Does it define phase size constraints? (Y/N)
3. Does it mention context checkpointing? (Y/N)
4. What tasks does it ask the orchestrator to do DIRECTLY? (list them)

Format output as:
# Orchestrator Prompt Audit

## Summary
- Total prompts analyzed: N
- Prompts with delegation instructions: N (X%)
- Prompts with phase size constraints: N (X%)
- Prompts with checkpoint guidance: N (X%)

## Detailed Analysis

### [Spec Name] - P[N]_ORCHESTRATOR_PROMPT.md
- Path: [full path]
- Delegation instructions: [Y/N - quote relevant text]
- Phase constraints: [Y/N - quote if present]
- Checkpoint guidance: [Y/N - quote if present]
- Direct work instructions: [list tasks orchestrator is told to do directly]

[Repeat for each prompt]

## Anti-Patterns Identified
[List patterns where orchestrator is told to do work directly]
```

### Task 0.3: codebase-researcher

```
Analyze all agent definitions in .claude/agents/*.md

Create a comprehensive capability matrix:

# Agent Capability Matrix

## Summary
- Total agents: N
- Read-only agents: N
- File-writing agents: N

## Matrix

| Agent | Primary Capability | Tools | Writes Files | Typical Use Case |
|-------|-------------------|-------|--------------|------------------|
| [name] | [description] | [tool list] | Y/N | [when to use] |

## Agent Categories

### Research Agents (Read-Only)
[List agents that only read/analyze]

### Execution Agents (Write Files)
[List agents that can create/modify files]

### Validation Agents
[List agents that validate/review]

## Delegation Recommendations

For each task type, which agent should be used:
- Codebase exploration: [agent]
- Effect documentation: [agent]
- Code implementation: [agent]
- Test implementation: [agent]
- Architecture validation: [agent]
- Documentation writing: [agent]
```

---

## Reference Files

| Purpose | Path | Notes |
|---------|------|-------|
| Current spec guide | `specs/SPEC_CREATION_GUIDE.md` | Check for delegation gaps |
| Handoff standards | `specs/HANDOFF_STANDARDS.md` | Check for checkpoint guidance |
| Agent definitions | `.claude/agents/*.md` | Source for capability matrix |
| Example large spec | `specs/knowledge-graph-integration/` | Context issue case study |
| KGI orchestrator prompt | `specs/knowledge-graph-integration/handoffs/P0_ORCHESTRATOR_PROMPT.md` | Example to analyze |

---

## Expected Outputs

| Output | Description | Location |
|--------|-------------|----------|
| Orchestrator audit | Analysis of existing prompts | `outputs/orchestrator-audit.md` |
| Spec guide gaps | Missing delegation guidance | `outputs/spec-guide-gaps.md` |
| Agent matrix | Complete capability matrix | `outputs/agent-matrix.md` |
| KGI analysis | Context issues in large spec | `outputs/kgi-context-analysis.md` |

---

## Success Criteria

Phase 0 is complete when:
- [ ] All 4 output files exist
- [ ] Orchestrator audit identifies anti-patterns
- [ ] Spec guide gaps are documented
- [ ] Agent matrix is complete with all agents
- [ ] KGI context analysis identifies specific issues
- [ ] `REFLECTION_LOG.md` updated with Phase 0 learnings
- [ ] `handoffs/HANDOFF_P1.md` created
- [ ] `handoffs/P1_ORCHESTRATOR_PROMPT.md` created

---

## Context Budget Guidance

**This phase should**:
- Use 2 sub-agent delegations (Tasks 0.1, 0.3)
- Have ~5 direct tool calls for manual tasks (Task 0.2, 0.4)
- Stay well under Yellow Zone

**Checkpoint if**:
- More than 15 direct tool calls accumulate
- Research expands beyond expected scope
