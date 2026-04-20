# Database and Runtime Choices

## Thesis
Database choice matters, but less than modeling discipline. The larger system should be designed so that storage decisions remain swappable behind a graph-driver boundary, while the core semantics of claims, evidence, provenance, temporal lifecycle, retrieval, and execution control remain stable above that layer.

## Current Repo Reality
The current repo pressure points are mixed:
- repo-codegraph thinking already leans toward FalkorDB for local-first graph work
- Nomik demonstrates a Neo4j-style graph service with direct Cypher and APOC-heavy query patterns
- recent exploration in this repository has raised the possibility of a driver-based architecture rather than a one-store commitment

The older `knowledge` slice adds another important lesson:
- one serious system may use more than one persistence shape
- graph storage, operational state, audit, and retrieval infrastructure do not all have to live in the same database
- some outputs are better treated as files or object artifacts than as rows or graph nodes

## Strongly Supported Pattern
The strongest practical move is:
- define a graph driver boundary
- keep the expert-memory semantics above the store
- separate graph persistence from operational control-plane persistence where useful
- let storage choice be driven by product shape, operational model, and query compatibility

## Exploratory Direction
A likely durable architecture is:
- local-first driver for sidecar use and experimentation
- service-grade driver for hosted or shared graph use
- optional hybrid persistence where control-plane state lives in relational or file-backed systems while graph content lives in a graph store
- retrieval and semantic layers isolated from store-specific query tricks as much as practical

## Important Correction: The FalkorDB Temporal Story
A useful nuance from current research:
- FalkorDB docs around Graphiti describe `temporally-aware knowledge graphs` and `tracking temporal changes`
- that is a Graphiti-style modeling layer built on top of FalkorDB
- it should not be treated as proof that FalkorDB itself solves temporal lifecycle modeling for you

Reference points:
- [Graphiti on FalkorDB](https://docs.falkordb.com/agentic-memory/graphiti.html)
- [Graphiti MCP Server](https://docs.falkordb.com/agentic-memory/graphiti-mcp-server.html)

The conclusion is straightforward: temporal capability should be treated as a schema and lifecycle design concern above the database.

## One System, Multiple Persistence Planes
The older `knowledge` slice is a reminder that not every concern belongs in the graph database.

A practical expert-memory system may need these distinct planes:

| Plane | Typical contents | Likely store shape | Old-slice analogue |
|---|---|---|---|
| `Graph plane` | entities, claims, semantic relations, provenance links | graph database | RDF or graph outputs |
| `Operational plane` | workflow state, idempotency records, execution metadata | relational or workflow persistence | PostgreSQL-backed workflow state |
| `Vector plane` | embeddings and similarity indexes | vector-capable store or extension | embedding subsystem and indexes |
| `Artifact plane` | large outputs, source documents, serialized graphs, debug bundles, timelines | filesystem or object store | `output/runs/*` results plus `metadata.json` audit trail |

That pattern is often healthier than forcing all runtime concerns into one graph store.

The older persistence summary is useful here because it made a very practical distinction:
- result artifacts can be file or object backed
- audit can travel with those artifacts
- control-plane durability can still live elsewhere

That is a strong argument against collapsing everything into a single graph just because the domain has graph-shaped semantics.

## Store Comparison
| Dimension | FalkorDB | Neo4j | Driver-Based Posture |
|---|---|---|---|
| Local-first dev story | strong | moderate | strongest if multiple drivers exist |
| Embedded TypeScript story | strong via FalkorDBLite | weak | depends on chosen local driver |
| Hosted / managed path | weaker | strong via Aura and mature ecosystem | depends on service driver |
| Cypher compatibility | openCypher subset | strongest for Neo4j-style features | abstraction can reduce lock-in but not erase it |
| APOC / advanced procedures | limited | strong | should be treated as optional capabilities |
| Operational maturity | good for certain shapes | high | depends on implementation quality |
| Licensing considerations | must be reviewed carefully for hosted product shapes | generally clearer for mainstream hosted use | still inherits each backend's license |
| Fit for sidecar tool | excellent candidate | less natural | strongest if local-first is a requirement |
| Fit for Nomik-style graph service | partial without rewrites | closest fit | viable if service contracts stay disciplined |

## A Practical Reading Of The Tradeoff
### FalkorDB is attractive when
- you want a local-first sidecar
- you want the graph to start with the developer workflow
- you want to avoid heavy external infrastructure for experimentation
- you can design around its capabilities instead of copying Neo4j patterns directly

### Neo4j is attractive when
- you want richer graph procedure support
- you want compatibility with Neo4j-style query patterns
- you want a clearer path to hosted or team-grade deployments
- you expect semantic or graph-heavy operations to grow over time

### The driver approach is attractive when
- you are still learning the product shape
- you want to separate graph semantics from graph storage
- you want a local-first path and a service-grade path without rewriting the whole model
- you suspect the operational control plane may need different persistence than the graph itself

## What The Driver Boundary Should Protect
A good driver boundary should preserve these higher-level concepts:
- entity and edge upsert
- claim record storage
- provenance and temporal metadata storage
- queryable retrieval packet inputs
- optional capability flags for advanced graph operations

A bad driver boundary would pretend every store supports the same graph semantics or query features when they clearly do not.

## Capability Thinking Instead Of One-Size Abstraction
A healthier model is feature capabilities.

| Capability | Why it matters |
|---|---|
| shortest-path and traversal support | important for graph explanation and dependency flows |
| vector and full-text indexing | useful for hybrid retrieval |
| constraint and index support | critical for graph integrity and performance |
| local embedded runtime | useful for sidecar and developer tooling |
| managed cloud path | useful for service-grade deployment |
| semantic extension friendliness | useful for future validation and reasoning integration |
| control-plane adjacency | useful when workflow state and graph state need to stay coherent |

## Where Effect Helps
Effect does not choose the graph store for you. It helps make the runtime architecture sane regardless of store.

| Concern | Effect contribution |
|---|---|
| connection lifecycle | scoped acquisition and release |
| retries and backoff | typed schedules and controlled retry policy |
| concurrency | bounded queues, semaphores, and controlled fan-out |
| typed failures | clear distinction between domain errors and defects |
| configuration | explicit config loading and environment handling |
| orchestration | clean separation between extract, validate, infer, store, and retrieve services |
| observability | spans, metrics, and structured failure surfaces |
| workflow control | explicit state transitions and durable execution boundaries |

## Practical Recommendation
For the bigger picture, the right stance is:
- keep the expert-memory kernel store-agnostic at the semantic level
- use a driver interface with capability flags
- treat operational control-plane persistence as a distinct design concern
- choose the default store based on product shape, not ideology

For example:
- `local-first expert memory` can rationally default to FalkorDB or another embedded-capable graph plus lightweight operational persistence
- `team or hosted expert memory` can rationally default to Neo4j or another service-grade graph plus relational or workflow persistence for the control plane
- both should still speak the same higher-level claim, provenance, retrieval, and audit language

## Questions Worth Keeping Open
- What is the minimum viable driver interface that does not collapse into leaky least-common-denominator design?
- Which capabilities are mandatory for the first real expert-memory product shape?
- Which parts of the control plane should intentionally avoid the graph store?
- Should the local-first and service-grade paths share one query language, or only one semantic model?
- When does store-specific optimization become acceptable instead of harmful lock-in?
