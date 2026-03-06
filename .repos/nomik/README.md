# NOMIK — The Living Blueprint

> **⭐⭐ If you find NOMIK useful, please consider giving it a star on GitHub! It helps the project grow! ⭐⭐**
> **Follow the creator on X: [@willfreed01](https://x.com/willfreed01) | Website: [hamzabenjeddi.com](https://hamzabenjeddi.com/)**

> **AI-native code intelligence graph. Scan once, query everything.**

NOMIK builds a persistent **Knowledge Graph** of your entire codebase in Neo4j, then exposes it to AI assistants via **MCP** (Model Context Protocol). Instead of dumping files into a prompt, the AI queries a graph to retrieve exactly the relationships it needs — functions, classes, imports, call chains, DB operations, infrastructure, and more.

## Quick Start

```bash
# Prerequisites: Node.js 20+, Docker
npm install -g @nomik-ai/cli

cd your-project/
nomik init                          # Config + Neo4j Docker + .env + project setup
nomik scan .                        # Build the knowledge graph
nomik setup-cursor                  # Connect to your IDE (or: setup-windsurf, setup-claude)
nomik watch .                       # (Optional) Live graph updates on save
```

Restart your IDE — the AI now has full graph-powered context.

## MCP Tools (21)

Your AI assistant gets these tools automatically:

| Tool | Purpose | Example |
|---|---|---|
| `nm_search` | Find symbols by name | "Find all auth functions" |
| `nm_context` | Full context for a symbol | "Show everything about `GraphService`" |
| `nm_impact` | Downstream impact analysis | "What breaks if I change `parseFile`?" |
| `nm_db_impact` | DB table/column read/write analysis | "Who writes to users.email?" |
| `nm_explain` | Symbol deep-dive (callers, callees, edges) | "Explain `createGraphService`" |
| `nm_health` | Stats + health checks (17 node types) | "Any dead code or god files?" |
| `nm_path` | Shortest path between two symbols | "How does `scanCommand` reach `neo4j`?" |
| `nm_trace` | Full dependency chain | "Trace from A to B" |
| `nm_changes` | Recently modified nodes | "What changed today?" |
| `nm_onboard` | Full codebase briefing | "Give me a project overview" |
| `nm_wiki` | Generate structured docs | "Generate docs for this codebase" |
| `nm_communities` | Functional cluster detection | "What are the main code modules?" |
| `nm_flows` | Execution flow tracing | "Show the auth request lifecycle" |
| `nm_guard` | Quality gate (dead code, god files, dupes) | "Does the codebase pass quality?" |
| `nm_rename` | Graph-aware rename impact | "What changes if I rename `createWatcher`?" |
| `nm_diff` | Architecture drift between scans | "What changed between these commits?" |
| `nm_service_links` | Cross-service dependencies | "How do microservices communicate?" |
| `nm_test_impact` | Affected tests after a change | "Which tests for `parseFile`?" |
| `nm_audit` | Dependency vulnerability + blast radius | "Any vulnerable packages?" |
| `nm_rules` | Architecture rules (9 built-in + custom Cypher) | "Does code follow our policies?" |
| `nm_projects` | List tracked projects | "What projects exist?" |

## What NOMIK Tracks

All extractors are **import-aware** — they resolve receiver variables from actual imports, not hardcoded names.

### Code
- **Functions, Classes, Imports/Exports** — full AST extraction (TS, JS, Python, Rust)
- **Call chains** — intra-file, cross-file, `obj.method()`, callbacks, barrel re-exports
- **Routes** — Express, Fastify, NestJS, tRPC, gRPC, GraphQL (decorator + chain detection)
- **Dead code, god files, duplicates** — health detection with configurable thresholds

### Data
- **Database** — Prisma, Supabase, Knex, TypeORM, raw SQL, EF/Django/Alembic migrations
- **Redis** — ioredis, @redis/client, @upstash/redis (read/write/delete classification)
- **Job Queues** — Bull/BullMQ, Bee-Queue, Agenda, pg-boss (producer/consumer edges)

### Infrastructure
- **HTTP Clients** — axios, got, node-fetch, ofetch, undici, superagent, `fetch()`
- **Message Brokers** — KafkaJS, amqplib, NATS, AWS SQS/SNS, Google PubSub
- **Tracing** — OpenTelemetry, Datadog, Sentry (span creation tracking)
- **Metrics** — prom-client, OpenTelemetry (Counter/Gauge/Histogram/Summary)
- **WebSockets** — ws, @nestjs/websockets, uWebSockets.js, Socket.io (rooms/namespaces)
- **Cron Jobs** — node-cron, node-schedule, @nestjs/schedule, Agenda
- **Feature Flags** — LaunchDarkly, Unleash, Flagsmith, Split.io, GrowthBook

### Config & Security
- **Docker/K8s** — Dockerfile, docker-compose, K8s manifests (Deployment, Service, Ingress)
- **CI/CD** — GitHub Actions, GitLab CI (jobs, steps, triggers)
- **IaC** — Terraform (.tf), CloudFormation/SAM, OpenAPI specs
- **Secrets** — AWS keys, GitHub tokens, Stripe keys, JWT, private keys, basic auth URLs
- **Env vars** — `.env` files, `process.env.*`, Python `os.environ`
- **Swagger/OpenAPI** — decorator enrichment + spec file parsing
- **GraphQL schemas** — `.graphql`/`.gql` file parsing
- **Dependencies** — package.json, requirements.txt
- **Tests** — `.test.`/`.spec.`/`__tests__/` detection, mock target resolution

### Python-Specific
- Redis, Celery tasks, Prometheus metrics, OpenTelemetry spans, Kafka/RabbitMQ/NATS

## MCP Extras

### Prompts (6 conversation starters)
`nomik-onboard`, `nomik-review-change`, `nomik-health-check`, `nomik-explain-module`, `nomik-migration-plan`, `nomik-infrastructure`

### Resources (9 browsable endpoints)
`nomik://stats`, `nomik://health`, `nomik://files`, `nomik://communities`, `nomik://onboard`, `nomik://schema`, `nomik://projects`, `nomik://infrastructure`, `nomik://guard`

### Role-Scoped Access
Set `NOMIK_ROLE` env var: `dev` (all tools), `architect`, `security`, `pm` — filters tools/prompts/resources per role.

### MCP Sampling
Set `NOMIK_SAMPLING=true` — enables server→client LLM completion requests for AI-augmented analysis.

## CLI Commands (38)

```bash
# Core
nomik init                    # Setup + Neo4j Docker + project
nomik scan <path>             # Build knowledge graph
nomik scan:incremental <path> # Re-parse only changed files (git diff)
nomik watch [path]            # Live file watcher
nomik status                  # Graph stats
nomik doctor                  # Diagnose setup (Neo4j, MCP, config)

# Analysis
nomik impact <symbol>         # Downstream impact analysis
nomik explain <symbol>        # Full symbol context report
nomik test-impact <symbol>    # Which tests to re-run after a change
nomik migrate <symbol>        # Guided migration plan with risk level
nomik rename <old> <new>      # Graph-aware rename (--apply to write)
nomik diff <sha1> <sha2>      # Architecture drift between scans
nomik service-links           # Cross-service producer/consumer pairs
nomik communities             # Functional cluster detection
nomik flows                   # Execution flow tracing from entry points

# Quality & CI
nomik rules                   # Architecture rules engine (9 built-in + custom Cypher)
nomik rules --init            # Create .nomik/rules.yaml config
nomik guard                   # Quality gate (CI/pre-commit)
nomik audit                   # Dependency vulnerability check + blast radius
nomik ci                      # Unified pipeline: scan → rules → guard → audit

# Documentation & Reporting
nomik onboard                 # One-command codebase briefing
nomik wiki                    # Generate markdown docs from graph
nomik changelog               # Auto-generate changelog from graph changes
nomik badge                   # Shields.io health badges
nomik query "<cypher>"        # Raw Cypher query
nomik recent                  # Recently changed nodes

# IDE Setup
nomik setup-cursor            # Auto-configure Cursor MCP
nomik setup-windsurf          # Auto-configure Windsurf MCP
nomik setup-antigravity       # Auto-configure Antigravity MCP
nomik setup-claude            # Auto-configure Claude Desktop MCP

# Server
nomik dashboard               # REST API on port 4242 (14 endpoints)
nomik serve                   # MCP server + viz dashboard

# Project Management
nomik project list|create|switch|delete|info
```

## Supported Languages

| Language | Parser | Extractors |
|---|---|---|
| **TypeScript / JavaScript** | tree-sitter | Full: functions, classes, imports, routes, calls, APIs, DB, Redis, queues, metrics, events, env vars, secrets, tests |
| **Python** | tree-sitter | functions, classes, imports, calls + Redis, Celery, Prometheus, OTel, Kafka/RabbitMQ |
| **Rust** | tree-sitter | functions, structs/enums/traits, use, calls |
| **Markdown** | regex | sections (h1-h6) |
| **SQL / C# / Python migrations** | regex | DB schema extraction (CREATE TABLE, EF, Django, Alembic) |
| **YAML** | regex | Docker Compose, K8s, GitHub Actions, GitLab CI, CloudFormation, Prometheus, OpenAPI |
| **Terraform** | regex | Resources, variables, modules, outputs (.tf, .tfvars) |
| **GraphQL** | regex | Types, queries, mutations, subscriptions (.graphql, .gql) |
| **Dockerfile** | regex | Base images, exposed ports, stages |
| **.env** | regex | Environment variable definitions (.env, .env.local, .env.production) |
| **JSON configs** | regex | package.json dependencies, OpenAPI specs, Grafana dashboards |

## Graph Schema

**17 Node Types**: `File`, `Function`, `Class`, `Variable`, `Module`, `Route`, `ExternalAPI`, `DBTable`, `DBColumn`, `CronJob`, `Event`, `EnvVar`, `QueueJob`, `Metric`, `Span`, `Topic`, `SecurityIssue`

**23 Edge Types**: `CONTAINS`, `IMPORTS`, `EXPORTS`, `EXTENDS`, `IMPLEMENTS`, `CALLS`, `DEPENDS_ON`, `HANDLES`, `READS_FROM`, `WRITES_TO`, `CALLS_EXTERNAL`, `TRIGGERS`, `EMITS`, `LISTENS_TO`, `USES_ENV`, `PRODUCES_JOB`, `CONSUMES_JOB`, `USES_METRIC`, `STARTS_SPAN`, `PRODUCES_MESSAGE`, `CONSUMES_MESSAGE`, `HAS_SECURITY_ISSUE`, `SCHEDULES`

## Architecture

```
nomik/
├── @nomik/core        — Types (Zod), config, logger (Pino)
├── @nomik/parser      — Tree-sitter AST extraction + 37 extractors + config file parser
├── @nomik/graph       — Neo4j driver, queries, cache, rules engine
├── @nomik/watcher     — Chokidar file watcher
├── @nomik/mcp-server  — MCP server (21 tools, 9 resources, 6 prompts, sampling, roles)
├── @nomik/github-bot  — PR impact analysis webhook
├── @nomik/viz         — React + 3D force-graph + Cytoscape.js dashboard
└── @nomik-ai/cli      — 38 CLI commands
```

## Tech Stack

| Component | Technology |
|---|---|
| **Language** | TypeScript (ESM, strict) |
| **Graph DB** | Neo4j 5 Community |
| **Parser** | Tree-sitter (multi-lang) |
| **AI Protocol** | MCP (Model Context Protocol) SDK 1.26.0 |
| **IDE Support** | Cursor, Windsurf, Antigravity, Claude Desktop |
| **Monorepo** | Turborepo + pnpm workspaces |
| **Visualization** | Three.js (3D) + Cytoscape.js (2D) |
| **Tests** | Vitest — 232+ tests, 18+ files |

## Development

```bash
git clone https://github.com/willFreed1/NOMIK.git
cd NOMIK && pnpm install && docker compose up -d && pnpm build
pnpm test                     # 232 tests
pnpm nomik scan . --project nomik
pnpm nomik doctor             # Verify setup
```

## Documentation

| Doc | Description |
|---|---|
| [Vision & Roadmap](documentations/docs/01-VISION.md) | Why NOMIK exists, full-stack intelligence roadmap |
| [Architecture](documentations/docs/03-ARCHITECTURE.md) | System diagram, monorepo structure, data flow |
| [Running Guide](documentations/docs/04-RUNNING_GUIDE.md) | Step-by-step local setup |
| [MCP Integration](documentations/docs/05-MCP-INTEGRATION.md) | IDE connection guide |
| [Graph Schema](documentations/docs/07-GRAPH-SCHEMA.md) | All node/edge types with Cypher examples |
| [Progress Tracker](documentations/docs/10-PROGRESS-TRACKER.md) | Version history and changelog |

## Contributors

Nomik is an evolving tool built to supercharge AI coding. We welcome all contributions! 

Whether it's fixing bugs, adding support for new languages, creating new graph insights, or improving documentation—feel free to open an issue or submit a Pull Request.

## License & Contributions

Nomik is licensed under the **Functional Source License (FSL) v1.1**.

- **Can I use Nomik for free?** Yes, for personal projects, academic research, or internal company tools.
- **Can I contribute?** Yes! We welcome pull requests and community contributions.
- **What can't I do?** You cannot use the Software to provide a product or service that competes with Nomik itself (e.g., offering "Nomik as a Service").
- **What happens later?** After 2 years, the code automatically transitions to the Apache 2.0 license.

For the full legal terms, see the [LICENSE](LICENSE) file.
