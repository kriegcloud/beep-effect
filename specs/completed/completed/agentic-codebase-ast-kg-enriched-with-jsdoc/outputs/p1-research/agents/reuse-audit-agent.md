# Reuse Audit Agent Output (P1)

## Mission
Revalidate P0 reuse/build boundaries against current repository file anchors before P2 contracts are frozen.

## Outcome
1. Every locked reuse anchor from P0 still resolves to existing repo files.
2. No reuse/build row requires reclassification in P1.
3. Build-required areas remain unchanged: extractor, semantic mapper, deterministic cache, delta planner, Graphiti serializer/upsert, hybrid read combiner, hook packet/guardrail logic.

## Verified Reuse Anchors
- `eslint.config.mjs`, `tsdoc.json`, workspace `docgen.json` files
- `apps/web/src/lib/graphiti/client.ts`
- `tooling/agent-eval/src/graphiti/mcp.ts`
- `.mcp.json`
- `.claude/hooks/schemas/index.ts`
- `.claude/hooks/*/run.sh`
- `.claude/hooks/skill-suggester/index.ts`
- `tooling/agent-eval/src/benchmark/*`
- `tooling/agent-eval/src/commands/bench.ts`
- `tooling/agent-eval/src/schemas/*`

## P2 Freeze Guidance
1. Treat current reuse/build matrix as authoritative baseline.
2. Require ADR for any boundary change that modifies lock assumptions.
3. Keep hook and Graphiti contracts additive to existing transport/schema wrappers.

## Deliverable Link
- `outputs/p1-research/reuse-vs-build-matrix.md`
