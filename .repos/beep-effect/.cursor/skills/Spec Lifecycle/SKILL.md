---
name: Spec Lifecycle
description: Create and run multi-phase specs with handoffs. Use when starting a new spec, scaffolding phases, or handing off between sessions (equivalent to /new-spec and handoff workflows in Claude/Codex).
---

# Spec Lifecycle Skill

Use this skill when creating new specifications or handing off between phases/sessions. Cursor has no `/command` surface; invoke this workflow via prompt or @-mention (e.g. "Create a new spec for X" or "Execute Phase 2 per HANDOFF_P2").

## When to Use

- Creating a new specification for a multi-session or multi-phase task
- Planning a feature that needs research, design, and implementation phases
- Handing off to a new session at the end of a phase
- Working from an orchestrator prompt (e.g. `specs/…/handoffs/P[N]_ORCHESTRATOR_PROMPT.md`)

**Do NOT use for:** simple bug fixes, single-session tasks, docs-only changes.

## New Spec Workflow

1. **Assess complexity** using the factor/weight formula (see `specs/_guide/README.md` or `.claude/commands/new-spec.md`).
2. **Scaffold** with CLI:
   ```bash
   bun run repo-cli bootstrap-spec -n SPEC_NAME -d "Description" -c simple|medium|complex
   ```
3. **Plan phases** and agent/skill mapping; create handoffs when a phase completes.
4. **Entry**: Add the spec to `specs/README.md`.

## Handoff Requirements

At the end of **every** phase, create **both**:

1. `specs/pending/[spec]/handoffs/HANDOFF_P[N+1].md` — context for next phase
2. `specs/pending/[spec]/handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` — copy-paste prompt for next session

Templates: `specs/_guide/HANDOFF_STANDARDS.md`.

## Key References

| Document | Purpose |
|----------|---------|
| [Spec Guide](specs/_guide/README.md) | Structure and workflow |
| [HANDOFF_STANDARDS](specs/_guide/HANDOFF_STANDARDS.md) | Handoff file format |
| [PATTERN_REGISTRY](specs/_guide/PATTERN_REGISTRY.md) | Reusable patterns |
| [agents/README](specs/agents/README.md) | Agent/skill mapping |

## Cursor Note

There is no `/new-spec` or `/handoff` command in Cursor. Trigger this workflow by describing the intent (e.g. "Create a new spec for multi-org IAM" or "I'm starting Phase 2, here's HANDOFF_P2") and ensure the session reads the required handoff/spec files first.
