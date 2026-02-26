# Group Isolation Runbook

## Goal
Ensure publish, replay, verify, and parity operations remain isolated per validation group.

## Group Controls
- `kg publish` supports optional `--group` override.
- `kg replay` supports optional `--group` override.
- `kg verify` supports `--group` filtering.
- `kg parity` supports `--group` filtering.

## Isolation Hardening
Falkor entity identity now includes group:
- Commit merge key: `{ sha, groupId }`
- File merge key: `{ nodeId, groupId }`
- Symbol/literal merge key: `{ nodeId, groupId }`
- Edge matching constrained by `groupId` on both endpoints

Code: `tooling/cli/src/commands/kg.ts`

## Rotation Policy
Use run-scoped IDs: `beep-ast-kg-<purpose>-<YYYYMMDDTHHMMSSZ>`.

Recommended sequence per run:
1. `bun run beep kg publish --target both --mode full --group <run-group>`
2. `bun run beep kg verify --target both --group <run-group> --commit <sha>`
3. `bun run beep kg parity --profile code-graph-strict --group <run-group> --strict-min-paths 1`
4. Archive receipts/logs under `outputs/p7-kg-excellence/evidence/`

## Multi-Clone Traffic Routing
When multiple local clones/agents run in parallel, route all Graphiti MCP calls through a shared queue proxy:

1. Start proxy once on the host:
   `bun run graphiti:proxy`
2. Point all clone MCP clients to:
   `http://127.0.0.1:8123/mcp`
3. Monitor pressure and queue depth:
   `curl http://127.0.0.1:8123/metrics`
4. Tune if needed:
   - `GRAPHITI_PROXY_CONCURRENCY` (default `1`)
   - `GRAPHITI_PROXY_MAX_QUEUE` (default `500`)
   - `GRAPHITI_PROXY_REQUEST_TIMEOUT_MS` (default `60000`)

This enforces one shared backpressure surface across clones and prevents direct parallel overload against Graphiti.

## Isolation Proof
Run groups:
- A: `beep-ast-kg-iso-a-20260226T004823Z`
- B: `beep-ast-kg-iso-b-20260226T004823Z`

Artifacts:
- `outputs/p7-kg-excellence/evidence/20260226T004823Z-iso-verify-a-before.json`
- `outputs/p7-kg-excellence/evidence/20260226T004823Z-iso-verify-b.json`
- `outputs/p7-kg-excellence/evidence/20260226T004823Z-iso-verify-a-after.json`

Observed:
- Group A before B: fileCount 244, commitCount 1.
- Group B after publish: fileCount 244, commitCount 1.
- Group A after B: unchanged (fileCount 244, commitCount 1).

Decision: cross-group overwrite eliminated and isolation verified.
