# Master Orchestration: Orchestrator Context Optimization

> Complete phase workflows, checkpoints, and handoff protocols for optimizing orchestrator context management in multi-phase specs.

---

## Phase 0: Analysis

**Duration**: 1 session
**Status**: Complete
**Agents**: `codebase-researcher`, `reflector`

### Phase Artifacts

| Artifact | Location | Description |
|----------|----------|-------------|
| Orchestrator Audit | `outputs/orchestrator-audit.md` | Analysis of existing prompts for delegation patterns |
| Spec Guide Gaps | `outputs/spec-guide-gaps.md` | Missing guidance in SPEC_CREATION_GUIDE |
| Agent Matrix | `outputs/agent-matrix.md` | Complete capability mapping |
| KGI Analysis | `outputs/kgi-context-analysis.md` | Context issues in large spec |

### Objectives

1. Analyze existing orchestrator prompts for context consumption patterns
2. Identify anti-patterns in current spec execution
3. Document context exhaustion symptoms and triggers
4. Catalog existing delegation mechanisms

### Tasks

#### Task 0.1: Audit Existing Orchestrator Prompts

**Agent**: `codebase-researcher`

**Prompt**:
```
Analyze all orchestrator prompts in specs/*/handoffs/*ORCHESTRATOR_PROMPT*.md

For each prompt, identify:
1. Does it instruct delegation to sub-agents? (Y/N)
2. Does it define phase size constraints? (Y/N)
3. Does it mention context checkpointing? (Y/N)
4. What tasks does it ask the orchestrator to do DIRECTLY?

Output: specs/orchestrator-context-optimization/outputs/orchestrator-audit.md
```

#### Task 0.2: Analyze SPEC_CREATION_GUIDE for Delegation Gaps

**Agent**: Manual read + analysis

Read `specs/SPEC_CREATION_GUIDE.md` and answer:
- Where does it mention sub-agent delegation?
- Where does it allow orchestrators to do work directly?
- What phase sizing guidance exists?
- What checkpoint triggers are defined?

Document gaps in `outputs/spec-guide-gaps.md`.

#### Task 0.3: Review Agent Capability Matrix

**Agent**: `codebase-researcher`

**Prompt**:
```
Analyze all agent definitions in .claude/agents/*.md

Create a capability matrix:
| Agent | Primary Capability | Can Write Files | Typical Task Duration |
|-------|-------------------|-----------------|----------------------|

Also identify which agents are "research-only" (read-only) vs "execution" (write files).

Output: specs/orchestrator-context-optimization/outputs/agent-matrix.md
```

#### Task 0.4: Analyze Knowledge-Graph-Integration Context Issues

**Agent**: `reflector` (if REFLECTION_LOG exists) OR manual analysis

If `specs/knowledge-graph-integration/REFLECTION_LOG.md` has entries, use reflector agent.
Otherwise, manually analyze:
- `MASTER_ORCHESTRATION.md` phase sizes
- `P0_ORCHESTRATOR_PROMPT.md` for inline work instructions
- Estimate context consumption per phase

Document in `outputs/kgi-context-analysis.md`.

### Checkpoint

Before proceeding to P1:
- [ ] `outputs/orchestrator-audit.md` created
- [ ] `outputs/spec-guide-gaps.md` created
- [ ] `outputs/agent-matrix.md` created
- [ ] `outputs/kgi-context-analysis.md` created
- [ ] Anti-patterns documented
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P1.md` created
- [ ] `handoffs/P1_ORCHESTRATOR_PROMPT.md` created

---

## Phase 1: Design

**Duration**: 1 session
**Status**: Ready
**Agents**: `doc-writer` (for drafting), manual synthesis

### Phase Artifacts

| Artifact | Location | Description |
|----------|----------|-------------|
| Delegation Rules Draft | `outputs/delegation-rules-draft.md` | Task-to-agent matrix and trigger rules |
| Phase Sizing Guidelines | `outputs/phase-sizing-guidelines.md` | Hard limits and split triggers |
| Context Budget Protocol | `outputs/context-budget-protocol.md` | Zone system with checkpoint protocol |
| Orchestrator Template | `templates/ORCHESTRATOR_PROMPT.template.md` | Standard template for all specs |

### Objectives

1. Define mandatory delegation rules
2. Establish phase sizing constraints
3. Create context budget protocol
4. Design orchestrator prompt template

### Tasks

#### Task 1.1: Define Delegation Rules

Based on P0 analysis, define explicit rules:

**Mandatory Delegation Matrix**:
```markdown
| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Code exploration (> 3 files) | codebase-researcher | Sequential Glob/Read |
| Effect documentation lookup | mcp-researcher | Manual doc searching |
| Source code implementation | effect-code-writer | Writing .ts files |
| Test implementation | test-writer | Writing .test.ts files |
| Architecture validation | architecture-pattern-enforcer | Layer checks |
| README/AGENTS.md creation | doc-writer | Documentation files |
| Build/lint error fixing | package-error-fixer | Manual error fixing |
```

**Delegation Trigger Rules**:
- If task requires > 3 file reads → DELEGATE
- If task requires > 5 tool calls → DELEGATE
- If task involves code generation → DELEGATE
- If task involves test generation → DELEGATE

#### Task 1.2: Establish Phase Sizing Constraints

Define constraints to prevent context exhaustion:

**Phase Size Limits**:
- **Maximum work items per phase**: 7 (hard limit)
- **Recommended work items**: 5-6
- **Maximum sub-agent delegations per phase**: 10
- **Maximum direct orchestrator tool calls**: 20

**Work Item Classification**:
- **Small**: 1-2 tool calls or 1 sub-agent delegation
- **Medium**: 3-5 tool calls or 2-3 sub-agent delegations
- **Large**: 6+ tool calls or 4+ sub-agent delegations

**Phase Split Triggers**:
- Phase has 8+ work items → Split into P[N]a, P[N]b
- Phase has 3+ "Large" work items → Split
- Estimated duration > 2 sessions → Split

#### Task 1.3: Create Context Budget Protocol

**Context Budget Heuristics**:

| Metric | Green Zone | Yellow Zone | Red Zone (Checkpoint!) |
|--------|------------|-------------|------------------------|
| Direct tool calls | 0-10 | 11-15 | 16+ |
| Large file reads (> 200 lines) | 0-2 | 3-4 | 5+ |
| Sub-agent delegations | 0-5 | 6-8 | 9+ |
| Accumulated response size | < 50KB | 50-100KB | > 100KB |

**Checkpoint Protocol**:

When entering Yellow Zone:
1. Assess remaining work
2. If < 30% remaining, continue cautiously
3. If > 30% remaining, create checkpoint handoff

When entering Red Zone:
1. STOP current work immediately
2. Create `HANDOFF_P[N]_CHECKPOINT_[timestamp].md`
3. Document: completed, in-progress, remaining
4. Either continue in new session OR hand off

#### Task 1.4: Design Orchestrator Prompt Template

Create template for `specs/templates/ORCHESTRATOR_PROMPT.template.md`:

```markdown
# Phase [N] Orchestrator Prompt

## Your Role: COORDINATOR, NOT EXECUTOR

You are orchestrating Phase [N] of [SPEC_NAME]. Your job is to:
- PLAN task breakdown
- DELEGATE all research and implementation to sub-agents
- SYNTHESIZE sub-agent outputs
- CHECKPOINT proactively

**CRITICAL**: You MUST NOT:
- Read > 3 files directly (delegate to codebase-researcher)
- Write any source code (delegate to effect-code-writer or test-writer)
- Search documentation manually (delegate to mcp-researcher)
- Fix errors manually (delegate to package-error-fixer)

## Delegation Matrix

[Include full matrix]

## Context Budget

Track your context consumption:
- Direct tool calls: [0/20 max]
- Large file reads: [0/5 max]
- Sub-agent delegations: [0/10 max]

**Checkpoint when any metric reaches 75%**

## Phase Work Items (max 7)

1. [Work item 1] - Delegate to: [agent]
2. [Work item 2] - Delegate to: [agent]
...

## Verification

[Standard verification commands]

## Next Steps

After completing Phase [N]:
1. Update REFLECTION_LOG.md
2. Create HANDOFF_P[N+1].md
3. Create P[N+1]_ORCHESTRATOR_PROMPT.md
```

### Checkpoint

Before proceeding to P2:
- [ ] Delegation rules documented
- [ ] Phase sizing constraints defined
- [ ] Context budget protocol designed
- [ ] Orchestrator prompt template drafted
- [ ] All designs reviewed for clarity
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P2.md` created
- [ ] `handoffs/P2_ORCHESTRATOR_PROMPT.md` created

---

## Phase 2: Implementation

**Duration**: 1-2 sessions
**Status**: Pending
**Agents**: `doc-writer`

### Objectives

1. Update `specs/SPEC_CREATION_GUIDE.md` with delegation rules
2. Update `specs/HANDOFF_STANDARDS.md` with context budget protocol
3. Create `specs/AGENT_DELEGATION_MATRIX.md`
4. Create orchestrator prompt template
5. Update existing orchestrator prompts (optional, scope-dependent)

### Tasks

#### Task 2.1: Update SPEC_CREATION_GUIDE.md

**Agent**: `doc-writer`

**Prompt**:
```
Update specs/SPEC_CREATION_GUIDE.md to add:

1. New section "## Orchestrator Delegation Rules" after "## Agent-Phase Mapping"
   - Include the mandatory delegation matrix
   - Include delegation trigger rules
   - Include explicit "NEVER do directly" list

2. New section "## Phase Sizing Constraints" after "## Standard Spec Structure"
   - Maximum work items per phase
   - Work item classification
   - Phase split triggers

3. Update "## Anti-Patterns" section
   - Add "### 11. Orchestrator Doing Research Directly"
   - Add "### 12. Unbounded Phase Sizes"
   - Add "### 13. Late Context Checkpoints"

Reference: specs/orchestrator-context-optimization/outputs/* for content
```

#### Task 2.2: Update HANDOFF_STANDARDS.md

**Agent**: `doc-writer`

**Prompt**:
```
Update specs/HANDOFF_STANDARDS.md to add:

1. New section "## Context Budget Protocol" before "## Mandatory Requirements"
   - Context budget heuristics table
   - Checkpoint protocol (Yellow/Red zones)
   - Checkpoint handoff format

2. New section "## Intra-Phase Checkpoints"
   - When to create mid-phase checkpoints
   - HANDOFF_P[N]_CHECKPOINT format
   - Recovery protocol for interrupted phases

3. Update "## Verification Checklist for Handoff Authors"
   - Add context budget tracking items

Reference: specs/orchestrator-context-optimization/outputs/* for content
```

#### Task 2.3: Create AGENT_DELEGATION_MATRIX.md

**Agent**: `doc-writer`

**Prompt**:
```
Create specs/AGENT_DELEGATION_MATRIX.md with:

1. Complete matrix of all agents and their capabilities
2. Task type to agent mapping
3. Decision tree for "which agent should I use?"
4. Examples of proper delegation vs anti-patterns

Reference:
- specs/orchestrator-context-optimization/outputs/agent-matrix.md
- .claude/agents/*.md for agent definitions
```

#### Task 2.4: Create Orchestrator Prompt Template

**Agent**: `doc-writer`

**Prompt**:
```
Create specs/templates/ORCHESTRATOR_PROMPT.template.md with:

1. Role definition (coordinator, not executor)
2. Embedded delegation matrix
3. Context budget tracking section
4. Work item template with delegation assignments
5. Verification section
6. Next steps section

Reference: Phase 1 design from Task 1.4
```

#### Task 2.5: Verify Changes

**Agent**: Manual verification

```bash
# Lint updated files
bun run lint:fix specs/

# Manual review checklist:
# - [ ] SPEC_CREATION_GUIDE has delegation section
# - [ ] SPEC_CREATION_GUIDE has phase sizing section
# - [ ] HANDOFF_STANDARDS has context budget section
# - [ ] AGENT_DELEGATION_MATRIX exists and is complete
# - [ ] Orchestrator template exists
```

### Checkpoint

Before proceeding to P3:
- [ ] `SPEC_CREATION_GUIDE.md` updated
- [ ] `HANDOFF_STANDARDS.md` updated
- [ ] `AGENT_DELEGATION_MATRIX.md` created
- [ ] `templates/ORCHESTRATOR_PROMPT.template.md` created
- [ ] All files pass lint
- [ ] Manual review complete
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] `handoffs/P3_ORCHESTRATOR_PROMPT.md` created

---

## Phase 3: Validation

**Duration**: 1 session
**Status**: Pending
**Agents**: Various (test run)

### Objectives

1. Validate updated documentation is clear and actionable
2. Test delegation rules with a sample orchestration
3. Test context budget tracking effectiveness
4. Capture final learnings

### Tasks

#### Task 3.1: Documentation Review

**Agent**: `spec-reviewer`

**Prompt**:
```
Review the updated specs documentation:
- specs/SPEC_CREATION_GUIDE.md
- specs/HANDOFF_STANDARDS.md
- specs/AGENT_DELEGATION_MATRIX.md

Check:
1. Are delegation rules clear and unambiguous?
2. Are phase sizing constraints actionable?
3. Is context budget protocol easy to follow?
4. Are examples sufficient?

Output: specs/orchestrator-context-optimization/outputs/documentation-review.md
```

#### Task 3.2: Simulated Orchestration Test

**Agent**: Manual (the orchestrator testing itself)

Execute a mini-orchestration following the new rules:

1. Define a test task: "Research existing table patterns in packages/iam/tables/"
2. Apply delegation rules - delegate to codebase-researcher
3. Track context budget metrics
4. Evaluate: Did delegation prevent context bloat?

Document in `outputs/orchestration-test.md`.

#### Task 3.3: Checkpoint Protocol Test

**Agent**: Manual

Simulate reaching Yellow Zone:
1. Manually count tool calls (pretend 12 reached)
2. Follow checkpoint protocol
3. Create sample `HANDOFF_P[N]_CHECKPOINT.md`
4. Evaluate: Is the protocol clear?

Document in `outputs/checkpoint-test.md`.

#### Task 3.4: Final Learnings

Update `REFLECTION_LOG.md` with:
- What worked in the new delegation approach
- What friction points remain
- Recommendations for future specs

### Checkpoint (Final)

Spec complete when:
- [ ] `outputs/documentation-review.md` shows no major issues
- [ ] `outputs/orchestration-test.md` demonstrates delegation works
- [ ] `outputs/checkpoint-test.md` shows protocol is usable
- [ ] `REFLECTION_LOG.md` has final learnings
- [ ] All deliverables listed in README exist

---

## Cross-Phase Considerations

### Orchestrator Self-Application

**CRITICAL**: While executing this spec, the orchestrator MUST follow the principles being defined:

1. **Delegate research tasks** - Use codebase-researcher for file analysis
2. **Track context budget** - Don't exhaust context while defining rules to prevent exhaustion
3. **Checkpoint proactively** - Create handoffs before Yellow Zone

### Eating Our Own Dog Food

This spec serves as a test case. If the orchestrator exhausts context while creating context optimization rules, that's valuable feedback for refining the rules.

### Documentation Updates

Each phase may refine the deliverables based on learnings. The final `SPEC_CREATION_GUIDE.md` update should incorporate all refinements.

---

## Sub-Agent Reflection Protocol

### Purpose

When orchestrators delegate tasks to specialized sub-agents, those agents accumulate valuable learnings that would otherwise be lost. This protocol ensures sub-agent reflections are captured, organized, and fed back into repository improvements.

### Naming Convention

Sub-agent reflections follow a structured naming pattern:

```
outputs/reflections/
├── [phase]-[agent-type]-[task-id].reflection.md
│
├── p0-codebase-researcher-0.1.reflection.md
├── p0-codebase-researcher-0.3.reflection.md
├── p1-doc-writer-1.1.reflection.md
├── p1-doc-writer-1.2.reflection.md
├── p2-effect-code-writer-2.1.reflection.md
└── p3-spec-reviewer-3.1.reflection.md
```

**Naming Structure**:
- `[phase]` - p0, p1, p2, p3 (lowercase, matches phase number)
- `[agent-type]` - The agent name (kebab-case)
- `[task-id]` - Task identifier from MASTER_ORCHESTRATION (e.g., 0.1, 1.2)

### Sub-Agent Reflection Template

Each sub-agent MUST produce a reflection upon task completion:

```markdown
# Sub-Agent Reflection: [Task ID]

**Agent**: [agent-type]
**Task**: [brief description]
**Phase**: P[N]
**Date**: YYYY-MM-DD

---

## What Worked

- [Success item 1]
- [Success item 2]
- [Success item 3]

## What Didn't Work

- [Failure item 1]
- [Failure item 2]

## What I Wish I Knew When I Started

- [Insight 1 - specific to this task/codebase]
- [Insight 2 - would have saved time]
- [Insight 3 - unexpected complexity]

## Recommendations: Repository Documentation

**Target**: [file path or documentation section]
**Recommendation**: [specific improvement]
**Rationale**: [why this would help future agents]

## Recommendations: Agent Configuration

**Target**: `.claude/agents/[agent-name].md`
**Recommendation**: [specific improvement to agent definition]
**Rationale**: [how this would improve task execution efficiency]

---

## Metadata

- **Tool calls made**: [count]
- **Files read**: [count]
- **Files written**: [count]
- **Estimated context consumed**: [low/medium/high]
```

### Orchestrator Integration

Orchestrators MUST:

1. **Request reflections** when spawning sub-agents:
   ```
   After completing your task, create a reflection file at:
   outputs/reflections/p[N]-[agent-type]-[task-id].reflection.md

   Include: what worked, what didn't, what you wish you knew,
   and recommendations for docs/agent config.
   ```

2. **Synthesize reflections** at phase end:
   - Review all sub-agent reflections from the phase
   - Extract actionable recommendations
   - Update REFLECTION_LOG.md with synthesized learnings

3. **Track reflection compliance** in checkpoints:
   ```markdown
   ### Checkpoint
   - [ ] All sub-agent reflections captured
   - [ ] Reflections synthesized into REFLECTION_LOG.md
   - [ ] Actionable recommendations documented
   ```

### Reflection Synthesis Protocol

At phase completion, orchestrators synthesize sub-agent reflections:

```markdown
### Phase [N] Sub-Agent Synthesis

**Reflections reviewed**: [count]
**Agents represented**: [list]

#### Common Successes
- [Pattern that worked across multiple agents]

#### Common Challenges
- [Challenge multiple agents faced]

#### Actionable Recommendations

| Source | Target | Recommendation | Priority |
|--------|--------|----------------|----------|
| p1-doc-writer-1.1 | SPEC_CREATION_GUIDE | Add example for X | High |
| p1-effect-schema-expert-1.3 | .claude/agents/effect-schema-expert.md | Include Y pattern | Medium |

#### Applied Improvements
- [x] Updated X based on agent feedback
- [ ] Pending: Y requires further discussion
```

### Directory Structure

```
specs/orchestrator-context-optimization/
├── outputs/
│   ├── reflections/           # Sub-agent reflections
│   │   ├── p0-codebase-researcher-0.1.reflection.md
│   │   ├── p0-codebase-researcher-0.3.reflection.md
│   │   └── ...
│   ├── orchestrator-audit.md  # Phase 0 artifacts
│   ├── spec-guide-gaps.md
│   ├── agent-matrix.md
│   └── kgi-context-analysis.md
└── ...
```

### Benefits

1. **Knowledge preservation**: Sub-agent learnings aren't lost between tasks
2. **Agent improvement**: Feedback loop for refining agent definitions
3. **Documentation enhancement**: Real-world recommendations for docs
4. **Pattern recognition**: Orchestrators can identify recurring challenges
5. **Onboarding**: New orchestrators can learn from past sub-agent experiences

---

## Iteration Protocol

After each phase:

1. **Verify** - Check outputs exist and are complete
2. **Reflect** - Update REFLECTION_LOG.md
3. **Handoff** - Create BOTH handoff files
4. **Review** - Ensure new rules are being followed

---

## Success Metrics

| Metric | Pre-Spec Baseline | Target |
|--------|-------------------|--------|
| Phases completing without context exhaustion | ~60% | > 95% |
| Research tasks delegated to sub-agents | ~30% | > 90% |
| Explicit phase size constraints in specs | 0% | 100% |
| Context checkpoint triggers defined | None | All specs |
| Sub-agent reflections captured | 0% | > 80% |
| Agent improvements from reflections | None | Quarterly updates |
