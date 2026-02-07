# Debug Workflow (Codex Adaptation)

Adapted from `.claude/commands/debug.md` without requiring runtime multi-agent spawn primitives.

## Track-based debugging contract

1. Decompose bug into 3-4 independent tracks.
2. Gather evidence per track with file:line references.
3. Compare root-cause hypotheses and resolve conflicts.
4. Present consensus and confidence before code edits.

## Required output format

- Root Cause
- Evidence
- Proposed Fix
- Confidence level
- Open questions
