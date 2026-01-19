# Context Budget Protocol

## Purpose

Define a tracking mechanism and checkpoint triggers to prevent context exhaustion during orchestration. This protocol ensures orchestrators maintain awareness of context consumption and checkpoint proactively.

## Budget Zones

| Zone | Direct Tool Calls | Large File Reads | Sub-Agent Delegations | Action Required |
|------|-------------------|------------------|----------------------|-----------------|
| **Green** | 0-10 | 0-2 | 0-5 | Continue normally |
| **Yellow** | 11-15 | 3-4 | 6-8 | Assess remaining work |
| **Red** | 16+ | 5+ | 9+ | STOP and checkpoint |

### What Counts as Each Metric

**Direct Tool Calls**:
- Each Glob, Grep, Read, Write, Edit, Bash command
- Does NOT include Task delegations (those are tracked separately)

**Large File Reads**:
- Any file read >200 lines
- Multiple reads of the same large file count as multiple reads

**Sub-Agent Delegations**:
- Each Task tool invocation
- Background tasks count when launched, not when completed

## Zone Transition Protocol

### Entering Yellow Zone

When ANY metric enters the Yellow Zone:

1. **PAUSE and assess remaining work**:
   - How much work remains? (Estimate: <30% or >30%)
   - Can remaining work be fully delegated?
   - Is current progress sufficient for a meaningful checkpoint?

2. **If <30% remaining work**:
   - Continue cautiously
   - Monitor all metrics closely
   - Avoid any new large file reads
   - Prefer delegation over direct action

3. **If >30% remaining work**:
   - Create interim checkpoint NOW
   - Do not attempt to "push through"
   - Document progress and hand off

### Entering Red Zone (CRITICAL)

When ANY metric enters the Red Zone:

1. **STOP current task IMMEDIATELY**
   - Do not attempt to "finish quickly"
   - Do not make additional tool calls for "cleanup"

2. **Create checkpoint handoff**:
   - File: `handoffs/HANDOFF_P[N]_CHECKPOINT.md`
   - Include all required sections (see template below)

3. **Choose recovery path**:
   - **Option A**: Continue in new session with fresh context
   - **Option B**: Hand off to another orchestrator session
   - **Option C**: Mark phase as requiring split

## Checkpoint Triggers

Create a checkpoint when ANY of these occur (regardless of zone):

### Trigger 1: Tool Call Threshold
- Direct tool calls reach 15

### Trigger 2: File Read Threshold
- Large file reads reach 4

### Trigger 3: Delegation Threshold
- Sub-agent delegations reach 8

### Trigger 4: Task Milestone
- 3 major sub-tasks completed successfully

### Trigger 5: Subjective Assessment
- "Context feeling heavy" (valid trigger - trust your instincts)
- Noticing slower response generation
- Difficulty maintaining full task context

### Trigger 6: Risk Assessment
- Before starting a large/risky work item
- Before a task that might fail and require recovery

## Checkpoint Handoff Template

```markdown
# Phase [N] Checkpoint: [Brief Description]

**Timestamp**: YYYY-MM-DD HH:MM
**Checkpoint Reason**: [Yellow Zone / Red Zone / Task Milestone / Proactive / Manual]

## Context Budget Status at Checkpoint

| Metric | Value | Limit | Zone |
|--------|-------|-------|------|
| Direct tool calls | X | 20 | [zone] |
| Large file reads | X | 5 | [zone] |
| Sub-agent delegations | X | 10 | [zone] |

## Completed Work

- [x] Work item 1 - [brief outcome]
- [x] Work item 2 - [brief outcome]

## In Progress

- [ ] Work item 3
  - **Status**: [describe current state]
  - **Partial outputs**: [list any files created]
  - **Remaining**: [what's left on this item]

## Remaining Work

- [ ] Work item 4 - [delegation assignment]
- [ ] Work item 5 - [delegation assignment]

## Sub-Agent Outputs to Preserve

These sub-agent outputs should be referenced when resuming:
- `outputs/[file1].md` - [what it contains]
- `outputs/[file2].md` - [what it contains]

## Critical Context

[Any important decisions, discoveries, or state that the next session needs to know]

## Resume Instructions

1. Read this checkpoint file first
2. Review "In Progress" section for partial work
3. Check referenced sub-agent outputs
4. Continue with: [specific next action]
5. Maintain delegation discipline per the delegation matrix
```

## Proactive Checkpointing Best Practices

**Best Practice**: Create checkpoints BEFORE hitting limits.

### Recommended Checkpoint Rhythm

1. **After initial planning**: Once work items are defined, checkpoint the plan
2. **After major delegation completes**: Each large sub-agent output merits a checkpoint
3. **At 50% completion**: Mid-phase checkpoint ensures recovery is possible
4. **Before risky operations**: Any operation that might fail should be preceded by a checkpoint

### Signs You Should Checkpoint

- You're about to delegate a large task
- You just received a large sub-agent output and synthesized it
- You're switching between different types of work
- You feel uncertain about next steps
- The conversation is getting long

## Context Budget Tracker Template

Include this in your orchestrator working memory:

```markdown
## Context Budget Tracker

| Metric | Current | Limit | Zone |
|--------|---------|-------|------|
| Direct tool calls | 0 | 20 | Green |
| Large file reads | 0 | 5 | Green |
| Sub-agent delegations | 0 | 10 | Green |

**Last updated**: [after action X]
**Next checkpoint**: [condition]
```

Update this tracker:
- After every tool call
- After every file read
- After every delegation launch

## Recovery Protocol

When resuming from a checkpoint:

1. **Read checkpoint file** as first action
2. **DO NOT re-do completed work** - trust the checkpoint
3. **Check sub-agent outputs** referenced in checkpoint
4. **Reset budget tracker** for new session
5. **Continue from documented "Resume Instructions"**

## Common Mistakes to Avoid

### Mistake 1: Ignoring Yellow Zone
**Wrong**: "I'm at 14 tool calls but almost done, let me push through"
**Right**: Assess remaining work, checkpoint if >30% remains

### Mistake 2: Rushed Red Zone Handoffs
**Wrong**: Quick bullet points when hitting Red Zone
**Right**: Take time for thorough checkpoint documentation

### Mistake 3: Not Tracking Between Actions
**Wrong**: Only check budget at phase end
**Right**: Update tracker after every significant action

### Mistake 4: Underestimating Large File Impact
**Wrong**: Reading 5 large files "to understand context"
**Right**: Delegate research to codebase-researcher instead

### Mistake 5: Treating Zones as Soft Guidelines
**Wrong**: "Red Zone is just a suggestion, I can keep going"
**Right**: Zones are HARD LIMITS - Red Zone requires immediate checkpoint

### Mistake 6: Not Updating Tracker Incrementally
**Wrong**: Trying to count tool calls retrospectively at phase end
**Right**: Update tracker after each significant action in real-time

## Integration with Orchestrator Workflow

### At Phase Start

```markdown
## Phase [N] Initialization

**Context Budget**: RESET to Green Zone (all metrics at 0)
**Previous Checkpoint**: [file path or "N/A - new phase"]
**Estimated Complexity**: [Low / Medium / High]
**Planned Checkpoints**: [list milestone-based checkpoint targets]
```

### During Phase Execution

After every action that consumes budget:

1. **Update tracker** (add to current count)
2. **Check zone status** (compare against limits)
3. **If zone changed**: Apply zone transition protocol
4. **Document checkpoint triggers** if any activated

### At Phase End

```markdown
## Phase [N] Budget Summary

**Final Budget Status**:
| Metric | Final Value | Checkpoints Created |
|--------|-------------|---------------------|
| Direct tool calls | X | Y |
| Large file reads | X | Y |
| Sub-agent delegations | X | Y |

**Checkpoints Created**: [list with reasons]
**Budget Overruns**: [any Red Zone breaches - document WHY]
**Lessons Learned**: [retrospective notes for future phases]
```

## Calibration and Adjustment

### When to Adjust Limits

The budget limits in this protocol are starting recommendations. Adjust based on:

1. **Phase complexity observed**: Some phases may warrant tighter limits
2. **Orchestrator experience**: Experienced orchestrators may handle Yellow Zone better
3. **Task type**: Research-heavy vs implementation-heavy phases differ
4. **Checkpoint effectiveness**: If checkpoints consistently fail to preserve context, limits are too high

### Adjustment Process

1. **Document current limits**: Record in phase plan
2. **Note adjustment rationale**: Why limits were changed
3. **Track outcomes**: Did adjusted limits prevent context exhaustion?
4. **Update protocol**: If adjustment proves successful across multiple phases

### Red Zone is Non-Negotiable

Yellow and Green zone limits may be calibrated, but **Red Zone limits are absolute**:
- 20 direct tool calls maximum
- 5 large file reads maximum
- 10 sub-agent delegations maximum

Exceeding Red Zone limits indicates orchestration design failure, not just budget management failure.

## Emergency Context Recovery

If you realize you've exceeded Red Zone limits without checkpointing:

### Immediate Actions

1. **STOP all work immediately**
2. **Create emergency checkpoint** with current state
3. **Mark checkpoint as "EMERGENCY RECOVERY"**
4. **Document**: What was missed? What tool calls were not tracked?
5. **Assess risk**: Can work continue or should phase be restarted?

### Emergency Checkpoint Template

```markdown
# EMERGENCY CHECKPOINT - Phase [N]

**WARNING**: This checkpoint was created after exceeding budget limits.

## Budget Status (EXCEEDED)

| Metric | Value | Limit | Overage |
|--------|-------|-------|---------|
| Direct tool calls | X | 20 | +Y |
| Large file reads | X | 5 | +Y |
| Sub-agent delegations | X | 10 | +Y |

## Context Risk Assessment

**Estimated context consumed**: [X%]
**Risk of incomplete handoff**: [Low / Medium / High]
**Recommended action**: [Continue / Restart Phase / Re-delegate]

## Work Completed (with uncertainty)

[List work done, but note that context may be fragmented]

## Recovery Plan

1. [Specific steps to recover from budget overrun]
2. [How to verify work quality]
3. [Whether to continue or restart]
```

## Delegation Impact on Budget

### Cost of Delegation

Delegation appears cheaper (1 tool call = 1 Task invocation) but has hidden costs:

**Visible Cost**:
- 1 sub-agent delegation metric increment

**Hidden Costs**:
- Reading agent's output file (may be large)
- Synthesizing output into phase context
- Potential follow-up questions (more tool calls)

### Budget-Aware Delegation

When delegating:

1. **Specify output constraints**: "Provide summary with key findings, max 200 lines"
2. **Request structured output**: Tables, bullet lists (easier to synthesize)
3. **Limit scope**: Focused tasks yield focused outputs
4. **Plan for synthesis cost**: Reserve budget for reading/processing agent output

### Delegation vs Direct Work Trade-off

| Scenario | Delegation Cost | Direct Work Cost | Recommendation |
|----------|----------------|------------------|----------------|
| Read 1 file, extract specific info | 1 delegation + 1 output read | 1 file read | Direct work (cheaper) |
| Read 5+ files, synthesize findings | 1 delegation + 1 output read | 5+ file reads | Delegation (cheaper) |
| Complex analysis requiring context | 1 delegation + 1 output read | Multiple tool calls | Delegation (cheaper) |
| Simple transformation | 1 delegation + 1 output read | 2-3 tool calls | Direct work (faster) |

## Budget Awareness Checklist

Before each action, ask:

- [ ] What is my current budget status?
- [ ] Will this action push me into Yellow/Red Zone?
- [ ] Is there a cheaper way to accomplish this?
- [ ] Should I checkpoint before this action?
- [ ] Can I delegate instead of doing directly?
- [ ] Is this action necessary or nice-to-have?

## Meta-Observation

This protocol treats context budget as a first-class constraint, equivalent to time or compute resources. The zone system provides graduated warnings rather than hard failures, allowing orchestrators to make informed decisions about trade-offs between thoroughness and budget consumption.

The checkpoint rhythm shifts from "document when stuck" to "document proactively to never get stuck" - a fundamental change in orchestration mindset.
