# RPC Client Migration (Phase 2)

## Objective

Replace the default `knowledge-demo` mock flow with live knowledge RPC calls over the runtime knowledge endpoint while keeping behavior deterministic and scoped to implemented contracts.

## Delivered Changes

| Area | Change | Files |
|---|---|---|
| Transport client | Added dedicated knowledge RPC client wired to websocket + NDJSON | `apps/todox/src/app/knowledge-demo/rpc-client.ts` |
| Ingest payload source | Replaced mock extraction actions with curated scenario payload preparation from Enron dataset + ontology | `apps/todox/src/app/knowledge-demo/actions.ts`, `apps/todox/src/app/knowledge-demo/constants.ts`, `apps/todox/src/app/knowledge-demo/data/scenarios.ts` |
| App orchestration | Replaced page-level mock logic with client orchestration over `batch_start`, `batch_getStatus`, `graphrag_query` | `apps/todox/src/app/knowledge-demo/KnowledgeDemoClientPage.tsx` |
| Ingest UX | Replaced sample-email style input with explicit curated scenario selector and `Ingest Scenario` action | `apps/todox/src/app/knowledge-demo/components/EmailInputPanel.tsx` |
| Query UX | Query panel now consumes injected RPC-backed callback and stays disabled before successful ingest | `apps/todox/src/app/knowledge-demo/components/GraphRAGQueryPanel.tsx`, `apps/todox/src/app/knowledge-demo/components/QueryInput.tsx` |
| Route gate | Added route-level internal gate via `ENABLE_ENRON_KNOWLEDGE_DEMO`; disabled state returns `notFound()` | `apps/todox/src/app/knowledge-demo/page.tsx` |
| Types | Added curated scenario + ingest lifecycle + prepared ingest payload contracts | `apps/todox/src/app/knowledge-demo/types.ts` |

## Hard-Constraint Compliance

| Constraint | Implementation Evidence |
|---|---|
| websocket endpoint `/v1/knowledge/rpc` | `knowledgeRpcEndpoint` in `apps/todox/src/app/knowledge-demo/rpc-client.ts` |
| NDJSON serialization | `RpcSerialization.layerNdjson` in `apps/todox/src/app/knowledge-demo/rpc-client.ts` |
| no default fallback to mock entities/relations | `KnowledgeDemoClientPage` initializes empty data; entities/relations only come from RPC query result |
| curated scenarios only | `CURATED_SCENARIOS` is the only ingest source and is injected into UI selector |
| full-thread extraction cap 25 docs/scenario | `MAX_DOCUMENTS_PER_SCENARIO = 25` enforced during scenario document resolution |
| explicit ingest action | ingest only starts via `onIngestScenario` button path in `EmailInputPanel` |
| org-scoped persistence model | `organizationId` is required from active session and passed into `batch_start` + `graphrag_query` payloads |
| avoid unimplemented methods | P2 flow only calls implemented methods: `batch_start`, `batch_getStatus`, `graphrag_query` |
| no meeting prep rewrite in P2 | no changes to `meetingprep_generate`; synthesis rewrite remains Phase 3 |

## Method Allowlist (Deterministic Scope)

Used in P2:
- `batch_start`
- `batch_getStatus`
- `graphrag_query`

Explicitly not used in P2 default path:
- `relation_*` RPC methods
- `graphrag_queryFromSeeds`
- meeting prep generation methods

## Determinism Notes

1. Scenario IDs are fixed (`scenario-1`..`scenario-4`) and sorted.
2. Source documents are resolved from curated thread/message mappings and deterministically sorted (`document.id`, then `metadata.messageId`).
3. Document IDs are deterministically derived from source IDs via a stable hash -> UUIDv5-style mapping.
4. Ingest start is blocked for scenarios already in an in-flight state.

## Verification

Executed on modified package:

```bash
bun run check --filter @beep/todox
bun run test --filter @beep/todox
```

Result:
- `check`: pass
- `test`: pass (47 passing tests, 0 failing)

## Deferred to Phase 3

- Rewrite `meetingprep_generate` to live LLM synthesis with evidence-quality controls.
