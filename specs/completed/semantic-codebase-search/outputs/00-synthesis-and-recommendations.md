# Semantic Codebase Search: Synthesis & Recommendations

**Date:** 2026-02-19
**Context:** Effect v4 TypeScript monorepo, Claude Code + Codex as primary agentic tools
**Problem:** AI coding agents don't discover existing schemas/utils/helpers before creating new code, leading to duplication

---

## The Core Problem

When you prompt "create Account schema based on better-auth", the AI agent has no mechanism to first discover:
- Existing Schema patterns in `Model.ts`, `VariantSchema.ts`
- Existing domain schemas that follow established conventions
- Shared utilities, error types, service patterns
- How schemas are annotated, structured, and connected in this specific codebase

This results in duplicate code, inconsistent patterns, and manual cleanup. The question: **can we automate codebase discovery as a pre-step to every coding task?**

---

## Research Summary (4 parallel deep-dives)

| Document | Scope | Key Finding |
|----------|-------|-------------|
| [mcp-tools-landscape.md](./mcp-tools-landscape.md) | 15+ MCP servers surveyed | Augment Context Engine (best quality), Zilliz Claude Context (best OSS), AiDex (most token-efficient) |
| [graphrag-knowledge-graphs.md](./graphrag-knowledge-graphs.md) | GraphRAG, knowledge graphs, code property graphs | Microsoft GraphRAG is mediocre on code without AST-aware extraction; 5 code-specific GraphRAG tools exist; SemanticForge achieves 73% precision vs 51% traditional |
| [custom-solution-architecture.md](./custom-solution-architecture.md) | Building a custom system | tree-sitter + Nomic CodeRankEmbed + LanceDB + BM25/RRF hybrid via MCP server; includes Claude Code hook integration patterns |
| [real-world-implementations.md](./real-world-implementations.md) | What actually works in production | Greptile: translate code→English before embedding (+12%); Sourcegraph moved AWAY from embeddings; Hybrid BM25+vector is consensus; Aider repo map is lightweight alternative |

---

## Top Insights Across All Research

### 1. The Agentic vs RAG Debate (Settled: Hybrid Wins)

Anthropic chose pure agentic search (grep/read) for Claude Code and claims it outperformed RAG. However, this costs massive tokens on large repos. **The emerging consensus is hybrid**: agentic search as backbone, with semantic index where needed.

### 2. Embedding Raw Code Is a Trap

Greptile proved that embedding raw source code performs poorly. Translating code to natural language descriptions first improves similarity scores by ~12%. Function-level chunking dramatically outperforms file-level.

### 3. Sourcegraph Moved Away from Embeddings

Cody moved back to BM25 keyword search + learned signals, citing security, operational complexity, and scalability concerns. This is significant evidence against embedding-only approaches.

### 4. No Tool Understands Effect Patterns

No off-the-shelf tool indexes Effect-specific constructs (Schema, Service, Layer, TaggedErrorClass, Effect.fn). Custom extractors are needed for meaningful Effect-aware search.

### 5. You Already Have 70% of the Infrastructure

Serena (LSP-based, already installed) + Claude Code's built-in grep/read tools cover structural search. The gap is **conceptual/semantic search** ("find schemas similar to Account") and **automatic context injection** (don't wait for the agent to search - inject before it starts).

---

## Three Viable Strategies (Ranked)

### Strategy A: Quick Win — Off-the-Shelf MCP + Hooks (1-2 days)

**Install existing MCP servers and wire them up with Claude Code hooks.**

| Component | Tool | Why |
|-----------|------|-----|
| Semantic search | **Augment Context Engine MCP** (free tier) or **claude-context-local** (fully local) | Best retrieval quality vs zero-cost local option |
| Structural search | **Serena** (already installed) + **AiDex** (tree-sitter + SQLite, ~50 tokens/result) | Precise identifier lookups, zero external deps |
| Auto-injection | **UserPromptSubmit hook** | Automatically search index on every prompt, inject top-5 results |
| Session context | **SessionStart hook** | Inject project overview (key schemas, patterns, conventions) at session start |

**Setup:**
```jsonc
// .claude/settings.json
{
  "hooks": {
    "UserPromptSubmit": [{
      "command": "node ./tools/auto-context-hook.js",
      "timeout": 5000
    }],
    "SessionStart": [{
      "command": "cat ./tools/project-context.md",
      "timeout": 3000
    }]
  }
}
```

**Pros:** Fast to deploy, no custom code, leverages battle-tested tools
**Cons:** No Effect-aware understanding, generic results, depends on external tool quality
**Best for:** Getting 80% of the value immediately while evaluating custom approaches

---

### Strategy B: Custom Hybrid MCP Server (7-10 days)

**Build a purpose-built MCP server with Effect-aware indexing.**

**Architecture:**
```
User Prompt
    │
    ▼
┌─────────────────────┐     ┌──────────────────────┐
│ UserPromptSubmit     │────▶│ MCP: search_codebase │
│ Hook (auto-inject)   │     │ MCP: find_related    │
└─────────────────────┘     │ MCP: browse_symbols  │
                            └──────────┬───────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │ BM25 Keyword │  │ Vector Search│  │ AST Structure│
            │   Search     │  │  (LanceDB)   │  │   (tree-sit) │
            └──────────────┘  └──────────────┘  └──────────────┘
                    │                  │                  │
                    └──────────────────┼──────────────────┘
                                       ▼
                            ┌──────────────────┐
                            │ Reciprocal Rank  │
                            │ Fusion (RRF)     │
                            └──────────┬───────┘
                                       ▼
                            ┌──────────────────┐
                            │ Compact Results  │
                            │ (~150-300 tokens │
                            │  per result)     │
                            └──────────────────┘
```

**Key components:**
- **tree-sitter** for AST parsing (fast, incremental, handles partial code)
- **Custom Effect extractors**: Detect `S.TaggedErrorClass`, `Schema.Struct`, `Layer.effect`, `Effect.fn`, service patterns
- **Nomic CodeRankEmbed** (137M params, Apache-2.0, runs in Node via ONNX) for local embeddings
- **LanceDB** for vector storage (serverless, TypeScript-native, no Docker)
- **BM25 + vector hybrid** with RRF fusion for best retrieval quality
- **Natural language summaries** generated during indexing (the Greptile insight)
- **MCP server** with 4 tools: `search_codebase`, `find_related`, `browse_symbols`, `reindex`

**Effect-specific ontology nodes:**
```
Schema → fields, annotations, brand, identifier
Service → methods, dependencies (R channel), error types
Layer → provides, requires, construction pattern
TaggedError → tag, fields, message template
Effect.fn → name, params, success type, error type, requirements
Command → flags, arguments, handler effect
```

**Pros:** Understands Effect patterns natively, fully local, customizable ranking
**Cons:** Non-trivial build effort, maintenance burden, needs incremental reindex strategy
**Best for:** Long-term solution if you're committed to the Effect ecosystem

---

### Strategy C: GraphRAG with Effect Ontology (2-4 weeks)

**Build a knowledge graph with Effect-aware ontology for deep relational queries.**

**Why this is powerful:** Beyond "find similar code," a graph lets you ask relational questions:
- "What services depend on AccountSchema?"
- "What errors can the UserService produce?"
- "Show me the Layer dependency tree for the billing module"

**Stack:**
- **code-graph-rag** (fork) or **CodeGraph Analyzer** as starting point
- **Neo4j** or **FalkorDB** (lighter) for graph storage
- **ts-morph** (TypeScript Compiler API) for deep type resolution
- **Qdrant** or **ChromaDB** for vector search alongside graph
- **LLM-generated Cypher queries** for natural language → graph traversal

**Pros:** Deepest understanding, relational queries, community detection (Leiden clustering)
**Cons:** Highest complexity, heaviest infrastructure, slower indexing, hardest to maintain
**Best for:** Large teams, complex monorepos, when relational understanding matters most

---

## My Recommendation: Strategy A Now → Strategy B Next

### Phase 1 (This Week): Strategy A
1. Install **claude-context-local** (zero-cost, fully local, FAISS + EmbeddingGemma)
2. Install **AiDex** (tree-sitter structural index, ultra-compact results)
3. Write a **UserPromptSubmit hook** that:
   - Extracts key terms from the user prompt
   - Searches both tools
   - Injects top-5 relevant results as additional context
4. Write a **SessionStart hook** that injects a compact project overview

### Phase 2 (Next Sprint): Strategy B
1. Build custom MCP server with Effect-aware extractors
2. Use tree-sitter + custom queries to detect Effect patterns
3. Generate natural language summaries during indexing (the Greptile insight)
4. Embed summaries with Nomic CodeRankEmbed locally
5. Store in LanceDB, expose via MCP with `search_codebase` and `find_related` tools
6. Wire into the same UserPromptSubmit hook

### Phase 3 (When Needed): Cherry-pick from Strategy C
- Add graph storage (FalkorDB Lite is zero-config) for relational queries
- Build Effect ontology as Cypher schema
- Add `query_dependencies` and `trace_layers` MCP tools

---

## Specific Tools to Install/Evaluate

| Tool | URL | Priority | Notes |
|------|-----|----------|-------|
| claude-context-local | github.com/FarhanAliRaza/claude-context-local | **P0** | Local FAISS + EmbeddingGemma, MCP for Claude Code |
| AiDex | github.com/CSCSoftware/AiDex | **P0** | tree-sitter + SQLite, ~50 tokens/result |
| Augment Context Engine | augmentcode.com/product/context-engine-mcp | **P1** | Free tier, best quality, not fully local |
| Zilliz Claude Context | github.com/zilliztech/claude-context | **P1** | OSS, hybrid BM25+vector, Milvus backend |
| CodeGraphContext | github.com/nicobailon/CodeGraphContext | **P2** | FalkorDB graph, zero-config, tree-sitter |
| Nomic CodeRankEmbed | huggingface.co/nomic-ai/CodeRankEmbed | **P2** | For custom MCP server (Strategy B) |
| LanceDB | lancedb.com | **P2** | For custom MCP server (Strategy B) |

---

## The Hook Pattern (Key Innovation)

The most impactful piece isn't the search technology — it's **automatic context injection via hooks**. Without hooks, the agent must explicitly decide to search. With a UserPromptSubmit hook, every prompt gets relevant context injected before the agent even starts thinking.

```
User: "Create Account schema based on better-auth"
                    │
                    ▼
         UserPromptSubmit Hook
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
 Search for     Search for      Search for
 "Account"      "Schema"        "better-auth"
 "schema"       "patterns"      "account"
    │               │               │
    └───────┬───────┘               │
            ▼                       ▼
   Inject: "Existing schemas:      Inject: "Related schemas:
   - PackageJson (repo-utils)       - Model.ts patterns
   - WorkspaceGraph (repo-utils)    - VariantSchema patterns
   - Schema annotation convention"  - TaggedErrorClass convention"
```

**Result:** Claude sees relevant patterns BEFORE writing any code. No explicit "research first" instruction needed. Zero extra tokens in your prompt.

---

## What Doesn't Exist Yet (Opportunity)

No tool currently provides:
1. **Effect-aware ontology indexing** — understanding Schema/Service/Layer/TaggedError relationships
2. **Convention enforcement via search** — "here's how we annotate schemas in this repo" auto-injected
3. **Cross-reference resolution** — "AccountSchema is used by AccountService which is provided by AccountLayer"
4. **Pattern template matching** — "you're creating a Schema, here's the template we use"

Building this (Strategy B) would be genuinely novel and useful for any Effect-based project.
