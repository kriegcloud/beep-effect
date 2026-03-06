# NOMIK — Vision & Roadmap

## What Is NOMIK?

NOMIK is an **AI-native code intelligence graph**. It builds a persistent Knowledge Graph of your codebase in Neo4j, then exposes it to AI assistants via MCP (Model Context Protocol).

Instead of dumping files into a context window, the AI **queries the graph** to retrieve exactly the relationships it needs.

> NOMIK is not a code search tool. It's a **living semantic graph** that understands relationships between code entities — not just where they are, but what breaks if they change.

## The Problem

Standard LLMs suffer from context limits. Dumping a codebase into a prompt leads to:
- **Truncation** — deep relationships are lost
- **Hallucinations** — the AI fills gaps with wrong information
- **No memory** — every conversation starts from zero

### NOMIK's Approach

```
User: "What happens if I change the payment schema?"

RAG approach: Search "payment" → 47 files → AI drowns in noise

NOMIK: Traverse graph →
  DBTable:payments
    ← WRITES_TO ← Function:process_payment()
      ← CALLS ← Handler:POST /api/checkout
    ← READS_FROM ← Function:generate_report()
      ← SCHEDULES ← CronJob:monthly_billing

Result: 6 precise nodes instead of 47 noisy files
```

## Current State (Feb 2026)

| Metric | Count |
|---|---|
| **Languages** | TypeScript, JavaScript, Python, Rust, Markdown, SQL, C#, Python migrations |
| **Parser extractors** | 25 (code, data, infrastructure, config, security) |
| **Node types** | 17 (File, Function, Class, Route, DBTable, DBColumn, ExternalAPI, etc.) |
| **Edge types** | 19 (CALLS, DEPENDS_ON, READS_FROM, WRITES_TO, PRODUCES_MESSAGE, etc.) |
| **MCP tools** | 21 |
| **MCP resources** | 9 |
| **MCP prompts** | 6 |
| **CLI commands** | 38 |
| **Tests** | 232 (18 test files) |
| **Supported editors** | Cursor, Windsurf, Antigravity, Claude Desktop |

Key capabilities:
- **Full-stack tracing**: HTTP route → handler → service → DB table → column
- **Import-aware extraction**: All extractors resolve receiver variables from actual imports
- **Infrastructure tracking**: Redis, queues, Kafka, metrics, tracing, WebSockets, cron jobs
- **Config parsing**: Docker, K8s, Terraform, CloudFormation, CI/CD, OpenAPI, GraphQL schemas
- **Security**: Secret detection, feature flags, env var tracking
- **Quality**: Dead code, god files, duplicates, architecture rules (9 built-in + custom Cypher)
- **CI integration**: Unified `nomik ci` pipeline, quality gates, PR impact analysis
- **MCP features**: Role-scoped access (dev/architect/security/pm), sampling, 6 prompts

## Roadmap

### Done
- Full-stack code → DB tracking (Prisma, Supabase, Knex, TypeORM, SQL/C#/Python migrations)
- External API tracking (axios, got, fetch, etc.)
- Infrastructure tracking (Redis, queues, Kafka, metrics, tracing, WebSockets)
- Config parsing (Docker, K8s, Terraform, CloudFormation, CI/CD, OpenAPI)
- PR impact analysis with GitHub bot
- Architecture rules engine with custom Cypher support
- Role-scoped MCP + sampling
- REST dashboard API (14 endpoints)

### Next — Enterprise Language Support
| Language | Why |
|---|---|
| **Go** | Cloud/infrastructure dominance (K8s, microservices) |
| **C# / .NET** | Enterprise codebases (banks, insurance, government) |

### Future
| Feature | Priority |
|---|---|
| Multi-repo federated graph | HIGH |
| Graph time-travel (per-commit snapshots) | HIGH |
| Business logic / ADR parsing | MEDIUM |
| RBAC + SSO (enterprise) | HIGH |
| Cloud-hosted SaaS | HIGH |
| Prometheus metrics exporter | MEDIUM |