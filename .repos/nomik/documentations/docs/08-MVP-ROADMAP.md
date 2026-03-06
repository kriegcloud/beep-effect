# NOMIK — Roadmap

> Last refresh: **2026-02-20**

## Current State (v25)

| Metric | Count |
|---|---|
| Parser extractors | 25 |
| Node types | 17 |
| Edge types | 19 |
| MCP tools | 21 |
| MCP resources | 9 |
| MCP prompts | 6 |
| CLI commands | 38 |
| Tests | 232 (18 files) |
| Build packages | 8/8 |

## Completed Features

### Core
- [x] Multi-language parsing (TypeScript, JavaScript, Python, Rust, Markdown, SQL, C#, Django/Alembic)
- [x] 37 extractors (code, data, infrastructure, config, security, Python, Rust, docs)
- [x] Neo4j graph with 17 node types and 19 edge types
- [x] Multi-project isolation via `projectId`
- [x] File watcher with debounced reindex
- [x] Incremental scan (git diff-based)

### MCP Server
- [x] 21 tools (search, impact, trace, path, context, health, communities, flows, diff, rules, etc.)
- [x] 9 resources (stats, health, files, communities, onboard, schema, projects, infrastructure, guard)
- [x] 6 prompts (onboard, review-change, health-check, explain-module, migration-plan, infrastructure)
- [x] Role-scoped access (dev, architect, security, pm)
- [x] Sampling support (server→client LLM completions)

### CLI (38 commands)
- [x] Core: init, scan, scan:incremental, status, watch, query, recent
- [x] Analysis: impact, explain, pr-impact, test-impact, rename, migrate, audit
- [x] Architecture: rules (9 built-in + custom Cypher), guard, communities, flows, diff, onboard, wiki, badge, service-links, changelog
- [x] Infrastructure: serve, dashboard (REST API), ci, doctor
- [x] Setup: setup-cursor, setup-windsurf, setup-claude, setup-antigravity
- [x] Projects: list, create, switch, delete, info

### Parser
- [x] Import-aware extraction (all extractors resolve receiver variables from actual imports)
- [x] DB tracking: Prisma, Supabase, Knex, TypeORM, pg, mysql2, drizzle + SQL/C#/Python schema parsing
- [x] Infrastructure: Redis, queues (Bull/BullMQ/Bee-Queue), Kafka, metrics (Prometheus/OTel), tracing, WebSockets, cron
- [x] Config: Docker, CI/CD, Terraform, CloudFormation, OpenAPI, GraphQL schemas, dependencies, dotenv
- [x] Security: secret detection, feature flags, env var tracking
- [x] Python runtime: Redis, Celery, Prometheus, OTel, brokers

### Visualization
- [x] 2D graph (Cytoscape.js) + 3D graph (Three.js / 3d-force-graph)
- [x] Search with focused navigation (ranked results, next/prev)
- [x] Filter panel, layout selector, stats panel
- [x] Dark theme, project selector

### Quality
- [x] Dead code detection (import-aware, excludes class methods, barrel re-exports)
- [x] God file / god object detection
- [x] Duplicate code detection (bodyHash)
- [x] Architecture rules engine (9 built-in + custom Cypher via `.nomik/rules.yaml`)
- [x] PR impact analysis with risk scoring
- [x] GitHub bot for PR auto-comments
- [x] CI pipeline (`nomik ci`)
- [x] Health badges for README

## Next — Q2 2026

| Feature | Priority | Impact |
|---|---|---|
| **Go language support** | HIGH | Cloud/infrastructure (K8s, microservices) |
| **C# / .NET language support** | HIGH | Enterprise (banks, insurance, government) |
| **Multi-repo federated graph** | HIGH | Enterprise multi-service architectures |
| **Graph time-travel** (per-commit snapshots) | HIGH | Architecture drift over time |

## Future — Q3+ 2026

| Feature | Priority |
|---|---|
| Java language support | HIGH |
| RBAC + SSO (enterprise) | HIGH |
| Cloud-hosted SaaS | HIGH |
| Business logic / ADR parsing | MEDIUM |
| Prometheus metrics exporter | MEDIUM |
| Cross-language edge resolution | MEDIUM |
| VS Code extension | HIGH |
