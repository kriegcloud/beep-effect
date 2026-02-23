# HANDOFF P11: TodoX Wealth Management Demo MVP (Execution)

**Spec**: `specs/pending/knowledge-ontology-comparison`  
**Phase**: P11  
**Date**: 2026-02-08  

## What This Phase Is

P11 is the “build it for real” phase: implement the end-to-end TodoX Gmail sync + knowledge extraction + graph visualization + GraphRAG + provenance workflow so it is demoable for wealth management firms.

This phase converts P10’s plan into code and a repeatable demo script.

## Canonical Execution Spec (Read First)

- `specs/pending/knowledge-ontology-comparison/outputs/P11_TODOX_WEALTH_MGMT_DEMO_EXECUTION_SPEC.md`

## Key Assets to Reuse

- Gmail extraction adapter:
  - `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`
- Google Workspace adapter composition (requires per-request AuthContext):
  - `packages/runtime/server/src/GoogleWorkspace.layer.ts`
- AuthContext semantics (must reuse, not reimplement in TodoX):
  - `packages/runtime/server/src/AuthContext.layer.ts`
- Batch orchestration + progress streaming:
  - `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
  - `packages/knowledge/server/src/rpc/v1/batch/*`
- Workflow runtime durability switch:
  - `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts` (`KNOWLEDGE_WORKFLOW_MODE`)
- TodoX UI placeholders/demos:
  - knowledge base placeholder: `apps/todox/src/app/page.tsx`
  - force graph demo: `apps/todox/src/app/2d-force-graph/page.tsx`
  - knowledge demo (mock): `apps/todox/src/app/knowledge-demo/*`
- Wealth management TTL (starting artifact):
  - `specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl`

## Primary Blockers (Do These First)

1. AuthContext bridge for Next.js route handlers (without this, Gmail + GraphRAG cannot be called from TodoX).
2. Persistence of extraction results into SQL + embeddings (without this, GraphRAG and graph viz cannot be real).
3. Gmail message ID -> Document ID mapping (required for idempotent sync and provenance click-through).

## Suggested PR Order

1. PR1: `@beep/runtime-server` AuthContext helper usable by Next routes
2. PR2: TodoX Gmail extract preview endpoint (+ scopes missing handling)
3. PR3: Durable document materialization + de-dupe mapping
4. PR4: Knowledge ingestion persistence + extraction lifecycle rows
5. PR5: Batch start + progress wired into TodoX
6. PR6: Replace knowledge-base placeholder with integrated UI
7. PR7: Ontology seeding + demo script + hardening

