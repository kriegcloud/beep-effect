# Real-World Implementations of Semantic Code Search Systems

Deep research into practical implementations, community projects, experience reports, and
benchmarks for semantic code search systems integrated with AI coding tools.

Last updated: 2026-02-19

---

## Table of Contents

1. [Commercial Products & Their Architectures](#1-commercial-products--their-architectures)
2. [The Agentic Search vs RAG Debate](#2-the-agentic-search-vs-rag-debate)
3. [Community & Open-Source Projects](#3-community--open-source-projects)
4. [Embedding Models for Code: Benchmarks & Practical Guidance](#4-embedding-models-for-code-benchmarks--practical-guidance)
5. [Chunking Strategies: What Actually Works](#5-chunking-strategies-what-actually-works)
6. [Hybrid Search: The Emerging Consensus](#6-hybrid-search-the-emerging-consensus)
7. [The Aider Repo Map Approach](#7-the-aider-repo-map-approach)
8. [TypeScript / Monorepo Specific Considerations](#8-typescript--monorepo-specific-considerations)
9. [Pitfalls & Failure Modes](#9-pitfalls--failure-modes)
10. [Architecture Recommendations](#10-architecture-recommendations)

---

## 1. Commercial Products & Their Architectures

### Greptile

**Source**: [Greptile Blog - Codebases are uniquely hard to search semantically](https://www.greptile.com/blog/semantic-codebase-search), [Graph-Based Codebase Context](https://www.greptile.com/docs/how-greptile-works/graph-based-codebase-context)

**Key insight: Code-to-natural-language translation before embedding.** Greptile discovered
that directly embedding source code performs poorly. A natural language query about HFT fraud
detection had 0.8152 similarity with a code *description* but only 0.7280 with the actual
code -- a 12% gap favoring descriptions.

**Architecture**:
- Translates code to English descriptions before generating embedding vectors
- Function-level chunking (not file-level) -- this is critical
- Graph-based codebase context that understands function relationships and dependencies
- Indexing typically takes 10-30 minutes depending on codebase size
- Supports 30+ programming languages

**Signal-to-noise experiment results**:
- Full file embedding: 0.718 similarity
- File with buried relevant function: 0.739 similarity
- Just the relevant function: 0.768 similarity
- Adding irrelevant code pushes performance closer to noise baseline than to pure signal

**Takeaway**: Chunk tightly (function-level), translate to natural language first, then embed.
Greptile is cloud-only and cannot be self-hosted.

---

### Sourcegraph Cody

**Source**: [How Cody Understands Your Codebase](https://sourcegraph.com/blog/how-cody-understands-your-codebase), [Agentic Context Fetching docs](https://sourcegraph.com/docs/cody/capabilities/agentic-context-fetching)

**Key insight: Cody moved AWAY from embeddings back to Sourcegraph's native search.**

**Architecture**:
- Originally used OpenAI `text-embedding-ada-002` for vector retrieval
- **Transitioned away from embeddings** due to: security concerns (code sent to third
  parties), operational complexity for admins, scalability challenges
- Now uses Sourcegraph's native search engine with BM25 ranking + learned signals
- Multi-stage ranking: query preprocessing -> BM25 scoring -> signal integration -> global
  ranking -> top-N selection
- Repo-level Semantic Graph (RSG) for dependency and relationship understanding
- Agentic context fetching evaluates provided context and fetches additional context via
  Sourcegraph search, terminal, etc.
- Autocomplete uses tree-sitter for intent classification (local search only, no remote)

**Takeaway**: Even Sourcegraph, which built extensive embedding infrastructure, found that
their existing code search engine (BM25 + learned signals) was more practical than
embeddings at scale. The maintenance and security burden of embeddings was not worth it.

---

### Cursor

**Source**: [How Cursor Indexes Codebases Fast](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast), [How Cursor Actually Indexes Your Codebase (TDS)](https://towardsdatascience.com/how-cursor-actually-indexes-your-codebase/)

**Architecture**:
1. **Local chunking**: AST-based parsing using tree-sitter for semantic code splitting
2. **Merkle tree synchronization**: Computes a Merkle tree of file hashes, syncs with
   Cursor's servers, enabling efficient incremental updates (only changed files re-indexed)
3. **Server-side embedding**: Uses OpenAI embedding API or custom model
4. **Turbopuffer storage**: Remote vector database for nearest-neighbor search
5. **Two-stage retrieval**: Vector search for candidates -> AI model re-ranking for relevance
6. **Incremental updates**: Every 10 minutes, checks for hash mismatches, uploads only changes
7. **Privacy**: File paths obfuscated client-side before transmission; no code stored in DBs

**Key detail**: Three chunking approaches used -- token-based (weakest), semantic-aware
(recursive splitters using class/function delimiters), and AST-based (tree-sitter depth-first
traversal, strongest).

**Takeaway**: Cursor's approach is the most well-documented commercial embedding pipeline.
The Merkle tree for incremental updates and two-stage retrieval (vector + reranker) are
proven patterns at scale.

---

### Windsurf (formerly Codeium)

**Source**: [Windsurf IDE Review](https://medium.com/@urano10/windsurf-ide-review-2025-the-ai-native-low-code-coding-environment-formerly-codeium-335093f5619b), [Windsurf Security](https://windsurf.com/security)

**Architecture**:
- AST-based chunking on client side
- Client generates AST, chunks code by AST boundaries, sends chunks to server for embedding
- Embeddings stored locally with pointers (file path, line range) in custom vector store
- Background process updates AST and re-embeds on code changes
- **Riptide (formerly Cortex)**: Proprietary code reasoning engine -- a specialized LLM that
  evaluates snippet relevance, achieving 200% improvement in retrieval recall vs traditional
  embedding systems
- Context pinning and Codeium Search 2 for additional context control

**Key innovation**: Using a trained LLM as a reranker (Riptide) rather than relying solely on
embedding cosine similarity. This gave them a 2x improvement in recall.

---

### Augment Code

**Source**: [Real-time Index for Your Codebase](https://www.augmentcode.com/blog/a-real-time-index-for-your-codebase-secure-personal-scalable), [100M+ Line Codebase Quantized Vector Search](https://www.augmentcode.com/blog/repo-scale-100M-line-codebase-quantized-vector-search)

**The most impressive scale numbers in the industry.**

**Architecture**:
- Continuously indexes up to 500,000 files, feeding a 200,000-token context window
- Designed for codebases up to 100M+ LOC
- Self-hosts embedding search on Google Cloud (avoids third-party API exposure)
- Real-time updates: when someone pushes a commit, the AI knows seconds later

**Quantized vector search performance**:
- Effective embedding models require ~20 bytes per LOC to store and ~20ns per LOC to search
- For 100M LOC: 2GB RAM, 2 seconds per search -- unacceptable for interactive use
- Solution: Approximate Nearest Neighbor (ANN) with quantization
  - Large embedding vectors -> small bit vectors representing semantic neighborhoods
  - Two-stage: query quantized representations for candidates, then full similarity on those
- **Results**: 8x memory reduction (2GB -> 250MB), search latency 2+ seconds -> under 200ms
- **Accuracy**: 99.9% result parity with full embeddings
- Remaining 0.1%: very recent code changes or extremely rare patterns, handled by fallback

**Takeaway**: At extreme scale, quantization is essential. Two-stage search (quantized
candidates -> full rerank) is the proven pattern. Real-time index updates are achievable.

---

### GitHub Copilot

**Source**: [Indexing Repositories for Copilot Chat](https://docs.github.com/copilot/concepts/indexing-repositories-for-copilot-chat), [New Copilot Embedding Model 2025](https://www.capabl.in/blog/elevating-code-retrieval-deep-dive-into-the-new-copilot-embedding-model-2025)

**Architecture**:
- Four distinct search strategies with different trade-offs
- 2025 new embedding model: 37.6% retrieval quality increase, 2x throughput
- Uses Matryoshka Representation Learning (MRL) and contrastive learning
- 8x memory footprint reduction while doubling acceptance rates in C#/Java
- Local SQLite-backed embedding index in VS Code
- Combines with GitHub's non-neural code search on github.com

---

### Claude Code (Anthropic)

**Source**: [RAG Debate: Agentic Search](https://smartscope.blog/en/ai-development/practices/rag-debate-agentic-search-code-exploration/), [Why Claude Code is Special](https://zerofilter.medium.com/why-claude-code-is-special-for-not-doing-rag-vector-search-agent-search-tool-calling-versus-41b9a6c0f4d9)

**The contrarian approach: NO embeddings, NO indexes, NO RAG.**

Claude Code uses pure agentic search -- the LLM iteratively calls grep, find, and read tools
to explore the codebase. Anthropic stated they tried RAG early but agentic search
"outperformed everything. By a lot."

**Why they chose this**:
- No indexing step means no staleness / drift
- No security concerns from stored embeddings
- No infrastructure to maintain
- grep works ~99% of the time when used well
- Iterative refinement: Query -> Result -> "Hmm, not quite" -> Refined Query -> Better Result

**Known weaknesses**:
- Token cost blow-up: exploration loops consume tokens exponentially on large codebases
  (GitHub issues #4556, #20836 document complaints)
- Weak concept search: when terminology doesn't match implementation, semantic search would
  be faster
- Not suitable for very large codebases where exploration is too expensive

---

### Cognition SWE-grep

**Source**: [Introducing SWE-grep](https://cognition.ai/blog/swe-grep)

**A trained model specifically for code retrieval -- the middle ground.**

**Architecture**:
- Multi-turn RL-trained model specialized for parallel context retrieval
- Issues up to 8 parallel tool calls (grep, glob, read) per turn
- Maximum 4 serial turns (3 exploration, 1 answer)
- Reward: weighted F1 scores over file retrieval and line retrieval tasks
- Training uses per-sequence importance sampling for off-policy data stability

**Performance**:
- SWE-grep-mini: 2,800 tokens/second (powered by Cerebras)
- SWE-grep: 650 tokens/second
- Baseline (Haiku 4.5): 140 tokens/second
- Matches frontier model retrieval quality at 10x less time
- Finds relevant code in React/Vercel/PyTorch in seconds vs minutes for Claude/Cursor

**Key insight**: By increasing parallelism from 4 to 8 searches per turn, they reduced
required turns from 6 to 4 while retaining same performance. Operates as a specialized
subagent, preserving the main agent's context budget.

**Takeaway**: Purpose-trained retrieval models are a viable third path between RAG and
pure agentic search. The parallelism insight is particularly valuable.

---

### Tabby ML

**Source**: [Tabby GitHub](https://github.com/TabbyML/tabby)

Self-hosted AI coding assistant. Uses hybrid retrieval: semantic search over indexed repos +
BM25 keyword search, merged using Reciprocal Rank Fusion (RRF). Incorporates locally relevant
snippets (declarations from local LSP, recently modified code) for completions. Fully
self-hosted, no cloud dependency.

---

### Sweep AI

**Source**: [Sweep Founders Share Learnings](https://e2b.dev/blog/sweep-founders-share-learnings-from-building-an-ai-coding-assistant)

Key lesson from Sweep founders: "When an agent fails, it is in approximately 20% cases caused
by prompts, and 80% all kinds of other issues." The retrieval and infrastructure problems
dominate over prompt engineering problems. They are investing in improved code indexing and
retrieval strategies.

---

### Meta's Glean (Code Indexing at Scale)

**Source**: [Engineering at Meta - Indexing Code at Scale with Glean](https://engineering.fb.com/2024/12/19/developer-tools/glean-open-source-code-indexing/)

**Not an AI coding tool, but the gold standard for code fact storage at scale.**

**Architecture**:
- Stores structured facts about code (not embeddings) using language-specific schemas
- Uses RocksDB for storage, language-agnostic design
- Angle query language: declarative, logic-based, returns initial results in ~1ms
- **Incremental indexing**: O(changes) not O(repository) -- processes only diffs
- Immutable database stacking: multiple DB layers stack non-destructively, enables viewing
  the whole index at different revisions simultaneously
- Diff sketches: machine-readable summaries of changes (new classes, removed methods, etc.)
- Deployed across C++, Python, PHP, JavaScript, Rust, Erlang, Thrift, Haskell

**Scale**: Powers code navigation, IDE enhancement, documentation generation, dead code
detection, build dependency analysis, test selection, and RAG for AI coding assistants
across Meta's massive monorepo.

**Takeaway**: For structured code intelligence at scale, a fact-based system (not embedding-
based) with incremental indexing is proven. Glean is open-source but described as
"pre-release software with many rough edges."

---

## 2. The Agentic Search vs RAG Debate

This is the most actively debated topic in the AI coding tool space as of early 2026.

### The Core Positions

| Approach | Champion | Strengths | Weaknesses |
|----------|----------|-----------|------------|
| Pure Agentic (grep/ls/read) | Claude Code | No staleness, no infra, simple, secure | Token-expensive, slow on large repos, weak concept search |
| Embedding RAG | Cursor, Windsurf | Fast retrieval, good concept search, token-efficient | Staleness, infra overhead, security concerns, chunking is hard |
| Hybrid (both) | Augment Code, practical consensus | Best of both worlds | Complexity, two systems to maintain |
| Trained retrieval model | Cognition SWE-grep | Fast, accurate, parallelizable | New approach, limited availability |
| Native code search (BM25+) | Sourcegraph Cody | Proven at scale, no embedding overhead | Requires search infrastructure |

### Practical KPIs for Evaluation

From the SmartScope analysis:

| Metric | What It Reveals | Interpretation |
|--------|-----------------|----------------|
| Time-to-first-relevant-file (TTFRF) | Search efficiency | High values suggest semantic search benefits |
| Tokens-per-task | Cost trajectory | Escalating costs indicate exploration inefficiency |
| Staleness incidents | Index freshness impact | Frequent incidents favor live exploration |

### The 2026 Consensus

The winning approach appears to be **hybrid**:
- **Core**: Agentic search as primary mechanism (accuracy, freshness, verification)
- **Supplement**: Semantic index for concept search, massive repos, cross-cutting concerns
- **Optimization**: Context compression (summaries/sketches) to reduce re-reads
- **Control**: Permission guards and configuration for scope management

Key quote from the HN discussion: "LLMs with a grep or full-text search tool turn out to be
great at fuzzy search already through simple OR conditions." But this breaks down when you
need to find code by description of what it does, not what it's named.

---

## 3. Community & Open-Source Projects

### MCP Servers for Code Search

**Claude Context (Zilliz)** - [GitHub](https://github.com/zilliztech/claude-context)
- Hybrid search: BM25 + dense vector embeddings via Milvus/Zilliz Cloud
- Multiple embedding providers: OpenAI (default text-embedding-3-small), VoyageAI
  (voyage-code-3), custom models
- MCP tools: `index_codebase`, `search_code`, `clear_index`, `get_indexing_status`
- Claims ~40% token reduction vs loading full directories
- Requires: Node.js 20-23, Zilliz Cloud account, OpenAI API key

**Claude Context Local** - [GitHub](https://github.com/FarhanAliRaza/claude-context-local)
- Fork of above, embeddings created and stored locally
- No API cost for embeddings
- 100% local operation

**Code Index MCP** - [GitHub](https://github.com/johnhuang316/code-index-mcp)
- Dual-strategy: shallow index (file inventory) + deep index (symbol metadata)
- Tree-sitter AST parsing for 7 core languages, fallback for 50+ file types
- Auto-detects best search tool (ugrep, ripgrep, ag, grep)
- File system monitoring for real-time updates
- No embedding step -- purely structural/AST based

**Elastic Semantic Code Search MCP** - [GitHub](https://github.com/elastic/semantic-code-search-mcp-server)
- Uses Elasticsearch for indexing and retrieval
- MCP server exposes indexed data through standardized tools

**RAG Code MCP** - [GitHub](https://github.com/doITmagic/rag-code-mcp)
- Multi-language support (Go, PHP, Laravel, Python, HTML)
- Uses local LLMs (Ollama) + Qdrant vector search
- Works with Cursor, Windsurf, Copilot, Claude

**Serena** - [GitHub](https://github.com/oraios/serena)
- Uses Language Server Protocol (LSP) for semantic code understanding
- Symbol-level operations: find_symbol, find_referencing_symbols, insert_after_symbol
- NOT embedding-based -- leverages existing language server infrastructure
- 17.1k GitHub stars, MIT license, actively maintained
- Free alternative to Cursor/Windsurf for code intelligence

**Tree-Sitter MCP Server** - [GitHub](https://github.com/wrale/mcp-server-tree-sitter)
- AST-based code analysis for Claude Desktop
- Language-agnostic via tree-sitter-language-pack
- Symbol extraction, dependency analysis, pattern search, complexity analysis
- State maintained between invocations, parse trees cached

**ast-grep MCP** - [GitHub](https://github.com/ast-grep/ast-grep-mcp)
- Structural code search using AST patterns
- Type-safe AST manipulation
- Language-agnostic via tree-sitter

### Standalone Projects

**code-graph-rag** - [GitHub](https://github.com/vitali87/code-graph-rag)
- Builds knowledge graphs from codebases using tree-sitter
- UniXcoder embeddings for intent-based semantic search
- Supports cloud (Gemini) and local (Ollama) models
- Works as MCP server with Claude Code

**CodeRAG** - [GitHub](https://github.com/Neverdecel/CodeRAG)
- FAISS-powered vector search with OpenAI embeddings
- Real-time updates through file system monitoring
- Streamlit web interface

**GitNexus** - [GitHub](https://github.com/abhigyanpatwari/GitNexus)
- Client-side knowledge graph creator, runs entirely in browser
- Built-in Graph RAG Agent
- Drop in a GitHub repo or ZIP file

**CocoIndex** - [GitHub](https://github.com/cocoindex-io/cocoindex)
- Data transformation framework for AI with incremental processing
- Native tree-sitter Rust integration for code chunking
- Uses Postgres for data lineage tracking
- Near-real-time incremental indexing (only reprocesses changes)
- Powers code context for Claude, Codex, Gemini CLI

**rag-cli** - [GitHub](https://github.com/ItMeDiaTech/rag-cli)
- Local RAG plugin for Claude Code
- Chroma DB vector embeddings + multi-agent framework
- Bridge to Claude Code CLI with no token use for embeddings

---

## 4. Embedding Models for Code: Benchmarks & Practical Guidance

### Benchmark Comparison (as of early 2026)

**On CoIR (Code Information Retrieval Benchmark)**:

| Model | CoIR Score | Parameters | Notes |
|-------|-----------|------------|-------|
| Qodo-Embed-1-7B | 71.5 | 7B | Best overall (Feb 2025) |
| Qodo-Embed-1-1.5B | 70.06 | 1.5B | Best size/performance ratio |
| SFR-Embedding-2_R (Salesforce) | 67.41 | - | General purpose |
| OpenAI text-embedding-3-large | 65.17 | - | General purpose |

**On 32 Code Retrieval Datasets (Voyage AI suite)**:

| Model | Avg Score | Dimension | Notes |
|-------|-----------|-----------|-------|
| voyage-code-3 (2048d) | 92.12% | 2048 | Best absolute performance |
| voyage-code-3 (1024d) | 92.28% | 1024 | Best quality/cost ratio |
| OpenAI v3-Large | 75-88% | 3072 | Varies by dimension |
| CodeSage-Large | 67-91% | varies | Strong at native dimension |

Sources: [Voyage AI Blog](https://blog.voyageai.com/2024/12/04/voyage-code-3/), [Modal Blog](https://modal.com/blog/6-best-code-embedding-models-compared), [Qodo Blog](https://www.qodo.ai/blog/qodo-embed-1-code-embedding-code-retrieval/)

### Model Selection Guide

| Use Case | Recommended Model | Why |
|----------|-------------------|-----|
| Best quality, cloud OK | voyage-code-3 | 13.8% better than OpenAI at 1/3 storage |
| Best open-source, self-hosted | Qodo-Embed-1-1.5B | Best CoIR score at small size |
| Large context (32K tokens) | voyage-code-3 | Only code model with 32K context |
| Privacy-first, local | Nomic Embed Code | Fully local, decent quality |
| Budget, getting started | OpenAI text-embedding-3-small | Cheap, easy API |
| Quick prototype | Sentence Transformers (local) | Easiest setup, Python-native |

### Key Findings

1. **Code-specific models dramatically outperform general-purpose models** for code retrieval.
   OpenAI's general embedding model scores 65 on CoIR while specialized models score 70+.

2. **Matryoshka learning enables flexible dimension/quality tradeoffs** -- voyage-code-3 at
   256 binary dimensions still beats OpenAI at 3072 float dimensions.

3. **Open-source models are catching up** -- Qodo-Embed-1-1.5B at 1.5B parameters beats
   OpenAI and can run on consumer GPUs.

4. **General-purpose models confuse similar code**: They latch onto shared keywords and miss
   nuanced functional differences (e.g., "analyzing failures" vs "proactively handling
   failures"). Code-specific training is essential.

---

## 5. Chunking Strategies: What Actually Works

### The Hierarchy (worst to best)

1. **Fixed-size token chunks** -- Splits mid-function, destroys semantic integrity. Avoid.

2. **File-level chunks** -- Massive noise. Greptile's experiment showed adding irrelevant code
   to a file pushed similarity scores toward noise baseline. Only useful for very small files.

3. **Method/class-level extraction** -- Extract functions and classes individually. Significant
   improvement over file-level. This is the minimum viable approach.

4. **AST-based (tree-sitter) chunking** -- Parse into AST, extract meaningful units preserving
   hierarchical relationships. Respects code structure. Used by Cursor, Windsurf, LanceDB,
   CocoIndex, and most serious implementations.

5. **AST + natural language augmentation** -- Parse with tree-sitter, generate natural language
   descriptions for each chunk, embed both code and descriptions. Used by Greptile and Qodo.
   Best retrieval quality but highest cost.

### Practical Chunking Lessons

**From Qodo's enterprise deployment**:
- Naive chunking misses crucial context like import statements and class definitions
- Solution: language-specific static analysis with recursive node division and retroactive
  context re-addition (re-add imports and class definitions to each chunk)
- Target chunk size: ~500 characters
- Different file types need different strategies (e.g., OpenAPI specs chunk by endpoint)

**From Continue.dev**:
- Tree-sitter parses AST, checks if file fits as-is
- If not, pulls out top-level functions/classes
- For each, checks if it fits the embedding context window
- If not, truncates sub-method contents
- Respects .gitignore, supports .continueignore for additional exclusions
- Default storage: `~/.continue/index/index.sqlite`

**From LanceDB's RAG guide**:
- Stack-based traversal of tree-sitter AST to find class/method references
- Stores location data (file, line, column) for attribution
- Entire method/class blocks preferable to fragments for LLM context
- Multi-hop questions require gathering context from multiple source locations

---

## 6. Hybrid Search: The Emerging Consensus

Most successful production systems now use hybrid search combining lexical (BM25) and
semantic (vector) retrieval.

### Why Hybrid Beats Either Alone

**BM25 excels at**: exact symbol names, API identifiers, configuration keys, brand-new terms
not in embedding training data, SKUs/codes, proprietary names.

**Vector search excels at**: conceptual queries ("where do we handle authentication?"),
legacy codebases with inconsistent naming, cross-repository context, understanding
relationships across scattered code.

**Neither alone is sufficient for code**: Code contains both precise identifiers (BM25) and
semantic concepts (vectors). A query like "how does the payment retry logic work?" needs
semantic understanding AND exact symbol resolution.

### Reciprocal Rank Fusion (RRF)

The standard approach to combining BM25 and vector results:
- Run BM25 query and vector kNN query independently
- Fuse by ranks (not raw scores) to avoid incompatible score scale problems
- Simple formula: for each document, sum 1/(rank + k) across all retrievers
- Strong baseline without extensive tuning
- Used by: Tabby ML, Claude Context (Zilliz), OpenSearch, Anthropic's contextual retrieval

**Anthropic's benchmark**: Reranked Contextual Embedding + Contextual BM25 reduced
top-20-chunk retrieval failure rate by 67% (5.7% -> 1.9%).

### Multi-Stage Retrieval

The most effective architecture uses multiple stages:
1. **Broad retrieval**: BM25 + vector search, top 50 results
2. **Reranking**: ML reranker or LLM scores top 50, selects top 5-15
3. **Context assembly**: Combine reranked snippets with local IDE context

This pattern is used by Cursor (vector + AI rerank), Windsurf (Riptide reranker), Cody
(BM25 + learned signals), and Augment Code (quantized ANN + full rerank).

---

## 7. The Aider Repo Map Approach

**Source**: [Building a Better Repository Map with Tree-Sitter](https://aider.chat/2023/10/22/repomap.html), [Repository Map docs](https://aider.chat/docs/repomap.html)

### How It Works

Aider takes a fundamentally different approach: instead of embedding search, it creates a
compact textual overview of the entire repository that fits within the LLM context window.

1. **Parse all files** with tree-sitter to extract class/function/type definitions and
   their signatures
2. **Build a dependency graph** where files are nodes and edges connect files that share
   symbols
3. **Rank nodes** using a graph ranking algorithm (similar to PageRank) to identify the
   most-referenced/important symbols
4. **Select top symbols** that fit within the token budget (default: 1,000 tokens via
   `--map-tokens`)
5. **Output a compact map** showing file structure with key class/function signatures

### Strengths

- **No infrastructure**: No vector DB, no embedding API, no background indexing
- **Always fresh**: Regenerated on each request from current source files
- **Token-efficient**: Compact representation at configurable token budget
- **Language-agnostic**: tree-sitter handles parsing across languages
- **Full-repo overview**: LLM sees the structure of the entire codebase at once

### Known Limitations

From community reports and HN discussion:

1. **Assumes all symbols are unique**: If you have 10 symbols called `fetchRequest`, it
   treats them as the same symbol. Common names get over-represented.

2. **No relevance to current task**: Ranks by global frequency of usage, not by relevance
   to the specific change being made. Feature flag methods and generic symbols like `name()`
   can dominate the map.

3. **Import resolution is hard**: Different languages have wildly different import systems.
   Some repos have imports that tree-sitter alone cannot resolve.

4. **No semantic understanding**: Cannot find code by description of what it does. If you
   need "the function that validates email addresses," you need to know it's called
   `validateEmail` or similar.

5. **Token budget limits**: At 1K tokens, the map is very compressed for large repos.
   Increasing budget helps but competes with space for actual code context.

### Could It Be Combined with Embedding Search?

Yes, and this is likely the optimal approach for a lightweight system:

- **Repo map for structural overview**: Always include a compact map so the LLM knows the
  lay of the land (file structure, key symbols, dependencies)
- **Embedding search for targeted retrieval**: When the LLM needs specific code, use
  semantic search to find and retrieve relevant chunks
- **Hybrid query**: LLM reads the map, forms a plan, then requests specific code via search

This combination gives the LLM both breadth (map) and depth (search), without requiring
either the full codebase in context or blind grep exploration.

---

## 8. TypeScript / Monorepo Specific Considerations

### Tree-Sitter for TypeScript

Tree-sitter has first-class TypeScript support. Most tools (Cursor, Aider, CocoIndex,
Code Index MCP) handle TypeScript well for:
- Function/method/class extraction
- Interface and type definitions
- Module structure parsing
- JSX/TSX support

### TypeScript Language Server as Code Intelligence

The TypeScript Language Server (tsserver) provides capabilities that overlap significantly
with what embedding-based search tries to achieve:
- **Go to definition**: Exact symbol resolution across the entire project
- **Find all references**: Complete enumeration of where a symbol is used
- **Find implementations**: For interfaces, finds all implementing classes
- **Rename symbol**: Codebase-wide, semantically correct
- **Call hierarchy**: Incoming and outgoing calls for any function

**Serena** leverages exactly this approach -- using LSP as the retrieval layer instead of
embeddings. For TypeScript projects, this gives you free, always-accurate, zero-config
code intelligence.

### Monorepo Challenges

- **Cross-package references**: Need to resolve imports across package boundaries
- **Shared types**: Type definitions in one package used across many
- **Build graph**: Understanding which packages depend on which
- **Scale**: Large monorepos may have 100K+ files, overwhelming for full-context approaches
- **Effect ecosystem**: Effect v4's module structure (deep re-exports, branded types,
  service patterns) creates unique patterns that generic embeddings may not capture well

### Recommendations for TypeScript Monorepos

1. **Start with LSP-based tools** (Serena, tree-sitter MCP) for structural intelligence
2. **Use tree-sitter for chunking** -- TypeScript parser is mature and reliable
3. **Consider repo map** approach for monorepo-wide structural overview
4. **Add embedding search** only when LSP + grep is insufficient (concept search, large-scale
   retrieval)
5. **Package-level scoping**: Allow users to scope searches to specific packages for faster,
   more relevant results

---

## 9. Pitfalls & Failure Modes

### Embedding-Specific Pitfalls

1. **General-purpose models fail on code**: Text embedding models miss code-specific features
   like syntax trees, indentation semantics, and bracket matching. Always use code-specific
   models (voyage-code-3, Qodo-Embed-1, etc.).

2. **Keyword conflation**: General models latch onto shared keywords and miss functional
   differences. "Analyzing failures" and "handling failures" look similar to general models
   but are fundamentally different operations.

3. **Natural language augmentation is expensive**: Generating descriptions for every chunk
   using an LLM adds significant cost and latency to the indexing pipeline.

4. **Index staleness**: Code changes faster than most indexing pipelines update. Cursor
   updates every 10 minutes; Augment Code updates in seconds. Anything slower creates
   drift issues.

5. **Quantization quality loss**: While Augment Code achieves 99.9% parity, the remaining
   0.1% can matter for edge cases. Recent code changes are the most vulnerable.

### RAG-Specific Pitfalls

6. **Chunking destroys context**: Splitting a method from its class definition or imports
   loses critical information. Retroactive context addition (Qodo's approach) helps but
   adds complexity.

7. **Multi-hop queries**: Questions that require information from multiple dispersed
   locations ("how does data flow from the API endpoint to the database?") are poorly served
   by single-shot retrieval. Need multiple retrieval rounds or graph-based approaches.

8. **Noise in large results**: Vector similarity search returns "sort of related" results.
   Without reranking, top-20 results can be mostly irrelevant. Always add a reranking stage.

### Agentic Search Pitfalls

9. **Token explosion**: Iterative exploration on large codebases can consume 10-100x more
   tokens than indexed retrieval. Users report exponential token consumption on Claude Code
   for large repos.

10. **Concept search failure**: When you don't know what a feature is called, grep-based
    exploration struggles. "Find the code that handles rate limiting" fails if the
    implementation uses terms like "throttle" or "backpressure."

### Infrastructure Pitfalls

11. **Security exposure**: Embeddings stored in cloud services create liability. Sourcegraph
    Cody moved away from OpenAI embeddings partly for this reason.

12. **Disk I/O bottleneck**: Embeddings create poor disk locality. HN discussion notes
    throughput limited to ~50,000 embeddings per 100ms on typical hardware.

13. **Memory pressure**: In-memory vector indexes compete with IDE and LLM memory needs.
    Quantization helps but adds complexity.

### Process Pitfalls (from Sweep founders)

14. **80/20 rule of failures**: 20% of agent failures are prompt-related, 80% are
    infrastructure/retrieval/other. Focus on the retrieval pipeline, not just prompts.

15. **HN reality check**: One developer noted that despite high enthusiasm for vector search
    in 2024, they found simple full-text search + LLM reranking sufficient for most cases.
    Think carefully about whether embeddings actually help before investing in the
    infrastructure.

---

## 10. Architecture Recommendations

### For a Lightweight Self-Hosted System (Our Use Case)

Based on the collective evidence, the recommended architecture for a TypeScript monorepo
with an MCP server interface:

#### Tier 1: Always-On (Zero-Config, No Embeddings)

1. **Repo map via tree-sitter**: Compact structural overview of the entire codebase
   - File structure, class/function signatures, dependency graph
   - Configurable token budget (1K-4K tokens)
   - Regenerated on request from current source files
   - Based on Aider's proven approach

2. **LSP-based symbol intelligence**: Leverage TypeScript language server
   - find_symbol, find_references, find_implementations
   - Always accurate, zero drift, free
   - Based on Serena's proven approach

3. **Smart grep**: Ripgrep with semantic query expansion
   - LLM reformulates natural language queries into multiple grep patterns
   - Fast, always current, no infrastructure

#### Tier 2: Enhanced (Optional Embedding Layer)

4. **AST-aware chunking**: Tree-sitter parsing, function/class-level chunks
   - Retroactive context injection (imports, class definitions)
   - Target ~500 character chunks

5. **Hybrid search**: BM25 + vector embeddings with RRF fusion
   - Local embedding model (Qodo-Embed-1-1.5B or Nomic Embed Code)
   - SQLite or local vector store (no cloud dependency)
   - Two-stage: broad retrieval + reranking

6. **Incremental indexing**: Only re-index changed files
   - File hash tracking (Cursor's Merkle tree approach)
   - Background update on file save
   - CocoIndex's incremental processing pattern

#### Key Design Principles

- **Start without embeddings**: LSP + tree-sitter + grep covers 80%+ of use cases
- **Add embeddings only for concept search**: When users need to find code by description
  rather than by name
- **Local-first**: No cloud APIs required for core functionality
- **Incremental**: Never re-index the entire codebase on changes
- **Hybrid retrieval**: BM25 + vectors with RRF when embeddings are enabled
- **Reranking**: Always add a reranking step before presenting results to the LLM
- **Token budget awareness**: Track and optimize token usage across all retrieval methods

---

## Source Index

### Commercial Products
- [Greptile - Semantic Codebase Search](https://www.greptile.com/blog/semantic-codebase-search)
- [Greptile - Graph-Based Context](https://www.greptile.com/docs/how-greptile-works/graph-based-codebase-context)
- [Sourcegraph - How Cody Understands Your Codebase](https://sourcegraph.com/blog/how-cody-understands-your-codebase)
- [Sourcegraph - Agentic Context Fetching](https://sourcegraph.com/docs/cody/capabilities/agentic-context-fetching)
- [Cursor - How Cursor Indexes Codebases Fast](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast)
- [Cursor - How Cursor Actually Indexes Your Codebase](https://towardsdatascience.com/how-cursor-actually-indexes-your-codebase/)
- [Windsurf IDE Review](https://medium.com/@urano10/windsurf-ide-review-2025-the-ai-native-low-code-coding-environment-formerly-codeium-335093f5619b)
- [Augment Code - Real-time Index](https://www.augmentcode.com/blog/a-real-time-index-for-your-codebase-secure-personal-scalable)
- [Augment Code - 100M+ LOC Quantized Search](https://www.augmentcode.com/blog/repo-scale-100M-line-codebase-quantized-vector-search)
- [GitHub Copilot - Indexing Repositories](https://docs.github.com/copilot/concepts/indexing-repositories-for-copilot-chat)
- [GitHub Copilot - New Embedding Model 2025](https://www.capabl.in/blog/elevating-code-retrieval-deep-dive-into-the-new-copilot-embedding-model-2025)
- [Cognition - SWE-grep](https://cognition.ai/blog/swe-grep)
- [Tabby ML](https://github.com/TabbyML/tabby)
- [Sweep Founders Learnings](https://e2b.dev/blog/sweep-founders-share-learnings-from-building-an-ai-coding-assistant)
- [Meta Glean - Indexing Code at Scale](https://engineering.fb.com/2024/12/19/developer-tools/glean-open-source-code-indexing/)

### Agentic vs RAG Debate
- [SmartScope - RAG Debate: Agentic Search](https://smartscope.blog/en/ai-development/practices/rag-debate-agentic-search-code-exploration/)
- [Why Claude Code is Special (Medium)](https://zerofilter.medium.com/why-claude-code-is-special-for-not-doing-rag-vector-search-agent-search-tool-calling-versus-41b9a6c0f4d9)
- [Alberto Roura - Vector RAG + Agentic: Why Not Both?](https://albertoroura.com/vector-rag-agentic-search-why-not-both/)
- [Milvus - Against Claude Code's Grep-Only Retrieval](https://milvus.io/blog/why-im-against-claude-codes-grep-only-retrieval-it-just-burns-too-many-tokens.md)
- [PageIndex - From Claude Code to Agentic RAG](https://pageindex.ai/blog/claude-code-agentic-rag)

### Embedding Models & Benchmarks
- [Voyage AI - voyage-code-3](https://blog.voyageai.com/2024/12/04/voyage-code-3/)
- [Modal - 6 Best Code Embedding Models](https://modal.com/blog/6-best-code-embedding-models-compared)
- [Qodo - State-of-the-Art Code Retrieval](https://www.qodo.ai/blog/qodo-embed-1-code-embedding-code-retrieval/)
- [Qodo - RAG for Large-Scale Repos](https://www.qodo.ai/blog/rag-for-large-scale-code-repos/)

### Building RAG for Code
- [LanceDB - Building RAG on Codebases Part 1](https://lancedb.com/blog/building-rag-on-codebases-part-1/)
- [LanceDB - Building RAG on Codebases Part 2](https://lancedb.com/blog/building-rag-on-codebases-part-2/)
- [CocoIndex - Real-Time Codebase Indexing](https://cocoindex.io/blogs/index-code-base-for-rag)
- [Continue.dev - Custom Code RAG](https://docs.continue.dev/guides/custom-code-rag)

### MCP Servers & Community Projects
- [Claude Context (Zilliz)](https://github.com/zilliztech/claude-context)
- [Claude Context Local](https://github.com/FarhanAliRaza/claude-context-local)
- [Code Index MCP](https://github.com/johnhuang316/code-index-mcp)
- [Elastic Semantic Code Search MCP](https://github.com/elastic/semantic-code-search-mcp-server)
- [RAG Code MCP](https://github.com/doITmagic/rag-code-mcp)
- [Serena](https://github.com/oraios/serena)
- [Tree-Sitter MCP Server](https://github.com/wrale/mcp-server-tree-sitter)
- [ast-grep MCP](https://github.com/ast-grep/ast-grep-mcp)
- [code-graph-rag](https://github.com/vitali87/code-graph-rag)
- [CocoIndex](https://github.com/cocoindex-io/cocoindex)
- [rag-cli](https://github.com/ItMeDiaTech/rag-cli)

### Aider Repo Map
- [Building a Better Repository Map with Tree-Sitter](https://aider.chat/2023/10/22/repomap.html)
- [Repository Map docs](https://aider.chat/docs/repomap.html)
- [HN Discussion - Aider Repo Map](https://news.ycombinator.com/item?id=41485744)

### Hybrid Search
- [Anthropic - Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)
- [HN - Vector Search Reality Check](https://news.ycombinator.com/item?id=46382550)
