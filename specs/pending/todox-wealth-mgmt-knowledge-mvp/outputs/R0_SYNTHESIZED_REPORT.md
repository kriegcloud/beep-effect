# R0 Synthesized Report: TodoX Wealth Mgmt Knowledge MVP (Orchestrator)

> Superseded by `outputs/R0_SYNTHESIZED_REPORT_V3.md`. Keep this file for history only; do not use for execution.

## Inputs Read
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R1_TOP_SPECS_5_OF_5_PATTERNS.md`
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R2_EFFECT_WORKFLOW_CLUSTER_PATTERNS.md`
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R3_TODOX_WM_DEMO_PRD_DISTILLATION.md`
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`
- `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R5_IAC_OPS_PRODUCTION_PLAN.md`

## 10 Load-Bearing Decisions / Gaps (Ordered)

1. **Lock the demo scope (and non-goals) so implementation does not sprawl**
   - Decision: Demo is **Gmail -> knowledge graph w/ provenance -> meeting prep** in ~5 minutes; explicitly exclude calendar sync, dashboards, doc editor, multi-channel comms, entity resolution across sources, and real-time webhooks.
   - Failure mode: scope creep blocks demo and delays hardening priorities.
   - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R3_TODOX_WM_DEMO_PRD_DISTILLATION.md`

2. **Define and ship a credible wealth-management demo dataset**
   - Gap: existing sample emails are not WM-specific; the demo needs 3-5 synthetic threads for a single household containing account details, a meeting date, a life event, action items, and at least one compliance-sensitive phrase.
   - Failure mode: demo reads as toy; compliance/provenance story cannot land.
   - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R3_TODOX_WM_DEMO_PRD_DISTILLATION.md`

3. **Materialize Gmail -> Documents slice (Document + version + source mapping)**
   - Gap: Gmail adapter returns extracted text but nothing creates a `Document` / `DocumentVersion`, and nothing maps Gmail message/thread IDs to `DocumentsEntityIds.DocumentId`.
   - Failure mode: extraction cannot be tied to durable document provenance; downstream UI and audit cannot reference stable IDs.
   - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`, `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`, `packages/documents/server/src/db/repos/Document.repo.ts`

4. **Persist extractions into SQL (entities/relations/mentions) so GraphRAG returns data**
   - Gap: extraction writes only to an in-memory RDF store; GraphRAG and list APIs read SQL repos but there is no write path to `extraction/entity/relation/mention/mention_record` tables.
   - Failure mode: the graph UI and meeting prep queries are empty even if extraction "runs."
   - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`, `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`, `packages/knowledge/tables/src/tables/*.table.ts`, `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`

5. **Generate and store embeddings for extracted entities**
   - Gap: `EmbeddingService.embedEntities` exists but is never invoked in the pipeline/workflow.
   - Failure mode: seed-entity lookup and similarity search fail; meeting prep cannot ground on relevant nodes.
   - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`, `packages/knowledge/server/src/Embedding/EmbeddingService.ts`

6. **Operationalize ontology selection via a registry (boot seed + runtime wiring)**
   - Gap: `OntologyRegistry` expects a registry file, but none is shipped/loaded; extraction expects ontology content, but there is no named-ontology selection story.
   - Failure mode: every run becomes a one-off payload problem and the user must keep restating ontology; demo cannot show "select WM ontology."
   - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`, `packages/knowledge/server/src/Service/OntologyRegistry.ts`

7. **Close the API loop: implement/mount missing knowledge RPC surfaces**
   - Gap: Extraction + Ontology RPC contracts exist but server handlers are missing and the runtime router does not mount the knowledge RPC group.
   - Failure mode: UI remains mocked; no stable entrypoint to start/list extractions or ontologies.
   - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`, `packages/knowledge/server/src/rpc/v1/_rpcs.ts`, `packages/runtime/server/src/Rpc.layer.ts`

8. **Make provenance visible end-to-end (API + UI evidence panel)**
   - Gap: provenance is emitted to an in-memory RDF store but not exposed in UI; demo UI currently uses mock graphs without evidence spans.
   - Failure mode: fails the core WM trust/compliance narrative ("Evidence Always"); graph becomes un-auditable.
   - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R3_TODOX_WM_DEMO_PRD_DISTILLATION.md`, `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`, `packages/knowledge/server/src/Rdf/ProvenanceEmitter.ts`, `apps/todox/src/app/knowledge-demo/actions.ts`

9. **Decide workflow durability + topology, and isolate cluster tables**
   - Decision: pick between `SingleRunner` (durable single-node) vs multi-runner cluster; if using SQL-backed cluster storage, explicitly prefix cluster tables (avoid cross-service collisions) and document migration/table ownership.
   - Failure mode: table collisions in shared DB, unclear deployment constraints, runtime failures due to dependency-ordering gotchas, or attempting multi-node on a single-node runner.
   - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R2_EFFECT_WORKFLOW_CLUSTER_PATTERNS.md`, `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`

10. **Make production posture real: env schema alignment + IaC gates**
   - Gap: production plan depends on strict env schemas; current docs show mismatches (`AUTH_SECRET` vs `BETTER_AUTH_SECRET`, `REDIS_URL` vs `KV_REDIS_*`, empty `KV_REDIS_PASSWORD` in `.env.example`).
   - Decision: confirm target platform (plan assumes GCP Cloud Run) and storage choice (AWS S3 vs extending to GCS), then codify secret management, migrations job, telemetry endpoints, and CORS/RLS gates.
   - Failure mode: deployment fails schema validation, secrets leak into tfvars, or infra cannot support required components (pgvector, Redis, OTLP).
   - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R5_IAC_OPS_PRODUCTION_PLAN.md`, `@beep/shared-env` (referenced by R5)

## Repeated "User Has To Restate" Items -> Bake Into Spec Templates/Gates

These are the items that repeatedly show up as implicit assumptions or rediscovered constraints; treat them as required, first-class fields in the spec and enforce them as gates.

- **Scope / non-goals (demo vs product)**
  - Bake in: `Scope` + `Non-Goals` section repeated verbatim across `README.md`, `AGENT_PROMPTS.md`, and every phase handoff.
  - Gate: any new work item must cite which scope bullet it serves (or is rejected).
  - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R1_TOP_SPECS_5_OF_5_PATTERNS.md`, `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R3_TODOX_WM_DEMO_PRD_DISTILLATION.md`

- **Dataset definition (what data, where it lives, what counts as "done")**
  - Bake in: a `Demo Dataset Contract` template (threads, required fields, IDs, expected extractions).
  - Gate: CI/demo script asserts the dataset exists and produces required entity/edge counts.
  - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R3_TODOX_WM_DEMO_PRD_DISTILLATION.md`

- **Ontology definition (entities/relations + meaning, not just labels)**
  - Bake in: a `Minimal Ontology` section (entity list, relation list, required fields, naming conventions).
  - Gate: ontology registry entry exists + extraction validates against ontology (no unknown types).
  - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R3_TODOX_WM_DEMO_PRD_DISTILLATION.md`, `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`

- **Provenance and auditability requirements**
  - Bake in: "Evidence Always" acceptance checklist and a standard `Provenance UI` screenshot/fixture requirement.
  - Gate: every displayed fact (entity/edge/meeting-prep bullet) links to an email span or source reference.
  - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R3_TODOX_WM_DEMO_PRD_DISTILLATION.md`, `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`

- **API surface needed for the demo (what the UI calls, what RPCs exist)**
  - Bake in: an `API Inventory` table (RPC name -> request/response -> backing repo/table).
  - Gate: demo UI cannot use mocks for any "happy path" flow; must call real RPCs.
  - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`

- **Workflow mode/durability and cluster-table isolation**
  - Bake in: a `Workflow Topology Decision Record` (memory vs durable; single vs multi-node; table prefix).
  - Gate: if SQL-backed, prefix convention is documented and enforced in wiring.
  - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R2_EFFECT_WORKFLOW_CLUSTER_PATTERNS.md`

- **Multi-tenant isolation (orgId/RLS)**
  - Bake in: an `Isolation Model` section: org scoping on read and write paths; any prefixing strategy; test cases for cross-org leakage.
  - Gate: automated tests that create two orgs and prove no cross-org data appears in meeting prep.
  - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`

- **Production env var truth-source and mismatches**
  - Bake in: "Env Contract" template generated from `@beep/shared-env` schemas, not handwritten docs.
  - Gate: deployment docs and IaC vars must match schema names (no `AUTH_SECRET` drift).
  - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R5_IAC_OPS_PRODUCTION_PLAN.md`

- **Counting/measurement rules**
  - Bake in: "Counting Clarifications" section: what counts as an entity, mention, extraction, thread; what "ingested" means.
  - Gate: acceptance criteria reference these counts (prevents demo disputes).
  - Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R1_TOP_SPECS_5_OF_5_PATTERNS.md`

## Proposed Spec Outline (Exhaustive)

This is a content outline (not a phase plan). Keep each section short; enforce completeness via gates.

1. **Problem Statement**
   - WM meeting-prep pain, what is being automated, and why KG + provenance is required.
2. **Goals**
   - Demo goals (5-minute narrative) and production goals (hardening + scale posture).
3. **Non-Goals**
   - Explicit exclusions (calendar sync, multi-source entity resolution, dashboards, etc).
4. **Demo Narrative**
   - Step-by-step user story (Gmail thread -> extracted KG -> meeting prep output).
5. **Success Criteria**
   - Concrete, testable criteria for demo and for production hardening (include measurable counts).
6. **Open Questions**
   - Deployment targets, storage choice (S3 vs GCS), which apps ship, MCP service handling, workflow topology.
7. **Minimal Ontology (WM)**
   - Entities + relations + required fields, plus example instances derived from dataset.
8. **Data Model**
   - Tables involved: documents, extractions, entities, relations, mentions, mention records, embeddings; keys, org scoping, indexes (including pgvector).
9. **Ingestion + Document Materialization**
   - Gmail adapter inputs, idempotency keys, how Gmail IDs map to Document IDs, retention considerations.
10. **Extraction Pipeline**
   - Stages, failure handling, persistence steps, retry strategy, and idempotency.
11. **Graph Persistence + Provenance**
   - SQL as system-of-record; RDF store behavior (in-memory vs durable); how evidence spans are stored and retrieved.
12. **Embeddings + Retrieval**
   - When embeddings are computed, storage strategy, and retrieval API semantics.
13. **GraphRAG / Meeting Prep Query Semantics**
   - Seed lookup, traversal strategy, output schema, grounding rules, compliance-safe language rules.
14. **API / RPC Surface**
   - Required RPCs for demo and for ops (start extraction, list extractions, list ontologies, fetch provenance, meeting prep query).
15. **UI Surfaces**
   - Minimal UI path(s): Gmail thread view, extracted graph view, meeting prep view, evidence panel.
16. **Security + Compliance**
   - Evidence requirements, audit logging, retention, PII handling, no guarantees/no tax advice constraints, org isolation, scopes (gmail.readonly).
17. **Workflow Durability / Topology**
   - Memory vs durable; single vs multi-node; cluster table prefix convention; dependency ordering notes.
18. **Observability**
   - Logs/traces/metrics expectations; OTLP endpoints; SLOs for extraction latency and query correctness.
19. **IaC / Ops Plan**
   - Environments (dev/staging/prod), secrets strategy, migrations strategy, deploy topology, rollback.
20. **Validation Plan**
   - Automated tests + manual demo checklist, plus negative tests (cross-org leakage, missing evidence, disallowed language).
21. **Rollout Plan**
   - MVP demo rollout, internal pilot, compliance review checkpoint, and production readiness checklist.

## Phase Plan To Production (MVP Demo -> Hardening -> Scale) + IaC Gates

### Phase 0: MVP Demo (single household, pre-seeded data)
Deliverables:
- WM demo dataset (synthetic) and a repeatable ingest path.
- Gmail -> Document materialization.
- Extraction persistence to SQL (entities/relations/mentions) + embeddings.
- Minimal RPC surfaces for: run extraction, list graph, run meeting prep, fetch evidence.
- Minimal UI that uses real data (no mocks on the happy path).

Gates (demo-ready):
- End-to-end flow completes on the seeded dataset in < 5 minutes live.
- Meeting prep output is evidence-grounded (every bullet has a source link/span reference).
- No disallowed language ("guaranteed returns") in generated output; include disclaimer when recommendations appear.
- Organization scoping is applied to the demo org (no cross-org leakage in code paths).

Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R3_TODOX_WM_DEMO_PRD_DISTILLATION.md`, `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`

### Phase 1: Hardening (durability, idempotency, ops posture)
Deliverables:
- Extraction status persistence, error recording, retries, and idempotency keys (Gmail messageId/threadId).
- Durable storage decisions: persist RDF or derive RDF from SQL; persist ontology registry in durable storage.
- RLS/Org isolation enforced on all write paths (not just query filters).
- Observability: OTLP traces/logs/metrics; dashboard + alerts for extraction failures/latency.
- IaC baseline for a staging environment.

IaC gates:
- Terraform provisions: Postgres (pgvector), Redis, Cloud Run services, Secret Manager bindings.
- Secrets are injected via Secret Manager; no tfvars committed; env vars match `@beep/shared-env`.
- DB migrations run via a dedicated job (`bun run db:migrate`), not on app startup.
- CORS/`SECURITY_TRUSTED_ORIGINS` configured to only allow expected app domains.

Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R4_KNOWLEDGE_SLICE_GAPS_AND_TASKS.md`, `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R5_IAC_OPS_PRODUCTION_PLAN.md`

### Phase 2: Scale (multi-tenant, multi-node workflows, performance)
Deliverables:
- Decide multi-node workflow runner approach (avoid `SingleRunner` if multi-node is required).
- Explicit cluster table prefixing strategy for multi-service/shared DB environments.
- Performance work: batching, incremental extraction, pagination, vector index tuning, caching.
- Multi-tenant correctness: stronger isolation tests, audit export tooling, retention policies.

Scale gates:
- Load tests demonstrate stable extraction throughput and query latency within target bounds.
- Multi-tenant tests show no cross-tenant entity/mention leakage, including embeddings and provenance.
- Runbooks for incident response, rollback, and DR posture for Postgres/Redis.

Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R2_EFFECT_WORKFLOW_CLUSTER_PATTERNS.md`, `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R5_IAC_OPS_PRODUCTION_PLAN.md`

## 5-Minute Demo Script (Minimal) + Acceptance Criteria

Timebox assumes the WM synthetic dataset is already ingested and extracted.

Script:
1. **00:00-00:45 Context**
   - Show Gmail thread list filtered to a single household (e.g. "Thompson household").
2. **00:45-02:00 Extraction Result**
   - Open one email and show extracted entities (Client/Household/Account/LifeEvent/ActionItem).
   - Click an entity and show evidence span provenance (email id + excerpt).
3. **02:00-03:15 Graph View**
   - Show the household node and a 1-2 hop subgraph with typed relations (`ownsAccount`, `experiencedEvent`, `hasActionItem`).
4. **03:15-04:30 Meeting Prep**
   - Run: "Prepare me for the Thompson meeting on 2026-02-10".
   - Show structured briefing: summary, recent comms, open actions, and evidence links.
5. **04:30-05:00 Compliance Highlight**
   - Point to evidence links for each key claim.
   - Show the disclaimer/no-guarantees posture and that compliance-sensitive phrases are handled safely.

Acceptance criteria (demo pass/fail):
- Dataset contains: meeting date, account detail, life event, action item, and at least one compliance-sensitive phrase (synthetic is fine).
- The system can show: at least one Household, one Client, one Account, one LifeEvent, one ActionItem, plus typed edges linking them.
- Meeting prep output includes: summary, recent comms, open actions, and evidence references for each section.
- Evidence is inspectable from the UI for at least: one entity, one relation/claim, and one meeting-prep bullet.
- No cross-household/org data appears in any query path used in the demo.
- Output avoids guarantees and includes a compliance-safe disclaimer where applicable.

Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R3_TODOX_WM_DEMO_PRD_DISTILLATION.md`

## Spec-Quality Gates (From 5/5 Repo Patterns)

Apply these to this spec to avoid rework:
- Required structure completeness (outputs/templates/handoffs + reflection protocol).
- Scope boundaries repeated and enforced across files and phase handoffs.
- Open questions captured at P0 with explicit decisions per phase.
- Counting/measurement clarifications defined once and reused for acceptance checks.

Refs: `specs/pending/todox-wealth-mgmt-knowledge-mvp/outputs/R1_TOP_SPECS_5_OF_5_PATTERNS.md`
