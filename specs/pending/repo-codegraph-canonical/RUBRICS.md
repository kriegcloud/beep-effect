# repo-codegraph-canonical — Rubrics

## Purpose

Pass/fail validation rubrics for each phase. A phase cannot exit until all rubric dimensions pass. Lock integrity is tracked as a cross-cutting concern across all phases.

---

## Lock Integrity (Cross-Cutting — Every Phase)

| Dimension | Pass | Fail |
|---|---|---|
| Locked default preservation | All locked defaults from README unchanged | Any locked default/interface changed without ADR + source proof |
| Interface contract adherence | All implementations conform to locked interface contracts | Any interface diverges from locked contract |
| Source traceability | All decisions trace to [S#][R#] references | Any decision lacks source traceability |

---

## P0 Rubric — Launch Packet

| Dimension | Pass | Fail |
|---|---|---|
| Spec completeness | README.md, QUICK_START.md, MASTER_ORCHESTRATION.md, RUBRICS.md, outputs/initial_plan.md, handoffs/HANDOFF_P0.md all exist | Any required file missing |
| Lock traceability | Every locked default has [S#] (source) and [R#] (repo anchor) tags | Any lock missing traceability |
| Technology validation | falkordblite installs and connects; ts-morph parses sample file | Either validation fails |
| Handoff existence | handoffs/HANDOFF_P0.md exists with locked defaults repeated | Handoff missing or locks not repeated |

## P1 Rubric — Schema + Data Model Freeze

| Dimension | Pass | Fail |
|---|---|---|
| Schema compilation | Effect Schema definitions compile with zero type errors | Any type error |
| Cypher constraints | All constraints apply to falkordblite without errors | Any constraint fails |
| Node coverage | All 15 primary node types defined with full property schemas | Any node type missing or incomplete |
| Edge coverage | All 17+ edge types defined with certainty metadata | Any edge type missing certainty |
| Category exhaustiveness | 8-category taxonomy switch is exhaustive (no `never` reachable) | `never` case reachable at runtime |
| Node ID format | SCIP-style qualified names generate correctly for all node kinds | Any node kind produces malformed ID |
| Certainty model | CertaintyTier (1\|2\|3) and Provenance ("ast"\|"type-checker"\|"llm") types defined and used | Types missing or unused |

## P2 Rubric — AST Extraction + Deterministic Enrichment

| Dimension | Pass | Fail |
|---|---|---|
| Node kind coverage | Extractor produces nodes for all 19 node kinds when present | Any applicable kind missing |
| Deterministic JSDoc tags | 14+ tags generated from AST without LLM or human input | Any Layer 1 tag requires non-deterministic source |
| Effect decomposition | `@throws` and `@requires` extracted from `Effect<A, E, R>` return types | Decomposition fails or produces wrong types |
| Hash determinism | `.graph-hashes.json` produces identical output across repeated runs on same input | Any non-determinism in hash output |
| Incremental parsing | tree-sitter reuses unchanged subtrees (timing delta measurable) | Full re-parse on every change |
| Layer 1 accuracy | `@param`, `@returns`, `@throws` match manual audit (100% for deterministic tags) | Any deterministic tag incorrect |

## P3 Rubric — FalkorDB Storage + Incremental Indexing

| Dimension | Pass | Fail |
|---|---|---|
| Idempotent upserts | Repeated MERGE on same input produces identical graph (node/edge count, properties) | Count or property drift on re-index |
| Incremental scope | Only changed files + 2-hop dependents re-indexed | Unchanged files re-indexed, or dependents beyond 2-hop processed |
| Turborepo integration | `turbo run index-graph --affected` runs only in changed packages | All packages indexed regardless of changes |
| CI cache round-trip | Cache save → restore → incremental build succeeds | Cache miss or stale graph after restore |
| Single-file latency | Single-file re-index (parse + upsert + embed) ≤ 3s | Exceeds 3s |
| Cold index time | Full monorepo cold index ≤ 5 minutes | Exceeds 5 minutes |

## P4 Rubric — LLM Enrichment + Classification

| Dimension | Pass | Fail |
|---|---|---|
| Taxonomy assignment | All exported symbols assigned to exactly one of 8 categories | Any symbol unclassified or multi-classified |
| Taxonomy exhaustiveness | No `never` case reached at runtime during classification | `never` reached |
| De-Hallucinator validation | Every symbol/type/function reference in LLM output validated against AST | Any reference unchecked |
| First-pass accuracy | ≥ 90% of LLM descriptions pass De-Hallucinator first-pass | Below 90% |
| Example compilation | ≥ 85% of LLM-generated `@example` blocks compile | Below 85% |
| Certainty metadata | 100% of Layer 3 nodes/edges have `certaintyTier: 3` and `provenance: "llm"` | Any Layer 3 entity missing metadata |

## P5 Rubric — Embedding + MCP Server + Query Layer

| Dimension | Pass | Fail |
|---|---|---|
| Vector index | Voyage Code 3 embeddings stored in FalkorDB HNSW index | Embeddings missing or wrong model |
| MCP tools | All 5 tools respond with valid output for well-formed inputs | Any tool errors on valid input |
| MCP resources | Both resources (`graph://schema`, `graph://stats`) return valid data | Either resource fails |
| NL-to-Cypher accuracy | ≥ 80% correct on 50-query test suite | Below 80% |
| Sub-graph latency | 2-hop extraction p95 ≤ 200ms | p95 exceeds 200ms |
| Vector recall | Similarity search recall@10 ≥ 75% | Below 75% |

## P6 Rubric — JSDoc Freshness + CI/CD

| Dimension | Pass | Fail |
|---|---|---|
| Drift precision | Signature drift detection precision ≥ 95% | Below 95% or false-positive rate > 5% |
| PR check | GitHub Actions workflow triggers on PRs touching `.ts` files and posts review comments | Workflow doesn't trigger or comments missing |
| Health score | Weekly audit computes score using locked formula (0.4 coverage + 0.35 freshness + 0.25 completeness) | Wrong formula or missing components |
| AI suggestions | Claude Sonnet 4.5 posts inline review comments with Tier 1 + Tier 2 tags | Suggestions don't post or miss required tags |
| Lint enforcement | eslint-plugin-jsdoc enforces Tier 1 tags on all exports in CI | Enforcement gaps |

## P7 Rubric — Deployment + Validation + Observability

| Dimension | Pass | Fail |
|---|---|---|
| Railway deployment | FalkorDB, indexer, and MCP server running as Railway services | Any service fails to deploy |
| Query latency | MCP queries p95 ≤ 200ms in production | p95 exceeds 200ms |
| Health score | Documentation health score ≥ 85% | Below 85% |
| E2E pipeline | Full pipeline (index → enrich → embed → serve) completes on sample workspace | Any stage fails |
| Soak test | 7-day soak with zero graph corruption | Any corruption detected |
| Validation report | All quantitative targets from README documented with pass/fail evidence | Any target missing evidence |
| Agent outcome delta | Agent hallucination rate ≤ -30% with KG context vs without | Delta above -30% |

---

## Quantitative Readiness Rubric (P1–P7 Cumulative)

| Category | Metric | Target | Phase |
|---|---|---|---|
| Graph coverage | Exported symbol node coverage | ≥ 98% | P3+ |
| Graph coverage | Node/edge precision | ≥ 95% | P3+ |
| Graph coverage | Deterministic re-indexing identity | 100% | P3+ |
| Deterministic enrichment | Layer 1 JSDoc tag coverage for exports | ≥ 95% | P2+ |
| Deterministic enrichment | Effect `<A, E, R>` decomposition success | ≥ 99% | P2+ |
| Deterministic enrichment | `@param`/`@returns`/`@throws` accuracy | 100% | P2+ |
| Classification | 8-category assignment coverage | 100% | P4+ |
| Semantic enrichment | LLM first-pass De-Hallucinator pass rate | ≥ 90% | P4+ |
| Semantic enrichment | `@example` compilation rate | ≥ 85% | P4+ |
| Query performance | 2-hop sub-graph p95 latency | ≤ 200ms | P5+ |
| Query performance | NL-to-Cypher accuracy | ≥ 80% | P5+ |
| Query performance | Vector recall@10 | ≥ 75% | P5+ |
| Incremental indexing | Single-file re-index time | ≤ 3s | P3+ |
| Incremental indexing | Full cold index time | ≤ 5 minutes | P3+ |
| JSDoc freshness | Drift detection precision | ≥ 95% | P6+ |
| JSDoc freshness | Documentation health score | ≥ 85% | P6+ |
| Agentic outcome | Code generation accuracy delta | ≥ +10pp | P7 |
| Agentic outcome | Hallucination rate delta | ≤ -30% | P7 |
| Deployment | Dev startup time | ≤ 5s | P3+ |
| Deployment | CI incremental build time | ≤ 60s | P3+ |
