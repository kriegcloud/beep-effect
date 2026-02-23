# Current vs Target Matrix (Phase 1 Baseline -> Phase 2+ Target)

## Summary

The current `/knowledge-demo` route is fully mock-driven. Target state is curated-scenario, explicit-ingest, org-scoped RPC behavior over `/v1/knowledge/rpc` (NDJSON), with meeting-prep synthesis rewrite deferred to later phase.

## Matrix

| Area | Current (verified) | Target | Replacement point(s) | Constraint / Risk |
|---|---|---|---|---|
| Scenario source | `SAMPLE_EMAILS` in `apps/todox/src/app/knowledge-demo/data/sample-emails.ts` | Deterministic curated Enron scenario catalog | `EmailInputPanel.tsx`, new scenario-catalog module | Curated-only, deterministic ordering |
| Ingest trigger | `extractFromText(text)` mock server action | Explicit `Ingest Scenario` action -> `batch_start` | `page.tsx` `handleExtract`, `actions.ts` removal | No silent ingestion |
| Ingest lifecycle | Local `isLoading` only; no persisted status | State machine from `BatchState` (`Pending/Extracting/Resolving/Completed/Failed/Cancelled`) | New ingest state coordinator in route atoms/hooks | Must be visible and retryable |
| Document scope | Arbitrary pasted text | Full-thread docs per scenario, capped to 25 docs | Ingestion payload builder | Hard cap: 25 docs/scenario |
| Transport/protocol | No runtime RPC usage | WebSocket `/v1/knowledge/rpc` + NDJSON | New knowledge RPC client layer | Existing shared client defaults to `/v1/shared/rpc` |
| Atom wiring | BeepProvider + atom runtime available globally | Add knowledge RPC runtime wiring usable from route atoms | Route/client service module(s) in todox | No existing AtomRpc.Tag usage for knowledge path |
| Entity reads | Local mock entities | `entity_list` / `entity_get` / `entity_count` where needed | Replace mock entity state updates | `entity_search/create/update/delete` not implemented |
| Relation reads | Local mock relations | Prefer GraphRAG relations initially; optionally implement relation RPC server methods | Replace `MOCK_RELATIONS` path | All `relation_*` RPC methods currently not implemented |
| GraphRAG query | Local mock `queryGraphRAG` | `graphrag_query` RPC | `GraphRAGQueryPanel.tsx` + route query action | `graphrag_queryFromSeeds` not implemented |
| Evidence lookup | Local evidence spans embedded in mock relations | `evidence_list` for relation/bullet evidence | Evidence panel/drawer integration | Must keep source-span inspectability |
| Meeting prep | No meeting-prep UI in route; server handler emits template relation-ID copy | Later phase: live LLM synthesis preserving persisted bullets + evidence model | Future route UI + `meetingprep_generate` rewrite | Keep requirement explicit, do not drop |
| Org scope | Pure local state (no org persistence) | `organizationId` passed on all RPC payloads; server auth-context checks | All route RPC calls | Org-scoped persistence is mandatory |
| Feature gate | Route always reachable (no `ENABLE_ENRON_KNOWLEDGE_DEMO`) | Internal gate enforced at route level | `apps/todox/src/app/knowledge-demo/page.tsx` entry behavior | Must hide or deny route when disabled |

## Mock Removal Map

- Primary removal: `apps/todox/src/app/knowledge-demo/actions.ts`
- Primary orchestrator update: `apps/todox/src/app/knowledge-demo/page.tsx`
- Scenario UI update: `apps/todox/src/app/knowledge-demo/components/EmailInputPanel.tsx`
- Query path update: `apps/todox/src/app/knowledge-demo/components/GraphRAGQueryPanel.tsx`
- Any component relying on `extractionSessions` as a local-only truth source

## Explicit Phase Boundary

- Meeting prep rewrite to live LLM synthesis is **not** Phase 1/2 implementation scope, but remains a locked requirement for later phase completion.
