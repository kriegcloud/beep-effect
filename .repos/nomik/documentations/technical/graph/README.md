# @nomik/graph

Neo4j persistence layer — 10 query modules, rules engine, cache, batch upserts.

## Features

- **Schema Management**: Auto-initializes constraints + indexes on startup
- **Driver Abstraction**: `GraphDriver` interface with Neo4j implementation (Bolt)
- **Batch UNWIND Upserts**: Nodes and edges grouped by type
- **QueryCache**: TTL 30s, max 200 entries, LRU eviction, auto-invalidation after writes
- **Retry**: Exponential backoff (3 attempts, transient error detection)
- **Timestamps**: `createdAt` and `updatedAt` on all nodes and edges
- **Multi-project**: `projectId` on all nodes and edges

## Query Modules (10)

| File | Queries |
|---|---|
| `read.ts` | impact, path, chain, stats, recent, DB impact, search, file symbols |
| `read-health.ts` | dead code, god objects, god files, duplicates |
| `read-explain.ts` | symbol explain, cross-service links |
| `read-onboard.ts` | aggregated codebase briefing |
| `read-community.ts` | Union-Find functional clustering |
| `read-flows.ts` | execution flow tracing from entry points |
| `read-diff.ts` | architecture drift between snapshots |
| `read-rules.ts` | 9 built-in rules + custom Cypher evaluation |
| `read-test-impact.ts` | affected test file detection |
| `write.ts` | node/edge upsert, file clear, project CRUD, stale file purge |

## Rules Engine (`read-rules.ts`)

9 built-in rules evaluated against the graph:

| Rule | Severity | Default |
|---|---|---|
| `max-dead-code` | error | 5 |
| `max-god-files` | error | 3 |
| `max-duplicates` | warning | 2 |
| `max-function-callers` | warning | 50 |
| `max-db-writes-per-route` | warning | 3 |
| `no-circular-imports` | error | true |
| `max-function-lines` | warning | 200 |
| `max-file-lines` | warning | 1000 |
| `max-security-issues` | error | 0 |

Custom Cypher rules via `RulesConfig.customRules[]` — each rule runs a Cypher query and fails if results exceed `maxResults`.

## Other Modules

| File | Purpose |
|---|---|
| `drivers/driver.interface.ts` | `GraphDriver` abstract interface |
| `drivers/neo4j.driver.ts` | Neo4j Bolt implementation |
| `schema/init.ts` | Constraints + indexes |
| `cache.ts` | `QueryCache` with TTL, pattern invalidation, LRU |
| `graph.service.ts` | `createGraphService()` — facade over all query modules |

## Configuration

| Variable | Default |
|---|---|
| `NOMIK_GRAPH_URI` | `bolt://localhost:7687` |
| `NOMIK_GRAPH_USER` | `neo4j` |
| `NOMIK_GRAPH_PASS` | `nomik_local` |
