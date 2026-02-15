# Current vs Target Matrix

## Summary

Replace mock-only knowledge-demo data paths with persisted, org-scoped, RPC-driven Enron scenario workflows.

## Matrix

| Area | Current | Target | Notes |
|---|---|---|---|
| Scenario source | free text + sample mock emails | curated deterministic Enron scenarios | multiple scenarios with rationale |
| Extraction trigger | local mock function | explicit `Ingest Scenario` RPC mutation | use Batch start contract |
| Extraction state | local loading spinner only | persisted batch status (pending/running/completed/failed) | poll/stream via batch status RPC |
| Entity data | mock entity array | real entity records from org data | list/query via entity RPC |
| Relation data | mock relation array | real relation records from org data | list by predicate/entity |
| Graph query | local pseudo GraphRAG | server GraphRAG RPC query | keep existing panel UX with real data |
| Meeting prep | relation-id template bullets | live LLM-synthesized bullets | rewrite `meetingprep_generate` |
| Evidence links | mock evidence spans | real evidence via `Evidence.List` | must resolve to source spans |
| Persistence | none | org-scoped persisted data | RLS default behavior |
| Demo gate | always available | `ENABLE_ENRON_KNOWLEDGE_DEMO` | internal-only route |

## Mock Removal Targets

Primary removal path:

- `apps/todox/src/app/knowledge-demo/actions.ts`

Secondary updates:

- `apps/todox/src/app/knowledge-demo/page.tsx`
- `apps/todox/src/app/knowledge-demo/components/GraphRAGQueryPanel.tsx`
- any component that assumes local mock-only extraction sessions

## New Integration Layers Expected

1. Todox-side Atom RPC client tag for knowledge RPC group (`Batch`, `GraphRag`, `Entity`, `Relation`, `MeetingPrep`, `Evidence`)
2. Scenario catalog module (deterministic, curated)
3. Ingestion coordinator state (scenario -> batchId -> status -> available data)
4. Meeting prep action + evidence display backed by real RPC responses

## Explicit Non-Goals For Migration

- perfect graph visualization redesign
- public-facing route exposure
- full historical extraction management UI
