# @nomik/mcp-server

MCP server exposing the NOMIK knowledge graph to AI agents (Cursor, Windsurf, Claude Desktop, Antigravity).

## Capabilities

| Capability | Count | Description |
|---|---|---|
| **Tools** | 21 | Graph query functions |
| **Resources** | 9 | Browsable data endpoints |
| **Prompts** | 6 | Pre-built conversation starters |
| **Sampling** | 3 helpers | Server→client LLM completions |

### Tools (21)

All tools accept an optional `project` parameter overriding `NOMIK_PROJECT_ID`.

| Tool | Description |
|---|---|
| `nm_search` | Search nodes by name |
| `nm_explain` | Full symbol context (callers, callees, edges) |
| `nm_impact` | Downstream impact analysis |
| `nm_trace` | Shortest dependency chain (names only) |
| `nm_path` | Detailed path with node/edge types |
| `nm_context` | File or function context |
| `nm_health` | Health metrics + dead code/god files/duplicates |
| `nm_db_impact` | DB table/column read-write analysis |
| `nm_changes` | Recently modified nodes |
| `nm_projects` | List all projects |
| `nm_communities` | Functional cluster detection |
| `nm_flows` | Execution flow tracing |
| `nm_diff` | Architecture drift between SHAs |
| `nm_guard` | Quality gate check |
| `nm_rules` | Architecture rules (9 built-in + custom Cypher) |
| `nm_rename` | Graph-aware rename impact |
| `nm_wiki` | Structured documentation data |
| `nm_service_links` | Cross-service dependencies |
| `nm_test_impact` | Affected test file detection |
| `nm_audit` | Dependency vulnerability + blast radius |
| `nm_onboard` | Full codebase briefing |

### Resources (9)

| URI | Description |
|---|---|
| `nomik://stats` | Node/edge counts |
| `nomik://health` | Dead code, god files, duplicates |
| `nomik://files` | Tracked files with metadata |
| `nomik://communities` | Functional clusters |
| `nomik://onboard` | Codebase briefing |
| `nomik://schema` | Node labels + relationship types |
| `nomik://projects` | All projects |
| `nomik://infrastructure` | Queues, metrics, spans, topics, crons, events, APIs, env vars |
| `nomik://guard` | Quality gate status |

### Prompts (6)

`nomik-onboard`, `nomik-review-change`, `nomik-health-check`, `nomik-explain-module`, `nomik-migration-plan`, `nomik-infrastructure`

### Role-Scoped Access

`NOMIK_ROLE` filters exposed tools/resources/prompts: `dev` (all), `architect`, `security`, `pm`.

### Sampling

`NOMIK_SAMPLING=true` enables `sampleImpactSummary()`, `sampleHealthSummary()`, `sampleMigrationPlan()`.

## Internal Architecture

| File | Responsibility |
|---|---|
| `index.ts` | MCP server bootstrap (stdio transport), request routing |
| `tools.ts` | 21 tool definitions + handlers |
| `resources.ts` | 9 resource definitions |
| `prompts.ts` | 6 prompt definitions |
| `roles.ts` | Role-based filtering (NOMIK_ROLE) |
| `sampling.ts` | Server→client LLM completion helpers |
