# P6 Orchestrator Prompt: Deployment Hardening

Execute Phase P6 for `specs/pending/codex-effect-v4-knowledge-graph-app`.

## Read First

1. `specs/pending/codex-effect-v4-knowledge-graph-app/README.md`
2. `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P6.md`
3. P5 UI/state implementation outputs
4. `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/p6-deployment-hardening-research.md`

## Objectives

1. Harden deployment/runtime configuration for production.
2. Finalize operational docs for deployment, verification, and rollback.
3. Validate deployed route smoke checks.

## Constraints

- Keep architecture decisions AD-001..AD-010 intact unless evidence requires revision.
- Preserve private-beta allowlist model.
- Do not introduce tenant/user graph partitioning in this phase.

## Completion Requirements

1. Run workspace and deployment verification checks.
2. Update `REFLECTION_LOG.md` with P6 learnings.
3. Update spec status and finalize closeout artifacts.
