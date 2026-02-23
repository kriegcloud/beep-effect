# HANDOFF P3: Toolkit + Chat Foundation

## Phase Transition

- From: P2 (Zep Ingestion Pipeline)
- To: P3 (Toolkit + Chat Foundation)
- Date: 2026-02-22

## Working Context

Create a shared `KnowledgeGraphToolkit` and reusable graph service layer for grounded chat and graph retrieval routes.

Update this handoff with concrete P2 ingestion outcomes before implementation.

## Objectives

1. Implement shared toolkit methods backed by Zep retrieval.
2. Implement reusable service adapters consumed by `/api/chat` and `/api/graph/search`.
3. Ensure routes run in Node runtime and handle upstream timeouts/retries reliably.
4. Preserve single-source toolkit logic for forthcoming chat implementation.

## Target File Surfaces

- `apps/web/src/lib/graph/tools.ts`
- `apps/web/src/lib/effect/runtime.ts`
- `apps/web/src/lib/graph/zep-client.ts`
- `apps/web/src/app/api/graph/search/route.ts`

## Verification Commands

```bash
bun run check
bun run test
bun run lint
bun run build
```

Add route-level integration checks for toolkit handler behavior and graph search adapter output.

## Phase Exit Criteria

- Toolkit handlers execute correctly against Zep-backed retrieval.
- Toolkit/services are reused by both chat and graph retrieval paths.
- Graph search route returns stable node/link payload contract.
- Error handling covers upstream failures/timeouts.

## Deliverables Checklist

- [ ] Shared toolkit implemented
- [ ] Reusable service layer implemented and validated
- [ ] Integration checks for toolkit/graph adapter behavior added
- [ ] `HANDOFF_P4.md` updated with actual outcomes
- [ ] `P4_ORCHESTRATOR_PROMPT.md` updated for next phase
