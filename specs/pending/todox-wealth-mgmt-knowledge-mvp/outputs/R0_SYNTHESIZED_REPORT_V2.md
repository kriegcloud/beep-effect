# R0 Synthesized Report V2: TodoX Wealth Mgmt Knowledge MVP (Orchestrator)

## Inputs Read (Delta Since V1)
- Baseline synthesis: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R0_SYNTHESIZED_REPORT.md` (built from R1-R5)
- New research: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R6_OAUTH_SCOPE_EXPANSION_FLOW.md`
- New research: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R7_GMAIL_DOCUMENT_MAPPING_DESIGN.md`
- New research: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R8_PROVENANCE_PERSISTENCE_AND_API.md`
- New research: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R9_TODOX_KNOWLEDGE_BASE_UI_PLAN.md`

## What Changed Since V1 (High-Signal Deltas)
- **New blocker:** Google account linking and incremental consent are not achievable end-to-end because IAM UI does not expose social sign-in or account linking, and there is no Connected Accounts/Integrations screen that calls `iam.oauth2.link`. Scope expansion errors also lack a typed RPC/HTTP contract, so the UI cannot reliably prompt a relink.
- **New concrete design:** A boundary-safe Gmail -> Documents materialization path exists via a Documents-owned `document_source` mapping table keyed by `(orgId, providerAccountId, sourceId)` plus provenance/idempotency fields.
- **New evidence model requirements:** RDF provenance is currently ephemeral and incomplete (no spans). The durable evidence-of-record should be SQL (primarily `knowledge.mention`), with a minimal `Evidence.List` API and a meeting-prep bullet -> evidence persistence model.
- **UI direction clarified:** A single "Knowledge Base" surface can reuse existing graph canvas + knowledge-demo panels, but a route decision is required to avoid spreading MVP across multiple demo pages.

## Newly Discovered Blockers (Concrete)

### 1) IAM UI linking gap (blocks Gmail-based demo)
- IAM server + client support account linking and incremental scopes, but **IAM UI does not expose it**:

Concrete gaps:
- Social sign-in UI file exists but is empty; social blocks are commented out in sign-in/sign-up views.
- There is no "Connected Accounts / Integrations" UI that calls `iam.core.listAccounts`, `iam.oauth2.link`, and `iam.core.unlinkAccount`.

This makes Gmail/Calendar-based workflows fragile because:
- Users cannot link Google at all (unless they hit endpoints manually).
- When a scope is missing, `GoogleScopeExpansionRequiredError` can be thrown, but the client cannot reliably detect it without a typed error contract.

### 2) Scope expansion error is not part of a typed contract (blocks deterministic UX)
- `GoogleScopeExpansionRequiredError` exists and bubbles from adapters, but no RPC/HTTP shape models it today.
- Without a typed error payload containing `missingScopes` and relink params, the UI ends up with string matching or generic error handling.

### 3) "Evidence Always" cannot be satisfied via RDF provenance as-is
- RDF store is in-memory only (`N3.Store`), so provenance is lost on restart.
- `ProvenanceEmitter` links entities/relations to activities/documents but does **not** persist or expose the actual text spans needed for UI highlighting.
- Durable evidence currently exists in SQL, but it is inconsistent:

Evidence store facts:
- `knowledge.mention` is strong (documentId + offsets).
- `knowledge.relation.evidence` lacks `documentId`, and `relation.extractionId` is optional, so resolving source docs is fragile.
- `knowledge.entity.mentions` JSONB omits documentId, so it cannot safely support multi-document provenance if entities are merged.

### 4) Meeting prep provenance is not persisted
- GraphRAG/meeting-prep provenance lives only in memory; there is no durable model for "these bullets were grounded in these spans".

## 14 Load-Bearing Decisions / Gaps (Ordered)

1. **Lock the demo scope (and non-goals) so implementation does not sprawl**
   - Keep: Gmail -> Knowledge Graph with provenance -> Meeting prep in ~5 minutes.
   - Explicitly exclude: full calendar sync, dashboards, doc editor, multi-source entity resolution, real-time webhooks.

2. **Define and ship a credible wealth-management demo dataset**
   - Must include: meeting date, account detail, life event, action items, and at least one compliance-sensitive phrase.

3. **Unblock Google OAuth end-to-end: Connected Accounts UI + typed scope expansion**
   - Required: a user path to link/relink Google and show current scopes.
   - Required: a typed contract for `GoogleScopeExpansionRequiredError` (or equivalent) on relevant RPC endpoints.
   - Otherwise the Gmail-based demo is functionally blocked.

4. **Materialize Gmail -> Documents with a boundary-safe mapping table**
   - Implement a Documents-owned `document_source` (or similarly named) table keyed by `(organizationId, providerAccountId, sourceId)`.
   - The mapping must not introduce cross-slice table dependencies (store IAM account id as a typed string, not an FK).

5. **Persist extractions into SQL so graph queries and UI return real data**
   - Current extraction emits to in-memory RDF; GraphRAG/list APIs read SQL repos.
   - Must write `extraction/entity/relation/mention` tables to make UI non-empty.

6. **Generate and store embeddings for extracted entities**
   - `EmbeddingService.embedEntities` exists but is not invoked; meeting prep and similarity search will underperform without it.

7. **Operationalize ontology selection via a registry (boot seed + runtime wiring)**
   - Ship a registry file and a deterministic ontology selection mechanism (not "paste ontology JSON per run").

8. **Close the API loop: mount missing knowledge RPC surfaces**
   - Extraction and ontology contracts exist but server handlers and router mounting are missing/incomplete.
   - UI cannot be de-mocked until these exist.

9. **Define a durable evidence-of-record model (and stop depending on RDF for UI)**
   - Standardize on `knowledge.mention` as the entity evidence source of truth.
   - Fix relation evidence resolvability (either make `relation.extractionId` mandatory for evidenced relations or add `relation.documentId`/`evidenceDocumentId`).

10. **Implement `Evidence.List` RPC to power "Evidence Always" UI**
   - Single endpoint that can return evidence for an entity, relation, or meeting-prep bullet.
   - This is also the server-side contract for the evidence panel described in R9.

11. **Add Meeting Prep evidence persistence (bullets -> citations)**
   - Meeting prep must be evidence-grounded in storage, not just in a response payload.
   - Introduce minimal tables: `knowledge_meeting_prep_bullet` and `knowledge_meeting_prep_evidence` (or equivalent).

12. **Choose the minimal Knowledge Base UI route and wire it to real RPCs**
   - Avoid having MVP split across `/knowledge-demo` (mock actions), `/2d-force-graph` (viz), and ad-hoc pages.
   - Pick one "real" surface and keep the others as dev tools only.

13. **Decide workflow durability + topology, and isolate cluster tables**
   - Decide between `SingleRunner` (durable single-node) vs multi-runner cluster.
   - If using SQL-backed cluster storage, prefix cluster tables (avoid cross-service collisions) and document table ownership/migrations.

14. **Make production posture real: env schema alignment + IaC gates**
   - Confirm target platform and storage choice (S3 vs extending to GCS), then codify secret management, migrations job, telemetry endpoints, and CORS/RLS gates.
   - Current docs show env-name mismatches; treat `@beep/shared-env` schemas as the single source of truth.

## Concrete Decisions Needed (Mapping Table + Evidence Model)

### A) Gmail -> Documents mapping (`document_source`) decisions
From `R7_GMAIL_DOCUMENT_MAPPING_DESIGN.md`, the table is viable, but there are decisions the repo must lock:

- Provider account identifier decision: is `providerAccountId` the internal IAM `account.id`, or the external provider "accountId/email"?
- Provider account identifier constraint: it must be stable and consistently available at materialization time because it participates in uniqueness.
- 1:1 vs 1:N per Gmail message decision: do attachments become separate `document` rows (recommended long-term), or is MVP 1 Gmail message = 1 document containing body + attachment metadata?
- Immutability policy decision: should Gmail-sourced docs be immutable (`lockPage = true`) to avoid divergence from source-of-truth?
- If edits are allowed: define an explicit "materializationPolicy" and update rules.
- Idempotency hash decision: exact inputs for `sourceHash` (subject + body + attachments list + headers?) and normalization rules.
- Soft-delete behavior vs uniqueness decision: do we allow re-linking/re-materialization after soft delete?
- Soft-delete behavior implication: if yes, partial unique index on `deleted_at IS NULL` is needed. If no, current-style unique index is acceptable.
- Minimum provenance fields decision: which of `sourceInternalDate`, `sourceHistoryId`, `sourceThreadId`, `sourceUri` are required for MVP evidence and refresh logic.

### B) Relation / document evidence model decisions (must be explicit)
From `R8_PROVENANCE_PERSISTENCE_AND_API.md`, the current state has correctness traps:

- Entity evidence decision: treat `knowledge.mention` as the only supported evidence store for entity click-through.
- Entity evidence action: deprecate/ignore `entity.mentions` JSONB for UI purposes (it cannot disambiguate multi-document evidence).

Relation evidence resolvability decision (pick one):
1. Enforce `relation.extractionId` non-null whenever `relation.evidence` is present, and require `extraction.documentId` to exist.
2. Add a direct `relation.documentId` (or `relation.evidenceDocumentId`) so evidence does not depend on an optional join.

Relation evidence counter-example (breaks naive designs): a relation created/merged across extractions without setting `extractionId` becomes impossible to cite.

- Meeting prep evidence decision: store meeting-prep bullets and citations durably, referencing mentions/relations or raw document spans.
- Meeting prep evidence risk: without this, "Evidence Always" holds only during a single request and cannot be audited later.
- Evidence RPC contract decision: implement a single `Evidence.List` endpoint with filters (`entityId?`, `relationId?`, `meetingPrepBulletId?`, `documentId?`).
- Evidence RPC contract requirement: make `documentId + offsets` mandatory in returned spans so the UI can highlight text deterministically.

## Minimal UI Route Recommendation (MVP)

### Knowledge Base surface (single route)
Recommendation:
- Ship one Knowledge Base route in TodoX: `apps/todox/src/app/knowledge/page.tsx` (`/knowledge`).
- Keep `/knowledge-demo` and `/2d-force-graph` as dev/test pages only (explicitly out-of-demo).

Reasoning:
- R9's 3-panel layout (left query/meeting-prep, center graph, right inspector/evidence) is already aligned with existing components and avoids UI fragmentation.
- A new `/knowledge` avoids the "demo" naming and gives a single URL for the 5-minute narrative.

### Connected Accounts / Integrations (minimal UX path for OAuth linking)
Recommendation:
- **Implement "Connections" inside the existing Web account settings dialog** using the already-modeled `settingsTab=connections` value.
- Deep-link path: `/dashboard?settingsTab=connections` (App Router already supports this pattern).

Reasoning:
- The domain already defines `connections` as a first-class tab.
- This is less surface area than a brand-new settings route, and it unblocks incremental consent UX immediately.

## Updated Phase Plan + Gates (Includes New Blockers + APIs)

### Phase 0: MVP Demo (Gmail-based, evidence-grounded, minimal UI)
Deliverables:
- Connected Accounts UX: list linked accounts + scopes, link/relink Google via `iam.oauth2.link` with scopes, unlink.
- Typed error mapping for scope expansion so the UI can prompt relink deterministically.
- Gmail -> Documents materialization: `document_source` mapping + document/version creation.
- Gmail -> Documents idempotency: upsert keyed by `(orgId, providerAccountId, messageId)`.
- Extraction persistence: write entities/relations/mentions to SQL and compute embeddings.
- Evidence surfaces: `Evidence.List` returns spans with `documentId + offsets`.
- Relation evidence is resolvable (no optional-join dead ends).
- UI: `/knowledge` route wired to real RPCs for graph fetch, GraphRAG query, and evidence panel.
- No mocks on the happy path.

Gates (demo-ready, pass/fail):
- A user can link Google (or relink with expanded scopes) entirely through UI.
- Missing scopes produce a typed, actionable response (includes missing scopes and relink parameters).
- Graph view shows typed WM entities/relations from SQL, not in-memory-only stores.
- Every displayed claim in meeting prep has at least one evidence span that highlights in source text.
- No cross-household/org data appears in any query path used in the demo.
- Output avoids guarantees and includes a compliance-safe disclaimer where applicable.

### Phase 1: Hardening (durability, integrity constraints, ops posture)
Deliverables:
- Data integrity: enforce relation evidence resolvability (schema constraint + tests).
- Data integrity: meeting prep bullet + evidence persistence tables (or equivalent) and write path.
- Reliability: extraction status persistence, retries, idempotency keys.
- Reliability: workflow durability decision (SingleRunner vs durable cluster) implemented with table isolation/prefixing.
- Observability + ops: OTLP traces/logs/metrics for extraction + GraphRAG.
- Observability + ops: staging IaC baseline and migration job wiring.

Gates:
- Restart-safe demo (no "evidence disappears after restart" failure modes).
- Automated tests cover cross-org leakage for entities, mentions, embeddings, and evidence.
- Runbooks and alerting exist for extraction failures and latency spikes.

IaC gates (staging-ready):
- Terraform provisions Postgres (pgvector), Redis, service runtimes, and secret bindings.
- Secrets are injected via Secret Manager; no secrets in tfvars; env vars match `@beep/shared-env` schemas.
- DB migrations run via a dedicated job (`bun run db:migrate`), not on app startup.
- CORS / `SECURITY_TRUSTED_ORIGINS` are locked down to expected domains.

### Phase 2: Scale (multi-tenant, multi-node workflows, performance)
Deliverables:
- Multi-node workflow topology (if required) without table collisions.
- Performance tuning: batching, incremental extraction, vector index tuning, caching.
- Retention policies and audit export posture for compliance workflows.

Scale gates:
- Load tests demonstrate stable extraction throughput and query latency within target bounds.
- Multi-tenant tests show no cross-tenant entity/mention leakage, including embeddings and provenance.
- Runbooks for incident response, rollback, and DR posture for Postgres/Redis.

## API Inventory (Additions and MVP Required Surfaces)

### IAM / Auth (Connected Accounts + incremental consent)
- `iam.core.listAccounts` (show linked providers + stored `scope`)
- `iam.oauth2.link` (must accept `scopes` for incremental consent; returns authorization URL)
- `iam.core.unlinkAccount`
- Typed error contract: `GoogleScopeExpansionRequiredError` (or mapped tagged error) on endpoints that depend on Gmail/Calendar scopes

### Knowledge (Evidence-first contracts)
- `knowledge.evidence.list` (entity/relation/bullet/document evidence spans)
- `knowledge.graph.get` (assembled graph + source docs for evidence panel)
- `knowledge.graphrag.query` (GraphRAG query)
- `knowledge.meetingPrep.run` (meeting prep response; Phase 1 adds durable persistence model)

### Documents (Gmail materialization)
- Internal service/repo surface to upsert document + `document_source` mapping (RPC optional for MVP if triggered server-side via extraction job)

## Repeated "User Has To Restate" Items -> Bake Into Spec Templates/Gates
- Scope / non-goals: include once, then repeat verbatim across the spec, prompts, and phase handoffs. Gate new work by requiring a "which scope bullet does this serve" citation.
- Demo dataset contract: define required threads, IDs, and expected entity/edge counts. Gate demo readiness with a reproducible dataset ingestion + assertion script.
- OAuth linking and scope expansion: define required provider, required scopes, and the relink UX path. Gate Gmail/Calendar-dependent work on a working Connected Accounts screen plus typed scope-expansion errors.
- Ontology definition: define WM entity + relation sets and required fields. Gate extraction on ontology registry entry existence and validation against unknown types.
- Provenance and auditability requirements: define "Evidence Always" acceptance criteria and forbid UI facts without evidence spans. Gate UI on evidence endpoints returning `documentId + offsets`.
- API inventory: enumerate RPC names, request/response schemas, and backing tables. Gate UI work by disallowing mocks on the happy path.
- Workflow topology and table ownership: record runner mode and cluster table prefixing. Gate multi-node deploy work on an explicit topology decision record.
- Multi-tenant isolation (orgId/RLS): document scoping on read and write paths and include cross-org leakage tests as acceptance criteria.
- Env contract and IaC naming: generate docs from `@beep/shared-env` schemas and treat them as the single source of truth. Gate deployment docs and Terraform variables on exact schema name matches.
- Counting/measurement rules: define what counts as an entity/mention/extraction and reuse those definitions in acceptance criteria to prevent demo disputes.

## Proposed Spec Outline (Exhaustive)
1. Problem statement (WM meeting-prep pain; why KG + evidence is required)
2. Goals (demo goals vs hardening goals)
3. Non-goals (explicit exclusions)
4. Demo narrative (end-to-end user story)
5. Success criteria (measurable counts + evidence requirements)
6. Open questions (platform, storage, runner mode, UI route)
7. OAuth + Connected Accounts (linking, scope expansion, error contracts)
8. Minimal WM ontology (entities + relations + required fields)
9. Data model (documents + `document_source`, extraction tables, evidence tables, embeddings)
10. Ingestion + document materialization (Gmail IDs, idempotency keys, retention)
11. Extraction pipeline (stages, error handling, persistence, retries)
12. Graph persistence + provenance (SQL as system of record; RDF as optional)
13. Evidence model + APIs (entity, relation, meeting-prep bullet evidence)
14. Embeddings + retrieval (when computed, storage, query semantics)
15. GraphRAG + meeting prep semantics (grounding rules, compliance-safe language)
16. API / RPC surface (inventory and error contracts)
17. UI surfaces (Knowledge Base route layout, evidence panel behavior, connections tab)
18. Security + compliance (disclaimers, audit, PII posture, org isolation)
19. Workflow durability / topology (single vs multi-node, table prefixing, migrations)
20. Observability (OTLP, dashboards, alerts, SLOs)
21. IaC / ops plan (envs, secrets, migrations job, rollout/rollback)
22. Validation plan (automated tests + demo checklist + negative tests)

## 5-Minute Demo Script (Updated) + Acceptance Criteria
Timebox assumes the WM synthetic dataset is already available and the user is authenticated.

Script:
1. 00:00-00:30 Connected Accounts (optional but recommended)
2. Show Google connected with Gmail scope coverage, or demonstrate a scope expansion prompt and relink.
3. 00:30-01:15 Context
4. Show Gmail thread list filtered to a single household.
5. 01:15-02:15 Extraction result
6. Open one email and show extracted entities and relations.
7. Click an entity and show evidence span provenance (email excerpt with highlight).
8. 02:15-03:15 Graph view
9. Show the household node and a 1-2 hop subgraph with typed relations.
10. 03:15-04:30 Meeting prep
11. Run "Prepare me for the Thompson meeting on 2026-02-10".
12. Show structured briefing with evidence links per section.
13. 04:30-05:00 Compliance highlight
14. Point to evidence links for each key claim and show the disclaimer/no-guarantees posture.

Acceptance criteria (demo pass/fail):
- The system can link or relink Google via UI, including incremental scope expansion when missing.
- Dataset contains: meeting date, account detail, life event, action item, and at least one compliance-sensitive phrase.
- The system can show: at least one Household, one Client, one Account, one LifeEvent, one ActionItem, plus typed edges linking them.
- Meeting prep output includes: summary, recent comms, open actions, and evidence references for each section.
- Evidence is inspectable from the UI for at least: one entity, one relation/claim, and one meeting-prep bullet.
- No cross-household/org data appears in any query path used in the demo.
- Output avoids guarantees and includes a compliance-safe disclaimer where applicable.

## Spec-Quality Gates (From 5/5 Repo Patterns)
- Required structure completeness (outputs/templates/handoffs + reflection protocol).
- Scope boundaries repeated and enforced across files and phase handoffs.
- Open questions captured at P0 with explicit decisions per phase.
- Counting/measurement clarifications defined once and reused for acceptance checks.

## Notes / Risks That Must Stay Visible
- Relying on RDF provenance as a UI source of truth is a trap: it is ephemeral and incomplete for spans. SQL evidence must be the primary path for "Evidence Always".
- Any evidence model that allows `relation.evidence` without a resolvable `documentId` will produce dead links in UI and degrade trust quickly.
- If Connected Accounts is not shipped early, Gmail and the entire demo narrative will stall behind manual OAuth workflows.
