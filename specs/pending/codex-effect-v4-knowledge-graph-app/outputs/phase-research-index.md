# Phase Research Index

Date: 2026-02-22

Purpose: phase-specific, implementation-critical context for orchestrators.

## How to use this index

1. Start each phase by reading the corresponding research output.
2. Use it together with `handoffs/HANDOFF_P*.md` and `handoffs/P*_ORCHESTRATOR_PROMPT.md`.
3. At phase close, update the next handoff with real outcomes and deviations.

## Phase output map

| Phase | Research Output | Focus |
|------|------------------|-------|
| P1 | `outputs/p1-auth-allowlist-research.md` | Better Auth magic-link + Drizzle/Neon + allowlist enforcement |
| P2 | `outputs/p2-zep-ingestion-research.md` | Deterministic Zep ingestion + verification + rollout |
| P3 | `outputs/p3-toolkit-chat-foundation-research.md` | Shared toolkit/service layer for grounded chat |
| P4 | `outputs/p4-chat-route-research.md` | OpenAI-backed grounded chat route |
| P5 | `outputs/p5-graph-ui-atom-research.md` | Gaia graph UI + atom-react state model |
| P6 | `outputs/p6-deployment-hardening-research.md` | Vercel production hardening + runbooks |

## Locked cross-phase constraints

- Single shared graph scope (`graphId = effect-v4`).
- No tenant/per-user graph partitioning in v1.
- Server-side allowlist enforcement is mandatory.
- Better Auth + Drizzle/Neon is the auth persistence baseline.
- One shared toolkit/service implementation must back both `/api/chat` and `/api/graph/search`.
- Effect v4 API usage should be validated against `.repos/effect-smol` sources.
