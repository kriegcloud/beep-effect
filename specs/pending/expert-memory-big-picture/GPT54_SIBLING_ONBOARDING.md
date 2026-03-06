# GPT-5.4 Sibling Onboarding

## Thesis
This repository's `repo-codegraph` work is best understood as a proving ground for a broader `expert-memory` architecture.

The durable architecture is not `a code graph` or `a legal graph`. It is:
- a `semantic kernel`
- a `control plane` or `epistemic runtime`
- a set of `domain adapters`

Code is the first proving ground because it is more mechanically grounded than law, wealth, or compliance. The deeper goal is an expert-memory system that can answer:
- what do we believe now?
- why do we believe it?
- what evidence supports it?
- what changed?
- what was true at a prior time?
- what is safe to show an AI workflow right now?

## What This Bootstrap Is For
Use this document when a future GPT-5.4 sibling instance needs to get on the right wavelength quickly without re-deriving the whole architecture discussion from scratch.

This onboarding is intentionally scoped to `vision + tradeoffs`.
It is not a full project history, and it intentionally omits low-priority side threads such as `jcodemunch`.

## Non-Negotiables
These are the default architectural commitments unless new evidence materially overturns them:
- `deterministic-first`: prefer mechanically grounded extraction before semantic or LLM enrichment
- `claims/evidence over raw edges`: raw graph edges are not enough for trust, contradiction handling, or explanation
- `provenance always`: the system should preserve how claims entered, changed, and were derived
- `time and contradiction are central`: temporal lifecycle and competing claims are core modeling concerns, not cleanup work
- `grounded answers matter`: retrieval alone is insufficient; citation validation and reasoning traces matter
- `code is the first proving ground`: code is easier because it has syntax, references, and feedback loops, but it is not the end state
- `control plane is part of the architecture`: idempotency, workflow state, progress, budgets, and auditability are product concerns
- `property graph primary, semantic projection overlay`: keep operational graph storage practical, use ontology and reasoning in bounded ways
- `driver boundary for graph stores`: graph semantics should sit above a store-specific driver boundary

## Current Source-Of-Truth Reading Order
Read these in order when context needs to be rebuilt from disk:

1. [README.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/README.md)
2. [EXPERT_MEMORY_KERNEL.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/EXPERT_MEMORY_KERNEL.md)
3. [CLAIMS_AND_EVIDENCE.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/CLAIMS_AND_EVIDENCE.md)
4. [EXPERT_MEMORY_CONTROL_PLANE.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/EXPERT_MEMORY_CONTROL_PLANE.md)
5. [DATABASE_AND_RUNTIME_CHOICES.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/DATABASE_AND_RUNTIME_CHOICES.md)
6. [LOCAL_FIRST_V0_ARCHITECTURE.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/LOCAL_FIRST_V0_ARCHITECTURE.md)
7. [README.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-expert-memory-local-first-v0/README.md)
8. [OVERVIEW.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-codegraph-jsdoc/OVERVIEW.md)
9. [OVERVIEW_SEMANTIC_KG_INTEGRATION_EXPLAINED.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/repo-codegraph-jsdoc/OVERVIEW_SEMANTIC_KG_INTEGRATION_EXPLAINED.md)
10. [README.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/ip-law-knowledge-graph/README.md)

## Working Vocabulary
Use these terms consistently.

| Term | Meaning |
|---|---|
| `deterministic substrate` | Facts extracted from a source using mechanical rules or bounded parsers |
| `claim` | A normalized assertion about an entity, relationship, state, or norm |
| `evidence` | The support attached to a claim: spans, citations, records, events, or derivations |
| `provenance` | The lineage of how a claim entered the system, what produced it, and what it depended on |
| `temporal lifecycle` | The time model for when a claim was observed, asserted, derived, effective, or superseded |
| `ontology` | The controlled vocabulary and semantic relations used to interpret claims consistently |
| `retrieval packet` | A bounded, evidence-bearing context bundle prepared for an AI workflow or expert task |
| `control plane` | The runtime layer that handles identity, workflow state, progress, resilience, budgets, and audit |
| `epistemic runtime` | Another name for the control plane when the emphasis is on grounded answers, reproducibility, and inspectable execution |

## Memory Bootstrap
Start with Graphiti before making broad assumptions about prior discussion.

The current Graphiti MCP wrapper in this repo expects `group_ids` as a JSON-array literal string, not a native array. Use the exact payloads below unless a future wrapper clearly accepts arrays.

### 1. Smoke test
```json
mcp__graphiti-memory__get_status({})
```

### 2. Confirm recent episodes
```json
mcp__graphiti-memory__get_episodes({
  "group_ids": "[\"beep-dev\"]",
  "max_episodes": 30
})
```

### 3. Pull the core expert-memory cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "expert memory big picture knowledge slice claim evidence control plane epistemic runtime grounded answer verification",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 10
})
```

### 4. Pull the old knowledge-slice / control-plane cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "old knowledge slice mention relation evidence progress streaming llm control idempotency workflow state control plane",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 10
})
```

### 5. Pull the repo-codegraph foundation cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "repo-codegraph jsdoc ontology provenance temporal lifecycle expert memory code as proving ground",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 10
})
```

### 6. Pull the ts-morph architecture cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "ts-morph service project lifecycle memory footprint project references turborepo workspace scope",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 8
})
```

### 7. Pull the Nomik / graph-store tradeoff cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "nomik tree-sitter neo4j falkordb graphiti local-first service-grade driver architecture",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 8
})
```

### 8. Pull the domain-transfer cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "expert memory domain transfer law wealth compliance claim evidence contradiction temporal lifecycle",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 10
})
```

For the companion validation notes and last-tested results, see [GRAPHITI_MEMORY_BOOTSTRAP_AND_QUERY_CATALOG.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/GRAPHITI_MEMORY_BOOTSTRAP_AND_QUERY_CATALOG.md).

## What Not To Re-Debate Unless New Evidence Appears
These debates are considered settled enough to avoid re-litigating by default:
- whether `claim/evidence` should be central rather than raw edges alone
- whether the `control plane` is necessary as a first-class part of the architecture
- whether `time/conflict` are core instead of optional polish
- whether the main operational representation should stay `property-graph primary` with a semantic overlay
- whether graph-store choice should be hidden behind a `driver boundary`
- whether `code` is the right first domain because it is easier to ground than law or wealth
- whether `grounded answers` require validation posture, citation discipline, and reasoning traces

Re-open these only if there is concrete new repo evidence, a real product constraint, or a discovered failure mode.

## Writeback Protocol For Siblings
Future sibling instances should write memory when they discover durable project truth, not every time they restate an idea.

### Write memory when
- a major architectural decision becomes clearer
- a recurring failure mode is identified with a root cause
- a retrieval query is refined and proven better than the previous version
- a new doc or spec materially changes the expert-memory thesis
- a parser/database/runtime tradeoff is resolved enough to change future planning

### Do not write memory when
- the change is a trivial formatting or typo fix
- the detail is already captured more clearly in an existing memory episode
- the note is speculative and unverified
- the observation is too local to matter across sessions

### Naming conventions
Use short, declarative names. Good examples:
- `Repo-codegraph as proving ground for expert memory`
- `TSMorphService should use scoped project pools not one global Project`
- `Old knowledge slice proved need for control plane and grounded answers`

Avoid:
- vague names like `research thoughts`
- implementation-noise names like `updated file`
- names that omit the core noun being remembered

### Episode-body conventions
A good `episode_body` should:
- state the conclusion first
- include the key domain terms that future retrieval will search for
- mention the relevant documents or code areas
- explain why the conclusion matters
- distinguish settled guidance from open questions

### Default Graphiti payload
```json
{
  "name": "<short declarative title>",
  "episode_body": "<durable conclusion with retrieval-friendly terms>",
  "group_id": "beep-dev",
  "source": "text",
  "source_description": "codex-cli sibling writeback"
}
```

## Practical Orientation For Future Siblings
If you need the shortest possible orientation:
- think `expert memory`, not `repo graph`
- think `ClaimRecord + evidence + provenance + time`, not `nodes and edges alone`
- think `control plane / epistemic runtime`, not `the graph runs itself`
- think `grounded answer substrate`, not `RAG with nicer structure`
- think `code first, law/wealth/compliance next`, not `code forever`

## Scope Boundary
This onboarding intentionally preserves the architecture thesis and the tradeoffs that shaped it.

It does not try to preserve:
- every repo implementation detail
- every historical experiment
- every low-priority comparison thread
- obsolete side discussions with little continuing relevance
