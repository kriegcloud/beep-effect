# New Spec Workflow (Codex Adaptation)

Adapted from `.claude/commands/new-spec.md`.

## Inputs

- Spec name
- Problem statement
- Expected complexity

## Procedure

1. Calculate complexity score and choose structure (`simple`, `medium`, `complex`).
2. Scaffold under `specs/pending/<name>/` using repository scripts.
3. Create phase plan aligned to `Discovery -> Evaluation -> Synthesis -> Iteration`.
4. Create required handoff pair for next phase.

## Required outputs

- Spec directory with baseline docs
- Updated `specs/README.md` entry
- Handoff pair: `HANDOFF_P[N].md` and `P[N]_ORCHESTRATOR_PROMPT.md`

## Evidence checklist

- Commands executed
- Files created/updated
- Complexity rationale
