# Reuse Audit Agent Output (P0)

## Mission
Determine exact reuse-vs-build boundaries with file-level proof.

## Reuse Conclusions
1. Reuse JSDoc and tag policy from `eslint.config.mjs` + `tsdoc.json` + existing `@effect/docgen` scripts/configs.
2. Reuse Graphiti transport/session/error conventions from `apps/web/src/lib/graphiti/client.ts`, `tooling/agent-eval/src/graphiti/mcp.ts`, and `.mcp.json`.
3. Reuse hook schemas/wrappers from `.claude/hooks/schemas/index.ts` and `.claude/hooks/*/run.sh`.
4. Reuse benchmark execution/report scaffolding under `tooling/agent-eval/src/benchmark/*`, `tooling/agent-eval/src/commands/bench.ts`, and `tooling/agent-eval/src/schemas/*`.

## Build Conclusions
1. Build deterministic AST KG extractor and local canonical cache.
2. Build JSDoc semantic edge mapper.
3. Build per-file delta planner and idempotent Graphiti serializer.
4. Build hook KG packet builder with strict timeout/fallback.

## Deliverable Link
- `outputs/p0-research/reuse-vs-build-matrix.md`
