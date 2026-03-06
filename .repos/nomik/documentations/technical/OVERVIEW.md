# NOMIK Technical Architecture

> For details on each package, see the subdirectories.

## Overview

NOMIK is a knowledge graph sidecar that analyzes source code, builds a dependency graph in Neo4j, and exposes this data via MCP server, CLI, REST API, and visualization dashboard.

## Packages (8)

### 1. [CLI](./cli/README.md) (`@nomik-ai/cli`)
Command-line interface — **38 commands**.
- **Core**: init, scan, scan:incremental, status, watch, query, recent
- **Analysis**: impact, explain, pr-impact, test-impact, rename, migrate, audit
- **Architecture**: rules, guard, communities, flows, diff, onboard, wiki, badge, service-links, changelog
- **Infrastructure**: serve, dashboard, ci, doctor
- **Setup**: setup-cursor, setup-windsurf, setup-claude, setup-antigravity
- **Projects**: list, create, switch, delete, info

### 2. [Core](./core/README.md) (`@nomik/core`)
Shared types, configuration (Zod), error handling (`NomikError`), structured logging (Pino).

### 3. [Parser](./parser/README.md) (`@nomik/parser`)
Intelligence engine — **37 extractors** for 7+ languages.
- **Languages**: TypeScript, JavaScript, Python, Rust, Markdown, SQL, C#/Django/Alembic migrations
- **Categories**: code, API, data, infrastructure, config, security, Python runtime

### 4. [Graph](./graph/README.md) (`@nomik/graph`)
Neo4j persistence layer — queries, rules engine, cache.
- Batch UNWIND upserts, QueryCache (30s TTL), exponential retry
- 10 query modules: read, read-health, read-explain, read-onboard, read-community, read-flows, read-diff, read-rules, read-test-impact, write

### 5. [MCP Server](./mcp-server/README.md) (`@nomik/mcp-server`)
AI interface via Model Context Protocol.
- **21 tools**, **9 resources**, **6 prompts**
- Role-scoped access (dev, architect, security, pm)
- Sampling support (server→client LLM completions)

### 6. [Visualization](./viz/README.md) (`@nomik/viz`)
React dashboard — 2D (Cytoscape.js) + 3D (Three.js).
- All **17 node types** rendered with distinct shapes/colors, all **10 edge types** with distinct styles
- Search (ranked, focus/fit modes), filter (node/edge/directory), 4 layouts, impact overlay, detail panel
- Stats panel: full node type breakdown, dead code, god objects, god files, duplicates, composite health score
- Performance: 60s query cache, progressive streaming, adaptive styles/layouts, LOD zoom, 3D adaptive quality

### 7. [Watcher](./watcher/) (`@nomik/watcher`)
Chokidar file watcher with debounced reindex and `projectId` support.

### 8. [GitHub Bot](./github-bot/) (`@nomik/github-bot`)
PR impact analysis webhook — auto-comments on PRs with blast radius.

## Multi-project

Each node and edge carries a `projectId` for logical isolation in a single Neo4j database. Current project stored in `.nomik/project.json`.

## Design Principles

1. **Strict boundaries**: No circular dependencies. `core` is the leaf dependency.
2. **Pipeline**: Parsing and ingestion are separate steps.
3. **Observability**: Structured logging (Pino) everywhere.
4. **Typed errors**: `NomikError` with `code`, `severity`, `recoverable`.
5. **Isolation**: `projectId` on all queries and mutations.
