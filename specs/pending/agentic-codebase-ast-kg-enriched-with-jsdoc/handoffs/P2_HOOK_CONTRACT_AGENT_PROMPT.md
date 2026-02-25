# P2 Hook Contract Agent Prompt — Query, Packet, and Reliability Freeze

## Mission
Freeze query composition, hook packet contract, latency budget policy, and rollout/fallback contract inputs.

## Inputs
1. `README.md` lock tables
2. `outputs/p1-research/landscape-comparison.md`
3. `outputs/p1-research/reuse-vs-build-matrix.md`
4. `outputs/p1-research/constraints-and-gaps.md`
5. Reuse anchors:
- `.claude/hooks/skill-suggester/index.ts`
- `.claude/hooks/schemas/index.ts`
- `.claude/hooks/*/run.sh`
- `tooling/agent-eval/src/benchmark/*`
- `tooling/agent-eval/src/commands/bench.ts`
- `tooling/agent-eval/src/schemas/*`

## Required Outputs
1. `outputs/p2-design/query-and-hook-contract.md`
2. `outputs/p2-design/evaluation-design.md`
3. `outputs/p2-design/rollout-and-fallback-design.md`

## Required Checks
1. Hook packet format remains XML-style compact block with `<kg-context>`, `<symbols>`, `<relationships>`, `<confidence>`, `<provenance>`.
2. Hook failure behavior remains hard-timeout + no-throw + emit no KG block.
3. Latency policy enforces `p95 <= 1.5s` from R2 onward.
4. Rollout stages remain `R0 Shadow`, `R1 Advisory`, `R2 Limited On`, `R3 Default On` with lock-consistent fallback triggers.

## Exit Gate
1. Query ranking/top-k/token budget policy is explicit and testable.
2. Evaluation metrics align with README quantitative targets.
3. No hook/evaluation/rollout TBD remains.
