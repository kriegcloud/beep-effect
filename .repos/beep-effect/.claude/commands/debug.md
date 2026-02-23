---
description: Spawn 4 parallel agents to independently diagnose a bug, then validate consensus
---

You are debugging a reported issue. Follow this protocol exactly:

## Phase 1: Parallel Independent Analysis

Spawn exactly 4 Explore agents IN PARALLEL with identical prompts. Each agent must independently:

1. Investigate the bug described below
2. Identify the root cause
3. Propose a fix

<agent-prompt>
Investigate this bug independently. Do NOT coordinate with other agents.

**Bug Report:**
<user-prompt>
$ARGUMENTS
</user-prompt>

Your task:
1. Search the codebase to understand the relevant code paths
2. Identify the root cause of the bug
3. Propose a specific fix with file paths and code changes

Be thorough. Check assumptions. Consider edge cases.

Return your analysis in this format:
- **Root Cause**: [one sentence]
- **Evidence**: [file paths and line numbers that support your conclusion]
- **Proposed Fix**: [specific changes needed]
</agent-prompt>

## Phase 2: Consensus Validation

After all 4 agents complete, compare their conclusions:

1. **If all 4 agree on root cause**: High confidence - proceed with the fix
2. **If 3/4 agree**: Good confidence - note the dissenting view, proceed with majority
3. **If 2/2 split or no majority**: Investigate further - the bug may be more complex than it appears

Report the consensus (or lack thereof) to the user before taking any action.

## Phase 3: Resolution

Only after reporting consensus, ask the user if they want you to implement the agreed-upon fix.
