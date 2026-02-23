# Custom Semantic Codebase Search for Claude Code via MCP

## Research Date: 2026-02-19

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Embedding-Based Code Search (Local)](#1-embedding-based-code-search-local)
3. [AST-Based Indexing](#2-ast-based-indexing)
4. [Hybrid Approaches](#3-hybrid-approaches)
5. [MCP Server Architecture](#4-mcp-server-architecture)
6. [Hook Integration with Claude Code](#5-hook-integration-with-claude-code)
7. [Recommended Architecture](#6-recommended-architecture)
8. [Implementation Roadmap](#7-implementation-roadmap)
9. [Sources](#sources)

---

## Executive Summary

This document presents research findings for building a custom semantic codebase search system integrated with Claude Code via MCP. The system targets a TypeScript/Effect monorepo and aims to automatically discover existing schemas, services, layers, error types, and utility functions when given a coding task.

The recommended approach is a **hybrid AST + embedding system** served through a custom MCP server, with optional Claude Code hook integration for transparent context injection. The key components are:

- **tree-sitter** for AST-based code chunking (structure-aware, fast, incremental)
- **Nomic CodeRankEmbed (137M)** or **Ollama nomic-embed-code** for local embeddings
- **LanceDB** for embedded vector storage (serverless, TypeScript-native, no external process)
- **BM25 + vector hybrid search** with Reciprocal Rank Fusion (RRF)
- **MCP server** exposing search tools to Claude Code
- **UserPromptSubmit hook** for optional transparent auto-injection

---

## 1. Embedding-Based Code Search (Local)

### 1.1 Code Embedding Models

#### Tier 1: Best for Local TypeScript Code Search

| Model | Params | Dims | Context | License | Local? | Notes |
|-------|--------|------|---------|---------|--------|-------|
| **Nomic CodeRankEmbed** | 137M | 768 | 8,192 | Apache-2.0 | Yes (ONNX/transformers.js) | SOTA for size on CodeSearchNet. ~521MB. Best pick for local-only. |
| **Nomic Embed Code** | 7B | 768+ | 8,192 | Apache-2.0 | Yes (Ollama/GGUF) | SOTA overall on CodeSearchNet. Beats Voyage Code 3. Needs GPU or beefy CPU. |
| **Voyage Code 3** | Proprietary | 1024 (default), 256/512/2048 | 16,000 | API only | No (API, or SageMaker on-prem) | Best proprietary. Supports Matryoshka dims and int8/binary quantization. |

- **GitHub (CodeRankEmbed):** https://huggingface.co/nomic-ai/CodeRankEmbed
- **GitHub (Nomic Embed Code):** https://huggingface.co/nomic-ai/nomic-embed-code
- **Voyage Code 3 docs:** https://docs.voyageai.com/docs/embeddings

#### Tier 2: Viable Alternatives

| Model | Params | Dims | Notes |
|-------|--------|------|-------|
| all-MiniLM-L6-v2 | 22M | 384 | Ultra-light, decent general text, weak on code |
| StarEncoder | 125M | 768 | BigCode project, trained on code but older |
| OpenAI text-embedding-3-small | N/A | 1536 | API-only, good general but not code-specialized |
| Jina Code v2 | 137M | 768 | Good code performance, open weights |

#### Recommendation for This Project

**Primary: Nomic CodeRankEmbed (137M)** via transformers.js / ONNX Runtime in Node.js.

- 768 dimensions, 8192 token context -- more than enough for any TypeScript function/module
- Runs fully local in Node.js via `@huggingface/transformers` (ONNX backend)
- ~521MB model file, cached after first download
- No GPU required (CPU inference is fine for 137M at indexing time)
- Apache-2.0 licensed, truly open source with training data available

**Fallback: Ollama + nomic-embed-code** if GPU is available and higher quality is desired.

- Ollama API at `http://localhost:11434/api/embed`
- ~15-50ms per embedding locally
- 12,450 tokens/sec throughput on RTX 4090

### 1.2 Local Vector Databases

#### Comparison for This Use Case

| Database | Architecture | Language | Install | Perf (query) | Recall | Memory | Best For |
|----------|-------------|----------|---------|--------------|--------|--------|----------|
| **LanceDB** | Embedded, serverless | Rust (Node.js bindings) | `npm i @lancedb/lancedb` | 40-60ms | ~88% | Low | Local-first, no server process |
| ChromaDB | Client-server or embedded | Python (Rust core in 2025) | pip or Docker | 30-50ms | ~90% | Medium | Python-first workflows |
| Qdrant | Client-server | Rust | Docker or binary | 20-30ms | ~95% | Higher | Production scale, filtering |
| sqlite-vec | Embedded extension | C | npm (better-sqlite3) | Variable | Variable | Minimal | Ultra-minimal, SQLite ecosys |
| Milvus Lite | Embedded | C++/Python | pip | ~50ms | ~92% | Medium | Prototyping for Milvus |

- **LanceDB GitHub:** https://github.com/lancedb/lancedb
- **ChromaDB GitHub:** https://github.com/chroma-core/chroma
- **Qdrant GitHub:** https://github.com/qdrant/qdrant
- **sqlite-vec GitHub:** https://github.com/asg017/sqlite-vec

#### Recommendation: LanceDB

LanceDB is the clear winner for this use case because:

1. **Embedded / serverless** -- runs inside the Node.js process, no Docker or separate service
2. **Native TypeScript SDK** -- `@lancedb/lancedb` with proper type support
3. **On-disk storage** -- data persists in a local directory, no memory pressure
4. **IVF_PQ indexing** -- good for the scale of a monorepo (thousands, not millions of vectors)
5. **Used by Continue.dev** -- the AI coding tool uses LanceDB for the exact same purpose
6. **SQL-like filtering** -- can filter by metadata (file path, symbol type, package name)

```typescript
import * as lancedb from "@lancedb/lancedb";

// Connect to local embedded database
const db = await lancedb.connect("data/code-index");

// Create a table with code chunks
const table = await db.createTable("code_chunks", [
  {
    id: "schemas/PackageJson/Name",
    vector: Float32Array.from(embedding),
    code: "export const Name = S.String.pipe(...)",
    file_path: "tooling/repo-utils/src/schemas/PackageJson.ts",
    symbol_type: "schema",
    package: "repo-utils",
    module: "schemas/PackageJson",
    summary: "Schema for npm package name with brand validation",
  },
]);

// Semantic search
const results = await table
  .vectorSearch(queryEmbedding)
  .where("symbol_type = 'schema'")
  .limit(10)
  .toArray();
```

### 1.3 TypeScript Code Chunking Strategies

Code chunking is critical. Naive text splitting destroys semantic meaning. For TypeScript/Effect code, the following strategies apply:

#### Strategy 1: AST-Based Structural Chunking (Recommended)

Split at natural TypeScript boundaries:

```
Level 1: Module/File level (for small files)
Level 2: Exported declarations (classes, functions, constants, type aliases)
Level 3: Class members (methods, properties)
Level 4: Nested functions / closures (rare, usually fold into parent)
```

For Effect specifically, target these semantic units:
- **Schema definitions** (`S.Struct({...})`, `S.TaggedErrorClass(...)`)
- **Service definitions** (`class MyService extends Context.Tag(...)`)
- **Layer definitions** (`Layer.effect(...)`, `Layer.succeed(...)`)
- **Effect functions** (`Effect.fn(function* (...) {...})`)
- **Exported utilities** (any `export const/function/class`)

#### Strategy 2: Sliding Window with Overlap

For files where AST chunking produces chunks too large (>2000 tokens):
- Window size: 1500 tokens
- Overlap: 200 tokens (13%)
- Split only at line boundaries

#### Strategy 3: Summary-Enriched Chunks

For each AST chunk, prepend a synthetic header:

```typescript
// Chunk metadata prepended before embedding:
// File: tooling/repo-utils/src/schemas/PackageJson.ts
// Symbol: PackageJson (Schema.Struct)
// Exports: PackageJson, PackageJsonEncoded, PackageJsonContext
// Dependencies: Schema, Brand, Option
// Description: Schema for parsing and validating package.json files
//
// [actual code follows]
export class PackageJson extends S.Class<PackageJson>("PackageJson")({
  name: Name,
  version: Version,
  // ...
}) {}
```

This hybrid of metadata + code gives embeddings both structural and semantic signal.

### 1.4 Incremental Indexing Strategy

#### Hash-Based Change Detection (Cursor-Style Merkle Tree)

The approach used by Cursor (and claude-context) is a Merkle tree:

```
                    [Root Hash]
                   /           \
          [src/ hash]       [tooling/ hash]
          /        \              |
   [schemas/]  [utils/]    [repo-utils/]
      |           |              |
  [file hashes] [file hashes] [file hashes]
```

**Algorithm:**
1. On first index: hash every file, build Merkle tree, embed all chunks, store in LanceDB
2. On subsequent runs: rebuild Merkle tree from current files, compare root hash
3. If root differs: walk tree to find changed subtrees, only re-embed changed files
4. Cache embeddings keyed by `(file_path, chunk_hash)` -- if chunk content unchanged, reuse embedding

**Implementation:**

```typescript
import { createHash } from "node:crypto";

const fileHash = (content: string): string =>
  createHash("sha256").update(content).digest("hex");

// Store alongside each chunk in LanceDB:
// { chunk_hash: string, file_path: string, vector: Float32Array, ... }
// On re-index: skip chunks where chunk_hash matches existing entry
```

**Trigger strategies (pick one or combine):**
1. **On-demand:** Run `index` command before each Claude Code session
2. **File watcher:** Use chokidar to watch for file changes, queue re-indexing
3. **Git hook:** Post-commit hook triggers re-index of changed files
4. **MCP tool trigger:** Expose an `reindex` tool in the MCP server

---

## 2. AST-Based Indexing

### 2.1 TypeScript Compiler API

The TypeScript Compiler API (`typescript` npm package) provides full semantic analysis:

- **GitHub Wiki:** https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API

**Capabilities:**
- Create a `Program` from `tsconfig.json`, get all source files
- Walk the AST with full type information via `TypeChecker`
- Extract: exported symbols, their types, JSDoc comments, dependencies
- Resolve type aliases, generics, branded types

**Relevant tools built on the TS Compiler API:**
- **API Extractor** (https://api-extractor.com/) -- Microsoft's tool for extracting API surfaces
- **structured-types** (https://github.com/ccontrols/structured-types) -- Extracts full type info with plugin architecture
- **ts-code-info** (https://github.com/Morglod/ts-code-info) -- Lightweight type extraction

**Pros:** Full type resolution, understands generics, branded types, Effect-specific patterns
**Cons:** Slow (must compile entire project), memory-heavy, brittle across TS versions

### 2.2 Tree-sitter for TypeScript

Tree-sitter is an incremental parsing library that generates concrete syntax trees:

- **Core:** https://github.com/tree-sitter/tree-sitter
- **TypeScript grammar:** https://github.com/tree-sitter/tree-sitter-typescript
- **NPM packages:** `tree-sitter` + `tree-sitter-typescript`

**Key capabilities:**
- Parse TypeScript/TSX into AST in <10ms per file
- Incremental: re-parse only changed portions on edit
- Extract functions, classes, methods, interfaces, type aliases, exports
- Query with S-expression patterns

```typescript
import Parser from "tree-sitter";
import TypeScript from "tree-sitter-typescript/typescript";

const parser = new Parser();
parser.setLanguage(TypeScript);

const tree = parser.parse(sourceCode);
const root = tree.rootNode;

// Find all exported declarations
const exports = root.descendantsOfType([
  "export_statement",
  "export_default_declaration",
]);

// Find all class declarations
const classes = root.descendantsOfType("class_declaration");

// Find all function declarations
const functions = root.descendantsOfType("function_declaration");

// Find all arrow functions assigned to const (Effect.fn pattern)
const constDecls = root.descendantsOfType("lexical_declaration");
```

**Pros:** Blazing fast, incremental, no compilation needed, works on partial/broken code
**Cons:** No type resolution (doesn't know what `S.Struct` resolves to), surface-level syntax only

### 2.3 Extracting Effect-Specific Semantic Signatures

For an Effect monorepo, we need specialized extractors that understand Effect's patterns:

```typescript
// Pattern: Schema definition
// AST signature: export class X extends S.Class<X>("Tag")({...}) {}
// or: export const X = S.Struct({...})

// Pattern: Service definition
// AST signature: export class X extends Context.Tag("Tag")<X, {...}>() {}

// Pattern: Layer definition
// AST signature: export const XLive = Layer.effect(X, Effect.gen(function* () {...}))

// Pattern: TaggedError
// AST signature: export class X extends S.TaggedErrorClass<X>("id")("Tag", {...}, {...}) {}

// Pattern: Effect function
// AST signature: export const x = Effect.fn(function* (...) {...})
```

A custom tree-sitter query can identify these patterns:

```scheme
;; Find Schema.Struct definitions
(lexical_declaration
  (variable_declarator
    name: (identifier) @schema_name
    value: (call_expression
      function: (member_expression
        object: (identifier) @_obj
        property: (property_identifier) @_prop)
      (#eq? @_obj "S")
      (#match? @_prop "^(Struct|Class|Union|TaggedError)$"))))
```

### 2.4 Building a Structured Index

Beyond embeddings, maintain a structured metadata index:

```typescript
interface CodeSymbol {
  // Identity
  id: string;                    // "repo-utils/schemas/PackageJson/Name"
  name: string;                  // "Name"
  qualifiedName: string;         // "PackageJson.Name"

  // Location
  filePath: string;              // "tooling/repo-utils/src/schemas/PackageJson.ts"
  package: string;               // "repo-utils"
  module: string;                // "schemas/PackageJson"
  startLine: number;
  endLine: number;

  // Classification
  kind: SymbolKind;              // "schema" | "service" | "layer" | "error" | "effect-fn" | "util" | "type" | "const"
  effectCategory?: EffectCategory; // "Schema" | "Context.Tag" | "Layer" | "TaggedErrorClass" | "Effect.fn"

  // Semantic info
  exportedType: string;          // "Schema<PackageJson, PackageJsonEncoded, PackageJsonContext>"
  dependencies: string[];        // ["Schema", "Brand", "Option"]
  description?: string;          // from JSDoc or @since annotation
  signature?: string;            // type signature string

  // Search data
  embedding: Float32Array;       // vector embedding
  summary: string;               // LLM-generated or template summary
  codeSnippet: string;           // truncated source code
  chunkHash: string;             // for incremental re-indexing
}

type SymbolKind =
  | "schema" | "service" | "layer" | "error"
  | "effect-fn" | "util" | "type" | "const"
  | "class" | "interface" | "enum";

type EffectCategory =
  | "Schema.Struct" | "Schema.Class" | "Schema.Union" | "Schema.TaggedErrorClass"
  | "Context.Tag" | "Layer.effect" | "Layer.succeed" | "Layer.provide"
  | "Effect.fn" | "Effect.gen" | "Command" | "Flag" | "Argument";
```

### 2.5 LSP for Semantic Indexing

The TypeScript Language Server Protocol can be leveraged, but with caveats:

- **LSIF (Language Server Index Format):** https://microsoft.github.io/language-server-protocol/specifications/lsif/0.6.0/specification/
- Pre-computes "go to definition", "find references", "hover" data as a serializable index
- Sourcegraph uses LSIF for code intelligence at scale

**For our use case:** The LSP/LSIF approach is overkill for search but could supplement the index:
- Use `textDocument/documentSymbol` to get all symbols in a file
- Use `textDocument/hover` to get type signatures
- Use `textDocument/references` to map dependency graphs

**Practical approach:** Use Serena (the LSP-based MCP server already in the project) for on-demand type lookups, and tree-sitter + embeddings for the search layer.

---

## 3. Hybrid Approaches

### 3.1 AST Structure + Embeddings

The best results come from combining structural understanding with semantic search:

```
                    +-----------------+
                    |  Source Files   |
                    +-----------------+
                           |
              +------------+------------+
              |                         |
      +-------v--------+       +-------v--------+
      |  tree-sitter   |       |  File Hasher   |
      |  AST Parser    |       |  (Merkle Tree) |
      +-------+--------+       +-------+--------+
              |                         |
              v                         v
      +----------------+       +------------------+
      | Structural     |       | Change Detection |
      | Chunks with    |       | (skip unchanged) |
      | Metadata       |       +------------------+
      +-------+--------+
              |
     +--------+---------+
     |                   |
     v                   v
+----+-------+    +------+------+
| Embed Code |    | Store       |
| (CodeRank  |    | Metadata    |
|  Embed)    |    | (structured |
+----+-------+    |  index)     |
     |            +------+------+
     v                   |
+----+-------+           |
| LanceDB    |<----------+
| (vectors + |
|  metadata) |
+------------+
```

### 3.2 LLM-Generated Summary Embeddings

The "code summary -> embed summary -> search summaries" pattern:

1. **Generate:** For each code chunk, use an LLM to produce a natural-language summary
2. **Embed:** Embed the summary (not the raw code) using the embedding model
3. **Search:** When a user query comes in, embed the query and search against summary embeddings

**Why this helps:**
- User queries are natural language ("find the schema for package.json validation")
- Code is not natural language ("export class PackageJson extends S.Class...")
- Summaries bridge the gap: "Schema for validating and parsing npm package.json files, including name, version, dependencies, and scripts fields"

**Implementation:** Generate summaries during indexing using a local LLM (Ollama) or by template:

```typescript
// Template-based summary generation (fast, no LLM needed)
function generateSummary(symbol: CodeSymbol): string {
  switch (symbol.effectCategory) {
    case "Schema.Struct":
      return `Schema definition for ${symbol.name} in ${symbol.module}. ` +
             `Fields: ${extractFieldNames(symbol.codeSnippet).join(", ")}. ` +
             `Package: ${symbol.package}.`;
    case "Context.Tag":
      return `Effect service ${symbol.name} providing ${extractServiceMethods(symbol.codeSnippet).join(", ")}. ` +
             `Defined in ${symbol.module}, package ${symbol.package}.`;
    case "Layer.effect":
      return `Layer providing ${symbol.name} service implementation. ` +
             `Dependencies: ${symbol.dependencies.join(", ")}. ` +
             `Package: ${symbol.package}.`;
    // ... more patterns
  }
}
```

### 3.3 RAPTOR-Style Hierarchical Indexing for Code

RAPTOR (Recursive Abstractive Processing for Tree-Organized Retrieval) builds a multi-level summary tree:

- **Paper:** https://arxiv.org/abs/2401.18059
- **GitHub:** https://github.com/parthsarthi03/raptor

Applied to code, this creates a hierarchy:

```
Level 3 (Abstract):  "repo-utils package: CLI tooling for monorepo management
                      including package validation, dependency checking, and
                      code generation"

Level 2 (Module):    "schemas module: Effect Schema definitions for package.json,
                      tsconfig.json, and workspace configuration validation"

Level 1 (Symbol):    "PackageJson schema: validates npm package.json structure
                      with fields for name, version, dependencies, scripts..."

Level 0 (Code):      [actual code chunks with embeddings]
```

**How to build it:**
1. Embed all Level 0 code chunks
2. Cluster chunks by module/directory using UMAP + GMM (or simply by file/directory structure)
3. Generate a summary for each cluster (Level 1) using LLM or templates
4. Cluster Level 1 summaries by package (Level 2)
5. Generate package-level summary (Level 3)

**Search strategy:** Search all levels simultaneously. High-level queries match abstract summaries; specific queries match code-level chunks.

### 3.4 Dual-Index Architecture

Store both code embeddings and summary embeddings:

```typescript
// LanceDB tables:
// 1. code_chunks: raw code with vector embeddings
// 2. summaries: natural language summaries with vector embeddings
// 3. symbols: structured metadata (no vectors, just queryable fields)

// Search strategy:
async function hybridSearch(query: string, options?: SearchOptions) {
  const queryEmbedding = await embed(query);

  // 1. Vector search on summaries (natural language match)
  const summaryResults = await summariesTable
    .vectorSearch(queryEmbedding)
    .limit(20)
    .toArray();

  // 2. Vector search on code chunks (code pattern match)
  const codeResults = await codeChunksTable
    .vectorSearch(queryEmbedding)
    .where(options?.filter ?? "")
    .limit(20)
    .toArray();

  // 3. BM25 keyword search on code + summaries
  const keywordResults = bm25Search(query, allDocuments);

  // 4. Reciprocal Rank Fusion
  return reciprocalRankFusion([summaryResults, codeResults, keywordResults]);
}
```

---

## 4. MCP Server Architecture

### 4.1 Overview

The MCP server acts as a semantic search bridge between Claude Code and the indexed codebase:

```
+-------------------+     stdio/JSON-RPC     +----------------------+
|                   |  <------------------->  |                      |
|   Claude Code     |                         |  Semantic Search     |
|   (MCP Client)    |                         |  MCP Server          |
|                   |                         |                      |
+-------------------+                         |  +----------------+  |
                                              |  | Tool: search   |  |
                                              |  | Tool: discover |  |
                                              |  | Tool: reindex  |  |
                                              |  +-------+--------+  |
                                              |          |           |
                                              |  +-------v--------+  |
                                              |  | Search Engine  |  |
                                              |  | (BM25 + Vector |  |
                                              |  |  + RRF fusion) |  |
                                              |  +-------+--------+  |
                                              |          |           |
                                              |  +-------v--------+  |
                                              |  | LanceDB        |  |
                                              |  | (vectors +     |  |
                                              |  |  metadata)     |  |
                                              |  +----------------+  |
                                              +----------------------+
```

### 4.2 MCP Tool Definitions

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "codebase-search",
  version: "0.1.0",
});

// Tool 1: Semantic search across the codebase
server.tool(
  "search_codebase",
  "Search the codebase semantically. Returns relevant code symbols, " +
  "schemas, services, layers, and utilities matching the query. " +
  "Use this before writing new code to discover existing patterns.",
  {
    query: z.string().describe("Natural language description of what you're looking for"),
    kind: z.enum([
      "any", "schema", "service", "layer", "error",
      "effect-fn", "util", "type", "const"
    ]).optional().describe("Filter by symbol kind"),
    package: z.string().optional().describe("Filter by package name"),
    limit: z.number().optional().default(10).describe("Max results to return"),
  },
  async ({ query, kind, package: pkg, limit }) => {
    const results = await searchEngine.search(query, { kind, package: pkg, limit });
    return {
      content: [{
        type: "text",
        text: formatSearchResults(results),
      }],
    };
  }
);

// Tool 2: Discover related symbols
server.tool(
  "find_related",
  "Find symbols related to a given symbol (imports it, " +
  "same module, similar type signature). " +
  "Use after finding a symbol to understand its ecosystem.",
  {
    symbolId: z.string().describe("Symbol ID from search results"),
    relation: z.enum(["imports", "imported-by", "same-module", "similar"]).optional(),
  },
  async ({ symbolId, relation }) => {
    const results = await searchEngine.findRelated(symbolId, relation);
    return {
      content: [{
        type: "text",
        text: formatRelatedResults(results),
      }],
    };
  }
);

// Tool 3: Browse symbol index
server.tool(
  "browse_symbols",
  "Browse the structured symbol index by package and module. " +
  "Returns a tree view of available schemas, services, layers, etc.",
  {
    package: z.string().optional().describe("Package to browse (e.g. 'repo-utils')"),
    module: z.string().optional().describe("Module within package"),
  },
  async ({ package: pkg, module }) => {
    const tree = await searchEngine.browseSymbols(pkg, module);
    return {
      content: [{
        type: "text",
        text: formatSymbolTree(tree),
      }],
    };
  }
);

// Tool 4: Reindex
server.tool(
  "reindex_codebase",
  "Trigger incremental re-indexing of the codebase. " +
  "Only re-embeds changed files. Run after making significant changes.",
  {
    full: z.boolean().optional().default(false).describe("Force full re-index"),
  },
  async ({ full }) => {
    const stats = await indexer.reindex({ full });
    return {
      content: [{
        type: "text",
        text: `Reindexed: ${stats.changed} changed, ${stats.added} added, ${stats.removed} removed, ${stats.unchanged} unchanged.`,
      }],
    };
  }
);

// Connect via stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 4.3 Compact Result Formatting

Token budget management is critical. Results should be synthesized, not raw code dumps:

```typescript
function formatSearchResults(results: SearchResult[]): string {
  return results.map((r, i) => [
    `### ${i + 1}. ${r.symbol.name} (${r.symbol.kind})`,
    `**Module:** ${r.symbol.package}/${r.symbol.module}`,
    `**File:** ${r.symbol.filePath}:${r.symbol.startLine}`,
    r.symbol.description ? `**Description:** ${r.symbol.description}` : "",
    `**Signature:** \`${r.symbol.signature}\``,
    r.symbol.dependencies.length > 0
      ? `**Deps:** ${r.symbol.dependencies.join(", ")}`
      : "",
    "```typescript",
    truncateCode(r.symbol.codeSnippet, 300), // max 300 chars per result
    "```",
    `**Relevance:** ${(r.score * 100).toFixed(0)}%`,
  ].filter(Boolean).join("\n")).join("\n\n---\n\n");
}
```

**Target:** Each result should be ~150-300 tokens. For 10 results, that is ~1500-3000 tokens total -- well within context budget.

### 4.4 MCP Configuration in Claude Code

Add to `.mcp.json` at project root:

```json
{
  "mcpServers": {
    "codebase-search": {
      "type": "stdio",
      "command": "node",
      "args": ["./tools/mcp-codebase-search/dist/index.ts"],
      "env": {
        "CODEBASE_ROOT": ".",
        "INDEX_PATH": ".code-index",
        "EMBEDDING_MODEL": "nomic-ai/CodeRankEmbed"
      }
    }
  }
}
```

---

## 5. Hook Integration with Claude Code

### 5.1 Claude Code Hooks Overview

Claude Code hooks are shell commands that run at specific lifecycle events:

- **Docs:** https://code.claude.com/docs/en/hooks
- **Reference:** https://docs.claude.com/en/docs/claude-code/hooks

**Relevant hook events:**

| Event | When | Can Inject Context? | Use Case |
|-------|------|--------------------| ---------|
| `SessionStart` | Beginning of session | Yes (stdout) | Pre-load project overview |
| `UserPromptSubmit` | Before Claude processes prompt | Yes (stdout/additionalContext) | Auto-search for relevant code |
| `PreToolUse` | Before a tool runs | Yes (allow/deny/ask) | Validate tool usage |
| `PostToolUse` | After tool completes | Yes (additionalContext) | Enrich with related context |
| `Stop` | When Claude finishes response | No | Post-processing |

### 5.2 UserPromptSubmit Hook for Transparent Auto-Injection

This is the most powerful integration point. A UserPromptSubmit hook can:
1. Receive the user's prompt
2. Run a semantic search against the codebase index
3. Inject relevant context (schemas, services, patterns) before Claude starts working

**Configuration in `.claude/settings.json`:**

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "command": "node ./tools/mcp-codebase-search/hooks/auto-context.js",
        "timeout": 5000
      }
    ],
    "SessionStart": [
      {
        "command": "node ./tools/mcp-codebase-search/hooks/session-start.js",
        "timeout": 10000
      }
    ]
  }
}
```

**Hook script (`auto-context.js`):**

```typescript
#!/usr/bin/env node
// This script receives the user prompt on stdin,
// searches the codebase index, and outputs relevant context to stdout.
// stdout content is automatically injected into Claude's context.

import { searchIndex } from "../src/search.js";

const input = JSON.parse(await readStdin());
const userPrompt = input.prompt;

// Quick semantic search (must complete within timeout)
const results = await searchIndex(userPrompt, { limit: 5 });

if (results.length > 0) {
  const context = [
    "## Relevant Codebase Context (auto-discovered)",
    "",
    ...results.map(r => [
      `- **${r.name}** (${r.kind}) in \`${r.filePath}\``,
      `  ${r.summary}`,
      r.signature ? `  Signature: \`${r.signature}\`` : "",
    ].filter(Boolean).join("\n")),
    "",
    "Use the `search_codebase` MCP tool for more detailed results.",
  ].join("\n");

  // Output to stdout -- this gets injected into Claude's context
  console.log(context);
}
```

**SessionStart hook (`session-start.js`):**

```typescript
#!/usr/bin/env node
// Inject project-level context at session start

import { getProjectOverview } from "../src/index.ts";

const overview = await getProjectOverview();
console.log([
  "## Project Codebase Overview",
  "",
  `Packages: ${overview.packages.join(", ")}`,
  `Total symbols indexed: ${overview.totalSymbols}`,
  `Schemas: ${overview.schemas}, Services: ${overview.services}, Layers: ${overview.layers}`,
  "",
  "Use `search_codebase` to find existing patterns before writing new code.",
  "Use `browse_symbols` to explore available modules.",
].join("\n"));
```

### 5.3 Hook vs MCP Tool Approach: Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| **MCP Tool only** | Claude decides when to search; explicit; no overhead on simple prompts | Requires Claude to "know" to search; may skip discovery |
| **Hook auto-inject** | Transparent; always provides context; no forgotten searches | Adds latency to every prompt; may inject irrelevant context; uses tokens |
| **Hook + MCP (recommended)** | Best of both: auto-inject summary + explicit tool for deep search | More complex setup; two integration points |

### 5.4 CLAUDE.md Injection Approach

An alternative to hooks is to include search instructions in the project's `CLAUDE.md`:

```markdown
## Codebase Search

Before writing any new code, ALWAYS use the `search_codebase` MCP tool to check if:
1. A similar schema already exists
2. A utility function for this pattern exists
3. An error type for this failure mode exists
4. A service or layer already provides this capability

Common searches:
- "schema for [X]" -- find existing Schema definitions
- "service that [does X]" -- find existing Effect services
- "error for [X failure]" -- find existing TaggedError definitions
- "utility for [X operation]" -- find existing helper functions
```

This relies on Claude following instructions rather than automated injection, but is simpler to set up.

---

## 6. Recommended Architecture

### 6.1 Full System Architecture

```
+------------------------------------------------------------------+
|                        Claude Code                                |
|                                                                   |
|  +------------------+     +----------------------------------+    |
|  | UserPromptSubmit |     | MCP Client                       |    |
|  | Hook             |     | (connects to codebase-search)    |    |
|  +--------+---------+     +----------------+-----------------+    |
|           |                                |                      |
+-----------+--------------------------------+----------------------+
            |                                |
            v                                v
+------------------------------------------------------------------+
|                  MCP Codebase Search Server                       |
|                                                                   |
|  +-----------+  +-----------+  +----------+  +---------------+   |
|  | search_   |  | find_     |  | browse_  |  | reindex_      |   |
|  | codebase  |  | related   |  | symbols  |  | codebase      |   |
|  +-----------+  +-----------+  +----------+  +---------------+   |
|        |              |              |               |            |
|        v              v              v               v            |
|  +-----------------------------------------------------------+   |
|  |                   Search Engine                            |   |
|  |                                                            |   |
|  |   +-----------+  +----------+  +-------------------+      |   |
|  |   | BM25      |  | Vector   |  | Reciprocal Rank   |      |   |
|  |   | (keyword) |  | (cosine) |  | Fusion (RRF)      |      |   |
|  |   +-----------+  +----------+  +-------------------+      |   |
|  +-----------------------------------------------------------+   |
|        |                                                          |
|  +-----v-----------------------------------------------------+   |
|  |                      LanceDB                               |   |
|  |                                                            |   |
|  |  +----------------+  +---------------+  +---------------+  |   |
|  |  | code_chunks    |  | summaries     |  | symbols       |  |   |
|  |  | (vec + meta)   |  | (vec + text)  |  | (structured)  |  |   |
|  |  +----------------+  +---------------+  +---------------+  |   |
|  +------------------------------------------------------------+   |
|                                                                   |
+------------------------------------------------------------------+
            ^
            |  Indexing Pipeline (runs on-demand or incrementally)
            |
+------------------------------------------------------------------+
|                     Indexing Pipeline                              |
|                                                                   |
|  +----------------+     +------------------+     +-------------+  |
|  | File Scanner   | --> | tree-sitter      | --> | CodeRank    |  |
|  | (Merkle Tree   |     | AST Parser       |     | Embed       |  |
|  |  change detect)|     | (chunk + extract)|     | (embed)     |  |
|  +----------------+     +------------------+     +-------------+  |
|                                |                       |          |
|                                v                       v          |
|                         +-----------+           +-----------+     |
|                         | Summary   |           | LanceDB   |     |
|                         | Generator |           | Writer    |     |
|                         | (template)|           |           |     |
|                         +-----------+           +-----------+     |
+------------------------------------------------------------------+
```

### 6.2 Technology Stack

| Component | Technology | Package | Why |
|-----------|-----------|---------|-----|
| AST Parser | tree-sitter | `tree-sitter` + `tree-sitter-typescript` | Fast, incremental, no compilation |
| Embedding Model | Nomic CodeRankEmbed 137M | `@huggingface/transformers` (ONNX) | SOTA for size, local, Apache-2.0, 768d |
| Vector Database | LanceDB | `@lancedb/lancedb` | Embedded, serverless, TypeScript SDK |
| BM25 Search | Custom or wink-bm25 | `wink-bm25-text-search` | Lightweight keyword search |
| MCP Server | Official SDK | `@modelcontextprotocol/sdk` | Standard MCP protocol |
| MCP Transport | stdio | (built into SDK) | Simplest for local process |
| File Watching | chokidar | `chokidar` | Standard Node.js file watcher |
| Hashing | Node crypto | (built-in) | SHA-256 for Merkle tree |

### 6.3 Directory Structure

```
tools/mcp-codebase-search/
  package.json
  tsconfig.json
  src/
    index.ts              # MCP server entry point
    indexer/
      pipeline.ts         # Main indexing pipeline
      scanner.ts          # File scanner with Merkle tree
      parser.ts           # tree-sitter AST parser
      chunker.ts          # Code chunking strategies
      embedder.ts         # CodeRankEmbed via transformers.js
      summarizer.ts       # Template-based summary generation
    search/
      engine.ts           # Hybrid search (BM25 + vector + RRF)
      bm25.ts             # BM25 keyword search
      vector.ts           # LanceDB vector search
      fusion.ts           # Reciprocal Rank Fusion
    storage/
      lancedb.ts          # LanceDB connection and schema
      types.ts            # CodeSymbol, SearchResult types
    effect/
      extractors.ts       # Effect-specific pattern extractors
      classifiers.ts      # Classify symbols as schema/service/layer/etc
    formatters/
      results.ts          # Compact result formatting
      tree.ts             # Symbol tree formatting
  hooks/
    auto-context.js       # UserPromptSubmit hook script
    session-start.js      # SessionStart hook script
  data/
    .code-index/          # LanceDB data directory (gitignored)
```

### 6.4 Existing Solutions to Learn From

| Project | URL | Approach | Relevance |
|---------|-----|----------|-----------|
| **claude-context** (Zilliz) | https://github.com/zilliztech/claude-context | AST + hybrid search + Milvus | Production MCP code search; reference architecture |
| **claude-context-local** | https://github.com/FarhanAliRaza/claude-context-local | Local embeddings + offline | Proves local-only approach works |
| **mcp-vector-search** | https://github.com/bobmatnyc/mcp-vector-search | AST + ChromaDB + MCP | Python-based MCP code search |
| **CocoIndex** | https://github.com/cocoindex-io/cocoindex | tree-sitter + incremental | Best incremental indexing reference |
| **Continue.dev** | https://github.com/continuedev/continue | LanceDB + transformers.js | Production AI IDE using same stack |

---

## 7. Implementation Roadmap

### Phase 1: Core Index (MVP, ~2-3 days)

1. Set up project structure (`tools/mcp-codebase-search/`)
2. Implement tree-sitter AST parser for TypeScript
3. Build Effect-specific pattern extractors (Schema, Service, Layer, Error, Effect.fn)
4. Generate template-based summaries
5. Embed using CodeRankEmbed via transformers.js
6. Store in LanceDB (code_chunks + symbols tables)
7. Implement basic vector search

**Deliverable:** CLI tool that indexes the monorepo and searches via command line.

### Phase 2: MCP Server (~1-2 days)

1. Wrap search engine in MCP server using `@modelcontextprotocol/sdk`
2. Define `search_codebase`, `browse_symbols`, `reindex_codebase` tools
3. Implement compact result formatting with token budget awareness
4. Configure in `.mcp.json`
5. Test with Claude Code

**Deliverable:** Working MCP server that Claude Code can query.

### Phase 3: Hybrid Search (~1-2 days)

1. Add BM25 keyword search
2. Implement Reciprocal Rank Fusion
3. Add summary embedding table (dual-index)
4. Tune search quality with test queries

**Deliverable:** High-quality hybrid search with both semantic and keyword matching.

### Phase 4: Incremental Indexing (~1 day)

1. Implement SHA-256 Merkle tree for file change detection
2. Cache embeddings keyed by chunk hash
3. Add `reindex_codebase` tool with incremental mode
4. Optional: chokidar file watcher for background re-indexing

**Deliverable:** Fast incremental re-indexing (seconds, not minutes).

### Phase 5: Hook Integration (~0.5 days)

1. Implement UserPromptSubmit hook for auto-context injection
2. Implement SessionStart hook for project overview
3. Add CLAUDE.md instructions for explicit search guidance
4. Tune injection threshold (only inject when results are highly relevant)

**Deliverable:** Transparent context injection on every prompt.

### Phase 6: Polish (~1-2 days)

1. Add `find_related` tool for dependency/similarity exploration
2. Add RAPTOR-style hierarchical summaries (package -> module -> symbol)
3. Performance optimization (batch embeddings, concurrent parsing)
4. Error handling, logging, graceful degradation
5. Documentation

**Deliverable:** Production-quality semantic search system.

**Total estimated effort: ~7-10 days**

---

## Sources

### Embedding Models
- [Nomic CodeRankEmbed (137M)](https://huggingface.co/nomic-ai/CodeRankEmbed)
- [Nomic Embed Code (7B)](https://huggingface.co/nomic-ai/nomic-embed-code)
- [Nomic Embed Code Announcement](https://www.nomic.ai/blog/posts/introducing-state-of-the-art-nomic-embed-code)
- [Voyage Code 3](https://blog.voyageai.com/2024/12/04/voyage-code-3/)
- [6 Best Code Embedding Models Compared](https://modal.com/blog/6-best-code-embedding-models-compared)
- [13 Best Embedding Models in 2026](https://elephas.app/blog/best-embedding-models)
- [Ollama Embedding Models Guide](https://collabnix.com/ollama-embedded-models-the-complete-technical-guide-to-local-ai-embeddings-in-2025/)

### Vector Databases
- [LanceDB GitHub](https://github.com/lancedb/lancedb)
- [LanceDB npm (@lancedb/lancedb)](https://www.npmjs.com/package/@lancedb/lancedb)
- [LanceDB + Continue.dev Integration](https://lancedb.com/blog/the-future-of-ai-native-development-is-local-inside-continues-lancedb-powered-evolution/)
- [ChromaDB GitHub](https://github.com/chroma-core/chroma)
- [Qdrant vs LanceDB Comparison](https://zilliz.com/comparison/qdrant-vs-lancedb)
- [sqlite-vec GitHub](https://github.com/asg017/sqlite-vec)

### AST Parsing & Code Indexing
- [tree-sitter GitHub](https://github.com/tree-sitter/tree-sitter)
- [tree-sitter-typescript GitHub](https://github.com/tree-sitter/tree-sitter-typescript)
- [Semantic Code Indexing with AST and Tree-sitter](https://medium.com/@email2dineshkuppan/semantic-code-indexing-with-ast-and-tree-sitter-for-ai-agents-part-1-of-3-eb5237ba687a)
- [TypeScript Compiler API Wiki](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [API Extractor](https://api-extractor.com/)
- [structured-types](https://github.com/ccontrols/structured-types)
- [LSIF Specification](https://microsoft.github.io/language-server-protocol/specifications/lsif/0.6.0/specification/)

### Chunking Strategies
- [Chunking Strategies for LLM Applications (Pinecone)](https://www.pinecone.io/learn/chunking-strategies/)
- [Evaluating Chunking Strategies (Chroma Research)](https://research.trychroma.com/evaluating-chunking)
- [Best Chunking Strategies for RAG 2025](https://www.firecrawl.dev/blog/best-chunking-strategies-rag-2025)
- [Chonkie-TS (TypeScript chunking)](https://www.blog.brightcoding.dev/2025/06/05/text-chunking-the-ts-way-fast-simple-and-sweet-with-chonkie-ts/)

### Hybrid Search
- [Hybrid Search with BM25 and Rank Fusion](https://medium.com/thinking-sand/hybrid-search-with-bm25-and-rank-fusion-for-accurate-results-456a70305dc5)
- [Reciprocal Rank Fusion (OpenSearch)](https://opensearch.org/blog/introducing-reciprocal-rank-fusion-hybrid-search/)
- [Hybrid Search Explained (Weaviate)](https://weaviate.io/blog/hybrid-search-explained)

### RAPTOR Hierarchical Indexing
- [RAPTOR Paper (arXiv)](https://arxiv.org/abs/2401.18059)
- [RAPTOR GitHub](https://github.com/parthsarthi03/raptor)
- [RAPTOR-Inspired Hierarchical Indexing](https://medium.com/@tam.tamanna18/boosting-rag-efficiency-with-raptor-inspired-hierarchical-indexing-for-scalable-retrieval-f3583312bd84)

### MCP Server Development
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Build an MCP Server (Official)](https://modelcontextprotocol.io/docs/develop/build-server)
- [FastMCP Framework](https://github.com/punkpeye/fastmcp)
- [Claude Code MCP Configuration](https://code.claude.com/docs/en/mcp)

### Existing Semantic Code Search MCP Servers
- [claude-context (Zilliz)](https://github.com/zilliztech/claude-context)
- [claude-context-local](https://github.com/FarhanAliRaza/claude-context-local)
- [mcp-vector-search](https://github.com/bobmatnyc/mcp-vector-search)
- [CodeGrok MCP](https://hackernoon.com/codegrok-mcp-semantic-code-search-that-saves-ai-agents-10x-in-context-usage)
- [CocoIndex (Realtime Codebase Indexing)](https://github.com/cocoindex-io/realtime-codebase-indexing)

### Claude Code Hooks
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)
- [Hooks Reference](https://docs.claude.com/en/docs/claude-code/hooks)
- [Claude Code Hooks Mastery (Examples)](https://github.com/disler/claude-code-hooks-mastery)
- [How to Configure Hooks (Anthropic Blog)](https://claude.com/blog/how-to-configure-hooks)

### Incremental Indexing
- [How Cursor Indexes Codebases Fast](https://read.engineerscodex.com/p/how-cursor-indexes-codebases-fast)
- [How Cursor Actually Indexes Your Codebase](https://towardsdatascience.com/how-cursor-actually-indexes-your-codebase/)
- [CocoIndex Incremental Processing](https://cocoindex.io/examples/code_index)

### Transformers.js / Local ML
- [Transformers.js (Hugging Face)](https://github.com/xenova/transformers.js/)
- [Transformers.js v3 Announcement](https://huggingface.co/blog/transformersjs-v3)
- [@huggingface/transformers on npm](https://www.npmjs.com/package/@xenova/transformers)
