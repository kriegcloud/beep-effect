# Agent Prompts: Orchestrator Context Optimization

> Ready-to-use sub-agent prompts for each phase of the orchestrator context optimization spec.

---

## Overview

This document contains copy-paste ready prompts for delegating tasks to specialized sub-agents during spec execution. Each prompt is designed to:

1. **Minimize orchestrator context consumption** by offloading research to sub-agents
2. **Produce structured outputs** that can be synthesized into deliverables
3. **Follow the delegation matrix** defined in the spec

---

## Phase 0: Analysis

### Task 0.1: Orchestrator Prompt Audit

**Agent**: `codebase-researcher`

**Delegation Trigger**: This task requires scanning multiple files across the codebase

```
Analyze all orchestrator prompts in specs/*/handoffs/*ORCHESTRATOR_PROMPT*.md

For each prompt found, extract:
1. Does it instruct delegation to sub-agents? (Y/N with evidence)
2. Does it define phase size constraints? (Y/N)
3. Does it mention context checkpointing? (Y/N)
4. What tasks does it ask the orchestrator to do DIRECTLY? (list them)

Format your output as:

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

## Recommendations
[Suggestions for improving delegation in existing prompts]
```

**Expected Output**: `outputs/orchestrator-audit.md`

---

### Task 0.3: Agent Capability Matrix

**Agent**: `codebase-researcher`

**Delegation Trigger**: This task requires scanning all agent definitions

```
Analyze all agent definitions in .claude/agents/*.md

Create a comprehensive capability matrix:

# Agent Capability Matrix

## Summary
- Total agents: N
- Read-only agents: N
- File-writing agents: N
- Report-producing agents: N

## Full Matrix

| Agent | Primary Capability | Tools Available | Writes Files | Output Type | Typical Use Case |
|-------|-------------------|-----------------|--------------|-------------|------------------|
| [name] | [1-line description] | [tool list] | Y/N | [file type] | [when to use] |

## Agent Categories

### Research Agents (Read-Only)
These agents analyze and inform but produce NO persistent artifacts:
- [agent]: [capability]

### Report-Producing Agents
These agents create markdown reports in outputs/ directories:
- [agent]: [capability] -> [output location]

### Execution Agents (Write Files)
These agents create or modify source files:
- [agent]: [capability] -> [file types]

### Validation Agents
These agents verify/audit without modifying:
- [agent]: [capability]

## Task-to-Agent Delegation Guide

| Task Type | Delegate To | Rationale |
|-----------|-------------|-----------|
| Codebase exploration (>3 files) | codebase-researcher | Prevents orchestrator context bloat |
| Effect documentation lookup | mcp-researcher | Specialized for Effect docs |
| Source code implementation | effect-code-writer | Follows Effect patterns |
| Test implementation | test-writer | Uses @beep/testkit |
| Architecture validation | architecture-pattern-enforcer | Knows layer boundaries |
| Documentation writing | doc-writer | Follows doc standards |
| Error fixing | package-error-fixer | Iterates until passing |

## Decision Tree

When deciding which agent to use:

1. Does the task require READING multiple files?
   - YES: Use codebase-researcher
   - NO: Continue

2. Does the task require Effect documentation?
   - YES: Use mcp-researcher
   - NO: Continue

3. Does the task require WRITING source code?
   - YES: Use effect-code-writer or test-writer
   - NO: Continue

4. Does the task require WRITING documentation?
   - YES: Use doc-writer
   - NO: Continue

5. Does the task require VALIDATION?
   - YES: Use architecture-pattern-enforcer or code-reviewer
   - NO: Orchestrator can handle directly
```

**Expected Output**: `outputs/agent-matrix.md`

---

### Task 0.4: KGI Context Analysis

**Agent**: `reflector` (if REFLECTION_LOG has entries) OR manual analysis

**Option A - If REFLECTION_LOG has entries**:

```
Analyze specs/knowledge-graph-integration/REFLECTION_LOG.md for context-related patterns.

Focus on:
1. Instances where orchestrator exhausted context
2. Phases that were too large
3. Research that was done directly instead of delegated
4. Checkpoints that were created reactively (under pressure)

Extract:
- Specific examples of context exhaustion
- Root causes identified
- Workarounds applied
- Lessons learned

Format output as:

# KGI Context Analysis

## Context Exhaustion Incidents
[List specific incidents with evidence]

## Root Causes
[Categorized causes of context issues]

## Workarounds Applied
[How issues were addressed mid-execution]

## Lessons for This Spec
[Actionable improvements to prevent these issues]
```

**Option B - Manual analysis** (if no REFLECTION_LOG entries):

```
Analyze specs/knowledge-graph-integration/ for context consumption patterns:

1. MASTER_ORCHESTRATION.md
   - Count work items per phase
   - Identify phases with >7 items (too large)
   - Note tasks that should have been delegated

2. handoffs/P0_ORCHESTRATOR_PROMPT.md
   - Identify inline work instructions
   - Note missing delegation guidance
   - Find checkpoint triggers (or absence thereof)

3. Estimate context consumption:
   - Per-phase tool call estimates
   - Delegation ratio (delegated vs direct)

Format as KGI Context Analysis report.
```

**Expected Output**: `outputs/kgi-context-analysis.md`

---

## Phase 1: Design

### Task 1.1: Delegation Rules Draft

**Agent**: `doc-writer`

**Delegation Trigger**: Creating formal documentation

```
Create a formal delegation rules document based on Phase 0 analysis.

Input references:
- outputs/orchestrator-audit.md (anti-patterns found)
- outputs/agent-matrix.md (agent capabilities)
- outputs/kgi-context-analysis.md (context issues)

Create the following content:

# Delegation Rules

## Mandatory Delegation Matrix

| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Code exploration (>3 files) | codebase-researcher | Sequential Glob/Read |
| Effect documentation lookup | mcp-researcher | Manual doc searching |
| Source code implementation | effect-code-writer | Writing .ts files |
| Test implementation | test-writer | Writing .test.ts files |
| Architecture validation | architecture-pattern-enforcer | Layer checks |
| README/AGENTS.md creation | doc-writer | Documentation files |
| Build/lint error fixing | package-error-fixer | Manual error fixing |

## Delegation Trigger Rules

An orchestrator MUST delegate when:
1. Task requires reading >3 files
2. Task requires >5 sequential tool calls
3. Task involves code generation (any .ts file)
4. Task involves test generation (any .test.ts file)
5. Task involves broad codebase search

## Explicit "NEVER Do Directly" List

Orchestrators MUST NEVER:
- Execute sequences of Glob -> Read -> Grep for research
- Write source code inline in the conversation
- Fix type/lint errors manually
- Create documentation files directly
- Search Effect documentation manually

## Examples

### Good Delegation
[Provide 2-3 examples of correct delegation]

### Anti-Pattern
[Provide 2-3 examples of incorrect direct work]

Output this to: specs/orchestrator-context-optimization/outputs/delegation-rules-draft.md
```

**Expected Output**: `outputs/delegation-rules-draft.md`

---

### Task 1.2: Phase Sizing Guidelines

**Agent**: `doc-writer`

**Delegation Trigger**: Creating formal documentation

```
Create phase sizing guidelines based on context analysis.

# Phase Sizing Guidelines

## Hard Limits

| Metric | Maximum | Recommended |
|--------|---------|-------------|
| Work items per phase | 7 | 5-6 |
| Sub-agent delegations per phase | 10 | 6-8 |
| Direct orchestrator tool calls | 20 | 10-15 |
| Large file reads (>200 lines) | 5 | 2-3 |
| Expected sessions per phase | 2 | 1 |

## Work Item Classification

| Size | Tool Calls | Sub-Agent Delegations | Example |
|------|------------|----------------------|---------|
| Small | 1-2 | 0-1 | Read a single file, check existence |
| Medium | 3-5 | 2-3 | Analyze a module, create a schema |
| Large | 6+ | 4+ | Implement a service, write tests |

## Phase Split Triggers

A phase MUST be split when:
1. Phase has 8+ work items
2. Phase has 3+ "Large" work items
3. Estimated duration exceeds 2 sessions
4. Phase scope crosses multiple domains

## Split Naming Convention

Original: Phase 2: Extraction Pipeline
Split into:
- Phase 2a: Extraction Core
- Phase 2b: Extraction Advanced

## Example Phase Breakdown

### TOO LARGE (Split Required)
Phase 2: Full Implementation
- Implement service A
- Implement service B
- Implement service C
- Write tests for A
- Write tests for B
- Write tests for C
- Create barrel exports
- Add to main index
(8 items = MUST split)

### CORRECT SIZE
Phase 2a: Core Services
- Implement service A (delegate: effect-code-writer)
- Implement service B (delegate: effect-code-writer)
- Write tests for A, B (delegate: test-writer)
- Verify: bun run check && bun run test
- Checkpoint handoff
(5 items with delegations)

Output this to: specs/orchestrator-context-optimization/outputs/phase-sizing-guidelines.md
```

**Expected Output**: `outputs/phase-sizing-guidelines.md`

---

### Task 1.3: Context Budget Protocol

**Agent**: `doc-writer`

```
Create context budget tracking protocol.

# Context Budget Protocol

## Budget Zones

| Zone | Direct Tool Calls | Large File Reads | Sub-Agent Delegations | Action |
|------|-------------------|------------------|----------------------|--------|
| Green | 0-10 | 0-2 | 0-5 | Continue normally |
| Yellow | 11-15 | 3-4 | 6-8 | Assess remaining work |
| Red | 16+ | 5+ | 9+ | STOP and checkpoint |

## Zone Transition Protocol

### Entering Yellow Zone

1. Assess remaining work:
   - How much is left? (< 30% or > 30%)
   - Can remaining work be delegated?

2. If < 30% remaining:
   - Continue cautiously
   - Monitor for Red Zone

3. If > 30% remaining:
   - Create interim checkpoint
   - Consider splitting remaining work

### Entering Red Zone (CRITICAL)

1. STOP current task immediately
2. Do NOT attempt to "finish quickly"
3. Create checkpoint handoff:
   - HANDOFF_P[N]_CHECKPOINT_[timestamp].md
4. Document:
   - What is complete
   - What is in-progress
   - What remains
5. Either:
   - Continue in new session with fresh context
   - Hand off to another session

## Checkpoint Handoff Template

```markdown
# Phase [N] Checkpoint: [Description]

**Timestamp**: YYYY-MM-DD HH:MM
**Reason**: [Yellow Zone / Red Zone / Manual]
**Context Budget Status**:
- Direct tool calls: X/20
- Large file reads: X/5
- Sub-agent delegations: X/10

## Completed
[List completed work items]

## In Progress
[Current task state, any partial work]

## Remaining
[Work items not yet started]

## Resume Instructions
[How to continue from this point]
```

## Proactive Checkpointing

Best practice: Create checkpoints BEFORE hitting limits.

Checkpoint triggers (any one):
- 3 major sub-tasks completed
- 15+ tool calls accumulated
- "Context feeling heavy" (subjective but valid)
- Before starting large/risky work item

Output this to: specs/orchestrator-context-optimization/outputs/context-budget-protocol.md
```

**Expected Output**: `outputs/context-budget-protocol.md`

---

## Phase 2: Implementation

### Task 2.1: Update SPEC_CREATION_GUIDE

**Agent**: `doc-writer`

```
Update specs/SPEC_CREATION_GUIDE.md with orchestrator delegation requirements.

Add the following sections AFTER "## Agent-Phase Mapping":

---

## Orchestrator Delegation Rules

> **CRITICAL**: Orchestrators coordinate, they do NOT execute. All substantive work MUST be delegated to specialized sub-agents.

### Mandatory Delegation Matrix

| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Code exploration (>3 files) | `codebase-researcher` | Sequential Glob/Read |
| Effect documentation lookup | `mcp-researcher` | Manual doc searching |
| Source code implementation | `effect-code-writer` | Writing .ts files |
| Test implementation | `test-writer` | Writing .test.ts files |
| Architecture validation | `architecture-pattern-enforcer` | Layer checks |
| Documentation writing | `doc-writer` | README/AGENTS.md files |
| Error fixing | `package-error-fixer` | Manual error resolution |

### Delegation Trigger Rules

An orchestrator MUST delegate when ANY of these conditions are met:
- Task requires reading more than 3 files
- Task requires more than 5 sequential tool calls
- Task involves generating source code
- Task involves generating test code
- Task requires broad codebase search

### Orchestrator Allowed Actions

Orchestrators MAY directly:
- Read 1-3 small files for quick context
- Make 1-5 tool calls for coordination
- Synthesize sub-agent outputs
- Create handoff documents
- Update REFLECTION_LOG.md

---

Also add AFTER "## Standard Spec Structure":

---

## Phase Sizing Constraints

### Hard Limits

| Metric | Maximum | Recommended |
|--------|---------|-------------|
| Work items per phase | 7 | 5-6 |
| Sub-agent delegations per phase | 10 | 6-8 |
| Direct orchestrator tool calls | 20 | 10-15 |
| Sessions per phase | 2 | 1 |

### Phase Split Triggers

A phase MUST be split into sub-phases (P[N]a, P[N]b) when:
- Phase has 8+ work items
- Phase has 3+ "Large" work items (6+ tool calls each)
- Estimated duration exceeds 2 sessions

---

Also add these new anti-patterns to the "## Anti-Patterns" section:

### 11. Orchestrator Doing Research Directly

**Wrong**: Orchestrator performs sequential Glob/Read/Grep operations
```
[Orchestrator]
Let me find the service patterns...
[Glob: packages/iam/**/*.ts]
[Read: file1.ts]
[Read: file2.ts]
[Grep: "Effect.Service"]
[Read: file3.ts]
... (10+ tool calls, context consumed)
```

**Right**: Orchestrator delegates research to codebase-researcher
```
[Orchestrator]
I need to understand service patterns.
[Task: codebase-researcher]
"Find all Effect.Service definitions in packages/iam/ and summarize patterns"
(Agent returns summary, orchestrator continues with synthesized knowledge)
```

### 12. Unbounded Phase Sizes

**Wrong**: Phase defined by feature scope without size limits
```
Phase 2: Full Implementation
- Implement entity service
- Implement relation service
- Implement extraction pipeline
- Implement grounder
- Write all tests
- Add observability
- Create documentation
(7+ items = context exhaustion risk)
```

**Right**: Phase sized to context budget
```
Phase 2a: Core Services (5 items max)
- Entity service (delegate: effect-code-writer)
- Relation service (delegate: effect-code-writer)
- Core tests (delegate: test-writer)
- Verify builds
- Checkpoint handoff

Phase 2b: Pipeline & Extensions
- Extraction pipeline
- Grounder service
- Integration tests
- Observability
- Checkpoint handoff
```

### 13. Late Context Checkpoints

**Wrong**: Creating handoff after context stress
```
[... 50+ tool calls ...]
"Context is getting long, let me quickly create a handoff..."
(Rushed, incomplete handoff)
```

**Right**: Proactive checkpointing
```
[After 15-20 tool calls or completing 3 sub-tasks]
"Checkpoint: Creating interim handoff before continuing."
(Deliberate, comprehensive handoff)
```

---

Ensure all additions follow existing document style and Effect code patterns.
```

**Expected Output**: Updated `specs/SPEC_CREATION_GUIDE.md`

---

### Task 2.2: Update HANDOFF_STANDARDS

**Agent**: `doc-writer`

```
Update specs/HANDOFF_STANDARDS.md with context budget protocol.

Add the following section BEFORE "## Mandatory Requirements":

---

## Context Budget Protocol

### Budget Tracking

Orchestrators MUST track context consumption using these heuristics:

| Metric | Green Zone | Yellow Zone | Red Zone (STOP!) |
|--------|------------|-------------|------------------|
| Direct tool calls | 0-10 | 11-15 | 16+ |
| Large file reads (>200 lines) | 0-2 | 3-4 | 5+ |
| Sub-agent delegations | 0-5 | 6-8 | 9+ |

### Zone Response Protocol

**Green Zone**: Continue normally, monitor metrics.

**Yellow Zone**:
- Assess remaining work (< 30% vs > 30%)
- If < 30% remaining, continue cautiously
- If > 30% remaining, create checkpoint

**Red Zone**:
1. STOP immediately
2. Create `HANDOFF_P[N]_CHECKPOINT.md`
3. Either continue in new session or hand off

### Checkpoint Trigger Events

Create a checkpoint when ANY of these occur:
- Direct tool calls reach 15
- Large file reads reach 4
- 3 major sub-tasks completed
- Subjective "context pressure" feeling
- Before starting large/risky work item

---

Also add this section after existing content:

---

## Intra-Phase Checkpoints

For phases that risk exceeding context limits, use intra-phase checkpoints.

### When to Use

- Phase has 6-7 work items
- Phase involves multiple large sub-agent delegations
- Entering Yellow Zone mid-phase

### Checkpoint File Format

```markdown
# Phase [N] Checkpoint: [Brief Description]

**Timestamp**: YYYY-MM-DD HH:MM
**Checkpoint Reason**: [Yellow Zone / Red Zone / Proactive / Manual]

## Context Budget Status
- Direct tool calls: X/20
- Large file reads: X/5
- Sub-agent delegations: X/10

## Completed Work
- [x] Work item 1
- [x] Work item 2

## In Progress
- [ ] Work item 3 (status: [description])

## Remaining Work
- [ ] Work item 4
- [ ] Work item 5

## Sub-Agent Outputs Captured
[Reference any sub-agent outputs that should be preserved]

## Resume Instructions
1. Start from [specific point]
2. Use [specific sub-agent output] for context
3. Continue with [next work item]
```

### Recovery Protocol

When resuming from a checkpoint:
1. Read the checkpoint file first
2. Review "In Progress" and "Remaining Work" sections
3. Check "Resume Instructions" for specific guidance
4. DO NOT re-do completed work
5. Continue delegating per the delegation matrix

---

Update the "## Verification Checklist for Handoff Authors" to include:

### Context Budget Checklist

- [ ] Context budget was tracked during phase execution
- [ ] No Red Zone violations occurred (or were properly checkpointed)
- [ ] Sub-agent delegations were used appropriately
- [ ] Checkpoint files exist for any mid-phase pauses

---

Ensure all additions follow existing document style.
```

**Expected Output**: Updated `specs/HANDOFF_STANDARDS.md`

---

## Phase 3: Validation

### Task 3.1: Documentation Review

**Agent**: `spec-reviewer`

```
Review the updated specs documentation for clarity and completeness:

Files to review:
- specs/SPEC_CREATION_GUIDE.md
- specs/HANDOFF_STANDARDS.md
- specs/AGENT_DELEGATION_MATRIX.md (if created)

Evaluation criteria:

1. Delegation Rules
   - Are rules clear and unambiguous?
   - Are examples sufficient?
   - Is the delegation matrix complete?

2. Phase Sizing Constraints
   - Are limits clearly stated?
   - Are split triggers actionable?
   - Is the sizing guidance practical?

3. Context Budget Protocol
   - Is the zone system clear?
   - Are checkpoint triggers well-defined?
   - Is the recovery protocol complete?

4. Integration
   - Do the new sections integrate well with existing content?
   - Are there any contradictions with existing guidance?
   - Is the overall flow coherent?

Score each area 1-5 and provide specific recommendations.

Output to: specs/orchestrator-context-optimization/outputs/documentation-review.md
```

**Expected Output**: `outputs/documentation-review.md`

---

### Task 3.2: Simulated Orchestration Test

**Agent**: Manual execution

```
Execute a mini-orchestration following the new rules to validate effectiveness.

Test Task: "Research existing table patterns in packages/iam/tables/"

Steps:
1. Apply delegation rules - should delegate to codebase-researcher
2. Track context budget metrics throughout
3. Measure context savings vs direct research

Document:
- Was delegation triggered correctly?
- How much context was saved?
- Were any edge cases discovered?
- Recommendations for rule refinement

Output to: specs/orchestrator-context-optimization/outputs/orchestration-test.md
```

**Expected Output**: `outputs/orchestration-test.md`

---

## Agent Selection Decision Tree

Use this decision tree when unsure which agent to delegate to:

```
START: What type of task is this?
│
├─ RESEARCH (information gathering)
│   ├─ Codebase files? → codebase-researcher
│   ├─ Effect documentation? → mcp-researcher
│   └─ External sources? → web-researcher (or WebSearch/WebFetch)
│
├─ CREATION (generating new artifacts)
│   ├─ Source code (.ts)? → effect-code-writer
│   ├─ Test code (.test.ts)? → test-writer
│   ├─ Documentation (.md)? → doc-writer
│   └─ AGENTS.md specifically? → agents-md-updater
│
├─ VALIDATION (checking/reviewing)
│   ├─ Architecture boundaries? → architecture-pattern-enforcer
│   ├─ Code guidelines? → code-reviewer
│   ├─ Spec quality? → spec-reviewer
│   └─ Schema patterns? → effect-schema-expert
│
├─ FIXING (resolving errors)
│   └─ Type/build/lint errors? → package-error-fixer
│
└─ SYNTHESIS (meta-analysis)
    └─ Pattern extraction from reflections? → reflector
```

---

## Context Budget Tracking Template

Use this template in orchestrator prompts to track context consumption:

```markdown
## Context Budget

| Metric | Current | Limit | Zone |
|--------|---------|-------|------|
| Direct tool calls | 0 | 20 | Green |
| Large file reads | 0 | 5 | Green |
| Sub-agent delegations | 0 | 10 | Green |

**Last updated**: [timestamp or "after task X"]

**Checkpoint trigger**: Any metric at 75% → assess remaining work
```

Update this table throughout orchestration to maintain awareness of context consumption.

---

## Sub-Agent Reflection Instructions

### Mandatory Reflection Request

When delegating to any sub-agent, include this instruction in your prompt:

```
After completing your task, create a reflection file at:
outputs/reflections/p[N]-[your-agent-type]-[task-id].reflection.md

Your reflection MUST include:

1. **What Worked**: Specific techniques, patterns, or approaches that were effective
2. **What Didn't Work**: Challenges, blockers, or approaches that failed
3. **What I Wish I Knew**: Codebase-specific insights that would have saved time
4. **Recommendations - Repository Docs**: Specific improvements to documentation
5. **Recommendations - Agent Config**: Improvements to your agent definition file

Use this template:

# Sub-Agent Reflection: Task [ID]

**Agent**: [your agent type]
**Task**: [brief description]
**Phase**: P[N]
**Date**: [today]

## What Worked
- [item]

## What Didn't Work
- [item]

## What I Wish I Knew When I Started
- [item]

## Recommendations: Repository Documentation
**Target**: [file path]
**Recommendation**: [specific improvement]
**Rationale**: [why]

## Recommendations: Agent Configuration
**Target**: .claude/agents/[agent].md
**Recommendation**: [specific improvement]
**Rationale**: [how this improves efficiency]

## Metadata
- Tool calls made: [count]
- Files read: [count]
- Files written: [count]
- Estimated context consumed: [low/medium/high]
```

### Reflection Naming Convention

```
outputs/reflections/[phase]-[agent-type]-[task-id].reflection.md

Examples:
- p0-codebase-researcher-0.1.reflection.md
- p1-doc-writer-1.2.reflection.md
- p2-effect-code-writer-2.3.reflection.md
- p3-spec-reviewer-3.1.reflection.md
```

### Orchestrator Synthesis

At phase end, synthesize all sub-agent reflections:

1. **Collect** all reflection files from `outputs/reflections/`
2. **Identify patterns** across agents (common successes, common challenges)
3. **Extract actionable items** for documentation and agent improvements
4. **Update REFLECTION_LOG.md** with synthesized learnings
5. **Track recommendations** for implementation in subsequent phases
