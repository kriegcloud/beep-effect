# repo-codegraph-canonical

## Status

PENDING (P0 launch packet ready for implementation)

## Owner

@kriegcloud

## Created

2026-02-28

## Updated

2026-02-28

## Quick Navigation

- [QUICK_START.md](./QUICK_START.md)
- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md)
- [RUBRICS.md](./RUBRICS.md)
- [REFLECTION_LOG.md](./REFLECTION_LOG.md)
- [outputs/initial_plan.md](./outputs/initial_plan.md)
- [handoffs/HANDOFF_P0.md](./handoffs/HANDOFF_P0.md)
- Research corpus: `specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/`

---

## Mission

Build a production-grade TypeScript code knowledge graph for the beep-effect monorepo that layers three certainty tiers — deterministic AST facts, categorically constrained classification, and LLM-generated semantic enrichment — on FalkorDB with an MCP server interface for AI agent grounding. The system must deliver zero-config embedded development, incremental indexing integrated with Turborepo, automated JSDoc freshness enforcement, and hybrid retrieval combining graph traversal with vector similarity search.

## Initial Plan Alignment

See [outputs/initial_plan.md](./outputs/initial_plan.md) for research-to-decision mapping. All locked defaults trace to evidence from the 28-source research corpus compiled in `specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/`.

---

## Locked Defaults (P0)

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
| Classification taxonomy | 8-category discriminated union grounded in Moggi's computational effects and architectural convergence | Compile-time exhaustiveness via `_tag` discriminant + `never` initial object; categories: domain, data-access, presentation, infrastructure, validation, transformation, side-effect, pure-computation [S2] |
| Testing | `Vitest` + `falkordblite` | Real graph database in tests with zero Docker; `MATCH (n) DETACH DELETE n` between tests [S1] |
| Incremental strategy | Content-addressed SHA-256 hashing + Turborepo `--affected` + `.graph-hashes.json` manifest | Two-level: Turborepo for package-level, hash manifest for file-level; 2-hop dependent rebuild for relationship consistency [S1] |
| Deployment (dev) | `falkordblite` embedded via Unix socket | `npm install` starts everything; no Docker, no ports, no configuration [S1] |
| Deployment (prod) | Railway ($5–15/month initial) then Hetzner VPS (€3.79/month) | Railway has one-click FalkorDB template; Hetzner for cost optimization at scale [S1] |
| Effect-TS integration | `Effect<A, E, R>` type decomposition for deterministic `@throws` and `@requires` | Effect-TS encodes errors in E channel and dependencies in R channel as first-class type parameters; uniquely suited for KG construction [S2] |

## Locked Interface Defaults (From Initial Plan)

| Interface | Locked Contract |
|---|---|
| Graph node schema | Effect Schema class with `kind` discriminant from `NodeKind` tagged union; properties: `id`, `qualifiedName`, `filePath`, `line`, `endLine`, `exported`, `hash` (SHA-256 content), `certaintyTier` (1\|2\|3), `meta` |
| Graph edge schema | Effect Schema class with `kind` discriminant from `EdgeKind` tagged union; properties: `source`, `target`, `label`, `certaintyTier`, `meta` |
| Certainty metadata | Every node and edge carries `certaintyTier: 1 | 2 | 3` and `provenance: "ast" | "type-checker" | "llm"` |
| JSDoc drift detection | `DOCUMENTED_BY` edges carry `signatureHash`, `lastValidated`, `driftDetected` properties |
| Sub-graph extraction | 2-hop traversal from matched entity following CALLS, CONTAINS, IMPORTS, EXTENDS, IMPLEMENTS, TYPE_OF edges; serialized with explicit relationship labels |
| MCP tool surface | Tools: `search-symbol`, `traverse-dependencies`, `explain-function`, `find-similar`, `check-drift`; Resources: `graph://schema`, `graph://stats` |
| Turbo task | `index-graph` task with inputs `src/**/*.ts, package.json, tsconfig.json` and outputs `.graph-hashes.json, .falkordb-data/` |
| CI cache | GitHub Actions cache at `.falkordb-data/` keyed by `graph-${{ hashFiles('packages/*/src/**') }}` |

## Reuse Boundaries (Locked)

| Area | Reuse Evidence | Decision |
|---|---|---|
| Existing codegraph models | `NodeKind` (19 types), `EdgeKind` (26 types), `GraphNode`, `GraphEdge`, `CodebaseGraph` in repo-utils | **Extend**: Add certainty metadata, JSDoc properties, and SCIP-style qualified names to existing schemas. Keep backward-compatible with current 19/26 type sets; add new node/edge kinds as union members [R2] |
| Existing Graph algorithms | `topologicalSort`, `detectCycles`, `computeTransitiveClosure` in repo-utils | **Reuse directly**: These algorithms operate on adjacency lists and are graph-DB-agnostic. Use for build ordering and impact analysis [R3] |
| Existing ingest types | `SymbolRec`, `EdgeRec`, `Range` in repo-utils ingest/ | **Supersede**: Replace with richer extraction types that include certainty tier, JSDoc parsed tags, and Effect-TS type decomposition. Migration path: adapter from new types to legacy format [R4] |
| Hash utilities | `makeId` (SHA-1 prefix) in repo-utils ingest/hash | **Replace**: Switch to SHA-256 full hash for content addressing; SCIP-style qualified name for identity. SHA-1 prefix insufficient for collision resistance at scale [R5] |
| Research corpus | 28 compiled sources in repo-codegraph-jsdoc | **Consume read-only**: All research decisions are frozen into this spec's locked defaults. Research corpus is not modified [R6] |

---

## Phase Architecture

> **Phase completion invariant:** No phase is complete until declared outputs exist, phase exit gates pass, and the next-phase handoff prompt set is created.

| Phase | Focus | Required Outputs | Entry Gate | Exit Gate | Owners |
|---|---|---|---|---|---|
| P0 | Launch packet: locked defaults, schema skeleton, technology validation | `README.md`, `QUICK_START.md`, `MASTER_ORCHESTRATION.md`, `outputs/initial_plan.md`, `handoffs/HANDOFF_P0.md` | Research corpus exists | All locked defaults have source traceability; falkordblite installs and connects; ts-morph parses a sample file | @kriegcloud |
| P1 | Schema + data model freeze | `outputs/p1-schema/graph-schema.ts`, `outputs/p1-schema/cypher-constraints.cypher`, `outputs/p1-schema/certainty-model.ts` | P0 exit gates pass | Effect Schema compiles; Cypher constraints apply to falkordblite; all 15 node types and 17+ edge types defined with property schemas; certainty tier enum exhaustive | Schema Engineer |
| P2 | AST extraction + deterministic enrichment (Layers 1 & 2) | `outputs/p2-extraction/extractor.ts`, `outputs/p2-extraction/effect-decomposer.ts`, `outputs/p2-extraction/deterministic-jsdoc.ts` | P1 exit gates pass | 14+ JSDoc tags generated deterministically from AST; Effect `<A, E, R>` decomposition produces `@throws` and `@requires`; extractor covers all 19 node kinds; hash manifest produces stable IDs across runs | AST Engineer |
| P3 | FalkorDB storage + incremental indexing | `outputs/p3-storage/falkordb-client.ts`, `outputs/p3-storage/incremental-indexer.ts`, `outputs/p3-storage/turbo-integration.ts` | P2 exit gates pass | MERGE upserts produce idempotent results; incremental indexing processes only changed files + 2-hop dependents; Turborepo `index-graph` task runs with `--affected`; CI cache round-trips successfully | Storage Engineer |
| P4 | LLM enrichment + classification (Layer 3) | `outputs/p4-enrichment/llm-enricher.ts`, `outputs/p4-enrichment/classifier.ts`, `outputs/p4-enrichment/de-hallucinator.ts` | P3 exit gates pass | 8-category taxonomy classifies all exported symbols; De-Hallucinator iterative grounding validates every symbol reference in LLM output against AST; certainty metadata propagated on all Layer 3 nodes/edges | Enrichment Engineer |
| P5 | Embedding + MCP server + query layer | `outputs/p5-query/embedding-pipeline.ts`, `outputs/p5-query/mcp-server.ts`, `outputs/p5-query/nl-to-cypher.ts` | P4 exit gates pass | Voyage Code 3 embeddings stored in FalkorDB vector index; MCP server exposes all 5 locked tools; NL-to-Cypher achieves ≥ 80% accuracy on 50-query test suite; sub-graph extraction serializes within 2-hop boundary | Query Engineer |
| P6 | JSDoc freshness + CI/CD pipeline | `outputs/p6-freshness/drift-detector.ts`, `outputs/p6-freshness/pr-check.yml`, `outputs/p6-freshness/weekly-audit.ts` | P5 exit gates pass | PR check detects signature drift on changed functions; weekly audit computes coverage/freshness/completeness scores; AI-assisted JSDoc suggestions post inline review comments; eslint-plugin-jsdoc enforces Tier 1 tags on all exports | Freshness Engineer |
| P7 | Deployment + validation + observability | `outputs/p7-deployment/railway-config.ts`, `outputs/p7-deployment/perf-benchmarks.ts`, `outputs/p7-deployment/validation-report.md` | P6 exit gates pass | All quantitative validation targets met; Railway deployment serves MCP queries; p95 query latency ≤ 200ms; documentation health score ≥ 85%; full E2E pipeline runs on sample workspace | DevOps Engineer |

---

## Quantitative Validation Targets

| Category | Metric | Target |
|---|---|---|
| **Graph coverage** | Exported symbol node coverage | ≥ 98% |
| **Graph coverage** | Node/edge precision (no phantom entities) | ≥ 95% |
| **Graph coverage** | Deterministic re-indexing produces identical graph | 100% |
| **Graph coverage** | All 19 node kinds represented for applicable symbols | 100% |
| **Deterministic enrichment** | Layer 1 JSDoc tags generated for exported functions | ≥ 95% of applicable tags |
| **Deterministic enrichment** | Effect `<A, E, R>` decomposition success rate | ≥ 99% for Effect-returning functions |
| **Deterministic enrichment** | `@param`, `@returns`, `@throws` accuracy vs manual audit | 100% (deterministic) |
| **Classification** | 8-category taxonomy assignment for exported symbols | 100% coverage |
| **Classification** | Taxonomy exhaustiveness (no `never` case reached at runtime) | 100% |
| **Semantic enrichment** | LLM-generated descriptions passing De-Hallucinator validation | ≥ 90% first-pass |
| **Semantic enrichment** | LLM-generated `@example` blocks that compile | ≥ 85% |
| **Semantic enrichment** | Certainty metadata present on all nodes/edges | 100% |
| **Query performance** | Sub-graph extraction (2-hop) p95 latency | ≤ 200ms |
| **Query performance** | NL-to-Cypher accuracy on 50-query test suite | ≥ 80% |
| **Query performance** | Vector similarity search recall@10 | ≥ 75% |
| **Incremental indexing** | Single-file re-index time (parse + upsert + embed) | ≤ 3s |
| **Incremental indexing** | Full monorepo cold index time | ≤ 5 minutes |
| **Incremental indexing** | Hash manifest determinism across runs | 100% |
| **JSDoc freshness** | Signature drift detection precision | ≥ 95% |
| **JSDoc freshness** | Documentation health score across repo | ≥ 85% |
| **Agentic outcome** | Agent code generation accuracy delta with KG context vs without | ≥ +10pp |
| **Agentic outcome** | Agent hallucination rate delta with KG context vs without | ≤ -30% |
| **Deployment** | falkordblite dev startup time | ≤ 5s |
| **Deployment** | CI graph build with cache (incremental) | ≤ 60s |

---

## Rollout and Fallback Controls

### Rollout Stages

| Stage | Behavior | Promotion Gate |
|---|---|---|
| **Local dev** | falkordblite embedded; `turbo run index-graph` populates local graph; MCP server on stdio | All P1–P5 exit gates pass on local machine |
| **CI integration** | GitHub Actions runs `index-graph` with cache; PR check validates drift; graph artifacts cached | CI pipeline completes in ≤ 5 minutes; no false-positive drift alerts on 10 consecutive clean PRs |
| **Staging (Railway)** | FalkorDB on Railway; MCP server as Railway service; PR-triggered graph sync | p95 query latency ≤ 200ms; MCP tools return valid responses for all 5 tool types |
| **Production** | Full pipeline: index → enrich → embed → serve; weekly health audit active | All quantitative validation targets met; 7-day soak with zero graph corruption |

### Fallback Triggers

| Trigger | Fallback Action |
|---|---|
| falkordblite fails to install on platform | Fall back to Docker-based FalkorDB with `docker-compose.yml`; document platform gap |
| Voyage Code 3 API unavailable | Queue embedding requests; serve graph queries without vector similarity; retry with exponential backoff |
| LLM enrichment produces > 20% De-Hallucinator failures | Disable Layer 3 enrichment; serve Layer 1 + 2 only; flag affected symbols for manual review |
| CI graph build exceeds 5 minutes | Disable full rebuild; use cached graph + incremental delta only |
| Signature drift detection false-positive rate > 10% | Widen drift threshold; post drift alerts as comments (non-blocking) instead of check failures |
| FalkorDB query p95 exceeds 500ms | Add Cypher query plan analysis; create covering indexes; if persistent, evaluate query simplification |

---

## Graph Schema Summary

### Node Types (15 primary + extensions)

The schema defines 15 primary node types synthesized from CPG, SCIP, and CodeQL research, extended with the existing 19-kind `NodeKind` union:

| Node Type | Key Properties | Certainty Source |
|---|---|---|
| `File` | path, hash, language, packageName | Layer 1 (AST) |
| `Module` | name, qualifiedName, exports[], hash | Layer 1 (AST) |
| `Function` | name, qualifiedName, signature, returnType, complexity, isAsync, isExported, typeParameters, hash | Layer 1 (AST) |
| `Class` | name, qualifiedName, isAbstract, heritage[], typeParameters, hash | Layer 1 (AST) |
| `Interface` | name, qualifiedName, extends[], typeParameters, hash | Layer 1 (AST) |
| `TypeAlias` | name, qualifiedName, typeExpression, hash | Layer 1 (AST) |
| `Variable` | name, qualifiedName, type, isConst, isExported, hash | Layer 1 (AST) |
| `Parameter` | name, type, isOptional, defaultValue, position | Layer 1 (AST) |
| `Enum` | name, qualifiedName, members[], isConst, hash | Layer 1 (AST) |
| `Import` | source, specifiers[], isTypeOnly | Layer 1 (AST) |
| `Export` | name, isDefault, isTypeOnly, source | Layer 1 (AST) |
| `JSDocComment` | rawText, parsedTags[], signatureHash, certaintyTier | Layer 1/2/3 |
| `Namespace` | name, qualifiedName, hash | Layer 1 (AST) |
| `Property` | name, type, isOptional, isReadonly, accessModifier | Layer 1 (AST) |
| `Decorator` | name, arguments[], expression | Layer 1 (AST) |

Every node carries common properties: `id` (SCIP-style qualified name), `hash` (SHA-256 content), `certaintyTier` (1\|2\|3), `provenance` ("ast"\|"type-checker"\|"llm"), `generatedDescription` (Layer 3), `categoryTag` (from 8-category taxonomy).

### Edge Types (17 primary + extensions)

| Category | Edge Types | Certainty Source |
|---|---|---|
| **Structural** | CONTAINS, DEFINED_IN, HAS_PARAMETER | Layer 1 (AST) |
| **Type system** | EXTENDS, IMPLEMENTS, RETURNS_TYPE, TYPE_OF, HAS_TYPE_PARAMETER | Layer 1/2 (AST + type checker) |
| **Dependency/usage** | IMPORTS, EXPORTS, CALLS, REFERENCES, DEPENDS_ON, USES | Layer 1/2 (AST + type checker) |
| **Documentation** | DOCUMENTED_BY, DECORATES, OVERRIDES | Layer 1 (AST) |

`DOCUMENTED_BY` edges carry: `signatureHash` (SHA-256 of function signature at documentation time), `lastValidated` (ISO timestamp), `driftDetected` (boolean), `certaintyTier`.

### Eight-Category Classification Taxonomy

```typescript
type CodeCategory =
  | { readonly _tag: "Domain"; readonly description: "Entities and use cases, pure business logic" }
  | { readonly _tag: "DataAccess"; readonly description: "Database adapters, State/IO monad" }
  | { readonly _tag: "Presentation"; readonly description: "Controllers, API handlers, Reader monad" }
  | { readonly _tag: "Infrastructure"; readonly description: "Frameworks, drivers, IO monad" }
  | { readonly _tag: "Validation"; readonly description: "Domain rules, Either/Validation" }
  | { readonly _tag: "Transformation"; readonly description: "Data mapping, Functor/map" }
  | { readonly _tag: "SideEffect"; readonly description: "External interactions, Effect monad" }
  | { readonly _tag: "PureComputation"; readonly description: "Algorithms, Identity monad" }
```

Grounded in Moggi's computational effects (1991) and convergence across Clean, Hexagonal, and Onion architectures. Constrained by Galois connections from observable code properties (async, generic, exported, effectful) to categories.

### Three-Layer Certainty Model

| Layer | Certainty | Source | Tags Generated | Drift Risk |
|---|---|---|---|---|
| **Layer 1** | 1.0 | AST modifier flags, node structure | `@param`, `@returns`, `@template`, `@async`, `@implements`, `@extends`, `@export`, `@access`, `@readonly`, `@abstract`, `@override`, `@static`, `@throws` (Effect), `@requires` (Effect) | None — computed, not authored |
| **Layer 2** | 0.85–0.95 | TypeScript type checker | Complex type resolution, generic instantiation, conditional type evaluation, cross-file type inference | Low — deterministic but can produce surprising results for deeply nested conditional types |
| **Layer 3** | 0.6–0.85 | LLM inference (Claude Sonnet 4.5) | Natural-language `@description`, `@example` code blocks, `@category` (constrained to 8-category taxonomy), `@see` cross-references, `@business-rule`, `@side-effect`, `@pure`, `@idempotent` | Medium — validated via De-Hallucinator iterative grounding |

---

## Deterministic JSDoc Extraction (Layer 1 Detail)

The central technical insight: **at least 14 standard JSDoc tags are deterministically derivable from the TypeScript AST with zero human authoring and zero LLM inference**.

### AST-Derivable Tags

| Tag | AST Source | API |
|---|---|---|
| `@param` | `FunctionDeclaration`/`MethodDeclaration` parameters | `node.getParameters()` — names, types, optionality, defaults |
| `@returns` | Return type annotation or inference | `checker.getReturnTypeOfSignature()` → `checker.typeToString()` |
| `@template` / `@typeParam` | `TypeParameterDeclaration` nodes | Constraints and defaults via `node.getTypeParameters()` |
| `@async` | `ModifierFlags.Async` | `node.isAsync()` |
| `@implements` | Heritage clauses | `classDecl.getImplements()` |
| `@extends` | Heritage clauses | `classDecl.getExtends()` |
| `@export` | `ModifierFlags.Export` | `node.isExported()` |
| `@access` | `Public\|Private\|Protected` modifiers | `node.getScope()` |
| `@readonly` | `ReadonlyKeyword` modifier | `node.isReadonly()` |
| `@abstract` | `AbstractKeyword` modifier | `node.isAbstract()` |
| `@override` | `OverrideKeyword` modifier (TS 4.3+) | `node.hasOverrideKeyword()` |
| `@static` | `StaticKeyword` modifier | `node.isStatic()` |

### Effect-TS Specific Tags (Layer 1, unique advantage)

| Tag | Derivation | API |
|---|---|---|
| `@throws` | `Effect<A, E, R>` → decompose `E` channel into union members | `checker.getTypeArguments()` on return type → index 1 → decompose union |
| `@requires` | `Effect<A, E, R>` → decompose `R` channel into union members | `checker.getTypeArguments()` on return type → index 2 → decompose union |

A function returning `Effect<User, HttpError | ValidationError, Database | Cache>` deterministically yields `@throws HttpError`, `@throws ValidationError`, `@requires Database`, `@requires Cache`. This makes Effect-TS monorepos **uniquely suited** for knowledge graph construction — the type system itself is the graph of error propagation and dependency injection.

---

## Incremental Indexing Architecture

### Two-Level Change Detection

```
Level 1: Turborepo --affected
  → Identifies changed packages since base branch
  → Runs index-graph task only in affected packages

Level 2: File-level hash manifest (.graph-hashes.json)
  → Per-file SHA-256 content hash
  → Created entity IDs, imports, exported symbols
  → Skip unchanged files within affected packages
```

### Update Cycle

1. `@parcel/watcher` detects changed files (native OS-level APIs, post-restart detection)
2. Content hashes compared against `.graph-hashes.json` manifest
3. `tree-sitter` performs incremental parsing (reuses unchanged subtree structure)
4. `ts-morph` runs deep type analysis on changed files only
5. Changed entities upserted to FalkorDB via `MERGE` operations
6. Cross-file relationships rebuilt for changed files + 2-hop dependents:
   ```cypher
   MATCH (changed:File)-[:EXPORTS]->(sym)<-[:IMPORTS]-(dependent:File)
   RETURN dependent
   ```
7. Embeddings batched and re-generated only for changed entities via debounced queue

### Turborepo Integration

```jsonc
// turbo.json
{
  "tasks": {
    "index-graph": {
      "inputs": ["src/**/*.ts", "package.json", "tsconfig.json"],
      "outputs": [".graph-hashes.json", ".falkordb-data/**"],
      "dependsOn": ["^index-graph"]
    }
  }
}
```

### CI Cache Strategy

```yaml
- uses: actions/cache@v4
  with:
    path: .falkordb-data/
    key: graph-${{ hashFiles('packages/*/src/**') }}
    restore-keys: graph-
```

---

## MCP Server Interface

### Tools

| Tool | Description | Input Schema | Output |
|---|---|---|---|
| `search-symbol` | Find symbols by name, kind, or natural language query | `{ query: string, kind?: NodeKind, limit?: number }` | Array of matching nodes with certainty metadata |
| `traverse-dependencies` | Walk dependency graph from a symbol | `{ symbolId: string, direction: "upstream" \| "downstream", maxHops?: number }` | Sub-graph of related nodes and edges |
| `explain-function` | Retrieve full context for a function including JSDoc, callers, callees, types | `{ symbolId: string }` | Serialized 2-hop sub-graph with explicit relationship labels |
| `find-similar` | Vector similarity search across embeddings | `{ query: string, kind?: NodeKind, limit?: number }` | Ranked list of similar symbols with scores |
| `check-drift` | Detect JSDoc documentation drift for specified symbols | `{ symbolIds?: string[], scope?: "file" \| "package" \| "all" }` | Drift report with affected symbols and suggested fixes |

### Resources

| Resource | URI | Description |
|---|---|---|
| Graph schema | `graph://schema` | Current node/edge type definitions with property schemas |
| Graph statistics | `graph://stats` | Node/edge counts by kind, coverage metrics, health score |

### NL-to-Cypher Strategy

Schema-aware prompting with 3–5 few-shot examples per query pattern. Full graph schema injected into system prompt. The critical practical insight from research: **the performance gap between models shrinks considerably when you provide the full graph schema plus example queries** — schema context matters more than model selection.

---

## JSDoc Freshness Pipeline

### Three-Tier Defense

| Tier | Mechanism | Trigger | Action |
|---|---|---|---|
| **PR-level check** | GitHub Actions on PR touching `.ts` files | Every PR | Extract changed function signatures; compare `@param`/`@returns` against actual parameters and return types; post review comment listing stale JSDoc |
| **Weekly audit** | Cron-scheduled workflow | Weekly | Compute documentation health score (coverage + freshness + completeness); auto-create GitHub issue when score < threshold |
| **AI-assisted suggestion** | Triggered on PRs labeled `needs-docs` or large PRs | On label/size | Feed changed signatures + graph context to Claude Sonnet 4.5; post inline review comments with suggested JSDoc including `@business-rule`, `@side-effect`, `@throws` |

### Drift Detection Mechanism

```
On every index run:
1. Compute SHA-256 of function signature (name + params + return type)
2. Compare against signatureHash on existing DOCUMENTED_BY edge
3. If mismatch: set driftDetected = true on edge
4. Cascade: mark downstream dependents as potentially stale
5. Report: aggregate drift count into health score
```

### Health Score Formula

```
healthScore = (
  0.4 * coverageRate      // % of public exports with JSDoc
  + 0.35 * freshnessRate  // % of JSDoc validated after last code change
  + 0.25 * completenessRate // presence of @param, @returns, @throws, @example
)
```

### JSDoc Tag Priority (Tier 1 — required on every exported function)

| Tag | Value | Why |
|---|---|---|
| `@param` / `@returns` | Core function contracts | Missing @param caused 6 weeks of silent integration failures in documented fintech incident |
| `@example` | Verifiable grounding | Stale examples won't compile; highest-leverage content for preventing hallucinations (Mintlify research) |
| `@throws` | TypeScript-invisible error contracts | AI models frequently omit error handling without this context; deterministic for Effect-TS |
| `@deprecated` | Temporal signal with migration path | Prevents AI from suggesting deprecated APIs; single line eliminates categories of wrong suggestions |

### JSDoc Tag Priority (Tier 2 — custom tags, highest novel grounding signal per token)

| Tag | Value | Why |
|---|---|---|
| `@pure` | No side effects, safe to memoize | Single token, massive signal for AI |
| `@side-effect` | Mutations beyond return value | Prevents calling side-effecting functions in loops or tests |
| `@business-rule` | Documents WHY, not WHAT | Business logic invisible in code structure, impossible for AI to infer |
| `@idempotent` | Safe to retry | Critical for distributed systems code generation |

---

## Technology Stack Summary

| Component | Library | Version Evidence | Role |
|---|---|---|---|
| Graph database | `falkordb` / `falkordblite` | Feb 2026 active | Storage, Cypher queries, vector index |
| AST parser (deep) | `ts-morph` | v27+ | Full type resolution, JSDoc manipulation |
| AST parser (fast) | `tree-sitter` + `tree-sitter-typescript` | Stable | Incremental parsing, fast change detection |
| Cypher builder | `@neo4j/cypher-builder` | v2.10.0 Jan 2026 | Type-safe Cypher query construction |
| Embedding | `ai` (Vercel AI SDK) + `voyage-ai-provider` | Active | Voyage Code 3 embeddings |
| Reranker | `@nomic-ai/nomic-embed-code` or API | Active | CodeRankEmbed-137M for retrieval reranking |
| MCP server | `@modelcontextprotocol/sdk` | v2.x, weekly releases | Agent-facing tool/resource server |
| File watching | `@parcel/watcher` | ~14M weekly downloads | OS-level file change detection |
| JSDoc parsing | `@microsoft/tsdoc` | ~2.5M weekly downloads | Custom tag support, TSDoc-compatible parsing |
| JSDoc linting | `eslint-plugin-jsdoc` | Standard | CI enforcement, 40+ rules |
| LLM (enrichment) | Claude Sonnet 4.5 via `@effect/ai-anthropic` | Current | JSDoc generation, NL-to-Cypher, descriptions |
| LLM (deep review) | Claude Opus 4.5 via `@effect/ai-anthropic` | Current | Multi-step dependency impact analysis |
| Testing | `vitest` + `@effect/vitest` | v15M+ weekly downloads | Graph integration tests with falkordblite |
| Build orchestration | Turborepo | In repo | `--affected` package-level change detection |

---

## Verification Commands (for this spec package)

1. `bun run beep docs laws` — confirm Effect-first implementation requirement
2. `bun run beep docs skills` — confirm available skill definitions
3. `bun run beep docs policies` — confirm quality gate policies
4. `bun run agents:pathless:check` — verify pathless config compliance

---

## References (Required Source List)

- [S1] "Building a TypeScript code knowledge graph: the definitive stack" — compiled research synthesis covering FalkorDB, Claude Sonnet 4.5, Voyage Code 3, ts-morph, schema design, deployment, incremental indexing, JSDoc tags, library stack
- [S2] "Deterministic-first knowledge graphs that ground AI in code reality" — three-layer certainty model, category theory classification, AST-derivable JSDoc tags, Effect-TS type decomposition, RepoAgent validation, De-Hallucinator grounding
- [S3] "Knowledge Graph Based Repository-Level Code Generation" (ICSE 2025) — graph-structured code context significantly outperforms flat retrieval for AI code generation; 2-hop sub-graph extraction validated
- [S4] "SCIP - a better code indexing format than LSIF" / "scip-typescript: a new TypeScript and JavaScript indexer" — globally unique symbol identifiers preventing entity confusion across files and packages
- [S5] "Code Property Graph Specification" (Joern) — multi-representation fusion, content hashing for change detection
- [S6] "CodeGraphGPT" — 8.73% average improvement in code coverage, 84.4% reduction in manual crash analysis using graph-structured code context
- [S7] "De-Hallucinator: Mitigating LLM Hallucinations in Code Generation Tasks via Iterative Grounding" — 23–50% improvement in edit distance, 24–61% improvement in API usage recall
- [S8] "RepoAgent" (EMNLP 2024) — AST-first, LLM-second pipeline validated on ~270,000-line codebase; reference recall perfect through deterministic analysis
- [S9] "Can Knowledge Graphs Reduce Hallucinations in LLMs? A Survey" — AWS Graph-RAG evidence that graph-RAG reduces hallucinations via explicit relationships
- [S10] "CodexGraph: Bridging Large Language Models and Code Repositories via Code Graph Databases" — code graph database integration patterns
- [S11] "Hybrid AST-JSDoc knowledge graphs: a genuinely novel approach with real risks" — risk analysis and mitigation strategies
- [S12] "Efficient Knowledge Graph Construction and Retrieval from Unstructured Text for Large-Scale RAG Systems" — scalable KG construction patterns
- [S13] "DeepCodeSeek" (2025) — JSDoc summaries improved retrieval accuracy by 31pp over raw code, 3x more token-efficient
- [S14] "Ologs: A Categorical Framework for Knowledge Representation" (Spivak & Kent, 2012) — categorical framework for KG schema design
- [S15] "Notions of Computation and Monads" (Moggi, 1991) — formal basis for code category taxonomy
- [S16] "Seven Sketches in Compositionality" (Fong & Spivak, 2019) — Galois connections for observation-to-classification mapping

## In-Repo Proof Anchors

- [R1] falkordblite validated via install + connect test in P0
- [R2] Existing `NodeKind` (19 types) and `GraphNode` schema in repo-utils codegraph models
- [R3] Existing `topologicalSort`, `detectCycles`, `computeTransitiveClosure` in repo-utils Graph module
- [R4] Existing `SymbolRec`, `EdgeRec`, `Range` ingest types in repo-utils
- [R5] Existing `makeId` SHA-1 prefix hash in repo-utils ingest/hash
- [R6] Research corpus: 28 compiled sources in `specs/pending/repo-codegraph-jsdoc/outputs/compiled_sources/`
