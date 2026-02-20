# Package Scaffolding — `tooling/codebase-search`

> P3 synthesis output: exact, buildable scaffold for the semantic codebase search package.

## 1) Directory Layout (Exact Scaffold)

```text
tooling/codebase-search/
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
├── README.md
├── ai-context.md
├── package.json
├── tsconfig.json
├── tsconfig.test.json
├── vitest.config.ts
├── docgen.json
├── src/
│   ├── index.ts
│   ├── bin.ts
│   ├── errors.ts
│   ├── IndexedSymbol.ts
│   ├── doctrine.d.ts
│   ├── wink-bm25-text-search.d.ts
│   ├── extractor/
│   │   ├── index.ts
│   │   ├── FileScanner.ts
│   │   ├── JsDocExtractor.ts
│   │   ├── EffectPatternDetector.ts
│   │   └── SymbolAssembler.ts
│   ├── indexer/
│   │   ├── index.ts
│   │   ├── EmbeddingService.ts
│   │   ├── LanceDbWriter.ts
│   │   ├── Bm25Writer.ts
│   │   └── Pipeline.ts
│   ├── search/
│   │   ├── index.ts
│   │   ├── HybridSearch.ts
│   │   ├── KeywordSearch.ts
│   │   └── RelationResolver.ts
│   ├── mcp/
│   │   ├── index.ts
│   │   ├── McpServer.ts
│   │   ├── formatters.ts
│   │   ├── SearchCodebaseTool.ts
│   │   ├── FindRelatedTool.ts
│   │   ├── BrowseSymbolsTool.ts
│   │   └── ReindexTool.ts
│   └── hooks/
│       ├── index.ts
│       ├── SessionStart.ts
│       ├── PromptSubmit.ts
│       ├── session-start-entry.ts
│       └── prompt-submit-entry.ts
└── test/
    ├── IndexedSymbol.test.ts
    ├── errors.test.ts
    ├── extractor/
    │   ├── FileScanner.test.ts
    │   ├── JsDocExtractor.test.ts
    │   ├── EffectPatternDetector.test.ts
    │   └── SymbolAssembler.test.ts
    ├── indexer/
    │   ├── EmbeddingService.test.ts
    │   ├── LanceDbWriter.test.ts
    │   ├── Bm25Writer.test.ts
    │   └── Pipeline.test.ts
    ├── search/
    │   ├── HybridSearch.test.ts
    │   ├── KeywordSearch.test.ts
    │   └── RelationResolver.test.ts
    ├── mcp/
    │   ├── McpServer.test.ts
    │   ├── SearchCodebaseTool.test.ts
    │   ├── FindRelatedTool.test.ts
    │   ├── BrowseSymbolsTool.test.ts
    │   └── ReindexTool.test.ts
    ├── hooks/
    │   ├── SessionStart.test.ts
    │   └── PromptSubmit.test.ts
    └── fixtures/
        ├── sample-source.ts
        ├── sample-schema.ts
        └── sample-error.ts
```

Generated artifacts (`dist/`, `docs/`, `.turbo/`, `node_modules/`) are excluded from scaffold scope.

## 2) `package.json` (Effect v4 Catalog Pattern)

Template source: `tooling/cli/package.json`.
Dependency source: `embedding-pipeline-design.md`, `mcp-api-design.md`, `docgen-vs-custom-evaluation.md`.

```json
{
  "name": "@beep/codebase-search",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "license": "MIT",
  "description": "Semantic codebase search with hybrid vector + BM25 retrieval, MCP tools, and Claude Code hooks",
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
    "./search/*": null,
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
      "./search/*": null,
      "./mcp/*": null,
      "./hooks/*": null,
      "./internal/*": null,
      "./bin": null
    }
  },
  "scripts": {
    "codegen": "echo 'no codegen for @beep/codebase-search'",
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
    "@modelcontextprotocol/sdk": "catalog:",
    "@lancedb/lancedb": "catalog:",
    "@huggingface/transformers": "catalog:",
    "wink-bm25-text-search": "catalog:",
    "ts-morph": "catalog:",
    "doctrine": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "@types/doctrine": "catalog:",
    "@effect/vitest": "catalog:"
  }
}
```

Required root catalog keys:
- `@modelcontextprotocol/sdk`
- `@lancedb/lancedb`
- `@huggingface/transformers`
- `wink-bm25-text-search`
- `ts-morph`
- `doctrine`
- `@types/doctrine`

## 3) `tsconfig.json`

Template source: `tooling/cli/tsconfig.json`.

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

## 4) `docgen.json`

Template source: `tooling/cli/docgen.json`.

```json
{
  "$schema": "../../node_modules/@effect/docgen/schema.json",
  "exclude": [
    "src/internal/**/*.ts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts"
  ],
  "enforceDescriptions": true,
  "enforceVersion": true,
  "srcLink": "https://github.com/kriegcloud/beep-effect/tree/main/tooling/codebase-search/src/",
  "examplesCompilerOptions": {
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "module": "ES2022",
    "target": "ES2022",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "rewriteRelativeImportExtensions": true,
    "allowImportingTsExtensions": true,
    "paths": {
      "effect": ["../../packages/effect/src/index.ts"],
      "@beep/codebase-search": ["../../tooling/codebase-search/src/index.ts"]
    }
  }
}
```

## 5) Module Entry Points (`src/index.ts`)

`src/index.ts` must be the only public barrel:

```ts
/** @since 0.0.0 */
export * from "./errors.js"
/** @since 0.0.0 */
export * from "./IndexedSymbol.js"
/** @since 0.0.0 */
export * from "./extractor/index.js"
/** @since 0.0.0 */
export * from "./indexer/index.js"
/** @since 0.0.0 */
export * from "./search/index.js"
/** @since 0.0.0 */
export * from "./mcp/index.js"
/** @since 0.0.0 */
export * from "./hooks/index.js"
```

`src/bin.ts` is the executable entry and launches MCP server layer.

## 6) Test Layout (Mirrors `src/`)

Mirror rule: `src/<path>/<Name>.ts` → `test/<path>/<Name>.test.ts`.

Required mirrors:
- `src/IndexedSymbol.ts` → `test/IndexedSymbol.test.ts`
- `src/errors.ts` → `test/errors.test.ts`
- `src/extractor/*.ts` → `test/extractor/*.test.ts`
- `src/indexer/*.ts` → `test/indexer/*.test.ts`
- `src/search/*.ts` → `test/search/*.test.ts`
- `src/mcp/*.ts` → `test/mcp/*.test.ts`
- `src/hooks/*.ts` → `test/hooks/*.test.ts`

Fixture files in `test/fixtures/` cover schema annotations, tagged errors, and module-level docs.

## 7) Required Root Updates

- `tsconfig.packages.json`: add `{ "path": "tooling/codebase-search" }`.
- `.gitignore`: add `.code-index/`.
- `.mcp.json`: add `codebase-search` stdio server command.
- `.claude/settings.json`: wire `SessionStart` and `UserPromptSubmit` hook commands.
