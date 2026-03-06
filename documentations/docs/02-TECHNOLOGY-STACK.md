# NOMIK — Technology Stack

## Core Stack

| Layer | Technology | Why |
|---|---|---|
| **Language** | TypeScript (Node.js) | Single language for all layers, strict types |
| **Parser** | Tree-sitter | Official Node.js bindings, multi-language AST |
| **Graph DB** | Neo4j | Native graph traversal, APOC, Cypher |
| **MCP** | `@modelcontextprotocol/sdk` | Anthropic's reference implementation |
| **CLI** | Commander.js | Standard Node.js CLI framework |
| **Viz** | React + Cytoscape.js + Three.js | 2D + 3D graph rendering |
| **Watcher** | Chokidar | Cross-platform file monitoring |
| **Build** | tsup (esbuild) | Fast TypeScript bundling |
| **Monorepo** | pnpm workspaces | Disk-efficient, strict dependency resolution |
| **Validation** | Zod | Runtime type validation for configs |
| **Logging** | Pino | Structured JSON logging |
| **Testing** | Vitest | Fast, TypeScript-native test runner |

## Why TypeScript

- **MCP SDK is TypeScript-first** —  zero lag on protocol updates
- **Single-language stack** — parser, graph, MCP server, CLI, viz all in TypeScript
- **Type safety for graph schemas** — Zod-validated node/edge types
- **Ecosystem** — npm has the largest package ecosystem

## Languages Parsed

| Language | Grammar | Extractors | Status |
|---|---|---|---|
| TypeScript / JavaScript | `tree-sitter-typescript` | All 37 extractors (code, data, infra, config, security) | Done |
| Python | `tree-sitter-python` | Functions, classes, imports, calls + runtime (Redis, Celery, Prometheus, OTel, brokers) | Done |
| Rust | `tree-sitter-rust` | Functions, structs/enums/traits, use, calls | Done |
| Markdown | Custom regex parser | Sections, headings | Done |
| SQL | Custom regex parser | CREATE TABLE, ALTER TABLE, column definitions | Done |
| C# Migrations | Custom regex parser | Entity Framework migration → DB schema | Done |
| Python Migrations | Custom regex parser | Django/Alembic migration → DB schema | Done |

### Parser Extractors (37)

| Category | Extractors |
|---|---|
| **Code** | functions, classes, imports, exports, calls, variables |
| **API** | routes, api-calls, grpc/tRPC/GraphQL |
| **Data** | db-operations, db-schema (SQL/C#/Python), redis |
| **Infrastructure** | queue, metrics, tracing, messaging, websocket, cron, events |
| **Config** | docker, cicd, terraform, cloudformation, openapi-spec, graphql-schema, dependencies, dotenv, infra-config, swagger |
| **Security** | secrets, feature-flags, env-vars, test-coverage |
| **Python** | python, python-runtime (Redis, Celery, Prometheus, OTel, brokers) |
| **Rust** | rust (functions, structs, enums, traits, use, calls) |
| **Docs** | markdown (sections, headings) |

### Planned Languages

| Language | Why | Timeline |
|---|---|---|
| **Go** | Cloud/infrastructure dominance (K8s, microservices) | Q2 2026 |
| **C# / .NET** | Enterprise codebases (banks, insurance, government) | Q2 2026 |
| **Java** | Enterprise JVM ecosystem | Q3 2026 |

## Runtime Requirements

| Component | Version |
|---|---|
| Node.js | ≥ 20 LTS |
| pnpm | ≥ 9 |
| Neo4j | ≥ 5.x (Community or Enterprise) |
| Docker | For Neo4j (optional if using external instance) |
