# P1 Orchestrator Prompt: Auth + Access Foundation

Execute Phase P1 for `specs/pending/codex-effect-v4-knowledge-graph-app`.

## Required Context

Read these first:
1. `specs/pending/codex-effect-v4-knowledge-graph-app/README.md`
2. `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P1.md`
3. `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/research.md`
4. `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/p1-auth-allowlist-research.md`

## Objectives

1. Implement Better Auth auth route handler and client integration for `apps/web`.
2. Implement Better Auth magic-link sign-in with Drizzle + Neon + email provider wiring.
3. Add server-side allowlist checks for invite-only emails.
4. Gate `/api/chat` and `/api/graph/search` by approved session.
5. Add tests for allow/deny and session validation behavior.

## Constraints

- Do not implement tenant/per-user graph partitioning.
- Keep `graphId = effect-v4` shared.
- Keep auth UX minimal and email-centric (magic-link).
- Do not regress existing workspace quality gates.

## Completion Requirements

1. Run verification commands from handoff.
2. Update reflection log with P1 learnings.
3. Produce `handoffs/HANDOFF_P2.md` with concrete outcomes.
4. Produce `handoffs/P2_ORCHESTRATOR_PROMPT.md` for the next phase.
