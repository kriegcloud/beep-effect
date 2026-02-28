# P3 Graphiti Engineer Prompt — Persistence + Replay Idempotency

## Mission
Implement Graphiti persistence/upsert/replay behavior for per-file deterministic episodes.

## Inputs
1. `outputs/p2-design/graphiti-persistence-contract.md`
2. `outputs/p2-design/kg-schema-v1.md`
3. `handoffs/HANDOFF_P2.md`
4. Reuse anchors:
- `apps/web/src/lib/graphiti/client.ts`
- `tooling/agent-eval/src/graphiti/mcp.ts`
- `.mcp.json`

## Required Output
1. `outputs/p3-execution/agents/graphiti-engineer.md`

## Required Checks
1. Envelope remains `AstKgEpisodeV1` in `episode_body` with `source="json"` preferred.
2. Group remains stable `beep-ast-kg` with commit metadata.
3. Replay semantics are idempotent for per-file writes.
4. Outage path preserves local deterministic cache fallback.

## Exit Gate
1. Duplicate replay does not create duplicate semantic growth.
2. Conflict policy is deterministic and tested.
3. No persistence-level TBD remains in agent output.
