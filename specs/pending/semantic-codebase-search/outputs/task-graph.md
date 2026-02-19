# Task Graph — Semantic Codebase Search Implementation

> P3 Output — 18 tasks decomposed into P4a/P4b/P4c phases with dependency edges and acceptance criteria.

---

## Dependency Diagram

```
T1 ──→ T2 ──→ T3 ──→ T4
                       │
T5 ──────────────────→ T6 ──→ T7 ──→ T8 ──→ T9 ──→ T10 ──→ T11 ──→ T12
                                                               │
                                                               ├──→ T13 ──→ T14 ──→ T15 ──→ T16
                                                               │
                                                               └──→ T17 ──→ T18
```

**Legend:** T1→T2 means T1 blocks T2 (T2 cannot start until T1 completes).

---

## Phase P4a: Documentation Standards (T1–T4)

### T1: ESLint JSDoc Configuration

| Field | Value |
|-------|-------|
| **Phase** | P4a |
| **Blocked by** | None |
| **Blocks** | T2, T3 |
| **Estimated effort** | 1 hour |
| **Input docs** | `eslint-config-design.md`, `jsdoc-standard.md` |
| **Output files** | `eslint.config.mjs`, `tsdoc.json`, `eslint-rules/require-since-semver.ts`, `eslint-rules/require-schema-annotations.ts`, `eslint-rules/index.ts` |

**Description:** Install eslint-plugin-jsdoc, @typescript-eslint/parser, @typescript-eslint/eslint-plugin into root devDependencies via catalog. Create `eslint.config.mjs` with the three rule sets (jsdocRules, fileOverviewRules, moduleDocRules) from eslint-config-design.md. Create `tsdoc.json` with custom tag definitions. Implement the two custom rules. Add `lint:jsdoc` and `lint:jsdoc:fix` npm scripts to root package.json.

**Acceptance criteria:**
- `npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'` runs without config errors
- Custom tags (@domain, @provides, @depends, @errors) are recognized
- Phase 1 override applied (match-description=warn, sort-tags=off, require-file-overview=off for non-index files)

---

### T2: Docgen Configuration Update

| Field | Value |
|-------|-------|
| **Phase** | P4a |
| **Blocked by** | T1 |
| **Blocks** | T3 |
| **Estimated effort** | 30 minutes |
| **Input docs** | `eslint-config-design.md` (docgen section) |
| **Output files** | `tooling/cli/docgen.json`, `tooling/repo-utils/docgen.json` |

**Description:** Update `docgen.json` in both existing packages to set `enforceDescriptions: true`, `enforceVersion: true`, and add test file exclusions. Verify `bunx @effect/docgen` still succeeds.

**Acceptance criteria:**
- `bunx turbo run docgen` completes without errors
- Both packages have `enforceDescriptions: true`

---

### T3: Backfill Existing Code JSDoc

| Field | Value |
|-------|-------|
| **Phase** | P4a |
| **Blocked by** | T1, T2 |
| **Blocks** | T4 |
| **Estimated effort** | 2 hours |
| **Input docs** | `jsdoc-standard.md` (per-kind standards) |
| **Output files** | All files in `tooling/repo-utils/src/`, `tooling/cli/src/` |

**Description:** Add or improve JSDoc on all exported symbols to meet the tag requirement matrix. Add `@module` / `@packageDocumentation` headers to source files. Add `@category` tags. Add `.annotate()` metadata to schemas missing it. Add `@see` cross-references. This is the largest single task — focus on meeting Required (R) tags only; Should-have (S) tags can be deferred.

**Acceptance criteria:**
- `npx eslint --config eslint.config.mjs 'tooling/*/src/**/*.ts'` reports zero errors (warnings acceptable)
- Every exported symbol has: description (≥20 chars), `@since`, `@category`
- Every index.ts has `@packageDocumentation`

---

### T4: Lefthook Pre-commit Hook

| Field | Value |
|-------|-------|
| **Phase** | P4a |
| **Blocked by** | T3 |
| **Blocks** | None |
| **Estimated effort** | 30 minutes |
| **Input docs** | `eslint-config-design.md` (lefthook section) |
| **Output files** | `lefthook.yml` (or update existing) |

**Description:** Configure lefthook pre-commit to run JSDoc lint on staged `.ts` files. Exclude test files and internal directories.

**Acceptance criteria:**
- `git commit` of a `.ts` file without JSDoc triggers lint warning/error
- Test files and internal/ files are excluded

---

## Phase P4b: Extractor & Pipeline (T5–T12)

### T5: Package Scaffold

| Field | Value |
|-------|-------|
| **Phase** | P4b |
| **Blocked by** | None |
| **Blocks** | T6 |
| **Estimated effort** | 1 hour |
| **Input docs** | `package-scaffolding.md` |
| **Output files** | `tooling/codebase-search/package.json`, `tooling/codebase-search/tsconfig.json`, `tooling/codebase-search/vitest.config.ts`, `tooling/codebase-search/src/index.ts`, `tooling/codebase-search/src/errors.ts`, `tsconfig.packages.json` (updated), `.gitignore` (updated) |

**Description:** Create the `tooling/codebase-search/` directory with all boilerplate files per package-scaffolding.md. Add dependencies to root catalog. Add project reference to tsconfig.packages.json. Define TaggedErrorClass errors (IndexNotFoundError, SymbolNotFoundError, EmbeddingModelError, SearchTimeoutError). Create the barrel index.ts. Verify `tsc -b` and `npx vitest run` both succeed (with empty test suite).

**Acceptance criteria:**
- `tsc -b tooling/codebase-search/tsconfig.json` succeeds
- `bun install` resolves all dependencies
- `npx vitest run --project codebase-search` exits cleanly

---

### T6: IndexedSymbol Schema + Builders

| Field | Value |
|-------|-------|
| **Phase** | P4b |
| **Blocked by** | T5 |
| **Blocks** | T7, T8, T9 |
| **Estimated effort** | 1.5 hours |
| **Input docs** | `indexed-symbol-schema.md` |
| **Output files** | `tooling/codebase-search/src/schemas/IndexedSymbol.ts`, `tooling/codebase-search/src/schemas/IndexMeta.ts`, `tooling/codebase-search/test/extractor/KindClassifier.test.ts` |

**Description:** Implement the `IndexedSymbol` interface, `SymbolKind` and `EffectPattern` unions, `ParamDoc` and `FieldDoc` types, `buildEmbeddingText()`, `buildKeywordText()`, `classifySymbol()`, `generateId()`, and `validateIndexedSymbol()` — all as Effect v4 Schemas where appropriate. Implement `IndexMeta` schema. Write tests for `classifySymbol` (all 9 paths), `buildEmbeddingText` (token range verification), and `buildKeywordText`.

**Acceptance criteria:**
- All types and functions exported and documented
- `classifySymbol` tests cover all 9 symbol kinds
- `buildEmbeddingText` produces 150–3000 character output for a sample symbol
- `validateIndexedSymbol` catches missing id, short description, empty since

---

### T7: JSDoc Extractor

| Field | Value |
|-------|-------|
| **Phase** | P4b |
| **Blocked by** | T6 |
| **Blocks** | T9 |
| **Estimated effort** | 2 hours |
| **Input docs** | `docgen-vs-custom-evaluation.md`, `jsdoc-standard.md` |
| **Output files** | `tooling/codebase-search/src/extractor/JsDocExtractor.ts`, `tooling/codebase-search/test/extractor/JsDocExtractor.test.ts` |

**Description:** Implement JSDoc extraction using ts-morph for AST traversal and doctrine for JSDoc parsing. Extract: description, @since, @category, @example, @remarks, @see, @param, @returns, @throws/@errors, @provides, @depends, @domain, @deprecated, @packageDocumentation. Handle both standard and custom tags. Return a partial IndexedSymbol record covering all natural-language and tag fields.

**Acceptance criteria:**
- Extracts all 15 tags from a well-documented fixture file
- Handles missing tags gracefully (returns null/empty array)
- Extracts module-level @packageDocumentation
- Extracts @example code blocks (raw string)
- Tests use fixture files in test/fixtures/

---

### T8: Effect Pattern Detector + Schema Annotation Extractor

| Field | Value |
|-------|-------|
| **Phase** | P4b |
| **Blocked by** | T6 |
| **Blocks** | T9 |
| **Estimated effort** | 2 hours |
| **Input docs** | `embedding-pipeline-design.md` (AST extractor section), `indexed-symbol-schema.md` (EffectPattern type) |
| **Output files** | `tooling/codebase-search/src/extractor/EffectPatternDetector.ts`, `tooling/codebase-search/src/extractor/SchemaAnnotationExtractor.ts`, `tooling/codebase-search/test/extractor/EffectPatternDetector.test.ts`, `tooling/codebase-search/test/extractor/SchemaAnnotationExtractor.test.ts` |

**Description:** Implement `detectEffectPattern()` covering all 17 EffectPattern variants using ts-morph AST analysis. Implement `extractSchemaAnnotations()` to parse `.annotate({ identifier, title, description })` and `.annotateKey({ description })` from node text. Handle TaggedErrorClass heritage clause detection. Return partial IndexedSymbol fields for classification and schema metadata.

**Acceptance criteria:**
- Detects all 17 EffectPattern variants from fixture files
- Extracts .annotate() with identifier, title, description
- Extracts .annotateKey() field descriptions from S.Struct schemas
- Detects TaggedErrorClass via extends clause
- Returns null for non-Effect symbols

---

### T9: Symbol Assembler + File Scanner

| Field | Value |
|-------|-------|
| **Phase** | P4b |
| **Blocked by** | T7, T8 |
| **Blocks** | T10 |
| **Estimated effort** | 1.5 hours |
| **Input docs** | `embedding-pipeline-design.md` (file scanner, AST extractor) |
| **Output files** | `tooling/codebase-search/src/extractor/SymbolAssembler.ts`, `tooling/codebase-search/src/extractor/FileScanner.ts`, `tooling/codebase-search/test/extractor/SymbolAssembler.test.ts`, `tooling/codebase-search/test/extractor/FileScanner.test.ts` |

**Description:** Implement `SymbolAssembler` that merges JSDoc extraction + Effect extraction into complete `IndexedSymbol` records. Calls `classifySymbol()`, `generateId()`, `buildEmbeddingText()`, `buildKeywordText()`, and computes `contentHash`. Implement `FileScanner` with content-hash change detection: full scan mode (all files → added), incremental mode (compare against stored hashes → added/modified/deleted/unchanged). Glob pattern: `tooling/*/src/**/*.ts`, excluding test/internal/declaration files.

**Acceptance criteria:**
- Assembler produces valid IndexedSymbol from combined JSDoc + Effect inputs
- FileScanner detects added, modified, deleted, and unchanged files
- Incremental mode reads from and writes to `.code-index/file-hashes.json`
- Full mode treats all files as "added"

---

### T10: Embedding Service

| Field | Value |
|-------|-------|
| **Phase** | P4b |
| **Blocked by** | T9 |
| **Blocks** | T11 |
| **Estimated effort** | 1.5 hours |
| **Input docs** | `embedding-pipeline-design.md` (embedding model, batch processing) |
| **Output files** | `tooling/codebase-search/src/indexer/EmbeddingService.ts`, `tooling/codebase-search/test/indexer/EmbeddingService.test.ts` |

**Description:** Implement `EmbeddingService` as a Context.Tag service wrapping `@huggingface/transformers` pipeline for `nomic-ai/CodeRankEmbed`. Provide `embed(text)` and `embedBatch(texts)` methods returning `Float32Array[768]`. Implement batch processing with configurable batch size (default 32). Create `EmbeddingServiceLive` layer. Create `EmbeddingServiceMock` layer for tests (returns deterministic vectors).

**Acceptance criteria:**
- `embed("test text")` returns Float32Array of length 768
- `embedBatch` processes multiple texts and returns matching-length array
- Mock layer works in tests without model download
- Batch size is configurable

---

### T11: LanceDB + BM25 Storage

| Field | Value |
|-------|-------|
| **Phase** | P4b |
| **Blocked by** | T10 |
| **Blocks** | T12, T13, T17 |
| **Estimated effort** | 2 hours |
| **Input docs** | `embedding-pipeline-design.md` (LanceDB storage, BM25 index) |
| **Output files** | `tooling/codebase-search/src/indexer/LanceDbWriter.ts`, `tooling/codebase-search/src/indexer/Bm25Writer.ts`, `tooling/codebase-search/test/indexer/LanceDbWriter.test.ts`, `tooling/codebase-search/test/indexer/Bm25Writer.test.ts` |

**Description:** Implement `LanceDbWriter` with: `createTable()` (symbols table with 21 columns), `upsert()` (delete-then-insert by file_path), `deleteByFiles()`, `vectorSearch()` (cosine similarity with optional kind/package filter). Implement `Bm25Writer` with: `createIndex()`, `addDocuments()`, `removeBySymbolIds()`, `search()`, `save()` (to bm25-index.json), `load()`. Configure BM25 with k1=1.2, b=0.75, camelCase tokenization.

**Acceptance criteria:**
- LanceDB table creation with all 21 columns
- Upsert correctly deletes old rows for modified files before inserting
- Vector search returns results sorted by cosine similarity
- BM25 search matches camelCase-split tokens
- BM25 index persists to and loads from JSON file

---

### T12: Pipeline Orchestrator

| Field | Value |
|-------|-------|
| **Phase** | P4b |
| **Blocked by** | T11 |
| **Blocks** | None (but feeds into T13, T14 implicitly) |
| **Estimated effort** | 1.5 hours |
| **Input docs** | `embedding-pipeline-design.md` (incremental strategy, performance targets) |
| **Output files** | `tooling/codebase-search/src/indexer/Pipeline.ts`, `tooling/codebase-search/test/indexer/Pipeline.test.ts` |

**Description:** Implement the full indexing pipeline orchestrator: (1) FileScanner → ScanResult, (2) AST extraction via SymbolAssembler for added+modified files, (3) batch embedding via EmbeddingService, (4) LanceDB upsert + BM25 update, (5) save file hashes + update IndexMeta. Support both `full` and `incremental` modes. Support optional `package` filter. Return stats: filesScanned, filesChanged, symbolsIndexed, symbolsRemoved, durationMs.

**Acceptance criteria:**
- Full index mode processes all source files
- Incremental mode only processes changed files
- Package filter restricts to single package
- Returns correct stats object
- Saves updated file hashes and IndexMeta after completion

---

## Phase P4c: MCP Server & Hooks (T13–T18)

### T13: Hybrid Search + Relation Resolver

| Field | Value |
|-------|-------|
| **Phase** | P4c |
| **Blocked by** | T11 |
| **Blocks** | T14 |
| **Estimated effort** | 1.5 hours |
| **Input docs** | `embedding-pipeline-design.md` (RRF), `mcp-api-design.md` (search algorithm, relation resolution) |
| **Output files** | `tooling/codebase-search/src/search/HybridSearch.ts`, `tooling/codebase-search/src/search/KeywordSearch.ts`, `tooling/codebase-search/src/search/RelationResolver.ts`, `tooling/codebase-search/test/search/HybridSearch.test.ts`, `tooling/codebase-search/test/search/KeywordSearch.test.ts`, `tooling/codebase-search/test/search/RelationResolver.test.ts` |

**Description:** Implement `HybridSearch`: embed query → parallel vector + BM25 search → RRF fusion (k=60) → score normalization → metadata filter → truncate. Implement `KeywordSearch`: BM25-only search for hooks (no embedding needed). Implement `RelationResolver`: resolve imports, imported-by, same-module, similar, provides, depends-on relationships from LanceDB metadata.

**Acceptance criteria:**
- Hybrid search returns fused results with normalized 0–1 scores
- RRF correctly handles results appearing in one or both lists
- KeywordSearch returns results without requiring embedding model
- RelationResolver resolves all 6 relation types
- Filters (kind, package) correctly narrow results

---

### T14: MCP Server + Tools

| Field | Value |
|-------|-------|
| **Phase** | P4c |
| **Blocked by** | T13 |
| **Blocks** | T15 |
| **Estimated effort** | 2 hours |
| **Input docs** | `mcp-api-design.md` (all 4 tools) |
| **Output files** | `tooling/codebase-search/src/mcp/Server.ts`, `tooling/codebase-search/src/mcp/SearchCodebaseTool.ts`, `tooling/codebase-search/src/mcp/FindRelatedTool.ts`, `tooling/codebase-search/src/mcp/BrowseSymbolsTool.ts`, `tooling/codebase-search/src/mcp/ReindexTool.ts`, `tooling/codebase-search/src/bin.ts`, `tooling/codebase-search/test/mcp/*.test.ts` |

**Description:** Implement MCP server using `@modelcontextprotocol/sdk` with stdio transport. Register 4 tools with input/output schemas matching mcp-api-design.md. Each tool handler calls into the appropriate search/indexer module. Implement consistent error format with codes: INDEX_NOT_FOUND, SYMBOL_NOT_FOUND, INDEX_STALE, EMBEDDING_MODEL_ERROR, SEARCH_TIMEOUT. Implement output formatters matching the compact result format (∼150 tokens per result). Create `bin.ts` entry point.

**Acceptance criteria:**
- MCP server starts on stdio and responds to `tools/list`
- All 4 tools registered with correct input schemas
- search_codebase returns compact formatted results (≤300 tokens per result)
- browse_symbols works at all 3 levels (packages, modules, symbols)
- Error responses include code, message, and suggestion
- bin.ts runs as `node dist/bin.js`

---

### T15: Output Formatting + Token Budget Compliance

| Field | Value |
|-------|-------|
| **Phase** | P4c |
| **Blocked by** | T14 |
| **Blocks** | T16 |
| **Estimated effort** | 1 hour |
| **Input docs** | `mcp-api-design.md` (token budgets, output formatting), `hook-integration-design.md` (context injection format) |
| **Output files** | Updates to T14 output files |

**Description:** Verify and tune output formatters for all MCP tools and hooks to meet token budgets. search_codebase: ∼800–1300 tokens for 5 results. find_related: ∼430–630 tokens for 5 results. browse_symbols: ∼200–1000 tokens. Hook injection: ∼300–800 tokens. Ensure consistent formatting between MCP tool output and hook injection (same result format, different wrapping). Truncate signatures at 200 chars in MCP tools, 120 chars in hooks.

**Acceptance criteria:**
- Default search (5 results) fits within 1500 tokens
- Hook injection fits within 800 tokens
- Signatures truncated at appropriate lengths
- Formatting is consistent between tools and hooks

---

### T16: Integration Configuration

| Field | Value |
|-------|-------|
| **Phase** | P4c |
| **Blocked by** | T15 |
| **Blocks** | None |
| **Estimated effort** | 30 minutes |
| **Input docs** | `package-scaffolding.md` (MCP config, hook config) |
| **Output files** | `.mcp.json` (updated), `.claude/settings.json` (updated) |

**Description:** Add `codebase-search` MCP server to `.mcp.json`. Add SessionStart and UserPromptSubmit hooks to `.claude/settings.json`. Verify no conflict with existing Graphiti MCP server (`graphiti-memory`) or existing hooks. Add `.code-index/` to `.gitignore`.

**Acceptance criteria:**
- MCP server name `codebase-search` does not conflict with `graphiti-memory`
- Hook events (SessionStart, UserPromptSubmit) do not conflict with existing Stop hook
- `.gitignore` includes `.code-index/`

---

### T17: SessionStart Hook

| Field | Value |
|-------|-------|
| **Phase** | P4c |
| **Blocked by** | T11 |
| **Blocks** | T18 |
| **Estimated effort** | 1 hour |
| **Input docs** | `hook-integration-design.md` (SessionStart section) |
| **Output files** | `tooling/codebase-search/src/hooks/SessionStart.ts`, `tooling/codebase-search/src/hooks/session-start-entry.ts`, `tooling/codebase-search/test/hooks/SessionStart.test.ts` |

**Description:** Implement SessionStart hook: read index metadata, compute per-package/per-kind stats, check staleness (>1 hour warning), format compact overview (∼200–400 tokens). Entry point reads JSON from stdin, outputs formatted markdown to stdout. Graceful degradation: if no index exists, output "run reindex" suggestion. Never throw — return empty string on error.

**Acceptance criteria:**
- Outputs project overview when index exists
- Outputs "run reindex" message when no index exists
- Outputs staleness warning when index > 1 hour old
- Completes within 5000ms timeout
- Never throws (returns empty string on error)

---

### T18: UserPromptSubmit Hook

| Field | Value |
|-------|-------|
| **Phase** | P4c |
| **Blocked by** | T17 |
| **Blocks** | None |
| **Estimated effort** | 1.5 hours |
| **Input docs** | `hook-integration-design.md` (UserPromptSubmit section) |
| **Output files** | `tooling/codebase-search/src/hooks/PromptSubmit.ts`, `tooling/codebase-search/src/hooks/prompt-submit-entry.ts`, `tooling/codebase-search/test/hooks/PromptSubmit.test.ts` |

**Description:** Implement UserPromptSubmit hook: read prompt from stdin, apply `shouldSkipSearch()` (skip short/meta/git/build messages), apply `constructSearchQuery()` (strip prefixes, truncate), execute BM25-only keyword search, filter by minScore 0.35, format as `<system-reminder>` block (∼300–800 tokens). Entry point reads JSON from stdin, outputs formatted context injection to stdout. Never throw.

**Acceptance criteria:**
- Skips prompts shorter than 15 chars
- Skips slash commands (/commit, /help)
- Skips git operations (commit, push, merge)
- Strips "please create a" style prefixes
- Returns BM25 results wrapped in `<system-reminder>` tags
- Returns empty string when no relevant results (score < 0.35)
- Completes within 5000ms timeout
- Never throws

---

## Summary Table

| Task | Phase | Effort | Blocked By | Description |
|------|-------|--------|------------|-------------|
| T1 | P4a | 1h | — | ESLint JSDoc configuration |
| T2 | P4a | 0.5h | T1 | Docgen config update |
| T3 | P4a | 2h | T1, T2 | Backfill existing code JSDoc |
| T4 | P4a | 0.5h | T3 | Lefthook pre-commit |
| T5 | P4b | 1h | — | Package scaffold |
| T6 | P4b | 1.5h | T5 | IndexedSymbol schema + builders |
| T7 | P4b | 2h | T6 | JSDoc extractor |
| T8 | P4b | 2h | T6 | Effect pattern detector + schema annotation extractor |
| T9 | P4b | 1.5h | T7, T8 | Symbol assembler + file scanner |
| T10 | P4b | 1.5h | T9 | Embedding service |
| T11 | P4b | 2h | T10 | LanceDB + BM25 storage |
| T12 | P4b | 1.5h | T11 | Pipeline orchestrator |
| T13 | P4c | 1.5h | T11 | Hybrid search + relation resolver |
| T14 | P4c | 2h | T13 | MCP server + tools |
| T15 | P4c | 1h | T14 | Output formatting + token budget |
| T16 | P4c | 0.5h | T15 | Integration configuration |
| T17 | P4c | 1h | T11 | SessionStart hook |
| T18 | P4c | 1.5h | T17 | UserPromptSubmit hook |

**Totals:**
- P4a: 4 tasks, 4 hours
- P4b: 8 tasks, 13.5 hours
- P4c: 6 tasks, 7.5 hours
- **Grand total: 18 tasks, 25 hours**

---

## Parallelism Opportunities

Within each phase, some tasks can run in parallel:

- **P4a:** T1 is independent. T2 depends on T1. T3 depends on T1+T2. T4 depends on T3. (Mostly serial.)
- **P4b:** T5 is independent. T7 and T8 can run in parallel after T6. T10 waits on T9. (T7 ∥ T8 saves 2h.)
- **P4c:** T13 and T17 can run in parallel after T11. T14 waits on T13. T18 waits on T17. (T13 ∥ T17 saves 1h.)
- **Cross-phase:** P4a and P4b-T5 can start in parallel since T5 has no dependency on T1–T4. However, T3 (backfill JSDoc) improves extractor test quality so P4a completion before P4b-T7 is recommended.

**Critical path:** T5 → T6 → T7/T8 → T9 → T10 → T11 → T13 → T14 → T15 → T16 = 16.5 hours
