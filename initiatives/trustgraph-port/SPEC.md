# TrustGraph Port V1 Kernel Spec

## Status

Pending spec for a selective TrustGraph capability port into `beep-effect`.

## Purpose

This spec defines the narrowest viable Phase 1 port of TrustGraph capabilities into `beep-effect`.

The target is not the current `repo-memory` application as a product shell, and it is not TrustGraph's deployment topology. The target is a selective kernel port of the TrustGraph capability chain that matters for `beep-effect` now:

- curated document library
- asynchronous document processing
- repo-native artifact indexing
- bounded grounded retrieval packet
- deterministic MCP-consumable answer

The first adopted workflow surface remains `repo-memory retrieval`, but it sits on top of a narrower TrustGraph-style kernel instead of defining the port itself.

## Facts, Assumptions, Design

### Source-grounded facts

- Local TrustGraph integration in [TrustGraphRuntime.ts](/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/TrustGraph/internal/TrustGraphRuntime.ts) already depends on TrustGraph-style capabilities such as `get_documents`, `load_document`, `get_processing`, `add_processing`, `document-rag`, and `graph_rag`.
- Existing `beep-effect` repo-memory code already proves packet-first grounded retrieval, deterministic query classification, line-backed citations, typed run lifecycle, and SQLite-backed durability in [GroundedRetrieval.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/repo-memory/runtime/src/retrieval/GroundedRetrieval.ts), [RepoMemoryRuntime.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/repo-memory/runtime/src/internal/RepoMemoryRuntime.ts), [RunStateMachine.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/repo-memory/runtime/src/run/RunStateMachine.ts), and [RepoMemorySqlLive.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/repo-memory/sqlite/src/RepoMemorySqlLive.ts).
- Existing repo-memory package topology already follows an explicit `model` / `store` / `sqlite` / `runtime` split, with store contracts exported from [index.ts](/home/elpresidank/YeeBois/projects/beep-effect/packages/repo-memory/store/src/index.ts).
- The expert-memory control-plane docs explicitly treat identity, workflow state, progress, budgets, partial results, and auditability as architectural concerns in [EXPERT_MEMORY_CONTROL_PLANE.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/expert-memory-big-picture/EXPERT_MEMORY_CONTROL_PLANE.md).
- TrustGraph itself keeps document metadata distinct from processing metadata in [librarian.py](/home/elpresidank/YeeBois/dev/trustgraph/trustgraph-flow/trustgraph/librarian/librarian.py), and its document load API is explicitly asynchronous in [document-load.yaml](/home/elpresidank/YeeBois/dev/trustgraph/specs/api/paths/flow/document-load.yaml).

### Assumptions and defaults used

- Phase 1 is `single-node service first`.
- All structured durable state is `SQLite-first`.
- Curated docs are a fixed repo-owned allowlist of checked-in Markdown or text files rooted under the registered repo.
- Repository artifacts are indexed through the existing code-native lane and are not converted into document-library records.
- Curated docs are ported through a TrustGraph-style internal `document library -> processing queue -> corpus revision` chain.
- Query is strictly read-only.
- Maintenance work such as repo indexing and curated-doc ingest is explicit internal or CLI-triggered work.
- The narrow MCP surface exposes one read tool only.
- No model call is allowed on the query-to-answer path in Phase 1.
- Semantic state is optional, non-gating, and subordinate to grounded retrieval.

### Proposed design

- Reuse `beep-effect` package topology and laws.
- Port a minimal internal TrustGraph-style curated-document kernel into the existing `packages/repo-memory/*` family.
- Keep repository indexing on its existing stronger code-native path.
- Freeze one code snapshot and one curated-doc corpus revision at query start.
- Assemble one bounded `RetrievalPacket` that remains the durable truth surface.
- Return one MCP success payload containing the rendered answer, citations, and full packet.

## Why This Is A Capability Port, Not An Architecture Port

The v1 slice ports TrustGraph capabilities, not TrustGraph topology.

What is adopted from TrustGraph:

- explicit curated document library records
- explicit processing queue semantics
- asynchronous ingest before retrieval
- retrieval over promoted processed corpus state

What is adapted into `beep-effect` patterns:

- Effect v4 services and layers
- schema-first model definitions
- explicit store contracts
- one SQLite-backed durability service
- grounded retrieval packets
- file-line citations
- repo-scoped workflow identity

What is intentionally not ported:

- TrustGraph gateway and flow service topology
- Cassandra and object-store assumptions
- vector-store-backed document retrieval
- generic collection-management product surfaces
- agent runtime, prompt serving, or general MCP tool execution

This is a selective kernel port because `beep-effect` already has stronger repo-native retrieval primitives than TrustGraph for code artifacts. TrustGraph contributes the missing document-library and processing-kernel behaviors. `beep-effect` contributes the stronger packet, citation, and deterministic query discipline.

## V1 Requirements

- Phase 1 must prove one end-to-end vertical slice: explicit ingest or index, deterministic retrieval packet, deterministic MCP-consumable answer.
- V1 inputs are limited to repository artifacts plus curated repo-rooted Markdown or text files.
- Repository artifacts and curated docs must stay separate durable artifact families.
- Curated docs must flow through an internal document-library and processing boundary.
- Curated-doc ingest must be atomic at the promoted corpus-revision boundary.
- Repo index and curated-doc ingest must be separate idempotent workflows.
- Query must freeze selected revisions at start.
- Query must support exact code-oriented requests plus bounded search-style and question-style requests.
- Exact code-oriented requests must resolve from repo artifacts only.
- Search-style and question-style requests may blend repo and curated-doc evidence, with repo evidence ranked ahead when both directly match.
- Mixed-corpus results must remain one deterministic ranked list with no numeric scoring surface.
- Query outcomes such as `none`, `ambiguous`, `unsupported`, and `not-ready` must remain bounded success results, not tool failures.
- The MCP facade must remain narrow: input `repoId` and `question`; output rendered answer, citations, and full packet.
- Workflow identity, progress, budgets, and audit must remain internal control-plane surfaces.

## Explicit Non-Goals

- full TrustGraph feature parity
- architecture mimicry of TrustGraph services or storage
- agent runtime or ReAct orchestration
- text completion or prompt-serving services
- generalized MCP tool execution
- broad document library or arbitrary local file ingestion
- vector embeddings or semantic similarity search in Phase 1
- rich ontology reasoning
- contradiction management as first-class state
- distributed deployment
- public workflow lifecycle APIs for curated-doc ingest in Phase 1
- desktop UI, Tauri shell, or sidecar transport obligations

## Slice Topology

### Package topology

| Package or edge | Proposed responsibility |
| --- | --- |
| `packages/repo-memory/model` | Extend the internal domain with curated-document library records, curated-document processing records, doc sections, corpus revisions, and retrieval-packet deltas needed for mixed-corpus deterministic retrieval. |
| `packages/repo-memory/store` | Add explicit store contracts for curated-document durability and curated-processing durability. |
| `packages/repo-memory/sqlite` | Implement curated-document and curated-processing tables inside the existing repo-memory SQLite service and transaction boundary. |
| `packages/repo-memory/runtime` | Add the internal curated-document library, processing, corpus revision, and mixed-corpus retrieval orchestration services. Extend existing query preparation and packet assembly. |
| `tooling/cli` | Keep explicit maintenance triggers and repo-local operational helpers. |
| MCP edge at runtime or tooling boundary | Expose one narrow read tool backed by the internal runtime services. This edge should wrap the same internal services and must not widen into a workflow API. |

### Proposed internal store boundaries

| Store contract | Responsibility |
| --- | --- |
| `RepoCuratedDocumentStore` | Curated document records, document versions, section artifacts, corpus revision manifests, promoted latest revision pointers. |
| `RepoCuratedProcessingStore` | Curated document processing entries, deterministic execution identity, state transitions, progress events, failure metadata, promotion attempts. |
| Existing repo-memory stores | Repo registry, repo runs, repo snapshots, repo symbols, optional semantic artifacts. |

### Proposed runtime services

| Runtime service | Responsibility |
| --- | --- |
| `CuratedDocumentLibraryService` | Discover repo-rooted curated docs from fixed allowlist, normalize raw file input into document records and document versions. |
| `CuratedDocumentProcessingService` | Run deterministic sectioning and `search_text` preparation for changed curated docs, persist processing state, and prepare corpus revision candidates. |
| `CuratedCorpusRevisionService` | Assemble and atomically promote one `docCorpusRevisionId` from the selected successful processed documents. |
| `TrustGraphPortQueryService` | Select frozen revisions, fan out repo and curated-doc retrieval, merge results deterministically, and build the final packet. |
| Existing query preparation and retrieval services | Continue to own exact repo query classification, repo-native retrieval, and packet rendering. |

### Durable artifacts and identifiers

| Artifact | Identity posture |
| --- | --- |
| `RepoSourceSnapshot` | Existing repo snapshot identity remains authoritative for code artifacts. |
| `CuratedDocumentRecord` | Stable document identity scoped to repo plus relative path. |
| `CuratedDocumentVersion` | Deterministic identity derived from document identity plus normalized content hash. |
| `CuratedDocumentSection` | Deterministic revision-scoped `docSectionId` derived from document version plus heading span. |
| `DocCorpusRevision` | Deterministic identity derived from the ordered set of selected curated document versions. |
| Query execution | Deterministic internal execution identity derived from repo, workflow kind, input fingerprint, and selected frozen revisions. |

## Model Deltas Required For Phase 1

### Retrieval query kinds

- Preserve existing exact repo-oriented kinds.
- Keep `keywordSearch`.
- Add `questionSearch` for bounded repo-context questions such as architecture, conventions, workflow, policy, and "where should I look?" prompts.
- Keep overly broad, subjective, or synthesis-heavy requests as `unsupported`.

### Retrieval issues and outcomes

- Keep the existing top-level bounded outcome set.
- Add `RetrievalNotReadyIssue` with `kind = "not-ready"`.
- Model missing required corpus readiness as `outcome = none` plus `not-ready` issue, not as a tool failure.

### Retrieval packet extensions

The Phase 1 packet must add first-class mixed-corpus provenance and temporal posture:

- `docCorpusRevisionId`
- `selectedSourceSnapshotCapturedAt`
- `selectedSourceSnapshotPromotedAt`
- `selectedDocCorpusRevisionCreatedAt`
- `selectedDocCorpusRevisionPromotedAt`

The packet must keep `retrievedAt` for query execution time and use notes for concise warnings such as:

- corpus staleness detected
- cross-corpus mismatch warning
- ranking rationale
- partial-result disclosure

### Citation extensions

`Citation` must add `corpusKind = "repo" | "curated-doc"`.

Curated-doc citations must point to full heading-bounded section spans backed by real file lines.

### Search-results payload extensions

`RetrievalSearchResultsPayload` must add:

- `returnedCount`
- `totalMatchCount`
- `truncated`

The payload must remain scoreless. Ordering is the public truth surface, not numeric relevance metadata.

### New retrieval item or subject kind

Add one new grounded `doc-section` item or subject family carrying:

- `docSectionId`
- `relativePath`
- `headingPath`
- `previewText`

`previewText` is a rendering aid only. The evidence anchor remains the full section citation span.

## Minimum Control-Plane Contract

### Workflows

Phase 1 requires three internal workflow shapes:

| Workflow | External posture | Mutating | Notes |
| --- | --- | --- | --- |
| `repoIndex` | internal or existing control-plane surface | yes | Builds repo-native snapshot and retrieval artifacts. |
| `curatedDocIngest` | internal or CLI-triggered only | yes | Loads curated docs into internal document library, processes them, and promotes one corpus revision. |
| `knowledgeQuery` | narrow MCP read tool backed by internal runtime | no | Freezes selected revisions, assembles packet, renders answer. |

### Execution identity

- Every workflow execution must have deterministic internal identity.
- Identity inputs must include repo scope, workflow kind, input fingerprint, and selected revision identity where applicable.
- The MCP surface must not expose execution identity directly in Phase 1.

### Workflow state

Every workflow must support at least:

- `accepted`
- `running`
- `completed`
- `failed`

Curated-doc ingest and repo index remain explicit write-side workflows.

### Progress events

Progress events are required and must be typed. At minimum:

| Workflow | Required progress stages |
| --- | --- |
| `repoIndex` | fingerprint, snapshot, symbol or module extraction, optional semantic enrichment, promote |
| `curatedDocIngest` | discover, load document records, queue processing, section documents, assemble revision, promote |
| `knowledgeQuery` | classify, select frozen revisions, retrieve repo, retrieve curated docs, merge, packet, render |

### Partial-result semantics

- Exact code-oriented queries require a code snapshot and return `not-ready` if no code snapshot exists.
- Search-style and `questionSearch` queries may return results from whichever eligible corpora are ready.
- If one corpus is missing, the packet must say so explicitly.
- If current filesystem state has drifted past the selected revisions, the packet must still answer from the frozen revisions and record a staleness note.

### Budgets and timeouts

- Budgets and timeouts are internal control-plane policy, not caller input.
- Phase 1 ships one fixed default budget policy per workflow.
- Policy must be persisted in workflow state sufficiently to explain later why a run timed out or was cut short.
- Query budgets govern retrieval and rendering work only; they do not govern model inference because no model inference is allowed on the Phase 1 query path.

### Audit surface

The audit surface must preserve:

- execution identity
- workflow input fingerprint
- selected revision identities and timestamps
- typed stage transitions
- warnings such as mismatch and staleness
- timeout or failure cause
- final retrieval packet for query workflows

This audit surface remains internal or CLI-facing in Phase 1.

## V1 Data Flows

### Repo artifact indexing flow

1. Resolve repo identity and source fingerprint.
2. Build a new repo snapshot using the existing repo-native indexing path.
3. Persist snapshot-scoped artifacts such as files, modules, symbols, and search text.
4. Run semantic enrichment only as best-effort optional overlay.
5. Promote the successful snapshot as the latest readable code revision for later queries.

### Curated document ingest flow

1. Resolve the fixed repo-owned allowlist of curated paths.
2. Read each repo-rooted file and normalize it into a curated document record and document version.
3. Create or update internal processing entries for changed or newly discovered document versions.
4. Deterministically section Markdown or text by heading and file-line boundaries.
5. Persist section artifacts with heading path, preview text, normalized `search_text`, and full citation span.
6. Assemble one `docCorpusRevisionId` from the selected processed document versions.
7. Promote the new corpus revision atomically only if the revision is complete.
8. If any selected curated document fails to read, normalize, or section, reject the new revision and keep the previous successful revision active.

### Query flow

1. Accept input `repoId` plus `question`.
2. Classify into exact repo query, `keywordSearch`, `questionSearch`, or `unsupported`.
3. Freeze the latest successful code snapshot and latest successful curated-doc corpus revision at query start.
4. Determine which corpus families are eligible or required for the chosen query kind.
5. Return a bounded `not-ready` packet if a required corpus is unavailable.
6. Retrieve repo results and curated-doc results concurrently when both are eligible.
7. Keep exact repo queries repo-only.
8. Interleave mixed-corpus search results into one deterministic ranked list with repo precedence when both directly match.
9. Build one bounded packet carrying citations, notes, selected revision identities, selected revision timestamps, and any staleness or mismatch disclosures.
10. Render the final answer deterministically from that packet alone.

## Storage Boundaries

| Boundary | Examples | Rules |
| --- | --- | --- |
| Artifact state | repo snapshots, symbols, curated documents, document versions, document sections, corpus revisions | This is the retrieval substrate and must stay deterministic and replayable. |
| Workflow state | repo index runs, query runs, curated-doc processing entries, stage transitions, budget policy, failure metadata | This records how work happened and must stay separate from semantic meaning. |
| Semantic state | optional semantic overlays, provenance triples, claim-ready material for later phases | Non-gating in Phase 1 and never required to answer a valid query. |
| Audit state | append-only workflow events, stored packets, warnings, failure causes | Keeps product truth about what happened without polluting the semantic layer. |

All of these boundaries may share one SQLite database in Phase 1, but they must remain separate at the store-contract and table-family level.

## Observability And Concurrency

### Observability expectations

- Use existing `@beep/observability` profiling and structured diagnostics patterns.
- Emit stage-level spans and timing for all three workflows.
- Record counters and failure surfaces for:
  - repo index success or failure
  - curated-doc ingest success or failure
  - corpus promotion success or failure
  - query `not-ready` outcomes
  - query `unsupported` outcomes
  - staleness warnings
  - cross-corpus mismatch warnings
- Keep failure reporting typed and structured.

### Concurrency expectations

- Enforce per-repo single-writer serialization for mutating workflows.
- Allow concurrent query work over frozen revisions.
- Allow within-run parallel document normalization or section preparation only if final promotion remains atomic and deterministic.
- Never let a query auto-trigger indexing or ingest.
- Never let two mutating workflows race to advance the same repo's promoted latest state.

## Phase 1 Decision-Complete Acceptance Surface

Phase 1 is implementation-ready when all of the following are true:

- A repo can build and promote a repo-native code snapshot through the existing indexing lane.
- A repo can discover the fixed curated-doc allowlist, create internal document-library records, process changed docs, and promote one atomic `docCorpusRevisionId`.
- The curated-doc kernel is explicitly modeled as internal document-library state plus internal processing state.
- Query freezes selected revisions at start and records those identities and timestamps in the packet.
- Exact code-oriented queries stay repo-only.
- `keywordSearch` and `questionSearch` can retrieve from repo, curated docs, or both.
- Mixed-corpus ranked results remain one deterministic scoreless list with truncation metadata.
- Missing required corpus readiness returns a bounded success packet with `not-ready` issue.
- Repo-versus-doc disagreement appears as a warning note, not a contradiction workflow.
- The MCP facade exposes one read tool whose input is only `repoId` and `question`.
- The MCP success payload contains the rendered answer, packet-level citations, and the full packet.
- MCP tool failures are reserved for real execution faults such as invalid input, timeout, storage failure, or internal runtime error.
- No model call exists on the query-to-answer path.

## Remaining Risks And Open Questions

- Packet schema churn risk is real because Phase 1 adds mixed-corpus provenance, time fields, a new issue kind, a new query kind, and payload truncation metadata at once.
- The cleanest placement of the narrow MCP adapter is still a packaging choice. The required contract is clear, but implementation can reasonably land at a runtime edge or tooling edge.
- Curated-doc section quality depends on the heading-and-line parser being predictable across the chosen allowlist. That is acceptable for Phase 1, but it needs disciplined file-selection rules.
- Cross-corpus drift warnings are intentionally lightweight in Phase 1. If curated docs become more normative later, claim and evidence modeling will need to absorb more of that truth burden.

## Summary

Phase 1 ports a narrow TrustGraph kernel into `beep-effect` by adding an internal curated-document library and processing queue, not by copying TrustGraph's architecture and not by redefining `repo-memory` as the source of truth for the port. The resulting system remains repo-first, SQLite-first, packet-first, and deterministic, while finally gaining the missing TrustGraph-style document ingest and retrieval discipline needed for curated repo knowledge.
