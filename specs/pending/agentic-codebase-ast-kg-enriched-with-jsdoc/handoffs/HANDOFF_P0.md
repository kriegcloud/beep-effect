# HANDOFF P0 — Launch Packet Complete (Hardened)

## Objective
Provide a decision-complete package so the next instance can start P1 (contract freeze) without making architecture choices.

## Locked Defaults (Do Not Reopen in P1 Unless ADR)
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

## Gap Closure Against Initial Plan
Gap closure record is captured at:
- `outputs/p0-research/gap-closure-against-initial-plan.md`

All previously missing P1 execution prompt files were added and cross-linked.

## P0 Completion Checklist
- [x] Canonical spec files present and internally consistent.
- [x] P0 handoff prompts complete for orchestrator + two research agents.
- [x] P0 outputs created with full source coverage.
- [x] Defaults and interface contracts locked and documented.
- [x] Reuse-vs-build matrix complete with repo file references.
- [x] Risks/mitigations documented with quantitative targets.
- [x] Shared memory updated with P0 summary.

## Deliverables
1. Canonical files:
- `README.md`
- `QUICK_START.md`
- `MASTER_ORCHESTRATION.md`
- `AGENT_PROMPTS.md`
- `RUBRICS.md`
- `REFLECTION_LOG.md`

2. Handoffs:
- `handoffs/HANDOFF_P0.md`
- `handoffs/P0_ORCHESTRATOR_PROMPT.md`
- `handoffs/P0_RESEARCH_AGENT_PROMPT.md`
- `handoffs/P0_REUSE_AUDIT_AGENT_PROMPT.md`
- `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- `handoffs/P1_RESEARCH_AGENT_PROMPT.md`
- `handoffs/P1_REUSE_AUDIT_AGENT_PROMPT.md`

3. P0 outputs:
- `outputs/p0-research/landscape-comparison.md`
- `outputs/p0-research/reuse-vs-build-matrix.md`
- `outputs/p0-research/constraints-and-gaps.md`
- `outputs/p0-research/gap-closure-against-initial-plan.md`
- `outputs/p0-research/agents/research-agent.md`
- `outputs/p0-research/agents/reuse-audit-agent.md`

## Required Source Coverage (16/16)
- [x] S1 FalkorDB code-graph README
- [x] S2 FalkorDB code-graph-backend README
- [x] S3 Code-Graph-RAG README
- [x] S4 Graphiti README
- [x] S5 Graphiti MCP server docs
- [x] S6 ts-morph docs
- [x] S7 ts-morph JSDoc API
- [x] S8 ts-morph types API
- [x] S9 TypeScript Compiler API wiki
- [x] S10 TSConfig incremental option
- [x] S11 tree-sitter advanced parsing
- [x] S12 SCIP protocol docs
- [x] S13 scip-typescript README
- [x] S14 Nx affected docs
- [x] S15 TypeDoc output options
- [x] S16 CodeQL supported languages/frameworks

## Open Questions Moved to P1 (Defaults Applied)
1. Symbol ID hash field detail -> default in P0: `workspace+path+symbol+kind+signature`.
2. Cache file retention policy -> default in P0: JSONL snapshots by commit SHA.
3. SCIP merge depth -> default in P0: optional secondary source.

## Required Verification Commands
1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`
4. `bun run agents:pathless:check`
