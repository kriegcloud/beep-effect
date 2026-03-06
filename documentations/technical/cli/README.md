# @nomik-ai/cli

Command-line interface — **38 commands**, multi-project isolation, standalone bundle via tsup.

## Installation

```bash
# Global (npm)
npm install -g @nomik-ai/cli

# Or local (monorepo dev)
pnpm build
pnpm nomik <command>
```

## Commands (38)

### Core
| Command | Description |
|---|---|
| `init` | Initialize project, Docker, `.nomik/project.json` |
| `scan <path>` | Parse + ingest into Neo4j (per-file refresh) |
| `scan:incremental` | Git diff-based selective re-scan |
| `status` | Neo4j connection + project stats |
| `watch [path]` | File monitoring with real-time reindex |
| `query "<cypher>"` | Raw Cypher query (`--json`) |
| `recent` | Recently modified nodes (`--since`, `--limit`) |

### Analysis
| Command | Description |
|---|---|
| `impact <symbol>` | Downstream impact analysis |
| `explain <symbol>` | Full symbol context |
| `pr-impact` | PR blast-radius (git diff → graph → risk report) |
| `test-impact <symbol>` | Affected test files |
| `rename <old> <new>` | Graph-aware rename (`--apply`) |
| `migrate <symbol>` | Migration plan with risk level |
| `audit` | Dependency vulnerability + blast radius |

### Architecture
| Command | Description |
|---|---|
| `rules` | 9 rules + custom Cypher (`--init`, `--ci`) |
| `guard` | Quality gate (`--install-hook`, `--ci`) |
| `communities` | Functional cluster detection |
| `flows` | Execution flow tracing |
| `diff <sha1> <sha2>` | Architecture drift |
| `onboard` | Codebase briefing |
| `wiki` | Generate markdown docs (`--out`) |
| `badge` | Health badges for README |
| `service-links` | Cross-service dependencies |
| `changelog` | Auto changelog (`--since`) |

### Infrastructure
| Command | Description |
|---|---|
| `serve` | MCP server + viz dashboard |
| `dashboard` | REST API on port 4242 |
| `ci` | Unified pipeline: scan → rules → guard → audit |
| `doctor` | Diagnose setup (Node.js, Neo4j, configs) |

### Setup
| Command | Description |
|---|---|
| `setup-cursor` | Configure Cursor AI MCP |
| `setup-windsurf` | Configure Windsurf AI MCP |
| `setup-claude` | Configure Claude Desktop MCP |
| `setup-antigravity` | Configure Antigravity MCP |

### Projects
| Command | Description |
|---|---|
| `project list` | List all projects |
| `project create <name>` | Create project |
| `project switch <name>` | Switch active project |
| `project delete <name>` | Delete project + data |
| `project info` | Current project stats |

## Architecture

Commander.js for argument parsing. Delegates to `@nomik/parser`, `@nomik/graph`, `@nomik/watcher`. Entry point: `src/index.ts`. Standalone bundle via `tsup`.

## Utils

| File | Purpose |
|---|---|
| `utils/project-config.ts` | Read/write `.nomik/project.json` |
| `utils/mcp-config.ts` | Generate MCP client configs |
| `utils/rules-config.ts` | Parse `.nomik/rules.yaml` (thresholds + custom Cypher) |
