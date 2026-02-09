# Phase 10: TodoX End-to-End Gmail Knowledge Pipeline Plan

**Spec**: `specs/pending/knowledge-ontology-comparison`  
**Date**: 2026-02-08  
**Status**: Planned (no code changes in this phase document)  

## Superseded Execution Plan

This document was originally written as a TodoX end-to-end plan, but the execution plan has since moved to a dedicated production-oriented spec:

- **Authoritative execution spec**: `specs/pending/todox-wealth-mgmt-knowledge-mvp/README.md`

Reason: the TodoX/wealth-management MVP requires additional load-bearing contracts and gates (Connected Accounts UX, typed scope-expansion error contracts, SQL evidence-of-record, and production IaC/runbooks) which are not fully captured here, and the “TodoX Next.js route handlers call Gmail adapters” approach creates avoidable `AuthContext`/request-context friction compared to driving the demo via `apps/server` (`beep-api`) + UI.

Keep this P10 document as historical context only; do not implement directly from it.

## Objective

Demonstrate a working TodoX “wealth management knowledge” loop end-to-end inside `apps/todox`:

1. User links a Google account (OAuth via Better Auth).
2. TodoX runs an initial Gmail pull sync (query-based at first).
3. Synced emails are materialized as Documents (stable IDs, de-dupe, metadata stored).
4. Knowledge extraction runs durably (batch + progress) using the wealth management ontology.
5. Results are visible in TodoX via:
   - a knowledge graph visualization view (force graph),
   - GraphRAG queries grounded in extracted entities/relations,
   - click-through provenance back to source email content.

This phase is intentionally product-facing. It assumes the knowledge slice parity work (SPARQL/RDF/PROV/SHACL/workflow) is already largely complete (Phase 7-9).

## Repository Reality Check (What Exists Today)

These are concrete “already present” assets we should reuse, not reimplement:

- Google Workspace integration packages:
  - `packages/integrations/google-workspace/*` provides `GoogleAuthClient` and scope constants.
  - `packages/runtime/server/src/GoogleWorkspace.layer.ts` composes Gmail + Gmail extraction + Calendar adapters.
- Gmail read operations:
  - `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts` already extracts normalized email documents and thread context.
  - `packages/comms/server/src/adapters/GmailAdapter.ts` already supports list/get/send in the comms slice (not yet integrated into TodoX mail UI).
- Workflow engine:
  - `packages/knowledge/server/src/Workflow/*` uses `@effect/workflow` and has batch orchestration + progress streaming primitives.
- TodoX UI stubs/demos:
  - `apps/todox/src/app/api/mail/*` is mock data only (no Gmail).
  - `apps/todox/src/app/knowledge-demo/*` is mock extraction only (no knowledge slice).
  - `apps/todox/src/app/2d-force-graph/page.tsx` visualizes a *sample* `KnowledgeGraph` (no real data).
- Wealth management ontology artifact:
  - `specs/agents/wealth-management-domain-expert/outputs/wealth-management.ttl`

## Major Gaps Blocking End-to-End

### Gap A: No Gmail -> persistence sync surface in TodoX

- TodoX mail endpoints are mocked (`apps/todox/src/app/api/mail/*`).
- There is no API surface that:
  - pulls Gmail messages for the signed-in user,
  - stores them in any durable store,
  - records sync cursor/checkpoints,
  - exposes “sync status” to the app.

### Gap B: Extraction results are not persisted into queryable stores (SQL/embeddings)

The extraction pipeline currently assembles an in-memory graph + emits RDF provenance quads, but it does not (yet) guarantee that:

- entities land in `packages/knowledge/tables/src/tables/entity.table.ts`,
- relations land in `packages/knowledge/tables/src/tables/relation.table.ts`,
- embeddings are created in `packages/knowledge/tables/src/tables/embedding.table.ts`.

GraphRAG (`packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`) queries `EntityRepo` and `RelationRepo`, and relies on embeddings for k-NN. Without a deterministic ingestion/persistence step, “extract from Gmail then query/visualize” will stall.

### Gap C: Knowledge RPC surface is incomplete for product workflows

Knowledge domain defines RPC contracts for Extraction and Ontology (`packages/knowledge/domain/src/rpc/{Extraction,Ontology}/*`), but the server v1 RPC layer only exposes:

- Batch, Entity, Relation, GraphRAG: `packages/knowledge/server/src/rpc/v1/*`

Without Extraction/Ontology RPCs (or an equivalent TodoX API wrapper), TodoX cannot trigger/observe real extraction runs via stable contracts.

### Gap D: Ontology registry + ontology content plumbing for wealth management

We have a wealth management TTL file, but we do not yet have a repeatable mechanism in runtime to:

- register it (OntologyRegistry),
- store it (Storage backend),
- ensure it is loaded/available for extraction in the correct org scope,
- prevent accidental coupling of “capability parity” surface to TodoX-specific ontologies (Phase 9 principle).

### Gap E: TodoX “Knowledge Base” view is currently a placeholder

`apps/todox/src/app/page.tsx` has a `"knowledge-base"` toggle, but it renders `PlaceholderView`.

We need a real integrated view that:

- shows sync and extraction status,
- allows running extraction on a set of emails,
- shows the graph + GraphRAG query results,
- supports provenance drill-down.

### Gap F: Next.js route handlers do not automatically provide AuthContext (hard blocker)

Most of the Google Workspace stack (and knowledge extraction) requires `AuthContext`:

- `packages/runtime/server/src/GoogleWorkspace.layer.ts` explicitly requires `AuthContext` at layer construction time.
- Knowledge RPC handlers (e.g. GraphRAG) rely on `Policy.AuthContext` for org enforcement.

However, TodoX Next.js route handlers typically run effects via `runServerPromise` (see `apps/todox/src/app/api/liveblocks-auth/route.ts`), and `packages/runtime/server/src/Runtime.ts` does **not** provide `HttpServerRequest`, so `packages/runtime/server/src/AuthContext.layer.ts`’s per-request layer cannot be used as-is.

This means “TodoX API route calls Gmail adapter” is dead-on-arrival until we add a request-scoped AuthContext bridge.

**Fix (recommended)**:

- Export a helper from `@beep/runtime-server` that builds an `AuthContextShape` from request headers (cookie/authorization), reusing the existing `getAuthContext(...)` logic in `packages/runtime/server/src/AuthContext.layer.ts`.
- Then TodoX route handlers can do:
  - decode session from request headers
  - provide `Layer.succeed(AuthContext, ctx)`
  - provide `GoogleWorkspace.layer` within that request effect

This keeps AuthContext semantics centralized and avoids TodoX re-implementing auth parsing.

### Gap G: Workflow engine durability is configurable but defaults to memory

The workflow engine runtime mode is controlled by `KNOWLEDGE_WORKFLOW_MODE`:

- `engine-memory` (default)
- `engine-durable-sql`

For a credible demo (restarts, partial failures), we should run the knowledge workflow engine in `engine-durable-sql` mode, and still persist domain-facing execution rows separately (as designed in `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`).

## Phase 10 Approach: Deliver an End-to-End Thin Slice

### Principle 1: Avoid building the full mail client first

The PRD’s eventual architecture includes local-first full inbox sync and a mail UI. That is a large effort. Phase 10 should instead:

- implement a minimal Gmail pull sync (query bounded),
- ingest the resulting documents into the knowledge system,
- show the graph and GraphRAG working in TodoX.

The existing `apps/todox` mail UI can remain mocked until the “mail slice” is ready.

### Principle 2: Use durable batch orchestration for ingestion

Even if we start with a small message set, we should run extraction through:

- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `packages/knowledge/domain/src/rpc/Batch/StreamProgress.ts` (already exists)

This avoids having to retrofit reliability later.

### Principle 3: Keep TodoX-specific integrations and ontology content out of the parity surface exports

Follow Phase 9’s separation model:

- knowledge server exports reusable capabilities,
- TodoX code (or a TodoX-specific integration package) wires in the wealth management ontology and Gmail ingestion policy.

## Proposed Deliverables (Concrete)

### D1: TodoX API surface for Gmail ingestion

Add new TodoX endpoints (Next.js route handlers) that:

- authenticate via Better Auth session cookie,
- construct an `AuthContext` value,
- `Effect.provide(GoogleWorkspace.layer)` within the request context,
- call `GmailExtractionAdapter.extractEmailsForKnowledgeGraph(...)`,
- materialize email documents into a durable store with de-dupe (see D2),
- start a knowledge extraction batch (see D3),
- return a stable “batch id” + initial status.

Do not run long-lived servers in the spec; implement request-driven handlers.

### D2: Durable email materialization model (de-dupe + metadata)

We need a stable mapping from Gmail message IDs to internal `DocumentsEntityIds.DocumentId` and to knowledge ingestion state.

Options to implement (choose one in code, but document both):

1. Documents-first approach:
   - create a new documents-side table `document_external_source` referencing document id and storing:
     - `sourceType = "gmail"`,
     - `sourceId = gmailMessageId`,
     - `threadId`,
     - `from/to/cc/date/labels` JSON,
     - timestamps and last synced hash.

2. Knowledge-side mapping approach:
   - create a knowledge-side table `knowledge_source_document` with the same fields and foreign key to document id.

Evaluation:
- Documents-first is more universal (email is a Document); it avoids coupling “source documents” to knowledge only.
- Knowledge-side is faster to ship but risks moving integration state into the wrong slice.

Phase 10 should implement the minimally disruptive option that keeps boundaries clean. The default recommendation is Documents-first.

### D3: Guaranteed ingestion persistence (entities, relations, embeddings)

Implement a single authoritative ingestion step which:

- takes `ExtractionResult.graph` (assembled entities/relations),
- writes entities and relations into SQL tables in a consistent transaction policy,
- generates embeddings for entities (with rate limits + fallback models),
- records an extraction row (`knowledge_extraction`) tied to `documentId` and `ontologyId`,
- ensures idempotency on repeated runs (document+ontology+hash).

This can be packaged as a new service, for example:

- `packages/knowledge/server/src/Service/GraphIngestionService.ts`

Or implemented inside workflow orchestration (less reusable). The service approach is preferable for testability and reuse.

### D4: Extraction + Ontology RPC completion (or TodoX wrapper)

Pick one:

1. Complete RPC server implementations for `Extraction` and `Ontology` under:
   - `packages/knowledge/server/src/rpc/v1/{extraction,ontology}/...`
   - wire into `packages/knowledge/server/src/rpc/v1/_rpcs.ts`

2. Keep knowledge RPC surface as-is and expose a TodoX-only HTTP API that wraps:
   - Gmail ingestion + batch start,
   - extraction status reads,
   - ontology list/get.

Given TodoX is a product app that will need these workflows, completing the knowledge RPC surface is the more scalable choice.

### D5: TodoX Knowledge Base UI (real view, not demo)

Replace `PlaceholderView` for `"knowledge-base"` mode with a real feature panel that:

- “Connect Gmail” (or “Scopes missing” remediation state) using existing IAM linking flows.
- “Sync emails” button with query controls (start with presets).
- A “latest ingestion batch” status block with progress stream.
- Knowledge graph visualization using the existing `features/knowledge-graph/viz/*` pipeline, but with real data:
  - Graph sourced from persisted entities/relations or from a GraphRAG result subgraph.
- GraphRAG query panel backed by real `GraphRAG` RPC or service.

### D6: Wealth management ontology wiring

Introduce a TodoX-owned ontology registry entry and storage strategy:

- Place the TTL in a TodoX-owned location (do not export it from knowledge server).
  - Candidate: `documentation/todox/ontologies/wealth-management.ttl` or `apps/todox/assets/ontologies/wealth-management.ttl`
- Ensure runtime can load it by:
  - seeding into Storage (`StorageLocal` for dev, `StorageSql` for prod), and
  - registering in `OntologyRegistry` (`ontology/registry.json`).

Add an explicit “ontology id” constant for TodoX to use during extraction (kept in TodoX boundary).

## Milestones and Task Breakdown (Ordered)

### M10-01: Prove Gmail extraction works for the signed-in user (no persistence yet)

1. Add a TodoX API route `GET /api/integrations/gmail/extract-preview` that:
   - authenticates the user (cookie),
   - provides `AuthContext`,
   - provides `GoogleWorkspace.layer`,
   - calls `GmailExtractionAdapter.extractEmailsForKnowledgeGraph("newer_than:7d", 5)`,
   - returns a redacted preview (subject, from, date, first N chars).
2. Add error handling for `GoogleScopeExpansionRequiredError` with a response that TodoX UI can route to incremental consent.

Exit criteria:
- A logged-in TodoX user can hit the endpoint and receive extracted email documents (or a clear “scopes missing” signal).

### M10-02: Implement durable email materialization (de-dupe)

1. Implement the chosen mapping table and repo.
2. Implement “upsert” semantics keyed by `(sourceType, sourceId, organizationId)`.
3. Materialize a Documents row per message:
   - title = subject
   - content = extracted plain text content
   - contentRich = JSON metadata payload (threadId, labels, participants, extractedAt)

Exit criteria:
- Re-running sync does not create duplicates.

### M10-03: Implement ingestion persistence + extraction records

1. Add ingestion persistence service (entities, relations, embeddings).
2. Add extraction record creation and status transitions.
3. Add tests that:
   - ingest the same document twice and produce stable results,
   - verify entity and relation tables are populated,
   - verify embeddings exist for entities used in GraphRAG.

Exit criteria:
- After sync + extraction, GraphRAG queries return results from persisted data (not demo data).

### M10-04: Wire batch orchestration + progress streaming into TodoX

1. Implement start-batch endpoint:
   - uses the materialized documents as batch inputs,
   - returns `batchId`.
2. Implement progress stream endpoint:
   - consumes existing knowledge `Batch/StreamProgress` mechanics (RPC or TodoX wrapper).
3. UI shows progress and final status.

Exit criteria:
- A user can run batch extraction from TodoX and observe progress until completion.

### M10-05: Ship “Knowledge Base” integrated UI

1. Implement knowledge base view with:
   - sync control + query presets,
   - batch status,
   - graph visualization of latest batch (or a selected email thread),
   - GraphRAG query panel wired to real service.
2. Add provenance drilldown:
   - click entity or relation shows evidence spans and links to the source document.

Exit criteria:
- Demo script works end-to-end in the TodoX app with a real Gmail account.

### M10-06: Ontology registry and wealth management ontology selection

1. Seed registry + wealth management TTL into storage.
2. Ensure extraction uses the TodoX-chosen ontology id.
3. UI exposes ontology selection only if needed; default is wealth management ontology.

Exit criteria:
- Extraction runs with wealth management ontology loaded from registry, not hardcoded string blobs.

## “Every Last Thing” Checklist (Backlog Exhaustive)

This is the full closure list needed to go from today’s repo to a credible MVP demonstration.

### Authentication and Scopes

- Ensure Google provider exists in Better Auth config with required scopes for read-only extraction.
- Add incremental consent UX when scopes are missing.
- Ensure `AuthContext` creation in TodoX API routes matches runtime server semantics (do not fork/duplicate the logic).
- Add a reusable “AuthContext from NextRequest headers” helper in `@beep/runtime-server` (see Gap F).

### Sync and Ingestion

- Sync query model:
  - initial: bounded queries (sender whitelist, label, time range)
  - later: history-based incremental sync, watch webhooks
- Sync cursor storage:
  - last sync timestamp
  - Gmail `historyId` (future)
- Rate limit management:
  - backoff and partial progress
  - visibility in UI
- HTML stripping and MIME parsing correctness (already in GmailExtractionAdapter):
  - verify with real-world emails (multipart/alternative, forwarded chains)

### Data Modeling

- External mapping table for Gmail message id -> document id.
- Thread modeling (optional for Phase 10):
  - store `threadId` and enable thread-level extraction (using `extractThreadContext`)
- Provenance links:
  - persist “source uri” or “source id” for clickthrough back to document.

### Knowledge Pipeline

- Implement a persistence step for:
  - knowledge entities
  - relations
  - embeddings
  - extraction row tracking
- Decide whether RDF store is authoritative or secondary:
  - if GraphRAG uses SQL, SQL persistence cannot be optional.
- Fill in missing repo layers if needed for runtime composition:
  - `KnowledgeRepos.layer` currently does not include all repos; if TodoX programs rely on `EntityRepo`, they must explicitly provide `EntityRepoLive` (or repos layer must be expanded).

### API Surface

- Add missing knowledge RPC implementations for:
  - Extraction: `Extract`, `GetStatus`, `List`, `Cancel`
  - Ontology: `Create`, `Update`, `Delete`, `List`, `GetClasses`, `GetProperties`
- Or implement TodoX HTTP wrappers with stable payload schemas.

### UI and Visualization

- Replace `"knowledge-base"` placeholder with a real view.
- Integrate:
  - graph visualization (force graph) using real graph slices
  - GraphRAG query UI
  - evidence/provenance viewer
- Add a narrow “demo mode” path for predictable behavior when Gmail is not connected:
  - show sample emails and sample extracted graph, but label clearly.

### Testing and Verification

- Add unit tests for mapping/upsert semantics and idempotency.
- Add knowledge ingestion tests that assert tables populated.
- Add a minimal e2e test (Playwright) for TodoX:
  - loads knowledge base page
  - triggers sync (mocked provider in CI) and sees results.

### Operational Concerns

- Sensitive data handling:
  - avoid logging full email content
  - redact email addresses in logs by default (or truncate)
- Multi-tenant enforcement:
  - all new tables must have organization id and RLS pattern alignment.
- Observability:
  - add spans for sync and batch start
  - surface failures in UI with actionable remediation steps.
- Demo reliability:
  - set `KNOWLEDGE_WORKFLOW_MODE=engine-durable-sql` for demo environments to avoid “restart loses progress”.

## Suggested Ownership Split (Parallelizable)

1. TodoX UI integration and API wrappers (`apps/todox/*`).
2. Document materialization + mapping table (`packages/documents/*` or dedicated integration package).
3. Knowledge ingestion persistence + extraction record lifecycle (`packages/knowledge/server/*`).
4. Knowledge RPC completion (`packages/knowledge/server/src/rpc/v1/*` + domain alignment).
5. Ontology registry seeding + wealth management ontology ownership location (`documentation/todox/*` and runtime seed code).

## Acceptance Criteria (Definition of Done)

1. A TodoX user can connect Gmail and trigger a bounded sync.
2. Synced emails are persisted as Documents and are de-duplicated on re-sync.
3. Batch extraction runs durably and progress is visible in TodoX.
4. Extracted entities and relations are queryable via GraphRAG and visible in a graph visualization.
5. Entity/relation details show provenance back to the source email document content.
6. Wealth management ontology is used (loaded via registry/storage), without exporting TodoX ontology content from the core knowledge capability surface.
