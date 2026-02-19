# @beep/codebase-search Agent Guide

## Purpose & Fit
- Semantic codebase search with vector embeddings, BM25 keyword search, and MCP server integration for Effect v4 monorepos.
- Provides AI assistants with contextual code intelligence via Claude Code hooks and MCP tools.

## Surface Map
| Module | Key exports | Notes |
| --- | --- | --- |
| `src/index.ts` | `VERSION`, error classes, `IndexedSymbol` schema + builders | Package entry point |
| `src/errors.ts` | `IndexNotFoundError`, `SymbolNotFoundError`, `EmbeddingModelError`, `SearchTimeoutError`, `IndexingError` | Tagged error types |
| `src/IndexedSymbol.ts` | `IndexedSymbol`, `IndexMeta`, `generateId`, `classifySymbol`, `buildEmbeddingText`, `buildKeywordText` | Core data schema and utilities |
| `src/extractor/FileScanner.ts` | `FileScanner`, `FileScannerLive` | TypeScript AST file scanning service |
| `src/extractor/JsDocExtractor.ts` | `JsDocExtractor`, `JsDocExtractorLive` | JSDoc comment parser |
| `src/extractor/EffectPatternDetector.ts` | `EffectPatternDetector`, `EffectPatternDetectorLive` | Effect pattern classification |
| `src/extractor/SymbolAssembler.ts` | `SymbolAssembler`, `SymbolAssemblerLive` | Combines extractors into IndexedSymbol |
| `src/indexer/EmbeddingService.ts` | `EmbeddingService`, `EmbeddingServiceLive`, `EmbeddingServiceMock` | Hugging Face transformer embeddings |
| `src/indexer/LanceDbWriter.ts` | `LanceDbWriter`, `LanceDbWriterLive` | LanceDB vector storage |
| `src/indexer/Bm25Writer.ts` | `Bm25Writer`, `Bm25WriterLive` | BM25 keyword index (wink-bm25) |
| `src/indexer/Pipeline.ts` | `Pipeline`, `PipelineLive` | Full indexing orchestrator |
| `src/search/HybridSearch.ts` | `HybridSearch`, `HybridSearchLive` | Vector + keyword fusion search |
| `src/search/KeywordSearch.ts` | `KeywordSearch`, `KeywordSearchLive` | BM25-only search |
| `src/search/RelationResolver.ts` | `RelationResolver`, `RelationResolverLive` | Find related symbols |
| `src/mcp/McpServer.ts` | `McpLayer` | MCP server with tool definitions |
| `src/mcp/formatters.ts` | `formatSearchResults`, `formatRelatedResults`, `truncateSignature` | Output formatters |
| `src/hooks/SessionStart.ts` | `UserSessionStart` | Claude Code session start hook |
| `src/hooks/PromptSubmit.ts` | `UserPromptSubmit` | Claude Code prompt submit hook |

## Authoring Guardrails
- **Effect-first imports**: ALWAYS use namespace imports (`import * as Effect from "effect/Effect"`). NEVER use native Array/String helpers.
- **Tagged errors**: Use `S.TaggedErrorClass` for all error types.
- **Schema-based JSON**: Use `Schema.decodeUnknownEffect`/`Schema.encodeUnknownEffect` instead of `JSON.parse`/`JSON.stringify`.
- **Effect.fn**: Use `Effect.fn` for all functions returning Effects.
- **No type assertions**: NEVER use `as X` (except `as const`). Fix types properly.
- **Effect collections**: Use `effect/Array`, `effect/Option`, `MutableHashMap` instead of native equivalents.

## Quick Recipes
```ts
// Run the MCP server
import { BunRuntime } from "@effect/platform-bun/BunRuntime"
import { McpLayer } from "@beep/codebase-search/mcp"
BunRuntime.runMain(Layer.launch(McpLayer))

// Use Pipeline for indexing
import { Pipeline } from "@beep/codebase-search/indexer"
const stats = yield* Pipeline.use((p) => p.reindex({ rootDir, mode: "full" }))

// Run hybrid search
import { HybridSearch } from "@beep/codebase-search/search"
const results = yield* HybridSearch.use((hs) => hs.search({ query: "...", limit: 10 }))
```

## Verifications
- `bunx turbo run test --filter=@beep/codebase-search`
- `bunx turbo run lint --filter=@beep/codebase-search`
- `bunx turbo run check --filter=@beep/codebase-search`

## Contributor Checklist
- [ ] All new exports have `/** @since 0.0.0 */` JSDoc annotations
- [ ] Tests added/updated for new functionality
- [ ] `bun run check` passes
- [ ] `npx vitest run` passes
- [ ] `bun run lint` passes
