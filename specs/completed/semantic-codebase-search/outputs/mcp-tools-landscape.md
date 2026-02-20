# Semantic Codebase Search/Indexing Tools Landscape

**Research Date:** 2026-02-19
**Goal:** Identify tools that can index a codebase semantically, surface relevant existing code for task prompts, and integrate via MCP protocol or hooks with Claude Code and other agentic coding tools.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Tier 1: Production-Ready MCP Servers](#tier-1-production-ready-mcp-servers)
3. [Tier 2: Promising / Maturing MCP Servers](#tier-2-promising--maturing-mcp-servers)
4. [Tier 3: Structural / AST-Only Indexers (No Embeddings)](#tier-3-structural--ast-only-indexers-no-embeddings)
5. [Tier 4: Platform-Integrated Solutions](#tier-4-platform-integrated-solutions)
6. [Tier 5: Non-MCP Tools Worth Watching](#tier-5-non-mcp-tools-worth-watching)
7. [Comparative Analysis](#comparative-analysis)
8. [Integration Approaches with Claude Code](#integration-approaches-with-claude-code)
9. [Recommendations](#recommendations)

---

## Executive Summary

The semantic codebase search space has exploded since MCP's standardization in late 2024. As of February 2026, there are 15+ MCP servers specifically designed for codebase indexing/search, ranging from simple tree-sitter structural indexers to full hybrid search engines with vector embeddings. The key differentiators are:

- **Embedding strategy**: Cloud API (OpenAI, Voyage AI) vs local (Ollama, EmbeddingGemma, ONNX)
- **Indexing approach**: Vector embeddings only, structural AST only, or hybrid (BM25 + dense vector)
- **Token efficiency**: Raw code dumps vs compacted structural summaries (50-99% reduction claims)
- **Privacy model**: Fully local vs cloud-dependent
- **Language coverage**: Varies from 11 to 48+ languages

The most mature and relevant options for Claude Code integration are **Augment Context Engine MCP**, **Zilliz Claude Context**, **Serena** (already installed), **AiDex**, and **CodeMCP/CKB**.

---

## Tier 1: Production-Ready MCP Servers

### 1.1 Augment Context Engine MCP

**Repo/Docs:** https://docs.augmentcode.com/context-services/mcp/overview
**Product page:** https://www.augmentcode.com/product/context-engine-mcp

**What it is:** Commercial-grade semantic indexing engine exposed as an MCP server. Built by Augment Code (well-funded startup). Understands relationships between hundreds of thousands of files.

**Architecture:**
- Two modes: **Local** (Auggie CLI runs locally, indexes working directory) and **Remote** (connects to Augment's hosted API for cross-repo context)
- Semantic indexing that maps code relationships, not just text
- Understands history and evolution of codebase

**Key metrics:**
- 30-80% quality improvements across coding agents (their benchmarks)
- Fewer tool calls and conversation turns per task
- Setup time: ~2 minutes

**Pricing:**
- 1,000 free requests/month
- Average 40-70 credits per query
- Paid tiers for teams/enterprise

**Integration with Claude Code:** Direct MCP server configuration. Explicitly lists Claude Code as supported client.

**Pros:**
- Best-in-class retrieval quality (battle-tested at scale)
- Local mode keeps code on your machine
- Cross-repo context in remote mode
- Active development, well-funded company
- Minimal setup

**Cons:**
- Not fully self-hosted (even local mode uses Augment's embedding models)
- Credit-based pricing can add up
- Closed source core engine
- Dependency on a startup's continued existence

**Verdict:** Best overall quality if you're willing to use a commercial service. The free tier is sufficient for individual use on small-to-medium projects.

---

### 1.2 Zilliz Claude Context (+ CodeIndexer)

**Repo:** https://github.com/zilliztech/claude-context
**npm:** `@zilliz/claude-context-mcp`

**What it is:** MCP plugin built specifically for Claude Code by Zilliz (the company behind Milvus vector database). Adds semantic code search with hybrid retrieval (BM25 + dense vector).

**Architecture:**
- Core: `@zilliz/claude-context-core` (indexing engine)
- MCP: `@zilliz/claude-context-mcp` (MCP server)
- VSCode Extension also available
- AST-based code splitting with automatic fallback to character-based
- Hybrid search: BM25 (keyword) + dense vector (semantic)

**Embedding providers:** OpenAI, VoyageAI, Ollama, Gemini
**Vector DBs:** Milvus (self-hosted) or Zilliz Cloud (managed)
**Languages:** TypeScript, JavaScript, Python, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala, Markdown (14 languages)

**Key metrics:**
- ~40% token reduction with equivalent retrieval quality
- Active development (162+ GitHub issues, responsive maintainers)

**Installation:** `npx @zilliz/claude-context-mcp@latest`

**Pros:**
- Built explicitly for Claude Code (tight integration)
- Hybrid search is genuinely better than pure vector or pure keyword
- Supports local embeddings via Ollama (no API cost)
- AST-aware chunking preserves code structure
- Actively maintained by a well-established company (Zilliz/Milvus)
- Can use Milvus self-hosted for full local operation

**Cons:**
- Requires external vector DB (Milvus or Zilliz Cloud)
- Setup is more involved than simpler alternatives
- 14 languages (decent but not exhaustive)
- Initial indexing can be slow for large codebases

**Verdict:** Best open-source option for Claude Code specifically. The Ollama + Milvus combo gives fully local operation. Hybrid search quality is a real differentiator.

---

### 1.3 Serena (Already Installed)

**Repo:** https://github.com/oraios/serena
**Status:** Already configured as MCP server in this environment

**What it is:** LSP-backed coding agent toolkit providing semantic retrieval and editing. Uses Language Server Protocol for symbol-level code understanding.

**Architecture:**
- MCP server wrapping LSP (Language Server Protocol) capabilities
- Understands code at symbol level: classes, functions, methods, references
- 30+ language support via LSP library
- NOT embedding-based -- uses structural/symbolic understanding

**Key capabilities:**
- `find_symbol` / `find_referencing_symbols` -- precise symbol navigation
- `get_symbols_overview` -- file-level structural summaries
- `search_for_pattern` -- regex across codebase
- `replace_symbol_body` / `insert_after_symbol` -- structural editing
- Memory system for project knowledge persistence

**Pros:**
- Already installed and working in this environment
- True semantic understanding via LSP (not just text similarity)
- Precise: knows exactly where symbols are defined and referenced
- Edit capabilities (not just search)
- No embedding infrastructure needed
- Fast for structural queries

**Cons:**
- No natural language query support (must know symbol names or patterns)
- No "find code similar to this concept" capability
- Doesn't index patterns/conventions/architectural decisions
- LSP can be slow to initialize for large projects
- Not designed for "surface relevant existing code given a task prompt"

**Verdict:** Excellent for precise symbol navigation but does NOT solve the "search for existing patterns before coding" problem. Complementary to embedding-based search.

---

## Tier 2: Promising / Maturing MCP Servers

### 2.1 CodeMCP / CKB (Code Knowledge Backend) by SimplyLiz

**Repo:** https://github.com/SimplyLiz/CodeMCP
**npm:** `@tastehub/ckb`

**What it is:** Code intelligence MCP server with 80+ tools. Uses SCIP (Sourcegraph's Code Intelligence Protocol) for precise, pre-indexed symbol data.

**Architecture:**
- SCIP indexing as primary backend (precise, pre-built indexes)
- Multiple tool presets: "core" (14 tools), "full" (80+ tools)
- Supports Go, TypeScript, Python, Rust, Java, Kotlin, C++, Dart, Ruby, C#

**Key capabilities:**
- Semantic symbol search, call graphs, usage tracing
- Change impact analysis with blast radius and risk scoring
- Dead code detection
- Affected test identification
- Architecture exploration and module dependency maps

**Pros:**
- Extremely rich toolset (80+ tools)
- SCIP indexing is production-proven (Sourcegraph's technology)
- Impact analysis / blast radius is unique and valuable
- TypeScript support is important for our use case

**Cons:**
- Requires generating SCIP indexes (additional build step)
- No embedding-based natural language search
- Tool count (80+) may overwhelm agents with tool selection
- Relatively new project, smaller community

**Verdict:** Very powerful for understanding code relationships and change impact. The SCIP requirement adds friction but produces precise results. Best for "understand the blast radius of this change" rather than "find patterns similar to X."

---

### 2.2 Code-Index-MCP by ViperJuice

**Repo:** https://github.com/ViperJuice/Code-Index-MCP
**Version:** 1.0.0 (MVP Release)

**What it is:** Local-first code indexer with hybrid search (BM25 + Voyage AI embeddings), tree-sitter integration, and 48-language support.

**Architecture:**
- Local index storage at `.indexes/`
- Plugin-based design for language-specific handling
- Tree-sitter for structural parsing
- Voyage AI for semantic embeddings
- BM25 + semantic hybrid search with configurable fusion
- File system monitoring for real-time updates

**Key metrics:**
- Sub-100ms query performance
- <10 second indexing for cached repos
- 48 language support

**Pros:**
- Impressive language coverage (48 languages)
- Local-first architecture (privacy)
- Real-time file system monitoring (stays current)
- Plugin-based extensibility
- Fast queries

**Cons:**
- Requires Voyage AI API key for semantic search (not fully local without modification)
- Relatively new (v1.0.0 MVP)
- Less battle-tested than Zilliz or Augment options

**Verdict:** Good middle-ground option. The 48-language support and real-time monitoring are standout features. Would need Voyage AI API key for full semantic capabilities.

---

### 2.3 claude-context-local by FarhanAliRaza

**Repo:** https://github.com/FarhanAliRaza/claude-context-local

**What it is:** Fork/reimplementation of Zilliz claude-context that runs 100% locally with no API costs. Uses EmbeddingGemma + FAISS.

**Architecture:**
- EmbeddingGemma for local embedding generation
- FAISS for vector similarity search
- AST-based chunking for Python, tree-sitter for other languages
- 15 file extensions, 9+ languages

**Requirements:** Python 3.12+, 1-2 GB disk space, optional GPU (CUDA/MPS) acceleration

**Pros:**
- Completely free and local (zero API costs)
- Privacy-first (code never leaves machine)
- FAISS is fast and well-proven
- GPU acceleration support

**Cons:**
- Smaller language coverage (9+ vs 14+ or 48+)
- EmbeddingGemma quality may be lower than OpenAI/Voyage embeddings
- Less active development than the Zilliz original
- Python 3.12+ requirement

**Verdict:** Best option if "100% local, zero cost" is the primary requirement. Quality tradeoff vs cloud embeddings is real but may be acceptable.

---

### 2.4 MikeO-AI/claude-context-local (PostgreSQL + Ollama variant)

**Repo:** https://github.com/MikeO-AI/claude-context-local

**What it is:** Another local variant using PostgreSQL + Ollama instead of FAISS + EmbeddingGemma.

**Pros:**
- Uses Ollama (more embedding model choices)
- PostgreSQL for storage (mature, reliable)
- 100% local, no API keys

**Cons:**
- Requires PostgreSQL setup
- More infrastructure overhead

---

## Tier 3: Structural / AST-Only Indexers (No Embeddings)

These tools focus on structural code understanding without vector embeddings. They're token-efficient but lack natural language query capabilities.

### 3.1 AiDex by CSCSoftware

**Repo:** https://github.com/CSCSoftware/AiDex

**What it is:** Tree-sitter based structural code indexer. Claims 50x less context than grep.

**Architecture:**
- Tree-sitter parsing for identifier extraction
- SQLite (WAL mode) for persistent storage
- MCP stdio transport
- Index stored at `.aidex/index.db`

**Key metrics:**
- ~50 tokens per search result (vs 2000+ for grep)
- ~1 second per 1000 files for indexing
- 11 languages supported

**Example:**
```
Before: grep "PlayerHealth" -> 200 hits, 2000+ tokens, 5+ tool calls
After:  aidex_query({ term: "PlayerHealth" }) -> 3 precise locations, ~50 tokens, 1 call
```

**Pros:**
- Extreme token efficiency (50x improvement)
- Zero external dependencies (SQLite + tree-sitter)
- Fast indexing and queries
- Simple setup
- No API keys needed

**Cons:**
- No semantic/natural language search (identifier matching only)
- 11 languages (limited)
- No concept of "similar patterns" or "related code"
- Structural only, no understanding of code meaning

**Verdict:** Excellent for token-efficient identifier lookup. Pairs well with an embedding-based tool for the semantic layer.

---

### 3.2 mcp-codebase-index by MikeRecognex

**Repo:** https://github.com/MikeRecognex/mcp-codebase-index

**What it is:** Structural codebase indexer with 17 query tools. Uses Python's `ast` module and regex (no external dependencies).

**Architecture:**
- Python `ast` for Python files, regex for TypeScript/JS
- 17 MCP query tools: functions, classes, imports, dependency graphs, change impact
- Zero runtime dependencies

**Key metrics:**
- 58-99% token reduction per query (87% average)
- 97%+ cumulative savings in multi-turn conversations

**Pros:**
- Zero dependencies
- 87% average token reduction
- 17 specialized query tools (well-designed API surface)
- Change impact analysis
- Python 3.11+ only requirement

**Cons:**
- Limited language support (Python + TypeScript/JS via regex)
- AGPL-3.0 license (copyleft concerns for commercial use)
- No semantic search
- Regex-based TS/JS parsing is fragile

**Verdict:** Great token efficiency for Python projects. The AGPL license and limited language support are significant constraints.

---

### 3.3 mcp-server-tree-sitter by wrale

**Repo:** https://github.com/wrale/mcp-server-tree-sitter

**What it is:** General-purpose tree-sitter MCP server for structural code analysis.

**Architecture:**
- Tree-sitter AST parsing
- Parse tree caching
- Symbol extraction, dependency analysis
- State persistence between invocations

**Languages:** Python, JavaScript, TypeScript, Go, Rust, C, C++, Swift, Java, Kotlin, Julia, APL

**Pros:**
- Pure structural analysis (reliable, deterministic)
- Good language coverage
- Parse tree caching for performance
- Well-documented

**Cons:**
- No semantic search
- Lower-level API (raw AST access)
- Requires Python 3.10+

---

## Tier 4: Platform-Integrated Solutions

### 4.1 Sourcegraph MCP Server

**Official:** https://sourcegraph.com/docs/api/mcp
**Community:** https://github.com/najva-ai/sourcegraph-mcp

**What it is:** MCP server for Sourcegraph's code search platform. Exposes Sourcegraph's powerful query language via MCP.

**Architecture:**
- Connects to Sourcegraph instance (cloud or self-hosted)
- Advanced query syntax: regex, file filters, language filters, boolean operators
- Repository discovery and content fetching
- OAuth authentication support

**Pros:**
- Sourcegraph's search is best-in-class for large-scale code search
- Cross-repository search
- Self-hostable (Sourcegraph instance)
- OAuth MCP support (modern auth)

**Cons:**
- Requires running a Sourcegraph instance (heavy infrastructure)
- Enterprise pricing for self-hosted
- Overkill for single-project use
- Not embedding-based (structural + text search)

**Verdict:** Best for organizations already running Sourcegraph. Too heavy for individual developer use on a single project.

---

### 4.2 Greptile MCP Server

**Repo:** https://github.com/sosacrazy126/greptile-mcp
**npm:** `greptile-mcp-server`
**Docs:** https://www.greptile.com/docs/mcp/overview

**What it is:** MCP server wrapping Greptile's AI-powered code search API. Natural language querying of codebases.

**Tools:**
- `index_repository` -- index a repo for search
- `query_repository` -- natural language questions with code references
- `search_repository` -- file-level search results

**Setup:** `npx greptile-mcp-server` (requires `GREPTILE_API_KEY` + `GITHUB_TOKEN`)

**Pros:**
- Natural language queries
- Multi-repository support
- Zero installation (npx)
- Good answer quality with code references

**Cons:**
- Requires Greptile API key (cloud service)
- GitHub token required
- Code sent to Greptile's servers
- API costs
- No local/self-hosted option

**Verdict:** Good if you're already using Greptile. Not suitable if local/private operation is required.

---

### 4.3 DeepWiki MCP Server

**Official:** https://cognition.ai/blog/deepwiki-mcp-server
**Community (local):** https://github.com/regenrek/deepwiki-mcp
**Local alternative:** Local DeepWiki MCP by UrbanDiver

**What it is:** MCP access to DeepWiki's auto-generated codebase documentation. DeepWiki has indexed 30,000+ popular GitHub repos (4B+ lines of code).

**Tools:**
- `read_wiki_structure` -- table of contents
- `read_wiki_contents` -- full text of doc sections
- `ask_question` -- AI-generated answers with code references

**Endpoints:** `https://mcp.deepwiki.com/sse` and `https://mcp.deepwiki.com/mcp`

**Local alternative features:**
- Privacy-focused local documentation generation
- Tree-sitter AST-based chunking
- LanceDB vector database
- RAG-based Q&A

**Pros:**
- 30,000+ repos already indexed (great for understanding dependencies)
- AI-generated documentation quality
- Local alternative available for private repos
- SSE protocol support

**Cons:**
- Public repos only (for official server)
- Not designed for searching YOUR codebase conventions
- Local alternative requires more setup
- Documentation may be stale

**Verdict:** Excellent for understanding external dependencies (e.g., "how does Effect v4's Schema module work?"). Not for indexing your own codebase patterns.

---

## Tier 5: Non-MCP Tools Worth Watching

### 5.1 CocoIndex (Realtime Codebase Indexing)

**Repo:** https://github.com/cocoindex-io/realtime-codebase-indexing
**Docs:** https://cocoindex.io/examples/code_index

**What it is:** Incremental, real-time codebase indexing framework with tree-sitter support.

**Key differentiator:** Near-real-time incremental indexing -- only reprocesses changed files. This is critical for large codebases where full re-indexing is expensive.

**MCP support:** Community MCP server available (https://github.com/aanno/cocoindex-code-mcp-server)

**Relevance:** Good foundation for building a custom indexing pipeline. The incremental processing model is the right architecture for active development.

---

### 5.2 Bloop

**Repo:** https://github.com/BloopAI/bloop

**What it is:** Fast code search engine written in Rust. Combines semantic search, regex search, and precise code navigation.

**Architecture:**
- MiniLM embedding model (runs on-device)
- Tantivy (full-text search) + Qdrant (vector search)
- Tauri desktop app
- Fully open source

**Pros:**
- Completely local (on-device embedding)
- Rust performance
- Open source
- No API costs

**Cons:**
- Desktop app (not MCP server)
- No MCP integration
- Would need wrapper/bridge to use with Claude Code
- Development pace has slowed

---

### 5.3 Cursor's Approach (Reference Architecture)

**How Cursor indexes:** Cursor's indexing pipeline is the gold standard for understanding what "semantic codebase search" should look like:

1. **Merkle tree** of file hashes for incremental change detection
2. **AST-aware chunking** using recursive text splitters + syntax tree splitting
3. **Embedding generation** via AI model (OpenAI embedding model)
4. **Vector storage** in Turbopuffer (specialized vector DB)
5. **Caching** embeddings by chunk hash in AWS (team-level dedup)
6. **Privacy**: only embedding vectors stored server-side, no readable code
7. **Obfuscated file paths** for path-based filtering without revealing structure

**Key insight:** Cursor found that semantic search improves AI response accuracy by 12.5%. Not transformative alone, but compounds with other context sources.

**Relevance:** This architecture is what the best MCP servers are replicating. The key innovations are: Merkle tree for incremental updates, AST-aware chunking, and hybrid search.

---

### 5.4 Continue.dev's Approach

**Docs:** https://docs.continue.dev/guides/codebase-documentation-awareness

**What it is:** Continue.dev uses a combination of approaches for codebase awareness:
- Vector embeddings via configurable providers
- AST parsing via tree-sitter
- Ripgrep for text search
- MCP integration for custom RAG systems

**Key insight:** Continue deprecated their `@Codebase` context provider in favor of agent-mode tools that use file exploration, search tools, and MCP servers. This suggests the industry is moving toward MCP as the standard interface for codebase context.

---

## Comparative Analysis

### Token Efficiency Comparison

| Tool | Token Reduction | Method |
|------|----------------|--------|
| AiDex | 50x (vs grep) | Tree-sitter structural, ~50 tokens/result |
| mcp-codebase-index | 87% average | Python ast + regex structural |
| Zilliz Claude Context | ~40% | Hybrid BM25 + vector |
| Augment Context Engine | 30-80% improvement | Proprietary semantic engine |
| Serena | N/A (structural) | LSP symbol-level |
| CodeMCP/CKB | N/A (structural) | SCIP indexing |

### Feature Matrix

| Tool | Semantic Search | Local Only | No API Key | Languages | MCP | Hybrid Search | AST-Aware |
|------|----------------|------------|------------|-----------|-----|---------------|-----------|
| Augment CE | Yes | Partial | No | Many | Yes | Yes | Yes |
| Zilliz Claude Context | Yes | With Ollama+Milvus | With Ollama | 14 | Yes | Yes (BM25+vector) | Yes |
| claude-context-local | Yes | Yes | Yes | 9+ | Yes | No | Yes |
| Code-Index-MCP | Yes | Partial | No (Voyage) | 48 | Yes | Yes | Yes |
| AiDex | No | Yes | Yes | 11 | Yes | No | Yes |
| mcp-codebase-index | No | Yes | Yes | 3 | Yes | No | Yes (Python) |
| CodeMCP/CKB | No | Yes | Yes | 10 | Yes | No | SCIP |
| Serena | No | Yes | Yes | 30+ | Yes | No | LSP |
| Greptile | Yes | No | No | Many | Yes | Yes | Yes |
| Sourcegraph | Partial | Self-host | No | All | Yes | Yes | Yes |
| DeepWiki | Yes | Local alt | No | Many | Yes | Yes | Yes |

### Self-Hosted / Privacy Ranking

1. **Fully local, zero cost:** AiDex, mcp-codebase-index, Serena, claude-context-local
2. **Local with local models:** Zilliz Claude Context (Ollama+Milvus), Code-Index-MCP (with local embedding swap)
3. **Local compute, cloud embeddings:** Zilliz Claude Context (OpenAI/Voyage), Code-Index-MCP (Voyage)
4. **Partially local:** Augment Context Engine (local mode)
5. **Cloud only:** Greptile, DeepWiki (official)

---

## Integration Approaches with Claude Code

### Approach 1: MCP Server (Primary)

Configure in `.claude/settings.json` or `.claude/settings.local.json`:

```json
{
  "mcpServers": {
    "codebase-search": {
      "command": "npx",
      "args": ["@zilliz/claude-context-mcp@latest"],
      "env": {
        "EMBEDDING_PROVIDER": "ollama",
        "OLLAMA_MODEL": "nomic-embed-text"
      }
    }
  }
}
```

### Approach 2: Claude Code Hooks (Complementary)

Use hooks to inject codebase context automatically:

- **SessionStart hook:** Run indexer, inject project summary/conventions
- **UserPromptSubmit hook:** Append relevant pattern search results to every prompt
- **PreToolUse hook:** Before file creation, inject relevant existing patterns

Example hook pattern:
```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "type": "command",
      "command": "search-patterns --query \"$USER_PROMPT\" --top 5 --format compact"
    }]
  }
}
```

### Approach 3: CLAUDE.md + Convention Documentation

Static approach: maintain curated convention documents referenced from CLAUDE.md. This is what we currently do with `MEMORY.md`. Limitations: manual maintenance, doesn't scale, doesn't surface things the developer forgot to document.

### Approach 4: Hybrid (Recommended)

Combine multiple approaches:

1. **Serena** (already installed) for precise symbol navigation and structural editing
2. **Zilliz Claude Context** or **claude-context-local** for semantic search (natural language -> relevant code)
3. **AiDex** for token-efficient structural lookups
4. **Claude Code hooks** to auto-inject relevant context before each task
5. **CLAUDE.md** for critical conventions that must always be present

---

## Recommendations

### For This Project (beep-effect2, Effect v4 TypeScript monorepo)

**Immediate (low effort, high value):**

1. **Add Zilliz Claude Context with Ollama** -- Fully local semantic search. Supports TypeScript. Hybrid BM25+vector search. Explicit Claude Code support. Install: `npx @zilliz/claude-context-mcp@latest` with Ollama's `nomic-embed-text` model.

2. **Keep Serena** -- Already installed, provides LSP-backed symbol navigation that embedding search cannot replace.

**Short-term (medium effort):**

3. **Add AiDex** -- For ultra-token-efficient structural lookups. Complements semantic search by providing precise identifier resolution at ~50 tokens per result. Zero dependencies beyond tree-sitter + SQLite.

4. **Set up UserPromptSubmit hook** -- Auto-inject relevant search results before Claude processes each prompt. This is the key mechanism for "before you code, search for existing patterns."

**Evaluate:**

5. **Augment Context Engine MCP** -- Try the free tier (1,000 requests/month). If quality is notably better than Zilliz Claude Context, it may be worth the cost for complex tasks.

6. **CodeMCP/CKB** -- If SCIP indexing works well for Effect v4 TypeScript, the impact analysis and call graph features would be extremely valuable for refactoring tasks.

### Architecture Decision: Two-Layer Search

The optimal architecture is a two-layer search system:

**Layer 1: Structural (fast, cheap, precise)**
- Serena (LSP) for symbol navigation
- AiDex (tree-sitter) for identifier lookup
- Token cost: ~50-200 tokens per query

**Layer 2: Semantic (slower, richer, natural language)**
- Zilliz Claude Context or claude-context-local for "find code that does X"
- Hybrid search for when you don't know the exact symbol name
- Token cost: ~500-2000 tokens per query

**Orchestration: Claude Code hooks**
- SessionStart: build/update indexes
- UserPromptSubmit: run Layer 1 search on prompt keywords, inject top results
- PreToolUse (Write/Edit): run Layer 2 semantic search for "existing implementations of this pattern"

### What's Missing From the Ecosystem

1. **Convention/pattern indexing**: No tool specifically indexes architectural patterns, coding conventions, or "how we do X in this codebase." This is still a manual CLAUDE.md task.

2. **Schema-aware search**: No tool understands Effect schemas, branded types, or domain model relationships as first-class concepts. A custom indexer for Effect v4 patterns would be uniquely valuable.

3. **Cross-session learning**: Tools index code but don't learn from successful/failed coding sessions. A tool that notices "every time you create a new service, you need X, Y, Z" would be transformative.

4. **Monorepo-aware search**: Most tools treat the codebase as flat. Few understand package boundaries, workspace dependencies, or "this pattern exists in package A and should be consistent in package B."

---

## Sources

- [Zilliz Claude Context](https://github.com/zilliztech/claude-context)
- [Augment Context Engine MCP](https://docs.augmentcode.com/context-services/mcp/overview)
- [Code-Index-MCP by ViperJuice](https://github.com/ViperJuice/Code-Index-MCP)
- [AiDex by CSCSoftware](https://github.com/CSCSoftware/AiDex)
- [mcp-codebase-index by MikeRecognex](https://github.com/MikeRecognex/mcp-codebase-index)
- [CodeMCP/CKB by SimplyLiz](https://github.com/SimplyLiz/CodeMCP)
- [Serena by Oraios](https://github.com/oraios/serena)
- [claude-context-local by FarhanAliRaza](https://github.com/FarhanAliRaza/claude-context-local)
- [mcp-server-tree-sitter by wrale](https://github.com/wrale/mcp-server-tree-sitter)
- [Greptile MCP](https://github.com/sosacrazy126/greptile-mcp)
- [Sourcegraph MCP](https://github.com/najva-ai/sourcegraph-mcp)
- [DeepWiki MCP](https://cognition.ai/blog/deepwiki-mcp-server)
- [CocoIndex](https://github.com/cocoindex-io/realtime-codebase-indexing)
- [Bloop](https://github.com/BloopAI/bloop)
- [How Cursor Indexes Codebases](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast)
- [Continue.dev Codebase Awareness](https://docs.continue.dev/guides/codebase-documentation-awareness)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
- [OpenAI Codex Semantic Indexing Issue](https://github.com/openai/codex/issues/5181)
- [Kilo Code Codebase Indexing](https://kilo.ai/docs/features/codebase-indexing)
