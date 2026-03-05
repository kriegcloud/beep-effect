# P2 Graphiti Contract Agent Prompt — Persistence Freeze

## Mission
Freeze Graphiti persistence and replay/idempotency contracts for AST KG episodes.

## Inputs
1. `README.md` lock tables
2. `outputs/p1-research/landscape-comparison.md`
3. `outputs/p1-research/reuse-vs-build-matrix.md`
4. `outputs/p1-research/constraints-and-gaps.md`
5. Reuse anchors:
- `apps/web/src/lib/graphiti/client.ts`
- `tooling/agent-eval/src/graphiti/mcp.ts`
- `.mcp.json`

## Required Output
1. `outputs/p2-design/graphiti-persistence-contract.md`

## Required Checks
1. Envelope remains `AstKgEpisodeV1` in `episode_body` with `source="json"` preferred.
2. Stable group policy remains `beep-ast-kg` with commit metadata.
3. Idempotent replay/upsert semantics are explicit for per-file delta writes.
4. Graphiti outage behavior preserves hybrid read fallback to local deterministic cache.

## Exit Gate
1. Write-path conflict/update policy is deterministic.
2. Replay and duplicate-write handling is specified with acceptance checks.
3. No persistence-level TBD remains.
