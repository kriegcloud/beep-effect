# P1 Reuse vs Build Matrix (Revalidated)

## Scope
Revalidate P0 reuse/build boundaries against current repository anchors before P2 contract freeze.

## Reuse/Build Decisions

| Area | P1 Decision | Repo Proof | Build Needed | P2 Contract Target |
|---|---|---|---|---|
| JSDoc governance and tags | Reuse | `eslint.config.mjs`, `tsdoc.json`, `package.json` + workspace `docgen.json` | No | Extraction contract references existing tag vocabulary and enforcement path. |
| Graphiti MCP transport/session conventions | Reuse | `apps/web/src/lib/graphiti/client.ts`, `tooling/agent-eval/src/graphiti/mcp.ts`, `.mcp.json` | No | Graphiti persistence contract must layer serializer/upsert policy on top of existing transport behavior. |
| Hook input/output schema and wrappers | Reuse | `.claude/hooks/schemas/index.ts`, `.claude/hooks/*/run.sh` | No | Query/hook contract must remain compatible with existing hook execution envelope. |
| Hook orchestration entrypoint | Hybrid | `.claude/hooks/skill-suggester/index.ts` | Yes (KG packet module) | Query/hook contract defines retrieval/ranking/timeout behavior for injected KG context packet. |
| Benchmark execution/report scaffolding | Reuse | `tooling/agent-eval/src/benchmark/*`, `tooling/agent-eval/src/commands/bench.ts`, `tooling/agent-eval/src/schemas/*` | Partial | Evaluation design adds KG-specific condition, latency/assertion thresholds, and lift metrics. |
| AST/type extraction engine | Build | no direct reusable module | Yes | Schema + extraction contracts define deterministic entity/edge production rules. |
| JSDoc semantic edge mapper | Build | no direct reusable module | Yes | Extraction contract maps locked tags to locked edge types/provenance. |
| Deterministic local cache | Build | no direct reusable module | Yes | Incremental update design defines format, retention, invalidation, replay behavior. |
| Per-file delta planner | Build | no direct reusable module | Yes | Incremental update design freezes changed-file + widening policy. |
| Graphiti episode serializer/upsert policy | Build | existing Graphiti clients provide transport only | Yes | Graphiti persistence contract freezes `AstKgEpisodeV1` and idempotent replay semantics. |
| Hybrid read combiner | Build | Graphiti query helpers exist but no merged deterministic+semantic read layer | Yes | Query/hook contract freezes merge/rank/confidence behavior. |
| Hook latency guard + failure fallback | Build | wrappers exist but no KG timeout/disable policy | Yes | Query/hook + rollout contracts freeze timeout and fallback controls. |

## Verification Notes
1. All P0 reuse anchors referenced above still exist in repo.
2. No row changed classification from P0; no ADR required in P1.
3. All build rows retain explicit insufficiency rationale.

## Lock Statement
This matrix is frozen for P2 design authoring. Any boundary change requires ADR + source/repo proof and explicit lock-table update.
