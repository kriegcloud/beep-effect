# Codebase Context: Enron Knowledge Demo Integration (Phase 1)

## Scope Scanned

- `apps/todox/src/app/knowledge-demo/**`
- `packages/runtime/server/src/Rpc.layer.ts`
- `packages/runtime/server/src/HttpRouter.layer.ts`
- `packages/knowledge/domain/src/entities/**/contracts/*.ts`
- `packages/knowledge/server/src/entities/**/rpc/*.ts`
- `packages/shared/client/src/constructors/RpcClient.ts`
- `packages/runtime/client/src/{beep-provider.tsx,services/ka-services.ts,runtime.ts}`

## Current `knowledge-demo` Architecture (Mock)

| Area | Current file(s) | Current behavior | Replacement seam |
|---|---|---|---|
| Route orchestration | `apps/todox/src/app/knowledge-demo/page.tsx` | Local React state only (`entities`, `relations`, `sourceText`, `extractionSessions`); calls local server actions | Replace local action calls with Atom RPC-backed atoms/services |
| Extraction action | `apps/todox/src/app/knowledge-demo/actions.ts` (`extractFromText`) | Uses `MOCK_ENTITIES` / `MOCK_RELATIONS` and synthetic `setTimeout(1500)` | Replace with explicit scenario ingest via `batch_start` + status tracking |
| GraphRAG action | `apps/todox/src/app/knowledge-demo/actions.ts` (`queryGraphRAG`) | Local seed/graph expansion over in-memory mocks + synthetic delay | Replace with `graphrag_query` RPC |
| Resolution action | `apps/todox/src/app/knowledge-demo/actions.ts` (`resolveEntities`) | Client/demo-only clustering and same-as generation | Keep as dev-only or remove from default Enron path (no equivalent RPC in current scope) |
| Scenario source | `apps/todox/src/app/knowledge-demo/data/sample-emails.ts` | Hardcoded ACME sample emails | Replace with curated Enron scenario catalog |
| Input panel | `apps/todox/src/app/knowledge-demo/components/EmailInputPanel.tsx` | “Select Sample Email” + free text | Replace with scenario picker + explicit `Ingest Scenario` action |
| Query panel | `apps/todox/src/app/knowledge-demo/components/GraphRAGQueryPanel.tsx` | Calls local `queryGraphRAG` action | Wire to Atom RPC query flow |
| Meeting prep UI | n/a in current route | Not present today | Add in later phase; keep requirement explicit |

## Runtime RPC Pathway (Confirmed)

Knowledge RPC transport is already wired server-side:

- Path: `/v1/knowledge/rpc`
- Protocol: `websocket`
- Serialization: NDJSON (`RpcSerialization.layerNdjson`)
- Wiring: `packages/runtime/server/src/Rpc.layer.ts`
- Router composition: `packages/runtime/server/src/HttpRouter.layer.ts` -> `Rpc.layer`

Auth context middleware is applied at RPC group level and handlers usually check organization ownership (`session.activeOrganizationId === payload.organizationId`).

## RPC Coverage Reality (Important for P2 Planning)

Merged group in runtime server includes `Batch`, `Entity`, `Relation`, `GraphRag`, `Evidence`, `MeetingPrep`, but method coverage is uneven:

| RPC group | Contract surface | Server implementation status |
|---|---|---|
| `Batch` | `batch_start`, `batch_getStatus`, `batch_cancel`, `batch_streamProgress` | Implemented |
| `Entity` | `entity_get`, `entity_list`, `entity_count`, `entity_search`, `entity_create`, `entity_update`, `entity_delete` | Only `get/list/count` implemented; others `Effect.die("Not implemented")` |
| `Relation` | `relation_get`, `relation_listByEntity`, `relation_listByPredicate`, `relation_create`, `relation_delete`, `relation_count` | All currently `Effect.die("Not implemented")` |
| `GraphRag` | `graphrag_query`, `graphrag_queryFromSeeds` | `query` implemented; `queryFromSeeds` not implemented |
| `Evidence` | `evidence_list` | Implemented |
| `MeetingPrep` | `meetingprep_generate` | Implemented, but current bullets are template relation-ID text (later-phase rewrite required) |
| `Extraction` | `extraction_*` contracts exist in domain | Not merged into runtime `/v1/knowledge/rpc` group |

## Atom Client Wiring Reality (for `@effect-atom/atom-react`)

- Todox already mounts `BeepProvider` globally (`apps/todox/src/global-providers.tsx`), which mounts:
  - `RegistryProvider` + `KaServices` (`useAtomMount`) via `@beep/runtime-client`.
- Existing generic RPC config in `packages/shared/client/src/constructors/RpcClient.ts` points to:
  - `/v1/shared/rpc` (not `/v1/knowledge/rpc`).
- No app-level `AtomRpc.Tag` wiring exists for knowledge RPC in todox yet.
- `packages/knowledge/client` is currently scaffold-level and does not provide ready-to-use runtime client constructors for this route.

Phase 2 must introduce explicit knowledge RPC client construction aligned to `/v1/knowledge/rpc` + NDJSON.

## Org Scope and Persistence

- Batch start payload requires `organizationId`, `ontologyId`, `documents`, `ontologyContent`.
- Batch state and downstream handlers are organization-scoped and guarded by auth-context checks.
- Evidence retrieval enforces one-of filter semantics and validates document span bounds before returning items.

## Feature Gate Status

- `ENABLE_ENRON_KNOWLEDGE_DEMO` is a locked requirement in spec docs.
- No route-level implementation for this flag exists yet in `apps/todox/src/app/knowledge-demo`.

## Key Phase-2 Risks Captured

1. Client/server endpoint drift (`/v1/shared/rpc` vs `/v1/knowledge/rpc`) will break RPC calls if not explicitly corrected.
2. Relation RPC methods are currently not implemented; default UI cannot rely on `relation_*` calls without follow-up work.
3. Batch contract advertises typed failures (`BatchAlreadyRunningError`, `InvalidStateTransitionError`) but current `batch_start` path does not enforce duplicate-run rejection server-side; Phase 2 must enforce deterministic duplicate-start behavior in UI state.
4. Meeting prep rewrite remains a later phase and must not be conflated with Phase 2 client migration.
