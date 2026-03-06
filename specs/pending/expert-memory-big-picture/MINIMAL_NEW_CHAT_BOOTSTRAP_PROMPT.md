# Minimal New-Chat Bootstrap Prompt

## Usage
Copy and paste the block below into a new chat session when you want a sibling instance to get oriented quickly without reading the full discussion history first.

## Copy/Paste Prompt
```text
Work from the expert-memory architecture already established in this repo. Do not treat this as a generic repo-graph discussion.

Before making broad recommendations:

1. Read these files in order:
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/README.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/EXPERT_MEMORY_KERNEL.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/CLAIMS_AND_EVIDENCE.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/EXPERT_MEMORY_CONTROL_PLANE.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/LOCAL_FIRST_V0_ARCHITECTURE.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-expert-memory-local-first-v0/README.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-expert-memory-local-first-v0/CLUSTER_FIRST_SUBSTRATE_DECISION.md
   - /home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-expert-memory-local-first-v0/HTTPAPI_RPC_PIVOT.md

2. Query Graphiti memory with:
   mcp__graphiti-memory__get_status({})

   mcp__graphiti-memory__search_memory_facts({
     "query": "expert memory big picture knowledge slice claim evidence control plane epistemic runtime grounded answer verification",
     "group_ids": ["beep-dev"],
     "max_facts": 10
   })

   mcp__graphiti-memory__search_memory_facts({
     "query": "cluster-first runtime substrate ClusterWorkflowEngine HttpApi Rpc EventJournal sqlite-bun HTTPAPI RPC pivot",
     "group_ids": ["beep-dev"],
     "max_facts": 10
   })

3. Use these defaults unless new evidence clearly overturns them:
   - repo-codegraph is a proving ground for a broader expert-memory system
   - the real architecture is semantic kernel + control plane / epistemic runtime + domain adapters
   - deterministic-first beats enrichment-first
   - claim/evidence/provenance/time are central, not optional polish
   - grounded answers matter more than retrieval alone
   - property graph remains the primary operational representation, with semantic projection as an overlay
   - graph-store choice sits behind a driver boundary
   - the product shape is local-first native shell + Bun sidecar
   - the repo expert-memory v0 runtime is cluster-first: workflow semantic model, cluster durable substrate, HttpApi control plane, Rpc execution plane, EventJournal audit/projection input, sqlite-bun local SQL provider
   - public run-start uses custom RPCs that return runId; generated workflow discard RPCs are internal/supporting because they do not return runId
   - current repo QA is bounded and source-grounded for supported query classes only; it is not freeform semantic repo chat
   - supporting tests default to @effect/vitest and may use Node-backed layers; real same-port sidecar lifecycle is proven with spawned Bun subprocess tests
   - schema JSON codecs are used even in tests and fixtures; avoid native JSON helpers
   - keep FileSystem/Path/SqlClient requirements in layers and services, not public method signatures
   - ts-morph is an index-time extractor only, scoped per workspace / tsconfig and released when the workflow step completes
   - the paused reduced HttpApi rewrite remains superseded

4. Briefly summarize your understanding before proposing a new direction. Preserve the architecture thesis and tradeoffs instead of re-debating them from scratch.
```
