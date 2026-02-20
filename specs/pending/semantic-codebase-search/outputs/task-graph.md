# Task Graph — Semantic Codebase Search (P4)

> P3 synthesis output: implementable tasks with hard dependencies, each task <=2 hours.

## Task Count and Budget

- Total tasks: 18 (constraint: <=20)
- All task estimates: <=2 hours
- Phases: P4a (doc standards), P4b (extractor + pipeline), P4c (MCP + hooks)

## Dependency Edges (Blocking)

```text
T01 -> T04
T02 -> T04
T03 -> T04

T05 -> T06
T06 -> T08
T06 -> T09
T08 -> T10
T09 -> T10
T07 -> T14
T10 -> T14
T11 -> T12
T12 -> T14
T13 -> T14

T14 -> T15
T15 -> T16
T15 -> T17
T16 -> T18
```

## P4a — Documentation Standards

### T01 — Root ESLint JSDoc Baseline
- Phase: P4a
- Estimate: 1.5h
- Depends on: none
- Input files: `specs/pending/semantic-codebase-search/outputs/eslint-config-design.md`, `specs/pending/semantic-codebase-search/outputs/jsdoc-standard.md`
- Output files: `eslint.config.mjs`, `package.json`
- Description: Install and configure `eslint-plugin-jsdoc` + TypeScript parser integration, add `lint:jsdoc` scripts, and enable required presence/quality/tag rules.
- Acceptance criteria:
  - `npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'` runs without config errors.
  - `jsdoc/require-jsdoc`, `jsdoc/require-description`, `jsdoc/check-tag-names` are active.
  - Root scripts include `lint:jsdoc` and `lint:jsdoc:fix`.

### T02 — `tsdoc.json` Custom Tag Contract
- Phase: P4a
- Estimate: 0.5h
- Depends on: none
- Input files: `specs/pending/semantic-codebase-search/outputs/jsdoc-standard.md`, `specs/pending/semantic-codebase-search/outputs/eslint-config-design.md`
- Output files: `tsdoc.json`
- Description: Add custom tags (`@domain`, `@provides`, `@depends`, `@errors`) and supported standard tags used by the extractor/linter/docgen toolchain.
- Acceptance criteria:
  - `tsdoc.json` includes all custom tags with correct `allowMultiple` settings.
  - `@packageDocumentation`, `@since`, `@category`, `@param`, `@returns`, `@throws` are marked supported.

### T03 — Docgen Enforcement Update
- Phase: P4a
- Estimate: 0.5h
- Depends on: none
- Input files: `specs/pending/semantic-codebase-search/outputs/eslint-config-design.md`
- Output files: `tooling/cli/docgen.json`, `tooling/codebase-search/docgen.json`
- Description: Align package docgen configs to enforce descriptions/version and exclude tests/internal files.
- Acceptance criteria:
  - Both `docgen.json` files set `enforceDescriptions: true` and `enforceVersion: true`.
  - `bunx turbo run docgen --filter=@beep/repo-cli --filter=@beep/codebase-search` completes.

### T04 — Existing Exported JSDoc Backfill
- Phase: P4a
- Estimate: 2.0h
- Depends on: T01, T02, T03
- Input files: `specs/pending/semantic-codebase-search/outputs/jsdoc-standard.md`
- Output files: `tooling/cli/src/**/*.ts`, `tooling/codebase-search/src/**/*.ts`
- Description: Backfill exported symbols to satisfy required tags/description quality and module docs.
- Acceptance criteria:
  - Exported symbols have non-empty descriptions + `@since`; non-module symbols have `@category`.
  - Index/barrel files contain `@packageDocumentation`.
  - ESLint JSDoc run reports zero errors (warnings allowed).

## P4b — Extractor + Pipeline

### T05 — Package Scaffold and Project Wiring
- Phase: P4b
- Estimate: 1.0h
- Depends on: none
- Input files: `specs/pending/semantic-codebase-search/outputs/package-scaffolding.md`
- Output files: `tooling/codebase-search/package.json`, `tooling/codebase-search/tsconfig.json`, `tooling/codebase-search/docgen.json`, `tooling/codebase-search/vitest.config.ts`, `tsconfig.packages.json`, `.gitignore`
- Description: Ensure package structure/config matches scaffold (catalog dependencies, scripts, references, index path gitignore).
- Acceptance criteria:
  - `tsc -b tooling/codebase-search/tsconfig.json` succeeds.
  - `tooling/codebase-search` is present in `tsconfig.packages.json` references.
  - `.gitignore` contains `.code-index/`.

### T06 — IndexedSymbol + Error Types + Barrels
- Phase: P4b
- Estimate: 1.5h
- Depends on: T05
- Input files: `specs/pending/semantic-codebase-search/outputs/indexed-symbol-schema.md`
- Output files: `tooling/codebase-search/src/IndexedSymbol.ts`, `tooling/codebase-search/src/errors.ts`, `tooling/codebase-search/src/index.ts`, `tooling/codebase-search/test/IndexedSymbol.test.ts`, `tooling/codebase-search/test/errors.test.ts`
- Description: Implement canonical symbol schema, classifier/builders, validation helpers, and tagged errors used across index/search/MCP.
- Acceptance criteria:
  - `classifySymbol` covers all symbol kinds in tests.
  - `buildEmbeddingText` and `buildKeywordText` produce deterministic output.
  - Error constructors are `S.TaggedErrorClass` based and exported from barrel.

### T07 — Incremental File Scanner
- Phase: P4b
- Estimate: 1.5h
- Depends on: T05
- Input files: `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`
- Output files: `tooling/codebase-search/src/extractor/FileScanner.ts`, `tooling/codebase-search/test/extractor/FileScanner.test.ts`
- Description: Implement full/incremental scan using content hashes and `.code-index/file-hashes.json` persistence.
- Acceptance criteria:
  - Detects added/modified/deleted/unchanged files.
  - Full mode marks all source files as added.
  - Ignores tests/spec/internal/declaration files.

### T08 — ts-morph + doctrine JSDoc Extractor
- Phase: P4b
- Estimate: 2.0h
- Depends on: T06
- Input files: `specs/pending/semantic-codebase-search/outputs/docgen-vs-custom-evaluation.md`, `specs/pending/semantic-codebase-search/outputs/jsdoc-standard.md`
- Output files: `tooling/codebase-search/src/extractor/JsDocExtractor.ts`, `tooling/codebase-search/test/extractor/JsDocExtractor.test.ts`
- Description: Extract JSDoc metadata and custom tags required by `IndexedSymbol`.
- Acceptance criteria:
  - Extracts description, since, category, remarks, examples, params, returns, throws/errors, domain, provides, depends, see refs.
  - Handles module-level `@packageDocumentation`.
  - Gracefully returns empty/null for missing tags.

### T09 — Effect Pattern + Schema Annotation Extractors
- Phase: P4b
- Estimate: 2.0h
- Depends on: T06
- Input files: `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`, `specs/pending/semantic-codebase-search/outputs/indexed-symbol-schema.md`
- Output files: `tooling/codebase-search/src/extractor/EffectPatternDetector.ts`, `tooling/codebase-search/test/extractor/EffectPatternDetector.test.ts`
- Description: Detect Effect patterns (Schema/Layer/Context/Command/Effect.fn) and extract `.annotate()` / `.annotateKey()` metadata.
- Acceptance criteria:
  - Tests cover all `EffectPattern` variants defined in schema.
  - `.annotate({ identifier, title, description })` extraction works.
  - Tagged error pattern detection works via AST (not regex-only fallback).

### T10 — IndexedSymbol Assembler (Two-Pass Import Resolution)
- Phase: P4b
- Estimate: 2.0h
- Depends on: T08, T09
- Input files: `specs/pending/semantic-codebase-search/outputs/indexed-symbol-schema.md`, `specs/pending/semantic-codebase-search/outputs/cross-validation-report.md`
- Output files: `tooling/codebase-search/src/extractor/SymbolAssembler.ts`, `tooling/codebase-search/test/extractor/SymbolAssembler.test.ts`
- Description: Merge extractor outputs into canonical symbols and resolve imports to symbol IDs with two passes.
- Acceptance criteria:
  - First pass builds symbol ID registry.
  - Second pass resolves internal imports to `imports: string[]` symbol IDs.
  - `validateIndexedSymbol` passes for generated symbols from fixtures.

### T11 — Embedding Service (CodeRankEmbed + Mock)
- Phase: P4b
- Estimate: 1.5h
- Depends on: T06
- Input files: `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`
- Output files: `tooling/codebase-search/src/indexer/EmbeddingService.ts`, `tooling/codebase-search/test/indexer/EmbeddingService.test.ts`
- Description: Implement embedding service layer with single and batch embedding APIs, plus deterministic test mock.
- Acceptance criteria:
  - `embed` returns 768-dim vector.
  - `embedBatch` returns one vector per input string.
  - Tests run with mock service and do not download model.

### T12 — LanceDB Writer (`SymbolRow` Mapping)
- Phase: P4b
- Estimate: 2.0h
- Depends on: T11
- Input files: `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`, `specs/pending/semantic-codebase-search/outputs/indexed-symbol-schema.md`
- Output files: `tooling/codebase-search/src/indexer/LanceDbWriter.ts`, `tooling/codebase-search/test/indexer/LanceDbWriter.test.ts`
- Description: Implement table creation, delete-then-insert upsert, vector search, and metadata filters using authoritative `SymbolRow` columns.
- Acceptance criteria:
  - Table includes all required columns (`end_line`, `effect_pattern`, `title` included).
  - Upsert replaces rows for modified/deleted files.
  - Vector search supports optional `kind` and `package` filters.

### T13 — BM25 Writer + Persistence
- Phase: P4b
- Estimate: 1.5h
- Depends on: T06
- Input files: `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`, `specs/pending/semantic-codebase-search/outputs/indexed-symbol-schema.md`
- Output files: `tooling/codebase-search/src/indexer/Bm25Writer.ts`, `tooling/codebase-search/test/indexer/Bm25Writer.test.ts`
- Description: Implement keyword index build/update/search and JSON persistence in `.code-index/bm25-index.json`.
- Acceptance criteria:
  - Index builds from `buildKeywordText`.
  - Search returns ranked symbol IDs.
  - Save/load round-trip preserves equivalent search results.

### T14 — Full Pipeline Orchestration
- Phase: P4b
- Estimate: 2.0h
- Depends on: T07, T10, T12, T13
- Input files: `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`, `specs/pending/semantic-codebase-search/outputs/mcp-api-design.md`
- Output files: `tooling/codebase-search/src/indexer/Pipeline.ts`, `tooling/codebase-search/test/indexer/Pipeline.test.ts`
- Description: Wire scanner -> extractor -> embedder -> LanceDB -> BM25 with full/incremental modes and stats output.
- Acceptance criteria:
  - `mode=full` indexes all files.
  - `mode=incremental` only processes changed files.
  - Returns `{ filesScanned, filesChanged, symbolsIndexed, symbolsRemoved, durationMs }`.

## P4c — MCP + Hooks

### T15 — MCP Server Skeleton + Shared Formatters
- Phase: P4c
- Estimate: 1.5h
- Depends on: T14
- Input files: `specs/pending/semantic-codebase-search/outputs/mcp-api-design.md`
- Output files: `tooling/codebase-search/src/mcp/McpServer.ts`, `tooling/codebase-search/src/mcp/formatters.ts`, `tooling/codebase-search/src/bin.ts`, `tooling/codebase-search/test/mcp/McpServer.test.ts`
- Description: Stand up MCP server transport, register tool schemas, and centralize response/error formatting contracts.
- Acceptance criteria:
  - Server responds to `tools/list` with all 4 tool names.
  - Error format matches `{ error: { code, message, suggestion } }`.
  - `node dist/bin.js` starts server in stdio mode.

### T16 — `search_codebase` + `browse_symbols` Tools
- Phase: P4c
- Estimate: 2.0h
- Depends on: T15
- Input files: `specs/pending/semantic-codebase-search/outputs/mcp-api-design.md`, `specs/pending/semantic-codebase-search/outputs/embedding-pipeline-design.md`
- Output files: `tooling/codebase-search/src/mcp/SearchCodebaseTool.ts`, `tooling/codebase-search/src/mcp/BrowseSymbolsTool.ts`, `tooling/codebase-search/test/mcp/SearchCodebaseTool.test.ts`, `tooling/codebase-search/test/mcp/BrowseSymbolsTool.test.ts`
- Description: Implement hybrid search tool + package/module/symbol browsing tool with schema-compliant outputs.
- Acceptance criteria:
  - `search_codebase` returns filtered, scored results with `searchMode`.
  - `browse_symbols` works at `packages`, `modules`, and `symbols` levels.
  - Default token budget target for 5 search results is met.

### T17 — `find_related` + `reindex` Tools
- Phase: P4c
- Estimate: 2.0h
- Depends on: T15
- Input files: `specs/pending/semantic-codebase-search/outputs/mcp-api-design.md`, `specs/pending/semantic-codebase-search/outputs/indexed-symbol-schema.md`
- Output files: `tooling/codebase-search/src/mcp/FindRelatedTool.ts`, `tooling/codebase-search/src/mcp/ReindexTool.ts`, `tooling/codebase-search/test/mcp/FindRelatedTool.test.ts`, `tooling/codebase-search/test/mcp/ReindexTool.test.ts`
- Description: Implement relationship navigation and index rebuild tool endpoints.
- Acceptance criteria:
  - Supports relations: `imports`, `imported-by`, `same-module`, `similar`, `provides`, `depends-on`.
  - `reindex` supports `incremental` and `full` modes with stats.
  - `SYMBOL_NOT_FOUND` and `INDEX_NOT_FOUND` error paths are tested.

### T18 — Claude Hooks (`SessionStart`, `UserPromptSubmit`)
- Phase: P4c
- Estimate: 2.0h
- Depends on: T16
- Input files: `specs/pending/semantic-codebase-search/outputs/hook-integration-design.md`, `specs/pending/semantic-codebase-search/outputs/mcp-api-design.md`
- Output files: `tooling/codebase-search/src/hooks/SessionStart.ts`, `tooling/codebase-search/src/hooks/PromptSubmit.ts`, `tooling/codebase-search/src/hooks/session-start-entry.ts`, `tooling/codebase-search/src/hooks/prompt-submit-entry.ts`, `tooling/codebase-search/test/hooks/SessionStart.test.ts`, `tooling/codebase-search/test/hooks/PromptSubmit.test.ts`, `.claude/settings.json`, `.mcp.json`
- Description: Implement hook entrypoints and formatting; SessionStart shows index overview, PromptSubmit injects BM25 context with skip heuristics.
- Acceptance criteria:
  - SessionStart output includes symbol/package summary when index exists.
  - PromptSubmit skips short/meta prompts and returns empty string when irrelevant.
  - PromptSubmit output is wrapped in `<system-reminder>` and remains <=800 tokens.
  - Hook failures degrade gracefully (no throw; empty output).

## Critical Path

`T05 -> T06 -> (T08,T09) -> T10 -> T11 -> T12 -> T14 -> T15 -> T16 -> T18`

Estimated critical-path effort: 16.5h.
