# NOMIK — CLI & MCP Reference

## CLI Commands (38)

### Core

| Command | Description |
|---|---|
| `nomik init` | Initialize project, start Neo4j via Docker, create `.nomik/project.json` |
| `nomik scan <path>` | Parse files and ingest nodes/edges into Neo4j (per-file refresh) |
| `nomik scan:incremental` | Git diff-based selective re-scan (only changed files) |
| `nomik status` | Neo4j connection check + project stats (17 node types, 4 categories) |
| `nomik watch [path]` | Continuous file monitoring with real-time impact warnings |
| `nomik query "<cypher>"` | Execute raw Cypher query (table or `--json` output) |
| `nomik recent` | Recently modified nodes (`--since`, `--limit`, `--json`) |

### Analysis

| Command | Description |
|---|---|
| `nomik impact <symbol>` | Downstream impact analysis with depth traversal |
| `nomik explain <symbol>` | Full symbol context: callers, callees, file, edges |
| `nomik pr-impact` | PR blast-radius: git diff → graph traversal → risk report |
| `nomik test-impact <symbol>` | Find test files affected by changing a symbol |
| `nomik rename <old> <new>` | Graph-aware rename: shows all affected files (`--apply` to execute) |
| `nomik migrate <symbol>` | Guided migration plan with risk level and affected files |
| `nomik audit` | Dependency vulnerability check with graph blast radius |

### Architecture

| Command | Description |
|---|---|
| `nomik rules` | Evaluate 9 architecture rules + custom Cypher rules (`--init` for config) |
| `nomik guard` | CI/pre-commit quality gate (`--install-hook`, `--ci`) |
| `nomik communities` | Functional cluster detection (Union-Find) |
| `nomik flows` | Execution flow tracing from entry points |
| `nomik diff <sha1> <sha2>` | Architecture drift between two scans |
| `nomik onboard` | One-command codebase briefing |
| `nomik wiki` | Generate markdown documentation from graph (`--out <dir>`) |
| `nomik badge` | Generate shields.io health badges for README |
| `nomik service-links` | Cross-service dependencies (queues, events, APIs) |
| `nomik changelog` | Auto-generate changelog from graph changes (`--since`) |

### Infrastructure

| Command | Description |
|---|---|
| `nomik serve` | Start MCP server + visualization dashboard |
| `nomik dashboard` | REST API server on port 4242 (14 endpoints) |
| `nomik ci` | Unified CI pipeline: scan → rules → guard → audit |
| `nomik doctor` | Diagnose NOMIK setup (Node.js, Neo4j, configs, MCP) |

### Setup

| Command | Description |
|---|---|
| `nomik setup-cursor` | Configure `.cursor/mcp.json` for Cursor AI |
| `nomik setup-windsurf` | Configure `~/.codeium/windsurf/mcp_config.json` |
| `nomik setup-claude` | Configure Claude Desktop MCP config |
| `nomik setup-antigravity` | Configure Antigravity Editor MCP config |

### Project Management

| Command | Description |
|---|---|
| `nomik project list` | List all projects |
| `nomik project create <name>` | Create a new project |
| `nomik project switch <name>` | Switch active project |
| `nomik project delete <name>` | Delete project and its data |
| `nomik project info` | Current project stats |

---

## MCP Tools (21)

All tools accept an optional `project` parameter that overrides `NOMIK_PROJECT_ID`.

| Tool | Description | Key Params |
|---|---|---|
| `nm_search` | Search nodes by name | `query`, `limit` |
| `nm_explain` | Full symbol context (callers, callees, edges) | `symbol` |
| `nm_impact` | Downstream impact analysis | `symbolId`, `depth` |
| `nm_trace` | Shortest dependency chain (names only) | `from`, `to` |
| `nm_path` | Detailed path with node/edge types | `from`, `to` |
| `nm_context` | File or function context (contains, calls, imports) | `name` |
| `nm_health` | Health metrics + dead code/god files/duplicates | `includeDeadCode`, etc. |
| `nm_db_impact` | DB table/column read-write analysis | `table`, `column` |
| `nm_changes` | Recently modified nodes | `since`, `limit` |
| `nm_projects` | List all projects | — |
| `nm_communities` | Functional cluster detection | `minSize` |
| `nm_flows` | Execution flow tracing from entry points | `maxDepth`, `limit` |
| `nm_diff` | Architecture drift between SHAs | `fromSha`, `toSha` |
| `nm_guard` | Quality gate check | `deadCodeThreshold`, etc. |
| `nm_rules` | Architecture rules evaluation (9 built-in + custom) | thresholds |
| `nm_rename` | Graph-aware rename impact | `symbol` |
| `nm_wiki` | Structured documentation data | `section`, `limit` |
| `nm_service_links` | Cross-service dependencies | — |
| `nm_test_impact` | Affected test file detection | `symbol` or `files` |
| `nm_audit` | Dependency vulnerability + blast radius | — |
| `nm_onboard` | Full codebase briefing | — |

---

## MCP Resources (9)

Browsable data endpoints. Project-scoped via `NOMIK_PROJECT_ID`.

| URI | Description |
|---|---|
| `nomik://stats` | Node/edge counts by type |
| `nomik://health` | Dead code, god files, duplicates, edge types |
| `nomik://files` | All tracked files with language, function count, line count |
| `nomik://communities` | Functional clusters |
| `nomik://onboard` | Full codebase briefing |
| `nomik://schema` | All node labels + relationship types with counts |
| `nomik://projects` | All projects |
| `nomik://infrastructure` | Queues, metrics, spans, topics, crons, events, APIs, env vars |
| `nomik://guard` | Quality gate status |

---

## MCP Prompts (6)

Pre-built conversation starters for AI editors.

| Prompt | Description |
|---|---|
| `nomik-onboard` | Full architecture briefing |
| `nomik-review-change` | Impact analysis before refactoring |
| `nomik-health-check` | Full health report |
| `nomik-explain-module` | Deep-dive into a file/module |
| `nomik-migration-plan` | Safe migration with affected files |
| `nomik-infrastructure` | Audit all infrastructure |

---

## Role-Scoped MCP

Set `NOMIK_ROLE` to filter tools/resources/prompts by role.

| Role | Access |
|---|---|
| `dev` (default) | All tools |
| `architect` | Architecture tools (rules, communities, flows, diff, onboard) |
| `security` | Security tools (audit, guard, rules, health) |
| `pm` | Stats tools (onboard, changes, changelog, health) |

---

## MCP Sampling

Set `NOMIK_SAMPLING=true` to enable server→client LLM completion requests. The server queries the graph, then asks the client's LLM to summarize the data. Helpers: `sampleImpactSummary()`, `sampleHealthSummary()`, `sampleMigrationPlan()`.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NOMIK_GRAPH_URI` | `bolt://localhost:7687` | Neo4j connection URI |
| `NOMIK_GRAPH_USER` | `neo4j` | Neo4j user |
| `NOMIK_GRAPH_PASS` | `nomik_local` | Neo4j password |
| `NOMIK_PROJECT_ID` | _(all projects)_ | Project scope for MCP |
| `NOMIK_ROLE` | `dev` | MCP role filter |
| `NOMIK_SAMPLING` | `false` | Enable MCP sampling |
| `NOMIK_LOG_LEVEL` | `info` | Log level |
| `NOMIK_MCP_PORT` | `3334` | MCP server port (SSE) |
| `NOMIK_VIZ_PORT` | `3333` | Visualization port |

---

## `.nomik/rules.yaml`

Declarative architecture rules config. Create with `nomik rules --init`.

```yaml
maxDeadCode: 5
maxGodFiles: 3
maxDuplicates: 2
maxFunctionCallers: 50
maxDbWritesPerRoute: 3
noCircularImports: true
maxFunctionLines: 200
maxFileLines: 1000
maxSecurityIssues: 0

customRules:
  - name: no-direct-db-in-controllers
    description: Controllers should not directly access the database
    severity: error
    maxResults: 0
    cypher: |
      MATCH (f:Function)-[:WRITES_TO|READS_FROM]->(t:DBTable)
      WHERE f.filePath CONTAINS 'controller'
      RETURN f.name as name, f.filePath as filePath
```
