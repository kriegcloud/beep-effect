# PRE Orchestrator Prompt

Execute PRE only.

Read:

- `specs/pending/ast-codebase-kg-visualizer/handoffs/HANDOFF_PRE.md`

Write:

- `specs/pending/ast-codebase-kg-visualizer/outputs/p-pre-contract-and-source-alignment.md`

Hard constraints:

1. Freeze immutable KG v1 -> visualizer mapping tables.
2. Freeze fallback behavior with `meta.originalType`.
3. Keep deterministic ID/provenance carry-through explicit.
4. Include command/evidence matrix for PRE completion.
