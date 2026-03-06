# NOMIK — Running Guide

## Prerequisites

- Node.js ≥ 20 LTS
- pnpm ≥ 9
- Docker (for Neo4j)

## Quick Start

```bash
# 1. Start Neo4j
docker compose up -d

# 2. Build
pnpm install
pnpm build

# 3. Scan your project
pnpm nomik scan .

# 4. Connect your AI editor
pnpm nomik setup-cursor     # or setup-windsurf / setup-claude / setup-antigravity
```

That's it. Your AI editor now has graph-powered intelligence.

## Step-by-Step

### 1. Start Neo4j

```bash
docker compose up -d
```

Verify at `http://localhost:7474` (user: `neo4j`, pass: `nomik_local`).

### 2. Build

```bash
pnpm install
pnpm build    # Builds all 8 packages
```

### 3. Scan

```bash
pnpm nomik scan .                      # Scan current directory
pnpm nomik scan ./src --project my-api # Scan specific path with project name
```

### 4. Connect AI Editor

```bash
pnpm nomik setup-cursor       # Creates .cursor/mcp.json
pnpm nomik setup-windsurf     # Creates ~/.codeium/windsurf/mcp_config.json
pnpm nomik setup-claude       # Creates Claude Desktop config
pnpm nomik setup-antigravity  # Creates Antigravity config
```

> In stdio mode, the IDE launches the MCP server on demand. `nomik serve` is not required.

### 5. Diagnose (optional)

```bash
pnpm nomik doctor    # Check Node.js, Neo4j, configs, MCP server
```

## Common Workflows

### Live Development

```bash
pnpm nomik watch .           # Auto-reindex on file changes
```

### Architecture Review

```bash
pnpm nomik onboard           # Codebase briefing
pnpm nomik rules             # Architecture rules evaluation
pnpm nomik communities       # Functional clusters
pnpm nomik flows             # Execution flow tracing
```

### CI Pipeline

```bash
pnpm nomik ci                # scan → rules → guard → audit (all-in-one)
pnpm nomik ci --skip-scan    # Skip scan if already scanned
```

### PR Review

```bash
pnpm nomik pr-impact         # Blast radius for current branch
pnpm nomik pr-impact --json  # JSON output for CI
```

### Documentation

```bash
pnpm nomik wiki --out ./wiki     # Generate architecture wiki
pnpm nomik badge                 # Generate health badges
pnpm nomik changelog --since v1  # Auto-generate changelog
```

### Visualization

```bash
pnpm nomik serve             # Dashboard + MCP debug
pnpm nomik dashboard         # REST API on port 4242
```

### Project Management

```bash
pnpm nomik project list      # List all projects
pnpm nomik project create X  # Create project
pnpm nomik project switch X  # Switch active project
pnpm nomik project info      # Current project stats
pnpm nomik project delete X  # Delete project + data
```

## Environment Variables

Create a `.env` file at the project root:

```bash
NOMIK_GRAPH_URI=bolt://localhost:7687
NOMIK_GRAPH_USER=neo4j
NOMIK_GRAPH_PASS=nomik_local
NOMIK_PROJECT_ID=my-project
```

See [CLI & MCP Reference](11-CLI-TOOLS-REFERENCE.md) for all environment variables.
