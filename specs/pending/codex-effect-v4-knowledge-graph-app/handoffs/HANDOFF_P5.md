# HANDOFF P5: Graph UI + Atom State

## Phase Transition

- From: P4 (Chat Route)
- To: P5 (Graph UI + Atom State)
- Date: 2026-02-22

## Working Context

Implement graph visualization and client-state integration for chat + graph interactions.

Update this handoff with concrete P4 outcomes before implementation.

## Objectives

1. Implement graph page using Gaia `knowledge-graph` component.
2. Add `/api/graph/search` integration and entity/edge mapping.
3. Implement atom-react state for query, selection, and expansion.
4. Wire chat UI client state to chat route response contract.

## Target File Surfaces

- `apps/web/src/app/(app)/graph/page.tsx`
- `apps/web/src/components/graph/KnowledgeGraphPanel.tsx`
- `apps/web/src/app/api/graph/search/route.ts`
- `apps/web/src/lib/graph/mappers.ts`
- `apps/web/src/state/graph.atoms.ts`
- `apps/web/src/state/chat.atoms.ts`
- `apps/web/src/components/chat/*`

## Verification Commands

```bash
bun run check
bun run test
bun run lint
bun run build
bunx turbo run build --filter=@beep/web
```

Add UI/component checks for rendering and interaction flows.

## Phase Exit Criteria

- Graph UI renders live nodes/edges from API data.
- Node click/expand interactions work reliably.
- Chat client state integrates with `/api/chat` responses.
- Protected UI/API paths enforce allowlist sessions.

## Deliverables Checklist

- [ ] Graph page + component integration complete
- [ ] Atom state for chat + graph flows complete
- [ ] UI interaction checks added
- [ ] `HANDOFF_P6.md` updated with actual outcomes
- [ ] `P6_ORCHESTRATOR_PROMPT.md` updated for next phase
