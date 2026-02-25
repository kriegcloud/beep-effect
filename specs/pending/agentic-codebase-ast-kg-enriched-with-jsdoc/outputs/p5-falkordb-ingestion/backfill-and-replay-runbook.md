# P5 Backfill and Replay Runbook

## Status
COMPLETE

## Purpose
Operational procedure for deterministic AST KG backfill, replay/idempotency checks, and Graphiti/FalkorDB publication to `beep-ast-kg`.

## Preconditions
1. Local Graphiti MCP is healthy: `http://localhost:8000/mcp`.
2. FalkorDB container is reachable.
3. Repo commit is stable for deterministic replay validation.

## Backfill Procedure

1. Build deterministic local KG snapshot and ledger.
- Command: `bun run beep kg index --mode full`
- Expected: `selectedCount=<in-scope files>`, `writes>0`, `packetNoThrow=true`.

2. Validate deterministic replay locally.
- Command: rerun `bun run beep kg index --mode full`
- Expected: `writes=0`, `replayHits=<selectedCount>`.

3. Produce publication envelopes via spool (outage path).
- Command: `BEEP_KG_FORCE_GRAPHITI_OUTAGE=true bun run beep kg index --mode full`
- Expected: `spoolWrites=<selectedCount>` and JSONL file at:
  - `tooling/ast-kg/.cache/graphiti-spool/<commitSha>.jsonl`

4. Publish spool envelopes to Graphiti MCP.
- For each JSONL line:
  - `name=ast-kg:<workspace>:<commitSha>:<file>`
  - `episode_body=<serialized AstKgEpisodeV1 JSON>`
  - `source=json`
  - `group_id=beep-ast-kg`
- Expected: each `add_memory` call returns queued acceptance.

5. Verify persisted publication in FalkorDB.
- Commands:
  - `GRAPH.QUERY beep-ast-kg "MATCH (n) RETURN count(n)"`
  - `GRAPH.QUERY beep-ast-kg "MATCH ()-[r]->() RETURN count(r)"`
  - `GRAPH.QUERY beep-ast-kg "MATCH (e:Episodic) RETURN count(e)"`
  - Content checks for commit/provenance/group in `e.content`.

## Replay / Idempotency Semantics

### Local deterministic gate (authoritative)
- Idempotency is enforced before publication by local ledger keying on deterministic episode UUID and `artifactHash`.
- Expected replay behavior:
  - Same commit + same file + same hash => replay hit, no write.
  - Same deterministic UUID + different hash => conflict, fail run.

### Graphiti target behavior (observed)
- `add_memory` is asynchronous and queue-based.
- Transport acceptance (`queued for processing`) is not equivalent to immediate query visibility.
- Use direct FalkorDB graph queries when MCP read tools lag or return empty during ingestion windows.

## Recovery Controls

1. Graphiti unavailable.
- Keep local indexing active.
- Use spool fallback (`BEEP_KG_FORCE_GRAPHITI_OUTAGE=true`) to capture publish payloads.

2. Replay after service recovery.
- Re-run publisher over spool JSONL in deterministic file order.
- Verify counts using FalkorDB queries.

3. Deterministic conflict detected locally.
- Stop publication.
- Run full rebuild: `bun run beep kg index --mode full`.
- Re-generate spool and replay publication.

4. Read-path mismatch (MCP empty but DB non-empty).
- Treat FalkorDB `GRAPH.QUERY` as source of truth for persistence validation.
- Record mismatch in execution log and continue with direct DB evidence.

## Commands Used in This P5 Run (2026-02-25)
1. `bun run beep kg index --mode full`
2. `bun run beep kg index --mode full` (replay)
3. `bun run beep kg index --mode delta --changed tooling/cli/src/commands/kg.ts`
4. `BEEP_KG_FORCE_GRAPHITI_OUTAGE=true bun run beep kg index --mode full`
5. Batch `add_memory` publish from spool JSONL to `group_id=beep-ast-kg`
6. FalkorDB verification with `GRAPH.QUERY`
