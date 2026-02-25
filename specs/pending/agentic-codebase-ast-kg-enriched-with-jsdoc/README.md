# Agentic Codebase AST KG Enriched With JSDoc

## Status
IN PROGRESS (P7 KG excellence gap-closure phase opened after P6 full-repo dual-write evidence)

## Owner
@elpresidank

## Created
2026-02-25

## Updated
2026-02-25

## Quick Navigation
- [Quick Start](./QUICK_START.md)
- [Master Orchestration](./MASTER_ORCHESTRATION.md)
- [Agent Prompts](./AGENT_PROMPTS.md)
- [Rubrics](./RUBRICS.md)
- [Reflection Log](./REFLECTION_LOG.md)
- [P0 Handoff](./handoffs/HANDOFF_P0.md)
- [P0 Orchestrator Prompt](./handoffs/P0_ORCHESTRATOR_PROMPT.md)
- [P0 Research Agent Prompt](./handoffs/P0_RESEARCH_AGENT_PROMPT.md)
- [P0 Reuse Audit Agent Prompt](./handoffs/P0_REUSE_AUDIT_AGENT_PROMPT.md)
- [P1 Orchestrator Prompt](./handoffs/P1_ORCHESTRATOR_PROMPT.md)
- [P1 Research Agent Prompt](./handoffs/P1_RESEARCH_AGENT_PROMPT.md)
- [P1 Reuse Audit Agent Prompt](./handoffs/P1_REUSE_AUDIT_AGENT_PROMPT.md)
- [P2 Handoff](./handoffs/HANDOFF_P2.md)
- [P3 Orchestrator Prompt](./handoffs/P3_ORCHESTRATOR_PROMPT.md)
- [P3 AST Engineer Prompt](./handoffs/P3_AST_ENGINEER_PROMPT.md)
- [P3 Semantic Engineer Prompt](./handoffs/P3_SEMANTIC_ENGINEER_PROMPT.md)
- [P3 Graphiti Engineer Prompt](./handoffs/P3_GRAPHITI_ENGINEER_PROMPT.md)
- [P3 Hook Engineer Prompt](./handoffs/P3_HOOK_ENGINEER_PROMPT.md)
- [P3 Eval Engineer Prompt](./handoffs/P3_EVAL_ENGINEER_PROMPT.md)
- [P4 Handoff](./handoffs/HANDOFF_P4.md)
- [P4 Orchestrator Prompt](./handoffs/P4_ORCHESTRATOR_PROMPT.md)
- [P4 Validation Engineer Prompt](./handoffs/P4_VALIDATION_ENGINEER_PROMPT.md)
- [P4 Rollout Engineer Prompt](./handoffs/P4_ROLLOUT_ENGINEER_PROMPT.md)
- [P5 Orchestrator Prompt](./handoffs/P5_ORCHESTRATOR_PROMPT.md)
- [P5 Ingestion Engineer Prompt](./handoffs/P5_INGESTION_ENGINEER_PROMPT.md)
- [P5 Verification Engineer Prompt](./handoffs/P5_VERIFICATION_ENGINEER_PROMPT.md)
- [P5 Handoff](./handoffs/HANDOFF_P5.md)
- [P6 Orchestrator Prompt](./handoffs/P6_ORCHESTRATOR_PROMPT.md)
- [P6 Schema Parity Engineer Prompt](./handoffs/P6_SCHEMA_PARITY_ENGINEER_PROMPT.md)
- [P6 Dual Write Engineer Prompt](./handoffs/P6_DUAL_WRITE_ENGINEER_PROMPT.md)
- [P6 Query API Engineer Prompt](./handoffs/P6_QUERY_API_ENGINEER_PROMPT.md)
- [P6 Validation Engineer Prompt](./handoffs/P6_VALIDATION_ENGINEER_PROMPT.md)
- [P6 Rollout Engineer Prompt](./handoffs/P6_ROLLOUT_ENGINEER_PROMPT.md)
- [P6 -> P7 Handoff](./handoffs/HANDOFF_P6.md)
- [P7 Orchestrator Prompt](./handoffs/P7_ORCHESTRATOR_PROMPT.md)
- [P7 Performance Engineer Prompt](./handoffs/P7_PERFORMANCE_ENGINEER_PROMPT.md)
- [P7 Reliability Engineer Prompt](./handoffs/P7_RELIABILITY_ENGINEER_PROMPT.md)
- [P7 Query Engineer Prompt](./handoffs/P7_QUERY_ENGINEER_PROMPT.md)
- [P7 Ticket Backlog](./outputs/p7-kg-excellence/tickets.md)
- [Landscape Comparison](./outputs/p0-research/landscape-comparison.md)
- [Reuse vs Build Matrix](./outputs/p0-research/reuse-vs-build-matrix.md)
- [Constraints and Gaps](./outputs/p0-research/constraints-and-gaps.md)
- [Gap Closure vs Initial Plan](./outputs/p0-research/gap-closure-against-initial-plan.md)

## Mission
Produce the implementation-ready orchestration package for repo-wide TypeScript AST knowledge graph indexing with deterministic JSDoc semantic enrichment on Graphiti, so downstream phase engineers can execute without making architecture decisions.

## Initial Plan Alignment
This package is explicitly aligned to [outputs/initial_plan.md](./outputs/initial_plan.md), including its locked defaults, public contract defaults, validation targets, and rollout/fallback controls.

## Locked Defaults (P0)

| Decision Surface | Locked Default | Why |
|---|---|---|
| Read path policy | `hybrid` (`local deterministic cache` + `Graphiti semantic layer`) | Keeps low-latency deterministic reads while preserving semantic retrieval and temporal context from Graphiti MCP workflows. [S4][S5][R4][R5] |
| Ingestion granularity | `per-file delta` | Matches incremental parsing/build workflows from tree-sitter + TypeScript incremental build behavior. [S10][S11] |
| Group strategy | Stable `beep-ast-kg` with commit metadata | Keeps AST KG writes isolated from other Graphiti groups while preserving commit provenance for replay/debug. [S4][S5] |
| Hook latency budget | Enforce `p95 <= 1.5s` starting at R2 rollout stage | Keeps prompt-path reliability for UserPromptSubmit hooks; measured in benchmark harness before promotion. [R7][R8][R10][R11] |
| Index scope | Include `apps/`, `packages/`, `tooling/`, `.claude/hooks`, `.claude/scripts`; exclude `specs/`, `.repos/` | Targets production/runtime and automation code while excluding docs/archive/vendor source. |

## Locked Interface Defaults (From Initial Plan)

| Interface | Locked Contract |
|---|---|
| CLI command set | `bun run beep kg index --mode full` and `bun run beep kg index --mode delta --changed <paths>` |
| KG node ID | `<workspace>::<file>::<symbol>::<kind>::<signature-hash>` |
| KG edge provenance | `provenance = ast | type | jsdoc` |
| Semantic tags to edges | `@category -> IN_CATEGORY`, `@module -> IN_MODULE`, `@domain -> IN_DOMAIN`, `@provides -> PROVIDES`, `@depends -> DEPENDS_ON`, `@errors -> THROWS_DOMAIN_ERROR` |
| Graphiti persistence envelope | `AstKgEpisodeV1` serialized in `episode_body` with `source="json"` when possible; strict text fallback template otherwise |
| Hook context format | XML-style compact block containing `<kg-context>`, `<symbols>`, `<relationships>`, `<confidence>`, `<provenance>` |
| Hook fail behavior | Hard timeout + no-throw: on failure emit no KG block and preserve existing hook output |

## Reuse Boundaries (Locked)

| Area | Reuse Evidence | Decision |
|---|---|---|
| JSDoc governance and tags | `eslint.config.mjs`, `tsdoc.json`, workspace `docgen` scripts and `@effect/docgen` configs (`package.json`, `tooling/*/docgen.json`, `packages/*/docgen.json`) | Reuse existing tag contracts and enforcement; do not invent parallel tag policy. [R1][R2][R3] |
| Graphiti integration pattern | `apps/web/src/lib/graphiti/client.ts`, `tooling/agent-eval/src/graphiti/mcp.ts`, `.mcp.json` | Reuse transport/session/error envelope conventions; build AST-KG-specific serializers and tool payload mapping. [R4][R5][R6] |
| Hook framework | `.claude/hooks/skill-suggester/index.ts`, `.claude/hooks/schemas/index.ts`, `.claude/hooks/*/run.sh` | Reuse hook input/output schema + wrapper structure; build KG retrieval packet module only. [R7][R8][R9] |
| Benchmark framework | `tooling/agent-eval/src/benchmark/*`, `tooling/agent-eval/src/commands/bench.ts`, `tooling/agent-eval/src/schemas/*` | Reuse execution/reporting pipeline; build KG-specific condition and latency assertions only. [R10][R11][R12] |

## Phase Architecture

Phase completion invariant:
No phase is complete until declared outputs exist, phase exit gates pass, and the next-phase handoff prompt set is created.

| Phase | Focus | Required Outputs | Entry Gate | Exit Gate | Owners |
|---|---|---|---|---|---|
| P0 | Launch packet | Canonical files + P0 handoffs + p0-research outputs | Spec path exists | Required-file checklist complete and P1 handoff prompt set exists | Orchestrator |
| P1 | Research and decision-log freeze | `outputs/p1-research/*` | P0 checklist complete | Source coverage 16/16 retained, no lock contradictions, and P2 prompt set authored | Orchestrator + Research + Reuse Audit |
| P2 | Contract and design freeze | `outputs/p2-design/*` | P1 complete | `TBD=0`, command surface fixed, schema + persistence + hook contracts frozen, and P3 handoff prompt set exists | Orchestrator + Schema + Graphiti Contract + Hook Contract |
| P3 | Core implementation and integration | `outputs/p3-execution/*` + code changes | P2 complete | Full and delta indexing smoke pass, idempotent persistence pass, and P4 handoff prompt set exists | AST/Type + Semantic + Graphiti + Hook + Eval Engineers |
| P4 | Validation + rollout readiness | `outputs/p4-validation/*` | P3 complete | Thresholds met and fallback drill pass | Validation + Rollout Engineers |
| P5 | FalkorDB ingestion completion (gap closure) | `outputs/p5-falkordb-ingestion/*` | P4 complete | AST KG is published to Graphiti/FalkorDB group `beep-ast-kg`, verification queries return expected entities/edges, and P5 handoff prompt set exists | Orchestrator + Ingestion Engineer + Verification Engineer |
| P6 | Dual-write + Falkor parity hardening | `outputs/p6-dual-write-parity/*` | P5 complete | Dual-write publish/verify/parity/replay commands are operational with evidence-backed manual signoff packet | Orchestrator + Schema Parity + Dual Write + Query API + Validation + Rollout Engineers |
| P7 | KG excellence gap closure | `outputs/p7-kg-excellence/*` | P6 packet complete | All P6 known gaps ticketed and resolved with measured performance/reliability gains | Orchestrator + Performance + Query + Reliability + Operations Engineers |

## Quantitative Validation Targets

| Category | Metric | Target |
|---|---|---|
| Graph coverage/correctness | Exported symbol coverage | `>= 98%` |
| Graph coverage/correctness | Import edge precision (manual sample) | `>= 95%` |
| Graph coverage/correctness | Call edge precision (manual sample) | `>= 90%` |
| Graph coverage/correctness | Determinism (same commit => same IDs/hashes) | `100%` |
| Semantic enrichment | Required tag parse success (`@category,@module,@since,@param,@returns`) | `>= 99%` |
| Semantic enrichment | Domain edge precision (`@domain/@provides/@depends/@errors`) | `>= 90%` |
| Semantic enrichment | Semantic edge recall on labeled set | `>= 85%` |
| Query usefulness | Top-5 hit rate on curated prompt set | `>= 80%` |
| Query usefulness | Hook KG relevance (human review) | `>= 4.0/5` |
| Query usefulness | Hook latency p95 (warm) | `<= 1.5s` |
| Query usefulness | Hook latency p99 | `<= 2.5s` |
| Agentic outcome | Task success vs baseline | `+10pp minimum` |
| Agentic outcome | Wrong-API/resource hallucinations | `-30% minimum` |
| Agentic outcome | First-pass check+lint success | `+20% minimum` |
| Agentic outcome | Median token cost / successful task | `-10% minimum` |

## Rollout and Fallback Controls

| Stage | Behavior | Promotion Gate |
|---|---|---|
| R0 Shadow | Build/index/ingest only; no hook injection | Coverage/correctness targets met |
| R1 Advisory | Hook computes KG hints but logs only | Query usefulness targets met |
| R2 Limited On | Hook injects KG hints for selected contributors | Early benchmark lift + `p95<=1.5s` |
| R3 Default On | Hook enabled by default | Full performance thresholds met |

| Trigger | Fallback Action |
|---|---|
| Hook latency breach/timeout storm | Auto-disable KG injection; preserve current hook output |
| Graphiti unavailable | Use local deterministic cache only; skip Graphiti read path |
| Incremental drift detected | Force full rebuild and temporarily freeze delta mode |
| Performance regression in A/B | Roll back rollout stage and disable default KG condition |

## Verification Commands (for this spec package)
1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`
4. `bun run agents:pathless:check`

## References (Required Source List)
1. [FalkorDB code-graph README](https://raw.githubusercontent.com/FalkorDB/code-graph/main/README.md) [S1]
2. [FalkorDB code-graph-backend README](https://raw.githubusercontent.com/FalkorDB/code-graph-backend/main/README.md) [S2]
3. [Code-Graph-RAG README](https://raw.githubusercontent.com/vitali87/code-graph-rag/main/README.md) [S3]
4. [Graphiti README](https://raw.githubusercontent.com/getzep/graphiti/main/README.md) [S4]
5. [Graphiti MCP server docs](https://help.getzep.com/graphiti/getting-started/mcp-server) [S5]
6. [ts-morph docs](https://ts-morph.com/) [S6]
7. [ts-morph JSDoc API](https://ts-morph.com/details/documentation) [S7]
8. [ts-morph types API](https://ts-morph.com/details/types) [S8]
9. [TypeScript Compiler API wiki source](https://raw.githubusercontent.com/wiki/microsoft/TypeScript/Using-the-Compiler-API.md) [S9]
10. [TSConfig incremental option](https://www.typescriptlang.org/tsconfig/#incremental) [S10]
11. [tree-sitter advanced parsing](https://tree-sitter.github.io/tree-sitter/using-parsers/3-advanced-parsing.html) [S11]
12. [SCIP protocol docs](https://scip.dev/) [S12]
13. [scip-typescript README](https://raw.githubusercontent.com/sourcegraph/scip-typescript/main/README.md) [S13]
14. [Nx affected docs](https://nx.dev/ci/features/affected) [S14]
15. [TypeDoc output options](https://typedoc.org/documents/Options.Output.html) [S15]
16. [CodeQL supported languages/frameworks](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/) [S16]

## In-Repo Proof Anchors
- [R1] `eslint.config.mjs`
- [R2] `tsdoc.json`
- [R3] `package.json` + workspace `docgen.json` files using `@effect/docgen`
- [R4] `apps/web/src/lib/graphiti/client.ts`
- [R5] `tooling/agent-eval/src/graphiti/mcp.ts`
- [R6] `.mcp.json`
- [R7] `.claude/hooks/skill-suggester/index.ts`
- [R8] `.claude/hooks/schemas/index.ts`
- [R9] `.claude/hooks/*/run.sh`
- [R10] `tooling/agent-eval/src/benchmark/catalog.ts`
- [R11] `tooling/agent-eval/src/commands/bench.ts`
- [R12] `tooling/agent-eval/src/schemas/*`
