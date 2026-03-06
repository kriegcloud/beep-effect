# Evaluation And Acceptance

## Thesis
The `v0` research prototype should be accepted based on whether it proves the local-first repo-memory workflow with grounded answers, not on whether it looks like a finished product.

The acceptance bar is prototype-grade but concrete.

## Primary Benchmark Repo
Use this repository as the first benchmark repo for evaluation:
- `/home/elpresidank/YeeBois/projects/beep-effect3`

This keeps the first evaluation grounded in a repo the team already understands.

## Canonical Question Set
The prototype must be evaluated against this canonical repo-memory question set.

1. `Where is the CLI entrypoint for the repo tooling command runner?`
   - Expected grounding area: `tooling/cli/src/bin.ts`

2. `Where is the Graphiti proxy command implemented?`
   - Expected grounding area: `tooling/cli/src/commands/Graphiti/index.ts`

3. `Which modules implement the Graphiti proxy runtime behavior?`
   - Expected grounding area: `tooling/cli/src/commands/Graphiti/internal/ProxyRuntime.ts`, `ProxyServices.ts`, `ProxyConfig.ts`

4. `Where is the version-sync command defined?`
   - Expected grounding area: `tooling/cli/src/commands/VersionSync/index.ts`

5. `Where is workspace discovery logic implemented?`
   - Expected grounding area: `tooling/repo-utils/src/Workspaces.ts`

6. `Which module builds the topological sort of workspace packages?`
   - Expected grounding area: `tooling/cli/src/commands/TopoSort.ts`

7. `Where do the repo utilities define dependency indexing helpers?`
   - Expected grounding area: `tooling/repo-utils/src/DependencyIndex.ts`, `Dependencies.ts`

8. `Where is the current ts-morph service model located in repo-utils?`
   - Expected grounding area: `tooling/repo-utils/src/TSMorph/TSMorph.service.ts`, `TSMorph.model.ts`

These questions are intentionally concrete. They test whether the prototype can answer real repo-structure questions with valid citations.

## Required Evaluation Checks
### 1. Sidecar launch and reconnect
The prototype passes this category if:
- desktop app launches sidecar and reaches healthy state without manual terminal work
- if the sidecar exits unexpectedly, the desktop app detects it and can restart it without full app relaunch
- restart preserves the ability to re-list registered repos from local state

### 2. Repo registration and indexing
The prototype passes this category if:
- a local repo can be registered from the desktop UI
- a full index run can be started from the UI
- the index run produces progress events
- the index run produces local persisted artifacts usable by later queries

### 3. Grounded query behavior
The prototype passes this category if:
- each canonical query returns a final answer
- the final answer includes at least one valid citation for repo-grounded claims
- the citations point to real file spans
- the retrieval packet is inspectable in the UI

### 4. Citation validity
A citation is valid only if:
- file path exists in the indexed repo
- line span is inside file bounds
- excerpt text matches the cited source span closely enough for manual inspection
- the rationale is consistent with why the citation was used

### 5. Index freshness after local change
The prototype passes this category if:
- a TypeScript source file is edited locally
- a refresh index run is triggered
- a previously asked question that depends on the changed file reflects the updated source after refresh
- stale citations do not remain as the only grounding after refresh

## Acceptance Thresholds
The research prototype is acceptable when all of the following are true:
- sidecar launch/reconnect checks pass
- repo registration and indexing checks pass
- at least `7/8` canonical questions return a grounded final answer
- at least `7/8` canonical questions include one or more valid citations
- at least `6/8` canonical questions return an answer that a human evaluator judges to be materially consistent with the cited spans
- the retrieval packet is visible and inspectable for every completed query run
- the freshness check after a local file change passes once end-to-end

These thresholds are intentionally prototype-grade. They are strong enough to validate the architecture without pretending the system is product-complete.

## What Does Not Block Acceptance
These issues do not block `v0` acceptance by themselves:
- rough or minimal desktop styling
- manual refresh button instead of live file watching
- limited query polish
- incomplete run history UX
- narrow support outside TypeScript repos

## What Does Block Acceptance
These failures do block `v0` acceptance:
- sidecar cannot be launched reliably from the shell
- grounded answers routinely appear without valid citations
- desktop UI bypasses the sidecar protocol for business behavior
- repo changes cannot be reflected after a manual refresh cycle
- the prototype only works by relying on hidden implementation knowledge instead of persisted repo-memory artifacts
