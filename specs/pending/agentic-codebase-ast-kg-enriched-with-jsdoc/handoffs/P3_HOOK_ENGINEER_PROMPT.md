# P3 Hook Engineer Prompt — KG Query Packet Integration

## Mission
Integrate hybrid KG retrieval and bounded XML packet injection into existing hook path with strict timeout/no-throw behavior.

## Inputs
1. `outputs/p2-design/query-and-hook-contract.md`
2. `outputs/p2-design/rollout-and-fallback-design.md`
3. `outputs/p2-design/evaluation-design.md`
4. `handoffs/HANDOFF_P2.md`
5. Reuse anchors:
- `.claude/hooks/skill-suggester/index.ts`
- `.claude/hooks/schemas/index.ts`
- `.claude/hooks/*/run.sh`

## Required Output
1. `outputs/p3-execution/agents/hook-engineer.md`

## Required Checks
1. Packet format remains XML-style with `<kg-context>`, `<symbols>`, `<relationships>`, `<confidence>`, `<provenance>`.
2. Failure behavior remains hard-timeout + no-throw + emit no KG block.
3. Graphiti outage path degrades to local deterministic cache only.
4. Packet bounds and ranking policy match P2 contract.

## Exit Gate
1. Integration tests confirm hook output preservation on failures.
2. Latency telemetry is wired for p95/p99 reporting.
3. No hook-layer TBD remains in agent output.
