# P4 Orchestrator Prompt: Chat Route

Execute Phase P4 for `specs/pending/codex-effect-v4-knowledge-graph-app`.

## Read First

1. `specs/pending/codex-effect-v4-knowledge-graph-app/README.md`
2. `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P4.md`
3. P3 toolkit/service-layer implementation results
4. `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/p4-chat-route-research.md`

## Objectives

1. Implement `/api/chat` with OpenAI + shared toolkit.
2. Return grounded response payload with trace/citation metadata.
3. Validate auth gating and failure handling.

## Constraints

- Reuse shared toolkit surface; do not duplicate tool logic.
- Keep Node runtime for API route.
- Preserve allowlist guard on every protected request.

## Completion Requirements

1. Run route and workspace verification commands.
2. Update `REFLECTION_LOG.md` with P4 learnings.
3. Refresh `HANDOFF_P5.md` and `P5_ORCHESTRATOR_PROMPT.md`.
