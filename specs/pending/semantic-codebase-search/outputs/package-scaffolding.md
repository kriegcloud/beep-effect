# Package Scaffolding — `tooling/codebase-search`

> P3 Output — Exact package structure for the semantic codebase search system.

---

## Directory Layout

```
tooling/codebase-search/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts                         # Public barrel exports
│   ├── bin.ts                           # MCP server entry point (stdio)
│   ├── errors.ts                        # TaggedErrorClass definitions
│   ├── schemas/
│   │   ├── IndexedSymbol.ts             # IndexedSymbol interface + Schema + builders
│   │   └── IndexMeta.ts                 # IndexMeta schema (version, timestamps, stats)
│   ├── extractor/
│   │   ├── FileScanner.ts               # Content hash change detection
│   │   ├── JsDocExtractor.ts            # ts-morph + doctrine JSDoc extraction
│   │   ├── EffectPatternDetector.ts     # Effect-specific AST pattern detection
│   │   ├── SchemaAnnotationExtractor.ts # .annotate() / .annotateKey() metadata
│   │   ├── SymbolAssembler.ts           # Merge JSDoc + Effect → IndexedSymbol
│   │   └── KindClassifier.ts            # SymbolKind decision tree
│   ├── indexer/
│   │   ├── EmbeddingService.ts          # CodeRankEmbed ONNX wrapper (Context.Tag)
│   │   ├── LanceDbWriter.ts             # LanceDB upsert/delete operations
│   │   ├── Bm25Writer.ts               # BM25 index read/write/update
│   │   └── Pipeline.ts                  # Full + incremental indexing orchestrator
│   ├── search/
│   │   ├── HybridSearch.ts              # Vector + BM25 + RRF fusion
│   │   ├── KeywordSearch.ts             # BM25-only search (for hooks)
│   │   └── RelationResolver.ts          # Graph edge traversal (imports, same-module, etc.)
│   ├── mcp/
│   │   ├── Server.ts                    # MCP server setup (stdio transport)
│   │   ├── SearchCodebaseTool.ts        # search_codebase tool handler
│   │   ├── FindRelatedTool.ts           # find_related tool handler
│   │   ├── BrowseSymbolsTool.ts         # browse_symbols tool handler
│   │   └── ReindexTool.ts              # reindex tool handler
│   └── hooks/
│       ├── SessionStart.ts              # SessionStart hook logic
│       ├── PromptSubmit.ts              # UserPromptSubmit hook logic
│       ├── session-start-entry.ts       # Node.js entry point (dist/hooks/session-start-entry.js)
│       └── prompt-submit-entry.ts       # Node.js entry point (dist/hooks/prompt-submit-entry.js)
├── test/
│   ├── extractor/
│   │   ├── FileScanner.test.ts
│   │   ├── JsDocExtractor.test.ts
│   │   ├── EffectPatternDetector.test.ts
│   │   ├── SchemaAnnotationExtractor.test.ts
│   │   ├── SymbolAssembler.test.ts
│   │   └── KindClassifier.test.ts
│   ├── indexer/
│   │   ├── EmbeddingService.test.ts
│   │   ├── LanceDbWriter.test.ts
│   │   ├── Bm25Writer.test.ts
│   │   └── Pipeline.test.ts
│   ├── search/
│   │   ├── HybridSearch.test.ts
│   │   ├── KeywordSearch.test.ts
│   │   └── RelationResolver.test.ts
│   ├── mcp/
│   │   ├── SearchCodebaseTool.test.ts
│   │   ├── FindRelatedTool.test.ts
│   │   ├── BrowseSymbolsTool.test.ts
│   │   └── ReindexTool.test.ts
│   ├── hooks/
│   │   ├── SessionStart.test.ts
│   │   └── PromptSubmit.test.ts
│   └── fixtures/
│       ├── sample-source.ts             # TypeScript file with all symbol kinds
│       ├── sample-schema.ts             # Schema with .annotate() + .annotateKey()
│       └── sample-error.ts              # TaggedErrorClass example
└── dtslint/
    └── IndexedSymbol.tst.ts             # Type-level tests for schema types
```

---

## package.json

```json
{
  "name": "@beep/codebase-search",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "license": "MIT",
  "description": "Annotation-driven semantic codebase search with hybrid vector + keyword retrieval, exposed via MCP server and Claude Code hooks",
  "homepage": "https://github.com/kriegcloud/beep-effect/tree/main/tooling/codebase-search",
  "repository": {
    "type": "git",
    "url": "git@github.com:kriegcloud/beep-effect.git",
    "directory": "tooling/codebase-search"
  },
  "sideEffects": [],
  "bin": {
    "codebase-search": "./src/bin.ts"
  },
  "exports": {
    "./package.json": "./package.json",
    ".": "./src/index.ts",
    "./*": "./src/*.ts",
    "./extractor/*": null,
    "./indexer/*": null,
    "./mcp/*": null,
    "./hooks/*": null,
    "./internal/*": null,
    "./bin": null
  },
  "files": [
    "src/**/*.ts",
    "dist/**/*.js",
    "dist/**/*.js.map",
    "dist/**/*.d.ts",
    "dist/**/*.d.ts.map"
  ],
  "publishConfig": {
    "access": "public",
    "provenance": true,
    "bin": {
      "codebase-search": "./dist/bin.js"
    },
    "exports": {
      "./package.json": "./package.json",
      ".": "./dist/index.js",
      "./*": "./dist/*.js",
      "./extractor/*": null,
      "./indexer/*": null,
      "./mcp/*": null,
      "./hooks/*": null,
      "./internal/*": null,
      "./bin": null
    }
  },
  "scripts": {
    "build": "tsc -b tsconfig.json && bun run babel",
    "build:tsgo": "tsgo -b tsconfig.json && bun run babel",
    "babel": "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "vitest",
    "coverage": "vitest --coverage",
    "docgen": "bunx @effect/docgen"
  },
  "dependencies": {
    "@beep/repo-utils": "workspace:*",
    "effect": "catalog:",
    "@effect/platform-node": "catalog:",
    "@lancedb/lancedb": "catalog:",
    "@huggingface/transformers": "catalog:",
    "@modelcontextprotocol/sdk": "catalog:",
    "wink-bm25-text-search": "catalog:",
    "ts-morph": "catalog:",
    "doctrine": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "@effect/vitest": "catalog:",
    "@types/doctrine": "catalog:"
  }
}
```

---

## Root Catalog Additions

Add to root `package.json` under `catalog`:

```json
{
  "catalog": {
    "@lancedb/lancedb": "^0.15.0",
    "@huggingface/transformers": "^3.5.0",
    "@modelcontextprotocol/sdk": "^1.12.0",
    "wink-bm25-text-search": "^2.2.0",
    "ts-morph": "^25.0.0",
    "doctrine": "^3.0.0",
    "@types/doctrine": "^0.0.9"
  }
}
```

---

## tsconfig.json

```json
{
  "$schema": "http://json.schemastore.org/tsconfig",
  "extends": "../../tsconfig.base.json",
  "include": ["src"],
  "compilerOptions": {
    "types": ["node", "bun"],
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

---

## vitest.config.ts

```typescript
import { defineConfig, mergeConfig } from "vitest/config";
import shared from "../../vitest.shared.ts";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      // Package-specific overrides
    },
  })
);
```

---

## tsconfig.packages.json Update

Add to `references` array in root `tsconfig.packages.json`:

```json
{ "path": "tooling/codebase-search" }
```

---

## .gitignore Addition

Add to root `.gitignore`:

```
# Codebase search index (generated)
.code-index/
```

---

## Module Entry Points (src/index.ts)

```typescript
/**
 * Annotation-driven semantic codebase search for Effect v4 monorepos.
 *
 * Extracts JSDoc + Schema annotation metadata from TypeScript source files,
 * builds vector embeddings via Nomic CodeRankEmbed, and provides hybrid
 * search through an MCP server and Claude Code hooks.
 *
 * @remarks
 * Key exports: {@link IndexedSymbol}, {@link EmbeddingService}, {@link HybridSearch}.
 * The MCP server exposes 4 tools: search_codebase, find_related, browse_symbols, reindex.
 * Hooks (SessionStart, UserPromptSubmit) provide transparent context auto-injection.
 *
 * @since 0.0.0
 * @domain codebase-search
 * @packageDocumentation
 */

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  type IndexedSymbol,
  /**
   * @since 0.0.0
   */
  type SymbolKind,
  /**
   * @since 0.0.0
   */
  type EffectPattern,
  /**
   * @since 0.0.0
   */
  buildEmbeddingText,
  /**
   * @since 0.0.0
   */
  buildKeywordText,
} from "./schemas/IndexedSymbol.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  type IndexMeta,
} from "./schemas/IndexMeta.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  IndexNotFoundError,
  /**
   * @since 0.0.0
   */
  SymbolNotFoundError,
  /**
   * @since 0.0.0
   */
  EmbeddingModelError,
  /**
   * @since 0.0.0
   */
  SearchTimeoutError,
} from "./errors.js"
```

---

## MCP Server Configuration (.mcp.json)

```json
{
  "mcpServers": {
    "codebase-search": {
      "type": "stdio",
      "command": "node",
      "args": ["./tooling/codebase-search/dist/bin.js"],
      "env": {
        "CODEBASE_ROOT": ".",
        "INDEX_PATH": ".code-index"
      }
    }
  }
}
```

---

## Hook Configuration (.claude/settings.json additions)

```json
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "node ./tooling/codebase-search/dist/hooks/session-start-entry.js",
        "timeout": 5000
      }
    ],
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": "node ./tooling/codebase-search/dist/hooks/prompt-submit-entry.js",
        "timeout": 5000
      }
    ]
  }
}
```

---

## ESLint Integration (root level)

New files at root:

```
eslint-rules/
  require-since-semver.ts
  require-schema-annotations.ts
  index.ts
eslint.config.mjs
tsdoc.json
```

These are defined in `eslint-config-design.md` and deployed as P4a tasks (not part of the codebase-search package itself).

---

## Dependency Graph

```
@beep/codebase-search
  ├── @beep/repo-utils (workspace — PackageJson schema, DomainError)
  ├── effect (core — Effect, Schema, Layer, Context, Array, etc.)
  ├── @effect/platform-node (FileSystem, Path implementations)
  ├── ts-morph (AST parsing)
  ├── doctrine (JSDoc parsing)
  ├── @lancedb/lancedb (vector storage)
  ├── @huggingface/transformers (ONNX embeddings)
  ├── wink-bm25-text-search (keyword search)
  └── @modelcontextprotocol/sdk (MCP server protocol)
```
