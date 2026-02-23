# P3 Orchestrator Prompt: Toolkit + Chat Foundation

Execute Phase P3 for `specs/pending/codex-effect-v4-knowledge-graph-app`.

## Read First

1. `specs/pending/codex-effect-v4-knowledge-graph-app/README.md`
2. `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P3.md`
3. P2 ingestion/verification outputs and reflection updates
4. `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/p3-toolkit-chat-foundation-research.md`

## Objectives

1. Implement `KnowledgeGraphToolkit` as a single reusable surface.
2. Implement reusable service adapters for `/api/chat` and `/api/graph/search`.
3. Validate toolkit handler behavior and shared route integration.

## Constraints

- Do not fork chat and graph retrieval tool logic.
- Keep Node runtime for tool-calling and graph routes.
- Keep server-side auth/allowlist gates intact.

## Completion Requirements

1. Run quality gates and toolkit/route integration checks.
2. Update `REFLECTION_LOG.md` with P3 learnings.
3. Refresh `HANDOFF_P4.md` and `P4_ORCHESTRATOR_PROMPT.md`.
