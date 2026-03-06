# Evaluation And Acceptance

## Thesis
This prototype should be judged by whether it proves the `expert-memory runtime shape`, not by whether it looks feature-complete.

That means acceptance needs to cover:
- grounded repo answers
- durable run lifecycle
- restart/reconnect behavior
- inspectable retrieval packets and citations
- clean local-first operational behavior

## Canonical Question Set
The prototype needs a fixed question set against `beep-effect3` so regressions are visible.

At minimum, include questions like:
- where is the Graphiti proxy command implemented?
- where is the local sidecar runtime configured?
- what package defines the repo-memory protocol contracts?
- where is the desktop shell wired to the sidecar?
- where are workflow or run lifecycle decisions recorded in specs?

## Acceptance Checks
### 1. Repo registration
- register `beep-effect3`
- repo is durable across sidecar restart
- repo list remains consistent after restart

### 2. Index workflow lifecycle
- start an index workflow and receive a deterministic `runId`
- observe accepted, running, and terminal state
- verify the final run detail is durable after restart
- verify interruption/resume behavior is possible without corrupting run state

### 3. Query workflow lifecycle
- start a query workflow and receive a deterministic `runId`
- stream progress through `StreamRunEvents`
- verify disconnect does not kill the underlying run
- reconnect from cursor and receive missing events cleanly
- verify final run detail remains inspectable after completion

### 4. Grounded answer quality
- final answer must correspond to the repo question
- citations must point to real file spans or symbol-backed spans
- retrieval packet must be visible and bounded
- unsupported confidence should not be presented as certainty

### 5. Projection integrity
- `GET /runs` and `GET /runs/:runId` must reflect durable run state
- final retrieval packet and final answer must match the run event history
- replay after restart must rebuild the same projection state

### 6. Local operational behavior
- sidecar launches cleanly from the shell
- sidecar shuts down cleanly on signal
- no leaked long-lived resources after shutdown
- SQLite-backed runtime comes back without corrupting run history

### 7. Type and spec discipline
- touched packages must pass typecheck
- the spec set must not still recommend the superseded `HTTP + SSE` run model
- the spec set must not still recommend a custom local workflow engine

## Prototype-Grade, Not SLA-Grade
This is still a research prototype.

It does not need:
- hosted-service SLAs
- horizontal scale
- polished team collaboration flows
- production observability depth

It does need:
- correctness in the lifecycle model
- clarity in the transport model
- inspectability in the answer model

## Questions Worth Keeping Open
- What is the smallest restart/resume test that proves the cluster/workflow substrate is really earning its place?
- At what point should evaluation add latency targets instead of only correctness and inspectability?
