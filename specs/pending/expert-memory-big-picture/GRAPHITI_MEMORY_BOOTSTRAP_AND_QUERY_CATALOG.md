# Graphiti Memory Bootstrap And Query Catalog

## Purpose
This document is the operational companion to [GPT54_SIBLING_ONBOARDING.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/GPT54_SIBLING_ONBOARDING.md).

It records:
- the tested Graphiti query shapes for this repo
- the curated `beep-dev` memory bundle for future sibling chats
- the exact tool inputs that worked in this session
- the validation notes for each bootstrap query
- the intentionally excluded low-priority branches

## Graphiti Smoke Test
Use this exact call first:

```json
mcp__graphiti-memory__get_status({})
```

Last validated: `2026-03-06`

Observed result in this session:
- status: `ok`
- message: `Graphiti MCP server is running and connected to falkordb database`

## group_ids Rule For This Environment
Exact working tool input for this session:

```json
"[\"beep-dev\"]"
```

Plain string input failed in this session:

```json
"beep-dev"
```

Observed failure:
- validation error requiring `group_ids` to be a valid list

Use these forms in order:
1. `group_ids: "[\"beep-dev\"]"`
2. if a future wrapper exposes `group_ids` as a native array, `group_ids: ["beep-dev"]` is the equivalent logical value

## Curated Memory Episode Inventory
These are the intended durable episodes for future sibling recall.

| Episode name | Purpose | Required terms in `episode_body` | Primary retrieval query |
|---|---|---|---|
| `Repo-codegraph as proving ground for expert memory` | Preserve the core thesis | `repo-codegraph`, `expert memory`, `proving ground`, `deterministic-first`, `code as first domain` | repo-codegraph foundation cluster |
| `Expert-memory kernel centers on claims evidence provenance and time` | Preserve the semantic kernel vocabulary | `claim`, `evidence`, `provenance`, `temporal lifecycle`, `retrieval packet`, `semantic kernel` | core expert-memory cluster |
| `Old knowledge slice proved need for control plane and grounded answers` | Preserve the historical lesson from the v3 knowledge slice | `knowledge slice`, `control plane`, `epistemic runtime`, `citation validation`, `reasoning traces`, `grounded answers` | old knowledge-slice / control-plane cluster |
| `ClaimRecord is the likely durable abstraction above raw edges` | Preserve claim-first modeling guidance | `ClaimRecord`, `mention record`, `relation evidence`, `supersession`, `conflict`, `evidence-of-record` | core expert-memory cluster |
| `Time and contradiction are central not polish` | Preserve temporal/conflict modeling stance | `bitemporal`, `assertedAt`, `derivedAt`, `effectiveAt`, `supersededAt`, `what did we know when` | domain-transfer cluster and core cluster |
| `TSMorphService should use scoped project pools not one global Project` | Preserve ts-morph lifecycle and memory-footprint guidance | `TSMorphService`, `ts-morph`, `Project lifecycle`, `memory footprint`, `project references`, `workspace scope`, `LRU`, `TTL` | ts-morph cluster |
| `Nomik uses tree-sitter because it is polyglot and extraction-first` | Preserve why Nomik chose tree-sitter rather than ts-morph | `Nomik`, `tree-sitter`, `polyglot`, `extraction-oriented`, `Neo4j`, `ts-morph`, `different problem` | Nomik / graph-store cluster |
| `Graph store choice depends on product shape and needs a driver boundary` | Preserve the FalkorDB vs Neo4j vs driver-boundary tradeoff | `FalkorDB`, `Neo4j`, `driver boundary`, `local-first`, `service-grade`, `Graphiti`, `not native temporal magic` | Nomik / graph-store cluster |
| `Code generalizes to law wealth and compliance through the expert-memory stack` | Preserve the cross-domain transfer thesis | `law`, `wealth`, `compliance`, `domain adapters`, `identity`, `normativity`, `contradiction`, `time` | domain-transfer cluster |

## Exact Graphiti Tool Inputs
### Smoke test
```json
mcp__graphiti-memory__get_status({})
```

### Recent episode scan
```json
mcp__graphiti-memory__get_episodes({
  "group_ids": "[\"beep-dev\"]",
  "max_episodes": 30
})
```

### Core expert-memory cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "expert memory big picture knowledge slice claim evidence control plane epistemic runtime grounded answer verification",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 10
})
```

### Old knowledge-slice / control-plane cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "old knowledge slice mention relation evidence progress streaming llm control idempotency workflow state control plane",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 10
})
```

### Repo-codegraph foundation cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "repo-codegraph jsdoc ontology provenance temporal lifecycle expert memory code as proving ground",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 10
})
```

### TSMorphService cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "ts-morph service project lifecycle memory footprint project references turborepo workspace scope",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 8
})
```

### Nomik / graph-store tradeoff cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "nomik tree-sitter neo4j falkordb graphiti local-first service-grade driver architecture",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 8
})
```

### Domain-transfer cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "expert memory domain transfer law wealth compliance claim evidence contradiction temporal lifecycle",
  "group_ids": "[\"beep-dev\"]",
  "max_facts": 10
})
```

## Query Validation Log
Validation date: `2026-03-06`

Transport note:
- all passing calls in this session used `group_ids: "[\"beep-dev\"]"`
- plain `group_ids: "beep-dev"` failed validation

### 1. Core expert-memory cluster
Status: `PASS`

Observed top hits included:
- expert-memory-big-picture adds grounded-answer concerns
- expert-memory-big-picture includes citation validation as a grounded-answer concern
- expert-memory-big-picture includes reasoning traces as a grounded-answer concern
- expert-memory-big-picture clarifies the control plane is cross-cutting
- expert-memory-big-picture includes lessons from the old knowledge slice

Assessment:
- strongly on-topic
- low noise in top results
- good bootstrap query for the overall thesis

### 2. Old knowledge-slice / control-plane cluster
Status: `PASS`

Observed top hits included:
- the old slice built an execution and trust control plane
- the old slice implemented immutable mention evidence records
- the old slice implemented immutable relation evidence records
- the old slice provided bounded reasoning with provenance
- workflow-state docs flag a replay race
- workflow-state docs recommend workflow return value as source of truth

Assessment:
- strongly on-topic
- reliably retrieves the operational lesson from the v3 slice
- good bootstrap query for control-plane and evidence history

### 3. Repo-codegraph foundation cluster
Status: `PASS`

Observed top hits included:
- repo-codegraph is framed as a proving ground for expert memory
- repo-codegraph is converging on a general trust stack for AI knowledge systems
- semantic integration docs define temporal provenance contracts
- repo-codegraph overview includes inference/provenance contract concepts

Assessment:
- on-topic
- slightly more mixed than the core expert-memory cluster, but still reliable
- good bridge from repo-codegraph to the larger thesis

### 4. TSMorphService cluster
Status: `PASS`

Observed top hits included:
- `TSMorphService` memoizes ts-morph `Project` instances
- ts-morph `Project` instances are memoized in a `Map` keyed by `ProjectCacheKey`
- `TSMorphService` keeps an internal scope registry
- `TSMorphService` uses scoped ts-morph project loading from tsconfig references

Assessment:
- strongly on-topic
- reliable for future parser/runtime planning
- low noise in top results

### 5. Nomik / graph-store tradeoff cluster
Status: `PASS`

Observed top hits included:
- Nomik uses `tree-sitter` for parsing
- Nomik uses `neo4j-driver`
- Nomik uses direct Cypher queries
- Nomik bootstraps schema with Neo4j constraint/index syntax and APOC procedures
- FalkorDB is recommended only for explicitly local-first embedded shapes
- FalkorDB is built on Redis

Assessment:
- strongly on-topic
- good cluster for parser choice and graph-store tradeoffs

### 6. Domain-transfer cluster
Status: `PASS`

Observed top hits included:
- the expert-memory kernel includes claim/evidence records
- documentation covers application to wealth
- expert-memory-big-picture includes reasoning traces as a grounded-answer concern
- expert-memory-big-picture describes temporal lifecycle as a core component
- the general trust stack includes evidence-bearing claims

Assessment:
- on-topic, but broader than the other queries
- still acceptable for sibling bootstrap because it pulls the right cross-domain ideas
- use after the core expert-memory cluster, not before it

## Episode Visibility Caveat
Observed behavior in this session:
- newly written memories began surfacing through `search_memory_facts` before `get_episodes` clearly exposed all new episode names in the returned slice
- treat successful fact retrieval as the stronger confirmation that indexing is live
- use `get_episodes` as a convenience check, not the only write-validation signal

## Memory Writeback Template
Use this payload shape when writing sibling-bootstrap memories:

```json
{
  "name": "<episode name>",
  "episode_body": "<durable conclusion with retrieval-friendly terms>",
  "group_id": "beep-dev",
  "source": "text",
  "source_description": "codex-cli expert-memory sibling bootstrap"
}
```

## Exclusions
These are intentionally omitted from the sibling bootstrap set:
- low-priority historical branches with little continuing leverage
- broad repo implementation churn not needed for the expert-memory thesis
- obsolete side threads such as `jcodemunch`

The goal is not to preserve everything. The goal is to preserve the architectural wavelength.
