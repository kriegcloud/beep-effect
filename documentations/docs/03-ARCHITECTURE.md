# NOMIK — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NOMIK                                   │
│                                                                 │
│  ┌───────────┐   ┌───────────┐   ┌──────────────────────────┐  │
│  │  Parser   │──▶│  Graph    │◀──│  MCP Server              │  │
│  │ (37 ext.) │   │  (Neo4j)  │   │  21 tools, 9 resources,  │  │
│  └─────▲─────┘   └─────┬─────┘   │  6 prompts, sampling,    │  │
│        │               │         │  role-scoped access       │  │
│  ┌─────┴─────┐   ┌─────▼─────┐   └──────────▲───────────────┘  │
│  │  Watcher  │   │    Viz    │              │                  │
│  │ (chokidar)│   │ 2D + 3D  │   ┌──────────┴───────────────┐  │
│  └───────────┘   └───────────┘   │  Cursor / Windsurf /     │  │
│                                  │  Claude / Antigravity     │  │
│  ┌─────────────────────────┐     └──────────────────────────┘  │
│  │  CLI (38 commands)      │                                   │
│  │  + Dashboard REST API   │                                   │
│  │  + GitHub PR Bot        │                                   │
│  └─────────────────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Source Code ──▶ Watcher ──▶ Parser (tree-sitter) ──▶ 37 Code Extractors
                                  │                        │
                            Config Files ──▶ Config Parser ──▶ 12 Config Extractors
                                                         │
                                              nodes + edges (deduplicated)
                                                         ▼
    IDE AI ◀── MCP Server ◀── Graph (Neo4j) ──▶ CLI / Viz / REST API
```

## Packages (8)

| Package | Purpose | Key Files |
|---|---|---|
| **@nomik/core** | Types (Zod), config, logger (Pino) | `types/`, `config/`, `logger/` |
| **@nomik/parser** | Tree-sitter AST + config file extraction, 37 extractors | `extractors/`, `resolvers/`, `parser.ts`, `config-file-parser.ts` |
| **@nomik/graph** | Neo4j driver, queries, cache (30s TTL), rules engine | `queries/`, `drivers/`, `graph.service.ts` |
| **@nomik/watcher** | Chokidar file watcher, debounced reindex, file deletion cleanup | `watcher.ts` |
| **@nomik/mcp-server** | MCP protocol (21 tools, 9 resources, 6 prompts) | `tools.ts`, `prompts.ts`, `roles.ts`, `sampling.ts` |
| **@nomik/github-bot** | PR impact analysis webhook | `index.ts` |
| **@nomik/viz** | React + Three.js (3D) + Cytoscape.js (2D) | `components/`, `neo4j.ts` |
| **@nomik-ai/cli** | Commander CLI, 38 commands | `commands/`, `utils/` |

## Parser Extractors (37)

| Category | Extractors |
|---|---|
| **Code** | functions, classes, imports, exports, calls, variables |
| **API** | routes, api-calls, grpc/tRPC/GraphQL |
| **Data** | db-operations, db-schema (SQL/C#/Python), redis |
| **Infrastructure** | queue, metrics, tracing, messaging, websocket, cron, events |
| **Config** | docker, cicd, terraform, cloudformation, openapi-spec, graphql-schema, dependencies, dotenv, infra-config, swagger — all wired via `config-file-parser.ts` |
| **Security** | secrets, feature-flags, env-vars, test-coverage |
| **Python** | python, python-runtime (Redis, Celery, Prometheus, OTel, brokers) |
| **Rust** | rust (functions, structs, enums, traits, use, calls) |
| **Docs** | markdown (sections, headings) |

## Graph Query Modules

| File | Queries |
|---|---|
| `read.ts` | impact, path, chain, stats, recent, DB impact, search |
| `read-health.ts` | dead code, god objects, god files, duplicates |
| `read-explain.ts` | symbol explain, cross-service links |
| `read-onboard.ts` | aggregated codebase briefing |
| `read-community.ts` | Union-Find functional clustering |
| `read-flows.ts` | execution flow tracing from entry points |
| `read-diff.ts` | architecture drift between snapshots |
| `read-rules.ts` | 9 built-in rules + custom Cypher evaluation |
| `read-test-impact.ts` | affected test file detection |
| `write.ts` | node/edge upsert, project CRUD |

## Multi-Project Isolation

- `.nomik/project.json` stores the active `projectId`
- All nodes and edges carry `projectId`
- All queries filter by `projectId`
- CLI commands accept `--project <name>` override

## Dependency Graph (strict, no cycles)

```
@nomik/core
  ├── @nomik/parser
  ├── @nomik/graph
  │     ├── @nomik/mcp-server (+ roles, sampling)
  │     └── @nomik/watcher (+ parser)
  └── @nomik/viz (types only, isolated)

@nomik-ai/cli ── depends on all packages
@nomik/github-bot ── depends on graph
```
