# Query Stages And Retrieval Packet

## Thesis
Repo expert-memory `v0` proves the Memory Kernel earlier than a full cross-domain `ClaimRecord` system.

The concrete proof for this slice is:
- deterministic repo artifacts
- evidence anchors and citations
- extraction lineage
- query-time explainability
- a frozen `RetrievalPacket`
- an answer rendered from that packet only

This document is the downstream authority for that contract.

## Why Repo-Memory `v0` Proves The Kernel At `Artifact-To-Packet`
The broad expert-memory direction still points toward `claim + evidence + provenance + time` as the likely reusable long-term center.

Repo-memory `v0` does not need to prove all of that at once.
It proves the kernel on a narrower but still meaningful path:
- index deterministic repo artifacts
- bind a question to a supported deterministic query shape
- retrieve bounded source-backed evidence
- freeze an inspectable packet
- render the final answer from that packet

That narrower proof is enough to validate:
- bounded answer construction
- packet inspectability
- citation discipline
- extraction provenance
- run-scoped explainability
- separation between retrieval truth and final rendering

## Canonical Query-Stage Vocabulary
Query runs use exactly four progress phases:
- `grounding`
- `retrieval`
- `packet`
- `answer`

Use them as follows:
- `grounding`: normalize the question and bind it to a supported deterministic query shape
- `retrieval`: read persisted repo artifacts and resolve the bounded evidence set
- `packet`: freeze the evidence-bearing retrieval packet, including packet notes and semantic overlay
- `answer`: render the user-facing answer from the packet only

These are progress stages, not new event kinds.
The durable result events remain:
- `RetrievalPacketMaterialized`
- `AnswerDrafted`

## Stage Contracts
### 1. `grounding`
Input:
- `QueryRepoRunInput`

Output:
- run-scoped `GroundingArtifact`

Allowed reads:
- none from repo stores

Responsibilities:
- normalize question text
- classify supported query kind
- extract and normalize handles such as symbol, file, module, or keyword queries
- attach concise grounding notes when normalization materially changes the request
- return explicit unsupported reasons when the question does not map to a supported deterministic query shape

Must not:
- inspect snapshots
- rank candidates
- inspect semantic artifacts
- assemble answer prose

### 2. `retrieval`
Input:
- `GroundingArtifact`

Output:
- run-scoped `RetrievedEvidence`

Allowed reads:
- latest persisted snapshot and repo-memory artifact stores

Responsibilities:
- bind the request to a concrete snapshot
- gather deterministic evidence
- resolve ambiguity or fail safe
- select bounded supporting citations
- produce a structured retrieval outcome

Must not:
- emit final answer prose
- reopen question normalization
- depend on packet-only rendering behavior

### 3. `packet`
Input:
- `RetrievedEvidence`

Output:
- durable `RetrievalPacket`

Allowed reads:
- semantic overlay artifacts and evidence anchors that are already snapshot-scoped and bounded

Responsibilities:
- freeze the normalized query, query kind, outcome, payload or issue, citations, and notes
- attach concise inspectable overlay and provenance notes
- produce the bounded evidence product consumed by the UI and answer renderer

Must not:
- reopen candidate selection
- change snapshot binding
- introduce unstated support

### 4. `answer`
Input:
- `RetrievalPacket`

Output:
- final grounded answer text

Allowed reads:
- packet only

Responsibilities:
- render the user-facing answer from packet content alone
- preserve packet citations exactly
- render unresolved outcomes safely

Must not:
- hit repo stores
- rerank candidates
- add new evidence
- add unstated claims

## `RetrievalPacket` Envelope Contract
`RetrievalPacket` is the bounded durable evidence product for query runs.

It must include:
- `repoId`
- `sourceSnapshotId`
- `query`
- `normalizedQuery`
- `queryKind`
- `retrievedAt`
- `outcome`
- `summary`
- `citations`
- `notes`
- `issue?`
- `payload?`

Rules:
- `payload` exists only when `outcome = resolved`
- `issue` exists only when `outcome = none | ambiguous | unsupported`
- packet children refer back to packet-level citations by `citationIds`
- `RetrievalPacketMaterialized` freezes the packet before `AnswerDrafted`
- the final answer must be derivable from packet content alone

`RetrievalPacket` is intentionally:
- smaller than raw snapshot or semantic dumps
- more inspectable than ad hoc answer prose
- concrete enough to drive UI inspection and answer rendering

## `RetrievalPayload` And `RetrievalIssue` Unions
### `RetrievalOutcome`
Use:
- `resolved`
- `none`
- `ambiguous`
- `unsupported`

### `RetrievalPayload`
Resolved packet payloads use these families:
- `count`
- `subject-detail`
- `relation-list`
- `search-results`

Recommended variant shapes:

`RetrievalCountPayload`
- `family = "count"`
- `target = "files" | "symbols"`
- `count`

`RetrievalSubjectDetailPayload`
- `family = "subject-detail"`
- `subject`
- `facets`

`RetrievalRelationListPayload`
- `family = "relation-list"`
- `relation`
- `subject`
- `items`

`RetrievalSearchResultsPayload`
- `family = "search-results"`
- `query`
- `items`

### `RetrievalIssue`
Non-resolved packets use these issue families:
- `no-match`
- `ambiguous`
- `unsupported`

Recommended variant shapes:

`RetrievalNoMatchIssue`
- `kind = "no-match"`
- `requested`
- `note`

`RetrievalAmbiguousIssue`
- `kind = "ambiguous"`
- `requested`
- `candidates`

`RetrievalUnsupportedIssue`
- `kind = "unsupported"`
- `requested`
- `reason`

## Helper Role Vocabulary
Use these role names consistently:
- `requested`
- `subject`
- `candidate`
- `item`
- `facet`

Meaning:
- `requested`: what the user asked for before resolution
- `subject`: the grounded file, symbol, or module the packet is about
- `candidate`: an alternative grounded target shown in ambiguous outcomes
- `item`: a renderable list element in a payload
- `facet`: one aspect of a grounded subject such as location, declaration, documentation, parameters, returns, throws, or deprecation

For `repo-memory`, keep the concrete variants repo-local:
- file
- symbol
- module
- location
- declaration
- documentation
- parameters
- returns
- throws
- deprecation

Do not extract these helper structs into a shared kernel package yet.
The reusable thing in `v0` is the role vocabulary and packet law, not a new cross-domain package.

## Mapping From Current Query Kinds To Payload Families
Current deterministic query kinds map as follows:

`count`
- `countFiles`
- `countSymbols`

`subject-detail`
- `locateSymbol`
- `describeSymbol`
- `symbolParams`
- `symbolReturns`
- `symbolThrows`
- `symbolDeprecation`

`relation-list`
- `listFileExports`
- `listFileImports`
- `listFileImporters`
- `listSymbolImporters`
- `listFileDependencies`
- `listFileDependents`

`search-results`
- `keywordSearch`

`unsupported`
- `unsupported`

Failure mapping rules:
- no exact grounded subject becomes `outcome = none` with a `RetrievalNoMatchIssue`
- multiple viable grounded subjects becomes `outcome = ambiguous` with a `RetrievalAmbiguousIssue`
- unsupported question shapes become `outcome = unsupported` with a `RetrievalUnsupportedIssue`

## Event And Projection Implications
The query-run event vocabulary stays:
- `RunAccepted`
- `RunStarted`
- `RunProgressUpdated`
- `RetrievalPacketMaterialized`
- `AnswerDrafted`
- terminal lifecycle events

The contract changes are:
- `RunProgressUpdated.phase` uses the canonical four-stage vocabulary
- `RetrievalPacketMaterialized` carries the frozen packet
- `AnswerDrafted` must be renderable from that packet alone
- replay plus projection must rebuild the same final packet and answer state

## UI And Read-Model Implications
The run detail view should treat the packet as a first-class inspection surface.

At minimum, query-run detail should show:
- normalized query
- query kind
- retrieval outcome
- structured payload or structured issue
- citations
- notes
- final answer

The answer panel is a rendering of packet state, not a second retrieval system.

## Non-Goals And Guardrails
This contract does not require:
- a cross-domain `ClaimRecord` package in `v0`
- RDF or semantic-web internals as the runtime source of truth
- freeform semantic repo chat
- durable NLP-derived mention, entity, relation, or claim state
- unbounded reasoning traces as the main answer surface

Guardrails:
- retrieval remains deterministic-first
- semantic overlay remains bounded and inspectable
- packet notes explain material normalization, ranking, or overlay behavior
- the answer stage may not add support or selection logic

## Open Questions Intentionally Deferred Past `v0`
- When should `GroundingArtifact` and `RetrievedEvidence` become durable explainability products instead of run-scoped internal artifacts?
- Which packet role names should extract into a shared kernel package once a second domain adapter exists?
- When should broader cross-domain `ClaimRecord` modeling take over from the repo `artifact-to-packet` proof?
