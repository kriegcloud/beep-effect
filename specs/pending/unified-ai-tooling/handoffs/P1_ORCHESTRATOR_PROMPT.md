# P1 ORCHESTRATOR PROMPT: Schema + Compiler Contract

## Context

You are executing P1 of `specs/pending/unified-ai-tooling`.

Read:
1. `specs/pending/unified-ai-tooling/README.md`
2. `specs/pending/unified-ai-tooling/handoffs/HANDOFF_P1.md`
3. `specs/pending/unified-ai-tooling/outputs/preliminary-research.md`
4. `specs/pending/unified-ai-tooling/outputs/tooling-compatibility-matrix.md`
5. `specs/pending/unified-ai-tooling/outputs/comprehensive-review.md`

## Your Mission

1. Define canonical `.beep/config.yaml` schema contract.
2. Define compiler contract (inputs -> normalized model -> target artifacts).
3. Define deterministic serialization and error taxonomy.
4. Define managed-file ownership metadata contract for JSON targets.
5. Define AGENTS generation/freshness contract for root + every workspace package.
6. Write output to `specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md`.
7. Update `specs/pending/unified-ai-tooling/outputs/manifest.json` P1 status.

## Critical Constraints

- No symlink strategy.
- Project-only config scope.
- Linux-only v1.
- One instruction source must generate both `AGENTS.md` and `CLAUDE.md`.
- Generated outputs are committed, including `.codex/` and `.mcp.json`.
- Skills are in scope.
- Do not drift from ADRs without explicit decision update.

## Verification

- All required domains are represented.
- Sidecar strategy is explicit for JSON managed files.
- AGENTS freshness model is explicit and testable.
- Unsupported-field handling path is defined.

## Success Criteria

- `p1-schema-and-contract.md` is implementation-ready.
- Manifest reflects P1 progress.
- No blocker-level schema ambiguity remains for P2.
