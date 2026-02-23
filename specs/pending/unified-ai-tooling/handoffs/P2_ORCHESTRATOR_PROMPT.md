# P2 ORCHESTRATOR PROMPT: Adapter Design

## Context

Execute P2 for `specs/pending/unified-ai-tooling`.

Required read order:
1. `README.md`
2. `handoffs/HANDOFF_P2.md`
3. `outputs/p1-schema-and-contract.md`
4. `outputs/tooling-compatibility-matrix.md`
5. `outputs/comprehensive-review.md`

## Your Mission

1. Define adapter contracts for Claude/Codex/Cursor/Windsurf/JetBrains.
2. Define per-tool file targets and mapping semantics.
3. Define unsupported-field warning/error policy.
4. Ensure skills and agents mapping is covered in each adapter.
5. Ensure JetBrains prompt-library mapping is included in v1 adapter scope.
6. Write `outputs/p2-adapter-design.md`.
7. Update `outputs/manifest.json` for P2.

## Critical Constraints

- No symlink strategy.
- Deterministic output required.
- Full-file rewrite ownership model for managed targets.
- Keep JetBrains extension surfaces explicit where parity is non-portable.

## Verification

- Every tool has explicit file targets.
- Every canonical domain has mapping or explicit non-support handling.
- Dual instruction output (`AGENTS.md`, `CLAUDE.md`) is deterministic.

## Success Criteria

- P2 output is implementation-ready and unambiguous.
