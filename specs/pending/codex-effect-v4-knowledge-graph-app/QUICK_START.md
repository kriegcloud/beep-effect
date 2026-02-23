# Quick Start — Codex Effect v4 Knowledge Graph App

## What This Spec Does

Builds a production-ready private-beta Next.js app that:

- Deploys the completed Effect v4 graph into Zep.
- Provides an allowlist-gated chat API using Effect AI + OpenAI.
- Renders a live graph UI with Gaia `knowledge-graph`.

## Current Phase

P0 is complete.

Next phase is **P1: Auth + Access Foundation**.

## First Files to Read

1. `specs/pending/codex-effect-v4-knowledge-graph-app/README.md`
2. `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/phase-research-index.md`
3. `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/research.md`
4. `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/canonical-pattern-review.md`
5. `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/comprehensive-review.md`
6. `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P1.md`
7. `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/P1_ORCHESTRATOR_PROMPT.md`

## Phase Handoff Files

| Phase | Handoff | Orchestrator Prompt |
|-------|---------|---------------------|
| P1 | `handoffs/HANDOFF_P1.md` | `handoffs/P1_ORCHESTRATOR_PROMPT.md` |
| P2 | `handoffs/HANDOFF_P2.md` | `handoffs/P2_ORCHESTRATOR_PROMPT.md` |
| P3 | `handoffs/HANDOFF_P3.md` | `handoffs/P3_ORCHESTRATOR_PROMPT.md` |
| P4 | `handoffs/HANDOFF_P4.md` | `handoffs/P4_ORCHESTRATOR_PROMPT.md` |
| P5 | `handoffs/HANDOFF_P5.md` | `handoffs/P5_ORCHESTRATOR_PROMPT.md` |
| P6 | `handoffs/HANDOFF_P6.md` | `handoffs/P6_ORCHESTRATOR_PROMPT.md` |

## Guardrails

- Keep shared graph scope (`graphId = effect-v4`); no tenant scoping in v1.
- Enforce allowlist checks server-side.
- Reuse one shared toolkit/service surface for chat and graph retrieval.
- Keep Node runtime for Effect-heavy API routes.

## Key Decisions Already Locked

1. Single shared graph for beta (`graphId = effect-v4`).
2. Email allowlist private-beta auth model.
3. Better Auth magic-link auth with Drizzle + Neon and allowlist enforcement.
4. Shared toolkit/services used by both `/api/chat` and `/api/graph/search`.
5. Tenant partitioning and ontology typing deferred until post-beta evidence.
