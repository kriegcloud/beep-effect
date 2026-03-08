# Graphiti Memory Bootstrap And Query Catalog

## Thesis
Graphiti memory should preserve the durable architecture thread for later runs, not every implementation detail.

The bootstrap set now needs to preserve two layers of truth:
- the broad expert-memory thesis
- the concrete cluster-first repo expert-memory `v0` decision

## Smoke Test
Use:
```json
mcp__graphiti-memory__get_status({})
```

## Canonical `group_ids` Shape
The safest payload rule for this repo is:

- if the wrapper exposes `group_ids` as a string, pass `"[\"beep-dev\"]"`
- if it accepts native arrays, pass `["beep-dev"]`

If a future wrapper behaves differently, document the exact transport quirk rather than silently changing the query catalog.

## Memory Episodes To Preserve
| Episode name | Purpose | Required terms |
|---|---|---|
| `Repo-codegraph as proving ground for expert memory` | Preserve the core thesis | `repo-codegraph`, `expert memory`, `proving ground`, `deterministic-first`, `code as first domain` |
| `Expert-memory kernel centers on claims evidence provenance and time` | Preserve the semantic-kernel vocabulary | `claim`, `evidence`, `provenance`, `temporal lifecycle`, `retrieval packet`, `semantic kernel` |
| `Old knowledge slice proved need for control plane and grounded answers` | Preserve the v3 knowledge-slice lesson | `knowledge slice`, `control plane`, `epistemic runtime`, `citation validation`, `reasoning traces`, `grounded answers` |
| `ClaimRecord is the likely durable abstraction above raw edges` | Preserve claim-first modeling guidance | `ClaimRecord`, `mention record`, `relation evidence`, `supersession`, `conflict`, `evidence-of-record` |
| `Time and contradiction are central not polish` | Preserve temporal/conflict modeling stance | `bitemporal`, `assertedAt`, `derivedAt`, `effectiveAt`, `supersededAt`, `what did we know when` |
| `TSMorphService should use scoped project pools not one global Project` | Preserve ts-morph lifecycle guidance | `TSMorphService`, `ts-morph`, `Project lifecycle`, `memory footprint`, `project references`, `workspace scope`, `LRU`, `TTL` |
| `Nomik uses tree-sitter because it is polyglot and extraction-first` | Preserve why Nomik chose tree-sitter | `Nomik`, `tree-sitter`, `polyglot`, `extraction-oriented`, `Neo4j`, `ts-morph`, `different problem` |
| `Graph store choice depends on product shape and needs a driver boundary` | Preserve FalkorDB vs Neo4j guidance | `FalkorDB`, `Neo4j`, `driver boundary`, `local-first`, `service-grade`, `Graphiti`, `not native temporal magic` |
| `Code generalizes to law wealth and compliance through the expert-memory stack` | Preserve the domain-transfer thesis | `law`, `wealth`, `compliance`, `domain adapters`, `identity`, `normativity`, `contradiction`, `time` |
| `Cluster-first runtime substrate replaces custom local workflow engine for repo expert memory` | Preserve the current v0 runtime decision | `cluster-first`, `ClusterWorkflowEngine`, `HttpApi`, `Rpc`, `EventJournal`, `sqlite-bun`, `HTTPAPI RPC pivot`, `paused HttpApi rewrite`, `custom start RPC`, `runId` |

## Primary Queries
### Core expert-memory cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "expert memory big picture knowledge slice claim evidence control plane epistemic runtime grounded answer verification",
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

### Old knowledge-slice / control-plane cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "old knowledge slice mention relation evidence progress streaming llm control idempotency workflow state control plane",
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
  "group_ids": ["beep-dev"],
  "max_facts": 10
})
```

### Cluster-first runtime cluster
```json
mcp__graphiti-memory__search_memory_facts({
  "query": "cluster-first runtime substrate ClusterWorkflowEngine HttpApi Rpc EventJournal sqlite-bun HTTPAPI RPC pivot custom start RPC runId WorkflowProxy discard",
  "group_ids": ["beep-dev"],
  "max_facts": 10
})
```

## Validation Notes
The important validation criterion is topical retrieval quality, not perfect episode listing immediacy.

Use `search_memory_facts` as the main confidence signal.
If `get_episodes` lags behind new writes, do not treat that as proof the memory write failed.

## Exclusions
The bootstrap set intentionally excludes low-priority historical branches that no longer affect the architecture direction.

## Questions Worth Keeping Open
- Should the cluster-first runtime query be split into two narrower queries if it starts to pull in unrelated transport noise?
- When a major runtime decision changes, should the old memory be superseded by a new episode or explicitly contradicted by a later episode body?
