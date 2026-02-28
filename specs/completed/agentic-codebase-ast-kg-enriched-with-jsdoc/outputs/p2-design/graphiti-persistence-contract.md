# Graphiti Persistence Contract

## Purpose
Define deterministic Graphiti ingestion, replay, and outage behavior for per-file AST KG episodes.

## Lock Alignment (Normative)

| Decision Surface | Frozen Value |
|---|---|
| Read path policy | `hybrid` (`local deterministic cache` + `Graphiti semantic layer`) |
| Ingestion granularity | `per-file delta` |
| Group strategy | Stable `beep-ast-kg` with commit metadata |
| Graphiti envelope | `AstKgEpisodeV1` in `episode_body` with `source="json"` preferred; strict text fallback template otherwise |
| Hook fail behavior | Hard timeout + no-throw remains unchanged; Graphiti write/read errors must not break hook output |

## Reuse Boundary
Reuse existing transport/session wrappers only:
- `apps/web/src/lib/graphiti/client.ts`
- `tooling/agent-eval/src/graphiti/mcp.ts`
- `.mcp.json`

No alternate Graphiti transport path is introduced by this contract.

## Group and Key Policy
- `group_id`: `beep-ast-kg`
- Episode scope: one episode per `(workspace, commitSha, file)`
- Envelope name format:
`ast-kg:<workspace>:<commitSha>:<file>`

## Envelope Schema (`AstKgEpisodeV1`)

```json
{
  "envelopeVersion": "AstKgEpisodeV1",
  "schemaVersion": "kg-schema-v1",
  "workspace": "beep-effect3",
  "groupId": "beep-ast-kg",
  "mode": "full|delta",
  "commit": {
    "sha": "abcdef1234...",
    "parentSha": "1234abcd...",
    "branch": "main"
  },
  "file": "packages/example/src/foo.ts",
  "artifactHash": "sha256-hex",
  "nodeCount": 0,
  "edgeCount": 0,
  "semanticEdgeCount": 0,
  "nodes": [],
  "edges": []
}
```

## Source Preference and Fallback
1. Preferred write:
`source = "json"` with serialized `AstKgEpisodeV1` payload in `episode_body`.
2. Strict fallback template when JSON write is unavailable:
`AST_KG_EPISODE_V1|workspace=<workspace>|group=<group>|commit=<sha>|file=<path>|artifactHash=<hash>|nodeCount=<n>|edgeCount=<n>`
3. Fallback payload must remain parseable by a deterministic parser for replay tooling.

## Deterministic Episode UUID
UUID input tuple:
`group_id|workspace|commitSha|file|schemaVersion`

UUID policy:
1. Compute SHA-256 of tuple.
2. Use hex digest as deterministic episode UUID.

Fixture:
- Tuple:
`beep-ast-kg|beep-effect3|9f1c2d3a4b5c6d7e8f901234567890abcdef1234|packages/ast-kg/src/index.ts|kg-schema-v1`
- SHA-256:
`b715e5df340cc2ca0c6250356f9205b741b97578a0627f1bedd6e8fcd9fbd831`

## Upsert and Replay Semantics
1. Writes are keyed by deterministic episode UUID.
2. Replay of the same commit and file with identical `artifactHash` is a no-op.
3. Replay with same UUID and different `artifactHash` is treated as deterministic conflict and fails the run.
4. Delta mode writes only selected files; full mode writes all in-scope files.
5. Per-run manifest records written UUIDs and hashes for audit.

## Conflict Policy

| Case | Action |
|---|---|
| Same UUID, same artifact hash | Skip write and record replay hit |
| Same UUID, different artifact hash | Fail run and require full rebuild before retry |
| Missing prior UUID in delta replay | Write new episode and continue |

## Read Contract in Hybrid Mode
1. Local deterministic cache is canonical source for low-latency deterministic graph reads.
2. Graphiti layer augments semantic and temporal context.
3. If Graphiti read fails or times out, local-only response is returned.

## Outage and Recovery Contract
1. On Graphiti write outage, persist pending episodes to local spool:
`tooling/ast-kg/.cache/graphiti-spool/<commitSha>.jsonl`
2. Hook/read path continues with local deterministic cache only.
3. Recovery command replays spool entries in deterministic order by `(commitSha,file)`.
4. Recovery replay obeys same UUID/hash conflict policy.

## Acceptance Checks
1. Same run replay writes zero new episodes.
2. Cross-run replay at same commit/file yields same UUID and `artifactHash`.
3. Simulated Graphiti outage produces valid local spool and successful local-only hook behavior.
4. Recovery replay clears spool without duplicate semantic graph growth.

## P3 Ownership Handoff
- Graphiti Engineer:
serializer, UUID generation, upsert/replay conflict handling, outage spool and replay command.
- AST Engineer:
provide deterministic per-file artifacts and `artifactHash`.
- Hook Engineer:
consume local-only fallback mode when Graphiti is unavailable.
- Orchestrator:
gate merge on replay-idempotency acceptance checks.

## Freeze Statement
Persistence behavior is fully fixed for group policy, envelope schema, deterministic replay keys, conflict handling, and outage fallback.
