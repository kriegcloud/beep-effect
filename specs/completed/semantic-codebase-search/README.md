# Semantic Codebase Search via Annotation-Driven Indexing

> **Status:** P6 Complete — All verification gates passed
> **Complexity:** High (41-60 points)
> **Owner:** @elpresidank
> **Created:** 2026-02-19
> **Last Updated:** 2026-02-20

---

## Problem Statement

AI coding agents (Claude Code, Codex) do not discover existing schemas, utilities, helpers, or patterns before generating new code. This causes:

1. **Duplicate code** — agents recreate logic that already exists
2. **Inconsistent patterns** — agents don't follow established conventions
3. **Manual cleanup** — developer must find and resolve duplications post-hoc
4. **Wasted tokens** — developer must explicitly prompt "research first" every time

**Example:** Prompting "create Account schema based on better-auth" should automatically surface existing Schema patterns (`Model.ts`, `VariantSchema.ts`), annotation conventions, and related domain schemas — without the developer saying "research first."

## Proposed Solution

**Annotation-driven semantic search**: Enforce strict JSDoc + Effect Schema annotation standards, then deterministically extract natural language metadata via ts-morph, embed it locally, and serve it via MCP + Claude Code hooks.

**Key insight:** Instead of paying for LLM code→English translation (Greptile's approach), leverage the JSDoc descriptions and Schema annotations the codebase already requires. ts-morph extracts them deterministically. Zero indexing cost, higher quality than LLM hallucination, self-reinforcing virtuous cycle.

### Architecture Overview

```
Source Code (enforced JSDoc + Schema annotations)
    │
    ▼
ts-morph AST Parser ──→ Structured IndexedSymbol JSON
    │
    ▼
Nomic Embed Text v1.5 (ONNX local inference) ──→ Embeddings
    │
    ▼
LanceDB (serverless, TS-native) + BM25 keyword index
    │
    ▼
Custom MCP Server (search_codebase, find_related, browse_symbols)
    │
    ▼
Claude Code Hooks (UserPromptSubmit auto-injection, SessionStart overview)
```

## Success Criteria

- [ ] Repository-wide documentation standards enforced via eslint-plugin-jsdoc + docgen
- [ ] All source files have @module header, all exports have description + @since + @category
- [ ] Custom ts-morph extractor produces structured JSON for all Effect patterns
- [ ] MCP server serves semantic search results to Claude Code
- [ ] UserPromptSubmit hook auto-injects relevant context on every prompt
- [ ] End-to-end test: "create Account schema" surfaces existing Schema patterns

## Affected Packages

| Package | Impact |
|---------|--------|
| `tooling/repo-utils` | Documentation standards applied, extraction target |
| `tooling/cli` | Documentation standards applied, extraction target |
| `tooling/codebase-search` (NEW) | MCP server, extractor, indexer, hooks |
| Root config | eslint-plugin-jsdoc, lefthook hooks, docgen config |

## Phase Overview

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| P0 | Scaffolding | **Complete** | Spec creation |
| P1 | Discovery | **Complete** | Research across 10 documents (296KB) |
| P2 | Evaluation & Design | **Complete** | Documentation standards, extraction schema, MCP API design |
| P3 | Synthesis & Planning | **Complete** | Implementation plan, work item breakdown |
| P4a | Documentation Standards Implementation | **Complete** | eslint rules, docgen config, apply to existing code |
| P4b | Extractor & Indexer Implementation | **Complete** | ts-morph extractor, embedding pipeline, LanceDB store |
| P4c | MCP Server & Hooks Implementation | **Complete** | MCP server, Claude Code hooks, integration |
| P5 | Verification | **Blocked** | Blocked by model artifact/runtime mismatch and follow-on runtime issues |
| P6 | Blocker Remediation & Re-Verification | **Complete** | Model/runtime fixes, reruns complete, all gates passing |

## Key Decisions Made

| Decision | Rationale | Source |
|----------|-----------|--------|
| Annotation-driven over LLM translation | Zero cost, deterministic, higher quality human-authored descriptions | P1 research: Greptile insight + user's annotation idea |
| Nomic Embed Text v1.5 for embeddings | ONNX-compatible in current runtime; validated in live reindex/search paths during P6 | P6 remediation + rerun evidence |
| LanceDB for vector storage | Serverless, TypeScript-native, no Docker/external process | P1: custom-solution-architecture.md |
| Hybrid BM25 + vector search with RRF | Emerging best practice, 67% failure rate reduction | P1: real-world-implementations.md |
| Build on docgen Parser APIs + custom ts-morph | Docgen handles JSDoc well, custom code for Effect patterns | P1: docgen-source-analysis.md |
| UserPromptSubmit hook for auto-injection | Transparent context injection without explicit "research first" | P1: custom-solution-architecture.md |

## Research Artifacts (P1 Outputs)

| Document | Size | Scope |
|----------|------|-------|
| [00-synthesis-and-recommendations.md](./outputs/00-synthesis-and-recommendations.md) | 13KB | Overall strategy, tool picks, phased roadmap |
| [01-documentation-strategy-synthesis.md](./outputs/01-documentation-strategy-synthesis.md) | 12KB | Annotation-driven indexing architecture |
| [mcp-tools-landscape.md](./outputs/mcp-tools-landscape.md) | 29KB | 15+ MCP servers surveyed |
| [graphrag-knowledge-graphs.md](./outputs/graphrag-knowledge-graphs.md) | 34KB | GraphRAG, knowledge graphs, Effect ontology |
| [custom-solution-architecture.md](./outputs/custom-solution-architecture.md) | 46KB | Custom build: embeddings, AST, MCP server, hooks |
| [real-world-implementations.md](./outputs/real-world-implementations.md) | 40KB | Greptile, Sourcegraph, Cursor, Aider, Augment |
| [jsdoc-strategy-research.md](./outputs/jsdoc-strategy-research.md) | 65KB | 70+ JSDoc tags, semantic value ratings, enforcement |
| [docgen-enforcement-research.md](./outputs/docgen-enforcement-research.md) | 39KB | eslint-plugin-jsdoc, git hooks, TypeDoc JSON |
| [docgen-source-analysis.md](./outputs/docgen-source-analysis.md) | 9KB | @effect/docgen internals analysis |
| [current-docs-patterns.md](./outputs/current-docs-patterns.md) | 5KB | Current state gaps and coverage |

## Tech Stack

- **AST Parsing:** ts-morph (already used by @effect/docgen)
- **JSDoc Parsing:** doctrine (already used by @effect/docgen)
- **Embeddings:** `nomic-ai/nomic-embed-text-v1.5` via `@huggingface/transformers` (ONNX backend)
- **Vector Store:** LanceDB (embedded, serverless)
- **MCP Protocol:** @modelcontextprotocol/sdk
- **Lint Enforcement:** eslint-plugin-jsdoc
- **Git Hooks:** lefthook (monorepo-optimized)
- **Doc Generation:** @effect/docgen (existing, potentially extended)

## Related Specs

- **[shared-memories](../shared-memories/README.md)** — Complementary system. Codebase-search provides live code awareness ("does X already exist?") via annotation-driven indexing. Shared-memories provides cross-session episodic memory ("what did we decide?") via Graphiti knowledge graph. No infrastructure overlap — different storage (LanceDB vs FalkorDB), different embeddings (local ONNX vs OpenAI API), different extraction (deterministic AST vs LLM-powered). Both use Claude Code hooks at different events (SessionStart/UserPromptSubmit vs Stop). MCP server names: `codebase-search` (stdio) vs `graphiti-memory` (HTTP).

## Design Artifacts (P2 Outputs)

| Document | Size | Scope |
|----------|------|-------|
| [jsdoc-standard.md](./outputs/jsdoc-standard.md) | 17KB | Tag requirement matrix per symbol kind, quality bar, tsdoc.json |
| [indexed-symbol-schema.md](./outputs/indexed-symbol-schema.md) | 16KB | 40-field IndexedSymbol interface, buildEmbeddingText, classification rules |
| [mcp-api-design.md](./outputs/mcp-api-design.md) | 13KB | 4 MCP tools with JSON schemas and token budgets |
| [hook-integration-design.md](./outputs/hook-integration-design.md) | 14KB | SessionStart + UserPromptSubmit hooks, BM25-only strategy |
| [eslint-config-design.md](./outputs/eslint-config-design.md) | 17KB | ESLint flat config, 2 custom rules, gradual adoption |
| [docgen-vs-custom-evaluation.md](./outputs/docgen-vs-custom-evaluation.md) | 23KB | Hybrid extractor recommendation with source analysis |
| [embedding-pipeline-design.md](./outputs/embedding-pipeline-design.md) | 24KB | Full pipeline: CodeRankEmbed, LanceDB, BM25, RRF, incremental indexing |

## Verification Artifacts (P5 Outputs)

| Document | Scope |
|----------|-------|
| [p5-e2e-results.md](./outputs/p5-e2e-results.md) | Required E2E retrieval + hook behavior evidence |
| [p5-performance-benchmarks.md](./outputs/p5-performance-benchmarks.md) | MCP latency attempts + reindex timing attempts |
| [p5-search-quality-report.md](./outputs/p5-search-quality-report.md) | 10-query quality run and precision gate result |
| [p5-verification-summary.md](./outputs/p5-verification-summary.md) | Consolidated checklist, blockers, remediation tasks |

## Verification Artifacts (P6 Outputs)

| Document | Scope |
|----------|-------|
| [p6-remediation-results.md](./outputs/p6-remediation-results.md) | Implemented blocker fixes with root causes and outcomes |
| [p6-rerun-performance-benchmarks.md](./outputs/p6-rerun-performance-benchmarks.md) | Rerun MCP latencies + full/incremental index timings |
| [p6-rerun-search-quality-report.md](./outputs/p6-rerun-search-quality-report.md) | 10-query rerun quality scoring and aggregate precision |
| [p6-closeout-summary.md](./outputs/p6-closeout-summary.md) | Final gate checklist and closeout decision |

## Current Blockers

None. P6 remediation cleared the P5 blockers and all mandatory gates are passing.

## Closeout State

- Spec closeout criteria are satisfied in P6.
- Spec was moved from pending to completed in P6 closeout (manual move fallback because `spec:move` script is not defined in this repository).

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Embedding model quality insufficient for TS/Effect code | Medium | High | Benchmark CodeRankEmbed vs Voyage Code 3 on real queries early |
| ts-morph extraction misses Effect patterns | Low | Medium | Test against all existing schemas/services in P4b |
| UserPromptSubmit hook adds latency | Medium | Medium | Budget 5s timeout, cache warm index, async indexing |
| Annotation enforcement too disruptive for contributors | Low | Medium | Gradual adoption: enforce on new files first, then backfill |
| LanceDB scaling issues on large monorepo | Low | Low | Current monorepo is small; LanceDB handles 1M+ vectors |
