# P10 Orchestrator Prompt: TodoX E2E Gmail Knowledge Integration

You are the orchestrator for Phase 10 in the `beep-effect` monorepo.

## Goal

Deliver an end-to-end working integration in `apps/todox`:

1. Gmail pull sync (bounded query) for the signed-in user.
2. Materialize synced emails as Documents with stable IDs and de-dupe.
3. Run durable knowledge extraction as a batch with visible progress.
4. Persist extracted entities/relations/embeddings so GraphRAG and graph visualization work.
5. Replace TodoX `"knowledge-base"` placeholder with a real integrated view.
6. Use the wealth management ontology via registry/storage without exporting it from the knowledge capability surface.

## Read These First (Fast Context)

1. `specs/pending/knowledge-ontology-comparison/outputs/P10_TODOX_E2E_GMAIL_KNOWLEDGE_PLAN.md`
2. `packages/runtime/server/AGENTS.md` (GoogleWorkspace layer constraint: requires per-request AuthContext)
3. `packages/knowledge/server/AGENTS.md` (GmailExtractionAdapter usage pattern)

## Non-Negotiables

- Do not rebuild Gmail integration from scratch.
- Do not start long-running dev servers without confirmation.
- Keep capability parity surface clean: TodoX-specific ontology content stays in TodoX boundary.
- No `any`, no `@ts-ignore`, no unchecked casts.
- Validate external data with Schema where possible.

## Parallel Workstreams (Delegate Immediately)

Delegate these as separate implementer tasks. Each implementer must include file paths and tests.

### Stream A: TodoX API Endpoints + AuthContext Construction

Deliver:

- A TodoX API route that proves Gmail extraction works for the signed-in user:
  - endpoint returns redacted previews from `GmailExtractionAdapter.extractEmailsForKnowledgeGraph(...)`.
- Proper error handling for `GoogleScopeExpansionRequiredError` to drive incremental consent UX.

Key references:

- `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`
- `packages/runtime/server/src/GoogleWorkspace.layer.ts`
- `apps/todox/src/app/api/liveblocks-auth/route.ts` (pattern for cookie session -> Effect)

### Stream B: Document Materialization + De-dupe Mapping Model

Deliver:

- A durable mapping from `(organizationId, sourceType="gmail", sourceId=gmailMessageId)` to `DocumentsEntityIds.DocumentId`.
- Upsert semantics to prevent duplicates.
- Persist email metadata and content in Documents with a consistent shape.

Do a short design decision doc in-code (README or module comment) justifying where the mapping table lives.

### Stream C: Knowledge Ingestion Persistence

Deliver:

- An authoritative ingestion step that persists:
  - knowledge entities
  - relations
  - embeddings
  - extraction row lifecycle (pending -> running -> completed/failed)
- Idempotency: reruns do not explode duplicates.
- Tests proving tables are populated and GraphRAG can retrieve based on ingested data.

### Stream D: TodoX Knowledge Base UI

Deliver:

- Replace the `"knowledge-base"` placeholder in `apps/todox/src/app/page.tsx` with a real view.
- UI must:
  - show “connect Gmail” state
  - show sync trigger and status
  - start extraction batch and show progress
  - show graph visualization from real data (not Arbitrary demo)
  - run GraphRAG query and render results

## Milestones and Verification (Orchestrator Checklist)

1. Gmail preview endpoint works with a real session cookie.
2. Emails are persisted as Documents with de-dupe.
3. Batch extraction runs via workflow and progress is observable.
4. Entities/relations/embeddings exist post-extraction and GraphRAG queries return non-empty results.
5. TodoX Knowledge Base view renders and is connected end-to-end.
6. Wealth management ontology is selected via registry/storage and used by default.

Verification commands (run after each milestone):

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
bun run check --filter @beep/documents-server
bun run test --filter @beep/documents-server
bun run check --filter @beep/todox
```

## Outputs

As you complete work, update:

- `specs/pending/knowledge-ontology-comparison/outputs/P10_TODOX_E2E_GMAIL_KNOWLEDGE_PLAN.md`

Keep it reconciled to reality (cite code paths and tests).

