#!/usr/bin/env bun
/**
 * Script to update HANDOFF_STANDARDS.md with context budget protocol sections.
 */

const filePath = "/home/elpresidank/YeeBois/projects/beep-effect/specs/HANDOFF_STANDARDS.md";

// Read the file
const content = await Bun.file(filePath).text();

// Define the insertions
const contextBudgetSection = `
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
2. Create \`HANDOFF_P[N]_CHECKPOINT.md\`
3. Either continue in new session or hand off

### Checkpoint Trigger Events

Create a checkpoint when ANY of these occur:
- Direct tool calls reach 15
- Large file reads reach 4
- 3 major sub-tasks completed
- Subjective "context pressure" feeling
- Before starting large/risky work item

---

`;

const intraPhaseCheckpointsSection = `
## Intra-Phase Checkpoints

For phases that risk exceeding context limits, use intra-phase checkpoints.

### When to Use

- Phase has 6-7 work items
- Phase involves multiple large sub-agent delegations
- Entering Yellow Zone mid-phase

### Checkpoint File Format

\`\`\`markdown
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
\`\`\`

### Recovery Protocol

When resuming from a checkpoint:
1. Read the checkpoint file first
2. Review "In Progress" and "Remaining Work" sections
3. Check "Resume Instructions" for specific guidance
4. DO NOT re-do completed work
5. Continue delegating per the delegation matrix

---

`;

const contextBudgetChecklist = `
### Context Budget Checklist

- [ ] Context budget was tracked during phase execution
- [ ] No Red Zone violations occurred (or were properly checkpointed)
- [ ] Sub-agent delegations were used appropriately
- [ ] Checkpoint files exist for any mid-phase pauses

`;

// Perform replacements
let updatedContent = content;

// Insert 1: Context Budget Protocol before "## Mandatory Requirements"
updatedContent = updatedContent.replace(
  "**Rule**: Any spec spanning multiple Claude sessions MUST use handoffs to preserve context.\n\n---\n\n## Mandatory Requirements",
  `**Rule**: Any spec spanning multiple Claude sessions MUST use handoffs to preserve context.\n\n---\n${contextBudgetSection}## Mandatory Requirements`
);

// Insert 2: Intra-Phase Checkpoints after "Critical Rule" and before "## Anti-Patterns"
updatedContent = updatedContent.replace(
  "**A phase is NOT complete until BOTH files exist and pass their respective checklists.**\n\n---\n\n## Anti-Patterns",
  `**A phase is NOT complete until BOTH files exist and pass their respective checklists.**\n\n---\n${intraPhaseCheckpointsSection}## Anti-Patterns`
);

// Insert 3: Context Budget Checklist before "### Critical Rule"
updatedContent = updatedContent.replace(
  "### Critical Rule\n\n**A phase is NOT complete until BOTH files exist and pass their respective checklists.**",
  `${contextBudgetChecklist}### Critical Rule\n\n**A phase is NOT complete until BOTH files exist and pass their respective checklists.**`
);

// Write the updated content
await Bun.write(filePath, updatedContent);

console.log("✓ Successfully updated HANDOFF_STANDARDS.md with context budget protocol sections");
console.log("  - Added Context Budget Protocol section before Mandatory Requirements");
console.log("  - Added Intra-Phase Checkpoints section after Verification Checklist");
console.log("  - Added Context Budget Checklist at end of Verification Checklist section");
