# GPT-5.4 Sibling Onboarding

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
1. [README.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/README.md)
2. [EXPERT_MEMORY_KERNEL.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/EXPERT_MEMORY_KERNEL.md)
3. [CLAIMS_AND_EVIDENCE.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/CLAIMS_AND_EVIDENCE.md)
4. [EXPERT_MEMORY_CONTROL_PLANE.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/EXPERT_MEMORY_CONTROL_PLANE.md)
5. [DATABASE_AND_RUNTIME_CHOICES.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/DATABASE_AND_RUNTIME_CHOICES.md)
6. [LOCAL_FIRST_V0_ARCHITECTURE.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/LOCAL_FIRST_V0_ARCHITECTURE.md)
7. [README.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-expert-memory-local-first-v0/README.md)
8. [CLUSTER_FIRST_SUBSTRATE_DECISION.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-expert-memory-local-first-v0/CLUSTER_FIRST_SUBSTRATE_DECISION.md)
9. [HTTPAPI_RPC_PIVOT.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-expert-memory-local-first-v0/HTTPAPI_RPC_PIVOT.md)
10. [CLUSTER_FIRST_REPO_EXPERT_MEMORY_PLAN.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-expert-memory-local-first-v0/CLUSTER_FIRST_REPO_EXPERT_MEMORY_PLAN.md)
11. [OVERVIEW.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-codegraph-jsdoc/OVERVIEW.md)
12. [OVERVIEW_SEMANTIC_KG_INTEGRATION_EXPLAINED.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-codegraph-jsdoc/OVERVIEW_SEMANTIC_KG_INTEGRATION_EXPLAINED.md)
13. [README.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/ip-law-knowledge-graph/README.md)

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

## Memory Bootstrap
Use Graphiti before making broad assumptions.

### Smoke test
```json
mcp__graphiti-memory__get_status({})
```

### Core expert-memory cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "expert memory big picture knowledge slice claim evidence control plane epistemic runtime grounded answer verification",
  "group_ids": ["beep-dev"],
  "max_facts": 10
})
```

### Old knowledge-slice / control-plane cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "old knowledge slice mention relation evidence progress streaming llm control idempotency workflow state control plane",
  "group_ids": ["beep-dev"],
  "max_facts": 10
})
```

### Repo-codegraph foundation cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "repo-codegraph jsdoc ontology provenance temporal lifecycle expert memory code as proving ground",
  "group_ids": ["beep-dev"],
  "max_facts": 10
})
```

### Cluster-first runtime cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "cluster-first runtime substrate ClusterWorkflowEngine HttpApi Rpc EventJournal sqlite-bun HTTPAPI RPC pivot",
  "group_ids": ["beep-dev"],
  "max_facts": 10
})
```

For the companion notes and last-tested query catalog, see [GRAPHITI_MEMORY_BOOTSTRAP_AND_QUERY_CATALOG.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/GRAPHITI_MEMORY_BOOTSTRAP_AND_QUERY_CATALOG.md).

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

## Writeback Protocol For Siblings
Write memory when a conclusion changes future planning or implementation.

Good writeback topics:
- runtime substrate decisions
- parser/provider/database tradeoffs that changed the architecture
- lifecycle or finalizer lessons from implementation
- query catalog improvements that materially improve retrieval quality
- new docs that replace prior source-of-truth guidance

Default payload:
```json
{
  "name": "<short declarative title>",
  "episode_body": "<durable conclusion with retrieval-friendly terms>",
  "group_id": "beep-dev",
  "source": "text",
  "source_description": "codex-cli sibling writeback"
}
```

## Practical Orientation
The fastest correct mental model is:
- think `expert memory`, not `repo graph`
- think `claim + evidence + provenance + time`, not edge soup
- think `control plane / epistemic runtime`, not graph romanticism
- think `grounded answer substrate`, not generic RAG
- think `local-first sidecar`, not browser-first SaaS
- think `cluster-backed workflow runtime`, not ad hoc run fibers
