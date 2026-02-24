# Phase 11: TodoX Wealth Management Demo MVP (Execution Spec)

**Spec**: `specs/pending/knowledge-ontology-comparison`  
**Date**: 2026-02-08  
**Status**: Planned (this document defines the execution path for code changes)  

## Superseded Execution Plan

This execution spec is superseded by the dedicated production-oriented MVP spec:

- **Authoritative execution spec**: `specs/pending/todox-wealth-mgmt-knowledge-mvp/README.md`

Reason: the new spec captures additional demo-fatal blockers and production gates discovered after this document was written (notably the IAM UI linking gap + typed scope-expansion contract requirements, evidence-of-record constraints, and environment/IaC/runbook artifacts).

Keep this P11 document as historical context only; do not implement directly from it.

## Objective

Ship a **demoable** end-to-end “wealth management knowledge loop” inside `apps/todox` that feels materially better than:

- searching Gmail threads manually
- piecing together relationship context from memory
- generic LLM chat without grounding or provenance

This is not “finish the whole PRD.” It is a thin slice that is:

- real Gmail data
- real knowledge extraction persisted to SQL + embeddings
- real GraphRAG retrieval
- real graph visualization
- provenance click-through back to source email text

## Reality Checks (Flaws / Invalid Assumptions to Avoid)

These are the reasons prior “looks complete on paper” approaches tend to fail in this repo:

1. **AuthContext is a hard blocker for Next routes**  
   GoogleWorkspace adapters and knowledge RPC handlers require `AuthContext`. Next route handlers don’t naturally provide `HttpServerRequest`, so `AuthContextLayer` can’t be composed without an explicit bridge. If this is not solved first, everything else is blocked.

2. **Extraction without persistence is a demo dead-end**  
   `GraphRAGService` reads from `EntityRepo` / `RelationRepo` and depends on embeddings. If the extraction pipeline only produces an in-memory graph, you cannot “ask questions” or “visualize real data.”

3. **Document IDs are not Gmail IDs**  
   You must create a stable mapping from `(orgId, sourceType="gmail", sourceId=gmailMessageId)` to `DocumentsEntityIds.DocumentId`. Otherwise you cannot do idempotent sync or provenance drill-down.

4. **Scopes and incremental consent must be first-class**  
   Missing scopes will throw `GoogleScopeExpansionRequiredError`. A demo that dies with a stack trace is not acceptable; the UI must give a clear “Reconnect/Grant scopes” action.

5. **Workflow durability defaults to memory**  
   If the demo depends on batch progress, run with `KNOWLEDGE_WORKFLOW_MODE=engine-durable-sql` to avoid “refresh loses everything.”

## Demo Definition (What “Game-Changing” Looks Like)

The demo should show a 5 minute story for a wealth management firm:

1. Connect Gmail (or confirm already connected).
2. Sync “last 7 days” from a bounded query (preset: “client communications”).
3. Run extraction (batch) using the wealth management ontology.
4. Open “Knowledge Base” and show:
   - a graph of households, accounts, advisors, counterparties, key events
   - evidence/provenance: click an edge and show the email snippet that supports it
5. Ask a GraphRAG question and get grounded context:
   - Example: “What’s the status of the Thompson Roth conversion and who is waiting on whom?”
6. Show an actionable “meeting prep” output:
   - bullets with citations to emails (document titles + timestamps + snippet)

The “meeting prep” is the product moment: it turns the graph into a workflow output.

## Workstreams (Execution Order)

### W11-A: AuthContext Bridge for Next.js (Unblocker)

Deliver a reusable helper in `@beep/runtime-server`:

- Input: `Headers` (cookie and/or authorization)
- Output: `AuthContextShape` (or Unauthorized)

It must reuse the existing semantics in `packages/runtime/server/src/AuthContext.layer.ts` (do not reimplement in TodoX).

Acceptance:
- A TodoX Next route can provide `AuthContext` and then provide `GoogleWorkspace.layer` successfully.

### W11-B: TodoX Gmail Extract Preview Endpoint (Scopes + OAuth Proof)

Add TodoX endpoints under `apps/todox/src/app/api/integrations/gmail/*`:

- `GET /api/integrations/gmail/extract-preview`  
  Calls `GmailExtractionAdapter.extractEmailsForKnowledgeGraph(query, limit)` and returns redacted preview objects:
  - subject/title
  - from/to
  - date
  - threadId
  - a short content preview (truncated)

Error mapping requirements:
- `GoogleScopeExpansionRequiredError` -> `409` (or structured JSON) with required scopes and a UI action hint.
- Unauthorized -> `401`.

Acceptance:
- Logged-in user sees a real preview list or a clean “grant scopes” state.

### W11-C: Durable Email Materialization + De-dupe Mapping

Add a durable mapping table (recommended: documents-first):

- `(organizationId, sourceType="gmail", sourceId=<gmailMessageId>) -> documentId`
- store threadId and relevant metadata for provenance and later thread-level extraction.

Acceptance:
- Running sync twice does not create duplicates.
- Document IDs remain stable across runs.

### W11-D: Knowledge Ingestion Persistence (Entities/Relations/Embeddings + Extraction Lifecycle)

Add an authoritative ingestion step that:

- writes entities + relations to SQL tables
- generates embeddings for retrieval
- records extraction lifecycle rows for observability
- is idempotent on re-run for the same `(documentId, ontologyId, contentHash)`

Acceptance:
- After ingestion, GraphRAG queries return non-empty results for real emails.

### W11-E: Batch Orchestration + Progress in TodoX

Wire batch start + progress stream into TodoX:

- Start ingestion/extraction for N documents as a batch.
- Surface progress and completion in UI.

Acceptance:
- User sees progress ticks and final status, and errors are actionable.

### W11-F: Knowledge Base UI (Replace PlaceholderView)

Replace the `"knowledge-base"` view in `apps/todox/src/app/page.tsx` with a real panel that includes:

- Gmail connection status
- sync controls (query presets)
- batch status (latest + history)
- force-graph visualization (real data, not Arbitrary)
- GraphRAG query panel (real data, not mock)
- provenance panel (evidence spans/snippets; document title + time)

Acceptance:
- The end-to-end story can be demoed in a single TodoX session.

### W11-G: Wealth Management Ontology Seeding and Selection

Keep the ontology content in the TodoX boundary:

- Source TTL: `specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl` is a starting artifact.
- Copy the TTL into a TodoX-owned location (do not export from knowledge server).
- Seed into registry/storage at startup (dev) or via an admin action (prod).

Acceptance:
- Extraction uses the wealth management ontology by ID, loaded from storage/registry.

## PR Breakdown (Make This Shippable)

1. PR1: `@beep/runtime-server` AuthContext helper (Next bridge) + tests
2. PR2: TodoX `extract-preview` endpoint + UI “scopes missing” state
3. PR3: Document mapping table + repo + sync endpoint (bounded query) + tests
4. PR4: Knowledge ingestion persistence (entities/relations/embeddings/extraction rows) + tests
5. PR5: Batch start/progress endpoints + UI integration + tests
6. PR6: Knowledge Base UI (graph + GraphRAG + provenance) with real data
7. PR7: Ontology seeding + selection + demo script + hardening

## Test and Verification Requirements

Minimum bar:

- unit/integration tests for de-dupe/idempotency
- extraction persistence tests that prove SQL tables are populated
- GraphRAG query test that proves retrieval works after ingestion

Suggested command set (per PR):

```bash
bun run check --filter @beep/runtime-server
bun run test  --filter @beep/runtime-server

bun run check --filter @beep/knowledge-server
bun run test  --filter @beep/knowledge-server

bun run check --filter @beep/documents-server
bun run test  --filter @beep/documents-server

bun run check --filter @beep/todox
```

## “Demo Script” (What To Show)

1. Go to TodoX -> “Knowledge Base”
2. Click “Sync last 7 days (Client Comms)”
3. Start extraction batch, watch progress
4. Graph view:
   - click Thompson household node
   - show linked accounts, counterparties, tasks/events
   - click a relation and show evidence snippet
5. Ask: “What do I need to do before the Thompson meeting?”
6. Show generated meeting prep with citations (email subject + date + snippet)

## Open Questions (Answer Before Building Wrong Things)

These materially change implementation choices:

1. Where should the Gmail->Document mapping table live (documents vs knowledge)?
2. Do we require thread-level extraction for MVP, or message-level only?
3. What is the desired initial Gmail query preset (label-based, sender whitelist, or query string)?
4. Do we need to support multiple Google accounts per user/org in the MVP demo?
