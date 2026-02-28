# P0 Reuse vs Build Matrix

## Scope
This matrix locks what to reuse now versus what must be newly implemented for AST KG + JSDoc semantic enrichment.

| Area | Decision | Reuse Anchors | Build Required | Why Existing Code Is Insufficient |
|---|---|---|---|---|
| JSDoc governance and tag policy | Reuse | `eslint.config.mjs`, `tsdoc.json`, `package.json` + workspace `docgen.json` files | No | The repo already defines tag vocabulary (`@domain`, `@provides`, `@depends`, `@errors`) and enforcement pathways; duplicating policy would create drift. |
| Graphiti MCP transport/session pattern | Reuse | `apps/web/src/lib/graphiti/client.ts`, `tooling/agent-eval/src/graphiti/mcp.ts`, `.mcp.json` | No | Existing code already handles MCP initialization/call flow and error boundaries. |
| Hook input/output contracts | Reuse | `.claude/hooks/schemas/index.ts`, `.claude/hooks/*/run.sh` | No | Shared schema and wrappers already define hook I/O shape and execution wrappers. |
| Hook orchestration entrypoint | Hybrid | `.claude/hooks/skill-suggester/index.ts` | Yes (KG packet module) | Existing hook suggests skills, but has no AST KG retrieval/compaction/latency-guard module. |
| Benchmark execution/report pipeline | Reuse | `tooling/agent-eval/src/benchmark/*`, `tooling/agent-eval/src/commands/bench.ts`, `tooling/agent-eval/src/schemas/*` | Partial | Existing bench framework can host new condition/metrics; AST-KG-specific measurements and assertions are missing. |
| AST entity extraction engine | Build | none | Yes | No current repo module builds a deterministic repo-wide TypeScript AST + type relationship graph. |
| JSDoc semantic edge mapper | Build | none | Yes | Existing JSDoc rules enforce docs quality but do not map tags into graph edges with deterministic IDs/provenance. |
| Deterministic local KG cache | Build | none | Yes | Existing Graphiti clients are online tool consumers; there is no local canonical deterministic snapshot cache. |
| Per-file delta ingestion planner | Build | none | Yes | Current tooling has bench/workflow utilities but no AST delta planner with commit-aware invalidation. |
| Graphiti episode serializer/upsert policy | Build | Existing call helpers in `apps/web` and `tooling/agent-eval` | Yes | Current writers post freeform episodes/facts; AST KG needs stable envelope + idempotent update rules. |
| Hybrid read combiner | Build | Existing Graphiti search clients | Yes | No component currently merges deterministic cache retrieval with semantic Graphiti recall under a single contract. |
| Hook latency guard + fallback policy | Build | Hook wrappers and schema contracts | Yes | Existing hook flow lacks explicit KG timeout budget enforcement and graceful drop behavior for enrichment packets. |

## Ownership + Phase Targets

| Build Item | Owner | Target Phase |
|---|---|---|
| AST entity extraction engine | AST Engineer | P2 |
| JSDoc semantic edge mapper | Semantic Engineer | P2 |
| Deterministic local KG cache | AST Engineer | P2 |
| Per-file delta ingestion planner | AST Engineer | P2 |
| Graphiti episode serializer/upsert policy | Graphiti Engineer | P2 |
| Hybrid read combiner | Graphiti Engineer | P3 |
| Hook KG packet module + guardrails | Hook Engineer | P3 |
| Bench condition + latency assertions | Eval Engineer | P3/P4 |

## Lock Statement
P1-P4 agents must treat this matrix as authoritative. Any change requires an explicit ADR with source or in-repo proof.
