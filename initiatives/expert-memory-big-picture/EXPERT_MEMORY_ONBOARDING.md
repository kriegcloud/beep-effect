# Expert-Memory Onboarding

## Thesis
This repo's `repo-codegraph` work is a proving ground for a broader `expert-memory` architecture.

The durable architecture is:
- a `semantic kernel`
- a `control plane` or `epistemic runtime`
- a set of `domain adapters`

For the concrete repo expert-memory `v0`, the runtime shape is now also locked:
- local-first native shell
- Bun + Effect sidecar
- `cluster-first` durable runtime substrate
- `workflow` as semantic run model
- `HttpApi` control plane
- `Rpc` execution plane
- `EventJournal` audit/projection input
- `@effect/sql-sqlite-bun` as the local SQL provider
- custom public start RPCs because generated workflow discard RPCs do not return `runId`
- bounded source-grounded repo answers for supported query classes
- `ts-morph` used only at index time, scoped per workspace / `tsconfig`
- `@effect/vitest` for supporting tests and spawned Bun subprocess tests for real lifecycle proof
- schema JSON codecs are required even in tests and fixtures; avoid native `JSON.parse` / `JSON.stringify`
- keep `FileSystem`, `Path`, and `SqlClient` inside layers/services rather than leaking them into public helper signatures
- repo-memory `v0` proves the kernel at `artifact-to-packet` before a full `ClaimRecord` implementation
- extraction provenance and query-time explainability should stay explicit and separable

## Non-Negotiables
Unless new evidence materially overturns them, keep these defaults:
- `deterministic-first`
- `claims/evidence over raw edges`
- `provenance always`
- `time and contradiction are central`
- `grounded answers matter`
- `control plane is part of the architecture`
- `property graph primary, semantic projection overlay`
- `driver boundary for graph stores`
- `cluster-first substrate for repo expert-memory v0`
- `code` is the first proving ground, not the final domain

## Current Source-Of-Truth Reading Order
1. [README.md](./README.md)
2. [EXPERT_MEMORY_KERNEL.md](./EXPERT_MEMORY_KERNEL.md)
3. [CLAIMS_AND_EVIDENCE.md](./CLAIMS_AND_EVIDENCE.md)
4. [EXPERT_MEMORY_CONTROL_PLANE.md](./EXPERT_MEMORY_CONTROL_PLANE.md)
5. [DATABASE_AND_RUNTIME_CHOICES.md](./DATABASE_AND_RUNTIME_CHOICES.md)
6. [LOCAL_FIRST_V0_ARCHITECTURE.md](./LOCAL_FIRST_V0_ARCHITECTURE.md)
7. [README.md](../repo-expert-memory-local-first-v0/README.md)
8. [QUERY_STAGES_AND_RETRIEVAL_PACKET.md](../repo-expert-memory-local-first-v0/QUERY_STAGES_AND_RETRIEVAL_PACKET.md)
9. [CLUSTER_FIRST_SUBSTRATE_DECISION.md](../repo-expert-memory-local-first-v0/CLUSTER_FIRST_SUBSTRATE_DECISION.md)
10. [history/httpapi-rpc-pivot.md](../repo-expert-memory-local-first-v0/history/httpapi-rpc-pivot.md)
11. [history/cluster-first-repo-expert-memory-plan.md](../repo-expert-memory-local-first-v0/history/cluster-first-repo-expert-memory-plan.md)
12. [SPEC.md](../repo-codegraph-jsdoc/SPEC.md)
13. [semantic-kg-integration-explained.md](../repo-codegraph-jsdoc/research/semantic-kg-integration-explained.md)
14. [README.md](../ip-law-knowledge-graph/README.md)

## Working Vocabulary
Keep these stable:
- `deterministic substrate`
- `claim`
- `evidence`
- `provenance`
- `temporal lifecycle`
- `ontology`
- `retrieval packet`
- `control plane`
- `epistemic runtime`
- `cluster-first runtime substrate`
- `run accepted ack`
- `spawned Bun lifecycle test`

## Memory Bootstrap
Use Graphiti before making broad assumptions.

### Smoke test
```json
mcp__graphiti-memory__get_status({})
```

### Core expert-memory cluster
If the MCP wrapper expects `group_ids` as a string, pass `"[\"beep_dev\"]"`. If it accepts arrays, pass `["beep_dev"]`.

```json
mcp__graphiti-memory__search_memory_facts({
  "query": "expert memory big picture knowledge slice claim evidence control plane epistemic runtime grounded answer verification",
  "group_ids": "[\"beep_dev\"]",
  "max_facts": 10
})
```

### Old knowledge-slice / control-plane cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "old knowledge slice mention relation evidence progress streaming llm control idempotency workflow state control plane",
  "group_ids": "[\"beep_dev\"]",
  "max_facts": 10
})
```

### Repo-codegraph foundation cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "repo-codegraph jsdoc ontology provenance temporal lifecycle expert memory code as proving ground",
  "group_ids": "[\"beep_dev\"]",
  "max_facts": 10
})
```

### Cluster-first runtime cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "cluster-first runtime substrate ClusterWorkflowEngine HttpApi Rpc EventJournal sqlite-bun HTTPAPI RPC pivot",
  "group_ids": "[\"beep_dev\"]",
  "max_facts": 10
})
```

For the companion notes and last-tested query catalog, see [GRAPHITI_MEMORY_BOOTSTRAP_AND_QUERY_CATALOG.md](./GRAPHITI_MEMORY_BOOTSTRAP_AND_QUERY_CATALOG.md).

## What Not To Re-Debate Unless New Evidence Appears
Do not reopen these by default:
- claim/evidence centrality
- control plane necessity
- time/conflict centrality
- property-graph primary plus semantic overlay
- graph-store driver boundary
- local-first sidecar as the right product shape
- `cluster-first` as the repo expert-memory v0 substrate
- the paused reduced `HttpApi` rewrite remaining superseded
- generated workflow discard RPCs not being sufficient as the public run-start surface

## Writeback Protocol
Write memory when a conclusion changes future planning or implementation.

Good writeback topics:
- runtime substrate decisions
- parser/provider/database tradeoffs that changed the architecture
- lifecycle or finalizer lessons from implementation
- test harness decisions that preserve runtime honesty
- query catalog improvements that materially improve retrieval quality
- new docs that replace prior source-of-truth guidance

Default payload:
```json
{
  "name": "<short declarative title>",
  "episode_body": "<durable conclusion with retrieval-friendly terms>",
  "group_id": "beep_dev",
  "source": "text",
  "source_description": "codex-cli run writeback"
}
```

## Practical Orientation
The fastest correct mental model is:
- think `expert memory`, not `repo graph`
- think `artifact -> packet` as the current repo proof and `claim + evidence + provenance + time` as the broader destination, not edge soup
- think `control plane / epistemic runtime`, not graph romanticism
- think `grounded answer substrate`, not generic RAG
- think `local-first sidecar`, not browser-first SaaS
- think `cluster-backed workflow runtime`, not ad hoc run fibers
- think `bounded deterministic repo QA`, not freeform semantic repo chat
- think `Node-backed supporting tests + Bun subprocess lifecycle tests`, not one harness pretending to cover both concerns
