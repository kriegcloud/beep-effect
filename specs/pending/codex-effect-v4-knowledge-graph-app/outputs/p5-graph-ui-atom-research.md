# P5 Research: Graph UI + Atom State

Date: 2026-02-22

## Phase objective

Ship interactive graph exploration UI using Gaia `knowledge-graph` component and Effect atom-react state for graph/chat client flows.

## Source-proven API facts

Gaia component (from prior research):
- Requires `nodes` and `links` graph props.
- Supports node click callbacks and selected node tracking.

Effect atom-react (from `.repos/effect-smol`):
- `RegistryProvider` is required context for atom hooks.
- Core hooks: `useAtomValue`, `useAtom`, `useAtomSet`, `useAtomRefresh`, `useAtomSuspense`.
- Registry has lifecycle/cleanup behavior and default idle TTL handling.

Relevant source files:
- `.repos/effect-smol/packages/atom/react/src/RegistryContext.ts`
- `.repos/effect-smol/packages/atom/react/src/Hooks.ts`

## High-impact design decisions for P5

1. Normalize all graph API responses into one client graph shape before rendering.
2. Use node/edge UUIDs as stable UI IDs.
3. Keep atom state split by concern: query state, graph structure, selected node, expansion state, chat thread state.
4. Wrap app surface in a single `RegistryProvider` at layout boundary.
5. Cap expansion fan-out to control render and force simulation cost.

## Recommended file plan

- `apps/web/src/app/(app)/graph/page.tsx`
- `apps/web/src/components/graph/KnowledgeGraphPanel.tsx`
- `apps/web/src/app/api/graph/search/route.ts`
- `apps/web/src/lib/graph/mappers.ts`
- `apps/web/src/state/graph.atoms.ts`
- `apps/web/src/state/chat.atoms.ts`

## Suggested graph mapping contract

`/api/graph/search` response should normalize to:

```ts
{
  nodes: Array<{ id: string; label: string; group?: string; summary?: string; score?: number }>,
  links: Array<{ source: string; target: string; label?: string; weight?: number }>,
  raw?: { nodes: unknown[]; edges: unknown[] }
}
```

Mapping guidance:
- Node id = Zep `uuid`.
- Node label = `name` fallback to first label.
- Link id derived from edge uuid; source/target from edge node UUID refs.

## UI interaction model

- Query submit -> fetch root graph slice.
- Node click -> fetch neighbor expansion for selected node.
- Merge expansion into graph atom using id-based dedup.
- Detail panel reads selected node atom.

## Verification pack

```bash
bun run check
bun run test
bun run lint
bun run build
bunx turbo run build --filter=@beep/web
```

Behavior gates:
- Graph renders non-empty node/link dataset from live API.
- Node expansion appends without duplicating existing IDs.
- Selected node state updates detail panel deterministically.
- Unauthorized users cannot load graph API data.

## Rollout guidance for P5

- Start with conservative limits (node count, expansion depth).
- Validate desktop and mobile rendering before broad invite.
- Keep simple loading/error states driven from atom async results.

## Rollback strategy

- Feature-flag graph page while keeping chat surface available.
- Fallback to read-only graph list view if force-directed rendering regresses.

## P5 phase risk gates

| Risk | Mitigation |
|------|------------|
| Graph rendering becomes unstable on large results | Limit nodes/edges and fan-out per expansion |
| State drift between chat and graph flows | Separate atom domains and explicit state transitions |
| Missing provider context causes runtime hook failures | Enforce top-level `RegistryProvider` in app layout |

## References

- `.repos/effect-smol/packages/atom/react/src/RegistryContext.ts`
- `.repos/effect-smol/packages/atom/react/src/Hooks.ts`
- `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/research.md`
- `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P5.md`
