# Session Handoff Workflow (Codex Adaptation)

Adapted from `.claude/skills/session-handoff/SKILL.md` without `.claude` script dependencies.

## When to create a handoff

- User requests pause/continue context
- Major milestone reached
- Session is ending with pending work

## Create workflow

1. Create or update handoff in `specs/<spec>/handoffs/`.
2. Capture working, episodic, semantic, and procedural context.
3. Include exact next steps and blockers with owners.
4. Validate referenced files exist.

## Resume workflow

1. Read latest `HANDOFF_P[N].md` and matching `P[N]_ORCHESTRATOR_PROMPT.md`.
2. Verify assumptions still match repository state.
3. Continue from first unresolved next step.

## Required pairing rule

A phase handoff is complete only when both files exist:
- `HANDOFF_P[N].md`
- `P[N]_ORCHESTRATOR_PROMPT.md`
