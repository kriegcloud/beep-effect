# P5 Ingestion Execution Log

## Status
COMPLETE (executed on local Graphiti/FalkorDB instance)

## Target
- Graphiti MCP URL: `http://localhost:8000/mcp`
- FalkorDB graph/group: `beep-ast-kg`
- Commit: `7adfa691212a59bbca23e36bee1fb3e403a61b89`
- Date: `2026-02-25`

## Local Graphiti Environment (Observed)
Source: `docker inspect graphiti-mcp-graphiti-mcp-1`
- `FALKORDB_URI=redis://falkordb:6379`
- `FALKORDB_DATABASE=beep_knowledge`
- `GRAPHITI_GROUP_ID=main` (default server group; P5 publication used explicit `group_id: beep-ast-kg`)
- `SEMAPHORE_LIMIT=10`
- `OPENAI_API_KEY` present in container

## Execution Ledger

| Timestamp (UTC) | Command / Action | Group | Attempted | Succeeded | Failed | Replay Hits | Notes |
|---|---|---|---:|---:|---:|---:|---|
| 2026-02-25T20:23:16Z | `bun run beep kg index --mode full` | `beep-ast-kg` | 237 | 237 | 0 | 0 | Local deterministic ledger wrote all in-scope files. |
| 2026-02-25T20:23:19Z | `bun run beep kg index --mode full` (replay) | `beep-ast-kg` | 237 | 0 | 0 | 237 | Deterministic replay hit on all files. |
| 2026-02-25T20:23:23Z | `bun run beep kg index --mode delta --changed tooling/cli/src/commands/kg.ts` | `beep-ast-kg` | 1 | 0 | 0 | 1 | Delta replay hit for unchanged artifact hash. |
| 2026-02-25T20:24:40Z | `BEEP_KG_FORCE_GRAPHITI_OUTAGE=true bun run beep kg index --mode full` | `beep-ast-kg` | 237 | 0 | 0 | 0 | Generated spool envelopes (`spoolWrites=237`). |
| 2026-02-25T20:25:37Z | MCP batch publish script from spool JSONL (`source=json`, `group_id=beep-ast-kg`) | `beep-ast-kg` | 237 | 237 | 0 | N/A | Transport accepted and queued (`publish-summary.json`). |

## Publication Artifact
- [publish-summary.json](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc/outputs/p5-falkordb-ingestion/publish-summary.json)

```json
{
  "timestamp": "2026-02-25T20:25:37.664Z",
  "commit": "7adfa691212a59bbca23e36bee1fb3e403a61b89",
  "groupId": "beep-ast-kg",
  "spool": "tooling/ast-kg/.cache/graphiti-spool/7adfa691212a59bbca23e36bee1fb3e403a61b89.jsonl",
  "attempted": 237,
  "succeeded": 237,
  "failed": 0
}
```

## Notes
1. Local `kg index` command enforces deterministic idempotency before Graphiti publication via ledger + artifact hash checks.
2. Graphiti MCP `add_memory` returns queued acceptance; persistence is asynchronous.
3. During this run, asynchronous persistence progressed incrementally; verification used direct FalkorDB graph queries as source-of-truth evidence.
