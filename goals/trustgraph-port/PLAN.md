# TrustGraph V1 Phase Plan

## Plan Shape

This plan keeps later work subordinate to the Phase 1 kernel proof. No later phase is allowed to widen the platform before the previous phase has produced a stable deterministic retrieval surface.

## Phase 1: Kernel Vertical Slice

### Objective

Port the narrow TrustGraph kernel that `beep-effect` actually needs right now:

- explicit curated document library
- explicit curated document processing queue
- atomic curated corpus revision promotion
- existing repo-native artifact indexing
- one deterministic mixed-corpus retrieval packet
- one narrow MCP read tool that returns answer plus packet

### Required modules or services

- `packages/repo-memory/model`
  - curated document record and version models
  - curated processing entry models
  - doc-section model and `docSectionId`
  - `docCorpusRevisionId`
  - packet deltas for mixed-corpus provenance and time fields
  - `questionSearch`
  - `RetrievalNotReadyIssue`
  - `search-results` truncation metadata
  - `Citation.corpusKind`
- `packages/repo-memory/store`
  - `RepoCuratedDocumentStore`
  - `RepoCuratedProcessingStore`
- `packages/repo-memory/sqlite`
  - tables and transactions for curated documents, versions, sections, corpus revisions, processing entries, and processing events
- `packages/repo-memory/runtime`
  - curated document discovery service
  - curated document processing service
  - corpus revision promotion service
  - mixed-corpus query orchestration
  - query preparation extension for `questionSearch`
  - deterministic answer renderer updates
- MCP boundary module at runtime or tooling edge
  - one read tool with input `repoId` and `question`
- CLI or internal control-plane triggers
  - explicit repo index trigger
  - explicit curated-doc ingest trigger
  - status and audit inspection surfaces

### Dependencies

- existing repo registry, snapshot, symbol, run, and semantic store contracts
- existing SQLite repo-memory substrate
- existing repo-native TypeScript indexing and grounded retrieval
- `@beep/observability` profiling and structured failure surfaces
- fixed curated-doc allowlist rules derived from repo-owned paths

### Acceptance criteria

- A repo can promote a latest successful code snapshot through the existing repo-native index flow.
- A repo can promote a latest successful curated-doc corpus revision through the new internal document-library and processing flow.
- Curated-doc ingest fails closed at the revision boundary and does not replace the previous successful revision on partial failure.
- Query freezes one code snapshot and one curated-doc corpus revision at start time.
- Exact code queries remain repo-only.
- `keywordSearch` and `questionSearch` can retrieve from repo, curated docs, or both.
- Mixed-corpus search results remain one deterministic scoreless ranked list.
- Missing required corpus readiness returns a bounded success packet with `not-ready` issue instead of an MCP error.
- The MCP tool returns rendered answer, citations, and full packet, with no execution ID in the public result.
- No model call exists anywhere on the query-to-answer path.

### Intentionally deferred

- claim and evidence objects
- vector retrieval
- broader file formats or arbitrary local document ingestion
- public lifecycle APIs for curated-doc ingest
- sidecar, desktop, or distributed deployment surfaces
- contradiction management

## Phase 2: Claim And Evidence Overlay

### Objective

Introduce first-class claim and evidence modeling on top of the stable Phase 1 packet without weakening the deterministic grounded retrieval path.

### Required modules or services

- claim and evidence schema layer
- evidence projection from packet citations and selected revision metadata
- optional semantic validation or reconciliation jobs
- packet-to-claim audit linkage

### Dependencies

- stable packet shape from Phase 1
- stable curated-doc section identities
- selected revision time fields and warning posture
- optional semantic store boundary

### Acceptance criteria

- Claims can be derived from Phase 1 packet evidence without changing the Phase 1 MCP contract.
- Evidence objects reference repo or curated-doc citations explicitly.
- Claims carry temporal posture that distinguishes query time from selected revision time.
- The system still answers valid queries when no claim layer is available.

### Intentionally deferred

- deep contradiction-management lifecycle
- autonomous inference loops
- graph-first query products

## Phase 3: Broader Ingestion And Semantic Validation

### Objective

Broaden the curated corpus and strengthen semantic validation only after the deterministic kernel is proven stable.

### Required modules or services

- richer curated corpus selection policy if Phase 1 fixed allowlist proves too rigid
- stronger document normalization or format support if justified by repo needs
- optional semantic validation jobs over curated and repo evidence
- optional richer provenance exports

### Dependencies

- stable Phase 1 ingest and retrieval metrics
- observed operational pain from the fixed curated-doc allowlist
- evidence that broader ingestion materially improves grounded retrieval

### Acceptance criteria

- Any broader ingestion still preserves repo ownership, auditability, and deterministic packet truth.
- Any semantic validation remains non-blocking unless explicitly promoted to a new product contract.
- Broader ingestion does not backslide into general document-platform sprawl.

### Intentionally deferred

- full TrustGraph parity
- generalized collection-management platform
- multi-backend or distributed deployment
- agent runtime and prompt-serving services

## Implementation Order Inside Phase 1

1. Extend schemas and packet contracts.
2. Add curated document and curated processing store contracts.
3. Implement SQLite durability for curated docs, sections, revisions, and processing state.
4. Add curated document discovery and deterministic sectioning runtime services.
5. Add atomic corpus revision promotion.
6. Extend query preparation and packet assembly for mixed-corpus retrieval.
7. Add the narrow MCP read tool and explicit maintenance triggers.
8. Validate acceptance criteria and freeze the Phase 1 truth surface before any Phase 2 work starts.

## Guardrails

- Do not widen the public surface beyond one MCP read tool during Phase 1.
- Do not introduce model inference on the query path.
- Do not convert repo-native code indexing into a generic document-pipeline problem.
- Do not let later phases redefine the success criteria of Phase 1.
