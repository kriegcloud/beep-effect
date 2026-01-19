#!/usr/bin/env python3
"""
Script to update HANDOFF_STANDARDS.md with context budget protocol sections.
"""

def main():
    file_path = "/home/elpresidank/YeeBois/projects/beep-effect/specs/HANDOFF_STANDARDS.md"

    # Read the file
    with open(file_path, 'r') as f:
        content = f.read()

    # Define the insertions
    context_budget_section = """
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

"""

    intra_phase_checkpoints_section = """
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

"""

    context_budget_checklist = """
### Context Budget Checklist

- [ ] Context budget was tracked during phase execution
- [ ] No Red Zone violations occurred (or were properly checkpointed)
- [ ] Sub-agent delegations were used appropriately
- [ ] Checkpoint files exist for any mid-phase pauses

"""

    # Insert 1: Context Budget Protocol before "## Mandatory Requirements"
    content = content.replace(
        "**Rule**: Any spec spanning multiple Claude sessions MUST use handoffs to preserve context.\n\n---\n\n## Mandatory Requirements",
        f"**Rule**: Any spec spanning multiple Claude sessions MUST use handoffs to preserve context.\n\n---\n\n{context_budget_section}## Mandatory Requirements"
    )

    # Insert 2: Intra-Phase Checkpoints after "Critical Rule" and before "## Anti-Patterns"
    content = content.replace(
        "**A phase is NOT complete until BOTH files exist and pass their respective checklists.**\n\n---\n\n## Anti-Patterns",
        f"**A phase is NOT complete until BOTH files exist and pass their respective checklists.**\n\n---\n\n{intra_phase_checkpoints_section}## Anti-Patterns"
    )

    # Insert 3: Context Budget Checklist before "### Critical Rule"
    content = content.replace(
        "### Critical Rule\n\n**A phase is NOT complete until BOTH files exist and pass their respective checklists.**",
        f"{context_budget_checklist}### Critical Rule\n\n**A phase is NOT complete until BOTH files exist and pass their respective checklists.**"
    )

    # Write the updated content
    with open(file_path, 'w') as f:
        f.write(content)

    print("✓ Successfully updated HANDOFF_STANDARDS.md with context budget protocol sections")
    print("  - Added Context Budget Protocol section before Mandatory Requirements")
    print("  - Added Intra-Phase Checkpoints section after Verification Checklist")
    print("  - Added Context Budget Checklist at end of Verification Checklist section")

if __name__ == "__main__":
    main()
