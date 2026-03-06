# Vertical Slice

## Thesis
The first runnable slice must prove the `local-first sidecar architecture` and the `grounded repo-memory workflow` at the same time.

The slice is intentionally narrow:
- one user
- one desktop app
- one local sidecar
- one registered repo at a time in the main flow
- TypeScript-first deterministic ingestion
- repo question answering with visible citations and retrieval packet output

## First Runnable User Flow
The first runnable user flow is:
1. Launch the desktop app.
2. The shell starts the Bun sidecar and confirms health.
3. The user selects a local repo directory.
4. The sidecar registers that repo and persists it locally.
5. The user triggers indexing.
6. The sidecar indexes TypeScript sources deterministically and persists local repo-memory artifacts.
7. The user asks a question about the repo.
8. The sidecar produces a grounded answer, citations, and a retrieval packet.
9. The UI renders the answer, citations/evidence panel, and run progress history.

If this flow works reliably, `v0` has proven the right thing.

## Scope In
Lock these as `v0` scope:
- single-user local desktop prototype
- local repo registration and persistence
- TypeScript-first repo ingestion
- deterministic indexing flow
- grounded repo Q&A flow
- visible citations / evidence panel
- visible indexing and query progress stream
- enough ingestion/run metadata to anchor provenance and basic temporal identity
- local run artifact persistence sufficient for a simple run history panel

## Scope Out
Lock these as `v0` out of scope:
- auth / IAM
- multi-user collaboration
- cloud sync
- pages / workspaces as first-class product concepts
- email / calendar / settings BCs
- rich agent connector ecosystem beyond what the repo-memory Q&A flow requires
- multi-repo orchestration UX as a primary product surface
- full semantic-web / ontology machinery in the UI
- polished end-user product design beyond what a research prototype needs

## First UI Surface
The first UI must have exactly three core surfaces.

### 1. Sidecar and repo setup screen
Required capabilities:
- show sidecar health state
- let the user choose a local repo directory
- show registered repo metadata
- offer `Index` and `Refresh` actions
- show last indexed time if available

### 2. Query workspace
Required capabilities:
- ask a freeform question about the selected repo
- show live run progress while the query is executing
- show final answer text
- show failure state if the query run fails

### 3. Citations / evidence panel
Required capabilities:
- list citations from the retrieval packet
- show file path and line-span metadata
- show excerpt text and rationale
- let the user inspect exactly what grounded the answer

Nothing else is required for the first runnable UI.

## First Storage Needs
The v0 implementation must persist these local artifacts:
- repo registry entries
- local index artifacts for registered repos
- query/index run metadata
- retrieval packets for recent query runs
- enough diagnostic logs to debug sidecar start and run failures

It does not need to persist:
- user accounts
- shared workspaces
- collaboration state
- synchronized cloud copies

## First Ingestion Rules
The deterministic ingestion rules for `v0` are:
- primary target: TypeScript repos
- files in scope: `.ts`, `.tsx`, `.mts`, `.cts`
- exclude non-TypeScript code from the initial index
- the sidecar may use compiler-backed deterministic parsing and source-span extraction
- indexing output must support file-span and symbol-span citations

This keeps the prototype focused on the strongest proving ground.

## First Query Behavior
The query flow must do all of the following:
- run entirely through the sidecar protocol
- operate against locally persisted repo-memory artifacts
- produce a human-readable answer
- produce a retrieval packet
- produce span-backed citations
- surface progress through SSE

The query flow does not need to prove:
- broad autonomous agent execution
- tool use beyond repo-memory retrieval
- multi-step planning across domains

## First Prototype Story
The product story for `v0` is not:
- "a general AI desktop app"
- "a Notion replacement"
- "a local cloud clone"

The product story is:
- "a local native research prototype that can build expert memory for a TypeScript repo and answer grounded questions about it"

That framing should govern implementation choices.
