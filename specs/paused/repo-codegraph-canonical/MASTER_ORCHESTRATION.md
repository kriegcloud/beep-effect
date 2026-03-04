# repo-codegraph-canonical — Master Orchestration

## State Machine

```
P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7
```

> **Phase completion invariant:** No phase is complete until declared outputs exist, phase exit gates pass, and the next-phase handoff prompt set is created.

---

## Non-Negotiable Locks (Use README lock tables as normative defaults)

### Locked Defaults (Do Not Reopen Without ADR + Source Proof)

| Decision Surface | Locked Default | Why |
|---|---|---|
| Graph database | `FalkorDB` with `falkordblite` embedded for dev/CI | GraphBLAS sparse matrix algebra delivers 500x faster multi-hop traversal vs Neo4j; zero-config embedded mode eliminates Docker dependency that kills adoption [S1][R1] |
| AST parser (primary) | `ts-morph` | Only option providing full TypeScript type resolution — return types, heritage clauses, generic instantiation, cross-file import resolution [S1][S2][R2] |
| AST parser (incremental) | `tree-sitter` | Built-in incremental parsing reuses unchanged subtree structure; ~1.2M weekly downloads; used for fast file-change detection before ts-morph deep analysis [S1] |
| Embedding model | `Voyage Code 3` via Vercel AI SDK | 13.8% better than OpenAI text-embedding-3-large on 238 code retrieval datasets; 32K token context enables whole-file embedding without chunking [S1] |
| LLM (enrichment) | `Claude Sonnet 4.5` | 77.2% SWE-bench Verified; optimal across NL-to-Cypher, JSDoc generation, and code understanding at $3/$15 per 1M tokens [S1] |
| LLM (deep review) | `Claude Opus 4.5` | Reserved for multi-step dependency impact analysis; 65.4% Terminal-Bench 2.0 [S1] |
| Certainty model | Three-layer: deterministic (1.0), type-system (0.85–0.95), LLM-inferred (0.6–0.85) | Deterministic AST analysis corrected 77% of LLM hallucinations (2026 FORGE); maximizes computable facts before inference [S2][S3] |
| Node ID format | SCIP-style qualified name: `<workspace>::<file>::<symbol>::<kind>::<signature-hash>` | Proven at Sourcegraph and Meta scale for preventing entity confusion across files and packages [S1][S4] |
| JSDoc standard | JSDoc (not TSDoc) with `jsdoc/no-types` | Universal AI training data coverage; full custom tag support via `definedTags`; `no-types` avoids duplicating TypeScript type annotations [S1][S2] |
| File watcher | `@parcel/watcher` | Post-restart change detection unique to Parcel; native C++ OS-level APIs; no file descriptor exhaustion; used by Turborepo itself [S1] |
| Cypher builder | `@neo4j/cypher-builder` | Official library generating OpenCypher-compatible queries for FalkorDB; programmatic AST construction with automatic parameter binding prevents injection [S1] |
| MCP SDK | `@modelcontextprotocol/sdk` | Anthropic-backed; TypeScript-first; Zod schema validation; stdio + HTTP transports [S1] |
| Classification taxonomy | 8-category discriminated union grounded in Moggi's computational effects and architectural convergence | Compile-time exhaustiveness via `_tag` discriminant + `never` initial object [S2] |
| Testing | `Vitest` + `falkordblite` | Real graph database in tests with zero Docker; `MATCH (n) DETACH DELETE n` between tests [S1] |
| Incremental strategy | Content-addressed SHA-256 hashing + Turborepo `--affected` + `.graph-hashes.json` manifest | Two-level: Turborepo for package-level, hash manifest for file-level [S1] |
| Effect-TS integration | `Effect<A, E, R>` type decomposition for deterministic `@throws` and `@requires` | Effect-TS encodes errors in E and dependencies in R as first-class type parameters [S2] |

### Locked Interface Defaults

| Interface | Locked Contract |
|---|---|
| Graph node schema | Effect Schema class with `kind` discriminant from `NodeKind` tagged union; properties: `id`, `qualifiedName`, `filePath`, `line`, `endLine`, `exported`, `hash` (SHA-256 content), `certaintyTier` (1\|2\|3), `meta` |
| Graph edge schema | Effect Schema class with `kind` discriminant from `EdgeKind` tagged union; properties: `source`, `target`, `label`, `certaintyTier`, `meta` |
| Certainty metadata | Every node and edge carries `certaintyTier: 1 | 2 | 3` and `provenance: "ast" | "type-checker" | "llm"` |
| JSDoc drift detection | `DOCUMENTED_BY` edges carry `signatureHash`, `lastValidated`, `driftDetected` properties |
| Sub-graph extraction | 2-hop traversal from matched entity following CALLS, CONTAINS, IMPORTS, EXTENDS, IMPLEMENTS, TYPE_OF edges |
| MCP tool surface | Tools: `search-symbol`, `traverse-dependencies`, `explain-function`, `find-similar`, `check-drift` |
| Turbo task | `index-graph` task with inputs `src/**/*.ts, package.json, tsconfig.json` |
| CI cache | GitHub Actions cache at `.falkordb-data/` keyed by source hash |

---

## P0: Launch Packet

- **Objective:** Validate technology selections, freeze locked defaults, create spec package
- **Owners:** @kriegcloud
- **Required outputs:**
  1. `README.md` — full spec with locked defaults, phase architecture, validation targets
  2. `QUICK_START.md` — executive summary
  3. `MASTER_ORCHESTRATION.md` — this document
  4. `RUBRICS.md` — validation rubrics
  5. `outputs/initial_plan.md` — research-to-decision mapping
  6. `handoffs/HANDOFF_P0.md` — P0 → P1 handoff
- **Entry gate:** Research corpus exists (28 compiled sources)
- **Exit gate:**
  1. All locked defaults have [S#][R#] traceability tags
  2. falkordblite installs and connects in isolated test
  3. ts-morph parses a sample TypeScript file and extracts type information
  4. P1 handoff prompt set exists

## P1: Schema + Data Model Freeze

- **Objective:** Define and validate the complete graph schema in Effect Schema with Cypher constraints
- **Owners:** Schema Engineer
- **Required outputs:**
  1. `outputs/p1-schema/graph-schema.ts` — Effect Schema definitions for all node/edge types
  2. `outputs/p1-schema/cypher-constraints.cypher` — FalkorDB index and constraint definitions
  3. `outputs/p1-schema/certainty-model.ts` — CertaintyTier and Provenance types
  4. `outputs/p1-schema/category-taxonomy.ts` — 8-category discriminated union with Galois connection mapping
- **Entry gate:** P0 exit gates pass
- **Exit gate:**
  1. Effect Schema compiles with zero type errors
  2. Cypher constraints apply to falkordblite without errors
  3. All 15 node types defined with full property schemas
  4. All 17+ edge types defined with certainty metadata
  5. 8-category taxonomy exhaustiveness proven (no `never` reachable at runtime)
  6. Node ID format generates SCIP-style qualified names
  7. P2 handoff prompt set exists

## P2: AST Extraction + Deterministic Enrichment (Layers 1 & 2)

- **Objective:** Build the ts-morph extraction pipeline that generates Layer 1 and Layer 2 JSDoc tags deterministically
- **Owners:** AST Engineer
- **Required outputs:**
  1. `outputs/p2-extraction/extractor.ts` — ts-morph AST walker producing graph nodes/edges
  2. `outputs/p2-extraction/effect-decomposer.ts` — Effect `<A, E, R>` type decomposition for `@throws`/`@requires`
  3. `outputs/p2-extraction/deterministic-jsdoc.ts` — Layer 1 JSDoc tag generator (14+ tags)
  4. `outputs/p2-extraction/tree-sitter-fast.ts` — tree-sitter incremental parser for change detection
  5. `outputs/p2-extraction/hash-manifest.ts` — SHA-256 content hashing and `.graph-hashes.json` manifest
- **Entry gate:** P1 exit gates pass
- **Exit gate:**
  1. Extractor produces nodes for all 19 node kinds when present in source
  2. 14+ JSDoc tags generated deterministically from AST modifier flags and node structure
  3. Effect `<A, E, R>` decomposition produces correct `@throws` and `@requires` for Effect-returning functions
  4. Hash manifest produces stable, deterministic IDs across repeated runs
  5. tree-sitter incremental parsing reuses unchanged subtrees (measured via parse timing)
  6. P3 handoff prompt set exists

## P3: FalkorDB Storage + Incremental Indexing

- **Objective:** Implement the FalkorDB persistence layer with MERGE upserts and two-level incremental indexing
- **Owners:** Storage Engineer
- **Required outputs:**
  1. `outputs/p3-storage/falkordb-client.ts` — FalkorDB client wrapper (falkordblite for dev, falkordb for prod)
  2. `outputs/p3-storage/incremental-indexer.ts` — Two-level incremental update cycle (Turborepo + hash manifest)
  3. `outputs/p3-storage/turbo-integration.ts` — `turbo.json` `index-graph` task configuration
  4. `outputs/p3-storage/ci-cache.ts` — GitHub Actions cache strategy for `.falkordb-data/`
- **Entry gate:** P2 exit gates pass
- **Exit gate:**
  1. MERGE upserts are idempotent — repeated indexing produces identical graph
  2. Incremental indexing processes only changed files + 2-hop dependents
  3. `turbo run index-graph --affected` runs correctly
  4. CI cache round-trips (save → restore → incremental build) succeed
  5. Single-file re-index completes in ≤ 3s
  6. P4 handoff prompt set exists

## P4: LLM Enrichment + Classification (Layer 3)

- **Objective:** Build the LLM enrichment pipeline with De-Hallucinator validation and 8-category classification
- **Owners:** Enrichment Engineer
- **Required outputs:**
  1. `outputs/p4-enrichment/llm-enricher.ts` — Claude Sonnet 4.5 integration for descriptions, examples, cross-refs
  2. `outputs/p4-enrichment/classifier.ts` — 8-category taxonomy assignment using observable property → category Galois connection
  3. `outputs/p4-enrichment/de-hallucinator.ts` — Iterative grounding: generate → validate against AST → re-prompt
  4. `outputs/p4-enrichment/certainty-propagator.ts` — Certainty metadata assignment and propagation
- **Entry gate:** P3 exit gates pass
- **Exit gate:**
  1. 8-category taxonomy assigns all exported symbols without `never` case
  2. De-Hallucinator validates every symbol reference in LLM output against AST
  3. ≥ 90% of LLM-generated descriptions pass first-pass De-Hallucinator validation
  4. ≥ 85% of LLM-generated `@example` blocks compile
  5. Certainty metadata present on 100% of nodes and edges
  6. P5 handoff prompt set exists

## P5: Embedding + MCP Server + Query Layer

- **Objective:** Build the Voyage Code 3 embedding pipeline, MCP server with 5 tools, and NL-to-Cypher query translation
- **Owners:** Query Engineer
- **Required outputs:**
  1. `outputs/p5-query/embedding-pipeline.ts` — Voyage Code 3 via Vercel AI SDK; batch embedding with debounced queue
  2. `outputs/p5-query/mcp-server.ts` — MCP server exposing 5 tools and 2 resources
  3. `outputs/p5-query/nl-to-cypher.ts` — Schema-aware NL-to-Cypher with few-shot examples
  4. `outputs/p5-query/subgraph-extractor.ts` — 2-hop sub-graph extraction and serialization
- **Entry gate:** P4 exit gates pass
- **Exit gate:**
  1. Voyage Code 3 embeddings stored in FalkorDB HNSW vector index
  2. MCP server exposes all 5 tools (`search-symbol`, `traverse-dependencies`, `explain-function`, `find-similar`, `check-drift`)
  3. MCP server exposes 2 resources (`graph://schema`, `graph://stats`)
  4. NL-to-Cypher achieves ≥ 80% accuracy on 50-query test suite
  5. Sub-graph extraction completes within 2-hop boundary with p95 ≤ 200ms
  6. Vector similarity search recall@10 ≥ 75%
  7. P6 handoff prompt set exists

## P6: JSDoc Freshness + CI/CD Pipeline

- **Objective:** Build the three-tier documentation freshness defense (PR check, weekly audit, AI-assisted suggestions)
- **Owners:** Freshness Engineer
- **Required outputs:**
  1. `outputs/p6-freshness/drift-detector.ts` — Signature-hash-based drift detection on DOCUMENTED_BY edges
  2. `outputs/p6-freshness/pr-check.yml` — GitHub Actions workflow for PR-level JSDoc validation
  3. `outputs/p6-freshness/weekly-audit.ts` — Cron-scheduled health score computation
  4. `outputs/p6-freshness/ai-suggestions.ts` — Claude Sonnet 4.5 inline review comment generation
- **Entry gate:** P5 exit gates pass
- **Exit gate:**
  1. PR check detects signature drift on changed functions with ≥ 95% precision
  2. Weekly audit computes coverage/freshness/completeness health score
  3. Health score formula: `0.4 * coverage + 0.35 * freshness + 0.25 * completeness`
  4. AI-assisted suggestions post inline review comments with Tier 1 and Tier 2 JSDoc tags
  5. eslint-plugin-jsdoc enforces Tier 1 tags on all exports in CI
  6. P7 handoff prompt set exists

## P7: Deployment + Validation + Observability

- **Objective:** Deploy to Railway, validate all quantitative targets, establish observability
- **Owners:** DevOps Engineer
- **Required outputs:**
  1. `outputs/p7-deployment/railway-config.ts` — Railway service definitions (FalkorDB, indexer, MCP server)
  2. `outputs/p7-deployment/perf-benchmarks.ts` — Benchmark suite for all latency/throughput targets
  3. `outputs/p7-deployment/validation-report.md` — Evidence for all quantitative validation targets
  4. `outputs/p7-deployment/observability.ts` — Query latency tracking, graph health metrics, alert thresholds
- **Entry gate:** P6 exit gates pass
- **Exit gate:**
  1. All quantitative validation targets from README met with evidence
  2. Railway deployment serves MCP queries with p95 ≤ 200ms
  3. Documentation health score ≥ 85%
  4. Full E2E pipeline (index → enrich → embed → serve) runs on sample workspace
  5. 7-day soak with zero graph corruption
  6. Validation report completed with pass/fail per target

---

## Agent Role Definitions

| Role | Scope | Tools |
|---|---|---|
| Schema Engineer | P1: Effect Schema, Cypher constraints, certainty model, category taxonomy | ts-morph, Effect Schema, falkordblite |
| AST Engineer | P2: ts-morph extractor, tree-sitter parser, deterministic JSDoc, Effect decomposition | ts-morph, tree-sitter, TypeScript Compiler API |
| Storage Engineer | P3: FalkorDB client, incremental indexer, Turborepo integration, CI cache | falkordb/falkordblite, @neo4j/cypher-builder, @parcel/watcher |
| Enrichment Engineer | P4: LLM pipeline, classifier, De-Hallucinator, certainty propagation | Claude Sonnet 4.5, Effect AI SDK |
| Query Engineer | P5: Embedding pipeline, MCP server, NL-to-Cypher, sub-graph extraction | Voyage Code 3, @modelcontextprotocol/sdk, Vercel AI SDK |
| Freshness Engineer | P6: Drift detector, PR check, weekly audit, AI suggestions | eslint-plugin-jsdoc, GitHub Actions |
| DevOps Engineer | P7: Railway deploy, benchmarks, validation, observability | Railway CLI, Vitest bench |
