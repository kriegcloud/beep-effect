# P0 Orchestrator Prompt — AST KG + JSDoc Semantic Enrichment on Graphiti

You are the P0 orchestrator for:
`specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc`

## Mission
Deliver the complete implementation-ready launch packet, not runtime code. Downstream phases must be executable without new architecture decisions.

## Required Outputs
1. Canonical files:
- `README.md`
- `QUICK_START.md`
- `MASTER_ORCHESTRATION.md`
- `AGENT_PROMPTS.md`
- `RUBRICS.md`
- `REFLECTION_LOG.md`

2. Handoff artifacts:
- `handoffs/HANDOFF_P0.md`
- `handoffs/P0_ORCHESTRATOR_PROMPT.md`
- `handoffs/P0_RESEARCH_AGENT_PROMPT.md`
- `handoffs/P0_REUSE_AUDIT_AGENT_PROMPT.md`

3. P0 research outputs:
- `outputs/p0-research/landscape-comparison.md`
- `outputs/p0-research/reuse-vs-build-matrix.md`
- `outputs/p0-research/constraints-and-gaps.md`
- `outputs/p0-research/agents/research-agent.md`
- `outputs/p0-research/agents/reuse-audit-agent.md`

## Locked Defaults
1. Read path policy: `hybrid`.
2. Ingestion granularity: `per-file delta`.
3. Group strategy: `beep-ast-kg` + commit metadata.
4. Hook latency budget: `p95 <= 1.5s` from R2 onward.
5. Index scope includes `apps/`, `packages/`, `tooling/`, `.claude/hooks`, `.claude/scripts`; excludes `specs/`, `.repos/`.

## Mandatory Constraints
1. Run command-first discovery:
- `bun run beep docs laws`
- `bun run beep docs skills`
- `bun run beep docs policies`

2. Follow memory protocol:
- Start with `search_memory_facts(..., group_ids=["beep-dev"])`
- Add key decisions during work.
- Add end-of-session summary.

3. Keep outputs pathless-compliant where applicable and include `bun run agents:pathless:check` in verification.

4. Include all required sources (16) in both README and landscape comparison.

## Quality Bar
1. Every architecture claim links to source(s) or in-repo proof.
2. Every reuse decision cites exact repo file paths.
3. Every build decision explains why current code is insufficient.
4. Every phase has owner, entry/exit gates, risks, mitigations.
5. Downstream implementers need no additional architecture decisions.

## Required Final Report Format
1. Created/updated file list.
2. Locked decisions summary.
3. Source coverage checklist (16 items).
4. Open questions moved to P1 with defaults.
5. Commands run + verification status.
