# HANDOFF P2 — Contract and Design Freeze Complete

## Objective
Provide an execution-ready package so P3 implementation can start without reopening architecture decisions.

## Locked Defaults (Do Not Reopen in P3 Unless ADR)
1. Read path policy: `hybrid` (local deterministic cache + Graphiti semantic layer).
2. Ingestion granularity: `per-file delta`.
3. Group strategy: stable `beep-ast-kg` + commit metadata.
4. Hook latency budget: enforce `p95 <= 1.5s` from R2 onward.
5. Index scope include: `apps/`, `packages/`, `tooling/`, `.claude/hooks`, `.claude/scripts`; exclude: `specs/`, `.repos/`.

## Locked Interface Defaults
1. CLI commands: `bun run beep kg index --mode full` and `bun run beep kg index --mode delta --changed <paths>`.
2. Node ID shape: `<workspace>::<file>::<symbol>::<kind>::<signature-hash>`.
3. Edge provenance: `ast | type | jsdoc`.
4. Tag-edge mappings: `@category/@module/@domain/@provides/@depends/@errors` to locked edges.
5. Graphiti envelope: `AstKgEpisodeV1` in `episode_body` with `source="json"` preferred.
6. Hook context packet shape: XML-style `<kg-context>` block with symbols/relationships/confidence/provenance.
7. Hook fail behavior: hard timeout and no-throw, emit no KG block on failure.

## P2 Deliverables (Complete)
1. `outputs/p2-design/kg-schema-v1.md`
2. `outputs/p2-design/extraction-contract.md`
3. `outputs/p2-design/graphiti-persistence-contract.md`
4. `outputs/p2-design/incremental-update-design.md`
5. `outputs/p2-design/query-and-hook-contract.md`
6. `outputs/p2-design/evaluation-design.md`
7. `outputs/p2-design/rollout-and-fallback-design.md`

## P2 Resolution of Carried Defaults
1. Deterministic hash canon fixed with fixtures/examples.
2. Cache retention/invalidation fixed on JSONL snapshots keyed by commit SHA.
3. Delta widening fixed as changed-file first with dependency-aware widening.
4. Graphiti replay/upsert fixed with deterministic per-file episode semantics.
5. Hook ranking/packet bounds fixed with explicit top-k and size limits.
6. SCIP fixed as optional, non-blocking overlay.

## Required P3 Handoff Prompt Set (Authored)
1. `handoffs/P3_ORCHESTRATOR_PROMPT.md`
2. `handoffs/P3_AST_ENGINEER_PROMPT.md`
3. `handoffs/P3_SEMANTIC_ENGINEER_PROMPT.md`
4. `handoffs/P3_GRAPHITI_ENGINEER_PROMPT.md`
5. `handoffs/P3_HOOK_ENGINEER_PROMPT.md`
6. `handoffs/P3_EVAL_ENGINEER_PROMPT.md`

## P2 Completion Rule
P2 is complete only when:
1. All seven P2 design outputs exist with `TBD=0`.
2. Lock-consistency checks pass.
3. The full P3 handoff prompt set above exists.

## P3 Start Inputs
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. `handoffs/HANDOFF_P0.md`
4. `handoffs/HANDOFF_P2.md`
5. `outputs/p2-design/*`

## Required Verification Commands
1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`
4. `bun run agents:pathless:check`
