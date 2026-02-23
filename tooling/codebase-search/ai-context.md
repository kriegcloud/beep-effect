---
path: tooling/codebase-search
summary: Semantic codebase search with vector embeddings, BM25 keyword search, and MCP server integration for Effect v4 monorepos
tags: [effect, mcp, search, embeddings, tooling]
---

# @beep/codebase-search

Semantic codebase search with vector embeddings, BM25 keyword search, and MCP server integration for Effect v4 monorepos.

## Architecture

The package follows a pipeline architecture: **extract** symbols from TypeScript AST, **index** them into vector (LanceDB) and keyword (BM25) stores, then **search** using hybrid Reciprocal Rank Fusion. Results are exposed via MCP tools and Claude Code hooks.

```
TypeScript files
  -> FileScanner (AST parsing)
  -> JsDocExtractor + EffectPatternDetector
  -> SymbolAssembler (IndexedSymbol)
  -> Pipeline (orchestration)
    -> EmbeddingService (vector embeddings)
    -> LanceDbWriter (vector storage)
    -> Bm25Writer (keyword index)
  -> HybridSearch / KeywordSearch / RelationResolver
  -> McpServer (MCP tools) + Hooks (Claude Code integration)
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `IndexedSymbol.ts` | Core data schema for extracted symbols with metadata, JSDoc, and Effect patterns |
| `extractor/*` | TypeScript AST parsing, JSDoc extraction, Effect pattern detection, symbol assembly |
| `indexer/*` | Embedding generation (HuggingFace), LanceDB vector storage, BM25 keyword indexing, pipeline orchestration |
| `search/*` | Hybrid search (vector + keyword fusion), keyword-only search, relation resolution |
| `mcp/*` | MCP server with `search_codebase`, `find_related`, `browse_symbols`, `reindex` tools |
| `hooks/*` | Claude Code `SessionStart` and `UserPromptSubmit` hook integrations |

## Usage Patterns

```typescript
// MCP server entry point (bin.ts)
import { BunRuntime } from "@effect/platform-bun/BunRuntime"
import * as Layer from "effect/Layer"
import { McpLayer } from "./mcp/McpServer.js"
BunRuntime.runMain(Layer.launch(McpLayer))

// Hook entry point (session-start-entry.ts)
import { UserSessionStart } from "./hooks/SessionStart.js"
// Reads stdin JSON payload, runs hook logic, outputs context injection
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Hybrid search (vector + BM25) | Vector catches semantic similarity; BM25 catches exact keyword matches. RRF fusion combines both. |
| LanceDB for vector storage | Embedded database, no external service needed. Supports ANN search with IVF-PQ. |
| wink-bm25 for keyword search | Lightweight, in-process BM25 implementation. Serializable index for persistence. |
| HuggingFace transformers.js | Local embeddings without API calls. Uses `all-MiniLM-L6-v2` model. |
| MCP over HTTP/stdio | Standardized protocol for AI tool integration. Stdio transport for Claude Code. |
| Effect services throughout | Testable via Layer.mock, composable, type-safe dependency injection. |

## Dependencies

**Internal**: `@beep/repo-utils`
**External**: `effect`, `@effect/platform-bun`, `@effect/platform-node`, `@lancedb/lancedb`, `@huggingface/transformers`, `wink-bm25-text-search`, `ts-morph`, `doctrine`

## Related

- **AGENTS.md** - Detailed contributor guidance
- **specs/completed/repo-tooling/** - Repo-tooling specification
