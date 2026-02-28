# P1 Orchestrator Prompt

Execute P1 only.

Read:

- `specs/pending/ast-codebase-kg-visualizer/handoffs/HANDOFF_P1.md`

Write:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p1-kg-export-cli.md`

Hard constraints:

1. Lock final `beep kg export` command surface.
2. Lock deterministic adapter behavior.
3. Lock CLI unit test matrix.
4. Do not alter existing `kg index|publish|verify|parity|replay` semantics.
