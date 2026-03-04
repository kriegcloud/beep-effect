# Initial Plan — Research-to-Decision Mapping

## Purpose

This document maps every locked default in the canonical spec to its evidence source(s) from the 28-document research corpus and the deterministic-first research report. Each decision is traceable to specific findings, benchmarks, or validated architectures.

---

## Decision Mapping

### Graph Database: FalkorDB with falkordblite

**Sources:** [S1] "Building a TypeScript code knowledge graph: the definitive stack"

**Evidence chain:**
- GraphBLAS sparse matrix algebra treats graph as mathematical adjacency matrix; multi-hop traversals become sparse matrix multiplications
- Benchmarks: 500x faster p99 latency vs Neo4j on aggregate expansion; 7x less memory
- falkordblite: `npm install` auto-installs pre-built Redis + FalkorDB binaries, connects via Unix socket — zero Docker, zero config
- Migration to production: single import change from `falkordblite` to `falkordb`
- Dedicated Code Graph tool on GitHub demonstrates KG of CrewAI, LangChain repositories

**Alternatives rejected:**
- Neo4j CE: JVM overhead (7x more memory), no embedded TypeScript, crippled community edition licensing
- Memgraph: Best fallback (C++ in-memory, full Cypher, vector search) but Docker-only, no embedded
- KuzuDB: Archived late 2025
- SurrealDB: SurrealQL (not Cypher), unproven multi-hop speed

---

### Three-Layer Certainty Model

**Sources:** [S2] "Deterministic-first knowledge graphs that ground AI in code reality", [S3] ICSE 2025, [S7] De-Hallucinator

**Evidence chain:**
- 2026 IEEE/ACM FORGE paper: deterministic AST analysis corrected 77% of identified LLM hallucinations
- IBM GraphGen4Code: 2B+ RDF triples from source code using program analysis as foundation
- Layer 1 (certainty 1.0): 14+ JSDoc tags derivable from AST modifier flags and node structure with zero human or LLM input
- Layer 2 (certainty 0.85–0.95): TypeScript type checker is deterministic but can surprise on deeply nested conditional types
- Layer 3 (certainty 0.6–0.85): LLM inference validated via De-Hallucinator iterative grounding (23–50% edit distance improvement)
- Each piece of documentation carries explicit provenance tag enabling trust-appropriate agent decisions

---

### AST Parser: ts-morph (primary) + tree-sitter (incremental)

**Sources:** [S1] Definitive stack, [S2] Deterministic-first

**Evidence chain:**
- ts-morph: only option providing full TypeScript type resolution — return types, heritage clauses, generic instantiation, cross-file import resolution
- ts-morph: fluent `JSDocStructure` API for type-safe JSDoc construction; `node.getJsDocs()` for structured reading
- ts-morph: ~1.2M weekly downloads, written by the Deno team
- tree-sitter: incremental parsing reuses unchanged subtree structure; ~1.2M weekly downloads
- Two-phase approach validated: tree-sitter for fast structural extraction (~5ms/file), ts-morph for deep analysis (~200ms/file)

**Alternatives rejected:**
- SWC: Non-standard AST format designed for transpilation, not analysis; zero type information
- tree-sitter alone: Parsing-only with zero type information
- Raw TypeScript Compiler API: All necessary info but ts-morph wraps with fluent, chainable interface

---

### Effect-TS Type Decomposition

**Sources:** [S2] Deterministic-first

**Evidence chain:**
- `Effect<A, E, R>` encodes errors in E channel and dependencies in R channel as first-class type parameters
- A function returning `Effect<User, HttpError | ValidationError, Database | Cache>` deterministically yields `@throws HttpError`, `@throws ValidationError`, `@requires Database`, `@requires Cache`
- TypeScript Compiler API extracts via `checker.getTypeArguments()` on return type, decompose union types into individual members
- Makes Effect-TS monorepos uniquely suited for KG construction — the type system itself is the graph of error propagation and dependency injection
- No existing tool implements this pipeline; must be built

---

### Embedding Model: Voyage Code 3

**Sources:** [S1] Definitive stack

**Evidence chain:**
- 13.8% better than OpenAI text-embedding-3-large across 238 code retrieval datasets
- 32K token context window (4x OpenAI's 8K) enables whole-file embedding without chunking
- Trained on code with tuned code-to-text ratio across 300+ languages including TypeScript
- Matryoshka learning: flexible dimensionality (256, 512, 1024, 2048)
- $0.22/M tokens — medium codebase (~50K functions) costs ~$5.50 initial
- Paired with Nomic CodeRankEmbed-137M (MIT, 8192 context) as lightweight reranker

**Alternatives rejected:**
- OpenAI text-embedding-3-large: 65.17 on CoIR vs Voyage dominance; fails to distinguish code semantics
- CodeBERT/GraphCodeBERT: Legacy, 512-token context
- Qodo-Embed-1-7B: Highest CoIR score (71.5) but requires self-hosting GPU

---

### LLM: Claude Sonnet 4.5 (enrichment) / Opus 4.5 (deep review)

**Sources:** [S1] Definitive stack

**Evidence chain:**
- Sonnet 4.5: 77.2% SWE-bench Verified — highest at price tier
- Replit: 9% → 0% error rate switching from Sonnet 4 to 4.5 on code editing
- Superior TypeScript type system understanding over GPT-4.1 and Gemini 2.5 Pro
- Instruction-following precision: respects structured graph context rather than hallucinating
- $3/$15 per 1M tokens — quality-first doesn't mean most-expensive
- Opus 4.5: 65.4% Terminal-Bench 2.0 for deep multi-step analysis, reserved for high-value tasks

---

### Graph Schema: 15 nodes, 17+ edges

**Sources:** [S1] Definitive stack, [S5] CPG Specification, [S4] SCIP, [S3] ICSE 2025, [S6] CodeGraphGPT

**Evidence chain:**
- CPG: multi-representation fusion and content hashing pattern
- SCIP: globally unique symbol identifiers (`<workspace>::<file>::<symbol>::<kind>::<signature-hash>`)
- CodeQL: rich TypeScript type modeling
- ICSE 2025: graph-structured context significantly outperforms flat retrieval
- CodeGraphGPT: 8.73% code coverage improvement, 84.4% crash analysis reduction with graph context
- AWS Graph-RAG: reduces hallucinations via explicit relationships and computed aggregations
- 2-hop sub-graph extraction validated as optimal context unit (ICSE 2025)

---

### 8-Category Classification Taxonomy

**Sources:** [S2] Deterministic-first, [S14] Ologs, [S15] Moggi 1991, [S16] Galois connections

**Evidence chain:**
- Moggi (1991): distinct notions of computation correspond to distinct monads — Identity, Maybe, Either, State, Reader, Writer, IO, Continuation
- Plotkin & Power (2002): monads characterized by algebraic operations — bidirectional taxonomy
- Convergence across Clean Architecture (Martin 2012), Hexagonal (Cockburn 2005), Onion (Palermo 2008), and FP effect systems yields 8 natural categories
- Discriminated unions model categories as coproducts — compile-time exhaustiveness via `_tag` + `never`
- Galois connections formalize observable-property-to-category mapping: async + IO + external API → SideEffect + Infrastructure
- Spivak & Kent's Ologs provide categorical framework for KG schema itself — functors between AST view and JSDoc view

---

### Incremental Indexing: SHA-256 + Turborepo + @parcel/watcher

**Sources:** [S1] Definitive stack

**Evidence chain:**
- Two-level: Turborepo `--affected` for package-level, `.graph-hashes.json` manifest for file-level
- @parcel/watcher: post-restart change detection (unique), native C++ OS-level APIs, no fd exhaustion, used by Turborepo itself
- tree-sitter: built-in incremental parsing reuses unchanged subtree structure
- FalkorDB MERGE: idempotent upserts for changed entities
- Cross-file relationships: 2-hop dependents only (not full repo), queried from graph itself
- code-graph-rag validation: per-file node replacement is cheap; relationship rebuild is the expensive operation
- CI cache: GitHub Actions cache at `.falkordb-data/` keyed by source file hash

---

### JSDoc Standard: JSDoc (not TSDoc) with Custom Tags

**Sources:** [S1] Definitive stack, [S2] Deterministic-first, [S13] DeepCodeSeek

**Evidence chain:**
- DeepCodeSeek 2025: JSDoc summaries improved retrieval accuracy by 31pp over raw code, 3x more token-efficient
- JSDoc: massive ecosystem maturity, universal AI training data coverage, full custom tag support via `definedTags`
- `jsdoc/no-types`: avoids duplicating TypeScript types in documentation
- Tier 1 (required): @param, @returns, @example, @throws, @deprecated
- Tier 2 (custom, high-value): @pure, @side-effect, @business-rule, @idempotent
- Fintech incident: missing @param documentation caused 6 weeks of silent integration failures

---

### MCP Server Interface

**Sources:** [S1] Definitive stack, [S10] CodexGraph

**Evidence chain:**
- @modelcontextprotocol/sdk: Anthropic-backed, TypeScript-first, Zod-based schema validation
- 5 tools: `search-symbol`, `traverse-dependencies`, `explain-function`, `find-similar`, `check-drift`
- 2 resources: `graph://schema`, `graph://stats`
- NL-to-Cypher: schema-aware prompting with 3–5 few-shot examples per query pattern
- Sub-graph serialization with explicit relationship labels for LLM consumption

---

### Deployment Architecture

**Sources:** [S1] Definitive stack

**Evidence chain:**
- Local: falkordblite embedded, `npm install && turbo dev` starts everything
- CI: falkordblite without Docker service containers; cache `.falkordb-data/`
- First production: Railway $5–15/month, one-click FalkorDB template, usage-based billing
- Cost optimization: Hetzner VPS €3.79/month (CX22: 2 vCPU, 4 GB RAM), Docker Compose + Coolify
- Progressive rollout: local → CI → Railway → Hetzner

---

## Research Corpus Index

| ID | Title | Key Contribution |
|---|---|---|
| S1 | Building a TypeScript code knowledge graph: the definitive stack | Primary synthesis — FalkorDB, ts-morph, Voyage Code 3, schema, deployment, JSDoc |
| S2 | Deterministic-first knowledge graphs that ground AI in code reality | Three-layer certainty model, category theory, AST-derivable JSDoc, Effect decomposition |
| S3 | Knowledge Graph Based Repository-Level Code Generation (ICSE 2025) | Graph context outperforms flat retrieval; 2-hop optimal |
| S4 | SCIP - a better code indexing format than LSIF | Globally unique symbol IDs |
| S5 | Code Property Graph Specification (Joern) | Multi-representation fusion, content hashing |
| S6 | CodeGraphGPT | 8.73% code coverage improvement with graph context |
| S7 | De-Hallucinator | Iterative grounding: 23–50% edit distance improvement |
| S8 | RepoAgent (EMNLP 2024) | AST-first, LLM-second pipeline validated at scale |
| S9 | Can Knowledge Graphs Reduce Hallucinations in LLMs? | Graph-RAG reduces hallucinations via explicit relationships |
| S10 | CodexGraph | LLM + code graph database integration patterns |
| S11 | Hybrid AST-JSDoc knowledge graphs | Risk analysis and mitigation |
| S12 | Efficient KG Construction for RAG | Scalable KG patterns |
| S13 | DeepCodeSeek 2025 | JSDoc 31pp better retrieval, 3x more efficient |
| S14 | Ologs (Spivak & Kent 2012) | Categorical framework for KG schema |
| S15 | Notions of Computation and Monads (Moggi 1991) | Formal basis for code categories |
| S16 | Seven Sketches in Compositionality (Fong & Spivak 2019) | Galois connections for classification |
| S17 | Code Graph: From Visualization to Integration | Graph visualization patterns |
| S18 | CodeHalu | Code hallucination verification methodology |
| S19 | CodeRAG | Bigraph-based code retrieval |
| S20 | RepoGraph | Repository-level code graph (32.8% SWE-bench improvement) |
| S21 | Repository Intelligence | Agent evaluation data methodology |
| S22 | Retrieval-Augmented Code Generation Survey | Repository-level RAG approaches |
| S23 | Semantic Code Graph | Information model for software comprehension |
| S24 | scip-typescript | TypeScript/JavaScript SCIP indexer |
| S25 | LAMBDANET | Graph neural networks for type inference |
| S26 | TyFlow | Type-aware neural code models |
| S27 | Typilus | Neural type hints |
| S28 | 2025 State of AI Code Quality | Industry survey on AI code quality |
