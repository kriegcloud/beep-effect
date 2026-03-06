# @nomik-ai/cli

> **The Living Blueprint — AI-native code intelligence graph.**

Scan your codebase once, build a persistent Knowledge Graph in Neo4j, and give your AI coding assistant structured context via MCP.

## Quick Start

```bash
npm install -g @nomik-ai/cli

nomik init            # Start Neo4j + create project
nomik scan .          # Build the knowledge graph
nomik setup-cursor    # Connect your IDE (or: setup-windsurf, setup-claude)
```

Restart your IDE — your AI now queries the graph instead of reading raw files.

## What It Does

Your AI assistant gets **21 MCP tools** automatically — impact analysis, dead code detection, DB table tracking, execution flow tracing, architecture rules, and more. All answers come from graph traversals, not file dumps.

```
"What breaks if I change processPayment?"
→ AI queries the graph → 5 callers, 2 DB tables, 1 cron job — with file paths and line numbers.
```

## Key Features

- **21 MCP tools** — search, impact, explain, health, flows, rules, audit, rename, wiki, and more
- **33 CLI commands** — scan, watch, impact, pr-impact, guard, ci, onboard, communities, etc.
- **7 languages** — TypeScript, JavaScript, Python, Rust, SQL, C#, Markdown + YAML/Terraform/GraphQL configs
- **37 extractors** — functions, classes, routes, DB ops, queues, metrics, events, cron jobs, secrets, env vars
- **Import-aware** — resolves receiver variables from actual imports, not hardcoded names
- **100% local** — no code leaves your machine

## Supported Editors

Cursor · Windsurf · Claude Desktop · Antigravity

## Requirements

- Node.js ≥ 20
- Docker (for Neo4j)

## Links

- **Website**: [nomik.co](https://nomik.co)
- **Docs**: [nomik.co/docs](https://nomik.co/docs)
- **GitHub**: [github.com/willFreed1/nomik](https://github.com/willFreed1/nomik)

## License

MIT
