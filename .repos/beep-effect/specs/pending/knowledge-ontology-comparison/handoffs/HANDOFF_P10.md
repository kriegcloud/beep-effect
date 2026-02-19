# HANDOFF P10: TodoX E2E Gmail Knowledge Integration

**Spec**: `specs/pending/knowledge-ontology-comparison`  
**Phase**: P10  
**Date**: 2026-02-08  

## What This Phase Is

P10 is the product-facing “make it work end-to-end in TodoX” phase:

- Gmail sync (bounded pull first).
- Persist emails as Documents with de-dupe.
- Run knowledge extraction durably (batch + progress).
- Persist entities/relations/embeddings so GraphRAG and visualization work.
- Build a real TodoX Knowledge Base view (replace placeholder).
- Wire in wealth management ontology via registry/storage without polluting the knowledge capability surface exports.

## Canonical Plan Document

Read first:

- `specs/pending/knowledge-ontology-comparison/outputs/P10_TODOX_E2E_GMAIL_KNOWLEDGE_PLAN.md`

## Key Existing Assets (Do Not Rebuild)

- Gmail extraction adapter:
  - `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`
- Google Workspace per-request layer composition:
  - `packages/runtime/server/src/GoogleWorkspace.layer.ts`
- Batch orchestration + progress primitives:
  - `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
  - `packages/knowledge/server/src/rpc/v1/batch/*`
- Wealth management ontology artifact:
  - `specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl`
- TodoX UI already contains:
  - mail UI (mocked endpoints): `apps/todox/src/app/api/mail/*`
  - knowledge graph visualization demo: `apps/todox/src/app/2d-force-graph/page.tsx`
  - knowledge extraction demo (mocked): `apps/todox/src/app/knowledge-demo/*`

## Known Blocking Gaps (Most Important)

1. Missing Gmail -> persistence sync API surface in TodoX (mail endpoints are mocked).
2. Missing authoritative ingestion persistence into SQL + embeddings:
   - extraction currently assembles a graph + emits RDF/provenance, but does not guarantee population of:
     - `knowledge_entity`, `relation`, `embedding`, and `extraction` tracking rows.
3. Missing knowledge RPC implementations for Extraction and Ontology (domain contracts exist but server v1 does not expose them).
4. Wealth management ontology not yet wired via registry/storage for real extraction usage.
5. TodoX “knowledge-base” view is a placeholder.

## Suggested Execution Order

1. Add a Gmail extraction preview endpoint (prove OAuth + scopes + adapter works).
2. Implement document materialization + de-dupe mapping model.
3. Implement ingestion persistence for entities/relations/embeddings and extraction lifecycle rows.
4. Use BatchOrchestrator to run extraction on synced messages and stream progress.
5. Replace TodoX knowledge-base placeholder with integrated UI.
6. Seed wealth management ontology into ontology registry/storage and use it by default in TodoX ingestion.

