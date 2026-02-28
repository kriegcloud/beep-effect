# P0 Reuse Audit Agent Prompt

## Goal
Produce a precise reuse-vs-build boundary for implementation phases, grounded in existing repo assets.

## Inputs
1. `README.md`
2. `outputs/p0-research/reuse-vs-build-matrix.md` (update/complete)
3. Required reuse anchors:
- `eslint.config.mjs`
- `tsdoc.json`
- workspace `@effect/docgen` usage
- `apps/web/src/lib/graphiti/client.ts`
- `tooling/agent-eval/src/graphiti/mcp.ts`
- `.mcp.json`
- `.claude/hooks/skill-suggester/index.ts`
- `.claude/hooks/schemas/index.ts`
- `.claude/hooks/*/run.sh`
- `tooling/agent-eval/src/benchmark/*`
- `tooling/agent-eval/src/commands/bench.ts`
- `tooling/agent-eval/src/schemas/*`

## Required Tasks
1. For each area, classify as `reuse`, `build`, or `hybrid`.
2. For `reuse`: cite exact file(s) and explain what is reused directly.
3. For `build`: explain why existing code is insufficient.
4. For `hybrid`: split reusable pieces from new components.
5. Include ownership and target phase for each build item.

## Output
Write/update: `outputs/p0-research/reuse-vs-build-matrix.md`

## Done Criteria
- Every row has exact repo file references.
- Every build row includes insufficiency rationale.
- Matrix is implementation-ready for P1/P2 planning.
